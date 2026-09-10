import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../controller/cce/cce_data_entry/cce_seed_source.dart';
import '../frame_selection/tree_plant_measure/section_cards.dart';

class SeedDetailsCCEPage extends StatefulWidget {
  final Map<String, String> surveyData;

  const SeedDetailsCCEPage({super.key, required this.surveyData});

  @override
  State<SeedDetailsCCEPage> createState() => _SeedDetailsCCEPageState();
}

class _SeedDetailsCCEPageState extends State<SeedDetailsCCEPage> {
  late final SeedDetailsCCEController controller;
  static const primaryGreen   = Color(0xFF2D5F3F);
  static const secondaryGreen = Color(0xFF3D7F5F);
  static const surfaceColor   = Color(0xFFF8FAF9);
  static const textPrimary    = Color(0xFF1A1A1A);
  static const textSecondary  = Color(0xFF666666);
  static const accentRed      = Color(0xFFE53935);
  String  get _plotId    => widget.surveyData.cceAvailablePlotId;
  String? get _perTreeId => widget.surveyData.cceDataEntryPerTreeId;
  String? get _treeLabel => widget.surveyData.selectedItemLabel;   // ← tree label

// ── Unique tag: perTreeId when tree/plant, 'sqm_<plotId>' for square-metre ──
  String get _controllerTag =>
      (_perTreeId != null && _perTreeId!.isNotEmpty)
          ? _perTreeId!
          : 'sqm_$_plotId';
  @override
  void initState() {
    super.initState();

    // ✅ Delete stale instance from any previous visit to this tree
    if (Get.isRegistered<SeedDetailsCCEController>(tag: _controllerTag)) {
      Get.delete<SeedDetailsCCEController>(tag: _controllerTag, force: true);
    }

    // ✅ Create fresh controller WITH the unique tag
    final isSquareMeters = widget.surveyData['isSquareMeters'] == 'true';
    final isTreePlant = (_perTreeId != null && _perTreeId!.isNotEmpty) && !isSquareMeters;
    controller = Get.put(
      SeedDetailsCCEController(
        cropId: widget.surveyData['cropId'] ?? '1',
        isTreePlant: isTreePlant,
      ),
      tag: _controllerTag,   // ← THE fix — unique per tree
      permanent: false,
    );

    // Fetch existing data if tree ID is present
    final treeId = widget.surveyData['cceDataEntryPerTreeId'] ?? '';
    if (treeId.isNotEmpty) {
      _loadExistingData(treeId);
    }
  }
  @override
  void dispose() {
    if (Get.isRegistered<SeedDetailsCCEController>(tag: _controllerTag)) {
      Get.delete<SeedDetailsCCEController>(tag: _controllerTag, force: true);
    }
    super.dispose();
  }
  /// Waits until all dropdown lists finish loading, then fetches seed details.
  Future<void> _loadExistingData(String treeId) async {

    await Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 100));
      final waitForVarieties = controller.cropId == '1'
          ? controller.isLoadingCropVarieties.value
          : false;
      return waitForVarieties                       ||
          controller.isLoadingSeedSources.value     ||
          controller.isLoadingSeedTypes.value       ||
          controller.isLoadingSowingMethods.value;
    });
    await controller.fetchSeedDetails(cceDataEntryPerTreeId: treeId);
  }

  @override
  Widget build(BuildContext context) {
    final isSmallScreen = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _buildAppBar(isSmallScreen),
      body: SingleChildScrollView(
        padding: EdgeInsets.only(
          left:   isSmallScreen ? 16 : 20,
          right:  isSmallScreen ? 16 : 20,
          top:    isSmallScreen ? 16 : 20,
          bottom: MediaQuery.of(context).padding.bottom + (isSmallScreen ? 24 : 32),
        ),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeaderBanner(isSmallScreen),
            SizedBox(height: isSmallScreen ? 20 : 24),

            if (controller.cropId == '1') ...[
              _buildSectionCard(
                title: 'Seed Variety Name',
                icon: Icons.eco,
                isSmallScreen: isSmallScreen,
                child: _SeedVarietyDropdown(controller: controller, isSmallScreen: isSmallScreen),
              ),
              SizedBox(height: isSmallScreen ? 16 : 20),
            ],

            if (!controller.isTreePlant) ...[
              _buildSectionCard(
                title: 'Seed Type',
                icon: Icons.category,
                isSmallScreen: isSmallScreen,
                child: _SeedTypeDropdown(controller: controller, isSmallScreen: isSmallScreen),
              ),
              SizedBox(height: isSmallScreen ? 16 : 20),
            ],

            _buildSectionCard(
              title: 'Seed Source',
              icon: Icons.agriculture,
              isSmallScreen: isSmallScreen,
              isMandatory: !controller.isTreePlant,
              child: _SeedSourceDropdown(controller: controller, isSmallScreen: isSmallScreen),
            ),
            SizedBox(height: isSmallScreen ? 16 : 20),

            _buildSectionCard(
              title: 'Sowing Method',
              icon: Icons.grass,
              isSmallScreen: isSmallScreen,
              child: _SowingMethodDropdown(controller: controller, isSmallScreen: isSmallScreen),
            ),
            SizedBox(height: isSmallScreen ? 16 : 20),

            if (!controller.isTreePlant) ...[
              _buildSectionCard(
                title: 'Seed Quantity',
                icon: Icons.scale,
                isSmallScreen: isSmallScreen,
                child: _buildSeedQuantityInput(isSmallScreen),
              ),
              SizedBox(height: isSmallScreen ? 16 : 20),
            ],

            _buildSectionCard(
              title: 'Planted Date',
              icon: Icons.calendar_today,
              isSmallScreen: isSmallScreen,
              isMandatory: !controller.isTreePlant,
              child: _PlantedDatePicker(controller: controller, isSmallScreen: isSmallScreen),
            ),
            SizedBox(height: isSmallScreen ? 16 : 20),

            _buildSectionCard(
              title: 'Age of Plant',
              icon: Icons.timeline,
              isSmallScreen: isSmallScreen,
              isMandatory: !controller.isTreePlant,
              child: _buildAgeOfPlantInput(isSmallScreen),
            ),
// AFTER
            SizedBox(height: isSmallScreen ? 16 : 20),
            _buildSaveButton(isSmallScreen),
          ],
        ),
      ),

    );
  }

  // ─── AppBar ───────────────────────────────────────────────────────────────

  PreferredSizeWidget _buildAppBar(bool isSmallScreen) {
    return AppBar(
      title: Text('Seed Details',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: isSmallScreen ? 18 : 20)),
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios_new, color: Colors.white, size: isSmallScreen ? 16 : 18),
        onPressed: () => Get.back(),
      ),
    );
  }

  // ─── Header Banner — shows a fetch loader strip when loading existing data ──
  Widget _buildHeaderBanner(bool isSmallScreen) {
    return Column(children: [
      Container(
        padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [primaryGreen, secondaryGreen]),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: primaryGreen.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4)),
          ],
        ),
        child: Row(children: [
          Container(
            padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
            decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12)),
            child: Icon(Icons.eco, color: Colors.white,
                size: isSmallScreen ? 22 : 26),
          ),
          const SizedBox(width: 14),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Seed Management',
                style: TextStyle(
                    fontSize: isSmallScreen ? 14 : 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withValues(alpha: 0.9))),
            const SizedBox(height: 4),
            Text('CCE Field Details',
                style: TextStyle(
                    fontSize: isSmallScreen ? 18 : 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white)),

            // ✅ Tree label pill — only shown when a label exists
            if (_treeLabel != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.4), width: 1),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.park_outlined,
                      size: isSmallScreen ? 11 : 12,
                      color: Colors.white),
                  const SizedBox(width: 5),
                  Text(
                    _treeLabel!,
                    style: TextStyle(
                        fontSize: isSmallScreen ? 11 : 12,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.2),
                  ),
                ]),
              ),
            ],
          ]),
        ]),
      ),
      // ✅ Shows only while fetching existing record — disappears after done
      Obx(() {
        if (!controller.isLoadingSeedDetails.value) return const SizedBox.shrink();
        return Container(
          margin: const EdgeInsets.only(top: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: primaryGreen.withValues(alpha:0.15)),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withValues(alpha:0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2)),
            ],
          ),
          child: Row(children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: const AlwaysStoppedAnimation<Color>(primaryGreen)),
            ),
            const SizedBox(width: 10),
            Text('Loading existing seed details...',
                style: TextStyle(
                    fontSize: isSmallScreen ? 12 : 13,
                    color: textSecondary,
                    fontWeight: FontWeight.w500)),
          ]),
        );
      }),
    ]);
  }

  // ─── Section Card ─────────────────────────────────────────────────────────

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required bool isSmallScreen,
    required Widget child,
    bool isMandatory = true,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: primaryGreen.withValues(alpha:0.08)),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha:0.04),
              blurRadius: 16,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: EdgeInsets.all(isSmallScreen ? 14 : 16),
          decoration: BoxDecoration(
            color: primaryGreen.withValues(alpha:0.04),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          ),
          child: Row(children: [
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 8 : 10),
              decoration: BoxDecoration(
                  color: primaryGreen.withValues(alpha:0.12),
                  borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, size: isSmallScreen ? 18 : 20, color: primaryGreen),
            ),
            const SizedBox(width: 12),
            Text(title,
                style: TextStyle(
                    fontSize: isSmallScreen ? 15 : 16,
                    fontWeight: FontWeight.bold,
                    color: textPrimary)),
            if (isMandatory) ...[
              const SizedBox(width: 4),
              Text('*',
                  style: TextStyle(
                      fontSize: isSmallScreen ? 16 : 18,
                      color: accentRed,
                      fontWeight: FontWeight.bold)),
            ],
          ]),
        ),
        Divider(height: 1, indent: 16, endIndent: 16, color: Colors.grey.shade100),
        Padding(padding: EdgeInsets.all(isSmallScreen ? 14 : 16), child: child),
      ]),
    );
  }

  // ─── Text Inputs ──────────────────────────────────────────────────────────

  Widget _buildSeedQuantityInput(bool isSmallScreen) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      TextFormField(
        controller: controller.seedQuantityController,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$'))],
        style: TextStyle(
            fontSize: isSmallScreen ? 13 : 14,
            fontWeight: FontWeight.w500,
            color: textPrimary),
        decoration: _inputDecoration(
            hint: 'Enter quantity in kilograms',
            icon: Icons.scale,
            suffix: 'kg',
            isSmallScreen: isSmallScreen),
      ),
      const SizedBox(height: 8),
      _hintText('Total amount of seeds used for sowing', isSmallScreen),
    ]);
  }
  Widget _buildAgeOfPlantInput(bool isSmallScreen) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (controller.isTreePlant) ...[
          Row(
            children: [
              Expanded(
                flex: 3,
                child: TextFormField(
                  controller: controller.ageInputController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$'))],
                  style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w500,
                    color: textPrimary,
                  ),
                  decoration: _inputDecoration(
                    hint: 'Enter age',
                    icon: Icons.access_time,
                    suffix: '',
                    isSmallScreen: isSmallScreen,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: Obx(() => DropdownButtonFormField<String>(
                      value: controller.ageUnit.value,
                      items: ['Days', 'Months', 'Years']
                          .map((u) => DropdownMenuItem(value: u, child: Text(u, style: TextStyle(fontSize: isSmallScreen ? 13 : 14))))
                          .toList(),
                      onChanged: (val) {
                        if (val != null) controller.ageUnit.value = val;
                      },
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: surfaceColor,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: isSmallScreen ? 12 : 14),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                        enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: Colors.grey.shade200, width: 1.5)),
                      ),
                    )),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
        TextFormField(
          controller: controller.ageOfPlantController,
          readOnly: true,
          style: TextStyle(
            fontSize: isSmallScreen ? 13 : 14,
            fontWeight: FontWeight.w500,
            color: textPrimary,
          ),
          decoration: _inputDecoration(
            hint: 'Auto calculated',
            icon: Icons.timeline,
            suffix: 'days',
            isSmallScreen: isSmallScreen,
          ),
        ),
        const SizedBox(height: 8),
        _hintText(
          controller.isTreePlant
              ? 'Automatically calculated in days'
              : 'Automatically calculated from planted date',
          isSmallScreen,
        ),
      ],
    );
  }
  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
    required String suffix,
    required bool isSmallScreen,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle:
      TextStyle(color: Colors.grey.shade400, fontSize: isSmallScreen ? 12 : 13),
      prefixIcon: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
            color: primaryGreen.withValues(alpha:0.12),
            borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, size: isSmallScreen ? 16 : 18, color: primaryGreen),
      ),
      suffix: Text(suffix,
          style: TextStyle(
              fontSize: isSmallScreen ? 13 : 14,
              fontWeight: FontWeight.w600,
              color: textSecondary)),
      filled: true,
      fillColor: surfaceColor,
      enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryGreen, width: 2)),
      errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accentRed, width: 1.5)),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: EdgeInsets.symmetric(
          horizontal: isSmallScreen ? 12 : 14,
          vertical: isSmallScreen ? 12 : 14),
    );
  }

  // ─── Save Button ──────────────────────────────────────────────────────────

  Widget _buildSaveButton(bool isSmallScreen) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: isSmallScreen ? 16 : 32),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
              ),
              child: Obx(() => OutlinedButton(
                onPressed: (controller.isSaving.value || controller.isLoadingSeedDetails.value) 
                    ? null 
                    : () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey.shade700,
                  side: BorderSide(color: Colors.grey.shade300, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: EdgeInsets.symmetric(vertical: isSmallScreen ? 16 : 18),
                ),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: isSmallScreen ? 15 : 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              )),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                      color: primaryGreen.withValues(alpha:0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 6)),
                ],
              ),
              child: Obx(() => ElevatedButton(
                // Disable while saving OR while loading existing data
                onPressed: (controller.isSaving.value || controller.isLoadingSeedDetails.value)
                    ? null
                    : _handleSave,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGreen,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: primaryGreen.withValues(alpha:0.7),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                  padding: EdgeInsets.symmetric(vertical: isSmallScreen ? 16 : 18),
                ),
                child: controller.isSaving.value
                    ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation(Colors.white)),
                )
                    : Row(mainAxisAlignment: MainAxisAlignment.center, children: [

                  Expanded(
                    child: Text('Save Details',
                        style: TextStyle(
                            fontSize: isSmallScreen ? 14 : 15,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.3),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center),
                  ),
                ]),
              )),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Save Handler ─────────────────────────────────────────────────────────

  Future<void> _handleSave() async {
    final errors = controller.getValidationErrors();
    if (errors.isNotEmpty) {
      _showValidationDialog(errors);
      return;
    }

    final plotId = widget.surveyData['cceAvailablePlotId'] ?? '';
    final treeId = widget.surveyData['cceDataEntryPerTreeId'] ?? '';

    if (plotId.isEmpty || treeId.isEmpty) {
      _showValidationDialog([
        'Survey data is missing required plot/tree IDs. Please go back and try again.'
      ]);
      return;
    }

    final success = await controller.saveSeedDetails(
      cceAvailablePlotId: plotId,
      cceDataEntryPerTreeId: treeId,
    );

    if (success) {
      SnackbarHelper.showSuccess('Success', 'Seed details saved successfully');
      // Get.back(result: true); // uncomment when ready to navigate back
    }
  }

  // ─── Validation Dialog ────────────────────────────────────────────────────

  void _showValidationDialog(List<String> errors) {
    final isSmallScreen = MediaQuery.of(context).size.width < 600;
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          const Icon(Icons.error_outline, color: accentRed),
          const SizedBox(width: 12),
          Expanded(
              child: Text('Required Fields Missing',
                  style: TextStyle(
                      fontSize: isSmallScreen ? 16 : 18,
                      fontWeight: FontWeight.bold))),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: errors
              .map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child:
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Icon(Icons.circle, size: 8, color: accentRed),
              const SizedBox(width: 8),
              Expanded(
                  child: Text(e,
                      style: TextStyle(
                          fontSize: isSmallScreen ? 12 : 13,
                          color: textSecondary))),
            ]),
          ))
              .toList(),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
                backgroundColor: primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12))),
            child:
            const Text('Fix Errors', style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _hintText(String text, bool isSmallScreen) => Text(text,
      style: TextStyle(
          fontSize: isSmallScreen ? 11 : 12,
          color: textSecondary,
          fontStyle: FontStyle.italic));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FILE-LEVEL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

InputDecoration _dropdownDecoration({required bool isSmallScreen}) => InputDecoration(
  filled: true,
  fillColor: const Color(0xFFF8FAF9),
  contentPadding: EdgeInsets.symmetric(
      horizontal: isSmallScreen ? 12 : 14,
      vertical: isSmallScreen ? 12 : 14),
  enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5)),
  focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF2D5F3F), width: 1.5)),
  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
);

