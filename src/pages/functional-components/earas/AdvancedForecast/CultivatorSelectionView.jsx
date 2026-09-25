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
  Checkbox,
  IconButton,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import AdvancedForecastService from './advancedForecastService';
import CultivatorDetailDrawer from './CultivatorDetailDrawer';

const CROP_CATEGORY_ITEMS = [
  { id: 'All', label: 'All Crops', icon: '🌐', color: '#0284c7', subtext: 'Complete Dataset' },
  { id: 'Paddy', label: 'Paddy', icon: '🌾', color: '#16a34a', subtext: 'Cereals' },
  { id: 'Coconut', label: 'Coconut', icon: '🥥', color: '#d97706', subtext: 'Plantation' },
  { id: 'Banana', label: 'Banana', icon: '🍌', color: '#eab308', subtext: 'Horticulture' },
  { id: 'Vegetables', label: 'Vegetables', icon: '🥦', color: '#059669', subtext: 'Tubers' },
  { id: 'Rubber', label: 'Rubber', icon: '🪵', color: '#9333ea', subtext: 'Commercial' }
];

const CultivatorSelectionView = ({ userJurisdiction }) => {
  const activeRole = 'Field Inspector';

  // Data & Workflow States
  const [submissions, setSubmissions] = useState([]);
  const [workflowState, setWorkflowState] = useState({
    status: 'Pending Inspector Selection',
    forwardedByRole: null,
    forwardedByName: null,
    forwardedAt: null,
    notes: '',
    destination: null,
    inspectorCompleted: false
  });

  // Filter States
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterCrop, setFilterCrop] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // UI States
  const [expandedBlocks, setExpandedBlocks] = useState({});
  const [selectedRecordForDrawer, setSelectedRecordForDrawer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Forwarding Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [forwardNotes, setForwardNotes] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Refresh data from service
  const refreshData = () => {
    const allData = AdvancedForecastService.getSubmissions();
    setSubmissions(allData);
    const wf = AdvancedForecastService.getCultivatorWorkflowState();
    setWorkflowState(wf);
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

  // Unique Blocks & Crops for Dropdowns
  const availableBlocks = useMemo(() => {
    const list = [...new Set(submissions.map((s) => s.block).filter(Boolean))];
    return ['All', ...list];
  }, [submissions]);

  const availableCrops = useMemo(() => {
    const list = [...new Set(submissions.map((s) => s.crop).filter(Boolean))];
    return ['All', ...list];
  }, [submissions]);

  // Group cultivators Block-wise (Filtered)
  const blockWiseMap = useMemo(() => {
    const map = {};
    submissions.forEach((item) => {
      // Filter Block
      if (filterBlock !== 'All' && item.block !== filterBlock) return;

      // Filter Crop
      if (filterCrop !== 'All' && item.crop !== filterCrop) return;

      // Filter Crop Category
      if (selectedCropCategory !== 'All') {
        const cat = item.cropCategory || item.crop;
        if (cat !== selectedCropCategory && item.crop !== selectedCropCategory) return;
      }

      // Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.cultivatorName?.toLowerCase().includes(q) ||
          item.id?.toLowerCase().includes(q) ||
          item.cultivatorPhone?.toLowerCase().includes(q) ||
          item.panchayat?.toLowerCase().includes(q) ||
          item.crop?.toLowerCase().includes(q);
        if (!match) return;
      }

      const b = item.block || 'Vyttila';
      if (!map[b]) map[b] = [];
      map[b].push(item);
    });
    return map;
  }, [submissions, filterBlock, filterCrop, selectedCropCategory, searchQuery]);

  // Auto-expand all blocks initially
  useEffect(() => {
    const initial = {};
    Object.keys(blockWiseMap).forEach((b) => {
      initial[b] = true;
    });
    setExpandedBlocks(initial);
  }, [blockWiseMap]);

  // Calculate totals per block
  const blockStats = useMemo(() => {
    const stats = {};
    Object.keys(blockWiseMap).forEach((bName) => {
      const items = blockWiseMap[bName];
      const total = items.length;
      const selected = items.filter((i) => i.isLeadingSelected).length;
      stats[bName] = { total, selected, hasLessThan10: total < 10 };
    });
    return stats;
  }, [blockWiseMap]);

  // Total overall selected across all blocks
  const totalOverallSelected = useMemo(() => {
    return submissions.filter((s) => s.isLeadingSelected).length;
  }, [submissions]);

  const isFiltersActive = filterBlock !== 'All' || filterCrop !== 'All' || selectedCropCategory !== 'All' || Boolean(searchQuery);

  const handleResetFilters = () => {
    setFilterBlock('All');
    setFilterCrop('All');
    setSelectedCropCategory('All');
    setSearchQuery('');
  };

  // Handlers
  const handleToggleCultivator = (id) => {
    AdvancedForecastService.toggleCultivatorSelection(id);
    refreshData();
  };

  const handleToggleSelectAllInBlock = (blockName, selectAll) => {
    AdvancedForecastService.toggleSelectAllInBlock(blockName, selectAll);
    refreshData();
  };

  const handleAccordionChange = (blockName) => (event, isExpanded) => {
    setExpandedBlocks((prev) => ({ ...prev, [blockName]: isExpanded }));
  };

  const handleOpenConfirmModal = () => {
    setForwardNotes('');
    setConfirmModalOpen(true);
  };

  const handleExecuteForwardSubmit = () => {
    const blockSummary = {};
    Object.keys(blockStats).forEach((b) => {
      blockSummary[b] = `${blockStats[b].selected} / ${blockStats[b].total} selected`;
    });

    AdvancedForecastService.forwardSelectionByInspector(forwardNotes, blockSummary);
    refreshData();
    setConfirmModalOpen(false);
    setSuccessModalOpen(true);
  };

  const handleResetWorkflow = () => {
    AdvancedForecastService.resetCultivatorWorkflowState();
    refreshData();
  };

  return (
    <Box sx={{ mt: 1 }}>
      {/* Field Inspector Workflow Header */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 3,
          backgroundColor: '#f8fafc',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#0284c7', width: 44, height: 44 }}>
                <SupervisorAccountIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Field Inspector — Cultivator Selection Workflow (Block-wise)
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Role: <strong>Field Inspector (Inspector S. Nair)</strong> • Forward Destination: <strong>Taluk Level Approver</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* LIVE WORKFLOW STATUS BANNER */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: workflowState.status.includes('Forwarded')
            ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AssignmentTurnedInIcon sx={{ fontSize: '2.4rem', color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.5px' }}>
                FIELD INSPECTION SELECTION STATUS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>
                {workflowState.status}
              </Typography>
              {workflowState.forwardedByRole && (
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.3 }}>
                  Forwarded by <strong>{workflowState.forwardedByName} ({workflowState.forwardedByRole})</strong> on {workflowState.forwardedAt} → Destination: <strong>{workflowState.destination}</strong>
                </Typography>
              )}
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={`Total Selected: ${totalOverallSelected} Cultivators`}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}
            />
            {workflowState.status !== 'Pending Inspector Selection' && (
              <Button size="small" variant="outlined" color="inherit" onClick={handleResetWorkflow} startIcon={<ReplayIcon />} sx={{ borderColor: 'rgba(255,255,255,0.4)' }}>
                Reset Selection
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* DEDICATED BLOCK-LEVEL SELECTION SUMMARY DASHBOARD PANEL */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          border: '1.5px solid #0284c7',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex' }}>
              <LocationCityIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Block-Level Cultivator Selection Summary
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Summary of selected cultivators per Block across Taluk jurisdiction
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${Object.keys(blockStats).length} Blocks Active • ${totalOverallSelected} Cultivators Selected`}
            color="primary"
            sx={{ fontWeight: 800, fontSize: '0.82rem' }}
          />
        </Box>

        <Grid container spacing={2}>
          {Object.keys(blockStats).map((bName) => {
            const stat = blockStats[bName];
            const blockItems = blockWiseMap[bName] || [];
            const selectedItems = blockItems.filter((i) => i.isLeadingSelected);

            // Calculate Crop breakdown for selected cultivators in this block
            const cropBreakdown = {};
            selectedItems.forEach((i) => {
              cropBreakdown[i.crop] = (cropBreakdown[i.crop] || 0) + 1;
            });

            // Calculate Avg Yield of selected
            const avgYield =
              selectedItems.length > 0
                ? (selectedItems.reduce((acc, curr) => acc + (curr.currentYearYield || 0), 0) / selectedItems.length).toFixed(1)
                : 0;

            const pct = stat.total > 0 ? Math.round((stat.selected / stat.total) * 100) : 0;

            return (
              <Grid item xs={12} sm={6} md={3} key={bName}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid #cbd5e1',
                    backgroundColor: stat.selected > 0 ? '#f0f9ff' : '#f8fafc',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#0284c7',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.12)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      Block: {bName}
                    </Typography>
                    <Chip
                      label={`${stat.selected} / ${stat.total}`}
                      size="small"
                      color={stat.selected > 0 ? 'primary' : 'default'}
                      sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ height: 6, borderRadius: 3, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                        <Box sx={{ width: `${pct}%`, height: '100%', backgroundColor: '#0284c7' }} />
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                      {pct}%
                    </Typography>
                  </Box>

                  {selectedItems.length > 0 ? (
                    <React.Fragment>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Selected Crop Breakdown:
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        {Object.keys(cropBreakdown).map((crop) => (
                          <Chip
                            key={crop}
                            label={`${crop}: ${cropBreakdown[crop]}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', fontWeight: 700, borderColor: '#0284c7', color: '#0369a1', height: 20 }}
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, display: 'block' }}>
                        Avg Yield: {avgYield} q/ha
                      </Typography>
                    </React.Fragment>
                  ) : (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', display: 'block' }}>
                      No cultivators selected in block yet.
                    </Typography>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* TOP CROP CATEGORY SELECTION CARDS BAR FOR FIELD INSPECTOR */}
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
              Crop Category Filter Bar (Field Inspector)
            </Typography>
            <Chip
              label={selectedCropCategory === 'All' ? 'Showing All Crops' : `Selected Category: ${selectedCropCategory}`}
              size="small"
              sx={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 700, ml: 1 }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
            Click a crop category to quickly filter cultivators Block-wise
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

      {/* FILTER & SEARCH CONTROL TOOLBAR BAR */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Cultivator name, ID, phone, panchayat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter Block"
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
            >
              {availableBlocks.map((b) => (
                <MenuItem key={b} value={b}>
                  {b === 'All' ? 'All Blocks' : `Block ${b}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter Crop"
              value={filterCrop}
              onChange={(e) => setFilterCrop(e.target.value)}
            >
              {availableCrops.map((c) => (
                <MenuItem key={c} value={c}>
                  {c === 'All' ? 'All Crops' : c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2} sx={{ textAlign: 'right' }}>
            {isFiltersActive && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<FilterAltOffIcon />}
                onClick={handleResetFilters}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* BUSINESS RULE ALERT */}
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon sx={{ fontSize: '2rem' }} />}
        sx={{
          mb: 3,
          borderRadius: 3,
          backgroundColor: '#f0f9ff',
          border: '1.5px solid #7dd3fc',
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <AlertTitle sx={{ fontWeight: 800, color: '#0369a1', fontSize: '1rem' }}>
          Field Inspector Selection Rules &amp; Flexible Count Policy
        </AlertTitle>
        <Typography variant="body2" sx={{ color: '#0c4a6e', fontWeight: 600, lineHeight: 1.6 }}>
          1. <strong>Block-wise Selection:</strong> Cultivators are grouped Block-wise (Vyttila, Paravur, Aluva, Tripunithura).
          <br />
          2. <strong>No Fixed Count of 10 Required:</strong> You can select one or more cultivators per Block. Blocks with fewer than 10 cultivators are fully valid and accepted without validation errors.
          <br />
          3. <strong>Forwarding:</strong> After completing selection, click <strong>Forward Selection to Taluk Level Approver</strong>.
        </Typography>
      </Alert>

      {/* TOP HEADER & FORWARD ACTION BAR */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            Field Inspector — Block-wise Cultivator Selection
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Select cultivators from each Block using checkboxes and forward the selected list to the Taluk Level Approver.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SendIcon />}
          onClick={handleOpenConfirmModal}
          sx={{
            py: 1.4,
            px: 3.5,
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: '0.95rem',
            boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
          }}
        >
          Forward Selection to Taluk Level Approver
        </Button>
      </Box>

      {/* BLOCK-WISE ACCORDIONS SECTION */}
      <Box sx={{ mb: 4 }}>
        {Object.keys(blockWiseMap).length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 700, mb: 1 }}>
              No Cultivators Found Matching Selected Filters
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Try adjusting your Block, Crop, or Search query parameters.
            </Typography>
            <Button variant="outlined" size="small" onClick={handleResetFilters} sx={{ fontWeight: 700 }}>
              Reset All Filters
            </Button>
          </Paper>
        ) : (
          Object.keys(blockWiseMap).map((blockName) => {
            const cultivatorsList = blockWiseMap[blockName];
            const stats = blockStats[blockName] || { total: 0, selected: 0, hasLessThan10: false };
            const allSelectedInBlock = stats.selected === stats.total && stats.total > 0;
            const isExpanded = Boolean(expandedBlocks[blockName]);

            return (
              <Accordion
                key={blockName}
                expanded={isExpanded}
                onChange={handleAccordionChange(blockName)}
                elevation={0}
                sx={{
                  mb: 2.5,
                  borderRadius: '12px !important',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  '&:before': { display: 'none' },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#0f172a' }} />}
                  sx={{
                    backgroundColor: '#f8fafc',
                    borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                    py: 1,
                    px: 2.5
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: '#e0f2fe',
                            color: '#0284c7',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <LocationCityIcon />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            Block: {blockName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cultivatorsList.length} Cultivators Available in Block
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6} md={5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`${stats.selected} / ${stats.total} Selected`}
                          color={stats.selected > 0 ? 'primary' : 'default'}
                          sx={{ fontWeight: 800, fontSize: '0.8rem' }}
                        />

                        {stats.hasLessThan10 && (
                          <Chip
                            label={`< 10 Cultivators (${stats.total} total) — Valid`}
                            color="success"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        )}
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                        <Button
                          size="small"
                          variant={allSelectedInBlock ? 'outlined' : 'contained'}
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectAllInBlock(blockName, !allSelectedInBlock);
                          }}
                          startIcon={allSelectedInBlock ? <DeselectIcon fontSize="small" /> : <SelectAllIcon fontSize="small" />}
                          sx={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: 2 }}
                        >
                          {allSelectedInBlock ? 'Deselect Block' : 'Select All in Block'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ backgroundColor: '#0f172a' }}>
                        <TableRow>
                          <TableCell sx={{ color: '#fff', fontWeight: 700, width: 80 }} align="center">
                            Select
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Cultivator Name &amp; ID</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Crop &amp; Variety</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Panchayat &amp; Zone</TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                            Current Yield
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">
                            Yield Change %
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">
                            Selection Status
                          </TableCell>
                          <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">
                            View
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {cultivatorsList.map((row) => {
                          const isChecked = Boolean(row.isLeadingSelected);
                          const prevYield = row.previousYearYield || 0;
                          const curYield = row.currentYearYield || 0;
                          const yieldPct = prevYield > 0 ? (((curYield - prevYield) / prevYield) * 100).toFixed(1) : '0.0';

                          return (
                            <TableRow
                              key={row.id}
                              hover
                              onClick={() => handleToggleCultivator(row.id)}
                              sx={{
                                cursor: 'pointer',
                                backgroundColor: isChecked ? '#f0f9ff' : 'inherit',
                                '&:hover': { backgroundColor: isChecked ? '#e0f2fe' : '#f8fafc' }
                              }}
                            >
                              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handleToggleCultivator(row.id)}
                                  color="primary"
                                />
                              </TableCell>

                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                  {row.cultivatorName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ID: {row.id} • {row.cultivatorPhone || 'No Phone'}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {row.crop}
                                </Typography>
                                {row.variety && (
                                  <Chip label={row.variety} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} />
                                )}
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

                              <TableCell align="center">
                                {isChecked ? (
                                  <Chip
                                    icon={<CheckCircleIcon fontSize="small" />}
                                    label="SELECTED"
                                    size="small"
                                    sx={{ backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 800, fontSize: '0.7rem' }}
                                  />
                                ) : (
                                  <Chip label="Unselected" size="small" variant="outlined" sx={{ fontSize: '0.7rem', color: '#94a3b8' }} />
                                )}
                              </TableCell>

                              <TableCell align="center" onClick={(e) => e.stopPropagation()}>
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
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* CULTIVATOR DETAIL DRAWER */}
      <CultivatorDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRecordForDrawer}
        activeRole={activeRole}
        onToggleLeading={handleToggleCultivator}
      />

      {/* FORWARD CONFIRMATION MODAL */}
      <Dialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            fontWeight: 800
          }}
        >
          Confirm Forwarding Selection to Taluk Level Approver
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="success" icon={<CheckCircleIcon sx={{ fontSize: '2rem' }} />} sx={{ mb: 3, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 800 }}>Validation Passed — Flexible Selection Count Rule</AlertTitle>
            <Typography variant="body2">
              No mandatory count of 10 is enforced. All available cultivators selected in each Block are valid for forwarding.
            </Typography>
          </Alert>

          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
            Selection Summary by Block:
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.keys(blockStats).map((b) => (
              <Grid item xs={12} sm={6} key={b}>
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #cbd5e1', borderRadius: 2.5, backgroundColor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Block: {b}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 700, mt: 0.5 }}>
                    {blockStats[b].selected} out of {blockStats[b].total} cultivators selected
                  </Typography>
                  {blockStats[b].hasLessThan10 && (
                    <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, display: 'block', mt: 0.3 }}>
                      ✓ Less than 10 cultivators available — Validated &amp; Accepted
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Inspector Forwarding Notes (Optional)"
            placeholder="Enter any additional observations or comments regarding cultivator selections..."
            value={forwardNotes}
            onChange={(e) => setForwardNotes(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConfirmModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExecuteForwardSubmit}
            startIcon={<SendIcon />}
            sx={{ fontWeight: 800, px: 3, borderRadius: 2 }}
          >
            Confirm &amp; Forward to Taluk Level Approver
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS CONFIRMATION DIALOG */}
      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4, px: 3 }}>
          <CheckCircleIcon sx={{ fontSize: '4.5rem', color: '#0284c7', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
            Selection Forwarded to Taluk Level Approver!
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Your Block-wise cultivator selections ({totalOverallSelected} total cultivators) have been successfully forwarded to the <strong>Taluk Level Approver</strong>.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setSuccessModalOpen(false)}
            sx={{ fontWeight: 800, px: 4, borderRadius: 2 }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CultivatorSelectionView;
