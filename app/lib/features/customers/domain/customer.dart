/// Entidad de dominio Cliente.
class Customer {
  final String id;
  final String nombre;
  final String? telefono;
  final String? email;
  final String? documento;

  const Customer({
    required this.id,
    required this.nombre,
    this.telefono,
    this.email,
    this.documento,
  });
}
