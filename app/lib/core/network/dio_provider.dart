import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../tenant/tenant_provider.dart';

/// Cliente HTTP (Dio) configurado con la base de la API y un interceptor que
/// inyecta el tenant en cada petición (x-tenant-id). Cuando se active Cognito,
/// aquí se añadirá también el header Authorization con el token Bearer.
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
        options.headers['x-tenant-id'] = ref.read(tenantProvider);
        handler.next(options);
      },
    ),
  );

  return dio;
});
