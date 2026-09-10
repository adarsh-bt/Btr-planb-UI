import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTENCE  — saves / restores field selection via flutter_secure_storage
// ═══════════════════════════════════════════════════════════════════════════

class FieldSelectionStore {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );

  static const _prefix = 'cce_field_';

  static String _key(int bearing, int young) =>
      '$_prefix${bearing}_$young';

  static Future<void> save({
    required int totalBearing,
    required int totalYoung,
    required int seed,
    required int startRank,
    required List<int> selectedSerials,
    required List<Offset> plottedTrees,
  }) async {
    final payload = jsonEncode({
      'seed':            seed,
      'startRank':       startRank,
      'selectedSerials': selectedSerials,
      'plottedTrees':    plottedTrees.map((o) => {'x': o.dx, 'y': o.dy}).toList(),
    });
    await _storage.write(
      key:   _key(totalBearing, totalYoung),
      value: payload,
    );
  }

  static Future<FieldSelectionData?> load({
    required int totalBearing,
    required int totalYoung,
  }) async {
    final raw = await _storage.read(key: _key(totalBearing, totalYoung));
    if (raw == null) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      
      final List<Offset> plotted = [];
      if (map['plottedTrees'] != null) {
        for (final item in map['plottedTrees']) {
          plotted.add(Offset((item['x'] as num).toDouble(), (item['y'] as num).toDouble()));
        }
      }

      return FieldSelectionData(
        seed:            map['seed'] as int,
        startRank:       map['startRank'] as int,
        selectedSerials: List<int>.from(map['selectedSerials'] as List),
        plottedTrees:    plotted,
      );
    } catch (_) {
      await _storage.delete(key: _key(totalBearing, totalYoung));
      return null;
    }
  }

  static Future<void> clear({
    required int totalBearing,
    required int totalYoung,
  }) async {
    await _storage.delete(key: _key(totalBearing, totalYoung));
  }
}

class FieldSelectionData {
  final int seed;
  final int startRank;
  final List<int> selectedSerials;
  final List<Offset> plottedTrees;

