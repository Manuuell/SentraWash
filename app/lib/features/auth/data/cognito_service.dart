import 'dart:convert';

import 'package:amazon_cognito_identity_dart_2/cognito.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../core/config/app_config.dart';

/// Decodifica el payload de un JWT (sin validar firma — eso lo hace el backend).
Map<String, dynamic> decodeJwt(String token) {
  final parts = token.split('.');
  if (parts.length != 3) return const {};
  try {
    final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
    return jsonDecode(payload) as Map<String, dynamic>;
  } catch (_) {
    return const {};
  }
}

/// `true` si el JWT ya expiró (con 30s de margen).
bool isJwtExpired(String token) {
  final exp = decodeJwt(token)['exp'];
  if (exp is! int) return true;
  final expiry = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
  return DateTime.now().isAfter(expiry.subtract(const Duration(seconds: 30)));
}

/// Acceso a Amazon Cognito (login por SRP) y guardado seguro de tokens.
class CognitoService {
  final CognitoUserPool _pool;
  final FlutterSecureStorage _storage;

  CognitoService()
      : _pool = CognitoUserPool(AppConfig.cognitoUserPoolId, AppConfig.cognitoClientId),
        _storage = const FlutterSecureStorage();

  static const _kIdToken = 'cognito_id_token';
  static const _kRefreshToken = 'cognito_refresh_token';

  Future<String?> storedIdToken() => _storage.read(key: _kIdToken);

  /// Inicia sesión. Devuelve el **idToken** (contiene `custom:tenant_id`).
  /// Lanza [AuthException] con un mensaje legible si falla.
  Future<String> signIn(String email, String password) async {
    final user = CognitoUser(email, _pool);
    final details = AuthenticationDetails(username: email, password: password);
    try {
      final session = await user.authenticateUser(details);
      final idToken = session?.getIdToken().getJwtToken();
      final refresh = session?.getRefreshToken()?.getToken();
      if (idToken == null) throw const AuthException('No se recibió token de sesión');
      await _storage.write(key: _kIdToken, value: idToken);
      if (refresh != null) await _storage.write(key: _kRefreshToken, value: refresh);
      return idToken;
    } on CognitoUserNewPasswordRequiredException {
      throw const AuthException(
          'Tu usuario requiere cambiar la contraseña. Pídele al administrador una contraseña permanente.');
    } on CognitoClientException catch (e) {
      throw AuthException(_friendly(e.message ?? e.code ?? 'Error de autenticación'));
    } catch (e) {
      throw AuthException(_friendly(e.toString()));
    }
  }

  Future<void> signOut() async {
    await _storage.delete(key: _kIdToken);
    await _storage.delete(key: _kRefreshToken);
  }

  String _friendly(String raw) {
    final m = raw.toLowerCase();
    if (m.contains('notauthorized') || m.contains('incorrect')) {
      return 'Correo o contraseña incorrectos';
    }
    if (m.contains('usernotfound')) return 'No existe un usuario con ese correo';
    if (m.contains('network')) return 'Sin conexión con el servidor de autenticación';
    return raw;
  }
}

class AuthException implements Exception {
  final String message;
  const AuthException(this.message);
  @override
  String toString() => message;
}
