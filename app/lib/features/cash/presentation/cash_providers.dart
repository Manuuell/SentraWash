import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../data/cash_remote_data_source.dart';
import '../data/cash_repository_impl.dart';
import '../domain/cash_repository.dart';

final cashRepositoryProvider = Provider<CashRepository>((ref) {
  return CashRepositoryImpl(CashRemoteDataSource(ref.watch(dioProvider)));
});

/// Estado de la caja actual (null = no hay caja abierta).
class CashController extends AsyncNotifier<CashSessionDetail?> {
  @override
  Future<CashSessionDetail?> build() => ref.watch(cashRepositoryProvider).getCurrent();

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => ref.read(cashRepositoryProvider).getCurrent());
  }

  Future<void> open(double baseInicial) async {
    await ref.read(cashRepositoryProvider).open(baseInicial);
    await refresh();
  }

  Future<void> close(double saldoReal) async {
    await ref.read(cashRepositoryProvider).close(saldoReal);
    await refresh();
  }

  Future<void> registerMovement({
    required String tipo,
    required String concepto,
    required double monto,
  }) async {
    await ref
        .read(cashRepositoryProvider)
        .registerMovement(tipo: tipo, concepto: concepto, monto: monto);
    await refresh();
  }
}

final cashControllerProvider =
    AsyncNotifierProvider<CashController, CashSessionDetail?>(CashController.new);
