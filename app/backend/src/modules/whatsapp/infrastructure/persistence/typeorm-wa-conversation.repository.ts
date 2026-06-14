import { Injectable } from '@nestjs/common';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { WaConversation } from '../../domain/wa-conversation';
import { WaConversationRepository } from '../../domain/wa-conversation.repository';
import { WaConversationMapper } from './wa-conversation.mapper';
import { WaConversationOrmEntity } from './wa-conversation.orm-entity';

@Injectable()
export class TypeormWaConversationRepository implements WaConversationRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(WaConversationOrmEntity);
  }

  async findByPhone(telefono: string): Promise<WaConversation | null> {
    const row = await this.repo.findOne({
      where: { telefono },
      order: { ultimaInteraccion: 'DESC' },
    });
    return row ? WaConversationMapper.toDomain(row) : null;
  }

  async save(conversation: WaConversation): Promise<WaConversation> {
    const saved = await this.repo.save(WaConversationMapper.toOrm(conversation));
    return WaConversationMapper.toDomain(saved);
  }
}
