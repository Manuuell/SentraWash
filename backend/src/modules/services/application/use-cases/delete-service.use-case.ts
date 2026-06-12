import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../domain/service.repository';

@Injectable()
export class DeleteServiceUseCase implements UseCase<string, void> {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const service = await this.services.findById(id);
    if (!service) {
      return err(new NotFoundError(`Servicio ${id} no encontrado`));
    }
    await this.services.delete(id);
    return ok(undefined);
  }
}
