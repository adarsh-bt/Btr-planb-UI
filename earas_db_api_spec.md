# EARAS Area Estimation Module — Database & API Specification

> **Scope**: All tables, log tables, and REST API endpoints for the Area Estimation sub-module of AIDeA.  
> **Base URL**: `/api/v1/earas`  
> **Auth**: Bearer JWT token on all endpoints unless marked `[PUBLIC]`

---

## 1. Database Tables

### 1.1 Core Reference Tables

#### `earas_estimation_type`
Lookup for the four estimation categories.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `code` | VARCHAR(50) UNIQUE | `SEASONAL_CROPS`, `ANNUAL_PERENNIAL`, `LAND_UTILIZATION`, `IRRIGATION` |
| `name` | VARCHAR(100) | Display name |
| `is_seasonal` | BOOLEAN | Indicates if season selection applies |
| `created_at` | TIMESTAMP | |

---

#### `earas_season`
Lookup for seasons.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `name` | VARCHAR(20) UNIQUE | `Autumn`, `Winter`, `Summer` |

---

#### `earas_agriculture_year`
Valid agricultural years managed by IT Admin.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `year_label` | VARCHAR(10) UNIQUE | e.g. `2026` |
| `is_active` | BOOLEAN | Currently active year |
| `created_at` | TIMESTAMP | |

---

#### `earas_crop`
Master list of crops per estimation type.

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AUTO | |
| `estimation_type_id` | INT FK → `earas_estimation_type` | |
| `name` | VARCHAR(100) | e.g. `Paddy`, `Wheat`, `Coconut` |
| `category` | VARCHAR(50) | `Wet`, `Dry`, `Total` etc. |
| `is_active` | BOOLEAN | |

---

### 1.2 Geographical Hierarchy Tables

> These already exist as master tables. Estimation data references them.

| Table | Key Columns |
|---|---|
| `district` | `id`, `name`, `state_id` |
| `taluk` | `id`, `name`, `district_id` |
| `block` | `id`, `name`, `taluk_id` |
| `panchayat` | `id`, `name`, `block_id` |
| `zone` | `id`, `zone_code`, `name`, `panchayat_id`, `taluk_id` |

---

### 1.3 Form-1 Submission Tracking

#### `earas_form1_submission_status`
Tracks whether each zone has submitted Form-1 data for a season.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `zone_id` | INT FK → `zone` | |
| `agri_year_id` | INT FK → `earas_agriculture_year` | |
| `season_id` | INT FK → `earas_season` | NULL for non-seasonal types |
| `estimation_type_id` | INT FK → `earas_estimation_type` | |
| `is_submitted` | BOOLEAN | Default false |
| `submitted_at` | TIMESTAMP | NULL until submitted |
| `submitted_by` | INT FK → `user` | |
| `pending_cluster_ids` | JSON | Array of cluster IDs not yet submitted |
| `updated_at` | TIMESTAMP | |

---

### 1.4 Estimation Workflow

#### `earas_estimation_run`
One record per initiated estimation run.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `estimation_type_id` | INT FK → `earas_estimation_type` | |
| `agri_year_id` | INT FK → `earas_agriculture_year` | |
| `season_id` | INT FK → `earas_season` | NULL for non-seasonal |
| `district_id` | INT FK → `district` | NULL = State-wide (All) |
| `status` | ENUM | `VALIDATION_PENDING`, `READY`, `RUNNING`, `REVIEW_REQUIRED`, `AWAITING_VERIFIER_1`, `AWAITING_VERIFIER_2`, `AWAITING_VERIFIER_3`, `AWAITING_APPROVER_2`, `AWAITING_DIRECTOR`, `COMPLETED`, `RESET` |
| `initiated_by` | INT FK → `user` | |
| `initiated_at` | TIMESTAMP | |
| `completed_at` | TIMESTAMP | NULL until done |
| `last_validated_at` | TIMESTAMP | Time of last Form-1 validation check |
| `validation_passed` | BOOLEAN | Result of last validation |

---

### 1.5 Estimation Results

