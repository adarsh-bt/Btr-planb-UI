# EARAS Area Estimation API Integration Guide

This document outlines the API endpoints, fields, and payload rules required for integrating the Area Estimation UI with the backend API services using Axios.

All API functions are centralized in [areaEstimationService.js](src/pages/functional-components/earas/area-estimation/areaEstimationService.js).

---

## 1. Centralized Axios Service Toggle
To switch from mock simulation to live API requests, set the `USE_MOCK_API` constant to `false` in [areaEstimationService.js](src/pages/functional-components/earas/area-estimation/areaEstimationService.js#L487):
```javascript
const USE_MOCK_API = false;
const API_BASE_URL = 'https://your-api-domain.com/api/v1/earas';
```

---

## 2. Page-wise API Reference

### Page A: Estimation Dashboard (Initiate Workflow)
* **UI Component**: [AreaEstimationDashboard.jsx](src/pages/functional-components/earas/area-estimation/AreaEstimationDashboard.jsx)
* **Axios Function**: `areaEstimationService.apiInitiateEstimation({ estType, year, season, districtId })`
* **Trigger**: Click of the "Initiate Estimation" button.
* **HTTP Method**: `POST`
* **Endpoint**: `/estimation/initiate`
* **Payload Fields**:
  | Field Name | Type | Value Range / Description |
  | :--- | :--- | :--- |
  | `estType` | string | `'Seasonal Crops'` \| `'Land Utilization'` \| `'Irrigation'` \| `'Annual & Perennial Crops'` |
  | `agricultureYear` | string | Target year (e.g., `'2026'`) |
  | `season` | string | Target season (e.g., `'Autumn'` \| `'Winter'` \| `'Summer'`) |
  | `districtId` | string/int | `'All'` or specific district integer ID |

---

### Pages B, C, D: Estimation Results (State, District, Block Levels)
* **UI Components**:
  * State: [StateAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/StateAreaEstimation.jsx) & [SeasonalStateAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/SeasonalStateAreaEstimation.jsx)
  * District: [DistrictAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/DistrictAreaEstimation.jsx) & [SeasonalDistrictAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/SeasonalDistrictAreaEstimation.jsx)
  * Block: [BlockAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/BlockAreaEstimation.jsx) & [SeasonalBlockAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/SeasonalBlockAreaEstimation.jsx)
* **Axios Function**: `areaEstimationService.fetchEstimationResults({ geoLevel, estType, season, year, districtId, blockId })`
* **Trigger**: Page component mount/render.
* **HTTP Method**: `GET`
* **Endpoint**: `/estimation/results`
* **Query Parameters**:
  | Query Key | Type | Description |
  | :--- | :--- | :--- |
  | `geoLevel` | string | Target level: `'State'` \| `'District'` \| `'Block'` \| `'Panchayat'` |
  | `estType` | string | Selected estimation type |
  | `season` | string | Selected season (ignored for non-seasonal categories) |
  | `year` | string | Agriculture Year (e.g., `'2026'`) |
  | `districtId` | int | Optional (filter by district) |
  | `blockId` | int | Optional (filter by block) |
* **Expected Response Schema (Pivot-ready)**:
  ```json
  {
    "categories": ["Paddy", "Wheat"],
    "records": [
      {
        "id": 101,
        "name": "Block Alpha",
        "cropAreas": {
          "Paddy": 450,
          "Wheat": 320
        },
        "totalArea": 770
      }
    ]
  }
  ```

---

### Page E: Detailed Estimation (Panchayat/Zone Level results)
* **UI Components**: [PanchayatAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/PanchayatAreaEstimation.jsx) & [SeasonalPanchayatAreaEstimation.jsx](src/pages/functional-components/earas/area-estimation/SeasonalPanchayatAreaEstimation.jsx)
* **Axios Functions**:
  1. **Fetch Results**: `fetchEstimationResults` (see above parameters, with `geoLevel: 'Panchayat'`).
  2. **Flag Discrepancy (Mark Problem)**: `areaEstimationService.apiFlagDiscrepancy({ panchayatId, zoneName, crop, description, severity })`
* **Flag Discrepancy Details**:
  * **HTTP Method**: `POST`
  * **Endpoint**: `/estimation/flag-discrepancy`
  * **Payload Fields**:
    | Field Name | Type | Description |
    | :--- | :--- | :--- |
    | `panchayatId` | string/int | Current Panchayat ID |
    | `zoneName` | string | Target Zone Name (e.g., `'Zone KLM-02'`) |
    | `category` | string | Target crop or land utilization category name |
    | `details` | string | Text description of the reported issue |
    | `severityLevel` | string | `'Low'` \| `'Medium'` \| `'High'` |

---

## 3. Integration Rules to Follow
1. **Agriculture Year Format**: Always format as a single calendar year string (e.g. `'2026'`) or a range if your backend specifically expects it (e.g., `'2025-26'`).
2. **Category Names**: Standardize naming across systems:
   * **Seasonal Crops**: `'Paddy'`, `'Wheat'`, etc.
   * **Land Utilization (Form-2)**: `'Forest'`, `'Barren Land'`, `'Net Area Sown'`, `'Culturable Waste'`.
   * **Irrigation**: `'Canals'`, `'Wells'`, `'Tanks'`, `'Other Sources'`.
3. **HTTP Errors**: Handle API responses in try/catch blocks; when APIs fail, notify users gracefully via Toast alerts.
