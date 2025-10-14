# Gateway Service - Pediafor Assessment Platform

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Port](https://img.shields.io/badge/Port-3000-blue)](.)

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

The Gateway Service proxies requests to the following services:

- `/api/auth/*` → **User Service**
- `/api/users/*` → **User Service**
- `/api/assessments/*` → **Assessment Service**
- `/api/submissions/*` → **Submission Service**
- `/api/grading/*` → **Grading Service**

## Development

To run this service locally:

```bash
cd services/gateway-service
npm install
cp .env.example .env
# Update .env with your service URLs and PASETO public key
npm run dev
```

---

*Last Updated: October 13, 2025*