import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useLocation, useParams } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { downloadPanchayatExport, fetchActiveRunStatus, fetchPanchayatDetail } from './areaEstimationApi';
import { currentAgriYear, formatHectares, toSelection } from './areaEstimationMappers';
import { apiErrorMessage, toApiError } from './apiErrors';
import { landTypeOptionsFor, useRunLandTypeSync } from './useEstimationResults';

/**
 * One panchayat's estimation detail — the deepest level the data actually reaches.
 *
 * Shows each category's published hectares beside the enumerated area in cents that produced them,
 * and the multiplier that was applied. That is the screen an officer uses to check a figure by hand:
 * `enumerated x multiplier / 247` is exactly what the backend computed, and all three values are
 * shown so the arithmetic can be followed.
 *
 * **No zone rows.** This screen previously listed zones with per-zone estimated areas. M8/M9
 * established that the persisted estimation grain is panchayat and above — the multiplier is defined
 * per panchayat and land type, and no zone-level estimate exists or is defined by the equations.
 * Splitting a panchayat figure across its zones would be a fabrication, so the screen states plainly
 * that zone-level estimation is not produced rather than inventing one. Recorded in
 * `IMPLEMENTATION_PROGRESS.md`.
 */
const PanchayatAreaEstimation = () => {
  const location = useLocation();
  const { panchayatId } = useParams();

  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = currentAgriYear();
  const inheritedRunId = location.state?.runId || null;

  const [landType, setLandType] = useState('Total');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [runId, setRunId] = useState(null);
  const [detail, setDetail] = useState(null);

  // A run estimates the land type it was initiated for, so the filter opens on it and
  // never offers a land type the run did not compute.
  const runLandType = detail?.landType;
  useRunLandTypeSync(runLandType, setLandType);
  const landTypeOptions = landTypeOptionsFor(runLandType);

  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      // Stale detail must not stay on screen while a different selection loads.
      setDetail(null);

      try {
        // An inherited run wins, so a drill-down from a historical view stays in that run.
        const active = inheritedRunId
          ? { runId: inheritedRunId }
          : await fetchActiveRunStatus(toSelection({ estType, year, season, landType }));

        if (cancelled) {
          return;
        }

        if (!active?.runId) {
          setRunId(null);
          setLoading(false);
          return;
        }

        setRunId(active.runId);

        const result = await fetchPanchayatDetail({
          runId: active.runId,
          localbodyId: Number(panchayatId),
          landType: landType === 'Total' ? 'ALL' : landType.toUpperCase()
        });

        if (!cancelled) {
          setDetail(result);
        }
      } catch (caught) {
        if (cancelled) {
          return;
        }
        // A panchayat with no rows in this run is an empty state, not a failure.
        if (toApiError(caught).status === 404) {
          setNotFound(true);
        } else {
          setError(apiErrorMessage(caught));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [estType, season, year, landType, panchayatId, inheritedRunId]);

  const handleExportExcel = async () => {
    if (!runId) {
      return;
    }
    try {
      await downloadPanchayatExport({
        runId,
        localbodyId: Number(panchayatId),
        landType: landType === 'Total' ? 'ALL' : landType.toUpperCase(),
        format: 'EXCEL'
      });
    } catch (caught) {
      setExportError(apiErrorMessage(caught));
    }
  };

  const categories = detail?.categories || [];

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Area Estimation Results - {detail?.localbodyName || `Panchayat ${panchayatId}`} ({estType}
          {estType === 'Seasonal Crops' ? ` - ${season}` : ''})
        </Typography>
        <Stack direction="row" spacing={1.5} className="no-print">
          <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExportExcel} sx={{ borderRadius: 2 }}>
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => window.print()}
            sx={{ borderRadius: 2, bgcolor: '#04255e' }}
          >
            Export PDF
          </Button>
        </Stack>
      </Grid>

      {(error || exportError) && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setExportError(null)}>
            {error || exportError}
          </Alert>
        </Grid>
      )}

      {detail?.excludedFromBlockTotals && (
        <Grid item xs={12}>
          <Alert severity="warning">
            This panchayat has no resolved block, so its area is excluded from block level totals. It is still counted at
            district and state level.
          </Alert>
        </Grid>
      )}

      {/* Zone-level estimation does not exist, and the screen says so rather than implying it. */}
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>Zone-level estimation is not produced</AlertTitle>
          Estimation results are computed per panchayat and aggregated upward to block, district and state. The
          multiplier is defined per panchayat and land type, so no zone-level estimate exists. The figures below are this
          panchayat&apos;s own published results.
        </Alert>
      </Grid>

      {detail && (
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Estimated Area</Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                    {formatHectares(detail.totalAreaHa)} Ha
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    {detail.blockName || 'No block resolved'} · {detail.districtName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>Wet Area</Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                    {formatHectares(detail.wetAreaHa)} Ha
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>Dry Area</Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                    {formatHectares(detail.dryAreaHa)} Ha
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* The multipliers actually applied, including any that could not be computed. */}
      {detail?.multipliers?.length > 0 && (
        <Grid item xs={12}>
          <MainCard title="Multipliers Applied" sx={{ borderRadius: 3 }}>
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#04255e' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white' }}>Land Type</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Total Area (Cents)</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Enumerated Area (Cents)</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Multiplier</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detail.multipliers.map((multiplier) => (
                    <TableRow key={multiplier.landType}>
                      <TableCell>{multiplier.landType}</TableCell>
                      <TableCell align="right">{formatHectares(multiplier.totalAreaCents)}</TableCell>
                      <TableCell align="right">{formatHectares(multiplier.enumeratedAreaCents)}</TableCell>
                      <TableCell align="right">{multiplier.multiplier ?? '—'}</TableCell>
                      <TableCell>{multiplier.valid ? 'Applied' : multiplier.skipReason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      )}

      <Grid item xs={12}>
        <MainCard
          title="Category Breakdown"
          secondary={
            <FormControl size="small" sx={{ minWidth: 140 }} className="no-print">
              <InputLabel>Land Type</InputLabel>
              <Select value={landType} label="Land Type" onChange={(e) => setLandType(e.target.value)}>
                {landTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option === 'Total' ? 'Total' : `${option} Land`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          }
          sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          {loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" align="center" sx={{ mt: 2 }} color="text.secondary">
                Loading results…
              </Typography>
            </Box>
          ) : !runId ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                No estimation has been run for this selection yet.
              </Typography>
            </Box>
          ) : notFound || categories.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                This run produced no results for this panchayat.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#04255e' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Enumerated Area (Cents)
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Estimated Area (Ha)
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Irrigated (Ha)
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                      Unirrigated (Ha)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category, index) => (
                    <TableRow key={`${category.categoryKey}-${index}`} hover>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell align="right">{formatHectares(category.enumeratedAreaCents)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {category.areaHa === null || category.areaHa === undefined ? (
                          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                            Estimation not done
                          </Typography>
                        ) : (
                          formatHectares(category.areaHa)
                        )}
                      </TableCell>
                      <TableCell align="right">{formatHectares(category.irrigatedAreaHa)}</TableCell>
                      <TableCell align="right">{formatHectares(category.unirrigatedAreaHa)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default PanchayatAreaEstimation;
