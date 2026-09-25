import 'dart:math';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:aidea/view/screens/cce/Form5/frame_selection/tree_plant_measure/cce_plot_diagram.dart';
import 'package:aidea/view/screens/cce/Form5/frame_selection/tree_plant_measure/section_cards.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../../resources/constants/path.dart';
import '../../../../../resources/api_services/flutter_secure_storage.dart';
import '../../../../../controller/cce/cce_data_entry/cce_frame_selection.dart';
import '../../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../../controller/cce/cce_data_entry/form5_detail_controller.dart';
import '../../../../../controller/crop_dropdown_menu.dart';
import '../../../../../model/crop_list.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

class SelectedTreePlant {
  final int    serialNumber;
  final String type;
  final int    originalIndex;
  final String? cceDataEntryPerTreeId;
  final bool isMeasurementEntered;

  const SelectedTreePlant({
    required this.serialNumber,
    required this.type,
    required this.originalIndex,
    this.cceDataEntryPerTreeId,
    this.isMeasurementEntered = false,
  });

  SelectedTreePlant copyWith({
    String? cceDataEntryPerTreeId,
    bool? isMeasurementEntered,
  }) => SelectedTreePlant(
    serialNumber:          serialNumber,
    type:                  type,
    originalIndex:         originalIndex,
    cceDataEntryPerTreeId: cceDataEntryPerTreeId ?? this.cceDataEntryPerTreeId,
    isMeasurementEntered:  isMeasurementEntered ?? this.isMeasurementEntered,
  );

  @override
  String toString() => 'SelectedTreePlant(#$originalIndex, type=$type, id=$cceDataEntryPerTreeId)';
}

// ═══════════════════════════════════════════════════════════════════════════
// TreePlantSelectionController
// ═══════════════════════════════════════════════════════════════════════════

class TreePlantSelectionController extends GetxController {
  final int    requiredFrameCount;
  final String unitType;

  TreePlantSelectionController({
    required this.requiredFrameCount,
    required this.unitType,
  });

  final RxInt  totalTreesPlants       = 0.obs;
  final RxInt  totalYoung             = 0.obs;
  final RxInt  totalBearing           = 0.obs;
  final RxBool showYoungBearingInputs = false.obs;
  final RxBool isSelectionGenerated   = false.obs;
  final RxList<SelectedTreePlant> selectedBearing = <SelectedTreePlant>[].obs;
  final RxInt  youngCount             = 0.obs;
  final RxString errorMessage         = ''.obs;
  final RxBool   hasError             = false.obs;
  final RxInt _savedTotalTreesPlants  = 0.obs;

  /// Called immediately after save succeeds, using the IDs from the
  /// save response payload directly — no refetch needed.
  void injectIdsFromSaveResponse(List<dynamic> ifTreeThenRandomNo) {
    if (ifTreeThenRandomNo.isEmpty) return;

    // Build a map of randomNo → cceDataEntryPerTreeId from the response
    final Map<int, String> idMap = {};
    for (final e in ifTreeThenRandomNo) {
      if (e is Map<String, dynamic>) {
        final id = e['cceDataEntryPerTreeId']?.toString() ?? '';
        final no = _toInt(e['randomNo']);
        if (id.isNotEmpty && no > 0) {
          idMap[no] = id;
        }
      }
    }

    if (idMap.isEmpty) return;

    // Update selectedBearing items in-place with their IDs
    final updated = selectedBearing.map((item) {
      final id = idMap[item.originalIndex];
      if (id != null) {
        return item.copyWith(cceDataEntryPerTreeId: id);
      }
      return item;
    }).toList();

    selectedBearing.value = updated;
    selectedBearing.refresh(); // Force GetX to notify all Obx listeners
  }

  static int _toInt(dynamic v) {
    if (v is num) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }
  final totalTreesController   = TextEditingController();
  final totalYoungController   = TextEditingController();
  final totalBearingController = TextEditingController();

  final RxList<Offset> plottedTrees = <Offset>[].obs;

  int get requiredPlotCount => showYoungBearingInputs.value ? totalBearing.value : totalTreesPlants.value;

  void undoLastTree() {
    if (plottedTrees.isNotEmpty) {
      plottedTrees.removeLast();
      if (isSelectionGenerated.value) {
        _resetResults();
      }
      plottedTrees.refresh();
    }
  }

  void clearAllTrees() {
    if (plottedTrees.isNotEmpty) {
      plottedTrees.clear();
      if (isSelectionGenerated.value) {
        _resetResults();
      }
      plottedTrees.refresh();
    }
  }

  @override
  void onInit() {
    super.onInit();
    ever(plottedTrees, (_) => _revalidate());
  }

  void _revalidate() {
    if (showYoungBearingInputs.value) {
      _validateClassified();
    } else {
      _validateSimple();
    }
  }

  @override
  void onClose() {
    totalTreesController.dispose();
    totalYoungController.dispose();
    totalBearingController.dispose();
    super.onClose();
  }

  // ── Validation ─────────────────────────────────────────────────────────────

