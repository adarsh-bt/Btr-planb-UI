import api from 'api/api';

/**
 * The real Area Estimation backend.
 *
 * Every call goes through the shared `api` instance, which means through the API Gateway on
 * `mainapi.BASE_URL` with the bearer token attached — the same path every other module in this
 * application uses. No service URL is hardcoded here, and the browser never talks to BTR, Form-1 or
 * User Access directly: the estimation service does that server-side, where the tokens and the
 * service registry live.
 *
 * `/estimation-service` is the gateway's route prefix for this service (route 6), and the service
 * itself carries no extra context path beyond it.
 *
 * Responses are unwrapped here. The platform envelope is `{ payload, message }`, and every caller
 * wants the payload; leaving that unwrapping to thirteen components would be thirteen chances to
 * get it wrong.
 */

const BASE = '/estimation-service/api/v1/earas';

/** Unwraps the platform envelope. */
const payloadOf = (response) => response?.data?.payload;

// ──────────────────────────────────────────────
// Dashboard, validation and execution (M7, M9, M10)
// ──────────────────────────────────────────────

/**
 * Everything the dashboard renders for one selection, in one call.
 *
 * Returns a populated "not started" state rather than failing when no run exists yet, so the caller
 * does not have to treat "nothing has happened" as an error.
 */
export const fetchDashboard = async ({ estimationTypeCode, agriYear, seasonId, landType, districtId }) =>
  payloadOf(
    await api.get(`${BASE}/estimation/dashboard`, {
      params: { estimationTypeCode, agriYear, seasonId, landType, districtId }
    })
  );

/** Runs Form-1 availability validation. Creates or reuses the run for the selection. */
export const validateEstimation = async ({ estimationTypeCode, agriYear, seasonId, landType, districtId }) =>
  payloadOf(
    await api.post(`${BASE}/form1/validate`, {
      estimationTypeCode,
      agriYear,
      seasonId,
      landType,
      districtId
    })
  );

/** The zones that are not ready, for the pending drawer and its CSV. */
export const fetchPendingZones = async (runId) =>
  payloadOf(await api.get(`${BASE}/form1/pending-zones`, { params: { runId } }));

/** The active run for a selection, or null when none exists. This is what the dashboard polls. */
export const fetchActiveRunStatus = async ({ estimationTypeCode, agriYear, seasonId, landType, districtId }) =>
  payloadOf(
    await api.get(`${BASE}/estimation/run/status`, {
      params: { estimationTypeCode, agriYear, seasonId, landType, districtId }
    })
  );

export const fetchRunStatus = async (runId) => payloadOf(await api.get(`${BASE}/estimation/run/${runId}`));

/**
 * Starts an estimation.
 *
 * Asynchronous by default: the caller polls {@link fetchRunProgress} rather than holding a request
 * open for the length of a statewide run.
 */
/**
 * Starts a run.
 *
 * <p>`partialRun` estimates only the panchayats whose data fully passed validation, so results can
 * be seen for the districts that are ready. The backend decides which panchayats qualify; nothing
 * about that scope is computed here. A partial run cannot be approved or published.
 */
export const initiateEstimation = async ({
  estimationTypeCode,
  agriYear,
  seasonId,
  landType,
  districtId,
  partialRun = false
}) =>
  payloadOf(
    await api.post(`${BASE}/estimation/initiate`, {
      estimationTypeCode,
      agriYear,
      seasonId,
      landType,
      districtId,
      partialRun,
      synchronousExecution: false
    })
  );

/** Real execution progress — the engine's own stage and percentage, never a client-side timer. */
export const fetchRunProgress = async (runId) => payloadOf(await api.get(`${BASE}/estimation/run/${runId}/progress`));

export const fetchRunLog = async (runId) => payloadOf(await api.get(`${BASE}/estimation/run/${runId}/log`));

export const fetchRunWarnings = async (runId) => payloadOf(await api.get(`${BASE}/estimation/run/${runId}/warnings`));

// ──────────────────────────────────────────────
// Reporting and drill-down (M10)
// ──────────────────────────────────────────────

/** The run picker, including historical runs. */
export const fetchRuns = async ({ estimationTypeId, agriYear, seasonId, landType, districtId, status, page = 0, size = 25 } = {}) =>
  payloadOf(
    await api.get(`${BASE}/estimation/reports/runs`, {
      params: { estimationTypeId, agriYear, seasonId, landType, districtId, status, page, size }
    })
  );

/** One run's header, state totals and reconciliation status. */
export const fetchRunSummary = async (runId) => payloadOf(await api.get(`${BASE}/estimation/reports/run/${runId}`));

export const fetchReconciliation = async (runId) =>
  payloadOf(await api.get(`${BASE}/estimation/reports/run/${runId}/reconciliation`));

/**
 * One page of a drill-down level.
 *
 * Returns the pivot columns, the rows with their per-category hectares, the level total and the
 * parent's own persisted total. The parent total is not a sum of the rows — where they differ, the
 * response says so through `coverageComplete` and `coverageNote`.
 */
export const fetchBreakdown = async ({
  runId,
  geoLevel,
  parentGeoId,
  landType,
  categoryKey,
  includePreviousYear = true,
  page = 0,
  size = 25,
  sortBy = 'name',
  sortDirection = 'asc'
}) =>
  payloadOf(
    await api.get(`${BASE}/estimation/reports/run/${runId}/breakdown`, {
      params: { geoLevel, parentGeoId, landType, categoryKey, includePreviousYear, page, size, sortBy, sortDirection }
    })
  );

