import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/failure.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/app_sheet.dart';
import 'payment_method_meta.dart';
import 'payments_providers.dart';

/// Abre el cobro de una orden como bottom sheet. [monto] prellena el campo
/// (normalmente el total o el saldo pendiente).
Future<void> showPaymentSheet(
  BuildContext context, {
  required String orderId,
  required int numeroOrden,
  required double monto,
}) {
  return showAppSheet<void>(
    context: context,
    title: 'Registrar pago · Orden #$numeroOrden',
    builder: (_) => _PaymentForm(orderId: orderId, montoSugerido: monto),
  );
}

class _PaymentForm extends ConsumerStatefulWidget {
  final String orderId;
  final double montoSugerido;
  const _PaymentForm({required this.orderId, required this.montoSugerido});

  @override
  ConsumerState<_PaymentForm> createState() => _PaymentFormState();
}

class _PaymentFormState extends ConsumerState<_PaymentForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _monto =
      TextEditingController(text: widget.montoSugerido.toStringAsFixed(0));
  final _referencia = TextEditingController();
  String _metodo = paymentMethods.first.value;
  bool _saving = false;

  @override
  void dispose() {
    _monto.dispose();
    _referencia.dispose();
    super.dispose();
  }

  bool get _requiereReferencia => _metodo != 'efectivo';

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(paymentRepositoryProvider).register(
            workOrderId: widget.orderId,
            metodo: _metodo,
            monto: double.parse(_monto.text.trim()),
            referencia: _referencia.text.trim(),
          );
      // Refresca el estado de pago de la orden.
      ref.invalidate(orderPaymentsProvider(widget.orderId));
      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pago registrado ✅'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Theme.of(context).colorScheme.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Método de pago', style: theme.textTheme.labelLarge),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              for (final m in paymentMethods)
                ChoiceChip(
                  avatar: Icon(m.icon,
                      size: 18,
                      color: _metodo == m.value ? theme.colorScheme.onPrimary : null),
                  label: Text(m.label),
                  selected: _metodo == m.value,
                  onSelected: (_) => setState(() => _metodo = m.value),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          TextFormField(
            controller: _monto,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Monto', prefixText: r'$ '),
            validator: (v) {
              final n = double.tryParse((v ?? '').trim());
              return (n == null || n <= 0) ? 'Monto inválido' : null;
            },
          ),
          const SizedBox(height: AppSpacing.md),
          TextFormField(
            controller: _referencia,
            decoration: InputDecoration(
              labelText: _requiereReferencia ? 'Referencia / comprobante' : 'Referencia (opcional)',
              hintText: _requiereReferencia ? 'Ej: últimos 4 dígitos' : null,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          FilledButton.icon(
            onPressed: _saving ? null : _submit,
            icon: _saving
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2.4))
                : const Icon(Icons.check),
            label: Text(_saving ? 'Registrando...' : 'Registrar ${formatCop(double.tryParse(_monto.text) ?? 0)}'),
          ),
        ],
      ),
    );
  }
}
