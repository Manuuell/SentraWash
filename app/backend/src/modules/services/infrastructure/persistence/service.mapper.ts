import { Service } from '../../domain/service';
import { ServiceOrmEntity } from './service.orm-entity';

export class ServiceMapper {
  static toDomain(orm: ServiceOrmEntity): Service {
    return Service.rehydrate({
      id: orm.id,
      tenantId: orm.tenantId,
      nombre: orm.nombre,
      descripcion: orm.descripcion ?? null,
      precio: Number(orm.precio), // numeric (string) -> number
      duracionMin: orm.duracionMin ?? null,
      categoria: orm.categoria ?? null,
      activo: orm.activo,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(service: Service): ServiceOrmEntity {
    const props = service.toPrimitives();
    const orm = new ServiceOrmEntity();
    if (props.id) orm.id = props.id;
    orm.tenantId = props.tenantId;
    orm.nombre = props.nombre;
    orm.descripcion = props.descripcion;
    orm.precio = props.precio.toFixed(2);
    orm.duracionMin = props.duracionMin;
    orm.categoria = props.categoria;
    orm.activo = props.activo;
    return orm;
  }
}