Widget _dropdownHint(IconData icon, String text, bool isSmallScreen) => Row(children: [
  Container(
    padding: const EdgeInsets.all(7),
    decoration: BoxDecoration(
        color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
    child: Icon(icon, size: 16, color: Colors.grey.shade400),
  ),
  const SizedBox(width: 10),
  Text(text,
      style:
      TextStyle(color: Colors.grey.shade500, fontSize: isSmallScreen ? 13 : 14)),
]);

Widget _loadingBox(String label, bool isSmallScreen) => Container(
  padding: EdgeInsets.symmetric(
      horizontal: isSmallScreen ? 12 : 14,
      vertical: isSmallScreen ? 16 : 18),
  decoration: BoxDecoration(
    color: const Color(0xFFF8FAF9),
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey.shade200, width: 1.5),
  ),
  child: Row(children: [
    const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor:
          AlwaysStoppedAnimation<Color>(Color(0xFF2D5F3F))),
    ),
    const SizedBox(width: 12),
    Text(label,
        style: TextStyle(
            color: const Color(0xFF666666),
            fontSize: isSmallScreen ? 13 : 14)),
  ]),
);

Widget _retryRow(
    String message, VoidCallback onRetry, bool isSmallScreen) =>
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(message,
            style: TextStyle(
                fontSize: isSmallScreen ? 11 : 12,
                color: const Color(0xFFF59E0B),
                fontStyle: FontStyle.italic)),
        const SizedBox(height: 4),
        TextButton.icon(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh, size: 16, color: Color(0xFF2D5F3F)),
          label: const Text('Retry',
              style: TextStyle(
                  color: Color(0xFF2D5F3F), fontWeight: FontWeight.w600)),
          style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap),
        ),
      ],
    );

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN CLASSES — isolated so Obx rebuilds don't cascade across siblings
// ─────────────────────────────────────────────────────────────────────────────

