import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/theme_mode_provider.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final modules = <_Module>[
      const _Module('Vehículos', Icons.directions_car, '/vehicles'),
      const _Module('Órdenes', Icons.receipt_long, '/work-orders'),
      const _Module('Clientes', Icons.people, '/customers'),
      const _Module('Servicios', Icons.local_car_wash, '/services'),
      const _Module('Caja', Icons.point_of_sale, '/cash'),
      const _Module('Reportes', Icons.bar_chart, null), // próximamente
    ];

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('SentraWash'),
        actions: [
          IconButton(
            tooltip: isDark ? 'Tema claro' : 'Tema oscuro',
            icon: Icon(isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Panel del lavadero',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text('Gestiona tu operación diaria',
                style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                children: modules.map((m) => _ModuleCard(module: m)).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Module {
  final String title;
  final IconData icon;
  final String? route;
  const _Module(this.title, this.icon, this.route);

  bool get enabled => route != null;
}

class _ModuleCard extends StatelessWidget {
  final _Module module;
  const _ModuleCard({required this.module});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: InkWell(
        onTap: module.enabled && module.route != null
            ? () => context.go(module.route!)
            : () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Módulo próximamente')),
                ),
        child: Opacity(
          opacity: module.enabled ? 1 : 0.5,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(module.icon, size: 40, color: scheme.primary),
              const SizedBox(height: 10),
              Text(module.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}
