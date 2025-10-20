# Notification Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-4005-blue)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)
[![Events](https://img.shields.io/badge/events-RabbitMQ-FF6600?logo=rabbitmq)](.)

## Overview

The Notification Service delivers student-facing notifications and email alerts. It persists notifications, exposes REST APIs for clients, and reacts to grading events.

## Features

- Event-driven creation on `grading.completed` with student fan-out
- REST API for listing and marking notifications as read (bulk + single)
- Realtime-friendly: service publishes `notification.created` for downstream realtime fanout
- SQLite/Prisma-backed persistence (dev) with easy migration to Postgres

## API Endpoints (via Gateway aliases)

- `GET /notifications?scope=me&limit=50&after=<cursor>` — list notifications for the current user
- `POST /notifications/:id/read` — mark a notification as read
- `POST /notifications/read` — bulk mark as read `{ ids: string[] }`
- `GET /health` — liveness check

## Events

- Consumes: `grading.completed` (exchange: `grading.events`, topic)
- Publishes: `notification.created` (exchange: `notification.events`)

## Environment Variables

- `PORT` (default: 4005)
- `AMQP_URL` (e.g., amqp://rabbitmq:5672)
- `USER_SERVICE_URL` (e.g., http://user-service:4000)
- `FRONTEND_URL` (e.g., http://localhost:3000)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` (SMTP)

## Development

```bash
cd services/notification-service
npm install
cp .env.example .env
# Configure AMQP_URL, USER_SERVICE_URL, FRONTEND_URL, SMTP creds
npm run dev
```

## Smoke test (via Gateway aliases)

```bash
# Health (direct service when port exposed)
curl -s http://localhost:4005/health

# List my notifications (requires token)
curl -s "http://localhost:3000/notifications?scope=me&limit=10" -H "Authorization: Bearer $TOKEN"

# Mark one as read
curl -s -X POST http://localhost:3000/notifications/NOTIF_ID/read -H "Authorization: Bearer $TOKEN"
```

## Contributing

What makes it special:
- Event-driven persistence from grading events with student fan-out.
- REST + event publishing for realtime fanout.
- SQLite dev store for portability (easy to switch to Postgres).

Starter issues/ideas:
- Add per-channel preferences and digest scheduling.
- Add templates and localization for emails.
- Add pagination cursors and unread counts.

---

Docs Version: 1.3 • Last Updated: October 20, 2025
