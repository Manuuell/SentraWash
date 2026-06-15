import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../data/cognito_service.dart';

final cognitoServiceProvider = Provider<CognitoService>((ref) => CognitoService());

/// Estado de autenticación de la app.
class AuthState {
  /// `true` mientras se restaura la sesión guardada al arrancar.
  final bool loading;
  final bool authenticated;
  final String? idToken;
  final String? tenantId;
  final String? email;

  const AuthState({
    this.loading = false,
    this.authenticated = false,
    this.idToken,
    this.tenantId,
    this.email,
  });
}

class AuthController extends Notifier<AuthState> {
  CognitoService get _svc => ref.read(cognitoServiceProvider);

  @override
  AuthState build() {
    // Sin Cognito configurado: la app no exige login (usa el tenant por defecto).
    if (!AppConfig.authEnabled) return const AuthState();
    // Con Cognito: intenta restaurar la sesión guardada.
    _restore();
    return const AuthState(loading: true);
  }

  Future<void> _restore() async {
    final idToken = await _svc.storedIdToken();
    if (idToken != null && !isJwtExpired(idToken)) {
      state = _fromToken(idToken);
    } else {
      state = const AuthState();
    }
  }

  Future<void> signIn(String email, String password) async {
    final idToken = await _svc.signIn(email.trim(), password);
    state = _fromToken(idToken);
  }

  Future<void> signOut() async {
    await _svc.signOut();
    state = const AuthState();
  }

  AuthState _fromToken(String idToken) {
    final claims = decodeJwt(idToken);
    return AuthState(
      authenticated: true,
      idToken: idToken,
      tenantId: claims['custom:tenant_id'] as String?,
      email: claims['email'] as String?,
    );
  }
}

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
