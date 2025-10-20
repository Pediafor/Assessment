#!/usr/bin/env bash
set -euo pipefail

BUILD=${BUILD:-false}

start_compose() {
  local dir="$1"; local file="${2:-docker-compose.yml}"
  pushd "$dir" >/dev/null
  if [ "$BUILD" = "true" ]; then
    docker compose -f "$file" up -d --build
  else
    docker compose -f "$file" up -d
  fi
  popd >/dev/null
}

echo "Starting infra (RabbitMQ) if present..."
if [ -f infra/rabbitmq/docker-compose.yml ]; then
  start_compose infra/rabbitmq
fi

echo "Starting gateway-service (API gateway)..."
start_compose services/gateway-service

echo "Starting realtime-service..."
if [ -f services/gateway-service/docker-compose.realtime.yml ]; then
  pushd services/gateway-service >/dev/null
  if [ "$BUILD" = "true" ]; then
    docker compose -f docker-compose.realtime.yml up -d --build
  else
    docker compose -f docker-compose.realtime.yml up -d
  fi
  popd >/dev/null
fi

echo "Starting user-service (with DB)..."
start_compose services/user-service

echo "Starting assessment-service (with DB)..."
start_compose services/assessment-service

echo "Starting submission-service (with DB)..."
start_compose services/submission-service

echo "Starting grading-service (with DB)..."
start_compose services/grading-service

echo "Starting notification-service..."
start_compose services/notification-service

echo "Starting frontend..."
start_compose frontend

echo "All services requested to start. Use 'docker ps' to verify."
