import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial de SentraWash.
 *
 * - 19 tablas operativas + catálogo de planes (global).
 * - Enums del dominio (Colombia): tipos de vehículo, métodos de pago (Nequi,
 *   Daviplata...), estados de orden y de caja, eventos de WhatsApp, etc.
 * - Multi-tenancy por Row-Level Security: cada tabla con `tenant_id` solo expone
 *   filas del tenant fijado en `app.current_tenant` (lo setea el interceptor).
 *   FORCE ROW LEVEL SECURITY hace que la política aplique incluso al dueño de la
 *   tabla. Si el GUC no está fijado, NULLIF(...)::uuid es NULL → no se ve nada
 *   (fail-closed).
 */
export class InitialSchema1718000000000 implements MigrationInterface {
  name = 'InitialSchema1718000000000';

  // Tablas con columna tenant_id sobre las que se aplica la política estándar.
  private readonly tenantScopedTables = [
    'tenant_settings',
    'roles',
    'users',
    'customers',
    'vehicles',
    'services',
    'work_orders',
    'work_order_items',
    'cash_sessions',
    'payments',
    'cash_movements',
    'wa_conversations',
    'wa_messages',
    'notifications',
    'custom_field_definitions',
    'message_templates',
    'audit_logs',
  ];

  private readonly enums = [
    `CREATE TYPE tenant_estado_enum AS ENUM ('activo','suspendido','cancelado')`,
    `CREATE TYPE user_estado_enum AS ENUM ('activo','inactivo')`,
    `CREATE TYPE vehicle_tipo_enum AS ENUM ('automovil','camioneta','moto','taxi','camion','otro')`,
    `CREATE TYPE work_order_estado_enum AS ENUM ('recibido','en_proceso','listo','entregado','cancelado')`,
    `CREATE TYPE work_order_canal_enum AS ENUM ('mostrador','whatsapp')`,
    `CREATE TYPE payment_metodo_enum AS ENUM ('efectivo','nequi','daviplata','tarjeta','transferencia')`,
    `CREATE TYPE payment_estado_enum AS ENUM ('pendiente','pagado','anulado')`,
    `CREATE TYPE cash_session_estado_enum AS ENUM ('abierta','cerrada')`,
    `CREATE TYPE cash_movement_tipo_enum AS ENUM ('ingreso','egreso')`,
    `CREATE TYPE wa_direccion_enum AS ENUM ('inbound','outbound')`,
    `CREATE TYPE wa_mensaje_tipo_enum AS ENUM ('text','template','interactive','image')`,
    `CREATE TYPE wa_mensaje_estado_enum AS ENUM ('recibido','enviado','entregado','leido','fallido')`,
    `CREATE TYPE notif_evento_enum AS ENUM ('orden_creada','orden_lista','recordatorio','orden_entregada')`,
    `CREATE TYPE notif_estado_enum AS ENUM ('pendiente','enviado','fallido')`,
    `CREATE TYPE custom_field_entidad_enum AS ENUM ('vehicle','customer','work_order')`,
    `CREATE TYPE custom_field_tipo_enum AS ENUM ('text','number','boolean','date','select')`,
    `CREATE TYPE message_template_evento_enum AS ENUM ('bienvenida','orden_creada','orden_lista','recordatorio','orden_entregada')`,
  ];