#### `earas_estimation_result`
Stores computed area estimation figures per geographical unit, crop, and land type.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `run_id` | BIGINT FK → `earas_estimation_run` | |
| `geo_level` | ENUM | `STATE`, `DISTRICT`, `TALUK`, `BLOCK`, `PANCHAYAT` |
| `district_id` | INT FK → `district` | NULL if state level |
| `taluk_id` | INT FK → `taluk` | NULL if above taluk level |
| `block_id` | INT FK → `block` | NULL if above block level |
| `panchayat_id` | INT FK → `panchayat` | NULL if above panchayat level |
| `zone_id` | INT FK → `zone` | NULL if above zone level |
| `crop_id` | INT FK → `earas_crop` | |
| `irrigated_area_ha` | DECIMAL(12,4) | |
| `unirrigated_area_ha` | DECIMAL(12,4) | |
| `total_area_ha` | DECIMAL(12,4) | |
| `wet_area_ha` | DECIMAL(12,4) | NULL for non-applicable types |
| `dry_area_ha` | DECIMAL(12,4) | NULL for non-applicable types |
| `computed_at` | TIMESTAMP | When this row was computed |

---

### 1.6 Workflow Activity Log *(new)*

#### `earas_workflow_activity`
Chronological log of every user action in the estimation workflow.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `run_id` | BIGINT FK → `earas_estimation_run` | |
| `user_id` | INT FK → `user` | |
| `user_email` | VARCHAR(150) | Denormalised for fast display |
| `action` | VARCHAR(200) | e.g. `Data Validation Passed`, `Area Estimation Initiated` |
| `from_status` | VARCHAR(50) | Status before action |
| `to_status` | VARCHAR(50) | Status after action |
| `remarks` | TEXT | Optional comments entered by user |
| `action_at` | TIMESTAMP DEFAULT NOW() | |

> **Index**: `(run_id, action_at DESC)` for timeline queries.

---

### 1.7 Observations & Clarifications

#### `earas_observation`
Observations (data issues / discrepancies) raised during review.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `run_id` | BIGINT FK → `earas_estimation_run` | |
| `raised_by` | INT FK → `user` | |
| `obs_type` | VARCHAR(50) | `Data Issue`, `Field Discrepancy`, `Methodology Concern` etc. |
| `severity` | ENUM | `Low`, `Medium`, `High` |
| `zone_id` | INT FK → `zone` | Zone assigned for clarification |
| `crop_id` | INT FK → `earas_crop` | NULL if general |
| `panchayat_id` | INT FK → `panchayat` | NULL if zone-level |
| `remarks` | TEXT | Description of the issue |
| `status` | ENUM | `OPEN`, `CLARIFICATION_REQUESTED`, `RESUBMITTED`, `APPROVED`, `REJECTED` |
| `raised_at` | TIMESTAMP | |
| `resolved_at` | TIMESTAMP | NULL until resolved |

---

#### `earas_observation_response`
Zone user responses to raised observations.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `observation_id` | BIGINT FK → `earas_observation` | |
| `responded_by` | INT FK → `user` | Zone investigator / officer |
| `response_text` | TEXT | Explanation / justification |
| `supporting_notes` | TEXT | Optional additional notes |
| `responded_at` | TIMESTAMP | |

---

### 1.8 Discrepancy / Flag Log *(Panchayat-level)*

#### `earas_discrepancy_flag`
Flags raised on specific panchayat-level estimation values.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `run_id` | BIGINT FK → `earas_estimation_run` | |
| `result_id` | BIGINT FK → `earas_estimation_result` | The flagged row |
| `flagged_by` | INT FK → `user` | |
| `zone_name` | VARCHAR(100) | Denormalised |
| `crop_id` | INT FK → `earas_crop` | |
| `description` | TEXT | |
| `severity` | ENUM | `Low`, `Medium`, `High` |
| `status` | ENUM | `PENDING`, `REVIEWED`, `DISMISSED` |
| `flagged_at` | TIMESTAMP | |
| `reviewed_by` | INT FK → `user` | NULL until reviewed |
| `reviewed_at` | TIMESTAMP | |

---

### 1.9 Notification Log *(new)*

#### `earas_notification`
System-generated notifications sent to EARAS users.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `user_id` | INT FK → `user` | Target user (NULL = broadcast to role) |
| `target_role` | VARCHAR(100) | NULL if targeted to specific user |
| `title` | VARCHAR(200) | |
| `message` | TEXT | |
| `type` | ENUM | `info`, `success`, `warning`, `error` |
| `run_id` | BIGINT FK → `earas_estimation_run` | NULL if not run-specific |
| `is_read` | BOOLEAN DEFAULT false | |
| `created_at` | TIMESTAMP | |
| `read_at` | TIMESTAMP | NULL until read |

