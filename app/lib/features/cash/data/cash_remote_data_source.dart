import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/cash_movement.dart';
import '../domain/cash_repository.dart';
import 'cash_models.dart';

class CashRemoteDataSource {
  final Dio dio;

  CashRemoteDataSource(this.dio);

  Future<CashSessionDetail?> getCurrent() async {
    try {
      final res = await dio.get('/cash/sessions/current');
      final data = res.data;
      if (data == null) return null;
      final json = data as Map<String, dynamic>;
      final movements = ((json['movements'] as List?) ?? const [])
          .map((e) => CashModels.movementFromJson(e as Map<String, dynamic>))
          .toList();
      return CashSessionDetail(
        session: CashModels.sessionFromJson(json),
        movements: movements,
      );
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> open(double baseInicial) async {
    try {
      await dio.post('/cash/sessions/open', data: {'baseInicial': baseInicial});
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> close(double saldoReal) async {
    try {
      await dio.post('/cash/sessions/close', data: {'saldoReal': saldoReal});
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<CashMovement> registerMovement(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/cash/movements', data: body);
      return CashModels.movementFromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
