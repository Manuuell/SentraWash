import { Customer } from '../domain/customer';

export class CustomerResponse {
  id!: string;
  nombre!: string;
  telefono!: string | null;
  email!: string | null;
  documento!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static from(customer: Customer): CustomerResponse {
    const p = customer.toPrimitives();
    return {
      id: p.id,
      nombre: p.nombre,
      telefono: p.telefono,
      email: p.email,
      documento: p.documento,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
