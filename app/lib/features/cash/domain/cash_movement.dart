/// Movimiento de caja (ingreso/egreso).
class CashMovement {
  final String id;
  final String tipo;
  final String concepto;
  final double monto;

  const CashMovement({
    required this.id,
    required this.tipo,
    required this.concepto,
    required this.monto,
  });
}
