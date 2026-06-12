@echo off
REM Lanzador de doble clic para SentraWash. Ejecuta start.ps1 sin bloqueos.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
