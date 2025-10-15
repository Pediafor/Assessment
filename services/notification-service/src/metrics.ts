import client from 'prom-client';

// Enable collection of default metrics
client.collectDefaultMetrics();

export const counters = {
  eventParseErrors: new client.Counter({ name: 'notification_event_parse_errors_total', help: 'Invalid JSON payloads' }),
  eventSchemaErrors: new client.Counter({ name: 'notification_event_schema_errors_total', help: 'Schema validation failures' }),
  emailsSent: new client.Counter({ name: 'notification_emails_sent_total', help: 'Emails successfully sent' }),
  userNotFound: new client.Counter({ name: 'notification_user_not_found_total', help: 'Events where userId not found' }),
  processingErrors: new client.Counter({ name: 'notification_processing_errors_total', help: 'Unhandled processing errors' }),
  retries: new client.Counter({ name: 'notification_retries_total', help: 'Retry attempts made' }),
  dlq: new client.Counter({ name: 'notification_dlq_total', help: 'Messages routed to DLQ' }),
};

export async function renderMetrics(): Promise<string> {
  return client.register.metrics();
}
