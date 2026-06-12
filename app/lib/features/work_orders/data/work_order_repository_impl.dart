import '../domain/order_item_input.dart';
import '../domain/work_order.dart';
import '../domain/work_order_repository.dart';
import 'work_order_remote_data_source.dart';

class WorkOrderRepositoryImpl implements WorkOrderRepository {
  final WorkOrderRemoteDataSource remote;

  WorkOrderRepositoryImpl(this.remote);

  @override
  Future<List<WorkOrder>> list() => remote.list();

  @override
  Future<WorkOrder> changeStatus(String id, String estado) =>
      remote.changeStatus(id, estado);

  @override
  Future<WorkOrder> create({
    required String vehicleId,
    String? customerId,
    required List<OrderItemInput> items,
  }) {
    return remote.create({
      'vehicleId': vehicleId,
      if (customerId != null) 'customerId': customerId,
      'items': items
          .map((i) => {'serviceId': i.serviceId, 'cantidad': i.cantidad})
          .toList(),
    });
  }
}