class _SeedVarietyDropdown extends StatelessWidget {
  final SeedDetailsCCEController controller;
  final bool isSmallScreen;

  static const _orange       = Color(0xFFF59E0B);
  static const _textPrimary  = Color(0xFF1A1A1A);
  static const _textSecondary = Color(0xFF666666);

  const _SeedVarietyDropdown(
      {required this.controller, required this.isSmallScreen});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Obx(() {
        if (controller.isLoadingCropVarieties.value) {
          return _loadingBox('Loading crop varieties...', isSmallScreen);
        }
        final options      = controller.cropVarietyOptions;
        final currentValue = controller.seedVarietyNameDropdown.value;
        return DropdownButtonFormField<String>(
          initialValue: currentValue,
          isExpanded: true,
          decoration: _dropdownDecoration(isSmallScreen: isSmallScreen),
          hint: _dropdownHint(
              Icons.eco,
              options.length <= 1 ? 'No varieties available' : 'Select crop variety',
              isSmallScreen),
          icon: Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
          items: options
              .map((v) => DropdownMenuItem(
            value: v,
            child: Text(v,
                style: TextStyle(
                  fontSize: isSmallScreen ? 13 : 14,
                  fontWeight:
                  v == 'Other' ? FontWeight.w600 : FontWeight.w500,
                  color: v == 'Other' ? _orange : _textPrimary,
                )),
          ))
              .toList(),
          onChanged:
          options.length <= 1 ? null : controller.setCropVariety,
        );
      }),

