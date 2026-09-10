import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../controller/cce/cce_data_entry/cultivation_details.dart';
import '../../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../../controller/cce_survey_fetch.dart';
import '../../../../../controller/irrigation_details_save.dart';
import '../../../../../controller/plot_details.dart';
import '../../../../../model/cce/cce_mock_models.dart';
import 'cce_survey_fetch_all.dart';
import 'irrigation_source_widget.dart';

class CultivatorDetailsPage extends StatelessWidget {
  final Form5Controller controller;
  final CCECommonData formData;
  final CCEPlot plot;
  final GlobalKey<FormState> formKey;
  final bool isSaved;
  final VoidCallback onSave;
  final Map<String, dynamic> savedData;
  final Function(Map<String, dynamic>)? onSectionSaved;
  final Map<String, String> surveyData;

  // ─── Color scheme ──────────────────────────────────────────────────────────
  static const primaryGreen   = Color(0xFF1B5E20);
  static const secondaryGreen = Color(0xFF1B5E20);
  static const surfaceColor   = Color(0xFFF8FAF9);
  static const cardColor      = Colors.white;
  static const textPrimary    = Color(0xFF1A1A1A);
  static const textSecondary  = Color(0xFF666666);
  static const accentBlue     = Color(0xFF3B82F6);
  static const accentOrange   = Color(0xFFF59E0B);
  static const accentRed      = Color(0xFFE53935);

  const CultivatorDetailsPage({
    super.key,
    required this.formData,
    required this.plot,
    required this.formKey,
    required this.isSaved,
    required this.onSave,
    required this.savedData,
    this.onSectionSaved,
    required this.surveyData,
    required this.controller,
  });

  String get _cultivationTag => 'cultivation_${plot.plotId}';
  String get _surveyTag      => 'survey_${plot.plotId}';

  // ─── SurveyDetailsController — always registered first ────────────────────
  SurveyDetailsController get _surveyController {
    if (!Get.isRegistered<SurveyDetailsController>(tag: _surveyTag)) {
      return Get.put(SurveyDetailsController(), tag: _surveyTag);
    }
    return Get.find<SurveyDetailsController>(tag: _surveyTag);
  }

