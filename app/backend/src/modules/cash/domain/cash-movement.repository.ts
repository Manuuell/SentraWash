import { CashMovement } from './cash-movement';

export interface CashMovementRepository {
  save(movement: CashMovement): Promise<CashMovement>;
  findBySession(cashSessionId: string): Promise<CashMovement[]>;
}

export const CASH_MOVEMENT_REPOSITORY = Symbol('CASH_MOVEMENT_REPOSITORY');
