import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { CashMovement } from '../../domain/cash-movement';
import { CashMovementRepository } from '../../domain/cash-movement.repository';
import { CashMovementMapper } from './cash-movement.mapper';
import { CashMovementOrmEntity } from './cash-movement.orm-entity';

@Injectable()
export class TypeormCashMovementRepository implements CashMovementRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(CashMovementOrmEntity);
  }

  async save(movement: CashMovement): Promise<CashMovement> {
    const saved = await this.repo.save(CashMovementMapper.toOrm(movement));
    return CashMovementMapper.toDomain(saved);
  }

  async findBySession(cashSessionId: string): Promise<CashMovement[]> {
    const rows = await this.repo.find({
      where: { cashSessionId },
      order: { createdAt: 'ASC' },
    });
    return rows.map(CashMovementMapper.toDomain);
  }
}
