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

const BASE_URL = mainapi.BASE_URL;

const DistrictSettings = () => {
  const [districts, setDistricts] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [showInactive, setShowInactive] = useState(false);
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
  // REMOVED: if (!showInactive) filtered = filtered.filter((dist) => dist._active === true);
  setFilteredDistricts(filtered);
}, [searchTerm, districts]); // remove showInactive from dependencies

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

      console.log("Saving payload:", payload);

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/saveDistrict`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

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

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      let result = null;
      
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text && text.trim()) {
          result = JSON.parse(text);
        }
      }

      setSuccessMessage(result?.message || "District updated successfully!");
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          Please check your permissions or contact your administrator.
        </Typography>
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, color: '#05307a' }}>
          District Management
        </Typography>

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
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
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
                {filteredDistricts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No districts found</TableCell>
                  </TableRow>
                ) : (
                  filteredDistricts.map((district) => (
                    <TableRow key={district.dist_id} sx={{ backgroundColor: !district._active ? '#fafafa' : 'inherit' }}>
                      <TableCell>{district.dist_id}</TableCell>
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
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Showing {filteredDistricts.length} of {districts.length} districts
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
          <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white', pb: 2 }}>
            <Typography variant="h6" component="div">
              Add New District
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the district details below
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
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
                        color="success"
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
              color="success"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
              size="large"
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
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedDistrict?.dist_id} | Current: {selectedDistrict?.dist_name_en}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
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
                        color="success"
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
              color="primary" 
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
              size="large"
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
      </Box>
    </Grid>
  );
};

export default DistrictSettings;