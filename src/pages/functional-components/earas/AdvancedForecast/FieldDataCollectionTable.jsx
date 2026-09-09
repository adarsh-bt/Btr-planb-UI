import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tooltip,
  Divider,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import AdvancedForecastService, {
  CROPS_MASTER,
  PADDY_VARIETIES,
  SEASONS_MASTER
} from './advancedForecastService';

const FieldDataCollectionTable = ({ userJurisdiction, zoneId, onDataUpdated }) => {
  const [panchayaths, setPanchayaths] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  // Editable Table Rows State
  const [tableRows, setTableRows] = useState([
    {
      id: 1,
      panchayat: '',
      village: '',
      season: 'Autumn (Virippu)',
      crop: 'Paddy',
      variety: 'Jyothi',
      currentYearArea: '',
      previousYearArea: '',
      currentYearYield: '',
      previousYearYield: '',
      remarks: ''
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load Panchayaths for User Zone
  useEffect(() => {
    const loadPanchayaths = async () => {
      const list = await AdvancedForecastService.getPanchayathsForZone(zoneId);
      setPanchayaths(list);
      if (list.length > 0) {
        setTableRows([
          {
            id: Date.now(),
            panchayat: list[0],
            village: list[0],
            cultivatorName: '',
            season: 'Autumn (Virippu)',
            crop: 'Paddy',
            variety: 'Jyothi',
            currentYearArea: '',
            previousYearArea: '',
            currentYearYield: '',
            previousYearYield: '',
            remarks: ''
          }
        ]);
      }
    };
    loadPanchayaths();
  }, [zoneId]);

  // Load submissions list
  const refreshSubmissions = () => {
    const data = AdvancedForecastService.getSubmissions(userJurisdiction);
    setSubmissions(data);
    if (onDataUpdated) onDataUpdated();
  };

  useEffect(() => {
    refreshSubmissions();
  }, [userJurisdiction]);

  // Handle cell change
  const handleRowChange = (id, field, value) => {
    setTableRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };
          if (field === 'crop' && value !== 'Paddy') {
            updated.variety = '';
          } else if (field === 'crop' && value === 'Paddy' && !row.variety) {
            updated.variety = PADDY_VARIETIES[0];
          }
          if (field === 'panchayat') {
            updated.village = value;
          }
          return updated;
        }
        return row;
      })
    );
  };

  // Add new row
  const handleAddRow = () => {
    const defaultPanchayat = panchayaths[0] || '';
    setTableRows((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        panchayat: defaultPanchayat,
        village: defaultPanchayat,
        cultivatorName: '',
        season: 'Autumn (Virippu)',
        crop: 'Paddy',
        variety: 'Jyothi',
        currentYearArea: '',
        previousYearArea: '',
        currentYearYield: '',
        previousYearYield: '',
        remarks: ''
      }
    ]);
  };

  // Remove row
  const handleRemoveRow = (id) => {
    if (tableRows.length === 1) {
      setSnackbar({
        open: true,
        message: 'Table must have at least one entry row.',
        severity: 'warning'
      });
      return;
    }
    setTableRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Save/Submit Table Entries
  const handleSaveTable = () => {
    // Validate rows
    const isValid = tableRows.every(
      (r) =>
        r.panchayat &&
        r.season &&
        r.crop &&
        parseFloat(r.currentYearArea) > 0 &&
        parseFloat(r.previousYearArea) >= 0 &&
        parseFloat(r.currentYearYield) > 0 &&
        parseFloat(r.previousYearYield) >= 0
    );

    if (!isValid) {
      setSnackbar({
        open: true,
        message: 'Please complete all required fields (Panchayat, Crop, Area, Yield) in table rows.',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    setTimeout(() => {
      try {
        AdvancedForecastService.saveTableEntries(tableRows, userJurisdiction);
        refreshSubmissions();
        setSnackbar({
          open: true,
          message: `Successfully saved ${tableRows.length} forecast table records for verification!`,
          severity: 'success'
        });

        // Reset table rows to 1 fresh row
        const defaultP = panchayaths[0] || '';
        setTableRows([
          {
            id: Date.now(),
            panchayat: defaultP,
            village: defaultP,
            season: 'Autumn (Virippu)',
            crop: 'Paddy',
            variety: 'Jyothi',
            currentYearArea: '',
            previousYearArea: '',
            currentYearYield: '',
            previousYearYield: '',
            remarks: ''
          }
        ]);
      } catch (err) {
        setSnackbar({ open: true, message: 'Error saving table entries.', severity: 'error' });
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved by Taluk Approver':
        return <Chip icon={<CheckCircleIcon />} label="Approved (Taluk)" color="success" size="small" variant="filled" />;
      case 'Verified by Field Inspector':
        return <Chip icon={<RateReviewIcon />} label="Verified (Inspector)" color="primary" size="small" variant="filled" />;
      case 'Clarification Requested':
        return <Chip icon={<ErrorOutlineIcon />} label="Clarification Requested" color="warning" size="small" variant="filled" />;
      case 'Pending Verification':
      default:
        return <Chip icon={<PendingActionsIcon />} label="Pending Verification" color="info" size="small" variant="outlined" />;
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Auto-selected Jurisdiction Badge */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.04) 0%, rgba(15, 23, 42, 0.08) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LocationOnIcon sx={{ color: '#0284c7', fontSize: '1.8rem' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
              Field Data Collection Mode (Tabular Format)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Jurisdiction: <strong>{userJurisdiction.district} District</strong> &rarr;{' '}
              <strong>{userJurisdiction.taluk} Taluk</strong> &rarr; <strong>{userJurisdiction.taluk} Block</strong>
            </Typography>
          </Box>
        </Box>
        <Chip label="Field Data Collector" color="primary" size="small" sx={{ fontWeight: 600 }} />
      </Paper>

      {/* Editable Table Data Entry Matrix */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.06)', mb: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AgricultureIcon sx={{ fontSize: '1.8rem', color: '#38bdf8' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                Crop Forecast Tabular Data Entry Matrix
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Enter crop-wise forecast parameters directly in table format for your assigned Panchayats
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }}
            >
              Add Row
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveTable}
              disabled={saving}
              sx={{ borderRadius: 2, fontWeight: 'bold', px: 3 }}
            >
              Submit for Verification
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 150 }}>Panchayat</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 160 }}>Cultivator Name</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 140 }}>Season</TableCell>

                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }}>Crop</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }}>Variety (Paddy)</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }} align="right">Cur Area (ha)</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }} align="right">Prev Area (ha)</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }} align="right">Cur Yield (t/ha)</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 130 }} align="right">Prev Yield (t/ha)</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', minWidth: 160 }}>Remarks</TableCell>
                <TableCell sx={{ bg: '#f1f5f9', fontWeight: 'bold', width: 60 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tableRows.map((row, index) => (
                <TableRow key={row.id} hover>
                  {/* Panchayat */}
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={row.panchayat}
                      onChange={(e) => handleRowChange(row.id, 'panchayat', e.target.value)}
                    >
                      {panchayaths.map((p, idx) => {
                        const nameStr = typeof p === 'object' ? p.localbodyName || p.name || `Panchayat ${idx + 1}` : String(p);
                        return (
                          <MenuItem key={typeof p === 'object' ? p.mappingId || idx : p} value={nameStr}>
                            {nameStr}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </TableCell>

                  {/* Cultivator Name */}
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Cultivator Name..."
                      value={row.cultivatorName || ''}
                      onChange={(e) => handleRowChange(row.id, 'cultivatorName', e.target.value)}
                    />
                  </TableCell>

                  {/* Season */}

                  <TableCell>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={row.season}
                      onChange={(e) => handleRowChange(row.id, 'season', e.target.value)}
                    >
                      {SEASONS_MASTER.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>

                  {/* Crop */}
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      value={row.crop}
                      onChange={(e) => handleRowChange(row.id, 'crop', e.target.value)}
                    >
                      {CROPS_MASTER.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>

                  {/* Variety (Conditional) */}
                  <TableCell>
                    {row.crop === 'Paddy' ? (
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={row.variety}
                        onChange={(e) => handleRowChange(row.id, 'variety', e.target.value)}
                      >
                        {PADDY_VARIETIES.map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>

                  {/* Current Area */}
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      placeholder="0.00"
                      value={row.currentYearArea}
                      onChange={(e) => handleRowChange(row.id, 'currentYearArea', e.target.value)}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </TableCell>

                  {/* Previous Area */}
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      placeholder="0.00"
                      value={row.previousYearArea}
                      onChange={(e) => handleRowChange(row.id, 'previousYearArea', e.target.value)}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </TableCell>

                  {/* Current Yield */}
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      placeholder="0.00"
                      value={row.currentYearYield}
                      onChange={(e) => handleRowChange(row.id, 'currentYearYield', e.target.value)}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </TableCell>

                  {/* Previous Yield */}
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      placeholder="0.00"
                      value={row.previousYearYield}
                      onChange={(e) => handleRowChange(row.id, 'previousYearYield', e.target.value)}
                      inputProps={{ style: { textAlign: 'right' } }}
                    />
                  </TableCell>

                  {/* Remarks */}
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Remarks..."
                      value={row.remarks}
                      onChange={(e) => handleRowChange(row.id, 'remarks', e.target.value)}
                    />
                  </TableCell>

                  {/* Action */}
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => handleRemoveRow(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default FieldDataCollectionTable;
