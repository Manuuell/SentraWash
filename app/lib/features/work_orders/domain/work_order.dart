/// Ítem (servicio) dentro de una orden.
class WorkOrderItem {
  final String descripcion;
  final int cantidad;
  final double precioUnitario;
  final double subtotal;

  const WorkOrderItem({
    required this.descripcion,
    required this.cantidad,
    required this.precioUnitario,
    required this.subtotal,
  });
}

/// Entidad de dominio Orden de lavado.
class WorkOrder {
  final String id;
  final int numeroOrden;
  final String estado;
  final double subtotal;
  final double descuento;
  final double total;
  final List<WorkOrderItem> items;

  const WorkOrder({
    required this.id,
    required this.numeroOrden,
    required this.estado,
    required this.subtotal,
    required this.descuento,
    required this.total,
    required this.items,
  });

  /// Próximo estado en el flujo, o null si es terminal.
  String? get nextStatus => switch (estado) {
        'recibido' => 'en_proceso',
        'en_proceso' => 'listo',
        'listo' => 'entregado',
        _ => null,
      };
}
