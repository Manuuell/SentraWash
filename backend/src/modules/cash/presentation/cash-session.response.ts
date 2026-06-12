import { CashSession } from '../domain/cash-session';

export class CashSessionResponse {
  id!: string;
  estado!: string;
  abiertaPor!: string | null;
  cerradaPor!: string | null;
  baseInicial!: number;
  totalIngresos!: number;
  totalEgresos!: number;
  saldoEsperado!: number;
  saldoReal!: number | null;
  diferencia!: number | null;
  fechaApertura!: Date;
  fechaCierre!: Date | null;

  static from(session: CashSession): CashSessionResponse {
    const p = session.toPrimitives();
    return {
      id: p.id,
      estado: p.estado,
      abiertaPor: p.abiertaPor,
      cerradaPor: p.cerradaPor,
      baseInicial: p.baseInicial,
      totalIngresos: p.totalIngresos,
      totalEgresos: p.totalEgresos,
      saldoEsperado: p.saldoEsperado,
      saldoReal: p.saldoReal,
      diferencia: p.diferencia,
      fechaApertura: p.fechaApertura,
      fechaCierre: p.fechaCierre,
    };
  }
}
