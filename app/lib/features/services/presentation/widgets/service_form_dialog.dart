import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_sheet.dart';
import '../services_providers.dart';

/// Abre el formulario de alta de servicio como bottom sheet estilo iOS.
Future<void> showServiceSheet(BuildContext context) => showAppSheet<void>(
      context: context,
      title: 'Nuevo servicio',
      builder: (_) => const ServiceForm(),
    );

class ServiceForm extends ConsumerStatefulWidget {
  const ServiceForm({super.key});

  @override
  ConsumerState<ServiceForm> createState() => _ServiceFormState();
}

class _ServiceFormState extends ConsumerState<ServiceForm> {
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
      if (mounted) Navigator.of(context).pop();
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
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _nombre,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(labelText: 'Nombre'),
            validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          TextFormField(
            controller: _precio,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Precio (COP)', prefixText: r'$ '),
            validator: (v) {
              final n = double.tryParse((v ?? '').trim());
              return (n == null || n < 0) ? 'Precio inválido' : null;
            },
          ),
          const SizedBox(height: AppSpacing.md),
          TextFormField(
            controller: _duracion,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Duración (min, opcional)'),
          ),
          const SizedBox(height: AppSpacing.md),
          TextFormField(
            controller: _categoria,
            decoration: const InputDecoration(labelText: 'Categoría (opcional)'),
          ),
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: _saving ? null : _submit,
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4))
                : const Text('Guardar servicio'),
          ),
        ],
      ),
    );
  }
}
