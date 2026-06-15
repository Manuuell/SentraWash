# SentraWash

**SaaS multi-tenant para la gestión de lavaderos de vehículos.**

App móvil (Flutter) + API REST (NestJS) con multi-tenancy real, escaneo de
placa, foto del vehículo y tablero operativo en tiempo real. Desplegado en
producción.

🌐 **API en producción:** `https://sentrawash.duckdns.org/api/v1`

---

## Arquitectura

```
SentraWash/
├── app/                       # App Flutter (cliente)
│   ├── lib/
│   │   ├── core/              # config · network (Dio) · router · theme · navegación · widgets
│   │   └── features/          # por dominio (data / domain / presentation):
│   │       │                  #   dashboard · vehicles · customers · services ·
│   │       │                  #   work_orders · cash · intake (cámara + OCR)
│   ├── android/ · ios/ · web/
│   └── backend/               # API NestJS (anidada dentro del repo de la app)
│       ├── src/
│       │   ├── core/          # auth · tenancy (RLS) · database · storage (S3) · config
│       │   └── modules/       # vehicles · customers · services · work-orders ·
│       │       │              #   cash · payments · whatsapp · notifications
│       │       └── <module>/  #   domain / application / infrastructure / presentation
│       └── deploy/            # DEPLOY.md · AWS_S3_SETUP.md · nginx · docker-compose.prod.yml
└── .github/workflows/         # deploy-backend.yml — CI/CD al VPS
```

| Capa | Stack |
|---|---|
| **App** | Flutter 3 · Riverpod · Dio · go_router · google_fonts (Inter) · camera · google_mlkit_text_recognition |
| **API** | NestJS 10 · PostgreSQL 16 · TypeORM · Clean Architecture |
| **Infra** | Docker · AWS S3 (fotos) · VPS Oracle Cloud (ARM) · nginx + Let's Encrypt |

---

## Características

- **Multi-tenancy real**: aislamiento por `tenant_id` con **Row-Level Security** de
  PostgreSQL (fail-closed). La API se conecta con un rol de mínimo privilegio
  (sin `BYPASSRLS`), así el aislamiento lo garantiza el motor.
- **UI estilo Apple**: design system propio (tipografía Inter, listas agrupadas
  estilo iOS, bottom sheets, barra inferior con blur), tema claro/oscuro, e
  **Inicio tipo launcher** con accesos rápidos.
- **Registrar ingreso con cámara**: escanea la **placa** (OCR on-device con ML
  Kit) y toma una **foto del vehículo**; la foto se sube a **S3** y queda como
  evidencia del seguimiento. Si el OCR falla, el operario escribe la placa.
- **Tablero Kanban** operativo: `recibido → en proceso → secado → listo →
  entregado`, con avance de un toque, KPIs del día y reloj de espera en vivo.
- **Caja**: apertura, movimientos (ingreso/egreso), cierre con arqueo.
- Módulos backend listos para activar: **pagos**, **WhatsApp** (webhook + bot) y
  **notificaciones** (`tu carro está listo`).

---

## Flujo de fotos (S3)

El backend nunca maneja los bytes de las imágenes:

1. La app pide una **URL prefirmada** → `POST /uploads/presign`.
2. La app sube la foto **directo a S3** con esa URL (PUT).
3. La app manda la `key` al crear la orden; se guarda en `work_orders.foto_key`.
4. Al leer órdenes, el backend firma una **URL de lectura temporal** (`fotoUrl`);
   el bucket permanece **privado**.

Configuración de AWS: ver [`app/backend/deploy/AWS_S3_SETUP.md`](app/backend/deploy/AWS_S3_SETUP.md).
Si `AWS_S3_BUCKET` no está definido, la subida se desactiva y las órdenes se
crean igual (sin foto).

---

## Multi-tenancy y RLS (resumen)

1. Un interceptor resuelve el `tenantId` (JWT de Cognito en prod; header
   `x-tenant-id` en dev) y abre una transacción con `SET LOCAL app.current_tenant`.
2. Las políticas RLS de PostgreSQL filtran **toda** consulta por `tenant_id`.
3. Sin tenant fijado, no se devuelven filas (**fail-closed**).

---

## Desarrollo local

La app apunta **por defecto al backend de producción** (VPS), así que para
desarrollar la UI basta con:

```bash
cd app
flutter pub get
flutter run            # consume https://sentrawash.duckdns.org por defecto
```

### Levantar el backend en local (opcional)

```bash
cd app/backend
cp .env.example .env             # PORT=3000 por defecto
npm install
chmod +x node_modules/.bin/*     # iCloud quita el bit +x a los binarios
docker compose up -d             # PostgreSQL en localhost:5432
npm run migration:run            # tablas, enums y políticas RLS
npm run seed                     # crea un lavadero demo e imprime su x-tenant-id
npm run start:dev                # API en http://localhost:3000/api/v1
```

Luego apunta la app al backend local (emulador Android usa `10.0.2.2`):

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1 \
            --dart-define=TENANT_ID=<TENANT_DEL_SEED>
```

> Requisitos: Node 20+, Flutter 3.44+, Docker. El proyecto vive en iCloud Drive,
> que quita permisos de ejecución a los binarios de `node_modules` tras cada
> `npm install` (de ahí el `chmod +x`).

---

## Despliegue (producción)

Stack en un **VPS Oracle Cloud**, detrás del nginx del host con HTTPS:

```
Internet → nginx (443, TLS) → 127.0.0.1:4000 → NestJS → Postgres (red interna Docker)
                                                   ↘ AWS S3 (fotos)
```

**CI/CD:** cada push a `main` que toque `app/backend/**` dispara el GitHub Action
[`deploy-backend.yml`](.github/workflows/deploy-backend.yml), que entra por SSH al
VPS, hace `git pull` y reconstruye los contenedores (las migraciones corren
solas). Runbook completo: [`app/backend/deploy/DEPLOY.md`](app/backend/deploy/DEPLOY.md).

---

## Roadmap

- [ ] **Activar autenticación (Cognito)** — hoy `AUTH_ENABLED=false`: la API
      pública no valida identidad. _Prioridad de seguridad._
- [ ] **Backups automáticos** de PostgreSQL (pg_dump → S3).
- [ ] **Notificaciones WhatsApp** `tu carro está listo` (módulo ya en el backend).
- [ ] **Pagos** y cierre de caja conectados en la app.
- [ ] Foto **antes/después** de la entrega · link público de **seguimiento** para el cliente.
