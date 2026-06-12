import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/customer.repository';

@Injectable()
export class DeleteCustomerUseCase implements UseCase<string, void> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute(id: string): Promise<Result<void>> {
    const customer = await this.customers.findById(id);
    if (!customer) {
      return err(new NotFoundError(`Cliente ${id} no encontrado`));
    }
    await this.customers.delete(id);
    return ok(undefined);
  }
}
