import 'payment.dart';

abstract class PaymentRepository {
  /// Registra un pago para una orden. Devuelve el pago creado.
  Future<Payment> register({
    required String workOrderId,
    required String metodo,
    required double monto,
    String? referencia,
  });

  /// Pagos de una orden.
  Future<List<Payment>> listByOrder(String workOrderId);
}
