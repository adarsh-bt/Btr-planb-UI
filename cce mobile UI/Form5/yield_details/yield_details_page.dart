import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../../../controller/cce/cce_data_entry/yield_details.dart';
import '../../../../../model/cce/yield_details.dart';

// ─── colours ──────────────────────────────────────────────────────────────────
const _green   = Color(0xFF2D5F3F);
const _green2  = Color(0xFF3D7F5F);
const _surface = Color(0xFFF8FAF9);
const _white   = Colors.white;
const _txt1    = Color(0xFF1A1A1A);
const _txt2    = Color(0xFF666666);
const _amber   = Color(0xFFFF8F00);
const _red     = Color(0xFFE53935);
const _teal    = Color(0xFF10B981);
const _blue    = Color(0xFF3B82F6);
const _purple  = Color(0xFF7B1FA2);

// ═════════════════════════════════════════════════════════════════════════════
class YieldDetailsPage extends StatefulWidget {
  final Map<String, String> surveyData;
  const YieldDetailsPage({super.key, required this.surveyData});
  @override
  State<YieldDetailsPage> createState() => _YieldDetailsPageState();
}
class _YieldDetailsPageState extends State<YieldDetailsPage> {
  late final YieldDetailsController ctrl;
  late final String _controllerTag;
  int    get cropId   => int.tryParse(widget.surveyData['cropId']  ?? '0') ?? 0;
  String get cropName => widget.surveyData['cropName'] ?? 'Crop';
  String get surveyNo => widget.surveyData['surveyNo'] ?? '';

