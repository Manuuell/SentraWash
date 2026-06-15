# Configuración de AWS S3 para las fotos de vehículos

El backend sube las fotos a S3 con **URLs prefirmadas** (la app sube directo a
S3; el servidor no maneja los bytes) y firma URLs de lectura temporales (el
bucket permanece **privado**). Sigue estos pasos una sola vez.

## 1. Crear el bucket
- Consola S3 → **Create bucket**.
- Nombre: p. ej. `sentrawash-fotos` (global, único).
- Región: la misma que pondrás en `AWS_REGION` (p. ej. `us-east-1`).
- **Block all public access: DÉJALO ACTIVADO** (privado). No se necesita acceso
  público: las fotos se sirven con URLs prefirmadas temporales.

## 2. CORS del bucket
Solo es necesario si la app corre en **web** (en móvil nativo no aplica). En el
bucket → pestaña **Permissions → CORS**, pega:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 3. Usuario IAM de mínimo privilegio
- Consola IAM → **Users → Create user** (p. ej. `sentrawash-s3`), sin acceso a
  consola, solo claves de acceso programático.
- Adjunta esta **política inline** (reemplaza `sentrawash-fotos` por tu bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::sentrawash-fotos/*"
    }
  ]
}
```

- Crea una **access key** para el usuario y guarda `Access key ID` y
  `Secret access key`.

## 4. Variables de entorno en el VPS
Edita `~/SentraWash/app/backend/.env.prod` y completa:

```
AWS_REGION=us-east-1
AWS_S3_BUCKET=sentrawash-fotos
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

## 5. Desplegar
El `git push` a `main` dispara el GitHub Action que actualiza el VPS. Al
reconstruir, la migración `AddWorkOrderPhoto` corre sola (agrega `foto_key`).
Si ya tenías el backend corriendo, reinícialo para tomar las nuevas variables:

```bash
cd ~/SentraWash/app/backend
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

## Verificar
```bash
# Debe devolver { "uploadUrl": "...", "key": "work-orders/..." }
curl -s -X POST https://sentrawash.duckdns.org/api/v1/uploads/presign \
  -H "x-tenant-id: 90d5bd4d-3e4c-4540-9935-7cd7e7adc885" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"image/jpeg"}'
```

Si `AWS_S3_BUCKET` está vacío, este endpoint responde 503 y la app crea las
órdenes sin foto (degradación limpia).
