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
  Stack,
  TextareaAutosize,Snackbar,FormControlLabel,Switch,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Edit,
  PendingActions,
  Clear,
  Visibility,
  Download,
  FilterList,
  Refresh,Person,
  Cancel,
  CalendarToday,Info,Warning,PlayCircleOutline,PlayCircleFilled
  
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import { useTheme } from '@mui/material/styles';

function ClusterApprovals() {
  const theme = useTheme();
  const role = authservice.getrole()?.trim();
  const BASE_URL = mainapi.BASE_URL;
  
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  
  // Table states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('clusterNo');
  // Add these with your other useState declarations
const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success' // 'success', 'error', 'info', 'warning'
});

  // Fetch cluster approvals data
  useEffect(() => {
    const fetchClusterApprovals = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${BASE_URL}/user-access/zones/zone_cluster_approvals`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();
    
        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch cluster approvals");
        } else {
          setApprovals(result || []);
        }
      } catch (err) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchClusterApprovals();
  }, []);

  // Extract unique values for filters
  const taluks = [...new Set(approvals.map(a => a.talukName))];
  const zones = [...new Set(approvals.map(a => a.zoneName))];

  // Get filtered zones based on selected taluk
  const filteredZones = selectedTaluk 
    ? [...new Set(approvals
        .filter(a => a.talukName === selectedTaluk)
        .map(a => a.zoneName))]
    : zones;

  // Sorting logic
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (typeof a[orderBy] === 'string' && typeof b[orderBy] === 'string') {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  // Filter logic
  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = !searchQuery || 
      approval.zoneName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.talukName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.clusterNo?.toString().includes(searchQuery) ||
      approval.districtName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTaluk = !selectedTaluk || approval.talukName === selectedTaluk;
    const matchesZone = !selectedZone || approval.zoneName === selectedZone;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? !approval.approved :
      statusFilter === 'approved' ? approval.approved : true;

    return matchesSearch && matchesTaluk && matchesZone && matchesStatus;
  });

  // Sort and paginate data
  const sortedAndPaginatedData = [...filteredApprovals]
    .sort(getComparator(order, orderBy))
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Handle view details
  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setViewDialog(true);
  };

  // Handle approve action
  const handleApprove = (approval) => {
    setSelectedApproval(approval);
    setRemarks('');
     setIsEditEnabled(false);
    setApproveDialog(true);
  };

  // Handle reject action
  const handleReject = (approval) => {
    setSelectedApproval(approval);
    setRemarks('');
    setIsEditEnabled(false);
    setRejectDialog(true);
  };

  // Submit approval or rejection
const handleSubmitAction = async (isApprove) => {
  try {
    if (!selectedApproval) return;

    const token = localStorage.getItem('token');
    const userId = authservice.userid();
    
    const requestBody = {
      approvalLogId: selectedApproval.approvalId,
      approve: isApprove,
      // is_Reject: !isApprove,
      approver_id: userId,
      remarks: remarks || null,
      is_edit: isEditEnabled // Add this parameter
    };

   

    const response = await fetch(
      `${BASE_URL}/btr-service/admin-manage/approve-reject`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (response.ok) {
      // Update local state
      setApprovals(prev => prev.map(approval => 
        approval.approvalId === selectedApproval.approvalId 
          ? { 
              ...approval, 
              approved: isApprove,
              approvedBy: userId,
              approvedAt: new Date().toISOString(),
              remarks: remarks || approval.remarks,
              isEdit: isEditEnabled // Track edit status
            }
          : approval
      ));
      
      // Close dialogs and reset states
      setApproveDialog(false);
      setRejectDialog(false);
      setSelectedApproval(null);
      setRemarks('');
      setIsEditEnabled(false); // Reset edit toggle
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Cluster ${isApprove ? 'approved' : 'rejected'} successfully! ${isEditEnabled ? ' (Edit Enabled)' : ''}`,
        severity: 'success'
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to ${isApprove ? 'approve' : 'reject'} cluster`);
    }
  } catch (err) {
    console.error('Action error:', err);
    setSnackbar({
      open: true,
      message: `Failed to ${isApprove ? 'approve' : 'reject'} cluster: ${err.message}`,
      severity: 'error'
    });
  }
};

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTaluk('');
    setSelectedZone('');
    setStatusFilter('all');
    setPage(0);
  };

  // Handle taluk change
  const handleTalukChange = (event) => {
    setSelectedTaluk(event.target.value);
    setSelectedZone(''); // Reset zone when taluk changes
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status color and label
  const getStatusInfo = (approved) => {
    return {
      label: approved ? "Approved" : "Pending",
      color: approved ? "success" : "warning",
      icon: approved ? <CheckCircle /> : <PendingActions />
    };
  };

  // Calculate total area
  const totalArea = filteredApprovals.reduce((sum, row) => sum + parseFloat(row.totalArea || 0), 0).toFixed(2);

  // Loading state
  if (loading) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: 400,
              flexDirection: 'column',
              gap: 2
            }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" color="text.secondary">
                Loading Cluster Approvals...
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
          Cluster Approvals
        </Typography>
        
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #05307a, #1976d2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Cluster Approval Requests
              </Typography>
              {/* <Typography variant="body1" color="text.secondary">
                Total {filteredApprovals.length} cluster approvals • Total area: {totalArea} hectares
              </Typography> */}
            </Box>
            
            {/* Summary Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={`Pending: ${filteredApprovals.filter(a => !a.approved).length}`}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Approved: ${filteredApprovals.filter(a => a.approved).length}`}
                color="success"
                variant="outlined"
                size="small"
              />
            </Stack>
          </Box>

          {/* Error Display */}
          {/* {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )} */}

          {/* Filters Section */}
          <Box sx={{ 
            p: 3, 
            mb: 3,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search clusters, zones, districts..."
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

              {/* Taluk Filter */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Taluk</InputLabel>
                  <Select
                    value={selectedTaluk}
                    label="Taluk"
                    onChange={handleTalukChange}
                  >
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

              {/* Status Filter */}
              <Grid item xs={12} md={2}>
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
                  </Select>
                </FormControl>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  size="small"
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Results Summary */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2,
              pt: 2,
              borderTop: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {sortedAndPaginatedData.length} of {filteredApprovals.length} cluster approvals
              </Typography>
              {filteredApprovals.length < approvals.length && (
                <Chip
                  label={`${approvals.length - filteredApprovals.length} filtered out`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          {/* Table Section */}
          {filteredApprovals.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <Typography variant="h6" gutterBottom>
                No cluster approvals found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {searchQuery || selectedTaluk || selectedZone || statusFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "There are no cluster approvals available."}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClearFilters}
                startIcon={<Clear />}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: '#05307a' }}>
                    <TableRow>
                      {[
                        { key: 'slNo', label: 'Sl No' },
                        { key: 'clusterNo', label: 'Cluster No' },
                        { key: 'zoneName', label: 'Zone' },
                        { key: 'talukName', label: 'Taluk' },
                        { key: 'districtName', label: 'District' },
                        { key: 'totalArea', label: 'Area (hectares)' },
                        { key: 'requestedAt', label: 'Requested On' },
                        { key: 'approved', label: 'Status' },
                        { key: 'action', label: 'Actions' }
                      ].map((column) => (
                        <TableCell
                          key={column.key}
                          sx={{ 
                            color: 'white',
                            fontWeight: 'bold',
                            py: 2,
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            '&:last-child': { borderRight: 'none' }
                          }}
                          align={column.key === 'action' ? 'center' : 'left'}
                        >
                          {column.key !== 'action' && column.key !== 'slNo' ? (
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
                    {sortedAndPaginatedData.map((approval, index) => {
                      const statusInfo = getStatusInfo(approval.approved);
                      return (
                        <TableRow 
                          key={approval.approvalId}
                          hover
                          sx={{ 
                            '&:nth-of-type(even)': { bgcolor: '#f8f9fa' },
                            '&:hover': { bgcolor: '#e3f2fd' }
                          }}
                        >
                          {/* Serial Number */}
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {page * rowsPerPage + index + 1}
                            </Typography>
                          </TableCell>
                          
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {approval.clusterNo} ({approval.clusterType})
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {approval.zoneName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={approval.talukName}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {approval.districtName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {approval.totalArea.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(approval.requestedAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(approval.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant={approval.approved ? "filled" : "outlined"}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetails(approval)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {/* {!approval.approved && role?.includes('Approver') && ( */}
                                <>
                                  <Tooltip title="Approve Cluster">
                                    <IconButton
                                    disabled={statusInfo.label === 'Approved'}
                                      size="small"
                                      color="success"
                                      onClick={() => handleApprove(approval)}
                                    >
                                      <CheckCircle fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Cluster">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={true}
                                      onClick={() => handleReject(approval)}
                                    >
                                      <Cancel fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              {/* )} */}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={filteredApprovals.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
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

          {/* Summary Section */}
          {filteredApprovals.length > 0 && (
            <Box sx={{ 
              mt: 3,
              p: 2,
              bgcolor: '#f0f4ff',
              borderRadius: 2,
              border: '1px solid #d1d9ff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" fontWeight="600" color="#05307a">
                Approval Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Clusters
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#05307a">
                    {filteredApprovals.length}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h5" fontWeight="700" color="#05307a">
                    {filteredApprovals.filter(a => !a.approved).length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Card>
      </Grid>

      {/* View Details Dialog */}
   {/* View Details Dialog - Enhanced */}
{/* View Details Dialog - Enhanced */}
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
  <DialogTitle sx={{
    bgcolor: '#05307a',
    color: 'white',
    fontWeight: 'bold',
    py: 2.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Cluster Details
      </Typography>
      <Typography variant="caption" sx={{
        color: 'rgba(255,255,255,0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        mt: 0.5
      }}>
        <Chip
          label={`ID: ${selectedApproval?.approvalId}`}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            height: 20,
            fontSize: '0.7rem'
          }}
        />
        <Chip
          label={selectedApproval?.approved ? "Approved" : "Pending"}
          size="small"
          color={selectedApproval?.approved ? "success" : "warning"}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      </Typography>
    </Box>
    <IconButton
      onClick={() => setViewDialog(false)}
      sx={{ color: 'white' }}
      size="small"
    >
      <Clear fontSize="small" />
    </IconButton>
  </DialogTitle>

  <DialogContent dividers sx={{ p: 0 }}>
    {selectedApproval && (
      <Box sx={{ p: 3 }}>
        {/* Cluster Information Card */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 2,
            borderColor: '#e0e0e0',
            bgcolor: '#f8fafc'
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Cluster Information
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ p: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Cluster Number & Type
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  Cluster #{selectedApproval.clusterNo} • {selectedApproval.clusterType}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Area
                </Typography>
                <Typography variant="body1" fontWeight={500} color="#1976d2">
                  {selectedApproval.totalArea.toFixed(2)} hectares
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Location Information Card */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 2,
            borderColor: '#e0e0e0'
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Location Details
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ p: 2.5 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Zone
                </Typography>
                <Chip
                  label={selectedApproval.zoneName}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Taluk
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedApproval.talukName}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  District
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedApproval.districtName}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Remarks Card */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 2,
            borderColor: '#e0e0e0'
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Investigator Remarks
            </Typography>
            Investigator Name : <strong>{selectedApproval.requestedByName || 'N/A'}</strong>
          </Box>
          <Box sx={{ p: 2.5 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: selectedApproval.reqRemarks ? '#fff8e1' : '#f5f5f5',
                borderRadius: 1,
                minHeight: 60
              }}
            >
              <Typography variant="body2">
                {selectedApproval.reqRemarks || 'No remarks provided by investigator'}
              </Typography>
            </Paper>
          </Box>
        </Card>

        {/* Timeline Information */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: '#e0e0e0'
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Timeline
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ p: 2.5 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Requested On
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(selectedApproval.requestedAt)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(selectedApproval.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {selectedApproval.approved && (
              <>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Approved On
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="success" />
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(selectedApproval.approvedAt)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(selectedApproval.approvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Approved By
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedApproval.approvedByName || 'System'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {selectedApproval.resRemarks && (
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Approver Remarks
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: '#e8f5e9',
                          borderRadius: 1,
                          borderColor: '#c8e6c9'
                        }}
                      >
                        <Typography variant="body2">
                          {selectedApproval.resRemarks}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </Card>
      </Box>
    )}
  </DialogContent>

  <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
    <Button
      onClick={() => setViewDialog(false)}
      variant="outlined"
      startIcon={<Clear />}
    >
      Close
    </Button>
    {!selectedApproval?.approved && role?.includes('Approver') && (
      <Button
        variant="contained"
        color="primary"
        startIcon={<CheckCircle />}
        onClick={() => {
          setViewDialog(false);
          handleApprove(selectedApproval);
        }}
      >
        Approve Cluster
      </Button>
    )}
  </DialogActions>
</Dialog>

   {/* Approve Confirmation Dialog */}
<Dialog 
  open={approveDialog} 
  onClose={() => {
    setApproveDialog(false);
    setIsEditEnabled(false);
  }}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      maxWidth: '500px',
      width: '100%'
    }
  }}
>
  <DialogTitle sx={{
    bgcolor: '#05307a',
    color: 'white',
    py: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Approve Cluster
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
        ID: {selectedApproval?.approvalId}
      </Typography>
    </Box>
    <IconButton
      onClick={() => {
        setApproveDialog(false);
        setIsEditEnabled(false);
      }}
      sx={{ color: 'white' }}
      size="small"
    >
      <Clear fontSize="small" />
    </IconButton>
  </DialogTitle>
  
  <DialogContent dividers sx={{ p: 3 }}>
    <Alert 
      severity="info" 
      icon={<Info fontSize="small" />}
      sx={{ mb: 3, borderRadius: 2 }}
    >
      You are about to approve this cluster. This action cannot be undone.
    </Alert>
    
    {selectedApproval && (
      <>
        {/* Cluster Details Card */}
        <Card 
          variant="outlined" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            borderColor: '#e0e0e0'
          }}
        >
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#f8fafc'
          }}>
            <Typography variant="subtitle1" fontWeight={600} color="#05307a">
              Cluster Details
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ p: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Cluster #
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedApproval.clusterNo}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Type
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedApproval.clusterType}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Zone
              </Typography>
              <Typography variant="body1">{selectedApproval.zoneName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Taluk
              </Typography>
              <Typography variant="body1">{selectedApproval.talukName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Area
              </Typography>
              <Typography variant="body1" fontWeight={500} color="#1976d2">
                {selectedApproval.totalArea.toFixed(2)} cents
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                District
              </Typography>
              <Typography variant="body1">{selectedApproval.districtName}</Typography>
            </Grid>
             <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Zone Name
              </Typography>
              <Typography variant="body1">{selectedApproval.zoneName}</Typography>
            </Grid>
             <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">
                Requested By
              </Typography>
              <Typography variant="body1">{selectedApproval.requestedByName}</Typography>
            </Grid>
            <Grid item xs={12} sx={{borderTop: '1px solid #e0e0e0', pt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Remarks by Investigator
              </Typography>
              <Typography variant="body1">{selectedApproval.reqRemarks || 'No remarks provided by investigator'}</Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Edit Toggle Card - Fixed Width */}
        <Card 
          variant="outlined" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            borderColor: isEditEnabled ? '#ffb74d' : '#e0e0e0',
            bgcolor: isEditEnabled ? '#fff8e1' : '#fafafa',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditEnabled ? (
                  <PlayCircleOutline sx={{ color: '#ff9800' }} />
                ) : (
                  <CheckCircle sx={{ color: '#4caf50' }} />
                )}
                <Typography variant="subtitle1" fontWeight={600}>
                  Cluster Edit Mode
                </Typography>
              </Box>
              <Switch
                checked={isEditEnabled}
                onChange={(e) => setIsEditEnabled(e.target.checked)}
                color={isEditEnabled ? "warning" : "default"}
                size="medium"
              />
            </Box>
            
            {/* Status Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              bgcolor: isEditEnabled ? '#fff3cd' : '#e8f5e9',
              border: `1px solid ${isEditEnabled ? '#ffeaa7' : '#c8e6c9'}`
            }}>
              {isEditEnabled ? (
                <>
                  <Chip
                    icon={<PlayCircleFilled sx={{ fontSize: 16 }} />}
                    label="Ongoing"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography variant="body2" color="#e65100">
                    Cluster will remain editable after approval
                  </Typography>
                </>
              ) : (
                <>
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    label="Completed"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography variant="body2" color="#2e7d32">
                    Cluster will be marked as completed
                  </Typography>
                </>
              )}
            </Box>
            
            {/* Caution Alert */}
            <Alert 
              severity="warning" 
              icon={<Warning sx={{ fontSize: 18 }} />}
              sx={{ 
                borderRadius: 1,
                fontSize: '0.8rem',
                '& .MuiAlert-icon': { alignItems: 'center' }
              }}
            >
              <Typography variant="caption" fontWeight={500}>
                <strong>Important:</strong> When "Edit Mode" is ON, cluster status will be "Ongoing" 
                allowing further modifications. When OFF, status will be "Completed" and no further 
                edits will be allowed.
              </Typography>
            </Alert>
          </Box>
        </Card>

        {/* Remarks Section */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Approver Remarks (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add any remarks, notes, or observations for this approval..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
        </Box>
      </>
    )}
  </DialogContent>
  
  <DialogActions sx={{ 
    p: 2.5, 
    bgcolor: '#f8f9fa', 
    borderTop: '1px solid #e0e0e0',
    justifyContent: 'space-between'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isEditEnabled ? (
        <Chip
          icon={<PlayCircleFilled sx={{ fontSize: 16 }} />}
          label="Edit Mode: ON"
          color="warning"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ) : (
        <Chip
          icon={<CheckCircle sx={{ fontSize: 16 }} />}
          label="Edit Mode: OFF"
          color="success"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      )}
    </Box>
    
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        onClick={() => {
          setApproveDialog(false);
          setIsEditEnabled(false);
        }}
        variant="outlined"
        size="medium"
        startIcon={<Clear />}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={() => handleSubmitAction(true)}
        size="medium"
        startIcon={<CheckCircle />}
        sx={{ 
          minWidth: 140,
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)'
          }
        }}
      >
        Approve Cluster
      </Button>
    </Box>
  </DialogActions>
</Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog 
        open={rejectDialog} 
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle>Reject Cluster</DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are about to reject this cluster. Please provide a reason.
          </Alert>
          {selectedApproval && (
            <>
              <Typography variant="body2" paragraph>
                <strong>Cluster Details:</strong>
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">Cluster #:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedApproval.clusterNo} ({selectedApproval.clusterType})
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Zone:</Typography>
                  <Typography variant="body1">{selectedApproval.zoneName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Taluk:</Typography>
                  <Typography variant="body1">{selectedApproval.talukName}</Typography>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Reason *"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Please provide the reason for rejection..."
                variant="outlined"
                size="small"
                required
                error={!remarks.trim()}
                helperText={!remarks.trim() ? "Please provide a reason for rejection" : ""}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => handleSubmitAction(false)}
            disabled={!remarks.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
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

export default ClusterApprovals;