// BlockClusterReport.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  alpha,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Breadcrumb from 'routes/Breadcrumb';

function BlockClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName, talukName } = useParams();

  // Filter states (restore from location state if available)
  const [seasonTab, setSeasonTab] = useState(location.state?.seasonTab || 'ALL');
  const [filterType, setFilterType] = useState(location.state?.filterType || 'range');
  const [fromMonth, setFromMonth] = useState(location.state?.fromMonth || '');
  const [toMonth, setToMonth] = useState(location.state?.toMonth || '');
  const [singleMonth, setSingleMonth] = useState(location.state?.singleMonth || '');
  const [selectedSeason, setSelectedSeason] = useState(location.state?.selectedSeason || '');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Season mapping
  const seasonMonths = {
    Winter: ['November', 'December', 'January', 'February'],
    Summer: ['March', 'April', 'May', 'June'],
    Autumn: ['July', 'August', 'September', 'October']
  };

  // Mock block data with monthly structure
  const getBlockMonthlyData = (district, taluk) => {
    // Static block totals (simplified for demonstration)
    const blockDataMap = {
      'thiruvananthapuram': {
        'neyyattinkara': [
          { id: 1, block: 'Amaravila', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1 },
          { id: 2, block: 'Athiyannur', total: 4, completed: 1, ongoing: 2, notStarted: 0, underReview: 1 },
          { id: 3, block: 'Chenkal', total: 6, completed: 2, ongoing: 2, notStarted: 1, underReview: 1 }
        ],
        'kattakada': [
          { id: 1, block: 'Kattakada', total: 5, completed: 1, ongoing: 2, notStarted: 1, underReview: 1 },
          { id: 2, block: 'Marayanmuttom', total: 4, completed: 0, ongoing: 2, notStarted: 1, underReview: 1 }
        ],
        'nedumangad': [
          { id: 1, block: 'Nedumangad', total: 8, completed: 2, ongoing: 3, notStarted: 2, underReview: 1 },
          { id: 2, block: 'Aruvikkara', total: 6, completed: 1, ongoing: 2, notStarted: 2, underReview: 1 }
        ]
      },
      'kollam': {
        'karunagappally': [
          { id: 1, block: 'Alappad', total: 4, completed: 0, ongoing: 0, notStarted: 4, underReview: 0 },
          { id: 2, block: 'Chavara', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0 }
        ],
        'kunnathur': [
          { id: 1, block: 'Kunnathur', total: 5, completed: 0, ongoing: 0, notStarted: 5, underReview: 0 }
        ]
      }
      // Add other districts/taluks as needed
    };

    const blocks = blockDataMap[district?.toLowerCase()]?.[taluk?.toLowerCase()] || [];
    // Enhance each block with monthlyData (mock distribution)
    return blocks.map(block => ({
      ...block,
      monthlyData: generateMonthlyDataForBlock(block)
    }));
  };

  // Helper: distribute block totals across months (demo)
  const generateMonthlyDataForBlock = (block) => {
    const monthly = {};
    months.forEach(month => {
      monthly[month] = {
        wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 },
        dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }
      };
    });
    // Simple distribution – replace with real monthly data
    if (block.completed > 0) monthly['January'].dry.completed = block.completed;
    if (block.ongoing > 0) monthly['June'].wet.ongoing = block.ongoing;
    if (block.notStarted > 0) monthly['January'].wet.notStarted = block.notStarted;
    if (block.underReview > 0) monthly['August'].dry.underReview = block.underReview;
    return monthly;
  };

  const allBlockData = useMemo(() => getBlockMonthlyData(districtName, talukName), [districtName, talukName]);

  // Filter blocks based on selected months and season
  const getFilteredBlockData = () => {
    let startIndex, endIndex;
    
    // Selected months based on season
    let allowedMonths = months;
    
    if (selectedSeason) {
      allowedMonths = seasonMonths[selectedSeason];
    }
    
    // Single Month Filter
    if (filterType === 'single' && singleMonth) {
      const monthIndex = months.indexOf(singleMonth);
      startIndex = monthIndex;
      endIndex = monthIndex;
    } else {
      startIndex = fromMonth ? months.indexOf(fromMonth) : 0;
      endIndex = toMonth ? months.indexOf(toMonth) : months.length - 1;
    }

    return allBlockData.map(block => {
      let total = 0, completed = 0, ongoing = 0, notStarted = 0, underReview = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        const month = months[i];
        
        // Skip months not in selected season
        if (!allowedMonths.includes(month)) continue;
        
        const monthData = block.monthlyData[month];
        if (monthData) {
          const data = seasonTab === 'ALL'
            ? {
                completed: monthData.wet.completed + monthData.dry.completed,
                ongoing: monthData.wet.ongoing + monthData.dry.ongoing,
                notStarted: monthData.wet.notStarted + monthData.dry.notStarted,
                underReview: monthData.wet.underReview + monthData.dry.underReview
              }
            : monthData[seasonTab.toLowerCase()];
          completed += data.completed;
          ongoing += data.ongoing;
          notStarted += data.notStarted;
          underReview += data.underReview;
          total += data.completed + data.ongoing + data.notStarted + data.underReview;
        }
      }
      return {
        id: block.id,
        block: block.block,
        total,
        completed,
        ongoing,
        notStarted,
        underReview
      };
    });
  };

  const filteredBlockData = useMemo(() => getFilteredBlockData(), [fromMonth, toMonth, seasonTab, filterType, singleMonth, selectedSeason, allBlockData]);

  // Stats from filtered data
  const stats = useMemo(() => ({
    total: filteredBlockData.reduce((sum, row) => sum + row.total, 0),
    completed: filteredBlockData.reduce((sum, row) => sum + row.completed, 0),
    ongoing: filteredBlockData.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: filteredBlockData.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: filteredBlockData.reduce((sum, row) => sum + row.underReview, 0)
  }), [filteredBlockData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return filteredBlockData;
    return filteredBlockData.filter(row =>
      row.block.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredBlockData, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return searchFilteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };
  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setSeasonTab('ALL');
    setFilterType('range');
    setSelectedSeason('');
    setPage(0);
  };
  const handleGoBack = () => {
    navigate(`/kerala_form_report/taluk_form_report/${districtName}`, {
      state: { fromMonth, toMonth, seasonTab, filterType, singleMonth, selectedSeason }
    });
  };
  const handleViewBlockDetails = (blockName) => {
    // Navigate to ZoneClusterReport for this block
    navigate(`/kerala_form_report/zone_form_report/${districtName}/${talukName}/${blockName.toLowerCase().replace(/\s+/g, '-')}`, {
      state: { fromMonth, toMonth, seasonTab, filterType, singleMonth, selectedSeason }
    });
  };

  const StatCard = ({ label, value, color, bgColor, icon }) => (
    <Card sx={{
      bgcolor: bgColor,
      borderRadius: 3,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4]
      }
    }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ color, fontWeight: 'bold', lineHeight: 1.2 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(color, 0.8), mt: 0.5, fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );

  const formattedDistrict = districtName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedTaluk = talukName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {formattedTaluk} - Block wise Form 1 Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
                {selectedSeason && ` • ${selectedSeason}`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL' || selectedSeason) && (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Grid>

      {/* Filters */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
              <Tabs
                value={seasonTab}
                onChange={(e, newValue) => { setSeasonTab(newValue); setPage(0); }}
                sx={{ minHeight: 40 }}
              >
                <Tab label="ALL" value="ALL" />
                <Tab label="WET" value="WET" icon={<WaterDropIcon />} iconPosition="start" />
                <Tab label="DRY" value="DRY" icon={<WbSunnyIcon />} iconPosition="start" />
              </Tabs>

              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setFilterType(newValue);
                    setFromMonth('');
                    setToMonth('');
                    setSingleMonth('');
                    setPage(0);
                  }
                }}
                size="small"
              >
                <ToggleButton value="range">
                  <ViewWeekIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Month Range
                </ToggleButton>
                <ToggleButton value="single">
                  <ViewModuleIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Single Month
                </ToggleButton>
              </ToggleButtonGroup>

              {filterType === 'range' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    value={singleMonth}
                    label="Select Month"
                    onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {months.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                  </Select>
                </FormControl>
              )}
              
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Season</InputLabel>
                <Select
                  value={selectedSeason}
                  label="Season"
                  onChange={(e) => {
                    setSelectedSeason(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All Seasons</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Autumn">Autumn</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3
          }}
        >
          {/* Floating/Pinned Label */}
          <Chip
            label={`${
              formattedTaluk
                ?.split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ')
            } - Taluk Report Summary`}
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              zIndex: 10,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1,
              boxShadow: 2
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard label="Total Blocks" value={stats.total} color="#1565c0" bgColor={alpha('#1565c0', 0.08)} icon={<AssessmentIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard label="Completed" value={stats.completed} color="#2e7d32" bgColor={alpha('#2e7d32', 0.08)} icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard label="Ongoing" value={stats.ongoing} color="#ed6c02" bgColor={alpha('#ed6c02', 0.08)} icon={<PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard label="Not Started" value={stats.notStarted} color="#757575" bgColor={alpha('#757575', 0.08)} icon={<ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard label="Under Review" value={stats.underReview} color="#b76e00" bgColor={alpha('#b76e00', 0.08)} icon={<RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />} />
            </Grid>
          </Grid>
        </Box>
      </Grid>

      {/* Blocks Table */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: 3
          }}
        >
          {/* Floating/Pinned Label */}
          <Chip
            label="Block Report Summary"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              zIndex: 10,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1,
              boxShadow: 2
            }}
          />
          <MainCard
            title={`Blocks in ${formattedTaluk}`}
            secondary={
              <TextField
                placeholder="Search block..."
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            }
            sx={{ borderRadius: 3 }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#04255e' }}>
                    {['Block', 'Total', 'Completed', 'Ongoing', 'Not Started', 'Under Review', 'Actions'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.block}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                        </TableCell>
                        <TableCell align="center">
                          {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                        </TableCell>
                        <TableCell align="center">
                          {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="primary" variant="outlined" /> : row.ongoing}
                        </TableCell>
                        <TableCell align="center">
                          {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                        </TableCell>
                        <TableCell align="center">
                          {row.underReview > 0 ? <Chip label={row.underReview} size="small" color="warning" variant="outlined" /> : row.underReview}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Zones">
                            <IconButton
                              size="small"
                              onClick={() => handleViewBlockDetails(row.block)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? `No blocks found matching "${searchTerm}"` : `No data available for selected filters`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {searchFilteredData.length > 0 && (
              <TablePagination
                component="div"
                count={searchFilteredData.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>

      {/* Back Button */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: '#04255e',
              borderColor: '#04255e',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                borderColor: '#04255e',
                bgcolor: alpha('#04255e', 0.04)
              }
            }}
          >
            Back to Taluk Report
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default BlockClusterReport;