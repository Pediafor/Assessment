# RabbitMQ Integration for Pediafor Assessment Platform

This directory contains the RabbitMQ infrastructure setup for async communication between microservices in the Pediafor Assessment Platform.

## 🏗️ Architecture Overview

The RabbitMQ integration enables event-driven communication between:
- **Assessment Service** - Publishes assessment lifecycle events
- **Submission Service** - Consumes assessment events, publishes submission events  
- **Grading Service** - Consumes assessment and submission events
- **Future Services** - Can easily subscribe to relevant event streams

## 📋 Components

### Message Broker
- **RabbitMQ 3.12** with Management Plugin
- **Alpine Linux** base for minimal footprint
- **Persistent volumes** for message durability
- **Health checks** for container orchestration

### Event Architecture
- **Topic Exchanges** for flexible routing
- **Durable Queues** with TTL and DLX
- **Dead Letter Exchange** for failed message handling
- **Message persistence** for reliability

## 🚀 Quick Start

### 1. Start RabbitMQ Infrastructure

```bash
# From the rabbitmq directory
cd infra/rabbitmq
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs rabbitmq
```

### 2. Access Management UI

- **URL**: http://localhost:15672
- **Username**: admin
- **Password**: pediafor2024

### 3. Verify Setup

```bash
# Check if exchanges and queues are created
curl -u admin:pediafor2024 http://localhost:15672/api/exchanges/pediafor
curl -u admin:pediafor2024 http://localhost:15672/api/queues/pediafor
```

## 📊 Event Types

### Assessment Events

| Event Type | Routing Key | Description |
|------------|-------------|-------------|
| `assessment.created` | `assessment.created` | New assessment created |
| `assessment.updated` | `assessment.updated` | Assessment modified |
| `assessment.deleted` | `assessment.deleted` | Assessment removed |
| `assessment.published` | `assessment.published` | Assessment made available |
| `assessment.archived` | `assessment.archived` | Assessment archived |

### Event Schema Example

```json
{
  "event": {
    "eventId": "uuid-v4",
    "eventType": "assessment.created",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "serviceId": "assessment-service",
    "version": "1.0.0",
    "data": {
      "assessmentId": "uuid-v4",
      "title": "Math Quiz 1",
      "description": "Basic algebra assessment",
      "type": "mcq",
      "createdBy": "teacher-uuid",
      "totalMarks": 100,
      "status": "draft"
    }
  },
  "metadata": {
    "correlationId": "uuid-v4",
    "userId": "user-uuid",
    "traceId": "trace-uuid"
  },
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Core RabbitMQ Settings
RABBITMQ_URL=amqp://assessment_service:assessment_pass@localhost:5672/pediafor
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_MANAGEMENT_PORT=15672

# Authentication
RABBITMQ_USER=admin
RABBITMQ_PASS=pediafor2024
RABBITMQ_VHOST=pediafor
```

### Service-Specific Users

| Service | Username | Permissions |
|---------|----------|-------------|
| `admin` | Full access | Configure/Write/Read: `.*` |
| `assessment_service` | Assessment events | Configure/Write/Read: `assessment\..*` |
| `submission_service` | Submission + Assessment | Write/Read: `submission\..*\|assessment\..*` |

## 🎯 Integration Guide

### Assessment Service Integration

The assessment service is already integrated with RabbitMQ:

1. **Dependencies**: `amqplib` and `@types/amqplib` added
2. **Configuration**: RabbitMQ connection in `src/config/rabbitmq.ts`
3. **Event Types**: Defined in `src/events/types.ts`
4. **Publisher**: Event publishing service in `src/events/publisher.ts`
5. **Routes**: Event publishing integrated in assessment routes
6. **Server**: RabbitMQ initialized on startup

### For Other Services

```typescript
// 1. Install dependencies
npm install amqplib @types/amqplib

// 2. Import configuration
import { getRabbitMQConnection } from './config/rabbitmq';

// 3. Initialize connection
const rabbitMQ = getRabbitMQConnection();
await rabbitMQ.connect();

// 4. Publish events
await rabbitMQ.publish('assessment.events', 'assessment.created', eventData);
```

## 🔍 Monitoring

### Health Checks

```bash
# Container health
docker-compose ps

# RabbitMQ diagnostics
docker-compose exec rabbitmq rabbitmq-diagnostics ping
docker-compose exec rabbitmq rabbitmq-diagnostics status

# Queue inspection
docker-compose exec rabbitmq rabbitmqctl list_queues name messages
```

### Management API

```bash
# Queue statistics
curl -u admin:pediafor2024 http://localhost:15672/api/queues/pediafor/assessment.created

# Exchange bindings
curl -u admin:pediafor2024 http://localhost:15672/api/exchanges/pediafor/assessment.events/bindings/source
```

## 🛠️ Development

### Testing Events

```bash
# Send test message (requires rabbitmq-management)
curl -u admin:pediafor2024 -H "content-type:application/json" \
  -X POST http://localhost:15672/api/exchanges/pediafor/assessment.events/publish \
  -d'{"properties":{},"routing_key":"assessment.created","payload":"{\"test\":\"message\"}","payload_encoding":"string"}'
```

### Local Development

```bash
# Start only RabbitMQ
docker-compose up rabbitmq

# View logs in real-time
docker-compose logs -f rabbitmq

# Stop and cleanup
docker-compose down -v
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if RabbitMQ container is running
   - Verify port 5672 is accessible
   - Check firewall settings

2. **Authentication Failed**
   - Verify credentials in .env file
   - Check user permissions in definitions.json

3. **Messages Not Routing**
   - Verify exchange and queue bindings
   - Check routing key patterns
   - Inspect dead letter queue

### Log Analysis

```bash
# RabbitMQ container logs
docker-compose logs rabbitmq

# Assessment service logs (look for RabbitMQ connection)
docker-compose -f ../assessment-service/docker-compose.yml logs assessment-service
```

## 📈 Performance

### Optimization Settings

- **Memory High Watermark**: 80% to prevent OOM
- **Disk Free Limit**: 2GB minimum free space
- **Message TTL**: 1 hour for auto-cleanup
- **Dead Letter Exchange**: Failed message handling
- **Persistent Messages**: Durability guarantee

### Scaling Considerations

- **Queue Sharding**: Use consistent hashing for high throughput
- **Consumer Groups**: Multiple consumers per queue
- **Federation**: Cross-datacenter replication
- **Clustering**: High availability setup

## 🔐 Security

### Production Checklist

- [ ] Change default passwords
- [ ] Use TLS/SSL for connections
- [ ] Restrict management UI access
- [ ] Implement proper user permissions
- [ ] Enable audit logging
- [ ] Monitor for security events

### Network Security

```yaml
# Firewall rules
- Allow: Application services → RabbitMQ (5672)
- Allow: Monitoring systems → Management UI (15672)
- Deny: Public internet → All RabbitMQ ports
```

## 🔗 Related Documentation

- [Assessment Service Events](../services/assessment-service/src/events/types.ts)
- [Event Publisher](../services/assessment-service/src/events/publisher.ts)
- [RabbitMQ Configuration](./config/rabbitmq.conf)
- [Docker Compose Setup](./docker-compose.yml)