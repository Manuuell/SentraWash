import 'service.dart';

abstract class ServiceRepository {
  Future<List<Service>> list();
  Future<Service> create({
    required String nombre,
    required double precio,
    int? duracionMin,
    String? categoria,
  });
}
