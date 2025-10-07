#!/bin/bash

# Start the Grading Service
echo "🚀 Starting Grading Service..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the database URL and other configuration in .env"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Build the TypeScript code
echo "🔨 Building TypeScript..."
npm run build

# Start the service
echo "✅ Starting Grading Service on port 4003..."
npm start