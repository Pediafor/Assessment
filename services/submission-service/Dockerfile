# Submission Service Dockerfile
FROM node:18-slim

# Install OpenSSL and other required packages for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs
USER nextjs

EXPOSE 4002

CMD ["node", "dist/src/server.js"]