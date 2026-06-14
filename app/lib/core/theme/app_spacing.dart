import 'package:flutter/widgets.dart';

/// Tokens de espaciado, radios y duraciones (grilla de 8pt, estilo iOS).
/// Centralizarlos mantiene la app visualmente consistente.
abstract final class AppSpacing {
  // Espacios
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double xxl = 32;

  // Radios de esquina (iOS usa radios generosos)
  static const double radiusSm = 10;
  static const double radius = 14;
  static const double radiusLg = 20;
  static const double radiusXl = 28;

  // Grosor de los divisores hairline de iOS
  static const double hairline = 0.5;

  // Paddings reutilizables
  static const EdgeInsets page = EdgeInsets.all(lg);
  static const EdgeInsets section = EdgeInsets.symmetric(horizontal: lg, vertical: sm);

  // Duraciones de animación (suaves, estilo Apple)
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
}

/// Colores semánticos fijos del sistema (no dependen del tema), inspirados en
/// los colores del sistema de iOS. Úsalos para acentos y estados.
abstract final class AppColors {
  static const Color brand = Color(0xFF0F6FFF);
  static const Color blue = Color(0xFF0A84FF);
  static const Color green = Color(0xFF34C759);
  static const Color orange = Color(0xFFFF9F0A);
  static const Color red = Color(0xFFFF3B30);
  static const Color teal = Color(0xFF30B0C7);
  static const Color cyan = Color(0xFF32ADE6);

  // Grises del sistema (separadores y texto secundario)
  static const Color separatorLight = Color(0x5C3C3C43); // ~36% gris
  static const Color separatorDark = Color(0x5CFFFFFF);

  // Fondos "system grouped"
  static const Color groupedBgLight = Color(0xFFF2F2F7);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color groupedBgDark = Color(0xFF000000);
  static const Color cardDark = Color(0xFF1C1C1E);
}
