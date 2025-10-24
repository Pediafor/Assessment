# Submission Service Dockerfile
FROM node:18-slim

# Install OpenSSL and other required packages for Prisma
RUN apt-get update && apt-get install -y \
    curl \
    openssl \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Copy Prisma schema before install so postinstall can find it
COPY prisma ./prisma

# Install production deps; allow postinstall to run prisma generate with schema present
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs
USER nextjs

EXPOSE 4002

CMD ["node", "dist/src/server.js"]