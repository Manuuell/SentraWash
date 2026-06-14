import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../../../core/widgets/inset_section.dart';
import 'services_providers.dart';
import 'widgets/service_form_dialog.dart';

class ServicesPage extends ConsumerWidget {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final services = ref.watch(servicesControllerProvider);
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.5);

    return Scaffold(
      appBar: AppBar(title: const Text('Servicios')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showServiceSheet(context),
        icon: const Icon(Icons.add),
        label: const Text('Nuevo'),
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(servicesControllerProvider.notifier).refreshList(),
        child: services.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ErrorRetry(
            message: e.toString(),
            onRetry: () => ref.read(servicesControllerProvider.notifier).refreshList(),
          ),
          data: (items) {
            if (items.isEmpty) {
              return EmptyState(
                icon: Icons.local_car_wash_outlined,
                message: 'Aún no hay servicios configurados',
                actionLabel: 'Crear servicio',
                onAction: () => showServiceSheet(context),
              );
            }
            return ListView(
              padding: EdgeInsets.fromLTRB(
                  AppSpacing.lg, AppSpacing.md, AppSpacing.lg, MediaQuery.paddingOf(context).bottom + 96),
              children: [
                InsetSection(
                  header: '${items.length} servicio(s)',
                  children: [
                    for (final s in items)
                      ListTile(
                        leading: Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                          ),
                          child: Icon(Icons.local_car_wash, color: theme.colorScheme.primary, size: 22),
                        ),
                        title: Text(s.nombre, style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text(
                          [
                            if (s.categoria != null) s.categoria!,
                            if (s.duracionMin != null) '${s.duracionMin} min',
                          ].join(' · '),
                          style: TextStyle(color: faint),
                        ),
                        trailing: Text(
                          formatCop(s.precio),
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
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
