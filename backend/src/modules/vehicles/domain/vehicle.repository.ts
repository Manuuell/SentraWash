import { Vehicle } from './vehicle';

/**
 * Puerto del repositorio (inversión de dependencias). La capa de aplicación
 * depende de esta abstracción; la infraestructura (TypeORM) la implementa.
 * Todas las operaciones quedan acotadas al tenant activo por RLS.
 */
export interface VehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlaca(placa: string): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');
