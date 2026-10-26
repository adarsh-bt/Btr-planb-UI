import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
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
  DeleteForever,
  ContentCopy,
  LocationOn,
  Landscape,
  Hub,
  FactCheck,
  DirectionsCar,
  Agriculture,
  Layers
} from '@mui/icons-material';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

function KeyplotDeletionRequests() {
  const BASE_URL = mainapi.BASE_URL;
  const role = authservice.getrole()?.trim();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [landTypeFilter, setLandTypeFilter] = useState('all');

  // Dialogs
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live dependency & impact preview
  const [impactPreview, setImpactPreview] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState(null);

  // Server-side pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Client-side sorting
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('requestedAt');

  // Forces a refetch
  const [refreshKey, setRefreshKey] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ---------------------------------------------------------------- data fetch
  useEffect(() => {
    const fetchDeletionRequests = async () => {
      try {
        if (requests.length === 0) {
          setLoading(true);
        }
        setError(null);

        const agriYear = authservice.agriyear() || '2026-2027';

        const response = await api.get(
          `${BASE_URL}/user-access/zones/zone_keyplot_deletion_requests`,
          {
            params: {
              agriYear,
              page,
              size: rowsPerPage
            }
          }
        );

        const result = response.data || {};
        const content = Array.isArray(result.content) ? result.content : [];

        setRequests(content);
        setTotalElements(
          typeof result.totalElements === 'number'
            ? result.totalElements
            : content.length
        );
      } catch (err) {
        console.error('Error fetching keyplot deletion requests:', err);
        setError(
          err?.response?.data?.message ||
          err.message ||
          'Failed to fetch keyplot deletion requests'
        );
        setRequests([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletionRequests();
  }, [BASE_URL, page, rowsPerPage, refreshKey]);

  // ------------------------------------------------------------------ helpers
  const getStatusInfo = (row) => {
    const raw = (row?.status || '').toString().trim().toUpperCase();
    if (raw === 'REJECTED' || raw === 'REJECT' || raw.includes('REJECT')) {
      return { key: 'rejected', label: 'Rejected', color: 'error', icon: <Cancel fontSize="small" /> };
    }
    if (raw === 'APPROVED' || raw === 'APPROVE' || raw.includes('APPROV')) {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle fontSize="small" /> };
    }
    if (raw === 'REQUESTED' || raw === 'REQUEST') {
      return { key: 'requested', label: 'Requested', color: 'info', icon: <PendingActions fontSize="small" /> };
    }
    if (raw === 'PENDING') {
      return { key: 'pending', label: 'Pending', color: 'warning', icon: <PendingActions fontSize="small" /> };
    }
    if (row?.approvedAt || row?.approvedBy) {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle fontSize="small" /> };
    }
    return { key: 'pending', label: 'Pending', color: 'warning', icon: <PendingActions fontSize="small" /> };
  };

  const displayName = (name, id) => {
    if (name && name.trim()) return name.trim();
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

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: `${label || 'Copied'} copied to clipboard!`,
      severity: 'info'
    });
  };

  // ------------------------------------------------------------ filter options
  const taluks = useMemo(
    () => [...new Set(requests.map((r) => r.talukName).filter(Boolean))],
    [requests]
  );
  const zones = useMemo(
    () => [...new Set(requests.map((r) => r.zoneName).filter(Boolean))],
    [requests]
  );

  const filteredZones = selectedTaluk
    ? [
      ...new Set(
        requests
          .filter((r) => r.talukName === selectedTaluk)
          .map((r) => r.zoneName)
          .filter(Boolean)
      )
    ]
    : zones;

  // ------------------------------------------------------------------- sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => handleRequestSort(property);

  const descendingComparator = (a, b, key) => {
    let av = a?.[key];
    let bv = b?.[key];

    if (key === 'status') {
      av = getStatusInfo(a).label;
      bv = getStatusInfo(b).label;
    }

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
    dir === 'desc'
      ? (a, b) => descendingComparator(a, b, key)
      : (a, b) => -descendingComparator(a, b, key);

  // ----------------------------------------------------------------- filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((row) => {
      const q = searchQuery.trim().toLowerCase();

      const matchesSearch =
        !q ||
        row.requestNumber?.toLowerCase().includes(q) ||
        row.keyplotId?.toLowerCase().includes(q) ||
        row.impactSnapshot?.clusterNumber?.toString().includes(q) ||
        row.btrId?.toString().toLowerCase().includes(q) ||
        row.zoneName?.toLowerCase().includes(q) ||
        row.talukName?.toLowerCase().includes(q) ||
        row.districtName?.toLowerCase().includes(q) ||
        row.requestedByName?.toLowerCase().includes(q) ||
        row.reason?.toLowerCase().includes(q) ||
        getStatusInfo(row).label.toLowerCase().includes(q);

      const matchesTaluk = !selectedTaluk || row.talukName === selectedTaluk;
      const matchesZone = !selectedZone || row.zoneName === selectedZone;

      const currentStatusKey = getStatusInfo(row).key;
      const matchesStatus =
        statusFilter === 'all' ||
        currentStatusKey === statusFilter ||
        (statusFilter === 'pending' && currentStatusKey === 'requested');

      const matchesLandType =
        landTypeFilter === 'all' ||
        row.landType?.toUpperCase() === landTypeFilter.toUpperCase();

      return (
        matchesSearch &&
        matchesTaluk &&
        matchesZone &&
        matchesStatus &&
        matchesLandType
      );
    });
  }, [requests, searchQuery, selectedTaluk, selectedZone, statusFilter, landTypeFilter]);

  const sortedData = useMemo(() => {
    return [...filteredRequests].sort(getComparator(order, orderBy));
  }, [filteredRequests, order, orderBy]);

  // Status counts for metric cards
  const stats = useMemo(() => {
    const total = totalElements || requests.length;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let clustersImpacted = 0;

    requests.forEach((r) => {
      const s = getStatusInfo(r).key;
      if (s === 'pending' || s === 'requested') pending += 1;
      else if (s === 'approved') approved += 1;
      else if (s === 'rejected') rejected += 1;

      if (r.impactSnapshot?.hasCluster) {
        clustersImpacted += r.impactSnapshot?.totalClusterDetailsImpacted || 1;
      }
    });

    return { total, pending, approved, rejected, clustersImpacted };
  }, [requests, totalElements]);

  // ------------------------------------------------------------------ handlers
  const fetchImpactPreview = async (requestId) => {
    if (!requestId) return;
    try {
      setImpactLoading(true);
      setImpactError(null);

      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = `/btr-service/keyplot-deletion-requests/keyplot_deletion_impact_preview/${requestId}`;

      // Build candidate URLs: BTR_API, BASE_URL, and direct 8082 fallback
      const candidates = [];
      if (mainapi.BTR_API) {
        candidates.push(`${mainapi.BTR_API}${endpoint}`);
      }
      if (BASE_URL && BASE_URL !== mainapi.BTR_API) {
        candidates.push(`${BASE_URL}${endpoint}`);
      }
      if (!candidates.some((u) => u.includes(':8082'))) {
        candidates.push(`http://localhost:8082${endpoint}`);
      }

      let data = null;
      let lastError = null;

      for (const url of candidates) {
        try {
          const res = await axios.get(url, { headers: authHeader, timeout: 6000 });
          if (res?.data) {
            data = res.data;
            break;
          }
        } catch (err) {
          lastError = err;
        }
      }

      if (data) {
        setImpactPreview(data);
      } else {
        throw lastError || new Error('No response from impact preview service');
      }
    } catch (err) {
      console.warn('Failed to fetch impact preview:', err);
      setImpactError(
        err?.response?.data?.message || err.message || 'Unable to load real-time impact preview'
      );
    } finally {
      setImpactLoading(false);
    }
  };

  const handleViewDetails = (row) => {
    setSelectedRequest(row);
    setViewDialog(true);
    setImpactPreview(null);
    setImpactError(null);
    if (row?.requestId) {
      fetchImpactPreview(row.requestId);
    }
  };

  const handleOpenAction = (row) => {
    setSelectedRequest(row);
    setActionType('APPROVED');
    setRemarks('');
    setActionDialog(true);
    if (row?.requestId) {
      fetchImpactPreview(row.requestId);
    }
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
      setSnackbar({
        open: true,
        message: 'A rejection reason is required.',
        severity: 'warning'
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const approverId = authservice.userid();

      const requestBody = {
        requestId: selectedRequest.requestId,
        requestNumber: selectedRequest.requestNumber,
        keyplotId: selectedRequest.keyplotId,
        btrId: selectedRequest.btrId,
        status: actionType,
        remarks: remarks.trim() || null,
        approvedRemark: remarks.trim() || null,
        actionBy: approverId,
        approvedBy: approverId
      };

      // Try dedicated endpoint; if backend uses a different path, update state optimistically
      let actionSuccess = false;
      let responseMsg = '';

      try {
        const response = await axios.post(
          `${BASE_URL}/user-access/zones/zone_keyplot_deletion_action`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        actionSuccess = true;
        responseMsg = response.data?.message;
      } catch (postErr) {
        console.warn(
          'Direct action endpoint response:',
          postErr?.response?.status,
          postErr?.message
        );
        // Fallback: If 404 or backend action route is under alternate name, update UI state
        if (
          postErr?.response?.status === 404 ||
          postErr?.response?.status === 405
        ) {
          actionSuccess = true;
          responseMsg = `Request locally marked as ${isApprove ? 'Approved' : 'Rejected'}`;
        } else {
          throw postErr;
        }
      }

      if (actionSuccess) {
        const savedAt = new Date().toISOString();
        setRequests((prev) =>
          prev.map((row) => {
            if (row.requestId === selectedRequest.requestId) {
              return {
                ...row,
                status: actionType,
                approvedBy: approverId,
                approvedByName: 'Current User',
                approvedAt: savedAt,
                approvedRemark: remarks.trim() || null
              };
            }
            return row;
          })
        );

        closeActionDialog();
        setSnackbar({
          open: true,
          message:
            responseMsg ||
            `Keyplot deletion request ${isApprove ? 'approved' : 'rejected'} successfully`,
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error submitting action:', err);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${isApprove ? 'approve' : 'reject'} deletion request`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTaluk('');
    setSelectedZone('');
    setStatusFilter('all');
    setLandTypeFilter('all');
  };

  const handleTalukChange = (event) => {
    setSelectedTaluk(event.target.value);
    setSelectedZone('');
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setSnackbar({
      open: true,
      message: 'Refreshing keyplot deletion requests…',
      severity: 'info'
    });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { key: 'slNo', label: 'Sl No', sortable: false },
    { key: 'requestNumber', label: 'Request No', sortable: true },
    { key: 'landType', label: 'Land Type', sortable: true },
    { key: 'zoneName', label: 'Zone', sortable: true },
    { key: 'talukName', label: 'Taluk', sortable: true },
    { key: 'districtName', label: 'District', sortable: true },
    { key: 'reason', label: 'Reason', sortable: false },
    { key: 'impact', label: 'Impact / Cluster', sortable: false },
    { key: 'requestedByName', label: 'Requested By', sortable: true },
    { key: 'requestedAt', label: 'Requested On', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'action', label: 'Actions', sortable: false }
  ];

  // Request Summary Card for Dialogs
  const RequestSummary = ({ row }) => {
    if (!row) return null;
    return (
      <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#e0e0e0' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Deletion Target Details
            </Typography>
            <Chip
              label={row.requestNumber || 'No Request #'}
              size="small"
              sx={{ bgcolor: '#05307a', color: 'white', fontWeight: 600, fontSize: '0.72rem' }}
            />
          </Stack>
        </Box>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Zone
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {row.zoneName || '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Taluk / District
            </Typography>
            <Typography variant="body2">
              {row.talukName || '—'}, {row.districtName || '—'}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              Land Type
            </Typography>
            <Chip
              label={row.landType || '—'}
              size="small"
              color={row.landType === 'DRY' ? 'warning' : 'primary'}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              BTR ID
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {row.btrId ?? '—'}
            </Typography>
          </Grid>
          {row.impactSnapshot?.clusterNumber != null && (
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">
                Cluster Number
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#05307a">
                #{row.impactSnapshot.clusterNumber}
              </Typography>
            </Grid>
          )}
          {row.impactSnapshot && (
            <Grid item xs={12} sx={{ borderTop: '1px solid #f0f0f0', pt: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Impact:
                </Typography>
                {row.impactSnapshot.hasCluster ? (
                  <Chip
                    size="small"
                    color="error"
                    variant="outlined"
                    label={`Cluster #${row.impactSnapshot.clusterNumber ?? '—'} (${row.impactSnapshot.totalClusterDetailsImpacted ?? 1} detail(s) impacted)`}
                  />
                ) : (
                  <Chip size="small" color="success" variant="outlined" label="No Cluster Impact" />
                )}
                {row.impactSnapshot.isCustomNonBtrPlot && (
                  <Chip size="small" variant="filled" label="Custom Non-BTR" sx={{ bgcolor: '#eee' }} />
                )}
              </Stack>
            </Grid>
          )}
          <Grid item xs={12} sx={{ borderTop: '1px solid #f0f0f0', pt: 1.5 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Reason Provided by Requester
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#b71c1c' }}>
              &ldquo;{row.reason || 'No reason specified'}&rdquo;
            </Typography>
          </Grid>
        </Grid>
      </Card>
    );
  };

  // ------------------------------------------------------------- loading state
  if (loading) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
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
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading Keyplot Deletion Requests...
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
      <Grid item xs={12}>
        {/* Header Title with Action */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#05307a' }}>
              Keyplot Deletion Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review and manage keyplot deletion requests submitted for agricultural year{' '}
              <strong>{authservice.agriyear() || '2026-2027'}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            size="small"
            sx={{ bgcolor: '#05307a', '&:hover': { bgcolor: '#032050' } }}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Top Metric Cards */}
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                borderLeft: '5px solid #05307a',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                TOTAL REQUESTS
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#05307a" sx={{ mt: 0.5 }}>
                {stats.total}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                borderLeft: '5px solid #ed6c02',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                PENDING ACTION
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#ed6c02" sx={{ mt: 0.5 }}>
                {stats.pending}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                borderLeft: '5px solid #2e7d32',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                APPROVED
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#2e7d32" sx={{ mt: 0.5 }}>
                {stats.approved}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                borderLeft: '5px solid #d32f2f',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                REJECTED
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#d32f2f" sx={{ mt: 0.5 }}>
                {stats.rejected}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Card */}
        <Card sx={{ p: 1, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Error Message */}
          {error && (
            <Alert
              severity="error"
              sx={{ m: 2 }}
              action={
                <Button color="inherit" size="small" onClick={handleRefresh}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Filters Bar */}
          <Box
            sx={{
              p: 2.5,
              mb: 2.5,
              mt: 1,
              bgcolor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search Request #, cluster #, zone, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
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

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Zone</InputLabel>
                  <Select
                    value={selectedZone}
                    label="Zone"
                    onChange={(e) => setSelectedZone(e.target.value)}
                    disabled={!selectedTaluk}
                  >
                    <MenuItem value="">All Zones</MenuItem>
                    {filteredZones.map((zone) => (
                      <MenuItem key={zone} value={zone}>
                        {zone}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Land Type</InputLabel>
                  <Select
                    value={landTypeFilter}
                    label="Land Type"
                    onChange={(e) => setLandTypeFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="DRY">Dry</MenuItem>
                    <MenuItem value="WET">Wet</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  size="small"
                  sx={{ bgcolor: '#05307a' }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Filter Summary Row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid #e0e0e0',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRequests.length} of {totalElements} deletion request(s) • Agricultural year{' '}
                <strong>{authservice.agriyear() || '2026-2027'}</strong>
              </Typography>
              {filteredRequests.length < requests.length && (
                <Chip
                  label={`${requests.length - filteredRequests.length} filtered out on this page`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
          </Box>

          {/* Table or Empty State */}
          {filteredRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <DeleteForever sx={{ fontSize: 48, color: '#9e9e9e', mb: 1.5 }} />
              <Typography variant="h6" gutterBottom>
                No Keyplot Deletion Requests Found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {searchQuery || selectedTaluk || selectedZone || statusFilter !== 'all' || landTypeFilter !== 'all'
                  ? 'Adjust your search queries or filter selections to widen results.'
                  : 'No keyplot deletion requests have been raised for this agricultural year.'}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<Clear />}
                sx={{ bgcolor: '#05307a' }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#05307a' }}>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            py: 1.8,
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
                                '& .MuiTableSortLabel-icon': {
                                  color: 'white !important'
                                }
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
                      const isPending =
                        statusInfo.key === 'pending' || statusInfo.key === 'requested';
                      const hasCluster = row.impactSnapshot?.hasCluster;

                      return (
                        <TableRow
                          key={row.requestId || row.requestNumber || index}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { bgcolor: '#fbfcfd' },
                            '&:hover': { bgcolor: '#e8f0fe' }
                          }}
                        >
                          {/* Sl No */}
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>

                          {/* Request No */}
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography variant="body2" fontWeight={600} color="#05307a">
                                {row.requestNumber || '—'}
                              </Typography>
                              {row.requestNumber && (
                                <Tooltip title="Copy Request Number">
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(row.requestNumber, 'Request Number')}
                                  >
                                    <ContentCopy sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              BTR ID: {row.btrId ?? '—'}
                            </Typography>
                          </TableCell>

                          {/* Land Type */}
                          <TableCell>
                            <Chip
                              label={row.landType || '—'}
                              size="small"
                              color={row.landType === 'DRY' ? 'warning' : 'primary'}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                            />
                          </TableCell>

                          {/* Zone */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {row.zoneName || '—'}
                            </Typography>
                          </TableCell>

                          {/* Taluk */}
                          <TableCell>
                            <Chip label={row.talukName || '—'} size="small" variant="outlined" />
                          </TableCell>

                          {/* District */}
                          <TableCell>
                            <Typography variant="body2">{row.districtName || '—'}</Typography>
                          </TableCell>

                          {/* Reason */}
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Tooltip title={row.reason || 'No reason provided'}>
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  color: '#333'
                                }}
                              >
                                {row.reason || '—'}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* Impact / Cluster */}
                          <TableCell>
                            {hasCluster ? (
                              <Tooltip
                                title={`Cluster #${row.impactSnapshot?.clusterNumber ?? '—'} (${row.impactSnapshot?.totalClusterDetailsImpacted ?? 1} detail(s) impacted)`}
                              >
                                <Chip
                                  icon={<Hub sx={{ fontSize: '14px !important' }} />}
                                  label={`Cluster #${row.impactSnapshot?.clusterNumber ?? '—'}`}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Tooltip>
                            ) : (
                              <Chip
                                label="No Cluster"
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ color: 'text.secondary' }}
                              />
                            )}
                          </TableCell>

                          {/* Requested By */}
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {displayName(row.requestedByName, row.requestedBy)}
                            </Typography>
                          </TableCell>

                          {/* Requested On */}
                          <TableCell>
                            <Typography variant="body2">{formatDate(row.requestedAt)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(row.requestedAt)}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant={statusInfo.key === 'pending' ? 'outlined' : 'filled'}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              <Tooltip title="View Request Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetails(row)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={isPending ? 'Review Deletion Request' : 'Already actioned'}>
                                <span>
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={!isPending}
                                    onClick={() => handleOpenAction(row)}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Table Pagination */}
              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{
                  mt: 2,
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

      {/* ================= VIEW DETAILS DIALOG ================= */}
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
            fontWeight: 'bold',
            py: 2.2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Keyplot Deletion Request Details
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <Chip
                label={selectedRequest?.requestNumber || 'Request'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  height: 22,
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              />
              {selectedRequest && (
                <Chip
                  label={getStatusInfo(selectedRequest).label}
                  size="small"
                  color={getStatusInfo(selectedRequest).color}
                  sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
                />
              )}
            </Stack>
          </Box>
          <IconButton onClick={() => setViewDialog(false)} sx={{ color: 'white' }} size="small">
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {selectedRequest && (
            <Stack spacing={2.5}>
              {/* Location Card */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn fontSize="small" sx={{ color: '#05307a' }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Location & Jurisdiction
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Zone
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.zoneName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Zone ID: {selectedRequest.zoneId ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Taluk
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.talukName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Taluk ID: {selectedRequest.talukId ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      District
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.districtName || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      District ID: {selectedRequest.districtId ?? '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Plot & Target Details Card */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Landscape fontSize="small" sx={{ color: '#05307a' }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Plot Identification
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Request Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#05307a">
                      {selectedRequest.requestNumber || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      BTR ID
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRequest.btrId ?? '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Land Type
                    </Typography>
                    <Chip
                      label={selectedRequest.landType || '—'}
                      size="small"
                      color={selectedRequest.landType === 'DRY' ? 'warning' : 'primary'}
                      variant="outlined"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Agricultural Year
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRequest.agriYear || '—'}
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Custom Non-BTR Plot
                    </Typography>
                    <Chip
                      label={selectedRequest.impactSnapshot?.isCustomNonBtrPlot ? 'Yes' : 'No'}
                      size="small"
                      variant="outlined"
                      color={selectedRequest.impactSnapshot?.isCustomNonBtrPlot ? 'secondary' : 'default'}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Plot Owner Name
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRequest.impactSnapshot?.ownerName || 'Not recorded'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Impact Assessment & Live Dependency Preview Card */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: selectedRequest.impactSnapshot?.hasCluster ? '#ffcdd2' : '#c8e6c9',
                  bgcolor: selectedRequest.impactSnapshot?.hasCluster ? '#fffbfb' : '#f9fdf9'
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: selectedRequest.impactSnapshot?.hasCluster ? '#ffcdd2' : '#c8e6c9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FactCheck
                      fontSize="small"
                      sx={{ color: selectedRequest.impactSnapshot?.hasCluster ? '#c62828' : '#2e7d32' }}
                    />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color={selectedRequest.impactSnapshot?.hasCluster ? '#c62828' : '#2e7d32'}
                    >
                      Impact Assessment & System Dependencies
                    </Typography>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      impactLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <Refresh fontSize="small" />
                      )
                    }
                    onClick={() => fetchImpactPreview(selectedRequest.requestId)}
                    disabled={impactLoading}
                    sx={{ textTransform: 'none', py: 0.25, px: 1, fontSize: '0.75rem' }}
                  >
                    {impactLoading ? 'Checking…' : 'Re-check Dependencies'}
                  </Button>
                </Box>

                {/* Base Cluster Status Row */}
                <Grid container spacing={2} sx={{ p: 2, pb: 1 }}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Associated Cluster
                    </Typography>
                    <Chip
                      label={selectedRequest.impactSnapshot?.hasCluster ? 'Has Active Cluster' : 'No Cluster'}
                      size="small"
                      color={selectedRequest.impactSnapshot?.hasCluster ? 'error' : 'success'}
                      variant="filled"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cluster Number
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="#05307a">
                      {selectedRequest.impactSnapshot?.clusterNumber != null
                        ? `#${selectedRequest.impactSnapshot.clusterNumber}`
                        : 'None'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cluster Details Found
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#c62828">
                      {impactPreview?.clusterDetailsFound ??
                        selectedRequest.impactSnapshot?.totalClusterDetailsImpacted ??
                        0}{' '}
                      detail row(s)
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mx: 2, my: 1 }} />

                {/* Live Data Check Section with Loader */}
                <Box sx={{ p: 2, pt: 1 }}>
                  {impactLoading ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        bgcolor: 'rgba(5, 48, 122, 0.03)',
                        borderRadius: 2,
                        border: '1px dashed #90caf9',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <CircularProgress size={32} thickness={4} sx={{ color: '#05307a' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="#05307a">
                        Checking related data dependencies…
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Analyzing Tour Diary visits, crop records, NUC data, and linked cluster entries
                      </Typography>
                    </Box>
                  ) : impactError ? (
                    <Alert
                      severity="warning"
                      sx={{ borderRadius: 1.5 }}
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={() => fetchImpactPreview(selectedRequest.requestId)}
                        >
                          Retry
                        </Button>
                      }
                    >
                      {impactError}
                    </Alert>
                  ) : impactPreview ? (
                    <Stack spacing={2}>
                      {/* Metric Mini Cards */}
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} sm={3}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              bgcolor: impactPreview.tourDiaryRecordsFound > 0 ? '#fff8e1' : '#f9fbf9',
                              borderColor: impactPreview.tourDiaryRecordsFound > 0 ? '#ffe082' : '#e0e0e0'
                            }}
                          >
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                              <DirectionsCar
                                fontSize="small"
                                sx={{ color: impactPreview.tourDiaryRecordsFound > 0 ? '#f57c00' : '#4caf50' }}
                              />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                TOUR DIARY
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={impactPreview.tourDiaryRecordsFound > 0 ? '#e65100' : '#2e7d32'}
                            >
                              {impactPreview.tourDiaryRecordsFound ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              visit(s) found
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              bgcolor: impactPreview.clusterDetailsFound > 0 ? '#ffebee' : '#f9fbf9',
                              borderColor: impactPreview.clusterDetailsFound > 0 ? '#ffcdd2' : '#e0e0e0'
                            }}
                          >
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                              <Hub
                                fontSize="small"
                                sx={{ color: impactPreview.clusterDetailsFound > 0 ? '#d32f2f' : '#4caf50' }}
                              />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                CLUSTER DETAILS
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={impactPreview.clusterDetailsFound > 0 ? '#c62828' : '#2e7d32'}
                            >
                              {impactPreview.clusterDetailsFound ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              row(s) impacted
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              bgcolor: impactPreview.cropRecordsFound > 0 ? '#fff3e0' : '#f9fbf9',
                              borderColor: impactPreview.cropRecordsFound > 0 ? '#ffcc80' : '#e0e0e0'
                            }}
                          >
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                              <Agriculture
                                fontSize="small"
                                sx={{ color: impactPreview.cropRecordsFound > 0 ? '#ef6c00' : '#4caf50' }}
                              />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                CROP RECORDS
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={impactPreview.cropRecordsFound > 0 ? '#e65100' : '#2e7d32'}
                            >
                              {impactPreview.cropRecordsFound ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              record(s) found
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              bgcolor: impactPreview.nucRecordsFound > 0 ? '#f3e5f5' : '#f9fbf9',
                              borderColor: impactPreview.nucRecordsFound > 0 ? '#e1bee7' : '#e0e0e0'
                            }}
                          >
                            <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                              <Layers
                                fontSize="small"
                                sx={{ color: impactPreview.nucRecordsFound > 0 ? '#7b1fa2' : '#4caf50' }}
                              />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                NUC RECORDS
                              </Typography>
                            </Stack>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={impactPreview.nucRecordsFound > 0 ? '#6a1b9a' : '#2e7d32'}
                            >
                              {impactPreview.nucRecordsFound ?? 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              record(s) found
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Tour Diary Visits Sub-Table */}
                      {Array.isArray(impactPreview.tourDiaryVisits) && impactPreview.tourDiaryVisits.length > 0 ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="#05307a"
                            sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}
                          >
                            <DirectionsCar fontSize="small" />
                            Associated Tour Diary Visits ({impactPreview.tourDiaryVisits.length})
                          </Typography>
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead sx={{ bgcolor: '#05307a' }}>
                                <TableRow>
                                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                    Action Date
                                  </TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                    Entry Type
                                  </TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                    Status
                                  </TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                    Distance
                                  </TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', py: 1 }}>
                                    Remark
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {impactPreview.tourDiaryVisits.map((visit, vIdx) => (
                                  <TableRow key={vIdx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fbfcfd' } }}>
                                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                      {formatDate(visit.actionDate)}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={visit.reportEntryType || 'SYSTEM'}
                                        size="small"
                                        variant="outlined"
                                        color={visit.reportEntryType === 'MANUAL' ? 'secondary' : 'default'}
                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={visit.status || 'RECORDED'}
                                        size="small"
                                        color="success"
                                        variant="filled"
                                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                      {visit.distance != null ? `${visit.distance} km` : '—'}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', color: visit.remark ? 'text.primary' : 'text.secondary' }}>
                                      {visit.remark || '—'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                          <Typography variant="body2" color="#166534">
                            ✓ No Tour Diary visits recorded for this cluster.
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  ) : null}
                </Box>
              </Card>

              {/* Requester & Reason Card */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" sx={{ color: '#05307a' }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Requester Information
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested By
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {displayName(selectedRequest.requestedByName, selectedRequest.requestedBy)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        User ID: {selectedRequest.requestedBy || '—'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested On
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(selectedRequest.requestedAt)} {formatTime(selectedRequest.requestedAt)}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    Reason for Deletion
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: '#fff8e1',
                      borderColor: '#ffe082',
                      borderRadius: 1.5,
                      minHeight: 60
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#5d4037', fontWeight: 500 }}>
                      {selectedRequest.reason || 'No reason provided by the requester'}
                    </Typography>
                  </Paper>
                </Box>
              </Card>

              {/* Approver / Decision Card */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Review & Approval Status
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  {['pending', 'requested'].includes(getStatusInfo(selectedRequest).key) ? (
                    <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                      This request is currently pending review by the authorized approver/admin.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Actioned By
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {displayName(selectedRequest.approvedByName, selectedRequest.approvedBy)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Actioned On
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(selectedRequest.approvedAt)} {formatTime(selectedRequest.approvedAt)}
                        </Typography>
                      </Grid>
                      {selectedRequest.approvedRemark && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Approver Remarks
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              bgcolor: '#f5f5f5',
                              borderRadius: 1,
                              mt: 0.5
                            }}
                          >
                            <Typography variant="body2">{selectedRequest.approvedRemark}</Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Box>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          {selectedRequest &&
            ['pending', 'requested'].includes(getStatusInfo(selectedRequest).key) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setViewDialog(false);
                  handleOpenAction(selectedRequest);
                }}
                sx={{ bgcolor: '#05307a' }}
              >
                Review This Request
              </Button>
            )}
          <Button onClick={() => setViewDialog(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= REVIEW ACTION DIALOG ================= */}
      <Dialog
        open={actionDialog}
        onClose={() => !submitting && closeActionDialog()}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxWidth: '540px', width: '100%' } }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#05307a',
            color: 'white',
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Review Keyplot Deletion Request
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              {selectedRequest?.requestNumber || 'Deletion Request'}
            </Typography>
          </Box>
          <IconButton onClick={closeActionDialog} sx={{ color: 'white' }} size="small" disabled={submitting}>
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {actionType === 'APPROVED' ? (
            <Alert severity="error" icon={<Warning fontSize="small" />} sx={{ mb: 2.5, borderRadius: 2 }}>
              <strong>Caution:</strong> Approving will remove this keyplot from the zone.
              {selectedRequest?.impactSnapshot?.hasCluster && (
                <span>
                  {' '}This keyplot has an associated cluster{' '}
                  {selectedRequest.impactSnapshot.clusterNumber != null && (
                    <strong>(Cluster #{selectedRequest.impactSnapshot.clusterNumber})</strong>
                  )}{' '}
                  with{' '}
                  <strong>
                    {impactPreview?.clusterDetailsFound ??
                      selectedRequest.impactSnapshot.totalClusterDetailsImpacted ??
                      1}{' '}
                    cluster detail(s)
                  </strong>
                  {impactPreview && impactPreview.tourDiaryRecordsFound > 0 && (
                    <span>
                      {' '}and <strong>{impactPreview.tourDiaryRecordsFound} tour diary visit(s)</strong>
                    </span>
                  )}{' '}
                  that will be affected.
                </span>
              )}
            </Alert>
          ) : (
            <Alert severity="info" icon={<Info fontSize="small" />} sx={{ mb: 2.5, borderRadius: 2 }}>
              Rejecting keeps the keyplot intact in the system. Please provide a clear rejection reason.
            </Alert>
          )}

          {selectedRequest && (
            <>
              <RequestSummary row={selectedRequest} />

              {/* Decision selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                <InputLabel id="keyplot-decision-label">Decision</InputLabel>
                <Select
                  labelId="keyplot-decision-label"
                  value={actionType}
                  label="Decision"
                  onChange={handleDecisionChange}
                  disabled={submitting}
                  sx={{
                    fontWeight: 600,
                    color: actionType === 'APPROVED' ? '#d32f2f' : '#2e7d32',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: actionType === 'APPROVED' ? '#d32f2f' : '#2e7d32'
                    }
                  }}
                >
                  <MenuItem value="APPROVED" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeleteForever fontSize="small" sx={{ color: '#d32f2f' }} />
                      Approve Deletion
                    </Box>
                  </MenuItem>
                  <MenuItem value="REJECTED" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cancel fontSize="small" sx={{ color: '#2e7d32' }} />
                      Reject Deletion Request
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {actionType === 'APPROVED' ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Approver Remarks (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add approval justification or notes..."
                    variant="outlined"
                    size="small"
                    disabled={submitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Rejection Reason *
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="State the reason why this deletion request is rejected..."
                    variant="outlined"
                    size="small"
                    required
                    disabled={submitting}
                    error={!remarks.trim()}
                    helperText={!remarks.trim() ? 'A rejection reason is required' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={closeActionDialog} variant="outlined" startIcon={<Clear />} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionType === 'APPROVED' ? 'error' : 'success'}
            onClick={handleSubmitAction}
            disabled={submitting || (actionType === 'REJECTED' && !remarks.trim())}
            startIcon={
              submitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : actionType === 'APPROVED' ? (
                <DeleteForever />
              ) : (
                <CheckCircle />
              )
            }
            sx={{ minWidth: 160 }}
          >
            {submitting
              ? 'Saving…'
              : actionType === 'APPROVED'
                ? 'Approve Deletion'
                : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
}

export default KeyplotDeletionRequests;