  @override
  void initState() {
    super.initState();

    // ── 1. Derive unique tag (same logic as IrrigationDetailsCCEPage) ──────
    final perTreeId = widget.surveyData['cceDataEntryPerTreeId'];
    final plotId    = widget.surveyData['cceAvailablePlotId'] ?? '';
    _controllerTag  = (perTreeId != null && perTreeId.isNotEmpty)
        ? perTreeId
        : 'sqm_$plotId';

    // ── 2. Force-delete any stale instance left from a previous visit ──────
    if (Get.isRegistered<YieldDetailsController>(tag: _controllerTag)) {
      Get.delete<YieldDetailsController>(tag: _controllerTag, force: true);
    }

    // ── 3. Register a fresh controller ────────────────────────────────────
    ctrl = Get.put(
      YieldDetailsController(),
      tag:       _controllerTag,
      permanent: false,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (cropId != 0) ctrl.setCropId(cropId);
      await ctrl.fetchSavedYieldDetails(widget.surveyData);
    });
  }
  @override
  void dispose() {
    if (Get.isRegistered<YieldDetailsController>(tag: _controllerTag)) {
      Get.delete<YieldDetailsController>(tag: _controllerTag, force: true);
    }
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final isSmall = MediaQuery.of(context).size.width < 600;
    return Scaffold(
      backgroundColor: _surface,
      appBar: _appBar(isSmall),
      body: Obx(() {
        if (ctrl.isLoading.value || ctrl.isLoadingSaved.value) {
          return _Loader(
              label: ctrl.isLoadingSaved.value
                  ? 'Loading saved details…'
                  : 'Loading yield parameters…');
        }
        if (ctrl.hasError.value) {
          return _ErrorState(ctrl: ctrl, isSmall: isSmall);
        }
        return _Body(
            ctrl:       ctrl,
            isSmall:    isSmall,
            surveyData: widget.surveyData,
            cropName:   cropName,
            surveyNo:   surveyNo);
      }),
    );
  }

  AppBar _appBar(bool isSmall) => AppBar(
    title: Text('Yield Details',
        style: TextStyle(
            fontWeight: FontWeight.w700, fontSize: isSmall ? 18 : 20)),
    backgroundColor: _green,
    foregroundColor: _white,
    elevation: 0,
    centerTitle: true,
    leading: IconButton(
      icon: const Icon(Icons.arrow_back_ios_new, color: _white),
      onPressed: () => Get.back(),
    ),
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// _Body
// ═════════════════════════════════════════════════════════════════════════════
// ═════════════════════════════════════════════════════════════════════════════
// _Body  — buttons are now INSIDE the scroll, no fixed bottom bar
// ═════════════════════════════════════════════════════════════════════════════
class _Body extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  final Map<String, String> surveyData;
  final String cropName;
  final String surveyNo;

  const _Body({
    required this.ctrl,
    required this.isSmall,
    required this.surveyData,
    required this.cropName,
    required this.surveyNo,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(
        16,
        16,
        16,
        MediaQuery.of(context).padding.bottom + 24, // safe-area bottom
      ),
      physics: const ClampingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _HeaderBanner(
              cropName:  cropName,
              surveyNo:  surveyNo,
              ctrl:      ctrl,
              isSmall:   isSmall,
              treeLabel: surveyData['selectedItemLabel']?.isNotEmpty == true
                  ? surveyData['selectedItemLabel']
                  : null),
          SizedBox(height: isSmall ? 14 : 18),
          _VisitTabRail(ctrl: ctrl, isSmall: isSmall),
          SizedBox(height: isSmall ? 14 : 18),
          _BodySwitcher(ctrl: ctrl, isSmall: isSmall),
          SizedBox(height: isSmall ? 24 : 32),

          // ── Buttons live here, scrolls with content ──────────────────
          _SaveButtons(
              ctrl:       ctrl,
              isSmall:    isSmall,
              surveyData: surveyData),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _SaveButtons  — plain column of buttons, no Container shadow / white bg
// ═════════════════════════════════════════════════════════════════════════════
class _SaveButtons extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  final Map<String, String> surveyData;
  const _SaveButtons(
      {required this.ctrl, required this.isSmall, required this.surveyData});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (ctrl.cropYieldFields.isEmpty) return const SizedBox.shrink();

      final saving        = ctrl.isSaving.value;
      final isDraft       = ctrl.isDraftActive;
      final atMax         = ctrl.visits.length >= YieldDetailsController.maxVisits;
      final activeIdx     = ctrl.activeVisitIndex.value;
      final newVisitCount = ctrl.visits.length - ctrl.savedVisitCount.value;

      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // "Save Visit N" — only on draft tab and below the cap
          if (isDraft && !atMax)
            _Btn(
              label: activeIdx < ctrl.visits.length
                  ? 'Update Visit ${activeIdx + 1}'
                  : ctrl.visits.isEmpty
                  ? 'Save Visit 1'
                  : 'Save Visit ${ctrl.visits.length + 1}',
              icon:    Icons.add_task_outlined,
              color:   _amber,
              loading: false,
              onTap:   () => _handleSaveVisit(context),
            ),

          if (isDraft && !atMax && newVisitCount > 0)
            const SizedBox(height: 10),

          // "Save All & Finish" — only when there are NEW unsaved visits
          if (newVisitCount > 0)
            _Btn(
              label: saving
                  ? 'Saving…'
                  : 'Save All & Finish  '
                  '($newVisitCount new '
                  'visit${newVisitCount == 1 ? '' : 's'})',
              icon:    Icons.save_outlined,
              color:   _green,
              loading: saving,
              onTap:   saving ? null : () => _handleSaveAll(context),
            ),

          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: saving ? null : () => Navigator.of(context).pop(),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.grey.shade700,
                side: BorderSide(color: Colors.grey.shade300, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 15),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                ),
              ),
            ),
          ),
        ],
      );
    });
  }

  // ── handlers (unchanged) ──────────────────────────────────────────────────
  void _handleSaveVisit(BuildContext context) {
    if (ctrl.visits.length >= YieldDetailsController.maxVisits) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(
            'Maximum of ${YieldDetailsController.maxVisits} visits already reached.'),
        backgroundColor: _red,
        behavior:        SnackBarBehavior.floating,
        margin:          const EdgeInsets.all(14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 3),
      ));
      return;
    }

    if (!ctrl.validateAll()) {
      _showValidation(context);
      return;
    }

    final ok = ctrl.commitCurrentVisit();
    if (!ok) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
          'Visit ${ctrl.visits.length} saved locally. '
              'Add more or tap Save All & Finish.'),
      backgroundColor: _amber,
      behavior:        SnackBarBehavior.floating,
      margin:          const EdgeInsets.all(14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      duration: const Duration(seconds: 3),
    ));
  }

  Future<void> _handleSaveAll(BuildContext context) async {
    final results = await ctrl.saveAllVisits(surveyData);
    if (!context.mounted) return;
    final failures = results.where((r) => !r.success).toList();
    if (failures.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('${results.length} visit(s) submitted successfully.'),
        backgroundColor: _green,
        behavior:        SnackBarBehavior.floating,
        margin:          const EdgeInsets.all(14),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
      await Future.delayed(const Duration(milliseconds: 1800));
      if (!context.mounted) return;
      Get.back(result: results.last.payload);
    } else {
      _showApiError(
          context, failures.map((r) => r.message ?? 'Unknown').join('\n'));
    }
  }

  void _showValidation(BuildContext context) {
    final errs = ctrl.getValidationErrors();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(children: [
          Icon(Icons.error_outline, color: _red),
          SizedBox(width: 10),
          Text('Incomplete Fields',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ]),
        content: Column(
            mainAxisSize:       MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Please fill in the following:',
                  style: TextStyle(fontWeight: FontWeight.w600, color: _txt1)),
              const SizedBox(height: 10),
              ...errs.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                          padding: EdgeInsets.only(top: 5),
                          child: Icon(Icons.circle,
                              size: 6, color: _red)),
                      const SizedBox(width: 8),
                      Expanded(
                          child: Text(e,
                              style: const TextStyle(
                                  fontSize: 13, color: _txt2))),
                    ]),
              )),
            ]),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
                backgroundColor: _green,
                foregroundColor: _white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showApiError(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(children: [
          Icon(Icons.cloud_off_rounded, color: _red),
          SizedBox(width: 10),
          Text('Save Failed',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ]),
        content: Text(message, style: const TextStyle(color: _txt2)),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
                backgroundColor: _green,
                foregroundColor: _white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _BodySwitcher
// ═════════════════════════════════════════════════════════════════════════════
class _BodySwitcher extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  const _BodySwitcher({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (ctrl.cropYieldFields.isEmpty) {
        return _InfoBox(
          icon:    Icons.warning_amber_rounded,
          color:   _amber,
          message: 'No yield parameters for this crop.',
          isSmall: isSmall,
        );
      }
      final idx         = ctrl.activeVisitIndex.value;
      final isCommitted = idx < ctrl.visits.length;

      if (isCommitted) {
        return _CommittedSummary(
            ctrl: ctrl, visit: ctrl.visits[idx], isSmall: isSmall);
      }
      return _DraftForm(ctrl: ctrl, isSmall: isSmall);
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _DraftForm — ZERO reactive reads except for its isolated children.
// ═════════════════════════════════════════════════════════════════════════════
class _DraftForm extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  const _DraftForm({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    final fields  = ctrl.cropYieldFields;
    final counts  = fields.where((f) => f.isCountType).toList();
    final weights = fields.where((f) => !f.isCountType).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Draft label ──────────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color:        _amber.withValues(alpha: 0.09),
            borderRadius: BorderRadius.circular(10),
            border:       Border.all(color: _amber.withValues(alpha: 0.3)),
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.edit_note_outlined, size: 16, color: _amber),
            const SizedBox(width: 8),
            Obx(() => Text(
              ctrl.visits.isEmpty
                  ? 'Fill in Visit 1 details below'
                  : 'Fill in Visit ${ctrl.visits.length + 1} details below',
              style: const TextStyle(
                  fontSize: 13, fontWeight: FontWeight.w600, color: _amber),
            )),
          ]),
        ),
        const SizedBox(height: 12),

        // ── 12-visit cap warning (shows when ≤ 2 slots remain) ───────────
        Obx(() {
          final remaining =
              YieldDetailsController.maxVisits - ctrl.visits.length;
          if (remaining > 2) return const SizedBox.shrink();
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Container(
              padding:
              const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color:        _red.withValues(alpha: 0.07),
                borderRadius: BorderRadius.circular(10),
                border:       Border.all(color: _red.withValues(alpha: 0.3)),
              ),
              child: Row(children: [
                const Icon(Icons.warning_rounded, size: 15, color: _red),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    remaining == 0
                        ? 'Maximum of 12 visits reached.'
                        : '$remaining visit${remaining == 1 ? '' : 's'} '
                        'remaining (max ${YieldDetailsController.maxVisits})',
                    style: const TextStyle(
                        fontSize:   12,
                        fontWeight: FontWeight.w600,
                        color:      _red),
                  ),
                ),
              ]),
            ),
          );
        }),
        // ── Progress bar ─────────────────────────────────────────────────
        _ProgressBar(ctrl: ctrl, total: fields.length, isSmall: isSmall),
        const SizedBox(height: 16),

        // ── Actual Harvest Date ───────────────────────────────────────────
        _HarvestDatePicker(ctrl: ctrl, isSmall: isSmall),
        const SizedBox(height: 16),

        if (counts.isNotEmpty) ...[
          _FieldGroup(
            ctrl:       ctrl,
            title:      'Count Measurements',
            icon:       Icons.tag,
            color:      _blue,
            fields:     counts.take(5).toList(),
            allFields:  fields,
            isSmall:    isSmall,
            isOptional: true,
          ),
          // ── Fields 6+ shown in a continuation card ────────────────────
          if (counts.length > 5) ...[
            const SizedBox(height: 10),
            _CountContinuationCard(
              ctrl:      ctrl,
              fields:    counts.skip(5).toList(),
              allFields: fields,
              isSmall:   isSmall,
            ),
          ],
          const SizedBox(height: 16),
        ],

        if (weights.isNotEmpty)
          _FieldGroup(
            ctrl:      ctrl,
            title:     'Weight / Other Measurements',
            icon:      Icons.scale_outlined,
            color:     _amber,
            fields:    weights,
            allFields: fields,
            isSmall:   isSmall,
          ),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _HarvestDatePicker — isolated Obx reads draftHarvestDate + harvestDateMissing
