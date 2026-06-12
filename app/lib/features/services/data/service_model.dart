import '../domain/service.dart';

class ServiceModel {
  static Service fromJson(Map<String, dynamic> json) => Service(
        id: json['id'] as String,
        nombre: json['nombre'] as String,
        descripcion: json['descripcion'] as String?,
        precio: (json['precio'] as num).toDouble(),
        duracionMin: (json['duracionMin'] as num?)?.toInt(),
        categoria: json['categoria'] as String?,
        activo: (json['activo'] as bool?) ?? true,
      );
}
