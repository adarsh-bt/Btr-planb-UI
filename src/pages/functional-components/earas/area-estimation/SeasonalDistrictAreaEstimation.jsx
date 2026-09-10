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
 * Seasonal crop results at Block level.
 *
 * The same pivot as the non-seasonal screens. The season is part of the run being read, so the
 * figures come from the seasonal run rather than from a different endpoint. Nothing is computed
 * here: every hectare, total and percentage is rendered exactly as the backend published it.
 */
const SeasonalDistrictAreaEstimation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { districtId } = useParams();

  const estType = 'Seasonal Crops';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = currentAgriYear();

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
    parentGeoId: Number(districtId),
    categoryKey: selectedCrop || undefined
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

  const filteredRows = results.rows.filter((row) => (row.geoName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const parentName = results.breakdown?.parentGeoName || 'District';

  const handleDrillDown = (row) => {
    navigate(`/schemes/earas/area-estimation/seasonal/${districtId}/${row.geoId}`, { state: { estType, season } });
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
        categoryKey: selectedCrop || undefined,
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
          Seasonal Crop Estimation - {parentName} ({season})
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

      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>District Estimated Area</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(results.parentTotalAreaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {season} season ({landType})
                </Typography>
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
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>{selectedColumn?.categoryName || 'Crop'} Area</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(selectedTotal?.areaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  Irrigated {formatHectares(selectedTotal?.irrigatedAreaHa)} Ha
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard
          title="Block-wise Seasonal Crop Area"
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

              {categories.length > 0 && (
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
          showIrrigationSplit={true}
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

export default SeasonalDistrictAreaEstimation;
