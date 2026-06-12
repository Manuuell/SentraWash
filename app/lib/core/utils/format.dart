import 'package:intl/intl.dart';

final _cop = NumberFormat.currency(locale: 'es_CO', symbol: r'$', decimalDigits: 0);

/// Formatea un valor monetario en pesos colombianos (ej: $20.000).
String formatCop(num value) => _cop.format(value);
