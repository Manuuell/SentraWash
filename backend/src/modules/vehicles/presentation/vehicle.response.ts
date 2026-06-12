import { Vehicle } from '../domain/vehicle';

/** Representación pública (API) de un vehículo. */
export class VehicleResponse {
  id!: string;
  customerId!: string | null;
  placa!: string;
  tipo!: string;
  marca!: string | null;
  modelo!: string | null;
  color!: string | null;
  customFields!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;

  static from(vehicle: Vehicle): VehicleResponse {
    const p = vehicle.toPrimitives();
    return {
      id: p.id,
      customerId: p.customerId,
      placa: p.placa,
      tipo: p.tipo,
      marca: p.marca,
      modelo: p.modelo,
      color: p.color,
      customFields: p.customFields,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
