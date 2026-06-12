import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/error/failure.dart';
import '../services_providers.dart';

class ServiceFormDialog extends ConsumerStatefulWidget {
  const ServiceFormDialog({super.key});

  @override
  ConsumerState<ServiceFormDialog> createState() => _ServiceFormDialogState();
}

class _ServiceFormDialogState extends ConsumerState<ServiceFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nombre = TextEditingController();
  final _precio = TextEditingController();
  final _duracion = TextEditingController();
  final _categoria = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _nombre.dispose();
    _precio.dispose();
    _duracion.dispose();
    _categoria.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(servicesControllerProvider.notifier).add(
            nombre: _nombre.text.trim(),
            precio: double.parse(_precio.text.trim()),
            duracionMin: _duracion.text.trim().isEmpty ? null : int.tryParse(_duracion.text.trim()),
            categoria: _categoria.text.trim(),
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
      title: const Text('Nuevo servicio'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nombre,
              decoration: const InputDecoration(labelText: 'Nombre'),
              validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _precio,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Precio (COP)', prefixText: r'$ '),
              validator: (v) {
                final n = double.tryParse((v ?? '').trim());
                return (n == null || n < 0) ? 'Precio inválido' : null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _duracion,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Duración (min, opcional)'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _categoria,
              decoration: const InputDecoration(labelText: 'Categoría (opcional)'),
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
