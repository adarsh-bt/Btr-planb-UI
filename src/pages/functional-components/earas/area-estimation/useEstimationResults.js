import { useCallback, useEffect, useState } from 'react';
import { fetchActiveRunStatus, fetchBreakdown, fetchRunSummary } from './areaEstimationApi';
import { toSelection } from './areaEstimationMappers';
import { apiErrorMessage, toApiError } from './apiErrors';

/**
 * Loads one drill-down level of a run's results.
 *
 * Shared by all eight results screens because they render the same thing at different levels: a
 * pivot of geographic units against categories. Putting the fetch here means the mapping from the
 * reporting response to the table is written once — and, more importantly, that no screen is
 * tempted to compute a figure of its own.
 *
 * **Nothing is calculated here.** Every hectare, every total and every percentage is taken from the
 * response exactly as the backend published it. The hook adds no arithmetic at all.
 *
 * The run is resolved once and then held: every request carries an explicit run id, so a screen
 * cannot mix two runs, and switching runs replaces the data rather than merging with it.
 */
export const useEstimationResults = ({
  estType,
  year,
  season,
  landType,
  districtId,
  geoLevel,
  parentGeoId,
  categoryKey,
  runId: explicitRunId,
  page = 0,
  size = 50,
  sortBy = 'name',
  sortDirection = 'asc'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [runSummary, setRunSummary] = useState(null);
  const [runId, setRunId] = useState(explicitRunId || null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      // An explicit run wins — that is how a historical run is opened. Otherwise the active run for
      // the current selection is resolved, once.
      let resolvedRunId = explicitRunId;

      if (!resolvedRunId) {
        const active = await fetchActiveRunStatus(toSelection({ estType, year, season, landType, districtId }));
        resolvedRunId = active?.runId;
      }

      if (!resolvedRunId) {
        // No run for this selection is a legitimate state, not a failure: the screen shows its
        // empty state rather than a table of zeros.
        setRunId(null);
        setBreakdown(null);
        setRunSummary(null);
        setLoading(false);
        return;
      }

      setRunId(resolvedRunId);

      const [summary, breakdownPage] = await Promise.all([
        fetchRunSummary(resolvedRunId),
        fetchBreakdown({
          runId: resolvedRunId,
          geoLevel,
          parentGeoId,
          // The land type control is a backend filter. "Total" is the combined figure, which the
          // backend calls ALL.
          landType: landType === 'Total' || landType === 'All' ? 'ALL' : String(landType).toUpperCase(),
          categoryKey,
          includePreviousYear: true,
          page,
          size,
          sortBy,
          sortDirection
        })
      ]);

      setRunSummary(summary);
      setBreakdown(breakdownPage);
    } catch (caught) {
      const apiError = toApiError(caught);

      // A 404 means the run or the geography is not part of this run — an empty state, not a
      // failure to apologise for. Everything else is surfaced with the backend's own wording.
      if (apiError.status === 404) {
        setBreakdown(null);
        setStatus(apiError.status);
      } else {
        setError(apiErrorMessage(caught));
        setStatus(apiError.status);
        // Stale data must not stay on screen behind an error message.
        setBreakdown(null);
        setRunSummary(null);
      }
    } finally {
      setLoading(false);
    }
  }, [
    estType,
    year,
    season,
    landType,
    districtId,
    geoLevel,
    parentGeoId,
    categoryKey,
    explicitRunId,
    page,
    size,
    sortBy,
    sortDirection
  ]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading,
    error,
    status,
    runId,
    runSummary,
    breakdown,
    /** The pivot columns for this request, honouring the category filter. */
    columns: breakdown?.columns || [],
    /**
     * Every category the run covered, ignoring the filter.
     *
     * The crop dropdown reads this rather than {@code columns}: once a crop is selected the
     * backend narrows {@code columns} to that one, so a control populated from it would collapse
     * to the crop already chosen.
     */
    allCategories: breakdown?.allCategories || [],
    rows: breakdown?.rows?.content || [],
    totalRows: breakdown?.rows?.totalItems || 0,
    /** The level's own total — not a sum of the rows on screen. */
    levelTotalAreaHa: breakdown?.levelTotalAreaHa ?? null,
    /** The parent's persisted total, which the level total is measured against. */
    parentTotalAreaHa: breakdown?.parentTotalAreaHa ?? null,
    levelCategoryTotals: breakdown?.levelCategoryTotals || [],
    coverageComplete: breakdown?.coverageComplete !== false,
    coverageNote: breakdown?.coverageNote || null,
    previousRunId: breakdown?.previousRunId ?? null,
    previousAgriYear: breakdown?.previousAgriYear ?? null,
    hasPreviousYear: Boolean(breakdown?.previousRunId),
    reconciliation: runSummary?.reconciliation || null,
    reload: load
  };
};

/**
 * One row's value for a category, straight from the response.
 *
 * Returns null when the run produced nothing for that pairing. Null is rendered as "Estimation not
 * done", not a zero: "no row was produced" and "measured as none" are different statements.
 */
export const categoryValue = (row, categoryKey) =>
  (row?.categories || []).find((category) => category.categoryKey === categoryKey) || null;

/**
 * The land type choices a run actually supports.
 *
 * A run estimates the land type it was initiated for. Offering "Dry Land" on a run initiated for
 * wet would return an empty table and read as "no dry area", when the truth is that dry was never
 * computed. So a single-land-type run offers only its own.
 */
export const landTypeOptionsFor = (runLandType) => {
  if (runLandType === 'WET') {
    return ['Wet'];
  }
  if (runLandType === 'DRY') {
    return ['Dry'];
  }
  return ['Total', 'Wet', 'Dry'];
};

/**
 * Snaps the land type filter to the land type the run was initiated for.
 *
 * The screens start on "Total" because the run is not known until the first response arrives. Once
 * it is, a single-land-type run pins the filter to its own — a wet run opens showing wet.
 */
export const useRunLandTypeSync = (runLandType, setLandType) => {
  useEffect(() => {
    if (runLandType !== 'WET' && runLandType !== 'DRY') {
      return;
    }
    const label = runLandType === 'WET' ? 'Wet' : 'Dry';
    setLandType((current) => (current === label ? current : label));
  }, [runLandType, setLandType]);
};
