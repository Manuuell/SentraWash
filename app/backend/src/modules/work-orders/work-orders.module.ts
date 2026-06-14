import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { WorkOrdersController } from './presentation/work-orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrderOrmEntity, WorkOrderItemOrmEntity]),
    // Para inyectar los puertos de vehículos y servicios (precio del catálogo).
    VehiclesModule,
    ServicesModule,
  ],
  controllers: [WorkOrdersController],
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
