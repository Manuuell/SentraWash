import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/vehicle_remote_data_source.dart';
import '../data/vehicle_repository_impl.dart';
import '../domain/vehicle.dart';
import '../domain/vehicle_repository.dart';

/// Inversión de dependencias: el puerto se enlaza al adaptador (Dio).
final vehicleRepositoryProvider = Provider<VehicleRepository>((ref) {
  return VehicleRepositoryImpl(VehicleRemoteDataSource(ref.watch(dioProvider)));
});

/// Estado de la lista de vehículos.
class VehiclesController extends AsyncNotifier<List<Vehicle>> {
  @override
  Future<List<Vehicle>> build() => ref.watch(vehicleRepositoryProvider).list();

  Future<void> refreshList() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(vehicleRepositoryProvider).list());
  }

  Future<void> add({
    required String placa,
    required String tipo,
    String? marca,
    String? color,
  }) async {
    await ref
        .read(vehicleRepositoryProvider)
        .create(placa: placa, tipo: tipo, marca: marca, color: color);
    await refreshList();
  }
}

final vehiclesControllerProvider =
    AsyncNotifierProvider<VehiclesController, List<Vehicle>>(VehiclesController.new);
