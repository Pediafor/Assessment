# Pediafor Assessment Platform - Troubleshooting Guide

> **Platform Support** | **Common Issues & Solutions** | **Debug Procedures** | **October 2025**

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Service Health Checks](#service-health-checks)
3. [Database Issues](#database-issues)
4. [Authentication Problems](#authentication-problems)
5. [Network & Connectivity](#network--connectivity)
6. [Performance Issues](#performance-issues)
7. [Testing Failures](#testing-failures)
8. [Docker & Container Issues](#docker--container-issues)
9. [Environment Setup](#environment-setup)
10. [Production Issues](#production-issues)

---

## Quick Diagnostics

### **System Health Check**
Run this command to quickly assess platform health:

```bash
# Quick health check script
curl -f http://localhost:3000/health && echo "✅ Gateway OK" || echo "❌ Gateway Down"
curl -f http://localhost:4000/health && echo "✅ User Service OK" || echo "❌ User Service Down"
curl -f http://localhost:4001/health && echo "✅ Assessment Service OK" || echo "❌ Assessment Service Down"
curl -f http://localhost:4002/health && echo "✅ Submission Service OK" || echo "❌ Submission Service Down"
```

### **Service Status Dashboard**
```bash
# Check all services and databases
docker-compose ps
docker-compose logs --tail=50
```

### **Test Status Check**
```bash
# Run quick test suite across all services
npm run test:quick

# Expected output:
# User Service: 77/77 tests passing ✅
# Assessment Service: 94/94 tests passing ✅  
# Submission Service: 66/76 tests passing ⚠️
# Overall: 237/247 (96%) ✅
```

---

## Service Health Checks

### **Gateway Service (Port 3000)**

#### **Symptoms**
- Cannot access platform APIs
- 502/503 errors from NGINX
- Login requests failing

#### **Diagnostics**
```bash
# Check gateway service logs
docker-compose logs gateway-service --tail=100

# Test gateway directly
curl -v http://localhost:3000/health

# Check gateway configuration
curl http://localhost:3000/api/status
```

#### **Common Solutions**
```bash
# Restart gateway service
docker-compose restart gateway-service

# Check environment variables
docker-compose exec gateway-service env | grep -E "(PORT|NODE_ENV|CORS)"

# Verify service discovery
docker-compose exec gateway-service ping user-service
docker-compose exec gateway-service ping assessment-service
docker-compose exec gateway-service ping submission-service
```

### **User Service (Port 4000)**

#### **Symptoms**
- Authentication failures
- Unable to create/login users
- Token validation errors

#### **Diagnostics**
```bash
# Check user service health
curl http://localhost:4000/health

# Test database connection
docker-compose exec user-service npm run db:check

# Check PASETO key configuration
docker-compose exec user-service node -e "console.log(process.env.PASETO_PUBLIC_KEY ? 'Keys configured' : 'Keys missing')"
```

#### **Common Solutions**
```bash
# Restart user service and database
docker-compose restart user-service postgres-user

# Regenerate PASETO keys
npm run generate-keys

# Reset user database
docker-compose exec user-service npm run db:reset
docker-compose exec user-service npm run db:migrate
```

### **Assessment Service (Port 4001)**

#### **Symptoms**
- Cannot create/retrieve assessments
- Assessment search failing
- Question management errors

#### **Diagnostics**
```bash
# Check assessment service
curl http://localhost:4001/health

# Test assessment database
docker-compose exec assessment-service npm run db:check

# Verify test data
docker-compose exec assessment-service npm run db:seed:check
```

#### **Common Solutions**
```bash
# Restart assessment service
docker-compose restart assessment-service postgres-assessment

# Run database migrations
docker-compose exec assessment-service npx prisma migrate deploy

# Reseed test data
docker-compose exec assessment-service npm run db:seed
```

### **Submission Service (Port 4002)**

#### **Symptoms**
- Cannot create submissions
- Autosave not working
- File upload failures

#### **Diagnostics**
```bash
# Check submission service
curl http://localhost:4002/health

# Test file upload directory
docker-compose exec submission-service ls -la uploads/

# Check database constraints
docker-compose exec submission-service npm run db:check
```

#### **Common Solutions**
```bash
# Fix upload directory permissions
docker-compose exec submission-service mkdir -p uploads
docker-compose exec submission-service chmod 755 uploads

# Restart submission service
docker-compose restart submission-service postgres-submission

# Check unique constraints
docker-compose exec submission-service npx prisma db pull
```

---

## Database Issues

### **PostgreSQL Connection Problems**

#### **Symptoms**
- "ECONNREFUSED" errors
- "password authentication failed"
- "database does not exist"

#### **Diagnostics**
```bash
# Check database container status
docker-compose ps | grep postgres

# Test database connectivity
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "SELECT version();"
docker-compose exec postgres-assessment psql -U pediafor -d pediafor_assessments_dev -c "SELECT version();"
docker-compose exec postgres-submission psql -U pediafor -d pediafor_submissions_dev -c "SELECT version();"

# Check database logs
docker-compose logs postgres-user --tail=50
```

#### **Solutions**
```bash
# Restart all databases
docker-compose restart postgres-user postgres-assessment postgres-submission

# Reset database volumes (WARNING: Data loss)
docker-compose down -v
docker-compose up -d postgres-user postgres-assessment postgres-submission

# Recreate databases
docker-compose exec postgres-user createdb -U pediafor pediafor_users_dev
docker-compose exec postgres-assessment createdb -U pediafor pediafor_assessments_dev
docker-compose exec postgres-submission createdb -U pediafor pediafor_submissions_dev
```

### **Prisma Migration Issues**

#### **Symptoms**
- "Migration failed" errors
- Schema drift warnings
- "Table does not exist" errors

#### **Diagnostics**
```bash
# Check migration status
cd services/user-service && npx prisma migrate status
cd services/assessment-service && npx prisma migrate status
cd services/submission-service && npx prisma migrate status

# Check schema differences
cd services/user-service && npx prisma db pull
```

#### **Solutions**
```bash
# Run pending migrations
npm run db:migrate:all

# Reset and recreate schema (DEV ONLY)
cd services/user-service && npx prisma migrate reset --force
cd services/assessment-service && npx prisma migrate reset --force
cd services/submission-service && npx prisma migrate reset --force

# Generate fresh Prisma client
cd services/user-service && npx prisma generate
cd services/assessment-service && npx prisma generate
cd services/submission-service && npx prisma generate
```

---

## Authentication Problems

### **PASETO Token Issues**

#### **Symptoms**
- "Invalid token" errors
- Authentication randomly failing
- Token signature verification errors

#### **Diagnostics**
```bash
# Check PASETO key configuration
echo $PASETO_PUBLIC_KEY | head -c 50
echo $PASETO_PRIVATE_KEY | head -c 50

# Test token generation
cd services/user-service && npm run test:auth

# Validate token manually
node -e "
const { V4 } = require('paseto');
const token = 'your-token-here';
const publicKey = process.env.PASETO_PUBLIC_KEY;
V4.verify(token, publicKey).then(console.log).catch(console.error);
"
```

#### **Solutions**
```bash
# Regenerate PASETO key pair
npm run generate-keys

# Update environment variables
source .env

# Restart all services to pick up new keys
docker-compose restart
```

### **Role-Based Access Control**

#### **Symptoms**
- "Insufficient permissions" errors
- Students accessing teacher endpoints
- Admin operations failing

#### **Diagnostics**
```bash
# Check user roles in database
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "SELECT id, email, role FROM users;"

# Test role validation
curl -H "Authorization: Bearer your-token" http://localhost:3000/api/users/me
```

#### **Solutions**
```bash
# Update user role manually
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';"

# Verify token payload includes correct role
cd services/user-service && npm run test:roles
```

---

## Network & Connectivity

### **Service Communication Issues**

#### **Symptoms**
- Services cannot communicate
- Internal API calls timing out
- Docker network errors

#### **Diagnostics**
```bash
# Check Docker network
docker network ls
docker network inspect pediafor_default

# Test internal connectivity
docker-compose exec gateway-service ping user-service
docker-compose exec gateway-service ping assessment-service
docker-compose exec gateway-service ping submission-service

# Check port bindings
docker-compose ps
netstat -tlnp | grep -E "(3000|4000|4001|4002)"
```

#### **Solutions**
```bash
# Recreate Docker network
docker-compose down
docker-compose up -d

# Check firewall settings (Linux)
sudo ufw status
sudo iptables -L

# Restart Docker service
sudo systemctl restart docker
```

### **CORS Issues**

#### **Symptoms**
- Browser blocking API requests
- "CORS policy" errors in browser console
- Preflight requests failing

#### **Diagnostics**
```bash
# Check CORS configuration
docker-compose exec gateway-service env | grep CORS

# Test CORS headers
curl -H "Origin: http://localhost:3001" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS http://localhost:3000/api/users
```

#### **Solutions**
```bash
# Update CORS origin in environment
export CORS_ORIGIN="http://localhost:3001,http://localhost:3000"

# Restart gateway service
docker-compose restart gateway-service

# Check CORS middleware configuration
grep -r "cors" services/gateway-service/src/
```

---

## Performance Issues

### **Slow API Responses**

#### **Symptoms**
- API requests taking >5 seconds
- Database query timeouts
- High CPU/memory usage

#### **Diagnostics**
```bash
# Monitor resource usage
docker stats

# Check slow queries
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "SELECT query, mean_time, calls FROM pg_stat_statements WHERE mean_time > 100 ORDER BY mean_time DESC;"

# Profile Node.js performance
docker-compose exec user-service node --prof src/server.js
```

#### **Solutions**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Add database indexes
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "CREATE INDEX CONCURRENTLY idx_users_email ON users(email);"

# Enable PostgreSQL connection pooling
# Update DATABASE_URL to include ?pgbouncer=true
```

### **Memory Leaks**

#### **Symptoms**
- Memory usage continuously increasing
- Services crashing with OOM errors
- Slow performance over time

#### **Diagnostics**
```bash
# Monitor memory usage over time
while true; do docker stats --no-stream | grep -E "(user-service|assessment-service|submission-service)"; sleep 30; done

# Enable heap profiling
docker-compose exec user-service node --inspect=0.0.0.0:9229 --heap-prof dist/src/server.js

# Check for unclosed connections
docker-compose exec postgres-user psql -U pediafor -d pediafor_users_dev -c "SELECT count(*) FROM pg_stat_activity;"
```

#### **Solutions**
```bash
# Restart services periodically
docker-compose restart user-service assessment-service submission-service

# Fix connection leaks in code
# Ensure all database connections are properly closed
# Add connection pooling configuration

# Monitor with external tools
# Set up Prometheus + Grafana monitoring
```

---

## Testing Failures

### **Test Environment Issues**

#### **Symptoms**
- Tests failing locally but passing in CI
- Database connection errors in tests
- Test data conflicts

#### **Diagnostics**
```bash
# Run tests with verbose output
npm test -- --verbose

# Check test database configuration
echo $TEST_DATABASE_URL

# Run tests in isolation
npm test -- --runInBand --forceExit
```

#### **Solutions**
```bash
# Set up isolated test databases
export TEST_DATABASE_URL="postgresql://pediafor:development@localhost:5432/pediafor_test"

# Clean test data between runs
npm run test:setup

# Use separate test container
docker-compose -f docker-compose.test.yml up -d
```

### **Specific Test Failures**

#### **Submission Service: 10 Failing Tests**

```bash
# Current known failures:
# - POST /api/submissions (duplicate submission)
# - PUT /api/submissions/:id (validation errors)
# - File upload tests (permission issues)

# Run specific test file
cd services/submission-service
npm test -- tests/integration/submission.routes.test.ts

# Debug specific test
npm test -- --testNamePattern="should handle duplicate submissions"
```

#### **Solutions for Known Issues**
```bash
# Fix unique constraint handling
# Update submission.service.ts to properly handle duplicate submissions

# Fix file upload permissions
chmod 755 services/submission-service/uploads/
chown -R node:node services/submission-service/uploads/

# Update validation middleware
# Review express-validator configuration in submission routes
```

---

## Docker & Container Issues

### **Container Startup Problems**

#### **Symptoms**
- Containers exiting immediately
- "Port already in use" errors
- Volume mount issues

#### **Diagnostics**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs --tail=100

# Check port conflicts
lsof -i :3000
lsof -i :4000
lsof -i :4001
lsof -i :4002
```

#### **Solutions**
```bash
# Kill conflicting processes
kill -9 $(lsof -ti:3000)

# Use different ports
export GATEWAY_PORT=3100
export USER_SERVICE_PORT=4100

# Fix volume permissions
sudo chown -R $USER:$USER ./services/*/uploads
```

### **Image Build Issues**

#### **Symptoms**
- Docker build failures
- Missing dependencies in container
- Node modules not installing

#### **Diagnostics**
```bash
# Build with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test-build ./services/user-service/

# Verify base image
docker pull node:20-alpine
```

#### **Solutions**
```bash
# Update Dockerfile with proper user permissions
# Add healthcheck to Dockerfile
# Use multi-stage builds for production

# Clean Docker system
docker system prune -a
docker volume prune
```

---

## Environment Setup

### **Missing Environment Variables**

#### **Symptoms**
- "Environment variable not set" errors
- Services starting with default values
- Database connection failures

#### **Diagnostics**
```bash
# Check environment variables
env | grep -E "(DATABASE_URL|PASETO|PORT|NODE_ENV)"

# Verify .env file loading
docker-compose config
```

#### **Solutions**
```bash
# Copy and configure environment template
cp .env.example .env

# Source environment variables
source .env

# Generate required keys
npm run generate-keys
```

### **Node.js Version Issues**

#### **Symptoms**
- "Unsupported Node.js version" warnings
- TypeScript compilation errors
- Package installation failures

#### **Diagnostics**
```bash
# Check Node.js version
node --version
npm --version

# Check package.json engines
cat package.json | grep -A 3 engines
```

#### **Solutions**
```bash
# Install Node.js 20 LTS
# Use nvm for version management
nvm install 20
nvm use 20

# Update package.json engines field
# "engines": { "node": ">=20.0.0", "npm": ">=9.0.0" }
```

---

## Production Issues

### **Kubernetes Deployment Problems**

#### **Symptoms**
- Pods in CrashLoopBackOff state
- Service discovery failures
- ConfigMap/Secret mounting issues

#### **Diagnostics**
```bash
# Check pod status
kubectl get pods -n pediafor

# View pod logs
kubectl logs -n pediafor deployment/user-service --tail=100

# Check service endpoints
kubectl get endpoints -n pediafor
```

#### **Solutions**
```bash
# Update resource limits
kubectl patch deployment user-service -n pediafor -p '{"spec":{"template":{"spec":{"containers":[{"name":"user-service","resources":{"limits":{"memory":"512Mi","cpu":"500m"}}}]}}}}'

# Restart deployment
kubectl rollout restart deployment/user-service -n pediafor

# Check ConfigMap
kubectl describe configmap pediafor-config -n pediafor
```

### **Load Balancer Issues**

#### **Symptoms**
- 502/503 errors from NGINX
- Uneven load distribution
- Health check failures

#### **Diagnostics**
```bash
# Check NGINX status
kubectl exec -n pediafor deployment/nginx -- nginx -t

# View NGINX logs
kubectl logs -n pediafor deployment/nginx --tail=100

# Test upstream services
kubectl exec -n pediafor deployment/nginx -- curl http://user-service:4000/health
```

#### **Solutions**
```bash
# Update NGINX configuration
kubectl edit configmap nginx-config -n pediafor

# Restart NGINX
kubectl rollout restart deployment/nginx -n pediafor

# Verify service discovery
kubectl get svc -n pediafor
```

---

## Emergency Procedures

### **Complete System Reset (Development)**

```bash
#!/bin/bash
# WARNING: This will destroy all data

# Stop all services
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Recreate environment
cp .env.example .env
npm run generate-keys

# Start fresh
docker-compose up -d
npm run db:migrate:all
npm run db:seed:all

# Verify system
npm run test:health
```

### **Production Rollback**

```bash
#!/bin/bash
# Emergency production rollback

# Roll back to previous version
kubectl rollout undo deployment/user-service -n pediafor
kubectl rollout undo deployment/assessment-service -n pediafor
kubectl rollout undo deployment/submission-service -n pediafor
kubectl rollout undo deployment/gateway-service -n pediafor

# Wait for rollback completion
kubectl rollout status deployment/user-service -n pediafor

# Verify health
kubectl exec -n pediafor deployment/gateway -- curl http://localhost:3000/health
```

### **Database Emergency Recovery**

```bash
#!/bin/bash
# Emergency database recovery

# Stop all services
kubectl scale deployment --replicas=0 -n pediafor

# Restore from backup
kubectl exec -n pediafor postgres-backup -- pg_restore -d pediafor_users /backups/latest/users.sql
kubectl exec -n pediafor postgres-backup -- pg_restore -d pediafor_assessments /backups/latest/assessments.sql
kubectl exec -n pediafor postgres-backup -- pg_restore -d pediafor_submissions /backups/latest/submissions.sql

# Restart services
kubectl scale deployment --replicas=1 -n pediafor

# Verify data integrity
kubectl exec -n pediafor deployment/user-service -- npm run db:check
```

---

## Support Contacts

### **Development Issues**
- **Email**: [dev-support@pediafor.com](mailto:dev-support@pediafor.com)
- **Slack**: #pediafor-dev
- **GitHub Issues**: [Platform Issues](https://github.com/pediafor/assessment/issues)

### **Production Issues**
- **Emergency**: [ops-emergency@pediafor.com](mailto:ops-emergency@pediafor.com)
- **PagerDuty**: Automated alerts for critical issues
- **Status Page**: [status.pediafor.com](https://status.pediafor.com)

### **Documentation Issues**
- **GitHub Discussions**: [Documentation Feedback](https://github.com/pediafor/assessment/discussions)
- **Wiki**: [Platform Wiki](https://github.com/pediafor/assessment/wiki)

---

**Troubleshooting Guide Version**: 1.0 | **Last Updated**: October 6, 2025  
**Platform Version**: 1.0.0 | **Emergency Contact**: [ops-emergency@pediafor.com](mailto:ops-emergency@pediafor.com)