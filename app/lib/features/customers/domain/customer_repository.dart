import 'customer.dart';

abstract class CustomerRepository {
  Future<List<Customer>> list();
  Future<Customer> create({
    required String nombre,
    String? telefono,
    String? email,
    String? documento,
  });
}
