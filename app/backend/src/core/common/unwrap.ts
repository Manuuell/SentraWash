import { Result } from './result';

/**
 * Desempaqueta un Result en la capa de presentación: devuelve el valor o lanza
 * el DomainError, que el DomainExceptionFilter traduce al código HTTP correcto.
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.isErr) {
    throw result.error;
  }
  return result.value;
}
