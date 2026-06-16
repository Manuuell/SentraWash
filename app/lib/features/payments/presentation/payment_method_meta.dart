import 'package:flutter/material.dart';

/// Método de pago (valor del backend + presentación).
class PaymentMethodMeta {
  final String value;
  final String label;
  final IconData icon;
  const PaymentMethodMeta(this.value, this.label, this.icon);
}

/// Métodos habituales en Colombia (coinciden con el enum del backend).
const paymentMethods = <PaymentMethodMeta>[
  PaymentMethodMeta('efectivo', 'Efectivo', Icons.payments),
  PaymentMethodMeta('nequi', 'Nequi', Icons.smartphone),
  PaymentMethodMeta('daviplata', 'Daviplata', Icons.smartphone),
  PaymentMethodMeta('tarjeta', 'Tarjeta', Icons.credit_card),
  PaymentMethodMeta('transferencia', 'Transferencia', Icons.account_balance),
];

String paymentMethodLabel(String value) =>
    paymentMethods.firstWhere((m) => m.value == value, orElse: () => paymentMethods.last).label;

IconData paymentMethodIcon(String value) =>
    paymentMethods.firstWhere((m) => m.value == value, orElse: () => paymentMethods.last).icon;
