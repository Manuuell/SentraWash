import '../domain/payment.dart';
import '../domain/payment_repository.dart';
import 'payment_remote_data_source.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentRemoteDataSource remote;

  PaymentRepositoryImpl(this.remote);

  @override
  Future<Payment> register({
    required String workOrderId,
    required String metodo,
    required double monto,
    String? referencia,
  }) {
    return remote.register({
      'workOrderId': workOrderId,
      'metodo': metodo,
      'monto': monto,
      if (referencia != null && referencia.isNotEmpty) 'referencia': referencia,
    });
  }

  @override
  Future<List<Payment>> listByOrder(String workOrderId) => remote.listByOrder(workOrderId);
}
