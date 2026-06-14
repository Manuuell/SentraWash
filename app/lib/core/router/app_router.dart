import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../navigation/scaffold_with_nav.dart';
import '../../features/cash/presentation/cash_page.dart';
import '../../features/customers/presentation/customers_page.dart';
import '../../features/dashboard/presentation/board_page.dart';
import '../../features/dashboard/presentation/dashboard_page.dart';
import '../../features/services/presentation/services_page.dart';
import '../../features/vehicles/presentation/vehicles_page.dart';
import '../../features/work_orders/presentation/create_order_page.dart';
import '../../features/work_orders/presentation/work_orders_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
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
