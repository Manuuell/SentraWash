import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/customer.dart';
import 'customer_model.dart';

class CustomerRemoteDataSource {
  final Dio dio;

  CustomerRemoteDataSource(this.dio);

  Future<List<Customer>> list() async {
    try {
      final res = await dio.get('/customers');
      return (res.data as List)
          .map((e) => CustomerModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Customer> create(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/customers', data: body);
      return CustomerModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
