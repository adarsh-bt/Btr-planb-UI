import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TableSortLabel,
  TablePagination,
  Snackbar,
  Stack,
  CardContent,
  Divider
} from '@mui/material';
import {
  Search,
  CheckCircle,
  PendingActions,
  Clear,
  Visibility,
  FilterList,
  Refresh,
  Person,
  Cancel,
  CalendarToday,
  Info,
  Warning,
  Grass,
  LocationOn,
  AssignmentTurnedIn
} from '@mui/icons-material';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

function CceApprovals() {
  const BASE_URL = mainapi.BASE_URL;
  const role = authservice.getrole()?.trim();

  // Data state
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API query parameters
  const [scopeType, setScopeType] = useState('DIRECTORATE');
  const [agriYear, setAgriYear] = useState(() => authservice.agriyear() || '2026-2027');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Client-side Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedLandType, setSelectedLandType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialogs
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sorting
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('requestedAt');

  // Feedback Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ---------------------------------------------------------------- Data Fetch
  useEffect(() => {
    const fetchCceEditRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentAgriYear = agriYear || authservice.agriyear() || '2026-2027';
        const currentScope = scopeType || 'DIRECTORATE';

        let resultData = null;

        try {
          const response = await api.get('/user-access/zones/fetch-zone-cluster-cce-edit-requests', {
            params: {
              scopeType: currentScope,
              agriYear: currentAgriYear,
              page,
              size: rowsPerPage
            }
          });
          resultData = response.data;
        } catch (apiErr) {
          // Fallback to direct fetch with bearer token if api client interceptor encounters an error
          const token = localStorage.getItem('token');
          const fallbackResponse = await fetch(
            `${BASE_URL}/user-access/zones/fetch-zone-cluster-cce-edit-requests?scopeType=${encodeURIComponent(
              currentScope
            )}&agriYear=${encodeURIComponent(currentAgriYear)}&page=${page}&size=${rowsPerPage}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!fallbackResponse.ok) {
            const errResult = await fallbackResponse.json().catch(() => ({}));
            throw new Error(
              errResult?.message || apiErr?.response?.data?.message || apiErr.message || 'Failed to fetch CCE edit requests'
            );
          }

          resultData = await fallbackResponse.json();
        }

        const items = resultData?.content || [];
        setRequests(items);
        setTotalElements(resultData?.totalElements ?? items.length);
        setTotalPages(resultData?.totalPages ?? Math.ceil(items.length / rowsPerPage));
      } catch (err) {
        setError(err.message || 'Failed to fetch CCE edit requests.');
        setRequests([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCceEditRequests();
  }, [BASE_URL, scopeType, agriYear, page, rowsPerPage, refreshKey]);

  // ---------------------------------------------------------------- Status Helpers
  const getStatusInfo = (row) => {
    const raw = (row?.status || row?.requestStatus || '').toString().trim().toUpperCase();

    if (raw === 'REJECTED' || raw === 'REJECT') {
      return { key: 'rejected', label: 'Rejected', color: 'error', icon: <Cancel fontSize="small" /> };
    }
    if (raw === 'APPROVED' || raw === 'APPROVE') {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle fontSize="small" /> };
    }
    if (raw === 'REQUESTED' || raw === 'PENDING') {
      return { key: 'requested', label: 'Requested', color: 'warning', icon: <PendingActions fontSize="small" /> };
    }
    if (row?.approvedAt || row?.approvedBy) {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle fontSize="small" /> };
    }
    return { key: 'requested', label: 'Requested', color: 'warning', icon: <PendingActions fontSize="small" /> };
  };

  const renderLandTypeBadge = (landType) => {
    if (!landType) return <Typography variant="body2">—</Typography>;
    const isWet = landType.toUpperCase() === 'WET';
    return (
      <Chip
        label={landType}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          bgcolor: isWet ? '#e0f2fe' : '#fef3c7',
          color: isWet ? '#0369a1' : '#b45309',
          border: `1px solid ${isWet ? '#bae6fd' : '#fde68a'}`
        }}
      />
    );
  };

  const displayName = (name, id) => {
    if (name) return name;
    if (id) return `${id.toString().slice(0, 8)}…`;
    return 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // CCE identifiers for action save
  const buildIdentifiers = (row) => ({
    id: row?.id ?? row?.requestId ?? null,
    cceAvailablePlotId: row?.cceAvailablePlotId ?? row?.cceStatusDetailsId ?? null,
    cceStatusDetailsId: row?.cceStatusDetailsId ?? null,
    cropId: row?.cropId ?? null,
    cropNameEn: row?.cropNameEn ?? null,
    zoneId: row?.zoneId ?? row?.zone_id ?? null,
    clusterId: row?.clusterId ?? row?.cluster_id ?? null,
    landType: row?.landType ?? null,
    seasonId: row?.seasonId ?? row?.season_id ?? null
  });

  const missingIdentifiers = (row) => {
    const ids = buildIdentifiers(row);
    const requiredKeys = ['id'];
    return requiredKeys.filter((key) => ids[key] === null || ids[key] === undefined || ids[key] === '');
  };

  // ---------------------------------------------------------------- Filter Options
  const districts = [...new Set(requests.map((r) => r.districtName).filter(Boolean))].sort();

  const taluks = selectedDistrict
    ? [...new Set(requests.filter((r) => r.districtName === selectedDistrict).map((r) => r.talukName).filter(Boolean))].sort()
    : [...new Set(requests.map((r) => r.talukName).filter(Boolean))].sort();

  const zones = selectedTaluk
    ? [...new Set(requests.filter((r) => r.talukName === selectedTaluk).map((r) => r.zoneName).filter(Boolean))].sort()
    : selectedDistrict
      ? [...new Set(requests.filter((r) => r.districtName === selectedDistrict).map((r) => r.zoneName).filter(Boolean))].sort()
      : [...new Set(requests.map((r) => r.zoneName).filter(Boolean))].sort();

  const crops = [...new Set(requests.map((r) => r.cropNameEn).filter(Boolean))].sort();



  // ---------------------------------------------------------------- Sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => handleRequestSort(property);

  const descendingComparator = (a, b, key) => {
    const av = a?.[key];
    const bv = b?.[key];

    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;

    if (typeof av === 'string' && typeof bv === 'string') {
      return bv.localeCompare(av);
    }
    if (bv < av) return -1;
    if (bv > av) return 1;
    return 0;
  };

  const getComparator = (dir, key) =>
    dir === 'desc' ? (a, b) => descendingComparator(a, b, key) : (a, b) => -descendingComparator(a, b, key);

  // ---------------------------------------------------------------- Filtering
  const filteredRequests = requests.filter((row) => {
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      row.zoneName?.toLowerCase().includes(q) ||
      row.talukName?.toLowerCase().includes(q) ||
      row.districtName?.toLowerCase().includes(q) ||
      row.clusterNo?.toString().includes(q) ||
      row.clusterId?.toString().includes(q) ||
      row.cropNameEn?.toLowerCase().includes(q) ||
      row.cropId?.toString().includes(q) ||
      row.landType?.toLowerCase().includes(q) ||
      row.requestedByName?.toLowerCase().includes(q) ||
      row.requestedRemark?.toLowerCase().includes(q) ||
      row.status?.toLowerCase().includes(q);

    const matchesDistrict = !selectedDistrict || row.districtName === selectedDistrict;
    const matchesTaluk = !selectedTaluk || row.talukName === selectedTaluk;
    const matchesZone = !selectedZone || row.zoneName === selectedZone;
    const matchesCrop = selectedCrop === 'all' || row.cropNameEn === selectedCrop;
    const matchesLandType = selectedLandType === 'all' || row.landType === selectedLandType;
    const matchesStatus =
      statusFilter === 'all' ||
      getStatusInfo(row).key === statusFilter ||
      (statusFilter === 'requested' && getStatusInfo(row).key === 'pending');

    return (
      matchesSearch &&
      matchesDistrict &&
      matchesTaluk &&
      matchesZone &&
      matchesCrop &&
      matchesLandType &&
      matchesStatus
    );
  });

  const sortedData = [...filteredRequests].sort(getComparator(order, orderBy));

  // ---------------------------------------------------------------- Handlers
  const handleViewDetails = (row) => {
    setSelectedRequest(row);
    setViewDialog(true);
  };

  const handleOpenAction = (row) => {
    setSelectedRequest(row);
    setActionType('APPROVED');
    setRemarks('');
    setActionDialog(true);
  };

  const handleDecisionChange = (event) => {
    setActionType(event.target.value);
    setRemarks('');
  };

  const closeActionDialog = () => {
    setActionDialog(false);
    setSelectedRequest(null);
    setActionType('APPROVED');
    setRemarks('');
  };

  const handleSubmitAction = async () => {
    if (!selectedRequest) return;

    const isApprove = actionType === 'APPROVED';

    if (!isApprove && !remarks.trim()) {
      setSnackbar({ open: true, message: 'A rejection reason is required.', severity: 'warning' });
      return;
    }

    const missing = missingIdentifiers(selectedRequest);
    if (missing.length) {
      setSnackbar({
        open: true,
        message: `Cannot save — request is missing required field: ${missing.join(', ')}`,
        severity: 'error'
      });
      return;
    }

    const status = actionType;

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');
      const approverId = authservice.userid();
      const approverName = localStorage.getItem('user') || 'Authorized User';
      const ids = buildIdentifiers(selectedRequest);

      const requestBody = {
        id: ids.id,
        cceAvailablePlotId: ids.cceAvailablePlotId,
        cceStatusDetailsId: ids.cceStatusDetailsId,
        cropId: ids.cropId,
        zoneId: ids.zoneId,
        clusterId: ids.clusterId,
        landType: ids.landType,
        seasonId: ids.seasonId,
        status,
        approvedBy: approverId,
        approvedRemark: remarks.trim() || null
      };

      let result = null;

      try {
        const response = await api.post('/earas-form1-entry/cce-crop-details/cce-edit-log-save', requestBody);
        result = response.data;
      } catch (postErr) {
        // Fallback to fetch
        const fallbackPost = await fetch(`${BASE_URL}/earas-form1-entry/cce-crop-details/cce-edit-log-save`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        const fallbackResult = await fallbackPost.json().catch(() => ({}));
        if (!fallbackPost.ok) {
          throw new Error(
            fallbackResult?.message ||
            postErr?.response?.data?.message ||
            postErr.message ||
            `Failed to ${isApprove ? 'approve' : 'reject'} CCE edit request`
          );
        }
        result = fallbackResult;
      }

      const payload = result?.payload || {};
      const savedAt = new Date().toISOString();
      const updatedStatus = payload.status || status;

      setRequests((prev) =>
        prev.map((row) =>
          (row.id ?? row.requestId) === ids.id
            ? {
              ...row,
              status: updatedStatus,
              requestStatus: updatedStatus,
              cceStatusDetailsId: payload.cceStatusDetailsId ?? row.cceStatusDetailsId,
              approvedRemark: payload.approvedRemark ?? requestBody.approvedRemark,
              approvedBy: payload.approvedBy ?? approverId,
              approvedByName: payload.approvedByName ?? approverName,
              approvedAt: payload.approvedAt ?? savedAt
            }
            : row
        )
      );

      closeActionDialog();

      setSnackbar({
        open: true,
        message: result?.message || `CCE edit request ${isApprove ? 'approved' : 'rejected'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || `Failed to ${isApprove ? 'approve' : 'reject'} CCE edit request`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('');
    setSelectedTaluk('');
    setSelectedZone('');
    setSelectedCrop('all');
    setSelectedLandType('all');
    setStatusFilter('all');
  };

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setSelectedTaluk('');
    setSelectedZone('');
  };

  const handleTalukChange = (event) => {
    setSelectedTaluk(event.target.value);
    setSelectedZone('');
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setSnackbar({ open: true, message: 'Refreshing CCE edit requests…', severity: 'info' });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ---------------------------------------------------------------- Table Columns
  const columns = [
    { key: 'slNo', label: 'Sl No', sortable: false },
    { key: 'clusterNo', label: 'Cluster', sortable: true },
    { key: 'cropNameEn', label: 'Crop', sortable: true },
    { key: 'landType', label: 'Land Type', sortable: true },
    { key: 'zoneName', label: 'Zone', sortable: true },
    { key: 'talukName', label: 'Taluk', sortable: true },
    { key: 'districtName', label: 'District', sortable: true },
    { key: 'requestedAt', label: 'Requested By & On', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Actions', sortable: false }
  ];

  // Request summary inside the Review Dialog
  const RequestSummary = ({ row }) => (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#f8fafc' }}>
      <Box sx={{ p: 1.5, px: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
        <Typography variant="subtitle2" fontWeight={700} color="#05307a">
          Request Information
        </Typography>
      </Box>
      <Grid container spacing={1.5} sx={{ p: 2 }}>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Cluster
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {row.clusterNo != null ? `Cluster #${row.clusterNo}` : '—'}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Crop
          </Typography>
          <Typography variant="body2" fontWeight={700} color="#05307a">
            {row.cropNameEn || '—'}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Land Type
          </Typography>
          <Box sx={{ mt: 0.3 }}>{renderLandTypeBadge(row.landType)}</Box>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Zone
          </Typography>
          <Typography variant="body2">{row.zoneName || '—'}</Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Taluk & District
          </Typography>
          <Typography variant="body2">
            {row.talukName || '—'}, {row.districtName || '—'}
          </Typography>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Typography variant="caption" color="text.secondary" display="block">
            Requested By
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {displayName(row.requestedByName, row.requestedBy)}
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ borderTop: '1px solid #e2e8f0', pt: 1.5, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Requester Remark
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: row.requestedRemark ? 'normal' : 'italic', color: '#334155' }}>
            {row.requestedRemark || 'No remark provided by requester'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );

  // ---------------------------------------------------------------- Loading State
  if (loading && requests.length === 0) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
                flexDirection: 'column',
                gap: 2
              }}
            >
              <CircularProgress size={56} thickness={4} sx={{ color: '#05307a' }} />
              <Typography variant="h6" color="text.secondary">
                Loading CCE Edit Requests...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fetching records for Scope: {scopeType} • Agri Year: {agriYear}
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* Main Container */}
      <Grid item xs={12}>
        {/* Page Title & Scope Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#05307a' }}>
              CCE Edit Request Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review, verify, and approve/reject Crop Cutting Experiment (CCE) cluster edit requests
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Chip
              label={`Scope: ${scopeType}`}
              color="primary"
              variant="outlined"
              size="medium"
              sx={{ fontWeight: 600, borderColor: '#05307a', color: '#05307a' }}
            />
            <Chip
              label={`Agri Year: ${agriYear}`}
              size="medium"
              sx={{ fontWeight: 600, bgcolor: '#e2e8f0', color: '#1e293b' }}
            />
          </Box>
        </Box>

        {/* Main Content Card */}
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Filters Section */}
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: '#f8fafc',
              borderRadius: 2.5,
              border: '1px solid #e2e8f0'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Search Bar */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search cluster, crop, zone, district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                  sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                />
              </Grid>

              {/* District Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>District</InputLabel>
                  <Select value={selectedDistrict} label="District" onChange={handleDistrictChange}>
                    <MenuItem value="">All Districts</MenuItem>
                    {districts.map((district) => (
                      <MenuItem key={district} value={district}>
                        {district}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Taluk Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Taluk</InputLabel>
                  <Select value={selectedTaluk} label="Taluk" onChange={handleTalukChange}>
                    <MenuItem value="">All Taluks</MenuItem>
                    {taluks.map((taluk) => (
                      <MenuItem key={taluk} value={taluk}>
                        {taluk}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Zone Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Zone</InputLabel>
                  <Select value={selectedZone} label="Zone" onChange={(e) => setSelectedZone(e.target.value)}>
                    <MenuItem value="">All Zones</MenuItem>
                    {zones.map((zone) => (
                      <MenuItem key={zone} value={zone}>
                        {zone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Crop Filter */}
              <Grid item xs={12} sm={6} md={1.5}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Crop</InputLabel>
                  <Select value={selectedCrop} label="Crop" onChange={(e) => setSelectedCrop(e.target.value)}>
                    <MenuItem value="all">All Crops</MenuItem>
                    {crops.map((crop) => (
                      <MenuItem key={crop} value={crop}>
                        {crop}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Land Type Filter */}
              <Grid item xs={12} sm={6} md={1.5}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Land Type</InputLabel>
                  <Select
                    value={selectedLandType}
                    label="Land Type"
                    onChange={(e) => setSelectedLandType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="WET">WET</MenuItem>
                    <MenuItem value="DRY">DRY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="requested">Requested</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Scope Type Selector */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" sx={{ bgcolor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel>Scope Type</InputLabel>
                  <Select
                    value={scopeType}
                    label="Scope Type"
                    onChange={(e) => {
                      setScopeType(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="DIRECTORATE">DIRECTORATE</MenuItem>
                    <MenuItem value="DISTRICT">DISTRICT</MenuItem>
                    <MenuItem value="TALUK">TALUK</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Agri Year Selector */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Agri Year"
                  value={agriYear}
                  onChange={(e) => {
                    setAgriYear(e.target.value);
                    setPage(0);
                  }}
                  placeholder="e.g. 2026-2027"
                  sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', ml: 'auto' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={handleClearFilters}
                  size="medium"
                  sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#cbd5e1', color: '#475569' }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  size="medium"
                  sx={{ textTransform: 'none', fontWeight: 600, bgcolor: '#05307a', '&:hover': { bgcolor: '#04245e' } }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Filter Summary Bar */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing <strong>{filteredRequests.length}</strong> of <strong>{totalElements}</strong> CCE edit requests • Agricultural Year: <strong>{agriYear}</strong> • Scope: <strong>{scopeType}</strong>
              </Typography>
              {filteredRequests.length < requests.length && (
                <Chip
                  label={`${requests.length - filteredRequests.length} filtered out on this page`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#cbd5e1', color: '#475569' }}
                />
              )}
            </Box>
          </Box>

          {/* Table or Empty State */}
          {filteredRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Grass sx={{ fontSize: 56, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="h6" gutterBottom fontWeight={600} color="#334155">
                No CCE edit requests found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {searchQuery ||
                  selectedDistrict ||
                  selectedTaluk ||
                  selectedZone ||
                  selectedCrop !== 'all' ||
                  selectedLandType !== 'all' ||
                  statusFilter !== 'all'
                  ? 'No records match your active search and filter criteria. Try resetting filters.'
                  : `No CCE edit requests have been logged for Scope: ${scopeType} and Agri Year: ${agriYear}.`}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<Clear />}
                sx={{ bgcolor: '#05307a', '&:hover': { bgcolor: '#04245e' } }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#05307a' }}>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={{
                            color: 'white',
                            fontWeight: 700,
                            py: 1.8,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            '&:last-child': { borderRight: 'none' }
                          }}
                          align={column.key === 'action' ? 'center' : 'left'}
                        >
                          {column.sortable ? (
                            <TableSortLabel
                              active={orderBy === column.key}
                              direction={orderBy === column.key ? order : 'asc'}
                              onClick={createSortHandler(column.key)}
                              sx={{
                                color: 'white !important',
                                '& .MuiTableSortLabel-icon': { color: 'white !important' }
                              }}
                            >
                              {column.label}
                            </TableSortLabel>
                          ) : (
                            column.label
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedData.map((row, index) => {
                      const statusInfo = getStatusInfo(row);
                      const isPending = statusInfo.key === 'requested' || statusInfo.key === 'pending';
                      const rowKey = row.id || row.cceStatusDetailsId || `${row.zoneId}-${row.clusterId}-${index}`;

                      return (
                        <TableRow
                          key={rowKey}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { bgcolor: '#f8fafc' },
                            '&:hover': { bgcolor: '#f1f5f9' },
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          {/* Sl No */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#64748b">
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>

                          {/* Cluster */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} color="#0f172a">
                              {row.clusterNo != null ? `Cluster #${row.clusterNo}` : '—'}
                            </Typography>
                          </TableCell>

                          {/* Crop Details */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <Grass sx={{ fontSize: 18, color: '#16a34a' }} />
                              <Typography variant="body2" fontWeight={700} color="#05307a">
                                {row.cropNameEn || '—'}
                              </Typography>
                            </Box>
                            {row.seasonName && (
                              <Box sx={{ mt: 0.3 }}>
                                <Chip
                                  label={row.seasonName}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.68rem',
                                    bgcolor: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0'
                                  }}
                                />
                              </Box>
                            )}
                          </TableCell>

                          {/* Land Type */}
                          <TableCell>{renderLandTypeBadge(row.landType)}</TableCell>

                          {/* Zone */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#1e293b">
                              {row.zoneName || '—'}
                            </Typography>
                          </TableCell>

                          {/* Taluk */}
                          <TableCell>
                            <Chip
                              label={row.talukName || '—'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500, borderColor: '#cbd5e1', bgcolor: '#ffffff' }}
                            />
                          </TableCell>

                          {/* District */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={500} color="#1e293b">
                              {row.districtName || '—'}
                            </Typography>
                          </TableCell>

                          {/* Requested Details */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} color="#1e293b">
                              {displayName(row.requestedByName, row.requestedBy)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(row.requestedAt)} • {formatTime(row.requestedAt)}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant={isPending ? 'outlined' : 'filled'}
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="View Request Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(row)}
                                  sx={{ color: '#05307a', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={isPending ? 'Review & Approve / Reject' : 'Already actioned'}>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!isPending}
                                    onClick={() => handleOpenAction(row)}
                                    sx={{
                                      color: isPending ? '#16a34a' : '#94a3b8',
                                      bgcolor: isPending ? '#dcfce7' : '#f1f5f9',
                                      '&:hover': { bgcolor: isPending ? '#bbf7d0' : '#f1f5f9' }
                                    }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Server-side Pagination */}
              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 15, 20, 25, 30]}
                sx={{
                  mt: 1.5,
                  '.MuiTablePagination-toolbar': {
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }
                }}
              />
            </>
          )}
        </Card>
      </Grid>

      {/* ------------------------------------------------------------- View Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#05307a',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              CCE Edit Request Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={
                  selectedRequest?.clusterNo != null
                    ? `Cluster #${selectedRequest.clusterNo}`
                    : '—'
                }
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', height: 22, fontSize: '0.72rem' }}
              />
              {selectedRequest?.cropNameEn && (
                <Chip
                  icon={<Grass sx={{ '&&': { color: '#86efac' } }} fontSize="small" />}
                  label={`Crop: ${selectedRequest.cropNameEn}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.22)',
                    color: 'white',
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                />
              )}
              {selectedRequest?.landType && (
                <Chip
                  label={`${selectedRequest.landType} LAND`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.22)',
                    color: 'white',
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                />
              )}
              {selectedRequest && (
                <Chip
                  label={getStatusInfo(selectedRequest).label}
                  size="small"
                  color={getStatusInfo(selectedRequest).color}
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setViewDialog(false)} sx={{ color: 'white' }} size="small">
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {selectedRequest && (
            <Stack spacing={2.5}>
              {/* Card 1: Crop & CCE Plot Details */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ p: 1.8, px: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#05307a">
                    Crop & Experiment Details
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ p: 2.5 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Crop Name
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#05307a">
                      {selectedRequest.cropNameEn || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Land Type
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>{renderLandTypeBadge(selectedRequest.landType)}</Box>
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Season
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.seasonName || '—'}
                    </Typography>
                    {selectedRequest.seasonId && (
                      <Typography variant="caption" color="text.secondary">
                        Season ID: {selectedRequest.seasonId}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      CCE Status Details ID
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.8, borderRadius: 1, wordBreak: 'break-all' }}
                    >
                      {selectedRequest.cceStatusDetailsId || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Request ID (UUID)
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.8, borderRadius: 1, wordBreak: 'break-all' }}
                    >
                      {selectedRequest.id || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Card 2: Location Details */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ p: 1.8, px: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#05307a">
                    Location & Cluster Jurisdiction
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ p: 2.5 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      District
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.districtName || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Taluk
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.talukName || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Zone
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.zoneName || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cluster
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {selectedRequest.clusterNo != null
                        ? `Cluster #${selectedRequest.clusterNo}`
                        : '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Card 3: Requester Details */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ p: 1.8, px: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#05307a">
                    Requester Information
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested By
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Person fontSize="small" sx={{ color: '#05307a' }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {displayName(selectedRequest.requestedByName, selectedRequest.requestedBy)}
                          </Typography>
                          {selectedRequest.requestedBy && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              User ID: {selectedRequest.requestedBy}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested Timestamp
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <CalendarToday fontSize="small" sx={{ color: '#05307a' }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(selectedRequest.requestedAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(selectedRequest.requestedAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Requester's Reason / Remark
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: selectedRequest.requestedRemark ? '#fffbeb' : '#f8fafc',
                      borderColor: selectedRequest.requestedRemark ? '#fde68a' : '#e2e8f0',
                      borderRadius: 1.5,
                      mt: 0.5
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                      {selectedRequest.requestedRemark || 'No remark provided by requester'}
                    </Typography>
                  </Paper>
                </Box>
              </Card>

              {/* Card 4: Approver Status Details */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ p: 1.8, px: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f1f5f9' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#05307a">
                    Approver Action & Decision Status
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  {getStatusInfo(selectedRequest).key === 'requested' ||
                    getStatusInfo(selectedRequest).key === 'pending' ? (
                    <Alert severity="warning" icon={<PendingActions fontSize="small" />} sx={{ borderRadius: 1.5 }}>
                      This CCE edit request is waiting for review and decision from the approver authority.
                    </Alert>
                  ) : (
                    <>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Actioned By
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Person fontSize="small" sx={{ color: '#16a34a' }} />
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {displayName(selectedRequest.approvedByName, selectedRequest.approvedBy)}
                              </Typography>
                              {selectedRequest.approvedBy && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                  Approver ID: {selectedRequest.approvedBy}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Decision Date & Time
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            {getStatusInfo(selectedRequest).key === 'rejected' ? (
                              <Cancel fontSize="small" color="error" />
                            ) : (
                              <CheckCircle fontSize="small" color="success" />
                            )}
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {formatDate(selectedRequest.approvedAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(selectedRequest.approvedAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      <Typography variant="caption" color="text.secondary" display="block">
                        Approver's Official Remark
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: selectedRequest.approvedRemark ? '#f0fdf4' : '#f8fafc',
                          borderColor: selectedRequest.approvedRemark ? '#bbf7d0' : '#e2e8f0',
                          borderRadius: 1.5,
                          mt: 0.5
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>
                          {selectedRequest.approvedRemark || 'No official remark recorded'}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setViewDialog(false)}
            variant="outlined"
            startIcon={<Clear />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- Review Action Dialog */}
      <Dialog
        open={actionDialog}
        onClose={() => !submitting && closeActionDialog()}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 540, width: '100%', overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#05307a',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Review CCE Edit Request
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              {selectedRequest?.cropNameEn ? `Crop: ${selectedRequest.cropNameEn} • ` : ''}
              {selectedRequest?.clusterNo != null
                ? `Cluster #${selectedRequest.clusterNo}`
                : '—'}{' '}
              • {selectedRequest?.zoneName || '—'}
            </Typography>
          </Box>
          <IconButton onClick={closeActionDialog} sx={{ color: 'white' }} size="small" disabled={submitting}>
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {actionType === 'APPROVED' ? (
            <Alert severity="info" icon={<Info fontSize="small" />} sx={{ mb: 2.5, borderRadius: 2 }}>
              Accepting reopens the CCE entry for <strong>{selectedRequest?.cropNameEn || 'this crop'}</strong> in{' '}
              <strong>{selectedRequest?.zoneName || 'this zone'}</strong> so the investigator can re-enter or edit experimental
              data.
            </Alert>
          ) : (
            <Alert severity="warning" icon={<Warning fontSize="small" />} sx={{ mb: 2.5, borderRadius: 2 }}>
              Rejecting keeps the CCE entry locked. You must provide a clear reason so the field investigator understands why
              the edit request was denied.
            </Alert>
          )}

          {selectedRequest && (
            <>
              <RequestSummary row={selectedRequest} />

              {/* Decision Selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                <InputLabel id="cce-decision-label">Official Decision</InputLabel>
                <Select
                  labelId="cce-decision-label"
                  value={actionType}
                  label="Official Decision"
                  onChange={handleDecisionChange}
                  disabled={submitting}
                  sx={{
                    fontWeight: 600,
                    color: actionType === 'APPROVED' ? '#15803d' : '#b91c1c',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: actionType === 'APPROVED' ? '#16a34a' : '#dc2626'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: actionType === 'APPROVED' ? '#15803d' : '#991b1b'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: actionType === 'APPROVED' ? '#16a34a' : '#dc2626'
                    }
                  }}
                >
                  <MenuItem value="APPROVED" sx={{ color: '#15803d', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" sx={{ color: '#16a34a' }} />
                      Accept Request (Approve CCE Edit)
                    </Box>
                  </MenuItem>
                  <MenuItem value="REJECTED" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cancel fontSize="small" sx={{ color: '#dc2626' }} />
                      Reject Request (Deny CCE Edit)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Remarks Field */}
              {actionType === 'APPROVED' ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                    Approver Remark (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any administrative note or instructions for the investigator..."
                    variant="outlined"
                    size="small"
                    disabled={submitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                    Rejection Reason * (Mandatory)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Explain why this CCE edit request is being rejected..."
                    variant="outlined"
                    size="small"
                    required
                    disabled={submitting}
                    error={!remarks.trim()}
                    helperText={!remarks.trim() ? 'A clear reason is required before rejecting' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, px: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={closeActionDialog}
            variant="outlined"
            startIcon={<Clear />}
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'APPROVED' ? 'success' : 'error'}
            onClick={handleSubmitAction}
            disabled={submitting || (actionType === 'REJECTED' && !remarks.trim())}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : actionType === 'APPROVED' ? (
                <CheckCircle />
              ) : (
                <Cancel />
              )
            }
            sx={{ minWidth: 160, textTransform: 'none', fontWeight: 700 }}
          >
            {submitting ? 'Saving Decision…' : actionType === 'APPROVED' ? 'Accept Request' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- Feedback Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default CceApprovals;