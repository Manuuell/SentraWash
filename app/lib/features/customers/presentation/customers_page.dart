import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../../../core/widgets/inset_section.dart';
import 'customers_providers.dart';
import 'widgets/customer_form_dialog.dart';

class CustomersPage extends ConsumerWidget {
  const CustomersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final customers = ref.watch(customersControllerProvider);
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.5);

    return Scaffold(
      appBar: AppBar(title: const Text('Clientes')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showCustomerSheet(context),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(customersControllerProvider.notifier).refreshList(),
        child: customers.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ErrorRetry(
            message: e.toString(),
            onRetry: () => ref.read(customersControllerProvider.notifier).refreshList(),
          ),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.people_outline,
                message: 'Aún no hay clientes registrados',
                actionLabel: 'Agregar cliente',
                onAction: () => showCustomerSheet(context),
              );
            }
            return ListView(
              padding: EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, MediaQuery.paddingOf(context).bottom + 96),
              children: [
                InsetSection(
                  header: '${items.length} cliente(s)',
                  children: [
                    for (final c in items)
                      ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.14),
                          foregroundColor: theme.colorScheme.primary,
                          child: Text(
                            c.nombre.isNotEmpty ? c.nombre[0].toUpperCase() : '?',
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                        ),
                        title: Text(c.nombre, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(
                          [
                            if (c.telefono != null) c.telefono!,
                            if (c.email != null) c.email!,
                          ].join(' · '),
                          style: TextStyle(color: faint),
                        ),
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
