/// Entidad de dominio Vehículo (pura, sin dependencias de framework).
class Vehicle {
  final String id;
  final String placa;
  final String tipo;
  final String? marca;
  final String? modelo;
  final String? color;
  final String? customerId;

  const Vehicle({
    required this.id,
    required this.placa,
    required this.tipo,
    this.marca,
    this.modelo,
    this.color,
    this.customerId,
  });
}
