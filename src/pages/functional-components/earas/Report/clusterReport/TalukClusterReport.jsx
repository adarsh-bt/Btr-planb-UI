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
import { useNavigate, useParams } from 'react-router-dom';
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

function TalukClusterReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { districtName } = useParams();

  // Filter states
  const [seasonTab, setSeasonTab] = useState('ALL');
  const [filterType, setFilterType] = useState('range'); // 'range' or 'single'
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Mock data: each taluk has monthly wet/dry counts
  const getTalukMonthlyData = (district) => {
    const baseData = {
      'thiruvananthapuram': [
        { taluk: 'Neyyattinkara', monthlyData: {} },
        { taluk: 'Kattakada', monthlyData: {} },
        { taluk: 'Nedumangad', monthlyData: {} },
        { taluk: 'Chirayinkeezhu', monthlyData: {} },
        { taluk: 'Thiruvananthapuram', monthlyData: {} }
      ],
      'kollam': [
        { taluk: 'Karunagappally', monthlyData: {} },
        { taluk: 'Kunnathur', monthlyData: {} },
        { taluk: 'Kottarakkara', monthlyData: {} },
        { taluk: 'Punalur', monthlyData: {} },
        { taluk: 'Pathanapuram', monthlyData: {} }
      ],
      // ... add other districts similarly or keep as empty placeholder
    };
    // For brevity, generate monthly data dynamically or keep existing totals
    // Here we'll convert the static totals into monthly distribution for demo
    const districtTalks = baseData[district?.toLowerCase()] || [];
    return districtTalks.map(t => ({
      ...t,
      monthlyData: generateMonthlyDataForTaluk(t.taluk)
    }));
  };

  // Helper to generate monthly counts (mock)
  const generateMonthlyDataForTaluk = (talukName) => {
    const monthly = {};
    months.forEach(month => {
      monthly[month] = {
        wet: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 },
        dry: { completed: 0, ongoing: 0, notStarted: 0, underReview: 0 }
      };
    });
    // Assign some dummy values for existing data
    if (talukName === 'Neyyattinkara') {
      monthly['January'].dry.completed = 1;
      monthly['June'].wet.ongoing = 1;
      monthly['September'].wet.completed = 1;
    } else if (talukName === 'Karunagappally') {
      monthly['January'].wet.notStarted = 2;
      monthly['January'].dry.notStarted = 2;
      monthly['February'].dry.notStarted = 2;
    }
    // ... add more as needed
    return monthly;
  };

  const allTalukData = useMemo(() => getTalukMonthlyData(districtName), [districtName]);

  // Filter taluks based on selected months and season
  const getFilteredTalukData = () => {
    let startIndex, endIndex;
    if (filterType === 'single' && singleMonth) {
      const monthIndex = months.indexOf(singleMonth);
      startIndex = monthIndex;
      endIndex = monthIndex;
    } else {
      startIndex = fromMonth ? months.indexOf(fromMonth) : 0;
      endIndex = toMonth ? months.indexOf(toMonth) : months.length - 1;
    }

    return allTalukData.map(taluk => {
      let total = 0, completed = 0, ongoing = 0, notStarted = 0, underReview = 0;
      for (let i = startIndex; i <= endIndex; i++) {
        const month = months[i];
        const monthData = taluk.monthlyData[month];
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
        id: taluk.taluk,
        taluk: taluk.taluk,
        total,
        completed,
        ongoing,
        notStarted,
        underReview
      };
    });
  };

  const filteredTalukData = useMemo(() => getFilteredTalukData(), [fromMonth, toMonth, seasonTab, filterType, singleMonth, allTalukData]);

  // Stats from filtered data
  const stats = useMemo(() => ({
    total: filteredTalukData.reduce((sum, row) => sum + row.total, 0),
    completed: filteredTalukData.reduce((sum, row) => sum + row.completed, 0),
    ongoing: filteredTalukData.reduce((sum, row) => sum + row.ongoing, 0),
    notStarted: filteredTalukData.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: filteredTalukData.reduce((sum, row) => sum + row.underReview, 0)
  }), [filteredTalukData]);

  const searchFilteredData = useMemo(() => {
    if (!searchTerm.trim()) return filteredTalukData;
    return filteredTalukData.filter(row =>
      row.taluk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredTalukData, searchTerm]);

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
    setPage(0);
  };
  const handleGoBack = () => navigate('/Report');
  const handleViewTalukDetails = (talukName) => {
    const formattedTalukName = talukName.toLowerCase().replace(/\s+/g, '-');
    const formattedDistrictName = districtName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/kerala_report/block_cluster_report/${formattedDistrictName}/${formattedTalukName}`, {
      state: { fromMonth, toMonth, seasonTab, filterType, singleMonth }
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

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Header with district name */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {districtName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Taluk wise Cluster Progress Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filterType === 'single' && singleMonth && ` • ${singleMonth}`}
                {filterType === 'range' && fromMonth && toMonth && ` • ${fromMonth} - ${toMonth}`}
                {filterType === 'range' && fromMonth && !toMonth && ` • From ${fromMonth}`}
                {filterType === 'range' && !fromMonth && toMonth && ` • Until ${toMonth}`}
                {seasonTab !== 'ALL' && ` • ${seasonTab} Season`}
              </Typography>
            </Box>
          </Stack>
          {(fromMonth || toMonth || singleMonth || seasonTab !== 'ALL') && (
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

      {/* Filter Section */}
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
    {/* Floating Label */}
    <Chip
     label={`${
  districtName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
} - District Report Summary`}
      size="small"
      sx={{
        position: 'absolute',
        top: -12,
        left: 20,
        zIndex: 10,
        fontWeight: 600,
        bgcolor: '#04255e',
        color: '#fff',
        px: 1
      }}
    />

    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          label="Total Clusters"
          value={stats.total}
          color="#1565c0"
          bgColor={alpha('#1565c0', 0.08)}
          icon={<AssessmentIcon sx={{ fontSize: 32, color: '#1565c0', opacity: 0.7 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          label="Completed"
          value={stats.completed}
          color="#2e7d32"
          bgColor={alpha('#2e7d32', 0.08)}
          icon={<CheckCircleIcon sx={{ fontSize: 32, color: '#2e7d32', opacity: 0.7 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          label="Ongoing"
          value={stats.ongoing}
          color="#ed6c02"
          bgColor={alpha('#ed6c02', 0.08)}
          icon={<PendingIcon sx={{ fontSize: 32, color: '#ed6c02', opacity: 0.7 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          label="Not Started"
          value={stats.notStarted}
          color="#757575"
          bgColor={alpha('#757575', 0.08)}
          icon={<ScheduleIcon sx={{ fontSize: 32, color: '#757575', opacity: 0.7 }} />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={2.4}>
        <StatCard
          label="Under Review"
          value={stats.underReview}
          color="#b76e00"
          bgColor={alpha('#b76e00', 0.08)}
          icon={<RateReviewIcon sx={{ fontSize: 32, color: '#b76e00', opacity: 0.7 }} />}
        />
      </Grid>
    </Grid>
  </Box>
</Grid>

      {/* Taluk Table */}
      <Grid item xs={12}>
  <Box
    sx={{
      position: 'relative',
      borderRadius: 3
    }}
  >
    {/* Floating/Pinned Label */}
    <Chip
      label="Taluk Report Summary"
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
      title={`Taluks in ${districtName
        ?.split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')}`}
      secondary={
        <TextField
          placeholder="Search taluk..."
          size="small"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ width: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                >
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
              {[
                'Taluk',
                'Total',
                'Completed',
                'Ongoing',
                'Not Started',
                'Under Review',
                'Actions'
              ].map((label, idx) => (
                <TableCell
                  key={idx}
                  align={idx === 0 ? 'left' : 'center'}
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5
                  }}
                >
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
                  sx={{
                    '&:hover': {
                      bgcolor: alpha('#04255e', 0.04)
                    },
                    transition: '0.2s'
                  }}
                >
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <LocationOnIcon
                        sx={{
                          fontSize: 18,
                          color: '#04255e',
                          opacity: 0.7
                        }}
                      />

                      <Typography fontWeight={500}>
                        {row.taluk}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={row.total}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 600,
                        bgcolor: alpha('#04255e', 0.1)
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    {row.completed > 0 ? (
                      <Chip
                        label={row.completed}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      row.completed
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {row.ongoing > 0 ? (
                      <Chip
                        label={row.ongoing}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      row.ongoing
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {row.notStarted > 0 ? (
                      <Chip
                        label={row.notStarted}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      row.notStarted
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {row.underReview > 0 ? (
                      <Chip
                        label={row.underReview}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      row.underReview
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="View Zone Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewTalukDetails(row.taluk)}
                        sx={{
                          color: '#04255e',
                          '&:hover': {
                            bgcolor: alpha('#04255e', 0.1)
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography color="text.secondary">
                    {searchTerm
                      ? `No taluks found matching "${searchTerm}"`
                      : 'No data available for selected filters'}
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
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`
          }}
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
            Back to Kerala Report
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}

export default TalukClusterReport;