      Obx(() {
        if (!controller.showOtherVarietyField.value) {
          return const SizedBox.shrink();
        }
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const SizedBox(height: 12),
          Container(
            padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
                color: _orange.withValues(alpha:0.12),
                borderRadius: BorderRadius.circular(6)),
            child: const Row(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.edit_note, size: 14, color: _orange),
              SizedBox(width: 4),
              Text('Enter custom variety name',
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: _orange)),
            ]),
          ),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller.otherVarietyNameController,
            textCapitalization: TextCapitalization.words,
            style: TextStyle(
                fontSize: isSmallScreen ? 13 : 14, color: _textPrimary),
            decoration: InputDecoration(
              hintText: 'e.g., Basmati 370, IR-64, MTU-1010',
              hintStyle: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: isSmallScreen ? 12 : 13),
              prefixIcon: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.edit, color: _orange, size: 18)),
              filled: true,
              fillColor: _orange.withValues(alpha:0.04),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:
                  BorderSide(color: _orange.withValues(alpha:0.4), width: 1.5)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: _orange, width: 2)),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12)),
              contentPadding: EdgeInsets.symmetric(
                  horizontal: isSmallScreen ? 12 : 14,
                  vertical: isSmallScreen ? 12 : 14),
            ),
          ),
          const SizedBox(height: 6),
          Text('This variety will be saved with no ID',
              style: TextStyle(
                  fontSize: isSmallScreen ? 11 : 12,
                  color: _orange.withValues(alpha:0.8),
                  fontStyle: FontStyle.italic)),
        ]);
      }),

      const SizedBox(height: 8),
      Obx(() {
        if (controller.hasError.value &&
            controller.cropVarietyOptions.length <= 1) {
          return _retryRow('Failed to load varieties.',
              controller.fetchCropVarieties, isSmallScreen);
        }
        return Text('Name or code of the seed variety used',
            style: TextStyle(
                fontSize: isSmallScreen ? 11 : 12,
                color: _textSecondary,
                fontStyle: FontStyle.italic));
      }),
    ]);
  }
}

