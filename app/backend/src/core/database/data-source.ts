import 'reflect-metadata';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

/**
 * DataSource usado por la CLI de TypeORM (migration:run / generate / revert).
 * Carga .env de forma best-effort (Node >= 20.6 / 21 expone loadEnvFile).
 */
try {
  (process as unknown as { loadEnvFile?: (p: string) => void }).loadEnvFile?.(
    join(process.cwd(), '.env'),
  );
} catch {
  /* .env es opcional: en CI/cloud las variables ya están en el entorno */
}

const isTs = __filename.endsWith('.ts');
const rootDir = isTs ? 'src' : 'dist';
const ext = isTs ? 'ts' : 'js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  // Migraciones/seed corren con el rol ADMIN (dueño del esquema), no con el rol
  // de la app: el DDL y las políticas RLS requieren privilegios de propietario.
  username: process.env.DB_ADMIN_USERNAME ?? process.env.DB_USERNAME ?? 'sentrawash',
  password: process.env.DB_ADMIN_PASSWORD ?? process.env.DB_PASSWORD ?? 'sentrawash',
  database: process.env.DB_NAME ?? 'sentrawash',
  ssl: (process.env.DB_SSL ?? 'false') === 'true' ? { rejectUnauthorized: false } : false,
  entities: [join(process.cwd(), rootDir, `**/*.orm-entity.${ext}`)],
  migrations: [join(process.cwd(), rootDir, `core/database/migrations/*.${ext}`)],
  synchronize: false,
});
