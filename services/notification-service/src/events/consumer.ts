import amqplib from 'amqplib';
import { getUserById } from '../services/user.service';
import { sendEmail } from '../services/email.service';

const AMQP_URL = process.env.AMQP_URL || 'amqp://localhost';

export async function consumeGradingCompletedEvent() {
  try {
    const connection = await amqplib.connect(AMQP_URL);
    const channel = await connection.createChannel();

    const exchange = 'grading';
    const queue = 'grading.completed.notification';
    const routingKey = 'grading.completed';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log(" [x] Received %s:", routingKey, event);

          const user = await getUserById(event.studentId);

          if (user) {
            await sendEmail({
              to: user.email,
              subject: `Your assessment has been graded`,
              text: `Hi ${user.firstName || 'Student'},\n\nYour submission for assessment ${event.assessmentId} has been graded.\n\nYou scored ${event.calculatedMarks} out of ${event.totalMarks} (${event.percentage}%).\n\nTo view your results, please visit the assessment page: ${process.env.FRONTEND_URL}/student/assessment/${event.assessmentId}/results`,
              html: `<p>Hi ${user.firstName || 'Student'},</p><p>Your submission for assessment ${event.assessmentId} has been graded.</p><p>You scored <strong>${event.calculatedMarks}</strong> out of <strong>${event.totalMarks}</strong> (${event.percentage}%).</p><p>To view your results, please visit the <a href="${process.env.FRONTEND_URL}/student/assessment/${event.assessmentId}/results">assessment page</a>.</p>`,
            });
          }

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false);
        }
      }
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}
