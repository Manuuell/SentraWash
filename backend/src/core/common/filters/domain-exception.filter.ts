import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError, DomainErrorCode } from '../domain-error';

const STATUS_BY_CODE: Record<DomainErrorCode, HttpStatus> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  VALIDATION: HttpStatus.UNPROCESSABLE_ENTITY,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  INTERNAL: HttpStatus.INTERNAL_SERVER_ERROR,
};

interface MappedError {
  status: HttpStatus;
  code: string;
  message: string;
}

// Mapeo de SQLSTATE de PostgreSQL a respuestas HTTP legibles.
const PG_ERRORS: Record<string, MappedError> = {
  '23505': { status: HttpStatus.CONFLICT, code: 'CONFLICT', message: 'El registro ya existe' },
  '23503': {
    status: HttpStatus.CONFLICT,
    code: 'CONFLICT',
    message: 'Violación de integridad referencial',
  },
  '23502': {
    status: HttpStatus.BAD_REQUEST,
    code: 'VALIDATION',
    message: 'Falta un campo obligatorio',
  },
  '23514': {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    code: 'VALIDATION',
    message: 'Valor no permitido por una restricción',
  },
};

/**
 * Traduce errores de dominio, errores de PostgreSQL y HttpException a respuestas
 * HTTP coherentes. Mantiene la capa de aplicación libre de detalles de transporte.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof DomainError) {
      const status = STATUS_BY_CODE[exception.code];
      response.status(status).json({ statusCode: status, code: exception.code, message: exception.message });
      return;
    }

    const pg = this.toPgError(exception);
    if (pg) {
      response.status(pg.status).json({ statusCode: pg.status, code: pg.code, message: pg.message });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(typeof body === 'object' ? body : { statusCode: status, message: body });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL',
      message: 'Error interno del servidor',
    });
  }

  /** Extrae el SQLSTATE de un error de TypeORM/pg sin acoplar el filtro a TypeORM. */
  private toPgError(exception: unknown): MappedError | null {
    const err = exception as { code?: string; driverError?: { code?: string } };
    const code = err?.driverError?.code ?? err?.code;
    if (typeof code !== 'string' || !/^\d{5}$/.test(code)) {
      return null;
    }
    return PG_ERRORS[code] ?? null;
  }
}
