import React, { useState, useMemo, useEffect } from 'react';
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
  IconButton,
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  alpha,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CancelIcon from '@mui/icons-material/Cancel';
import HubIcon from '@mui/icons-material/Hub';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Breadcrumb from 'routes/Breadcrumb';

function ZoneCceReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName: urlDistrictName, talukName: urlTalukName } = useParams();

  // Extract state from previous page
  const passedState = location.state || {};
  const districtName = passedState.districtName || urlDistrictName || 'Unknown District';
  const talukName = passedState.talukName || urlTalukName || 'Unknown Taluk';
  const selectedCrop = passedState.selectedCrop || 'ALL';
  const agriculturalYear = passedState.agriculturalYear || '2024-25';
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Mock data for CCE Progress (Aggregated at Zone level)
  const mockApiData = useMemo(() => {
    const zoneCount = (talukName.length % 5) + 4; // 4 to 8 zones
    const zones = Array.from({ length: zoneCount }, (_, i) => `${talukName} Zone ${i + 1}`);
    
    return zones.map((zone, index) => {
      // Mock some variation
      const multiplier = selectedCrop === 'ALL' ? 3 : 1;
      const baseVal = (zoneCount - index + 1) * 5 * multiplier;
      
      return {
        id: index + 1,
        zone,
        total: baseVal,
        completed: Math.floor(baseVal * 0.4),
        ongoing: Math.floor(baseVal * 0.2),
        notAvailable: Math.floor(baseVal * 0.1),
        notStarted: Math.floor(baseVal * 0.2),
        underReview: Math.floor(baseVal * 0.1)
      };
    });
  }, [talukName, selectedCrop, agriculturalYear]);

  // Fetch data effect (Mocked)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [talukName, selectedCrop, agriculturalYear]);

  // Stats calculation
  const stats = useMemo(() => ({
    total: mockApiData.reduce((sum, row) => sum + row.total, 0),
    completed: mockApiData.reduce((sum, row) => sum + row.completed, 0),
    ongoing: mockApiData.reduce((sum, row) => sum + row.ongoing, 0),
    notAvailable: mockApiData.reduce((sum, row) => sum + row.notAvailable, 0),
    notStarted: mockApiData.reduce((sum, row) => sum + row.notStarted, 0),
    underReview: mockApiData.reduce((sum, row) => sum + row.underReview, 0)
  }), [mockApiData]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return mockApiData;
    return mockApiData.filter(row => 
      row.zone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mockApiData, searchTerm]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleClearSearch = () => {
    setPage(0);
    setSearchTerm('');
  };

  const getPercentage = (count) => {
    if (stats.total === 0) return '0.0';
    return ((count / stats.total) * 100).toFixed(1);
  };

  const cards = [
    {
      title: 'Alloted CCE',
      count: stats.total,
      icon: HubIcon,
      color: theme.palette.primary.main,
    },
    {
      title: 'Completed',
      count: stats.completed,
      icon: CheckCircleIcon,
      color: theme.palette.success.main,
      percentage: getPercentage(stats.completed),
    },
    {
      title: 'Ongoing',
      count: stats.ongoing,
      icon: PendingIcon,
      color: theme.palette.warning.main,
      percentage: getPercentage(stats.ongoing),
    },
    {
      title: 'Not Available',
      count: stats.notAvailable,
      icon: CancelIcon,
      color: theme.palette.error.main,
      percentage: getPercentage(stats.notAvailable),
    },
    {
      title: 'Not Started',
      count: stats.notStarted,
      icon: BlockIcon,
      color: theme.palette.grey[600],
      percentage: getPercentage(stats.notStarted),
    },
    {
      title: 'Under Review',
      count: stats.underReview,
      icon: RateReviewIcon,
      color: theme.palette.info.main,
      percentage: getPercentage(stats.underReview),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      {/* Header */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <ArrowBackIcon color="primary" />
            </IconButton>
            <AssessmentIcon sx={{ fontSize: 40, color: '#1a237e' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Zone-wise CCE Progress: {talukName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`District: ${districtName} • Agricultural Year: ${agriculturalYear} • Crop: ${selectedCrop}`}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Grid>

      {/* Form 5 Style Stats Cards */}
      <Grid item xs={12}>
        <Box
          sx={{
            position: 'relative',
            border: `1px solid ${alpha('#04255e', 0.15)}`,
            borderRadius: 3,
            p: 2,
            pt: 3,
            bgcolor: '#fff'
          }}
        >
          <Chip
            label={`${talukName} Summary`}
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: -12,
              left: 20,
              fontWeight: 600,
              bgcolor: '#04255e',
              color: '#fff',
              px: 1
            }}
          />

          <Grid container spacing={2}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={2} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: `linear-gradient(135deg, ${alpha(card.color, 0.05)} 0%, ${alpha(card.color, 0.02)} 100%)`,
                    borderBottom: `2px solid ${card.color}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                      background: `linear-gradient(135deg, ${alpha(card.color, 0.08)} 0%, ${alpha(card.color, 0.03)} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        background: alpha(card.color, 0.1),
                        display: 'inline-flex',
                      }}
                    >
                      <card.icon sx={{ fontSize: 24, color: card.color }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: card.color, lineHeight: 1.2, fontSize: '1.75rem' }}>
                    {card.count}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Grid>

      {/* Main Table */}
      <Grid item xs={12}>
        <Box sx={{ position: 'relative', borderRadius: 3 }}>
          <Chip
            label="Zone Progress Details"
            color="primary"
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

          <MainCard
            title="Zone-wise CCE Progress"
            secondary={
              <TextField
                placeholder="Search zone..."
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
                    {['Zone', 'Total', 'Completed', 'Ongoing', 'Not Available', 'Not Started', 'Under Review'].map((label, idx) => (
                      <TableCell key={idx} align={idx === 0 ? 'left' : 'center'} sx={{ color: 'white', fontWeight: 600, py: 1.5 }}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row) => (
                      <TableRow 
                        key={row.id}
                        hover
                        sx={{ '&:hover': { bgcolor: alpha('#04255e', 0.04) }, transition: '0.2s' }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 18, color: '#04255e', opacity: 0.7 }} />
                            <Typography fontWeight={500}>{row.zone}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.total} size="small" variant="filled" sx={{ fontWeight: 600, bgcolor: alpha('#04255e', 0.1) }} />
                        </TableCell>
                        <TableCell align="center">
                          {row.completed > 0 ? <Chip label={row.completed} size="small" color="success" variant="outlined" /> : row.completed}
                        </TableCell>
                        <TableCell align="center">
                          {row.ongoing > 0 ? <Chip label={row.ongoing} size="small" color="warning" variant="outlined" /> : row.ongoing}
                        </TableCell>
                        <TableCell align="center">
                          {row.notAvailable > 0 ? <Chip label={row.notAvailable} size="small" color="error" variant="outlined" /> : row.notAvailable}
                        </TableCell>
                        <TableCell align="center">
                          {row.notStarted > 0 ? <Chip label={row.notStarted} size="small" variant="outlined" /> : row.notStarted}
                        </TableCell>
                        <TableCell align="center">
                          {row.underReview > 0 ? <Chip label={row.underReview} size="small" color="info" variant="outlined" /> : row.underReview}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No zones found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {filteredData.length > 0 && !loading && (
              <TablePagination
                component="div"
                count={filteredData.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
              />
            )}
          </MainCard>
        </Box>
      </Grid>
    </Grid>
  );
}

export default ZoneCceReport;
