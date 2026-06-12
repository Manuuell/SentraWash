-- ============================================================================
-- Rol de aplicación de MÍNIMO PRIVILEGIO para SentraWash.
--
-- Se ejecuta automáticamente en la PRIMERA inicialización del contenedor
-- (docker-entrypoint-initdb.d), antes de las migraciones.
--
-- ¿Por qué? Los superusuarios de PostgreSQL SALTAN Row-Level Security (incluso
-- con FORCE). Si la app se conectara como superusuario, el aislamiento por
-- tenant NO funcionaría. Por eso:
--   - `sentrawash`      (POSTGRES_USER, dueño)  -> migraciones/DDL (admin)
--   - `sentrawash_app`  (este rol, sin BYPASSRLS) -> la API en runtime
-- ============================================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sentrawash_app') THEN
    CREATE ROLE sentrawash_app WITH LOGIN PASSWORD 'sentrawash_app'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO sentrawash_app;

-- Privilegios sobre objetos ya existentes (por si se reaplica).
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sentrawash_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sentrawash_app;

-- Privilegios por defecto: las tablas que cree el dueño (migraciones) quedan
-- accesibles para el rol de la app automáticamente.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO sentrawash_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO sentrawash_app;
