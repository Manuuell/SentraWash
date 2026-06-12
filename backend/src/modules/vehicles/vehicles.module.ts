import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VEHICLE_REPOSITORY } from './domain/vehicle.repository';
import { CreateVehicleUseCase } from './application/use-cases/create-vehicle.use-case';
import { DeleteVehicleUseCase } from './application/use-cases/delete-vehicle.use-case';
import { GetVehicleUseCase } from './application/use-cases/get-vehicle.use-case';
import { ListVehiclesUseCase } from './application/use-cases/list-vehicles.use-case';
import { UpdateVehicleUseCase } from './application/use-cases/update-vehicle.use-case';
import { TypeormVehicleRepository } from './infrastructure/persistence/typeorm-vehicle.repository';
import { VehicleOrmEntity } from './infrastructure/persistence/vehicle.orm-entity';
import { VehiclesController } from './presentation/vehicles.controller';

/**
 * Módulo de vehículos. La inversión de dependencias se materializa aquí:
 * el token VEHICLE_REPOSITORY (dominio) se enlaza al adaptador TypeORM.
 */
@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrmEntity])],
  controllers: [VehiclesController],
  providers: [
    CreateVehicleUseCase,
    ListVehiclesUseCase,
    GetVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    { provide: VEHICLE_REPOSITORY, useClass: TypeormVehicleRepository },
  ],
  exports: [VEHICLE_REPOSITORY],
})
export class VehiclesModule {}
