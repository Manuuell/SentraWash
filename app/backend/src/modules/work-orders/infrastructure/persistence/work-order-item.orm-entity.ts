import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';

@Entity({ name: 'work_order_items' })
export class WorkOrderItemOrmEntity extends TenantAwareEntity {
  @Column({ name: 'work_order_id', type: 'uuid' })
  workOrderId!: string;

  @Column({ name: 'service_id', type: 'uuid', nullable: true })
  serviceId!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'int', default: 1 })
  cantidad!: number;

  @Column({ name: 'precio_unitario', type: 'numeric', precision: 12, scale: 2 })
  precioUnitario!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  subtotal!: string;
}
