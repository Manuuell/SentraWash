import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/error/failure.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/format.dart';
import '../../../core/widgets/primary_action_button.dart';
import '../../intake/data/photo_uploader.dart';
import '../../customers/domain/customer.dart';
import '../../customers/presentation/customers_providers.dart';
import '../../services/presentation/services_providers.dart';
import '../../vehicles/domain/vehicle.dart';
import '../../vehicles/presentation/vehicles_providers.dart';
import '../domain/order_item_input.dart';
import 'work_orders_providers.dart';

/// Opción de tipo de vehículo (valor del backend + presentación).
class _TipoOption {
  final String value;
  final String label;
  final IconData icon;
  const _TipoOption(this.value, this.label, this.icon);
}

/// Tipos comunes en Colombia/Cartagena (moto y taxi son los más frecuentes).
const _tipoOptions = <_TipoOption>[
  _TipoOption('automovil', 'Automóvil', Icons.directions_car),
  _TipoOption('camioneta', 'Camioneta / SUV', Icons.airport_shuttle),
  _TipoOption('moto', 'Moto', Icons.two_wheeler),
  _TipoOption('taxi', 'Taxi', Icons.local_taxi),
  _TipoOption('camion', 'Camión', Icons.local_shipping),
  _TipoOption('otro', 'Otro', Icons.more_horiz),
];

class CreateOrderPage extends ConsumerStatefulWidget {
  /// Placa detectada por el escáner (OCR). Si viene, prellena y autocompleta.
  final String? initialPlaca;

  /// Ruta de la foto del vehículo capturada en el escáner. Se muestra como
  /// evidencia; su subida al backend llega en la Fase 3 (S3).
  final String? photoPath;

  const CreateOrderPage({super.key, this.initialPlaca, this.photoPath});

