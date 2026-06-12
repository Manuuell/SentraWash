import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/empty_state.dart';
import 'services_providers.dart';
import 'widgets/service_form_dialog.dart';

class ServicesPage extends ConsumerWidget {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Servicios')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showDialog(context: context, builder: (_) => const ServiceFormDialog()),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(servicesControllerProvider.notifier).refreshList(),
        child: services.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(e.toString(), textAlign: TextAlign.center)),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.local_car_wash_outlined,
                message: 'Aún no hay servicios configurados',
                actionLabel: 'Crear servicio',
                onAction: () => showDialog(
                  context: context,
                  builder: (_) => const ServiceFormDialog(),
                ),
              );
            }
            return ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final s = items[i];
                return ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.local_car_wash)),
                  title: Text(s.nombre, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text([
                    if (s.categoria != null) s.categoria!,
                    if (s.duracionMin != null) '${s.duracionMin} min',
                  ].join(' · ')),
                  trailing: Text(formatCop(s.precio),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
