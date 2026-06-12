import 'package:dio/dio.dart';
import '../../../core/error/failure.dart';
import '../domain/work_order.dart';
import 'work_order_model.dart';

class WorkOrderRemoteDataSource {
  final Dio dio;

  WorkOrderRemoteDataSource(this.dio);

  Future<List<WorkOrder>> list() async {
    try {
      final res = await dio.get('/work-orders');
      return (res.data as List)
          .map((e) => WorkOrderModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<WorkOrder> changeStatus(String id, String estado) async {
    try {
      final res = await dio.patch('/work-orders/$id/status', data: {'estado': estado});
      return WorkOrderModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }

  Future<WorkOrder> create(Map<String, dynamic> body) async {
    try {
      final res = await dio.post('/work-orders', data: body);
      return WorkOrderModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw mapDioError(e);
    }
  }
}