// ═════════════════════════════════════════════════════════════════════════════
class _HarvestDatePicker extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  const _HarvestDatePicker({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final date   = ctrl.draftHarvestDate.value;
      final hasErr = ctrl.harvestDateMissing.value;

      final dateStr = date != null
          ? DateFormat('dd MMM yyyy').format(date)
          : 'Select harvest date';

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Section label ──────────────────────────────────────────────
          Row(children: [
            Container(
              width:  isSmall ? 22 : 24,
              height: isSmall ? 22 : 24,
              decoration: BoxDecoration(
                color: (hasErr ? _red : _green).withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(
                  Icons.calendar_today_outlined,
                  size:  isSmall ? 12 : 13,
                  color: hasErr ? _red : _green,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Actual Harvest Date',
              style: TextStyle(
                  fontSize:   isSmall ? 13 : 14,
                  fontWeight: FontWeight.w600,
                  color:      hasErr ? _red : _txt1),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color:        _red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'Required',
                style: TextStyle(
                    fontSize:   10,
                    fontWeight: FontWeight.w700,
                    color:      _red),
              ),
            ),
          ]),
          const SizedBox(height: 8),

          // ── Tappable date row ──────────────────────────────────────────
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: date ?? DateTime.now(),
                firstDate: DateTime(2000),
                lastDate: DateTime.now(),
                builder: (ctx, child) => Theme(
                  data: Theme.of(ctx).copyWith(
                    colorScheme: const ColorScheme.light(
                      primary:   _green,
                      onPrimary: _white,
                      onSurface: _txt1,
                    ),
                  ),
                  child: child!,
                ),
              );
              if (picked != null) {
                ctrl.draftHarvestDate.value  = picked;
                ctrl.harvestDateMissing.value = false;
              }
            },
            child: Container(
              padding: EdgeInsets.symmetric(
                  horizontal: isSmall ? 13 : 15,
                  vertical:   isSmall ? 13 : 15),
              decoration: BoxDecoration(
                color: hasErr
                    ? _red.withValues(alpha: 0.03)
                    : _white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: hasErr
                      ? _red.withValues(alpha: 0.5)
                      : date != null
                      ? _green.withValues(alpha: 0.4)
                      : Colors.grey.shade300,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                      color:      Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset:     const Offset(0, 2)),
                ],
              ),
              child: Row(children: [
                // Icon pill
                Container(
                  padding: EdgeInsets.all(isSmall ? 7 : 9),
                  decoration: BoxDecoration(
                    color:        (hasErr ? _red : _green).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.calendar_month_outlined,
                    size:  isSmall ? 16 : 18,
                    color: hasErr ? _red : _green,
                  ),
                ),
                const SizedBox(width: 12),

                // Date text
                Expanded(
                  child: Text(
                    dateStr,
                    style: TextStyle(
                        fontSize:   isSmall ? 14 : 15,
                        fontWeight: FontWeight.w600,
                        color: date != null
                            ? _txt1
                            : hasErr
                            ? _red.withValues(alpha: 0.6)
                            : Colors.grey.shade400),
                  ),
                ),

                // Right indicator
                if (date != null)
                  const Icon(Icons.check_circle_rounded,
                      color: _teal, size: 20)
                else
                  Icon(Icons.arrow_drop_down_rounded,
                      color: hasErr ? _red : Colors.grey.shade400, size: 24),
              ]),
            ),
          ),

          // ── Inline error text ──────────────────────────────────────────
          if (hasErr)
            Padding(
              padding: const EdgeInsets.only(top: 5, left: 4),
              child: Text(
                'Please select a harvest date',
                style: TextStyle(
                    fontSize: isSmall ? 11 : 12,
                    color:    _red,
                    fontWeight: FontWeight.w500),
              ),
            ),
        ],
      );
    });
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _FieldGroup
// ═════════════════════════════════════════════════════════════════════════════
class _FieldGroup extends StatelessWidget {
  final YieldDetailsController ctrl;
  final String title;
  final IconData icon;
  final Color color;
  final List<CropYieldType> fields;
  final List<CropYieldType> allFields;
  final bool isSmall;
  /// When true, renders an 'Optional' badge instead of the field-count badge.
  final bool isOptional;

