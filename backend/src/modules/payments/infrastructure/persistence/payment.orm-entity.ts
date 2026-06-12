import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { PaymentMethod } from '../../domain/payment-method';
import { PaymentStatus } from '../../domain/payment-status';

@Entity({ name: 'payments' })
export class PaymentOrmEntity extends TenantAwareEntity {
  @Column({ name: 'work_order_id', type: 'uuid', nullable: true })
  workOrderId!: string | null;

  @Column({ name: 'cash_session_id', type: 'uuid', nullable: true })
  cashSessionId!: string | null;

  @Column({ type: 'enum', enum: PaymentMethod, enumName: 'payment_metodo_enum' })
  metodo!: PaymentMethod;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto!: string;

  @Column({ type: 'enum', enum: PaymentStatus, enumName: 'payment_estado_enum' })
  estado!: PaymentStatus;

  @Column({ type: 'varchar', length: 120, nullable: true })
  referencia!: string | null;

  @Column({ name: 'registrado_por', type: 'uuid', nullable: true })
  registradoPor!: string | null;

  @Column({ name: 'fecha_pago', type: 'timestamptz' })
  fechaPago!: Date;
}
