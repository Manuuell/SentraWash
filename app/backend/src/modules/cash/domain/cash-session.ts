import { ValidationError } from '../../../core/common/domain-error';
import { CashMovementType } from './cash-movement-type';
import { CashSessionStatus } from './cash-session-status';

export interface CashSessionProps {
  id: string;
  tenantId: string;
  abiertaPor: string | null;
  cerradaPor: string | null;
  baseInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoEsperado: number;
  saldoReal: number | null;
  diferencia: number | null;
  estado: CashSessionStatus;
  fechaApertura: Date;
  fechaCierre: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Sesión de caja: apertura con base inicial, acumulación de ingresos/egresos
 * (saldo esperado) y cierre con arqueo (diferencia = saldo real - esperado).
 */
export class CashSession {
  private constructor(private props: CashSessionProps) {}

  static rehydrate(props: CashSessionProps): CashSession {
    return new CashSession(props);
  }

  static open(tenantId: string, input: { baseInicial: number; abiertaPor: string | null }): CashSession {
    if (input.baseInicial < 0) {
      throw new ValidationError('La base inicial no puede ser negativa');
    }
    const now = new Date();
    return new CashSession({
      id: '',
      tenantId,
      abiertaPor: input.abiertaPor ?? null,
      cerradaPor: null,
      baseInicial: input.baseInicial,
      totalIngresos: 0,
      totalEgresos: 0,
      saldoEsperado: input.baseInicial,
      saldoReal: null,
      diferencia: null,
      estado: CashSessionStatus.ABIERTA,
      fechaApertura: now,
      fechaCierre: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /** Aplica el efecto de un movimiento sobre los totales y el saldo esperado. */
  applyMovement(tipo: CashMovementType, monto: number): void {
    if (this.props.estado !== CashSessionStatus.ABIERTA) {
      throw new ValidationError('La caja no está abierta');
    }
    if (monto <= 0) {
      throw new ValidationError('El monto debe ser mayor a 0');
    }
    if (tipo === CashMovementType.INGRESO) {
      this.props.totalIngresos = round2(this.props.totalIngresos + monto);
      this.props.saldoEsperado = round2(this.props.saldoEsperado + monto);
    } else {
      this.props.totalEgresos = round2(this.props.totalEgresos + monto);
      this.props.saldoEsperado = round2(this.props.saldoEsperado - monto);
    }
    this.props.updatedAt = new Date();
  }

  close(saldoReal: number, cerradaPor: string | null): void {
    if (this.props.estado !== CashSessionStatus.ABIERTA) {
      throw new ValidationError('La caja ya está cerrada');
    }
    if (saldoReal < 0) {
      throw new ValidationError('El saldo real no puede ser negativo');
    }
    const now = new Date();
    this.props.saldoReal = round2(saldoReal);
    this.props.diferencia = round2(saldoReal - this.props.saldoEsperado);
    this.props.cerradaPor = cerradaPor ?? null;
    this.props.estado = CashSessionStatus.CERRADA;
    this.props.fechaCierre = now;
    this.props.updatedAt = now;
  }

  toPrimitives(): CashSessionProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get isOpen(): boolean {
    return this.props.estado === CashSessionStatus.ABIERTA;
  }
}
