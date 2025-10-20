# Pediafor Assessment Platform — Troubleshooting Guide

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Service Health Checks](#service-health-checks)
3. [Event System Issues](#event-system-issues)
4. [Database Issues](#database-issues)
5. [Authentication Problems](#authentication-problems)

---

## Quick Diagnostics

### **System Health Check**
Run this command to quickly assess platform health:

```bash
# Check all services, databases, and event broker
docker-compose ps
```

### **Service Logs**
```bash
docker-compose logs --tail=50 <service-name>
```

---

## Service Health Checks

### **Gateway Service (Port 3000)**

- **Symptoms**: Cannot access platform APIs, 502/503 errors.
- **Diagnostics**:
  ```bash
  docker-compose logs gateway-service --tail=100
  curl -v http://localhost:3000/health
  ```
- **Solutions**:
  ```bash
  docker-compose restart gateway-service
  ```

### **User Service (Port 4000)**

- **Symptoms**: Authentication failures, unable to create/login users.
- **Diagnostics**:
  ```bash
  curl http://localhost:4000/health
  ```
- **Solutions**:
  ```bash
  docker-compose restart user-service
  ```

### **Assessment Service (Port 4001)**

- **Symptoms**: Cannot create/retrieve assessments.
- **Diagnostics**:
  ```bash
  curl http://localhost:4001/health
  ```
- **Solutions**:
  ```bash
  docker-compose restart assessment-service
  ```

### **Submission Service (Port 4002)**

- **Symptoms**: Cannot create submissions, file upload failures.
- **Diagnostics**:
  ```bash
  curl http://localhost:4002/health
  ```
- **Solutions**:
  ```bash
  docker-compose restart submission-service
  ```

### **Grading Service (Port 4003)**

- **Symptoms**: Automated grading not working.
- **Diagnostics**:
  ```bash
  curl http://localhost:4003/health
  ```
- **Solutions**:
  ```bash
  docker-compose restart grading-service
  ```

---

## Event System Issues

### **RabbitMQ Connection Problems**

- **Symptoms**: Services starting but events not processing.
- **Diagnostics**:
  ```bash
  docker-compose ps rabbitmq
  curl -u admin:pediafor2024 http://localhost:15672/api/overview
  docker-compose logs rabbitmq --tail=100
  ```
- **Solutions**:
  ```bash
  docker-compose restart rabbitmq
  ```

---

## Database Issues

### **PostgreSQL Connection Problems**

- **Symptoms**: "ECONNREFUSED" errors, "password authentication failed".
- **Diagnostics**:
  ```bash
  docker-compose ps | grep postgres
  docker-compose logs <database-container-name> --tail=50
  ```
- **Solutions**:
  ```bash
  docker-compose restart <database-container-name>
  ```

### **Prisma Migration Issues**

- **Symptoms**: "Migration failed" errors, schema drift warnings.
- **Diagnostics**:
  ```bash
  cd services/<service-name>
  npx prisma migrate status
  ```
- **Solutions**:
  ```bash
  cd services/<service-name>
  npx prisma migrate dev
  ```

---

## Authentication Problems

### **PASETO Token Issues**

- **Symptoms**: "Invalid token" errors, authentication failing.
- **Diagnostics**: Check the `PASETO_PUBLIC_KEY` and `PASETO_PRIVATE_KEY` environment variables in your `.env` files.
- **Solutions**: Ensure the keys are correctly set and are a matching pair.

---

---

Docs Version: 1.3 • Last Updated: October 20, 2025