  private readonly tables = [
    `CREATE TABLE subscription_plans (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre varchar(80) NOT NULL UNIQUE,
      precio_mensual numeric(12,2) NOT NULL DEFAULT 0,
      limite_usuarios int,
      limite_ordenes_mes int,
      features jsonb NOT NULL DEFAULT '{}',
      activo boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE tenants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre varchar(150) NOT NULL,
      nit varchar(40),
      direccion varchar(200),
      ciudad varchar(100),
      telefono varchar(40),
      email varchar(150),
      logo_url varchar(500),
      plan_id uuid REFERENCES subscription_plans(id),
      estado tenant_estado_enum NOT NULL DEFAULT 'activo',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE tenant_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
      moneda varchar(8) NOT NULL DEFAULT 'COP',
      impuesto_pct numeric(5,2) NOT NULL DEFAULT 0,
      zona_horaria varchar(60) NOT NULL DEFAULT 'America/Bogota',
      formato_placa varchar(40),
      branding jsonb NOT NULL DEFAULT '{}',
      reglas_caja jsonb NOT NULL DEFAULT '{}',
      config_general jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      nombre varchar(80) NOT NULL,
      descripcion varchar(200),
      permisos jsonb NOT NULL DEFAULT '[]',
      es_sistema boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, nombre)
    )`,
    `CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      rol_id uuid REFERENCES roles(id),
      cognito_sub varchar(100) UNIQUE,
      nombre varchar(150) NOT NULL,
      email varchar(150) NOT NULL,
      telefono varchar(40),
      estado user_estado_enum NOT NULL DEFAULT 'activo',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, email)
    )`,
    `CREATE TABLE customers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      nombre varchar(150) NOT NULL,
      telefono varchar(40),
      email varchar(150),
      documento varchar(40),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE vehicles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
      placa varchar(10) NOT NULL,
      tipo vehicle_tipo_enum NOT NULL DEFAULT 'automovil',
      marca varchar(60),
      modelo varchar(60),
      color varchar(40),
      custom_fields jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, placa)
    )`,
    `CREATE TABLE services (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      nombre varchar(120) NOT NULL,
      descripcion varchar(300),
      precio numeric(12,2) NOT NULL DEFAULT 0,
      duracion_min int,
      categoria varchar(80),
      activo boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE work_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      numero_orden int NOT NULL,
      customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
      vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
      operario_id uuid REFERENCES users(id) ON DELETE SET NULL,
      estado work_order_estado_enum NOT NULL DEFAULT 'recibido',
      canal_origen work_order_canal_enum NOT NULL DEFAULT 'mostrador',
      observaciones text,
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      descuento numeric(12,2) NOT NULL DEFAULT 0,
      total numeric(12,2) NOT NULL DEFAULT 0,
      custom_fields jsonb NOT NULL DEFAULT '{}',
      fecha_ingreso timestamptz NOT NULL DEFAULT now(),
      fecha_listo timestamptz,
      fecha_entrega timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, numero_orden)
    )`,
    `CREATE TABLE work_order_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      work_order_id uuid NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      service_id uuid REFERENCES services(id) ON DELETE SET NULL,
      descripcion varchar(200),
      cantidad int NOT NULL DEFAULT 1,
      precio_unitario numeric(12,2) NOT NULL DEFAULT 0,
      subtotal numeric(12,2) NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE cash_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      abierta_por uuid REFERENCES users(id) ON DELETE SET NULL,
      cerrada_por uuid REFERENCES users(id) ON DELETE SET NULL,
      base_inicial numeric(12,2) NOT NULL DEFAULT 0,
      total_ingresos numeric(12,2) NOT NULL DEFAULT 0,
      total_egresos numeric(12,2) NOT NULL DEFAULT 0,
      saldo_esperado numeric(12,2) NOT NULL DEFAULT 0,
      saldo_real numeric(12,2),
      diferencia numeric(12,2),
      estado cash_session_estado_enum NOT NULL DEFAULT 'abierta',
      fecha_apertura timestamptz NOT NULL DEFAULT now(),
      fecha_cierre timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
      cash_session_id uuid REFERENCES cash_sessions(id) ON DELETE SET NULL,
      metodo payment_metodo_enum NOT NULL,
      monto numeric(12,2) NOT NULL DEFAULT 0,
      estado payment_estado_enum NOT NULL DEFAULT 'pagado',
      referencia varchar(120),
      registrado_por uuid REFERENCES users(id) ON DELETE SET NULL,
      fecha_pago timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE cash_movements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      cash_session_id uuid NOT NULL REFERENCES cash_sessions(id) ON DELETE CASCADE,
      tipo cash_movement_tipo_enum NOT NULL,
      concepto varchar(200) NOT NULL,
      monto numeric(12,2) NOT NULL DEFAULT 0,
      work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
      payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
      registrado_por uuid REFERENCES users(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE wa_conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
      telefono varchar(40) NOT NULL,
      estado_flujo varchar(60) NOT NULL DEFAULT 'INICIO',
      contexto jsonb NOT NULL DEFAULT '{}',
      ultima_interaccion timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE wa_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      conversation_id uuid NOT NULL REFERENCES wa_conversations(id) ON DELETE CASCADE,
      direccion wa_direccion_enum NOT NULL,
      tipo wa_mensaje_tipo_enum NOT NULL DEFAULT 'text',
      contenido jsonb NOT NULL DEFAULT '{}',
      wa_message_id varchar(120),
      estado wa_mensaje_estado_enum,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      work_order_id uuid REFERENCES work_orders(id) ON DELETE SET NULL,
      customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
      tipo_evento notif_evento_enum NOT NULL,
      template varchar(120),
      estado notif_estado_enum NOT NULL DEFAULT 'pendiente',
      intentos int NOT NULL DEFAULT 0,
      payload jsonb NOT NULL DEFAULT '{}',
      scheduled_at timestamptz,
      sent_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE custom_field_definitions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      entidad custom_field_entidad_enum NOT NULL,
      clave varchar(80) NOT NULL,
      etiqueta varchar(120) NOT NULL,
      tipo_dato custom_field_tipo_enum NOT NULL DEFAULT 'text',
      requerido boolean NOT NULL DEFAULT false,
      opciones jsonb NOT NULL DEFAULT '[]',
      orden int NOT NULL DEFAULT 0,
      activo boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, entidad, clave)
    )`,
    `CREATE TABLE message_templates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      tipo_evento message_template_evento_enum NOT NULL,
      idioma varchar(8) NOT NULL DEFAULT 'es',
      contenido text NOT NULL,
      variables jsonb NOT NULL DEFAULT '[]',
      activo boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (tenant_id, tipo_evento, idioma)
    )`,
    `CREATE TABLE audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id uuid,
      accion varchar(80) NOT NULL,
      entidad varchar(80),
      entidad_id uuid,
      datos jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now()
    )`,
  ];

