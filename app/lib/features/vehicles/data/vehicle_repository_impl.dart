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
    String? modelo,
    String? color,
    String? customerId,
  }) {
    return remote.create({
      'placa': placa,
      'tipo': tipo,
      if (marca != null && marca.isNotEmpty) 'marca': marca,
      if (modelo != null && modelo.isNotEmpty) 'modelo': modelo,
      if (color != null && color.isNotEmpty) 'color': color,
      if (customerId != null && customerId.isNotEmpty) 'customerId': customerId,
    });
  }

  @override
  Future<Vehicle> linkCustomer(String vehicleId, String customerId) =>
      remote.update(vehicleId, {'customerId': customerId});
}
