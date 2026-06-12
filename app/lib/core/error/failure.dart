import 'package:dio/dio.dart';

/// Error de dominio/aplicación legible para la UI.
class Failure implements Exception {
  final String message;
  final int? statusCode;

  Failure(this.message, {this.statusCode});

  @override
  String toString() => message;
}

/// Traduce un error de Dio al Failure de la app, extrayendo el mensaje que
/// devuelve el backend ({ message: ... }).
Failure mapDioError(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    final message = (data is Map && data['message'] != null)
        ? data['message'].toString()
        : (error.message ?? 'Error de conexión con el servidor');
    return Failure(message, statusCode: error.response?.statusCode);
  }
  if (error is Failure) return error;
  return Failure(error.toString());
}
