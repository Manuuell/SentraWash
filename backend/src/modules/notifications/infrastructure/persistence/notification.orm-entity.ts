import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { NotificationEvent } from '../../domain/notification-event';
import { NotificationStatus } from '../../domain/notification-status';

@Entity({ name: 'notifications' })
export class NotificationOrmEntity extends TenantAwareEntity {
  @Column({ name: 'work_order_id', type: 'uuid', nullable: true })
  workOrderId!: string | null;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'tipo_evento', type: 'enum', enum: NotificationEvent, enumName: 'notif_evento_enum' })
  tipoEvento!: NotificationEvent;

  @Column({ type: 'varchar', length: 120, nullable: true })
  template!: string | null;

  @Column({ type: 'enum', enum: NotificationStatus, enumName: 'notif_estado_enum' })
  estado!: NotificationStatus;

  @Column({ type: 'int', default: 0 })
  intentos!: number;

  @Column({ type: 'jsonb', default: {} })
  payload!: Record<string, unknown>;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt!: Date | null;
}