  private readonly indexes = [
    `CREATE INDEX idx_users_tenant ON users (tenant_id)`,
    `CREATE INDEX idx_customers_tenant_tel ON customers (tenant_id, telefono)`,
    `CREATE INDEX idx_vehicles_tenant ON vehicles (tenant_id)`,
    `CREATE INDEX idx_vehicles_customer ON vehicles (customer_id)`,
    `CREATE INDEX idx_services_tenant ON services (tenant_id)`,
    `CREATE INDEX idx_work_orders_tenant_estado ON work_orders (tenant_id, estado)`,
    `CREATE INDEX idx_work_orders_vehicle ON work_orders (vehicle_id)`,
    `CREATE INDEX idx_work_order_items_order ON work_order_items (work_order_id)`,
    `CREATE INDEX idx_payments_tenant ON payments (tenant_id)`,
    `CREATE INDEX idx_payments_order ON payments (work_order_id)`,
    `CREATE INDEX idx_cash_sessions_tenant_estado ON cash_sessions (tenant_id, estado)`,
    `CREATE INDEX idx_cash_movements_session ON cash_movements (cash_session_id)`,
    `CREATE INDEX idx_wa_conversations_tenant_tel ON wa_conversations (tenant_id, telefono)`,
    `CREATE INDEX idx_wa_messages_conversation ON wa_messages (conversation_id)`,
    `CREATE INDEX idx_notifications_tenant_estado ON notifications (tenant_id, estado)`,
    `CREATE INDEX idx_audit_logs_tenant ON audit_logs (tenant_id)`,
  ];

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    for (const sql of this.enums) await queryRunner.query(sql);
    for (const sql of this.tables) await queryRunner.query(sql);
    for (const sql of this.indexes) await queryRunner.query(sql);

    // RLS sobre la tabla raíz tenants: solo se ve a sí mismo.
    await queryRunner.query(`ALTER TABLE tenants ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE tenants FORCE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `CREATE POLICY tenant_isolation ON tenants
        USING (id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
        WITH CHECK (id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)`,
    );

    // RLS estándar (por columna tenant_id) en el resto de tablas tenant-scoped.
    for (const table of this.tenantScopedTables) {
      await queryRunner.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`);
      await queryRunner.query(
        `CREATE POLICY tenant_isolation ON ${table}
          USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
          WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const dropOrder = [
      'audit_logs',
      'message_templates',
      'custom_field_definitions',
      'notifications',
      'wa_messages',
      'wa_conversations',
      'cash_movements',
      'payments',
      'cash_sessions',
      'work_order_items',
      'work_orders',
      'services',
      'vehicles',
      'customers',
      'users',
      'roles',
      'tenant_settings',
      'tenants',
      'subscription_plans',
    ];
    for (const table of dropOrder) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    const enumTypes = [
      'message_template_evento_enum',
      'custom_field_tipo_enum',
      'custom_field_entidad_enum',
      'notif_estado_enum',
      'notif_evento_enum',
      'wa_mensaje_estado_enum',
      'wa_mensaje_tipo_enum',
      'wa_direccion_enum',
      'cash_movement_tipo_enum',
      'cash_session_estado_enum',
      'payment_estado_enum',
      'payment_metodo_enum',
      'work_order_canal_enum',
      'work_order_estado_enum',
      'vehicle_tipo_enum',
      'user_estado_enum',
      'tenant_estado_enum',
    ];
    for (const type of enumTypes) {
      await queryRunner.query(`DROP TYPE IF EXISTS ${type}`);
    }
  }
}
