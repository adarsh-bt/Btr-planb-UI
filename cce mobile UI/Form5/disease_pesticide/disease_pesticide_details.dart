// view/cce/cce_data_entry/disease_pesticide.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../../../controller/cce/cce_data_entry/disease_pesticide.dart';

// ─── Color constants ──────────────────────────────────────────────────────────
const _primaryGreen   = Color(0xFF2D5F3F);
const _secondaryGreen = Color(0xFF3D7F5F);
const _surfaceColor   = Color(0xFFF8FAF9);
const _textPrimary    = Color(0xFF1A1A1A);
const _textSecondary  = Color(0xFF666666);
const _accentBlue     = Color(0xFF3B82F6);
const _accentOrange   = Color(0xFFF59E0B);
const _accentRed      = Color(0xFFE53935);
const _accentGreen    = Color(0xFF10B981);
const _accentPurple   = Color(0xFF7B1FA2);
const _accentTeal     = Color(0xFF00897B);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

class DiseasePesticideCCEPage extends StatefulWidget {
  final Map<String, String> surveyData;
  const DiseasePesticideCCEPage({super.key, required this.surveyData});

  @override
  State<DiseasePesticideCCEPage> createState() =>
      _DiseasePesticideCCEPageState();
}

class _DiseasePesticideCCEPageState extends State<DiseasePesticideCCEPage> {
  late final DiseasePesticideCCEController _ctrl;
  late final String _controllerTag;

