# Pediafor Assessment Platform - Deployment Guide

> **Deployment Status**: Production Ready | **Container Runtime**: Docker | **Orchestration**: Docker Compose / Kubernetes  
> **Infrastructure**: Microservices | **Database**: PostgreSQL per Service | **Cache**: Redis

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [Monitoring & Observability](#monitoring--observability)
9. [Security Configuration](#security-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

#### **Minimum Requirements**
- **CPU**: 4 cores (2.4GHz)
- **Memory**: 8GB RAM
- **Storage**: 50GB SSD
- **Network**: 100Mbps bandwidth

#### **Recommended Requirements**
- **CPU**: 8 cores (3.0GHz+)
- **Memory**: 16GB RAM
- **Storage**: 200GB NVMe SSD
- **Network**: 1Gbps bandwidth

### Software Dependencies

#### **Required Software**
- **Docker**: 24.0+ with Docker Compose v2
- **Node.js**: 20.x LTS (for development)
- **PostgreSQL**: 15.x (or via Docker)
- **Redis**: 7.x (or via Docker)

#### **Optional Tools**
- **Kubernetes**: 1.28+ (for production orchestration)
- **NGINX**: Latest (for reverse proxy)
- **Let's Encrypt**: For SSL certificates
- **Monitoring Stack**: Prometheus, Grafana, Loki

---

## Local Development Setup

### Quick Start with Docker Compose

#### 1. Clone Repository
```bash
git clone https://github.com/pediafor/assessment.git
cd assessment
```

#### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp services/user-service/.env.example services/user-service/.env
cp services/gateway-service/.env.example services/gateway-service/.env
cp services/assessment-service/.env.example services/assessment-service/.env
cp services/submission-service/.env.example services/submission-service/.env
```

#### 3. Generate PASETO Keys
```bash
# Generate Ed25519 key pair for PASETO tokens
npm run generate-keys

# This creates:
# - private.key (keep secure, user-service only)
# - public.key (share with all services)
```

#### 4. Start Development Environment
```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Or start individual services
docker-compose -f docker-compose.dev.yml up gateway-service user-service assessment-service
```

#### 5. Verify Deployment
```bash
# Check service health
curl http://localhost:3000/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "gateway": "healthy",
    "user-service": "healthy", 
    "assessment-service": "healthy",
    "submission-service": "healthy"
  }
}
```

### Development URLs
- **Gateway Service**: http://localhost:3000
- **User Service**: http://localhost:4000 (internal)
- **Assessment Service**: http://localhost:4001 (internal)
- **Submission Service**: http://localhost:4002 (internal)
- **Grading Service**: http://localhost:4003 (internal, when ready)

---

## Production Deployment

### Production Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOAD BALANCER                            │
│                     (NGINX/CloudFlare)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GATEWAY SERVICE                          │
│                    (Multiple Instances)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────┐
│User Service │Assessment   │Submission   │Grading      │Future   │
│(Replicated) │Service      │Service      │Service      │Services │
│             │(Replicated) │(Replicated) │(Replicated) │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
                              │
                              ▼
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────┐
│PostgreSQL   │PostgreSQL   │PostgreSQL   │PostgreSQL   │Redis    │
│Primary +    │Primary +    │Primary +    │Primary +    │Cluster  │
│Read Replica │Read Replica │Read Replica │Read Replica │         │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────┘
```

### Production Deployment Steps

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. SSL Certificate Setup
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d api.pediafor.com
```

#### 3. Production Environment Configuration
```bash
# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
LOG_LEVEL=info

# Gateway Configuration
GATEWAY_PORT=3000
CORS_ORIGIN=https://app.pediafor.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database URLs (production databases)
USER_SERVICE_DB_URL=postgresql://user:password@postgres-user:5432/pediafor_users
ASSESSMENT_SERVICE_DB_URL=postgresql://user:password@postgres-assessment:5433/pediafor_assessments
SUBMISSION_SERVICE_DB_URL=postgresql://user:password@postgres-submission:5434/pediafor_submissions
GRADING_SERVICE_DB_URL=postgresql://user:password@postgres-grading:5435/pediafor_grading

# Redis Configuration
REDIS_URL=redis://redis-cluster:6379

