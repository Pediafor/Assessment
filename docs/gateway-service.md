# Gateway Service - API Gateway & Authentication Hub

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Security](https://img.shields.io/badge/Security-PASETO%20V4%20Authentication-green)](.)
[![Port](https://img.shields.io/badge/Port-3000-blue)](.)
[![Role](https://img.shields.io/badge/Role-Central%20API%20Gateway-orange)](.)
[![Event Integration](https://img.shields.io/badge/Events-RabbitMQ%20Ready-FF6600?logo=rabbitmq)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)
[![Express](https://img.shields.io/badge/Express.js-4.x-green?logo=express)](.)

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Service Routing](#service-routing)
5. [Real-time Service](#real-time-service)
6. [Security Features](#security-features)
7. [API Documentation](#api-documentation)

---

## Overview

The Gateway Service serves as the **single entry point** for all client applications accessing the Pediafor Assessment Platform. It implements a comprehensive API Gateway pattern with advanced authentication, routing, and security features.

### **Core Responsibilities**

- 🔐 **Authentication Gateway**: PASETO V4 token validation and user context management
- 🔄 **Service Discovery**: Intelligent routing to backend microservices
- 🛡️ **Security Layer**: Rate limiting, CORS, input validation, and threat protection
- 📊 **Health Monitoring**: Aggregated health checks across all services

---

## Architecture

The gateway sits between the client applications and the backend microservices, providing a unified interface to the platform.

---

## Authentication System

The Gateway Service uses **PASETO V4** for token-based authentication. It verifies the token from the `Authorization` header and, if valid, injects user information into the request headers for downstream services.

### **User Context Headers**
```http
X-User-ID: 123e4567-e89b-12d3-a456-426614174000
X-User-Role: TEACHER
X-User-Email: teacher@example.com
```

---

## Service Routing

The Gateway Service routes requests to the appropriate backend microservice based on the URL path.

- `/api/auth/*` → **User Service**
- `/api/users/*` → **User Service**
- `/api/assessments/*` → **Assessment Service**
- `/api/submissions/*` → **Submission Service**
- `/api/grading/*` → **Grading Service**

---

## Real-time Service

The gateway also includes a real-time service that runs on a separate port (defaulting to 8080) and provides WebSocket and WebTransport capabilities. This service is used for pushing real-time updates to clients.

---

## Security Features

- **Helmet**: For setting various HTTP headers to secure the app.
- **CORS**: To control cross-origin requests.
- **Rate Limiting**: To prevent abuse.

---

## API Documentation

### Gateway Endpoints

- `GET /`: Returns information about the gateway service.
- `GET /health`: Provides a health check of the gateway service.

### Proxied Routes

The gateway proxies requests to the following services:

- **User Service**: Handles all requests to `/api/auth` and `/api/users`.
- **Assessment Service**: Handles all requests to `/api/assessments`.
- **Submission Service**: Handles all requests to `/api/submissions`.
- **Grading Service**: Handles all requests to `/api/grading`.

---

*Documentation last updated: October 13, 2025*
