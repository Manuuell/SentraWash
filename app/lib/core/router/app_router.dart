import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/cash/presentation/cash_page.dart';
import '../../features/customers/presentation/customers_page.dart';
import '../../features/dashboard/presentation/dashboard_page.dart';
import '../../features/services/presentation/services_page.dart';
import '../../features/vehicles/presentation/vehicles_page.dart';
import '../../features/work_orders/presentation/create_order_page.dart';
import '../../features/work_orders/presentation/work_orders_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(path: '/', builder: (context, state) => const DashboardPage()),
      GoRoute(path: '/vehicles', builder: (context, state) => const VehiclesPage()),
      GoRoute(path: '/customers', builder: (context, state) => const CustomersPage()),
      GoRoute(path: '/services', builder: (context, state) => const ServicesPage()),
      GoRoute(path: '/cash', builder: (context, state) => const CashPage()),
      GoRoute(path: '/work-orders', builder: (context, state) => const WorkOrdersPage()),
      GoRoute(path: '/work-orders/new', builder: (context, state) => const CreateOrderPage()),
    ],
  );
});