class _SeedTypeDropdown extends StatelessWidget {
  final SeedDetailsCCEController controller;
  final bool isSmallScreen;

  const _SeedTypeDropdown(
      {required this.controller, required this.isSmallScreen});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Obx(() {
        if (controller.isLoadingSeedTypes.value) {
          return _loadingBox('Loading seed types...', isSmallScreen);
        }
        final options      = controller.seedTypeOptions;
        final currentValue = controller.seedType.value;
        return DropdownButtonFormField<String>(
          initialValue: currentValue,
          isExpanded: true,
          decoration: _dropdownDecoration(isSmallScreen: isSmallScreen),
          hint: _dropdownHint(
              Icons.category,
              options.isEmpty ? 'No types available' : 'Select seed type',
              isSmallScreen),
          icon: Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
          items: options
              .map((t) => DropdownMenuItem(
            value: t,
            child: Text(t,
                style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w500)),
          ))
              .toList(),
          onChanged: options.isEmpty ? null : controller.setSeedType,
        );
      }),
      const SizedBox(height: 8),
      Text('Classification of the seed used',
          style: TextStyle(
              fontSize: isSmallScreen ? 11 : 12,
              color: const Color(0xFF666666),
              fontStyle: FontStyle.italic)),
    ]);
  }
}

class _SeedSourceDropdown extends StatelessWidget {
  final SeedDetailsCCEController controller;
  final bool isSmallScreen;