  @override
  void initState() {
    super.initState();

    // ── 1. Derive a unique tag (same logic as Irrigation) ──────────────────
    final perTreeId = widget.surveyData['cceDataEntryPerTreeId'];
    final plotId    = widget.surveyData['cceAvailablePlotId'] ?? '';
    _controllerTag  = (perTreeId != null && perTreeId.isNotEmpty)
        ? perTreeId
        : 'sqm_$plotId';

    // ── 2. Force-delete any stale instance ─────────────────────────────────
    if (Get.isRegistered<DiseasePesticideCCEController>(tag: _controllerTag)) {
      Get.delete<DiseasePesticideCCEController>(
          tag: _controllerTag, force: true);
    }

    // ── 3. Register fresh controller ───────────────────────────────────────
    _ctrl = Get.put(
      DiseasePesticideCCEController(),
      tag: _controllerTag,
      permanent: false,
    );

    WidgetsBinding.instance.addPostFrameCallback(
          (_) => _ctrl.fetchDiseasePesticideDetails(widget.surveyData),
    );
  }
  @override
  void dispose() {
    if (Get.isRegistered<DiseasePesticideCCEController>(
        tag: _controllerTag)) {
      Get.delete<DiseasePesticideCCEController>(
          tag: _controllerTag, force: true);
    }
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    final isSmall = MediaQuery.of(context).size.width < 600;
    // Bottom padding now only accounts for safe area (no FAB clearance needed).
    final bottomPadding = MediaQuery.of(context).padding.bottom + 24;

    return Scaffold(
      backgroundColor: _surfaceColor,
      appBar: _AppBar(isSmall: isSmall),
      body: Obx(() {
        if (_ctrl.isLoadingSavedDetails.value) {
          return _FullPageLoader(isSmall: isSmall);
        }
        return SingleChildScrollView(
          padding: EdgeInsets.only(
            left: isSmall ? 16 : 20,
            right: isSmall ? 16 : 20,
            top: isSmall ? 16 : 20,
            bottom: bottomPadding,
          ),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HeaderBanner(isSmall: isSmall,surveyData: widget.surveyData),
              SizedBox(height: isSmall ? 20 : 24),
              if (_ctrl.hasSavedDetailsError.value)
                _SavedDetailsErrorBanner(
                  ctrl: _ctrl,
                  surveyData: widget.surveyData,
                  isSmall: isSmall,
                ),
              _SectionCard(
                title: 'Disease Information',
                icon: Icons.coronavirus_outlined,
                isSmall: isSmall,
                isRequired: true,
                child: _DiseaseSection(ctrl: _ctrl, isSmall: isSmall),
              ),
              SizedBox(height: isSmall ? 16 : 20),
              _SectionCard(
                title: 'Pesticide Usage',
                icon: Icons.science_outlined,
                isSmall: isSmall,
                isRequired: true,
                child: _PesticideSection(ctrl: _ctrl, isSmall: isSmall),
              ),
              SizedBox(height: isSmall ? 16 : 20),
              _SectionCard(
                title: 'Fertilizer Usage',
                icon: Icons.grass_outlined,
                isSmall: isSmall,
                isRequired: false,
                child: _FertilizerSection(ctrl: _ctrl, isSmall: isSmall),
              ),
              // Save button is now inline at the bottom of the scroll view.
              SizedBox(height: isSmall ? 24 : 32),
              _SaveButton(
                ctrl: _ctrl,
                isSmall: isSmall,
                surveyData: widget.surveyData,
              ),
            ],
          ),
        );
      }),
      // No floatingActionButton — save button is inline in the scroll view.
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-page loader
// ─────────────────────────────────────────────────────────────────────────────

class _FullPageLoader extends StatelessWidget {
  final bool isSmall;
  const _FullPageLoader({required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 40,
            height: 40,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(_primaryGreen),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Loading saved details…',
            style: TextStyle(
              fontSize: isSmall ? 14 : 15,
              color: _textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Retry banner
// ─────────────────────────────────────────────────────────────────────────────

class _SavedDetailsErrorBanner extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final Map<String, String> surveyData;
  final bool isSmall;
  const _SavedDetailsErrorBanner({
    required this.ctrl,
    required this.surveyData,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: _accentOrange.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(12),
        border:
        Border.all(color: _accentOrange.withValues(alpha: 0.35), width: 1.5),
      ),
      child: Row(children: [
        const Icon(Icons.warning_amber_rounded, color: _accentOrange, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Could not load saved data. You can still fill the form.',
            style: TextStyle(
              fontSize: isSmall ? 12 : 13,
              color: _accentOrange.withValues(alpha: 0.9),
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        const SizedBox(width: 8),
        TextButton(
          onPressed: () => ctrl.fetchDiseasePesticideDetails(surveyData),
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            backgroundColor: _accentOrange.withValues(alpha: 0.12),
            shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Retry',
              style: TextStyle(
                  fontSize: 12,
                  color: _accentOrange,
                  fontWeight: FontWeight.w700)),
        ),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// APP BAR
// ─────────────────────────────────────────────────────────────────────────────

class _AppBar extends StatelessWidget implements PreferredSizeWidget {
  final bool isSmall;
  const _AppBar({required this.isSmall});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) => AppBar(
    title: Text('Pesticides & Fertilizers',
        style: TextStyle(
            fontWeight: FontWeight.w700, fontSize: isSmall ? 18 : 20)),
    backgroundColor: _primaryGreen,
    foregroundColor: Colors.white,
    elevation: 0,
    centerTitle: true,
    leading: IconButton(
      icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
      onPressed: () => Get.back(),
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER BANNER
// ─────────────────────────────────────────────────────────────────────────────

class _HeaderBanner extends StatelessWidget {
  final bool isSmall;
  final Map<String, String> surveyData;
  const _HeaderBanner({required this.isSmall, required this.surveyData});
  String? get _treeLabel {
    final v = surveyData['selectedItemLabel'];
    return (v != null && v.isNotEmpty) ? v : null;
  }
  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: Container(
        padding: EdgeInsets.all(isSmall ? 16 : 20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [_primaryGreen, _secondaryGreen],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: _primaryGreen.withValues(alpha: 0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(isSmall ? 10 : 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.medical_services_outlined,
                  color: Colors.white, size: isSmall ? 22 : 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Crop Health Management',
                      style: TextStyle(
                          fontSize: isSmall ? 13 : 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white.withValues(alpha: 0.9))),
                  const SizedBox(height: 4),
                  Text('CCE Field Details',
                      style: TextStyle(
                          fontSize: isSmall ? 18 : 20,
                          fontWeight: FontWeight.w700,
                          color: Colors.white)),
                  if (_treeLabel != null) ...[
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
                            size: isSmall ? 11 : 12,   // ✅ isSmall (correct)
                            color: Colors.white),
                        const SizedBox(width: 5),
                        Text(
                          _treeLabel!,
                          style: TextStyle(
                              fontSize: isSmall ? 11 : 12, // ✅ isSmall (correct)
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              letterSpacing: 0.2),
                        ),
                      ]),
                    ),
                  ],
                ],
              ),
            ),

          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isSmall;
  final bool isRequired;
  final Widget child;
  const _SectionCard({
    required this.title,
    required this.icon,
    required this.isSmall,
    required this.isRequired,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final cardColor = Theme.of(context).cardColor;

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _primaryGreen.withValues(alpha: 0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          padding: EdgeInsets.all(isSmall ? 14 : 16),
          decoration: BoxDecoration(
            color: _primaryGreen.withValues(alpha: 0.04),
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(16),
              topRight: Radius.circular(16),
            ),
          ),
          child: Row(children: [
            Container(
              padding: EdgeInsets.all(isSmall ? 8 : 10),
              decoration: BoxDecoration(
                color: _primaryGreen.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon,
                  size: isSmall ? 18 : 20, color: _primaryGreen),
            ),
            const SizedBox(width: 12),
            Text(title,
                style: TextStyle(
                    fontSize: isSmall ? 15 : 16,
                    fontWeight: FontWeight.bold,
                    color: _textPrimary)),
            if (isRequired) ...[
              const SizedBox(width: 4),
              const Text('*',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _accentRed))
            ],
          ]),
        ),
        Divider(height: 1, color: Colors.grey.shade200),
        Padding(
            padding: EdgeInsets.all(isSmall ? 14 : 16), child: child),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISEASE SECTION
// ─────────────────────────────────────────────────────────────────────────────

class _DiseaseSection extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  const _DiseaseSection({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _FieldLabel(
          text: 'Is Infected by Disease', isSmall: isSmall, required: true),
      const SizedBox(height: 8),
      Obx(() => _ToggleRow(
        leftLabel: 'Yes, Infected',
        leftIcon: Icons.sick,
        leftColor: _accentRed,
        leftSelected: ctrl.isInfectedByDisease.value == true,
        onLeftTap: () => ctrl.setInfectedByDisease(true),
        rightLabel: 'No Disease',
        rightIcon: Icons.health_and_safety,
        rightColor: _accentGreen,
        rightSelected: ctrl.isInfectedByDisease.value == false,
        onRightTap: () => ctrl.setInfectedByDisease(false),
        isSmall: isSmall,
      )),
      Obx(() {
        if (ctrl.isInfectedByDisease.value != true) {
          return const SizedBox.shrink();
        }
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: isSmall ? 14 : 16),
              _DiseasePicker(ctrl: ctrl, isSmall: isSmall),
            ]);
      }),
    ]);
  }
}

class _DiseasePicker extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  const _DiseasePicker({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _FieldLabel(
          text: 'Select Disease(s)', isSmall: isSmall, required: true),
      const SizedBox(height: 8),

      Obx(() {
        if (ctrl.isLoadingDiseases.value) {
          return _LoadingRow(
              message: 'Loading diseases...', isSmall: isSmall);
        }
        final options = ctrl.diseaseNameOptions;
        return _ResetDropdown<String>(
          key: ValueKey(options.length),
          hintText: options.isEmpty
              ? 'No diseases available'
              : 'Tap to add a disease...',
          hintIcon: Icons.coronavirus_outlined,
          enabled: options.isNotEmpty,
          items: options
              .map((name) => DropdownMenuItem(
            value: name,
            child: Text(name,
                style: TextStyle(
                  fontSize: isSmall ? 13 : 14,
                  fontWeight: name == 'Others'
                      ? FontWeight.w600
                      : FontWeight.w500,
                  color:
                  name == 'Others' ? _accentOrange : _textPrimary,
                )),
          ))
              .toList(),
          onPick: (val) => ctrl.onDiseaseSelected(val),
          isSmall: isSmall,
        );
      }),

      // ── Named disease chips ───────────────────────────────────────────────
      Obx(() {
        if (ctrl.selectedDiseaseNames.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _miniLabel('Selected Diseases', isSmall),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ctrl.selectedDiseaseNames
                      .map((name) => _RemovableChip(
                    label: name,
                    color: _accentRed,
                    onRemove: () =>
                        ctrl.removeSelectedDisease(name),
                    isSmall: isSmall,
                  ))
                      .toList(),
                ),
              ]),
        );
      }),

