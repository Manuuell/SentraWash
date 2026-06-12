import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/empty_state.dart';
import 'customers_providers.dart';
import 'widgets/customer_form_dialog.dart';

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customers = ref.watch(customersControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showDialog(context: context, builder: (_) => const CustomerFormDialog()),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(customersControllerProvider.notifier).refreshList(),
        child: customers.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(e.toString(), textAlign: TextAlign.center)),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.people_outline,
                message: 'Aún no hay clientes registrados',
                actionLabel: 'Agregar cliente',
                onAction: () => showDialog(
                  context: context,
                  builder: (_) => const CustomerFormDialog(),
                ),
              );
            }
            return ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final c = items[i];
                return ListTile(
                  leading: CircleAvatar(child: Text(c.nombre.isNotEmpty ? c.nombre[0].toUpperCase() : '?')),
                  title: Text(c.nombre, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text([
                    if (c.telefono != null) c.telefono!,
                    if (c.email != null) c.email!,
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
