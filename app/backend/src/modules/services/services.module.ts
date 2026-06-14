import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SERVICE_REPOSITORY } from './domain/service.repository';
import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete-service.use-case';
import { GetServiceUseCase } from './application/use-cases/get-service.use-case';
import { ListServicesUseCase } from './application/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { TypeormServiceRepository } from './infrastructure/persistence/typeorm-service.repository';
import { ServiceOrmEntity } from './infrastructure/persistence/service.orm-entity';
import { ServicesController } from './presentation/services.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrmEntity])],
  controllers: [ServicesController],
  providers: [
    CreateServiceUseCase,
    ListServicesUseCase,
    GetServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    { provide: SERVICE_REPOSITORY, useClass: TypeormServiceRepository },
  ],
  exports: [SERVICE_REPOSITORY],
})
export class ServicesModule {}
