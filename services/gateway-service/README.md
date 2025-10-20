# Gateway Service — Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/status-production--ready-success)](.)
[![Port](https://img.shields.io/badge/port-3000-blue)](.)
[![Auth](https://img.shields.io/badge/auth-PASETO%20v4-green)](.)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-brightgreen?logo=nodedotjs)](.)
[![Lang](https://img.shields.io/badge/lang-TypeScript%205.x-blue?logo=typescript)](.)

## Overview

The Gateway Service is the single entry point for all client applications accessing the Pediafor Assessment Platform. It handles authentication, routing, and other cross-cutting concerns.

## Features

- **API Gateway**: Routes requests to the appropriate backend microservices.
- **Authentication**: Verifies PASETO V4 tokens for all incoming requests.
- **Security**: Provides CORS and other security headers using Helmet.
- **Real-time**: Includes a WebSocket and WebTransport server for real-time communication.

## Architecture

The gateway sits between the client applications and the backend microservices, providing a unified interface to the platform. It uses `http-proxy-middleware` to forward requests to the appropriate service based on the URL path.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Proxy**: http-proxy-middleware
- **Authentication**: paseto
- **Security**: helmet, cors
- **Testing**: Jest, Supertest

## API Routes

The Gateway Service proxies requests to the following services (canonical + aliases):

- `/api/auth/*` → User Service (public)
- `/api/users/*` and `/users/*` → User Service (protected); plus public `/users/register`
- `/api/assessments/*` and `/assessments/*` → Assessment Service (protected)
- `/api/submissions/*` and `/submissions/*` → Submission Service (protected)
- `/api/grade/*` and `/grade/*` → Grading Service (protected)
- `/api/notifications/*` and `/notifications/*` → Notification Service (protected)

## Development

To run this service locally:

```bash
cd services/gateway-service
npm install
cp .env.example .env
# Update .env with your service URLs and PASETO public key
npm run dev
```

## Smoke test

Verify the gateway is proxying and auth works (requires running stack):

```bash
# Health
curl -s http://localhost:3000/health

# Public register (example payload)
curl -s -X POST http://localhost:3000/users/register \
	-H "Content-Type: application/json" \
	-d '{"email":"test+gw@local","password":"Passw0rd!","firstName":"GW","lastName":"Test"}'

# Protected call (replace TOKEN)
curl -s http://localhost:3000/users/me -H "Authorization: Bearer TOKEN"
```

## Contributing

What makes it special:
- Unified auth enforcement (PASETO v4) and user-context headers for all services.
- Clean alias routing (non-/api) for human-friendly frontend calls.
- Dual realtime support (WebSocket/WebTransport) entry point.

Starter issues/ideas:
- Add rate limiting per route group and adaptive backoff for bursts.
- Improve error shape normalization across proxied services.
- Add OpenAPI aggregation endpoint for a combined spec.

---

Docs Version: 1.3 • Last Updated: October 20, 2025