  const _FieldGroup({
    required this.ctrl,
    required this.title,
    required this.icon,
    required this.color,
    required this.fields,
    required this.allFields,
    required this.isSmall,
    this.isOptional = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color:        _white,
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: color.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
              color:      Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset:     const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: EdgeInsets.all(isSmall ? 13 : 15),
            decoration: BoxDecoration(
              color:        color.withValues(alpha: 0.06),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(children: [
              Container(
                padding: EdgeInsets.all(isSmall ? 7 : 9),
                decoration: BoxDecoration(
                    color:        color.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(9)),
                child: Icon(icon, size: isSmall ? 17 : 19, color: color),
              ),
              const SizedBox(width: 10),
              Expanded(
                  child: Text(title,
                      style: TextStyle(
                          fontSize:   isSmall ? 14 : 15,
                          fontWeight: FontWeight.bold,
                          color:      _txt1))),
              isOptional
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        color:        _blue.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border:       Border.all(color: _blue.withValues(alpha: 0.3)),
                      ),
                      child: const Text(
                        'Optional',
                        style: TextStyle(
                          fontSize:   10,
                          fontWeight: FontWeight.w700,
                          color:      _blue,
                        ),
                      ),
                    )
                  : Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                          color:        color.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20)),
                      child: Text('${fields.length}',
                          style: TextStyle(
                              fontSize:   isSmall ? 11 : 12,
                              fontWeight: FontWeight.w700,
                              color:      color)),
                    ),
            ]),
          ),
          Divider(height: 1, color: Colors.grey.shade200),

          // Fields
          Padding(
            padding: EdgeInsets.all(isSmall ? 13 : 15),
            child: Column(
              children: List.generate(fields.length, (i) {
                final field    = fields[i];
                final globalNo = allFields.indexOf(field) + 1;
                final fieldId  = field.cropYieldTypeId!;
                final tc       = ctrl.controllerFor(fieldId);
                if (tc == null) return const SizedBox.shrink();

                return Padding(
                  padding: EdgeInsets.only(
                      bottom:
                      i < fields.length - 1 ? (isSmall ? 18 : 22) : 0),
                  child: _YieldInputField(
                    key:            ValueKey(fieldId),
                    field:          field,
                    fieldNo:        globalNo,
                    textController: tc,
                    errorRx:        ctrl.fieldErrors[fieldId],
                    groupColor:     color,
                    isSmall:        isSmall,
                    onChanged:      (v) => ctrl.onFieldChanged(fieldId),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _CountContinuationCard  — shows count fields beyond the first 5
// ═════════════════════════════════════════════════════════════════════════════
class _CountContinuationCard extends StatelessWidget {
  final YieldDetailsController ctrl;
  final List<CropYieldType> fields;
  final List<CropYieldType> allFields;
  final bool isSmall;

  const _CountContinuationCard({
    required this.ctrl,
    required this.fields,
    required this.allFields,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color:        _white,
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: _blue.withValues(alpha: 0.25)),
        boxShadow: [
          BoxShadow(
              color:      Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset:     const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Breadcrumb strip — clearly links back to the parent group ──
          Container(
            padding: EdgeInsets.symmetric(
                horizontal: isSmall ? 13 : 15, vertical: isSmall ? 9 : 11),
            decoration: BoxDecoration(
              color:        _blue.withValues(alpha: 0.05),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(children: [
              Container(
                padding: EdgeInsets.all(isSmall ? 6 : 8),
                decoration: BoxDecoration(
                    color:        _blue.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8)),
                child: Icon(Icons.tag, size: isSmall ? 14 : 16, color: _blue),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Count Measurements (cont.)',
                      style: TextStyle(
                          fontSize:   isSmall ? 13 : 14,
                          fontWeight: FontWeight.bold,
                          color:      _txt1),
                    ),
                    Text(
                      'Fields ${allFields.indexOf(fields.first) + 1}–'
                      '${allFields.indexOf(fields.last) + 1} · Optional',
                      style: TextStyle(
                          fontSize: isSmall ? 10 : 11,
                          color:    _blue.withValues(alpha: 0.7),
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                decoration: BoxDecoration(
                  color:        _blue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border:       Border.all(color: _blue.withValues(alpha: 0.3)),
                ),
                child: const Text(
                  'Optional',
                  style: TextStyle(
                      fontSize:   10,
                      fontWeight: FontWeight.w700,
                      color:      _blue),
                ),
              ),
            ]),
          ),
          Divider(height: 1, color: _blue.withValues(alpha: 0.12)),

          // ── Fields ────────────────────────────────────────────────────
          Padding(
            padding: EdgeInsets.all(isSmall ? 13 : 15),
            child: Column(
              children: List.generate(fields.length, (i) {
                final field    = fields[i];
                final globalNo = allFields.indexOf(field) + 1;
                final fieldId  = field.cropYieldTypeId!;
                final tc       = ctrl.controllerFor(fieldId);
                if (tc == null) return const SizedBox.shrink();

                return Padding(
                  padding: EdgeInsets.only(
                      bottom: i < fields.length - 1 ? (isSmall ? 18 : 22) : 0),
                  child: _YieldInputField(
                    key:            ValueKey('cont_$fieldId'),
                    field:          field,
                    fieldNo:        globalNo,
                    textController: tc,
                    errorRx:        ctrl.fieldErrors[fieldId],
                    groupColor:     _blue,
                    isSmall:        isSmall,
                    onChanged:      (v) => ctrl.onFieldChanged(fieldId),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _YieldInputField
// ═════════════════════════════════════════════════════════════════════════════
class _YieldInputField extends StatelessWidget {
  final CropYieldType field;
  final int fieldNo;
  final TextEditingController textController;
  final Rx<String?>? errorRx;
  final Color groupColor;
  final bool isSmall;
  final ValueChanged<String> onChanged;

  const _YieldInputField({
    super.key,
    required this.field,
    required this.fieldNo,
    required this.textController,
    required this.errorRx,
    required this.groupColor,
    required this.isSmall,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            width:  isSmall ? 22 : 24,
            height: isSmall ? 22 : 24,
            decoration: BoxDecoration(
                color:  groupColor.withValues(alpha: 0.15),
                shape:  BoxShape.circle),
            child: Center(
                child: Text('$fieldNo',
                    style: TextStyle(
                        fontSize:   isSmall ? 10 : 11,
                        fontWeight: FontWeight.w700,
                        color:      groupColor))),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(field.cropYieldNameEn ?? '',
                  style: TextStyle(
                      fontSize:   isSmall ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color:      _txt1)),
              if ((field.cropYieldNameMal ?? '').isNotEmpty)
                Text(field.cropYieldNameMal!,
                    style: TextStyle(
                        fontSize:   isSmall ? 11 : 12,
                        color:      _txt2,
                        fontStyle:  FontStyle.italic)),
            ]),
          ),
          const SizedBox(width: 8),
          _TypeBadge(field: field, isSmall: isSmall),
        ]),
        const SizedBox(height: 9),

        // Obx reads ONLY errorRx.value
        Obx(() {
          final err    = errorRx?.value;
          final hasErr = err != null;
          return TextFormField(
            controller:       textController,
            keyboardType: field.isCountType
                ? TextInputType.number
                : const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: field.isCountType
                ? [FilteringTextInputFormatter.digitsOnly]
                : [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'))],
            style: TextStyle(
                fontSize:   isSmall ? 14 : 15,
                fontWeight: FontWeight.w600,
                color:      _txt1),
            onChanged: onChanged,
            decoration: InputDecoration(
              hintText: field.isCountType
                  ? 'Enter count'
                  : 'Enter ${field.unitLabel}',
              hintStyle: TextStyle(
                  color:      Colors.grey.shade400,
                  fontSize:   isSmall ? 12 : 13,
                  fontWeight: FontWeight.w400),
              prefixIcon: Container(
                margin:  const EdgeInsets.all(8),
                padding: EdgeInsets.all(isSmall ? 7 : 9),
                decoration: BoxDecoration(
                  color:        groupColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                    field.isCountType
                        ? Icons.tag
                        : Icons.scale_outlined,
                    size:  isSmall ? 15 : 17,
                    color: groupColor),
              ),
              suffixIcon: Padding(
                padding: EdgeInsets.only(right: isSmall ? 10 : 12),
                child: Center(
                  widthFactor: 1,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: (hasErr ? _red : groupColor)
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Text(field.unitLabel,
                        style: TextStyle(
                            fontSize:   isSmall ? 11 : 12,
                            fontWeight: FontWeight.w700,
                            color: hasErr ? _red : groupColor)),
                  ),
                ),
              ),
              filled:     true,
              fillColor:  hasErr ? _red.withValues(alpha: 0.03) : _surface,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide:   BorderSide.none),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                    color: hasErr
                        ? _red.withValues(alpha: 0.5)
                        : Colors.grey.shade200,
                    width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                    color: hasErr ? _red : groupColor, width: 2),
              ),
              contentPadding: EdgeInsets.symmetric(
                  horizontal: isSmall ? 12 : 14,
                  vertical:   isSmall ? 14 : 16),
              errorText:  err,
              errorStyle: TextStyle(
                  fontSize: isSmall ? 11 : 12, color: _red),
            ),
          );
        }),
      ],
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _TypeBadge
// ═════════════════════════════════════════════════════════════════════════════
class _TypeBadge extends StatelessWidget {
  final CropYieldType field;
  final bool isSmall;
  const _TypeBadge({required this.field, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    final Color    color;
    final IconData icon;
    final String   label;

    if (field.isCountType)           { color = _blue;   icon = Icons.numbers; label = 'Count'; }
    else if (field.isPercentageUnit) { color = _purple;  icon = Icons.percent; label = '%'; }
    else                             { color = _amber;  icon = Icons.scale;   label = 'kg'; }

    return Container(
      padding: EdgeInsets.symmetric(
          horizontal: isSmall ? 7 : 9, vertical: isSmall ? 3 : 4),
      decoration: BoxDecoration(
        color:        color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border:       Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: isSmall ? 11 : 12, color: color),
        const SizedBox(width: 3),
        Text(label,
            style: TextStyle(
                fontSize:   isSmall ? 10 : 11,
                fontWeight: FontWeight.w700,
                color:      color)),
      ]),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _ProgressBar
// ═════════════════════════════════════════════════════════════════════════════
class _ProgressBar extends StatelessWidget {
  final YieldDetailsController ctrl;
  final int total;
  final bool isSmall;
  const _ProgressBar(
      {required this.ctrl, required this.total, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isSmall ? 12 : 14),
      decoration: BoxDecoration(
        color:        _white,
        borderRadius: BorderRadius.circular(12),
        border:       Border.all(color: _green.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
              color:      Colors.black.withValues(alpha: 0.03),
              blurRadius: 8,
              offset:     const Offset(0, 2)),
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Fields Completed',
              style: TextStyle(
                  fontSize:   isSmall ? 12 : 13,
                  fontWeight: FontWeight.w600,
                  color:      _txt2)),
          Obx(() => Text('${ctrl.filledCount.value} / $total',
              style: TextStyle(
                  fontSize:   isSmall ? 13 : 14,
                  fontWeight: FontWeight.w700,
                  color:      _green))),
        ]),
        const SizedBox(height: 9),
        Obx(() {
          final p = total == 0 ? 0.0 : ctrl.filledCount.value / total;
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value:           p,
              minHeight:       isSmall ? 7 : 9,
              backgroundColor: Colors.grey.shade100,
              valueColor: AlwaysStoppedAnimation<Color>(
                  p >= 1.0 ? _teal : _green),
            ),
          );
        }),
      ]),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _VisitTabRail
// ═════════════════════════════════════════════════════════════════════════════
class _VisitTabRail extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  const _VisitTabRail({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final committed = ctrl.visits.length;
      final active    = ctrl.activeVisitIndex.value;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Icon(Icons.history_edu_outlined, size: 15, color: _green),
            const SizedBox(width: 5),
            const Text('Visits',
                style: TextStyle(
                    fontSize:   13,
                    fontWeight: FontWeight.w700,
                    color:      _green)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                  color:        _green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20)),
              child: Text('$committed saved',
                  style: const TextStyle(
                      fontSize:   11,
                      fontWeight: FontWeight.w600,
                      color:      _green)),
            ),
            // Visit cap indicator
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                  color: committed >= YieldDetailsController.maxVisits
                      ? _red.withValues(alpha: 0.1)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(20)),
              child: Text(
                '$committed / ${YieldDetailsController.maxVisits}',
                style: TextStyle(
                    fontSize:   11,
                    fontWeight: FontWeight.w600,
                    color: committed >= YieldDetailsController.maxVisits
                        ? _red
                        : _txt2),
              ),
            ),
          ]),
          const SizedBox(height: 9),
          SizedBox(
            height: isSmall ? 42 : 46,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics:         const BouncingScrollPhysics(),
              itemCount:       committed + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                if (i == committed) {
                  return _AddTab(
                      ctrl:      ctrl,
                      active:    active,
                      committed: committed,
                      isSmall:   isSmall);
                }
                return _CommittedTab(
                  ctrl:     ctrl,
                  index:    i,
                  active:   active,
                  isSmall:  isSmall,
                  onRemove: () => _confirmRemove(context, i),
                );
              },
            ),
          ),
        ],
      );
    });
  }

  void _confirmRemove(BuildContext context, int index) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(children: [
          const Icon(Icons.delete_outline, color: _red),
          const SizedBox(width: 10),
          Text('Remove Visit ${index + 1}?',
              style:
              const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        ]),
        content: Text('All data in Visit ${index + 1} will be deleted.',
            style: const TextStyle(color: _txt2)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel',
                  style: TextStyle(color: _txt2))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ctrl.removeVisit(index);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: _red,
                foregroundColor: _white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10))),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}

