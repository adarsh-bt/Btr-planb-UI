import 'package:aidea/controller/cce/cce_data_entry/random_cce_cultivator_popup.dart .dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../resources/utils/snackbar_helper.dart';

class RandomCCECultivatorPopup extends StatelessWidget {
  final String cropName;
  final String mappingId;
  final String clusterNumber;
  final String direction;
  final void Function(double) onPopupClose;

  const RandomCCECultivatorPopup({
    super.key,
    required this.cropName,
    required this.mappingId,
    required this.clusterNumber,
    required this.direction,
    required this.onPopupClose,
    required String clusterId,
    required String cropId,
    required void Function(double p1) onSaveArea,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final controller = Get.put(RandomCCECultivatorController());

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        width: width * 0.9,
        constraints: BoxConstraints(maxWidth: 500),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          color: Colors.white,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green.shade700, Colors.green.shade500],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      "Plot Configuration",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: Get.back,
                  ),
                ],
              ),
            ),

            // Content
            Flexible(
              child: Obx(() => SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Multiple Cultivators Section
                    _buildSectionTitle("Multiple Cultivators"),
                    const SizedBox(height: 12),
                    _buildToggleSection(
                      controller.selectedTab.value,
                          (value) {
                        if (value != controller.selectedTab.value) {
                          controller.clear();
                        }
                        controller.selectedTab.value = value;
                      },
                    ),

                    // Show Number of Cultivators input when "Yes" is selected
                    if (controller.selectedTab.value == 'Yes') ...[
                      const SizedBox(height: 24),
                      _buildInputSection(
                        context: context,
                        title: "Number of Cultivators",
                        hint: "Enter number of cultivators",
                        onChanged: controller.updateNumber,
                        randomValue: controller.generatedValue.value,
                        onGenerate: () {
                          controller.generateRandom();
                        },
                      ),

                      // Show "Has Multiple Patches" section after cultivator value is generated
                      if (controller.generatedValue.value.isNotEmpty &&
                          controller.generatedValue.value != "Invalid") ...[
                        const SizedBox(height: 24),
                        const Divider(height: 32),
                        _buildSectionTitle("Has Multiple Patches"),
                        const SizedBox(height: 12),
                        _buildToggleSection(
                          controller.patchTab.value,
                              (value) {
                            controller.patchTab.value = value;
                            if (value == 'No') {
                              // Check if mounted before using context
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                if (context.mounted) {
                                  _showDetailsPopup(context);
                                }
                              });
                            }
                          },
                        ),

                        // Show Number of Patches input when "Yes" is selected
                        if (controller.patchTab.value == 'Yes') ...[
                          const SizedBox(height: 24),
                          _buildInputSection(
                            context: context,
                            title: "Number of Patches",
                            hint: "Enter number of patches",
                            onChanged: controller.updatePatchCount,
                            randomValue: controller.patchRandomValue.value,
                            onGenerate: () {
                              controller.generatePatchAndShowPopup(
                                cropName,
                                mappingId,
                                clusterNumber,
                                direction,
                                onPopupClose,
                              );
                            },
                          ),
                        ],
                      ],
                    ],

                    // If "No" for Multiple Cultivators, ask about Multiple Patches
                    if (controller.selectedTab.value == 'No') ...[
                      const SizedBox(height: 24),
                      const Divider(height: 32),
                      _buildSectionTitle("Has Multiple Patches"),
                      const SizedBox(height: 12),
                      _buildToggleSection(
                        controller.patchTab.value,
                            (value) {
                          controller.patchTab.value = value;
                          if (value == 'No') {
                            WidgetsBinding.instance.addPostFrameCallback((_) {
                              if (context.mounted) {
                                _showDetailsPopup(context);
                              }
                            });
                          }
                        },
                      ),

                      // Show Number of Patches input when "Yes" is selected
                      if (controller.patchTab.value == 'Yes') ...[
                        const SizedBox(height: 24),
                        _buildInputSection(
                          context: context,
                          title: "Number of Patches",
                          hint: "Enter number of patches",
                          onChanged: controller.updatePatchCount,
                          randomValue: controller.patchRandomValue.value,
                          onGenerate: () {
                            controller.generatePatchAndShowPopup(
                              cropName,
                              mappingId,
                              clusterNumber,
                              direction,
                              onPopupClose,
                            );
                          },
                        ),
                      ],
                    ],

                    const SizedBox(height: 8),
                  ],
                ),
              )),
            ),

            // Save Details Button - Shows when all data is complete
            Obx(() {
              final showButton = _shouldShowSaveButton(controller);
              if (!showButton) return const SizedBox.shrink();
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border(
                    top: BorderSide(color: Colors.grey.shade200),
                  ),
                ),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      _showDetailsPopup(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade700,
                      foregroundColor: Colors.white,
                      elevation: 3,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.save, size: 20),
                        SizedBox(width: 8),
                        Text(
                          "Save Details",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  // Helper method to determine when to show the Save Details button
  bool _shouldShowSaveButton(RandomCCECultivatorController controller) {
    // Show button when patches are generated (for both Yes/No cultivator scenarios)
    if (controller.patchTab.value == 'Yes' &&
        controller.patchRandomValue.value.isNotEmpty &&
        controller.patchRandomValue.value != "Invalid") {
      return true;
    }
    return false;
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 20,
          decoration: BoxDecoration(
            color: Colors.green.shade700,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade800,
          ),
        ),
      ],
    );
  }

  Widget _buildToggleSection(String selectedValue, Function(String) onChanged) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _buildToggleButton(
              label: "Yes",
              isSelected: selectedValue == 'Yes',
              onTap: () => onChanged('Yes'),
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: _buildToggleButton(
              label: "No",
              isSelected: selectedValue == 'No',
              onTap: () => onChanged('No'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.green.shade700 : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.green.shade700.withValues(alpha:0.3), blurRadius: 8, offset: const Offset(0, 2))]
              : [],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? Colors.white : Colors.grey.shade600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputSection({
    required BuildContext context,
    required String title,
    required String hint,
    required Function(String) onChanged,
    required String randomValue,
    required VoidCallback onGenerate,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: onChanged,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: TextStyle(color: Colors.grey.shade400),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: onGenerate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  elevation: 2,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.auto_awesome, size: 18),
                    SizedBox(width: 6),
                    Text("Generate", style: TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ],
          ),
          if (randomValue.isNotEmpty && randomValue != "Invalid") ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.green.shade700, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    "Generated Value: ",
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  Text(
                    randomValue,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.green.shade700,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
  // Details Popup Dialog
  void _showDetailsPopup(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final height = MediaQuery.of(context).size.height;
    String selectedIrrigationType = '';
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          child: Container(
            width: width * 0.95,
            constraints: BoxConstraints(
              maxWidth: 600,
              maxHeight: height * 0.9,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: Colors.white,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade700,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              cropName,
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.location_on, color: Colors.white, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  "Cluster: $clusterNumber",
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),

                // Content
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Expected Date
                        _buildInputLabel("Expected Date", Icons.calendar_today),
                        const SizedBox(height: 8),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: ListTile(
                            leading: Icon(Icons.calendar_today, color: Colors.green.shade700, size: 20),
                            title: const Text(
                              "Select expected date",
                              style: TextStyle(color: Colors.grey, fontSize: 15),
                            ),
                            trailing: Icon(Icons.arrow_drop_down, color: Colors.grey.shade600),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            onTap: () {
                              // Date picker logic
                            },
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Survey Number
                        _buildInputLabel("Survey Number", Icons.format_list_numbered),
                        const SizedBox(height: 8),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: ListTile(
                            leading: Icon(Icons.format_list_numbered, color: Colors.green.shade700, size: 20),
                            title: const Text(
                              "Select survey number",
                              style: TextStyle(color: Colors.grey, fontSize: 15),
                            ),
                            trailing: Icon(Icons.arrow_drop_down, color: Colors.grey.shade600),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            onTap: () {
                              // Survey number picker logic
                            },
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Cultivated Area
                        _buildInputLabel("Cultivated Area (cents)", Icons.straighten),
                        const SizedBox(height: 8),
                        TextField(
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            hintText: "Enter area in cents",
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 15),
                            prefixIcon: Icon(Icons.straighten, color: Colors.green.shade700, size: 20),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Irrigation Type
                        _buildInputLabel("Irrigation Type", Icons.water_drop),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: _buildIrrigationButton(
                                "Irrigated",
                                selectedIrrigationType == "Irrigated",
                                    () {
                                  setState(() {
                                    selectedIrrigationType = "Irrigated";
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildIrrigationButton(
                                "Non-Irrigated",
                                selectedIrrigationType == "Non-Irrigated",
                                    () {
                                  setState(() {
                                    selectedIrrigationType = "Non-Irrigated";
                                  });
                                },
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),

                        // Farmer Details Section Header
                        Container(
                          padding: const EdgeInsets.only(left: 4, bottom: 8),
                          decoration: BoxDecoration(
                            border: Border(
                              left: BorderSide(color: Colors.green.shade700, width: 4),
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: Text(
                              "Farmer Details",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.green.shade700,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Farmer Name
                        TextField(
                          decoration: InputDecoration(
                            hintText: "Enter farmer name",
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 15),
                            prefixIcon: Icon(Icons.person, color: Colors.green.shade700, size: 20),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Address
                        TextField(
                          decoration: InputDecoration(
                            hintText: "Enter address",
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 15),
                            prefixIcon: Icon(Icons.home, color: Colors.green.shade700, size: 20),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Mobile Number
                        TextField(
                          keyboardType: TextInputType.phone,
                          decoration: InputDecoration(
                            hintText: "Enter mobile number",
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 15),
                            prefixIcon: Icon(Icons.phone, color: Colors.green.shade700, size: 20),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Remarks
                        _buildInputLabel("Remarks (Optional)", Icons.note),
                        const SizedBox(height: 8),
                        TextField(
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText: "Add any additional notes",
                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 15),
                            prefixIcon: Padding(
                              padding: const EdgeInsets.only(bottom: 45),
                              child: Icon(Icons.edit_note, color: Colors.green.shade700, size: 20),
                            ),
                            filled: true,
                            fillColor: Colors.grey.shade50,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey.shade300),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.green.shade700, width: 2),
                            ),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Action Buttons
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      top: BorderSide(color: Colors.grey.shade200),
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.grey.shade700,
                            side: BorderSide(color: Colors.grey.shade400, width: 1.5),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.close, size: 18, color: Colors.grey.shade700),
                              const SizedBox(width: 6),
                              const Text(
                                "Cancel",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: () {
                            // Handle save action
                            Navigator.pop(context);
                            Get.back();
                            SnackbarHelper.showSuccess(
                              "Success",
                              "Details saved successfully!",
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green.shade700,
                            foregroundColor: Colors.white,
                            elevation: 2,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.save, size: 18),
                              SizedBox(width: 6),
                              Text(
                                "Save Details",
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
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
    );
  }

  Widget _buildInputLabel(String label, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade700),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade700,
          ),
        ),
      ],
    );
  }

  Widget _buildIrrigationButton(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? Colors.green.shade700 : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.green.shade700 : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : Colors.grey.shade700,
            ),
          ),
        ),
      ),
    );
  }
}