import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../tenant/tenant_provider.dart';
import '../../features/auth/presentation/auth_providers.dart';

/// Cliente HTTP (Dio) con la base de la API y un interceptor que, en cada
/// petición, inyecta:
///  - `Authorization: Bearer <idToken>` si hay sesión de Cognito,
///  - `x-tenant-id` resuelto del token (o el tenant por defecto si no hay auth).
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final auth = ref.read(authControllerProvider);
        options.headers['x-tenant-id'] = auth.tenantId ?? ref.read(tenantProvider);
        if (auth.idToken != null) {
          options.headers['Authorization'] = 'Bearer ${auth.idToken}';
        }
        handler.next(options);
      },
    ),
  );

  return dio;
});
