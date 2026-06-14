import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Service } from '../../domain/service';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../domain/service.repository';

@Injectable()
export class GetServiceUseCase implements UseCase<string, Service> {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
  ) {}

  async execute(id: string): Promise<Result<Service>> {
    const service = await this.services.findById(id);
    if (!service) {
      return err(new NotFoundError(`Servicio ${id} no encontrado`));
    }
    return ok(service);
  }
}
