import 'dart:math';
import 'package:aidea/view/screens/cce/Form5/frame_selection/tree_plant_measure/section_cards.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../../controller/cce/cce_data_entry/cce_frame_selection.dart';
import '../../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../../controller/cce/cce_data_entry/form5_detail_controller.dart';

// ═══════════════════════════════════════════════════════════════════════════
// DEBUG HELPER
// ═══════════════════════════════════════════════════════════════════════════
void _log(String step, String msg) {}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════
class SqmFrameSelectionController extends GetxController {
  final RxInt frameLength;
  final RxInt frameWidth;

  SqmFrameSelectionController({
    required int initialFrameLength,
    required int initialFrameWidth,
  }) : frameLength = initialFrameLength.obs,
       frameWidth = initialFrameWidth.obs {
    _log('CONTROLLER_INIT',
        'Created | frameLength=${frameLength.value}  frameWidth=${frameWidth.value}');
  }

  final totalLengthController = TextEditingController();
  final totalWidthController  = TextEditingController();

  final RxInt    totalLength    = 0.obs;
  final RxInt    totalWidth     = 0.obs;
  final RxString lengthError    = ''.obs;
  final RxString widthError     = ''.obs;
  final RxBool   isGenerated    = false.obs;
  final RxInt    selectedLength = 0.obs;
  final RxInt    selectedWidth  = 0.obs;

  // Rejection State
  final RxInt generationCount = 0.obs;
  final RxBool isRejected = false.obs;
  final Set<String> rejectedCoordinates = <String>{};

  @override
  void onClose() {
    totalLengthController.dispose();
    totalWidthController.dispose();
    super.onClose();
  }

  // ── KEY CHANGE: range is 0 to (total - frameSize)
  // So max random value = total - frameSize  (can be 0 when total == frameSize)
  // ── KEY CHANGE: range is 0 to (total - frameSize - 1) based on custom logic
  int  get lengthMax   => totalLength.value - frameLength.value - 1;  // min 0
  int  get widthMax    => totalWidth.value  - frameWidth.value - 1;   // min 0

  bool get lengthValid => totalLength.value >= 2 && totalLength.value >= (frameLength.value + 1) && lengthError.value.isEmpty;
  bool get widthValid  => totalWidth.value  >= 2 && totalWidth.value  >= (frameWidth.value + 1)  && widthError.value.isEmpty;
  bool get canGenerate => lengthValid && widthValid;

  bool get canGenerateRandom {
    if (!lengthValid || !widthValid) return false;
    if (generationCount.value == 0) return true;
    if (generationCount.value == 1 && isRejected.value == true) return true;
    return false;
  }

  void _updateFrameDimensions() {
    int x = totalLength.value;
    int y = totalWidth.value;

    if (x == 2) {
      frameLength.value = 1;
      frameWidth.value = 4;
    } else if (x == 3 || x == 4) {
      frameLength.value = 2;
      frameWidth.value = 2;
    } else if (x >= 5) {
      if (y == 2) {
        frameLength.value = 4;
        frameWidth.value = 1;
      } else {
        frameLength.value = 2;
        frameWidth.value = 2;
      }
    } else {
      // Default to 2x2 as a safe fallback
      frameLength.value = 2;
      frameWidth.value = 2;
    }
  }

  void _validateDimensions() {
    final lErr = totalLengthController.text.isEmpty
        ? ''
        : totalLength.value < 2
        ? 'Minimum value is 2'
        : totalLength.value < (frameLength.value + 1)
        ? 'Must be at least ${frameLength.value + 1} steps'
        : '';
    lengthError.value = lErr;

    final wErr = totalWidthController.text.isEmpty
        ? ''
        : totalWidth.value < 2
        ? 'Minimum value is 2'
        : totalWidth.value < (frameWidth.value + 1)
        ? 'Must be at least ${frameWidth.value + 1} steps'
        : '';
    widthError.value = wErr;
  }

  // ── Input handlers ────────────────────────────────────────────────────────
  void onLengthChanged(String value) {
    final v = int.tryParse(value) ?? 0;
    totalLength.value = v;
    
    // Clear Y when X is edited
    totalWidth.value = 0;
    totalWidthController.clear();
    widthError.value = '';

    _updateFrameDimensions();
    _resetResults();
    _validateDimensions();

    _log('INPUT_LENGTH',
        'raw="$value"  parsed=$v  frameLength=${frameLength.value}  '
            'error="${lengthError.value.isEmpty ? "none" : lengthError.value}"  '
            'lengthMax=$lengthMax  canGenerate=$canGenerate');
  }

