import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/utils/format.dart';
import 'cash_providers.dart';
import 'widgets/cash_dialogs.dart';

class CashPage extends ConsumerWidget {
  const CashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cash = ref.watch(cashControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Caja')),
      body: RefreshIndicator(
        onRefresh: () => ref.read(cashControllerProvider.notifier).refresh(),
        child: cash.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text(e.toString(), textAlign: TextAlign.center)),
          data: (detail) {
            if (detail == null) {
              return ListView(
                children: [
                  const SizedBox(height: 100),
                  Icon(Icons.point_of_sale, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 12),
                  Center(child: Text('No hay caja abierta', style: TextStyle(color: Colors.grey.shade600))),
                  const SizedBox(height: 16),
                  Center(
                    child: FilledButton.icon(
                      onPressed: () => showDialog(context: context, builder: (_) => const OpenCashDialog()),
                      icon: const Icon(Icons.lock_open),
                      label: const Text('Abrir caja'),
                    ),
                  ),
                ],
              );
            }

            final s = detail.session;
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('Caja abierta',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const Spacer(),
                            const Chip(
                              label: Text('abierta', style: TextStyle(color: Colors.white, fontSize: 12)),
                              backgroundColor: Colors.green,
                              visualDensity: VisualDensity.compact,
                            ),
                          ],
                        ),
                        const Divider(),
                        _row('Base inicial', formatCop(s.baseInicial)),
                        _row('Ingresos', formatCop(s.totalIngresos)),
                        _row('Egresos', formatCop(s.totalEgresos)),
                        const Divider(),
                        _row('Saldo esperado', formatCop(s.saldoEsperado), bold: true),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => showDialog(context: context, builder: (_) => const MovementDialog()),
                        icon: const Icon(Icons.swap_vert),
                        label: const Text('Movimiento'),
                      ),
                    ),
                    const SizedBox(width: 12),
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
                const SizedBox(height: 16),
                Text('Movimientos (${detail.movements.length})',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                if (detail.movements.isEmpty)
                  Text('Sin movimientos aún', style: TextStyle(color: Colors.grey.shade600))
                else
                  ...detail.movements.map((m) {
                    final ingreso = m.tipo == 'ingreso';
                    return ListTile(
                      dense: true,
                      leading: Icon(
                        ingreso ? Icons.arrow_downward : Icons.arrow_upward,
                        color: ingreso ? Colors.green : Colors.red,
                      ),
                      title: Text(m.concepto),
                      trailing: Text(
                        '${ingreso ? '+' : '-'}${formatCop(m.monto)}',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: ingreso ? Colors.green : Colors.red,
                        ),
                      ),
                    );
                  }),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool bold = false}) {
    final style = TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal, fontSize: bold ? 16 : 14);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: style), Text(value, style: style)],
      ),
    );
  }
}