  const _SeedSourceDropdown(
      {required this.controller, required this.isSmallScreen});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Obx(() {
        if (controller.isLoadingSeedSources.value) {
          return _loadingBox('Loading seed sources...', isSmallScreen);
        }
        final options      = controller.seedSourceOptions;
        final currentValue = controller.seedSource.value;
        return DropdownButtonFormField<String>(
          initialValue: currentValue,
          isExpanded: true,
          decoration: _dropdownDecoration(isSmallScreen: isSmallScreen),
          hint: _dropdownHint(
              Icons.agriculture,
              options.isEmpty ? 'No sources available' : 'Select seed source',
              isSmallScreen),
          icon: Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
          items: options
              .map((s) => DropdownMenuItem(
            value: s,
            child: Text(s,
                style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w500)),
          ))
              .toList(),
          onChanged: options.isEmpty ? null : controller.setSeedSource,
        );
      }),
      const SizedBox(height: 8),
      Obx(() {
        if (controller.hasError.value && controller.seedSourceOptions.isEmpty) {
          return _retryRow('Failed to load sources.',
              controller.fetchSeedSources, isSmallScreen);
        }
        return Text('Where did you obtain the seeds?',
            style: TextStyle(
                fontSize: isSmallScreen ? 11 : 12,
                color: const Color(0xFF666666),
                fontStyle: FontStyle.italic));
      }),
    ]);
  }
}

