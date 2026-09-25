import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import AdvancedForecastService, { PREDEFINED_RETURN_REASONS } from './advancedForecastService';
import CultivatorDetailDrawer from './CultivatorDetailDrawer';

const CROP_CATEGORY_ITEMS = [
  { id: 'All', label: 'All Crops', icon: '🌐', color: '#0284c7', subtext: 'Complete Dataset' },
  { id: 'Paddy', label: 'Paddy', icon: '🌾', color: '#16a34a', subtext: 'Cereals' },
  { id: 'Coconut', label: 'Coconut', icon: '🥥', color: '#d97706', subtext: 'Plantation' },
  { id: 'Banana', label: 'Banana', icon: '🍌', color: '#eab308', subtext: 'Horticulture' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦', color: '#059669', subtext: 'Tubers' },
  { id: 'Rubber', label: 'Rubber', icon: '🪵', color: '#9333ea', subtext: 'Commercial' }
];

const InspectorVerificationView = ({ userJurisdiction, initialMode = 'inspector' }) => {
  const [submissions, setSubmissions] = useState([]);
  const [roleViewMode, setRoleViewMode] = useState(initialMode); // 'inspector' | 'approver'

  useEffect(() => {
    if (initialMode) {
      setRoleViewMode(initialMode);
    }
  }, [initialMode]);
  const [activeTab, setActiveTab] = useState('review'); // 'list' or 'review'

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('yieldPct'); // 'yieldPct', 'yieldVal', 'areaVal', 'name'
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterZone, setFilterZone] = useState('All');
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');

  // Drawer & Modals
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [predefinedReason, setPredefinedReason] = useState(PREDEFINED_RETURN_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  // Submit to Taluk Approver Modal State
  const [submitTalukModalOpen, setSubmitTalukModalOpen] = useState(false);
  const [submitTalukSuccess, setSubmitTalukSuccess] = useState(false);

  // Supervisor Submit Modal & Success State
  const [submitDistrictModalOpen, setSubmitDistrictModalOpen] = useState(false);
  const [supervisorConfirmed, setSupervisorConfirmed] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const refreshData = () => {
    const data = AdvancedForecastService.getSubmissions();
    setSubmissions(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Crop Category Counts
  const cropCategoryCounts = useMemo(() => {
    const counts = { All: submissions.length, Paddy: 0, Coconut: 0, Banana: 0, Vegetables: 0, Rubber: 0 };
    submissions.forEach((s) => {
      const cat = s.cropCategory || (s.crop === 'Paddy' ? 'Paddy' : s.crop === 'Coconut' ? 'Coconut' : s.crop === 'Banana' ? 'Banana' : s.crop === 'Vegetables' ? 'Vegetables' : s.crop === 'Rubber' ? 'Rubber' : 'Paddy');
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.Paddy++;
      }
    });
    return counts;
  }, [submissions]);

  // Compute selected 10 count
  const selected10Count = useMemo(() => {
    return submissions.filter((s) => s.isLeadingSelected).length;
  }, [submissions]);

  const isExactly10 = selected10Count === 10;

  // Selected Cultivators List
  const selected10List = useMemo(() => {
    return submissions.filter((s) => s.isLeadingSelected);
  }, [submissions]);

  // Selected Cultivators Grouped Block-wise
  const selectedByBlockMap = useMemo(() => {
    const map = {};
    selected10List.forEach((c) => {
      const b = c.block || 'Vyttila';
      if (!map[b]) map[b] = [];
      map[b].push(c);
    });
    return map;
  }, [selected10List]);

  // Dashboard summary stats
  const summary = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === 'Submitted' || s.status === 'Under Review').length;
    const leadingSelected = selected10Count;
    const submittedToDistrict = submissions.filter((s) => s.status === 'Submitted to District' || s.status === 'Approved').length;
    const returned = submissions.filter((s) => s.status === 'Returned for Correction').length;

    return { total, pending, leadingSelected, submittedToDistrict, returned };
  }, [submissions, selected10Count]);

  // Sorted & Filtered Records for Selection Table
  const filteredAndSortedRecords = useMemo(() => {
    return submissions
      .filter((r) => {
        if (filterBlock !== 'All' && r.block !== filterBlock) return false;
        if (filterZone !== 'All' && r.zone !== filterZone) return false;
        if (filterCrop !== 'All' && r.crop !== filterCrop) return false;
        if (selectedCropCategory !== 'All') {
          const cat = r.cropCategory || r.crop;
          if (cat !== selectedCropCategory && r.crop !== selectedCropCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const yieldPctA = a.previousYearYield > 0 ? ((a.currentYearYield - a.previousYearYield) / a.previousYearYield) * 100 : 0;
        const yieldPctB = b.previousYearYield > 0 ? ((b.currentYearYield - b.previousYearYield) / b.previousYearYield) * 100 : 0;

        if (sortBy === 'yieldPct') return yieldPctB - yieldPctA;
        if (sortBy === 'yieldVal') return b.currentYearYield - a.currentYearYield;
        if (sortBy === 'areaVal') return b.currentYearArea - a.currentYearArea;
        if (sortBy === 'name') return a.cultivatorName.localeCompare(b.cultivatorName);
        return 0;
      });
  }, [submissions, filterBlock, filterZone, filterCrop, selectedCropCategory, sortBy]);

  // Handlers
  const handleToggleLeading = (cultivatorId) => {
    try {
      setErrorMsg('');
      AdvancedForecastService.toggleLeadingSelection(cultivatorId);
      refreshData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleOpenReturnModal = () => {
    setCustomReason('');
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!customReason.trim()) {
      alert('Please enter comments explaining the return reason.');
      return;
    }
    AdvancedForecastService.returnSubmissionForCorrection(customReason, predefinedReason, 'Taluk Level Approver');
    refreshData();
    setReturnModalOpen(false);
  };

  const handleConfirmSubmitTaluk = () => {
    try {
      AdvancedForecastService.submitToTalukApprover(`Submitted by Taluk Inspector S. Nair with ${selected10Count} leading cultivator(s) marked.`);
      refreshData();
      setSubmitTalukModalOpen(false);
      setSubmitTalukSuccess(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmSubmitDistrict = () => {
    if (!supervisorConfirmed) return;
    try {
      AdvancedForecastService.submit10LeadingToDistrict('Reviewed and verified 10 leading cultivators for District sanction.');
      refreshData();
      setSubmitDistrictModalOpen(false);
      setSubmitSuccess(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Role Mode Switcher: Taluk Inspector vs Taluk Level Approver */}
      <Paper elevation={0} sx={{ p: 1, mb: 3, borderRadius: 3, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant={roleViewMode === 'inspector' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setRoleViewMode('inspector')}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.88rem',
                backgroundColor: roleViewMode === 'inspector' ? '#0284c7' : 'transparent'
              }}
            >
              Step 1: Taluk Field Inspector (Select &amp; Submit to Approver)
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant={roleViewMode === 'approver' ? 'contained' : 'outlined'}
              color="warning"
              onClick={() => setRoleViewMode('approver')}
              sx={{
                py: 1.2,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: '0.88rem',
                backgroundColor: roleViewMode === 'approver' ? '#d97706' : 'transparent',
                color: roleViewMode === 'approver' ? '#ffffff' : '#d97706'
              }}
            >
              Step 2: Taluk Level Approver (Share List to District)
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Title & Jurisdiction Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {roleViewMode === 'inspector'
              ? 'Forecast Verification & Leading Cultivator Selection (Taluk Inspector)'
              : 'Taluk Level Approver Portal — Share List to District'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {roleViewMode === 'inspector'
              ? 'Review field data, mark leading cultivators, and submit verification to Taluk Level Approver'
              : 'Review Inspector submission, select/adjust leading cultivators, and forward list to District Approver'}
          </Typography>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="error" startIcon={<ReplayIcon />} onClick={handleOpenReturnModal} sx={{ fontWeight: 700 }}>
            Return for Correction
          </Button>

          {roleViewMode === 'inspector' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => setSubmitTalukModalOpen(true)}
              sx={{ px: 3, fontWeight: 700, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)' }}
            >
              Submit to Taluk Approver
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              startIcon={<SendIcon />}
              disabled={selected10Count === 0}
              onClick={() => setSubmitDistrictModalOpen(true)}
              sx={{ px: 3, fontWeight: 700, boxShadow: selected10Count > 0 ? '0 4px 14px rgba(217, 119, 6, 0.4)' : 'none' }}
            >
              Share Block Selections to District
            </Button>
          )}
        </Stack>
      </Box>

      {/* TOP SECTION: DEDICATED CROP CATEGORY SELECTION BAR FOR SUPERVISOR */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AgricultureIcon sx={{ color: '#38bdf8' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px' }}>
              Supervisor Crop Selection &amp; Verification Filter
            </Typography>
            <Chip
              label={selectedCropCategory === 'All' ? 'Showing All Crops' : `Selected Crop: ${selectedCropCategory}`}
              size="small"
              sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, ml: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Select a crop category to focus verification and select leading cultivators per crop
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          {CROP_CATEGORY_ITEMS.map((item) => {
            const isSelected = selectedCropCategory === item.id;
            const count = cropCategoryCounts[item.id] || 0;

            return (
              <Grid item xs={6} sm={4} md={2} key={item.id}>
                <Card
                  onClick={() => setSelectedCropCategory(item.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: isSelected ? `2px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8, mb: 0.5 }}>
                      <Typography variant="h6" component="span">
                        {item.icon}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <Chip
                        label={`${count} Entries`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: isSelected ? item.color : 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Error / Warning Alert if selection constraint violated */}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Taluk Approver Special Alert if no cultivators were marked by Inspector */}
      {roleViewMode === 'approver' && selected10Count === 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon sx={{ fontSize: '2rem' }} />} sx={{ mb: 3, borderRadius: 3, backgroundColor: '#fefce8', border: '1px solid #fde047' }}>
          <AlertTitle sx={{ fontWeight: 800, color: '#854d0e' }}>
            No Leading Cultivator Marked by Inspector
          </AlertTitle>
          <Typography variant="body2" sx={{ color: '#713f12', fontWeight: 600 }}>
            The Taluk Field Inspector has not marked any leading cultivators. As the <strong>Taluk Level Approver</strong>, you can select the 10 leading cultivators from the table below and forward the list directly to the District.
          </Typography>
        </Alert>
      )}


      {/* Prominent Sticky Block Selection Indicator Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#f59e0b' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
              Block-Level Cultivator Selection &amp; Review Summary
            </Typography>
          </Box>

          <Chip
            label={selected10Count > 0 ? `${selected10Count} CULTIVATORS SELECTED` : 'NO SELECTION YET'}
            color={selected10Count > 0 ? 'success' : 'warning'}
            sx={{ fontWeight: 800 }}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={selected10Count > 0 ? 100 : 0}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.15)',
            '.MuiLinearProgress-bar': {
              backgroundColor: selected10Count > 0 ? '#22c55e' : '#f59e0b'
            }
          }}
        />

        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 1 }}>
          Cultivator selection is performed Block-wise. Review selected cultivators grouped by Block with flexible count rules (&lt; 10 accepted per block) before forwarding to District Level Approver.
        </Typography>
      </Paper>

      {/* Grid Layout: Main Table on Left, Sticky Selected 10 Summary Panel on Right */}
      <Grid container spacing={3}>
        {/* Left Column: Cultivators Table */}
        <Grid item xs={12} lg={8.5}>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} sm={3}>
                <TextField select fullWidth size="small" label="Sort By Performance" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <MenuItem value="yieldPct">Yield Increase % (Desc)</MenuItem>
                  <MenuItem value="yieldVal">Current Yield (q/ha)</MenuItem>
                  <MenuItem value="areaVal">Current Area (ha)</MenuItem>
                  <MenuItem value="name">Cultivator Name</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField select fullWidth size="small" label="Filter Block" value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
                  <MenuItem value="All">All Blocks</MenuItem>
                  <MenuItem value="Vyttila">Vyttila</MenuItem>
                  <MenuItem value="Paravur">Paravur</MenuItem>
                  <MenuItem value="Aluva">Aluva</MenuItem>
                  <MenuItem value="Tripunithura">Tripunithura</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField select fullWidth size="small" label="Filter Crop" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
                  <MenuItem value="All">All Crops</MenuItem>
                  <MenuItem value="Paddy">Paddy</MenuItem>
                  <MenuItem value="Banana">Banana</MenuItem>
                  <MenuItem value="Coconut">Coconut</MenuItem>
                  <MenuItem value="Vegetables">Vegetables</MenuItem>
                  <MenuItem value="Rubber">Rubber</MenuItem>
                  <MenuItem value="Tapioca">Tapioca</MenuItem>
                  <MenuItem value="Pepper">Pepper</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={6} sm={3}>
                <TextField select fullWidth size="small" label="Filter Zone" value={filterZone} onChange={(e) => setFilterZone(e.target.value)}>
                  <MenuItem value="All">All Zones</MenuItem>
                  <MenuItem value="Zone 01">Zone 01</MenuItem>
                  <MenuItem value="Zone 02">Zone 02</MenuItem>
                  <MenuItem value="Zone 03">Zone 03</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#0f172a' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Select 10</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cultivator</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crop &amp; Variety</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Panchayth</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Current Yield</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Yield Change %</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tag</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAndSortedRecords.map((row) => {
                  const prevYield = row.previousYearYield || 0;
                  const curYield = row.currentYearYield || 0;
                  const yieldPct = prevYield > 0 ? (((curYield - prevYield) / prevYield) * 100).toFixed(1) : '0.0';
                  const isChecked = Boolean(row.isLeadingSelected);

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        backgroundColor: isChecked ? '#fffbeb' : 'inherit',
                        '&:hover': { backgroundColor: isChecked ? '#fef3c7' : '#f8fafc' }
                      }}
                    >
                      <TableCell align="center">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggleLeading(row.id)}
                          color="warning"
                          icon={<StarBorderIcon />}
                          checkedIcon={<StarIcon sx={{ color: '#f59e0b' }} />}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {row.cultivatorName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {row.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {row.crop}
                        </Typography>
                        {row.variety && <Chip label={row.variety} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />}
                      </TableCell>

                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {row.panchayat}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {row.zone}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {curYield} q/ha
                      </TableCell>

                      <TableCell align="right" sx={{ fontWeight: 700, color: parseFloat(yieldPct) >= 0 ? '#16a34a' : '#dc2626' }}>
                        {parseFloat(yieldPct) >= 0 ? `+${yieldPct}%` : `${yieldPct}%`}
                      </TableCell>

                      <TableCell>
                        {row.isLeadingCandidate ? (
                          <Chip label="Leading Candidate" size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: '0.65rem' }} />
                        ) : (
                          <Chip label="Standard" size="small" variant="outlined" sx={{ fontSize: '0.65rem', color: '#64748b' }} />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRecordForDrawer(row);
                            setDrawerOpen(true);
                          }}
                          sx={{ color: '#0284c7' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Right Column: Sticky Block-wise Cultivator Selection Summary Panel */}
        <Grid item xs={12} lg={3.5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              position: 'sticky',
              top: 20
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#f59e0b' }} /> Block-level Selection Summary
              </Typography>
              <Chip label={`${selected10Count} Selected`} color={selected10Count > 0 ? 'success' : 'warning'} size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {selected10List.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                No cultivators selected yet. Click the star checkboxes in the left table to select cultivators Block-wise.
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
                {Object.keys(selectedByBlockMap).map((blockName) => {
                  const blockSelected = selectedByBlockMap[blockName];

                  return (
                    <Box key={blockName} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0284c7' }}>
                          Block: {blockName}
                        </Typography>
                        <Chip
                          label={`${blockSelected.length} Selected`}
                          size="small"
                          sx={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </Box>

                      {blockSelected.map((item, index) => (
                        <Paper key={item.id} elevation={0} sx={{ p: 1.2, mb: 1, backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={`#${index + 1}`} size="small" sx={{ backgroundColor: '#f59e0b', color: '#fff', fontWeight: 800, fontSize: '0.65rem' }} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', fontSize: '0.82rem' }}>
                                  {item.cultivatorName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.72rem' }}>
                                  {item.crop} • {item.panchayat} ({item.currentYearYield} q/ha)
                                </Typography>
                              </Box>
                            </Box>

                            <IconButton size="small" onClick={() => handleToggleLeading(item.id)} sx={{ color: '#dc2626' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="contained"
              color={roleViewMode === 'inspector' ? 'primary' : 'warning'}
              disabled={selected10Count === 0}
              startIcon={<SendIcon />}
              onClick={() => (roleViewMode === 'inspector' ? setSubmitTalukModalOpen(true) : setSubmitDistrictModalOpen(true))}
              sx={{ py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {roleViewMode === 'inspector' ? 'Submit Selection to Taluk Approver' : 'Share Block Selections to District'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Cultivator Detail Drawer */}
      <CultivatorDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecordForDrawer}
        activeRole="Taluk Level Approver / Field Inspector"
        onToggleLeading={handleToggleLeading}
      />

      {/* Return for Correction Modal */}
      <Dialog open={returnModalOpen} onClose={() => setReturnModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', color: '#fff', fontWeight: 700 }}>
          Return Submission for Correction
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            This action will return the submission back to Field Data Collector Ramesh K. with your mandatory reviewer comments.
          </Alert>

          <TextField
            select
            fullWidth
            label="Predefined Reason Category"
            value={predefinedReason}
            onChange={(e) => setPredefinedReason(e.target.value)}
            sx={{ mb: 3 }}
          >
            {PREDEFINED_RETURN_REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Detailed Reviewer Comments *"
            placeholder="Specify which cultivator record or yield figure needs correction..."
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setReturnModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmReturn} sx={{ fontWeight: 700 }}>
            Return to Field Collector
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit to Taluk Approver Confirmation Modal */}
      <Dialog open={submitTalukModalOpen} onClose={() => setSubmitTalukModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', fontWeight: 700 }}>
          Submit Verification &amp; Selection to Taluk Level Approver?
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to submit the verified crop forecast records and <strong>{selected10Count} marked leading cultivator(s)</strong> for Kanayannur Taluk to the <strong>Taluk Level Approver</strong>.
          </Typography>
          {selected10Count === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Note: No leading cultivators are marked. The Taluk Level Approver will be able to select and forward the 10 leading cultivators list to District.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitTalukModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmSubmitTaluk} sx={{ fontWeight: 700 }}>
            Confirm &amp; Submit to Approver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submit to Taluk Success Dialog */}
      {submitTalukSuccess && (
        <Dialog open={submitTalukSuccess} onClose={() => setSubmitTalukSuccess(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4rem', color: '#0284c7', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Submitted to Taluk Level Approver!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your verified forecast list has been forwarded to the Taluk Level Approver.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setSubmitTalukSuccess(false)} sx={{ fontWeight: 700 }}>
              Done
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {/* Submit 10 Leading to District Confirmation Modal */}
      <Dialog open={submitDistrictModalOpen} onClose={() => setSubmitDistrictModalOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', fontWeight: 700 }}>
          Confirm 10 Leading Cultivators Submission to District Approver
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are submitting the verified list of <strong>10 Leading Cultivators for Block Vyttila / Kanayannur Taluk</strong> to <strong>District Officer M. Menon</strong> for final sanction.
          </Typography>

          <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #fde68a', backgroundColor: '#fffbeb', borderRadius: 2.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400e', mb: 1 }}>
              ★ Final 10 Selected Leading Cultivators:
            </Typography>
            <Grid container spacing={1}>
              {selected10List.map((c, i) => (
                <Grid item xs={12} sm={6} key={c.id}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {i + 1}. {c.cultivatorName} ({c.crop} • {c.panchayat}) — {c.currentYearYield} q/ha
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <FormControlLabel
            control={<Checkbox checked={supervisorConfirmed} onChange={(e) => setSupervisorConfirmed(e.target.checked)} color="primary" />}
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                I confirm that the 10 selected leading cultivators have been verified and comply with block yield benchmarks.
              </Typography>
            }
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSubmitDistrictModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" disabled={!supervisorConfirmed} onClick={handleConfirmSubmitDistrict} sx={{ fontWeight: 700 }}>
            Share List to District Approver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submission Success Dialog */}
      {submitSuccess && (
        <Dialog open={submitSuccess} onClose={() => setSubmitSuccess(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: '4rem', color: '#16a34a', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Submitted to District Approver!
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              The 10 selected leading cultivators for Vyttila block have been forwarded to District Officer M. Menon.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setSubmitSuccess(false)} sx={{ fontWeight: 700 }}>
              Done
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default InspectorVerificationView;
