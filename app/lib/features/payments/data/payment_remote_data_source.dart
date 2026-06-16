import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/payment.dart';
import 'payment_model.dart';

class PaymentRemoteDataSource {
  final Dio dio;

  PaymentRemoteDataSource(this.dio);

  Future<Payment> register(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/payments', data: body);
      return PaymentModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<List<Payment>> listByOrder(String workOrderId) async {
    try {
      final res = await dio.get('/payments', queryParameters: {'workOrderId': workOrderId});
      return (res.data as List)
          .map((e) => PaymentModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
