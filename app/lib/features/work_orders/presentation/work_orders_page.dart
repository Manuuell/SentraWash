import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/error/failure.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../domain/work_order.dart';
import 'wash_stage.dart';
import 'work_orders_providers.dart';

class WorkOrdersPage extends ConsumerWidget {
  const WorkOrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(workOrdersControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Órdenes de lavado')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/work-orders/new'),
        icon: const Icon(Icons.add),
        label: const Text('Nueva orden'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
        child: orders.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ErrorRetry(
            message: e.toString(),
            onRetry: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
          ),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.receipt_long_outlined,
                message: 'No hay órdenes registradas',
                actionLabel: 'Crear primera orden',
                onAction: () => context.go('/work-orders/new'),
              );
            }
            return ListView.builder(
              padding: EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, MediaQuery.paddingOf(context).bottom + 96),
              itemCount: items.length,
              itemBuilder: (_, i) => Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
                child: _OrderCard(order: items[i]),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  final WorkOrder order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final color = estadoColor(order.estado);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.55);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Orden #${order.numeroOrden}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                const Spacer(),
                // Chip de estado con tinte de color, estilo iOS.
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                  ),
                  child: Text(
                    estadoLabel(order.estado),
                    style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text('${order.items.length} servicio(s)', style: TextStyle(color: faint)),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Text(formatCop(order.total),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const Spacer(),
                if (order.nextStatus != null)
                  FilledButton.tonalIcon(
                    onPressed: () => _advance(context, ref),
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: Text(advanceLabel(order.nextStatus)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _advance(BuildContext context, WidgetRef ref) async {
    try {
      await ref.read(workOrdersControllerProvider.notifier).advance(order);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Theme.of(context).colorScheme.error),
        );
      }
    }
  }
}
