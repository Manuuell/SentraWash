import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Service } from '../../domain/service';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../domain/service.repository';
import { UpdateServiceDto } from '../dto/update-service.dto';

export interface UpdateServiceInput {
  id: string;
  data: UpdateServiceDto;
}

@Injectable()
export class UpdateServiceUseCase implements UseCase<UpdateServiceInput, Service> {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
  ) {}

  async execute({ id, data }: UpdateServiceInput): Promise<Result<Service>> {
    const service = await this.services.findById(id);
    if (!service) {
      return err(new NotFoundError(`Servicio ${id} no encontrado`));
    }
    try {
      service.update(data);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.services.save(service));
  }
}