  @override
  ConsumerState<CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends ConsumerState<CreateOrderPage> {
  final _placa = TextEditingController();
  final _marca = TextEditingController();
  final _modelo = TextEditingController();
  final _nombre = TextEditingController();
  final _telefono = TextEditingController();
  final _email = TextEditingController();
  final _documento = TextEditingController();

  Vehicle? _matched; // vehículo existente reconocido por placa
  Customer? _owner; // cliente dueño del vehículo reconocido (si lo hay)
  String? _tipo; // tipo elegido (solo para vehículo nuevo)
  String? _selectedServiceId;
  int _qty = 1;
  final List<OrderItemInput> _items = [];
  bool _saving = false;

  double get _total => _items.fold(0, (sum, i) => sum + i.subtotal);
  bool get _isNew => _matched == null;

  @override
  void initState() {
    super.initState();
    // Prefill desde el escáner: pone la placa y dispara el autocompletado una vez
    // que las listas (vehículos/clientes) estén disponibles tras el primer frame.
    final placa = widget.initialPlaca;
    if (placa != null && placa.trim().isNotEmpty) {
      _placa.text = placa.trim().toUpperCase();
      WidgetsBinding.instance.addPostFrameCallback((_) => _onPlacaChanged(_placa.text));
    }
  }

  @override
  void dispose() {
    _placa.dispose();
    _marca.dispose();
    _modelo.dispose();
    _nombre.dispose();
    _telefono.dispose();
    _email.dispose();
    _documento.dispose();
    super.dispose();
  }

  void _clearCustomerFields() {
    _nombre.clear();
    _telefono.clear();
    _email.clear();
    _documento.clear();
  }

  /// Autocompletado: busca la placa entre los vehículos existentes y, si la
  /// encuentra, rellena tipo/marca/modelo y resuelve el cliente dueño.
  void _onPlacaChanged(String raw) {
    final placa = raw.trim().toUpperCase();
    final vehicles = ref.read(vehiclesControllerProvider).value ?? const <Vehicle>[];
    Vehicle? found;
    for (final v in vehicles) {
      if (v.placa.toUpperCase() == placa) {
        found = v;
        break;
      }
    }

    if (found?.id == _matched?.id) return; // sin cambios

    // Resuelve el cliente dueño (si el vehículo tiene uno asignado).
    Customer? owner;
    if (found?.customerId != null) {
      final customers = ref.read(customersControllerProvider).value ?? const <Customer>[];
      for (final c in customers) {
        if (c.id == found!.customerId) {
          owner = c;
          break;
        }
      }
    }

    setState(() {
      _matched = found;
      _owner = owner;
      if (found != null) {
        _tipo = found.tipo;
        _marca.text = found.marca ?? '';
        _modelo.text = found.modelo ?? '';
      } else {
        _tipo = null;
        _marca.clear();
        _modelo.clear();
      }
      if (owner != null) {
        _nombre.text = owner.nombre;
        _telefono.text = owner.telefono ?? '';
        _email.text = owner.email ?? '';
        _documento.text = owner.documento ?? '';
      } else {
        _clearCustomerFields();
      }
    });
  }

  void _addItem() {
    if (_selectedServiceId == null) return;
    final services = ref.read(servicesControllerProvider).value ?? [];
    final matches = services.where((s) => s.id == _selectedServiceId);
    if (matches.isEmpty) return;
    final service = matches.first;
    setState(() {
      _items.add(OrderItemInput(
        serviceId: service.id,
        nombre: service.nombre,
        precioUnitario: service.precio,
        cantidad: _qty,
      ));
      _selectedServiceId = null;
      _qty = 1;
    });
  }

  String? _validate() {
    if (_placa.text.trim().length < 5) return 'Ingresa una placa válida';
    if (_isNew && _tipo == null) return 'Selecciona el tipo de vehículo';
    // Primer ingreso (placa nueva): nombre y teléfono son obligatorios.
    if (_isNew && _nombre.text.trim().isEmpty) return 'El nombre del cliente es obligatorio';
    if (_isNew && _telefono.text.trim().isEmpty) return 'El teléfono del cliente es obligatorio';
    if (_items.isEmpty) return 'Agrega al menos un servicio';
    return null;
  }

  Future<void> _submit() async {
    final error = _validate();
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.orange.shade800),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      final placa = _placa.text.trim().toUpperCase();

      // 1) Resuelve el cliente: el del vehículo, o créalo si se capturó nombre.
      String? customerId = _matched?.customerId;
      if (customerId == null && _nombre.text.trim().isNotEmpty) {
        final customer = await ref.read(customerRepositoryProvider).create(
              nombre: _nombre.text.trim(),
              telefono: _telefono.text.trim(),
              email: _email.text.trim(),
              documento: _documento.text.trim(),
            );
        customerId = customer.id;
        await ref.read(customersControllerProvider.notifier).refreshList();
      }

      // 2) Resuelve el vehículo: existente o créalo (vinculado al cliente).
      String vehicleId;
      if (_matched != null) {
        vehicleId = _matched!.id;
        // Vincula un vehículo existente que aún no tenía dueño.
        if (_matched!.customerId == null && customerId != null) {
          await ref.read(vehicleRepositoryProvider).linkCustomer(vehicleId, customerId);
          await ref.read(vehiclesControllerProvider.notifier).refreshList();
        }
      } else {
        final created = await ref.read(vehicleRepositoryProvider).create(
              placa: placa,
              tipo: _tipo!,
              marca: _marca.text.trim(),
              modelo: _modelo.text.trim(),
              customerId: customerId,
            );
        vehicleId = created.id;
        await ref.read(vehiclesControllerProvider.notifier).refreshList();
      }

      // 3) Sube la foto a S3 (si hay) y obtiene su key. Si falla, la orden se
      //    crea igual sin foto (no bloquea el registro del ingreso).
      String? fotoKey;
      if (widget.photoPath != null) {
        fotoKey = await ref.read(photoUploaderProvider).upload(widget.photoPath!);
      }

      // 4) Crea la orden de lavado, enlazada al vehículo, al cliente y la foto.
      await ref.read(workOrdersControllerProvider.notifier).create(
            vehicleId: vehicleId,
            customerId: customerId,
            items: _items,
            fotoKey: fotoKey,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ingreso registrado ✅'), backgroundColor: Colors.green),
        );
        Navigator.of(context).pop();
      }
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
    final services = ref.watch(servicesControllerProvider);
    // Mantiene cargadas las listas que alimentan el autocompletado de placa.
    ref.watch(vehiclesControllerProvider);
    ref.watch(customersControllerProvider);
    final placaLista = _placa.text.trim().length >= 5;

