import 'package:flutter/material.dart';

/// Ícono representativo según el tipo de vehículo (valor del backend).
IconData vehicleTypeIcon(String tipo) => switch (tipo) {
      'automovil' => Icons.directions_car,
      'camioneta' => Icons.airport_shuttle,
      'moto' => Icons.two_wheeler,
      'taxi' => Icons.local_taxi,
      'camion' => Icons.local_shipping,
      _ => Icons.help_outline,
    };

/// Etiqueta legible del tipo de vehículo (sin abreviaturas crudas).
String vehicleTypeLabel(String tipo) => switch (tipo) {
      'automovil' => 'Automóvil',
      'camioneta' => 'Camioneta / SUV',
      'moto' => 'Moto',
      'taxi' => 'Taxi',
      'camion' => 'Camión',
      'otro' => 'Otro',
      _ => tipo,
    };
