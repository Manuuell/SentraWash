import '../domain/customer.dart';
import '../domain/customer_repository.dart';
import 'customer_remote_data_source.dart';

class CustomerRepositoryImpl implements CustomerRepository {
  final CustomerRemoteDataSource remote;

  CustomerRepositoryImpl(this.remote);

  @override
  Future<List<Customer>> list() => remote.list();

  @override
  Future<Customer> create({
    required String nombre,
    String? telefono,
    String? email,
    String? documento,
  }) {
    return remote.create({
      'nombre': nombre,
      if (telefono != null && telefono.isNotEmpty) 'telefono': telefono,
      if (email != null && email.isNotEmpty) 'email': email,
      if (documento != null && documento.isNotEmpty) 'documento': documento,
    });
  }
}