      // ── Custom disease text fields ────────────────────────────────────────
      Obx(() {
        if (ctrl.otherDiseaseControllers.isEmpty) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _tagBadge(
                    'Custom Disease Names', Icons.edit_note, _accentOrange, isSmall),
                const SizedBox(height: 10),
                ...List.generate(
                  ctrl.otherDiseaseControllers.length,
                      (i) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(children: [
                      _numberBadge(i + 1, _accentOrange, isSmall),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          controller: ctrl.otherDiseaseControllers[i],
                          textCapitalization: TextCapitalization.words,
                          style: TextStyle(
                              fontSize: isSmall ? 13 : 14,
                              fontWeight: FontWeight.w500,
                              color: _textPrimary),
                          decoration: _orangeInputDecoration(
                              'Enter disease name', isSmall),
                        ),
                      ),
                      const SizedBox(width: 8),
                      _removeIconBtn(
                              () => ctrl.removeOtherDiseaseEntry(i), isSmall),
                    ]),
                  ),
                ),
                Row(children: [
                  Icon(Icons.info_outline,
                      size: 11, color: _accentOrange.withValues(alpha: 0.6)),
                  const SizedBox(width: 4),
                  Text('Each "Others" pick adds one entry',
                      style: TextStyle(
                          fontSize: isSmall ? 10 : 11,
                          color: _accentOrange.withValues(alpha: 0.7),
                          fontStyle: FontStyle.italic)),
                ]),
              ]),
        );
      }),

      Obx(() {
        if (ctrl.hasError.value && ctrl.availableDiseases.isEmpty) {
          return Padding(
            padding: const EdgeInsets.only(top: 6),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Failed to load diseases.',
                      style: TextStyle(
                          fontSize: isSmall ? 11 : 12,
                          color: _accentOrange,
                          fontStyle: FontStyle.italic)),
                  TextButton.icon(
                    onPressed: ctrl.fetchDiseases,
                    icon: const Icon(Icons.refresh,
                        size: 16, color: _primaryGreen),
                    label: const Text('Retry',
                        style: TextStyle(
                            fontSize: 12,
                            color: _primaryGreen,
                            fontWeight: FontWeight.w600)),
                    style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                  ),
                ]),
          );
        }
        return Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(
              'Multiple diseases allowed. "Others" adds a custom name entry.',
              style: TextStyle(
                  fontSize: isSmall ? 10 : 11,
                  color: _textSecondary,
                  fontStyle: FontStyle.italic)),
        );
      }),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PESTICIDE SECTION
// ─────────────────────────────────────────────────────────────────────────────

class _PesticideSection extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  const _PesticideSection({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _FieldLabel(
          text: 'Is Pesticide Used', isSmall: isSmall, required: true),
      const SizedBox(height: 8),
      Obx(() => _ToggleRow(
        leftLabel: 'Yes, Used',
        leftIcon: Icons.science,
        leftColor: _accentBlue,
        leftSelected: ctrl.isPesticideUsed.value == true,
        onLeftTap: () => ctrl.setPesticideUsed(true),
        rightLabel: 'Not Used',
        rightIcon: Icons.block,
        rightColor: _accentOrange,
        rightSelected: ctrl.isPesticideUsed.value == false,
        onRightTap: () => ctrl.setPesticideUsed(false),
        isSmall: isSmall,
      )),
      Obx(() {
        if (ctrl.isPesticideUsed.value != true) return const SizedBox.shrink();
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: isSmall ? 16 : 20),
              _LabeledTextField(
                label: 'Pesticide Type',
                hint: 'e.g. Fungicide, Insecticide, Herbicide...',
                icon: Icons.category_outlined,
                textController: ctrl.pesticideTypeController,
                isSmall: isSmall,
                isRequired: false,   // was: true
              ),
              SizedBox(height: isSmall ? 14 : 16),
              _LabeledTextField(
                label: 'Pesticide Purpose',
                hint: 'e.g. Disease control, Pest prevention...',
                icon: Icons.flag_outlined,
                textController: ctrl.pesticidePurposeController,
                isSmall: isSmall,
                isRequired: false,   // was: true
                maxLines: 2,
              ),
              SizedBox(height: isSmall ? 14 : 16),
              _FieldLabel(
                  text: 'Is Control Successful',
                  isSmall: isSmall,
                  required: true),
              const SizedBox(height: 8),
              Obx(() => _ToggleRow(
                leftLabel: 'Yes, Successful',
                leftIcon: Icons.check_circle,
                leftColor: _accentGreen,
                leftSelected: ctrl.isControlSuccessful.value == true,
                onLeftTap: () => ctrl.setControlSuccessful(true),
                rightLabel: 'Not Successful',
                rightIcon: Icons.cancel,
                rightColor: _accentRed,
                rightSelected: ctrl.isControlSuccessful.value == false,
                onRightTap: () => ctrl.setControlSuccessful(false),
                isSmall: isSmall,
              )),
            ]);
      }),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FERTILIZER SECTION
