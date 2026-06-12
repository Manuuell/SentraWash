import '../domain/vehicle.dart';
import '../domain/vehicle_repository.dart';
import 'vehicle_remote_data_source.dart';

class VehicleRepositoryImpl implements VehicleRepository {
  final VehicleRemoteDataSource remote;

  VehicleRepositoryImpl(this.remote);

  @override
  Future<List<Vehicle>> list() => remote.list();

  @override
  Future<Vehicle> create({
    required String placa,
    required String tipo,
    String? marca,
    String? color,
  }) {
    return remote.create({
      'placa': placa,
      'tipo': tipo,
      if (marca != null && marca.isNotEmpty) 'marca': marca,
      if (color != null && color.isNotEmpty) 'color': color,
    });
  }
}
