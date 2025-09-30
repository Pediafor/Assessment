# Microservices Setup - Pediafor Assessment Platform

This platform follows a **pure microservices architecture** where each service is completely independent with its own database and Docker configuration.

## 🏗️ Architecture Overview

- **user-service**: User management and authentication (Port 4000, DB Port 5432)
- **gateway-service**: API Gateway with authentication middleware (Port 3000, Redis Port 6379)
- **assessment-service**: Assessment management (Port 4001, DB Port 5433)
- **submission-service**: Submission handling (Port 4002, DB Port 5434)
- **grading-service**: Automated grading (Port 4003, DB Port 5435)

## 🚀 Starting Services

Each service is started independently using its own docker-compose.yml file:

### Start User Service
```bash
cd services/user-service
docker-compose up -d
```

### Start Gateway Service
```bash
cd services/gateway-service
docker-compose up -d
```

### Start Assessment Service (when implemented)
```bash
cd services/assessment-service
docker-compose up -d
```

### Start Submission Service (when implemented)
```bash
cd services/submission-service
docker-compose up -d
```

### Start Grading Service (when implemented)
```bash
cd services/grading-service
docker-compose up -d
```

## 🔍 Service Status

Check running services:
```bash
# In each service directory
docker-compose ps

# Or check all running containers
docker ps
```

## 🌐 Service Endpoints

- **Gateway Service**: http://localhost:3000
  - Health: http://localhost:3000/health
  - API routes: http://localhost:3000/api/*

- **User Service**: http://localhost:4000
  - Health: http://localhost:4000/health
  - Direct access (for development only)

## 🛑 Stopping Services

Stop individual services:
```bash
cd services/{service-name}
docker-compose down
```

Stop all services:
```bash
# Stop all containers
docker stop $(docker ps -q)

# Or remove all containers and networks
docker-compose down --remove-orphans
```

## 🔐 Authentication Flow

1. **Registration/Login**: Use gateway endpoints `/api/users/register` or `/api/users/login`
2. **Token Generation**: User service issues PASETO tokens
3. **Gateway Validation**: Gateway validates tokens and injects user context headers
4. **Service Communication**: Services trust gateway-signed headers

## 📝 Database Per Service

Each service maintains its own PostgreSQL database:
- **user-service**: postgres:5432
- **assessment-service**: postgres:5433
- **submission-service**: postgres:5434
- **grading-service**: postgres:5435

## 🔧 Development

For development, start services individually as needed. The gateway service proxies requests to other services using `host.docker.internal` for cross-container communication.

### Environment Variables

Each service has its own `.env.example` file. Copy to `.env` and customize as needed:
```bash
cd services/{service-name}
cp .env.example .env
# Edit .env file
```