class _CommittedTab extends StatelessWidget {
  final YieldDetailsController ctrl;
  final int index;
  final int active;
  final bool isSmall;
  final VoidCallback onRemove;
  const _CommittedTab(
      {required this.ctrl,
        required this.index,
        required this.active,
        required this.isSmall,
        required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final isActive = index == active;
    return GestureDetector(
      onTap: () => ctrl.switchToVisit(index),
      child: Container(
        padding: EdgeInsets.symmetric(
            horizontal: isSmall ? 12 : 14, vertical: isSmall ? 7 : 9),
        decoration: BoxDecoration(
          color: isActive ? _green : _white,
          borderRadius: BorderRadius.circular(11),
          border: Border.all(
              color: isActive ? _green : _green.withValues(alpha: 0.25),
              width: isActive ? 2 : 1.5),
          boxShadow: isActive
              ? [
            BoxShadow(
                color:      _green.withValues(alpha: 0.25),
                blurRadius: 6,
                offset:     const Offset(0, 2))
          ]
              : [],
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.check_circle_outline,
              size:  isSmall ? 13 : 14,
              color: isActive ? _white : _teal),
          const SizedBox(width: 5),
          Text('Visit ${index + 1}',
              style: TextStyle(
                  fontSize:   isSmall ? 12 : 13,
                  fontWeight: FontWeight.w700,
                  color: isActive ? _white : _txt1)),
          const SizedBox(width: 7),
          GestureDetector(
            onTap: onRemove,
            child: Container(
              width:  isSmall ? 17 : 19,
              height: isSmall ? 17 : 19,
              decoration: BoxDecoration(
                color: isActive
                    ? _white.withValues(alpha: 0.2)
                    : _red.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.close,
                  size:  isSmall ? 10 : 11,
                  color: isActive ? _white : _red),
            ),
          ),
        ]),
      ),
    );
  }
}

