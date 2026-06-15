#!/usr/bin/env bash
# Backup de PostgreSQL de SentraWash → AWS S3. Lee credenciales de .env.prod.
#
# Copia operativa en el VPS: ~/sentrawash-backups/backup.sh (la que corre el cron).
# Este archivo es la referencia versionada. Programado vía cron (ver BACKUPS.md):
#   0 8 * * * /home/ubuntu/sentrawash-backups/backup.sh >> ~/sentrawash-backups/backup.log 2>&1
set -euo pipefail

ENV_FILE="$HOME/SentraWash/app/backend/.env.prod"
LOCAL_DIR="$HOME/sentrawash-backups"
CONTAINER="sentrawash-prod-db"
KEEP_LOCAL=7

set -a; source "$ENV_FILE"; set +a
mkdir -p "$LOCAL_DIR"
TS=$(date +%Y%m%d-%H%M%S)
FILE="sentrawash-${TS}.dump"

# 1) Dump comprimido (formato custom) desde el contenedor de Postgres.
docker exec -e PGPASSWORD="$DB_ADMIN_PASSWORD" "$CONTAINER" \
  pg_dump -U "$DB_ADMIN_USERNAME" -d "$DB_NAME" -Fc > "$LOCAL_DIR/$FILE"

# 2) Sube a S3 (imagen oficial de aws-cli; no requiere instalar nada en el host).
docker run --rm \
  -e AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e AWS_DEFAULT_REGION="$AWS_REGION" \
  -v "$LOCAL_DIR:/data" \
  amazon/aws-cli:latest s3 cp "/data/$FILE" "s3://$AWS_S3_BUCKET/backups/$FILE" >/dev/null

# 3) Rotación local: conserva los últimos N dumps (en S3 usar lifecycle rule).
ls -1t "$LOCAL_DIR"/sentrawash-*.dump 2>/dev/null | tail -n +$((KEEP_LOCAL + 1)) | xargs -r rm -f
echo "$(date '+%F %T') OK -> s3://$AWS_S3_BUCKET/backups/$FILE ($(du -h "$LOCAL_DIR/$FILE" | cut -f1))"