---

### 1.10 Audit Trail *(system-level)*

#### `earas_audit_trail`
Low-level system audit log for all EARAS operations.

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK AUTO | |
| `user_id` | INT FK → `user` | NULL for system events |
| `user_email` | VARCHAR(150) | Denormalised |
| `action` | VARCHAR(200) | |
| `entity_type` | VARCHAR(50) | `estimation_run`, `observation`, `discrepancy` etc. |
| `entity_id` | BIGINT | FK to the relevant entity |
| `old_value` | JSON | State before change |
| `new_value` | JSON | State after change |
| `ip_address` | VARCHAR(45) | |
| `performed_at` | TIMESTAMP DEFAULT NOW() | |

---

## 2. REST API Endpoints

### 2.1 Form-1 Validation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/form1/submission-status` | Get Form-1 submission status for all zones |
| `GET` | `/form1/submission-status/{zoneId}` | Status for a specific zone |
| `POST` | `/form1/validate` | Validate all Form-1 submissions for the given type/season/year |
| `GET` | `/form1/pending-zones` | List zones with pending Form-1 submissions |

**Query params for `/form1/validate`:**
```
estimationTypeCode, agriYear, season, districtId (optional)
```

**Response:**
```json
{
  "passed": true,
  "pendingZones": [
    { "zoneId": 12, "zoneName": "Zone KLM-02", "district": "Kollam", "taluk": "Kollam", "pendingClusters": [3, 7], "investigatorName": "..." }
  ]
}
```

---

### 2.2 Estimation Run Lifecycle

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/estimation/initiate` | Initiate a new estimation run |
| `GET` | `/estimation/run/status` | Get current status of the active run |
| `GET` | `/estimation/run/{runId}` | Get full run details |
| `GET` | `/estimation/runs` | List all runs (paginated, filterable) |
| `POST` | `/estimation/run/{runId}/workflow/advance` | Advance workflow to next state (verifiers/approvers) |
| `POST` | `/estimation/run/{runId}/workflow/reset` | Re-initiate / reset to Validation Pending |
| `POST` | `/estimation/run/{runId}/approve` | Final approval — set status to COMPLETED |

**Body for `POST /estimation/initiate`:**
```json
{
  "estimationTypeCode": "SEASONAL_CROPS",
  "agriYear": "2026",
  "season": "Autumn",
  "districtId": null
}
```

**Body for `POST /estimation/run/{runId}/workflow/advance`:**
```json
{
  "targetStatus": "AWAITING_VERIFIER_2",
  "remarks": "Verified by Level 1. Forwarding to Level 2."
}
```

---

### 2.3 Estimation Results

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/estimation/results/state` | State-level summary across all districts |
| `GET` | `/estimation/results/district/{districtId}` | Block-wise results for a district |
| `GET` | `/estimation/results/block/{blockId}` | Panchayat-wise results for a block |
| `GET` | `/estimation/results/panchayat/{panchayatId}` | Zone/crop-wise results for a panchayat |

**Common Query params:**
```
runId, estimationTypeCode, agriYear, season, cropId (optional), geoLevel
```

**Response shape (all geo levels):**
```json
{
  "runId": 42,
  "estimationType": "Seasonal Crops",
  "season": "Autumn",
  "agriYear": "2026",
  "rows": [
    {
      "id": 7,
      "name": "Ernakulam",
      "cropAreas": { "Paddy": 1800, "Wheat": 650 },
      "irrigatedArea": 1450,
      "unirrigatedArea": 1000,
      "totalArea": 2450
    }
  ],
  "totals": { "irrigated": 18000, "unirrigated": 12000, "total": 30000 }
}
```

---

