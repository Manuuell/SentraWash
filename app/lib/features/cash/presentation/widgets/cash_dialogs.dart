import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/error/failure.dart';
import '../cash_providers.dart';

/// Diálogo para abrir caja (base inicial).
class OpenCashDialog extends ConsumerStatefulWidget {
  const OpenCashDialog({super.key});
  @override
  ConsumerState<OpenCashDialog> createState() => _OpenCashDialogState();
}

class _OpenCashDialogState extends ConsumerState<OpenCashDialog> {
  final _base = TextEditingController(text: '0');
  bool _saving = false;

  @override
  void dispose() {
    _base.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final base = double.tryParse(_base.text.trim());
    if (base == null || base < 0) return;
    setState(() => _saving = true);
    try {
      await ref.read(cashControllerProvider.notifier).open(base);
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Abrir caja'),
      content: TextField(
        controller: _base,
        keyboardType: TextInputType.number,
        decoration: const InputDecoration(labelText: 'Base inicial', prefixText: r'$ '),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        FilledButton(onPressed: _saving ? null : _submit, child: const Text('Abrir')),
      ],
    );
  }
}

/// Diálogo para cerrar caja (saldo real contado → arqueo).
class CloseCashDialog extends ConsumerStatefulWidget {
  final double saldoEsperado;
  const CloseCashDialog({super.key, required this.saldoEsperado});
  @override
  ConsumerState<CloseCashDialog> createState() => _CloseCashDialogState();
}

class _CloseCashDialogState extends ConsumerState<CloseCashDialog> {
  late final TextEditingController _real =
      TextEditingController(text: widget.saldoEsperado.toStringAsFixed(0));
  bool _saving = false;

  @override
  void dispose() {
    _real.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final real = double.tryParse(_real.text.trim());
    if (real == null || real < 0) return;
    setState(() => _saving = true);
    try {
      await ref.read(cashControllerProvider.notifier).close(real);
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Cerrar caja'),
      content: TextField(
        controller: _real,
        keyboardType: TextInputType.number,
        decoration: const InputDecoration(labelText: 'Saldo real contado', prefixText: r'$ '),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        FilledButton(onPressed: _saving ? null : _submit, child: const Text('Cerrar')),
      ],
    );
  }
}

/// Diálogo para registrar un movimiento (ingreso/egreso).
class MovementDialog extends ConsumerStatefulWidget {
  const MovementDialog({super.key});
  @override
  ConsumerState<MovementDialog> createState() => _MovementDialogState();
}

class _MovementDialogState extends ConsumerState<MovementDialog> {
  String _tipo = 'ingreso';
  final _concepto = TextEditingController();
  final _monto = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _concepto.dispose();
    _monto.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final monto = double.tryParse(_monto.text.trim());
    if (monto == null || monto <= 0 || _concepto.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      await ref.read(cashControllerProvider.notifier).registerMovement(
            tipo: _tipo,
            concepto: _concepto.text.trim(),
            monto: monto,
          );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(mapDioError(e).message), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Nuevo movimiento'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SegmentedButton<String>(
            segments: const [
              ButtonSegment(value: 'ingreso', label: Text('Ingreso')),
              ButtonSegment(value: 'egreso', label: Text('Egreso')),
            ],
            selected: {_tipo},
            onSelectionChanged: (s) => setState(() => _tipo = s.first),
          ),
          const SizedBox(height: 12),
          TextField(controller: _concepto, decoration: const InputDecoration(labelText: 'Concepto')),
          const SizedBox(height: 12),
          TextField(
            controller: _monto,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Monto', prefixText: r'$ '),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancelar')),
        FilledButton(onPressed: _saving ? null : _submit, child: const Text('Registrar')),
      ],
    );
  }
}
