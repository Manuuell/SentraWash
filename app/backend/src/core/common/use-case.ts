import { Result } from './result';

/**
 * Contrato base de un caso de uso (capa de aplicación).
 * Un caso de uso = una unidad de orquestación de negocio. SOLID/SRP:
 * cada implementación hace exactamente una cosa.
 */
export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<Result<TOutput>>;
}
