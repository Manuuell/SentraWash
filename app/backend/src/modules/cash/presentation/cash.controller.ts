import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { unwrap } from '../../../core/common/unwrap';
import { CloseCashSessionDto } from '../application/dto/close-cash-session.dto';
import { OpenCashSessionDto } from '../application/dto/open-cash-session.dto';
import { RegisterCashMovementDto } from '../application/dto/register-cash-movement.dto';
import { CloseCashSessionUseCase } from '../application/use-cases/close-cash-session.use-case';
import { GetCashSessionUseCase } from '../application/use-cases/get-cash-session.use-case';
import { GetCurrentCashSessionUseCase } from '../application/use-cases/get-current-cash-session.use-case';
import { ListCashSessionsUseCase } from '../application/use-cases/list-cash-sessions.use-case';
import { OpenCashSessionUseCase } from '../application/use-cases/open-cash-session.use-case';
import { RegisterCashMovementUseCase } from '../application/use-cases/register-cash-movement.use-case';
import { CashMovementResponse } from './cash-movement.response';
import { CashSessionDetailResponse } from './cash-session-detail.response';
import { CashSessionResponse } from './cash-session.response';

@Controller('cash')
export class CashController {
  constructor(
    private readonly openSession: OpenCashSessionUseCase,
    private readonly closeSession: CloseCashSessionUseCase,
    private readonly registerMovement: RegisterCashMovementUseCase,
    private readonly getCurrent: GetCurrentCashSessionUseCase,
    private readonly getSession: GetCashSessionUseCase,
    private readonly listSessions: ListCashSessionsUseCase,
  ) {}

  @Post('sessions/open')
  async open(@Body() dto: OpenCashSessionDto): Promise<CashSessionResponse> {
    return CashSessionResponse.from(unwrap(await this.openSession.execute(dto)));
  }

  @Post('sessions/close')
  async close(@Body() dto: CloseCashSessionDto): Promise<CashSessionResponse> {
    return CashSessionResponse.from(unwrap(await this.closeSession.execute(dto)));
  }

  @Get('sessions/current')
  async current(): Promise<CashSessionDetailResponse | null> {
    const detail = unwrap(await this.getCurrent.execute());
    return detail ? CashSessionDetailResponse.fromDetail(detail) : null;
  }

  @Get('sessions')
  async list(): Promise<CashSessionResponse[]> {
    return unwrap(await this.listSessions.execute()).map(CashSessionResponse.from);
  }

  @Get('sessions/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CashSessionDetailResponse> {
    return CashSessionDetailResponse.fromDetail(unwrap(await this.getSession.execute(id)));
  }

  @Post('movements')
  async movement(@Body() dto: RegisterCashMovementDto): Promise<CashMovementResponse> {
    return CashMovementResponse.from(unwrap(await this.registerMovement.execute(dto)));
  }
}
