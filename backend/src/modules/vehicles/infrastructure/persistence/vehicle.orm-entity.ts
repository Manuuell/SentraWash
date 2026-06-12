import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { VehicleType } from '../../domain/vehicle-type';

/**
 * Mapeo de persistencia (TypeORM) de la tabla `vehicles`. Separado de la entidad
 * de dominio: el dominio no conoce TypeORM.
 */
@Entity({ name: 'vehicles' })
export class VehicleOrmEntity extends TenantAwareEntity {
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId!: string | null;

  @Column({ type: 'varchar', length: 10 })
  placa!: string;

  @Column({ type: 'enum', enum: VehicleType, enumName: 'vehicle_tipo_enum' })
  tipo!: VehicleType;

  @Column({ type: 'varchar', length: 60, nullable: true })
  marca!: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  modelo!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  color!: string | null;

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields!: Record<string, unknown>;
}
