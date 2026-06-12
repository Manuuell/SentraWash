import 'package:flutter/material.dart';

/// Tema de la app. `fromBranding` habilita el white-label: construir el tema con
/// el color de cada lavadero (tenant_settings.branding) en el futuro.
class AppTheme {
  static const Color brandColor = Color(0xFF0F6FFF);

  static ThemeData light() => fromBranding();

  static ThemeData fromBranding({Color seed = brandColor}) {
    final scheme = ColorScheme.fromSeed(seedColor: seed);
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      appBarTheme: AppBarTheme(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        elevation: 0,
      ),
    );
  }
}
