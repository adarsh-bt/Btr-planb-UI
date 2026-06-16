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
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import { useTheme } from '@mui/material/styles';
import api from 'api/api';

function WorkallocationsApprovals() {
  const theme = useTheme();
  const navigate = useNavigate();
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

  
  
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(25);

const [totalElements, setTotalElements] = useState(0);
const [totalPages, setTotalPages] = useState(0);
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

      const response = await api.get(
        `${BASE_URL}/user-access/zones/zone_work_allocation_approvals`,
        {
          params: {
            page,
            size: rowsPerPage
          }
        }
      );

      const result = response.data;

      console.log('API Response:', result);

      setApprovals(result.content || []);
      setTotalElements(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);

      setError(null);

    } catch (err) {
      console.error('API Error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  fetchClusterApprovals();
}, [page, rowsPerPage]);
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
  .sort(getComparator(order, orderBy));

  // Handle view details
  const handleViewDetails = (row) => {

    navigate(
  `/approval_manage/work_allocation_approvals/workallocation/${row.zoneId}/${row.approvalId}`
);
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
// Get status color and label dynamically based on backend status
  const getStatusInfo = (status) => {
    switch (status) {
      case 'APPROVED':
        return { label: "APPROVED", color: "success", icon: <CheckCircle /> };
      case 'RETURNED':
        return { label: "RETURNED", color: "error", icon: <Cancel /> };
      case 'UNDER REVIEW':
        return { label: "UNDER REVIEW", color: "info", icon: <PlayCircleFilled /> };
      case 'SUBMITTED':
      case 'PENDING':
      default:
        return { label: "SUBMITTED", color: "warning", icon: <PendingActions /> };
    }
  };

  // Calculate total area
  // const totalArea = filteredApprovals.reduce((sum, row) => sum + parseFloat(row.totalArea || 0), 0).toFixed(2);

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
                Loading WorkAllocations Approvals...
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
          Work Allocations Approval Requests 
        </Typography>
        
        <Card sx={{ p: 1, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            {/* <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #05307a, #1976d2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Cluster Approval Requests
              </Typography> */}
              {/* <Typography variant="body1" color="text.secondary">
                Total {filteredApprovals.length} cluster approvals • Total area: {totalArea} hectares
              </Typography> */}
            {/* </Box> */}
            
            {/* Summary Chips */}
            {/* <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
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
            </Stack> */}
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
                  onClick={() => {
  setPage(0);
}}
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
                Showing {approvals.length} of {totalElements} WorkAllocations approvals
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
                No WorkAllocations approvals found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {searchQuery || selectedTaluk || selectedZone || statusFilter !== 'all'
                  ? "Try adjusting your search or filters"
                  : "There are no WorkAllocations approvals available."}
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
                      
                        { key: 'zoneName', label: 'Zone' },
                        { key: 'talukName', label: 'Taluk' },
                        { key: 'districtName', label: 'District' },
                        { key: 'requestedByName', label: 'Requested By' },
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
                    const statusInfo = getStatusInfo(approval.status); // ✅ Pass the text status string
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
                          
                          {/* <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {approval.clusterNo} ({approval.clusterType})
                            </Typography>
                          </TableCell> */}
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
                              {approval.requestedByName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(approval.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(approval.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              color={statusInfo.color}
                              size="small"
                              variant={approval.status ? "filled" : "outlined"}
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
                count={totalElements}
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
          {/* {filteredApprovals.length > 0 && (
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
          )} */}
        </Card>
      </Grid>


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

export default WorkallocationsApprovals;