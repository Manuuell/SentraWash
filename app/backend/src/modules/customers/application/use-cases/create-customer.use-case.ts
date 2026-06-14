import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { TenantManager } from '../../../../core/tenancy/tenant-manager.service';
import { Customer } from '../../domain/customer';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/customer.repository';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@Injectable()
export class CreateCustomerUseCase implements UseCase<CreateCustomerDto, Customer> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    private readonly tenant: TenantManager,
  ) {}

  async execute(input: CreateCustomerDto): Promise<Result<Customer>> {
    let customer: Customer;
    try {
      customer = Customer.create(this.tenant.tenantId, {
        nombre: input.nombre,
        telefono: input.telefono ?? null,
        email: input.email ?? null,
        documento: input.documento ?? null,
      });
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.customers.save(customer));
  }
}
