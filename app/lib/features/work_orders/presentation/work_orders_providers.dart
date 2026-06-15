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

  /// Avanza la orden al siguiente estado con actualización **optimista**: la UI
  /// refleja el cambio de inmediato y, si el servidor falla, se revierte.
  Future<void> advance(WorkOrder order) async {
    final next = order.nextStatus;
    if (next == null) return;

    final previous = state;
    final list = state.value;
    if (list != null) {
      state = AsyncData([
        for (final o in list) o.id == order.id ? o.copyWith(estado: next) : o,
      ]);
    }

    try {
      await ref.read(workOrderRepositoryProvider).changeStatus(order.id, next);
    } catch (e) {
      state = previous; // revierte el cambio optimista
      rethrow;
    }
  }

  Future<void> create({
    required String vehicleId,
    String? customerId,
    required List<OrderItemInput> items,
    String? fotoKey,
  }) async {
    await ref.read(workOrderRepositoryProvider).create(
          vehicleId: vehicleId,
          customerId: customerId,
          items: items,
          fotoKey: fotoKey,
        );
    await refreshList();
  }
}

final workOrdersControllerProvider =
    AsyncNotifierProvider<WorkOrdersController, List<WorkOrder>>(WorkOrdersController.new);
