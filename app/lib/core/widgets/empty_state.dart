import 'package:flutter/material.dart';

import '../theme/app_spacing.dart';

/// Estado vacío reutilizable y *accionable*: además del mensaje, ofrece un
/// botón que guía al usuario a la siguiente acción (ej. crear el primer
/// registro). Se renderiza como `ListView` para seguir funcionando dentro de
/// un `RefreshIndicator`.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? actionLabel;
  final IconData actionIcon;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.message,
    this.actionLabel,
    this.actionIcon = Icons.add,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final faint = theme.colorScheme.onSurface.withValues(alpha: 0.5);

    return ListView(
      children: [
        const SizedBox(height: 120),
        // Ícono dentro de un círculo suave, estilo iOS.
        Center(
          child: Container(
            width: 88,
            height: 88,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 40, color: faint),
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(color: faint),
            ),
          ),
        ),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: AppSpacing.xl),
          Center(
            child: FilledButton.icon(
              onPressed: onAction,
              icon: Icon(actionIcon),
              label: Text(actionLabel!),
              style: FilledButton.styleFrom(minimumSize: const Size(0, 50)),
            ),
          ),
        ],
      ],
    );
  }
}
