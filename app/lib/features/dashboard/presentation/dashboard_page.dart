import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/error/failure.dart';
import '../../../core/theme/theme_mode_provider.dart';
import '../../../core/utils/format.dart';
import '../../vehicles/presentation/vehicles_providers.dart';
import '../../work_orders/domain/work_order.dart';
import '../../work_orders/presentation/wash_stage.dart';
import '../../work_orders/presentation/work_orders_providers.dart';

/// Vista principal: panel operativo del lavadero. Fila de KPIs arriba y un
/// tablero Kanban con las 4 etapas del lavado. Pensado para que el operario
/// avance vehículos de un solo toque.
class DashboardPage extends ConsumerStatefulWidget {
  const DashboardPage({super.key});

  @override
  ConsumerState<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends ConsumerState<DashboardPage> {
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    // Refresca el tiempo transcurrido y los KPIs en vivo.
    _ticker = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(workOrdersControllerProvider);
    final vehiclesAsync = ref.watch(vehiclesControllerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Mapa vehicleId → placa para mostrar la matrícula en cada tarjeta.
    final plates = <String, String>{
      for (final v in vehiclesAsync.value ?? const []) v.id: v.placa,
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Panel del lavadero'),
        actions: [
          IconButton(
            tooltip: 'Actualizar',
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
          ),
          IconButton(
            tooltip: isDark ? 'Tema claro' : 'Tema oscuro',
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/work-orders/new'),
        icon: const Icon(Icons.add),
        label: const Text('Registrar ingreso'),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _ErrorView(
          message: e.toString(),
          onRetry: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
        ),
        data: (orders) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _KpiRow(orders: orders),
              const SizedBox(height: 4),
              Expanded(child: _KanbanBoard(orders: orders, plates: plates)),
            ],
          );
        },
      ),
    );
  }
}

// ─────────────────────────────── KPIs ───────────────────────────────

class _KpiRow extends StatelessWidget {
  final List<WorkOrder> orders;
  const _KpiRow({required this.orders});

  bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  @override
  Widget build(BuildContext context) {
    final today = orders.where((o) => _isToday(o.fechaIngreso)).toList();
    final atendidos = today.length;
    final ingresos = today.fold<double>(0, (s, o) => s + o.total);

    final activos = orders
        .where((o) => o.estado != 'entregado' && o.estado != 'cancelado')
        .toList();
    final avgEspera = activos.isEmpty
        ? 0
        : activos
                .map((o) => DateTime.now().difference(o.fechaIngreso).inMinutes)
                .reduce((a, b) => a + b) /
            activos.length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Expanded(
            child: _KpiCard(
              label: 'Vehículos atendidos',
              value: '$atendidos',
              icon: Icons.directions_car,
              color: const Color(0xFF2563EB),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _KpiCard(
              label: 'Ingresos del día',
              value: formatCop(ingresos),
              icon: Icons.payments,
              color: const Color(0xFF16A34A),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _KpiCard(
              label: 'Tiempo prom. espera',
              value: '${avgEspera.round()} min',
              icon: Icons.timer_outlined,
              color: const Color(0xFFF59E0B),
            ),
          ),
        ],
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: color.withValues(alpha: 0.10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withValues(alpha: 0.25)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // Tipografía grande, legible de un vistazo.
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────── Kanban ─────────────────────────────

class _KanbanBoard extends StatelessWidget {
  final List<WorkOrder> orders;
  final Map<String, String> plates;
  const _KanbanBoard({required this.orders, required this.plates});

  @override
  Widget build(BuildContext context) {
    // Agrupa por estado.
    final byStage = <String, List<WorkOrder>>{};
    for (final s in kanbanStages) {
      byStage[s.estado] =
          orders.where((o) => o.estado == s.estado).toList()
            ..sort((a, b) => a.fechaIngreso.compareTo(b.fechaIngreso));
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final wide = constraints.maxWidth >= 900;

        Widget column(WashStage s) => _KanbanColumn(
              stage: s,
              orders: byStage[s.estado] ?? const [],
              plates: plates,
            );

        if (wide) {
          return Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final s in kanbanStages)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: column(s),
                    ),
                  ),
              ],
            ),
          );
        }

        // Móvil: scroll horizontal con columnas de ancho fijo.
        return ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
          children: [
            for (final s in kanbanStages)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: SizedBox(width: 280, child: column(s)),
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
  const _KanbanColumn({
    required this.stage,
    required this.orders,
    required this.plates,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Encabezado de columna con color semántico y contador.
        Container(
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
                style: TextStyle(
                  color: stage.color,
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                ),
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
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(14)),
            ),
            child: orders.isEmpty
                ? Center(
                    child: Text(
                      'Sin vehículos',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: orders.length,
                    itemBuilder: (_, i) => _OrderKanbanCard(
                      order: orders[i],
                      placa: plates[orders[i].vehicleId] ?? '—',
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

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
            Row(
              children: [
                Text(
                  placa,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),
                const Spacer(),
                // Reloj operativo: tiempo transcurrido desde el ingreso.
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (alert ? Colors.red : Colors.grey).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.schedule,
                          size: 13, color: alert ? Colors.red : Colors.grey.shade700),
                      const SizedBox(width: 3),
                      Text(
                        formatElapsed(order.fechaIngreso),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: alert ? Colors.red : Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
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
                  label: Text(
                    advanceLabel(next),
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, size: 56, color: Colors.red),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(message, textAlign: TextAlign.center),
          ),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}
