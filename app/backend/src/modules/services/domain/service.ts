import { ValidationError } from '../../../core/common/domain-error';

export interface ServiceProps {
  id: string;
  tenantId: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracionMin: number | null;
  categoria: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewServiceProps = Omit<ServiceProps, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;

/**
 * Entidad de dominio Servicio (catálogo configurable por cada lavadero).
 * Invariantes: nombre obligatorio, precio y duración no negativos.
 */
export class Service {
  private constructor(private props: ServiceProps) {}

  static rehydrate(props: ServiceProps): Service {
    return new Service(props);
  }

  static create(tenantId: string, input: NewServiceProps): Service {
    const nombre = input.nombre?.trim();
    if (!nombre) {
      throw new ValidationError('El nombre del servicio es obligatorio');
    }
    if (input.precio == null || input.precio < 0) {
      throw new ValidationError('El precio no puede ser negativo');
    }
    if (input.duracionMin != null && input.duracionMin < 0) {
      throw new ValidationError('La duración no puede ser negativa');
    }
    const now = new Date();
    return new Service({
      id: '',
      tenantId,
      nombre,
      descripcion: input.descripcion?.trim() || null,
      precio: input.precio,
      duracionMin: input.duracionMin ?? null,
      categoria: input.categoria?.trim() || null,
      activo: input.activo ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(changes: Partial<NewServiceProps>): void {
    if (changes.nombre !== undefined) {
      const nombre = changes.nombre.trim();
      if (!nombre) throw new ValidationError('El nombre del servicio es obligatorio');
      this.props.nombre = nombre;
    }
    if (changes.precio !== undefined) {
      if (changes.precio < 0) throw new ValidationError('El precio no puede ser negativo');
      this.props.precio = changes.precio;
    }
    if (changes.duracionMin !== undefined) {
      if (changes.duracionMin != null && changes.duracionMin < 0) {
        throw new ValidationError('La duración no puede ser negativa');
      }
      this.props.duracionMin = changes.duracionMin;
    }
    if (changes.descripcion !== undefined) this.props.descripcion = changes.descripcion?.trim() || null;
    if (changes.categoria !== undefined) this.props.categoria = changes.categoria?.trim() || null;
    if (changes.activo !== undefined) this.props.activo = changes.activo;
    this.props.updatedAt = new Date();
  }

  toPrimitives(): ServiceProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }
}
