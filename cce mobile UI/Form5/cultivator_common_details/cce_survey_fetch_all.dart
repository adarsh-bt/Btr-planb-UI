import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../../controller/cce_survey_fetch.dart';
class SurveySelectionWidget extends StatelessWidget {
  final bool isSmallScreen;
  final SurveyDetailsController controller;
  final Color primaryGreen;
  final Color surfaceColor;
  final Color textPrimary;
  final Color textSecondary;

  const SurveySelectionWidget({
    super.key,
    required this.isSmallScreen,
    required this.controller,
    this.primaryGreen = const Color(0xFF2D5F3F),
    this.surfaceColor = const Color(0xFFF8FAF9),
    this.textPrimary = const Color(0xFF1A1A1A),
    this.textSecondary = const Color(0xFF666666),
  });

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      // Loading state
      if (controller.isLoading.value) {
        return _buildLoadingState();
      }

      // Error state
      if (controller.hasError.value) {
        return _buildErrorState();
      }

      // Empty state
      if (controller.availableSurveys.isEmpty) {
        return _buildEmptyState();
      }

      // Success state with surveys
      return _buildSurveyList();
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
            'Loading surveys...',
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

  /// Error state
  Widget _buildErrorState() {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.red.shade200,
          width: 1.5,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.error_outline,
            color: Colors.red.shade700,
            size: isSmallScreen ? 32 : 40,
          ),
          SizedBox(height: isSmallScreen ? 12 : 16),
          Text(
            'Failed to load surveys',
            style: TextStyle(
              fontSize: isSmallScreen ? 14 : 15,
              fontWeight: FontWeight.w600,
              color: Colors.red.shade900,
            ),
          ),
          SizedBox(height: isSmallScreen ? 6 : 8),
          Text(
            controller.errorMessage.value,
            style: TextStyle(
              fontSize: isSmallScreen ? 12 : 13,
              color: Colors.red.shade700,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: isSmallScreen ? 12 : 16),
          ElevatedButton.icon(
            onPressed: () => controller.retry(),
            icon: const Icon(Icons.refresh, size: 18),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                horizontal: isSmallScreen ? 16 : 20,
                vertical: isSmallScreen ? 10 : 12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
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
            Icons.inbox_outlined,
            color: Colors.grey.shade400,
            size: isSmallScreen ? 40 : 48,
          ),
          SizedBox(height: isSmallScreen ? 12 : 16),
          Text(
            'No surveys available',
            style: TextStyle(
              fontSize: isSmallScreen ? 14 : 15,
              fontWeight: FontWeight.w600,
              color: textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  /// Survey list with multi-select
  Widget _buildSurveyList() {
    final filteredSurveys = controller.availableSurveys
        .where((s) {
      final code = int.tryParse(s.surveyCodeDes.toString().trim());
      return code != 2 && code != 3;
    })
        .toList();

    // ── Auto-select General Crop Estimation if nothing selected yet ──
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (controller.selectedSurveys.isEmpty) {
        final defaultSurvey = filteredSurveys.firstWhereOrNull(
              (s) => s.surveyName.toLowerCase().contains('general crop estimation'),
        );
        if (defaultSurvey != null && !controller.isSurveySelected(defaultSurvey)) {
          controller.toggleSurvey(defaultSurvey);
        }
      }
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: isSmallScreen ? 12 : 16),
        ...filteredSurveys.map((survey) => Padding(
          padding: EdgeInsets.only(bottom: isSmallScreen ? 8 : 10),
          child: _buildSurveyItem(survey),
        )),
        if (controller.selectedSurveys.isNotEmpty) ...[
          SizedBox(height: isSmallScreen ? 12 : 16),
          _buildSelectionSummary(),
        ],
      ],
    );
  }
  /// Individual survey item
  Widget _buildSurveyItem(SurveyDetail survey) {
    return Obx(() {
      final isSelected = controller.isSurveySelected(survey);

      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => controller.toggleSurvey(survey),
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
                      ? Icon(
                    Icons.check,
                    color: Colors.white,
                    size: isSmallScreen ? 14 : 16,
                  )
                      : null,
                ),

                SizedBox(width: isSmallScreen ? 12 : 14),

                // Survey info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        survey.surveyName,
                        style: TextStyle(
                          fontSize: isSmallScreen ? 13 : 14,
                          fontWeight: FontWeight.w600,
                          color: textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: primaryGreen.withValues(alpha:0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              survey.surveyAbbreviation,
                              style: TextStyle(
                                fontSize: isSmallScreen ? 10 : 11,
                                fontWeight: FontWeight.w600,
                                color: primaryGreen,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Code: ${survey.surveyCodeDes}',
                            style: TextStyle(
                              fontSize: isSmallScreen ? 11 : 12,
                              color: textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Selection indicator
                if (isSelected)
                  Icon(
                    Icons.check_circle,
                    color: primaryGreen,
                    size: isSmallScreen ? 20 : 22,
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
              '${controller.selectedSurveys.length} ${controller.selectedSurveys.length == 1 ? 'survey' : 'surveys'} selected',
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