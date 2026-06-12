import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { unwrap } from '../../../core/common/unwrap';
import { RegisterPaymentDto } from '../application/dto/register-payment.dto';
import { GetPaymentUseCase } from '../application/use-cases/get-payment.use-case';
import { ListPaymentsUseCase } from '../application/use-cases/list-payments.use-case';
import { RegisterPaymentUseCase } from '../application/use-cases/register-payment.use-case';
import { VoidPaymentUseCase } from '../application/use-cases/void-payment.use-case';
import { PaymentResponse } from './payment.response';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly registerPayment: RegisterPaymentUseCase,
    private readonly listPayments: ListPaymentsUseCase,
    private readonly getPayment: GetPaymentUseCase,
    private readonly voidPayment: VoidPaymentUseCase,
  ) {}

  @Post()
  async register(@Body() dto: RegisterPaymentDto): Promise<PaymentResponse> {
    return PaymentResponse.from(unwrap(await this.registerPayment.execute(dto)));
  }

  @Get()
  async list(@Query('workOrderId') workOrderId?: string): Promise<PaymentResponse[]> {
    return unwrap(await this.listPayments.execute(workOrderId)).map(PaymentResponse.from);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponse> {
    return PaymentResponse.from(unwrap(await this.getPayment.execute(id)));
  }

  @Post(':id/void')
  async void(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentResponse> {
    return PaymentResponse.from(unwrap(await this.voidPayment.execute(id)));
  }
}
