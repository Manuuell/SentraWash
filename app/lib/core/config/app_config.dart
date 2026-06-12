/// Configuración de la app. Sobrescribible en compilación con --dart-define.
class AppConfig {
  /// Base de la API. En web/desktop dev: localhost. En emulador Android usa
  /// 10.0.2.2 (ej: flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1).
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api/v1',
  );

  /// Tenant por defecto en desarrollo (cuando AUTH_ENABLED=false en el backend,
  /// el tenant viaja por header). En producción se obtiene del JWT de Cognito.
  static const String defaultTenantId = String.fromEnvironment(
    'TENANT_ID',
    defaultValue: 'ef5c9f7e-f6d8-48d0-84b3-d1dd7d99c1a5',
  );
}
