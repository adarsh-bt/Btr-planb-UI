import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controller/cluster.dart';
import '../../../resources/constants/screen_responsive.dart';
import '../../../widget/app_bar.dart';
import '../../../widget/bottom_navigation_bar.dart';
import '../out_of_cluster/out_cluster_records_ui.dart';

class GCESDashboard extends StatelessWidget {
  const GCESDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final r = AppResponsive(context); // ← single responsive instance

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(r.appBarHeight), // ← replaces sh * 0.07
        child: Builder(
          builder: (context) => CustomAppBar(
            onMenuTap: () => Scaffold.of(context).openDrawer(),
            hideLeading: true,
            title: Padding(
              padding: EdgeInsets.only(top: r.hp(21)), // ← replaces sh * 0.025
              child: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'GCES',
                      style: TextStyle(
                        fontSize: r.appBarTitleFont, // ← replaces sw * 0.045
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: r.hp(14)),             // ← replaces sh * 0.016

            // ── Section Label ─────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.symmetric(horizontal: r.pagePadH), // ← replaces sw * 0.04
              child: Text(
                'MODULES',
                style: TextStyle(
                  fontSize: r.f(11, min: 10, max: 14), // ← replaces sw * 0.028
                  fontWeight: FontWeight.w700,
                  color: Colors.grey.shade500,
                  letterSpacing: 2.4,
                ),
              ),
            ),

            SizedBox(height: r.hp(14)),

            // ── Module Cards ──────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.symmetric(horizontal: r.pagePadH),
              child: Column(
                children: [
                  _GcesModuleCard(
                    r: r,
                    title: 'GCES Form V',
                    subtitle: 'Official crop survey data entry form',
                    icon: Icons.description_outlined,
                    gradientColors: const [Color(0xFF1a3a6e), Color(0xFF1565C0)],
                    shadowColor: const Color(0x401a3a6e),
                    badgeLabel: 'FORM V',
                    badgeColor: const Color(0xFF4fc3f7),
                    imagePath: 'assets/icons/business-report.png',
                    onTap: () => Get.toNamed('/form5'),
                  ),
                  SizedBox(height: r.hp(15)),       // ← replaces sh * 0.018
                  _GcesModuleCard(
                    r: r,
                    title: 'Out of Cluster List',
                    subtitle: 'Manage non-cluster survey entries',
                    icon: Icons.format_list_bulleted_outlined,
                    gradientColors: const [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                    shadowColor: const Color(0x401B5E20),
                    badgeLabel: 'OUT-LIST',
                    badgeColor: const Color(0xFF69f0ae),
                    imagePath: 'assets/icons/wheat.png',
                    onTap: () {
                      Get.to(() => const LandRecordEntryPage());
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const ResponsiveBottomNavBar(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Card — full-width rich card per module
// ─────────────────────────────────────────────────────────────────────────────

class _GcesModuleCard extends StatelessWidget {
  const _GcesModuleCard({
    required this.r,           // ← replaces responsive param
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.gradientColors,
    required this.shadowColor,
    required this.badgeLabel,
    required this.badgeColor,
    required this.onTap,
    this.imagePath,
  });

  final AppResponsive r;       // ← replaces ResponsiveHelper
  final String title;
  final String subtitle;
  final IconData icon;
  final List<Color> gradientColors;
  final Color shadowColor;
  final String badgeLabel;
  final Color badgeColor;
  final VoidCallback onTap;
  final String? imagePath;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(r.radius(20)), // ← replaces sw * 0.055
          boxShadow: [
            BoxShadow(
              color: shadowColor,
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            // ── Decorative corner circle (large) ──────────────────────────
            Positioned(
              right: -r.sp(23),                     // ← replaces -sw * 0.06
              bottom: -r.sp(23),
              child: Container(
                width: r.sp(140),                   // ← replaces sw * 0.36
                height: r.sp(140),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.05),
                ),
              ),
            ),
            // ── Decorative small circle (top-right) ───────────────────────
            Positioned(
              right: r.sp(31),                      // ← replaces sw * 0.08
              top: -r.sp(16),                       // ← replaces -sw * 0.04
              child: Container(
                width: r.sp(70),                    // ← replaces sw * 0.18
                height: r.sp(70),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.04),
                ),
              ),
            ),

            // ── Card content ──────────────────────────────────────────────
            Padding(
              padding: r.padAll(r.sp(21)),          // ← replaces sw * 0.055
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top row: icon box + badge + arrow
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icon box
                      Container(
                        width: r.sp(55),            // ← replaces sw * 0.14
                        height: r.sp(55),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(r.radius(14)), // ← replaces sw * 0.035
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Center(
                          child: Icon(
                            icon,
                            color: Colors.white,
                            size: r.icon(26),       // ← replaces sw * 0.065
                          ),
                        ),
                      ),
                      SizedBox(width: r.sp(14)),    // ← replaces sw * 0.035

                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Badge
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: r.sp(9), // ← replaces sw * 0.022
                                vertical: r.hp(3),   // ← replaces sh * 0.004
                              ),
                              decoration: BoxDecoration(
                                color: badgeColor.withValues(alpha: 0.22),
                                borderRadius:
                                BorderRadius.circular(r.radius(12)), // ← replaces sw * 0.03
                                border: Border.all(
                                    color: badgeColor.withValues(alpha: 0.4)),
                              ),
                              child: Text(
                                badgeLabel,
                                style: TextStyle(
                                  color: badgeColor,
                                  fontSize: r.f(10, min: 9, max: 13), // ← replaces sw * 0.024
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                            SizedBox(height: r.hp(5)), // ← replaces sh * 0.006
                            Text(
                              subtitle,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.60),
                                fontSize: r.f(11, min: 10, max: 14), // ← replaces sw * 0.028
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Arrow button
                      Container(
                        width: r.sp(35),            // ← replaces sw * 0.09
                        height: r.sp(35),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.arrow_forward_rounded,
                          color: Colors.white,
                          size: r.icon(17),         // ← replaces sw * 0.042
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: r.hp(14)),       // ← replaces sh * 0.016

                  // Title
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: r.f(20, min: 16, max: 26), // ← replaces sw * 0.055
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      height: 1.1,
                    ),
                  ),

                  SizedBox(height: r.hp(15)),       // ← replaces sh * 0.018

                  // Divider
                  Container(
                    height: 1,
                    color: Colors.white.withValues(alpha: 0.12),
                  ),

                  SizedBox(height: r.hp(12)),       // ← replaces sh * 0.014

                  // Footer row
                  Row(
                    children: [
                      Icon(
                        Icons.touch_app_outlined,
                        color: Colors.white.withValues(alpha: 0.55),
                        size: r.icon(14),           // ← replaces sw * 0.036
                      ),
                      SizedBox(width: r.sp(7)),     // ← replaces sw * 0.018
                      Text(
                        'Tap to open module',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.55),
                          fontSize: r.f(11, min: 10, max: 14), // ← replaces sw * 0.028
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: r.sp(10),     // ← replaces sw * 0.025
                          vertical: r.hp(4),        // ← replaces sh * 0.005
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius:
                          BorderRadius.circular(r.radius(16)), // ← replaces sw * 0.04
                        ),
                        child: Text(
                          'GCES',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.70),
                            fontSize: r.f(10, min: 9, max: 13), // ← replaces sw * 0.024
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),
                    ],
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