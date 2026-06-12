import '../domain/customer.dart';

class CustomerModel {
  static Customer fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        nombre: json['nombre'] as String,
        telefono: json['telefono'] as String?,
        email: json['email'] as String?,
        documento: json['documento'] as String?,
      );
}
