import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/widgets/app_sheet.dart';
import '../vehicle_type_meta.dart';
import '../vehicles_providers.dart';

const _tipos = ['automovil', 'camioneta', 'moto', 'taxi', 'camion', 'otro'];

/// Abre el formulario de alta de vehículo como bottom sheet estilo iOS.
Future<void> showVehicleSheet(BuildContext context) => showAppSheet<void>(
      context: context,
      title: 'Nuevo vehículo',
      builder: (_) => const VehicleForm(),
    );

/// Formulario para registrar un vehículo nuevo (cuerpo de la hoja).
class VehicleForm extends ConsumerStatefulWidget {
  const VehicleForm({super.key});

  @override
  ConsumerState<VehicleForm> createState() => _VehicleFormState();
}

class _VehicleFormState extends ConsumerState<VehicleForm> {
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
            controller: _placa,
            textCapitalization: TextCapitalization.characters,
            decoration: const InputDecoration(labelText: 'Placa', hintText: 'ABC123'),
            validator: (v) => (v == null || v.trim().length < 5) ? 'Placa inválida' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          // Tipo de vehículo como chips seleccionables (más táctil que un dropdown).
          Align(
            alignment: Alignment.centerLeft,
            child: Text('Tipo', style: Theme.of(context).textTheme.labelLarge),
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: [
              for (final t in _tipos)
                ChoiceChip(
                  label: Text(vehicleTypeLabel(t)),
                  selected: _tipo == t,
                  onSelected: (_) => setState(() => _tipo = t),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          TextFormField(
            controller: _marca,
            decoration: const InputDecoration(labelText: 'Marca (opcional)'),
          ),
          const SizedBox(height: AppSpacing.md),
          TextFormField(
            controller: _color,
            decoration: const InputDecoration(labelText: 'Color (opcional)'),
          ),
          const SizedBox(height: AppSpacing.xl),
          FilledButton(
            onPressed: _saving ? null : _submit,
            child: _saving
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.4))
                : const Text('Guardar vehículo'),
          ),
        ],
      ),
    );
  }
}
