# 🔔 Notification Service — REST + Events

Event-driven email notifications for grading results.

## Overview

- Consumes `grading.completed` events from RabbitMQ
- Fetches student details from User Service
- Sends email via SMTP using Nodemailer

## REST Endpoints (via Gateway aliases)

- `GET /notifications?scope=me&limit=50&after=<cursor>` — list my notifications
- `POST /notifications/:id/read` — mark a notification as read
- `POST /notifications/read` — bulk mark notifications as read `{ ids: string[] }`
- `GET /health` — liveness check

## Environment Variables

- `PORT` (default: 4005)
- `AMQP_URL` (e.g., amqp://rabbitmq:5672)
- `USER_SERVICE_URL` (e.g., http://user-service:4000)
- `FRONTEND_URL` (e.g., http://localhost:3000)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

## Event Binding

- Exchange: `grading.events` (type: topic)
- Routing Key: `grading.completed`
- Queue: `grading.completed.notification` (durable)

Email includes a direct link to the student's result page using `FRONTEND_URL` and submission id: `${FRONTEND_URL}/student/results/:submissionId`.

## Local Development (Docker-backed)

1. Ensure RabbitMQ and User Service are running (docker-compose up)
2. Configure `.env` using `.env.example`
3. Start service

## Operations

- Logs show consumed events and email delivery status
- NACK on processing error without requeue to avoid poison message loops

## Future Enhancements

- Push notifications and in-app messages
- Retry/DLQ strategy and templated emails

---

Docs Version: 1.3 • Last Updated: October 20, 2025
