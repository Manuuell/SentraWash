/**
 * Configuración tipada de la aplicación, cargada desde variables de entorno.
 * Se expone vía ConfigService (ver app.module.ts).
 */
export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  synchronize: boolean;
  logging: boolean;
}

export interface TenancyConfig {
  header: string;
  allowHeaderTenant: boolean;
}

export interface AuthConfig {
  enabled: boolean;
  cognitoRegion: string;
  userPoolId: string;
  clientId: string;
  tenantClaim: string;
  rolesClaim: string;
}

export interface WhatsAppConfig {
  verifyToken: string;
  accessToken: string;
  graphVersion: string;
  /** Número por defecto para envíos (fallback si no se resuelve el del tenant). */
  phoneNumberId: string;
  /** Nombre del template aprobado para la notificación "vehículo listo". */
  readyTemplate: string;
  /** Código de idioma del template (debe coincidir con el creado en Meta). */
  templateLanguage: string;
}

export interface StorageConfig {
  /** `true` cuando hay un bucket S3 configurado (habilita la subida de fotos). */
  enabled: boolean;
  region: string;
  bucket: string;
  /** Claves IAM. Si están vacías se usa la cadena de credenciales por defecto
   *  de AWS (rol de instancia / variables de entorno). */
  accessKeyId: string;
  secretAccessKey: string;
}

export interface RootConfig {
  app: AppConfig;
  database: DatabaseConfig;
  tenancy: TenancyConfig;
  auth: AuthConfig;
  whatsapp: WhatsAppConfig;
  storage: StorageConfig;
}

const toBool = (value: string | undefined, fallback = false): boolean =>
  value === undefined ? fallback : value.toLowerCase() === 'true';

export default (): RootConfig => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'sentrawash',
    password: process.env.DB_PASSWORD ?? 'sentrawash',
    database: process.env.DB_NAME ?? 'sentrawash',
    ssl: toBool(process.env.DB_SSL),
    synchronize: toBool(process.env.DB_SYNCHRONIZE),
    logging: toBool(process.env.DB_LOGGING, true),
  },
  tenancy: {
    header: process.env.TENANT_HEADER ?? 'x-tenant-id',
    allowHeaderTenant: toBool(process.env.ALLOW_HEADER_TENANT, true),
  },
  auth: {
    enabled: toBool(process.env.AUTH_ENABLED),
    cognitoRegion: process.env.COGNITO_REGION ?? 'us-east-1',
    userPoolId: process.env.COGNITO_USER_POOL_ID ?? '',
    clientId: process.env.COGNITO_CLIENT_ID ?? '',
    tenantClaim: process.env.JWT_TENANT_CLAIM ?? 'custom:tenant_id',
    rolesClaim: process.env.JWT_ROLES_CLAIM ?? 'cognito:groups',
  },
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? 'sentrawash-verify',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION ?? 'v21.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    readyTemplate: process.env.WHATSAPP_TEMPLATE_READY ?? 'vehiculo_listo',
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANG ?? 'es',
  },
  storage: {
    // Se habilita cuando hay bucket definido. Sin él, la subida de fotos queda
    // inactiva y las órdenes se crean igual (sin foto).
    enabled: !!process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION ?? 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});
