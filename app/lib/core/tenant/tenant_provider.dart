import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';

/// Mantiene el tenant (lavadero) activo. En dev se inicializa con el demo;
/// la app multi-tenant podría permitir cambiarlo o derivarlo del login.
class TenantNotifier extends Notifier<String> {
  @override
  String build() => AppConfig.defaultTenantId;

  void setTenant(String tenantId) => state = tenantId;
}

final tenantProvider = NotifierProvider<TenantNotifier, String>(TenantNotifier.new);
