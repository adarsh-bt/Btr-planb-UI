import 'dart:convert';
import 'package:http/http.dart' as http;


import '../../../../../resources/api_services/flutter_secure_storage.dart';
import '../../../../../resources/constants/path.dart';

// ==================== MODELS ====================

class CceFrameResponse {
  final CceFramePayload? payload;
  final String? message;

  CceFrameResponse({this.payload, this.message});

  factory CceFrameResponse.fromJson(Map<String, dynamic> json) {
    return CceFrameResponse(
      payload: json['payload'] != null
          ? CceFramePayload.fromJson(json['payload'])
          : null,
      message: json['message'],
    );
  }
}

class CceFramePayload {
  final int? frameMeasure;
  final int? cropId;
  final int? frameUnitId;
  final String? frameUnit;
  final bool? isTreeWiseCollection;  // ✅ Add this
  final double? frameLength;          // ✅ Add this
  final double? frameWidth;
  final bool? isCollectedRepeatedly;  // ✅ Add this

  CceFramePayload({
    this.frameMeasure,
    this.cropId,
    this.frameUnitId,
    this.frameUnit,
    this.isTreeWiseCollection,  // ✅ Add this
    this.frameLength,           // ✅ Add this
    this.frameWidth,
    this.isCollectedRepeatedly, // ✅ Add this
  });
  factory CceFramePayload.fromJson(Map<String, dynamic> json) {
    return CceFramePayload(
      frameMeasure: json['frameMeasure'],
      cropId: json['cropId'],
      frameUnitId: json['frameUnitId'],
      frameUnit: json['frameUnit'],
      isTreeWiseCollection: json['isTreeWiseCollection'],  // ✅ Add this
      frameLength: json['frameLength']?.toDouble(),        // ✅ Add this
      frameWidth: json['frameWidth']?.toDouble(),
      isCollectedRepeatedly: json['isCollectedRepeatedly'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'frameMeasure': frameMeasure,
      'cropId': cropId,
      'frameUnitId': frameUnitId,
      'frameUnit': frameUnit,
      'isTreeWiseCollection': isTreeWiseCollection,  // ✅ Add this
      'frameLength': frameLength,                     // ✅ Add this
      'frameWidth': frameWidth,
      'isCollectedRepeatedly': isCollectedRepeatedly,
    };
  }
}

// ==================== FRAME UNIT ENUM ====================

enum FrameUnitType {
  plants(id: 6, label: 'Plants', icon: '🌱'),
  trees(id: 7, label: 'Trees', icon: '🌳'),
  squareMeters(id: 5, label: 'Square Meters', icon: '📐'),
  unknown(id: 0, label: 'Unknown', icon: '❓');

  final int id;
  final String label;
  final String icon;

  const FrameUnitType({
    required this.id,
    required this.label,
    required this.icon,
  });

  static FrameUnitType fromId(int? id) {
    switch (id) {
      case 6:
        return FrameUnitType.plants;
      case 7:
        return FrameUnitType.trees;
      case 5:
        return FrameUnitType.squareMeters;
      default:
        return FrameUnitType.unknown;
    }
  }

  static FrameUnitType fromString(String? unit) {
    if (unit == null) return FrameUnitType.unknown;

    switch (unit.toLowerCase()) {
      case 'plants':
      case 'plant':
        return FrameUnitType.plants;
      case 'trees':
      case 'tree':
        return FrameUnitType.trees;
      case 'sqm':
      case 'square meters':
      case 'sq.m':
      case 'square meter':
        return FrameUnitType.squareMeters;
      default:
        return FrameUnitType.unknown;
    }
  }
}

// ==================== SERVICE CLASS ====================

class CceFrameService {
  static const String _endpoint = cceFrame; // Replace with actual endpoint

  /// Fetches CCE frame data for the given crop
  static Future<CceFrameResponse?> fetchCceFrameData({
    required String cropId,
  }) async {
    try {
      final _storage = StorageService.instance;
      // REPLACE WITH
      final results = await Future.wait([
        _storage.read('authToken'),
        _storage.read('zoneId'),
      ]);
      final token  = results[0];
      final zoneId = results[1];

      if (token == null || zoneId == null) {
        throw Exception('Missing authentication data');
      }

      final requestBody = {
        'cropId': int.tryParse(cropId.toString()) ?? cropId,
      };

      print('--- DEBUG: fetchCceFrameData API Call ---');
      print('URL: $_endpoint');
      print('RequestBody: $requestBody');

      final response = await http.post(
        Uri.parse(_endpoint),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(requestBody),
      );
      
      print('Response Status: ${response.statusCode}');
      print('Response Body: ${response.body}');
      print('-------------------------------------------');

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);

        return CceFrameResponse.fromJson(jsonResponse);
      } else {
        throw Exception('Failed to fetch CCE frame data: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }
  static String getFrameUnitDescription(FrameUnitType type) {
    switch (type) {
      case FrameUnitType.plants:
        return 'Count individual plants within the frame area';
      case FrameUnitType.trees:
        return 'Count individual trees within the designated area';
      case FrameUnitType.squareMeters:
        return 'Measure crop density per square meter';
      case FrameUnitType.unknown:
        return 'Frame unit not specified';
    }
  }

  /// Helper method to get measurement instructions
  static String getMeasurementInstructions(FrameUnitType type, int frameMeasure) {
    switch (type) {
      case FrameUnitType.plants:
        return 'Place $frameMeasure frame(s) randomly and count all plants within each frame';
      case FrameUnitType.trees:
        return 'Select $frameMeasure tree(s) randomly for detailed measurement';
      case FrameUnitType.squareMeters:
        return 'Mark $frameMeasure square meter area(s) and measure crop density';
      case FrameUnitType.unknown:
        return 'Follow standard measurement protocol';
    }
  }
}