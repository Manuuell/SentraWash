import { Service } from '../domain/service';

export class ServiceResponse {
  id!: string;
  nombre!: string;
  descripcion!: string | null;
  precio!: number;
  duracionMin!: number | null;
  categoria!: string | null;
  activo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static from(service: Service): ServiceResponse {
    const p = service.toPrimitives();
    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      duracionMin: p.duracionMin,
      categoria: p.categoria,
      activo: p.activo,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
