# SentraWash

**SaaS multi-tenant para la gestión de lavaderos de vehículos.**

Monorepo con dos aplicaciones:

| Carpeta | Qué es | Stack |
|---|---|---|
| [`backend/`](backend) | API REST multi-tenant | NestJS 10 · PostgreSQL · TypeORM · Clean Architecture |
| [`app/`](app) | App cliente (web/móvil) | Flutter 3 · Riverpod · Dio · go_router |

---

## Características

- **Multi-tenancy real** con aislamiento por `tenant_id` + **Row-Level Security** de PostgreSQL (fail-closed).
- **Clean Architecture** en el backend: `domain → application → infrastructure / presentation`.
- Módulos: vehículos, clientes, servicios, **órdenes de lavado** (con ítems y totales), **caja** (apertura/cierre/arqueo), pagos, **WhatsApp** (webhook + bot) y notificaciones.
- App Flutter con navegación persistente (rail/bottom-bar adaptable), **modo claro/oscuro** y estados accionables.
- Auth con **Amazon Cognito** (JWT), desactivable en desarrollo (`AUTH_ENABLED=false`).

---

## Arranque rápido (Windows)

Hay scripts que levantan todo el stack (Postgres + backend + app) con un comando.

```powershell
# Doble clic en start.bat, o desde PowerShell:
powershell -ExecutionPolicy Bypass -File C:\SentraWash\start.ps1
```

`start.ps1` arranca Docker Desktop si hace falta, levanta PostgreSQL, aplica migraciones y seed la primera vez, detecta el `tenant_id` automáticamente y abre el backend (puerto 4000) y la app Flutter en Chrome (puerto 5000).

```powershell
.\stop.ps1          # detiene todo (conserva los datos)
.\stop.ps1 -Wipe    # detiene y borra la base de datos
```

---

## Arranque manual

### Requisitos
- **Node 20+**
- **Flutter 3.7+**
- **Docker Desktop** (para PostgreSQL) o un PostgreSQL local

### 1. Backend

```powershell
cd backend
copy .env.example .env          # ajusta PORT=4000 (lo espera la app por defecto)
npm install
docker compose up -d            # PostgreSQL en localhost:5432
npm run migration:run           # crea tablas, enums y políticas RLS
npm run seed                    # crea un lavadero demo e imprime su x-tenant-id
npm run start:dev               # API en http://localhost:4000/api/v1
```

### 2. App Flutter

```powershell
cd app
flutter pub get
flutter run -d chrome --web-port 5000 `
  --dart-define=API_BASE_URL=http://localhost:4000/api/v1 `
  --dart-define=TENANT_ID=<TENANT_DEL_SEED>
```

> En emulador Android usa `--dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1`.

---

## Multi-tenancy y RLS (resumen)

1. Un interceptor resuelve el `tenantId` (JWT de Cognito en prod, header `x-tenant-id` en dev).
2. Abre una transacción y ejecuta `SET LOCAL app.current_tenant = <tenantId>`.
3. Las políticas RLS de PostgreSQL filtran **toda** consulta por `tenant_id`.
4. Sin tenant fijado, no se devuelven filas (**fail-closed**).

La API se conecta con un rol de **mínimo privilegio** (`sentrawash_app`, sin `BYPASSRLS`) para que el aislamiento lo garantice el motor. Más detalle en [`backend/README.md`](backend/README.md).

---

## Estructura

```
SentraWash/
├── app/          # Cliente Flutter (features/ por dominio: data/domain/presentation)
├── backend/      # API NestJS (core/ + modules/ en Clean Architecture)
├── start.ps1     # Levanta todo el stack
└── stop.ps1      # Detiene el stack
```

---

## Estado del proyecto

En desarrollo.
