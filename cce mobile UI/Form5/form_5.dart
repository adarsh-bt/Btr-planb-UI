import 'package:aidea/view/screens/cce/Form5/continue_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../resources/constants/screen_responsive.dart';
import '../../../../widget/app_bar.dart';

class Form5 extends StatelessWidget {
  const Form5({super.key});
  @override
  Widget build(BuildContext context) {
    final controller = Get.put(Form5Controller());
    final r = AppResponsive(context);
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F0),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(r.appBarHeight),
        child: AppBar(
          backgroundColor: const Color(0xFF1B5E20),
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.white, size: r.icon(22)),
            onPressed: () => Get.back(),
          ),
          title: Padding(
            padding: EdgeInsets.only(top: r.hp(21)),
            child: Text(
              'FORM 5',
              style: TextStyle(
                fontSize: r.appBarTitleFont,
                color: Colors.white,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
              ),
            ),
          ),
          actions: [
            Padding(
              padding: EdgeInsets.only(top: r.hp(18), right: r.sp(6)),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: r.sp(10),
                  vertical: r.hp(4),
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.3),
                    width: 1,
                  ),
                  borderRadius: BorderRadius.circular(r.radius(20)),
                ),
                child: Text(
                  'STEP 1 OF 5',
                  style: TextStyle(
                    fontSize: r.f(11, min: 10, max: 12),
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.3,
                  ),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(top: r.hp(18), right: r.sp(4)),
              child: Icon(
                Icons.more_vert,
                color: Colors.white.withValues(alpha: 0.8),
                size: r.icon(22),
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header info card ──
            Padding(
              padding: EdgeInsets.fromLTRB(
                r.pagePadH, r.hp(12), r.pagePadH, 0,
              ),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(r.radius(14)),
                  border: Border.all(
                    color: const Color(0xFF1B5E20).withValues(alpha: 0.12),
                    width: 0.5,
                  ),
                ),
                padding: EdgeInsets.all(r.sp(14)),
                child: Row(
                  children: [
                    Container(
                      width: r.sp(42),
                      height: r.sp(42),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B5E20).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(r.radius(10)),
                      ),
                      child: Center(
                        child: Icon(
                          Icons.eco_rounded,
                          color: const Color(0xFF1B5E20),
                          size: r.icon(22),
                        ),
                      ),
                    ),
                    SizedBox(width: r.sp(12)),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CCE Form V',
                          style: TextStyle(
                            fontSize: r.f(14, min: 13, max: 16),
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1a1a2e),
                          ),
                        ),
                        SizedBox(height: r.hp(2)),
                        Text(
                          'Tap a crop to begin data entry',
                          style: TextStyle(
                            fontSize: r.f(11, min: 10, max: 13),
                            color: Colors.grey.shade500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: r.hp(14)),

            // ── "Select Crop" label ──
            Padding(
              padding: EdgeInsets.symmetric(horizontal: r.pagePadH),
              child: Row(
                children: [
                  Icon(
                    Icons.grass_outlined,
                    color: const Color(0xFF1B5E20),
                    size: r.icon(16),
                  ),
                  SizedBox(width: r.sp(6)),
                  Text(
                    'SELECT A CROP',
                    style: TextStyle(
                      fontSize: r.f(11, min: 10, max: 12),
                      fontWeight: FontWeight.w700,
                      color: Colors.grey.shade600,
                      letterSpacing: 0.8,
                    ),
                  ),
                  Text(
                    ' *',
                    style: TextStyle(
                      fontSize: r.f(11, min: 10, max: 12),
                      fontWeight: FontWeight.w700,
                      color: Colors.red.shade600,
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: r.hp(8)),

            // ── Crop list ──
            Expanded(
              child: Obx(() {
                if (controller.isLoading.value) {
                  return _ShimmerList(r: r);
                }
                if (controller.masterCrops.isEmpty) {
                  return Center(
                    child: Text(
                      'No crops available',
                      style: TextStyle(
                        color: Colors.grey.shade400,
                        fontSize: r.f(14, min: 12, max: 16),
                      ),
                    ),
                  );
                }
                return ListView.separated(
                  physics: const BouncingScrollPhysics(),
                  padding: EdgeInsets.fromLTRB(
                    r.pagePadH, 0, r.pagePadH, r.hp(24),
                  ),
                  itemCount: controller.masterCrops.length,
                  separatorBuilder: (_, __) => SizedBox(height: r.hp(8)),
                  itemBuilder: (context, index) {
                    final crop = controller.masterCrops[index];
                    return _CropListTile(
                      r: r,
                      controller: controller,
                      cropName: crop.cropName,
                      cropId: crop.cropId.toString(),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Crop List Tile
// ─────────────────────────────────────────────────────────────────────────────

class _CropListTile extends StatelessWidget {
  const _CropListTile({
    required this.r,
    required this.controller,
    required this.cropName,
    required this.cropId,
  });
  final AppResponsive r;
  final Form5Controller controller;
  final String cropName;
  final String cropId;

  static const Set<String> _triggerCropIds = {'1'};

  bool get _requiresSeason {
    // Only paddy (cropId '1') requires season selection.
    return _triggerCropIds.contains(cropId);
  }

  IconData _cropIcon() {
    final name = cropName.toLowerCase();
    if (name.contains('paddy') || name.contains('rice')) return Icons.grain;
    if (name.contains('banana')) return Icons.energy_savings_leaf_outlined;
    if (name.contains('coconut')) return Icons.park_outlined;
    if (name.contains('ginger') || name.contains('turmeric')) return Icons.eco_outlined;
    if (name.contains('tapioca') || name.contains('yam')) return Icons.spa_outlined;
    return Icons.eco_outlined;
  }

  Future<void> _onTap(BuildContext context) async {
    if (controller.isTapping.value) return;   // ← guard
    controller.isTapping.value = true;

    try {
      controller.selectedCrop.value = cropName;
      controller.selectedSeason.value = null;

      if (_requiresSeason) {
        await showModalBottomSheet(
          context: context,
          backgroundColor: Colors.transparent,
          builder: (_) => _SeasonSheet(
            r: r,
            cropName: cropName,
            seasons: controller.initialSeasons,
            onSelected: (season) {
              controller.selectedSeason.value = season;
              Navigator.of(context).pop();
              _proceed(context);
            },
          ),
        );
      } else {
        await _proceed(context);
      }
    } finally {
      controller.isTapping.value = false;     // ← always reset
    }
  }

  Future<void> _proceed(BuildContext context) async {
    final selectedCrop = controller.masterCrops
        .firstWhereOrNull((c) => c.cropName == cropName);
    if (selectedCrop == null) {
      return;
    }

    final seasonId = _requiresSeason
        ? controller.getSeasonIdByName(controller.selectedSeason.value)
        : '';

    final isValid = await controller.fetchSurveyData(
      selectedCrop.cropId.toString(),
      seasonId,
    );
    if (isValid && controller.surveyCards.isNotEmpty) {
      Get.to(() => ContinuePage(controller: controller));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(r.radius(12)),
      child: InkWell(
        onTap: () => _onTap(context),
        borderRadius: BorderRadius.circular(r.radius(12)),
        splashColor: const Color(0xFF1B5E20).withValues(alpha: 0.08),
        highlightColor: const Color(0xFF1B5E20).withValues(alpha: 0.04),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(r.radius(12)),
            border: Border.all(
              color: const Color(0xFF1B5E20).withValues(alpha: 0.14),
              width: 0.5,
            ),
          ),
          child: ListTile(
            contentPadding: EdgeInsets.symmetric(
              horizontal: r.pagePadH,
              vertical: r.hp(4),
            ),
            leading: Container(
              width: r.sp(36),
              height: r.sp(36),
              decoration: BoxDecoration(
                color: const Color(0xFF1B5E20).withValues(alpha: 0.09),
                borderRadius: BorderRadius.circular(r.radius(9)),
              ),
              child: Center(
                child: Icon(
                  _cropIcon(),
                  color: const Color(0xFF1B5E20),
                  size: r.icon(17),
                ),
              ),
            ),
            title: Text(
              cropName,
              style: TextStyle(
                fontSize: r.f(13, min: 12, max: 15),
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1a1a2e),
              ),
            ),
            subtitle: _requiresSeason
                ? Padding(
              padding: EdgeInsets.only(top: r.hp(2)),
              child: Text(
                'Season required',
                style: TextStyle(
                  fontSize: r.f(10, min: 9, max: 12),
                  color: Colors.orange.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
            )
                : null,
            trailing: Icon(
              Icons.chevron_right_rounded,
              color: Colors.grey.shade400,
              size: r.icon(20),
            ),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Season Bottom Sheet
// ─────────────────────────────────────────────────────────────────────────────

class _SeasonSheet extends StatelessWidget {
  const _SeasonSheet({
    required this.r,
    required this.cropName,
    required this.seasons,
    required this.onSelected,
  });
  final AppResponsive r;
  final String cropName;
  final List<String> seasons;
  final void Function(String) onSelected;

  static const _seasonIcons = {
    'Autumn': Icons.park_outlined,
    'Winter': Icons.ac_unit,
    'Summer': Icons.wb_sunny_outlined,
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF0F4F0),
        borderRadius:
        BorderRadius.vertical(top: Radius.circular(r.radius(20))),
      ),
      padding: EdgeInsets.fromLTRB(
        r.pagePadH, r.hp(16), r.pagePadH, r.hp(32),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: r.sp(38),
              height: r.hp(4),
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(r.radius(4)),
              ),
            ),
          ),
          SizedBox(height: r.hp(16)),

          Text(
            'Select Season',
            style: TextStyle(
              fontSize: r.f(15, min: 13, max: 18),
              fontWeight: FontWeight.w700,
              color: const Color(0xFF1a1a2e),
            ),
          ),
          SizedBox(height: r.hp(4)),
          Text(
            cropName,
            style: TextStyle(
              fontSize: r.f(11, min: 10, max: 13),
              color: Colors.grey.shade500,
            ),
          ),
          SizedBox(height: r.hp(16)),

          ...seasons.map((season) => Padding(
            padding: EdgeInsets.only(bottom: r.hp(8)),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(r.radius(12)),
              child: InkWell(
                onTap: () => onSelected(season),
                borderRadius: BorderRadius.circular(r.radius(12)),
                splashColor:
                const Color(0xFF1B5E20).withValues(alpha: 0.08),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(r.radius(12)),
                    border: Border.all(
                      color: const Color(0xFF1B5E20).withValues(alpha: 0.14),
                      width: 0.5,
                    ),
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: r.pagePadH,
                      vertical: r.hp(2),
                    ),
                    leading: Container(
                      width: r.sp(36),
                      height: r.sp(36),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1B5E20).withValues(alpha: 0.09),
                        borderRadius: BorderRadius.circular(r.radius(9)),
                      ),
                      child: Center(
                        child: Icon(
                          _seasonIcons[season] ?? Icons.wb_sunny_outlined,
                          color: const Color(0xFF1B5E20),
                          size: r.icon(17),
                        ),
                      ),
                    ),
                    title: Text(
                      season,
                      style: TextStyle(
                        fontSize: r.f(13, min: 12, max: 15),
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1a1a2e),
                      ),
                    ),
                    trailing: Icon(
                      Icons.chevron_right_rounded,
                      color: Colors.grey.shade400,
                      size: r.icon(20),
                    ),
                  ),
                ),
              ),
            ),
          )),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shimmer skeleton list while loading
// ─────────────────────────────────────────────────────────────────────────────

class _ShimmerList extends StatefulWidget {
  const _ShimmerList({required this.r});
  final AppResponsive r;

  @override
  State<_ShimmerList> createState() => _ShimmerListState();
}

class _ShimmerListState extends State<_ShimmerList>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
    _anim = Tween<double>(begin: -1.5, end: 1.5)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.r;
    return ListView.separated(
      physics: const NeverScrollableScrollPhysics(),
      padding: EdgeInsets.symmetric(horizontal: r.pagePadH),
      itemCount: 7,
      separatorBuilder: (_, __) => SizedBox(height: r.hp(8)),
      itemBuilder: (_, __) => AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => Container(
          height: r.buttonHeight(58),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(r.radius(12)),
            border: Border.all(
              color: const Color(0xFF1B5E20).withValues(alpha: 0.10),
              width: 0.5,
            ),
            gradient: LinearGradient(
              begin: Alignment(_anim.value - 1, 0),
              end: Alignment(_anim.value + 1, 0),
              colors: const [
                Color(0xFFF0F4F0),
                Color(0xFFE0EBE0),
                Color(0xFFF0F4F0),
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: r.pagePadH),
            child: Row(
              children: [
                Container(
                  width: r.sp(36),
                  height: r.sp(36),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(r.radius(10)),
                  ),
                ),
                SizedBox(width: r.sp(14)),
                Container(
                  width: r.sp(120),
                  height: r.hp(13),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(r.radius(6)),
                  ),
                ),
                const Spacer(),
                Container(
                  width: r.sp(16),
                  height: r.sp(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(r.radius(4)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}