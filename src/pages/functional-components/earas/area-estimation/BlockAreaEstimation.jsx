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
  Tooltip,
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
 * Panchayat-wise results for one block.
 *
 * Every figure is read from the reporting API; nothing is computed here.
 *
 * **The Taluk column is deliberately empty.** A taluk is not part of the estimation result grain,
 * and `tbl_master_localbody` carries only a district — there is no owned localbody-to-taluk
 * relationship to read. It could be inferred through a panchayat's zone allocations, but 6 of the
 * 1,004 localbodies map to two taluks that way, so the inference would be wrong for some and
 * arbitrary for the rest. A dash and an explanation is honest; a guessed taluk on a statistical
 * report is not.
 */
const BlockAreaEstimation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { districtId, blockId } = useParams();

  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = currentAgriYear();
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
    geoLevel: 'PANCHAYAT',
    runId: inheritedRunId,
    parentGeoId: Number(blockId),
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

  const filteredRows = results.rows.filter((row) => (row.geoName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const blockName = results.breakdown?.parentGeoName || `Block ${blockId}`;

  const handleDrillDown = (row) => {
    navigate(`/schemes/earas/area-estimation/${districtId}/${blockId}/${row.geoId}`, {
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
        geoLevel: 'PANCHAYAT',
        parentGeoId: Number(blockId),
        landType: landType === 'Total' ? 'ALL' : landType.toUpperCase(),
        categoryKey: isCropType && selectedCrop ? selectedCrop : undefined,
        format: 'EXCEL'
      });
    } catch (error) {
      setExportError(apiErrorMessage(error));
    }
  };

  /**
   * The Taluk column, preserved in the layout but not filled.
   *
   * Rendered as a dash with the reason available on hover, rather than removed — the column is part
   * of the agreed screen — and never derived from the block or panchayat name.
   */
  const talukColumn = {
    key: 'taluk',
    header: 'Taluk',
    render: () => (
      <Tooltip title="Taluk is not part of the estimation result and is not recorded against a panchayat in the master data.">
        <Typography variant="body2" color="text.secondary">
          —
        </Typography>
      </Tooltip>
    )
  };

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Area Estimation Results - {blockName} ({estType}
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

      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>Block Estimated Area</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(results.parentTotalAreaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>Block total for this run ({landType})</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Across Panchayats</Typography>
                <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                  {formatHectares(results.levelTotalAreaHa)} Ha
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>{results.totalRows} panchayats</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <MainCard
          title="Panchayat-wise Category Area Contribution"
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
                placeholder="Search panchayat..."
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
            unitLabel="Panchayat"
            totalsLabel="Total Across Panchayats"
            extraColumns={[talukColumn]}
            onDrillDown={handleDrillDown}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default BlockAreaEstimation;
