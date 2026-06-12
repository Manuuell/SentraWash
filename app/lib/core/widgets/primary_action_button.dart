import 'package:flutter/material.dart';

/// Botón de acción principal de **alto contraste** pensado para entornos de
/// trabajo rápido (cajeros). Da feedback visual inmediato:
///  - *hover*: se eleva y aclara (escritorio/web),
///  - *active/pressed*: se hunde con una micro-escala.
/// Altura mínima 56px (cómoda para pantallas táctiles).
class PrimaryActionButton extends StatefulWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool loading;

  const PrimaryActionButton({
    super.key,
    required this.label,
    this.icon,
    this.onPressed,
    this.loading = false,
  });

  @override
  State<PrimaryActionButton> createState() => _PrimaryActionButtonState();
}

class _PrimaryActionButtonState extends State<PrimaryActionButton> {
  bool _hovering = false;
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final enabled = widget.onPressed != null && !widget.loading;
    final bg = !enabled
        ? scheme.surfaceContainerHighest
        : _pressed
            ? Color.alphaBlend(Colors.black26, scheme.primary)
            : _hovering
                ? Color.alphaBlend(Colors.white24, scheme.primary)
                : scheme.primary;

    return MouseRegion(
      cursor: enabled ? SystemMouseCursors.click : SystemMouseCursors.basic,
      onEnter: (_) => setState(() => _hovering = true),
      onExit: (_) => setState(() => _hovering = false),
      child: GestureDetector(
        onTapDown: enabled ? (_) => setState(() => _pressed = true) : null,
        onTapUp: enabled ? (_) => setState(() => _pressed = false) : null,
        onTapCancel: enabled ? () => setState(() => _pressed = false) : null,
        onTap: enabled ? widget.onPressed : null,
        child: AnimatedScale(
          scale: _pressed ? 0.97 : 1,
          duration: const Duration(milliseconds: 90),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            height: 56,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(14),
              boxShadow: enabled && (_hovering && !_pressed)
                  ? [BoxShadow(color: scheme.primary.withValues(alpha: 0.45), blurRadius: 16, offset: const Offset(0, 6))]
                  : const [],
            ),
            child: Center(
              child: widget.loading
                  ? SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: scheme.onPrimary),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (widget.icon != null) ...[
                          Icon(widget.icon, color: scheme.onPrimary, size: 22),
                          const SizedBox(width: 10),
                        ],
                        Text(
                          widget.label,
                          style: TextStyle(
                            color: enabled ? scheme.onPrimary : scheme.onSurfaceVariant,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
