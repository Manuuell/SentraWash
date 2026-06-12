import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { WorkOrderChannel } from '../../domain/work-order-channel';
import { WorkOrderStatus } from '../../domain/work-order-status';

@Entity({ name: 'work_orders' })
export class WorkOrderOrmEntity extends TenantAwareEntity {
  @Column({ name: 'numero_orden', type: 'int' })
  numeroOrden!: number;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ name: 'vehicle_id', type: 'uuid', nullable: true })
  vehicleId!: string | null;

  @Column({ name: 'operario_id', type: 'uuid', nullable: true })
  operarioId!: string | null;

  @Column({ type: 'enum', enum: WorkOrderStatus, enumName: 'work_order_estado_enum' })
  estado!: WorkOrderStatus;

  @Column({
    name: 'canal_origen',
    type: 'enum',
    enum: WorkOrderChannel,
    enumName: 'work_order_canal_enum',
  })
  canalOrigen!: WorkOrderChannel;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  descuento!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total!: string;

  @Column({ name: 'fecha_ingreso', type: 'timestamptz' })
  fechaIngreso!: Date;

  @Column({ name: 'fecha_listo', type: 'timestamptz', nullable: true })
  fechaListo!: Date | null;

  @Column({ name: 'fecha_entrega', type: 'timestamptz', nullable: true })
  fechaEntrega!: Date | null;
}