class _SowingMethodDropdown extends StatelessWidget {
  final SeedDetailsCCEController controller;
  final bool isSmallScreen;

  const _SowingMethodDropdown(
      {required this.controller, required this.isSmallScreen});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Obx(() {
        if (controller.isLoadingSowingMethods.value) {
          return _loadingBox('Loading sowing methods...', isSmallScreen);
        }
        final options      = controller.sowingMethodOptions;
        final currentValue = controller.sowingMethod.value;
        return DropdownButtonFormField<String>(
          initialValue: currentValue,
          isExpanded: true,
          decoration: _dropdownDecoration(isSmallScreen: isSmallScreen),
          hint: _dropdownHint(
              Icons.grass,
              options.isEmpty ? 'No methods available' : 'Select sowing method',
              isSmallScreen),
          icon: Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
          items: options
              .map((m) => DropdownMenuItem(
            value: m,
            child: Text(m,
                style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w500)),
          ))
              .toList(),
          onChanged: options.isEmpty ? null : controller.setSowingMethod,
        );
      }),
      const SizedBox(height: 8),
      Obx(() {
        if (controller.hasError.value && controller.sowingMethodOptions.isEmpty) {
          return _retryRow('Failed to load methods.',
              controller.fetchSowingMethods, isSmallScreen);
        }
        return Text('How were the seeds planted in the field?',
            style: TextStyle(
                fontSize: isSmallScreen ? 11 : 12,
                color: const Color(0xFF666666),
                fontStyle: FontStyle.italic));
      }),
    ]);
  }
}

class _PlantedDatePicker extends StatelessWidget {
  final SeedDetailsCCEController controller;
  final bool isSmallScreen;

  static const _green        = Color(0xFF2D5F3F);
  static const _surface      = Color(0xFFF8FAF9);
  static const _textPrimary  = Color(0xFF1A1A1A);
  static const _textSecondary = Color(0xFF666666);

  const _PlantedDatePicker(
      {required this.controller, required this.isSmallScreen});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      InkWell(
        onTap: () => _pick(context),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: EdgeInsets.symmetric(
              horizontal: isSmallScreen ? 12 : 14,
              vertical: isSmallScreen ? 14 : 16),
          decoration: BoxDecoration(
            color: _surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200, width: 1.5),
          ),
          child: Row(children: [
            Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                  color: _green.withValues(alpha:0.12),
                  borderRadius: BorderRadius.circular(8)),
              child: Icon(Icons.calendar_today,
                  size: isSmallScreen ? 16 : 18, color: _green),
            ),
            // Obx wraps ONLY the date Text — the rest never rebuilds
            Expanded(
              child: Obx(() {
                final date = controller.plantedDate.value;
                return Text(
                  date != null
                      ? DateFormat('dd MMM yyyy').format(date)
                      : 'Select date when seeds were planted',
                  style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight:
                    date != null ? FontWeight.w500 : FontWeight.w400,
                    color: date != null ? _textPrimary : Colors.grey.shade400,
                  ),
                );
              }),
            ),
            Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
          ]),
        ),
      ),
      const SizedBox(height: 8),
      Text('Date when the seeds were sown in the field',
          style: TextStyle(
              fontSize: isSmallScreen ? 11 : 12,
              color: _textSecondary,
              fontStyle: FontStyle.italic)),
    ]);
  }

  Future<void> _pick(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: controller.plantedDate.value ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
              primary: _green,
              onPrimary: Colors.white,
              onSurface: _textPrimary),
          textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: _green)),
        ),
        child: child!,
      ),
    );
    if (picked != null) controller.setPlantedDate(picked);
  }
}