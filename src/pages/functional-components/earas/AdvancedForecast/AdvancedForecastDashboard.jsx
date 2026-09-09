import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

// ---- static option lists (wire these up to real API data as needed) ----
const PANCHAYAT_OPTIONS = ['Vazhakkad', 'Kanjiramkulam', 'Chenkal'];
const VILLAGE_OPTIONS = ['Vazhakkad', 'Kanjiramkulam', 'Chenkal'];
const SEASON_OPTIONS = ['Autumn (Virippu)', 'Winter (Mundakan)', 'Summer (Puncha)'];
const CROP_OPTIONS = ['Paddy', 'Tapioca', 'Banana', 'Vegetables'];
const VARIETY_OPTIONS = {
  Paddy: ['Jyothi', 'Uma', 'Kanchana'],
  Tapioca: ['M4', 'Sree Vijaya'],
  Banana: ['Nendran', 'Robusta'],
  Vegetables: ['N/A']
};

const EMPTY_FORM = {
  panchayat: '',
  village: '',
  cultivatorName: '',
  season: '',
  crop: '',
  variety: '',
  currentArea: '',
  previousArea: '',
  currentYield: '',
  previousYield: '',
  remarks: ''
};

const SEED_RECORDS = [
  {
    id: 'FC-2026-001',
    panchayat: 'Kanjiramkulam',
    village: 'Kanjiramkulam',
    cultivatorName: 'Rajendran Nair',
    season: 'Autumn (Virippu)',
    crop: 'Paddy',
    variety: 'Jyothi',
    currentArea: '45.5',
    previousArea: '42',
    currentYield: '3.2',
    previousYield: '3',
    remarks: 'Timely monsoon aided sowing. Yield expected to increase.',
    status: 'Saved (Draft)'
  },
  {
    id: 'FC-2026-002',
    panchayat: 'Chenkal',
    village: 'Chenkal',
    cultivatorName: 'Soman Pillai',
    season: 'Autumn (Virippu)',
    crop: 'Tapioca',
    variety: '',
    currentArea: '120',
    previousArea: '115',
    currentYield: '28.5',
    previousYield: '27',
    remarks: 'Good tuber formation observed.',
    status: 'Saved (Draft)'
  }
];

