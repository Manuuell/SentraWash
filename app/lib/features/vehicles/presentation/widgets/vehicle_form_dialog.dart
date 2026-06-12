import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/error/failure.dart';
import '../vehicles_providers.dart';

const _tipos = ['automovil', 'camioneta', 'moto', 'taxi', 'camion', 'otro'];

/// Diálogo para registrar un vehículo nuevo.
class VehicleFormDialog extends ConsumerStatefulWidget {
  const VehicleFormDialog({super.key});

  @override
  ConsumerState<VehicleFormDialog> createState() => _VehicleFormDialogState();
}

class _VehicleFormDialogState extends ConsumerState<VehicleFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _placa = TextEditingController();
  final _marca = TextEditingController();
  final _color = TextEditingController();
  String _tipo = _tipos.first;
  bool _saving = false;

  @override
  void dispose() {
    _placa.dispose();
    _marca.dispose();
    _color.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(vehiclesControllerProvider.notifier).add(
            placa: _placa.text.trim(),
            tipo: _tipo,
            marca: _marca.text.trim(),
            color: _color.text.trim(),
          );
      if (mounted) Navigator.of(context).pop(true);
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
      title: const Text('Nuevo vehículo'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _placa,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(labelText: 'Placa', hintText: 'ABC123'),
              validator: (v) => (v == null || v.trim().length < 5) ? 'Placa inválida' : null,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _tipo,
              decoration: const InputDecoration(labelText: 'Tipo'),
              items: _tipos
                  .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                  .toList(),
              onChanged: (v) => setState(() => _tipo = v ?? _tipo),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _marca,
              decoration: const InputDecoration(labelText: 'Marca (opcional)'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _color,
              decoration: const InputDecoration(labelText: 'Color (opcional)'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(false),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: _saving ? null : _submit,
          child: _saving
              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Guardar'),
        ),
      ],
    );
  }
}
