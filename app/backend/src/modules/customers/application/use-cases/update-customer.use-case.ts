import { Inject, Injectable } from '@nestjs/common';
import { DomainError, NotFoundError } from '../../../../core/common/domain-error';
import { err, ok, Result } from '../../../../core/common/result';
import { UseCase } from '../../../../core/common/use-case';
import { Customer } from '../../domain/customer';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../../domain/customer.repository';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

export interface UpdateCustomerInput {
  id: string;
  data: UpdateCustomerDto;
}

@Injectable()
export class UpdateCustomerUseCase implements UseCase<UpdateCustomerInput, Customer> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async execute({ id, data }: UpdateCustomerInput): Promise<Result<Customer>> {
    const customer = await this.customers.findById(id);
    if (!customer) {
      return err(new NotFoundError(`Cliente ${id} no encontrado`));
    }
    try {
      customer.update(data);
    } catch (error) {
      if (error instanceof DomainError) return err(error);
      throw error;
    }
    return ok(await this.customers.save(customer));
  }
}
