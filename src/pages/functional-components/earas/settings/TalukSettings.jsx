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
import Breadcrumb from "routes/Breadcrumb";
import SettingService from "./SettingService";

const BASE_URL = mainapi.BASE_URL;

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`taluk-tabpanel-${index}`}
      aria-labelledby={`taluk-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const TalukSettings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
        <Breadcrumb/>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {/* <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2, color: '#05307a' }}>
          Taluk Management
        </Typography> */}
         <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Taluk Management
        </Typography>
        
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
            <Tab label="Taluk Management" />
            <Tab label="Taluk Office Management" />
            <Tab label="Revenue Taluk Management" />
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <TalukManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <TalukOfficeManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <RevenueTalukManagementTab />
        </TabPanel>
      </Box>
    </Grid>
  );
};

// ==================== Taluk Management Tab ====================
const TalukManagementTab = () => {
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

const fetchDistricts = useCallback(async () => {
  try {
    const mappedDistricts = await SettingService.fetchDistrictsForDropdown();
    setDistricts(mappedDistricts);
  } catch (err) {
    console.error("Error fetching districts:", err);
    toast.error(err.message);
  }
}, []);

const fetchTaluks = useCallback(async () => {
  setLoading(true);
  setError("");
  try {
    const data = await SettingService.fetchAllTaluks();
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
    setFilteredTaluks(filtered);
  }, [searchTerm, taluks]);

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

  const validateData = (data) => {
    const errors = {};
    if (!data.desTalukNameEn?.trim()) errors.desTalukNameEn = "Taluk name (English) is required";
    if (!data.desTalukNameMal?.trim()) errors.desTalukNameMal = "Taluk name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    return errors;
  };

  const saveTaluk = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 403) throw new Error("Access denied");
    if (response.status === 401) throw new Error("Session expired");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return await response.text();
  };

  const handleSaveEdit = async () => {
  const errors = validateData(editedData);
  setEditErrors(errors);
  if (Object.keys(errors).length > 0) {
    toast.error("Please fix validation errors");
    return;
  }

  setIsSaving(true);
  try {
    const payload = {
      desTalukId: editedData.desTalukId,
      desTalukNameEn: editedData.desTalukNameEn,
      desTalukNameMal: editedData.desTalukNameMal,
      distId: editedData.distId,
      isActive: editedData.isActive,
    };
    await SettingService.saveTaluk(payload);
    setSuccessMessage("Taluk updated successfully!");
    setShowSuccessModal(true);
    toast.success("Taluk updated successfully!");
    await fetchTaluks();
    setEditModalOpen(false);
  } catch (err) {
    let errorMsg = err.message;
    if (err.message.includes("403")) errorMsg = "You don't have permission to edit taluks.";
    else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
    setErrorMessage(errorMsg);
    setShowErrorModal(true);
    toast.error(errorMsg);
  } finally {
    setIsSaving(false);
  }
};

  const handleSaveNewTaluk = async () => {
  const errors = validateData(newTalukData);
  setAddErrors(errors);
  if (Object.keys(errors).length > 0) {
    toast.error("Please fix validation errors");
    return;
  }

  setIsSaving(true);
  try {
    const payload = {
      desTalukNameEn: newTalukData.desTalukNameEn,
      desTalukNameMal: newTalukData.desTalukNameMal,
      distId: newTalukData.distId,
      isActive: newTalukData.isActive,
    };
    await SettingService.saveTaluk(payload);
    setSuccessMessage("Taluk added successfully!");
    setShowSuccessModal(true);
    toast.success("Taluk added successfully!");
    await fetchTaluks();
    setAddModalOpen(false);
  } catch (err) {
    let errorMsg = err.message;
    if (err.message.includes("403")) errorMsg = "You don't have permission to add taluks.";
    else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
    else if (err.message.includes("duplicate") || err.message.includes("already exists"))
      errorMsg = "A taluk with this name already exists.";
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
    await SettingService.toggleTalukActive(taluk);
    const action = !taluk.active ? "activated" : "deactivated";
    setSuccessMessage(`Taluk "${taluk.desTalukNameEn}" ${action} successfully!`);
    setShowSuccessModal(true);
    toast.success(`Taluk ${action}!`);
    await fetchTaluks();
  } catch (err) {
    let errorMsg = err.message;
    if (err.message.includes("403")) errorMsg = "You don't have permission to change taluk status.";
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
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
      </Alert>
    );
  }

  return (
    <>
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

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Name (EN)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Name (ML)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
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
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Add New Taluk</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the taluk details below
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Taluk Name (English)"
                fullWidth
                required
                value={newTalukData.desTalukNameEn}
                onChange={(e) => handleAddChange('desTalukNameEn', e.target.value)}
                error={!!addErrors.desTalukNameEn}
                helperText={addErrors.desTalukNameEn}
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
                InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }}
                placeholder="e.g., തിരുവനന്തപുരം"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                    control={
                        <Switch
                        checked={newTalukData.isActive}
                        onChange={(e) => handleAddChange('isActive', e.target.checked)}
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
                    label={newTalukData.isActive ? "Active" : "Inactive"}
                    />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>
            Cancel
          </Button>
          <Button 
                onClick={handleSaveNewTaluk} 
                variant="contained" 
                disabled={isSaving} 
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                sx={{
                    bgcolor: '#05307a',
                    '&:hover': {
                    bgcolor: '#042560',
                    },
                    '&:active': {
                    bgcolor: '#031840',
                    },
                    '&:disabled': {
                    bgcolor: '#8ba0c2',
                    color: '#e0e0e0',
                    }
                }}
                >
                {isSaving ? "Adding..." : "Add Taluk"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Edit Taluk</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            ID: {selectedTaluk?.desTalukId} | Current: {selectedTaluk?.desTalukNameEn}
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Taluk Name (English)"
                fullWidth
                required
                value={editedData.desTalukNameEn || ''}
                onChange={(e) => handleEditChange('desTalukNameEn', e.target.value)}
                error={!!editErrors.desTalukNameEn}
                helperText={editErrors.desTalukNameEn}
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
                InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }}
              />
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
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ==================== Taluk Office Management Tab ====================
// ==================== Taluk Office Management Tab ====================
const TalukOfficeManagementTab = () => {
  const [talukOffices, setTalukOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [desTaluks, setDesTaluks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newOfficeData, setNewOfficeData] = useState({
    talukOfficeNameEn: "",
    distId: "",
    desTalukId: "",
    active: true,
  });
  const [editErrors, setEditErrors] = useState({});
  const [addErrors, setAddErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let timeoutId;
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // FIXED: Transform districts to match expected format
  const fetchDistricts = useCallback(async () => {
    try {
      const mappedDistricts = await SettingService.fetchDistrictsForDropdown();
      // Transform to the format expected by the component
      const formattedDistricts = mappedDistricts.map(district => ({
        districtId: district.dist_id,
        districtNameEn: district.dist_name_en,
        districtNameMal: district.dist_name_mal,
      }));
      setDistricts(formattedDistricts);
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error(err.message);
    }
  }, []);

  // FIXED: Transform taluks to match expected format if needed
  const fetchDesTaluks = useCallback(async () => {
    try {
      const data = await SettingService.fetchActiveTaluks();
      // The data from fetchActiveTaluks already has desTalukId, desTalukNameEn, desTalukNameMal
      // which matches what the component expects
      setDesTaluks(data);
    } catch (err) {
      console.error("Error fetching DES Taluks:", err);
      toast.error(err.message);
    }
  }, []);

  const fetchTalukOffices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchTalukOffices();
      setTalukOffices(data);
      setFilteredOffices(data);
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
    fetchDesTaluks();
    fetchTalukOffices();
  }, [fetchDistricts, fetchDesTaluks, fetchTalukOffices]);

  useEffect(() => {
    let filtered = [...talukOffices];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((office) => office.talukOfficeNameEn?.toLowerCase().includes(term));
    }
    setFilteredOffices(filtered);
  }, [searchTerm, talukOffices]);

  const handleEditClick = (office) => {
    setSelectedOffice(office);
    setEditedData({
      id: office.id,
      talukOfficeNameEn: office.talukOfficeNameEn,
      distId: office.distId,
      desTalukId: office.desTalukId,
      active: office.active,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewOfficeData({ talukOfficeNameEn: "", distId: "", desTalukId: "", active: true });
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

  const validateData = (data) => {
    const errors = {};
    if (!data.talukOfficeNameEn?.trim()) errors.talukOfficeNameEn = "Taluk office name is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.desTalukId) errors.desTalukId = "Please select a DES Taluk";
    return errors;
  };

  const handleSaveEdit = async () => {
    const errors = validateData(editedData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editedData.id,
        talukOfficeNameEn: editedData.talukOfficeNameEn,
        distId: editedData.distId,
        desTalukId: editedData.desTalukId,
        active: editedData.active,
      };
      await SettingService.saveTalukOffice(payload);
      setSuccessMessage("Taluk office updated successfully!");
      setShowSuccessModal(true);
      toast.success("Taluk office updated successfully!");
      await fetchTalukOffices();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit taluk offices.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewOffice = async () => {
    const errors = validateData(newOfficeData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        talukOfficeNameEn: newOfficeData.talukOfficeNameEn,
        distId: newOfficeData.distId,
        desTalukId: newOfficeData.desTalukId,
        active: newOfficeData.active,
      };
      await SettingService.saveTalukOffice(payload);
      setSuccessMessage("Taluk office added successfully!");
      setShowSuccessModal(true);
      toast.success("Taluk office added successfully!");
      await fetchTalukOffices();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add taluk offices.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A taluk office with this name already exists.";
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
      await SettingService.toggleTalukOfficeActive(office);
      const action = !office.active ? "activated" : "deactivated";
      setSuccessMessage(`Taluk office "${office.talukOfficeNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Taluk office ${action}!`);
      await fetchTalukOffices();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change taluk office status.";
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

  // FIXED: This function now works with the formatted districts
  const getDistrictName = (distId) => {
    const district = districts.find(d => d.districtId === distId);
    if (district) {
      return `${district.districtNameEn} / ${district.districtNameMal}`;
    }
    return "Unknown District";
  };

  const getDesTalukName = (desTalukId) => {
    const taluk = desTaluks.find(t => t.desTalukId === desTalukId);
    if (taluk) {
      return `${taluk.desTalukNameEn} / ${taluk.desTalukNameMal}`;
    }
    return "Unknown Des Taluk";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Taluk Offices...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }} action={<Button color="inherit" size="small" onClick={fetchTalukOffices}>Retry</Button>}>
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Taluk Office"
          size="small"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTalukOffices}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ ml: 'auto' }}>
          Add New Taluk Office
        </Button>
      </Paper>

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Office Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>DES Taluk</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffices.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No taluk offices found</TableCell></TableRow>
              ) : (
                filteredOffices.map((office) => (
                  <TableRow key={office.id} sx={{ backgroundColor: !office.active ? '#fafafa' : 'inherit' }}>
                    <TableCell>{office.id}</TableCell>
                    <TableCell>{office.talukOfficeNameEn}</TableCell>
                    <TableCell>{getDistrictName(office.distId)}</TableCell>
                    <TableCell>{getDesTalukName(office.desTalukId)}</TableCell>
                    <TableCell align="center">{getStatusChip(office.active)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Taluk Office">
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
          Showing {filteredOffices.length} of {talukOffices.length} taluk offices
        </Typography>
      </Box>

      {/* Add Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Add New Taluk Office</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!addErrors.distId}>
                <InputLabel>Select District</InputLabel>
                <Select value={newOfficeData.distId} label="Select District" onChange={(e) => handleAddChange('distId', e.target.value)}>
                  {districts.map((district) => (
                    <MenuItem key={district.districtId} value={district.districtId}>
                      {district.districtNameEn} / {district.districtNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.distId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!addErrors.desTalukId}>
                <InputLabel>Select DES Taluk</InputLabel>
                <Select value={newOfficeData.desTalukId} label="Select DES Taluk" onChange={(e) => handleAddChange('desTalukId', e.target.value)}>
                  {desTaluks.map((taluk) => (
                    <MenuItem key={taluk.desTalukId} value={taluk.desTalukId}>
                      {taluk.desTalukNameEn} / {taluk.desTalukNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.desTalukId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.desTalukId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Taluk Office Name"
                fullWidth
                required
                value={newOfficeData.talukOfficeNameEn}
                onChange={(e) => handleAddChange('talukOfficeNameEn', e.target.value)}
                error={!!addErrors.talukOfficeNameEn}
                helperText={addErrors.talukOfficeNameEn}
                placeholder="e.g., Taluk Statistical Office Ernakulam"
              />
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
                    />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button 
                onClick={handleSaveNewOffice} 
                variant="contained" 
                disabled={isSaving} 
                startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
                sx={{
                    backgroundColor: '#05307a',
                    '&:hover': {
                    backgroundColor: '#042560',
                    },
                    '&:disabled': {
                    backgroundColor: '#8ba0c2',
                    }
                }}
                >
                {isSaving ? "Adding..." : "Add Taluk Office"}
                </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Edit Taluk Office</Typography>
          <Typography variant="body2">ID: {selectedOffice?.id} | Current: {selectedOffice?.talukOfficeNameEn}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!editErrors.distId}>
                <InputLabel>Select District</InputLabel>
                <Select value={editedData.distId || ''} label="Select District" onChange={(e) => handleEditChange('distId', e.target.value)}>
                  {districts.map((district) => (
                    <MenuItem key={district.districtId} value={district.districtId}>
                      {district.districtNameEn} / {district.districtNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.distId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!editErrors.desTalukId}>
                <InputLabel>Select DES Taluk</InputLabel>
                <Select value={editedData.desTalukId || ''} label="Select DES Taluk" onChange={(e) => handleEditChange('desTalukId', e.target.value)}>
                  {desTaluks.map((taluk) => (
                    <MenuItem key={taluk.desTalukId} value={taluk.desTalukId}>
                      {taluk.desTalukNameEn} / {taluk.desTalukNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.desTalukId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.desTalukId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Taluk Office Name"
                fullWidth
                required
                value={editedData.talukOfficeNameEn || ''}
                onChange={(e) => handleEditChange('talukOfficeNameEn', e.target.value)}
                error={!!editErrors.talukOfficeNameEn}
                helperText={editErrors.talukOfficeNameEn}
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
                    />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              '&:hover': {
                backgroundColor: '#042560',
              },
              '&:disabled': {
                backgroundColor: '#8ba0c2',
              }
            }}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success & Error Modals */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
            <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography>
          </Box>
        </DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ==================== Revenue Taluk Management Tab ====================
// ==================== Revenue Taluk Management Tab ====================
const RevenueTalukManagementTab = () => {
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

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedTaluks = filteredTaluks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    let timeoutId;
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch districts - transform to match component's expected format
  const fetchDistricts = useCallback(async () => {
    try {
      const mappedDistricts = await SettingService.fetchDistrictsForDropdown();
      // Transform to the format expected by this component
      const formattedDistricts = mappedDistricts.map(district => ({
        dist_id: district.dist_id,
        dist_name_en: district.dist_name_en,
        dist_name_mal: district.dist_name_mal,
      }));
      setDistricts(formattedDistricts);
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error(err.message);
    }
  }, []);

  // Fetch revenue taluks using service
  const fetchRevenueTaluks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchRevenueTaluks();
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

  // Filter revenue taluks based on search term
  useEffect(() => {
    let filtered = [...revenueTaluks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (taluk) =>
          taluk.revTalukNameEn?.toLowerCase().includes(term) ||
          taluk.revTalukNameMal?.toLowerCase().includes(term) ||
          taluk.talukCodeApi?.toLowerCase().includes(term)
      );
    }
    setFilteredTaluks(filtered);
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, revenueTaluks]);

  const handleEditClick = (taluk) => {
    setSelectedTaluk(taluk);
    setEditedData({
      revTalukId: taluk.revTalukId,
      revTalukNameEn: taluk.revTalukNameEn,
      revTalukNameMal: taluk.revTalukNameMal,
      distId: taluk.distId,
      lsgCode: taluk.lsgCode || "",
      censusCode2001: taluk.censusCode2001 || "",
      censusCode2011: taluk.censusCode2011 || "",
      talukCodeApi: taluk.talukCodeApi || "",
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

  const validateData = (data) => {
    const errors = {};
    if (!data.revTalukNameEn?.trim()) errors.revTalukNameEn = "Revenue Taluk name (English) is required";
    if (!data.revTalukNameMal?.trim()) errors.revTalukNameMal = "Revenue Taluk name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    if (!data.talukCodeApi?.trim()) errors.talukCodeApi = "Taluk code API is required";
    return errors;
  };

  const handleSaveEdit = async () => {
    const errors = validateData(editedData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        revTalukId: editedData.revTalukId,
        revTalukNameEn: editedData.revTalukNameEn,
        revTalukNameMal: editedData.revTalukNameMal,
        distId: editedData.distId,
        isActive: editedData.isActive,
        lsgCode: editedData.lsgCode,
        censusCode2001: editedData.censusCode2001,
        censusCode2011: editedData.censusCode2011,
        talukCodeApi: editedData.talukCodeApi,
      };
      await SettingService.saveRevenueTaluk(payload);
      setSuccessMessage("Revenue Taluk updated successfully!");
      setShowSuccessModal(true);
      toast.success("Revenue Taluk updated successfully!");
      await fetchRevenueTaluks();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit revenue taluks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A revenue taluk with this name or code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewTaluk = async () => {
    const errors = validateData(newTalukData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        revTalukNameEn: newTalukData.revTalukNameEn,
        revTalukNameMal: newTalukData.revTalukNameMal,
        distId: newTalukData.distId,
        isActive: newTalukData.isActive,
        lsgCode: newTalukData.lsgCode,
        censusCode2001: newTalukData.censusCode2001,
        censusCode2011: newTalukData.censusCode2011,
        talukCodeApi: newTalukData.talukCodeApi,
      };
      await SettingService.saveRevenueTaluk(payload);
      setSuccessMessage("Revenue Taluk added successfully!");
      setShowSuccessModal(true);
      toast.success("Revenue Taluk added successfully!");
      await fetchRevenueTaluks();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add revenue taluks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A revenue taluk with this name or code already exists.";
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
      await SettingService.toggleRevenueTalukActive(taluk);
      const action = !taluk.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Revenue Taluk "${taluk.revTalukNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Revenue Taluk ${action}!`);
      await fetchRevenueTaluks();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change revenue taluk status.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
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
      </Alert>
    );
  }

  return (
    <>
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Revenue Taluk"
          size="small"
          placeholder="Search by name (EN/ML) or code..."
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
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk Name (EN)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk Name (ML)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2001</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2011</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk Code API</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTaluks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">No revenue taluks found</TableCell>
                </TableRow>
              ) : (
                paginatedTaluks.map((taluk, index) => (
                  <TableRow 
                    key={taluk.revTalukId} 
                    sx={{ backgroundColor: !taluk.isActive ? '#fafafa' : 'inherit' }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{taluk.revTalukNameEn}</TableCell>
                    <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                      {taluk.revTalukNameMal}
                    </TableCell>
                    <TableCell>{getDistrictName(taluk.distId)}</TableCell>
                    <TableCell align="center">{taluk.lsgCode}</TableCell>
                    <TableCell align="center">{taluk.censusCode2001 || "-"}</TableCell>
                    <TableCell align="center">{taluk.censusCode2011 || "-"}</TableCell>
                    <TableCell align="center">
                      <Chip label={taluk.talukCodeApi} size="small" variant="outlined" />
                    </TableCell>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredTaluks.length}
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
          Showing {paginatedTaluks.length} of {filteredTaluks.length} revenue taluks {searchTerm && "(filtered)"}
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
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Add New Revenue Taluk
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the revenue taluk details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
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
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Revenue Taluk Name (English)"
                fullWidth
                required
                value={newTalukData.revTalukNameEn}
                onChange={(e) => handleAddChange('revTalukNameEn', e.target.value)}
                error={!!addErrors.revTalukNameEn}
                helperText={addErrors.revTalukNameEn}
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
                value={newTalukData.lsgCode}
                onChange={(e) => handleAddChange('lsgCode', e.target.value)}
                error={!!addErrors.lsgCode}
                helperText={addErrors.lsgCode}
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
                placeholder="e.g., 3"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2011"
                fullWidth
                value={newTalukData.censusCode2011}
                onChange={(e) => handleAddChange('censusCode2011', e.target.value)}
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
            disabled={isSaving} 
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
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
            {isSaving ? "Adding..." : "Add Revenue Taluk"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Revenue Taluk Modal */}
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
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
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
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.distId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Revenue Taluk Name (English)"
                fullWidth
                required
                value={editedData.revTalukNameEn || ''}
                onChange={(e) => handleEditChange('revTalukNameEn', e.target.value)}
                error={!!editErrors.revTalukNameEn}
                helperText={editErrors.revTalukNameEn}
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
                value={editedData.lsgCode || ''}
                onChange={(e) => handleEditChange('lsgCode', e.target.value)}
                error={!!editErrors.lsgCode}
                helperText={editErrors.lsgCode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2001"
                type="number"
                fullWidth
                value={editedData.censusCode2001 || ''}
                onChange={(e) => handleEditChange('censusCode2001', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2011"
                fullWidth
                value={editedData.censusCode2011 || ''}
                onChange={(e) => handleEditChange('censusCode2011', e.target.value)}
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
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={editedData.isActive || false} 
                      onChange={(e) => handleEditChange('isActive', e.target.checked)} 
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
            disabled={isSaving} 
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
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

export default TalukSettings;