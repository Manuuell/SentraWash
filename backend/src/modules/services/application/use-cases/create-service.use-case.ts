import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Service } from '../../domain/service';
import { SERVICE_REPOSITORY, ServiceRepository } from '../../domain/service.repository';
import { CreateServiceDto } from '../dto/create-service.dto';

@Injectable()
export class CreateServiceUseCase implements UseCase<CreateServiceDto, Service> {
  constructor(
    @Inject(SERVICE_REPOSITORY) private readonly services: ServiceRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: CreateServiceDto): Promise<Result<Service>> {
    let service: Service;
    try {
      service = Service.create(this.tenant.tenantId, {
        nombre: input.nombre,
        descripcion: input.descripcion ?? null,
        precio: input.precio,
        duracionMin: input.duracionMin ?? null,
        categoria: input.categoria ?? null,
        activo: input.activo ?? true,
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.services.save(service));
  }
}
