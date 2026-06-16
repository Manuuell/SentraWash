/// Entidad de dominio Pago de una orden.
class Payment {
  final String id;
  final String? workOrderId;
  final String metodo; // efectivo, nequi, daviplata, tarjeta, transferencia
  final double monto;
  final String estado; // pendiente, pagado, anulado
  final String? referencia;
  final DateTime fechaPago;

  const Payment({
    required this.id,
    required this.workOrderId,
    required this.metodo,
    required this.monto,
    required this.estado,
    required this.referencia,
    required this.fechaPago,
  });

  bool get activo => estado != 'anulado';
}
