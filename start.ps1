# SentraWash - arranca el stack completo (Postgres + Backend + App Flutter).
# Uso:  .\start.ps1
$ErrorActionPreference = "Stop"
$root     = $PSScriptRoot
$backend  = Join-Path $root "backend"
$app      = Join-Path $root "app"
$compose  = Join-Path $backend "docker-compose.yml"

Write-Host "==> SentraWash: iniciando stack..." -ForegroundColor Cyan

# 1) Docker Desktop (lo arranca si el daemon no responde)
docker info *> $null
if (-not $?) {
  Write-Host "==> Docker no responde, iniciando Docker Desktop..." -ForegroundColor Yellow
  Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  for ($i = 0; $i -lt 60; $i++) { docker info *> $null; if ($?) { break }; Start-Sleep 3 }
  if (-not $?) { throw "Docker no arrancó a tiempo." }
}

# 2) Postgres
Write-Host "==> Levantando Postgres..." -ForegroundColor Cyan
docker compose -f $compose --project-directory $backend up -d | Out-Null
for ($i = 0; $i -lt 30; $i++) {
  $h = docker inspect --format "{{.State.Health.Status}}" sentrawash-postgres 2>$null
  if ($h -eq "healthy") { break }; Start-Sleep 2
}
Write-Host "    Postgres: $h" -ForegroundColor Green

# 3) Tenant demo (lo lee de la BD; si no hay, corre migraciones + seed)
$tenant = (docker exec sentrawash-postgres psql -U sentrawash -d sentrawash -tAc "SELECT id FROM tenants LIMIT 1;" 2>$null).Trim()
if ([string]::IsNullOrWhiteSpace($tenant)) {
  Write-Host "==> Sin datos: aplicando migraciones + seed..." -ForegroundColor Yellow
  npm run migration:run --prefix $backend
  npm run seed --prefix $backend
  $tenant = (docker exec sentrawash-postgres psql -U sentrawash -d sentrawash -tAc "SELECT id FROM tenants LIMIT 1;").Trim()
}
Write-Host "    Tenant: $tenant" -ForegroundColor Green

# 4) Backend en una ventana nueva (puerto 4000)
Write-Host "==> Abriendo backend (puerto 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "`$env:PORT='4000'; cd '$backend'; npm run start:dev"
)

# 5) App Flutter en otra ventana (Chrome, puerto 5000)
Write-Host "==> Abriendo app Flutter (Chrome, puerto 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit","-Command",
  "cd '$app'; flutter run -d chrome --web-port 5000 --dart-define=API_BASE_URL=http://localhost:4000/api/v1 --dart-define=TENANT_ID=$tenant"
)

Write-Host ""
Write-Host "Listo. Backend: http://localhost:4000/api/v1  |  App: http://localhost:5000" -ForegroundColor Green
Write-Host "Para detener todo:  .\stop.ps1" -ForegroundColor DarkGray
