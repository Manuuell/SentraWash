import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Customer } from '../../domain/customer';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class GetCustomerUseCase implements UseCase<string, Customer> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(id: string): Promise<Result<Customer>> {
    const customer = await this.customers.findById(id);
    if (!customer) {
      return err(new NotFoundError(`Cliente ${id} no encontrado`));
    }
    return ok(customer);
  }
}
