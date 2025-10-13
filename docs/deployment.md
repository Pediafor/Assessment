# Pediafor Assessment Platform - Deployment Guide

[![Deployment Status](https://img.shields.io/badge/Deployment-All%20Services%20Production%20Ready-success)](.)
[![Container Runtime](https://img.shields.io/badge/Runtime-Docker-blue?logo=docker)](.)
[![Orchestration](https://img.shields.io/badge/Orchestration-Docker%20Compose-blue)](.)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-Event%20Driven%20Microservices-orange)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20per%20Service-336791?logo=postgresql)](.)
[![Events](https://img.shields.io/badge/Events-RabbitMQ%20Powered-orange?logo=rabbitmq)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Last Updated](https://img.shields.io/badge/Updated-October%202025-blue)](.)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Deployment](#quick-start-deployment)
3. [Local Development Setup](#local-development-setup)
4. [Frontend Application Deployment](#frontend-application-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [RabbitMQ Configuration](#rabbitmq-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Software Dependencies

- **Docker**: 24.0+ with Docker Compose v2
- **Node.js**: 20.x LTS (for development)

---

## Quick Start Deployment

### 🚀 **One-Command Production Deployment**

```bash
# Clone repository
git clone https://github.com/pediafor/assessment.git
cd assessment

# Start complete platform
docker-compose up --build

# Access the platform:
# - API Gateway: http://localhost:3000
# - RabbitMQ Management: http://localhost:15672 (admin/pediafor2024)
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/pediafor/assessment.git
cd assessment
```

### 2. Environment Configuration
```bash
# Copy environment templates for all services
cp .env.example .env
cp services/user-service/.env.example services/user-service/.env
cp services/gateway-service/.env.example services/gateway-service/.env
cp services/assessment-service/.env.example services/assessment-service/.env
cp services/submission-service/.env.example services/submission-service/.env
cp services/grading-service/.env.example services/grading-service/.env
cp frontend/.env.example frontend/.env
```

### 3. Start Development Environment
```bash
# Start all backend services
docker-compose up -d

# Start frontend development server
cd frontend && npm run dev
```

### Development URLs
- **Gateway Service**: http://localhost:3000
- **Frontend Application**: http://localhost:3001
- **User Service**: http://localhost:4000 (internal)
- **Assessment Service**: http://localhost:4001 (internal)
- **Submission Service**: http://localhost:4002 (internal)
- **Grading Service**: http://localhost:4003 (internal)
- **Realtime Service**: http://localhost:8080 (internal)

---

## Frontend Application Deployment

The frontend is a Next.js application that communicates with the Gateway Service.

### Development Commands
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Docker Deployment

The `docker-compose.yml` file in the root of the project is used to orchestrate all services.

```yaml
version: '3.8'

networks:
  pediafor-network:
    driver: bridge

services:
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - pediafor-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - pediafor-network

  user-db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    networks:
      - pediafor-network

  assessment-db:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    networks:
      - pediafor-network

  submission-db:
    image: postgres:15-alpine
    ports:
      - "5434:5432"
    networks:
      - pediafor-network

  grading-db:
    image: postgres:15-alpine
    ports:
      - "5435:5432"
    networks:
      - pediafor-network

  user-service:
    build:
      context: ./services/user-service
    ports:
      - "4000:4000"
    networks:
      - pediafor-network

  gateway-service:
    build:
      context: ./services/gateway-service
    ports:
      - "3000:3000"
    networks:
      - pediafor-network

  realtime-service:
    build:
      context: ./services/gateway-service
    ports:
      - "8080:8080"
      - "8081:8081"
    networks:
      - pediafor-network

  assessment-service:
    build:
      context: ./services/assessment-service
    ports:
      - "4001:4001"
    networks:
      - pediafor-network

  submission-service:
    build:
      context: ./services/submission-service
    ports:
      - "4002:4002"
    networks:
      - pediafor-network

  grading-service:
    build:
      context: ./services/grading-service
    ports:
      - "4003:4003"
    networks:
      - pediafor-network
```

---

*Deployment Guide Version**: 1.2 | **Last Updated**: October 13, 2025*
