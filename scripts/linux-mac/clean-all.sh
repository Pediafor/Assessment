#!/usr/bin/env bash
set -euo pipefail

stop_all() {
  if [[ -f scripts/linux-mac/stop-all-services.sh ]]; then bash scripts/linux-mac/stop-all-services.sh; fi
}

clean_compose() {
  local path="${1}"; local file="${2:-docker-compose.yml}"
  if [[ -d "${path}" ]]; then
    ( cd "${path}" && docker compose -f "${file}" down -v --remove-orphans )
  fi
}

stop_all

echo "Removing frontend containers/volumes..."; clean_compose frontend

echo "Removing notification-service..."; clean_compose services/notification-service

echo "Removing grading-service..."; clean_compose services/grading-service

echo "Removing submission-service..."; clean_compose services/submission-service

echo "Removing assessment-service..."; clean_compose services/assessment-service

echo "Removing user-service..."; clean_compose services/user-service

echo "Removing realtime-service..."
if [[ -f services/gateway-service/docker-compose.realtime.yml ]]; then
  ( cd services/gateway-service && docker compose -f docker-compose.realtime.yml down -v --remove-orphans )
fi

echo "Removing gateway-service and redis..."; clean_compose services/gateway-service

echo "Removing infra (RabbitMQ, etc.)..."
if [[ -f infra/rabbitmq/docker-compose.yml ]]; then clean_compose infra/rabbitmq; fi

echo "Cleanup complete."
