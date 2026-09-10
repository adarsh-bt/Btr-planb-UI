import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import EstimationPivotTable from './EstimationPivotTable';
import { useEstimationResults, landTypeOptionsFor, useRunLandTypeSync } from './useEstimationResults';
import { downloadBreakdownExport } from './areaEstimationApi';
import { currentAgriYear, formatHectares } from './areaEstimationMappers';
import { apiErrorMessage } from './apiErrors';

/**
 * Block-wise results for one district.
 *
 * The blocks of the selected district, as the estimation persisted them. Every figure comes from
 * the reporting API; this screen performs no estimation arithmetic. The district total shown is the
 * district's **own** persisted total, not a sum of the blocks below it — where the two differ, a
 * panchayat could not be attributed to a block, and the coverage note says so rather than the
 * screen quietly presenting a complete-looking hierarchy.
 */
const DistrictAreaEstimation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { districtId } = useParams();

  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = currentAgriYear();
  // The run chosen upstream, so drilling into a historical run stays in that run.
  const inheritedRunId = location.state?.runId || null;

  const isCropType = estType === 'Seasonal Crops' || estType === 'Annual & Perennial Crops';

  const [searchTerm, setSearchTerm] = useState('');
  const [landType, setLandType] = useState('Total');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [exportError, setExportError] = useState(null);

  const results = useEstimationResults({
    estType,
    year,
    season,
    landType,
    geoLevel: 'BLOCK',
    runId: inheritedRunId,
    parentGeoId: Number(districtId),
    categoryKey: isCropType && selectedCrop ? selectedCrop : undefined
  });

  // A run estimates the land type it was initiated for, so the filter opens on it and
  // offers no land type the run never computed.
  const runLandType = results.runSummary?.landType;
  useRunLandTypeSync(runLandType, setLandType);
  const landTypeOptions = landTypeOptionsFor(runLandType);

  // Every category the run covered, not the filtered column set: `columns` honours the
  // crop filter, so populating the dropdown from it would collapse it to the crop already
  // chosen.
  const categories = results.allCategories;

  useEffect(() => {
    if (!selectedCrop && categories.length > 0) {
      setSelectedCrop(categories[0].categoryKey);
    }
  }, [categories, selectedCrop]);

  // Narrows the rows already fetched by name. The filters that select data — land type, category —
  // are sent to the backend.
  const filteredRows = results.rows.filter((row) => (row.geoName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const districtName = results.breakdown?.parentGeoName || `District ${districtId}`;

  const handleDrillDown = (row) => {
    navigate(`/schemes/earas/area-estimation/${districtId}/${row.geoId}`, {
      state: { estType, season, runId: results.runId }
    });
  };

  const handleExportExcel = async () => {
    if (!results.runId) {
      return;
    }
    try {
      await downloadBreakdownExport({
        runId: results.runId,
        geoLevel: 'BLOCK',
        parentGeoId: Number(districtId),
        landType: landType === 'Total' ? 'ALL' : landType.toUpperCase(),
        categoryKey: isCropType && selectedCrop ? selectedCrop : undefined,
        format: 'EXCEL'
      });
    } catch (error) {
      setExportError(apiErrorMessage(error));
    }
  };

  const selectedColumn = categories.find((column) => column.categoryKey === selectedCrop) || null;
  const selectedTotal = selectedColumn
    ? results.levelCategoryTotals.find((total) => total.categoryKey === selectedColumn.categoryKey)
    : null;

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Area Estimation Results - {districtName} ({estType}
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

      {(results.error || exportError) && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setExportError(null)}>
            {results.error || exportError}
          </Alert>
        </Grid>
      )}

      {!results.coverageComplete && results.coverageNote && (
        <Grid item xs={12}>
          <Alert severity="warning">{results.coverageNote}</Alert>
        </Grid>
      )}

      {results.reconciliation && !results.reconciliation.reconciled && (
        <Grid item xs={12}>
          <Alert severity="error">
            These figures did not reconcile and must not be published. {results.reconciliation.failures?.join(' ')}
          </Alert>
        </Grid>
      )}

      {/* The district's own persisted total, and the blocks' — shown separately on purpose. */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>District Estimated Area</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(results.parentTotalAreaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>District total for this run ({landType})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Across Blocks</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(results.levelTotalAreaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {results.totalRows} blocks
                  {!results.coverageComplete ? ' — lower than the district total, see the warning above' : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>
                  {isCropType ? `${selectedColumn?.categoryName || 'Crop'} Area` : 'Categories'}
                </Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {isCropType ? `${formatHectares(selectedTotal?.areaHa)} Ha` : categories.length}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {isCropType ? 'Across this district' : 'Produced by this run'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard
          title="Block-wise Category Area Contribution"
          secondary={
            <Stack direction="row" spacing={2} className="no-print" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Land Type</InputLabel>
                <Select value={landType} label="Land Type" onChange={(e) => setLandType(e.target.value)}>
                  {landTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option === 'Total' ? 'Total' : `${option} Land`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {isCropType && categories.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Crop</InputLabel>
                  <Select value={selectedCrop} label="Crop" onChange={(e) => setSelectedCrop(e.target.value)}>
                    {categories.map((column) => (
                      <MenuItem key={column.categoryKey} value={column.categoryKey}>
                        {column.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                placeholder="Search block..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 180 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          }
          sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <EstimationPivotTable
          showIrrigationSplit={isCropType}
            results={results}
            rows={filteredRows}
            unitLabel="Block"
            totalsLabel="Total Across Blocks"
            onDrillDown={handleDrillDown}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DistrictAreaEstimation;
