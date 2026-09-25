import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../resources/constants/screen_responsive.dart';
import '../../../widget/app_bar.dart';
import '../../../widget/bottom_navigation_bar.dart';

class CceDashboard extends StatelessWidget {
  const CceDashboard({super.key});
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
            showAgriYearSelector: true,
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
            SizedBox(height: r.hp(25)),             // ← replaces sh * 0.03
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: r.sp(12),               // ← replaces sw * 0.03
              ),
              child: _CceFeatureCard(r: r),
            ),
            SizedBox(height: r.hp(25)),
            _AboutCceSection(r: r),
            SizedBox(height: r.hp(25)),
          ],
        ),
      ),
      bottomNavigationBar: const ResponsiveBottomNavBar(),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// About CCE Section
// ─────────────────────────────────────────────────────────────────────────────

class _AboutCceSection extends StatelessWidget {
  const _AboutCceSection({required this.r});
  final AppResponsive r;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: r.sp(16)), // ← replaces sw * 0.04
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ABOUT CCE',
            style: TextStyle(
              fontSize: r.f(11, min: 10, max: 14),  // ← replaces sw * 0.028
              fontWeight: FontWeight.w700,
              color: Colors.grey.shade500,
              letterSpacing: 2.4,
            ),
          ),
          SizedBox(height: r.hp(13)),               // ← replaces sh * 0.015
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0d1b4b), Color(0xFF1e4380)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(r.radius(20)), // ← replaces sw * 0.055
              boxShadow: const [
                BoxShadow(
                  color: Color(0x380d1b4b),
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Decorative top-right circle
                Positioned(
                  right: -r.sp(27),                 // ← replaces -sw * 0.07
                  top: -r.sp(27),
                  child: Container(
                    width: r.sp(117),               // ← replaces sw * 0.30
                    height: r.sp(117),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.06),
                        width: r.sp(29),            // ← replaces sw * 0.075
                      ),
                    ),
                  ),
                ),
                // Decorative bottom-right blob
                Positioned(
                  right: r.sp(20),                  // ← replaces sw * 0.05
                  bottom: -r.sp(18),                // ← replaces -sw * 0.045
                  child: Container(
                    width: r.sp(78),                // ← replaces sw * 0.20
                    height: r.sp(78),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFee2a7b).withValues(alpha: 0.10),
                    ),
                  ),
                ),
                Padding(
                  padding: r.padAll(r.sp(21)),      // ← replaces sw * 0.055
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: r.padAll(r.sp(10)), // ← replaces sw * 0.025
                            decoration: BoxDecoration(
                              color: const Color(0xFFee2a7b).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(r.radius(12)), // ← replaces sw * 0.03
                              border: Border.all(
                                color: const Color(0xFFee2a7b).withValues(alpha: 0.3),
                              ),
                            ),
                            child: Icon(
                              Icons.eco_outlined,
                              color: const Color(0xFFf77db8),
                              size: r.icon(22),     // ← replaces sw * 0.055
                            ),
                          ),
                          SizedBox(width: r.sp(12)), // ← replaces sw * 0.03
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Crop Cutting Experiments',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: r.f(16, min: 13, max: 20), // ← replaces sw * 0.042
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                SizedBox(height: r.hp(3)), // ← replaces sh * 0.004
                                Text(
                                  'Scientific yield estimation methodology',
                                  style: TextStyle(
                                    color: const Color(0xFF8eacd4),
                                    fontSize: r.f(12, min: 10, max: 15), // ← replaces sw * 0.029
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: r.hp(17)),   // ← replaces sh * 0.02
                      Text(
                        'Crop Cutting Experiments (CCE) are a scientifically standardized method used by agricultural agencies to estimate crop yields across various regions and seasons. Conducted at randomly selected plots, CCEs provide precise, field-level data that forms the backbone of national crop production statistics.',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.80),
                          fontSize: r.f(13, min: 11, max: 16), // ← replaces sw * 0.033
                          height: 1.65,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                      SizedBox(height: r.hp(19)),   // ← replaces sh * 0.022
                      // Highlight badges row
                      Row(
                        children: [
                          _AboutHighlight(
                            icon: Icons.gps_fixed_outlined,
                            label: 'GPS-tagged\nPlots',
                            color: const Color(0xFF69f0ae),
                            r: r,
                          ),
                          SizedBox(width: r.sp(12)),
                          _AboutHighlight(
                            icon: Icons.verified_outlined,
                            label: 'Verified\nData',
                            color: const Color(0xFF4fc3f7),
                            r: r,
                          ),
                          SizedBox(width: r.sp(12)),
                          _AboutHighlight(
                            icon: Icons.bar_chart_rounded,
                            label: 'Instant\nReports',
                            color: const Color(0xFFf77db8),
                            r: r,
                          ),
                          SizedBox(width: r.sp(12)),
                          _AboutHighlight(
                            icon: Icons.cloud_sync_outlined,
                            label: 'Real-time\nSync',
                            color: const Color(0xFFffd54f),
                            r: r,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// About Highlight Badge
// ─────────────────────────────────────────────────────────────────────────────

class _AboutHighlight extends StatelessWidget {
  const _AboutHighlight({
    required this.icon,
    required this.label,
    required this.color,
    required this.r,
  });

  final IconData icon;
  final String label;
  final Color color;
  final AppResponsive r; // ← replaces iconSize + fontSize + responsive triple params

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(
          vertical: r.hp(11),                       // ← replaces sh * 0.013
          horizontal: r.sp(6),                      // ← replaces sw * 0.015
        ),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(r.radius(12)), // ← replaces sw * 0.03
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: r.icon(20)), // ← replaces sw * 0.05
            SizedBox(height: r.hp(5)),               // ← replaces sh * 0.006
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.80),
                fontSize: r.f(10, min: 9, max: 13),  // ← replaces sw * 0.025
                fontWeight: FontWeight.w600,
                height: 1.35,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CCE Feature Card
// ─────────────────────────────────────────────────────────────────────────────

class _CceFeatureCard extends StatelessWidget {
  const _CceFeatureCard({required this.r});
  final AppResponsive r; // ← replaces responsive param

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Get.toNamed('/gcesSDashboard'),
      child: Container(
        width: double.infinity,
        padding: r.padAll(r.sp(21)),                // ← replaces sw * 0.055
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(r.radius(20)), // ← replaces sw * 0.055
          boxShadow: const [
            BoxShadow(
              color: Color(0x551B5E20),
              blurRadius: 18,
              offset: Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            // ── Icon box ────────────────────────────────────────────────────
            Container(
              width: r.sp(62),                      // ← replaces sw * 0.16
              height: r.sp(62),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(r.radius(16)), // ← replaces sw * 0.04
                border: Border.all(color: Colors.white30),
              ),
              child: Center(
                child: Icon(
                  Icons.grass_outlined,
                  color: Colors.white,
                  size: r.icon(32),                 // ← replaces sw * 0.08
                ),
              ),
            ),
            SizedBox(width: r.sp(18)),              // ← replaces sw * 0.045

            // ── Text content ────────────────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: r.sp(8),          // ← replaces sw * 0.02
                      vertical: r.hp(3),            // ← replaces sh * 0.004
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(r.radius(10)), // ← replaces sw * 0.025
                    ),
                    child: Text(
                      'GCES MODULE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: r.f(10, min: 9, max: 13), // ← replaces sw * 0.024
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.4,
                      ),
                    ),
                  ),
                  SizedBox(height: r.hp(8)),        // ← replaces sh * 0.009
                  Text(
                    'CCE Survey',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: r.f(20, min: 16, max: 26), // ← replaces sw * 0.055
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.3,
                      height: 1.1,
                    ),
                  ),
                  SizedBox(height: r.hp(4)),        // ← replaces sh * 0.005
                  Text(
                    'Manage crop cutting experiments\nand field data collection',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: r.f(12, min: 10, max: 15), // ← replaces sw * 0.03
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            // ── Arrow button ────────────────────────────────────────────────
            Container(
              width: r.sp(37),                      // ← replaces sw * 0.095
              height: r.sp(37),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.arrow_forward_rounded,
                color: Colors.white,
                size: r.icon(18),                   // ← replaces sw * 0.045
              ),
            ),
          ],
        ),
      ),
    );
  }
}