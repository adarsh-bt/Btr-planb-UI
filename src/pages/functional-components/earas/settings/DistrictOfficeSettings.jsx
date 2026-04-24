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

const BASE_URL = mainapi.BASE_URL;

const DistrictOfficeSettings = () => {
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
  // Replace the existing fetchDistricts function with this:
const fetchDistricts = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ New API endpoint
    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/districts`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Map the response to the structure expected by your state
      const mappedDistricts = data.map(district => ({
        dist_id: district.districtId,
        dist_name_en: district.districtNameEn,
        dist_name_mal: district.districtNameMal,
        // _active: true // Add if needed later
      }));
      setDistricts(mappedDistricts);
    } else {
      console.error("Failed to fetch districts:", response.status);
    }
  } catch (err) {
    console.error("Error fetching districts:", err);
  }
}, []);

  // Fetch district offices
  const fetchDistrictOffices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        toast.error("Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/getAllDistrictOffice`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view district offices.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch district offices: ${response.status}`);
      }

      const data = await response.json();
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
  return office.districtName || 'Unknown';
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
        office.districtName?.toLowerCase().includes(term)
    );
  }
  // REMOVED: if (!showInactive) filtered = filtered.filter((office) => office.active === true);
  setFilteredOffices(filtered);
}, [searchTerm, districtOffices]); // showInactive removed from dependencies

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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        id: editedData.id,
        nameEn: editedData.nameEn,
        distId: editedData.distId,
        userId: userId,
        active: editedData.active,
      };

      console.log("Saving payload:", payload);

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/saveDistrictOffice`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to update district offices.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        nameEn: newOfficeData.nameEn,
        distId: newOfficeData.distId,
        userId: userId,
        active: newOfficeData.active,
      };

      console.log("Adding new district office payload:", payload);

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/saveDistrictOffice`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to add district offices.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

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
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        id: office.id,
        nameEn: office.nameEn,
        distId: office.distId,
        userId: userId,
        active: !office.active,
      };

      const response = await fetch(`${BASE_URL}/user-access/api/it-admin/saveDistrictOffice`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to change district office status.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
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
          District Office Management
        </Typography>

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
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Office Name</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                  {/* <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Added By</TableCell> */}
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
                      <TableCell>
  {getDistrictDisplay(office.distId)}
</TableCell>
                      {/* <TableCell>
                        {office.addedBy ? (
                          <Chip label={office.addedBy.substring(0, 8) + "..."} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="textSecondary">System</Typography>
                        )}
                      </TableCell> */}
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
          <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white', pb: 2 }}>
            <Typography variant="h6" component="div">
              Add New District Office
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the district office details below
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
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
                        color="success"
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
              color="success"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
              size="large"
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
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedOffice?.id} | Current: {selectedOffice?.nameEn}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
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
                <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editedData.active || false}
                        onChange={(e) => handleEditChange('active', e.target.checked)}
                        color="success"
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

export default DistrictOfficeSettings;