import 'package:flutter/material.dart';

import '../theme/app_spacing.dart';

/// Sección de lista agrupada estilo *Ajustes de iOS*: un encabezado opcional en
/// mayúsculas suaves y un contenedor redondeado cuyas filas se separan con
/// divisores hairline. Reemplaza el uso suelto de `Card` en listas para dar el
/// aspecto "inset grouped" característico de Apple.
class InsetSection extends StatelessWidget {
  final List<Widget> children;
  final String? header;
  final String? footer;

  /// Inserta divisores hairline entre las filas (por defecto sí).
  final bool divided;

  const InsetSection({
    super.key,
    required this.children,
    this.header,
    this.footer,
    this.divided = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.5);

    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      rows.add(children[i]);
      if (divided && i < children.length - 1) {
        rows.add(Divider(height: AppSpacing.hairline, indent: AppSpacing.lg));
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (header != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.sm),
            child: Text(
              header!.toUpperCase(),
              style: theme.textTheme.labelSmall?.copyWith(
                color: faint,
                letterSpacing: 0.6,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        Card(child: Column(mainAxisSize: MainAxisSize.min, children: rows)),
        if (footer != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 0),
            child: Text(footer!, style: theme.textTheme.bodySmall?.copyWith(color: faint)),
          ),
      ],
    );
  }
}

/// Tarjeta simple con el estilo de la app (superficie redondeada y plana).
/// Útil cuando quieres un bloque agrupado sin la semántica de lista.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpacing.lg),
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        child: Padding(padding: padding, child: child),
      ),
    );
  }
}
