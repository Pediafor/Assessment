# 🔔 Notification Service — REST + Events

Event-driven email notifications for grading results.

## Overview

- Consumes `grading.completed` events from RabbitMQ
- Persists notifications in PostgreSQL via Prisma
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
- `DATABASE_URL` (e.g., postgresql://notificationservice_user:notificationservice_password@localhost:5436/notificationservice_db?schema=public)
- `FRONTEND_URL` (e.g., http://localhost:3000)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

## Event Binding

- Exchange: `grading.events` (type: topic)
- Routing Key: `grading.completed`
- Queue: `grading.completed.notification` (durable)

Email includes a direct link to the student's result page using `FRONTEND_URL` and submission id: `${FRONTEND_URL}/student/results/:submissionId`.

## Local Development (Docker-backed)

1. Ensure RabbitMQ, User Service, and Notification DB (`notification-db`) are running
2. Configure `.env` using `.env.example`
3. Run `npx prisma db push`
4. Start service

## Operations

- Logs show consumed events and email delivery status
- NACK on processing error without requeue to avoid poison message loops

## Future Enhancements

- Push notifications and in-app messages
- Retry/DLQ strategy and templated emails

---

Docs Version: 1.3 • Last Updated: October 24, 2025
