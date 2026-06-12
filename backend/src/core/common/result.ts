/**
 * Result<T> — patrón Either ligero para el flujo de la capa de aplicación/dominio.
 * Evita usar excepciones para el control de flujo de negocio: los casos de uso
 * devuelven Ok(value) o Err(error) y la capa de presentación decide el mapeo HTTP.
 */
import { DomainError } from './domain-error';

export type Result<T, E extends DomainError = DomainError> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly isOk = true;
  readonly isErr = false;
  constructor(public readonly value: T) {}
}

export class Err<E extends DomainError> {
  readonly isOk = false;
  readonly isErr = true;
  constructor(public readonly error: E) {}
}

export const ok = <T>(value: T): Ok<T> => new Ok(value);
export const err = <E extends DomainError>(error: E): Err<E> => new Err(error);
