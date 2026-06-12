/** Mapeo de un número de WhatsApp Business (Meta) a su tenant. */
export interface WaBusinessAccount {
  tenantId: string;
  phoneNumberId: string;
  displayPhone: string | null;
}

export interface WaBusinessAccountRepository {
  findByPhoneNumberId(phoneNumberId: string): Promise<WaBusinessAccount | null>;
  /** Número de WhatsApp del tenant (para enviarle notificaciones a sus clientes). */
  findByTenant(tenantId: string): Promise<WaBusinessAccount | null>;
}

export const WA_BUSINESS_ACCOUNT_REPOSITORY = Symbol('WA_BUSINESS_ACCOUNT_REPOSITORY');
