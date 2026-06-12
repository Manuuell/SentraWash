import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega el estado `secado` a la máquina de estados de las órdenes de lavado,
 * entre `en_proceso` (Lavado) y `listo`. Habilita el tablero Kanban operativo:
 * recibido → en_proceso → secado → listo → entregado.
 *
 * Nota: PostgreSQL no permite eliminar un valor de un enum, por lo que `down`
 * es un no-op deliberado (revertir requeriría recrear el tipo).
 */
export class AddSecadoStatus1718000000002 implements MigrationInterface {
  name = 'AddSecadoStatus1718000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE work_order_estado_enum ADD VALUE IF NOT EXISTS 'secado' AFTER 'en_proceso'`,
    );
  }

  async down(): Promise<void> {
    // PostgreSQL no soporta DROP VALUE en un enum; revertir exigiría recrear el
    // tipo y reasignar la columna. Se deja intencionalmente vacío.
  }
}
