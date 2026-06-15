/// Configuración de la app. Sobrescribible en compilación con --dart-define.
class AppConfig {
  /// Base de la API. Por defecto apunta al backend de producción en el VPS, así
  /// `flutter run` (sin flags) ya consume el backend real. Para apuntar a un
  /// backend local pasa, por ejemplo:
  ///   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://sentrawash.duckdns.org/api/v1',
  );

  /// Tenant por defecto (lavadero demo sembrado en el VPS). Mientras
  /// AUTH_ENABLED=false el tenant viaja por header; con Cognito vendrá del JWT.
  /// Sobrescribible con --dart-define=TENANT_ID=...
  static const String defaultTenantId = String.fromEnvironment(
    'TENANT_ID',
    defaultValue: '90d5bd4d-3e4c-4540-9935-7cd7e7adc885',
  );

  // ── Cognito (autenticación) ──
  // Mientras estos estén vacíos, la app NO exige login y usa el tenant por
  // defecto (comportamiento actual). Al definir el User Pool y el Client, el
  // login se activa solo. Pasar en compilación:
  //   --dart-define=COGNITO_USER_POOL_ID=us-east-1_xxxx
  //   --dart-define=COGNITO_CLIENT_ID=xxxxxxxx
  static const String cognitoUserPoolId = String.fromEnvironment(
    'COGNITO_USER_POOL_ID',
    defaultValue: 'us-east-1_zeLVcwtsu',
  );
  static const String cognitoClientId = String.fromEnvironment(
    'COGNITO_CLIENT_ID',
    defaultValue: '1i19qttnj11rubsuvp8ivr87lc',
  );

  /// `true` cuando Cognito está configurado → la app exige login.
  static bool get authEnabled =>
      cognitoUserPoolId.isNotEmpty && cognitoClientId.isNotEmpty;
}
