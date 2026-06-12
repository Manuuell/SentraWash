import 'package:flutter/material.dart';

/// Tema de la app. `fromBranding` habilita el white-label: construir el tema con
/// el color de cada lavadero (tenant_settings.branding) en el futuro.
class AppTheme {
  static const Color brandColor = Color(0xFF0F6FFF);

  static ThemeData light() => fromBranding();

  static ThemeData dark() => fromBranding(brightness: Brightness.dark);

  static ThemeData fromBranding({
    Color seed = brandColor,
    Brightness brightness = Brightness.light,
  }) {
    final scheme = ColorScheme.fromSeed(seedColor: seed, brightness: brightness);
    final isDark = brightness == Brightness.dark;
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      appBarTheme: AppBarTheme(
        // En claro, barra con el color de marca; en oscuro, superficie sobria.
        backgroundColor: isDark ? scheme.surface : scheme.primary,
        foregroundColor: isDark ? scheme.onSurface : scheme.onPrimary,
        elevation: 0,
      ),
    );
  }
}
