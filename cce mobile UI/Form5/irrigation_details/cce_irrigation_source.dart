import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../../controller/cce/cce_data_entry/cce_irrigation_details.dart';
import '../../../../../controller/cce/cce_data_entry/cultivation_details.dart';
import '../../../../../controller/cce_survey_fetch.dart';
import '../../../../../resources/api_services/api_error_handler.dart';
import '../../../../../controller/cce/cce_data_entry/section_wise_navigation.dart';
import '../../../../../model/cce/cce_mock_models.dart';
import '../frame_selection/tree_plant_measure/section_cards.dart'
    show CceSurveyDataX;
class IrrigationDetailsCCEPage extends StatelessWidget {
  final Map<String, String> surveyData;
  static const primaryGreen = Color(0xFF2D5F3F);
  static const surfaceColor = Color(0xFFF8FAF9);
  static const accentRed = Color(0xFFE53935);
  const IrrigationDetailsCCEPage({super.key, required this.surveyData});
  // Typed accessors — no raw string literals scattered through the file
  String get _plotId => surveyData.cceAvailablePlotId;
  String? get _perTreeId => surveyData.cceDataEntryPerTreeId;

  @override
  Widget build(BuildContext context) {
    // ✅ FIX — always delete stale instance, create fresh one
    final tag = _perTreeId != null && _perTreeId!.isNotEmpty
        ? _perTreeId! // unique per tree
        : 'sqm_$_plotId'; // unique per plot for square-metre frames

    // Delete any leftover controller from a previous tree visit
    if (Get.isRegistered<IrrigationDetailsCCEController>(tag: tag)) {
      Get.delete<IrrigationDetailsCCEController>(tag: tag, force: true);
    }

    final controller = Get.put(
      IrrigationDetailsCCEController(perTreeId: _perTreeId),
      tag: tag,
      permanent: false,
    );

    final isSmall = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _appBar(isSmall),
      body: _IrrigationBody(
        surveyData: surveyData,
        controller: controller,
        controllerTag: tag,
        isSmall: isSmall,
      ),
    );
  }

  PreferredSizeWidget _appBar(bool isSmall) {
    return AppBar(
      title: Text(
        'Irrigation Details',
        style: TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: isSmall ? 18 : 20,
          letterSpacing: 0.3,
        ),
      ),
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Container(
          padding: EdgeInsets.all(isSmall ? 6 : 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(Icons.arrow_back_ios_new,
              color: Colors.white, size: isSmall ? 16 : 18),
        ),
        onPressed: () => Navigator.of(Get.context!).pop(),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// _IrrigationBody — StatefulWidget
//
// WHY StatefulWidget?
//   The frequency TextFormField is backed by a stable TextEditingController
//   that lives in the GetX controller.  Placing the field inside an Obx
//   lambda would unmount + remount it on every reactive change, detaching
//   the FocusNode and blocking keyboard input.
//
//   Fix: the TextFormField lives in _FrequencyFieldWrapper and is never
//   inside an Obx.  Obx only wraps Visibility toggles that show/hide it.
//
// dispose() explicitly deletes the GetX controller so memory is freed
// when the user pops the page — not when the app closes.
// ═══════════════════════════════════════════════════════════════════════════

class _IrrigationBody extends StatefulWidget {
  final Map<String, String> surveyData;
  final IrrigationDetailsCCEController controller;
  final String controllerTag;
  final bool isSmall;

  const _IrrigationBody({
    required this.surveyData,
    required this.controller,
    required this.controllerTag,
    required this.isSmall,
  });

  @override
  State<_IrrigationBody> createState() => _IrrigationBodyState();
}

class _IrrigationBodyState extends State<_IrrigationBody> {
  final _formKey = GlobalKey<FormState>();

  static const primaryGreen = Color(0xFF2D5F3F);
  static const surfaceColor = Color(0xFFF8FAF9);
  static const cardColor = Colors.white;
  static const textPrimary = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF666666);
  static const accentBlue = Color(0xFF3B82F6);
  static const accentOrange = Color(0xFFF59E0B);
  static const accentRed = Color(0xFFE53935);

  IrrigationDetailsCCEController get _c => widget.controller;
  bool get _sm => widget.isSmall;
  String get _plotId => widget.surveyData.cceAvailablePlotId;
  String? get _perTreeId => widget.surveyData.cceDataEntryPerTreeId;

  late Worker? _cultivationSyncWorker;

  @override
  void initState() {
    super.initState();

    CultivationDetailsController? cultivationCtrl;
    if (Get.isRegistered<CultivationDetailsController>(tag: 'cultivation_$_plotId')) {
      cultivationCtrl = Get.find<CultivationDetailsController>(tag: 'cultivation_$_plotId');
    } else if (Get.isRegistered<CultivationDetailsController>(tag: _plotId)) {
      cultivationCtrl = Get.find<CultivationDetailsController>(tag: _plotId);
    } else {
      final surveyTag = 'survey_$_plotId';
      final surveyCtrl = Get.isRegistered<SurveyDetailsController>(tag: surveyTag)
          ? Get.find<SurveyDetailsController>(tag: surveyTag)
          : Get.put(SurveyDetailsController(), tag: surveyTag);

      cultivationCtrl = Get.put(
        CultivationDetailsController(
          cceAvailablePlotId: _plotId,
          surveyCtrl: surveyCtrl,
        ),
        tag: 'cultivation_$_plotId',
        permanent: true,
      );
    }
    if (cultivationCtrl != null) {
      SectionNavigationController? navCtrl;
      final navTag = 'section_nav_${_perTreeId ?? _plotId}';
      
      if (Get.isRegistered<SectionNavigationController>(tag: navTag)) {
        navCtrl = Get.find<SectionNavigationController>(tag: navTag);
      } else if (Get.isRegistered<SectionNavigationController>()) {
        navCtrl = Get.find<SectionNavigationController>();
      }

      if (navCtrl != null) {
        final savedData = navCtrl.getSectionData('cultivator_field');
        if (savedData.isNotEmpty) {
          cultivationCtrl.setFormContext(
            formData: CCECommonData(),
            plot: CCEPlot(
              plotId: _plotId,
              surveyNumber: widget.surveyData['surveyNo'] ?? '',
              plotType: widget.surveyData['cceSourceType'] ?? 'field',
              area: double.tryParse(widget.surveyData['area'] ?? '') ?? 0.0,
            ),
            savedData: savedData,
            onSave: () {},
          );
        }
      }
      // ✅ Seed initial value immediately if cultivation has a known value.
      if (cultivationCtrl.isIrrigated.value != null) {
        _c.setIrrigated(cultivationCtrl.isIrrigated.value);
      }

      // One-way sync: cultivationCtrl → _c
      _cultivationSyncWorker = ever<bool?>(
        cultivationCtrl.isIrrigated,
        (val) {
          if (mounted && val != null) {
            _c.setIrrigated(val);
          }
        },
      );
    } else {
      _cultivationSyncWorker = null;
    }
  }

  @override
  void dispose() {
    if (Get.isRegistered<IrrigationDetailsCCEController>(
        tag: widget.controllerTag)) {
      Get.delete<IrrigationDetailsCCEController>(
          tag: widget.controllerTag, force: true);
    }
    _cultivationSyncWorker?.dispose();
    super.dispose();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Widget _label(String text, {bool required = false}) {
    return Row(children: [
      Text(text,
          style: TextStyle(
              fontSize: _sm ? 12 : 13,
              fontWeight: FontWeight.w600,
              color: textSecondary,
              letterSpacing: 0.2)),
      if (required) ...[
        const SizedBox(width: 4),
        Text('*',
            style: TextStyle(
                fontSize: _sm ? 14 : 15,
                fontWeight: FontWeight.bold,
                color: accentRed)),
      ],
    ]);
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        padding: EdgeInsets.all(_sm ? 16 : 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _headerBanner(),
            SizedBox(height: _sm ? 16 : 20),
            _contextInfoStrip(),
            SizedBox(height: _sm ? 16 : 20),
            // Loading indicator while fetching saved data
            Obx(() {
              if (_c.isFetching.value) {
                return Padding(
                  padding: EdgeInsets.only(bottom: _sm ? 16 : 20),
                  child: Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                            width: 18,
                            height: 18,
                            child: const CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation(
                                    primaryGreen))),
                        const SizedBox(width: 10),
                        Text('Loading saved details...',
                            style: TextStyle(
                                fontSize: _sm ? 12 : 13,
                                color: textSecondary)),
                      ],
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            }),
            _irrigationCard(),
            SizedBox(height: _sm ? 28 : 36),
            _saveButton(),
            SizedBox(height: _sm ? 24 : 32),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CONTEXT INFO STRIP
  // ════════════════════════════════════════════════════════════════════════════

  Widget _contextInfoStrip() {
    final hasPerTree = _perTreeId != null;
    final isSqm = widget.surveyData.isSquareMeters;

    // SQM — neutral teal strip, no "unsaved" warning
    if (isSqm) {
      return Container(
        padding: EdgeInsets.symmetric(
            horizontal: _sm ? 12 : 14, vertical: _sm ? 10 : 12),
        decoration: BoxDecoration(
          color: Colors.teal.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.teal.shade200, width: 1.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(Icons.grid_4x4_rounded,
                  size: _sm ? 15 : 16, color: Colors.teal.shade700),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Square metre frame — recording plot-level details',
                  style: TextStyle(
                    fontSize: _sm ? 11 : 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.teal.shade800,
                  ),
                ),
              ),
            ]),
          ],
        ),
      );
    }

    // Tree/plant — linked/unsaved logic
    if (hasPerTree) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: _sm ? 12 : 14, vertical: _sm ? 10 : 12),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.orange.shade200,
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(
              Icons.warning_amber_rounded,
              size: _sm ? 15 : 16,
              color: Colors.orange.shade700,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Frame selection not yet saved — save frame first to enable saving here',
                style: TextStyle(
                  fontSize: _sm ? 11 : 12,
                  fontWeight: FontWeight.w700,
                  color: Colors.orange.shade800,
                ),
              ),
            ),
          ]),
          if (_plotId.isNotEmpty) ...[
            const SizedBox(height: 5),
            _idRow(
              icon: Icons.grid_view_rounded,
              label: 'Plot ID',
              value: _plotId,
              color: Colors.blueGrey.shade700,
            ),
          ],
        ],
      ),
    );
  }

  Widget _idRow({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: _sm ? 12 : 13, color: color.withValues(alpha: 0.8)),
        const SizedBox(width: 5),
        Text('$label: ',
            style: TextStyle(
                fontSize: _sm ? 10 : 11,
                fontWeight: FontWeight.w600,
                color: textSecondary)),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
                fontSize: _sm ? 10 : 11,
                color: color,
                fontFamily: 'monospace'),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION CARD SHELL
  // ════════════════════════════════════════════════════════════════════════════

  Widget _sectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border:
        Border.all(color: primaryGreen.withValues(alpha: 0.08), width: 1),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(_sm ? 14 : 16),
            decoration: BoxDecoration(
              color: primaryGreen.withValues(alpha: 0.04),
              borderRadius:
              const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(children: [
              Container(
                padding: EdgeInsets.all(_sm ? 8 : 10),
                decoration: BoxDecoration(
                  color: primaryGreen.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child:
                Icon(icon, size: _sm ? 18 : 20, color: primaryGreen),
              ),
              const SizedBox(width: 12),
              Text(title,
                  style: TextStyle(
                      fontSize: _sm ? 15 : 16,
                      fontWeight: FontWeight.bold,
                      color: textPrimary)),
            ]),
          ),
          Divider(height: 1, color: Colors.grey.shade200),
          Padding(
            padding: EdgeInsets.all(_sm ? 14 : 16),
            child: child,
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // IRRIGATION CARD
  // ════════════════════════════════════════════════════════════════════════════

  Widget _irrigationCard() {
    return _sectionCard(
      title: 'Irrigation Status',
      icon: Icons.water_drop,
      child: _IrrigationFieldsWrapper(controller: _c, isSmall: _sm),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DRAINAGE CARD  (restored from Doc 2)
  // ════════════════════════════════════════════════════════════════════════════

  Widget _drainageCard() {
    return _sectionCard(
      title: 'Drainage Information',
      icon: Icons.waves,
      child: Container(
        padding: EdgeInsets.symmetric(
            horizontal: _sm ? 12 : 14, vertical: _sm ? 10 : 12),
        decoration: BoxDecoration(
          color: surfaceColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200, width: 1.5),
        ),
        child: Row(children: [
          Container(
            padding: EdgeInsets.all(_sm ? 8 : 10),
            decoration: BoxDecoration(
              color: primaryGreen.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(Icons.water,
                color: primaryGreen, size: _sm ? 16 : 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Drainage Available',
                    style: TextStyle(
                        fontSize: _sm ? 13 : 14,
                        fontWeight: FontWeight.w600,
                        color: textPrimary)),
                Text('Is drainage system available?',
                    style: TextStyle(
                        fontSize: _sm ? 11 : 12,
                        color: textSecondary)),
              ],
            ),
          ),
          Obx(() => Switch(
            value: _c.isDrainageAvailable.value,
            onChanged: _c.setDrainageAvailable,
            activeThumbColor: primaryGreen,
          )),
        ]),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SAVE BUTTON
  // ════════════════════════════════════════════════════════════════════════════

  Widget _saveButton() {
    // SQM crops have no perTreeId — always allow saving
    // Tree/plant crops require a saved frame first
    final canSave = widget.surveyData.isSquareMeters || _perTreeId != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Warning only shown for tree/plant when frame not yet saved
        if (!canSave) ...[
          Container(
            padding: EdgeInsets.symmetric(
                horizontal: _sm ? 12 : 14, vertical: _sm ? 10 : 12),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border:
              Border.all(color: Colors.orange.shade300, width: 1.5),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.warning_amber_rounded,
                    size: _sm ? 16 : 18,
                    color: Colors.orange.shade700),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Frame selection must be saved before recording irrigation details.',
                    style: TextStyle(
                        fontSize: _sm ? 12 : 13,
                        color: Colors.orange.shade900,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],
        Obx(() {
          final isLoading = _c.isLoading.value;
          return Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: _sm ? 52 : 56,
                  child: OutlinedButton(
                    onPressed: isLoading ? null : () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.grey.shade700,
                      side: BorderSide(color: Colors.grey.shade300, width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: TextStyle(
                        fontSize: _sm ? 15 : 16,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: _sm ? 52 : 56,
                  child: ElevatedButton(
                    onPressed: (canSave && !isLoading) ? _handleSave : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor:
                      canSave ? primaryGreen : Colors.grey.shade300,
                      disabledBackgroundColor: canSave
                          ? primaryGreen.withValues(alpha: 0.6)
                          : Colors.grey.shade300,
                      foregroundColor:
                      canSave ? Colors.white : Colors.grey.shade500,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14)),
                      elevation: 0,
                    ),
                    child: isLoading
                        ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                            strokeWidth: 2.5, color: Colors.white))
                        : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [

                        Expanded(
                          child: Text(
                            canSave
                                ? 'Save Details'
                                : 'Save Frame First',
                            style: TextStyle(
                                fontSize: _sm ? 14 : 15, // slightly smaller to fit
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.3),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        }),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER BANNER
  // ════════════════════════════════════════════════════════════════════════════

  Widget _headerBanner() {
    final treeLabel = widget.surveyData.selectedItemLabel;

    return Container(
      padding: EdgeInsets.all(_sm ? 16 : 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [primaryGreen, Color(0xFF3D7F5F)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(children: [
        Container(
          padding: EdgeInsets.all(_sm ? 10 : 12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child:
          Icon(Icons.water, color: Colors.white, size: _sm ? 22 : 26),
        ),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Irrigation Management',
                style: TextStyle(
                    fontSize: _sm ? 14 : 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.9))),
            const SizedBox(height: 4),
            Text('CCE Field Details',
                style: TextStyle(
                    fontSize: _sm ? 18 : 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white)),
            if (treeLabel != null) ...[
              const SizedBox(height: 4),
              Container(
                padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  treeLabel,
                  style: TextStyle(
                      fontSize: _sm ? 11 : 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white),
                ),
              ),
            ],
          ],
        ),
      ]),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SAVE HANDLER
  //
  // Uses Navigator.of(context).pop() — NOT Get.back() — to avoid the
  // LateInitializationError caused by Get.back() closing zombie snackbars.
  // Success snackbar is shown AFTER pop + 350 ms so the parent Overlay
  // is fully mounted before Get.snackbar() is called.
  // ════════════════════════════════════════════════════════════════════════════

  Future<void> _handleSave() async {
    FocusScope.of(context).unfocus();

    if (!_c.validateForm()) {
      _showErrorDialog(_c.getValidationErrors());
      return;
    }

    final success = await _c.saveToApi(
      cceAvailablePlotId: _plotId,
      cceDataEntryPerTreeId: _perTreeId, // null is valid for SQM
    );

    if (success && mounted) {
      final result = _c.getSaveData();
      Navigator.of(context).pop(result);
      await Future.delayed(const Duration(milliseconds: 350));
      try {
        SnackbarHelper.showSuccess(
            'Saved', 'Irrigation details saved successfully.');
      } catch (e) {
        SnackbarHelper.showError('Error', ApiService.friendlyError(e));
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ERROR DIALOG
  // ════════════════════════════════════════════════════════════════════════════

  void _showErrorDialog(List<String> errors) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape:
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Icon(Icons.error_outline,
              color: accentRed, size: _sm ? 24 : 28),
          const SizedBox(width: 12),
          const Expanded(
              child: Text('Validation Error',
                  style: TextStyle(fontWeight: FontWeight.bold))),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Please fix the following:',
                style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ...errors.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.circle, size: 8, color: accentRed),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(e,
                          style: TextStyle(
                              fontSize: _sm ? 12 : 13,
                              color: textSecondary))),
                ],
              ),
            )),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('OK',
                style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// _IrrigationFieldsWrapper
//
// Isolates the TextFormField and related widgets from any Obx rebuilds so the
// keyboard and FocusNode are never detached mid-input. Uses a GetX Worker
// (ever) to react to isIrrigated changes instead of Obx.
// ════════════════════════════════════════════════════════════════════════════

class _IrrigationFieldsWrapper extends StatefulWidget {
  final IrrigationDetailsCCEController controller;
  final bool isSmall;

  const _IrrigationFieldsWrapper({
    required this.controller,
    required this.isSmall,
  });

  @override
  State<_IrrigationFieldsWrapper> createState() =>
      _IrrigationFieldsWrapperState();
}

class _IrrigationFieldsWrapperState extends State<_IrrigationFieldsWrapper> {
  static const primaryGreen = Color(0xFF2D5F3F);
  static const surfaceColor = Color(0xFFF8FAF9);
  static const textPrimary = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF666666);
  static const accentRed = Color(0xFFE53935);

  late bool _show;
  late final Worker _worker;

  bool get _sm => widget.isSmall;

  @override
  void initState() {
    super.initState();
    _show = widget.controller.isIrrigated.value == true;
    // ever() fires on every change to isIrrigated — no Obx involved at all
    _worker = ever(widget.controller.isIrrigated, (bool? val) {
      if (mounted) setState(() => _show = val == true);
    });
  }

  @override
  void dispose() {
    _worker.dispose(); // cancel the GetX worker; no memory leak
    super.dispose();
  }

  Widget _scheduleRow() {
    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: _sm ? 12 : 14, vertical: _sm ? 10 : 12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200, width: 1.5),
      ),
      child: Row(children: [
        Container(
          padding: EdgeInsets.all(_sm ? 8 : 10),
          decoration: BoxDecoration(
            color: primaryGreen.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(Icons.event_repeat,
              color: primaryGreen, size: _sm ? 16 : 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Is Irrigation Schedule Regular',
                  style: TextStyle(
                      fontSize: _sm ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color: textPrimary)),
              Text('Does irrigation follow a fixed schedule?',
                  style: TextStyle(
                      fontSize: _sm ? 11 : 12, color: textSecondary)),
            ],
          ),
        ),
        Obx(() => Switch(
          value: widget.controller.isScheduleRegular.value,
          onChanged: widget.controller.setScheduleRegular,
          activeThumbColor: primaryGreen,
        )),
      ]),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSize(
      duration: const Duration(milliseconds: 200),
      child: SizedBox(
        height: _show ? null : 0,
        child: Visibility(
          visible: _show,
          maintainState: true, // keeps TextEditingController alive
          maintainAnimation: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _scheduleRow(),
              SizedBox(height: _sm ? 14 : 16),
              Row(children: [
                Text(
                  'Irrigation Frequency (Number)',
                  style: TextStyle(
                    fontSize: _sm ? 12 : 13,
                    fontWeight: FontWeight.w600,
                    color: textSecondary,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(width: 4),
                Text('*',
                    style: TextStyle(
                        fontSize: _sm ? 14 : 15,
                        fontWeight: FontWeight.bold,
                        color: accentRed)),
              ]),
              const SizedBox(height: 8),
              TextFormField(
                controller: widget.controller.frequencyTextController,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: textPrimary),
                decoration: InputDecoration(
                  hintText: 'e.g. 7',
                  hintStyle: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: _sm ? 13 : 14),
                  prefixIcon: Container(
                    margin: const EdgeInsets.all(8),
                    padding: EdgeInsets.all(_sm ? 8 : 10),
                    decoration: BoxDecoration(
                      color: primaryGreen.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.schedule,
                        size: _sm ? 16 : 18, color: primaryGreen),
                  ),
                  suffix: Text('Number',
                      style: TextStyle(
                          fontSize: _sm ? 13 : 14,
                          fontWeight: FontWeight.w600,
                          color: textSecondary)),
                  filled: true,
                  fillColor: surfaceColor,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none),
                  enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                          color: Colors.grey.shade200, width: 1.5)),
                  focusedBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      borderSide:
                      BorderSide(color: primaryGreen, width: 2)),
                  errorBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      borderSide:
                      BorderSide(color: accentRed, width: 1.5)),
                  focusedErrorBorder: const OutlineInputBorder(
                      borderRadius: BorderRadius.all(Radius.circular(12)),
                      borderSide:
                      BorderSide(color: accentRed, width: 2)),
                  contentPadding: EdgeInsets.symmetric(
                      horizontal: _sm ? 12 : 14,
                      vertical: _sm ? 14 : 16),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'How often is irrigation applied (in days)?',
                style: TextStyle(
                    fontSize: _sm ? 11 : 12,
                    color: textSecondary,
                    fontStyle: FontStyle.italic),
              ),
              SizedBox(height: _sm ? 14 : 16),
            ],
          ),
        ),
      ),
    );
  }
}