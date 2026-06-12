import '../domain/cash_movement.dart';
import '../domain/cash_session.dart';

class CashModels {
  static CashSession sessionFromJson(Map<String, dynamic> j) => CashSession(
        id: j['id'] as String,
        estado: j['estado'] as String,
        baseInicial: (j['baseInicial'] as num).toDouble(),
        totalIngresos: (j['totalIngresos'] as num).toDouble(),
        totalEgresos: (j['totalEgresos'] as num).toDouble(),
        saldoEsperado: (j['saldoEsperado'] as num).toDouble(),
        saldoReal: (j['saldoReal'] as num?)?.toDouble(),
        diferencia: (j['diferencia'] as num?)?.toDouble(),
      );

  static CashMovement movementFromJson(Map<String, dynamic> j) => CashMovement(
        id: j['id'] as String,
        tipo: j['tipo'] as String,
        concepto: j['concepto'] as String,
        monto: (j['monto'] as num).toDouble(),
      );
}