# PASETO Keys (generate secure keys)
PASETO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# External Service URLs
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key

# File Storage
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760
EOF
```

#### 4. Production Deployment
```bash
# Deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
```

---

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Load Balancer / Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - gateway-service
    restart: unless-stopped

  # Gateway Service (Multiple Instances)
  gateway-service:
    build:
      context: ./services/gateway-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=3000
      - PASETO_PUBLIC_KEY=${PASETO_PUBLIC_KEY}
      - USER_SERVICE_URL=http://user-service:4000
      - ASSESSMENT_SERVICE_URL=http://assessment-service:4001
      - SUBMISSION_SERVICE_URL=http://submission-service:4002
      - GRADING_SERVICE_URL=http://grading-service:4003
    depends_on:
      - user-service
      - assessment-service
      - submission-service
      - grading-service
    restart: unless-stopped
    deploy:
      replicas: 3

  # User Service
  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=${USER_SERVICE_DB_URL}
      - PASETO_PRIVATE_KEY=${PASETO_PRIVATE_KEY}
      - PASETO_PUBLIC_KEY=${PASETO_PUBLIC_KEY}
    depends_on:
      - postgres-user
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2

  # Assessment Service
  assessment-service:
    build:
      context: ./services/assessment-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=4001
      - DATABASE_URL=${ASSESSMENT_SERVICE_DB_URL}
      - UPLOAD_PATH=/app/uploads
    volumes:
      - assessment-uploads:/app/uploads
    depends_on:
      - postgres-assessment
    restart: unless-stopped
    deploy:
      replicas: 2

  # Submission Service
  submission-service:
    build:
      context: ./services/submission-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - PORT=4002
      - DATABASE_URL=${SUBMISSION_SERVICE_DB_URL}
    depends_on:
      - postgres-submission
    restart: unless-stopped
    deploy:
      replicas: 2

  # Grading Service (Production Ready with Docker)
  grading-service:
    build:
      context: ./services/grading-service
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=4003
      - DATABASE_URL=${GRADING_SERVICE_DB_URL}
      - LOG_LEVEL=info
    depends_on:
      - postgres-grading
    restart: unless-stopped
    deploy:
      replicas: 2
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4003/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Databases
  postgres-user:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pediafor_users
      - POSTGRES_USER=pediafor
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-user-data:/var/lib/postgresql/data
    restart: unless-stopped

  postgres-assessment:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pediafor_assessments
      - POSTGRES_USER=pediafor
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-assessment-data:/var/lib/postgresql/data
    restart: unless-stopped

  postgres-submission:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pediafor_submissions
      - POSTGRES_USER=pediafor
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-submission-data:/var/lib/postgresql/data
    restart: unless-stopped

  postgres-grading:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=pediafor_grading
      - POSTGRES_USER=pediafor
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-grading-data:/var/lib/postgresql/data
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  postgres-user-data:
  postgres-assessment-data:
  postgres-submission-data:
  postgres-grading-data:
  redis-data:
  assessment-uploads:

networks:
  default:
    name: pediafor-network
```

### NGINX Configuration

Create `nginx/nginx.conf`:

```nginx
upstream gateway {
    server gateway-service:3000;
}

server {
    listen 80;
    server_name api.pediafor.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.pediafor.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy Configuration
    location / {
        proxy_pass http://gateway;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health Check Endpoint
    location /health {
        proxy_pass http://gateway/health;
        access_log off;
    }

    # File Upload Size Limit
    client_max_body_size 10M;
}
```

---

## Kubernetes Deployment

### Prerequisites for Kubernetes
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

### Kubernetes Manifests

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pediafor
  labels:
    name: pediafor
```

#### ConfigMaps
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pediafor-config
  namespace: pediafor
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  CORS_ORIGIN: "https://app.pediafor.com"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX_REQUESTS: "100"
```

#### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pediafor-secrets
  namespace: pediafor
type: Opaque
data:
  # Base64 encoded values
  POSTGRES_PASSWORD: <base64-encoded-password>
  PASETO_PRIVATE_KEY: <base64-encoded-private-key>
  PASETO_PUBLIC_KEY: <base64-encoded-public-key>
