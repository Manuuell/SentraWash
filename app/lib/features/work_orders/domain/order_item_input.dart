/// Ítem de entrada al crear una orden (servicio + cantidad).
class OrderItemInput {
  final String serviceId;
  final String nombre;
  final double precioUnitario;
  final int cantidad;

  const OrderItemInput({
    required this.serviceId,
    required this.nombre,
    required this.precioUnitario,
    required this.cantidad,
  });

  double get subtotal => precioUnitario * cantidad;

  OrderItemInput copyWith({int? cantidad}) => OrderItemInput(
        serviceId: serviceId,
        nombre: nombre,
        precioUnitario: precioUnitario,
        cantidad: cantidad ?? this.cantidad,
      );
}
