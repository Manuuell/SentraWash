import 'package:flutter/material.dart';

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
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      // IntrinsicHeight acota la altura del Row para que `stretch` iguale las 3
      // tarjetas aunque el texto ocupe distinto número de líneas (sin él,
      // `stretch` recibe altura infinita y rompe el layout).
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
          Expanded(
            child: _KpiCard(
              label: 'Vehículos atendidos',
              value: '$atendidos',
              icon: Icons.directions_car,
              color: const Color(0xFF2563EB),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _KpiCard(
              label: 'Ingresos del día',
              value: formatCop(ingresos),
              icon: Icons.payments,
              color: const Color(0xFF16A34A),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _KpiCard(
              label: 'Tiempo prom. espera',
              value: '${avgEspera.round()} min',
              icon: Icons.timer_outlined,
              color: const Color(0xFFF59E0B),
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
    return Card(
      elevation: 0,
      color: color.withValues(alpha: 0.10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withValues(alpha: 0.25)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        // Layout vertical: el ícono arriba deja el ancho completo para que la
        // etiqueta se lea íntegra (hasta 2 líneas).
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 8),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 12.5,
                height: 1.15,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(
                value,
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
