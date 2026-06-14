import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { CashSession } from '../../domain/cash-session';
import { CashSessionStatus } from '../../domain/cash-session-status';
import { CashSessionRepository } from '../../domain/cash-session.repository';
import { CashSessionMapper } from './cash-session.mapper';
import { CashSessionOrmEntity } from './cash-session.orm-entity';

@Injectable()
export class TypeormCashSessionRepository implements CashSessionRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(CashSessionOrmEntity);
  }

  async findOpen(): Promise<CashSession | null> {
    const row = await this.repo.findOne({ where: { estado: CashSessionStatus.ABIERTA } });
    return row ? CashSessionMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<CashSession | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? CashSessionMapper.toDomain(row) : null;
  }

  async findAll(): Promise<CashSession[]> {
    const rows = await this.repo.find({ order: { fechaApertura: 'DESC' } });
    return rows.map(CashSessionMapper.toDomain);
  }

  async save(session: CashSession): Promise<CashSession> {
    const saved = await this.repo.save(CashSessionMapper.toOrm(session));
    return CashSessionMapper.toDomain(saved);
  }
}
