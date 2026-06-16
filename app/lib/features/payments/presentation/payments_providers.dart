import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/payment_remote_data_source.dart';
import '../data/payment_repository_impl.dart';
import '../domain/payment.dart';
import '../domain/payment_repository.dart';

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepositoryImpl(PaymentRemoteDataSource(ref.watch(dioProvider)));
});

/// Pagos de una orden (para mostrar el estado pagado/pendiente).
final orderPaymentsProvider = FutureProvider.family<List<Payment>, String>((ref, orderId) {
  return ref.watch(paymentRepositoryProvider).listByOrder(orderId);
});
