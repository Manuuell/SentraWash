import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { CashMovementType } from '../../domain/cash-movement-type';

@Entity({ name: 'cash_movements' })
export class CashMovementOrmEntity extends TenantAwareEntity {
  @Column({ name: 'cash_session_id', type: 'uuid' })
  cashSessionId!: string;

  @Column({ type: 'enum', enum: CashMovementType, enumName: 'cash_movement_tipo_enum' })
  tipo!: CashMovementType;

  @Column({ type: 'varchar', length: 200 })
  concepto!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto!: string;

  @Column({ name: 'work_order_id', type: 'uuid', nullable: true })
  workOrderId!: string | null;

  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string | null;

  @Column({ name: 'registrado_por', type: 'uuid', nullable: true })
  registradoPor!: string | null;
}