### 2.4 Workflow Activity Log

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/estimation/run/{runId}/activity` | Get full activity timeline for a run |
| `POST` | `/estimation/run/{runId}/activity` | Add a new activity entry |

**Response for `GET /activity`:**
```json
{
  "runId": 42,
  "activities": [
    {
      "id": 5,
      "userEmail": "vimal.d@duk.ac.in",
      "action": "Area Estimation Initiated",
      "fromStatus": "READY",
      "toStatus": "RUNNING",
      "remarks": "Estimation started for Seasonal Crops — Autumn season.",
      "actionAt": "2026-07-09T08:23:00Z"
    }
  ]
}
```

---

### 2.5 Observations & Clarifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/estimation/run/{runId}/observations` | List all observations for a run |
| `POST` | `/estimation/run/{runId}/observations` | Add a new observation / clarification request |
| `GET` | `/estimation/observations/{obsId}` | Get observation detail with responses |
| `POST` | `/estimation/observations/{obsId}/respond` | Zone user submits response / resubmission |
| `PUT` | `/estimation/observations/{obsId}/approve` | Designating officer approves observation |
| `PUT` | `/estimation/observations/{obsId}/reject` | Designating officer rejects |
| `GET` | `/estimation/zone/{zoneId}/clarifications` | Get all observations assigned to a zone |

**Body for `POST /observations`:**
```json
{
  "obsType": "Data Issue",
  "severity": "High",
  "zoneId": 12,
  "cropId": 3,
  "panchayatId": null,
  "remarks": "High dry area variation in Coconut vs baseline census."
}
```

**Body for `POST /observations/{obsId}/respond`:**
```json
{
  "responseText": "Field verified — variation due to new plantation area.",
  "supportingNotes": "Supporting data from field survey attached."
}
```

---

### 2.6 Discrepancy Flags (Panchayat-level)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/estimation/results/panchayat/{panchayatId}/flag` | Flag a discrepancy on a panchayat result |
| `GET` | `/estimation/run/{runId}/flags` | List all flags for a run |
| `PUT` | `/estimation/flags/{flagId}/review` | Mark flag as reviewed (with decision) |
| `PUT` | `/estimation/flags/{flagId}/dismiss` | Dismiss a flag |

**Body for `POST /flag`:**
```json
{
  "resultId": 1234,
  "cropId": 2,
  "zoneName": "Zone TVM-01",
  "description": "Reported area seems unusually high.",
  "severity": "Medium"
}
```

---

### 2.7 Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications` | Get all notifications for the logged-in user |
| `GET` | `/notifications/unread-count` | Get count of unread notifications |
| `PUT` | `/notifications/mark-all-read` | Mark all as read |
| `PUT` | `/notifications/{id}/read` | Mark a single notification as read |

---

### 2.8 Audit Trail

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/audit-trail` | Paginated full audit trail (IT Admin / Super Admin only) |
| `GET` | `/audit-trail/run/{runId}` | Audit entries for a specific estimation run |

**Query params:** `userId, entityType, fromDate, toDate, page, size`

---

### 2.9 Dashboard Metrics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/metrics` | Summary counts for the dashboard cards |

**Query params:** `estimationTypeCode, agriYear, season, districtId`

**Response:**
```json
{
  "totalZones": 22,
  "submittedZones": 20,
  "formPendingZones": 2,
  "completedEstimations": 5,
  "clarificationsPending": 1,
  "currentStatus": "AWAITING_VERIFIER_1",
  "activeRunId": 42
}
```

---

## 3. Summary Table Count

| # | Table | Purpose |
|---|---|---|
| 1 | `earas_estimation_type` | Lookup — 4 estimation categories |
| 2 | `earas_season` | Lookup — Autumn / Winter / Summer |
| 3 | `earas_agriculture_year` | Active agri year management |
| 4 | `earas_crop` | Crop master per estimation type |
| 5 | `earas_form1_submission_status` | Zone-level Form-1 readiness |
| 6 | `earas_estimation_run` | One record per estimation run + current status |
| 7 | `earas_estimation_result` | Computed area values at all geo levels |
| 8 | `earas_workflow_activity` | ⭐ **New** — per-user action timeline |
| 9 | `earas_observation` | Data issue / discrepancy observations |
| 10 | `earas_observation_response` | Zone responses to observations |
| 11 | `earas_discrepancy_flag` | Panchayat-level value flags |
| 12 | `earas_notification` | ⭐ **New** — user/role notifications |
| 13 | `earas_audit_trail` | ⭐ **New** — full system audit log |

> **3 new tables** required: `earas_workflow_activity`, `earas_notification`, `earas_audit_trail`  
> **10 existing or straightforward tables** to implement data persistence currently handled by localStorage mock.
