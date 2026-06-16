import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../../core/storage/storage.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { ServicesModule } from '../services/services.module';
import { WORK_ORDER_REPOSITORY } from './domain/work-order.repository';
import { ChangeWorkOrderStatusUseCase } from './application/use-cases/change-work-order-status.use-case';
import { CreateWorkOrderUseCase } from './application/use-cases/create-work-order.use-case';
import { DeleteWorkOrderUseCase } from './application/use-cases/delete-work-order.use-case';
import { GetWorkOrderUseCase } from './application/use-cases/get-work-order.use-case';
import { ListWorkOrdersUseCase } from './application/use-cases/list-work-orders.use-case';
import { TypeormWorkOrderRepository } from './infrastructure/persistence/typeorm-work-order.repository';
import { WorkOrderItemOrmEntity } from './infrastructure/persistence/work-order-item.orm-entity';
import { WorkOrderOrmEntity } from './infrastructure/persistence/work-order.orm-entity';
import { TrackingController } from './presentation/tracking.controller';
import { WorkOrdersController } from './presentation/work-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrderOrmEntity, WorkOrderItemOrmEntity]),
    // Para inyectar los puertos de vehículos y servicios (precio del catálogo).
    VehiclesModule,
    ServicesModule,
    // Para firmar URLs de lectura de las fotos en las respuestas.
    StorageModule,
  ],
  controllers: [WorkOrdersController, TrackingController],
  providers: [
    CreateWorkOrderUseCase,
    ListWorkOrdersUseCase,
    GetWorkOrderUseCase,
    ChangeWorkOrderStatusUseCase,
    DeleteWorkOrderUseCase,
    { provide: WORK_ORDER_REPOSITORY, useClass: TypeormWorkOrderRepository },
  ],
  exports: [WORK_ORDER_REPOSITORY],
})
export class WorkOrdersModule {}