```

#### Gateway Service Deployment
```yaml
# k8s/gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
  namespace: pediafor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
      - name: gateway-service
        image: pediafor/gateway-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: pediafor-config
              key: NODE_ENV
        - name: PASETO_PUBLIC_KEY
          valueFrom:
            secretKeyRef:
              name: pediafor-secrets
              key: PASETO_PUBLIC_KEY
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: pediafor
spec:
  selector:
    app: gateway-service
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

#### Ingress Configuration
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pediafor-ingress
  namespace: pediafor
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.pediafor.com
    secretName: pediafor-tls
  rules:
  - host: api.pediafor.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 3000
```

#### Deploy to Kubernetes
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n pediafor
kubectl get services -n pediafor
```

---

## Environment Configuration

### Environment Variables Reference

#### **Gateway Service**
```env
# Server Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=https://app.pediafor.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Authentication
PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Service URLs
USER_SERVICE_URL=http://user-service:4000
ASSESSMENT_SERVICE_URL=http://assessment-service:4001
SUBMISSION_SERVICE_URL=http://submission-service:4002
GRADING_SERVICE_URL=http://grading-service:4003

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PREFIX=pediafor:gateway:
```

#### **User Service**
```env
# Server Configuration
PORT=4000
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=postgresql://user:password@postgres-user:5432/pediafor_users
DATABASE_POOL_SIZE=10

# Authentication Keys
PASETO_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
PASETO_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Token Configuration
TOKEN_EXPIRY=4h
REFRESH_TOKEN_EXPIRY=7d

# Password Security
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
```

#### **Assessment Service**
```env
# Server Configuration
PORT=4001
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=postgresql://user:password@postgres-assessment:5433/pediafor_assessments

# File Upload Configuration
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,audio/mpeg,video/mp4,application/pdf

# Image Processing
IMAGE_QUALITY=80
THUMBNAIL_SIZE=200
```

#### **Submission Service**
```env
# Server Configuration
PORT=4002
NODE_ENV=production
LOG_LEVEL=info

# Database Configuration
DATABASE_URL=postgresql://user:password@postgres-submission:5434/pediafor_submissions

# File Upload Configuration
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=5242880  # 5MB

# Autosave Configuration
AUTOSAVE_INTERVAL=30000  # 30 seconds
```

---

## Database Setup

### PostgreSQL Configuration

#### **Production Database Setup**
```bash
# Create databases for each service
createdb -h postgres-user -U pediafor pediafor_users
createdb -h postgres-assessment -U pediafor pediafor_assessments
createdb -h postgres-submission -U pediafor pediafor_submissions
createdb -h postgres-grading -U pediafor pediafor_grading
```

#### **Database Migrations**
```bash
# Run migrations for each service
cd services/user-service && npm run db:migrate
cd services/assessment-service && npm run db:migrate
cd services/submission-service && npm run db:migrate
cd services/grading-service && npm run db:migrate
```

#### **Database Backup Strategy**
```bash
# Daily backups
cat > /etc/cron.daily/pediafor-backup << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/pediafor"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup each database
pg_dump -h postgres-user -U pediafor pediafor_users | gzip > "$BACKUP_DIR/users_$DATE.sql.gz"
pg_dump -h postgres-assessment -U pediafor pediafor_assessments | gzip > "$BACKUP_DIR/assessments_$DATE.sql.gz"
pg_dump -h postgres-submission -U pediafor pediafor_submissions | gzip > "$BACKUP_DIR/submissions_$DATE.sql.gz"

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /etc/cron.daily/pediafor-backup
```

---

## Monitoring & Observability

### Health Checks

#### **Application Health Endpoints**
```bash
# Gateway health (aggregated)
curl https://api.pediafor.com/health

# Individual service health
curl https://api.pediafor.com/health/user-service
curl https://api.pediafor.com/health/assessment-service
curl https://api.pediafor.com/health/submission-service
```

#### **Database Health Monitoring**
```sql
-- Monitor database connections
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('pediafor_users')) as db_size;
```

### Logging Configuration

#### **Centralized Logging with Docker**
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

#### **Log Aggregation Configuration**
```conf
# logstash/pipeline/logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [docker][image] =~ /pediafor/ {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "pediafor-logs-%{+YYYY.MM.dd}"
  }
}
```

### Prometheus Monitoring

