# Pediafor Assessment Platform - Development Guide

[![Development Status](https://img.shields.io/badge/Development-Production%20Ready-brightgreen)](.)
[![Test Coverage](https://img.shields.io/badge/Tests-High%20Test%20Coverage-success)](.)
[![Code Quality](https://img.shields.io/badge/Quality-TypeScript-blue)](.)
[![Architecture](https://img.shields.io/badge/Architecture-Event%20Driven%20Microservices-orange)](.)
[![Event Broker](https://img.shields.io/badge/Events-RabbitMQ-FF6600?logo=rabbitmq)](.)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20per%20Service-336791?logo=postgresql)](.)
[![Testing](https://img.shields.io/badge/Testing-Jest%20%2B%20Supertest-red?logo=jest)](.)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](.)

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Event-Driven Development](#event-driven-development)
5. [Development Workflow](#development-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [Database Development](#database-development)
8. [API Development](#api-development)
9. [Contributing Guidelines](#contributing-guidelines)

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x LTS
- **Docker**: 24.0+ with Docker Compose v2
- **Git**: Latest version

### Quick Setup

1.  **Clone Repository**
    ```bash
    git clone https://github.com/pediafor/assessment.git
    cd assessment
    ```

2.  **Environment Configuration**
    Copy the `.env.example` file in each service to `.env` and fill in the required values.

3.  **Start Development Environment**
    ```bash
    docker-compose up -d
    ```

4.  **Install Dependencies and Run Services**
    For each service you want to run locally (e.g., `user-service`):
    ```bash
    cd services/user-service
    npm install
    npm run dev
    ```

---

## Development Environment

The development environment is managed using Docker and Docker Compose. The `docker-compose.yml` file at the root of the project defines all the services and their dependencies.

To start the entire stack, run:
```bash
docker-compose up -d
```

This will start all the services, databases, RabbitMQ, and Redis.

---

## Project Structure

```
pediafor-assessment/
├── docs/                          # Documentation
├── frontend/
├── infra/
│   ├── ci-cd/
│   ├── k8s/
│   └── observability/
├── scripts/
├── services/
│   ├── gateway-service/
│   ├── user-service/
│   ├── assessment-service/
│   ├── submission-service/
│   └── grading-service/
├── docker-compose.yml
└── README.md
```

---

## Event-Driven Development

The platform uses RabbitMQ for event-driven communication between microservices.

When developing a new feature that involves events:
1.  **Define the event**: Add the event to the `events` directory in the service that publishes it.
2.  **Publish the event**: Use the event publisher to send the event to RabbitMQ.
3.  **Consume the event**: In the consuming service, add a handler for the event.

---

## Development Workflow

1.  **Create a feature branch**:
    ```bash
    git checkout -b feature/my-new-feature
    ```

2.  **Develop the feature**: Make your code changes in the respective service directory.

3.  **Run tests**: Run the tests for the service you are working on.
    ```bash
    cd services/<service-name>
    npm test
    ```

4.  **Commit and push**:
    ```bash
    git commit -m "feat: add my new feature"
    git push origin feature/my-new-feature
    ```

5.  **Create a pull request**.

---

## Testing Guidelines

Each service has its own test suite. Tests are written with Jest and Supertest.

To run the tests for a specific service:
```bash
cd services/<service-name>
npm test
```

---

## Database Development

Database schemas are managed with Prisma. The schema for each service is located in `services/<service-name>/prisma/schema.prisma`.

When you make changes to the schema, you need to create a new migration:
```bash
cd services/<service-name>
npx prisma migrate dev --name <migration-name>
```

---

## API Development

APIs are developed using Express.js. The routes for each service are located in `services/<service-name>/src/routes`.

When adding a new endpoint, make sure to:
1.  Add the route to the appropriate route file.
2.  Add a controller function to handle the request.
3.  Add a service function to handle the business logic.
4.  Add input validation using `express-validator`.

---

## Contributing Guidelines

Please refer to `CONTRIBUTING.md` for contributing guidelines.

---

*Development Guide Version**: 1.1 | **Last Updated**: October 13, 2025*
