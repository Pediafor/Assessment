import dotenv from 'dotenv';
import amqplib from 'amqplib';
import { z } from 'zod';
import { getUserById } from '../services/user.service';
import { sendEmail } from '../services/email.service';
import { counters } from '../metrics';
import prisma from '../prismaClient';

dotenv.config();

const GradingCompletedEventSchema = z.object({
  type: z.literal('grading.completed').optional(),
  submissionId: z.string().min(1),
  assessmentId: z.string().min(1),
  studentId: z.string().min(1),
  calculatedMarks: z.number(),
  totalMarks: z.number(),
  percentage: z.number(),
});
type GradingCompletedEvent = z.infer<typeof GradingCompletedEventSchema>;

export async function consumeGradingCompletedEvent() {
  try {
    const amqpUrl = process.env.AMQP_URL || process.env.RABBITMQ_URL || 'amqp://localhost';
  const connection = await amqplib.connect(amqpUrl);
  const channel = await connection.createChannel();

    // Ensure fair dispatch and durability
    await channel.prefetch(1);

    // Align with platform-wide exchange naming
    const exchange = 'grading.events';
  const routingKey = 'grading.completed';
  const notifExchange = 'notification.events';

    // Dead-letter setup for reliability
    const dlx = 'grading.events.dlx';
    const dlq = 'grading.completed.notification.dlq';
    const queue = 'grading.completed.notification';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertExchange(notifExchange, 'topic', { durable: true });
    await channel.assertExchange(dlx, 'topic', { durable: true });
    await channel.assertQueue(dlq, { durable: true });
    // Main queue with DLX and limited requeue by message header attempts
    await channel.assertQueue(queue, {
      durable: true,
      deadLetterExchange: dlx,
      deadLetterRoutingKey: routingKey,
      arguments: {
        // optional message TTL for reprocessing window; leave unset by default
        // 'x-message-ttl': 60000,
        // limit queue length defensively (optional)
        // 'x-max-length': 10000,
      } as any,
    } as any);
    await channel.bindQueue(queue, exchange, routingKey);
    await channel.bindQueue(dlq, dlx, routingKey);

    console.log(`📥 Notification Service consuming from exchange="${exchange}" rk="${routingKey}" queue="${queue}"`);

    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const raw = msg.content.toString();
          let parsed: unknown;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            counters.eventParseErrors.inc();
            throw new Error('Invalid JSON payload');
          }
          const result = GradingCompletedEventSchema.safeParse(parsed);
          if (!result.success) {
            counters.eventSchemaErrors.inc();
            throw new Error(`Schema validation failed: ${result.error.message}`);
          }
          const event: GradingCompletedEvent = result.data;
          console.log('🔔 Received grading.completed:', {
            submissionId: event.submissionId,
            assessmentId: event.assessmentId,
            studentId: event.studentId,
          });

          const user = await getUserById(event.studentId);

          // Build results link safely
          const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');
          const resultLink = `${baseUrl}/student/results/${event.submissionId}`;

          if (user) {
            // Persist a notification
            const title = 'Grade Published';
            const body = `Your assessment ${event.assessmentId} has been graded. Score: ${event.calculatedMarks}/${event.totalMarks} (${event.percentage}%).`;
            const record = await prisma.notification.create({
              data: { userId: event.studentId, title, body }
            });

            // Fire-and-forget: publish notification.created event
            try {
              const payload = { id: record.id, userId: record.userId, title: record.title, createdAt: record.createdAt };
              channel.publish(notifExchange, 'notification.created', Buffer.from(JSON.stringify(payload)), { persistent: true });
            } catch (e) {
              console.warn('⚠️ Failed to publish notification.created:', e);
            }

            await sendEmail({
              to: user.email,
              subject: `Your assessment has been graded`,
              text: `Hi ${user.firstName || 'Student'},\n\nYour submission for assessment ${event.assessmentId} has been graded.\n\nYou scored ${event.calculatedMarks} out of ${event.totalMarks} (${event.percentage}%).\n\nView your detailed results: ${resultLink}`,
              html: `<p>Hi ${user.firstName || 'Student'},</p><p>Your submission for assessment <strong>${event.assessmentId}</strong> has been graded.</p><p>You scored <strong>${event.calculatedMarks}</strong> out of <strong>${event.totalMarks}</strong> (${event.percentage}%).</p><p>View your detailed results: <a href="${resultLink}">${resultLink}</a></p>`,
            });
            counters.emailsSent.inc();
          } else {
            console.warn(`⚠️ User not found for id=${event.studentId}. Skipping email.`);
            counters.userNotFound.inc();
          }

          channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing grading.completed:', error);
          counters.processingErrors.inc();

          // Basic retry with header attempt tracking, then route to DLQ
          try {
            const headers = (msg.properties && (msg.properties as any).headers) || {};
            const attempts = Number(headers['x-attempts'] || 0) + 1;
            const maxAttempts = Number(process.env.NOTIFICATION_MAX_RETRIES || 3);

            if (attempts <= maxAttempts) {
              counters.retries.inc();
              // re-publish with incremented attempt header and small delay (optional)
              await channel.publish(exchange, routingKey, msg.content, {
                headers: { ...headers, 'x-attempts': attempts },
                persistent: true,
              });
              channel.ack(msg);
            } else {
              counters.dlq.inc();
              // route to DLQ by rejecting (dead-letter by DLX)
              channel.reject(msg, false);
            }
          } catch (republishErr) {
            console.error('❌ Retry/Dead-letter handling failed:', republishErr);
            // As a last resort, drop without requeue to avoid poison loop
            channel.nack(msg, false, false);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}
