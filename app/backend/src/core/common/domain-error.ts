/**
 * Errores de dominio independientes del transporte (HTTP, etc.).
 * La capa de presentación los traduce a códigos HTTP en el DomainExceptionFilter.
 */
export type DomainErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'FORBIDDEN'
  | 'UNAUTHORIZED'
  | 'INTERNAL';

export abstract class DomainError extends Error {
  abstract readonly code: DomainErrorCode;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND' as const;
}

export class ConflictError extends DomainError {
  readonly code = 'CONFLICT' as const;
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION' as const;
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN' as const;
}
