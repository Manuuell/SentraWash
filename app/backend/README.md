# SentraWash — Backend (API)

API SaaS **multi-tenant** para la gestión de lavaderos de vehículos en Colombia.
NestJS + PostgreSQL, **Clean Architecture**, aislamiento por tenant con **Row-Level Security**.

## Stack

- **NestJS 10** (Node 20+, TypeScript)
- **PostgreSQL** vía **TypeORM** (migraciones como única fuente de verdad del esquema)
- **Multi-tenancy:** shared DB + `tenant_id` + RLS (fail-closed)
- **Auth:** Amazon Cognito (JWT) — desactivable en dev (`AUTH_ENABLED=false`)

## Arquitectura de carpetas

```
src/
├── core/                         # Núcleo transversal
│   ├── auth/                     # Estrategia JWT Cognito, guards, decoradores
│   ├── common/                   # Result/Either, DomainError, base entity, filtro
│   ├── config/                   # Configuración tipada desde .env
│   ├── database/                 # TypeORM + DataSource + migraciones + seed
│   └── tenancy/                  # Contexto de tenant, interceptor RLS, TenantManager
├── modules/
│   └── vehicles/                 # Módulo de referencia (Clean Architecture)
│       ├── domain/               # Entidad + puerto del repositorio (sin framework)
│       ├── application/          # Casos de uso + DTOs
│       ├── infrastructure/       # Entidad TypeORM + mapper + repositorio
│       └── presentation/         # Controlador REST + presenter
├── health/                       # Health check (público)
├── app.module.ts
└── main.ts
```

> Cada módulo de negocio sigue el patrón de `vehicles`: dominio puro en el centro,
> dependencias apuntando hacia adentro (presentation → application → domain ← infrastructure).

## Cómo levantarlo en local

### 1. Requisitos
- Node 20+
- Docker Desktop (para PostgreSQL) **o** un PostgreSQL local

### 2. Variables de entorno
```bash
cp .env.example .env
```

### 3. Base de datos
```bash
docker compose up -d            # Postgres en localhost:5432
```

### 4. Instalar, migrar y poblar
```bash
npm install
npm run migration:run           # crea las 19 tablas + enums + políticas RLS
npm run seed                    # crea un lavadero demo e imprime su x-tenant-id
```

### 5. Arrancar la API
```bash
npm run start:dev               # http://localhost:3000/api/v1
```

## Probar la API

El seed imprime un `x-tenant-id`. Úsalo en cada request (en dev el tenant viaja por
header; en prod viaja dentro del JWT de Cognito).

```bash
# Salud (público)
curl http://localhost:3000/api/v1/health

# Crear vehículo
curl -X POST http://localhost:3000/api/v1/vehicles \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: <TENANT_ID_DEL_SEED>" \
  -d '{ "placa": "ABC123", "tipo": "automovil", "marca": "Mazda", "color": "Rojo" }'

# Listar vehículos (solo verás los del tenant del header → RLS)
curl http://localhost:3000/api/v1/vehicles -H "x-tenant-id: <TENANT_ID_DEL_SEED>"
```

## Multi-tenancy y RLS (cómo funciona)

1. `TenantTransactionInterceptor` resuelve el `tenantId` (JWT en prod, header en dev).
2. Abre una transacción y ejecuta `SET LOCAL app.current_tenant = <tenantId>`.
3. El handler corre dentro de un `AsyncLocalStorage` que expone ese `EntityManager`.
4. Las políticas RLS de PostgreSQL filtran **toda** consulta por `tenant_id`.
5. Sin tenant fijado, las políticas no devuelven filas (**fail-closed**).

Los repositorios obtienen su conexión del `TenantManager`, por lo que **nunca**
filtran por `tenant_id` a mano: el aislamiento lo garantiza el motor.

> ⚠️ **Importante:** los superusuarios de PostgreSQL **saltan RLS** (incluso con
> `FORCE`). Por eso la API se conecta con el rol de mínimo privilegio
> `sentrawash_app` (no superusuario, sin `BYPASSRLS`), que crea
> `docker/init/01-init-app-role.sql`. Las migraciones/seed usan el rol admin
> (`DB_ADMIN_*`). En AWS RDS, crea igualmente un rol de app separado del master.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run start:dev` | API en modo watch |
| `npm run build` | Compila a `dist/` |
| `npm run migration:run` | Aplica migraciones |
| `npm run migration:revert` | Revierte la última migración |
| `npm run migration:generate -- src/core/database/migrations/<Nombre>` | Genera migración por diff |
| `npm run seed` | Datos demo (tenant + servicios) |
| `npm run test` | Tests unitarios |

## Próximos módulos

Replicando el patrón de `vehicles`: `customers`, `services`, `work-orders`
(con `work_order_items` y cálculo de totales), `cash-register` (apertura/cierre/arqueo),
`payments`, `whatsapp` (webhook + máquina de estados del bot) y `notifications`.
