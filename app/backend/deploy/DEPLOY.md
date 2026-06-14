# Despliegue de SentraWash en el VPS

Stack: **Postgres + NestJS** en Docker, detrás del **nginx del host** (HTTPS).
No abre puertos nuevos en Oracle (entra por el 443 que ya usa nginx).

```
Internet → nginx host (443, TLS) → 127.0.0.1:4000 → NestJS → Postgres (red interna)
```

---

## 1. DNS (DuckDNS)

En https://www.duckdns.org crea el subdominio **`sentrawash`** apuntando a la IP del VPS:

```
sentrawash.duckdns.org  →  158.101.105.13
```

## 2. Clonar el repo en el VPS

```bash
cd ~
git clone https://github.com/Manuuell/SentraWash.git
cd SentraWash/app/backend
```

## 3. Configurar el entorno

```bash
cp .env.prod.example .env.prod
nano .env.prod          # cambia DB_ADMIN_PASSWORD por una clave larga
```

## 4. Levantar Postgres + API (migraciones automáticas)

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f api
```

Espera a ver `SentraWash API escuchando en ...`. Las migraciones corren solas
antes de arrancar. Para probar localmente en el VPS:

```bash
curl -s http://127.0.0.1:4000/api/v1/health
```

## 5. Seed (crear el lavadero demo) — solo la primera vez

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml exec api \
  node dist/core/database/seed.js
```

⚠️ **Anota el UUID que imprime** (`x-tenant-id: ....`). La app Flutter lo necesita
(ver sección 8). El seed genera un UUID aleatorio, NO el que trae la app por defecto.

## 6. nginx (reverse proxy)

```bash
sudo cp deploy/nginx-sentrawash.conf /etc/nginx/sites-available/sentrawash
sudo ln -s /etc/nginx/sites-available/sentrawash /etc/nginx/sites-enabled/sentrawash
sudo nginx -t && sudo systemctl reload nginx
```

## 7. HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d sentrawash.duckdns.org
```

Certbot agrega el bloque 443 y la redirección. Verifica desde tu Mac:

```bash
curl -s https://sentrawash.duckdns.org/api/v1/health
```

## 8. Apuntar la app Flutter al backend del VPS

```bash
flutter run \
  --dart-define=API_BASE_URL=https://sentrawash.duckdns.org/api/v1 \
  --dart-define=TENANT_ID=<UUID-del-paso-5>
```

(En IntelliJ: Run → Edit Configurations → Additional run args.)

---

## Operación diaria

```bash
# Actualizar a la última versión del backend
cd ~/SentraWash && git pull
cd app/backend
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

# Ver logs / reiniciar / apagar
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f api
docker compose --env-file .env.prod -f docker-compose.prod.yml restart api
docker compose --env-file .env.prod -f docker-compose.prod.yml down
```

## Pendientes antes de producción real

- [ ] Activar **Cognito** (`AUTH_ENABLED=true`) y `ALLOW_HEADER_TENANT=false`.
      Hoy la API no valida identidad: cualquiera con la URL puede leer/escribir
      pasando un `x-tenant-id`. Aceptable solo para demo controlada.
- [ ] Backups del volumen `sentrawash_prod_pgdata` (pg_dump programado).
- [ ] Cambiar la clave del rol `sentrawash_app` en `docker/init/01-init-app-role.sql`.
