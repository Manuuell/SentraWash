import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/work_order_remote_data_source.dart';
import '../data/work_order_repository_impl.dart';
import '../domain/order_item_input.dart';
import '../domain/work_order.dart';
import '../domain/work_order_repository.dart';

final workOrderRepositoryProvider = Provider<WorkOrderRepository>((ref) {
  return WorkOrderRepositoryImpl(WorkOrderRemoteDataSource(ref.watch(dioProvider)));
});

class WorkOrdersController extends AsyncNotifier<List<WorkOrder>> {
  @override
  Future<List<WorkOrder>> build() => ref.watch(workOrderRepositoryProvider).list();

  Future<void> refreshList() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(workOrderRepositoryProvider).list());
  }

  Future<void> advance(WorkOrder order) async {
    final next = order.nextStatus;
    if (next == null) return;
    await ref.read(workOrderRepositoryProvider).changeStatus(order.id, next);
    await refreshList();
  }

  Future<void> create({
    required String vehicleId,
    String? customerId,
    required List<OrderItemInput> items,
  }) async {
    await ref.read(workOrderRepositoryProvider).create(
          vehicleId: vehicleId,
          customerId: customerId,
          items: items,
        );
    await refreshList();
  }
}

final workOrdersControllerProvider =
    AsyncNotifierProvider<WorkOrdersController, List<WorkOrder>>(WorkOrdersController.new);
