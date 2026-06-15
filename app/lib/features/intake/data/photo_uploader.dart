import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_provider.dart';

final photoUploaderProvider = Provider<PhotoUploader>((ref) {
  return PhotoUploader(ref.read(dioProvider));
});

/// Sube una foto a S3 usando una URL prefirmada y devuelve la `key` para
/// asociarla a la orden. Si algo falla (incl. almacenamiento no configurado),
/// devuelve `null`: la orden se crea igual, sin foto.
class PhotoUploader {
  /// Dio de la app (añade x-tenant-id) — para pedir la URL prefirmada al backend.
  final Dio _api;
  PhotoUploader(this._api);

  Future<String?> upload(String filePath) async {
    try {
      const contentType = 'image/jpeg';
      final presign = await _api.post('/uploads/presign', data: {'contentType': contentType});
      final data = presign.data as Map<String, dynamic>;
      final uploadUrl = data['uploadUrl'] as String;
      final key = data['key'] as String;

      final bytes = await File(filePath).readAsBytes();
      // Dio "limpio" (sin interceptores ni baseUrl) para el PUT directo a S3.
      // El Content-Type debe coincidir con el firmado en el backend.
      final s3 = Dio();
      await s3.put(
        uploadUrl,
        data: Stream.fromIterable([bytes]),
        options: Options(
          headers: {
            'Content-Type': contentType,
            Headers.contentLengthHeader: bytes.length,
          },
        ),
      );
      return key;
    } catch (_) {
      return null;
    }
  }
}
