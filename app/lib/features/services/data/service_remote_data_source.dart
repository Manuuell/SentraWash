import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/service.dart';
import 'service_model.dart';

class ServiceRemoteDataSource {
  final Dio dio;

  ServiceRemoteDataSource(this.dio);

  Future<List<Service>> list() async {
    try {
      final res = await dio.get('/services');
      return (res.data as List)
          .map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Service> create(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/services', data: body);
      return ServiceModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
