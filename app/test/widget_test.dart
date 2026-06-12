import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('smoke test: renderiza un widget básico', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: Center(child: Text('SentraWash')))),
    );
    expect(find.text('SentraWash'), findsOneWidget);
  });
}
