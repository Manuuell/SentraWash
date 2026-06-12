import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/empty_state.dart';
import 'vehicles_providers.dart';
import 'widgets/vehicle_form_dialog.dart';

class VehiclesPage extends ConsumerWidget {
  const VehiclesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicles = ref.watch(vehiclesControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Vehículos')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showDialog(
          context: context,
          builder: (_) => const VehicleFormDialog(),
        ),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(vehiclesControllerProvider.notifier).refreshList(),
        child: vehicles.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => _ErrorView(
            message: e.toString(),
            onRetry: () => ref.read(vehiclesControllerProvider.notifier).refreshList(),
          ),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.directions_car_outlined,
                message: 'Aún no hay vehículos registrados',
                actionLabel: 'Registrar vehículo',
                onAction: () => showDialog(
                  context: context,
                  builder: (_) => const VehicleFormDialog(),
                ),
              );
            }
            return ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final v = items[i];
                return ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.directions_car)),
                  title: Text(v.placa, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text([
                    v.tipo,
                    if (v.marca != null) v.marca!,
                    if (v.color != null) v.color!,
                  ].join(' · ')),
                );
              },
            );
          },
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
    return ListView(
      children: [
        const SizedBox(height: 100),
        const Icon(Icons.error_outline, size: 56, color: Colors.red),
        const SizedBox(height: 12),
        Center(child: Text(message, textAlign: TextAlign.center)),
        const SizedBox(height: 12),
        Center(child: FilledButton(onPressed: onRetry, child: const Text('Reintentar'))),
      ],
    );
  }
}
