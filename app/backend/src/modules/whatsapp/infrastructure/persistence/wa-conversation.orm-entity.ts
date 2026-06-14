import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';

@Entity({ name: 'wa_conversations' })
export class WaConversationOrmEntity extends TenantAwareEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ type: 'varchar', length: 40 })
  telefono!: string;

  @Column({ name: 'estado_flujo', type: 'varchar', length: 60 })
  estadoFlujo!: string;

  @Column({ type: 'jsonb', default: {} })
  contexto!: Record<string, unknown>;

  @Column({ name: 'ultima_interaccion', type: 'timestamptz' })
  ultimaInteraccion!: Date;
}
