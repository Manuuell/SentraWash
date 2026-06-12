import 'package:flutter/material.dart';

/// Una etapa operativa del lavado, con su color semántico y rótulo. El `estado`
/// es el valor que entiende el backend.
class WashStage {
  final String estado;
  final String label;
  final Color color;
  final IconData icon;
  const WashStage(this.estado, this.label, this.color, this.icon);
}

/// Las 4 columnas del tablero Kanban, en orden del flujo:
/// En Espera (amarillo) → Lavado (azul) → Secado (celeste) → Listo (verde).
const kanbanStages = <WashStage>[
  WashStage('recibido', 'En Espera', Color(0xFFF59E0B), Icons.hourglass_top),
  WashStage('en_proceso', 'Lavado', Color(0xFF2563EB), Icons.local_car_wash),
  WashStage('secado', 'Secado', Color(0xFF38BDF8), Icons.air),
  WashStage('listo', 'Listo', Color(0xFF16A34A), Icons.check_circle),
];

/// Color de un estado (incluye los terminales que no son columnas).
Color estadoColor(String estado) => switch (estado) {
      'recibido' => const Color(0xFFF59E0B),
      'en_proceso' => const Color(0xFF2563EB),
      'secado' => const Color(0xFF38BDF8),
      'listo' => const Color(0xFF16A34A),
      'entregado' => const Color(0xFF0D9488),
      'cancelado' => const Color(0xFFDC2626),
      _ => Colors.grey,
    };

/// Etiqueta legible de un estado (sin guiones bajos), para chips y listados.
String estadoLabel(String estado) => switch (estado) {
      'recibido' => 'Recibido',
      'en_proceso' => 'En proceso',
      'secado' => 'Secado',
      'listo' => 'Listo',
      'entregado' => 'Entregado',
      'cancelado' => 'Cancelado',
      _ => estado.replaceAll('_', ' '),
    };

/// Texto del botón de avance según el próximo estado.
String advanceLabel(String? next) => switch (next) {
      'en_proceso' => 'Iniciar lavado',
      'secado' => 'Pasar a secado',
      'listo' => 'Marcar listo',
      'entregado' => 'Entregar',
      _ => 'Avanzar',
    };