    return Scaffold(
      appBar: AppBar(title: const Text('Registrar ingreso')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.paddingOf(context).bottom + 96),
        children: [
          // ── Foto del vehículo (capturada en el escáner) ──
          if (widget.photoPath != null) ...[
            _PhotoPreview(path: widget.photoPath!),
            const SizedBox(height: 20),
          ],

          // ── Placa (autocompletado) ──
          Text('Placa', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          TextField(
            controller: _placa,
            autofocus: true,
            textCapitalization: TextCapitalization.characters,
            inputFormatters: [
              UpperCaseTextFormatter(),
              LengthLimitingTextInputFormatter(10),
            ],
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 2),
            decoration: InputDecoration(
              hintText: 'ABC123',
              border: const OutlineInputBorder(),
              prefixIcon: const Icon(Icons.pin),
              suffixIcon: placaLista
                  ? Icon(_matched != null ? Icons.check_circle : Icons.fiber_new,
                      color: _matched != null ? Colors.green : Colors.blue)
                  : null,
            ),
            onChanged: _onPlacaChanged,
          ),
          if (placaLista) ...[
            const SizedBox(height: 6),
            _RecognitionBanner(matched: _matched),
          ],
          const SizedBox(height: 20),

          // ── Tipo de vehículo (solo si es nuevo) ──
          if (placaLista && _isNew) ...[
            Text('Tipo de vehículo', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            _VehicleTypeGrid(
              selected: _tipo,
              onSelected: (t) => setState(() => _tipo = t),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _marca,
                    decoration: const InputDecoration(
                        labelText: 'Marca (opcional)', border: OutlineInputBorder()),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _modelo,
                    decoration: const InputDecoration(
                        labelText: 'Modelo (opcional)', border: OutlineInputBorder()),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],

          // ── Cliente ──
          if (placaLista) ...[
            Text(
              _isNew ? 'Datos del cliente (primer ingreso)' : 'Cliente',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (_owner != null)
              _OwnerCard(owner: _owner!)
            else ...[
              if (!_isNew)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    'Este vehículo no tiene cliente asociado. Puedes vincularlo (opcional).',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  ),
                ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _nombre,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        labelText: _isNew ? 'Nombre *' : 'Nombre',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.person_outline),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _telefono,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: _isNew ? 'Teléfono *' : 'Teléfono',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.phone_outlined),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                          labelText: 'Email (opcional)', border: OutlineInputBorder()),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _documento,
                      decoration: const InputDecoration(
                          labelText: 'Documento (opcional)', border: OutlineInputBorder()),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 20),
          ],

          // ── Servicios ──
          Text('Servicios', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedServiceId,
                  isExpanded: true,
                  decoration:
                      const InputDecoration(border: OutlineInputBorder(), hintText: 'Servicio'),
                  items: (services.value ?? [])
                      .map((s) => DropdownMenuItem(
                          value: s.id, child: Text('${s.nombre} (${formatCop(s.precio)})')))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedServiceId = v),
                ),
              ),
              const SizedBox(width: 8),
              _QtyStepper(value: _qty, onChanged: (q) => setState(() => _qty = q)),
              IconButton.filled(onPressed: _addItem, icon: const Icon(Icons.add)),
            ],
          ),
          const SizedBox(height: 12),

          ..._items.asMap().entries.map((e) {
            final i = e.value;
            return Card(
              child: ListTile(
                title: Text('${i.nombre} x${i.cantidad}'),
                subtitle: Text('${formatCop(i.precioUnitario)} c/u'),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(formatCop(i.subtotal), style: const TextStyle(fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () => setState(() => _items.removeAt(e.key)),
                    ),
                  ],
                ),
              ),
            );
          }),

          if (_items.isNotEmpty) ...[
            const Divider(),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text(formatCop(_total),
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              ],
            ),
          ],
          const SizedBox(height: 24),

          // ── CTA de alto contraste ──
          PrimaryActionButton(
            label: 'Registrar ingreso',
            icon: Icons.login,
            loading: _saving,
            onPressed: _saving ? null : _submit,
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }
}