// ─────────────────────────────────────────────────────────────────────────────

class _FertilizerSection extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  const _FertilizerSection({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      _FieldLabel(
          text: 'Is Fertilizer Used', isSmall: isSmall, required: false),
      const SizedBox(height: 8),
      Obx(() => _ToggleRow(
        leftLabel: 'Yes, Used',
        leftIcon: Icons.eco,
        leftColor: _accentTeal,
        leftSelected: ctrl.isFertilizerUsed.value,
        onLeftTap: () => ctrl.setFertilizerUsed(true),
        rightLabel: 'Not Used',
        rightIcon: Icons.block,
        rightColor: _accentOrange,
        rightSelected: !ctrl.isFertilizerUsed.value,
        onRightTap: () => ctrl.setFertilizerUsed(false),
        isSmall: isSmall,
      )),
      Obx(() {
        if (!ctrl.isFertilizerUsed.value) return const SizedBox.shrink();
        return _FertilizerDetails(ctrl: ctrl, isSmall: isSmall);
      }),
    ]);
  }
}

class _FertilizerDetails extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  const _FertilizerDetails({required this.ctrl, required this.isSmall});

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(height: isSmall ? 20 : 24),

      _FieldLabel(text: 'Filter Dropdown by Type', isSmall: isSmall),
      const SizedBox(height: 10),
      Obx(() => Row(children: [
        Expanded(
          child: RepaintBoundary(
            child: _FertTypeCard(
              label: 'Chemical',
              icon: Icons.science,
              color: _accentPurple,
              isSelected:
              ctrl.selectedFertilizerType.value == 'Chemical',
              onTap: () => ctrl.setFertilizerType('Chemical'),
              isSmall: isSmall,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: RepaintBoundary(
            child: _FertTypeCard(
              label: 'Organic',
              icon: Icons.eco,
              color: _accentGreen,
              isSelected:
              ctrl.selectedFertilizerType.value == 'Organic',
              onTap: () => ctrl.setFertilizerType('Organic'),
              isSmall: isSmall,
            ),
          ),
        ),
      ])),

      SizedBox(height: isSmall ? 16 : 20),

      _FieldLabel(
          text: 'Select Fertilizer(s)', isSmall: isSmall, required: true),
      const SizedBox(height: 8),
      Obx(() {
        if (ctrl.selectedFertilizerType.value == null) {
          return Row(children: [
            Icon(Icons.info_outline,
                size: 12, color: _textSecondary.withValues(alpha: 0.6)),
            const SizedBox(width: 4),
            Text('Select a type filter above to browse fertilizers',
                style: TextStyle(
                    fontSize: isSmall ? 11 : 12,
                    color: _textSecondary.withValues(alpha: 0.7),
                    fontStyle: FontStyle.italic)),
          ]);
        }
        if (ctrl.isLoadingFertilizers.value) {
          return _LoadingRow(
              message: 'Loading fertilizers...', isSmall: isSmall);
        }
        final items = ctrl.filteredFertilizers;
        return _ResetDropdown<int>(
          key: ValueKey('${ctrl.selectedFertilizerType.value}_${items.length}'),
          hintText: items.isEmpty
              ? 'No fertilizers available'
              : 'Tap to add a fertilizer...',
          hintIcon: Icons.grass,
          enabled: items.isNotEmpty,
          items: items
              .map((f) => DropdownMenuItem<int>(
            value: f.fertilizerId,
            child: Text(f.nameEn ?? '',
                style: TextStyle(
                  fontSize: isSmall ? 13 : 14,
                  fontWeight: f.isOthers
                      ? FontWeight.w600
                      : FontWeight.w500,
                  color: f.isOthers ? _accentOrange : _textPrimary,
                ),
                overflow: TextOverflow.ellipsis),
          ))
              .toList(),
          onPick: (id) => ctrl.onFertilizerSelected(id),
          isSmall: isSmall,
        );
      }),
      Obx(() {
        if (ctrl.selectedFertilizerType.value == null) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
              'Showing ${ctrl.selectedFertilizerType.value} fertilizers. Switch type to add more.',
              style: TextStyle(
                  fontSize: isSmall ? 10 : 11,
                  color: _textSecondary,
                  fontStyle: FontStyle.italic)),
        );
      }),

      // ── Named fertilizer cards ────────────────────────────────────────────
      Obx(() {
        if (ctrl.selectedFertilizerEntries.isEmpty) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.only(top: 14),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _miniLabel('Selected Fertilizers', isSmall),
                const SizedBox(height: 10),
                ...List.generate(ctrl.selectedFertilizerEntries.length, (i) {
                  final entry = ctrl.selectedFertilizerEntries[i];
                  return _NamedFertCard(
                      entry: entry,
                      isSmall: isSmall,
                      onRemove: () => ctrl.removeSelectedFertilizer(i));
                }),
              ]),
        );
      }),

      // ── Custom fertilizer cards ───────────────────────────────────────────
      Obx(() {
        if (ctrl.otherFertilizerEntries.isEmpty) {
          return const SizedBox.shrink();
        }
        return Padding(
          padding: const EdgeInsets.only(top: 14),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _tagBadge('Custom Fertilizers', Icons.edit_note,
                    _accentOrange, isSmall),
                const SizedBox(height: 10),
                ...List.generate(ctrl.otherFertilizerEntries.length, (i) {
                  final entry = ctrl.otherFertilizerEntries[i];
                  return _CustomFertCard(
                      entry: entry,
                      isSmall: isSmall,
                      onRemove: () => ctrl.removeOtherFertilizerEntry(i));
                }),
              ]),
        );
      }),

      Obx(() {
        if (!ctrl.hasFertilizerError.value) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Row(children: [
            const Icon(Icons.warning_amber_rounded,
                size: 16, color: _accentOrange),
            const SizedBox(width: 6),
            Text('Failed to load fertilizers.',
                style: TextStyle(
                    fontSize: isSmall ? 11 : 12, color: _accentOrange)),
            const SizedBox(width: 8),
            TextButton(
              onPressed: ctrl.fetchFertilizers,
              style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              child: const Text('Retry',
                  style: TextStyle(
                      fontSize: 12,
                      color: _primaryGreen,
                      fontWeight: FontWeight.w600)),
            ),
          ]),
        );
      }),

      Padding(
        padding: const EdgeInsets.only(top: 8),
        child: Row(children: [
          Icon(Icons.info_outline,
              size: 11, color: _textSecondary.withValues(alpha: 0.6)),
          const SizedBox(width: 4),
          Expanded(
              child: Text(
                  'You can add both Chemical and Organic fertilizers with their quantities.',
                  style: TextStyle(
                      fontSize: isSmall ? 10 : 11,
                      color: _textSecondary.withValues(alpha: 0.7),
                      fontStyle: FontStyle.italic))),
        ]),
      ),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Named Fertilizer Card
