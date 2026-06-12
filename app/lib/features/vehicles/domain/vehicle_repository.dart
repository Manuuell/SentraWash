import 'vehicle.dart';

/// Puerto del repositorio de vehículos (la presentación depende de esta abstracción).
abstract class VehicleRepository {
  Future<List<Vehicle>> list();
  Future<Vehicle> create({
    required String placa,
    required String tipo,
    String? marca,
    String? color,
  });
}
