// ==================== SECTION NAVIGATION PAGE ====================
// Elegant card-based navigation to different form sections
// Updated with ContinuePage color theme and Survey Selection Widget
import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:aidea/view/screens/cce/Form5/yield_details/yield_details_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../controller/cce/cce_data_entry/section_wise_navigation.dart';
import '../../../../controller/cce_survey_fetch.dart';
import '../../../../model/cce/cce_mock_models.dart';
import '../../../../controller/cce/cce_data_entry/cce_final_submit_controller.dart';
import 'irrigation_details/cce_irrigation_source.dart';
import 'seed_details/cce_seed_source_details.dart';
import 'cultivator_common_details/cultivator_details_field_selection.dart';
import 'disease_pesticide/disease_pesticide_details.dart';
import 'frame_selection/frame_selection_field.dart';
class SectionNavigationPage extends StatelessWidget {
  final Form5Controller form5controller;
  final Map<String, String> surveyData;

  // Color scheme matching ContinuePage
  static const primaryGreen = Color(0xFF2D5F3F);
  static const secondaryGreen = Color(0xFF3D7F5F);
  static const lightGreen = Color(0xFF4A9F6F);
  static const surfaceColor = Color(0xFFF8FAF9);
  static const cardColor = Colors.white;
  static const textPrimary = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF666666);

  // Accent colors
  static const blueAccent = Color(0xFF3B82F6);
  static const orangeAccent = Color(0xFFF59E0B);
  static const purpleAccent = Color(0xFF7B1FA2);
  static const tealAccent = Color(0xFF00897B);
  static const indigoAccent = Color(0xFF3949AB);
  static const redAccent = Color(0xFFE53935);
  static const amberAccent = Color(0xFFFF8F00); // ← for Yield Details card

  const SectionNavigationPage({
    super.key,
    required this.surveyData,
    required this.form5controller,
  });

  String get cropName => surveyData['cropName'] ?? 'Unknown Crop';
  String get clusterId => surveyData['clusterId'] ?? '';
  String get clusterNumber => surveyData['clusterNumber'] ?? '';
  String get surveyNumber => surveyData['surveyNo'] ?? '';
  String get cropId => surveyData['cropId'] ?? '';
  String get area => surveyData['area'] ?? '0.0';
  String get sourceType => surveyData['cceSourceType'] ?? 'field';

  @override
  Widget build(BuildContext context) {
    final controller =
        Get.isRegistered<SectionNavigationController>()
            ? Get.find<SectionNavigationController>()
            : Get.put(SectionNavigationController());

    final plotId = surveyData['cceAvailablePlotId'] ?? surveyData['plotId'] ?? '';
    if (plotId.isNotEmpty) {
      controller.resetIfNewPlot(plotId);
      controller.initializeCultivatorCompletion(plotId);
    }

    final _ =
        Get.isRegistered<SurveyDetailsController>()
            ? Get.find<SurveyDetailsController>()
            : Get.put(SurveyDetailsController());

    final isMobile = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _buildAppBar(context, controller, isMobile),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: EdgeInsets.symmetric(
            horizontal: isMobile ? 16.0 : 32.0,
            vertical: isMobile ? 16.0 : 24.0,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderCard(context, isMobile),
              SizedBox(height: isMobile ? 20 : 24),
              _buildSectionCards(context, controller, isMobile),
              SizedBox(height: isMobile ? 20 : 24),
              _buildFinalSubmitButton(context, controller, isMobile), // ← added
              SizedBox(height: isMobile ? 80 : 100),
            ],
          ),
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(
        context,
        controller,
        isMobile,
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // APP BAR
  // ════════════════════════════════════════════════════════════════════════════

  PreferredSizeWidget _buildAppBar(
    BuildContext context,
    SectionNavigationController controller,
    bool isMobile,
  ) {
    return AppBar(
      title: Text(
        'CCE Survey Form',
        style: TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: isMobile ? 18 : 20,
          letterSpacing: 0.3,
        ),
      ),
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: true,
      leading: IconButton(
        icon: Container(
          padding: EdgeInsets.all(isMobile ? 6 : 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha:0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            Icons.arrow_back_ios_new,
            color: Colors.white,
            size: isMobile ? 16 : 18,
          ),
        ),
        onPressed: () => Get.back(),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER CARD
  // ════════════════════════════════════════════════════════════════════════════

  Widget _buildHeaderCard(BuildContext context, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16 : 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors:  [Color(0xFF1B5E20), Color(0xFF1B5E20)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: primaryGreen.withValues(alpha:0.3),
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
                padding: EdgeInsets.all(isMobile ? 10 : 12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha:0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.eco_outlined,
                  color: Colors.white,
                  size: isMobile ? 22 : 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Survey Information',
                      style: TextStyle(
                        fontSize: isMobile ? 14 : 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withValues(alpha:0.9),
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Obx(
                      () => Text(
                        form5controller.selectedCrop.value ?? 'Unknown',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildInfoChip(
                  context,
                  Icons.format_list_numbered,
                  'Survey No.',
                  surveyNumber,
                  isMobile,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildInfoChip(
                  context,
                  Icons.crop_landscape,
                  'Area',
                  '$area cents',
                  isMobile,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(
    BuildContext context,
    IconData icon,
    String label,
    String value,
    bool isMobile,
  ) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 10 : 12,
        vertical: isMobile ? 10 : 12,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha:0.2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withValues(alpha:0.3), width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, size: isMobile ? 16 : 18, color: Colors.white),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: isMobile ? 10 : 11,
                    color: Colors.white.withValues(alpha:0.9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: isMobile ? 13 : 14,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION CARDS LIST
  // ════════════════════════════════════════════════════════════════════════════

  Widget _buildSectionCards(
    BuildContext context,
    SectionNavigationController controller,
    bool isMobile,
  ) {
    final sections = _getSections();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(bottom: isMobile ? 12 : 16),
          child: Text(
            'Form Sections',
            style: TextStyle(
              fontSize: isMobile ? 16 : 18,
              fontWeight: FontWeight.bold,
              color: textPrimary,
              letterSpacing: -0.2,
            ),
          ),
        ),
        ...sections.asMap().entries.map((entry) {
          final index = entry.key;
          final section = entry.value;
          return Padding(
            padding: EdgeInsets.only(bottom: isMobile ? 14 : 16),
            child: Obx(
              () => _buildSectionCard(
                context: context,
                controller: controller,
                section: section,
                isMobile: isMobile,
                index: index,
              ),
            ),
          );
        })
      ],
    );
  }

  Widget _buildSectionCard({
    required BuildContext context,
    required SectionNavigationController controller,
    required SectionCardData section,
    required bool isMobile,
    required int index,
  }) {
    final isCompleted = controller.isSectionCompleted(section.key);

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 300 + (index * 100)),
      curve: Curves.easeOutCubic,
      builder:
          (context, value, child) => Transform.translate(
            offset: Offset(0, 20 * (1 - value)),
            child: Opacity(opacity: value, child: child),
          ),
      child: Container(
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha:0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha:0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
          border:
              isCompleted
                  ? Border.all(color: section.color.withValues(alpha:0.3), width: 2)
                  : Border.all(color: primaryGreen.withValues(alpha:0.08), width: 1),
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => _navigateToSection(context, controller, section),
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: EdgeInsets.all(isMobile ? 16.0 : 20.0),
              child: Row(
                children: [
                  // Icon container
                  Container(
                    padding: EdgeInsets.all(isMobile ? 12 : 14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          section.color.withValues(alpha:0.15),
                          section.color.withValues(alpha:0.08),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      section.icon,
                      size: isMobile ? 22 : 24,
                      color: section.color,
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Text
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          section.title,
                          style: TextStyle(
                            fontSize: isMobile ? 15 : 16,
                            fontWeight: FontWeight.bold,
                            color: textPrimary,
                            letterSpacing: -0.1,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          section.description,
                          style: TextStyle(
                            fontSize: isMobile ? 12 : 13,
                            color: textSecondary,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Status indicator
                  if (isCompleted)
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: section.color,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: section.color.withValues(alpha:0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    )
                  else
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 18,
                      color: Colors.grey.shade400,
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FLOATING ACTION BUTTON
  // ════════════════════════════════════════════════════════════════════════════

  Widget _buildFloatingActionButton(
    BuildContext context,
    SectionNavigationController controller,
    bool isMobile,
  ) {
    return Obx(() {
      final canSubmit = controller.canSubmitForm();
      return AnimatedScale(
        scale: canSubmit ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutBack,
        child: Container(
          width: double.infinity,
          margin: EdgeInsets.symmetric(horizontal: isMobile ? 16 : 32),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: primaryGreen.withValues(alpha:0.4),
                blurRadius: 12,
                offset: const Offset(0, 6),
                spreadRadius: 1,
              ),
            ],
          ),
          child: ElevatedButton(
            onPressed:
                canSubmit ? () => _submitForm(context, controller) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 0,
              padding: EdgeInsets.symmetric(
                horizontal: 28,
                vertical: isMobile ? 16 : 18,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_outline, size: isMobile ? 20 : 22),
                const SizedBox(width: 12),
                Text(
                  'Submit Complete Form',
                  style: TextStyle(
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════════

  void _navigateToSection(
    BuildContext context,
    SectionNavigationController controller,
    SectionCardData section,
  ) {
    final formKey = GlobalKey<FormState>();
    final formData = CCECommonData();
    final savedData = controller.getSectionData(section.key);

    final plot = CCEPlot(
      plotId: surveyData['cceAvailablePlotId'] ?? surveyData['plotId'] ?? '',
      surveyNumber: surveyNumber,
      plotType: sourceType,
      area: double.tryParse(area) ?? 0.0,
    );

    switch (section.key) {
      case 'cultivator_field':
        Get.to(
          () => CultivatorDetailsPage(
            controller: form5controller,
            formData: formData,
            plot: plot,
            formKey: formKey,
            isSaved: controller.isSectionCompleted(section.key),
            onSave: () {},
            savedData: savedData,
            onSectionSaved:
                (data) => controller.updateSectionData(section.key, data),
            surveyData: surveyData,
          ),
          transition: Transition.rightToLeft,
          duration: const Duration(milliseconds: 300),
        );
        break;

      case 'frame_selection':
        if (!controller.isSectionCompleted('cultivator_field')) {
          SnackbarHelper.showError(
            'Action Required',
            'Please complete Cultivator Field Selection first.',
          );
          return;
        }
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FrameSelectionField(surveyData: surveyData,  controller: form5controller,
              plot: plot,),
          ),
        ).then((result) {
          if (result != null && result is Map<String, dynamic>) {
            controller.updateSectionData('frame_selection', result);
          }
        });
        break;
      case 'irrigation':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => IrrigationDetailsCCEPage(surveyData: surveyData),
          ),
        ).then((result) {
          if (result != null && result is Map<String, dynamic>) {
            controller.updateSectionData('irrigation', result);
          }
        });
        break;
      case 'seed':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => SeedDetailsCCEPage(surveyData: surveyData),
          ),
        ).then((result) {
          if (result != null && result is Map<String, dynamic>) {
            controller.updateSectionData('seed', result);
          }
        });
        break;
      case 'disease_pesticide':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => DiseasePesticideCCEPage(surveyData: surveyData),
          ),
        ).then((result) {
          if (result != null && result is Map<String, dynamic>) {
            controller.updateSectionData('disease_pesticide', result);
          }
        });
        break;

      // ── NEW: Yield Details ───────────────────────────────────────────────
      case 'yield_details':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => YieldDetailsPage(surveyData: surveyData),
          ),
        ).then((result) {
          if (result != null && result is Map<String, dynamic>) {
            controller.updateSectionData('yield_details', result);
          }
        });
        break;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // DIALOGS
  // ════════════════════════════════════════════════════════════════════════════

  void _showResetDialog(
    BuildContext context,
    SectionNavigationController controller,
  ) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: redAccent),
                const SizedBox(width: 12),
                const Text("Reset Form"),
              ],
            ),
            content: const Text(
              "Are you sure you want to reset all sections? This will clear all your progress.",
              style: TextStyle(fontSize: 14),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                onPressed: () {
                  controller.resetAllSections();
                  Navigator.pop(context);
                  SnackbarHelper.showInfo(
                    "Form Reset",
                    "All sections have been cleared",
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: redAccent,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text("Reset"),
              ),
            ],
          ),
    );
  }

  void _submitForm(
    BuildContext context,
    SectionNavigationController controller,
  ) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(Icons.check_circle, color: primaryGreen),
                const SizedBox(width: 12),
                const Text("Submit Form"),
              ],
            ),
            content: const Text(
              "All sections are complete. Would you like to submit the form?",
              style: TextStyle(fontSize: 14),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                onPressed: () async {
                  Navigator.pop(context);
                  final submitController = Get.put(CceFinalSubmitController());
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (context) => const Center(child: CircularProgressIndicator(color: primaryGreen)),
                  );

                  final result = await submitController.submitFinalCceForm(
                    plotId: surveyData['cceAvailablePlotId'] ?? surveyData['plotId'] ?? '',
                  );
                  
                  Navigator.pop(context); // Close loading indicator

                  if (result['success']) {
                    Get.back();
                    SnackbarHelper.showSuccess( "Success", result['message']);
                  } else {
                    SnackbarHelper.showError("Error", result['message']);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text("Submit"),
              ),
            ],
          ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTIONS LIST  ← Yield Details added at the end
  // ════════════════════════════════════════════════════════════════════════════

  List<SectionCardData> _getSections() {
    return [
      SectionCardData(
        key: 'cultivator_field',
        title: 'Cultivator Field Selection',
        description: 'Select and manage cultivator field details',
        icon: Icons.landscape,
        color: primaryGreen,
      ),
      SectionCardData(
        key: 'frame_selection',
        title: 'Frame Selection',
        description: 'Configure frame and plot specifications',
        icon: Icons.grid_on_outlined,
        color: blueAccent,
      ),

    ];
  }
  // ════════════════════════════════════════════════════════════════════════════
// FINAL SUBMIT BUTTON
// ════════════════════════════════════════════════════════════════════════════

  Widget _buildFinalSubmitButton(
      BuildContext context,
      SectionNavigationController controller,
      bool isMobile,
      ) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () => _submitForm(context, controller),
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 2,
          padding: EdgeInsets.symmetric(
            horizontal: 28,
            vertical: isMobile ? 16 : 18,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.task_alt_rounded, size: isMobile ? 20 : 22),
            const SizedBox(width: 12),
            Text(
              'Final Submit',
              style: TextStyle(
                fontSize: isMobile ? 15 : 16,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Model class for section card data
// ════════════════════════════════════════════════════════════════════════════

class SectionCardData {
  final String key;
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  SectionCardData({
    required this.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}
