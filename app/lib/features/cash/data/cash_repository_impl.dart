import '../domain/cash_repository.dart';
import 'cash_remote_data_source.dart';

class CashRepositoryImpl implements CashRepository {
  final CashRemoteDataSource remote;

  CashRepositoryImpl(this.remote);

  @override
  Future<CashSessionDetail?> getCurrent() => remote.getCurrent();

  @override
  Future<void> open(double baseInicial) => remote.open(baseInicial);

  @override
  Future<void> close(double saldoReal) => remote.close(saldoReal);

  @override
  Future<void> registerMovement({
    required String tipo,
    required String concepto,
    required double monto,
  }) async {
    await remote.registerMovement({'tipo': tipo, 'concepto': concepto, 'monto': monto});
  }
}
