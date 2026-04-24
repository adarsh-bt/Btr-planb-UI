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

const TalukSettings = () => {
  const [taluks, setTaluks] = useState([]);
  const [filteredTaluks, setFilteredTaluks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newTalukData, setNewTalukData] = useState({
    desTalukNameEn: "",
    desTalukNameMal: "",
    distId: "",
    isActive: true,
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
    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ New API endpoint
    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/districts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Map response fields: districtId -> dist_id, districtNameEn -> dist_name_en, districtNameMal -> dist_name_mal
      const mappedDistricts = data.map(district => ({
        dist_id: district.districtId,
        dist_name_en: district.districtNameEn,
        dist_name_mal: district.districtNameMal,
      }));
      setDistricts(mappedDistricts);
    } else {
      console.error("Failed to fetch districts:", response.status);
    }
  } catch (err) {
    console.error("Error fetching districts:", err);
  }
}, []);

  // Fetch taluks
  const fetchTaluks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        toast.error("Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllTaluk`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view taluks.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch taluks: ${response.status}`);
      }

      const data = await response.json();
      setTaluks(data);
      setFilteredTaluks(data);
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
    fetchTaluks();
  }, [fetchDistricts, fetchTaluks]);

  // Filter taluks
  useEffect(() => {
  let filtered = [...taluks];
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (taluk) =>
        taluk.desTalukNameEn?.toLowerCase().includes(term) ||
        taluk.desTalukNameMal?.toLowerCase().includes(term)
    );
  }
  // REMOVED: if (!showInactive) filtered = filtered.filter((taluk) => taluk.active === true);
  setFilteredTaluks(filtered);
}, [searchTerm, taluks]); // showInactive removed from dependencies

  const handleEditClick = (taluk) => {
    setSelectedTaluk(taluk);
    setEditedData({
      desTalukId: taluk.desTalukId,
      desTalukNameEn: taluk.desTalukNameEn,
      desTalukNameMal: taluk.desTalukNameMal,
      distId: taluk.distId,
      isActive: taluk.active,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewTalukData({
      desTalukNameEn: "",
      desTalukNameMal: "",
      distId: "",
      isActive: true,
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
    setNewTalukData((prev) => ({ ...prev, [field]: value }));
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
    if (!data.desTalukNameEn?.trim()) errors.desTalukNameEn = "Taluk name (English) is required";
    if (!data.desTalukNameMal?.trim()) errors.desTalukNameMal = "Taluk name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdd = (data) => {
    const errors = {};
    if (!data.desTalukNameEn?.trim()) errors.desTalukNameEn = "Taluk name (English) is required";
    if (!data.desTalukNameMal?.trim()) errors.desTalukNameMal = "Taluk name (Malayalam) is required";
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
        desTalukId: editedData.desTalukId,
        desTalukNameEn: editedData.desTalukNameEn,
        desTalukNameMal: editedData.desTalukNameMal,
        distId: editedData.distId,
        isActive: editedData.isActive,
        userId: userId,
      };

      console.log("Saving payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdate`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to update taluks.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Taluk updated successfully!");
      setShowSuccessModal(true);
      toast.success("Taluk updated successfully!");
      await fetchTaluks();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to edit taluks. Please contact administrator.";
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

  const handleSaveNewTaluk = async () => {
    if (!validateAdd(newTalukData)) {
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
        desTalukNameEn: newTalukData.desTalukNameEn,
        desTalukNameMal: newTalukData.desTalukNameMal,
        distId: newTalukData.distId,
        isActive: newTalukData.isActive,
        userId: userId,
      };

      console.log("Adding new taluk payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdate`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to add taluks.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Taluk added successfully!");
      setShowSuccessModal(true);
      toast.success("Taluk added successfully!");
      await fetchTaluks();
      setAddModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to add taluks. Please contact administrator.";
      } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
      } else if (err.message.includes("duplicate") || err.message.includes("already exists")) {
        errorMsg = "A taluk with this name already exists.";
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (taluk) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        desTalukId: taluk.desTalukId,
        desTalukNameEn: taluk.desTalukNameEn,
        desTalukNameMal: taluk.desTalukNameMal,
        distId: taluk.distId,
        isActive: !taluk.active,
        userId: userId,
      };

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdate`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to change taluk status.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const action = !taluk.active ? "activated" : "deactivated";
      setSuccessMessage(`Taluk "${taluk.desTalukNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Taluk ${action}!`);
      await fetchTaluks();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to change taluk status. Please contact administrator.";
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

  const getDistrictName = (distId) => {
  const district = districts.find(d => d.dist_id === distId);
  if (district) {
    return `${district.dist_name_en} / ${district.dist_name_mal}`;
  }
  return "Unknown District";
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Taluks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchTaluks}>
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
          Taluk Management
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search Taluk"
            size="small"
            placeholder="Search by name (EN/ML)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTaluks}>
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            sx={{ ml: 'auto' }}
          >
            Add New Taluk
          </Button>
        </Paper>

        {/* Table */}
        <Paper elevation={3}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Name (EN)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Name (ML)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                  {/* <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Added By</TableCell> */}
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTaluks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No taluks found</TableCell>
                  </TableRow>
                ) : (
                  filteredTaluks.map((taluk) => (
                    <TableRow key={taluk.desTalukId} sx={{ backgroundColor: !taluk.active ? '#fafafa' : 'inherit' }}>
                      <TableCell>{taluk.desTalukId}</TableCell>
                      <TableCell>{taluk.desTalukNameEn}</TableCell>
                      <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                        {taluk.desTalukNameMal}
                      </TableCell>
                      <TableCell>{getDistrictName(taluk.distId)}</TableCell>
                      {/* <TableCell>
                        {taluk.addedBy ? (
                          <Chip label={taluk.addedBy.substring(0, 8) + "..."} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="textSecondary">System</Typography>
                        )}
                      </TableCell> */}
                      <TableCell align="center">{getStatusChip(taluk.active)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Taluk">
                            <IconButton color="primary" onClick={() => handleEditClick(taluk)} size="small">
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
            Showing {filteredTaluks.length} of {taluks.length} taluks
          </Typography>
        </Box>

        {/* Add New Taluk Modal */}
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
              Add New Taluk
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the taluk details below
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Name (English)"
                  fullWidth
                  required
                  value={newTalukData.desTalukNameEn}
                  onChange={(e) => handleAddChange('desTalukNameEn', e.target.value)}
                  error={!!addErrors.desTalukNameEn}
                  helperText={addErrors.desTalukNameEn}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., Thiruvananthapuram"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Name (Malayalam)"
                  fullWidth
                  required
                  value={newTalukData.desTalukNameMal}
                  onChange={(e) => handleAddChange('desTalukNameMal', e.target.value)}
                  error={!!addErrors.desTalukNameMal}
                  helperText={addErrors.desTalukNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                  placeholder="e.g., തിരുവനന്തപുരം"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!addErrors.distId}>
                  <InputLabel>Select District</InputLabel>
                  <Select
                    value={newTalukData.distId}
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
                        checked={newTalukData.isActive}
                        onChange={(e) => handleAddChange('isActive', e.target.checked)}
                        color="success"
                      />
                    }
                    label={newTalukData.isActive ? "Active" : "Inactive"}
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
              onClick={handleSaveNewTaluk} 
              variant="contained" 
              color="success"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
              size="large"
            >
              {isSaving ? "Adding..." : "Add Taluk"}
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
              Edit Taluk
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedTaluk?.desTalukId} | Current: {selectedTaluk?.desTalukNameEn}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Name (English)"
                  fullWidth
                  required
                  value={editedData.desTalukNameEn || ''}
                  onChange={(e) => handleEditChange('desTalukNameEn', e.target.value)}
                  error={!!editErrors.desTalukNameEn}
                  helperText={editErrors.desTalukNameEn}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Name (Malayalam)"
                  fullWidth
                  required
                  value={editedData.desTalukNameMal || ''}
                  onChange={(e) => handleEditChange('desTalukNameMal', e.target.value)}
                  error={!!editErrors.desTalukNameMal}
                  helperText={editErrors.desTalukNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
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
                        checked={editedData.isActive || false}
                        onChange={(e) => handleEditChange('isActive', e.target.checked)}
                        color="success"
                      />
                    }
                    label={editedData.isActive ? "Active" : "Inactive"}
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

export default TalukSettings;