// ─────────────────────────────────────────────────────────────────────────────

class _NamedFertCard extends StatelessWidget {
  final SelectedFertilizerEntry entry;
  final bool isSmall;
  final VoidCallback onRemove;
  const _NamedFertCard({
    required this.entry,
    required this.isSmall,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final f = entry.fertilizer;
    final color = f.isChemical ? _accentPurple : _accentGreen;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.25), width: 1.5),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          _typeBadge(
              f.isChemical ? Icons.science : Icons.eco,
              f.fertilizerType ?? '',
              color,
              isSmall),
          const SizedBox(width: 8),
          Expanded(
              child: Text(f.nameEn ?? '',
                  style: TextStyle(
                      fontSize: isSmall ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color: _textPrimary))),
          _removeIconBtn(onRemove, isSmall),
        ]),
        if (f.isChemical && f.hasNpkValues) ...[
          const SizedBox(height: 8),
          Wrap(spacing: 6, runSpacing: 4, children: [
            if (f.fertilizerN != null)
              _NpkBadge('N', f.fertilizerN!, const Color(0xFF3B82F6), isSmall),
            if (f.fertilizerP != null)
              _NpkBadge('P', f.fertilizerP!, const Color(0xFFF59E0B), isSmall),
            if (f.fertilizerK != null)
              _NpkBadge('K', f.fertilizerK!, const Color(0xFF10B981), isSmall),
          ]),
        ],
        if (f.fertilizerCombination != null &&
            f.fertilizerCombination!.isNotEmpty) ...[
          const SizedBox(height: 6),
          Row(children: [
            Icon(Icons.merge_type, size: 13, color: _textSecondary),
            const SizedBox(width: 4),
            Expanded(
                child: Text(f.fertilizerCombination!,
                    style: TextStyle(
                        fontSize: isSmall ? 11 : 12, color: _textSecondary))),
          ]),
        ],
        const SizedBox(height: 10),
        _QuantityRow(
            controller: entry.quantityController,
            borderColor: color,
            isSmall: isSmall),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Fertilizer Card
// ─────────────────────────────────────────────────────────────────────────────

class _CustomFertCard extends StatelessWidget {
  final OtherFertilizerEntry entry;
  final bool isSmall;
  final VoidCallback onRemove;
  const _CustomFertCard({
    required this.entry,
    required this.isSmall,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: _accentOrange.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _accentOrange.withValues(alpha: 0.3), width: 1.5),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          _typeBadge(Icons.edit_note, 'Custom · ${entry.type}',
              _accentOrange, isSmall),
          const Spacer(),
          _removeIconBtn(onRemove, isSmall),
        ]),
        const SizedBox(height: 10),
        TextField(
          controller: entry.nameController,
          textCapitalization: TextCapitalization.words,
          style: TextStyle(
              fontSize: isSmall ? 13 : 14,
              fontWeight: FontWeight.w500,
              color: _textPrimary),
          decoration: _orangeInputDecoration('Enter fertilizer name', isSmall)
              .copyWith(
            prefixIcon: Padding(
              padding: const EdgeInsets.all(10),
              child: Icon(Icons.grass_outlined,
                  size: isSmall ? 15 : 17, color: _accentOrange),
            ),
          ),
        ),
        const SizedBox(height: 8),
        _QuantityRow(
            controller: entry.quantityController,
            borderColor: _accentOrange,
            isSmall: isSmall),
      ]),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Quantity Row
// ─────────────────────────────────────────────────────────────────────────────

