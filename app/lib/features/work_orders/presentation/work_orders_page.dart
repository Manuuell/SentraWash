import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/error/failure.dart';
import '../../../core/widgets/empty_state.dart';
import '../domain/work_order.dart';
import 'work_orders_providers.dart';

final _cop = NumberFormat.currency(locale: 'es_CO', symbol: r'$', decimalDigits: 0);

const _estadoColors = {
  'recibido': Colors.blueGrey,
  'en_proceso': Colors.orange,
  'listo': Colors.green,
  'entregado': Colors.teal,
  'cancelado': Colors.red,
};

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
          error: (e, _) => ListView(children: [
            const SizedBox(height: 100),
            const Icon(Icons.error_outline, size: 56, color: Colors.red),
            const SizedBox(height: 12),
            Center(child: Text(e.toString(), textAlign: TextAlign.center)),
            const SizedBox(height: 12),
            Center(
              child: FilledButton(
                onPressed: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
                child: const Text('Reintentar'),
              ),
            ),
          ]),
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
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              itemBuilder: (_, i) => _OrderCard(order: items[i]),
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
    final color = _estadoColors[order.estado] ?? Colors.grey;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('Orden #${order.numeroOrden}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const Spacer(),
                Chip(
                  label: Text(order.estado, style: const TextStyle(color: Colors.white, fontSize: 12)),
                  backgroundColor: color,
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text('${order.items.length} servicio(s)', style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 8),
            Row(
              children: [
                Text(_cop.format(order.total),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                const Spacer(),
                if (order.nextStatus != null)
                  FilledButton.tonalIcon(
                    onPressed: () => _advance(context, ref),
                    icon: const Icon(Icons.arrow_forward, size: 18),
                    label: Text('A ${order.nextStatus}'),
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
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Colors.red),
        );
      }
    }
  }
}
