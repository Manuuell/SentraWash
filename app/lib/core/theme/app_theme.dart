import 'package:flutter/cupertino.dart' show CupertinoPageTransitionsBuilder;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_spacing.dart';

/// Tema de la app: **Apple-inspired sobre Material 3**. Tipografía Inter
/// (sustituta libre de SF Pro), fondos "system grouped" de iOS, esquinas
/// generosas, bordes hairline en vez de sombras y transiciones tipo iOS.
///
/// `fromBranding` habilita el white-label: en el futuro se construye el tema con
/// el color de cada lavadero (tenant_settings.branding).
class AppTheme {
  static const Color brandColor = AppColors.brand;

  static ThemeData light() => fromBranding();
  static ThemeData dark() => fromBranding(brightness: Brightness.dark);

  static ThemeData fromBranding({
    Color seed = brandColor,
    Brightness brightness = Brightness.light,
  }) {
    final isDark = brightness == Brightness.dark;

    // Partimos del esquema generado por la semilla y sobreescribimos las
    // superficies para lograr el look "grouped" de iOS: fondo gris/negro con
    // tarjetas blancas/gris-oscuro por encima.
    final scheme = ColorScheme.fromSeed(seedColor: seed, brightness: brightness).copyWith(
      primary: seed,
      surface: isDark ? AppColors.cardDark : AppColors.cardLight,
    );

    final scaffoldBg = isDark ? AppColors.groupedBgDark : AppColors.groupedBgLight;
    final card = isDark ? AppColors.cardDark : AppColors.cardLight;
    final separator = isDark ? AppColors.separatorDark : AppColors.separatorLight;
    final onSurfaceFaint = scheme.onSurface.withValues(alpha: 0.55);

    final baseText = isDark ? Typography.whiteCupertino : Typography.blackCupertino;
    final textTheme = GoogleFonts.interTextTheme(baseText).copyWith(
      // Títulos un poco más apretados y con peso, como en iOS.
      headlineSmall: GoogleFonts.inter(fontWeight: FontWeight.w700, letterSpacing: -0.4),
      titleLarge: GoogleFonts.inter(fontWeight: FontWeight.w700, letterSpacing: -0.3),
      titleMedium: GoogleFonts.inter(fontWeight: FontWeight.w600, letterSpacing: -0.2),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: scaffoldBg,
      canvasColor: scaffoldBg,
      textTheme: textTheme,
      splashFactory: InkSparkle.splashFactory,

      // Transiciones de página estilo iOS en todas las plataformas.
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: CupertinoPageTransitionsBuilder(),
          TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
        },
      ),

      // Barra superior limpia: se funde con el fondo (estilo iOS large title).
      appBarTheme: AppBarTheme(
        backgroundColor: scaffoldBg,
        foregroundColor: scheme.onSurface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.3,
          color: scheme.onSurface,
        ),
      ),

      // Tarjetas planas con esquinas generosas (sin sombra; el contraste lo da
      // el color de superficie sobre el fondo grouped).
      cardTheme: CardThemeData(
        color: card,
        elevation: 0,
        margin: EdgeInsets.zero,
        surfaceTintColor: Colors.transparent,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusLg)),
      ),

      // Botón principal: ancho, alto cómodo, esquinas iOS, texto con peso.
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(50),
          backgroundColor: scheme.primary,
          foregroundColor: scheme.onPrimary,
          textStyle: GoogleFonts.inter(fontSize: 17, fontWeight: FontWeight.w600, letterSpacing: -0.2),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radius)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: scheme.primary,
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(50),
          foregroundColor: scheme.primary,
          side: BorderSide(color: separator),
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radius)),
        ),
      ),

      // Campos de texto estilo iOS: relleno suave, sin borde visible en reposo.
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? Colors.white.withValues(alpha: 0.06) : Colors.black.withValues(alpha: 0.04),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: TextStyle(color: onSurfaceFaint),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radius),
          borderSide: BorderSide(color: scheme.primary, width: 1.5),
        ),
      ),

      // Barra inferior translúcida y sobria.
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: (isDark ? AppColors.cardDark : Colors.white).withValues(alpha: 0.92),
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        height: 64,
        indicatorColor: scheme.primary.withValues(alpha: 0.14),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => GoogleFonts.inter(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: states.contains(WidgetState.selected) ? scheme.primary : onSurfaceFaint,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected) ? scheme.primary : onSurfaceFaint,
          ),
        ),
      ),
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: scaffoldBg,
        indicatorColor: scheme.primary.withValues(alpha: 0.14),
        selectedIconTheme: IconThemeData(color: scheme.primary),
        selectedLabelTextStyle: GoogleFonts.inter(color: scheme.primary, fontWeight: FontWeight.w600),
      ),

      // Hojas y diálogos con esquinas grandes.
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: card,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusLg)),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: card,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusLg)),
      ),

      dividerTheme: DividerThemeData(
        color: separator,
        thickness: AppSpacing.hairline,
        space: AppSpacing.hairline,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radius)),
      ),
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radius)),
      ),
      listTileTheme: const ListTileThemeData(
        contentPadding: EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 2),
      ),
    );
  }
}
