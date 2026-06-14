import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../../../core/widgets/inset_section.dart';
import '../../customers/domain/customer.dart';
import '../../customers/presentation/customers_providers.dart';
import '../domain/vehicle.dart';
import 'vehicle_type_meta.dart';
import 'vehicles_providers.dart';
import 'widgets/vehicle_form_dialog.dart';

class VehiclesPage extends ConsumerWidget {
  const VehiclesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final vehicles = ref.watch(vehiclesControllerProvider);
    final owners = <String, String>{
      for (final c in ref.watch(customersControllerProvider).value ?? const <Customer>[])
        c.id: c.nombre,
    };

    return Scaffold(
      appBar: AppBar(title: const Text('Vehículos')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showVehicleSheet(context),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(vehiclesControllerProvider.notifier).refreshList(),
        child: vehicles.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ErrorRetry(
            message: e.toString(),
            onRetry: () => ref.read(vehiclesControllerProvider.notifier).refreshList(),
          ),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.directions_car_outlined,
                message: 'Aún no hay vehículos registrados',
                actionLabel: 'Registrar vehículo',
                onAction: () => showVehicleSheet(context),
              );
            }
            return ListView(
              padding: EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, MediaQuery.paddingOf(context).bottom + 96),
              children: [
                InsetSection(
                  header: '${items.length} vehículo(s)',
                  children: [
                    for (final v in items)
                      _VehicleTile(
                        vehicle: v,
                        owner: v.customerId != null ? owners[v.customerId] : null,
                      ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _VehicleTile extends StatelessWidget {
  final Vehicle vehicle;
  final String? owner;
  const _VehicleTile({required this.vehicle, required this.owner});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.5);
    final v = vehicle;

    return ListTile(
      leading: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: theme.colorScheme.primary.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Icon(vehicleTypeIcon(v.tipo), color: theme.colorScheme.primary, size: 22),
      ),
      title: Text(v.placa, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
      subtitle: Text(
        [
          vehicleTypeLabel(v.tipo),
          if (v.marca != null) v.marca!,
          if (v.color != null) v.color!,
        ].join(' · '),
        style: TextStyle(color: faint),
      ),
      trailing: owner != null
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.person, size: 15, color: faint),
                const SizedBox(width: 4),
                Text(owner!, style: TextStyle(color: faint, fontSize: 13)),
              ],
            )
          : null,
    );
  }
}
