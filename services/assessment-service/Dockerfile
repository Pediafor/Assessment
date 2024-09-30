# Assessment Service Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install curl and OpenSSL for health checks and Prisma
RUN apk add --no-cache curl openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install curl and OpenSSL for health checks and Prisma
RUN apk add --no-cache curl openssl openssl-dev

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy static files and configuration
COPY .env* ./

# Create uploads directory
RUN mkdir -p uploads/thumbnails

# Expose port 4001 (matching docker-compose)
EXPOSE 4001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4001

# Start the application
CMD ["npm", "start"]