function AdvancedForecastDashboard() {
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [records, setRecords] = useState(SEED_RECORDS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [recordSeq, setRecordSeq] = useState(SEED_RECORDS.length + 1);

  const activeZone = localStorage.getItem('activeZone') || 'Vazhakkad';
  const agriYear = localStorage.getItem('activeAgriYear') || '2026-2027';

  const draftCount = records.filter((r) => r.status === 'Saved (Draft)').length;

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      // reset variety whenever crop changes
      ...(field === 'crop' ? { variety: '' } : {})
    }));
  };

  const resetForm = () => setForm(EMPTY_FORM);

  const handleCancel = () => {
    resetForm();
    setView('list');
  };

  const handleSave = () => {
    const requiredFields = ['panchayat', 'village', 'season', 'crop', 'currentArea', 'previousArea', 'currentYield', 'previousYield'];
    const missing = requiredFields.some((field) => !form[field]);
    if (missing) {
      // Replace with a snackbar/toast in the real app
      alert('Please fill in all required fields marked with *');
      return;
    }

    const newRecord = {
      id: `FC-2026-${String(recordSeq).padStart(3, '0')}`,
      ...form,
      status: 'Saved (Draft)'
    };

    setRecords((prev) => [...prev, newRecord]);
    setRecordSeq((prev) => prev + 1);
    resetForm();
    setView('list');
  };

  const handleDelete = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSendForApproval = () => {
    setRecords((prev) => prev.map((r) => (r.status === 'Saved (Draft)' ? { ...r, status: 'Pending Approval' } : r)));
  };

  const cardStyles = {
    borderRadius: 4,
    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  };

  const statusChipColor = (status) => {
    if (status === 'Saved (Draft)') return { color: '#0288d1', bg: 'rgba(2,136,209,0.1)', border: 'rgba(2,136,209,0.4)' };
    if (status === 'Pending Approval') return { color: '#ef6c00', bg: 'rgba(239,108,0,0.1)', border: 'rgba(239,108,0,0.4)' };
    return { color: '#2e7d32', bg: 'rgba(46,125,50,0.1)', border: 'rgba(46,125,50,0.4)' };
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12}>
        <MainCard title="" sx={cardStyles}>
          {/* ---------------- HEADER BAR ---------------- */}
          <Box
            sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            {view === 'add' ? (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: '1.35rem'
                  }}
                >
                  <AgricultureIcon sx={{ fontSize: '1.9rem', color: '#4facfe' }} />
                  Add New Crop Forecast Entry
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.4)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.08)' }
                  }}
                >
                  Back To Table List
                </Button>
              </>
            ) : (
              <>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 'bold',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: '1.35rem'
                    }}
                  >
                    <FormatListBulletedIcon sx={{ fontSize: '1.7rem', color: '#4facfe' }} />
                    Crop Forecast Table List ({records.length} Records)
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5, ml: 4 }}>
                    {draftCount} draft {draftCount === 1 ? 'entry' : 'entries'} ready to send for approval
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setView('add')}
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #2979ff 100%)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5
                    }}
                  >
                    Add Entry
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={draftCount === 0}
                    onClick={handleSendForApproval}
                    sx={{
                      background: 'linear-gradient(135deg, #43e97b 0%, #2e9e56 100%)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      '&.Mui-disabled': { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)' }
                    }}
                  >
                    Send For Approval ({draftCount})
                  </Button>
                </Box>
              </>
            )}
          </Box>

          {/* ---------------- BODY ---------------- */}
          {view === 'add' ? (
            <Box sx={{ p: 3.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Panchayat (User Zone)"
                    value={form.panchayat}
                    onChange={handleFieldChange('panchayat')}
                    helperText="Loaded for active zone"
                  >
                    {PANCHAYAT_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth required label="Village" value={form.village} onChange={handleFieldChange('village')}>
                    {VILLAGE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Cultivator / Farmer Name"
                    value={form.cultivatorName}
                    onChange={handleFieldChange('cultivatorName')}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth required label="Crop" value={form.crop} onChange={handleFieldChange('crop')}>
                    {CROP_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth required label="Season" value={form.season} onChange={handleFieldChange('season')}>
                    {SEASON_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Variety (Paddy Specific)"
                    value={form.variety}
                    onChange={handleFieldChange('variety')}
                    disabled={!form.crop}
                  >
                    {(VARIETY_OPTIONS[form.crop] || []).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Comparative Forecast Inputs" size="small" sx={{ fontWeight: 600 }} />
                  </Divider>
                </Grid>


                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Previous Year Area"
                    value={form.previousArea}
                    onChange={handleFieldChange('previousArea')}
                    InputProps={{ endAdornment: <InputAdornment position="end">ha</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Previous Year Yield"
                    value={form.previousYield}
                    onChange={handleFieldChange('previousYield')}
                    InputProps={{ endAdornment: <InputAdornment position="end">t/ha</InputAdornment> }}
                  />
                </Grid>  
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Current Year Area"
                    value={form.currentArea}
                    onChange={handleFieldChange('currentArea')}
                    InputProps={{ endAdornment: <InputAdornment position="end">ha</InputAdornment> }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Current Year Estimated Yield"
                    value={form.currentYield}
                    onChange={handleFieldChange('currentYield')}
                    InputProps={{ endAdornment: <InputAdornment position="end">t/ha</InputAdornment> }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Remarks (if any)"
                    value={form.remarks}
                    onChange={handleFieldChange('remarks')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                    <Button variant="outlined" onClick={handleCancel} sx={{ textTransform: 'none', borderRadius: 2, px: 3 }}>
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        background: 'linear-gradient(135deg, #4facfe 0%, #2979ff 100%)'
                      }}
                    >
                      Save Data (Back To List)
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1100 }}>
                <TableHead>
                  <TableRow sx={{ background: '#0f3460' }}>
                    {[
                      'Record ID',
                      'Panchayat / Village',
                      'Cultivator Name',
                      'Season',
                      'Crop & Variety',
                      'Current Area (ha)',
                      'Previous Area (ha)',
                      'Current Yield (t/ha)',
                      'Previous Yield (t/ha)',
                      'Remarks',
                      'Status',
                      'Action'
                    ].map((heading) => (
                      <TableCell key={heading} sx={{ color: '#fff', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No crop forecast entries yet. Click "Add Entry" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                  {records.map((record, index) => {
                    const chip = statusChipColor(record.status);
                    return (
                      <TableRow key={record.id} sx={{ background: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                        <TableCell sx={{ color: '#1976d2', fontWeight: 600 }}>{record.id}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{record.panchayat}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {record.village}
                          </Typography>
                        </TableCell>
                        <TableCell>{record.cultivatorName || '—'}</TableCell>
                        <TableCell>{record.season}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }}>{record.crop}</Typography>
                          {record.variety && <Chip label={record.variety} size="small" sx={{ mt: 0.5 }} />}
                        </TableCell>
                        <TableCell align="right">{record.currentArea}</TableCell>
                        <TableCell align="right">{record.previousArea}</TableCell>
                        <TableCell align="right">{record.currentYield}</TableCell>
                        <TableCell align="right">{record.previousYield}</TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>{record.remarks || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            size="small"
                            variant="outlined"
                            sx={{ color: chip.color, background: chip.bg, borderColor: chip.border, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleDelete(record.id)} sx={{ color: '#e53935' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default AdvancedForecastDashboard;