class _QuantityRow extends StatelessWidget {
  final TextEditingController controller;
  final Color borderColor;
  final bool isSmall;
  const _QuantityRow({
    required this.controller,
    required this.borderColor,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(Icons.scale_outlined,
          size: isSmall ? 14 : 16, color: _textSecondary),
      const SizedBox(width: 6),
      Text('Quantity Used:',
          style: TextStyle(
              fontSize: isSmall ? 12 : 13,
              fontWeight: FontWeight.w600,
              color: _textSecondary)),
      const SizedBox(width: 10),
      Expanded(
          child: TextField(
            controller: controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))
            ],
            style: TextStyle(
                fontSize: isSmall ? 13 : 14,
                fontWeight: FontWeight.w600,
                color: _textPrimary),
            decoration: InputDecoration(
              hintText: '0.00',
              hintStyle: TextStyle(
                  color: Colors.grey.shade400, fontSize: isSmall ? 12 : 13),
              suffixText: 'kg/ha',
              suffixStyle: TextStyle(
                  fontSize: isSmall ? 11 : 12,
                  color: _textSecondary,
                  fontWeight: FontWeight.w500),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                      color: borderColor.withValues(alpha: 0.3), width: 1.5)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: borderColor, width: 2)),
              contentPadding:
              const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              isDense: true,
            ),
          )),
    ]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FERTILIZER TYPE CARD
// ─────────────────────────────────────────────────────────────────────────────

class _FertTypeCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isSmall;
  const _FertTypeCard({
    required this.label,
    required this.icon,
    required this.color,
    required this.isSelected,
    required this.onTap,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.all(isSmall ? 12 : 14),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.1) : _surfaceColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: isSelected ? color : Colors.grey.shade300,
              width: isSelected ? 2 : 1.5),
        ),
        child: Row(children: [
          Container(
            width: isSmall ? 20 : 22,
            height: isSmall ? 20 : 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isSelected ? color : Colors.transparent,
              border: Border.all(
                  color: isSelected ? color : Colors.grey.shade400, width: 2),
            ),
            child: isSelected
                ? Icon(Icons.check,
                color: Colors.white, size: isSmall ? 13 : 15)
                : null,
          ),
          const SizedBox(width: 10),
          Expanded(
              child: Text(label,
                  style: TextStyle(
                      fontSize: isSmall ? 13 : 14,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? color : _textPrimary))),
          Icon(icon,
              size: isSmall ? 18 : 20,
              color: isSelected ? color : Colors.grey.shade400),
        ]),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE BUTTON — inline at the bottom of the scroll view (no FAB)
// ─────────────────────────────────────────────────────────────────────────────

class _SaveButton extends StatelessWidget {
  final DiseasePesticideCCEController ctrl;
  final bool isSmall;
  final Map<String, String> surveyData;

  const _SaveButton({
    required this.ctrl,
    required this.isSmall,
    required this.surveyData,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
            ),
            child: Obx(() {
              final saving = ctrl.isSaving.value;
              final loading = ctrl.isLoadingSavedDetails.value;
              return OutlinedButton(
                onPressed: (saving || loading) ? null : () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey.shade700,
                  side: BorderSide(color: Colors.grey.shade300, width: 1.5),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  padding: EdgeInsets.symmetric(vertical: isSmall ? 16 : 18),
                ),
                child: Text(
                  'Cancel',
                  style: TextStyle(
                    fontSize: isSmall ? 15 : 16,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.3,
                  ),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                    color: _primaryGreen.withValues(alpha: 0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 6))
              ],
            ),
            child: Obx(() {
              final saving = ctrl.isSaving.value;
              final loading = ctrl.isLoadingSavedDetails.value;
              return ElevatedButton.icon(
                onPressed:
                (saving || loading) ? null : () => _handleSave(context),
                icon: saving
                    ? SizedBox(
                  width: isSmall ? 18 : 20,
                  height: isSmall ? 18 : 20,
                  child: const CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor:
                    AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
                    : Icon(Icons.save, size: isSmall ? 18 : 20),
                label: Text(
                  saving ? 'Saving...' : 'Save Details',
                  style: TextStyle(
                      fontSize: isSmall ? 14 : 15, fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: (saving || loading)
                      ? _primaryGreen.withValues(alpha: 0.65)
                      : _primaryGreen,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                  elevation: 0,
                  padding:
                  EdgeInsets.symmetric(vertical: isSmall ? 16 : 18),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Future<void> _handleSave(BuildContext context) async {
    if (!ctrl.validateForm()) {
      _showErrorDialog(context);
      return;
    }

    final result = await ctrl.saveDiseasePesticideData(surveyData);
    if (!context.mounted) return;

    if (result == null) {
      _showErrorDialog(context,
          customErrors: ['An unexpected error occurred. Please try again.']);
      return;
    }

    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(children: [
            const Icon(Icons.check_circle, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                result.message ?? 'Details saved successfully',
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w600),
              ),
            ),
          ]),
          backgroundColor: _primaryGreen,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 2),
        ),
      );
      await Future.delayed(const Duration(milliseconds: 2200));
      if (!context.mounted) return;
      Get.back(result: result.payload);
      return;
    }

    _showErrorDialog(context,
        customErrors: [result.message ?? 'An unexpected error occurred']);
  }

  void _showErrorDialog(BuildContext context, {List<String>? customErrors}) {
    final errors = customErrors ?? ctrl.getValidationErrors();
    final isApiError = customErrors != null;

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape:
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(children: [
          Icon(
            isApiError ? Icons.cloud_off_rounded : Icons.error_outline,
            color: _accentRed,
            size: 26,
          ),
          const SizedBox(width: 12),
          Text(
            isApiError ? 'Save Failed' : 'Validation Error',
            style:
            const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
          ),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isApiError ? 'Could not save details:' : 'Please fix the following:',
              style: const TextStyle(
                  fontWeight: FontWeight.w600, color: _textPrimary),
            ),
            const SizedBox(height: 12),
            ...errors.map((e) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 5),
                      child: Icon(Icons.circle,
                          size: 6, color: _accentRed),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(e,
                            style: const TextStyle(
                                fontSize: 13, color: _textSecondary))),
                  ]),
            )),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: _primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('OK',
                style: TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED REUSABLE WIDGETS
// ─────────────────────────────────────────────────────────────────────────────

class _ResetDropdown<T> extends StatefulWidget {
  final String hintText;
  final IconData hintIcon;
  final bool enabled;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onPick;
  final bool isSmall;

  const _ResetDropdown({
    super.key,
    required this.hintText,
    required this.hintIcon,
    required this.enabled,
    required this.items,
    required this.onPick,
    required this.isSmall,
  });

  @override
  State<_ResetDropdown<T>> createState() => _ResetDropdownState<T>();
}

class _ResetDropdownState<T> extends State<_ResetDropdown<T>> {
  Key _key = UniqueKey();

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      key: _key,
      initialValue: null,
      isExpanded: true,
      hint: Row(children: [
        Icon(widget.hintIcon,
            size: widget.isSmall ? 16 : 18, color: Colors.grey.shade400),
        const SizedBox(width: 10),
        Text(widget.hintText,
            style: TextStyle(
                color: Colors.grey.shade500,
                fontSize: widget.isSmall ? 13 : 14)),
      ]),
      items: widget.items,
      onChanged: widget.enabled
          ? (val) {
        widget.onPick(val);
        setState(() => _key = UniqueKey());
      }
          : null,
      decoration: _dropdownDecoration(widget.isSmall),
      icon: Icon(Icons.arrow_drop_down, color: Colors.grey.shade400),
    );
  }
}

