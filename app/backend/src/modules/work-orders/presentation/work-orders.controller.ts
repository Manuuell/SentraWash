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
import { StorageService } from '../../../core/storage/storage.service';
import { WorkOrder } from '../domain/work-order';
import { ChangeStatusDto } from '../application/dto/change-status.dto';
import { CreateWorkOrderDto } from '../application/dto/create-work-order.dto';
import { ChangeWorkOrderStatusUseCase } from '../application/use-cases/change-work-order-status.use-case';
import { CreateWorkOrderUseCase } from '../application/use-cases/create-work-order.use-case';
import { DeleteWorkOrderUseCase } from '../application/use-cases/delete-work-order.use-case';
import { GetWorkOrderUseCase } from '../application/use-cases/get-work-order.use-case';
import { ListWorkOrdersUseCase } from '../application/use-cases/list-work-orders.use-case';
import { WorkOrderResponse } from './work-order.response';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(
    private readonly createWorkOrder: CreateWorkOrderUseCase,
    private readonly listWorkOrders: ListWorkOrdersUseCase,
    private readonly getWorkOrder: GetWorkOrderUseCase,
    private readonly changeStatus: ChangeWorkOrderStatusUseCase,
    private readonly deleteWorkOrder: DeleteWorkOrderUseCase,
    private readonly storage: StorageService,
  ) {}

  /** Construye la respuesta firmando una URL temporal para la foto (si la hay). */
  private async toResponse(order: WorkOrder): Promise<WorkOrderResponse> {
    const fotoUrl = await this.storage.presignDownload(order.toPrimitives().fotoKey);
    return WorkOrderResponse.from(order, fotoUrl);
  }

  @Post()
  async create(@Body() dto: CreateWorkOrderDto): Promise<WorkOrderResponse> {
    return this.toResponse(unwrap(await this.createWorkOrder.execute(dto)));
  }

  @Get()
  async list(): Promise<WorkOrderResponse[]> {
    const orders = unwrap(await this.listWorkOrders.execute());
    return Promise.all(orders.map((o) => this.toResponse(o)));
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WorkOrderResponse> {
    return this.toResponse(unwrap(await this.getWorkOrder.execute(id)));
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ): Promise<WorkOrderResponse> {
    return this.toResponse(unwrap(await this.changeStatus.execute({ id, estado: dto.estado })));
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    unwrap(await this.deleteWorkOrder.execute(id));
  }
}
