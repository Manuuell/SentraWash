import 'order_item_input.dart';
import 'work_order.dart';

abstract class WorkOrderRepository {
  Future<List<WorkOrder>> list();
  Future<WorkOrder> changeStatus(String id, String estado);
  Future<WorkOrder> create({
    required String vehicleId,
    String? customerId,
    required List<OrderItemInput> items,
    String? fotoKey,
  });
}
