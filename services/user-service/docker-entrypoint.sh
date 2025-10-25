#!/bin/sh
set -e

# Ensure DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

# Run Prisma migrations (or deploy existing)
echo "Syncing Prisma schema..."
./node_modules/.bin/prisma db push

# Optional: generate client (safe if already generated)
./node_modules/.bin/prisma generate || true

# Optional seed for dev/demo (controlled by SEED_DEV=true)
if [ "$SEED_DEV" = "true" ]; then
  echo "Seeding development users..."
  node ./scripts/seed-dev.js || true
fi

# Start the service
exec node dist/server.js
