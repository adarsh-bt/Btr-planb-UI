import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  TablePagination,
} from "@mui/material";
import {
  Save,
  Refresh,
  Edit as EditIcon,
  CheckCircle,
  Cancel,
  Error as ErrorIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import mainapi from "api/mainapi";
import authservice from "pages/authentication/services/authservice";
import SettingService from "./SettingService";
import Breadcrumb from "routes/Breadcrumb";

const BASE_URL = mainapi.BASE_URL;




// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`district-tabpanel-${index}`}
      aria-labelledby={`district-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DistrictSettings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
        <Breadcrumb/>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {/* <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2, color: '#05307a' }}>
          District Management
        </Typography> */}
        
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                py: 2,
              },
              '& .Mui-selected': {
                color: '#05307a',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#05307a',
                height: 3,
              },
            }}
          >
            <Tab label="District Management" />
            <Tab label="District Office Management" />
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <DistrictManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <DistrictOfficeManagementTab />
        </TabPanel>
      </Box>
    </Grid>
  );
};

// ==================== District Management Tab ====================
const DistrictManagementTab = () => {
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newDistrictData, setNewDistrictData] = useState({
    dist_name_en: "",
    dist_name_mal: "",
    dist_lsg_code: "",
    dist_code: "",
    census_code_2011: "",
    census_code_2001: "",
    des_dist_code: "",
    is_active: true,
  });
  const [editErrors, setEditErrors] = useState({});
  const [addErrors, setAddErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

const handleChangePage = (event, newPage) => setPage(newPage);
const handleChangeRowsPerPage = (event) => {
  setRowsPerPage(parseInt(event.target.value, 10));
  setPage(0);
};
const paginatedDistricts = filteredDistricts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  // Auto-close modals
  useEffect(() => {
    let timeoutId;
    if (showSuccessModal) {
      timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) {
      timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch districts
  const fetchDistricts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchDistricts();
      setDistricts(data);
      setFilteredDistricts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // Filter districts
  useEffect(() => {
    let filtered = [...districts];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dist) =>
          dist.dist_name_en?.toLowerCase().includes(term) ||
          dist.dist_code?.toLowerCase().includes(term)
      );
    }
    setFilteredDistricts(filtered);
  }, [searchTerm, districts]);

  const handleEditClick = (district) => {
    setSelectedDistrict(district);
    setEditedData({
      dist_id: district.dist_id,
      dist_name_en: district.dist_name_en,
      dist_name_mal: district.dist_name_mal,
      dist_lsg_code: district.dist_lsg_code,
      dist_code: district.dist_code,
      census_code_2011: district.census_code_2011,
      census_code_2001: district.census_code_2001,
      des_dist_code: district.des_dist_code,
      is_active: district._active,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewDistrictData({
      dist_name_en: "",
      dist_name_mal: "",
      dist_lsg_code: "",
      dist_code: "",
      census_code_2011: "",
      census_code_2001: "",
      des_dist_code: "",
      is_active: true,
    });
    setAddErrors({});
    setAddModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddChange = (field, value) => {
    setNewDistrictData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateEdit = (data) => {
    const errors = {};
    if (!data.dist_name_en?.trim()) errors.dist_name_en = "District name is required";
    if (!data.dist_name_mal?.trim()) errors.dist_name_mal = "Malayalam name is required";
    if (!data.dist_lsg_code || data.dist_lsg_code <= 0) errors.dist_lsg_code = "Valid LSG code required";
    if (!data.dist_code?.trim()) errors.dist_code = "District code required";
    if (!data.census_code_2011?.trim()) errors.census_code_2011 = "Census code 2011 required";
    if (!data.census_code_2001?.trim()) errors.census_code_2001 = "Census code 2001 required";
    if (!data.des_dist_code || data.des_dist_code <= 0) errors.des_dist_code = "Valid DES code required";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdd = (data) => {
    const errors = {};
    if (!data.dist_name_en?.trim()) errors.dist_name_en = "District name is required";
    if (!data.dist_name_mal?.trim()) errors.dist_name_mal = "Malayalam name is required";
    if (!data.dist_lsg_code || data.dist_lsg_code <= 0) errors.dist_lsg_code = "Valid LSG code required";
    if (!data.dist_code?.trim()) errors.dist_code = "District code required";
    if (!data.census_code_2011?.trim()) errors.census_code_2011 = "Census code 2011 required";
    if (!data.census_code_2001?.trim()) errors.census_code_2001 = "Census code 2001 required";
    if (!data.des_dist_code || data.des_dist_code <= 0) errors.des_dist_code = "Valid DES code required";
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit(editedData)) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        dist_id: editedData.dist_id,
        dist_name_en: editedData.dist_name_en,
        dist_name_mal: editedData.dist_name_mal,
        is_active: editedData.is_active,
        dist_lsg_code: Number(editedData.dist_lsg_code),
        dist_code: editedData.dist_code,
        census_code_2011: editedData.census_code_2011,
        census_code_2001: editedData.census_code_2001,
        des_dist_code: Number(editedData.des_dist_code),
        addedBy: userId,
      };

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/saveDistrict`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to update districts.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("District updated successfully!");
      setShowSuccessModal(true);
      toast.success("District updated successfully!");
      await fetchDistricts();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to edit districts. Please contact administrator.";
      } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewDistrict = async () => {
    if (!validateAdd(newDistrictData)) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const result = await SettingService.saveDistrict(newDistrictData);
      setSuccessMessage(result?.message || "District added successfully!");
      setShowSuccessModal(true);
      toast.success("District added successfully!");
      await fetchDistricts();
      setAddModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to add districts. Please contact administrator.";
      } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
      } else if (err.message.includes("duplicate") || err.message.includes("already exists")) {
        errorMsg = "A district with this code or name already exists.";
      }
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (district) => {
    setIsSaving(true);
    try {
      await SettingService.toggleDistrictActive(district);
      const action = !district._active ? "activated" : "deactivated";
      setSuccessMessage(`District "${district.dist_name_en}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`District ${action}!`);
      await fetchDistricts();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to change district status. Please contact administrator.";
      }
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Districts...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchDistricts}>
            Retry
          </Button>
        }
      >
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search District"
          size="small"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDistricts}>
          Refresh
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          sx={{ ml: 'auto' }}
        >
          Add New District
        </Button>
      </Paper>

      {/* Table */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District Name (EN)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District Name (ML)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Dist Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2011</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2001</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>DES Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {paginatedDistricts.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={10} align="center">No districts found</TableCell>
                    </TableRow>
                ) : (
                    paginatedDistricts.map((district, index) => (
                    <TableRow key={district.dist_id} sx={{ backgroundColor: !district._active ? '#fafafa' : 'inherit' }}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{district.dist_name_en}</TableCell>
                        <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                        {district.dist_name_mal}
                        </TableCell>
                        <TableCell align="center">{district.dist_lsg_code}</TableCell>
                        <TableCell align="center"><Chip label={district.dist_code} size="small" /></TableCell>
                        <TableCell align="center">{district.census_code_2011}</TableCell>
                        <TableCell align="center">{district.census_code_2001}</TableCell>
                        <TableCell align="center">{district.des_dist_code}</TableCell>
                        <TableCell align="center">{getStatusChip(district._active)}</TableCell>
                        <TableCell align="center">
                        <Tooltip title="Edit District">
                            <IconButton color="primary" onClick={() => handleEditClick(district)} size="small">
                            <EditIcon />
                            </IconButton>
                        </Tooltip>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
  rowsPerPageOptions={[5, 10, 25, 50, 100]}
  component="div"
  count={filteredDistricts.length}
  rowsPerPage={rowsPerPage}
  page={page}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
  labelRowsPerPage="Rows per page:"
  labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
/>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
            Showing {paginatedDistricts.length} of {filteredDistricts.length} districts {searchTerm && "(filtered)"}
        </Typography>
        </Box>

      {/* Add New District Modal */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 'auto',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Add New District
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the district details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Name (English)"
                fullWidth
                required
                value={newDistrictData.dist_name_en}
                onChange={(e) => handleAddChange('dist_name_en', e.target.value)}
                error={!!addErrors.dist_name_en}
                helperText={addErrors.dist_name_en}
                size="medium"
                variant="outlined"
                placeholder="e.g., Thiruvananthapuram"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Name (Malayalam)"
                fullWidth
                required
                value={newDistrictData.dist_name_mal}
                onChange={(e) => handleAddChange('dist_name_mal', e.target.value)}
                error={!!addErrors.dist_name_mal}
                helperText={addErrors.dist_name_mal}
                size="medium"
                variant="outlined"
                InputProps={{
                  style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                }}
                placeholder="e.g., തിരുവനന്തപുരം"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LSG Code"
                type="number"
                fullWidth
                required
                value={newDistrictData.dist_lsg_code}
                onChange={(e) => handleAddChange('dist_lsg_code', e.target.value)}
                error={!!addErrors.dist_lsg_code}
                helperText={addErrors.dist_lsg_code}
                size="medium"
                variant="outlined"
                placeholder="e.g., 1001"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Code"
                fullWidth
                required
                value={newDistrictData.dist_code}
                onChange={(e) => handleAddChange('dist_code', e.target.value)}
                error={!!addErrors.dist_code}
                helperText={addErrors.dist_code}
                size="medium"
                variant="outlined"
                placeholder="e.g., TVM"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2011"
                fullWidth
                required
                value={newDistrictData.census_code_2011}
                onChange={(e) => handleAddChange('census_code_2011', e.target.value)}
                error={!!addErrors.census_code_2011}
                helperText={addErrors.census_code_2011}
                size="medium"
                variant="outlined"
                placeholder="e.g., 321"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2001"
                fullWidth
                required
                value={newDistrictData.census_code_2001}
                onChange={(e) => handleAddChange('census_code_2001', e.target.value)}
                error={!!addErrors.census_code_2001}
                helperText={addErrors.census_code_2001}
                size="medium"
                variant="outlined"
                placeholder="e.g., 221"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="DES District Code"
                type="number"
                fullWidth
                required
                value={newDistrictData.des_dist_code}
                onChange={(e) => handleAddChange('des_dist_code', e.target.value)}
                error={!!addErrors.des_dist_code}
                helperText={addErrors.des_dist_code}
                size="medium"
                variant="outlined"
                placeholder="e.g., 101"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                        checked={newDistrictData.is_active}
                        onChange={(e) => handleAddChange('is_active', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#05307a',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#05307a',
                            },
                        }}
                        />
                  }
                  label={newDistrictData.is_active ? "Active" : "Inactive"}
                  sx={{ ml: 0 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setAddModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            disabled={isSaving}
            size="large"
          >
            Cancel
          </Button>
          <Button 
                onClick={handleSaveNewDistrict} 
                variant="contained" 
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                size="large"
                sx={{
                    backgroundColor: '#05307a',
                    '&:hover': {
                    backgroundColor: '#042560',
                    },
                    '&:active': {
                    backgroundColor: '#031840',
                    },
                    '&:disabled': {
                    backgroundColor: '#8ba0c2',
                    }
                }}
                >
                {isSaving ? "Adding..." : "Add District"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 'auto',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Edit District
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Name (English)"
                fullWidth
                required
                value={editedData.dist_name_en || ''}
                onChange={(e) => handleEditChange('dist_name_en', e.target.value)}
                error={!!editErrors.dist_name_en}
                helperText={editErrors.dist_name_en}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Name (Malayalam)"
                fullWidth
                required
                value={editedData.dist_name_mal || ''}
                onChange={(e) => handleEditChange('dist_name_mal', e.target.value)}
                error={!!editErrors.dist_name_mal}
                helperText={editErrors.dist_name_mal}
                size="medium"
                variant="outlined"
                InputProps={{
                  style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LSG Code"
                type="number"
                fullWidth
                required
                value={editedData.dist_lsg_code || ''}
                onChange={(e) => handleEditChange('dist_lsg_code', e.target.value)}
                error={!!editErrors.dist_lsg_code}
                helperText={editErrors.dist_lsg_code}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="District Code"
                fullWidth
                required
                value={editedData.dist_code || ''}
                onChange={(e) => handleEditChange('dist_code', e.target.value)}
                error={!!editErrors.dist_code}
                helperText={editErrors.dist_code}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2011"
                fullWidth
                required
                value={editedData.census_code_2011 || ''}
                onChange={(e) => handleEditChange('census_code_2011', e.target.value)}
                error={!!editErrors.census_code_2011}
                helperText={editErrors.census_code_2011}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2001"
                fullWidth
                required
                value={editedData.census_code_2001 || ''}
                onChange={(e) => handleEditChange('census_code_2001', e.target.value)}
                error={!!editErrors.census_code_2001}
                helperText={editErrors.census_code_2001}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="DES District Code"
                type="number"
                fullWidth
                required
                value={editedData.des_dist_code || ''}
                onChange={(e) => handleEditChange('des_dist_code', e.target.value)}
                error={!!editErrors.des_dist_code}
                helperText={editErrors.des_dist_code}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                        checked={editedData.is_active || false}
                        onChange={(e) => handleEditChange('is_active', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#05307a',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#05307a',
                            },
                        }}
                        />
                    }
                    label={editedData.is_active ? "Active" : "Inactive"}
                    sx={{ ml: 0 }}
                    />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setEditModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            disabled={isSaving}
            size="large"
          >
            Cancel
          </Button>
          <Button 
                onClick={handleSaveEdit} 
                variant="contained" 
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                size="large"
                sx={{
                    backgroundColor: '#05307a',
                    '&:hover': {
                    backgroundColor: '#042560',
                    },
                    '&:active': {
                    backgroundColor: '#031840',
                    },
                    '&:disabled': {
                    backgroundColor: '#8ba0c2',
                    }
                }}
                >
                {isSaving ? "Saving..." : "Save Changes"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog 
        open={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>
            {successMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog 
        open={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>
            {errorMessage || "Something went wrong. Please try again."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ==================== District Office Management Tab ====================
const DistrictOfficeManagementTab = () => {
  const [districtOffices, setDistrictOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newOfficeData, setNewOfficeData] = useState({
    nameEn: "",
    distId: "",
    active: true,
  });
  const [editErrors, setEditErrors] = useState({});
  const [addErrors, setAddErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-close modals
  useEffect(() => {
    let timeoutId;
    if (showSuccessModal) {
      timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) {
      timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    }
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch districts for dropdown
  const fetchDistricts = useCallback(async () => {
  try {
    const mappedDistricts = await SettingService.fetchDistrictsForDropdown();
    setDistricts(mappedDistricts);
  } catch (err) {
    console.error("Error fetching districts:", err);
    toast.error(err.message);
  }
}, []);

  // Fetch district offices
  const fetchDistrictOffices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
        const data = await SettingService.fetchDistrictOffices();
        setDistrictOffices(data);
        setFilteredOffices(data);
    } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
    }, []);

  const getDistrictDisplay = (distId) => {
    const district = districts.find(d => d.dist_id === distId);
    if (district) {
      return `${district.dist_name_en} / ${district.dist_name_mal}`;
    }
    return 'Unknown';
  };

  useEffect(() => {
    fetchDistricts();
    fetchDistrictOffices();
  }, [fetchDistricts, fetchDistrictOffices]);

  // Filter district offices
  useEffect(() => {
    let filtered = [...districtOffices];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (office) =>
          office.nameEn?.toLowerCase().includes(term) ||
          (office.districtName?.toLowerCase().includes(term)) ||
          getDistrictDisplay(office.distId)?.toLowerCase().includes(term)
      );
    }
    setFilteredOffices(filtered);
  }, [searchTerm, districtOffices, districts]);

  const handleEditClick = (office) => {
    setSelectedOffice(office);
    setEditedData({
      id: office.id,
      nameEn: office.nameEn,
      distId: office.distId,
      active: office.active,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewOfficeData({
      nameEn: "",
      distId: "",
      active: true,
    });
    setAddErrors({});
    setAddModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddChange = (field, value) => {
    setNewOfficeData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateEdit = (data) => {
    const errors = {};
    if (!data.nameEn?.trim()) errors.nameEn = "District office name is required";
    if (!data.distId) errors.distId = "Please select a district";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdd = (data) => {
    const errors = {};
    if (!data.nameEn?.trim()) errors.nameEn = "District office name is required";
    if (!data.distId) errors.distId = "Please select a district";
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit(editedData)) {
        toast.error("Please fix validation errors");
        return;
    }

    setIsSaving(true);
    try {
        const result = await SettingService.saveDistrictOffice(editedData);
        setSuccessMessage("District office updated successfully!");
        setShowSuccessModal(true);
        toast.success("District office updated successfully!");
        await fetchDistrictOffices();
        setEditModalOpen(false);
    } catch (err) {
        console.error("Save error:", err);
        let errorMsg = err.message;
        
        if (err.message.includes("403")) {
        errorMsg = "You don't have permission to edit district offices. Please contact administrator.";
        } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
        }
        
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        toast.error(errorMsg);
    } finally {
        setIsSaving(false);
    }
    };

  const handleSaveNewOffice = async () => {
    if (!validateAdd(newOfficeData)) {
        toast.error("Please fix validation errors");
        return;
    }

    setIsSaving(true);
    try {
        const result = await SettingService.saveDistrictOffice(newOfficeData);
        setSuccessMessage("District office added successfully!");
        setShowSuccessModal(true);
        toast.success("District office added successfully!");
        await fetchDistrictOffices();
        setAddModalOpen(false);
    } catch (err) {
        console.error("Save error:", err);
        let errorMsg = err.message;
        
        if (err.message.includes("403")) {
        errorMsg = "You don't have permission to add district offices. Please contact administrator.";
        } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
        } else if (err.message.includes("duplicate") || err.message.includes("already exists")) {
        errorMsg = "A district office with this name already exists.";
        }
        
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        toast.error(errorMsg);
    } finally {
        setIsSaving(false);
    }
    };

  const handleToggleActive = async (office) => {
    setIsSaving(true);
    try {
        await SettingService.toggleDistrictOfficeActive(office);
        const action = !office.active ? "activated" : "deactivated";
        setSuccessMessage(`District office "${office.nameEn}" ${action} successfully!`);
        setShowSuccessModal(true);
        toast.success(`District office ${action}!`);
        await fetchDistrictOffices();
    } catch (err) {
        console.error("Toggle error:", err);
        let errorMsg = err.message;
        
        if (err.message.includes("403")) {
        errorMsg = "You don't have permission to change district office status. Please contact administrator.";
        }
        
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        toast.error(errorMsg);
    } finally {
        setIsSaving(false);
    }
    };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading District Offices...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchDistrictOffices}>
            Retry
          </Button>
        }
      >
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search District Office"
          size="small"
          placeholder="Search by name or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchDistrictOffices}>
          Refresh
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          sx={{ ml: 'auto' }}
        >
          Add New District Office
        </Button>
      </Paper>

      {/* Table */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Office Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No district offices found</TableCell>
                </TableRow>
              ) : (
                filteredOffices.map((office) => (
                  <TableRow key={office.id} sx={{ backgroundColor: !office.active ? '#fafafa' : 'inherit' }}>
                    <TableCell>{office.id}</TableCell>
                    <TableCell>{office.nameEn}</TableCell>
                    <TableCell>{getDistrictDisplay(office.distId)}</TableCell>
                    <TableCell align="center">{getStatusChip(office.active)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit District Office">
                        <IconButton color="primary" onClick={() => handleEditClick(office)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Showing {filteredOffices.length} of {districtOffices.length} district offices
        </Typography>
      </Box>

      {/* Add New District Office Modal */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 'auto',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Add New District Office
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the district office details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="District Office Name"
                fullWidth
                required
                value={newOfficeData.nameEn}
                onChange={(e) => handleAddChange('nameEn', e.target.value)}
                error={!!addErrors.nameEn}
                helperText={addErrors.nameEn}
                size="medium"
                variant="outlined"
                placeholder="e.g., District Office Ernakulam"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!addErrors.distId}>
                <InputLabel>Select District</InputLabel>
                <Select
                  value={newOfficeData.distId}
                  label="Select District"
                  onChange={(e) => handleAddChange('distId', e.target.value)}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.dist_id} value={district.dist_id}>
                      {district.dist_name_en} / {district.dist_name_mal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.distId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {addErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                        checked={newOfficeData.active}
                        onChange={(e) => handleAddChange('active', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#05307a',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#05307a',
                            },
                        }}
                        />
                    }
                    label={newOfficeData.active ? "Active" : "Inactive"}
                    sx={{ ml: 0 }}
                    />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setAddModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            disabled={isSaving}
            size="large"
          >
            Cancel
          </Button>
          <Button 
                onClick={handleSaveNewOffice} 
                variant="contained" 
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                size="large"
                sx={{
                    backgroundColor: '#05307a',
                    '&:hover': {
                    backgroundColor: '#042560',
                    },
                    '&:active': {
                    backgroundColor: '#031840',
                    },
                    '&:disabled': {
                    backgroundColor: '#8ba0c2',
                    }
                }}
                >
                {isSaving ? "Adding..." : "Add District Office"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minHeight: 'auto',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Edit District Office
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!editErrors.distId}>
                <InputLabel>Select District</InputLabel>
                <Select
                  value={editedData.distId || ''}
                  label="Select District"
                  onChange={(e) => handleEditChange('distId', e.target.value)}
                >
                  {districts.map((district) => (
                    <MenuItem key={district.dist_id} value={district.dist_id}>
                      {district.dist_name_en} / {district.dist_name_mal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.distId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {editErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="District Office Name"
                fullWidth
                required
                value={editedData.nameEn || ''}
                onChange={(e) => handleEditChange('nameEn', e.target.value)}
                error={!!editErrors.nameEn}
                helperText={editErrors.nameEn}
                size="medium"
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                        checked={editedData.active || false}
                        onChange={(e) => handleEditChange('active', e.target.checked)}
                        sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#05307a',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#05307a',
                            },
                        }}
                        />
                  }
                  label={editedData.active ? "Active" : "Inactive"}
                  sx={{ ml: 0 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button 
            onClick={() => setEditModalOpen(false)} 
            variant="outlined" 
            color="secondary"
            disabled={isSaving}
            size="large"
          >
            Cancel
          </Button>
          <Button 
                onClick={handleSaveEdit} 
                variant="contained"
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                size="large"
                sx={{
                    backgroundColor: '#05307a',
                    '&:hover': {
                    backgroundColor: '#04265f', // slightly darker for hover
                    },
                }}
                >
                {isSaving ? "Saving..." : "Save Changes"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog 
        open={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>
            {successMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog 
        open={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>
            {errorMessage || "Something went wrong. Please try again."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DistrictSettings;