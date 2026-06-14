import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import {
  WaBusinessAccount,
  WaBusinessAccountRepository,
} from '../../domain/wa-business-account.repository';
import { WaBusinessAccountOrmEntity } from './wa-business-account.orm-entity';

/**
 * Usa el EntityManager por defecto (no el del tenant): la tabla es global y se
 * consulta sin contexto de tenant para poder resolverlo.
 */
@Injectable()
export class TypeormWaBusinessAccountRepository implements WaBusinessAccountRepository {
  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  private get repo() {
    return this.manager.getRepository(WaBusinessAccountOrmEntity);
  }

  async findByPhoneNumberId(phoneNumberId: string): Promise<WaBusinessAccount | null> {
    return this.map(await this.repo.findOne({ where: { phoneNumberId } }));
  }

  async findByTenant(tenantId: string): Promise<WaBusinessAccount | null> {
    return this.map(await this.repo.findOne({ where: { tenantId } }));
  }

  private map(row: WaBusinessAccountOrmEntity | null): WaBusinessAccount | null {
    if (!row) return null;
    return {
      tenantId: row.tenantId,
      phoneNumberId: row.phoneNumberId,
      displayPhone: row.displayPhone ?? null,
    };
  }
}
