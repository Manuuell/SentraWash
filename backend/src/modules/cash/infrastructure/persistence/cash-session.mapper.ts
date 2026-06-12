import { CashSession } from '../../domain/cash-session';
import { CashSessionOrmEntity } from './cash-session.orm-entity';

const toNum = (v: string | null): number | null => (v != null ? Number(v) : null);

export class CashSessionMapper {
  static toDomain(o: CashSessionOrmEntity): CashSession {
    return CashSession.rehydrate({
      id: o.id,
      tenantId: o.tenantId,
      abiertaPor: o.abiertaPor ?? null,
      cerradaPor: o.cerradaPor ?? null,
      baseInicial: Number(o.baseInicial),
      totalIngresos: Number(o.totalIngresos),
      totalEgresos: Number(o.totalEgresos),
      saldoEsperado: Number(o.saldoEsperado),
      saldoReal: toNum(o.saldoReal),
      diferencia: toNum(o.diferencia),
      estado: o.estado,
      fechaApertura: o.fechaApertura,
      fechaCierre: o.fechaCierre ?? null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }

  static toOrm(session: CashSession): CashSessionOrmEntity {
    const p = session.toPrimitives();
    const o = new CashSessionOrmEntity();
    if (p.id) o.id = p.id;
    o.tenantId = p.tenantId;
    o.abiertaPor = p.abiertaPor;
    o.cerradaPor = p.cerradaPor;
    o.baseInicial = p.baseInicial.toFixed(2);
    o.totalIngresos = p.totalIngresos.toFixed(2);
    o.totalEgresos = p.totalEgresos.toFixed(2);
    o.saldoEsperado = p.saldoEsperado.toFixed(2);
    o.saldoReal = p.saldoReal != null ? p.saldoReal.toFixed(2) : null;
    o.diferencia = p.diferencia != null ? p.diferencia.toFixed(2) : null;
    o.estado = p.estado;
    o.fechaApertura = p.fechaApertura;
    o.fechaCierre = p.fechaCierre;
    return o;
  }
}
