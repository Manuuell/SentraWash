import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

/// Placas colombianas: 3 letras + 2–3 dígitos + opcional 1 letra final (motos).
/// Acepta separadores (espacio o guion) que luego se eliminan.
final _plateRegex = RegExp(r'[A-Z]{3}[ -]?\d{2,3}[A-Z]?');

/// Ejecuta OCR (ML Kit, on-device) sobre la imagen y devuelve el mejor candidato
/// a placa encontrado, o `null` si no reconoce ninguna. No lanza: ante cualquier
/// fallo devuelve `null` para que el operario ingrese la placa a mano.
Future<String?> recognizePlate(String imagePath) async {
  final recognizer = TextRecognizer(script: TextRecognitionScript.latin);
  try {
    final result = await recognizer.processImage(InputImage.fromFilePath(imagePath));
    final text = result.text.toUpperCase().replaceAll(RegExp(r'[\n\t]'), ' ');

    final candidates = _plateRegex
        .allMatches(text)
        .map((m) => m.group(0)!.replaceAll(RegExp(r'[ -]'), ''))
        .where((p) => p.length >= 5 && p.length <= 7)
        .toList();
    if (candidates.isEmpty) return null;

    // Prefiere el candidato más cercano al formato de carro (6 caracteres: ABC123).
    candidates.sort((a, b) => (a.length - 6).abs().compareTo((b.length - 6).abs()));
    return candidates.first;
  } catch (_) {
    return null;
  } finally {
    await recognizer.close();
  }
}