  bool _validateSimple() {
    if (totalTreesPlants.value < requiredFrameCount) {
      errorMessage.value = 'Total $unitType (${totalTreesPlants.value}) must be at least $requiredFrameCount';
      hasError.value = true;
      return false;
    }
    if (plottedTrees.length < totalTreesPlants.value) {
      errorMessage.value = 'Please plot all ${totalTreesPlants.value} trees on the field diagram before generating.';
      hasError.value = true;
      return false;
    }
    hasError.value     = false;
    errorMessage.value = '';
    return true;
  }

  bool _validateClassified() {
    final young   = totalYoung.value;
    final bearing = totalBearing.value;

    if (young == 0 && bearing == 0) {
      errorMessage.value = 'Please enter Young and Bearing $unitType counts';
      hasError.value = true;
      return false;
    }
    if (bearing < requiredFrameCount) {
      errorMessage.value =
      'Bearing $unitType ($bearing) must be at least $requiredFrameCount for random selection';
      hasError.value = true;
      return false;
    }
    if (plottedTrees.length < bearing) {
      errorMessage.value = 'Please plot all $bearing bearing trees on the field diagram before generating.';
      hasError.value = true;
      return false;
    }
    hasError.value     = false;
    errorMessage.value = '';
    return true;
  }

  // ── Input handlers ─────────────────────────────────────────────────────────

  void onTotalTreesChanged(String value) {
    totalTreesPlants.value = int.tryParse(value) ?? 0;
    _savedTotalTreesPlants.value = totalTreesPlants.value;
    _resetResults();
    if (showYoungBearingInputs.value) {
      _validateClassified();
    } else {
      _validateSimple();
    }
  }

  void onYoungCountChanged(String value) {
    totalYoung.value = int.tryParse(value) ?? 0;
    totalTreesPlants.value = totalYoung.value + totalBearing.value;
    _resetResults();
    if (showYoungBearingInputs.value) _validateClassified();
  }

  void onBearingCountChanged(String value) {
    totalBearing.value = int.tryParse(value) ?? 0;
    totalTreesPlants.value = totalYoung.value + totalBearing.value;
    _resetResults();
    if (showYoungBearingInputs.value) _validateClassified();
  }

