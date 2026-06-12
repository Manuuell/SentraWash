import { Injectable } from '@nestjs/common';
import { In, LessThan } from 'typeorm';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Notification } from '../../domain/notification';
import { NotificationStatus } from '../../domain/notification-status';
import { NotificationRepository } from '../../domain/notification.repository';
import { NotificationMapper } from './notification.mapper';
import { NotificationOrmEntity } from './notification.orm-entity';

@Injectable()
export class TypeormNotificationRepository implements NotificationRepository {
  constructor(private readonly tenant: TenantManager) {}

  private get repo() {
    return this.tenant.getRepository(NotificationOrmEntity);
  }

  async findAll(): Promise<Notification[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map(NotificationMapper.toDomain);
  }

  async findPending(): Promise<Notification[]> {
    const rows = await this.repo.find({
      where: {
        estado: In([NotificationStatus.PENDIENTE, NotificationStatus.FALLIDO]),
        intentos: LessThan(3),
      },
      order: { createdAt: 'ASC' },
    });
    return rows.map(NotificationMapper.toDomain);
  }

  async save(notification: Notification): Promise<Notification> {
    const saved = await this.repo.save(NotificationMapper.toOrm(notification));
    return NotificationMapper.toDomain(saved);
  }
}
