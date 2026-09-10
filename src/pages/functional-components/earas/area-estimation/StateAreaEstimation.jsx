import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useEstimationResults, categoryValue, landTypeOptionsFor, useRunLandTypeSync } from './useEstimationResults';
import { downloadBreakdownExport } from './areaEstimationApi';
import { currentAgriYear, formatHectares, formatPercent } from './areaEstimationMappers';
import { apiErrorMessage } from './apiErrors';
import RunSelector from './RunSelector';

const SUB = { color: 'white', fontSize: '0.8rem' };
const SUB_LEFT = { color: 'white', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' };
const PREV = { color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' };
const TOTAL_PREV = { fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' };
const DOT = '\u00b7';
const DASH = '\u2014';

const StateAreaEstimation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected filters locked to dashboard selection
  const estType = location.state?.estType || localStorage.getItem('earas_selected_estType') || 'Land Utilization';
  const season = location.state?.season || localStorage.getItem('earas_selected_season') || 'Autumn';
  // The agricultural year the user selected in the header, in the application's own form
  // ("2025-2026"). The bare '2026' this screen used was a mock-era leftover.
  const year = currentAgriYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [exportError, setExportError] = useState(null);
  // Null means the active run, which is how this screen behaved before a selector existed.
  const [selectedRunId, setSelectedRunId] = useState(null);

  const isCropType = estType === 'Seasonal Crops' || estType === 'Annual & Perennial Crops';

  const [landType, setLandType] = useState('Total');

  /**
   * Crop results are shown as irrigated and un-irrigated side by side, each with last year and
   * this year. Land utilization and irrigation-source results carry no irrigation flag, so they
   * keep a single pair of year columns.
   */
  const showIrrigationSplit = isCropType;
  const perCategory = showIrrigationSplit ? (results.hasPreviousYear ? 4 : 2) : results.hasPreviousYear ? 2 : 1;

  /** A category the run covered but found nothing for is said in words, not left as a dash. */
  const renderValue = (cell, field) => {
    if (!cell) {
      return (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          Estimation not done
        </Typography>
      );
    }
    const value = cell[field];
    return value === null || value === undefined ? '\u2014' : formatHectares(value);
  };

  const [selectedCrop, setSelectedCrop] = useState('');

  // District rows for the selected run. Every figure below is read from this response — the screen
  // performs no estimation arithmetic of any kind.
  const results = useEstimationResults({
    estType,
    year,
    season,
    landType,
    geoLevel: 'DISTRICT',
    runId: selectedRunId,
    // The land type control is a backend filter, so it is sent rather than applied to the rows here.
    categoryKey: isCropType && selectedCrop ? selectedCrop : undefined
  });

  // A run estimates the land type it was initiated for, so the filter opens on it and
  // offers no land type the run never computed.
  const runLandType = results.runSummary?.landType;
  useRunLandTypeSync(runLandType, setLandType);
  const landTypeOptions = landTypeOptionsFor(runLandType);

  // The pivot's columns are whatever the run actually produced.
  // Every category the run covered, not the filtered column set: `columns` honours the
  // crop filter, so populating the dropdown from it would collapse it to the crop already
  // chosen.
  // Two different lists, deliberately. The dropdown must offer every crop the run covered;
  // the table renders only the filtered column, because that is what the rows carry.
  const cropOptions = results.allCategories;
  const categories = results.columns;

  useEffect(() => {
    if (!selectedCrop && cropOptions.length > 0) {
      setSelectedCrop(cropOptions[0].categoryKey);
    }
  }, [cropOptions, selectedCrop]);

  const rowData = results.rows;

  /** A category cell for a row, or null where the run produced nothing for that pairing. */
  const cellFor = (row, column) => categoryValue(row, column.categoryKey);

  /** The level's own per-category totals, as published — not a sum of the rows on screen. */
  const totalFor = (column) =>
    results.levelCategoryTotals.find((total) => total.categoryKey === column.categoryKey) || null;

  const selectedColumn = cropOptions.find((column) => column.categoryKey === selectedCrop) || null;
  const selectedTotal = selectedColumn ? totalFor(selectedColumn) : null;

  // The pivot table hands back the whole row, so the run being viewed can travel with the
  // navigation — drilling into a historical run stays in that run.
  const handleViewDetails = (row) => {
    navigate(`/schemes/earas/area-estimation/${row.geoId}`, {
      state: { estType, season, runId: results.runId }
    });
  };

  /**
   * Downloads the level as a spreadsheet.
   *
   * Generated by the backend from the same reporting data this table is showing, so the file cannot
   * disagree with the screen. The browser only saves it.
   */
  const handleExportExcel = async () => {
    if (!results.runId) {
      return;
    }
    try {
      await downloadBreakdownExport({
        runId: results.runId,
        geoLevel: 'DISTRICT',
        landType: landType === 'Total' ? 'ALL' : landType.toUpperCase(),
        categoryKey: isCropType && selectedCrop ? selectedCrop : undefined,
        format: 'EXCEL'
      });
    } catch (error) {
      setExportError(apiErrorMessage(error));
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Narrows the rows already fetched by name. Not a data filter — the backend filters that matter
  // (land type, category) are sent as request parameters.
  const filteredRowData = rowData.filter((row) => (row.geoName || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Grid container spacing={3} className="printable-area">
      <Breadcrumb />
      
      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" fontWeight={700} sx={{ color: '#04255e' }}>
          Area Estimation Results - Kerala State ({estType} {estType === 'Seasonal Crops' ? `- ${season}` : ''})
        </Typography>
        <Stack direction="row" spacing={1.5} className="no-print">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ borderRadius: 2 }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPDF}
            sx={{ borderRadius: 2, bgcolor: '#04255e' }}
          >
            Export PDF
          </Button>
        </Stack>
      </Grid>

      {/* Reconciliation and coverage, stated rather than implied */}
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

      {/* State Level Summary Metrics — the persisted totals, never a sum of the rows below */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {isCropType ? (
            <>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>
                      Total {selectedColumn?.categoryName || 'Crop'} Estimated Area
                    </Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(selectedTotal?.areaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      {results.totalRows} districts ({landType})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Irrigated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(selectedTotal?.irrigatedAreaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>As computed by the estimation</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Unirrigated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(selectedTotal?.unirrigatedAreaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>As computed by the estimation</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#04255e', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Total State Estimated Area</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(results.parentTotalAreaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                      State total for this run ({landType})
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#1b5e20', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Wet Land Contribution</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(results.runSummary?.wetAreaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Persisted wet area for this run</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#e65100', color: 'white', borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Dry Land Contribution</Typography>
                    <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
                      {formatHectares(results.runSummary?.dryAreaHa)} Ha
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>Persisted dry area for this run</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      {/* District-wise Drill-Down Summary */}
      <Grid item xs={12}>
        <MainCard
          title="District-wise Category Area Contribution"
          secondary={
            <Stack direction="row" spacing={2} className="no-print" alignItems="center">
              <RunSelector estType={estType} agriYear={year} value={selectedRunId} onChange={setSelectedRunId} />
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
              {isCropType && cropOptions.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Crop</InputLabel>
                  <Select value={selectedCrop} label="Crop" onChange={(e) => setSelectedCrop(e.target.value)}>
                    {cropOptions.map((column) => (
                      <MenuItem key={column.categoryKey} value={column.categoryKey}>
                        {column.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                placeholder="Search district..."
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
          {results.loading ? (
            <Box sx={{ py: 4 }}>
              <LinearProgress />
              <Typography variant="body2" align="center" sx={{ mt: 2 }} color="text.secondary">
                Loading results…
              </Typography>
            </Box>
          ) : !results.runId ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                No estimation has been run for this selection yet.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Validate and initiate an estimation from the dashboard to see results here.
              </Typography>
            </Box>
          ) : rowData.length === 0 ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary">
                This run produced no district level results.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#04255e' }}>
                  <TableRow>
                    <TableCell rowSpan={2} sx={{ color: 'white', fontWeight: 600 }}>District Name</TableCell>
                    {categories.map((column) => (
                      <TableCell
                        key={column.categoryKey}
                        colSpan={perCategory}
                        align="center"
                        sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {column.categoryName}
                      </TableCell>
                    ))}
                    <TableCell
                      colSpan={results.hasPreviousYear ? 2 : 1}
                      align="center"
                      sx={{ color: 'white', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Total Area (Ha)
                    </TableCell>
                    <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>YoY Variance</TableCell>
                    <TableCell rowSpan={2} align="right" sx={{ color: 'white', fontWeight: 600 }}>Contribution</TableCell>
                    <TableCell rowSpan={2} align="center" sx={{ color: 'white', fontWeight: 600 }} className="no-print">
                      Action
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    {categories.map((column) => (
                      <React.Fragment key={column.categoryKey}>
                        {showIrrigationSplit ? (
                          <>
                            {results.hasPreviousYear && (
                              <TableCell align="right" sx={SUB_LEFT}>Irrigated {DOT} Previous</TableCell>
                            )}
                            <TableCell align="right" sx={results.hasPreviousYear ? SUB : SUB_LEFT}>
                              Irrigated {DOT} Current
                            </TableCell>
                            {results.hasPreviousYear && (
                              <TableCell align="right" sx={SUB_LEFT}>Un-irrigated {DOT} Previous</TableCell>
                            )}
                            <TableCell align="right" sx={results.hasPreviousYear ? SUB : SUB_LEFT}>
                              Un-irrigated {DOT} Current
                            </TableCell>
                          </>
                        ) : (
                          <>
                            {results.hasPreviousYear && (
                              <TableCell align="right" sx={SUB_LEFT}>Previous Year</TableCell>
                            )}
                            <TableCell align="right" sx={SUB}>Current Year</TableCell>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                    {results.hasPreviousYear && (
                      <TableCell align="right" sx={{ color: 'white', fontSize: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        Previous Year
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ color: 'white', fontSize: '0.8rem' }}>Current Year</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRowData.map((row) => (
                    <TableRow key={row.geoId} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                          <Typography fontWeight={500}>{row.geoName}</Typography>
                        </Box>
                      </TableCell>

                      {categories.map((column) => {
                        const cell = categoryValue(row, column.categoryKey);
                        return (
                          <React.Fragment key={column.categoryKey}>
                            {showIrrigationSplit ? (
                              <>
                                {results.hasPreviousYear && (
                                  <TableCell align="right" sx={PREV}>
                                    {renderValue(cell, 'previousIrrigatedAreaHa')}
                                  </TableCell>
                                )}
                                <TableCell align="right">{renderValue(cell, 'irrigatedAreaHa')}</TableCell>
                                {results.hasPreviousYear && (
                                  <TableCell align="right" sx={PREV}>
                                    {renderValue(cell, 'previousUnirrigatedAreaHa')}
                                  </TableCell>
                                )}
                                <TableCell align="right">{renderValue(cell, 'unirrigatedAreaHa')}</TableCell>
                              </>
                            ) : (
                              <>
                                {results.hasPreviousYear && (
                                  <TableCell align="right" sx={PREV}>
                                    {formatHectares(cell?.previousAreaHa)}
                                  </TableCell>
                                )}
                                <TableCell align="right">{renderValue(cell, 'areaHa')}</TableCell>
                              </>
                            )}
                          </React.Fragment>
                        );
                      })}

                      {results.hasPreviousYear && (
                        <TableCell align="right" sx={{ color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                          {formatHectares(row.previousTotalAreaHa)}
                        </TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatHectares(row.totalAreaHa)}</TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color:
                            row.yoyVariancePercent === null || row.yoyVariancePercent === undefined
                              ? 'text.secondary'
                              : row.yoyVariancePercent >= 0
                                ? 'success.main'
                                : 'error.main',
                          fontWeight: 500
                        }}
                      >
                        {formatPercent(row.yoyVariancePercent)}
                      </TableCell>

                      <TableCell align="right">{formatPercent(row.contributionPercent)}</TableCell>

                      <TableCell align="center" className="no-print">
                        <Tooltip title="Drill down to the district's blocks">
                          <IconButton color="primary" onClick={() => handleViewDetails(row)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* The level's own totals, as published */}
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total State Area</TableCell>
                    {categories.map((column) => {
                      const total = totalFor(column);
                      return (
                        <React.Fragment key={column.categoryKey}>
                          {results.hasPreviousYear && (
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                              —
                            </TableCell>
                          )}
                          {showIrrigationSplit ? (
                            <>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatHectares(total?.irrigatedAreaHa)}
                              </TableCell>
                              {results.hasPreviousYear && (
                                <TableCell align="right" sx={TOTAL_PREV}>{DASH}</TableCell>
                              )}
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                {formatHectares(total?.unirrigatedAreaHa)}
                              </TableCell>
                            </>
                          ) : (
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {formatHectares(total?.areaHa)}
                            </TableCell>
                          )}
                        </React.Fragment>
                      );
                    })}
                    {results.hasPreviousYear && (
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', borderLeft: '1px solid rgba(0,0,0,0.04)' }}>
                        {formatHectares(results.breakdown?.previousLevelTotalAreaHa)}
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatHectares(results.levelTotalAreaHa)}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell className="no-print" />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default StateAreaEstimation;
