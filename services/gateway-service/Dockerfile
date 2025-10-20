# Gateway Service Dockerfile
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building) without running scripts
# This avoids building optional native deps (e.g., webtransport quiche) during build
RUN npm ci --ignore-scripts

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Use package files for production
COPY package*.json ./

# Install production dependencies without running scripts
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3000 (gateway service port)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { \
    if (res.statusCode === 200) process.exit(0); else process.exit(1); \
  }).on('error', () => process.exit(1));"

# Start the application
CMD ["npm", "start"]