  void toggleYoungBearingClassification(bool value) {
    showYoungBearingInputs.value = value;
    _resetResults();
    hasError.value     = false;
    errorMessage.value = '';
    if (!value) {
      totalYoung.value   = 0;
      totalBearing.value = 0;
      totalYoungController.clear();
      totalBearingController.clear();
    } else {
      totalYoung.value   = 0;
      totalBearing.value = 0;
      totalYoungController.clear();
      totalBearingController.clear();
    }
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  void performRandomSelection() {
    if (showYoungBearingInputs.value) {
      generateClassifiedRandomSelection();
    } else {
      generateSimpleRandomSelection();
    }
  }

  void generateSimpleRandomSelection() {
    if (!_validateSimple()) return;
    final picked = (List<int>.generate(totalTreesPlants.value, (i) => i + 1)..shuffle(Random()))
        .take(requiredFrameCount).toList()..sort();
    selectedBearing.value = picked.asMap().entries
        .map((e) => SelectedTreePlant(
      serialNumber:  e.key + 1,
      type:          'general',
      originalIndex: e.value,
    ))
        .toList();
    youngCount.value           = 0;
    isSelectionGenerated.value = true;
    SnackbarHelper.showSuccess(
      'Selection Complete',
      'Successfully selected $requiredFrameCount $unitType randomly',
    );
  }

  void generateClassifiedRandomSelection() {
    if (!_validateClassified()) return;
    final picked = (List<int>.generate(totalBearing.value, (i) => i + 1)..shuffle(Random()))
        .take(requiredFrameCount).toList()..sort();
    selectedBearing.value = picked.asMap().entries
        .map((e) => SelectedTreePlant(serialNumber: e.key + 1, type: 'bearing', originalIndex: e.value))
        .toList();
    youngCount.value           = totalYoung.value;
    isSelectionGenerated.value = true;
  }

  void _resetResults() {
    isSelectionGenerated.value = false;
    youngCount.value = 0;
    selectedBearing.clear();
    plottedTrees.clear();
  }

  void resetSelection() {
    _resetResults();
    totalTreesPlants.value       = 0;
    totalYoung.value             = 0;
    totalBearing.value           = 0;
    showYoungBearingInputs.value = false;
    totalTreesController.clear();
    totalYoungController.clear();
    totalBearingController.clear();
    hasError.value     = false;
    errorMessage.value = '';
  }

  // ── Populate from saved data ───────────────────────────────────────────────

  void populateSavedData(CceFrameSelectionPayload saved) {

    if (saved.isSquareMeters) return;

    final bearing = saved.totalNumberOfBearing;
    final young   = saved.totalNumberOfYoung;
    final total   = bearing + young;

    if (saved.treeItems.isEmpty && saved.ifTreeThenRandomNo.isEmpty) {
      if (total > 0) {
        final hasClassification = young > 0;
        totalTreesPlants.value    = total;
        totalTreesController.text = total.toString();
        
        if (hasClassification) {
          showYoungBearingInputs.value = true;
          totalYoung.value             = young;
          totalBearing.value           = bearing;
          totalYoungController.text    = young.toString();
          totalBearingController.text  = bearing.toString();
          youngCount.value             = young;
        } else {
          totalBearing.value           = bearing;
          totalBearingController.text  = bearing.toString();
        }
      }
      return;
    }

    if (total <= 0) return;

    final hasClassification = young > 0;

    totalTreesPlants.value    = total;
    totalTreesController.text = total.toString();
    if (hasClassification) {
      showYoungBearingInputs.value = true;
      totalYoung.value             = young;
      totalBearing.value           = bearing;
      totalYoungController.text    = young.toString();
      totalBearingController.text  = bearing.toString();
    }

    final sortedItems = [...saved.treeItems]
      ..sort((a, b) => a.randomNo.compareTo(b.randomNo));

    final rebuilt = sortedItems.asMap().entries.map((e) {
      final serialIdx = e.key;
      final item      = e.value;
      // Look for an existing item with the same originalIndex to preserve its ID
      final existingItem = selectedBearing.firstWhereOrNull((b) => b.originalIndex == item.randomNo);

      // In-memory ID always wins — it was set by injectIdsFromSaveResponse
      // and is at least as fresh as the server fetch response
      String? finalId = existingItem?.cceDataEntryPerTreeId?.isNotEmpty == true
          ? existingItem!.cceDataEntryPerTreeId
          : item.cceDataEntryPerTreeId.isNotEmpty
              ? item.cceDataEntryPerTreeId
              : null;

      return SelectedTreePlant(
        serialNumber:          serialIdx + 1,
        type:                  hasClassification ? 'bearing' : 'general',
        originalIndex:         item.randomNo,
        cceDataEntryPerTreeId: finalId,
      );
    }).toList();

    // If the rebuilt list is empty, DO NOT overwrite the existing selection.
    if (rebuilt.isNotEmpty) {
      selectedBearing.value = rebuilt;
    }

    if (hasClassification) youngCount.value = young;

    isSelectionGenerated.value = true;
    hasError.value             = false;
    errorMessage.value         = '';

    // Check completion status of yield details for each tree in parallel
    checkTreesCompletionStatus();
  }

  Future<void> checkTreesCompletionStatus() async {
    final token = await StorageService.instance.read('authToken') ?? '';
    if (token.isEmpty) return;

    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    };

    final List<Future<void>> futures = [];
    for (int i = 0; i < selectedBearing.length; i++) {
      final tree = selectedBearing[i];
      final treeId = tree.cceDataEntryPerTreeId;
      if (treeId != null && treeId.isNotEmpty) {
        futures.add(() async {
          try {
            final url = '$cceYieldFetch/$treeId';
            final res = await http.get(Uri.parse(url), headers: headers);
            if (res.statusCode == 200 || res.statusCode == 201) {
              final body = jsonDecode(res.body);
              final list = (body['payload']?['yieldTypeResponses'] as List?) ?? [];
              if (list.isNotEmpty) {
                if (i < selectedBearing.length) {
                  selectedBearing[i] = selectedBearing[i].copyWith(isMeasurementEntered: true);
                }
              }
            }
          } catch (_) {}
        }());
      }
    }
    await Future.wait(futures);
  }

  // ── Private ────────────────────────────────────────────────────────────────
}

// ═══════════════════════════════════════════════════════════════════════════
// TreePlantSelectionWidget
// ═══════════════════════════════════════════════════════════════════════════

class TreePlantSelectionWidget extends StatefulWidget {
  final int    frameCount;
  final String unitType;
  final Color  primaryColor;
  final Color  lightColor;
  final CceFrameSelectionPayload? savedData;
  final Map<String, String> surveyData;
  final Form5Controller     form5controller;

  const TreePlantSelectionWidget({
    super.key,
    required this.frameCount,
    required this.unitType,
    required this.surveyData,
    required this.form5controller,
    this.primaryColor = const Color(0xFF10B981),
    this.lightColor   = const Color(0xFFD1FAE5),
    this.savedData,
  });

  @override
  State<TreePlantSelectionWidget> createState() => _TreePlantSelectionWidgetState();
}

class _TreePlantSelectionWidgetState extends State<TreePlantSelectionWidget> {
  late TreePlantSelectionController _controller;

  /// Guards against populating more than once on initial load.
  /// Reset to false when a post-save repopulation is needed.
  bool _savedDataPopulated = false;

  String _stage1Label = 'Young';
  String _stage2Label = 'Bearing';

  static const surfaceColor   = Color(0xFFF8FAF9);
  static const textPrimary    = Color(0xFF1A1A1A);
  static const textSecondary  = Color(0xFF666666);