class _AddTab extends StatelessWidget {
  final YieldDetailsController ctrl;
  final int active;
  final int committed;
  final bool isSmall;
  const _AddTab(
      {required this.ctrl,
        required this.active,
        required this.committed,
        required this.isSmall});

  @override
  Widget build(BuildContext context) {
    final isDraft = active == committed;
    final atMax   = committed >= YieldDetailsController.maxVisits;

    // Hide the add-tab entirely when the cap is reached and it isn't the
    // currently active (draft) tab — the user can still view the last draft.
    if (atMax && !isDraft) return const SizedBox.shrink();

    return GestureDetector(
      onTap: atMax ? null : () => ctrl.switchToVisit(committed),
      child: Container(
        padding: EdgeInsets.symmetric(
            horizontal: isSmall ? 12 : 14, vertical: isSmall ? 7 : 9),
        decoration: BoxDecoration(
          color: atMax
              ? Colors.grey.shade200
              : isDraft
              ? _amber
              : _amber.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(11),
          border: Border.all(
              color: atMax
                  ? Colors.grey.shade300
                  : isDraft
                  ? _amber
                  : _amber.withValues(alpha: 0.35),
              width: isDraft ? 2 : 1.5),
          boxShadow: isDraft && !atMax
              ? [
            BoxShadow(
                color:      _amber.withValues(alpha: 0.25),
                blurRadius: 6,
                offset:     const Offset(0, 2))
          ]
              : [],
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(
            atMax ? Icons.block_rounded : Icons.add_circle_outline,
            size:  isSmall ? 13 : 14,
            color: atMax
                ? Colors.grey
                : isDraft
                ? _white
                : _amber,
          ),
          const SizedBox(width: 5),
          Text(
            atMax
                ? 'Max Reached'
                : committed == 0
                ? 'Add Visit'
                : 'Visit ${committed + 1}',
            style: TextStyle(
                fontSize:   isSmall ? 12 : 13,
                fontWeight: FontWeight.w700,
                color: atMax
                    ? Colors.grey
                    : isDraft
                    ? _white
                    : _amber),
          ),
        ]),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _CommittedSummary — read-only view of a saved visit
// ═════════════════════════════════════════════════════════════════════════════
class _CommittedSummary extends StatelessWidget {
  final YieldDetailsController ctrl;
  final YieldVisit visit;
  final bool isSmall;
  const _CommittedSummary(
      {required this.ctrl, required this.visit, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    final recordedStr =
    DateFormat('dd MMM yyyy  •  hh:mm a').format(visit.visitedAt);
    final harvestStr =
    DateFormat('dd MMM yyyy').format(visit.harvestDate);

    return Container(
      decoration: BoxDecoration(
        color:        _white,
        borderRadius: BorderRadius.circular(14),
        border:       Border.all(color: _teal.withValues(alpha: 0.25), width: 1.5),
        boxShadow: [
          BoxShadow(
              color:      Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset:     const Offset(0, 3)),
        ],
      ),
      child: Column(children: [
        // ── Header ────────────────────────────────────────────────────────
        Container(
          padding: EdgeInsets.all(isSmall ? 13 : 15),
          decoration: BoxDecoration(
            color:        _teal.withValues(alpha: 0.06),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
          ),
          child: Row(children: [
            Container(
              padding: EdgeInsets.all(isSmall ? 7 : 9),
              decoration: BoxDecoration(
                  color:        _teal.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(9)),
              child: Icon(Icons.check_circle_outline,
                  color: _teal, size: isSmall ? 17 : 19),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Visit ${visit.visitNumber} — Saved',
                        style: TextStyle(
                            fontSize:   isSmall ? 14 : 15,
                            fontWeight: FontWeight.bold,
                            color:      _txt1)),
                    const SizedBox(height: 2),
                    // Recorded timestamp
                    Row(children: [
                      Icon(Icons.access_time_rounded,
                          size: isSmall ? 11 : 12, color: _txt2),
                      const SizedBox(width: 4),
                      Text(recordedStr,
                          style: TextStyle(
                              fontSize: isSmall ? 11 : 12, color: _txt2)),
                    ]),
                    const SizedBox(height: 3),
                    // Harvest date — prominent green row
                    Row(children: [
                      Icon(Icons.calendar_month_outlined,
                          size:  isSmall ? 11 : 12, color: _green),
                      const SizedBox(width: 4),
                      Text('Harvested: $harvestStr',
                          style: TextStyle(
                              fontSize:   isSmall ? 11 : 12,
                              color:      _green,
                              fontWeight: FontWeight.w700)),
                    ]),
                  ]),
            ),
            // Edit button
            GestureDetector(
              onTap: () => ctrl.editVisit(ctrl.visits.indexOf(visit)),
              child: Container(
                padding: EdgeInsets.symmetric(
                    horizontal: isSmall ? 10 : 12,
                    vertical:   isSmall ? 6  : 7),
                decoration: BoxDecoration(
                  color:        _blue.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(9),
                  border:       Border.all(color: _blue.withValues(alpha: 0.25)),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.edit_outlined,
                      size: isSmall ? 13 : 14, color: _blue),
                  const SizedBox(width: 4),
                  Text('Edit',
                      style: TextStyle(
                          fontSize:   isSmall ? 11 : 12,
                          fontWeight: FontWeight.w600,
                          color:      _blue)),
                ]),
              ),
            ),
          ]),
        ),
        Divider(height: 1, color: Colors.grey.shade100),

        // ── Field value rows ──────────────────────────────────────────────
        Padding(
          padding: EdgeInsets.all(isSmall ? 13 : 15),
          child: Column(
            children: List.generate(visit.entries.length, (i) {
              final e     = visit.entries[i];
              final field = ctrl.cropYieldFields.firstWhereOrNull(
                      (f) => f.cropYieldTypeId == e.cropYieldTypeId);
              return Container(
                margin: EdgeInsets.only(
                    bottom: i < visit.entries.length - 1 ? 8 : 0),
                padding: EdgeInsets.symmetric(
                    horizontal: isSmall ? 11 : 13,
                    vertical:   isSmall ? 9  : 11),
                decoration: BoxDecoration(
                  color:        _surface,
                  borderRadius: BorderRadius.circular(9),
                  border:       Border.all(color: Colors.grey.shade200),
                ),
                child: Row(children: [
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                              field?.cropYieldNameEn ??
                                  'Field ${e.cropYieldTypeId}',
                              style: TextStyle(
                                  fontSize:   isSmall ? 12 : 13,
                                  fontWeight: FontWeight.w600,
                                  color:      _txt1)),
                          if ((field?.cropYieldNameMal ?? '').isNotEmpty)
                            Text(field!.cropYieldNameMal!,
                                style: TextStyle(
                                    fontSize:  isSmall ? 10 : 11,
                                    color:     _txt2,
                                    fontStyle: FontStyle.italic)),
                        ]),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 11, vertical: 5),
                    decoration: BoxDecoration(
                        color:        _teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(7)),
                    child: Text('${e.value} ${field?.unitLabel ?? ''}',
                        style: TextStyle(
                            fontSize:   isSmall ? 13 : 14,
                            fontWeight: FontWeight.w700,
                            color:      _teal)),
                  ),
                ]),
              );
            }),
          ),
        ),
      ]),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _HeaderBanner
