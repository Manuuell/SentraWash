import '../domain/payment.dart';

class PaymentModel {
  static Payment fromJson(Map<String, dynamic> json) => Payment(
        id: json['id'] as String,
        workOrderId: json['workOrderId'] as String?,
        metodo: json['metodo'] as String,
        monto: (json['monto'] as num).toDouble(),
        estado: json['estado'] as String,
        referencia: json['referencia'] as String?,
        fechaPago:
            DateTime.tryParse(json['fechaPago']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      );
}
