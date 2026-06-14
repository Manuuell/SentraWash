import 'package:flutter/material.dart';

import '../theme/app_spacing.dart';

/// Presenta un formulario/acción como **bottom sheet** estilo iOS (con handle,
/// título y botón de cierre), en vez de un `AlertDialog`. Se ajusta al teclado y
/// puede crecer hasta casi toda la pantalla.
///
/// Devuelve el valor con el que se cierre la hoja (`Navigator.pop(context, x)`).
Future<T?> showAppSheet<T>({
  required BuildContext context,
  required String title,
  required WidgetBuilder builder,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (ctx) => _AppSheetScaffold(title: title, child: builder(ctx)),
  );
}

class _AppSheetScaffold extends StatelessWidget {
  final String title;
  final Widget child;
  const _AppSheetScaffold({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // El padding inferior sigue al teclado para que los campos no queden tapados.
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.sm, AppSpacing.xs),
            child: Row(
              children: [
                Expanded(
                  child: Text(title, style: theme.textTheme.titleLarge),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  style: IconButton.styleFrom(
                    backgroundColor: theme.colorScheme.onSurface.withValues(alpha: 0.06),
                  ),
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
              ],
            ),
          ),
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.xl),
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}
