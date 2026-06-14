import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/error_retry.dart';
import '../../../core/widgets/inset_section.dart';
import 'cash_providers.dart';
import 'widgets/cash_dialogs.dart';

class CashPage extends ConsumerWidget {
  const CashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cash = ref.watch(cashControllerProvider);
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.55);
    final bottomClear = MediaQuery.paddingOf(context).bottom + 96;

    return Scaffold(
      appBar: AppBar(title: const Text('Caja')),
      body: RefreshIndicator(
        onRefresh: () => ref.read(cashControllerProvider.notifier).refresh(),
        child: cash.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ErrorRetry(
            message: e.toString(),
            onRetry: () => ref.read(cashControllerProvider.notifier).refresh(),
          ),
          data: (detail) {
            if (detail == null) {
              return EmptyState(
                icon: Icons.point_of_sale_outlined,
                message: 'No hay caja abierta',
                actionLabel: 'Abrir caja',
                actionIcon: Icons.lock_open,
                onAction: () => showDialog(context: context, builder: (_) => const OpenCashDialog()),
              );
            }

            final s = detail.session;
            return ListView(
              padding: EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, bottomClear),
              children: [
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text('Caja abierta',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.green.withValues(alpha: 0.16),
                              borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                            ),
                            child: const Text('Abierta',
                                style: TextStyle(color: AppColors.green, fontSize: 12, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const Divider(height: AppSpacing.xl),
                      _row(context, 'Base inicial', formatCop(s.baseInicial)),
                      _row(context, 'Ingresos', formatCop(s.totalIngresos)),
                      _row(context, 'Egresos', formatCop(s.totalEgresos)),
                      const Divider(height: AppSpacing.xl),
                      _row(context, 'Saldo esperado', formatCop(s.saldoEsperado), bold: true),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => showDialog(context: context, builder: (_) => const MovementDialog()),
                        icon: const Icon(Icons.swap_vert),
                        label: const Text('Movimiento'),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: () => showDialog(
                          context: context,
                          builder: (_) => CloseCashDialog(saldoEsperado: s.saldoEsperado),
                        ),
                        icon: const Icon(Icons.lock),
                        label: const Text('Cerrar'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xl),
                if (detail.movements.isEmpty)
                  Padding(
                    padding: const EdgeInsets.only(left: AppSpacing.xs),
                    child: Text('Sin movimientos aún', style: TextStyle(color: faint)),
                  )
                else
                  InsetSection(
                    header: 'Movimientos (${detail.movements.length})',
                    children: [
                      for (final m in detail.movements)
                        Builder(builder: (context) {
                          final ingreso = m.tipo == 'ingreso';
                          final c = ingreso ? AppColors.green : AppColors.red;
                          return ListTile(
                            leading: Container(
                              width: 38,
                              height: 38,
                              decoration: BoxDecoration(
                                color: c.withValues(alpha: 0.14),
                                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                              ),
                              child: Icon(ingreso ? Icons.arrow_downward : Icons.arrow_upward, color: c, size: 20),
                            ),
                            title: Text(m.concepto),
                            trailing: Text(
                              '${ingreso ? '+' : '-'}${formatCop(m.monto)}',
                              style: TextStyle(fontWeight: FontWeight.w700, color: c),
                            ),
                          );
                        }),
                    ],
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _row(BuildContext context, String label, String value, {bool bold = false}) {
    final faint = Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6);
    final style = TextStyle(
      fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
      fontSize: bold ? 16 : 14,
      color: bold ? null : faint,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: style), Text(value, style: style.copyWith(color: null))],
      ),
    );
  }
}
