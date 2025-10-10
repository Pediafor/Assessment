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
- **Submission Service**: Publishes submission and grading events
- **Grading Service**: Publishes grading completion events  
- **User Service**: Publishes user registration events
- **Assessment Service**: Publishes assessment completion events

### Event Subscribers
- **Assessment Service**: Consumes all events for analytics and statistics

## Event Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Student       │     │   Teacher       │     │   System        │
│   Actions       │     │   Actions       │     │   Events        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ submission.     │     │ assessment.     │     │ user.           │
│ submitted       │     │ published       │     │ registered      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RabbitMQ Event Bus                         │
│                                                                 │
│  Exchanges:                                                     │
│  - submission.events (topic)                                    │
│  - grading.events (topic)                                       │
│  - user.events (topic)                                          │
│  - assessment.events (topic)                                    │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Auto Grading    │     │ Assessment      │     │ Analytics       │
│ Trigger         │     │ Statistics      │     │ Updates         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ grading.        │     │ assessment.     │     │ Organization    │
│ completed       │     │ fully_graded    │     │ Statistics      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Event Types

### Submission Events
- **submission.submitted**: When a student submits an assessment
- **submission.graded**: When a submission receives a grade

### Grading Events  
- **grading.completed**: When grading process completes for a submission

### User Events
- **user.registered**: When a new user registers in the system

### Assessment Events
- **assessment.published**: When an assessment is published for students
- **assessment.fully_graded**: When all submissions for an assessment are graded

## Event Processing

### Assessment Service Event Handlers

#### 1. Submission Submitted Handler
```typescript
// Updates assessment submission statistics
// Checks for auto-grading settings
// Logs submission activity
```

#### 2. Submission Graded Handler  
```typescript
// Updates assessment completion statistics
// Calculates assessment analytics
// Updates average scores and completion rates
```

#### 3. Grading Completed Handler
```typescript
// Marks individual submission as graded
// Checks if all submissions are complete
// Publishes assessment.fully_graded when done
```

#### 4. User Registered Handler
```typescript
// Updates organization enrollment statistics
// Tracks active user counts
// Maintains activity timestamps
```

## Production Benefits

### Real-Time Analytics
- Live assessment statistics and performance metrics
- Automatic completion rate calculations
- Real-time enrollment and activity tracking

### Scalability
- Asynchronous event processing
- Decoupled service architecture
- Horizontal scaling capabilities

### Reliability
- Message persistence and durability
- Dead letter queue handling
- Graceful error recovery

### Monitoring
- RabbitMQ management UI for event tracking
- Service health monitoring
- Event processing metrics

## Configuration

### Environment Variables
```bash
RABBITMQ_URL=amqp://admin:admin123@localhost:5672/
```

### Docker Configuration
```yaml
rabbitmq:
  image: rabbitmq:3.13-management-alpine
  ports:
    - "5672:5672"    # AMQP
    - "15672:15672"  # Management UI
  environment:
    RABBITMQ_DEFAULT_USER: admin
    RABBITMQ_DEFAULT_PASS: admin123
```

## Testing

### Unit Tests
- Event handler testing with mocked dependencies
- Event publishing validation
- Error handling scenarios

### Integration Tests
- End-to-end event flow testing
- RabbitMQ container integration
- Cross-service communication validation

### Production Validation
- Docker environment testing
- Real RabbitMQ broker validation
- Complete workflow verification

## Monitoring and Debugging

### RabbitMQ Management UI
- Access: http://localhost:15672
- Username: admin
- Password: admin123

### Key Metrics to Monitor
- Message throughput
- Queue depths
- Consumer lag
- Error rates
- Connection health

### Troubleshooting
- Check RabbitMQ connection status
- Verify exchange and queue creation
- Monitor event processing logs
- Validate message formats

## Future Enhancements

### Planned Events
- **assessment.published**: Trigger submission service enablement
- **assessment.expired**: Handle time-based assessment closure
- **submission.auto_saved**: Real-time progress tracking

### Analytics Expansion
- Advanced performance metrics
- Predictive analytics
- Custom dashboard events
- Real-time reporting triggers