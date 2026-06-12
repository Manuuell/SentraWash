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
import { CreateVehicleDto } from '../application/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../application/dto/update-vehicle.dto';
import { CreateVehicleUseCase } from '../application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from '../application/use-cases/delete-vehicle.use-case';
import { GetVehicleUseCase } from '../application/use-cases/get-vehicle.use-case';
import { ListVehiclesUseCase } from '../application/use-cases/list-vehicles.use-case';
import { UpdateVehicleUseCase } from '../application/use-cases/update-vehicle.use-case';
import { VehicleResponse } from './vehicle.response';

/**
 * API REST de vehículos. Solo orquesta: delega la lógica a los casos de uso y
 * traduce el Result a HTTP. El tenant se resuelve por el interceptor (RLS).
 */
@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly createVehicle: CreateVehicleUseCase,
    private readonly listVehicles: ListVehiclesUseCase,
    private readonly getVehicle: GetVehicleUseCase,
    private readonly updateVehicle: UpdateVehicleUseCase,
    private readonly deleteVehicle: DeleteVehicleUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateVehicleDto): Promise<VehicleResponse> {
    return VehicleResponse.from(unwrap(await this.createVehicle.execute(dto)));
  }

  @Get()
  async list(): Promise<VehicleResponse[]> {
    return unwrap(await this.listVehicles.execute()).map(VehicleResponse.from);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<VehicleResponse> {
    return VehicleResponse.from(unwrap(await this.getVehicle.execute(id)));
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponse> {
    return VehicleResponse.from(unwrap(await this.updateVehicle.execute({ id, data: dto })));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    unwrap(await this.deleteVehicle.execute(id));
  }
}
