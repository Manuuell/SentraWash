# SentraWash - detiene el stack. Por defecto conserva los datos de Postgres.
# Uso:  .\stop.ps1          (para Postgres, conserva datos)
#       .\stop.ps1 -Wipe    (para Postgres y BORRA el volumen de datos)
param([switch]$Wipe)
$backend = Join-Path $PSScriptRoot "backend"
$compose = Join-Path $backend "docker-compose.yml"

# Cierra los procesos de backend (node/nest) y de la app (flutter/dart).
Write-Host "==> Cerrando backend y app (node/flutter)..." -ForegroundColor Cyan
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -match "nest start|flutter run|dart .*frontend_server" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

if ($Wipe) {
  Write-Host "==> Deteniendo Postgres y BORRANDO datos..." -ForegroundColor Yellow
  docker compose -f $compose --project-directory $backend down -v
} else {
  Write-Host "==> Deteniendo Postgres (datos conservados)..." -ForegroundColor Cyan
  docker compose -f $compose --project-directory $backend down
}
Write-Host "Detenido." -ForegroundColor Green