  IconData get _unitIcon     => widget.unitType == 'trees' ? Icons.park  : Icons.grass;
  String   get _unitLabel    => widget.unitType == 'trees' ? 'Trees'     : 'Plants';
  String   get _unitSingular => widget.unitType == 'trees' ? 'Tree'      : 'Plant';

  String get _cceAvailablePlotId => widget.surveyData['cceAvailablePlotId'] ?? '';

  @override
  void initState() {
    super.initState();

    final cropName = widget.surveyData['cropName'] ?? '';
    if (cropName.isNotEmpty && Get.isRegistered<MenuDropdownController>()) {
      final menuCtrl = Get.find<MenuDropdownController>();
      final allCrops = menuCtrl.getAllCropsForLoading();
      final matchingCrops = allCrops
          .where((c) => c.cropNameEn.toLowerCase().contains(cropName.toLowerCase()))
          .toList();

      final young = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.young);
      final bearing = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.bearing);

      final a = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.a);
      final b = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.b);

      final child = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.child);
      final adult = matchingCrops.firstWhereOrNull((c) => c.seasonalClassificationName == SeasonalClassificationName.adult);

      if (child != null && adult != null) {
        _stage1Label = 'Child';
        _stage2Label = 'Adult';
      } else if (a != null && b != null) {
        _stage1Label = 'A';
        _stage2Label = 'B';
      } else if (young != null && bearing != null) {
        _stage1Label = 'Young';
        _stage2Label = 'Bearing';
      }
    }

    final plotId = widget.surveyData['cceAvailablePlotId']
        ?? widget.surveyData['surveyNo'] ?? 'unknown';

    _controller = Get.put(
      TreePlantSelectionController(
        requiredFrameCount: widget.frameCount,
        unitType:           widget.unitType,
      ),
      tag: 'tree_plant_${widget.unitType}_${widget.frameCount}_$plotId',
    );

    // ── Initial population from saved data ────────────────────────────────
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      CceFrameSelectionPayload? initial = widget.savedData;
      if (initial == null) {
        final cropId = widget.surveyData['cropId'] ?? 'unknown';
        try {
          initial = Get.find<Form5DetailController>(tag: 'detail_${cropId}_$plotId')
              .savedPlotData.value;
        } catch (_) {}
      }
      _tryPopulate(initial);
    });
  }

  @override
  void dispose() {
    final plotId = widget.surveyData['cceAvailablePlotId']
        ?? widget.surveyData['surveyNo'] ?? 'unknown';
    Get.delete<TreePlantSelectionController>(
      tag: 'tree_plant_${widget.unitType}_${widget.frameCount}_$plotId',
      force: true,
    );
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant TreePlantSelectionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.savedData != oldWidget.savedData) {
      final newPayload = widget.savedData;
      if (newPayload != null) {
        // Only repopulate if controller has NO IDs at all yet.
        // If controller already has IDs (from injectIdsFromSaveResponse),
        // do not reset — those IDs are correct and must not be overwritten.
        final controllerHasAnyIds = _controller.selectedBearing
            .any((b) => b.cceDataEntryPerTreeId != null 
                     && b.cceDataEntryPerTreeId!.isNotEmpty);

        if (!controllerHasAnyIds) {
          _savedDataPopulated = false;
          _tryPopulate(newPayload);
        }
      }
    }
  }

  /// Populates the controller from [data] on initial load only.
  /// The _savedDataPopulated flag prevents overwriting user edits.
  /// Post-save repopulation bypasses this via the _repopulateTrigger ever() above.
  void _tryPopulate(CceFrameSelectionPayload? data) {
    if (data == null) return;
    if (data.isSquareMeters) return;

    final hasData = data.treeItems.isNotEmpty || data.ifTreeThenRandomNo.isNotEmpty;
    final hasCounts = data.totalNumberOfBearing > 0 || data.totalNumberOfYoung > 0;
    if (!hasData && !hasCounts) return;

    // Check if controller already reflects this exact data.
    bool alreadySynced = false;
    if (_controller.isSelectionGenerated.value &&
        _controller.selectedBearing.length == data.treeItems.length &&
        data.treeItems.isNotEmpty &&
        _controller.selectedBearing.isNotEmpty) {
      final controllerIndices =
      _controller.selectedBearing.map((t) => t.originalIndex).toSet();
      final savedIndices = data.treeItems.map((t) => t.randomNo).toSet();
      alreadySynced = controllerIndices.length == savedIndices.length &&
          controllerIndices.containsAll(savedIndices);
    } else if (!hasData && hasCounts) {
      if (_controller.totalBearing.value == data.totalNumberOfBearing &&
          _controller.totalYoung.value == data.totalNumberOfYoung) {
        alreadySynced = true;
      }
    }

    if (alreadySynced) {
      _savedDataPopulated = true;
      return;
    }

    if (_savedDataPopulated) return;

    _savedDataPopulated = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _controller.populateSavedData(data);
    });
  }

  Map<String, dynamic> _sizes(BuildContext context) {
    final w  = MediaQuery.of(context).size.width;
    final xs = w < 360;
    final sm = w >= 360 && w < 600;
    final md = w >= 600 && w < 840;
    return {
      'cardPadding': xs ? 14.0 : (sm ? 16.0 : (md ? 20.0 : 24.0)),
      'subtitleSize':xs ? 14.0 : (sm ? 16.0 : (md ? 18.0 : 20.0)),
      'bodySize':    xs ? 12.0 : (sm ? 13.0 : (md ? 14.0 : 16.0)),
      'smallSize':   xs ? 10.0 : (sm ? 11.0 : (md ? 12.0 : 13.0)),
      'iconSize':    xs ? 20.0 : (sm ? 24.0 : (md ? 28.0 : 32.0)),
      'borderRadius':xs ? 16.0 : (sm ? 18.0 : (md ? 20.0 : 24.0)),
    };
  }

  @override
  Widget build(BuildContext context) {
    final s = _sizes(context);
    return Obx(() {
      // Read reactive values
      final isClassified = _controller.showYoungBearingInputs.value;
      final hasError     = _controller.hasError.value;
      final isGenerated  = _controller.isSelectionGenerated.value;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: s['cardPadding'] * 1.2),
          _classificationToggle(_controller, s),
          SizedBox(height: s['cardPadding'] * 1.2),

          if (isClassified) ...[
            _classifiedInputs(_controller, s),
            SizedBox(height: s['cardPadding'] * 1.2),
          ] else ...[
            SizedBox(height: s['cardPadding'] * 1.2),
          ],

          // Field Diagram for manual plotting
          Obx(() {
            final requiredTrees = _controller.requiredPlotCount;
            if (requiredTrees > 0) {
              return Column(children: [
                CceFieldDiagram(
                  totalBearing: requiredTrees,
                  totalYoung: _controller.totalYoung.value,
                  selectedIndices: _controller.selectedBearing.map((e) => e.originalIndex).toList(),
                  unitType: widget.unitType,
                  primaryColor: widget.primaryColor,
                  plottedTrees: _controller.plottedTrees.toList(),
                  onTreePlotted: (offset) {
                    _controller.plottedTrees.add(offset);
                  },
                  onUndo: _controller.undoLastTree,
                  onClearAll: _controller.clearAllTrees,
                ),
                SizedBox(height: s['cardPadding'] * 1.2),
              ]);
            }
            return const SizedBox.shrink();
          }),

          if (hasError) ...[
            _errorBanner(_controller, s),
            SizedBox(height: s['cardPadding'] * 1.2),
          ],

          _generateButton(_controller, s),

          if (isGenerated) ...[
            SizedBox(height: s['cardPadding'] * 1.5),
            _results(_controller, s),
          ],
        ],
      );
    });
  }

  // ── UI builders ───────────────────────────────────────────────────────────

  Widget _classificationToggle(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Obx(() => Container(
      padding: EdgeInsets.all(s['cardPadding'] * 0.8),
      decoration: BoxDecoration(
        color:  controller.showYoungBearingInputs.value ? widget.primaryColor.withValues(alpha: 0.05) : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color:  controller.showYoungBearingInputs.value ? widget.primaryColor.withValues(alpha: 0.2) : Colors.grey.shade300,
          width:  1.5,
        ),
      ),
      child: Row(children: [
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Icon(Icons.category_outlined, size: s['iconSize'] * 0.6, color: widget.primaryColor),
            SizedBox(width: s['cardPadding'] * 0.5),
            Text('Classify $_stage1Label & $_stage2Label', style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, color: textPrimary)),
          ]),
          SizedBox(height: s['cardPadding'] * 0.3),
          Text('$_stage1Label: count recorded only  •  $_stage2Label: ${widget.frameCount} randomly selected',
              style: TextStyle(fontSize: s['smallSize'], color: textSecondary, height: 1.3)),
        ])),
        Switch(
          value:           controller.showYoungBearingInputs.value,
          onChanged:       controller.toggleYoungBearingClassification,
          activeThumbColor: widget.primaryColor,
          activeTrackColor: widget.primaryColor.withValues(alpha: 0.3),
        ),
      ]),
    ));
  }

  Widget _classifiedInputs(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.all(s['cardPadding']),
      decoration: BoxDecoration(
        color:        widget.primaryColor.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border:       Border.all(color: widget.primaryColor.withValues(alpha: 0.15), width: 1.5),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: EdgeInsets.all(s['cardPadding'] * 0.6),
          decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.amber.shade300)),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(Icons.lightbulb_outline, color: Colors.amber.shade700, size: s['iconSize'] * 0.55),
            SizedBox(width: s['cardPadding'] * 0.5),
            Expanded(child: Text(
              '$_stage1Label $_unitLabel: enter total count in field — recorded as-is, no selection needed.\n'
                  '$_stage2Label $_unitLabel: enter total count in field — ${widget.frameCount} will be randomly selected.',
              style: TextStyle(fontSize: s['smallSize'], color: Colors.amber.shade900, height: 1.4),
            )),
          ]),
        ),
        SizedBox(height: s['cardPadding']),
        _labeledField(label: 'Total $_stage1Label $_unitLabel in Field', subtitle: 'Count only — no random selection',
            icon: Icons.spa, iconColor: Colors.green.shade600, textController: controller.totalYoungController,
            hint: 'Enter ${_stage1Label.toLowerCase()} count', onChanged: controller.onYoungCountChanged, accentColor: Colors.green.shade600, s: s, readOnly: true),
        SizedBox(height: s['cardPadding']),
        _labeledField(label: 'Total $_stage2Label $_unitLabel in Field', subtitle: '${widget.frameCount} will be randomly selected  (min. ${widget.frameCount})',
            icon: Icons.eco, iconColor: Colors.orange.shade600, textController: controller.totalBearingController,
            hint: 'Enter ${_stage2Label.toLowerCase()} count (min ${widget.frameCount})', onChanged: controller.onBearingCountChanged, accentColor: Colors.orange.shade600, s: s, readOnly: true),
        SizedBox(height: s['cardPadding'] * 0.8),
        Obx(() {
          final ok = controller.totalBearing.value >= widget.frameCount;
          return Container(
            padding: EdgeInsets.all(s['cardPadding'] * 0.6),
            decoration: BoxDecoration(
              color:  ok ? Colors.green.shade50  : Colors.orange.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: ok ? Colors.green.shade300 : Colors.orange.shade300),
            ),
            child: Row(children: [
              Icon(ok ? Icons.check_circle : Icons.warning,
                  color: ok ? Colors.green.shade700 : Colors.orange.shade700, size: s['iconSize'] * 0.5),
              SizedBox(width: s['cardPadding'] * 0.5),
              Expanded(child: Text(
                ok ? 'Ready — $_stage1Label: ${controller.totalYoung.value}  |  $_stage2Label: ${controller.totalBearing.value} (will select ${widget.frameCount} randomly)'
                    : '$_stage2Label $_unitLabel must be at least ${widget.frameCount}',
                style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w600,
                    color: ok ? Colors.green.shade900 : Colors.orange.shade900),
              )),
            ]),
          );
        }),
      ]),
    );
  }
  Widget _errorBanner(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.all(s['cardPadding'] * 0.8),
      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.red.shade300, width: 1.5)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(Icons.error_outline, color: Colors.red.shade700, size: s['iconSize'] * 0.7),
        SizedBox(width: s['cardPadding'] * 0.6),
        Expanded(child: Text(controller.errorMessage.value,
            style: TextStyle(fontSize: s['smallSize'] + 1, color: Colors.red.shade900, fontWeight: FontWeight.w600, height: 1.4))),
      ]),
    );
  }

  Widget _generateButton(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Obx(() {
      final can = _controller.showYoungBearingInputs.value
          ? _controller.totalBearing.value >= widget.frameCount &&
          !_controller.hasError.value
          : _controller.totalTreesPlants.value >= widget.frameCount &&
          !_controller.hasError.value;
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          onPressed: can ? controller.performRandomSelection : null,
          icon:  Icon(controller.isSelectionGenerated.value ? Icons.refresh : Icons.shuffle, size: s['iconSize'] * 0.7),
          label: Text(controller.isSelectionGenerated.value ? 'Regenerate Selection' : 'Generate Random Selection',
              style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, letterSpacing: 0.3)),
          style: ElevatedButton.styleFrom(
            backgroundColor: can ? widget.primaryColor : Colors.grey.shade300,
            foregroundColor: can ? Colors.white        : Colors.grey.shade600,
            padding:   EdgeInsets.symmetric(horizontal: s['cardPadding'] * 1.5, vertical: s['cardPadding']),
            shape:     RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: can ? 2 : 0,
          ),
        ),
      );
    });
  }

  Widget _results(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Obx(() {
        if (controller.showYoungBearingInputs.value) {
          return Column(children: [
            _youngSummaryCard(controller, s),
            SizedBox(height: s['cardPadding']),
          ]);
        }
        return const SizedBox.shrink();
      }),
      SizedBox(height: s['cardPadding'] * 1.5),
      _bearingList(controller, s),
    ]);
  }

  Widget _youngSummaryCard(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Container(
      padding: EdgeInsets.all(s['cardPadding']),
      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.green.shade200, width: 1.5)),
      child: Row(children: [
        Container(
          padding:     EdgeInsets.all(s['iconSize'] * 0.3),
          decoration:  BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(10)),
          child: Icon(Icons.spa, color: Colors.green.shade700, size: s['iconSize'] * 0.7),
        ),
        SizedBox(width: s['cardPadding'] * 0.8),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('$_stage1Label $_unitLabel', style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w600, color: Colors.green.shade700)),
          const SizedBox(height: 2),
          Text('${controller.youngCount.value} $_unitLabel recorded (no random selection)',
              style: TextStyle(fontSize: s['bodySize'], fontWeight: FontWeight.w700, color: Colors.green.shade900)),
        ])),
        Container(
          padding:    EdgeInsets.symmetric(horizontal: s['cardPadding'] * 0.8, vertical: s['cardPadding'] * 0.4),
          decoration: BoxDecoration(color: Colors.green.shade600, borderRadius: BorderRadius.circular(16)),
          child: Text('${controller.youngCount.value}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ]),
    );
  }

  Widget _bearingList(TreePlantSelectionController controller, Map<String, dynamic> s) {
    return Obx(() {
      final total     = controller.selectedBearing.length;
      final completed = controller.selectedBearing.where((t) => t.isMeasurementEntered).length;
      final allDone   = total > 0 && completed == total;

      return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: EdgeInsets.all(s['cardPadding'] * 0.8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.grey.shade200, width: 1.5),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Data Entry Progress',
                  style: TextStyle(fontSize: s['smallSize'], fontWeight: FontWeight.w600, color: textSecondary)),
              Text('$completed / $total $_unitLabel',
                  style: TextStyle(
                      fontSize: s['smallSize'],
                      fontWeight: FontWeight.w700,
                      color: allDone ? Colors.green.shade700 : widget.primaryColor)),
            ]),
            SizedBox(height: s['cardPadding'] * 0.5),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: total > 0 ? completed / total : 0,
                minHeight: 8,
                backgroundColor: Colors.grey.shade100,
                valueColor: AlwaysStoppedAnimation<Color>(
                    allDone ? Colors.green.shade500 : widget.primaryColor),
              ),
            ),
          ]),
        ),
        SizedBox(height: s['cardPadding']),

        Container(
          padding: EdgeInsets.all(s['cardPadding'] * 0.8),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [
              widget.primaryColor.withValues(alpha: 0.1),
              widget.primaryColor.withValues(alpha: 0.05)
            ]),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(children: [
            Icon(Icons.check_circle, color: widget.primaryColor, size: s['iconSize'] * 0.7),
            SizedBox(width: s['cardPadding'] * 0.6),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(
                controller.showYoungBearingInputs.value
                    ? 'Randomly Selected Bearing $_unitLabel'
                    : 'Selected $_unitLabel',
                style: TextStyle(fontSize: s['bodySize'] + 1, fontWeight: FontWeight.w700, color: textPrimary),
              ),
              Text('Tap any row to enter its measurements',
                  style: TextStyle(fontSize: s['smallSize'], color: textSecondary)),
            ])),
            Container(
              padding: EdgeInsets.symmetric(
                  horizontal: s['cardPadding'] * 0.7,
                  vertical: s['cardPadding'] * 0.3),
              decoration: BoxDecoration(
                  color: widget.primaryColor, borderRadius: BorderRadius.circular(16)),
              child: Text('${controller.selectedBearing.length}',
                  style: TextStyle(
                      fontSize: s['bodySize'], fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ]),
        ),
        SizedBox(height: s['cardPadding']),

        Container(
          constraints: const BoxConstraints(maxHeight: 400),
          decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade200, width: 1.5),
              borderRadius: BorderRadius.circular(10)),
          child: ListView.separated(
            shrinkWrap: true,
            physics: const BouncingScrollPhysics(),
            itemCount: controller.selectedBearing.length,
            separatorBuilder: (_, __) =>
                Divider(height: 1, thickness: 1, color: Colors.grey.shade100),
            itemBuilder: (ctx, i) => _listItem(controller.selectedBearing[i], s, ctx),
          ),
        ),
      ]);
    });
  }

  Widget _listItem(SelectedTreePlant item, Map<String, dynamic> s, BuildContext context) {
    final isBearing  = item.type == 'bearing';
    final typeColor  = isBearing ? Colors.orange.shade600 : widget.primaryColor;
    final typeIcon   = isBearing ? Icons.eco : _unitIcon;
    final isLocked   = item.cceDataEntryPerTreeId == null;
    final isComplete = !isLocked && item.isMeasurementEntered;
    final itemLabel  = '$_unitSingular #${item.originalIndex}';

    void onTap() {
      if (_cceAvailablePlotId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Plot ID not available. Please save frame selection first.'),
          backgroundColor: Colors.orange.shade700,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
        return;
      }

      if (item.cceDataEntryPerTreeId == null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Please save the frame selection first before entering data.'),
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
          selectedItemLabel:     itemLabel,
          cceAvailablePlotId:    _cceAvailablePlotId,
          cceDataEntryPerTreeId: item.cceDataEntryPerTreeId!,
        ),
      )).then((submitted) {
        if (submitted == true) {
          final idx = _controller.selectedBearing.indexWhere((t) => t.cceDataEntryPerTreeId == item.cceDataEntryPerTreeId);
          if (idx != -1) {
            _controller.selectedBearing[idx] = _controller.selectedBearing[idx].copyWith(isMeasurementEntered: true);
          }
        }
      });
    }

    return InkWell(
      onTap: isLocked ? () {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Save frame selection first to enable data entry.'),
          backgroundColor: Colors.orange.shade700,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
      } : onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
            horizontal: s['cardPadding'], vertical: s['cardPadding'] * 0.9),
        color: item.serialNumber % 2 == 0 ? Colors.grey.shade50 : Colors.white,
        child: Row(children: [
          Container(
            width: s['iconSize'] * 1.2,
            height: s['iconSize'] * 1.2,
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [
                widget.primaryColor,
                widget.primaryColor.withValues(alpha: 0.7)
              ]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(
                  color: widget.primaryColor.withValues(alpha: 0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 2))],
            ),
            child: Center(child: Text('${item.serialNumber}',
                style: TextStyle(
                    fontSize: s['smallSize'] + 1,
                    fontWeight: FontWeight.w700,
                    color: Colors.white))),
          ),
          SizedBox(width: s['cardPadding']),

          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(itemLabel,
                style: TextStyle(
                    fontSize: s['bodySize'] + 1,
                    fontWeight: FontWeight.w700,
                    color: textPrimary)),
            const SizedBox(height: 3),
            Row(children: [
              Icon(
                isComplete ? Icons.check_circle : Icons.radio_button_unchecked,
                size: s['smallSize'] + 2,
                color: isComplete ? Colors.green.shade600 : Colors.grey.shade400,
              ),
              const SizedBox(width: 4),
              Text(
                isComplete ? 'Data entered' : 'Tap to enter data',
                style: TextStyle(
                  fontSize: s['smallSize'],
                  fontWeight: FontWeight.w500,
                  color: isComplete ? Colors.green.shade600 : Colors.grey.shade500,
                ),
              ),
            ]),
          ])),

          Container(
            padding: EdgeInsets.symmetric(
                horizontal: s['cardPadding'] * 0.7,
                vertical: s['cardPadding'] * 0.35),
            decoration: BoxDecoration(
              color: isLocked
                  ? Colors.grey.shade100
                  : isComplete
                  ? Colors.green.shade50
                  : widget.primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isLocked
                    ? Colors.grey.shade300
                    : isComplete
                    ? Colors.green.shade300
                    : widget.primaryColor.withValues(alpha: 0.3),
              ),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(
                isLocked
                    ? Icons.lock_outline
                    : isComplete
                    ? Icons.done_all
                    : Icons.edit_outlined,
                size: s['smallSize'] + 1,
                color: isLocked
                    ? Colors.grey.shade500
                    : isComplete
                    ? Colors.green.shade700
                    : widget.primaryColor,
              ),
              const SizedBox(width: 4),
              Text(
                isLocked ? 'Locked' : isComplete ? 'Done' : 'Enter',
                style: TextStyle(
                  fontSize: s['smallSize'],
                  fontWeight: FontWeight.w700,
                  color: isLocked
                      ? Colors.grey.shade500
                      : isComplete
                      ? Colors.green.shade700
                      : widget.primaryColor,
                ),
              ),
            ]),
          ),
          SizedBox(width: s['cardPadding'] * 0.4),

          Icon(Icons.arrow_forward_ios_rounded,
              size: s['iconSize'] * 0.45, color: Colors.grey.shade400),
        ]),
      ),
    );
  }

  Widget _labeledField({required String label, required String subtitle, required IconData icon,
    required Color iconColor, required TextEditingController textController, required String hint,
    required Function(String) onChanged, required Color accentColor, required Map<String, dynamic> s,
    bool readOnly = false}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Icon(icon, size: s['iconSize'] * 0.55, color: iconColor),
        SizedBox(width: s['cardPadding'] * 0.4),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label,    style: TextStyle(fontSize: s['bodySize'],     fontWeight: FontWeight.w700, color: textPrimary)),
          Text(subtitle, style: TextStyle(fontSize: s['smallSize'] - 1, color: iconColor.withValues(alpha: 0.8), fontStyle: FontStyle.italic)),
        ])),
      ]),
      SizedBox(height: s['cardPadding'] * 0.5),
      _textField(controller: textController, hint: hint, onChanged: onChanged, accentColor: accentColor, s: s, readOnly: readOnly),
    ]);
  }

  Widget _textField({required TextEditingController controller, required String hint,
    required Function(String) onChanged, required Color accentColor,
    required Map<String, dynamic> s, Widget? prefixIcon, bool readOnly = false}) {
    return TextField(
      readOnly:        readOnly,
      controller:      controller,
      keyboardType:    TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      onChanged:       onChanged,
      style:           TextStyle(fontSize: s['bodySize'] + 2, fontWeight: FontWeight.w600, color: textPrimary),
      decoration: InputDecoration(
        hintText:   hint,
        hintStyle:  TextStyle(color: textSecondary.withValues(alpha: 0.5), fontSize: s['bodySize']),
        prefixIcon: prefixIcon,
        filled:     true,
        fillColor:  readOnly ? Colors.grey.shade100 : surfaceColor,
        border:        OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: accentColor, width: 2)),
        contentPadding: EdgeInsets.symmetric(horizontal: s['cardPadding'], vertical: s['cardPadding'] * 0.8),
      ),
    );
  }
}
