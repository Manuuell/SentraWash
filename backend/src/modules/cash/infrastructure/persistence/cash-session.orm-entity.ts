import { Column, Entity } from 'typeorm';
import { TenantAwareEntity } from '../../../../core/common/entities/tenant-aware.entity';
import { CashSessionStatus } from '../../domain/cash-session-status';

@Entity({ name: 'cash_sessions' })
export class CashSessionOrmEntity extends TenantAwareEntity {
  @Column({ name: 'abierta_por', type: 'uuid', nullable: true })
  abiertaPor!: string | null;

  @Column({ name: 'cerrada_por', type: 'uuid', nullable: true })
  cerradaPor!: string | null;

  @Column({ name: 'base_inicial', type: 'numeric', precision: 12, scale: 2 })
  baseInicial!: string;

  @Column({ name: 'total_ingresos', type: 'numeric', precision: 12, scale: 2 })
  totalIngresos!: string;

  @Column({ name: 'total_egresos', type: 'numeric', precision: 12, scale: 2 })
  totalEgresos!: string;

  @Column({ name: 'saldo_esperado', type: 'numeric', precision: 12, scale: 2 })
  saldoEsperado!: string;

  @Column({ name: 'saldo_real', type: 'numeric', precision: 12, scale: 2, nullable: true })
  saldoReal!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  diferencia!: string | null;

  @Column({ type: 'enum', enum: CashSessionStatus, enumName: 'cash_session_estado_enum' })
  estado!: CashSessionStatus;

  @Column({ name: 'fecha_apertura', type: 'timestamptz' })
  fechaApertura!: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre!: Date | null;
}
