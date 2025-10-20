#!/usr/bin/env bash
set -euo pipefail

stop_compose() {
  local path="${1}"; local file="${2:-docker-compose.yml}"
  if [[ -d "${path}" ]]; then
    ( cd "${path}" && docker compose -f "${file}" down )
  fi
}

echo "Stopping frontend..."; stop_compose frontend

echo "Stopping notification-service..."; stop_compose services/notification-service

echo "Stopping grading-service..."; stop_compose services/grading-service

echo "Stopping submission-service..."; stop_compose services/submission-service

echo "Stopping assessment-service..."; stop_compose services/assessment-service

echo "Stopping user-service..."; stop_compose services/user-service

echo "Stopping realtime-service..."
if [[ -f services/gateway-service/docker-compose.realtime.yml ]]; then
  ( cd services/gateway-service && docker compose -f docker-compose.realtime.yml down )
fi

echo "Stopping gateway-service and redis..."; stop_compose services/gateway-service

echo "Stopping infra (RabbitMQ, etc.)..."
if [[ -f infra/rabbitmq/docker-compose.yml ]]; then stop_compose infra/rabbitmq; fi

echo "All services stopped."
