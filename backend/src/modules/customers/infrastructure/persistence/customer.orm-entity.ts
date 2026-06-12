import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';

@Entity({ name: 'customers' })
export class CustomerOrmEntity extends TenantAwareEntity {
  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  telefono!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  documento!: string | null;
}
