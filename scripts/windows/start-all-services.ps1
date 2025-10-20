param(
  [switch]$Build
)

$ErrorActionPreference = 'Stop'

function Start-Compose($path, $file = 'docker-compose.yml') {
  Push-Location $path
  try {
    if ($Build) { docker compose -f $file up -d --build } else { docker compose -f $file up -d }
  } finally { Pop-Location }
}

Write-Host "Starting infra (RabbitMQ, Redis) if present..." -ForegroundColor Cyan
# RabbitMQ infra
if (Test-Path "infra/rabbitmq/docker-compose.yml") {
  Start-Compose "infra/rabbitmq"
}

# Gateway redis (optional in gateway compose)
Write-Host "Starting gateway-service (API gateway)..." -ForegroundColor Cyan
Start-Compose "services/gateway-service"

Write-Host "Starting realtime-service..." -ForegroundColor Cyan
if (Test-Path "services/gateway-service/docker-compose.realtime.yml") {
  Push-Location "services/gateway-service"
  try { if ($Build) { docker compose -f docker-compose.realtime.yml up -d --build } else { docker compose -f docker-compose.realtime.yml up -d } }
  finally { Pop-Location }
}

Write-Host "Starting user-service (with DB)..." -ForegroundColor Cyan
Start-Compose "services/user-service"

Write-Host "Starting assessment-service (with DB)..." -ForegroundColor Cyan
Start-Compose "services/assessment-service"

Write-Host "Starting submission-service (with DB)..." -ForegroundColor Cyan
Start-Compose "services/submission-service"

Write-Host "Starting grading-service (with DB)..." -ForegroundColor Cyan
Start-Compose "services/grading-service"

Write-Host "Starting notification-service..." -ForegroundColor Cyan
Start-Compose "services/notification-service"

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Compose "frontend"

Write-Host "All services requested to start. Run 'docker ps' to verify containers." -ForegroundColor Green
