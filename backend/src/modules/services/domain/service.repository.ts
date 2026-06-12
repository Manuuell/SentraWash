import { Service } from './service';

/**
 * Puerto del repositorio de servicios. Acotado al tenant activo por RLS.
 */
export interface ServiceRepository {
  findAll(): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  save(service: Service): Promise<Service>;
  delete(id: string): Promise<void>;
}

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');
