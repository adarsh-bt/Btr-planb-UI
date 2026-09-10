import 'package:aidea/view/screens/cce/Form5/frame_selection/sqm_frame_slection.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../../../controller/cce/cce_data_entry/cce_frame_selection.dart';
import '../../../../../controller/cce/cce_data_entry/form5_detail_controller.dart';
import '../../../../../controller/cce/cce_data_entry/form5.dart';
import '../../../../../model/cce/cce_mock_models.dart';
import '../../../../../resources/utils/snackbar_helper.dart';
import 'cce_frame_service.dart';
import 'cce_per_tree_plant.dart';

class FrameSelectionField extends StatelessWidget {
  final Map<String, String> surveyData;
  final CCEPlot plot;
  final Form5Controller controller;
  static const primaryBlue   = Color(0xFF3B82F6);
  static const secondaryBlue = Color(0xFF60A5FA);
  static const lightBlue     = Color(0xFFDBEAFE);
  static const surfaceColor  = Color(0xFFF8FAF9);
  static const cardColor     = Colors.white;
  static const textPrimary   = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF666666);
  static const secondaryGreen = Color(0xFF1B5E20);
  static const primaryGreen  = Color(0xFF2D5F3F);
  static const accentBlue     = Color(0xFF3B82F6);
  static const accentOrange   = Color(0xFFF59E0B);
  static const accentRed      = Color(0xFFE53935);

  const FrameSelectionField({super.key, required this.surveyData,required this.plot,required this.controller,});

  Map<String, dynamic> _getResponsiveSizes(BuildContext context) {
    final width         = MediaQuery.of(context).size.width;
    final isExtraSmall  = width < 360;
    final isSmallMobile = width >= 360 && width < 600;
    final isTablet      = width >= 600 && width < 840;
    return {
      'isExtraSmall':      isExtraSmall,
      'isSmallMobile':     isSmallMobile,
      'isTablet':          isTablet,
      'isLargeTablet':     width >= 840,
      'horizontalPadding': isExtraSmall ? 12.0 : (isSmallMobile ? 16.0 : (isTablet ? 24.0 : 32.0)),
      'verticalPadding':   isExtraSmall ? 10.0 : (isSmallMobile ? 12.0 : (isTablet ? 16.0 : 20.0)),
      'cardPadding':       isExtraSmall ? 14.0 : (isSmallMobile ? 16.0 : (isTablet ? 20.0 : 24.0)),
      'titleSize':         isExtraSmall ? 18.0 : (isSmallMobile ? 20.0 : (isTablet ? 24.0 : 28.0)),
      'subtitleSize':      isExtraSmall ? 14.0 : (isSmallMobile ? 16.0 : (isTablet ? 18.0 : 20.0)),
      'bodySize':          isExtraSmall ? 12.0 : (isSmallMobile ? 13.0 : (isTablet ? 14.0 : 16.0)),
      'smallSize':         isExtraSmall ? 10.0 : (isSmallMobile ? 11.0 : (isTablet ? 12.0 : 13.0)),
      'iconSize':          isExtraSmall ? 20.0 : (isSmallMobile ? 24.0 : (isTablet ? 28.0 : 32.0)),
      'borderRadius':      isExtraSmall ? 16.0 : (isSmallMobile ? 18.0 : (isTablet ? 20.0 : 24.0)),
    };
  }

  @override
  Widget build(BuildContext context) {
    final cropId          = surveyData['cropId'] ?? 'unknown';
    final plotId = surveyData['cceAvailablePlotId'] ?? surveyData['surveyNo'] ?? 'unknown';
    final controller = Get.put(
      Form5DetailController(surveyData: surveyData),
      tag: 'detail_${cropId}_$plotId',
    );
    final form5Controller = Get.find<Form5Controller>();
    final sizes           = _getResponsiveSizes(context);
    final isSmallScreen = MediaQuery.of(context).size.width < 600;
    return Scaffold(
      backgroundColor: surfaceColor,
      appBar: _buildAppBar(context, form5Controller, sizes),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: sizes['horizontalPadding'],
              vertical:   sizes['verticalPadding'],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPlotInfoBanner(isSmallScreen),
                SizedBox(height: isSmallScreen ? 20 : 24),
                _buildCceFrameSection(controller, form5Controller, sizes),
                SizedBox(height: sizes['verticalPadding'] * 1.5),
                _SaveButton(surveyData: surveyData, controller: controller, sizes: sizes),
                SizedBox(height: sizes['verticalPadding'] * 2),
              ],
            ),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(
      BuildContext context,
      Form5Controller form5Controller,
      Map<String, dynamic> sizes) {
    return AppBar(
      title: Text('Frame Selection',
          style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: sizes['subtitleSize'],
              letterSpacing: 0.3)),
      backgroundColor: primaryBlue,
      foregroundColor: Colors.white,
      elevation:   0,
      centerTitle: true,
      leading: IconButton(
        icon: Container(
          padding:    EdgeInsets.all(sizes['iconSize'] * 0.2),
          decoration: BoxDecoration(
              color:        Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10)),
          child: Icon(Icons.arrow_back_ios_new,
              color: Colors.white, size: sizes['iconSize'] * 0.5),
        ),
        onPressed: () {
          try { if (Get.isSnackbarOpen) Get.closeAllSnackbars(); } catch (_) {}
          Get.back();
        },
      ),
    );
  }

  Widget _buildCceFrameSection(
      Form5DetailController controller,
      Form5Controller form5Controller,
      Map<String, dynamic> sizes) {
    return Obx(() {
      if (controller.isLoadingFrameData.value) return _buildLoadingFrameCard(sizes);
      if (controller.frameDataFetchError.value) return _buildErrorFrameCard(controller, sizes);
      if (controller.cceFrameData.value != null) return _buildFrameDataCard(controller, form5Controller, sizes);
      return const SizedBox.shrink();
    });
  }

  Widget _buildLoadingFrameCard(Map<String, dynamic> sizes) {
    return Container(
      decoration: BoxDecoration(
        color:        cardColor,
        borderRadius: BorderRadius.circular(sizes['borderRadius']),
        border:       Border.all(color: primaryBlue.withValues(alpha: 0.15), width: 1.5),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, 4))
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(sizes['cardPadding'] * 1.5),
        child: Column(children: [
          const CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(primaryBlue)),
          SizedBox(height: sizes['cardPadding']),
          Text('Loading experiment frame data...',
              style: TextStyle(
                  fontSize: sizes['bodySize'],
                  fontWeight: FontWeight.w500,
                  color: textSecondary),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }

  Widget _buildErrorFrameCard(
      Form5DetailController controller, Map<String, dynamic> sizes) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
            colors: [
              Colors.red.shade50,
              Colors.red.shade50.withValues(alpha: 0.7)
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(sizes['borderRadius']),
        border:       Border.all(color: Colors.red.shade300, width: 1.5),
        boxShadow: [
          BoxShadow(
              color: Colors.red.withValues(alpha: 0.1),
              blurRadius: 16,
              offset: const Offset(0, 4))
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(sizes['cardPadding']),
        child: Column(children: [
          Container(
            padding: EdgeInsets.all(sizes['iconSize'] * 0.4),
            decoration: BoxDecoration(
                color: Colors.red.shade100, shape: BoxShape.circle),
            child: Icon(Icons.error_outline,
                color: Colors.red.shade700,
                size: sizes['iconSize'] * 1.2),
          ),
          SizedBox(height: sizes['cardPadding']),
          Text('Failed to Load Frame Data',
              style: TextStyle(
                  fontSize: sizes['subtitleSize'],
                  fontWeight: FontWeight.w700,
                  color: Colors.red.shade900)),
          SizedBox(height: sizes['cardPadding'] * 0.5),
          Text(controller.errorMessage.value,
              textAlign: TextAlign.center,
              style: TextStyle(
                  fontSize: sizes['smallSize'],
                  color: Colors.red.shade700,
                  height: 1.4)),
          SizedBox(height: sizes['cardPadding'] * 1.2),
          ElevatedButton.icon(
            onPressed: () => controller.retryFetchFrameData(),
            icon:  Icon(Icons.refresh, size: sizes['iconSize'] * 0.6),
            label: Text('Retry',
                style: TextStyle(
                    fontSize: sizes['bodySize'], fontWeight: FontWeight.w600)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(
                  horizontal: sizes['cardPadding'] * 1.5,
                  vertical:   sizes['cardPadding'] * 0.7),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              elevation: 0,
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildFrameDataCard(
      Form5DetailController controller,
      Form5Controller form5Controller,
      Map<String, dynamic> sizes) {
    final frameData      = controller.cceFrameData.value!;
    final unitType       = FrameUnitType.fromId(frameData.frameUnitId);
    final isSquareMeters = frameData.frameUnitId == 5;
    final isTreeUnit     = frameData.frameUnitId == 7;
    final isPlantUnit    = frameData.frameUnitId == 6;

    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 600),
      tween:    Tween(begin: 0.0, end: 1.0),
      curve:    Curves.easeOutCubic,
      builder:  (context, value, child) => Transform.scale(
          scale: 0.95 + 0.05 * value,
          child: Opacity(opacity: value, child: child)),
      child: Container(
        decoration: BoxDecoration(
          color:        cardColor,
          borderRadius: BorderRadius.circular(sizes['borderRadius']),
          border:       Border.all(
              color: primaryBlue.withValues(alpha: 0.08), width: 1),
          boxShadow: [
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 16,
                offset: const Offset(0, 4)),
            BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 4,
                offset: const Offset(0, 2)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(sizes['cardPadding']),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                    colors: [primaryBlue.withValues(alpha: 0.05), surfaceColor]),
                borderRadius: BorderRadius.only(
                  topLeft:  Radius.circular(sizes['borderRadius']),
                  topRight: Radius.circular(sizes['borderRadius']),
                ),
              ),
              child: Row(children: [
                Container(
                  padding: EdgeInsets.all(sizes['iconSize'] * 0.35),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: [
                      primaryBlue.withValues(alpha: 0.15),
                      primaryBlue.withValues(alpha: 0.08)
                    ]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.grid_on_outlined,
                      color: primaryBlue, size: sizes['iconSize'] * 0.8),
                ),
                SizedBox(width: sizes['cardPadding'] * 0.8),
                Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Crop Cutting Experiment',
                              style: TextStyle(
                                  fontSize: sizes['smallSize'],
                                  fontWeight: FontWeight.w600,
                                  color: textSecondary)),
                          const SizedBox(height: 4),
                          Text(unitType.label,
                              style: TextStyle(
                                  fontSize: sizes['bodySize'] + 2,
                                  fontWeight: FontWeight.w700,
                                  color: textPrimary)),
                        ])),
              ]),
            ),
            Container(
              height: 1,
              margin: EdgeInsets.symmetric(horizontal: sizes['cardPadding']),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [
                  Colors.transparent,
                  Colors.grey.shade200,
                  Colors.transparent
                ]),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(sizes['cardPadding']),
              child: isSquareMeters
                  ? SqmFrameSelectionWidget(
                frameLength:     frameData.frameLength ?? 2.0,
                frameWidth:      frameData.frameWidth  ?? 2.0,
                surveyData:      surveyData,
                form5controller: form5Controller,
                primaryColor:    primaryBlue,
              )
                  : (isTreeUnit || isPlantUnit)
                  ? Obx(() => TreePlantSelectionWidget(
                frameCount:      frameData.frameMeasure ?? 0,
                unitType:        isTreeUnit ? 'trees' : 'plants',
                surveyData:      surveyData,
                form5controller: form5Controller,
                primaryColor:    isTreeUnit
                    ? const Color(0xFF059669)
                    : const Color(0xFF10B981),
                lightColor: isTreeUnit
                    ? const Color(0xFFA7F3D0)
                    : const Color(0xFFD1FAE5),
                savedData: controller.savedPlotData.value,
              ))
                  : _buildFrameMeasureDisplay(frameData, primaryBlue, sizes),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFrameMeasureDisplay(
      CceFramePayload frameData,
      Color primaryColor,
      Map<String, dynamic> sizes) {
    return Container(
      padding: EdgeInsets.all(sizes['cardPadding']),
      decoration: BoxDecoration(
        color:        surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: primaryColor.withValues(alpha: 0.15), width: 1.5),
      ),
      child: Row(children: [
        Container(
          padding: EdgeInsets.all(sizes['iconSize'] * 0.3),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [
              primaryColor.withValues(alpha: 0.15),
              primaryColor.withValues(alpha: 0.08)
            ]),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(Icons.straighten, color: primaryColor, size: sizes['iconSize'] * 0.7),
        ),
        SizedBox(width: sizes['cardPadding'] * 0.8),
        Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Frame Count',
                  style: TextStyle(fontSize: sizes['smallSize'], fontWeight: FontWeight.w600, color: textSecondary)),
              const SizedBox(height: 4),
              Text('${frameData.frameMeasure} ${frameData.frameUnit}',
                  style: TextStyle(fontSize: sizes['bodySize'] + 2, fontWeight: FontWeight.w700, color: textPrimary)),
            ])),
        Container(
          padding: EdgeInsets.symmetric(
              horizontal: sizes['cardPadding'] * 0.9, vertical: sizes['cardPadding'] * 0.5),
          decoration: BoxDecoration(
            color: primaryColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 3))],
          ),
          child: Text('${frameData.frameMeasure}',
              style: TextStyle(fontSize: sizes['subtitleSize'], fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ]),
    );
  }

  Widget _buildPlotInfoBanner(bool isSmallScreen) {
    return Container(
      padding: EdgeInsets.all(isSmallScreen ? 16 : 20),
      decoration: BoxDecoration(
        gradient:  LinearGradient(
          colors: [primaryGreen, secondaryGreen],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: primaryGreen.withValues(alpha: 0.3), blurRadius: 12, offset: const Offset(0, 4)),
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
                child: Icon(Icons.location_on_outlined, color: Colors.white, size: isSmallScreen ? 22 : 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Plot Information',
                        style: TextStyle(
                          fontSize: isSmallScreen ? 14 : 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.9),
                          letterSpacing: 0.3,
                        )),
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
          Text(label,
              style: TextStyle(
                fontSize: isSmallScreen ? 10 : 11,
                color: Colors.white.withValues(alpha: 0.9),
                fontWeight: FontWeight.w500,
              )),
          const SizedBox(height: 4),
          Text(value,
              style: TextStyle(
                fontSize: isSmallScreen ? 13 : 14,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// _SaveButton
// ═══════════════════════════════════════════════════════════════════════════

enum _SaveState { idle, saving, success, error }

class _SaveButton extends StatefulWidget {
  final Map<String, String>   surveyData;
  final Form5DetailController controller;
  final Map<String, dynamic>  sizes;

  const _SaveButton({
    required this.surveyData,
    required this.controller,
    required this.sizes,
  });

  @override
  State<_SaveButton> createState() => _SaveButtonState();
}

class _SaveButtonState extends State<_SaveButton>
    with SingleTickerProviderStateMixin {
  _SaveState _state = _SaveState.idle;
  String?    _errorMessage;

  late final AnimationController _pulse;
  late final Animation<double>   _scaleAnim;

  @override
  void initState() {
    super.initState();
    _pulse = AnimationController(
      vsync:      this,
      duration:   const Duration(milliseconds: 180),
      lowerBound: 0.97,
      upperBound: 1.0,
      value:      1.0,
    );
    _scaleAnim = _pulse;
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Form5DetailController      get _ctrl => widget.controller;
  Map<String, dynamic>       get s     => widget.sizes;

  SqmFrameSelectionController? get _sqmCtrl {
    final fd  = _ctrl.cceFrameData.value;
    if (fd == null) return null;
    final tag = 'sqm_dynamic_${widget.surveyData['cceAvailablePlotId'] ?? widget.surveyData['surveyNo']}';
    try { return Get.find<SqmFrameSelectionController>(tag: tag); } catch (_) { return null; }
  }

  TreePlantSelectionController? get _treeCtrl {
    final fd = _ctrl.cceFrameData.value;
    if (fd == null) return null;
    final unitStr = fd.frameUnitId == 7 ? 'trees' : 'plants';
    final plotId = widget.surveyData['cceAvailablePlotId']
        ?? widget.surveyData['surveyNo'] ?? 'unknown';
    try {
      return Get.find<TreePlantSelectionController>(
          tag: 'tree_plant_${unitStr}_${fd.frameMeasure ?? 0}_$plotId');
    } catch (_) { return null; }
  }

  String? _validate() {
    final fd = _ctrl.cceFrameData.value;
    if (fd == null) return 'Frame data not loaded.';
    switch (fd.frameUnitId) {
      case 5:
        final sqm = _sqmCtrl;
        if (sqm == null)              return 'Please enter plot dimensions first.';
        if (!sqm.isGenerated.value)   return 'Please generate a random position before saving.';
        if (sqm.totalLength.value <= 0) return 'Please enter a valid total length.';
        if (sqm.totalWidth.value  <= 0) return 'Please enter a valid total width.';
        // ✅ PATCH: selectedLength/Width can be 0 (frame placed at plot edge) — only reject negative
        if (sqm.selectedLength.value < 0) return 'Selected length is invalid. Please regenerate.';
        if (sqm.selectedWidth.value  < 0) return 'Selected width is invalid. Please regenerate.';
        return null;
      case 6:
      case 7:
        return CceFrameSaveService.validateBeforeSave(
          unitType:       FrameUnitType.fromId(fd.frameUnitId),
          treeController: _treeCtrl,
        );
      default:
        return null;
    }
  }

  Future<void> _onSave() async {
    if (_state == _SaveState.saving) return;

    await _pulse.reverse();
    await _pulse.forward();

    final fd       = _ctrl.cceFrameData.value;
    final plotId   = widget.surveyData['cceAvailablePlotId'] ?? '';
    final sqmCtrl  = _sqmCtrl;
    final treeCtrl = _treeCtrl;

    if (fd == null) return;
    if (plotId.isEmpty) { _showError('Plot ID is missing. Cannot save.'); return; }

    final validationMsg = _validate();
    if (validationMsg != null) { _showError(validationMsg); return; }

    setState(() { _state = _SaveState.saving; _errorMessage = null; });

    int? sideLengthX, sideLengthY, randomSideLengthX, randomSideLengthY;
    if (fd.frameUnitId == 5) {
      if (sqmCtrl == null) { _showError('Plot dimension data unavailable.'); return; }
      sideLengthX       = sqmCtrl.totalLength.value;
      sideLengthY       = sqmCtrl.totalWidth.value;
      randomSideLengthX = sqmCtrl.selectedLength.value;
      randomSideLengthY = sqmCtrl.selectedWidth.value;
    }

    final response = await CceFrameSaveService.saveFrameSelection(
      cceAvailablePlotId: plotId,
      frameData:          fd,
      unitType:           FrameUnitType.fromId(fd.frameUnitId),
      sideLengthX:        sideLengthX,
      sideLengthY:        sideLengthY,
      randomSideLengthX:  randomSideLengthX,
      randomSideLengthY:  randomSideLengthY,
      treeController:     treeCtrl,
    );

    if (!mounted) return;

    if (response.success) {
      setState(() => _state = _SaveState.success);
      _showSuccessSnackbar();
      final treeCtrl = _treeCtrl;
      if (treeCtrl != null && response.treeIdList.isNotEmpty) {
        treeCtrl.injectIdsFromSaveResponse(response.treeIdList);
      }
      // Refetch data so the SQM card's hasId becomes true
      _ctrl.refetchSavedPlotData();
      
      await Future.delayed(const Duration(milliseconds: 2500));
      if (mounted) setState(() => _state = _SaveState.idle);
    } else {
      setState(() {
        _state        = _SaveState.error;
        _errorMessage = response.message ?? 'An unexpected error occurred.';
      });
    }
  }

  void _showError(String msg) =>
      setState(() { _state = _SaveState.error; _errorMessage = msg; });

  void _showSuccessSnackbar() {
    SnackbarHelper.showSuccess(
      'Saved Successfully',
      'Frame selection data has been recorded.',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final isReady = _ctrl.canSave.value;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            transitionBuilder: (child, anim) => FadeTransition(
                opacity: anim,
                child: SizeTransition(sizeFactor: anim, child: child)),
            child: (_state == _SaveState.error && _errorMessage != null)
                ? _ErrorBanner(message: _errorMessage!, sizes: s)
                : const SizedBox.shrink(),
          ),
          if (_state == _SaveState.error && _errorMessage != null)
            SizedBox(height: s['cardPadding'] * 0.8),
          ScaleTransition(scale: _scaleAnim, child: _buildButton(isReady)),
        ],
      );
    });
  }

  Widget _buildButton(bool ready) {
    final isSaving  = _state == _SaveState.saving;
    final isSuccess = _state == _SaveState.success;

    final Color bg, fg, shadow;
    if (isSuccess) {
      bg = const Color(0xFF10B981); fg = Colors.white; shadow = const Color(0xFF10B981);
    } else if (isSaving) {
      bg = const Color(0xFF3B82F6); fg = Colors.white; shadow = const Color(0xFF3B82F6);
    } else if (!ready) {
      bg = Colors.grey.shade200; fg = Colors.grey.shade500; shadow = Colors.transparent;
    } else {
      bg = const Color(0xFF3B82F6); fg = Colors.white; shadow = const Color(0xFF3B82F6);
    }

    return AnimatedContainer(
      duration:  const Duration(milliseconds: 300),
      curve:     Curves.easeOut,
      decoration: BoxDecoration(
        color:        bg,
        borderRadius: BorderRadius.circular(16),
        boxShadow: shadow == Colors.transparent
            ? []
            : [
          BoxShadow(color: shadow.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
          BoxShadow(color: shadow.withValues(alpha: 0.15), blurRadius: 4,  offset: const Offset(0, 2)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap:          (ready && !isSaving && !isSuccess) ? _onSave : null,
          borderRadius:   BorderRadius.circular(16),
          splashColor:    Colors.white.withValues(alpha: 0.15),
          highlightColor: Colors.white.withValues(alpha: 0.08),
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: s['cardPadding'] * 0.9, horizontal: s['cardPadding']),
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              transitionBuilder: (child, anim) => FadeTransition(
                  opacity: anim, child: ScaleTransition(scale: anim, child: child)),
              child: _buttonContent(fg, isSaving, isSuccess, ready),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buttonContent(Color fg, bool isSaving, bool isSuccess, bool ready) {
    if (isSaving) {
      return Row(
          key: const ValueKey('saving'),
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
                width: s['iconSize'] * 0.65,
                height: s['iconSize'] * 0.65,
                child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation<Color>(fg))),
            SizedBox(width: s['cardPadding'] * 0.7),
            Text('Saving...', style: TextStyle(fontSize: s['bodySize'] + 2, fontWeight: FontWeight.w700, color: fg, letterSpacing: 0.3)),
          ]);
    }
    if (isSuccess) {
      return Row(
          key: const ValueKey('success'),
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_rounded, color: fg, size: s['iconSize'] * 0.8),
            SizedBox(width: s['cardPadding'] * 0.7),
            Text('Saved!', style: TextStyle(fontSize: s['bodySize'] + 2, fontWeight: FontWeight.w700, color: fg, letterSpacing: 0.3)),
          ]);
    }
    return Row(
        key: const ValueKey('idle'),
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(ready ? Icons.save_rounded : Icons.lock_outline_rounded, color: fg, size: s['iconSize'] * 0.75),
          SizedBox(width: s['cardPadding'] * 0.7),
          Text(
              ready ? 'Save Frame Selection' : 'Complete Selection to Save',
              style: TextStyle(fontSize: s['bodySize'] + 2, fontWeight: FontWeight.w700, color: fg, letterSpacing: 0.3)),
        ]);
  }
}

// ── Error banner ───────────────────────────────────────────────────────────────
class _ErrorBanner extends StatelessWidget {
  final String               message;
  final Map<String, dynamic> sizes;
  const _ErrorBanner({required this.message, required this.sizes});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(sizes['cardPadding'] * 0.85),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade300, width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.error_outline_rounded, color: Colors.red.shade700, size: sizes['iconSize'] * 0.65),
          SizedBox(width: sizes['cardPadding'] * 0.6),
          Expanded(
              child: Text(message,
                  style: TextStyle(
                      fontSize: sizes['smallSize'] + 1,
                      fontWeight: FontWeight.w600,
                      color: Colors.black,
                      height: 1.4))),
        ],
      ),
    );
  }
}
