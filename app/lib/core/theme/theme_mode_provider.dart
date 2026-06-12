import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Mantiene el modo de tema (claro/oscuro/sistema). Arranca en `system` y se
/// alterna con [ThemeModeNotifier.toggle] desde el dashboard o la navegación.
class ThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.system;

  void toggle() {
    final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
    final isDark = state == ThemeMode.dark ||
        (state == ThemeMode.system && brightness == Brightness.dark);
    state = isDark ? ThemeMode.light : ThemeMode.dark;
  }
}

final themeModeProvider =
    NotifierProvider<ThemeModeNotifier, ThemeMode>(ThemeModeNotifier.new);
