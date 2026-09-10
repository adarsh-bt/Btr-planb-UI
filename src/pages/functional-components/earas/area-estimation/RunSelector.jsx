import React, { useEffect, useState } from 'react';
import { Alert, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { fetchRuns } from './areaEstimationApi';
import { apiErrorMessage } from './apiErrors';
import { toEstimationTypeCode } from './areaEstimationMappers';

/**
 * Chooses which estimation run to view.
 *
 * Runs come from `GET /reports/runs` — never a hardcoded list, a remembered id, or a guess. Each
 * option is described with enough detail to tell two runs apart: year, season, land type, status and
 * the run id itself, since two runs of the same selection differ only by id and timestamp.
 *
 * Selecting nothing means "the active run", which is how the screens behaved before a selector
 * existed. No historical run is ever chosen automatically — a reader has to ask for one.
 *
 * Only runs whose results can actually be read are offered. A run still computing has no figures to
 * show, and listing it would invite a click that could only fail.
 */
const RunSelector = ({ estType, agriYear, value, onChange, label = 'Estimation Run' }) => {
  const [runs, setRuns] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const page = await fetchRuns({ agriYear, size: 50 });

        if (cancelled) {
          return;
        }

        const readable = (page?.content || [])
          .filter((run) => run.resultsAvailable)
          .filter((run) => !estType || run.estimationType === toEstimationTypeCode(estType));

        setRuns(readable);
        setError(null);
      } catch (caught) {
        if (!cancelled) {
          setError(apiErrorMessage(caught));
          setRuns([]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [estType, agriYear]);

  if (error) {
    return (
      <Alert severity="warning" sx={{ py: 0 }}>
        Runs could not be listed: {error}
      </Alert>
    );
  }

  if (runs.length === 0) {
    return null;
  }

  const describe = (run) => {
    const parts = [`#${run.runId}`, run.agriYear];
    if (run.seasonName) {
      parts.push(run.seasonName);
    }
    if (run.landType) {
      parts.push(run.landType);
    }
    parts.push(run.statusLabel);
    if (run.completedAt) {
      parts.push(new Date(run.completedAt).toLocaleDateString('en-IN'));
    }
    return parts.join(' · ');
  };

  return (
    <FormControl size="small" sx={{ minWidth: 280 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} label={label} onChange={(event) => onChange(event.target.value || null)}>
        <MenuItem value="">
          <Typography variant="body2">Active run</Typography>
        </MenuItem>
        {runs.map((run) => (
          <MenuItem key={run.runId} value={run.runId}>
            {describe(run)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RunSelector;
