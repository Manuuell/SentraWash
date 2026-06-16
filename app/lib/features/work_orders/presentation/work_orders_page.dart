import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/error/failure.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../../payments/domain/payment.dart';
import '../../payments/presentation/payment_sheet.dart';
import '../../payments/presentation/payments_providers.dart';
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
                const SizedBox(width: AppSpacing.sm),
                _PaymentBadge(order: order),
                const Spacer(),
                if (order.nextStatus != null)
                  FilledButton.tonalIcon(
                    onPressed: () => _advance(context, ref),
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: Text(advanceLabel(order.nextStatus)),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            _PaymentAction(order: order),
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

/// Total pagado (activo) de una orden; 0 mientras carga.
double _paidOf(AsyncValue<List<Payment>> async) => async.maybeWhen(
      data: (pagos) =>
          pagos.where((p) => p.activo).fold<double>(0, (s, p) => s + p.monto),
      orElse: () => 0,
    );

/// Chip de estado de pago junto al total.
class _PaymentBadge extends ConsumerWidget {
  final WorkOrder order;
  const _PaymentBadge({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pagado = _paidOf(ref.watch(orderPaymentsProvider(order.id)));
    if (order.total <= 0) return const SizedBox.shrink();

    if (pagado >= order.total - 0.01) {
      return _chip('Pagado', AppColors.green, Icons.check_circle);
    }
    if (pagado > 0) {
      return _chip('Abono', AppColors.orange, Icons.timelapse);
    }
    return const SizedBox.shrink();
  }

  Widget _chip(String text, Color c, IconData icon) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: c.withValues(alpha: 0.16),
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 13, color: c),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(color: c, fontSize: 11.5, fontWeight: FontWeight.w700)),
        ]),
      );
}

/// Botón de cobro: oculto si la orden ya está pagada.
class _PaymentAction extends ConsumerWidget {
  final WorkOrder order;
  const _PaymentAction({required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pagado = _paidOf(ref.watch(orderPaymentsProvider(order.id)));
    final pendiente = order.total - pagado;
    if (order.total <= 0 || pendiente <= 0.01) return const SizedBox.shrink();

    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => showPaymentSheet(
          context,
          orderId: order.id,
          numeroOrden: order.numeroOrden,
          monto: pendiente,
        ),
        icon: const Icon(Icons.payments_outlined, size: 18),
        label: Text(pagado > 0 ? 'Cobrar saldo ${formatCop(pendiente)}' : 'Registrar pago'),
      ),
    );
  }
}
