import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import { getCurrentTenantId, getTenantStore } from './tenant-context';

/**
 * Punto único de acceso a la BD para los repositorios. Devuelve el EntityManager
 * transaccional del tenant activo (donde RLS está habilitado). Si no hay contexto
 * de tenant, cae al manager por defecto (sin tenant fijado → RLS deniega todo).
 */
@Injectable()
export class TenantManager {
  constructor(
    @InjectEntityManager() private readonly defaultManager: EntityManager,
  ) {}

  get manager(): EntityManager {
    return getTenantStore()?.manager ?? this.defaultManager;
  }

  getRepository<T extends ObjectLiteral>(target: EntityTarget<T>): Repository<T> {
    return this.manager.getRepository(target);
  }

  /** tenantId activo; lanza si se invoca fuera de un contexto multi-tenant. */
  get tenantId(): string {
    const tenantId = getCurrentTenantId();
    if (!tenantId) {
      throw new Error('TenantManager: no hay tenant en el contexto actual');
    }
    return tenantId;
  }
}
