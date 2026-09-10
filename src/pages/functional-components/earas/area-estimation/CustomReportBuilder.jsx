import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useLocation } from 'react-router-dom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import EstimationPivotTable from './EstimationPivotTable';
import { useEstimationResults } from './useEstimationResults';
import { downloadBreakdownExport } from './areaEstimationApi';
import { currentAgriYear, formatHectares } from './areaEstimationMappers';
import { apiErrorMessage } from './apiErrors';
import RunSelector from './RunSelector';

/**
 * The custom report builder.
 *
 * Lets a user choose *what to look at* — the geographic level, the land type, and which category to
 * restrict to — and then shows the persisted figures for that choice. It is a view over the M10
 * reporting data, **not a second estimation engine**: every hectare, total and percentage comes from
 * the same endpoint the standard results screens use, and nothing is computed here.
 *
 * The previous implementation generated its own figures from a mock table by multiplying invented
 * factors (0.70 / 0.30 for "agriculture area", further splits for land and irrigation type). Those
 * dimensions did not exist in the persisted model; they existed only in that arithmetic. They are
 * gone, and the dimensions offered now are the ones the estimation actually produces.
 */
const CustomReportBuilder = () => {
  const location = useLocation();

  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  const year = currentAgriYear();

  // The row dimension. The estimation is persisted per geographic level, so the level *is* the
  // dimension — choosing "block" means reading the block level, not regrouping panchayat rows.
  const [geoLevel, setGeoLevel] = useState('DISTRICT');
  const [parentGeoId, setParentGeoId] = useState('');
  const [landType, setLandType] = useState('Total');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(true);
  const [exportError, setExportError] = useState(null);
  const [selectedRunId, setSelectedRunId] = useState(null);

  const results = useEstimationResults({
    estType,
    year,
    season,
    landType,
    geoLevel,
    runId: selectedRunId,
    parentGeoId: parentGeoId ? Number(parentGeoId) : undefined,
    categoryKey: showAllCategories ? undefined : selectedCategory || undefined,
    size: 200
  });

  const categories = results.columns;

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].categoryKey);
    }
  }, [categories, selectedCategory]);

  // Changing the level changes what a parent id means, so a stale one must not be carried over.
  useEffect(() => {
    setParentGeoId('');
  }, [geoLevel]);

  const handleExport = async (format) => {
    if (!results.runId) {
      return;
    }
    try {
      await downloadBreakdownExport({
        runId: results.runId,
        geoLevel,
        parentGeoId: parentGeoId ? Number(parentGeoId) : undefined,
        landType: landType === 'Total' ? 'ALL' : landType.toUpperCase(),
        categoryKey: showAllCategories ? undefined : selectedCategory || undefined,
        format
      });
    } catch (error) {
      setExportError(apiErrorMessage(error));
    }
  };

  const unitLabel = geoLevel === 'DISTRICT' ? 'District' : geoLevel === 'BLOCK' ? 'Block' : 'Panchayat';

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />

      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Custom Estimation Report ({estType})
        </Typography>
        <Stack direction="row" spacing={1.5} className="no-print">
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('CSV')}
            sx={{ borderRadius: 2 }}
            disabled={!results.runId}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('EXCEL')}
            sx={{ borderRadius: 2, bgcolor: '#04255e' }}
            disabled={!results.runId}
          >
            Export Excel
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

      {/* What this report is built from, stated rather than assumed. */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
          <CardContent>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                Built from estimation run
              </Typography>
              <Chip size="small" label={results.runId ? `#${results.runId}` : 'none'} color="primary" />
              <Chip size="small" label={year} variant="outlined" />
              {estType === 'Seasonal Crops' && <Chip size="small" label={season} variant="outlined" />}
              <Chip size="small" label={`Land type: ${landType}`} variant="outlined" />
              {results.runSummary?.statusLabel && (
                <Chip size="small" label={results.runSummary.statusLabel} variant="outlined" />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <MainCard title="Report Dimensions" sx={{ borderRadius: 3 }}>
          <Stack spacing={2.5}>
            <RunSelector estType={estType} agriYear={year} value={selectedRunId} onChange={setSelectedRunId} />
            <FormControl size="small" fullWidth>
              <InputLabel>Group Rows By</InputLabel>
              <Select value={geoLevel} label="Group Rows By" onChange={(e) => setGeoLevel(e.target.value)}>
                <MenuItem value="DISTRICT">District</MenuItem>
                <MenuItem value="BLOCK">Block</MenuItem>
                <MenuItem value="PANCHAYAT">Panchayat</MenuItem>
              </Select>
            </FormControl>

            {geoLevel !== 'DISTRICT' && (
              <FormControl size="small" fullWidth>
                <InputLabel shrink>
                  {geoLevel === 'BLOCK' ? 'Limit to District (id)' : 'Limit to Block (id)'}
                </InputLabel>
                <Select
                  value={parentGeoId}
                  displayEmpty
                  label={geoLevel === 'BLOCK' ? 'Limit to District (id)' : 'Limit to Block (id)'}
                  onChange={(e) => setParentGeoId(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  {/* Parents come from the run's own results, never from a hardcoded list. */}
                  {(results.breakdown?.rows?.content || [])
                    .map((row) => row.parentGeoId)
                    .filter((id, index, all) => id && all.indexOf(id) === index)
                    .map((id) => (
                      <MenuItem key={id} value={id}>
                        {id}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" fullWidth>
              <InputLabel>Land Type</InputLabel>
              <Select value={landType} label="Land Type" onChange={(e) => setLandType(e.target.value)}>
                <MenuItem value="Total">Total</MenuItem>
                <MenuItem value="Wet">Wet Land</MenuItem>
                <MenuItem value="Dry">Dry Land</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Checkbox checked={showAllCategories} onChange={(e) => setShowAllCategories(e.target.checked)} />}
              label="All categories"
            />

            {!showAllCategories && (
              <FormControl size="small" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={selectedCategory} label="Category" onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((column) => (
                    <MenuItem key={column.categoryKey} value={column.categoryKey}>
                      {column.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                Columns are the categories this run produced. Figures are the published results — this report does not
                recalculate anything.
              </Typography>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={9}>
        <MainCard
          title={`${unitLabel}-wise Custom Report`}
          secondary={
            <Typography variant="body2" color="text.secondary">
              Level total {formatHectares(results.levelTotalAreaHa)} Ha
            </Typography>
          }
          sx={{ borderRadius: 3 }}
        >
          <EstimationPivotTable
            results={results}
            rows={results.rows}
            unitLabel={unitLabel}
            totalsLabel={`Total Across ${unitLabel}s`}
            emptyMessage="No results match the selected dimensions."
          />
        </MainCard>
      </Grid>

      {/* Dimensions the persisted model does not express, named rather than silently dropped. */}
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>Dimensions not available in this report</AlertTitle>
          Season, irrigation type and agriculture area cannot be used as row dimensions. An estimation run covers a
          single season, so a cross-season report would combine separate runs; irrigation source is a result category
          rather than a cross-dimension; and &quot;agriculture area&quot; is not part of the persisted estimation model.
          The previous version produced those breakdowns by multiplying invented factors.
        </Alert>
      </Grid>
    </Grid>
  );
};

export default CustomReportBuilder;
