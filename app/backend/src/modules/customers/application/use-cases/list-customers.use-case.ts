import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '../../../../core/common/result';
import { Customer } from '../../domain/customer';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class ListCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(): Promise<Result<Customer[]>> {
    return ok(await this.customers.findAll());
  }
}
