import '../domain/service.dart';
import '../domain/service_repository.dart';
import 'service_remote_data_source.dart';

class ServiceRepositoryImpl implements ServiceRepository {
  final ServiceRemoteDataSource remote;

  ServiceRepositoryImpl(this.remote);

  @override
  Future<List<Service>> list() => remote.list();

  @override
  Future<Service> create({
    required String nombre,
    required double precio,
    int? duracionMin,
    String? categoria,
  }) {
    return remote.create({
      'nombre': nombre,
      'precio': precio,
      if (duracionMin != null) 'duracionMin': duracionMin,
      if (categoria != null && categoria.isNotEmpty) 'categoria': categoria,
    });
  }
}
