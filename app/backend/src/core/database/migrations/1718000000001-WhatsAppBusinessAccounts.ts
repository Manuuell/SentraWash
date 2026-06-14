import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Tabla de lookup GLOBAL (sin RLS) que mapea el número de WhatsApp Business
 * (phone_number_id de Meta) al tenant dueño. El webhook la consulta ANTES de
 * tener contexto de tenant para saber a qué lavadero pertenece el mensaje.
 */
export class WhatsAppBusinessAccounts1718000000001 implements MigrationInterface {
  name = 'WhatsAppBusinessAccounts1718000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE wa_business_accounts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      phone_number_id varchar(60) NOT NULL UNIQUE,
      display_phone varchar(40),
      waba_id varchar(60),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(
      `CREATE INDEX idx_waba_phone_number ON wa_business_accounts (phone_number_id)`,
    );
    // Concede acceso al rol de la app si existe (en fresh setups lo cubren las
    // default privileges; este GRANT es un respaldo idempotente y seguro).
    await queryRunner.query(
      `DO $$ BEGIN
        IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'sentrawash_app') THEN
          GRANT SELECT, INSERT, UPDATE, DELETE ON wa_business_accounts TO sentrawash_app;
        END IF;
      END $$;`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS wa_business_accounts`);
  }
}
