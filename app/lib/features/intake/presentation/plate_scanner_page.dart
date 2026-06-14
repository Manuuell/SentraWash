import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

import '../../../core/theme/app_spacing.dart';
import '../../work_orders/presentation/create_order_page.dart';
import '../data/plate_ocr.dart';

/// Abre el flujo de ingreso (escanear placa + foto) sobre el navegador raíz,
/// a pantalla completa por encima de la barra de navegación.
void openIntake(BuildContext context) {
  Navigator.of(context, rootNavigator: true).push(
    MaterialPageRoute(builder: (_) => const PlateScannerPage(), fullscreenDialog: true),
  );
}

/// Pantalla de cámara para registrar el ingreso de un vehículo: el operario
/// encuadra la placa y captura. La misma foto sirve como evidencia del vehículo
/// y como fuente para el OCR de la placa. Luego pasa a confirmar la orden.
class PlateScannerPage extends StatefulWidget {
  const PlateScannerPage({super.key});

  @override
  State<PlateScannerPage> createState() => _PlateScannerPageState();
}

class _PlateScannerPageState extends State<PlateScannerPage> with WidgetsBindingObserver {
  CameraController? _controller;
  bool _processing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final c = _controller;
    if (c == null || !c.value.isInitialized) return;
    if (state == AppLifecycleState.inactive) {
      c.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _error = 'No se encontró ninguna cámara.');
        return;
      }
      final back = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      final controller = CameraController(
        back,
        ResolutionPreset.high,
        enableAudio: false,
      );
      await controller.initialize();
      if (!mounted) return;
      setState(() {
        _controller = controller;
        _error = null;
      });
    } catch (e) {
      if (mounted) setState(() => _error = 'No se pudo abrir la cámara. Revisa el permiso.');
    }
  }

  Future<void> _capture() async {
    final c = _controller;
    if (c == null || !c.value.isInitialized || _processing) return;
    setState(() => _processing = true);
    try {
      final file = await c.takePicture();
      final placa = await recognizePlate(file.path);
      if (!mounted) return;
      // Pasa a confirmar la orden con la placa detectada y la foto capturada.
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => CreateOrderPage(initialPlaca: placa, photoPath: file.path),
        ),
      );
    } catch (e) {
      if (mounted) {
        setState(() => _processing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No se pudo capturar la foto')),
        );
      }
    }
  }

  void _manual() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const CreateOrderPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = _controller;
    final ready = controller != null && controller.value.isInitialized && _error == null;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          if (ready)
            FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: controller.value.previewSize!.height,
                height: controller.value.previewSize!.width,
                child: CameraPreview(controller),
              ),
            )
          else if (_error != null)
            _ErrorPanel(message: _error!, onManual: _manual)
          else
            const Center(child: CircularProgressIndicator(color: Colors.white)),

          if (ready) ...[
            // Capa oscura con la "ventana" de encuadre de la placa.
            const _ScannerOverlay(),
            // Cabecera con cerrar.
            SafeArea(
              child: Align(
                alignment: Alignment.topLeft,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.white, size: 28),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
            ),
            // Controles inferiores.
            SafeArea(
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.xl),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Encuadra la placa y captura',
                        style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      _ShutterButton(processing: _processing, onTap: _capture),
                      const SizedBox(height: AppSpacing.md),
                      TextButton(
                        onPressed: _processing ? null : _manual,
                        child: const Text('Ingresar manualmente',
                            style: TextStyle(color: Colors.white70)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Capa semitransparente con un recorte rectangular para guiar el encuadre.
class _ScannerOverlay extends StatelessWidget {
  const _ScannerOverlay();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Center(
        child: Container(
          width: 300,
          height: 150,
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white, width: 3),
            borderRadius: BorderRadius.circular(AppSpacing.radius),
          ),
        ),
      ),
    );
  }
}

class _ShutterButton extends StatelessWidget {
  final bool processing;
  final VoidCallback onTap;
  const _ShutterButton({required this.processing, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: processing ? null : onTap,
      child: Container(
        width: 76,
        height: 76,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 4),
        ),
        child: Padding(
          padding: const EdgeInsets.all(5),
          child: Container(
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
            child: processing
                ? const Padding(
                    padding: EdgeInsets.all(18),
                    child: CircularProgressIndicator(strokeWidth: 3),
                  )
                : null,
          ),
        ),
      ),
    );
  }
}

class _ErrorPanel extends StatelessWidget {
  final String message;
  final VoidCallback onManual;
  const _ErrorPanel({required this.message, required this.onManual});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.no_photography_outlined, color: Colors.white70, size: 56),
            const SizedBox(height: AppSpacing.lg),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white)),
            const SizedBox(height: AppSpacing.xl),
            FilledButton.icon(
              onPressed: onManual,
              icon: const Icon(Icons.edit),
              label: const Text('Ingresar manualmente'),
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar', style: TextStyle(color: Colors.white70)),
            ),
          ],
        ),
      ),
    );
  }
}
