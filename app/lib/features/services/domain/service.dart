/// Entidad de dominio Servicio (catálogo del lavadero).
class Service {
  final String id;
  final String nombre;
  final String? descripcion;
  final double precio;
  final int? duracionMin;
  final String? categoria;
  final bool activo;

  const Service({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.precio,
    this.duracionMin,
    this.categoria,
    required this.activo,
  });
}