  const FieldSelectionData({
    required this.seed,
    required this.startRank,
    required this.selectedSerials,
    required this.plottedTrees,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC WIDGET
// Drop-in replacement for the original CceFieldDiagram.
// ═══════════════════════════════════════════════════════════════════════════

class CceFieldDiagram extends StatefulWidget {
  final int totalBearing;
  final int totalYoung;
  final List<int> selectedIndices;
  final String unitType;
  final Color primaryColor;
  final void Function(int)? onSelectedTap;
  final bool showSelectionPanel; // kept for compatibility, unused
  final void Function(List<int>)? onSelectionChanged; // kept for compatibility, unused

  final List<Offset> plottedTrees;
  final ValueChanged<Offset> onTreePlotted;
  final VoidCallback onUndo;
  final VoidCallback onClearAll;

  const CceFieldDiagram({
    super.key,
    required this.totalBearing,
    required this.totalYoung,
    required this.selectedIndices,
    required this.unitType,
    required this.plottedTrees,
    required this.onTreePlotted,
    required this.onUndo,
    required this.onClearAll,
    this.primaryColor = const Color(0xFF10B981),
    this.onSelectedTap,
    this.showSelectionPanel = false,
    this.onSelectionChanged,
  });

  @override
  State<CceFieldDiagram> createState() => _CceFieldDiagramState();
}

class _CceFieldDiagramState extends State<CceFieldDiagram> {
  bool _loadingStore = true;

  static const _bearingColor  = Color(0xFF2E7D32);
  static const _selectedColor = Color(0xFFE65100);

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    final data = await FieldSelectionStore.load(
      totalBearing: widget.totalBearing,
      totalYoung: widget.totalYoung,
    );
    if (data != null && data.plottedTrees.isNotEmpty && mounted) {
      widget.onClearAll();
      for (final t in data.plottedTrees) {
        widget.onTreePlotted(t);
      }
    }
    if (mounted) {
      setState(() => _loadingStore = false);
    }
  }

  Future<void> _saveData(List<Offset> latestTrees) async {
    await FieldSelectionStore.save(
      totalBearing: widget.totalBearing,
      totalYoung: widget.totalYoung,
      seed: 0,
      startRank: 1,
      selectedSerials: widget.selectedIndices,
      plottedTrees: latestTrees,
    );
  }

  void _handleTapDown(TapDownDetails d, double fieldW, double fieldH) {
    if (widget.plottedTrees.length >= widget.totalBearing) return;
    final nx = d.localPosition.dx / fieldW;
    final ny = d.localPosition.dy / fieldH;
    final newOffset = Offset(nx, ny);
    widget.onTreePlotted(newOffset);
    _saveData([...widget.plottedTrees, newOffset]);
  }

  void _handleUndo() {
    widget.onUndo();
    final list = List<Offset>.from(widget.plottedTrees);
    if (list.isNotEmpty) list.removeLast();
    _saveData(list);
  }

  void _handleClearAll() {
    widget.onClearAll();
    _saveData([]);
  }

  @override
  Widget build(BuildContext context) {
    final nBearing = widget.totalBearing;
    final remaining = widget.totalBearing - widget.plottedTrees.length;

    if (_loadingStore) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: CircularProgressIndicator(color: Color(0xFF2E7D32)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color:        const Color(0xFFE8F5E9),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            border:       Border.all(color: const Color(0xFF4CAF50).withOpacity(0.4)),
          ),
          child: Row(children: [
            const Icon(Icons.touch_app_rounded, color: Color(0xFF2E7D32), size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text(
              'Plot $nBearing bearing ${widget.unitType == "plants" ? "plants" : "trees"}',
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF1B5E20)),
            )),
            // Remaining badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: _bearingColor, borderRadius: BorderRadius.circular(12)),
              child: Text(
                remaining > 0 ? '$remaining remaining' : 'All plotted',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
              ),
            ),
          ]),
        ),

        // Field Canvas
        LayoutBuilder(builder: (ctx, constraints) {
          final fieldW = constraints.maxWidth;
          final fieldH = (fieldW / 1.6).clamp(180.0, 340.0);
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (d) => _handleTapDown(d, fieldW, fieldH),
            onTapUp: (d) {
              if (widget.onSelectedTap == null) return;
              final pos = d.localPosition;
              for (int i = 0; i < widget.plottedTrees.length; i++) {
                final serial = i + 1;
                if (!widget.selectedIndices.contains(serial)) continue;
                final tpos = Offset(widget.plottedTrees[i].dx * fieldW, widget.plottedTrees[i].dy * fieldH);
                if ((pos - tpos).distance < 20) {
                  widget.onSelectedTap!(serial);
                  return;
                }
              }
            },
            child: Container(
              width: fieldW,
              height: fieldH,
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(
                  left:   BorderSide(color: Colors.grey.shade300),
                  right:  BorderSide(color: Colors.grey.shade300),
                  bottom: BorderSide(color: Colors.grey.shade300),
                ),
              ),
              child: CustomPaint(
                painter: _ManualFieldPainter(
                  plottedTrees: widget.plottedTrees,
                  selectedIndices: widget.selectedIndices,
                  bearingColor: _bearingColor,
                  selectedColor: _selectedColor,
                ),
              ),
            ),
          );
        }),

        // Controls
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: widget.plottedTrees.isEmpty ? null : _handleUndo,
                icon: const Icon(Icons.undo, size: 18),
                label: const Text('Undo Last'),
                style: TextButton.styleFrom(foregroundColor: Colors.orange.shade800),
              ),
              TextButton.icon(
                onPressed: widget.plottedTrees.isEmpty ? null : _handleClearAll,
                icon: const Icon(Icons.clear_all, size: 18),
                label: const Text('Clear All'),
                style: TextButton.styleFrom(foregroundColor: Colors.red.shade700),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ManualFieldPainter extends CustomPainter {
  final List<Offset> plottedTrees;
  final List<int> selectedIndices;
  final Color bearingColor;
  final Color selectedColor;

  _ManualFieldPainter({
    required this.plottedTrees,
    required this.selectedIndices,
    required this.bearingColor,
    required this.selectedColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw grid
    final gridPaint = Paint()
      ..color = Colors.grey.withOpacity(0.1)
      ..style = PaintingStyle.stroke;
    for (double x = 0; x <= size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y <= size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Draw trees
    for (int i = 0; i < plottedTrees.length; i++) {
      final serial = i + 1;
      final isSelected = selectedIndices.contains(serial);
      final center = Offset(plottedTrees[i].dx * size.width, plottedTrees[i].dy * size.height);
      
      final color = isSelected ? selectedColor : bearingColor;
      
      // Shadow
      canvas.drawCircle(center + const Offset(0, 2), 10, Paint()..color = Colors.black.withOpacity(0.15));
      
      // Halo if selected
      if (isSelected) {
        canvas.drawCircle(center, 14, Paint()..color = selectedColor.withOpacity(0.2)..style = PaintingStyle.fill);
        canvas.drawCircle(center, 14, Paint()..color = selectedColor.withOpacity(0.5)..style = PaintingStyle.stroke..strokeWidth = 2);
      }
      
      // Dot
      canvas.drawCircle(center, 10, Paint()..color = color..style = PaintingStyle.fill);
      canvas.drawCircle(center, 10, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 1.5);
      
      // Label
      final tp = TextPainter(
        text: TextSpan(
          text: '$serial',
          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
        ),
        textDirection: TextDirection.ltr,
      )..layout();
      tp.paint(canvas, center - Offset(tp.width / 2, tp.height / 2));
    }
  }

  @override
  bool shouldRepaint(covariant _ManualFieldPainter old) =>
      plottedTrees.length != old.plottedTrees.length ||
      selectedIndices.length != old.selectedIndices.length;
}