/** One panchayat's categories, with the enumerated cents behind each published hectare figure. */
export const fetchPanchayatDetail = async ({ runId, localbodyId, landType }) =>
  payloadOf(await api.get(`${BASE}/estimation/reports/run/${runId}/panchayat/${localbodyId}`, { params: { landType } }));

export const fetchMultipliers = async ({ runId, landType, validOnly, page = 0, size = 25 }) =>
  payloadOf(
    await api.get(`${BASE}/estimation/reports/run/${runId}/multipliers`, {
      params: { landType, validOnly, page, size }
    })
  );

/** Status transitions, for the activity log beside the stepper. */
export const fetchRunActivity = async (runId) => payloadOf(await api.get(`${BASE}/estimation/reports/run/${runId}/activity`));

/** The audit trail drawer. */
export const fetchAuditTrail = async ({ runId, page = 0, size = 25 }) =>
  payloadOf(await api.get(`${BASE}/estimation/reports/run/${runId}/audit`, { params: { page, size } }));

// ──────────────────────────────────────────────
// Export (M13)
// ──────────────────────────────────────────────

/**
 * Downloads a drill-down level as a file.
 *
 * The file is generated by the backend from the same reporting data the screen is showing, so the
 * download cannot disagree with the table above it. The browser is only responsible for saving it.
 */
export const downloadBreakdownExport = async ({
  runId,
  geoLevel,
  parentGeoId,
  landType,
  categoryKey,
  includePreviousYear = true,
  format = 'EXCEL'
}) => {
  const response = await api.get(`${BASE}/estimation/reports/run/${runId}/export`, {
    params: { geoLevel, parentGeoId, landType, categoryKey, includePreviousYear, format },
    responseType: 'blob'
  });
  saveBlob(response);
};

export const downloadPanchayatExport = async ({ runId, localbodyId, landType, format = 'EXCEL' }) => {
  const response = await api.get(`${BASE}/estimation/reports/run/${runId}/panchayat/${localbodyId}/export`, {
    params: { landType, format },
    responseType: 'blob'
  });
  saveBlob(response);
};

/**
 * Saves a downloaded file, honouring the filename the server chose.
 *
 * The server's name carries the run id and a timestamp, which is what makes a downloaded file
 * identifiable weeks later; regenerating a name here would lose that.
 */
const saveBlob = (response) => {
  const disposition = response.headers?.['content-disposition'] || '';
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const filename = match ? match[1] : `area-estimation-${Date.now()}.csv`;

  const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers?.['content-type'] }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ──────────────────────────────────────────────
// Observations and clarifications (M11)
// ──────────────────────────────────────────────

export const fetchObservations = async ({ runId, status, zoneId }) =>
  payloadOf(await api.get(`${BASE}/estimation/observations`, { params: { runId, status, zoneId } }));

export const fetchObservation = async (observationId) =>
  payloadOf(await api.get(`${BASE}/estimation/observations/${observationId}`));

/** The review workspace's metric tiles, and whether anything still blocks sign-off. */
export const fetchObservationSummary = async (runId) =>
  payloadOf(await api.get(`${BASE}/estimation/observations/summary`, { params: { runId } }));

export const createObservation = async (observation) =>
  payloadOf(await api.post(`${BASE}/estimation/observations`, observation));

/** A zone officer's response. Send the version read, so a stale update is refused not applied. */
export const respondToObservation = async (observationId, { responseText, supportingNotes, expectedVersion }) =>
  payloadOf(
    await api.post(`${BASE}/estimation/observations/${observationId}/response`, {
      responseText,
      supportingNotes,
      expectedVersion
    })
  );

export const approveObservation = async (observationId, { remarks, expectedVersion } = {}) =>
  payloadOf(await api.post(`${BASE}/estimation/observations/${observationId}/approve`, { remarks, expectedVersion }));

export const rejectObservation = async (observationId, { remarks, expectedVersion } = {}) =>
  payloadOf(await api.post(`${BASE}/estimation/observations/${observationId}/reject`, { remarks, expectedVersion }));

export const requestFurtherClarification = async (observationId, { remarks, expectedVersion } = {}) =>
  payloadOf(
    await api.post(`${BASE}/estimation/observations/${observationId}/request-clarification`, { remarks, expectedVersion })
  );

export const fetchObservationHistory = async (observationId) =>
  payloadOf(await api.get(`${BASE}/estimation/observations/${observationId}/history`));

// ──────────────────────────────────────────────
// Approval (M12)
// ──────────────────────────────────────────────

/**
 * Where a run stands in the approval chain.
 *
 * Carries the whole chain, the current position, the next stage with the permission it needs, and
 * whether anything blocks it. The screen renders this rather than deciding for itself who may act —
 * whether this user may is answered by the backend when they try.
 */
export const fetchApprovalStatus = async (runId) => payloadOf(await api.get(`${BASE}/estimation/approval/run/${runId}`));

/** Advances one stage. 403 when not permitted or already acted, 409 on a stale version. */
export const advanceApproval = async (runId, { remarks, expectedVersion } = {}) =>
  payloadOf(await api.post(`${BASE}/estimation/approval/run/${runId}/advance`, { remarks, expectedVersion }));

// ──────────────────────────────────────────────
// Notifications (M14)
// ──────────────────────────────────────────────

/**
 * The signed-in user's notifications and unread count.
 *
 * Deliberately takes no user parameter: the recipient is the authenticated caller, resolved by the
 * backend from the gateway's headers. There is no way to ask for anyone else's.
 */
export const fetchNotifications = async (limit = 25) =>
  payloadOf(await api.get(`${BASE}/estimation/notifications`, { params: { limit } }));

export const markNotificationsRead = async () => payloadOf(await api.post(`${BASE}/estimation/notifications/mark-all-read`));
