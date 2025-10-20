$ErrorActionPreference = 'Stop'

function Stop-Compose($path, $file = 'docker-compose.yml') {
  if (Test-Path $path) {
    Push-Location $path
    try { docker compose -f $file down } finally { Pop-Location }
  }
}

Write-Host "Stopping frontend..." -ForegroundColor Cyan
Stop-Compose "frontend"

Write-Host "Stopping notification-service..." -ForegroundColor Cyan
Stop-Compose "services/notification-service"

Write-Host "Stopping grading-service..." -ForegroundColor Cyan
Stop-Compose "services/grading-service"

Write-Host "Stopping submission-service..." -ForegroundColor Cyan
Stop-Compose "services/submission-service"

Write-Host "Stopping assessment-service..." -ForegroundColor Cyan
Stop-Compose "services/assessment-service"

Write-Host "Stopping user-service..." -ForegroundColor Cyan
Stop-Compose "services/user-service"

Write-Host "Stopping realtime-service..." -ForegroundColor Cyan
if (Test-Path "services/gateway-service/docker-compose.realtime.yml") {
  Push-Location "services/gateway-service"
  try { docker compose -f docker-compose.realtime.yml down } finally { Pop-Location }
}

Write-Host "Stopping gateway-service and redis..." -ForegroundColor Cyan
Stop-Compose "services/gateway-service"

Write-Host "Stopping infra (RabbitMQ, etc.) if present..." -ForegroundColor Cyan
if (Test-Path "infra/rabbitmq/docker-compose.yml") { Stop-Compose "infra/rabbitmq" }

Write-Host "All services stopped." -ForegroundColor Green