// ═════════════════════════════════════════════════════════════════════════════
class _HeaderBanner extends StatelessWidget {
  final String cropName;
  final String surveyNo;
  final YieldDetailsController ctrl;
  final bool isSmall;
  final String? treeLabel;
  const _HeaderBanner(
      {required this.cropName,
        required this.surveyNo,
        required this.ctrl,
        required this.isSmall,
        this.treeLabel});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isSmall ? 15 : 18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
            colors: [_green, _green2],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color:      _green.withValues(alpha: 0.3),
              blurRadius: 10,
              offset:     const Offset(0, 4)),
        ],
      ),
      child: Row(children: [
        Container(
          padding: EdgeInsets.all(isSmall ? 9 : 11),
          decoration: BoxDecoration(
              color:        _white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(11)),
          child: Icon(Icons.agriculture_outlined,
              color: _white, size: isSmall ? 21 : 25),
        ),
        const SizedBox(width: 13),
        Expanded(
          child:
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(cropName,
                style: TextStyle(
                    fontSize:   isSmall ? 16 : 18,
                    fontWeight: FontWeight.w700,
                    color:      _white),
                overflow: TextOverflow.ellipsis),
            const SizedBox(height: 3),
            Row(children: [

              Text('Survey No. $surveyNo',
                  style: TextStyle(
                      fontSize: isSmall ? 12 : 13,
                      color:    _white.withValues(alpha: 0.9))),
            ]),

            // ✅ Tree label pill
            if (treeLabel != null) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                      color: Colors.white.withValues(alpha: 0.4), width: 1),
                ),
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.park_outlined,
                      size: isSmall ? 11 : 12, color: _white),
                  const SizedBox(width: 5),
                  Text(
                    treeLabel!,
                    style: TextStyle(
                        fontSize: isSmall ? 11 : 12,
                        fontWeight: FontWeight.w700,
                        color: _white,
                        letterSpacing: 0.2),
                  ),
                ]),
              ),
            ],
          ]),
        ),
        // Visit count badge
        Obx(() {
          final cnt = ctrl.visits.length;
          if (cnt == 0) return const SizedBox.shrink();
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
            decoration: BoxDecoration(
                color:        _white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(9)),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text('$cnt',
                  style: TextStyle(
                      fontSize:   isSmall ? 14 : 16,
                      fontWeight: FontWeight.w900,
                      color:      _white)),
              Text(cnt == 1 ? 'Visit' : 'Visits',
                  style: TextStyle(
                      fontSize: isSmall ? 9 : 10,
                      color:    _white.withValues(alpha: 0.85))),
            ]),
          );
        }),
      ]),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// _Btn
