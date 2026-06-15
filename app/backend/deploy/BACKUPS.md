# Backups de la base de datos

Respaldo automático **nocturno** de PostgreSQL a **AWS S3** (mismo bucket que las
fotos, prefijo `backups/`). Ya está activo en el VPS.

## Cómo funciona
- Script: `~/sentrawash-backups/backup.sh` en el VPS (copia de referencia en
  [`backup.sh`](backup.sh)).
- Cron (usuario `ubuntu`): todos los días a las **08:00 UTC** (3am Colombia):
  ```
  0 8 * * * /home/ubuntu/sentrawash-backups/backup.sh >> /home/ubuntu/sentrawash-backups/backup.log 2>&1
  ```
- Hace `pg_dump -Fc` (formato comprimido) desde el contenedor `sentrawash-prod-db`
  y lo sube a `s3://sentrawash-fotos-2026/backups/sentrawash-AAAAMMDD-HHMMSS.dump`.
- Conserva los **últimos 7** dumps locales en el VPS; en S3 quedan todos.

## Probar manualmente
```bash
ssh ubuntu@158.101.105.13
bash ~/sentrawash-backups/backup.sh   # imprime la ruta S3 y el tamaño
tail ~/sentrawash-backups/backup.log  # historial del cron
```

## Restaurar un backup
```bash
# 1) Baja el dump desde S3 al VPS (usa el contenedor aws-cli con las claves).
cd ~/SentraWash/app/backend && set -a && source .env.prod && set +a
docker run --rm -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
  -e AWS_DEFAULT_REGION="$AWS_REGION" -v ~/sentrawash-backups:/data \
  amazon/aws-cli s3 cp s3://$AWS_S3_BUCKET/backups/<archivo>.dump /data/restore.dump

# 2) Restaura dentro del contenedor de Postgres (--clean reemplaza objetos).
docker exec -i -e PGPASSWORD="$DB_ADMIN_PASSWORD" sentrawash-prod-db \
  pg_restore -U "$DB_ADMIN_USERNAME" -d "$DB_NAME" --clean --if-exists \
  < ~/sentrawash-backups/restore.dump
```

## Retención en S3 (recomendado)
El usuario IAM solo tiene `PutObject`/`GetObject` (no puede borrar), así que la
limpieza en S3 se hace con una **regla de ciclo de vida** del bucket:
- Consola S3 → bucket → **Management → Lifecycle rules → Create rule**.
- Prefijo: `backups/` · Acción: **Expire current versions** a los **30 días**
  (o los que prefieras).