class _RemovableChip extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onRemove;
  final bool isSmall;
  const _RemovableChip({
    required this.label,
    required this.color,
    required this.onRemove,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
          left: 10, top: isSmall ? 5 : 6, bottom: isSmall ? 5 : 6, right: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1.5),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label,
            style: TextStyle(
                fontSize: isSmall ? 12 : 13,
                fontWeight: FontWeight.w600,
                color: color)),
        const SizedBox(width: 4),
        IconButton(
          onPressed: onRemove,
          constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
          padding: EdgeInsets.zero,
          icon: Container(
            width: isSmall ? 20 : 22,
            height: isSmall ? 20 : 22,
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
            child: Icon(Icons.close, size: isSmall ? 13 : 14, color: color),
          ),
        ),
      ]),
    );
  }
}

class _NpkBadge extends StatelessWidget {
  final String element;
  final int value;
  final Color color;
  final bool isSmall;
  const _NpkBadge(this.element, this.value, this.color, this.isSmall);

  @override
  Widget build(BuildContext context) => Container(
    padding:
    EdgeInsets.symmetric(horizontal: isSmall ? 7 : 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.1),
      borderRadius: BorderRadius.circular(6),
      border: Border.all(color: color.withValues(alpha: 0.3)),
    ),
    child: Text('$element: $value%',
        style: TextStyle(
            fontSize: isSmall ? 10 : 11,
            fontWeight: FontWeight.w700,
            color: color)),
  );
}

class _FieldLabel extends StatelessWidget {
  final String text;
  final bool isSmall;
  final bool required;
  const _FieldLabel({
    required this.text,
    required this.isSmall,
    this.required = false,
  });

  @override
  Widget build(BuildContext context) => Row(children: [
    Text(text,
        style: TextStyle(
            fontSize: isSmall ? 12 : 13,
            fontWeight: FontWeight.w600,
            color: _textSecondary,
            letterSpacing: 0.2)),
    if (required) ...[
      const SizedBox(width: 4),
      const Text('*',
          style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: _accentRed))
    ],
  ]);
}

class _ToggleRow extends StatelessWidget {
  final String leftLabel;
  final IconData leftIcon;
  final Color leftColor;
  final bool leftSelected;
  final VoidCallback onLeftTap;
  final String rightLabel;
  final IconData rightIcon;
  final Color rightColor;
  final bool rightSelected;
  final VoidCallback onRightTap;
  final bool isSmall;

  const _ToggleRow({
    required this.leftLabel,
    required this.leftIcon,
    required this.leftColor,
    required this.leftSelected,
    required this.onLeftTap,
    required this.rightLabel,
    required this.rightIcon,
    required this.rightColor,
    required this.rightSelected,
    required this.onRightTap,
    required this.isSmall,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(minHeight: isSmall ? 48 : 52),
      decoration: BoxDecoration(
        color: _surfaceColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200, width: 1.5),
      ),
      padding: const EdgeInsets.all(4),
      child: IntrinsicHeight(
        child: Row(children: [
          Expanded(
              child: _OptionBtn(
                  label: leftLabel,
                  icon: leftIcon,
                  isSelected: leftSelected,
                  onTap: onLeftTap,
                  isSmall: isSmall,
                  color: leftColor)),
          const SizedBox(width: 4),
          Expanded(
              child: _OptionBtn(
                  label: rightLabel,
                  icon: rightIcon,
                  isSelected: rightSelected,
                  onTap: onRightTap,
                  isSmall: isSmall,
                  color: rightColor)),
        ]),
      ),
    );
  }
}

