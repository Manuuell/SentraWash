import { CashSession } from './cash-session';

export interface CashSessionRepository {
  /** La sesión abierta del tenant (a lo sumo una), o null. */
  findOpen(): Promise<CashSession | null>;
  findById(id: string): Promise<CashSession | null>;
  findAll(): Promise<CashSession[]>;
  save(session: CashSession): Promise<CashSession>;
}

export const CASH_SESSION_REPOSITORY = Symbol('CASH_SESSION_REPOSITORY');
