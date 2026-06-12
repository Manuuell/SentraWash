@echo off
REM Lanzador de doble clic para detener SentraWash (conserva los datos).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop.ps1"
pause
