import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../controller/cce/cce_data_entry/cultivation_details.dart';
import '../../../../../controller/irrigation_details_save.dart';

class IrrigationSourcesWidget extends StatelessWidget {
  final CultivationDetailsController controller;
  final bool isSmallScreen;
  final Color accentOrange;
  final Color primaryGreen;
  final Color surfaceColor;
  final Color textPrimary;
  final Color textSecondary;

  const IrrigationSourcesWidget({
    super.key,
    required this.controller,
    required this.isSmallScreen,
    this.accentOrange = const Color(0xFFF59E0B),
    this.primaryGreen = const Color(0xFF2D5F3F),
    this.surfaceColor = const Color(0xFFF8FAF9),
    this.textPrimary = const Color(0xFF1A1A1A),
    this.textSecondary = const Color(0xFF666666),
  });

  @override
  Widget build(BuildContext context) {
    final irrigationController = Get.find<IrrigationDetailsSave>();

    return Obx(() {
      final isLoading = irrigationController.isLoading.value;
      final sources = irrigationController.iriSources
          .map((source) => source.irrigationType)
          .toList();

      // Loading state
      if (isLoading && sources.isEmpty) {
        return _buildLoadingState();
      }

      // Empty state
      if (sources.isEmpty) {
        return _buildEmptyState();
      }

      // Success state with sources
      return _buildSourcesList(sources);
    });
  }

  /// Loading state
  Widget _buildLoadingState() {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 20 : 24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1.5,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: isSmallScreen ? 32 : 40,
            height: isSmallScreen ? 32 : 40,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(primaryGreen),
            ),
          ),
          SizedBox(height: isSmallScreen ? 12 : 16),
          Text(
            'Loading irrigation sources...',
            style: TextStyle(
              fontSize: isSmallScreen ? 13 : 14,
              color: textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  /// Empty state
  Widget _buildEmptyState() {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 20 : 24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey.shade200,
          width: 1.5,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.water_drop_outlined,
            color: Colors.grey.shade400,
            size: isSmallScreen ? 40 : 48,
          ),
          SizedBox(height: isSmallScreen ? 12 : 16),
          Text(
            'No irrigation sources available',
            style: TextStyle(
              fontSize: isSmallScreen ? 14 : 15,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
          SizedBox(height: isSmallScreen ? 6 : 8),
          Text(
            'Please check your connection or try again later',
            style: TextStyle(
              fontSize: isSmallScreen ? 12 : 13,
              color: Colors.grey.shade500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  /// Sources list with multi-select
  Widget _buildSourcesList(List<String> sources) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Source items
        ...sources.map((source) => Padding(
          padding: EdgeInsets.only(bottom: isSmallScreen ? 8 : 10),
          child: _buildSourceItem(source),
        )),

        // Selection summary
        Obx(() {
          if (controller.irrigationSource.isNotEmpty) {
            return Column(
              children: [
                SizedBox(height: isSmallScreen ? 12 : 16),
                _buildSelectionSummary(),
              ],
            );
          }
          return const SizedBox.shrink();
        }),
      ],
    );
  }
  /// Individual source item
  Widget _buildSourceItem(String source) {
    return Obx(() {
      final isSelected = controller.irrigationSource.contains(source);

      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => controller.toggleIrrigationSource(source),
          borderRadius: BorderRadius.circular(12),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: EdgeInsets.all(isSmallScreen ? 12 : 14),
            decoration: BoxDecoration(
              color: isSelected
                  ? primaryGreen.withValues(alpha:0.08)
                  : surfaceColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? primaryGreen.withValues(alpha:0.5)
                    : Colors.grey.shade200,
                width: isSelected ? 2 : 1.5,
              ),
            ),
            child: Row(
              children: [
                // Checkbox
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: isSmallScreen ? 20 : 22,
                  height: isSmallScreen ? 20 : 22,
                  decoration: BoxDecoration(
                    color: isSelected ? primaryGreen : Colors.transparent,
                    border: Border.all(
                      color: isSelected ? primaryGreen : Colors.grey.shade400,
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: isSelected
                      ? Icon(Icons.check, color: Colors.white, size: isSmallScreen ? 14 : 16)
                      : null,
                ),
                SizedBox(width: isSmallScreen ? 12 : 14),
                Expanded(
                  child: Text(
                    source,
                    style: TextStyle(
                      fontSize: isSmallScreen ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color: textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }

  /// Selection summary
  Widget _buildSelectionSummary() {
    return Obx(() => Container(
      padding: EdgeInsets.all(isSmallScreen ? 12 : 14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            primaryGreen.withValues(alpha:0.1),
            primaryGreen.withValues(alpha:0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: primaryGreen.withValues(alpha:0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.check_circle_outline,
            color: primaryGreen,
            size: isSmallScreen ? 18 : 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '${controller.irrigationSource.length} ${controller.irrigationSource.length == 1 ? 'source' : 'sources'} selected',
              style: TextStyle(
                fontSize: isSmallScreen ? 12 : 13,
                fontWeight: FontWeight.w600,
                color: primaryGreen,
              ),
            ),
          ),
        ],
      ),
    ));
  }


}