#### **Prometheus Configuration**
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pediafor-services'
    static_configs:
      - targets: ['gateway-service:3000', 'user-service:4000', 'assessment-service:4001', 'submission-service:4002']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

---

## Security Configuration

### SSL/TLS Configuration

#### **Certificate Management**
```bash
# Generate SSL certificates with Let's Encrypt
sudo certbot certonly --webroot \
  -w /var/www/html \
  -d api.pediafor.com \
  -d app.pediafor.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### **Security Headers**
```nginx
# Security headers for NGINX
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self';" always;
```

### Firewall Configuration

#### **UFW Firewall Rules**
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow internal service communication
sudo ufw allow from 172.16.0.0/12 to any port 3000:4003

# Deny all other traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

---

## Troubleshooting

### Common Issues

#### **Service Won't Start**
```bash
# Check service logs
docker-compose logs gateway-service
docker-compose logs user-service

# Check service health
curl http://localhost:3000/health

# Verify environment variables
docker-compose exec gateway-service env | grep PASETO
```

#### **Database Connection Issues**
```bash
# Test database connectivity
docker-compose exec postgres-user psql -U pediafor -d pediafor_users -c "SELECT 1;"

# Check database logs
docker-compose logs postgres-user

# Verify database schema
docker-compose exec user-service npm run db:status
```

#### **Authentication Problems**
```bash
# Verify PASETO keys are properly configured
docker-compose exec user-service node -e "console.log(process.env.PASETO_PRIVATE_KEY?.substring(0, 50))"
docker-compose exec gateway-service node -e "console.log(process.env.PASETO_PUBLIC_KEY?.substring(0, 50))"

# Test token generation
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword"}'
```

### Performance Optimization

#### **Database Performance**
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'users';
```

#### **Memory Optimization**
```bash
# Monitor memory usage
docker stats

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=512"
```

#### **Load Testing**
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test script
cat > load-test.yml << 'EOF'
config:
  target: 'https://api.pediafor.com'
  phases:
    - duration: 60
      arrivalRate: 10
      
scenarios:
  - name: "Authentication flow"
    requests:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "testpassword"
EOF

# Run load test
artillery run load-test.yml
```

---

## Backup & Recovery

### Automated Backup Script

```bash
#!/bin/bash
# /usr/local/bin/pediafor-backup.sh

set -e

BACKUP_DIR="/var/backups/pediafor"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "Starting Pediafor backup at $(date)"

# Database backups
echo "Backing up databases..."
docker-compose exec -T postgres-user pg_dump -U pediafor pediafor_users | gzip > "$BACKUP_DIR/users_$DATE.sql.gz"
docker-compose exec -T postgres-assessment pg_dump -U pediafor pediafor_assessments | gzip > "$BACKUP_DIR/assessments_$DATE.sql.gz"
docker-compose exec -T postgres-submission pg_dump -U pediafor pediafor_submissions | gzip > "$BACKUP_DIR/submissions_$DATE.sql.gz"

# File uploads backup
echo "Backing up uploaded files..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/lib/docker/volumes/assessment_assessment-uploads/_data .

# Configuration backup
echo "Backing up configuration..."
cp -r /opt/pediafor/.env* "$BACKUP_DIR/config_$DATE/"

# Cleanup old backups
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "*_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
```

### Recovery Procedures

#### **Database Recovery**
```bash
# Stop services
docker-compose down

# Restore database
gunzip -c /var/backups/pediafor/users_20251006_120000.sql.gz | \
docker-compose exec -T postgres-user psql -U pediafor -d pediafor_users

# Restart services
docker-compose up -d
```

#### **Full System Recovery**
```bash
# Restore from backup
tar -xzf /var/backups/pediafor/uploads_20251006_120000.tar.gz -C /var/lib/docker/volumes/assessment_assessment-uploads/_data

# Restore configuration
cp -r /var/backups/pediafor/config_20251006_120000/* /opt/pediafor/

# Restart all services
docker-compose down && docker-compose up -d
```

---

**Deployment Guide Version**: 1.0 | **Last Updated**: October 6, 2025  
**Support**: [ops-support@pediafor.com](mailto:ops-support@pediafor.com) | **Infrastructure**: [infrastructure@pediafor.com](mailto:infrastructure@pediafor.com)