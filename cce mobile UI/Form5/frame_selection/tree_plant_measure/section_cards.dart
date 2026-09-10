import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../../resources/utils/snackbar_helper.dart';

import '../../../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../../../controller/cce/cce_data_entry/section_wise_navigation.dart';
import '../../disease_pesticide/disease_pesticide_details.dart';
import '../../irrigation_details/cce_irrigation_source.dart';
import '../../seed_details/cce_seed_source_details.dart';
import '../../yield_details/yield_details_page.dart';
abstract class CceSurveyKeys {
  static const cceAvailablePlotId = 'cceAvailablePlotId';
  static const cceDataEntryPerTreeId = 'cceDataEntryPerTreeId';
  static const selectedItemLabel     = 'selectedItemLabel'; // ← add this
  // ── General survey fields (pre-existing keys, kept here for reference) ────
  static const surveyNo   = 'surveyNo';
  static const area       = 'area';
  static const cropName   = 'cropName';
  static const cropId     = 'cropId';
  static const seasonId   = 'seasonId';
  static const lbCode     = 'lbCode';
  static const mappingId  = 'mappingId';
  static const btrId      = 'btrId';
  static const clusterId  = 'clusterId';
  static const isSquareMeters = 'isSquareMeters';
}

extension CceSurveyDataX on Map<String, String> {
  String get cceAvailablePlotId =>
      this[CceSurveyKeys.cceAvailablePlotId] ?? '';
  String? get cceDataEntryPerTreeId {
    final v = this[CceSurveyKeys.cceDataEntryPerTreeId];
    return (v != null && v.isNotEmpty) ? v : null;
  }
  // ... existing accessors ...
  String? get selectedItemLabel {
    final v = this[CceSurveyKeys.selectedItemLabel];
    return (v != null && v.isNotEmpty) ? v : null;
  }
  bool get isSquareMeters =>
      this[CceSurveyKeys.isSquareMeters] == 'true';
  /// Convenience: true when a persisted per-tree record exists.
  bool get hasPerTreeRecord => cceDataEntryPerTreeId != null;

  // ── General accessors ─────────────────────────────────────────────────────
  String get surveyNo  => this[CceSurveyKeys.surveyNo]  ?? '';
  String get area      => this[CceSurveyKeys.area]      ?? '0.0';
  String get cropName  => this[CceSurveyKeys.cropName]  ?? 'Unknown Crop';
  String get cropId    => this[CceSurveyKeys.cropId]    ?? '';
  String get seasonId  => this[CceSurveyKeys.seasonId]  ?? '';
  String get lbCode    => this[CceSurveyKeys.lbCode]    ?? '';
  String get mappingId => this[CceSurveyKeys.mappingId] ?? '';
  String get btrId     => this[CceSurveyKeys.btrId]     ?? '';
  String get clusterId => this[CceSurveyKeys.clusterId] ?? '';
}
class IrrigationToYieldNavigationPage extends StatelessWidget {
  final Map<String, String> surveyData;
  final Form5Controller form5controller;
  final String? selectedItemLabel;
  final bool isSquareMeters; // ← add this field
  /// Plot-level CCE frame-selection ID. Always required.
  final String cceAvailablePlotId;
  /// Per-tree/plant item primary key. Null when the frame selection has not
  /// been saved yet (freshly generated, unsaved selection).
  final String? cceDataEntryPerTreeId;

  // ── Palette ────────────────────────────────────────────────────────────────
  static const primaryGreen   = Color(0xFF2D5F3F);
  static const secondaryGreen = Color(0xFF3D7F5F);
  static const surfaceColor   = Color(0xFFF8FAF9);
  static const cardColor      = Colors.white;
  static const textPrimary    = Color(0xFF1A1A1A);
  static const textSecondary  = Color(0xFF666666);

  static const _teal   = Color(0xFF00897B);
  static const _purple = Color(0xFF7B1FA2);
  static const _indigo = Color(0xFF3949AB);
  static const _amber  = Color(0xFFFF8F00);