class _OptionBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isSmall;
  final Color color;
  const _OptionBtn({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
    required this.isSmall,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(8),
    child: AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: isSelected ? color : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        boxShadow: isSelected
            ? [
          BoxShadow(
              color: color.withValues(alpha: 0.3),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ]
            : null,
      ),
      child: Center(
          child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon,
                    size: isSmall ? 16 : 18,
                    color: isSelected ? Colors.white : Colors.grey.shade500),
                const SizedBox(width: 6),
                Flexible(
                    child: Text(label,
                        style: TextStyle(
                          fontSize: isSmall ? 11 : 12,
                          fontWeight: isSelected
                              ? FontWeight.w700
                              : FontWeight.w600,
                          color: isSelected
                              ? Colors.white
                              : Colors.grey.shade600,
                        ),
                        overflow: TextOverflow.ellipsis)),
              ])),
    ),
  );
}

class _LabeledTextField extends StatelessWidget {
  final String label;
  final String hint;
  final IconData icon;
  final TextEditingController textController;
  final bool isSmall;
  final bool isRequired;
  final int maxLines;
  const _LabeledTextField({
    required this.label,
    required this.hint,
    required this.icon,
    required this.textController,
    required this.isSmall,
    this.isRequired = false,
    this.maxLines = 1,
  });

  @override
  Widget build(BuildContext context) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _FieldLabel(text: label, isSmall: isSmall, required: isRequired),
        const SizedBox(height: 8),
        TextFormField(
          controller: textController,
          maxLines: maxLines,
          style: TextStyle(
              fontSize: isSmall ? 13 : 14,
              fontWeight: FontWeight.w500,
              color: _textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(
                color: Colors.grey.shade400, fontSize: isSmall ? 12 : 13),
            prefixIcon: Container(
              margin: const EdgeInsets.all(8),
              padding: EdgeInsets.all(isSmall ? 8 : 10),
              decoration: BoxDecoration(
                  color: _primaryGreen.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, size: isSmall ? 16 : 18, color: _primaryGreen),
            ),
            filled: true,
            fillColor: _surfaceColor,
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide:
                BorderSide(color: Colors.grey.shade200, width: 1.5)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: _primaryGreen, width: 2)),
            contentPadding: EdgeInsets.symmetric(
                horizontal: isSmall ? 12 : 14,
                vertical: isSmall ? 12 : 14),
          ),
        ),
      ]);
}

class _LoadingRow extends StatelessWidget {
  final String message;
  final bool isSmall;
  const _LoadingRow({required this.message, required this.isSmall});

  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 12 : 14, vertical: isSmall ? 16 : 18),
    decoration: BoxDecoration(
      color: _surfaceColor,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: Colors.grey.shade200, width: 1.5),
    ),
    child: Row(children: [
      const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor:
              AlwaysStoppedAnimation<Color>(_primaryGreen))),
      const SizedBox(width: 12),
      Text(message,
          style: TextStyle(
              color: _textSecondary, fontSize: isSmall ? 13 : 14)),
    ]),
  );
}

// ─── Small helper builders ────────────────────────────────────────────────────

Widget _miniLabel(String text, bool isSmall) => Text(text,
    style: TextStyle(
        fontSize: isSmall ? 11 : 12,
        fontWeight: FontWeight.w600,
        color: _textSecondary));

Widget _tagBadge(String text, IconData icon, Color color, bool isSmall) =>
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(6)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 4),
        Text(text,
            style: TextStyle(
                fontSize: isSmall ? 11 : 12,
                fontWeight: FontWeight.w600,
                color: color)),
      ]),
    );

Widget _typeBadge(IconData icon, String text, Color color, bool isSmall) =>
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(6)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 4),
        Text(text,
            style: TextStyle(
                fontSize: isSmall ? 10 : 11,
                fontWeight: FontWeight.w600,
                color: color)),
      ]),
    );

Widget _numberBadge(int n, Color color, bool isSmall) => Container(
  width: isSmall ? 26 : 28,
  height: isSmall ? 26 : 28,
  decoration: BoxDecoration(
      color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
  child: Center(
      child: Text('$n',
          style: TextStyle(
              fontSize: isSmall ? 10 : 11,
              fontWeight: FontWeight.w700,
              color: color))),
);

Widget _removeIconBtn(VoidCallback onTap, bool isSmall) => IconButton(
  onPressed: onTap,
  constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
  padding: EdgeInsets.zero,
  icon: Container(
    width: isSmall ? 30 : 34,
    height: isSmall ? 30 : 34,
    decoration: BoxDecoration(
      color: _accentRed.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: _accentRed.withValues(alpha: 0.2)),
    ),
    child: Icon(Icons.close, size: isSmall ? 15 : 17, color: _accentRed),
  ),
);

InputDecoration _orangeInputDecoration(String hint, bool isSmall) =>
    InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(
          color: Colors.grey.shade400, fontSize: isSmall ? 12 : 13),
      filled: true,
      fillColor: _accentOrange.withValues(alpha: 0.04),
      border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
              color: _accentOrange.withValues(alpha: 0.35), width: 1.5)),
      focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: _accentOrange, width: 2)),
      contentPadding:
      const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
      isDense: true,
    );

InputDecoration _dropdownDecoration(bool isSmall) => InputDecoration(
  border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5)),
  enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5)),
  focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(
          color: _primaryGreen.withValues(alpha: 0.5), width: 1.5)),
  contentPadding: EdgeInsets.symmetric(
      horizontal: isSmall ? 12 : 14, vertical: isSmall ? 12 : 14),
  filled: true,
  fillColor: _surfaceColor,
);