  void onWidthChanged(String value) {
    final v = int.tryParse(value) ?? 0;
    totalWidth.value = v;
    _updateFrameDimensions();
    _resetResults();
    _validateDimensions();

    _log('INPUT_WIDTH',
        'raw="$value"  parsed=$v  frameWidth=${frameWidth.value}  '
            'error="${widthError.value.isEmpty ? "none" : widthError.value}"  '
            'widthMax=$widthMax  canGenerate=$canGenerate');
  }

  // ── Random generation ─────────────────────────────────────────────────────
  // ── KEY CHANGE: random is 0..lengthMax  and  0..widthMax
  void generateRandomPosition() {
    _log('GENERATE_START',
        'canGenerate=$canGenerateRandom  '
            'totalLength=${totalLength.value}  totalWidth=${totalWidth.value}  '
            'lengthMax=$lengthMax  widthMax=$widthMax');

    if (!canGenerateRandom) return;

    final rng = Random();

    int newLen = 0;
    int newWid = 0;
    int attempts = 0;
    bool found = false;

    // Generate non-rejected coordinate
    while (attempts < 100) {
      newLen = rng.nextInt(lengthMax + 1); // 0 to lengthMax
      newWid = rng.nextInt(widthMax + 1);  // 0 to widthMax
      
      final coord = '$newLen,$newWid';
      if (!rejectedCoordinates.contains(coord)) {
        found = true;
        break;
      }
      attempts++;
    }

    final prevLen = selectedLength.value;
    final prevWid = selectedWidth.value;

    selectedLength.value = newLen;
    selectedWidth.value  = newWid;
    isGenerated.value    = true;
    isRejected.value     = false;
    generationCount.value++;

    _log('GENERATE_DONE',
        'prev=($prevLen, $prevWid)  '
            'new=(${selectedLength.value}, ${selectedWidth.value})  '
            'ranges: length=[0–$lengthMax]  width=[0–$widthMax]');
  }

