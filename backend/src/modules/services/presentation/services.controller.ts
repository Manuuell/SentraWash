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
import { CreateServiceDto } from '../application/dto/create-service.dto';
import { UpdateServiceDto } from '../application/dto/update-service.dto';
import { CreateServiceUseCase } from '../application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from '../application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from '../application/use-cases/get-service.use-case';
import { ListServicesUseCase } from '../application/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from '../application/use-cases/update-service.use-case';
import { ServiceResponse } from './service.response';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly listServices: ListServicesUseCase,
    private readonly getService: GetServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly deleteService: DeleteServiceUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateServiceDto): Promise<ServiceResponse> {
    return ServiceResponse.from(unwrap(await this.createService.execute(dto)));
  }

  @Get()
  async list(): Promise<ServiceResponse[]> {
    return unwrap(await this.listServices.execute()).map(ServiceResponse.from);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ServiceResponse> {
    return ServiceResponse.from(unwrap(await this.getService.execute(id)));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponse> {
    return ServiceResponse.from(unwrap(await this.updateService.execute({ id, data: dto })));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    unwrap(await this.deleteService.execute(id));
  }
}
