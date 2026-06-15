import '../domain/work_order.dart';

class WorkOrderModel {
  static WorkOrder fromJson(Map<String, dynamic> json) => WorkOrder(
        id: json['id'] as String,
        numeroOrden: (json['numeroOrden'] as num).toInt(),
        estado: json['estado'] as String,
        subtotal: (json['subtotal'] as num).toDouble(),
        descuento: (json['descuento'] as num).toDouble(),
        total: (json['total'] as num).toDouble(),
        vehicleId: json['vehicleId'] as String?,
        fotoUrl: json['fotoUrl'] as String?,
        fechaIngreso:
            DateTime.tryParse(json['fechaIngreso']?.toString() ?? '')?.toLocal() ??
                DateTime.now(),
        items: ((json['items'] as List?) ?? const [])
            .map((e) => _itemFromJson(e as Map<String, dynamic>))
            .toList(),
      );

  static WorkOrderItem _itemFromJson(Map<String, dynamic> json) => WorkOrderItem(
        descripcion: (json['descripcion'] ?? '') as String,
        cantidad: (json['cantidad'] as num).toInt(),
        precioUnitario: (json['precioUnitario'] as num).toDouble(),
        subtotal: (json['subtotal'] as num).toDouble(),
      );
}