  const IrrigationToYieldNavigationPage({
    super.key,
    required this.surveyData,
    required this.form5controller,
    required this.cceAvailablePlotId,
    this.cceDataEntryPerTreeId,
    this.selectedItemLabel,
    this.isSquareMeters = false,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────

  String get _surveyNumber => surveyData.surveyNo;
  String get _area         => surveyData.area;
  String get _cropName     => surveyData.cropName;

  bool get _hasPerTree =>
      cceDataEntryPerTreeId != null && cceDataEntryPerTreeId!.isNotEmpty;

  /// Enriched surveyData forwarded to every downstream section page.
  /// Always contains cceAvailablePlotId; contains cceDataEntryPerTreeId
  /// only when it is non-null and non-empty.
  Map<String, String> get _enrichedSurveyData => {
    ...surveyData,
    CceSurveyKeys.cceAvailablePlotId: cceAvailablePlotId,
    CceSurveyKeys.isSquareMeters: isSquareMeters.toString(), // ← add
    if (_hasPerTree)
      CceSurveyKeys.cceDataEntryPerTreeId: cceDataEntryPerTreeId!,
    if (selectedItemLabel != null)
      CceSurveyKeys.selectedItemLabel: selectedItemLabel!, // ← add this
  };
  @override
  Widget build(BuildContext context) {
    final _tag = 'section_nav_${cceDataEntryPerTreeId ?? cceAvailablePlotId}';

    final navController = Get.isRegistered<SectionNavigationController>(tag: _tag)
        ? Get.find<SectionNavigationController>(tag: _tag)
        : Get.put(SectionNavigationController(), tag: _tag);

    if (cceDataEntryPerTreeId != null && cceDataEntryPerTreeId!.isNotEmpty) {
      if (!navController.hasCheckedCompletion.value) {
        navController.initializeCompletionFromApi(cceDataEntryPerTreeId: cceDataEntryPerTreeId!);
      }
    }

    final isMobile = MediaQuery.of(context).size.width < 600;

    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _appBar(isMobile),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 16 : 32,
          vertical:   isMobile ? 16 : 24,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _headerCard(isMobile),
            SizedBox(height: isMobile ? 16 : 20),
            //_idInfoStrip(isMobile),
            SizedBox(height: isMobile ? 20 : 24),
            _sectionLabel(isMobile),
            SizedBox(height: isMobile ? 12 : 16),
            ..._sections().asMap().entries.map(
                  (e) => Padding(
                padding: EdgeInsets.only(bottom: isMobile ? 14 : 16),
                child: Obx(() => _card(
                  context:    context,
                  controller: navController,
                  section:    e.value,
                  index:      e.key,
                  isMobile:   isMobile,
                )),
              ),
            ),
            // Extra bottom space so FAB never covers the last card
            SizedBox(height: isMobile ? 96 : 112),
          ],
        ),
      ),
      floatingActionButton:
      _fab(context, navController, isMobile),
      floatingActionButtonLocation:
      FloatingActionButtonLocation.centerFloat,
    );
  }


  // ════════════════════════════════════════════════════════════════════════════
  // APP BAR
  // ════════════════════════════════════════════════════════════════════════════

  PreferredSizeWidget _appBar(bool isMobile) {
    return AppBar(
      title: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'CCE Survey Form',
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize:   isMobile ? 17 : 19,
              letterSpacing: 0.3,
            ),
          ),
          if (selectedItemLabel != null)
            Text(
              selectedItemLabel!,
              style: TextStyle(
                fontSize:   isMobile ? 11 : 12,
                fontWeight: FontWeight.w500,
                color: Colors.white.withValues(alpha:0.85),
              ),
            ),
        ],
      ),
      backgroundColor: primaryGreen,
      foregroundColor: Colors.white,
      elevation:   0,
      centerTitle: true,
      leading: IconButton(
        icon: Container(
          padding: EdgeInsets.all(isMobile ? 6 : 8),
          decoration: BoxDecoration(
            color:        Colors.white.withValues(alpha:0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(Icons.arrow_back_ios_new,
              color: Colors.white, size: isMobile ? 16 : 18),
        ),
        onPressed: () => Get.back(),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HEADER CARD
  // ════════════════════════════════════════════════════════════════════════════

  Widget _headerCard(bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? 16 : 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [primaryGreen, secondaryGreen],
          begin:  Alignment.topLeft,
          end:    Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color:  primaryGreen.withValues(alpha:0.3),
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
                  color:        Colors.white.withValues(alpha:0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.eco_outlined,
                    color: Colors.white, size: isMobile ? 22 : 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Survey Information',
                      style: TextStyle(
                        fontSize:   isMobile ? 14 : 16,
                        fontWeight: FontWeight.w600,
                        color:      Colors.white.withValues(alpha:0.9),
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Obx(() => Text(
                      form5controller.selectedCrop.value ?? _cropName,
                      style: const TextStyle(
                        fontSize:   14,
                        fontWeight: FontWeight.w700,
                        color:      Colors.white,
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
              Expanded(child: _infoChip(
                  Icons.format_list_numbered, 'Survey No.', _surveyNumber, isMobile)),
              const SizedBox(width: 10),
              Expanded(child: _infoChip(
                  Icons.crop_landscape, 'Area', '$_area cents', isMobile)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoChip(IconData icon, String label, String value, bool isMobile) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isMobile ? 10 : 12,
        vertical:   isMobile ? 10 : 12,
      ),
      decoration: BoxDecoration(
        color:        Colors.white.withValues(alpha:0.2),
        borderRadius: BorderRadius.circular(10),
        border:       Border.all(color: Colors.white.withValues(alpha:0.3), width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, size: isMobile ? 16 : 18, color: Colors.white),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                      fontSize:   isMobile ? 10 : 11,
                      color:      Colors.white.withValues(alpha:0.9),
                      fontWeight: FontWeight.w500,
                    )),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                      fontSize:   isMobile ? 13 : 14,
                      color:      Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION LABEL
  // ════════════════════════════════════════════════════════════════════════════

  Widget _sectionLabel(bool isMobile) {
    return Text(
      'Form Sections',
      style: TextStyle(
        fontSize:   isMobile ? 16 : 18,
        fontWeight: FontWeight.bold,
        color:      textPrimary,
        letterSpacing: -0.2,
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // INDIVIDUAL SECTION CARD
  // ════════════════════════════════════════════════════════════════════════════

  Widget _card({
    required BuildContext              context,
    required SectionNavigationController controller,
    required _SectionData              section,
    required int                       index,
    required bool                      isMobile,
  }) {
    final isCompleted = controller.isSectionCompleted(section.key);

    return Container(
      decoration: BoxDecoration(
        color:        cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color:      Colors.black.withValues(alpha:0.04),
              blurRadius: 16,
              offset:     const Offset(0, 4)),
          BoxShadow(
              color:      Colors.black.withValues(alpha:0.02),
              blurRadius: 4,
              offset:     const Offset(0, 2)),
        ],
        border: isCompleted
            ? Border.all(color: section.color.withValues(alpha:0.3), width: 2)
            : Border.all(color: primaryGreen.withValues(alpha:0.08), width: 1),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _navigate(context, controller, section),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: EdgeInsets.all(isMobile ? 16 : 20),
            child: Row(
              children: [
                // Section icon
                Container(
                  padding: EdgeInsets.all(isMobile ? 12 : 14),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        section.color.withValues(alpha:0.15),
                        section.color.withValues(alpha:0.08),
                      ],
                      begin: Alignment.topLeft,
                      end:   Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(section.icon,
                      size: isMobile ? 22 : 24, color: section.color),
                ),
                const SizedBox(width: 14),

                // Title + description
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        section.title,
                        style: TextStyle(
                          fontSize:   isMobile ? 15 : 16,
                          fontWeight: FontWeight.bold,
                          color:      textPrimary,
                          letterSpacing: -0.1,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        section.description,
                        style: TextStyle(
                          fontSize:   isMobile ? 12 : 13,
                          color:      textSecondary,
                          fontWeight: FontWeight.w500,
                          height:     1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),

                // Completion badge / arrow
                isCompleted
                    ? Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color:      section.color,
                    shape:      BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                          color:      section.color.withValues(alpha:0.4),
                          blurRadius: 8,
                          offset:     const Offset(0, 2)),
                    ],
                  ),
                  child: const Icon(Icons.check_rounded,
                      color: Colors.white, size: 18),
                )
                    : Icon(Icons.arrow_forward_ios_rounded,
                    size: 18, color: Colors.grey.shade400),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FAB — visible only when all 4 sections are complete
  // ════════════════════════════════════════════════════════════════════════════

  Widget _fab(
      BuildContext              context,
      SectionNavigationController controller,
      bool                      isMobile,
      ) {
    return Obx(() {
      final allDone =
      _sections().every((s) => controller.isSectionCompleted(s.key));
      if (!allDone) return const SizedBox.shrink();

      return Container(
        width:  double.infinity,
        margin: EdgeInsets.symmetric(horizontal: isMobile ? 16 : 32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color:      primaryGreen.withValues(alpha:0.4),
              blurRadius: 12,
              offset:     const Offset(0, 6),
              spreadRadius: 1,
            ),
          ],
        ),
        child: ElevatedButton(
          onPressed: () => _submitDialog(context, controller),
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryGreen,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14)),
            elevation: 0,
            padding: EdgeInsets.symmetric(
              horizontal: 28,
              vertical:   isMobile ? 16 : 18,
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
                  fontSize:   isMobile ? 15 : 16,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  //
  // _enrichedSurveyData guarantees:
  //   surveyData[CceSurveyKeys.cceAvailablePlotId]    always present
  //   surveyData[CceSurveyKeys.cceDataEntryPerTreeId] present iff non-null
  //
  // Each destination page reads these values via the CceSurveyDataX extension:
  //   widget.surveyData.cceAvailablePlotId     → String  (plot-level ID)
  //   widget.surveyData.cceDataEntryPerTreeId  → String? (per-tree ID)
  // ════════════════════════════════════════════════════════════════════════════

  void _navigate(
      BuildContext              context,
      SectionNavigationController controller,
      _SectionData              section,
      ) {
    final data = _enrichedSurveyData; // snapshot once

    switch (section.key) {
      case 'irrigation':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => IrrigationDetailsCCEPage(surveyData: data,),
          ),
        ).then((result) {
          if (result is Map<String, dynamic>) {
            // ✅ Use section.key which already matches correctly
            controller.updateSectionData(section.key, result);
          }
        });
        break;

      case 'seed':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SeedDetailsCCEPage(surveyData: data),
          ),
        ).then((result) {
          if (result is Map<String, dynamic>) {
            // ✅ Use section.key which already matches correctly
            controller.updateSectionData(section.key, result);
            _autoNavigateToNextIncomplete(context, controller);
          }
        });
      case 'disease_pesticide':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => DiseasePesticideCCEPage(surveyData: data),
          ),
        ).then((result) {
          if (result is Map<String, dynamic>) {
            controller.updateSectionData('disease_pesticide', result);
            _autoNavigateToNextIncomplete(context, controller);
          }
        });

      case 'yield_details':
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => YieldDetailsPage(surveyData: data),
          ),
        ).then((result) {
          if (result is Map<String, dynamic>) {
            controller.updateSectionData('yield_details', result);
            _autoNavigateToNextIncomplete(context, controller);
          }
        });
    }
  }

  void _autoNavigateToNextIncomplete(
      BuildContext context,
      SectionNavigationController controller,
      ) {
    final sections = _sections();
    _SectionData? nextSection;
    for (final s in sections) {
      if (!controller.isSectionCompleted(s.key)) {
        nextSection = s;
        break;
      }
    }

    if (nextSection != null) {
      Future.delayed(const Duration(milliseconds: 300), () {
        if (context.mounted) {
          _navigate(context, controller, nextSection!);
        }
      });
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SUBMIT DIALOG
  // ════════════════════════════════════════════════════════════════════════════

  void _submitDialog(
      BuildContext              context,
      SectionNavigationController controller,
      ) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.check_circle, color: primaryGreen),
            const SizedBox(width: 12),
            const Text('Submit Form'),
          ],
        ),
        content: Column(
          mainAxisSize:     MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'All sections are complete. Would you like to submit the form?',
              style: TextStyle(fontSize: 14),
            ),
            // Plot ID chip
            if (cceAvailablePlotId.isNotEmpty) ...[
              const SizedBox(height: 12),
              _dialogIdChip(
                icon:  Icons.grid_view_rounded,
                label: 'Plot ID',
                value: cceAvailablePlotId,
                color: Colors.blueGrey,
              ),
            ],
            // Per-tree ID chip (only when saved)
            if (_hasPerTree) ...[
              const SizedBox(height: 8),
              _dialogIdChip(
                icon:  Icons.fingerprint_rounded,
                label: 'Tree/Plant ID',
                value: cceDataEntryPerTreeId!,
                color: Colors.teal,
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context, true);
              SnackbarHelper.showSuccess(
                'Success',
                'Form submitted successfully',
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }

  Widget _dialogIdChip({
    required IconData      icon,
    required String        label,
    required String        value,
    required MaterialColor color,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color:        color.shade50,
        borderRadius: BorderRadius.circular(8),
        border:       Border.all(color: color.shade200, width: 1),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: color.shade700),
          const SizedBox(width: 6),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize:   11,
              fontWeight: FontWeight.w600,
              color:      color.shade800,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize:   11,
                color:      color.shade800,
                fontFamily: 'monospace',
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTIONS DATA
  // ════════════════════════════════════════════════════════════════════════════

  List<_SectionData> _sections() => [
    _SectionData(
      key:         'irrigation',
      title:       'Irrigation Details',
      description: 'Specify irrigation methods and water sources',
      icon:        Icons.water_drop_outlined,
      color:       _teal,
    ),
    _SectionData(
      key:         'seed',
      title:       'Seed Details',
      description: 'Record seed variety and quantity information',
      icon:        Icons.eco_outlined,
      color:       _purple,
    ),
    _SectionData(
      key:         'disease_pesticide',
      title:       'Pesticides & Fertilizers',
      description: 'Document disease incidents and treatments',
      icon:        Icons.medical_services_outlined,
      color:       _indigo,
    ),
    _SectionData(
      key:         'yield_details',
      title:       'Yield Details',
      description: 'Record harvest output, crop yield and production data',
      icon:        Icons.agriculture_outlined,
      color:       _amber,
    ),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// Private section model
// ═══════════════════════════════════════════════════════════════════════════

class _SectionData {
  final String   key;
  final String   title;
  final String   description;
  final IconData icon;
  final Color    color;

  const _SectionData({
    required this.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}