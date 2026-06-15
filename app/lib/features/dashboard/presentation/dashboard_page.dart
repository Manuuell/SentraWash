import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/config/app_config.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/theme_mode_provider.dart';
import '../../../core/utils/format.dart';
import '../../auth/presentation/auth_providers.dart';
import '../../intake/presentation/plate_scanner_page.dart';
import '../../work_orders/domain/work_order.dart';
import '../../work_orders/presentation/work_orders_providers.dart';

/// Inicio estilo *launcher*: una tarjeta de resumen del día arriba y una grilla
/// de accesos rápidos a las funciones del lavadero. El tablero Kanban vive en su
/// propia pantalla (acceso rápido "Tablero").
class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  static bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(workOrdersControllerProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final orders = ordersAsync.value ?? const <WorkOrder>[];
    final today = orders.where((o) => _isToday(o.fechaIngreso)).toList();
    final ingresos = today.fold<double>(0, (s, o) => s + o.total);
    final enOperacion =
        orders.where((o) => o.estado != 'entregado' && o.estado != 'cancelado').length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('SentraWash'),
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
          if (AppConfig.authEnabled)
            IconButton(
              tooltip: 'Cerrar sesión',
              icon: const Icon(Icons.logout),
              onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
            ),
        ],
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(
            AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, MediaQuery.paddingOf(context).bottom + 96),
        children: [
          _SummaryCard(
            atendidos: today.length,
            ingresos: ingresos,
            enOperacion: enOperacion,
            loading: ordersAsync.isLoading,
          ),
          const SizedBox(height: AppSpacing.xl),
          Padding(
            padding: const EdgeInsets.only(left: AppSpacing.xs, bottom: AppSpacing.md),
            child: Text('Accesos rápidos', style: Theme.of(context).textTheme.titleMedium),
          ),
          _QuickGrid(),
        ],
      ),
    );
  }
}

/// Tarjeta principal de resumen del día (estilo "hero" con color de marca).
class _SummaryCard extends StatelessWidget {
  final int atendidos;
  final double ingresos;
  final int enOperacion;
  final bool loading;

  const _SummaryCard({
    required this.atendidos,
    required this.ingresos,
    required this.enOperacion,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    final brand = AppColors.brand;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: brand,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Resumen de hoy',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              _stat('Atendidos', '$atendidos'),
              _divider(),
              _stat('Ingresos', formatCop(ingresos)),
              _divider(),
              _stat('En operación', '$enOperacion'),
            ],
          ),
          const SizedBox(height: AppSpacing.xl),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: brand,
              ),
              onPressed: () => openIntake(context),
              icon: const Icon(Icons.photo_camera),
              label: const Text('Registrar ingreso'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.4),
            ),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
          ],
        ),
      );

  Widget _divider() => Container(
        width: 1,
        height: 34,
        margin: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        color: Colors.white.withValues(alpha: 0.25),
      );
}

/// Una función accesible desde el Inicio.
class _Quick {
  final String label;
  final IconData icon;
  final Color color;
  final String? route;
  const _Quick(this.label, this.icon, this.color, this.route);
}

const _quickItems = <_Quick>[
  _Quick('Tablero', Icons.view_kanban, AppColors.blue, '/board'),
  _Quick('Órdenes', Icons.receipt_long, Color(0xFF5E5CE6), '/work-orders'),
  _Quick('Vehículos', Icons.directions_car_filled, AppColors.teal, '/vehicles'),
  _Quick('Clientes', Icons.people, AppColors.orange, '/customers'),
  _Quick('Servicios', Icons.local_car_wash, AppColors.cyan, '/services'),
  _Quick('Caja', Icons.point_of_sale, AppColors.green, '/cash'),
  _Quick('Reportes', Icons.bar_chart, Colors.grey, null),
];

class _QuickGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: AppSpacing.md,
      crossAxisSpacing: AppSpacing.md,
      childAspectRatio: 0.95,
      children: [for (final q in _quickItems) _QuickButton(item: q)],
    );
  }
}

class _QuickButton extends StatelessWidget {
  final _Quick item;
  const _QuickButton({required this.item});

  @override
  Widget build(BuildContext context) {
    final enabled = item.route != null;
    final theme = Theme.of(context);

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        onTap: enabled
            ? () => context.go(item.route!)
            : () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Módulo próximamente')),
                ),
        child: Opacity(
          opacity: enabled ? 1 : 0.5,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: item.color.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(AppSpacing.radius),
                ),
                child: Icon(item.icon, color: item.color, size: 26),
              ),
              const SizedBox(height: AppSpacing.sm),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(
                  item.label,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
