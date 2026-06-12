import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { unwrap } from '../../../core/common/unwrap';
import { CreateCustomerDto } from '../application/dto/create-customer.dto';
import { UpdateCustomerDto } from '../application/dto/update-customer.dto';
import { CreateCustomerUseCase } from '../application/use-cases/create-customer.use-case';
import { DeleteCustomerUseCase } from '../application/use-cases/delete-customer.use-case';
import { GetCustomerUseCase } from '../application/use-cases/get-customer.use-case';
import { ListCustomersUseCase } from '../application/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from '../application/use-cases/update-customer.use-case';
import { CustomerResponse } from './customer.response';

@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly listCustomers: ListCustomersUseCase,
    private readonly getCustomer: GetCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly deleteCustomer: DeleteCustomerUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponse> {
    return CustomerResponse.from(unwrap(await this.createCustomer.execute(dto)));
  }

  @Get()
  async list(): Promise<CustomerResponse[]> {
    return unwrap(await this.listCustomers.execute()).map(CustomerResponse.from);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CustomerResponse> {
    return CustomerResponse.from(unwrap(await this.getCustomer.execute(id)));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponse> {
    return CustomerResponse.from(unwrap(await this.updateCustomer.execute({ id, data: dto })));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    unwrap(await this.deleteCustomer.execute(id));
  }
}
