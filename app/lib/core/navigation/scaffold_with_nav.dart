import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Shell de navegación persistente. En pantallas anchas (≥700px) muestra un
/// `NavigationRail` lateral; en angostas, una `NavigationBar` inferior. El
/// contenido de cada sección conserva su estado gracias al `IndexedStack`.
class ScaffoldWithNav extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const ScaffoldWithNav({super.key, required this.navigationShell});

  void _go(int index) => navigationShell.goBranch(
        index,
        // Tocar la sección activa vuelve a su raíz.
        initialLocation: index == navigationShell.currentIndex,
      );

  @override
  Widget build(BuildContext context) {
    final useRail = MediaQuery.sizeOf(context).width >= 700;

    if (useRail) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: _go,
              labelType: NavigationRailLabelType.all,
              destinations: _destinations
                  .map((d) => NavigationRailDestination(
                        icon: Icon(d.icon),
                        selectedIcon: Icon(d.selectedIcon),
                        label: Text(d.label),
                      ))
                  .toList(),
            ),
            const VerticalDivider(width: 1),
            Expanded(child: navigationShell),
          ],
        ),
      );
    }

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: _go,
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
        destinations: _destinations
            .map((d) => NavigationDestination(
                  icon: Icon(d.icon),
                  selectedIcon: Icon(d.selectedIcon),
                  label: d.label,
                ))
            .toList(),
      ),
    );
  }
}

class _Dest {
  final IconData icon;
  final IconData selectedIcon;
  final String label;
  const _Dest(this.icon, this.selectedIcon, this.label);
}

/// El orden debe coincidir con el de las `branches` en `app_router.dart`.
const _destinations = <_Dest>[
  _Dest(Icons.dashboard_outlined, Icons.dashboard, 'Inicio'),
  _Dest(Icons.directions_car_outlined, Icons.directions_car, 'Vehículos'),
  _Dest(Icons.people_outline, Icons.people, 'Clientes'),
  _Dest(Icons.local_car_wash_outlined, Icons.local_car_wash, 'Servicios'),
  _Dest(Icons.receipt_long_outlined, Icons.receipt_long, 'Órdenes'),
  _Dest(Icons.point_of_sale_outlined, Icons.point_of_sale, 'Caja'),
];
