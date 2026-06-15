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
  final String? vehicleId;
  final DateTime fechaIngreso;

  /// URL prefirmada (temporal) de la foto del vehículo, o null si no tiene.
  final String? fotoUrl;

  const WorkOrder({
    required this.id,
    required this.numeroOrden,
    required this.estado,
    required this.subtotal,
    required this.descuento,
    required this.total,
    required this.items,
    required this.fechaIngreso,
    this.vehicleId,
    this.fotoUrl,
  });

  /// Próximo estado en el flujo, o null si es terminal.
  /// recibido → en_proceso → secado → listo → entregado.
  String? get nextStatus => switch (estado) {
        'recibido' => 'en_proceso',
        'en_proceso' => 'secado',
        'secado' => 'listo',
        'listo' => 'entregado',
        _ => null,
      };

  /// Copia con el estado cambiado (para actualización optimista en la UI).
  WorkOrder copyWith({String? estado}) => WorkOrder(
        id: id,
        numeroOrden: numeroOrden,
        estado: estado ?? this.estado,
        subtotal: subtotal,
        descuento: descuento,
        total: total,
        items: items,
        fechaIngreso: fechaIngreso,
        vehicleId: vehicleId,
        fotoUrl: fotoUrl,
      );
}
