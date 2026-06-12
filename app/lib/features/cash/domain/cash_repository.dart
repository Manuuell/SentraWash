import 'cash_movement.dart';
import 'cash_session.dart';

/// Sesión de caja actual con sus movimientos.
class CashSessionDetail {
  final CashSession session;
  final List<CashMovement> movements;

  const CashSessionDetail({required this.session, required this.movements});
}

abstract class CashRepository {
  /// Caja abierta actual, o null si no hay ninguna.
  Future<CashSessionDetail?> getCurrent();
  Future<void> open(double baseInicial);
  Future<void> close(double saldoReal);
  Future<void> registerMovement({
    required String tipo,
    required String concepto,
    required double monto,
  });
}
