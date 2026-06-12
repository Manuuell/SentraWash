import { Customer } from '../../domain/customer';
import { CustomerOrmEntity } from './customer.orm-entity';

export class CustomerMapper {
  static toDomain(orm: CustomerOrmEntity): Customer {
    return Customer.rehydrate({
      id: orm.id,
      tenantId: orm.tenantId,
      nombre: orm.nombre,
      telefono: orm.telefono ?? null,
      email: orm.email ?? null,
      documento: orm.documento ?? null,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(customer: Customer): CustomerOrmEntity {
    const props = customer.toPrimitives();
    const orm = new CustomerOrmEntity();
    if (props.id) orm.id = props.id;
    orm.tenantId = props.tenantId;
    orm.nombre = props.nombre;
    orm.telefono = props.telefono;
    orm.email = props.email;
    orm.documento = props.documento;
    return orm;
  }
}
