import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tabla GLOBAL (sin RLS): se consulta antes de tener contexto de tenant para
 * resolver a qué lavadero pertenece un mensaje entrante.
 */
@Entity({ name: 'wa_business_accounts' })
export class WaBusinessAccountOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'phone_number_id', type: 'varchar', length: 60 })
  phoneNumberId!: string;

  @Column({ name: 'display_phone', type: 'varchar', length: 40, nullable: true })
  displayPhone!: string | null;

  @Column({ name: 'waba_id', type: 'varchar', length: 60, nullable: true })
  wabaId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
