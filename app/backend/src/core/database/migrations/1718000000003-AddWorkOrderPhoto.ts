import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega la columna `foto_key` a las órdenes: referencia al objeto en S3 con la
 * foto del vehículo capturada al ingreso (seguimiento). La URL de lectura se
 * firma en cada respuesta, así el bucket permanece privado.
 */
export class AddWorkOrderPhoto1718000000003 implements MigrationInterface {
  name = 'AddWorkOrderPhoto1718000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS foto_key varchar(500)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE work_orders DROP COLUMN IF EXISTS foto_key`);
  }
}
