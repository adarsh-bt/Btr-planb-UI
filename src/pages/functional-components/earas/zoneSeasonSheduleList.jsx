import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  Button,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import mainapi from 'api/mainapi';

/* ===== STYLE CONSTANTS ===== */
const HEADER_BG = '#04255e';
const HEADER_TEXT = '#ffffff';
const BODY_TEXT = '#333';

const FONT_SIZE_HEADER = '0.85rem';
const FONT_SIZE_BODY = '0.82rem';
const CELL_PADDING = '8px 12px';
const HEADER_HEIGHT = 56;

const COLUMN_WIDTHS = {
  slNo: '70px',
  district: '130px',
  taluk: '110px',
  zone: '180px',
  seasonCol: '100px'
};

const ZoneSeasonsTable = () => {
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState(new Map());
  const [taluks, setTaluks] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSeason, setSelectedSeason] = useState('Summer');

  // inline edit state
  const [editingRow, setEditingRow] = useState(null); // zoneId
  const [editValues, setEditValues] = useState({
    startDate: '',
    extendedDate: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.get(
        `${mainapi.USER_API}/btr-service/admin-manage/zones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data || [];
      setZones(data);

      const distMap = new Map();
      const talukMap = new Map();

      data.forEach((zone) => {
        if (zone.dist_id)
          distMap.set(zone.dist_id, `District ${zone.dist_id}`);
        if (zone.zoneName)
          talukMap.set(zone.zoneId, zone.zoneName.split(' ')[0]);
      });

      setDistricts(distMap);
      setTaluks(talukMap);
    } catch {
      setError('Failed to load zones data.');
    } finally {
      setLoading(false);
    }
  };

  // get full season object
  const getSeason = (zone, seasonName) =>
    zone.seasons?.find((s) => s.seasonName === seasonName);

  const getSeasonData = (zone, seasonName) => {
    const season = getSeason(zone, seasonName);
    return {
      id: season?.id,
      defaultStart: season?.defaultStart || 'NA',
      defaultEnd: season?.defaultEnd || 'NA',
      extendDate: season?.extendDate || 'NA'
    };
  };

  // Optimistic update function
  const updateZoneLocally = (zoneId, seasonName, newStartDate, newExtendDate) => {
    setZones(prevZones => 
      prevZones.map(zone => {
        if (zone.zoneId === zoneId) {
          const season = getSeason(zone, seasonName);
          if (season) {
            return {
              ...zone,
              seasons: zone.seasons.map(s => 
                s.seasonName === seasonName 
                  ? { ...s, defaultStart: newStartDate, extendDate: newExtendDate }
                  : s
              )
            };
          }
        }
        return zone;
      })
    );
  };

  const handleSave = async (zone, season) => {
    if (!season?.id) return;

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const originalStartDate = season.defaultStart;
    const originalExtendDate = season.extendDate;

    // Optimistic update
    updateZoneLocally(zone.zoneId, selectedSeason, editValues.startDate || originalStartDate, editValues.extendedDate || originalExtendDate);

    try {
      setSaving(true);

      const startDateToUse = editValues.startDate || season.defaultStart || null;
      const extendedDateToUse = editValues.extendedDate || season.extendDate || null;

      const payload = {
        zoneId: zone.zoneId,
        seasonId: season.id,
        startDate: startDateToUse,
        extendedDate: extendedDateToUse,
        year: startDateToUse
          ? new Date(startDateToUse).getFullYear()
          : new Date().getFullYear(),
        remark: 'Updated from UI'
      };

      await axios.post(
        `${mainapi.USER_API}/btr-service/zone-season-schedule/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSnackbar({ open: true, message: 'Schedule updated successfully!', severity: 'success' });
      setEditingRow(null);
      setEditValues({ startDate: '', extendedDate: '' });
    } catch (e) {
      // Revert optimistic update on error
      updateZoneLocally(zone.zoneId, selectedSeason, originalStartDate, originalExtendDate);
      console.error(e);
      setSnackbar({ open: true, message: 'Failed to save schedule.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (zone, season) => {
    setEditingRow(zone.zoneId);
    setEditValues({
      startDate: season?.defaultStart || '',
      extendedDate: season?.extendDate || ''
    });
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditValues({ startDate: '', extendedDate: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const paginatedZones = zones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: 300 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Zones Seasons Schedule
        </Typography>

        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                {/* ===== MAIN HEADER ===== */}
                <TableRow sx={{ height: HEADER_HEIGHT }}>
                  {['SL. NO', 'District', 'Taluk', 'Zone'].map((label, i) => (
                    <TableCell
                      key={label}
                      sx={{
                        width: Object.values(COLUMN_WIDTHS)[i],
                        position: 'sticky',
                        top: 0,
                        zIndex: 3,
                        backgroundColor: HEADER_BG,
                        color: HEADER_TEXT,
                        fontSize: FONT_SIZE_HEADER,
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}

                  {/* ===== CENTERED SEASON SELECTOR ===== */}
                  <TableCell
                    colSpan={3}
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 3,
                      backgroundColor: HEADER_BG
                    }}
                  >
                    <Box display="flex" justifyContent="center">
                      <FormControl size="small">
                        <Select
                          value={selectedSeason}
                          onChange={(e) => setSelectedSeason(e.target.value)}
                          sx={{
                            minWidth: 140,
                            color: HEADER_TEXT,
                            '.MuiOutlinedInput-notchedOutline': {
                              borderColor: HEADER_TEXT
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: HEADER_TEXT
                            },
                            '.MuiSvgIcon-root': {
                              color: HEADER_TEXT
                            }
                          }}
                        >
                          <MenuItem value="Autumn">Autumn</MenuItem>
                          <MenuItem value="Winter">Winter</MenuItem>
                          <MenuItem value="Summer">Summer</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>

                  {/* Actions header */}
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 3,
                      backgroundColor: HEADER_BG,
                      color: HEADER_TEXT,
                      fontSize: FONT_SIZE_HEADER,
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>

                {/* ===== SUB HEADER ===== */}
                <TableRow sx={{ height: HEADER_HEIGHT }}>
                  {Array(4)
                    .fill(null)
                    .map((_, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          position: 'sticky',
                          top: HEADER_HEIGHT,
                          backgroundColor: HEADER_BG
                        }}
                      />
                    ))}

                  {['Start', 'End', 'Extend'].map((label) => (
                    <TableCell
                      key={label}
                      sx={{
                        width: COLUMN_WIDTHS.seasonCol,
                        position: 'sticky',
                        top: HEADER_HEIGHT,
                        backgroundColor: HEADER_BG,
                        color: HEADER_TEXT,
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}

                  {/* empty cell for Actions column */}
                  <TableCell
                    sx={{
                      position: 'sticky',
                      top: HEADER_HEIGHT,
                      backgroundColor: HEADER_BG
                    }}
                  />
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedZones.map((zone, index) => {
                  const season = getSeason(zone, selectedSeason);
                  const isEditing = editingRow === zone.zoneId;

                  return (
                    <TableRow key={zone.zoneId} hover>
                      <TableCell align="center">
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{districts.get(zone.dist_id)}</TableCell>
                      <TableCell>{taluks.get(zone.zoneId)}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: HEADER_BG }}>
                        {zone.zoneName}
                      </TableCell>

                      {/* Start date */}
                      <TableCell align="center">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editValues.startDate}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                startDate: e.target.value
                              }))
                            }
                            style={{ padding: '4px', fontSize: '0.82rem' }}
                          />
                        ) : (
                          season?.defaultStart || 'NA'
                        )}
                      </TableCell>

                      {/* End date (not editable through this API) */}
                      <TableCell align="center">
                        {season?.defaultEnd || 'NA'}
                      </TableCell>

                      {/* Extend date */}
                      <TableCell align="center">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editValues.extendedDate}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                extendedDate: e.target.value
                              }))
                            }
                            style={{ padding: '4px', fontSize: '0.82rem' }}
                          />
                        ) : (
                          season?.extendDate || 'NA'
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        {isEditing ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              disabled={saving}
                              onClick={() => handleSave(zone, season)}
                              sx={{ mr: 0.5, minWidth: '44px' }}
                            >
                              {saving ? <CircularProgress size={20} /> : 'Save'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleCancel}
                              sx={{ minWidth: '44px' }}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleEdit(zone, season)}
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={zones.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(+e.target.value);
              setPage(0);
            }}
          />
        </Paper>
      </Grid>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default ZoneSeasonsTable;
