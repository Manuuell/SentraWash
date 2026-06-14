import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUSTOMER_REPOSITORY } from './domain/customer.repository';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { TypeormCustomerRepository } from './infrastructure/persistence/typeorm-customer.repository';
import { CustomerOrmEntity } from './infrastructure/persistence/customer.orm-entity';
import { CustomersController } from './presentation/customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomersController],
  providers: [
    CreateCustomerUseCase,
    ListCustomersUseCase,
    GetCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    { provide: CUSTOMER_REPOSITORY, useClass: TypeormCustomerRepository },
  ],
  exports: [CUSTOMER_REPOSITORY],
})
export class CustomersModule {}
