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

const VillageSettings = () => {
  const [villages, setVillages] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [revenueTaluks, setRevenueTaluks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newVillageData, setNewVillageData] = useState({
    villageNameEn: "",
    villageNameMal: "",
    revTalukId: "",
    villageCodeApi: "",
    lsgCode: "",
    censusCode2001: "",
    censusCode2011: "",
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

  // Fetch revenue taluks for dropdown
  const fetchRevenueTaluks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllRev`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueTaluks(data.filter(taluk => taluk.isActive === true));
      }
    } catch (err) {
      console.error("Error fetching revenue taluks:", err);
    }
  }, []);

  // Fetch villages
  const fetchVillages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        toast.error("Please login again");
        return;
      }

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterVillage`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to view villages.");
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch villages: ${response.status}`);
      }

      const data = await response.json();
      setVillages(data);
      setFilteredVillages(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenueTaluks();
    fetchVillages();
  }, [fetchRevenueTaluks, fetchVillages]);

  // Filter villages
  useEffect(() => {
  let filtered = [...villages];
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (village) =>
        village.villageNameEn?.toLowerCase().includes(term) ||
        village.villageNameMal?.toLowerCase().includes(term)
    );
  }
  setFilteredVillages(filtered);
}, [searchTerm, villages]);

  const handleEditClick = (village) => {
    setSelectedVillage(village);
    setEditedData({
      villageId: village.villageId,
      villageNameEn: village.villageNameEn,
      villageNameMal: village.villageNameMal,
      revTalukId: village.revTalukId,
      villageCodeApi: village.villageCodeApi,
      lsgCode: village.lsgCode,
      censusCode2001: village.censusCode2001,
      censusCode2011: village.censusCode2011,
      isActive: village.isActive,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewVillageData({
      villageNameEn: "",
      villageNameMal: "",
      revTalukId: "",
      villageCodeApi: "",
      lsgCode: "",
      censusCode2001: "",
      censusCode2011: "",
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
    setNewVillageData((prev) => ({ ...prev, [field]: value }));
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
    if (!data.villageNameEn?.trim()) errors.villageNameEn = "Village name (English) is required";
    if (!data.villageNameMal?.trim()) errors.villageNameMal = "Village name (Malayalam) is required";
    if (!data.revTalukId) errors.revTalukId = "Please select a revenue taluk";
    if (!data.villageCodeApi?.trim()) errors.villageCodeApi = "Village code API is required";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAdd = (data) => {
    const errors = {};
    if (!data.villageNameEn?.trim()) errors.villageNameEn = "Village name (English) is required";
    if (!data.villageNameMal?.trim()) errors.villageNameMal = "Village name (Malayalam) is required";
    if (!data.revTalukId) errors.revTalukId = "Please select a revenue taluk";
    if (!data.villageCodeApi?.trim()) errors.villageCodeApi = "Village code API is required";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
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
        villageId: editedData.villageId,
        villageNameEn: editedData.villageNameEn,
        villageNameMal: editedData.villageNameMal,
        revTalukId: editedData.revTalukId,
        isActive: editedData.isActive,
        villageCodeApi: editedData.villageCodeApi,
        lsgCode: Number(editedData.lsgCode),
        censusCode2001: editedData.censusCode2001 || "",
        censusCode2011: editedData.censusCode2011 || "",
        userId: userId,
      };

      console.log("Saving payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterVillage`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to update villages.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Village updated successfully!");
      setShowSuccessModal(true);
      toast.success("Village updated successfully!");
      await fetchVillages();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to edit villages. Please contact administrator.";
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

  const handleSaveNewVillage = async () => {
    if (!validateAdd(newVillageData)) {
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
        villageNameEn: newVillageData.villageNameEn,
        villageNameMal: newVillageData.villageNameMal,
        revTalukId: newVillageData.revTalukId,
        isActive: newVillageData.isActive,
        villageCodeApi: newVillageData.villageCodeApi,
        lsgCode: Number(newVillageData.lsgCode),
        censusCode2001: newVillageData.censusCode2001 || "",
        censusCode2011: newVillageData.censusCode2011 || "",
        userId: userId,
      };

      console.log("Adding new village payload:", payload);

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterVillage`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to add villages.");
      }

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage("Village added successfully!");
      setShowSuccessModal(true);
      toast.success("Village added successfully!");
      await fetchVillages();
      setAddModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to add villages. Please contact administrator.";
      } else if (err.message.includes("401")) {
        errorMsg = "Your session has expired. Please login again.";
      } else if (err.message.includes("duplicate") || err.message.includes("already exists")) {
        errorMsg = "A village with this name already exists.";
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (village) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const userId = authservice.userid();

      const payload = {
        villageId: village.villageId,
        villageNameEn: village.villageNameEn,
        villageNameMal: village.villageNameMal,
        revTalukId: village.revTalukId,
        isActive: !village.isActive,
        villageCodeApi: village.villageCodeApi,
        lsgCode: village.lsgCode,
        censusCode2001: village.censusCode2001,
        censusCode2011: village.censusCode2011,
        userId: userId,
      };

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterVillage`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        throw new Error("Access denied. You don't have permission to change village status.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const action = !village.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Village "${village.villageNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Village ${action}!`);
      await fetchVillages();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      
      if (err.message.includes("403")) {
        errorMsg = "You don't have permission to change village status. Please contact administrator.";
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

  const getRevenueTalukName = (revTalukId) => {
    const taluk = revenueTaluks.find(t => t.revTalukId === revTalukId);
    return taluk ? taluk.revTalukNameEn : "Unknown";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Villages...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchVillages}>
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
          Village Management
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search Village"
            size="small"
            placeholder="Search by name (EN/ML)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchVillages}>
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            sx={{ ml: 'auto' }}
          >
            Add New Village
          </Button>
        </Paper>

        {/* Table */}
        <Paper elevation={3}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name (EN)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name (ML)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Code API</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2001</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2011</TableCell>
                  {/* <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Created By</TableCell> */}
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVillages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No villages found</TableCell>
                  </TableRow>
                ) : (
                  filteredVillages.map((village) => (
                    <TableRow key={village.villageId} sx={{ backgroundColor: !village.isActive ? '#fafafa' : 'inherit' }}>
                      <TableCell>{village.villageId}</TableCell>
                      <TableCell>{village.villageNameEn}</TableCell>
                      <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                        {village.villageNameMal}
                      </TableCell>
                      <TableCell>{getRevenueTalukName(village.revTalukId)}</TableCell>
                      <TableCell align="center">{village.villageCodeApi}</TableCell>
                      <TableCell align="center">{village.lsgCode}</TableCell>
                      <TableCell align="center">{village.censusCode2001 || "-"}</TableCell>
                      <TableCell align="center">{village.censusCode2011 || "-"}</TableCell>
                      {/* <TableCell>
                        {village.userId ? (
                          <Chip label={village.userId.substring(0, 8) + "..."} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="textSecondary">System</Typography>
                        )}
                      </TableCell> */}
                      <TableCell align="center">{getStatusChip(village.isActive)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Village">
                            <IconButton color="primary" onClick={() => handleEditClick(village)} size="small">
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
            Showing {filteredVillages.length} of {villages.length} villages
          </Typography>
        </Box>

        {/* Add New Village Modal */}
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
              Add New Village
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the village details below
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Name (English)"
                  fullWidth
                  required
                  value={newVillageData.villageNameEn}
                  onChange={(e) => handleAddChange('villageNameEn', e.target.value)}
                  error={!!addErrors.villageNameEn}
                  helperText={addErrors.villageNameEn}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., Thiruvananthapuram"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Name (Malayalam)"
                  fullWidth
                  required
                  value={newVillageData.villageNameMal}
                  onChange={(e) => handleAddChange('villageNameMal', e.target.value)}
                  error={!!addErrors.villageNameMal}
                  helperText={addErrors.villageNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                  placeholder="e.g., തിരുവനന്തപുരം"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!addErrors.revTalukId}>
                  <InputLabel>Select Revenue Taluk</InputLabel>
                  <Select
                    value={newVillageData.revTalukId}
                    label="Select Revenue Taluk"
                    onChange={(e) => handleAddChange('revTalukId', e.target.value)}
                  >
                    {revenueTaluks.map((taluk) => (
                      <MenuItem key={taluk.revTalukId} value={taluk.revTalukId}>
                        {taluk.revTalukNameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  {addErrors.revTalukId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {addErrors.revTalukId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Code API"
                  fullWidth
                  required
                  value={newVillageData.villageCodeApi}
                  onChange={(e) => handleAddChange('villageCodeApi', e.target.value)}
                  error={!!addErrors.villageCodeApi}
                  helperText={addErrors.villageCodeApi}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., TVM001"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="LSG Code"
                  type="number"
                  fullWidth
                  required
                  value={newVillageData.lsgCode}
                  onChange={(e) => handleAddChange('lsgCode', e.target.value)}
                  error={!!addErrors.lsgCode}
                  helperText={addErrors.lsgCode}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 12345"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2001"
                  fullWidth
                  value={newVillageData.censusCode2001}
                  onChange={(e) => handleAddChange('censusCode2001', e.target.value)}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 123456"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Census Code 2011"
                  fullWidth
                  value={newVillageData.censusCode2011}
                  onChange={(e) => handleAddChange('censusCode2011', e.target.value)}
                  size="medium"
                  variant="outlined"
                  placeholder="e.g., 1234567"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newVillageData.isActive}
                        onChange={(e) => handleAddChange('isActive', e.target.checked)}
                        color="success"
                      />
                    }
                    label={newVillageData.isActive ? "Active" : "Inactive"}
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
              onClick={handleSaveNewVillage} 
              variant="contained" 
              color="success"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
              size="large"
            >
              {isSaving ? "Adding..." : "Add Village"}
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
              Edit Village
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedVillage?.villageId} | Current: {selectedVillage?.villageNameEn}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Name (English)"
                  fullWidth
                  required
                  value={editedData.villageNameEn || ''}
                  onChange={(e) => handleEditChange('villageNameEn', e.target.value)}
                  error={!!editErrors.villageNameEn}
                  helperText={editErrors.villageNameEn}
                  size="medium"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Name (Malayalam)"
                  fullWidth
                  required
                  value={editedData.villageNameMal || ''}
                  onChange={(e) => handleEditChange('villageNameMal', e.target.value)}
                  error={!!editErrors.villageNameMal}
                  helperText={editErrors.villageNameMal}
                  size="medium"
                  variant="outlined"
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!editErrors.revTalukId}>
                  <InputLabel>Select Revenue Taluk</InputLabel>
                  <Select
                    value={editedData.revTalukId || ''}
                    label="Select Revenue Taluk"
                    onChange={(e) => handleEditChange('revTalukId', e.target.value)}
                  >
                    {revenueTaluks.map((taluk) => (
                      <MenuItem key={taluk.revTalukId} value={taluk.revTalukId}>
                        {taluk.revTalukNameEn}
                      </MenuItem>
                    ))}
                  </Select>
                  {editErrors.revTalukId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {editErrors.revTalukId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Village Code API"
                  fullWidth
                  required
                  value={editedData.villageCodeApi || ''}
                  onChange={(e) => handleEditChange('villageCodeApi', e.target.value)}
                  error={!!editErrors.villageCodeApi}
                  helperText={editErrors.villageCodeApi}
                  size="medium"
                  variant="outlined"
                />
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

export default VillageSettings;