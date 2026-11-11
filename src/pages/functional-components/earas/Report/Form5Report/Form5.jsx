import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Hub,
  CheckCircle,
  Pending,
  Block,
  RateReview,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Cancel,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';

const SESSION_KEY = 'form5ReportState';

function getSavedState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

const Form5 = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const themeColor = "#05307a";

  const stateData = useMemo(() => {
    const saved = getSavedState();
    return { ...saved, ...(location.state || {}) };
  }, [location.state]);

  const zoneId = stateData.zoneId || AuthService.getzone() || 751;
  const zoneName = stateData.zoneName || '';
  const talukName = stateData.talukName || '';
  const districtName = stateData.districtName || '';

  // State for API data
  const [apiData, setApiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for stats
  const [stats, setStats] = useState({
    totalCCECrops: 0,
    ongoing: 0,
    completed: 0,
    notStarted: 0,
    underReview: 0,
    notAvailable: 0,
    missing: 0,
    selectedCce: 0
  });

  // Table data state
  const [tableData, setTableData] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(
    stateData.cropName || stateData.crop || 'ALL'
  );
  const [selectedStatus, setSelectedStatus] = useState(
    stateData.selectedStatus || stateData.status || 'ALL'
  );
  const [lbMap, setLbMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [agriculturalYear, setAgriculturalYear] = useState(
    stateData.agriculturalYear || AuthService.agriyear() || '2025-2026'
  );
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('crop');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Persist session state
  useEffect(() => {
    if (zoneId || agriculturalYear) {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...stateData,
          zoneId,
          zoneName,
          talukId: stateData.talukId,
          talukName,
          districtId: stateData.districtId,
          districtName,
          agriculturalYear,
          cropName: selectedCrop !== 'ALL' ? selectedCrop : stateData.cropName,
          selectedStatus: selectedStatus !== 'ALL' ? selectedStatus : stateData.selectedStatus,
          filterType: stateData.filterType,
          singleMonth: stateData.singleMonth,
          fromMonth: stateData.fromMonth,
          toMonth: stateData.toMonth
        })
      );
    }
  }, [zoneId, zoneName, talukName, districtName, agriculturalYear, stateData, selectedCrop, selectedStatus]);

  // Fetch local bodies for the zone to map lbcode -> lbName
  const fetchLocalBodies = async (targetZoneId) => {
    if (!targetZoneId) return {};
    try {
      const token = localStorage.getItem('token');
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json'
      };

      let data = null;

      // Try 1: mainapi.BTR_API endpoint
      try {
        const res = await fetch(`${mainapi.BTR_API}/btr-service/btr-api/zone-lb/${targetZoneId}`, { headers });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e1) {
        console.warn('Attempt 1 to fetch zone-lb failed:', e1);
      }

      // Try 2: fallback to localhost:8082 if BTR_API isn't 8082
      if (!data || (!data.payload && !data.data && !Array.isArray(data))) {
        try {
          const res = await fetch(`http://localhost:8082/btr-service/btr-api/zone-lb/${targetZoneId}`, { headers });
          if (res.ok) {
            data = await res.json();
          }
        } catch (e2) {
          // ignore
        }
      }

      const list = data?.payload || data?.data || (Array.isArray(data) ? data : []);
      const mapping = {};
      if (Array.isArray(list)) {
        list.forEach((lb) => {
          const code = (lb.lbCode || lb.lbcode || '').toString().trim();
          const name = (lb.lbName || lb.localBodyName || lb.name || '').trim();
          if (code && name) {
            mapping[code] = name;
          }
        });
      }
      return mapping;
    } catch (err) {
      console.error('Error fetching local bodies:', err);
      return {};
    }
  };

  // Fetch data from API using selected zoneId and agriculturalYear
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const baseUrl = mainapi.FORM_API;

        // Fetch CCE summary and local bodies in parallel
        const [cceResponse, localBodiesMap] = await Promise.all([
          fetch(`${baseUrl}/earas-form1-entry/cce-crop-details/cce-summary/${zoneId}/${agriculturalYear}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetchLocalBodies(zoneId)
        ]);

        const resolvedLbMap = localBodiesMap || {};
        setLbMap(resolvedLbMap);

        if (!cceResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await cceResponse.json();

        // Update stats
        setStats({
          totalCCECrops: data.totalCCECrops || data.allowedCCECrops || 0,
          ongoing: data.ongoing || 0,
          completed: data.completed || 0,
          notStarted: data.notStarted || 0,
          underReview: data.underReview || 0,
          notAvailable: data.notAvailable || 0,
          missing: data.missing || 0,
          selectedCce: data.selectedCce || 0
        });

        // Safely extract crop details array
        const rawCropDetails = Array.isArray(data.cropSubDetails)
          ? data.cropSubDetails
          : Array.isArray(data)
            ? data
            : [];

        // Deduplicate any duplicate entries with identical availableCcePlotId
        const seenPlotIds = new Set();
        const uniqueCropSubDetails = [];
        rawCropDetails.forEach((item) => {
          const plotKey = item.availableCcePlotId || item.cceAvailablePlotId;
          if (plotKey) {
            if (seenPlotIds.has(plotKey)) return;
            seenPlotIds.add(plotKey);
          }
          uniqueCropSubDetails.push(item);
        });

        // Map cropSubDetails to table data with guaranteed unique id and matched local body name
        const mappedData = uniqueCropSubDetails.map((item, index) => {
          const uniqueId = item.availableCcePlotId ||
            item.cceAvailablePlotId ||
            `${item.cropId || 'crop'}_${item.clusterId || item.clusterNo || 'cluster'}_${index}`;

          const lbCode = (item.lbcode || item.lbCode || item.localBodyCode || '').toString().trim();
          const resolvedPanchayath = (lbCode && resolvedLbMap[lbCode])
            ? resolvedLbMap[lbCode]
            : (item.localBodyName && item.localBodyName !== 'null' ? item.localBodyName : 'N/A');

          return {
            id: uniqueId,
            crop: item.cropName || 'N/A',
            season: item.season && item.season !== 'null' ? item.season : 'N/A',
            status: item.status || 'NOT STARTED',
            clusterNo: item.clusterNo || 'N/A',
            landType: item.landType || 'N/A',
            surveyNo: 'N/A', // Not available in API response
            cultivatedArea: item.cultivatedArea !== null ? item.cultivatedArea : 'N/A',
            farmerName: item.farmerName || 'N/A',
            lbcode: lbCode,
            panchayath: resolvedPanchayath,
            zoneId: item.zoneId || zoneId,
            clusterId: item.clusterId,
            noOfCce: item.noOfCce,
            availableCcePlotId: item.availableCcePlotId || item.cceAvailablePlotId || item.plotId || null,
            cceAvailablePlotId: item.cceAvailablePlotId || item.availableCcePlotId || item.plotId || null,
            cropId: item.cropId
          };
        });

        setTableData(mappedData);
        setApiData(data);

      } catch (err) {
        console.error('Error fetching CCE data:', err);
        setError('Failed to load CCE details. Please try again.');
        setTableData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [zoneId, agriculturalYear]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return theme.palette.success.main;
      case 'ONGOING': return theme.palette.warning.main;
      case 'NOT STARTED': return theme.palette.grey[600];
      case 'UNDER REVIEW': return theme.palette.info.main;
      case 'NOT AVAILABLE': return theme.palette.error.main;
      case 'MISSING': return '#c2185b';
      default: return theme.palette.primary.main;
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case 'COMPLETED': return alpha(theme.palette.success.main, 0.1);
      case 'ONGOING': return alpha(theme.palette.warning.main, 0.1);
      case 'NOT STARTED': return alpha(theme.palette.grey[600], 0.1);
      case 'UNDER REVIEW': return alpha(theme.palette.info.main, 0.1);
      case 'NOT AVAILABLE': return alpha(theme.palette.error.main, 0.1);
      case 'MISSING': return alpha('#c2185b', 0.1);
      default: return alpha(theme.palette.primary.main, 0.1);
    }
  };

  const getSeasonChipStyle = (season) => {
    const s = (season || '').toLowerCase();
    if (s.includes('autumn') || s.includes('kharif')) {
      return {
        bgcolor: alpha('#e65100', 0.1),
        color: '#e65100',
        border: `1px solid ${alpha('#e65100', 0.3)}`
      };
    }
    if (s.includes('winter') || s.includes('rabi')) {
      return {
        bgcolor: alpha('#1565c0', 0.1),
        color: '#1565c0',
        border: `1px solid ${alpha('#1565c0', 0.3)}`
      };
    }
    if (s.includes('summer') || s.includes('zaid')) {
      return {
        bgcolor: alpha('#f57f17', 0.12),
        color: '#e65100',
        border: `1px solid ${alpha('#f57f17', 0.35)}`
      };
    }
    return {
      bgcolor: alpha('#2e7d32', 0.1),
      color: '#2e7d32',
      border: `1px solid ${alpha('#2e7d32', 0.3)}`
    };
  };

  const getLandTypeColor = (landType) => {
    if (!landType) return '#ed6c02';
    return landType === 'Wet' ? theme.palette.info.main : '#ed6c02';
  };

  // Handle view navigation
  const handleViewClick = (row) => {
    // Prepare the data to pass to CceDataView
    const viewData = {
      crop: row.crop,
      season: row.season,
      clusterNo: row.clusterNo,
      cultivatedArea: row.cultivatedArea !== 'N/A' && row.cultivatedArea !== null ? row.cultivatedArea : 'N/A',
      landType: row.landType !== 'N/A' ? row.landType : 'Not Specified',
      surveyNo: row.surveyNo,
      farmerName: row.farmerName,
      status: row.status,
      panchayath: row.panchayath !== 'N/A' ? row.panchayath : (row.lbcode && lbMap[row.lbcode] ? lbMap[row.lbcode] : 'N/A'),
      lbcode: row.lbcode,
      zoneId: row.zoneId,
      clusterId: row.clusterId,
      cropId: row.cropId,
      noOfCce: row.noOfCce,
      availableCcePlotId: row.availableCcePlotId || row.cceAvailablePlotId,
      cceAvailablePlotId: row.cceAvailablePlotId || row.availableCcePlotId,
      // Additional fields for the detail view
      survey: row.surveyNo,
      irrigationType: 'N/A',
      address: 'N/A',
      contactNo: 'N/A',
      remarks: 'N/A',
      frameType: 'area', // Default to area, can be changed based on crop type
      plotLengthX: 10,
      plotLengthY: 10,
      numberOfTrees: 50,
      randomTreeNumber: 12
    };

    navigate('/schemes/earas/cce/cceDataView', {
      state: {
        rowData: viewData,
        from: 'form5',
        zoneId,
        zoneName,
        talukId: stateData.talukId,
        talukName,
        districtId: stateData.districtId,
        districtName,
        agriculturalYear
      }
    });
  };

  // Available crop options for the dropdown
  const cropOptions = useMemo(() => {
    const map = new Map();
    tableData.forEach((item) => {
      if (item.crop && item.crop !== 'N/A' && !map.has(item.crop)) {
        map.set(item.crop, {
          cropId: item.cropId,
          cropName: item.crop
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.cropName.localeCompare(b.cropName));
  }, [tableData]);

  // Calculate stats based on selected crop
  const displayStats = useMemo(() => {
    if (!selectedCrop || selectedCrop === 'ALL') {
      return stats;
    }
    const cropRows = tableData.filter(
      row => row.crop.trim().toLowerCase() === selectedCrop.trim().toLowerCase()
    );
    const totalCCECrops = cropRows.reduce((sum, r) => sum + (Number(r.noOfCce) || 1), 0);
    const ongoing = cropRows.filter(r => r.status.toUpperCase() === 'ONGOING').length;
    const completed = cropRows.filter(r => r.status.toUpperCase() === 'COMPLETED').length;
    const notStarted = cropRows.filter(r => r.status.toUpperCase() === 'NOT STARTED').length;
    const underReview = cropRows.filter(r => r.status.toUpperCase() === 'UNDER REVIEW').length;
    const notAvailable = cropRows.filter(r => r.status.toUpperCase() === 'NOT AVAILABLE').length;
    const missing = cropRows.filter(r => r.status.toUpperCase() === 'MISSING').length;
    const selectedCce = cropRows.filter(r => r.status.toUpperCase() !== 'NOT STARTED').length;

    return {
      totalCCECrops,
      ongoing,
      completed,
      notStarted,
      underReview,
      notAvailable,
      missing,
      selectedCce
    };
  }, [stats, selectedCrop, tableData]);

  // Cards configuration with actual/filtered data and status filter keys
  const cards = [
    {
      title: 'ALLOWTED CCE',
      statusKey: 'ALL',
      count: displayStats.totalCCECrops,
      icon: Hub,
      color: theme.palette.success.dark,
    },
    {
      title: 'Selected CCE',
      statusKey: 'SELECTED',
      count: displayStats.selectedCce,
      icon: AssessmentIcon,
      color: theme.palette.primary.main,
    },
    {
      title: 'Completed',
      statusKey: 'COMPLETED',
      count: displayStats.completed,
      icon: CheckCircle,
      color: theme.palette.success.main,
    },
    {
      title: 'Ongoing',
      statusKey: 'ONGOING',
      count: displayStats.ongoing,
      icon: Pending,
      color: theme.palette.warning.main,
    },
    {
      title: 'Not Available',
      statusKey: 'NOT AVAILABLE',
      count: displayStats.notAvailable,
      icon: Cancel,
      color: theme.palette.error.main,
    },
    {
      title: 'Not Started',
      statusKey: 'NOT STARTED',
      count: displayStats.notStarted,
      icon: Block,
      color: theme.palette.grey[600],
    },
    {
      title: 'Under Review',
      statusKey: 'UNDER REVIEW',
      count: displayStats.underReview,
      icon: RateReview,
      color: theme.palette.info.main,
    },
    {
      title: 'Missing',
      statusKey: 'MISSING',
      count: displayStats.missing !== undefined ? displayStats.missing : (stats.missing || 0),
      icon: HelpOutlineIcon,
      color: '#c2185b',
    }
  ];

  const handleCardClick = (statusKey) => {
    if (statusKey === 'ALL') {
      setSelectedStatus('ALL');
    } else if (selectedStatus === statusKey) {
      setSelectedStatus('ALL');
    } else {
      setSelectedStatus(statusKey);
    }
    setPage(0);
  };

  // Filtering logic with search, crop filter, and status filter
  const filteredData = tableData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      row.crop.toLowerCase().includes(searchLower) ||
      row.season.toLowerCase().includes(searchLower) ||
      row.status.toLowerCase().includes(searchLower) ||
      row.clusterNo.toString().includes(searchLower) ||
      row.landType.toLowerCase().includes(searchLower) ||
      row.cultivatedArea.toString().includes(searchLower) ||
      row.farmerName.toLowerCase().includes(searchLower) ||
      row.panchayath.toLowerCase().includes(searchLower) ||
      (row.lbcode && row.lbcode.toLowerCase().includes(searchLower));

    const matchesCrop =
      !selectedCrop ||
      selectedCrop === 'ALL' ||
      row.crop.trim().toLowerCase() === selectedCrop.trim().toLowerCase();

    const matchesStatus = () => {
      if (!selectedStatus || selectedStatus === 'ALL') return true;
      const rowStatus = (row.status || '').toUpperCase();
      if (selectedStatus === 'SELECTED') {
        return rowStatus !== 'NOT STARTED';
      }
      return rowStatus === selectedStatus.toUpperCase();
    };

    return matchesSearch && matchesCrop && matchesStatus();
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];
    if (orderBy === 'clusterNo' || orderBy === 'noOfCce') {
      valA = Number(valA);
      valB = Number(valB);
    }
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    if (status === 'SELECTED') return 'Selected CCE';
    if (status === 'ALL') return 'All';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <Grid sx={{ width: '100%' }}>
      {/* Breadcrumb at the very top */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumb />
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: 'visible',
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {zoneName ? `${zoneName} – CCE Progress Status Overview` : 'CCE Progress Status Overview'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
              {talukName && `${talukName} Taluk • `}
              {districtName && `${districtName} District • `}
              {`Agricultural Year: ${agriculturalYear}`}
              {selectedCrop && selectedCrop !== 'ALL' && ` • Crop: ${selectedCrop}`}
              {selectedStatus && selectedStatus !== 'ALL' && ` • Status: ${formatStatus(selectedStatus)}`}
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {cards.map((card, index) => {
              const isSelected = selectedStatus === card.statusKey;
              return (
                <Grid item xs={12} sm={2} md={3} key={index}>
                  <Paper
                    elevation={isSelected ? 6 : 2}
                    onClick={() => handleCardClick(card.statusKey)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      background: isSelected
                        ? `linear-gradient(135deg, ${alpha(card.color, 0.16)} 0%, ${alpha(card.color, 0.06)} 100%)`
                        : `linear-gradient(135deg, ${alpha(card.color, 0.05)} 0%, ${alpha(card.color, 0.02)} 100%)`,
                      border: isSelected ? `2px solid ${card.color}` : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderBottom: `3px solid ${card.color}`,
                      transform: isSelected ? 'translateY(-4px)' : 'none',
                      boxShadow: isSelected ? `0 8px 24px ${alpha(card.color, 0.28)}` : theme.shadows[2],
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                        background: `linear-gradient(135deg, ${alpha(card.color, 0.12)} 0%, ${alpha(card.color, 0.04)} 100%)`,
                      },
                    }}
                  >
                    {isSelected && card.statusKey !== 'ALL' && (
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          height: 20,
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          bgcolor: card.color,
                          color: '#fff',
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          background: alpha(card.color, 0.1),
                          display: 'inline-flex',
                        }}
                      >
                        <card.icon
                          sx={{
                            fontSize: 24,
                            color: card.color,
                          }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        mb: 0.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem',
                      }}
                    >
                      {card.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: card.color,
                        lineHeight: 1.2,
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '1.75rem' },
                        mb: 0,
                      }}
                    >
                      {isLoading ? '...' : card.count}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Table Section */}
          <Paper sx={{
            p: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            {/* Header with Search and Crop Filter */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: themeColor,
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  flexWrap: 'wrap'
                }}
              >
                <AssessmentIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
                CCE Crops Details
                {!isLoading && (
                  <Chip
                    label={`${filteredData.length} ${filteredData.length === 1 ? 'record' : 'records'}${selectedCrop !== 'ALL' ? ` (${selectedCrop})` : ''}`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
                {!isLoading && selectedStatus !== 'ALL' && (
                  <Chip
                    label={`Status: ${formatStatus(selectedStatus)}`}
                    size="small"
                    onDelete={() => {
                      setSelectedStatus('ALL');
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: alpha(getStatusColor(selectedStatus), 0.12),
                      color: getStatusColor(selectedStatus),
                      fontWeight: 700,
                      border: `1px solid ${alpha(getStatusColor(selectedStatus), 0.3)}`
                    }}
                  />
                )}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {cropOptions.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="crop-filter-label">Crop Name</InputLabel>
                    <Select
                      labelId="crop-filter-label"
                      value={selectedCrop}
                      label="Crop Name"
                      onChange={(e) => {
                        setSelectedCrop(e.target.value);
                        setPage(0);
                      }}
                    >
                      <MenuItem value="ALL">All Crops</MenuItem>
                      {cropOptions.map((crop) => (
                        <MenuItem key={crop.cropId || crop.cropName} value={crop.cropName}>
                          {crop.cropName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="SELECTED">Selected CCE</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="ONGOING">Ongoing</MenuItem>
                    <MenuItem value="NOT AVAILABLE">Not Available</MenuItem>
                    <MenuItem value="NOT STARTED">Not Started</MenuItem>
                    <MenuItem value="UNDER REVIEW">Under Review</MenuItem>
                    <MenuItem value="MISSING">Missing</MenuItem>
                  </Select>
                </FormControl>

                {(selectedCrop !== 'ALL' || selectedStatus !== 'ALL') && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSelectedCrop('ALL');
                      setSelectedStatus('ALL');
                      setPage(0);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Clear Filters
                  </Button>
                )}

                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search crop, season, farmer, panchayat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    minWidth: { xs: '100%', sm: 260 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.15)}`
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                    ),
                  }}
                />
              </Box>
            </Box>

            {/* Table */}
            <TableContainer sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Table>
                <TableHead>
                  <TableRow sx={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, ${theme.palette.primary.dark} 100%)`,
                  }}>
                    {[
                      { id: 'crop', label: 'Crop' },
                      { id: 'status', label: 'Status' },
                      { id: 'clusterNo', label: 'Cluster Number' },
                      { id: 'landType', label: 'Land Type' },
                      { id: 'cultivatedArea', label: 'Cultivated Area' },
                      { id: 'farmerName', label: 'Farmer Name' },
                      { id: 'panchayath', label: 'Panchayat' },
                      { id: 'actions', label: 'Actions' }
                    ].map((col) => (
                      <TableCell key={col.id} sx={{ color: 'white', whiteSpace: 'nowrap', fontWeight: 600, py: 2 }}>
                        {col.id !== 'actions' ? (
                          <TableSortLabel
                            active={orderBy === col.id}
                            direction={orderBy === col.id ? order : 'asc'}
                            onClick={() => handleSort(col.id)}
                            sx={{
                              color: 'white !important',
                              '& .MuiTableSortLabel-icon': {
                                color: 'white !important',
                              }
                            }}
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : (
                          col.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <CircularProgress size={40} />
                          <Typography variant="body1" color="textSecondary" fontWeight={500}>
                            Loading crop details...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography variant="body1" color="error" fontWeight={500}>
                          {error}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                          <AssessmentIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3) }} />
                          <Typography variant="body1" color="textSecondary" fontWeight={500}>
                            No crop details found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04) + ' !important',
                          },
                          transition: 'background-color 0.2s',
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {row.crop}
                              </Typography>
                              {row.season &&
                                row.season !== 'N/A' &&
                                row.season !== 'NA' &&
                                row.season !== 'null' &&
                                row.season.trim() !== '' && (
                                  <Chip
                                    label={row.season}
                                    size="small"
                                    sx={{
                                      fontSize: '0.68rem',
                                      height: 20,
                                      fontWeight: 600,
                                      ...getSeasonChipStyle(row.season)
                                    }}
                                  />
                                )}
                            </Box>
                            {row.noOfCce > 1 && (
                              <Chip
                                label={`${row.noOfCce} CCEs`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 18, width: 'fit-content' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatStatus(row.status)}
                            size="small"
                            sx={{
                              backgroundColor: getStatusBackgroundColor(row.status),
                              color: getStatusColor(row.status),
                              fontWeight: 700,
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(getStatusColor(row.status), 0.2)}`
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`#${row.clusterNo}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              color: themeColor,
                              fontWeight: 600,
                              borderRadius: 1.5,
                              border: `1px solid ${alpha(themeColor, 0.3)}`,
                              minWidth: 40
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.landType !== 'N/A' ? row.landType : 'Not Specified'}
                            size="small"
                            sx={{
                              backgroundColor: row.landType !== 'N/A'
                                ? alpha(getLandTypeColor(row.landType), 0.1)
                                : alpha(theme.palette.grey[500], 0.1),
                              color: row.landType !== 'N/A'
                                ? getLandTypeColor(row.landType)
                                : theme.palette.grey[600],
                              fontWeight: 600,
                              borderRadius: 1.5
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="text.secondary">
                            {row.cultivatedArea !== 'N/A' ? `${row.cultivatedArea} cent` : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {row.farmerName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {row.panchayath !== 'N/A'
                              ? row.panchayath
                              : (row.lbcode && lbMap[row.lbcode] ? lbMap[row.lbcode] : 'N/A')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View CCE Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewClick(row)}
                              sx={{
                                color: themeColor,
                                '&:hover': {
                                  backgroundColor: alpha(themeColor, 0.1),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {filteredData.length > 0 && !isLoading && (
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
                rowsPerPageOptions={[15, 25, 50, 100]}
              />
            )}
          </Paper>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default Form5;