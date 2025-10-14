# Event-Driven Architecture Documentation

## Overview

The Pediafor Assessment Platform implements a comprehensive event-driven architecture using RabbitMQ as the message broker. This enables real-time communication between microservices and automatic processing of assessment workflows.

## Architecture Components

### Message Broker
- **RabbitMQ**: Central message broker for event distribution
- **Port**: 5672 (AMQP), 15672 (Management UI)
- **Exchanges**: Topic-based routing for flexible event distribution
- **Queues**: Durable queues with dead-letter handling

### Event Publishers
- **User Service**: Publishes user lifecycle events.
- **Assessment Service**: Publishes assessment lifecycle events.
- **Submission Service**: Publishes submission lifecycle events.
- **Grading Service**: Publishes grading result events.

### Event Subscribers
- **Assessment Service**: Consumes submission, grading, and user events for analytics and statistics.
- **Grading Service**: Consumes submission events to trigger auto-grading.
- **Gateway Service**: Consumes all events to push real-time updates to clients via WebSockets.
 - **Notification Service**: Consumes `grading.completed` to send email notifications to students.

## Event Types

### User Events (Published by User Service)
- `user.registered`
- `user.profile_updated`
- `user.deactivated`
- `user.reactivated`
- `user.role_changed`

### Assessment Events (Published by Assessment Service)
- `assessment.created`
- `assessment.updated`
- `assessment.deleted`
- `assessment.published`
- `assessment.archived`
- `assessment.fully_graded`

### Submission Events (Published by Submission Service)
- `submission.submitted`
- `submission.updated`
- `submission.graded`

### Grading Events (Published by Grading Service)
- `grading.completed`
- `grading.failed`

### Notification Events (Consumed by Notification Service)
- `grading.completed` → Sends an email to the student with score summary and link to results.

---

*Documentation last updated: October 14, 2025*
