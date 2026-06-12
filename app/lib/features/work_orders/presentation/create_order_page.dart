import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/error/failure.dart';
import '../../../core/utils/format.dart';
import '../../services/presentation/services_providers.dart';
import '../../vehicles/presentation/vehicles_providers.dart';
import '../domain/order_item_input.dart';
import 'work_orders_providers.dart';

class CreateOrderPage extends ConsumerStatefulWidget {
  const CreateOrderPage({super.key});

  @override
  ConsumerState<CreateOrderPage> createState() => _CreateOrderPageState();
}

class _CreateOrderPageState extends ConsumerState<CreateOrderPage> {
  String? _vehicleId;
  String? _selectedServiceId;
  int _qty = 1;
  final List<OrderItemInput> _items = [];
  bool _saving = false;

  double get _total => _items.fold(0, (sum, i) => sum + i.subtotal);

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

  Future<void> _submit() async {
    if (_vehicleId == null || _items.isEmpty) return;
    setState(() => _saving = true);
    try {
      await ref.read(workOrdersControllerProvider.notifier).create(
            vehicleId: _vehicleId!,
            items: _items,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Orden creada ✅'), backgroundColor: Colors.green),
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
    final vehicles = ref.watch(vehiclesControllerProvider);
    final services = ref.watch(servicesControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Nueva orden')),
      body: (vehicles.isLoading || services.isLoading)
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── Vehículo ──
                Text('Vehículo', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _vehicleId,
                  decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Selecciona un vehículo'),
                  items: (vehicles.value ?? [])
                      .map((v) => DropdownMenuItem(value: v.id, child: Text('${v.placa} · ${v.tipo}')))
                      .toList(),
                  onChanged: (v) => setState(() => _vehicleId = v),
                ),
                const SizedBox(height: 24),

                // ── Agregar servicio ──
                Text('Servicios', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedServiceId,
                        isExpanded: true,
                        decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'Servicio'),
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

                // ── Items agregados ──
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
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
                const SizedBox(height: 24),
                FilledButton.icon(
                  onPressed: (_vehicleId != null && _items.isNotEmpty && !_saving) ? _submit : null,
                  icon: _saving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.check),
                  label: const Text('Crear orden'),
                ),
              ],
            ),
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
