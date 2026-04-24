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

const RevenueTalukSettings = () => {
  const [revenueTaluks, setRevenueTaluks] = useState([]);
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
    revTalukNameEn: "",
    revTalukNameMal: "",
    distId: "",
    lsgCode: "",
    censusCode2001: "",
    censusCode2011: "",
    talukCodeApi: "",
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

    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/districts`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
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

  // Fetch revenue taluks
  const fetchRevenueTaluks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        toast.error("Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllRev`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view revenue taluks.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch revenue taluks: ${response.status}`);
      }

      const data = await response.json();
      setRevenueTaluks(data);
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
    fetchRevenueTaluks();
  }, [fetchDistricts, fetchRevenueTaluks]);

  // Filter revenue taluks
  useEffect(() => {
  let filtered = [...revenueTaluks];
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (taluk) =>
        taluk.revTalukNameEn?.toLowerCase().includes(term) ||
        taluk.revTalukNameMal?.toLowerCase().includes(term)
    );
  }
  setFilteredTaluks(filtered);
}, [searchTerm, revenueTaluks]);

  const handleEditClick = (taluk) => {
    setSelectedTaluk(taluk);
    setEditedData({
      revTalukId: taluk.revTalukId,
      revTalukNameEn: taluk.revTalukNameEn,
      revTalukNameMal: taluk.revTalukNameMal,
      distId: taluk.distId,
      lsgCode: taluk.lsgCode,
      censusCode2001: taluk.censusCode2001,
      censusCode2011: taluk.censusCode2011,
      talukCodeApi: taluk.talukCodeApi,
      isActive: taluk.isActive,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewTalukData({
      revTalukNameEn: "",
      revTalukNameMal: "",
      distId: "",
      lsgCode: "",
      censusCode2001: "",
      censusCode2011: "",
      talukCodeApi: "",
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
    if (!data.revTalukNameEn?.trim()) errors.revTalukNameEn = "Revenue Taluk name (English) is required";
    if (!data.revTalukNameMal?.trim()) errors.revTalukNameMal = "Revenue Taluk name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    if (!data.talukCodeApi?.trim()) errors.talukCodeApi = "Taluk code API is required";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdd = (data) => {
    const errors = {};
    if (!data.revTalukNameEn?.trim()) errors.revTalukNameEn = "Revenue Taluk name (English) is required";
    if (!data.revTalukNameMal?.trim()) errors.revTalukNameMal = "Revenue Taluk name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    if (!data.talukCodeApi?.trim()) errors.talukCodeApi = "Taluk code API is required";
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
        revTalukId: editedData.revTalukId,
        revTalukNameEn: editedData.revTalukNameEn,
        revTalukNameMal: editedData.revTalukNameMal,
        distId: editedData.distId,
        isActive: editedData.isActive,
        lsgCode: Number(editedData.lsgCode),
        censusCode2001: editedData.censusCode2001 ? Number(editedData.censusCode2001) : null,
        censusCode2011: editedData.censusCode2011 || "",
        talukCodeApi: editedData.talukCodeApi,
        userId: userId,
      };

      console.log("Saving payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateRev`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to update revenue taluks.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Revenue Taluk updated successfully!");
      setShowSuccessModal(true);
      toast.success("Revenue Taluk updated successfully!");
      await fetchRevenueTaluks();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to edit revenue taluks. Please contact administrator.";
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
        revTalukNameEn: newTalukData.revTalukNameEn,
        revTalukNameMal: newTalukData.revTalukNameMal,
        distId: newTalukData.distId,
        isActive: newTalukData.isActive,
        lsgCode: Number(newTalukData.lsgCode),
        censusCode2001: newTalukData.censusCode2001 ? Number(newTalukData.censusCode2001) : null,
        censusCode2011: newTalukData.censusCode2011 || "",
        talukCodeApi: newTalukData.talukCodeApi,
        userId: userId,
      };

      console.log("Adding new revenue taluk payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateRev`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to add revenue taluks.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Revenue Taluk added successfully!");
      setShowSuccessModal(true);
      toast.success("Revenue Taluk added successfully!");
      await fetchRevenueTaluks();
      setAddModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to add revenue taluks. Please contact administrator.";
      } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
      } else if (err.message.includes("duplicate") || err.message.includes("already exists")) {
        errorMsg = "A revenue taluk with this name already exists.";
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
        revTalukId: taluk.revTalukId,
        revTalukNameEn: taluk.revTalukNameEn,
        revTalukNameMal: taluk.revTalukNameMal,
        distId: taluk.distId,
        isActive: !taluk.isActive,
        lsgCode: taluk.lsgCode,
        censusCode2001: taluk.censusCode2001,
        censusCode2011: taluk.censusCode2011,
        talukCodeApi: taluk.talukCodeApi,
        userId: userId,
      };

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateRev`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to change revenue taluk status.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const action = !taluk.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Revenue Taluk "${taluk.revTalukNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Revenue Taluk ${action}!`);
      await fetchRevenueTaluks();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to change revenue taluk status. Please contact administrator.";
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
        <Typography sx={{ ml: 2 }}>Loading Revenue Taluks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchRevenueTaluks}>
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
          Revenue Taluk Management
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search Revenue Taluk"
            size="small"
            placeholder="Search by name (EN/ML)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchRevenueTaluks}>
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            sx={{ ml: 'auto' }}
          >
            Add New Revenue Taluk
          </Button>
        </Paper>

        {/* Table */}
        <Paper elevation={3}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk Name (EN)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk Name (ML)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2001</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2011</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Code API</TableCell>
                  {/* <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Created By</TableCell> */}
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTaluks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No revenue taluks found</TableCell>
                  </TableRow>
                ) : (
                  filteredTaluks.map((taluk) => (
                    <TableRow key={taluk.revTalukId} sx={{ backgroundColor: !taluk.isActive ? '#fafafa' : 'inherit' }}>
                      <TableCell>{taluk.revTalukId}</TableCell>
                      <TableCell>{taluk.revTalukNameEn}</TableCell>
                      <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                        {taluk.revTalukNameMal}
                      </TableCell>
                      <TableCell>{getDistrictName(taluk.distId)}</TableCell>
                      <TableCell align="center">{taluk.lsgCode}</TableCell>
                      <TableCell align="center">{taluk.censusCode2001 || "-"}</TableCell>
                      <TableCell align="center">{taluk.censusCode2011 || "-"}</TableCell>
                      <TableCell align="center">{taluk.talukCodeApi}</TableCell>
                      {/* <TableCell>
                        {taluk.createdBy ? (
                          <Chip label={taluk.createdBy.substring(0, 8) + "..."} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="textSecondary">System</Typography>
                        )}
                      </TableCell> */}
                      <TableCell align="center">{getStatusChip(taluk.isActive)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Revenue Taluk">
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
            Showing {filteredTaluks.length} of {revenueTaluks.length} revenue taluks
          </Typography>
        </Box>

        {/* Add New Revenue Taluk Modal */}
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
              Add New Revenue Taluk
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the revenue taluk details below
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Revenue Taluk Name (English)"
                  fullWidth
                  required
                  value={newTalukData.revTalukNameEn}
                  onChange={(e) => handleAddChange('revTalukNameEn', e.target.value)}
                  error={!!addErrors.revTalukNameEn}
                  helperText={addErrors.revTalukNameEn}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., Thiruvananthapuram"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Revenue Taluk Name (Malayalam)"
                  fullWidth
                  required
                  value={newTalukData.revTalukNameMal}
                  onChange={(e) => handleAddChange('revTalukNameMal', e.target.value)}
                  error={!!addErrors.revTalukNameMal}
                  helperText={addErrors.revTalukNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                  placeholder="e.g., തിരുവനന്തപുരം"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="LSG Code"
                  type="number"
                  fullWidth
                  required
                  value={newTalukData.lsgCode}
                  onChange={(e) => handleAddChange('lsgCode', e.target.value)}
                  error={!!addErrors.lsgCode}
                  helperText={addErrors.lsgCode}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 5691"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2001"
                  type="number"
                  fullWidth
                  value={newTalukData.censusCode2001}
                  onChange={(e) => handleAddChange('censusCode2001', e.target.value)}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 3"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2011"
                  fullWidth
                  value={newTalukData.censusCode2011}
                  onChange={(e) => handleAddChange('censusCode2011', e.target.value)}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 05691"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Code API"
                  fullWidth
                  required
                  value={newTalukData.talukCodeApi}
                  onChange={(e) => handleAddChange('talukCodeApi', e.target.value)}
                  error={!!addErrors.talukCodeApi}
                  helperText={addErrors.talukCodeApi}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., TVM001"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
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
              {isSaving ? "Adding..." : "Add Revenue Taluk"}
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
              Edit Revenue Taluk
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedTaluk?.revTalukId} | Current: {selectedTaluk?.revTalukNameEn}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Revenue Taluk Name (English)"
                  fullWidth
                  required
                  value={editedData.revTalukNameEn || ''}
                  onChange={(e) => handleEditChange('revTalukNameEn', e.target.value)}
                  error={!!editErrors.revTalukNameEn}
                  helperText={editErrors.revTalukNameEn}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Revenue Taluk Name (Malayalam)"
                  fullWidth
                  required
                  value={editedData.revTalukNameMal || ''}
                  onChange={(e) => handleEditChange('revTalukNameMal', e.target.value)}
                  error={!!editErrors.revTalukNameMal}
                  helperText={editErrors.revTalukNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="LSG Code"
                  type="number"
                  fullWidth
                  required
                  value={editedData.lsgCode || ''}
                  onChange={(e) => handleEditChange('lsgCode', e.target.value)}
                  error={!!editErrors.lsgCode}
                  helperText={editErrors.lsgCode}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2001"
                  type="number"
                  fullWidth
                  value={editedData.censusCode2001 || ''}
                  onChange={(e) => handleEditChange('censusCode2001', e.target.value)}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2011"
                  fullWidth
                  value={editedData.censusCode2011 || ''}
                  onChange={(e) => handleEditChange('censusCode2011', e.target.value)}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taluk Code API"
                  fullWidth
                  required
                  value={editedData.talukCodeApi || ''}
                  onChange={(e) => handleEditChange('talukCodeApi', e.target.value)}
                  error={!!editErrors.talukCodeApi}
                  helperText={editErrors.talukCodeApi}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
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

export default RevenueTalukSettings;