/// Tarjeta de cliente reconocido (placa con dueño ya en el sistema).
class _OwnerCard extends StatelessWidget {
  final Customer owner;
  const _OwnerCard({required this.owner});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      elevation: 0,
      color: scheme.primaryContainer.withValues(alpha: 0.4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: scheme.primary,
          child: Text(
            owner.nombre.isNotEmpty ? owner.nombre[0].toUpperCase() : '?',
            style: TextStyle(color: scheme.onPrimary, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(owner.nombre, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text([
          if (owner.telefono != null) owner.telefono!,
          if (owner.email != null) owner.email!,
        ].join(' · ')),
        trailing: const Icon(Icons.verified_user, color: Colors.green),
      ),
    );
  }
}

/// Banner que indica si la placa corresponde a un vehículo conocido o nuevo.
class _RecognitionBanner extends StatelessWidget {
  final Vehicle? matched;
  const _RecognitionBanner({required this.matched});

  @override
  Widget build(BuildContext context) {
    final known = matched != null;
    final color = known ? Colors.green : Colors.blue;
    final text = known
        ? 'Vehículo reconocido: ${[
            matched!.tipo,
            if (matched!.marca != null) matched!.marca!,
            if (matched!.modelo != null) matched!.modelo!,
          ].join(' · ')}'
        : 'Vehículo nuevo — selecciona el tipo y registra al cliente';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(known ? Icons.verified : Icons.info_outline, color: color, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(color: color, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

/// Grid de botones grandes y táctiles para elegir el tipo de vehículo
/// (reemplaza al dropdown). Cada celda supera el mínimo de 48×48px.
class _VehicleTypeGrid extends StatelessWidget {
  final String? selected;
  final ValueChanged<String> onSelected;
  const _VehicleTypeGrid({required this.selected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      childAspectRatio: 1.5,
      children: _tipoOptions.map((o) {
        final isSel = o.value == selected;
        return Material(
          color: isSel ? scheme.primary : scheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () => onSelected(o.value),
            child: Container(
              constraints: const BoxConstraints(minHeight: 64, minWidth: 64),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSel ? scheme.primary : scheme.outlineVariant,
                  width: isSel ? 2 : 1,
                ),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(o.icon,
                      size: 26, color: isSel ? scheme.onPrimary : scheme.onSurfaceVariant),
                  const SizedBox(height: 6),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      o.label,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: isSel ? scheme.onPrimary : scheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _QtyStepper extends StatelessWidget {
  final int value;
  final ValueChanged<int> onChanged;
  const _QtyStepper({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          onPressed: value > 1 ? () => onChanged(value - 1) : null,
          icon: const Icon(Icons.remove),
          visualDensity: VisualDensity.compact,
        ),
        Text('$value', style: const TextStyle(fontWeight: FontWeight.bold)),
        IconButton(
          onPressed: () => onChanged(value + 1),
          icon: const Icon(Icons.add),
          visualDensity: VisualDensity.compact,
        ),
      ],
    );
  }
}

/// Miniatura de la foto del vehículo capturada en el escáner. Marca que la foto
/// quedará lista para subir (la persistencia en S3 llega en la Fase 3).
class _PhotoPreview extends StatelessWidget {
  final String path;
  const _PhotoPreview({required this.path});

  @override
  Widget build(BuildContext context) {
    final faint = Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          child: Image.file(
            File(path),
            height: 200,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            Icon(Icons.photo_camera, size: 15, color: faint),
            const SizedBox(width: 6),
            Text('Foto del vehículo capturada', style: TextStyle(color: faint, fontSize: 13)),
          ],
        ),
      ],
    );
  }
}

/// Fuerza mayúsculas en el campo de placa mientras se escribe.
class UpperCaseTextFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    return newValue.copyWith(text: newValue.text.toUpperCase());
  }
}
