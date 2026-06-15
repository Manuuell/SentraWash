import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/error/failure.dart';
import '../../../../core/utils/format.dart';
import '../../../work_orders/domain/work_order.dart';
import '../../../work_orders/presentation/wash_stage.dart';
import '../../../work_orders/presentation/work_orders_providers.dart';

/// Tablero Kanban operativo. Es responsivo:
///  - Pantalla ancha (≥900px): 4 columnas lado a lado, cada una con scroll propio.
///  - Móvil: las 4 etapas se **apilan verticalmente** en un único scroll (sin
///    desplazamiento horizontal).
class KanbanBoard extends StatelessWidget {
  final List<WorkOrder> orders;
  final Map<String, String> plates;
  const KanbanBoard({super.key, required this.orders, required this.plates});

  @override
  Widget build(BuildContext context) {
    final byStage = <String, List<WorkOrder>>{
      for (final s in kanbanStages)
        s.estado: orders.where((o) => o.estado == s.estado).toList()
          ..sort((a, b) => a.fechaIngreso.compareTo(b.fechaIngreso)),
    };

    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 900;

        if (wide) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              children: [
                for (final s in kanbanStages)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: _KanbanColumn(
                        stage: s,
                        orders: byStage[s.estado]!,
                        plates: plates,
                        scrollable: true,
                      ),
                    ),
                  ),
              ],
            ),
          );
        }

        // Móvil: columnas apiladas en un solo scroll vertical. El padding
        // inferior libera la barra de navegación translúcida (extendBody).
        return ListView(
          padding: EdgeInsets.fromLTRB(12, 0, 12, MediaQuery.paddingOf(context).bottom + 84),
          children: [
            for (final s in kanbanStages)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _KanbanColumn(
                  stage: s,
                  orders: byStage[s.estado]!,
                  plates: plates,
                  scrollable: false,
                ),
              ),
          ],
        );
      },
    );
  }
}

class _KanbanColumn extends StatelessWidget {
  final WashStage stage;
  final List<WorkOrder> orders;
  final Map<String, String> plates;

  /// `true` en pantalla ancha (columna de altura fija con scroll interno);
  /// `false` apilada en móvil (se ajusta a su contenido).
  final bool scrollable;

  const _KanbanColumn({
    required this.stage,
    required this.orders,
    required this.plates,
    required this.scrollable,
  });

  @override
  Widget build(BuildContext context) {
    final body = Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(14)),
      ),
      child: _content(),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: scrollable ? MainAxisSize.max : MainAxisSize.min,
      children: [
        _header(stage),
        // Ancho: la columna llena el alto disponible. Apilada: se ajusta.
        scrollable ? Expanded(child: body) : body,
      ],
    );
  }

  Widget _content() {
    if (orders.isEmpty) {
      return Container(
        constraints: const BoxConstraints(minHeight: 72),
        alignment: Alignment.center,
        child: Text('Sin vehículos', style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
      );
    }
    if (scrollable) {
      return ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: orders.length,
        itemBuilder: (_, i) => _OrderKanbanCard(
          order: orders[i],
          placa: plates[orders[i].vehicleId] ?? '—',
        ),
      );
    }
    // Apilada: lista no scrolleable (la página entera hace el scroll).
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Column(
        children: [
          for (final o in orders)
            _OrderKanbanCard(order: o, placa: plates[o.vehicleId] ?? '—'),
        ],
      ),
    );
  }

  Widget _header(WashStage stage) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: stage.color.withValues(alpha: 0.15),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
        border: Border(top: BorderSide(color: stage.color, width: 4)),
      ),
      child: Row(
        children: [
          Icon(stage.icon, color: stage.color, size: 18),
          const SizedBox(width: 8),
          Text(
            stage.label,
            style: TextStyle(color: stage.color, fontWeight: FontWeight.w800, fontSize: 15),
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: stage.color,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '${orders.length}',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}

/// Tarjeta de una orden dentro del Kanban: placa, tiempo transcurrido, total y
/// botón de avance de un toque al siguiente estado.
class _OrderKanbanCard extends ConsumerWidget {
  final WorkOrder order;
  final String placa;
  const _OrderKanbanCard({required this.order, required this.placa});

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

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final color = estadoColor(order.estado);
    final mins = DateTime.now().difference(order.fechaIngreso).inMinutes;
    final alert = mins >= 30; // resalta esperas largas
    final next = order.nextStatus;

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: color, width: 5)),
        ),
        padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Foto del vehículo (si se capturó al ingreso).
            if (order.fotoUrl != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  order.fotoUrl!,
                  height: 96,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
              const SizedBox(height: 8),
            ],
            Row(
              children: [
                Text(placa, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                const Spacer(),
                _ElapsedChip(since: order.fechaIngreso, alert: alert),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              'Orden #${order.numeroOrden} · ${order.items.length} serv.',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
            ),
            const SizedBox(height: 6),
            Text(
              formatCop(order.total),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
            if (next != null) ...[
              const SizedBox(height: 8),
              // Acción rápida directa: avanza al siguiente estado de un toque.
              SizedBox(
                width: double.infinity,
                height: 40,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: estadoColor(next),
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.zero,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () => _advance(context, ref),
                  icon: const Icon(Icons.arrow_forward, size: 18),
                  label: Text(advanceLabel(next),
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Reloj operativo: tiempo transcurrido desde el ingreso, en rojo si es largo.
class _ElapsedChip extends StatelessWidget {
  final DateTime since;
  final bool alert;
  const _ElapsedChip({required this.since, required this.alert});

  @override
  Widget build(BuildContext context) {
    final c = alert ? Colors.red : Colors.grey.shade700;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: (alert ? Colors.red : Colors.grey).withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.schedule, size: 13, color: c),
          const SizedBox(width: 3),
          Text(
            formatElapsed(since),
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: c),
          ),
        ],
      ),
    );
  }
}