  Future<void> rejectPosition(String reason) async {
    // Demo Mock API call for rejecting a position
    await Future.delayed(const Duration(seconds: 2));
    
    // Add current coordinates to rejected set
    rejectedCoordinates.add('${selectedLength.value},${selectedWidth.value}');
    isRejected.value = true;
    isGenerated.value = false; // Hide the frame diagram so they have to generate again
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  void reset() {
    _resetResults();
    totalLength.value = 0;
    totalWidth.value  = 0;
    totalLengthController.clear();
    totalWidthController.clear();
    lengthError.value = '';
    widthError.value  = '';
  }

  // ── Populate from saved data ──────────────────────────────────────────────
  void populateSavedData(CceFrameSelectionPayload saved) {
    _log('POPULATE_CALLED',
        'isSquareMeters=${saved.isSquareMeters}  '
            'sideLengthX=${saved.sideLengthX}  sideLengthY=${saved.sideLengthY}  '
            'randomSideLengthX=${saved.randomSideLengthX}  '
            'randomSideLengthY=${saved.randomSideLengthY}');

    if (!saved.isSquareMeters) {
      _log('POPULATE_SKIPPED', 'Not SQM payload');
      return;
    }

    if (saved.sideLengthX < frameLength.value || saved.sideLengthY < frameWidth.value) {
      _log('POPULATE_INVALID',
          'sideLengthX=${saved.sideLengthX} < frameLength=${frameLength.value}  OR  '
              'sideLengthY=${saved.sideLengthY} < frameWidth=${frameWidth.value} — skipping');
      return;
    }

    totalLength.value = saved.sideLengthX.toInt();
    totalWidth.value  = saved.sideLengthY.toInt();
    totalLengthController.text = totalLength.value.toString();
    totalWidthController.text  = totalWidth.value.toString();

    // ── KEY CHANGE: saved randomSideLengthX/Y can be 0 — that is valid
    selectedLength.value = saved.randomSideLengthX.toInt();
    selectedWidth.value  = saved.randomSideLengthY.toInt();
    isGenerated.value    = true;
    lengthError.value    = '';
    widthError.value     = '';

    _log('POPULATE_DONE',
        'totalLength=${totalLength.value}  totalWidth=${totalWidth.value}  '
            'selectedLength=${selectedLength.value}  selectedWidth=${selectedWidth.value}  '
            'lengthMax=$lengthMax  widthMax=$widthMax');
  }

  void _resetResults() {
    isGenerated.value    = false;
    selectedLength.value = 0;
    selectedWidth.value  = 0;
    generationCount.value = 0;
    isRejected.value = false;
    rejectedCoordinates.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAME DIAGRAM PAINTER
// Draws the total plot rectangle with the frame placed at (offsetX, offsetY)
// ═══════════════════════════════════════════════════════════════════════════
class _FrameDiagramPainter extends CustomPainter {
  final int totalLength;
  final int totalWidth;
  final int frameLength;
  final int frameWidth;
  final int offsetX; // selectedLength
  final int offsetY; // selectedWidth
  final Color primaryColor;
  final Color frameColor;
  final bool isGenerated;

  _FrameDiagramPainter({
    required this.totalLength,
    required this.totalWidth,
    required this.frameLength,
    required this.frameWidth,
    required this.offsetX,
    required this.offsetY,
    required this.primaryColor,
    required this.frameColor,
    required this.isGenerated,
  });

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2, Paint paint) {
    const double dashWidth = 4.0;
    const double dashSpace = 4.0;
    double startX = p1.dx;
    double startY = p1.dy;
    double distance = (p2 - p1).distance;
    
    if (distance == 0) return;

    double cosTheta = (p2.dx - p1.dx) / distance;
    double sinTheta = (p2.dy - p1.dy) / distance;

    double currentDistance = 0;
    while (currentDistance < distance) {
      double drawDistance = (currentDistance + dashWidth < distance) ? dashWidth : distance - currentDistance;
      canvas.drawLine(
        Offset(startX + currentDistance * cosTheta, startY + currentDistance * sinTheta),
        Offset(startX + (currentDistance + drawDistance) * cosTheta, startY + (currentDistance + drawDistance) * sinTheta),
        paint,
      );
      currentDistance += dashWidth + dashSpace;
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    final plotPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;
    final plotBorder = Paint()
      ..color = primaryColor.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    final framePaint = Paint()
      ..color = frameColor.withValues(alpha: 0.25)
      ..style = PaintingStyle.fill;
    final frameBorder = Paint()
      ..color = frameColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Scale so the total plot fills the canvas
    final scaleX = size.width  / totalLength;
    final scaleY = size.height / totalWidth;

    // Draw total plot
    final plotRect = Rect.fromLTWH(0, 0, size.width, size.height);
    canvas.drawRect(plotRect, plotPaint);
    canvas.drawRect(plotRect, plotBorder);

    // Only draw the frame if a random selection has been generated
    if (isGenerated) {
      // Calculate visual coordinates from Southwest corner
      // X = left to right, Y = bottom to top
      final visualX = offsetX * scaleX;
      final visualY = (totalWidth - offsetY - frameWidth) * scaleY;

      final frameRect = Rect.fromLTWH(
        visualX,
        visualY,
        frameLength * scaleX,
        frameWidth  * scaleY,
      );
      canvas.drawRect(frameRect, framePaint);
      canvas.drawRect(frameRect, frameBorder);

      // Draw dashed coordinates
      final dashedPaint = Paint()
        ..color = primaryColor.withValues(alpha: 0.7)
        ..strokeWidth = 1.5
        ..style = PaintingStyle.stroke;

      // X offset line (horizontal from left edge to frame SW corner)
      if (offsetX > 0) {
        _drawDashedLine(
          canvas, 
          Offset(0, frameRect.bottom), 
          Offset(frameRect.left, frameRect.bottom), 
          dashedPaint
        );
      }

      // Y offset line (vertical from bottom edge to frame SW corner)
      if (offsetY > 0) {
        _drawDashedLine(
          canvas, 
          Offset(frameRect.left, size.height), 
          Offset(frameRect.left, frameRect.bottom), 
          dashedPaint
        );
      }

      // Label inside frame
      final textPainter = TextPainter(
        text: TextSpan(
          text: 'X:$offsetX cm, Y:$offsetY cm',
          style: TextStyle(
            color: frameColor,
            fontSize: 10,
            fontWeight: FontWeight.w800,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout(maxWidth: size.width);
      
      // If frame is too small to fit the text, draw it outside the frame
      if (frameRect.width > textPainter.width + 4 && frameRect.height > textPainter.height + 4) {
        textPainter.paint(
          canvas,
          Offset(
            frameRect.left + (frameRect.width - textPainter.width) / 2,
            frameRect.top  + (frameRect.height - textPainter.height) / 2,
          ),
        );
      } else {
        // Draw just above the frame, making sure it doesn't go outside the plot
        double textY = frameRect.top - textPainter.height - 2;
        if (textY < 0) textY = frameRect.bottom + 2;
        textPainter.paint(
          canvas,
          Offset(frameRect.left, textY),
        );
      }
    }
  }

  @override
  bool shouldRepaint(_FrameDiagramPainter old) =>
      old.offsetX != offsetX ||
          old.offsetY != offsetY ||
          old.totalLength != totalLength ||
          old.totalWidth != totalWidth ||
          old.isGenerated != isGenerated;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDGET
// ═══════════════════════════════════════════════════════════════════════════
class SqmFrameSelectionWidget extends StatefulWidget {
  final double              frameLength;
  final double              frameWidth;
  final Color               primaryColor;
  final Map<String, String> surveyData;
  final Form5Controller     form5controller;

  const SqmFrameSelectionWidget({
    super.key,
    required this.frameLength,
    required this.frameWidth,
    required this.surveyData,
    required this.form5controller,
    this.primaryColor = const Color(0xFF3B82F6),
  });

  @override
  State<SqmFrameSelectionWidget> createState() => _SqmFrameSelectionWidgetState();
}

class _SqmFrameSelectionWidgetState extends State<SqmFrameSelectionWidget> {
  late SqmFrameSelectionController _ctrl;
  bool _populated = false;

  static const _surfaceColor  = Color(0xFFF8FAF9);
  static const _textPrimary   = Color(0xFF1A1A1A);
  static const _textSecondary = Color(0xFF666666);

  int get _frameLengthInt => _ctrl.frameLength.value;
  int get _frameWidthInt  => _ctrl.frameWidth.value;

  String get _cceAvailablePlotId =>
      widget.surveyData['cceAvailablePlotId'] ?? '';

  CceFrameSelectionPayload? get _savedData {
    final cropId = widget.surveyData['cropId'] ?? 'unknown';
    final plotId = widget.surveyData['cceAvailablePlotId']
        ?? widget.surveyData['surveyNo'] ?? 'unknown';
    try {
      // Try with plotId first (new tag format), fall back to old format
      try {
        return Get.find<Form5DetailController>(tag: 'detail_${cropId}_$plotId')
            .savedPlotData.value;
      } catch (_) {
        return Get.find<Form5DetailController>(tag: 'detail_$cropId')
            .savedPlotData.value;
      }
    } catch (e) {
      _log('SAVED_DATA_ERROR', 'Could not find Form5DetailController: $e');
      return null;
    }
  }

  String? get _sqmCceDataEntryPerTreeId {
    final payload = _savedData;
    if (payload == null || !payload.isSquareMeters) return null;
    if (payload.treeItems.isEmpty) return null;
    final id = payload.treeItems.first.cceDataEntryPerTreeId;
    return id.isNotEmpty ? id : null;
  }

  @override
  void initState() {
    super.initState();
    // Use dynamic tag based on time or something unique since dimensions change
    final tag = 'sqm_dynamic_${widget.surveyData['cceAvailablePlotId'] ?? widget.surveyData['surveyNo']}';
    _ctrl = Get.put(
      SqmFrameSelectionController(
        initialFrameLength: widget.frameLength.toInt(),
        initialFrameWidth:  widget.frameWidth.toInt(),
      ),
      tag: tag,
    );
    _tryPopulate(_savedData);
  }

  void _tryPopulate(CceFrameSelectionPayload? data) {
    if (data == null) return;

    final hasMeaningfulData = data.isSquareMeters && data.sideLengthX >= _frameLengthInt;
    if (!hasMeaningfulData) return;

    final alreadySynced =
        _ctrl.totalLength.value == data.sideLengthX.toInt() &&
            _ctrl.totalWidth.value  == data.sideLengthY.toInt() &&
            _ctrl.selectedLength.value == data.randomSideLengthX.toInt() &&
            _ctrl.selectedWidth.value  == data.randomSideLengthY.toInt() &&
            _ctrl.isGenerated.value;

    if (alreadySynced) { _populated = true; return; }
    if (_populated) return;

    _populated = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _ctrl.populateSavedData(data);
    });
  }

  Map<String, dynamic> _sizes(BuildContext context) {
    final w  = MediaQuery.of(context).size.width;
    final xs = w < 360;
    final sm = w >= 360 && w < 600;
    final md = w >= 600 && w < 840;
    return {
      'cardPadding': xs ? 14.0 : (sm ? 16.0 : (md ? 20.0 : 24.0)),
      'bodySize':    xs ? 12.0 : (sm ? 13.0 : (md ? 14.0 : 16.0)),
      'smallSize':   xs ? 10.0 : (sm ? 11.0 : (md ? 12.0 : 13.0)),
      'iconSize':    xs ? 20.0 : (sm ? 24.0 : (md ? 28.0 : 32.0)),
    };
  }

  @override
  Widget build(BuildContext context) {
    final s = _sizes(context);

    return Obx(() {
      final data = _savedData;
      _tryPopulate(data);

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _frameSizeRow(s),
          SizedBox(height: s['cardPadding'] * 1.2),
          _inputSection(_ctrl, s),
          SizedBox(height: s['cardPadding'] * 1.2),
          // Removed range preview as requested
          _generateButton(_ctrl, s),
          Obx(() {
            if (_ctrl.lengthValid && _ctrl.widthValid) {
              return Column(children: [
                SizedBox(height: s['cardPadding'] * 1.2),
                _frameDiagramPreview(_ctrl, s),
              ]);
            }
            return const SizedBox.shrink();
          }),
          Obx(() {
            if (_ctrl.isGenerated.value) {
              return Column(children: [
                if (_populated && _ctrl.isGenerated.value) ...[
                  SizedBox(height: s['cardPadding'] * 1.5),
                  _resultCard(_ctrl, s, context),
                  _rejectButton(_ctrl, s, context),
                ],
              ]);
            }
            return const SizedBox.shrink();
          }),
        ],
      );
    });
  }

  // ── Frame size chips ───────────────────────────────────────────────────────
  Widget _frameSizeRow(Map<String, dynamic> s) {
    return Obx(() => Wrap(
      spacing:    s['cardPadding'] * 0.6,
      runSpacing: s['cardPadding'] * 0.4,
      children: [
        _chip(Icons.straighten, 'Frame Length', '$_frameLengthInt cm', widget.primaryColor, s),
        _chip(Icons.swap_horiz, 'Frame Width',  '$_frameWidthInt cm',  Colors.indigo, s),
      ],
    ));
  }

  Widget _chip(IconData icon, String label, String value, Color color, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: s['cardPadding'] * 0.7, vertical: s['cardPadding'] * 0.4),
      decoration: BoxDecoration(
        color:        color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: s['iconSize'] * 0.5, color: color),
        SizedBox(width: s['cardPadding'] * 0.4),
        Text('$label: ', style: TextStyle(fontSize: s['smallSize'], color: _textSecondary, fontWeight: FontWeight.w500)),
        Text(value,      style: TextStyle(fontSize: s['smallSize'], color: color, fontWeight: FontWeight.w700)),
      ]),
    );
  }

  // ── Input section ──────────────────────────────────────────────────────────
  Widget _inputSection(SqmFrameSelectionController ctrl, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.all(s['cardPadding']),
      decoration: BoxDecoration(
        color:        widget.primaryColor.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: widget.primaryColor.withValues(alpha: 0.15), width: 1.5),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Total Plot Dimensions (in steps)',
            style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, color: _textPrimary)),
        SizedBox(height: s['cardPadding'] * 0.25),
        Text('1 step is approximately equal to 80cm • Minimum value is 2',
            style: TextStyle(fontSize: s['smallSize'], color: _textSecondary, fontStyle: FontStyle.italic)),
        SizedBox(height: s['cardPadding']),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
                child: Obx(() => _dimField(
                  textController: ctrl.totalLengthController,
                  label:          'Total Steps (X)',
                  hint:           '≥ ${_frameLengthInt + 1}',
                  icon:           Icons.directions_walk,
                  accentColor:    widget.primaryColor,
                  errorText:      ctrl.lengthError.value.isEmpty ? null : ctrl.lengthError.value,
                  onChanged:      ctrl.onLengthChanged,
                  s: s,
                ))),
            SizedBox(width: s['cardPadding']),
            Expanded(
                child: Obx(() => AnimatedOpacity(
                  opacity: ctrl.lengthValid ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  child: IgnorePointer(
                    ignoring: !ctrl.lengthValid,
                    child: _dimField(
                      textController: ctrl.totalWidthController,
                      label:          'Total Steps (Y)',
                      hint:           '≥ ${_frameWidthInt + 1}',
                      icon:           Icons.directions_walk,
                      accentColor:    Colors.indigo,
                      errorText:      ctrl.widthError.value.isEmpty ? null : ctrl.widthError.value,
                      onChanged:      ctrl.onWidthChanged,
                      s: s,
                    ),
                  ),
                ))),
          ],
        ),
      ]),
    );
  }

  Widget _dimField({
    required TextEditingController textController,
    required String                label,
    required String                hint,
    required IconData              icon,
    required Color                 accentColor,
    required String?               errorText,
    required Function(String)      onChanged,
    required Map<String, dynamic>  s,
  }) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(icon, size: s['iconSize'] * 0.5, color: accentColor),
        SizedBox(width: s['cardPadding'] * 0.3),
        Expanded(child: Text(label,
            style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w600, color: _textPrimary),
            overflow: TextOverflow.ellipsis)),
      ]),
      SizedBox(height: s['cardPadding'] * 0.4),
      TextField(
        controller:      textController,
        keyboardType:    TextInputType.number,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onChanged:       onChanged,
        style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w600, color: _textPrimary),
        decoration: InputDecoration(
          hintText:      hint,
          hintStyle:     TextStyle(color: accentColor.withValues(alpha: 0.4), fontSize: s['bodySize']),
          errorText:     errorText,
          errorStyle:    TextStyle(fontSize: s['smallSize'] - 1),
          errorMaxLines: 2,
          filled:        true,
          fillColor:     _surfaceColor,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: errorText != null ? Colors.red.shade300 : Colors.grey.shade200, width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: accentColor, width: 2)),
          contentPadding: EdgeInsets.symmetric(horizontal: s['cardPadding'] * 0.8, vertical: s['cardPadding'] * 0.7),
        ),
      ),
    ]);
  }

  // ── Range preview ──────────────────────────────────────────────────────────
  Widget _rangePreview(SqmFrameSelectionController ctrl, Map<String, dynamic> s) {
    return Obx(() => Container(
      padding: EdgeInsets.all(s['cardPadding'] * 0.85),
      decoration: BoxDecoration(
        color:        Colors.teal.shade50,
        borderRadius: BorderRadius.circular(10),
        border:       Border.all(color: Colors.teal.shade200, width: 1.5),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Icon(Icons.calculate_outlined, color: Colors.teal.shade700, size: s['iconSize'] * 0.6),
          SizedBox(width: s['cardPadding'] * 0.5),
          Text('Random Selection Range',
              style: TextStyle(fontSize: s['bodySize'], fontWeight: FontWeight.w700, color: Colors.teal.shade900)),
        ]),
        SizedBox(height: s['cardPadding'] * 0.7),
        // ── KEY CHANGE: range now shows "0 – max" instead of "1 – max"
        _rangeRow(label: 'X Steps', total: ctrl.totalLength.value,
            frameSize: _frameLengthInt, max: ctrl.lengthMax,
            color: widget.primaryColor, s: s),
        SizedBox(height: s['cardPadding'] * 0.5),
        _rangeRow(label: 'Y Steps',  total: ctrl.totalWidth.value,
            frameSize: _frameWidthInt,  max: ctrl.widthMax,
            color: Colors.indigo, s: s),
      ]),
    ));
  }

  Widget _rangeRow({
    required String label,
    required int    total,
    required int    frameSize,
    required int    max,
    required Color  color,
    required Map<String, dynamic> s,
  }) {
    return Row(children: [
      SizedBox(
          width: s['iconSize'] * 1.8,
          child: Text(label, style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w700, color: color))),
      Text('$total − ${frameSize + 1} = ',
          style: TextStyle(fontSize: s['smallSize'], color: _textSecondary)),
      Container(
        padding: EdgeInsets.symmetric(horizontal: s['cardPadding'] * 0.45, vertical: s['cardPadding'] * 0.18),
        decoration: BoxDecoration(
          color:        color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(6),
          border:       Border.all(color: color.withValues(alpha: 0.3)),
        ),
        // ── KEY CHANGE: shows "0 – max"
        child: Text('0 – $max',
            style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w700, color: color)),
      ),
    ]);
  }

  // ── NEW: Frame diagram shown after valid X and Y entered ──────────────────
  Widget _frameDiagramPreview(SqmFrameSelectionController ctrl, Map<String, dynamic> s) {
    return Obx(() {
      final totalLen = ctrl.totalLength.value;
      final totalWid = ctrl.totalWidth.value;
      if (totalLen < _frameLengthInt || totalWid < _frameWidthInt) {
        return const SizedBox.shrink();
      }

      // Use selectedLength/Width if generated, else show frame at top-left (0,0)
      final offsetX = ctrl.isGenerated.value ? ctrl.selectedLength.value : 0;
      final offsetY = ctrl.isGenerated.value ? ctrl.selectedWidth.value  : 0;

      // Aspect ratio of the total plot
      final aspectRatio = totalLen / totalWid;
      final diagramHeight = 180.0;
      final diagramWidth  = (diagramHeight * aspectRatio).clamp(120.0, double.infinity);

      return Container(
        padding: EdgeInsets.all(s['cardPadding']),
        decoration: BoxDecoration(
          color:        Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: widget.primaryColor.withValues(alpha: 0.2), width: 1.5),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(Icons.grid_view_rounded, size: s['iconSize'] * 0.65, color: widget.primaryColor),
            SizedBox(width: s['cardPadding'] * 0.5),
            Text('Plot & Frame Preview',
                style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, color: _textPrimary)),
          ]),
          SizedBox(height: s['cardPadding'] * 0.4),
          Text(
            ctrl.isGenerated.value
                ? 'Frame placed at offset (X: $offsetX cm, Y: $offsetY cm) from southwest corner'
                : 'Orange frame will be shown here after random generation',
            style: TextStyle(fontSize: s['smallSize'], color: _textSecondary, fontStyle: FontStyle.italic),
          ),
          SizedBox(height: s['cardPadding']),
          Center(
            child: SizedBox(
              width:  diagramWidth,
              height: diagramHeight,
              child: CustomPaint(
                painter: _FrameDiagramPainter(
                  totalLength:  totalLen,
                  totalWidth:   totalWid,
                  frameLength:  _frameLengthInt,
                  frameWidth:   _frameWidthInt,
                  offsetX:      offsetX,
                  offsetY:      offsetY,
                  primaryColor: widget.primaryColor,
                  frameColor:   Colors.orange.shade700,
                  isGenerated:  ctrl.isGenerated.value,
                ),
              ),
            ),
          ),
          SizedBox(height: s['cardPadding'] * 0.8),
          // Legend
          Row(mainAxisAlignment: MainAxisAlignment.center, children: [
            _legendDot(widget.primaryColor.withValues(alpha: 0.3), 'Total Plot (${totalLen} steps × ${totalWid} steps)', s),
            SizedBox(width: s['cardPadding']),
            _legendDot(Colors.orange.shade300, 'Frame (${_frameLengthInt}cm × ${_frameWidthInt}cm)', s),
          ]),
          if (ctrl.isGenerated.value) ...[
            SizedBox(height: s['cardPadding'] * 0.6),
            // Dimension labels for the selected position
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              _dimBadge('X offset (cm)', offsetX, widget.primaryColor, s),
              SizedBox(width: s['cardPadding'] * 0.6),
              _dimBadge('Y offset (cm)', offsetY, Colors.indigo, s),
            ]),
          ],
        ]),
      );
    });
  }

  Widget _legendDot(Color color, String label, Map<String, dynamic> s) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 14, height: 14,
        decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3)),
      ),
      SizedBox(width: 6),
      Text(label, style: TextStyle(fontSize: s['smallSize'], color: _textSecondary)),
    ]);
  }

  Widget _dimBadge(String label, int value, Color color, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: s['cardPadding'] * 0.6, vertical: s['cardPadding'] * 0.3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: RichText(text: TextSpan(children: [
        TextSpan(text: '$label: ', style: TextStyle(fontSize: s['smallSize'], color: _textSecondary)),
        TextSpan(text: '${value}m', style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w700, color: color)),
      ])),
    );
  }

  // ── Generate button ────────────────────────────────────────────────────────
  Widget _generateButton(SqmFrameSelectionController ctrl, Map<String, dynamic> s) {
    return Obx(() {
      final can = ctrl.canGenerateRandom;
      
      String label = 'Generate Random Position';
      if (ctrl.generationCount.value == 1 && ctrl.isRejected.value) {
         label = 'Generate Random Position (1 Remaining)';
      } else if (ctrl.generationCount.value >= 2) {
         label = 'Max Generations Reached';
      }

      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: can ? ctrl.generateRandomPosition : null,
          icon:  Icon(Icons.shuffle, size: s['iconSize'] * 0.7),
          label: Text(
            label,
            style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, letterSpacing: 0.3),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: can ? widget.primaryColor : Colors.grey.shade300,
            foregroundColor: can ? Colors.white       : Colors.grey.shade600,
            padding: EdgeInsets.symmetric(horizontal: s['cardPadding'] * 1.5, vertical: s['cardPadding']),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: can ? 2 : 0,
          ),
        ),
      );
    });
  }

  // ── Result card ────────────────────────────────────────────────────────────
  Widget _resultCard(SqmFrameSelectionController ctrl, Map<String, dynamic> s, BuildContext context) {
    return Obx(() {
      final selLen = ctrl.selectedLength.value;
      final selWid = ctrl.selectedWidth.value;
      final lenMax = ctrl.lengthMax;
      final widMax = ctrl.widthMax;

      final sqmPerTreeId = _sqmCceDataEntryPerTreeId;
      final hasId = sqmPerTreeId != null;

      void onTap() {
        if (!hasId) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: const Text('Save frame selection first to enter survey details.'),
            backgroundColor: Colors.orange.shade700,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ));
          return;
        }
        Navigator.push(context, MaterialPageRoute(
          builder: (_) => IrrigationToYieldNavigationPage(
            surveyData:            widget.surveyData,
            form5controller:       widget.form5controller,
            selectedItemLabel:     'SQM Frame Position',
            cceAvailablePlotId:    _cceAvailablePlotId,
            cceDataEntryPerTreeId: sqmPerTreeId,
            isSquareMeters:        true,
          ),
        ));
      }

      return InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: widget.primaryColor.withValues(alpha: 0.25), width: 1.5),
            boxShadow: [BoxShadow(color: widget.primaryColor.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, 4))],
          ),
          child: Column(children: [
            // Header
            Container(
              padding: EdgeInsets.all(s['cardPadding'] * 0.85),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  widget.primaryColor.withValues(alpha: 0.1),
                  widget.primaryColor.withValues(alpha: 0.04),
                ]),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
              ),
              child: Row(children: [
                Icon(Icons.check_circle_rounded, color: widget.primaryColor, size: s['iconSize'] * 0.75),
                SizedBox(width: s['cardPadding'] * 0.6),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Selected Frame Position',
                      style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, color: _textPrimary)),
                  const SizedBox(height: 2),
                  Text(
                    hasId ? 'Tap to proceed to survey sections'
                        : 'Save frame selection first to enter survey details',
                    style: TextStyle(
                        fontSize: s['smallSize'],
                        color: hasId ? widget.primaryColor.withValues(alpha: 0.8) : Colors.orange.shade700,
                        fontStyle: FontStyle.italic),
                  ),
                ])),
                Icon(Icons.arrow_forward_ios_rounded, size: 14, color: widget.primaryColor.withValues(alpha: 0.6)),
              ]),
            ),
            // Position values
            Padding(
              padding: EdgeInsets.all(s['cardPadding']),
              child: Column(children: [
                _resultRow(
                    icon: Icons.straighten, axis: 'Length Offset',
                    selectedValue: selLen, rangeMax: lenMax,
                    color: widget.primaryColor, s: s),
                SizedBox(height: s['cardPadding']),
                _resultRow(
                    icon: Icons.swap_horiz, axis: 'Width Offset',
                    selectedValue: selWid, rangeMax: widMax,
                    color: Colors.indigo, s: s),
              ]),
            ),
          ]),
        ),
      );
    });
  }

  Widget _resultRow({
    required IconData icon,
    required String   axis,
    required int      selectedValue,
    required int      rangeMax,
    required Color    color,
    required Map<String, dynamic> s,
  }) {
    return Container(
      padding: EdgeInsets.all(s['cardPadding'] * 0.85),
      decoration: BoxDecoration(
        color:        color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(10),
        border:       Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(children: [
        Container(
          padding:    EdgeInsets.all(s['iconSize'] * 0.28),
          decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: s['iconSize'] * 0.65, color: color),
        ),
        SizedBox(width: s['cardPadding'] * 0.8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(axis, style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w600, color: _textSecondary)),
          const SizedBox(height: 2),
          // ── KEY CHANGE: shows "0 – rangeMax"
          Text('Range: 0 – $rangeMax',
              style: TextStyle(fontSize: s['smallSize'] - 1, color: color.withValues(alpha: 0.7), fontStyle: FontStyle.italic)),
        ])),
        Container(
          padding: EdgeInsets.symmetric(horizontal: s['cardPadding'] * 0.9, vertical: s['cardPadding'] * 0.5),
          decoration: BoxDecoration(
            color:        color,
            borderRadius: BorderRadius.circular(24),
            boxShadow:    [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))],
          ),
          child: Text('$selectedValue cm',
              style: TextStyle(fontSize: s['bodySize'] + 2, fontWeight: FontWeight.w800, color: Colors.white)),
        ),
      ]),
    );
  }

  // ── Rejection UI ───────────────────────────────────────────────────────────
  Widget _rejectButton(SqmFrameSelectionController ctrl, Map<String, dynamic> s, BuildContext context) {
    return Obx(() {
      if (!ctrl.isGenerated.value) return const SizedBox.shrink();
      if (ctrl.generationCount.value >= 2) return const SizedBox.shrink();
      
      return Padding(
        padding: EdgeInsets.only(top: s['cardPadding']),
        child: SizedBox(
          width: double.infinity,
          child: OutlinedButton.icon(
            onPressed: () => _showRejectDialog(context, ctrl, s),
            icon: Icon(Icons.cancel_outlined, size: s['iconSize'] * 0.7, color: Colors.red.shade600),
            label: Text(
              'Reject Position',
              style: TextStyle(fontSize: s['bodySize'], fontWeight: FontWeight.w700, color: Colors.red.shade600),
            ),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.red.shade300, width: 1.5),
              padding: EdgeInsets.symmetric(vertical: s['cardPadding'] * 0.8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      );
    });
  }

  void _showRejectDialog(BuildContext context, SqmFrameSelectionController ctrl, Map<String, dynamic> s) {
    final reasonCtrl = TextEditingController();
    bool isSubmitting = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red.shade600),
            const SizedBox(width: 8),
            const Text('Reject Position', style: TextStyle(fontWeight: FontWeight.bold)),
          ]),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Please provide a reason for rejecting this random position.', 
                  style: TextStyle(fontSize: s['smallSize'])),
              const SizedBox(height: 16),
              TextField(
                controller: reasonCtrl,
                decoration: InputDecoration(
                  hintText: 'Enter reason...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
              child: Text('Cancel', style: TextStyle(color: Colors.grey.shade700)),
            ),
            ElevatedButton(
              onPressed: isSubmitting 
                  ? null 
                  : () async {
                      if (reasonCtrl.text.trim().isEmpty) return;
                      setDialogState(() => isSubmitting = true);
                      await ctrl.rejectPosition(reasonCtrl.text);
                      setDialogState(() => isSubmitting = false);
                      if (ctx.mounted) Navigator.pop(ctx);
                    },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade600),
              child: isSubmitting
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Rejection', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
