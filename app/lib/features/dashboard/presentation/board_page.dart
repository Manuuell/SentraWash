import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/error_retry.dart';
import '../../intake/presentation/plate_scanner_page.dart';
import '../../vehicles/domain/vehicle.dart';
import '../../vehicles/presentation/vehicles_providers.dart';
import '../../work_orders/presentation/work_orders_providers.dart';
import 'widgets/kanban_board.dart';
import 'widgets/kpi_row.dart';

/// Tablero operativo: fila de KPIs y un Kanban con las 4 etapas del lavado.
/// Pensado para que el operario avance vehículos de un solo toque. Se llega
/// desde el acceso rápido "Tablero" del Inicio.
class BoardPage extends ConsumerStatefulWidget {
  const BoardPage({super.key});

  @override
  ConsumerState<BoardPage> createState() => _BoardPageState();
}

class _BoardPageState extends ConsumerState<BoardPage> {
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

    // Mapa vehicleId → placa para mostrar la matrícula en cada tarjeta.
    final plates = <String, String>{
      for (final v in vehiclesAsync.value ?? const <Vehicle>[]) v.id: v.placa,
    };

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tablero'),
        actions: [
          IconButton(
            tooltip: 'Actualizar',
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(workOrdersControllerProvider.notifier).refreshList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => openIntake(context),
        icon: const Icon(Icons.photo_camera),
        label: const Text('Registrar ingreso'),
      ),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorRetry(
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
