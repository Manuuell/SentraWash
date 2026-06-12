/// Entidad de dominio Sesión de caja.
class CashSession {
  final String id;
  final String estado;
  final double baseInicial;
  final double totalIngresos;
  final double totalEgresos;
  final double saldoEsperado;
  final double? saldoReal;
  final double? diferencia;

  const CashSession({
    required this.id,
    required this.estado,
    required this.baseInicial,
    required this.totalIngresos,
    required this.totalEgresos,
    required this.saldoEsperado,
    this.saldoReal,
    this.diferencia,
  });
}