  CultivationDetailsController get _cultivationController {
    if (!Get.isRegistered<CultivationDetailsController>(tag: _cultivationTag)) {
      return Get.put(
        CultivationDetailsController(
          cceAvailablePlotId: surveyData['cceAvailablePlotId'] ?? '',
          surveyCtrl: _surveyController,
        ),
        tag: _cultivationTag,
        permanent: true,
      );
    }
    return Get.find<CultivationDetailsController>(tag: _cultivationTag);
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<DirectionController>()) {
      Get.put(DirectionController());
    }
    if (!Get.isRegistered<IrrigationDetailsSave>()) {
      Get.put(IrrigationDetailsSave());
    }
    final surveyCtrl      = _surveyController;
    final cultivationCtrl = _cultivationController;
    cultivationCtrl.setFormContext(
      formData:       formData,
      plot:           plot,
      savedData:      savedData,
      onSave:         onSave,
      onSectionSaved: onSectionSaved,
    );
    final isSmallScreen = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _buildAppBar(isSmallScreen),
      body: Stack(
        children: [
          // ── Main scrollable content ──────────────────────────────────────
          Container(
            color: surfaceColor,
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left:   isSmallScreen ? 16 : 20,
                right:  isSmallScreen ? 16 : 20,
                top:    isSmallScreen ? 16 : 20,
                bottom: (isSmallScreen ? 16 : 20) +
                    MediaQuery.of(context).padding.bottom,
              ),
              physics: const BouncingScrollPhysics(),
              child: Form(
                key: formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPlotInfoBanner(isSmallScreen),
                    SizedBox(height: isSmallScreen ? 20 : 24),

                    // Survey Selection (READ-ONLY)
                    _buildSectionCard(
                      title: 'Survey Selection',
                      icon: Icons.assignment_outlined,
                      isSmallScreen: isSmallScreen,
                      isRequired: true,
                      child: SurveySelectionWidget(
                        isSmallScreen: isSmallScreen,
                        controller: surveyCtrl,
                        primaryGreen: primaryGreen,
                        surfaceColor: surfaceColor,
                        textPrimary: textPrimary,
                        textSecondary: textSecondary,
                        // Pass readOnly: true if SurveySelectionWidget supports it
                        // readOnly: true,
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 20 : 24),

                    // Cultivation Details
                    _buildSectionCard(
                      title: 'Cultivation Details',
                      icon: Icons.agriculture,
                      isSmallScreen: isSmallScreen,
                      child: Column(
                        children: [
                          _buildReadOnlyDateField(
                            cultivationCtrl,
                            isSmallScreen,
                            label: 'Expected Harvest Date',
                            selectedDate: cultivationCtrl.expectedHarvestDate,
                          ),
                          SizedBox(height: isSmallScreen ? 14 : 16),
                          _buildReadOnlyInputField(
                            controller: cultivationCtrl.surveyNumberController,
                            label: 'Survey Number',
                            hintText: 'No survey number',
                            prefixIcon: Icons.format_list_numbered_outlined,
                            isSmallScreen: isSmallScreen,
                          ),
                          SizedBox(height: isSmallScreen ? 14 : 16),
                          _buildReadOnlyInputField(
                            controller: cultivationCtrl.areaController,
                            label: 'Cultivated Area (cents)',
                            hintText: 'No area specified',
                            prefixIcon: Icons.crop_landscape,
                            isSmallScreen: isSmallScreen,
                          ),
                          SizedBox(height: isSmallScreen ? 14 : 16),
                          _buildIrrigationSection(cultivationCtrl, isSmallScreen),
                        ],
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),

                    // Farmer Details
                    _buildSectionCard(
                      title: 'Farmer Details',
                      icon: Icons.person_outline,
                      isSmallScreen: isSmallScreen,
                      child: Column(
                        children: [
                          _buildReadOnlyInputField(
                            controller: cultivationCtrl.farmerNameController,
                            label: 'Farmer Name',
                            hintText: 'No name provided',
                            prefixIcon: Icons.badge_outlined,
                            isSmallScreen: isSmallScreen,
                          ),
                          SizedBox(height: isSmallScreen ? 14 : 16),
                          _buildReadOnlyInputField(
                            controller: cultivationCtrl.addressController,
                            label: 'Address',
                            hintText: 'No address provided',
                            prefixIcon: Icons.home_outlined,
                            maxLines: 2,
                            isSmallScreen: isSmallScreen,
                          ),
                          SizedBox(height: isSmallScreen ? 14 : 16),
                          _buildReadOnlyInputField(
                            controller: cultivationCtrl.mobileController,
                            label: 'Mobile Number',
                            hintText: 'No mobile number',
                            prefixIcon: Icons.phone_outlined,
                            isSmallScreen: isSmallScreen,
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),

                    // Additional Information
                    _buildSectionCard(
                      title: 'Additional Information',
                      icon: Icons.notes_outlined,
                      isSmallScreen: isSmallScreen,
                      isOptional: true,
                      child: _buildReadOnlyInputField(
                        controller: cultivationCtrl.remarksController,
                        label: 'Remarks',
                        hintText: 'No remarks',
                        prefixIcon: Icons.edit_note_outlined,
                        maxLines: 3,
                        isSmallScreen: isSmallScreen,
                      ),
                    ),
                    SizedBox(height: isSmallScreen ? 16 : 20),
// ── Save button ──────────────────────────────────────────────────────
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: primaryGreen.withValues(alpha: 0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () => _handleSaveWithValidation(
                          context, cultivationCtrl, surveyCtrl, isSmallScreen,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryGreen,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                          padding: EdgeInsets.symmetric(
                            horizontal: 28,
                            vertical: isSmallScreen ? 16 : 18,
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.save, size: isSmallScreen ? 20 : 22),
                            const SizedBox(width: 12),
                            Text(
                              'Save Details',
                              style: TextStyle(
                                fontSize: isSmallScreen ? 15 : 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(
                      height: (isSmallScreen ? 20 : 32) +
                          MediaQuery.of(context).padding.bottom,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Loading overlay — farmer details ─────────────────────────────
          Obx(() {
            if (cultivationCtrl.isLoadingFarmerDetails.value) {
              return _buildLoadingOverlay('Loading Farmer Details...', isSmallScreen);
            }
            return const SizedBox.shrink();
          }),

          // ── Loading overlay — saved data ──────────────────────────────────
          Obx(() {
            if (cultivationCtrl.isFetchingDetails.value) {
              return _buildLoadingOverlay('Loading Saved Data...', isSmallScreen);
            }
            return const SizedBox.shrink();
          }),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APP BAR
  // ══════════════════════════════════════════════════════════════════════════

  PreferredSizeWidget _buildAppBar(bool isSmallScreen) {
    return AppBar(
      title: Text(
        'Cultivator Field Details',
        style: TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: isSmallScreen ? 18 : 20,
          letterSpacing: 0.3,
        ),
      ),
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Container(
          padding: EdgeInsets.all(isSmallScreen ? 6 : 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(Icons.arrow_back_ios_new, color: Colors.white,
              size: isSmallScreen ? 16 : 18),
        ),
        onPressed: () => Get.back(),
      ),
      actions: [
        if (isSaved)
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(Icons.check_circle, color: Colors.white,
                  size: isSmallScreen ? 20 : 22),
            ),
          ),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LOADING OVERLAY
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildLoadingOverlay(String message, bool isSmallScreen) {
    return Container(
      color: Colors.black.withValues(alpha: 0.3),
      child: Center(
        child: Container(
          padding: EdgeInsets.all(isSmallScreen ? 20 : 24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(primaryGreen),
              ),
              SizedBox(height: isSmallScreen ? 16 : 20),
              Text(
                message,
                style: TextStyle(
                  fontSize: isSmallScreen ? 14 : 16,
                  fontWeight: FontWeight.w600,
                  color: textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PLOT INFO BANNER
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildPlotInfoBanner(bool isSmallScreen) {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [primaryGreen, secondaryGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: primaryGreen.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(isSmallScreen ? 10 : 12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.location_on_outlined, color: Colors.white,
                    size: isSmallScreen ? 22 : 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Plot Information',
                      style: TextStyle(
                        fontSize: isSmallScreen ? 14 : 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha: 0.9),
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Obx(() => Text(
                      controller.selectedCrop.value ?? 'Unknown',
                      style: TextStyle(
                        fontSize: isSmallScreen ? 18 : 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                      overflow: TextOverflow.ellipsis,
                    )),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildInfoChip('Survey No.', plot.surveyNumber, isSmallScreen)),
              const SizedBox(width: 10),
              Expanded(child: _buildInfoChip('Plot Type', plot.plotType, isSmallScreen)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(String label, String value, bool isSmallScreen) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmallScreen ? 10 : 12,
        vertical:   isSmallScreen ? 10 : 12,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isSmallScreen ? 10 : 11,
              color: Colors.white.withValues(alpha: 0.9),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: isSmallScreen ? 13 : 14,
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION CARD
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required bool isSmallScreen,
    required Widget child,
    bool isOptional = false,
    bool isRequired = false,
  }) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) => Transform.translate(
        offset: Offset(0, 10 * (1 - value)),
        child: Opacity(opacity: value, child: child),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: primaryGreen.withValues(alpha: 0.08), width: 1),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 16, offset: const Offset(0, 4)),
            BoxShadow(color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 4,  offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card header
            Container(
              padding: EdgeInsets.all(isSmallScreen ? 14 : 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [primaryGreen.withValues(alpha: 0.05), surfaceColor],
                ),
                borderRadius: const BorderRadius.only(
                  topLeft:  Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(isSmallScreen ? 8 : 10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [
                        primaryGreen.withValues(alpha: 0.15),
                        primaryGreen.withValues(alpha: 0.08),
                      ]),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon,
                        size: isSmallScreen ? 18 : 20, color: primaryGreen),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontSize: isSmallScreen ? 15 : 16,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                            letterSpacing: -0.1,
                          ),
                        ),
                        if (isRequired) ...[
                          const SizedBox(width: 4),
                          Text('*', style: TextStyle(
                            fontSize: isSmallScreen ? 16 : 18,
                            fontWeight: FontWeight.bold,
                            color: accentRed,
                          )),
                        ],
                      ],
                    ),
                  ),
                  if (isOptional)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Optional',
                        style: TextStyle(
                          fontSize: isSmallScreen ? 10 : 11,
                          color: textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Divider
            Container(
              height: 1,
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  Colors.transparent,
                  Colors.grey.shade200,
                  Colors.transparent,
                ]),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(isSmallScreen ? 14 : 16),
              child: child,
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // READ-ONLY DATE FIELD
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildReadOnlyDateField(
      CultivationDetailsController cultivationCtrl,
      bool isSmallScreen, {
        required String label,
        required Rx<DateTime?> selectedDate,
      }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isSmallScreen ? 12 : 13,
            fontWeight: FontWeight.w600,
            color: textSecondary,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        Obx(() {
          final date           = selectedDate.value;
          final isFetching     = cultivationCtrl.isFetchingDetails.value;
          final isLoadingFarmer = cultivationCtrl.isLoadingFarmerDetails.value;

          return Container(
            padding: EdgeInsets.all(isSmallScreen ? 12 : 14),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              border: Border.all(color: Colors.grey.shade200, width: 1.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Container(
                  padding: EdgeInsets.all(isSmallScreen ? 8 : 10),
                  decoration: BoxDecoration(
                    color: date == null
                        ? Colors.grey.shade100
                        : primaryGreen.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.calendar_today_outlined,
                    size: isSmallScreen ? 16 : 18,
                    color: date == null ? Colors.grey.shade400 : primaryGreen,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: isFetching || isLoadingFarmer
                      ? Text(
                    'Loading...',
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: isSmallScreen ? 13 : 14,
                      fontStyle: FontStyle.italic,
                    ),
                  )
                      : Text(
                    date == null
                        ? '—'
                        : DateFormat('dd MMM yyyy').format(date),
                    style: TextStyle(
                      color: date == null ? Colors.grey.shade400 : textPrimary,
                      fontSize: isSmallScreen ? 13 : 14,
                      fontWeight: date == null ? FontWeight.normal : FontWeight.w600,
                    ),
                  ),
                ),
                // Lock icon to reinforce read-only state
                Icon(
                  Icons.lock_outline_rounded,
                  size: isSmallScreen ? 15 : 16,
                  color: Colors.grey.shade400,
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // IRRIGATION SECTION — fully read-only display
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildIrrigationSection(
      CultivationDetailsController cultivationCtrl,
      bool isSmallScreen,
      ) {
    return Obx(() {
      final isFetching      = cultivationCtrl.isFetchingDetails.value;
      final isLoadingFarmer = cultivationCtrl.isLoadingFarmerDetails.value;
      final isIrrigated     = cultivationCtrl.isIrrigated.value;

      // ── Loading ──────────────────────────────────────────────────────────
      if (isFetching || isLoadingFarmer) {
        return _buildIrrigationLoadingRow(isSmallScreen);
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Irrigation Type',
            style: TextStyle(
              fontSize: isSmallScreen ? 12 : 13,
              fontWeight: FontWeight.w600,
              color: textSecondary,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: 8),
          _buildIrrigationReadOnlyBadge(isIrrigated, isSmallScreen),
          if (isIrrigated == true) ...[
            SizedBox(height: isSmallScreen ? 14 : 16),
            IrrigationSourcesWidget(
              controller: cultivationCtrl,
              isSmallScreen: isSmallScreen,
              accentOrange: accentOrange,
              // Pass readOnly: true if IrrigationSourcesWidget supports it
              // readOnly: true,
            ),
          ],
        ],
      );
    });
  }

  Widget _buildIrrigationLoadingRow(bool isSmallScreen) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Irrigation Type',
          style: TextStyle(
            fontSize: isSmallScreen ? 12 : 13,
            fontWeight: FontWeight.w600,
            color: textSecondary,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          height: isSmallScreen ? 48 : 52,
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200, width: 1.5),
          ),
          child: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: isSmallScreen ? 16 : 18,
                  height: isSmallScreen ? 16 : 18,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      primaryGreen.withValues(alpha: 0.5),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  'Loading irrigation type...',
                  style: TextStyle(
                    fontSize: isSmallScreen ? 12 : 13,
                    color: textSecondary,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildIrrigationReadOnlyBadge(bool? isIrrigated, bool isSmallScreen) {
    // Handle null (unknown) state gracefully
    if (isIrrigated == null) {
      return Container(
        height: isSmallScreen ? 48 : 52,
        padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 14 : 16),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200, width: 1.5),
        ),
        child: Row(
          children: [
            Icon(Icons.water_drop_outlined,
                size: isSmallScreen ? 16 : 18, color: Colors.grey.shade400),
            const SizedBox(width: 12),
            Text(
              '—',
              style: TextStyle(
                fontSize: isSmallScreen ? 13 : 14,
                color: Colors.grey.shade400,
              ),
            ),
          ],
        ),
      );
    }

    final color = isIrrigated ? accentBlue : accentOrange;
    final icon  = isIrrigated ? Icons.water_drop : Icons.water_drop_outlined;
    final label = isIrrigated ? 'Irrigated' : 'Non-Irrigated';

    return Container(
      height: isSmallScreen ? 48 : 52,
      padding: EdgeInsets.symmetric(horizontal: isSmallScreen ? 14 : 16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.35), width: 1.5),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(isSmallScreen ? 6 : 8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: isSmallScreen ? 16 : 18, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                fontSize: isSmallScreen ? 13 : 14,
                fontWeight: FontWeight.w700,
                color: color,
                letterSpacing: 0.1,
              ),
            ),
          ),
          Icon(
            Icons.lock_outline_rounded,
            size: isSmallScreen ? 15 : 16,
            color: color.withValues(alpha: 0.6),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // READ-ONLY INPUT FIELD
  // ══════════════════════════════════════════════════════════════════════════

  Widget _buildReadOnlyInputField({
    required TextEditingController controller,
    required String label,
    required String hintText,
    required IconData prefixIcon,
    int maxLines = 1,
    required bool isSmallScreen,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isSmallScreen ? 12 : 13,
            fontWeight: FontWeight.w600,
            color: textSecondary,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          readOnly: true,           // ← prevents keyboard / editing
          maxLines: maxLines,
          style: TextStyle(
            fontSize: isSmallScreen ? 13 : 14,
            fontWeight: FontWeight.w500,
            color: textPrimary,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: TextStyle(
              color: Colors.grey.shade400,
              fontSize: isSmallScreen ? 12 : 13,
            ),
            prefixIcon: Container(
              margin: const EdgeInsets.all(8),
              padding: EdgeInsets.all(isSmallScreen ? 8 : 10),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  primaryGreen.withValues(alpha: 0.15),
                  primaryGreen.withValues(alpha: 0.08),
                ]),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(prefixIcon,
                  size: isSmallScreen ? 16 : 18, color: primaryGreen),
            ),
            // Lock icon on the right to signal read-only
            suffixIcon: Padding(
              padding: EdgeInsets.only(right: isSmallScreen ? 10 : 12),
              child: Icon(
                Icons.lock_outline_rounded,
                size: isSmallScreen ? 15 : 16,
                color: Colors.grey.shade400,
              ),
            ),
            suffixIconConstraints: const BoxConstraints(),
            filled: true,
            fillColor: Colors.grey.shade50,        // slightly dimmer than editable
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              // Even if somehow focused, keep the same non-interactive look
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: isSmallScreen ? 12 : 14,
              vertical:   isSmallScreen ? 12 : 14,
            ),
          ),
        ),
      ],
    );
  }
  void _handleSaveWithValidation(
      BuildContext context,
      CultivationDetailsController cultivationCtrl,
      SurveyDetailsController surveyCtrl,
      bool isSmallScreen,
      ) async {
    final errors = <String>[];

    if (surveyCtrl.selectedSurveys.isEmpty) {
      errors.add('Please select at least one survey');
    }
    if (!formKey.currentState!.validate()) {
      errors.add('Please correct the errors in the form');
    }
    if (errors.isNotEmpty) {
      _showValidationErrorDialog(context, errors, isSmallScreen);
      return;
    }

    final cceAvailablePlotId = surveyData['cceAvailablePlotId'] ?? '';
    if (cceAvailablePlotId.isEmpty) {
      SnackbarHelper.showError('Error', 'Plot ID not found');
      return;
    }

    final surveyList = surveyCtrl.selectedSurveys
        .map((s) => {"surveyId": s.surveyId})
        .toList();

    final List<Map<String, dynamic>> irrigationList = [];
    if (cultivationCtrl.isIrrigated.value == true) {
      final irrigationCtrl = Get.find<IrrigationDetailsSave>();
      for (final sourceName in cultivationCtrl.irrigationSource) {
        final matched = irrigationCtrl.iriSources
            .firstWhereOrNull((s) => s.irrigationType == sourceName);
        if (matched != null) {
          irrigationList.add({"sourceId": matched.sourceId});
        }
      }
    }

    final success = await cultivationCtrl.saveCultivatorDetails(
      cceAvailablePlotId: cceAvailablePlotId,
      surveyList: surveyList,
      irrigationList: irrigationList,
    );

    if (success) {
      SnackbarHelper.showSuccess('Success', 'Details saved successfully');
      Get.back();
    }
  }

  void _showValidationErrorDialog(
      BuildContext context,
      List<String> errors,
      bool isSmallScreen,
      ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Icon(Icons.error_outline, color: accentRed,
              size: isSmallScreen ? 24 : 28),
          const SizedBox(width: 12),
          Expanded(child: Text('Validation Error',
              style: TextStyle(
                  fontSize: isSmallScreen ? 16 : 18,
                  fontWeight: FontWeight.bold))),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Please fix the following errors:',
                style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w600,
                    color: textPrimary)),
            const SizedBox(height: 12),
            ...errors.map((error) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.circle, size: 8, color: accentRed),
                    const SizedBox(width: 8),
                    Expanded(child: Text(error,
                        style: TextStyle(
                            fontSize: isSmallScreen ? 12 : 13,
                            color: textSecondary))),
                  ]),
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
            child: Text('OK',
                style: TextStyle(
                    fontSize: isSmallScreen ? 13 : 14,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}