import 'package:aidea/resources/utils/snackbar_helper.dart';
import 'package:aidea/view/screens/cce/Form5/section_wise_card.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../resources/constants/screen_responsive.dart';

class ContinuePage extends StatelessWidget {
  final Form5Controller controller;
  const ContinuePage({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final r = AppResponsive(context);

    if (controller.surveyCards.isNotEmpty) {
      final _ = controller.surveyCards.first;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F2),
      body: SafeArea(
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            _buildAppBar(r),
            _buildContextBanner(r),
            _buildSectionDivider(r),
            SliverPadding(
              padding: EdgeInsets.symmetric(horizontal: r.pagePadH),
              sliver: Obx(() {
                if (controller.surveyCards.isEmpty) {
                  return SliverFillRemaining(child: _buildEmptyState(r));
                }

                if (r.isTablet || r.isLargeTablet) {
                  return SliverPadding(
                    padding: EdgeInsets.only(top: r.hp(12), bottom: r.hp(24)),
                    sliver: SliverGrid(
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.35,
                        crossAxisSpacing: r.pick(
                          phone: 12,
                          tablet: 16,
                          largeTablet: 20,
                        ),
                        mainAxisSpacing: r.pick(
                          phone: 12,
                          tablet: 16,
                          largeTablet: 20,
                        ),
                      ),
                      delegate: SliverChildBuilderDelegate(
                            (context, index) => _buildPlotCard(
                          context,
                          controller.surveyCards[index],
                          index,
                          r,
                        ),
                        childCount: controller.surveyCards.length,
                      ),
                    ),
                  );
                }

                return SliverPadding(
                  padding: EdgeInsets.only(top: r.hp(12), bottom: r.hp(24)),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                          (context, index) => _buildPlotCard(
                        context,
                        controller.surveyCards[index],
                        index,
                        r,
                      ),
                      childCount: controller.surveyCards.length,
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // APP BAR
  // ════════════════════════════════════════════════════════════════════

  Widget _buildAppBar(AppResponsive r) {
    return SliverAppBar(
      expandedHeight: 0,
      floating: true,
      pinned: false,
      backgroundColor: Colors.transparent,
      elevation: 0,
      leading: Padding(
        padding: const EdgeInsets.all(8),
        child: IconButton(
          icon: Container(
            padding: EdgeInsets.all(r.icon(10)),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(r.radius(12)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.arrow_back_ios_new,
              size: r.icon(16),
              color: const Color(0xFF2D5F3F),
            ),
          ),
          onPressed: () => Get.back(),
        ),
      ),
    );
  }
  Widget _buildContextBanner(AppResponsive r) {
    return SliverToBoxAdapter(
      child: Container(
        margin: EdgeInsets.fromLTRB(r.pagePadH, 0, r.pagePadH, 0),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1B5E20), Color(0xFF1B5E20)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(r.cardRadius),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2D5F3F).withValues(alpha: 0.28),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(r.cardPad),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── 1. Header label ────────────────────────────────────
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(r.icon(9)),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(r.radius(10)),
                    ),
                    child: Icon(
                      Icons.info_outline_rounded,
                      color: Colors.white.withValues(alpha: 0.9),
                      size: r.icon(16),
                    ),
                  ),
                  SizedBox(width: r.sp(10)),
                  Text(
                    'Survey Session',
                    style: TextStyle(
                      fontSize: r.f(10, min: 10, max: 14),
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withValues(alpha: 0.75),
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),

              SizedBox(height: r.hp(8)),

              // ── 2. Crop name + CCE count in one row ────────────────
              Obx(() {
                final count = controller.cceCount.value;
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Crop name — takes all remaining space
                    Expanded(
                      child: Text(
                        controller.selectedCrop.value ?? 'Unknown Crop',
                        style: TextStyle(
                          fontSize: r.pick(
                            smallPhone: 17,
                            phone: r.cardTitleFont + 2,
                            tablet: r.cardTitleFont + 4,
                            largeTablet: r.cardTitleFont + 5,
                          ),
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.4,
                          height: 1.15,
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),

                    // CCE count badge — only visible once data loaded
                    if (count >= 0) ...[
                      SizedBox(width: r.sp(10)),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: r.sp(10),
                          vertical: r.hp(5),
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(r.radius(8)),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.28),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.content_cut_rounded,
                              size: r.icon(12),
                              color: Colors.white.withValues(alpha: 0.85),
                            ),
                            SizedBox(width: r.sp(5)),
                            Text(
                              'CCE  $count',
                              style: TextStyle(
                                fontSize: r.f(11, min: 11, max: 14),
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                );
              }),

              SizedBox(height: r.hp(10)),

              // ── 3. Thin gradient divider ───────────────────────────
              Container(
                height: 1,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Colors.white.withValues(alpha: 0.0),
                      Colors.white.withValues(alpha: 0.25),
                      Colors.white.withValues(alpha: 0.0),
                    ],
                  ),
                ),
              ),

              SizedBox(height: r.hp(10)),

              // ── 4. Metadata chips ──────────────────────────────────
              Obx(() {
                final showSeason = controller.requiresSeasonSelection();
                return Wrap(
                  spacing: r.sp(8),
                  runSpacing: r.hp(8),
                  children: [
                    _contextChip(
                      icon: Icons.calendar_today_outlined,
                      label: 'Year',
                      value: controller.selectedYear.value ?? 'N/A',
                      r: r,
                    ),
                    if (showSeason)
                      _contextChip(
                        icon: Icons.wb_sunny_outlined,
                        label: 'Season',
                        value: controller.selectedSeason.value ?? 'N/A',
                        r: r,
                      ),
                    // _contextChip(
                    //   icon: Icons.place_outlined,
                    //   label: 'Panchayath',
                    //   value: controller.selectedPan.value ?? 'N/A',
                    //   r: r,
                    // ),
                  ],
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  /// Pill chip — context only, not tappable.
  Widget _contextChip({
    required IconData icon,
    required String label,
    required String value,
    required AppResponsive r,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: r.sp(10), vertical: r.hp(6)),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.25),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: r.icon(13),
            color: Colors.white.withValues(alpha: 0.8),
          ),
          SizedBox(width: r.sp(5)),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: r.f(9, min: 9, max: 13),
              fontWeight: FontWeight.w500,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: r.sp(110)),
            child: Text(
              value,
              style: TextStyle(
                fontSize: r.f(10, min: 10, max: 14),
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // SECTION DIVIDER
  // ════════════════════════════════════════════════════════════════════

  Widget _buildSectionDivider(AppResponsive r) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: EdgeInsets.fromLTRB(r.pagePadH, r.hp(20), r.pagePadH, 0),
        child: Row(
          children: [
            Container(
              width: 4,
              height: r.f(14, min: 14, max: 22),
              decoration: BoxDecoration(
                color: const Color(0xFF2D5F3F),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            SizedBox(width: r.sp(10)),
            Text(
              'Available Plots',
              style: TextStyle(
                fontSize: r.pick(
                  smallPhone: 14,
                  phone: r.cardTitleFont,
                  tablet: r.cardTitleFont + 1,
                  largeTablet: r.cardTitleFont + 2,
                ),
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A1A),
                letterSpacing: -0.2,
              ),
            ),
            SizedBox(width: r.sp(8)),
            Obx(
                  () => Container(
                padding: EdgeInsets.symmetric(
                  horizontal: r.sp(8),
                  vertical: r.hp(3),
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF2D5F3F).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${controller.surveyCards.length}',
                  style: TextStyle(
                    fontSize: r.f(10, min: 10, max: 13),
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF2D5F3F),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
  Widget _buildPlotCard(
      BuildContext context,
      Map<String, String> data,
      int index,
      AppResponsive r,
      ) {
    final sourceType = data['cceSourceType']?.toLowerCase() ?? 'field';
    final isWet = sourceType == 'wet';
    final localbody = data['localbody'] ?? '';
    return TweenAnimationBuilder<double>(
      duration: Duration(milliseconds: 400 + (index * 80)),
      tween: Tween(begin: 0.0, end: 1.0),
      curve: Curves.easeOutCubic,
      builder:
          (context, value, child) => Transform.scale(
        scale: 0.95 + (0.05 * value),
        child: Opacity(opacity: value, child: child),
      ),
      child: Container(
        margin: EdgeInsets.only(bottom: r.hp(12)),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(r.cardRadius),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              if (data['cropId'] == null || data['cropId']!.isEmpty) {
                SnackbarHelper.showError(
                  'Error',
                  'Crop ID is missing. Please go back and select crop again.',
                );
                return;
              }
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => SectionNavigationPage(
                    surveyData: data,
                    form5controller: controller,
                  ),
                ),
              );
            },
            borderRadius: BorderRadius.circular(r.cardRadius),
            child: Padding(
              padding: EdgeInsets.all(r.cardPad),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Header: Survey No. + source badge ──────────────
                  Row(
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            Container(
                              padding: EdgeInsets.all(r.icon(10)),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    const Color(
                                      0xFF2D5F3F,
                                    ).withValues(alpha: 0.15),
                                    const Color(
                                      0xFF3D7F5F,
                                    ).withValues(alpha: 0.08),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(
                                  r.radius(12),
                                ),
                              ),
                              child: Icon(
                                Icons.location_on_outlined,
                                color: const Color(0xFF2D5F3F),
                                size: r.icon(20),
                              ),
                            ),
                            SizedBox(width: r.sp(12)),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Survey No.',
                                    style: TextStyle(
                                      // ← reduced: was fieldLabelFont-1
                                      fontSize: r.f(9, min: 9, max: 11),
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF666666),
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    data['surveyNo'] ?? 'N/A',
                                    style: TextStyle(
                                      // ← reduced: was fieldValueFont+4/6
                                      fontSize: r.pick(
                                        smallPhone: 15,
                                        phone: r.fieldValueFont + 1,
                                        tablet: r.fieldValueFont + 2,
                                      ),
                                      fontWeight: FontWeight.w700,
                                      color: const Color(0xFF1A1A1A),
                                      letterSpacing: -0.3,
                                      height: 1.2,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // WET / DRY badge
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: r.sp(10),
                          vertical: r.hp(6),
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors:
                            isWet
                                ? [
                              const Color(0xFF3B82F6),
                              const Color(0xFF60A5FA),
                            ]
                                : [
                              const Color(0xFFF59E0B),
                              const Color(0xFFFBBF24),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: (isWet
                                  ? const Color(0xFF3B82F6)
                                  : const Color(0xFFF59E0B))
                                  .withValues(alpha: 0.25),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isWet ? Icons.water_drop : Icons.wb_sunny,
                              color: Colors.white,
                              size: r.icon(14),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              sourceType.toUpperCase(),
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: r.f(9, min: 9, max: 13),
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  // ── Panchayath (localbody) chip — under header ──────
                  if (localbody.isNotEmpty) ...[
                    SizedBox(height: r.hp(8)),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: r.sp(10),
                        vertical: r.hp(5),
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D5F3F).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: const Color(0xFF2D5F3F).withValues(alpha: 0.14),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.place_outlined,
                            size: r.icon(12),
                            color: const Color(0xFF2D5F3F),
                          ),
                          SizedBox(width: r.sp(5)),
                          Text(
                            'Panchayath: ',
                            style: TextStyle(
                              fontSize: r.f(9, min: 9, max: 12),
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF666666),
                            ),
                          ),
                          Flexible(
                            child: Text(
                              localbody,
                              style: TextStyle(
                                fontSize: r.f(10, min: 10, max: 13),
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1A1A1A),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  SizedBox(height: r.hp(12)),
// ── Detail rows ─────────────────────────────────────
                  Container(
                    padding: EdgeInsets.all(r.cardPad * 0.85),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAF9),
                      borderRadius: BorderRadius.circular(r.radius(12)),
                      border: Border.all(
                        color: const Color(0xFF2D5F3F).withValues(alpha: 0.08),
                        width: 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        // ── Cultivated Area ──
                        Expanded(
                          child: _buildDetailRow(
                            icon: Icons.square_foot_outlined,
                            label: 'Cultivated Area',
                            value: '${data['area'] ?? '0.0'} cents',
                            r: r,
                          ),
                        ),

                        // ── Vertical divider ──
                        Container(
                          width: 1,
                          height: r.hp(36),
                          margin: EdgeInsets.symmetric(horizontal: r.sp(10)),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.grey.withValues(alpha: 0.2),
                                Colors.transparent,
                              ],
                            ),
                          ),
                        ),

                        // ── Cluster No ──
                        Expanded(
                          child: _buildDetailRow(
                            icon: Icons.hub_outlined,
                            label: 'Cluster No',
                            value: data['clutserno'] ?? 'N/A',
                            r: r,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // DETAIL ROW  — label + value, reduced font sizes
  // ════════════════════════════════════════════════════════════════════

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
    required AppResponsive r,
  }) {
    return Row(
      children: [
        Container(
          padding: EdgeInsets.all(r.icon(7)),
          decoration: BoxDecoration(
            color: const Color(0xFF2D5F3F).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(r.radius(8)),
          ),
          child: Icon(
            icon,
            // ← reduced icon from icon(16) → icon(14)
            size: r.icon(14),
            color: const Color(0xFF2D5F3F),
          ),
        ),
        SizedBox(width: r.sp(10)),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  // ← reduced: was fieldLabelFont-1, now f(8)
                  fontSize: r.f(8, min: 8, max: 11),
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF666666),
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  // ← reduced: was fieldValueFont-1, now f(11)
                  fontSize: r.f(11, min: 11, max: 14),
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF1A1A1A),
                  letterSpacing: -0.1,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ════════════════════════════════════════════════════════════════════

  Widget _buildEmptyState(AppResponsive r) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(r.pagePadH * 2),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(r.icon(40)),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF2D5F3F).withValues(alpha: 0.1),
                    const Color(0xFF3D7F5F).withValues(alpha: 0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.search_off_outlined,
                size: r.icon(60),
                color: const Color(0xFF2D5F3F).withValues(alpha: 0.6),
              ),
            ),
            SizedBox(height: r.hp(24)),
            Text(
              'No Plots Found',
              style: TextStyle(
                fontSize: r.pick(
                  smallPhone: 18,
                  phone: r.cardTitleFont + 2,
                  tablet: r.cardTitleFont + 4,
                ),
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A1A),
                letterSpacing: -0.5,
              ),
            ),
            SizedBox(height: r.hp(8)),
            Text(
              'No survey plots available for\nthe selected criteria',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: r.fieldLabelFont,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF666666),
                height: 1.5,
              ),
            ),
            SizedBox(height: r.hp(32)),
            ElevatedButton(
              onPressed: () => Get.back(),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2D5F3F),
                foregroundColor: Colors.white,
                minimumSize: Size(0, r.buttonHeight(48)),
                padding: EdgeInsets.symmetric(horizontal: r.sp(28)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(r.radius(14)),
                ),
                elevation: 0,
                shadowColor: Colors.transparent,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.arrow_back, size: r.icon(20)),
                  SizedBox(width: r.sp(8)),
                  Text(
                    'Go Back',
                    style: TextStyle(
                      fontSize: r.saveBtnFont,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}