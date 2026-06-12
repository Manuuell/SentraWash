import { ValidationError } from '../../../core/common/domain-error';
import { VehicleType } from './vehicle-type';

export interface VehicleProps {
  id: string;
  tenantId: string;
  customerId: string | null;
  placa: string;
  tipo: VehicleType;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type NewVehicleProps = Omit<
  VehicleProps,
  'id' | 'tenantId' | 'createdAt' | 'updatedAt'
>;

// Placa Colombia: carros ABC123 (3 letras + 3 dígitos); motos ABC12D / 123ABC.
const PLACA_REGEX = /^([A-Z]{3}\d{3}|[A-Z]{3}\d{2}[A-Z]|\d{3}[A-Z]{3})$/;

/**
 * Entidad de dominio Vehicle. Encapsula invariantes de negocio (formato de placa,
 * normalización) y es independiente de TypeORM/HTTP.
 */
export class Vehicle {
  private constructor(private props: VehicleProps) {}

  static rehydrate(props: VehicleProps): Vehicle {
    return new Vehicle(props);
  }

  /** Crea un vehículo nuevo validando las reglas de dominio. */
  static create(tenantId: string, input: NewVehicleProps): Vehicle {
    const placa = Vehicle.normalizePlaca(input.placa);
    if (!PLACA_REGEX.test(placa)) {
      throw new ValidationError(`Placa inválida para Colombia: "${input.placa}"`);
    }
    const now = new Date();
    return new Vehicle({
      id: '', // lo asigna la BD (gen_random_uuid)
      tenantId,
      customerId: input.customerId ?? null,
      placa,
      tipo: input.tipo,
      marca: input.marca ?? null,
      modelo: input.modelo ?? null,
      color: input.color ?? null,
      customFields: input.customFields ?? {},
      createdAt: now,
      updatedAt: now,
    });
  }

  update(changes: Partial<NewVehicleProps>): void {
    if (changes.placa !== undefined) {
      const placa = Vehicle.normalizePlaca(changes.placa);
      if (!PLACA_REGEX.test(placa)) {
        throw new ValidationError(`Placa inválida para Colombia: "${changes.placa}"`);
      }
      this.props.placa = placa;
    }
    if (changes.customerId !== undefined) this.props.customerId = changes.customerId;
    if (changes.tipo !== undefined) this.props.tipo = changes.tipo;
    if (changes.marca !== undefined) this.props.marca = changes.marca;
    if (changes.modelo !== undefined) this.props.modelo = changes.modelo;
    if (changes.color !== undefined) this.props.color = changes.color;
    if (changes.customFields !== undefined) this.props.customFields = changes.customFields;
    this.props.updatedAt = new Date();
  }

  private static normalizePlaca(placa: string): string {
    return placa.replace(/[\s-]/g, '').toUpperCase();
  }

  toPrimitives(): VehicleProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }

  get placa(): string {
    return this.props.placa;
  }
}
