import 'package:intl/intl.dart';

final _cop = NumberFormat.currency(locale: 'es_CO', symbol: r'$', decimalDigits: 0);

/// Formatea un valor monetario en pesos colombianos (ej: $20.000).
String formatCop(num value) => _cop.format(value);

/// Tiempo transcurrido legible desde [since] hasta ahora (ej: "8 min",
/// "1 h 20 min"). Pensado para el reloj operativo de las tarjetas Kanban.
String formatElapsed(DateTime since) {
  final mins = DateTime.now().difference(since).inMinutes;
  if (mins < 1) return 'ahora';
  if (mins < 60) return '$mins min';
  final h = mins ~/ 60;
  final m = mins % 60;
  return m == 0 ? '$h h' : '$h h $m min';
}
