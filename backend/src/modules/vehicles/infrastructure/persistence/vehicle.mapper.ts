import { Vehicle } from '../../domain/vehicle';
import { VehicleOrmEntity } from './vehicle.orm-entity';

/** Traduce entre la entidad de dominio y el registro de persistencia. */
export class VehicleMapper {
  static toDomain(orm: VehicleOrmEntity): Vehicle {
    return Vehicle.rehydrate({
      id: orm.id,
      tenantId: orm.tenantId,
      customerId: orm.customerId ?? null,
      placa: orm.placa,
      tipo: orm.tipo,
      marca: orm.marca ?? null,
      modelo: orm.modelo ?? null,
      color: orm.color ?? null,
      customFields: orm.customFields ?? {},
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(vehicle: Vehicle): VehicleOrmEntity {
    const props = vehicle.toPrimitives();
    const orm = new VehicleOrmEntity();
    // id vacío => entidad nueva: la BD asigna el uuid (gen_random_uuid).
    if (props.id) orm.id = props.id;
    orm.tenantId = props.tenantId;
    orm.customerId = props.customerId;
    orm.placa = props.placa;
    orm.tipo = props.tipo;
    orm.marca = props.marca;
    orm.modelo = props.modelo;
    orm.color = props.color;
    orm.customFields = props.customFields;
    return orm;
  }
}
