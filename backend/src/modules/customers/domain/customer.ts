import { ValidationError } from '../../../core/common/domain-error';

export interface CustomerProps {
  id: string;
  tenantId: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  documento: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NewCustomerProps = Omit<CustomerProps, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>;

/**
 * Entidad de dominio Cliente. El teléfono es relevante para WhatsApp, por lo que
 * se normaliza (sin espacios ni guiones). Independiente de framework.
 */
export class Customer {
  private constructor(private props: CustomerProps) {}

  static rehydrate(props: CustomerProps): Customer {
    return new Customer(props);
  }

  static create(tenantId: string, input: NewCustomerProps): Customer {
    const nombre = input.nombre?.trim();
    if (!nombre) {
      throw new ValidationError('El nombre del cliente es obligatorio');
    }
    const now = new Date();
    return new Customer({
      id: '',
      tenantId,
      nombre,
      telefono: Customer.normalizePhone(input.telefono),
      email: input.email?.trim() || null,
      documento: input.documento?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(changes: Partial<NewCustomerProps>): void {
    if (changes.nombre !== undefined) {
      const nombre = changes.nombre.trim();
      if (!nombre) throw new ValidationError('El nombre del cliente es obligatorio');
      this.props.nombre = nombre;
    }
    if (changes.telefono !== undefined) this.props.telefono = Customer.normalizePhone(changes.telefono);
    if (changes.email !== undefined) this.props.email = changes.email?.trim() || null;
    if (changes.documento !== undefined) this.props.documento = changes.documento?.trim() || null;
    this.props.updatedAt = new Date();
  }

  private static normalizePhone(phone: string | null | undefined): string | null {
    if (!phone) return null;
    return phone.replace(/[\s-]/g, '');
  }

  toPrimitives(): CustomerProps {
    return { ...this.props };
  }

  get id(): string {
    return this.props.id;
  }
}
