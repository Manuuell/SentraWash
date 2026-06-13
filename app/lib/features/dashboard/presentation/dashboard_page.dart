import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/theme_mode_provider.dart';
import '../../vehicles/domain/vehicle.dart';
import '../../vehicles/presentation/vehicles_providers.dart';
import '../../work_orders/presentation/work_orders_providers.dart';
import 'widgets/kanban_board.dart';
import 'widgets/kpi_row.dart';

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
      for (final v in vehiclesAsync.value ?? const <Vehicle>[]) v.id: v.placa,
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
        data: (orders) => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            KpiRow(orders: orders),
            const SizedBox(height: 4),
            Expanded(child: KanbanBoard(orders: orders, plates: plates)),
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
