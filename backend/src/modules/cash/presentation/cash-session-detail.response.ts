import { CashSessionDetail } from '../application/cash-session-detail';
import { CashMovementResponse } from './cash-movement.response';
import { CashSessionResponse } from './cash-session.response';

export class CashSessionDetailResponse extends CashSessionResponse {
  movements!: CashMovementResponse[];

  static fromDetail(detail: CashSessionDetail): CashSessionDetailResponse {
    return {
      ...CashSessionResponse.from(detail.session),
      movements: detail.movements.map(CashMovementResponse.from),
    };
  }
}
