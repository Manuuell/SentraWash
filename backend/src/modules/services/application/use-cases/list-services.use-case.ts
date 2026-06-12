import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { Service } from '../../domain/service';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../domain/service.repository';

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<Result<Service[]>> {
    return ok(await this.services.findAll());
  }
}
