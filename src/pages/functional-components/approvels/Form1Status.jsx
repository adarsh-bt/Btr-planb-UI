import React, { useState, useEffect } from 'react';
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
  Snackbar
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
  Warning
} from '@mui/icons-material';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import api from 'api/api';

function Form1Status() {
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

  // Dialogs
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Server-side pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalElements, setTotalElements] = useState(0);

  // Client-side sorting
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('requestedAt');

  // Forces a refetch even when page/size are unchanged
  const [refreshKey, setRefreshKey] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ---------------------------------------------------------------- data fetch
  useEffect(() => {
    const fetchEditRequests = async () => {
      try {
        if (requests.length === 0) {
          setLoading(true);
        }
        setError(null);

        const agriYear = authservice.agriyear();
        console.log("params ", agriYear, page, rowsPerPage);
        const response = await api.get(
          `${BASE_URL}/user-access/zones/fetch-zone-cluster-edit-requests`,
          {
            params: { agriYear, page, size: rowsPerPage }
          }
        );

        const result = response.data;

        setRequests(result.content || []);
        setTotalElements(result.totalElements || 0);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to fetch Form 1 edit requests');
        setRequests([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEditRequests();
  }, [BASE_URL, page, rowsPerPage, refreshKey]);

  // ------------------------------------------------------------------ helpers
  // requestStatus is nullable in the API, so derive a usable status from it.
  const getStatusInfo = (row) => {
    const raw = (row?.status || row?.requestStatus || '').toString().trim().toUpperCase();
    console.log("row", row)
    if (raw === 'REJECTED' || raw === 'REJECT' || raw.includes('REJECT')) {
      return { key: 'rejected', label: 'Rejected', color: 'error', icon: <Cancel /> };
    }
    if (raw === 'APPROVED' || raw === 'APPROVE' || raw.includes('APPROV')) {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle /> };
    }
    if (raw === 'REQUESTED' || raw === 'REQUEST') {
      return { key: 'requested', label: 'Requested', color: 'info', icon: <PendingActions /> };
    }
    if (raw === 'PENDING') {
      return { key: 'pending', label: 'Pending', color: 'warning', icon: <PendingActions /> };
    }
    // Fallback when the backend leaves status / requestStatus null
    if (row?.approvedAt || row?.approvedBy) {
      return { key: 'approved', label: 'Approved', color: 'success', icon: <CheckCircle /> };
    }
    return { key: 'pending', label: 'Pending', color: 'warning', icon: <PendingActions /> };
  };

  // requestedByName / approvedByName come back null in some rows — fall back to a short id
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

  // The save endpoint needs these four keys. Row shapes vary slightly across
  // the list API, so normalise here and surface anything missing before POSTing.
  const buildIdentifiers = (row) => ({
    id: row?.requestId ?? row?.id ?? null,
    zoneId: row?.zoneId ?? row?.zone_id ?? null,
    clusterId: row?.clusterId ?? row?.cluster_id ?? null,
    seasonId: row?.seasonId ?? row?.season_id ?? null
  });

  const missingIdentifiers = (row) => {
    const ids = buildIdentifiers(row);
    return Object.entries(ids)
      .filter(([, value]) => value === null || value === undefined || value === '')
      .map(([key]) => key);
  };

  // ------------------------------------------------------------ filter options
  const taluks = [...new Set(requests.map((r) => r.talukName).filter(Boolean))];
  const zones = [...new Set(requests.map((r) => r.zoneName).filter(Boolean))];

  const filteredZones = selectedTaluk
    ? [...new Set(requests.filter((r) => r.talukName === selectedTaluk).map((r) => r.zoneName).filter(Boolean))]
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

    if (key === 'requestStatus' || key === 'status') {
      av = getStatusInfo(a).label;
      bv = getStatusInfo(b).label;
    }

    // Nulls always sink to the bottom
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

  // ----------------------------------------------------------------- filtering
  const filteredRequests = requests.filter((row) => {
    const q = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !q ||
      row.zoneName?.toLowerCase().includes(q) ||
      row.talukName?.toLowerCase().includes(q) ||
      row.districtName?.toLowerCase().includes(q) ||
      row.clusterNo?.toString().includes(q) ||
      row.seasonName?.toLowerCase().includes(q) ||
      getStatusInfo(row).label.toLowerCase().includes(q);

    const matchesTaluk = !selectedTaluk || row.talukName === selectedTaluk;
    const matchesZone = !selectedZone || row.zoneName === selectedZone;
    const matchesStatus =
      statusFilter === 'all' ||
      getStatusInfo(row).key === statusFilter ||
      (statusFilter === 'pending' && getStatusInfo(row).key === 'requested');

    return matchesSearch && matchesTaluk && matchesZone && matchesStatus;
  });

  const sortedData = [...filteredRequests].sort(getComparator(order, orderBy));

  // ------------------------------------------------------------------ handlers
  const handleViewDetails = (row) => {
    setSelectedRequest(row);
    setViewDialog(true);
  };

  // Opens the review dialog; the decision itself is picked inside the dialog
  const handleOpenAction = (row) => {
    setSelectedRequest(row);
    setActionType('APPROVED');
    setRemarks('');
    setActionDialog(true);
  };

  const handleDecisionChange = (event) => {
    setActionType(event.target.value);
    setRemarks(''); // an approval note shouldn't carry over into a rejection
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
        message: `Cannot save — the list response is missing: ${missing.join(', ')}`,
        severity: 'error'
      });
      return;
    }

    const status = actionType;

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');
      const approverId = authservice.userid();
      const ids = buildIdentifiers(selectedRequest);

      const requestBody = {
        id: ids.id,
        zoneId: ids.zoneId,
        clusterId: ids.clusterId,
        seasonId: ids.seasonId,
        approvedRemark: remarks.trim() || null,
        status,
        approvedBy: approverId
      };

      const response = await axios.post(
        `${BASE_URL}/earas-form1-entry/form1/edit-log-save`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data || {};
      const payload = result?.payload || {};
      const savedAt = new Date().toISOString();
      const updatedStatus = payload.status || status;

      setRequests((prev) =>
        prev.map((row) => {
          const rowId = row.requestId ?? row.id;
          if (String(rowId) === String(ids.id)) {
            return {
              ...row,
              status: updatedStatus,
              requestStatus: updatedStatus,
              approvedRemark: payload.approvedRemark ?? requestBody.approvedRemark,
              approvedBy: payload.approvedBy ?? approverId,
              approvedAt: payload.approvedAt ?? savedAt
            };
          }
          return row;
        })
      );

      closeActionDialog();
      setRefreshKey((k) => k + 1);

      setSnackbar({
        open: true,
        message: result?.message || `Edit request ${isApprove ? 'approved' : 'rejected'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.message || err.message || `Failed to ${isApprove ? 'approve' : 'reject'} the edit request`,
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
  };

  const handleTalukChange = (event) => {
    setSelectedTaluk(event.target.value);
    setSelectedZone('');
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    setSnackbar({ open: true, message: 'Refreshing edit requests…', severity: 'info' });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns = [
    { key: 'slNo', label: 'Sl No', sortable: false },
    { key: 'clusterNo', label: 'Cluster No', sortable: true },
    { key: 'zoneName', label: 'Zone', sortable: true },
    { key: 'talukName', label: 'Taluk', sortable: true },
    { key: 'districtName', label: 'District', sortable: true },
    { key: 'requestedAt', label: 'Requested On', sortable: true },
    { key: 'requestStatus', label: 'Status', sortable: true },
    { key: 'action', label: 'Actions', sortable: false }
  ];

  // Small reusable block so approve and reject dialogs stay in sync
  const RequestSummary = ({ row }) => (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#e0e0e0' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
        <Typography variant="subtitle1" fontWeight={600} color="#05307a">
          Request Details
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Cluster No
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {row.clusterNo ?? '—'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Season
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {row.seasonName || '—'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Zone
          </Typography>
          <Typography variant="body1">{row.zoneName || '—'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Taluk
          </Typography>
          <Typography variant="body1">{row.talukName || '—'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            District
          </Typography>
          <Typography variant="body1">{row.districtName || '—'}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary" display="block">
            Requested By
          </Typography>
          <Typography variant="body1">{displayName(row.requestedByName, row.requestedBy)}</Typography>
        </Grid>
        <Grid item xs={12} sx={{ borderTop: '1px solid #e0e0e0', pt: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Remark by Requester
          </Typography>
          <Typography variant="body1">{row.requestedRemark || 'No remark provided by the requester'}</Typography>
        </Grid>
      </Grid>
    </Card>
  );

  // ------------------------------------------------------------- loading state
  if (loading) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Card sx={{ p: 4 }}>
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
                Loading Form 1 Edit Requests...
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
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          Form 1 Edit Request Status
        </Typography>

        <Card sx={{ p: 1, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Error */}
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

          {/* Filters */}
          <Box
            sx={{
              p: 3,
              mb: 3,
              mt: 2,
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
                  placeholder="Search cluster, zone, taluk, district..."
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

              <Grid item xs={12} md={2}>
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

              <Grid item xs={12} md={2}>
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

              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="requested">Requested</MenuItem>
                    {/* <MenuItem value="pending">Pending</MenuItem> */}
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<FilterList />} onClick={handleClearFilters} size="small">
                  Clear Filters
                </Button>
                <Button variant="contained" startIcon={<Refresh />} onClick={handleRefresh} size="small">
                  Refresh
                </Button>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 2,
                borderTop: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRequests.length} of {totalElements} edit requests • Agricultural year{' '}
                {authservice.agriyear()}
              </Typography>
              {filteredRequests.length < requests.length && (
                <Chip label={`${requests.length - filteredRequests.length} filtered out`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>

          {/* Table */}
          {filteredRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography variant="h6" gutterBottom>
                No edit requests found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {searchQuery || selectedTaluk || selectedZone || statusFilter !== 'all'
                  ? 'Adjust the search or filters to widen the results.'
                  : 'No zone cluster edit requests have been raised for this agricultural year.'}
              </Typography>
              <Button variant="contained" onClick={handleClearFilters} startIcon={<Clear />}>
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#05307a' }}>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            py: 2,
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
                              sx={{ color: 'white !important' }}
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
                      const isPending = statusInfo.key === 'pending' || statusInfo.key === 'requested';
                      return (
                        <TableRow
                          key={row.requestId || row.id || index}
                          hover
                          sx={{
                            '&:nth-of-type(even)': { bgcolor: '#f8f9fa' },
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {row.clusterNo ?? '—'}
                            </Typography>
                            {row.seasonName && (
                              <Typography variant="caption" color="text.secondary">
                                {row.seasonName}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{row.zoneName || '—'}</Typography>
                          </TableCell>

                          <TableCell>
                            <Chip label={row.talukName || '—'} size="small" variant="outlined" />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{row.districtName || '—'}</Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{formatDate(row.requestedAt)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(row.requestedAt)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant={statusInfo.key === 'pending' ? 'outlined' : 'filled'}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary" onClick={() => handleViewDetails(row)}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title={isPending ? 'Review Request' : 'Already actioned'}>
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
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

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

      {/* View Details Dialog */}
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
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Edit Request Details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Chip
                label={`Cluster #${selectedRequest?.clusterNo ?? '—'}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  height: 20,
                  fontSize: '0.7rem'
                }}
              />
              {selectedRequest && (
                <Chip
                  label={getStatusInfo(selectedRequest).label}
                  size="small"
                  color={getStatusInfo(selectedRequest).color}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={() => setViewDialog(false)} sx={{ color: 'white' }} size="small">
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedRequest && (
            <Box sx={{ p: 3 }}>
              {/* Location */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Location Details
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ p: 2.5 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Zone
                    </Typography>
                    <Chip label={selectedRequest.zoneName || '—'} size="small" variant="outlined" color="primary" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Taluk
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.talukName || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      District
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.districtName || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cluster Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.clusterNo ?? '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Season
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.seasonName || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Land Type
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedRequest.landType || '—'}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>

              {/* Request */}
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Request
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested By
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={500}>
                          {displayName(selectedRequest.requestedByName, selectedRequest.requestedBy)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Requested On
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(selectedRequest.requestedAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(selectedRequest.requestedAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" color="text.secondary" display="block">
                    Requested Remark
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: selectedRequest.requestedRemark ? '#fff8e1' : '#f5f5f5',
                      borderRadius: 1,
                      minHeight: 60
                    }}
                  >
                    <Typography variant="body2">
                      {selectedRequest.requestedRemark || 'No remark provided by the requester'}
                    </Typography>
                  </Paper>
                </Box>
              </Card>

              {/* Approval */}
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e0e0e0' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="#05307a">
                    Approval
                  </Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  {['pending', 'requested'].includes(getStatusInfo(selectedRequest).key) ? (
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                      This request is waiting for approver action.
                    </Alert>
                  ) : (
                    <>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Actioned By
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" color="action" />
                            <Typography variant="body1" fontWeight={500}>
                              {displayName(selectedRequest.approvedByName, selectedRequest.approvedBy)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Actioned On
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusInfo(selectedRequest).key === 'rejected' ? (
                              <Cancel fontSize="small" color="error" />
                            ) : (
                              <CheckCircle fontSize="small" color="success" />
                            )}
                            <Typography variant="body1" fontWeight={500}>
                              {formatDate(selectedRequest.approvedAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(selectedRequest.approvedAt)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Typography variant="caption" color="text.secondary" display="block">
                        Approver Remark
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: selectedRequest.approvedRemark ? '#e8f5e9' : '#f5f5f5',
                          borderColor: selectedRequest.approvedRemark ? '#c8e6c9' : '#e0e0e0',
                          borderRadius: 1,
                          minHeight: 60
                        }}
                      >
                        <Typography variant="body2">
                          {selectedRequest.approvedRemark || 'No remark provided by the approver'}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setViewDialog(false)} variant="outlined" startIcon={<Clear />}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog — approve or reject from a single decision dropdown */}
      <Dialog
        open={actionDialog}
        onClose={() => !submitting && closeActionDialog()}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxWidth: '520px', width: '100%' } }}
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
              Review Edit Request
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Cluster #{selectedRequest?.clusterNo ?? '—'} • {selectedRequest?.seasonName || '—'}
            </Typography>
          </Box>
          <IconButton onClick={closeActionDialog} sx={{ color: 'white' }} size="small" disabled={submitting}>
            <Clear fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {actionType === 'APPROVED' ? (
            <Alert severity="info" icon={<Info fontSize="small" />} sx={{ mb: 3, borderRadius: 2 }}>
              Accepting reopens Form 1 for this cluster so the investigator can edit the entry. This action cannot be undone.
            </Alert>
          ) : (
            <Alert severity="warning" icon={<Warning fontSize="small" />} sx={{ mb: 3, borderRadius: 2 }}>
              Rejecting keeps Form 1 locked for this cluster. Give the investigator a reason so they know what to fix.
            </Alert>
          )}

          {selectedRequest && (
            <>
              <RequestSummary row={selectedRequest} />

              {/* Decision selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                <InputLabel id="form1-decision-label">Decision</InputLabel>
                <Select
                  labelId="form1-decision-label"
                  value={actionType}
                  label="Decision"
                  onChange={handleDecisionChange}
                  disabled={submitting}
                  sx={{
                    fontWeight: 600,
                    color: actionType === 'APPROVED' ? '#2e7d32' : '#d32f2f',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                      borderColor: actionType === 'APPROVED' ? '#2e7d32' : '#d32f2f'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: actionType === 'APPROVED' ? '#1b5e20' : '#b71c1c'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: actionType === 'APPROVED' ? '#2e7d32' : '#d32f2f'
                    },
                    '& .MuiSvgIcon-root': { color: actionType === 'APPROVED' ? '#2e7d32' : '#d32f2f' }
                  }}
                >
                  <MenuItem value="APPROVED" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" sx={{ color: '#2e7d32' }} />
                      Accept Request
                    </Box>
                  </MenuItem>
                  <MenuItem value="REJECTED" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cancel fontSize="small" sx={{ color: '#d32f2f' }} />
                      Reject Request
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {actionType === 'APPROVED' ? (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Approver Remark (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add any remark or note for this approval..."
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
                    placeholder="Explain why this edit request is being rejected..."
                    variant="outlined"
                    size="small"
                    required
                    disabled={submitting}
                    error={!remarks.trim()}
                    helperText={!remarks.trim() ? 'A reason is required before rejecting' : ''}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={closeActionDialog} variant="outlined" startIcon={<Clear />} disabled={submitting}>
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
            sx={{ minWidth: 160 }}
          >
            {submitting ? 'Saving…' : actionType === 'APPROVED' ? 'Accept Request' : 'Reject Request'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Form1Status;