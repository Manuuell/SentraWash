import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/service_remote_data_source.dart';
import '../data/service_repository_impl.dart';
import '../domain/service.dart';
import '../domain/service_repository.dart';

final serviceRepositoryProvider = Provider<ServiceRepository>((ref) {
  return ServiceRepositoryImpl(ServiceRemoteDataSource(ref.watch(dioProvider)));
});

class ServicesController extends AsyncNotifier<List<Service>> {
  @override
  Future<List<Service>> build() => ref.watch(serviceRepositoryProvider).list();

  Future<void> refreshList() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(serviceRepositoryProvider).list());
  }

  Future<void> add({
    required String nombre,
    required double precio,
    int? duracionMin,
    String? categoria,
  }) async {
    await ref.read(serviceRepositoryProvider).create(
          nombre: nombre,
          precio: precio,
          duracionMin: duracionMin,
          categoria: categoria,
        );
    await refreshList();
  }
}

final servicesControllerProvider =
    AsyncNotifierProvider<ServicesController, List<Service>>(ServicesController.new);
