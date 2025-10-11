# Gateway Service Dockerfile
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Use simplified package.json for Docker (without problematic native modules)
COPY package.docker.json ./package.json

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Now copy the actual package.json for runtime compatibility
COPY package*.json ./

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Use simplified package.json for production
COPY package.docker.json ./package.json

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

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