// ═════════════════════════════════════════════════════════════════════════════
class _Btn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool loading;
  final VoidCallback? onTap;
  const _Btn(
      {required this.label,
        required this.icon,
        required this.color,
        required this.loading,
        required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor:
          onTap == null ? color.withValues(alpha: 0.6) : color,
          foregroundColor: _white,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 15),
        ),
        child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          if (loading)
            const SizedBox(
                width:  19,
                height: 19,
                child: CircularProgressIndicator(
                    strokeWidth: 2.5, color: _white))
          else
            Icon(icon, size: 20),
          const SizedBox(width: 10),
          Text(label,
              style: const TextStyle(
                  fontSize: 15, fontWeight: FontWeight.w700)),
        ]),
      ),
    );
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Misc helpers
// ═════════════════════════════════════════════════════════════════════════════
class _Loader extends StatelessWidget {
  final String label;
  const _Loader({required this.label});

  @override
  Widget build(BuildContext context) => Center(
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      const SizedBox(
          width:  42,
          height: 42,
          child:  CircularProgressIndicator(strokeWidth: 3, color: _green)),
      const SizedBox(height: 16),
      Text(label, style: const TextStyle(color: _txt2, fontSize: 14)),
    ]),
  );
}

class _ErrorState extends StatelessWidget {
  final YieldDetailsController ctrl;
  final bool isSmall;
  const _ErrorState({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: EdgeInsets.all(isSmall ? 24 : 32),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
                color: _red.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(Icons.error_outline,
                size: isSmall ? 38 : 46, color: _red)),
        const SizedBox(height: 18),
        Text('Failed to Load',
            style: TextStyle(
                fontSize:   isSmall ? 18 : 20,
                fontWeight: FontWeight.bold,
                color:      _txt1)),
        const SizedBox(height: 8),
        Obx(() => Text(ctrl.errorMsg.value,
            style:     TextStyle(fontSize: isSmall ? 13 : 14, color: _txt2),
            textAlign: TextAlign.center)),
        const SizedBox(height: 22),
        ElevatedButton.icon(
          onPressed: ctrl.fetchYieldTypes,
          icon:      const Icon(Icons.refresh),
          label:     const Text('Retry'),
          style: ElevatedButton.styleFrom(
              backgroundColor: _green,
              foregroundColor: _white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(11)),
              padding: const EdgeInsets.symmetric(
                  horizontal: 24, vertical: 13)),
        ),
      ]),
    ),
  );
}

class _InfoBox extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String message;
  final bool isSmall;
  const _InfoBox(
      {required this.icon,
        required this.color,
        required this.message,
        required this.isSmall});

  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.all(isSmall ? 15 : 18),
    decoration: BoxDecoration(
      color:        color.withValues(alpha: 0.06),
      borderRadius: BorderRadius.circular(13),
      border:       Border.all(color: color.withValues(alpha: 0.25), width: 1.5),
    ),
    child: Row(children: [
      Icon(icon, color: color, size: isSmall ? 21 : 25),
      const SizedBox(width: 11),
      Expanded(
          child: Text(message,
              style: TextStyle(
                  fontSize: isSmall ? 13 : 14,
                  color:    _txt1,
                  height:   1.4))),
    ]),
  );
}