import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';

@Entity({ name: 'services' })
export class ServiceOrmEntity extends TenantAwareEntity {
  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  descripcion!: string | null;

  // numeric en pg se materializa como string; el mapper lo convierte a number.
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  precio!: string;

  @Column({ name: 'duracion_min', type: 'int', nullable: true })
  duracionMin!: number | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  categoria!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
