import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../config/app_config.dart';
import '../navigation/scaffold_with_nav.dart';
import '../../features/auth/presentation/auth_providers.dart';
import '../../features/auth/presentation/login_page.dart';
import '../../features/cash/presentation/cash_page.dart';
import '../../features/customers/presentation/customers_page.dart';
import '../../features/dashboard/presentation/board_page.dart';
import '../../features/dashboard/presentation/dashboard_page.dart';
import '../../features/services/presentation/services_page.dart';
import '../../features/vehicles/presentation/vehicles_page.dart';
import '../../features/work_orders/presentation/create_order_page.dart';
import '../../features/work_orders/presentation/work_orders_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Re-evalúa las redirecciones cuando cambia el estado de autenticación.
  final refresh = ValueNotifier<int>(0);
  ref.listen(authControllerProvider, (_, __) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      if (!AppConfig.authEnabled) return null; // sin Cognito: sin login
      final auth = ref.read(authControllerProvider);
      if (auth.loading) return null; // esperando restaurar la sesión guardada
      final atLogin = state.matchedLocation == '/login';
      if (!auth.authenticated) return atLogin ? null : '/login';
      if (atLogin) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),
      // Shell con navegación persistente (rail/bottom-bar). Cada rama mantiene
      // su propio stack y estado. El orden coincide con `_destinations`.
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            ScaffoldWithNav(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/',
              builder: (context, state) => const DashboardPage(),
              routes: [
                GoRoute(path: 'board', builder: (context, state) => const BoardPage()),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/vehicles', builder: (context, state) => const VehiclesPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/customers', builder: (context, state) => const CustomersPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/services', builder: (context, state) => const ServicesPage()),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/work-orders',
              builder: (context, state) => const WorkOrdersPage(),
              routes: [
                GoRoute(path: 'new', builder: (context, state) => const CreateOrderPage()),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/cash', builder: (context, state) => const CashPage()),
          ]),
        ],
      ),
    ],
  );
});
