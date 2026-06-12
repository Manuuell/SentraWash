import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/customer_remote_data_source.dart';
import '../data/customer_repository_impl.dart';
import '../domain/customer.dart';
import '../domain/customer_repository.dart';

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  return CustomerRepositoryImpl(CustomerRemoteDataSource(ref.watch(dioProvider)));
});

class CustomersController extends AsyncNotifier<List<Customer>> {
  @override
  Future<List<Customer>> build() => ref.watch(customerRepositoryProvider).list();

  Future<void> refreshList() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(customerRepositoryProvider).list());
  }

  Future<void> add({
    required String nombre,
    String? telefono,
    String? email,
    String? documento,
  }) async {
    await ref.read(customerRepositoryProvider).create(
          nombre: nombre,
          telefono: telefono,
          email: email,
          documento: documento,
        );
    await refreshList();
  }
}

final customersControllerProvider =
    AsyncNotifierProvider<CustomersController, List<Customer>>(CustomersController.new);
