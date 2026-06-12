import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/vehicle.dart';
import 'vehicle_model.dart';

/// Acceso remoto a la API de vehículos.
class VehicleRemoteDataSource {
  final Dio dio;

  VehicleRemoteDataSource(this.dio);

  Future<List<Vehicle>> list() async {
    try {
      final res = await dio.get('/vehicles');
      return (res.data as List)
          .map((e) => VehicleModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Vehicle> create(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/vehicles', data: body);
      return VehicleModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<Vehicle> update(String id, Map<String, dynamic> body) async {
    try {
      final res = await dio.patch('/vehicles/$id', data: body);
      return VehicleModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
