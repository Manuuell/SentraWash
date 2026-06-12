import '../domain/vehicle.dart';

/// Mapeo JSON ↔ entidad de dominio (capa de datos).
class VehicleModel {
  static Vehicle fromJson(Map<String, dynamic> json) => Vehicle(
        id: json['id'] as String,
        placa: json['placa'] as String,
        tipo: json['tipo'] as String,
        marca: json['marca'] as String?,
        modelo: json['modelo'] as String?,
        color: json['color'] as String?,
      );
}
