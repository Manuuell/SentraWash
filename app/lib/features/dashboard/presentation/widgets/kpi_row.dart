import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../../core/utils/format.dart';
import '../../../work_orders/domain/work_order.dart';

/// Fila de indicadores (KPIs) del panel: vehículos atendidos, ingresos del día
/// y tiempo promedio de espera. Se calculan en vivo a partir de las órdenes.
class KpiRow extends StatelessWidget {
  final List<WorkOrder> orders;
  const KpiRow({super.key, required this.orders});

  static bool _isToday(DateTime d) {
    final now = DateTime.now();
    return d.year == now.year && d.month == now.month && d.day == now.day;
  }

  @override
  Widget build(BuildContext context) {
    final today = orders.where((o) => _isToday(o.fechaIngreso)).toList();
    final atendidos = today.length;
    final ingresos = today.fold<double>(0, (s, o) => s + o.total);

    final activos =
        orders.where((o) => o.estado != 'entregado' && o.estado != 'cancelado').toList();
    final avgEspera = activos.isEmpty
        ? 0
        : activos
                .map((o) => DateTime.now().difference(o.fechaIngreso).inMinutes)
                .reduce((a, b) => a + b) /
            activos.length;

    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.sm),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _KpiCard(
                label: 'Atendidos hoy',
                value: '$atendidos',
                icon: Icons.directions_car_filled,
                color: AppColors.blue,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _KpiCard(
                label: 'Ingresos del día',
                value: formatCop(ingresos),
                icon: Icons.payments,
                color: AppColors.green,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: _KpiCard(
                label: 'Espera prom.',
                value: '${avgEspera.round()} min',
                icon: Icons.timer_outlined,
                color: AppColors.orange,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _KpiCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.55);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Badge de ícono redondeado con tinte de color (estilo iOS).
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(height: AppSpacing.md),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                ),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall?.copyWith(
                color: faint,
                fontWeight: FontWeight.w500,
                height: 1.15,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
