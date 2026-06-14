import { AsyncLocalStorage } from 'node:async_hooks';
import { EntityManager } from 'typeorm';

/**
 * Almacén por petición con el tenant activo y el EntityManager transaccional
 * (el mismo donde se fijó `app.current_tenant`, para que RLS aplique).
 */
export interface TenantStore {
  tenantId: string;
  manager: EntityManager;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export const getTenantStore = (): TenantStore | undefined => tenantStorage.getStore();

export const getCurrentTenantId = (): string | undefined => tenantStorage.getStore()?.tenantId;
