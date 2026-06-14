import { CashMovement } from '../domain/cash-movement';
import { CashSession } from '../domain/cash-session';

/** Sesión de caja junto con su lista de movimientos (vista de arqueo). */
export interface CashSessionDetail {
  session: CashSession;
  movements: CashMovement[];
}
