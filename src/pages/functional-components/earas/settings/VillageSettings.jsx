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

// Local body type options
const LOCAL_BODY_TYPE_OPTIONS = [
  { value: 1, label: "Grama Panchayat" },
  { value: 2, label: "Municipality" },
  { value: 3, label: "Corporation" },
];

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`village-tabpanel-${index}`}
      aria-labelledby={`village-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const VillageSettings = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        
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
            <Tab label="Village Management" />
            <Tab label="Village Block Management" />
            <Tab label="Local Body Management" />
            <Tab label="Master Block Management" />
          </Tabs>
        </Paper>

        <TabPanel value={activeTab} index={0}>
          <VillageManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
          <VillageBlockManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          <LocalBodyManagementTab />
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          <MasterBlockManagementTab />
        </TabPanel>
      </Box>
    </Grid>
  );
};

// ==================== Village Management Tab ====================
// ==================== Village Management Tab ====================
const VillageManagementTab = () => {
  const [villages, setVillages] = useState([]);
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [revenueTaluks, setRevenueTaluks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch revenue taluks using SettingService
  const fetchRevenueTaluks = useCallback(async () => {
    try {
      const data = await SettingService.fetchActiveRevenueTaluks();
      setRevenueTaluks(data);
    } catch (err) {
      console.error("Error fetching revenue taluks:", err);
      toast.error(err.message);
    }
  }, []);

  // Fetch villages using SettingService
  const fetchVillages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchAllVillages();
      setVillages(data);
      setFilteredVillages(data);
      setPage(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRevenueTaluks();
    fetchVillages();
  }, [fetchRevenueTaluks, fetchVillages]);

  // Filter villages based on search term
  useEffect(() => {
    let filtered = [...villages];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (village) =>
          village.villageNameEn?.toLowerCase().includes(term) ||
          village.villageNameMal?.toLowerCase().includes(term) ||
          village.villageCodeApi?.toLowerCase().includes(term)
      );
    }
    setFilteredVillages(filtered);
    setPage(0);
  }, [searchTerm, villages]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedVillages = filteredVillages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper functions
  const getRevenueTalukName = (revTalukId) => {
    const taluk = revenueTaluks.find(t => t.revTalukId === revTalukId);
    return taluk ? taluk.revTalukNameEn : "Unknown";
  };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  // Edit handlers
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

  // Validation
  const validateData = (data) => {
    const errors = {};
    if (!data.villageNameEn?.trim()) errors.villageNameEn = "Village name (English) is required";
    if (!data.villageNameMal?.trim()) errors.villageNameMal = "Village name (Malayalam) is required";
    if (!data.revTalukId) errors.revTalukId = "Please select a revenue taluk";
    if (!data.villageCodeApi?.trim()) errors.villageCodeApi = "Village code API is required";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    return errors;
  };

  // Save edited village
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
        villageId: editedData.villageId,
        villageNameEn: editedData.villageNameEn,
        villageNameMal: editedData.villageNameMal,
        revTalukId: editedData.revTalukId,
        isActive: editedData.isActive,
        villageCodeApi: editedData.villageCodeApi,
        lsgCode: editedData.lsgCode,
        censusCode2001: editedData.censusCode2001 || "",
        censusCode2011: editedData.censusCode2011 || "",
      };
      await SettingService.saveVillage(payload);
      setSuccessMessage("Village updated successfully!");
      setShowSuccessModal(true);
      toast.success("Village updated successfully!");
      await fetchVillages();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit villages.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A village with this name or code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new village
  const handleSaveNewVillage = async () => {
    const errors = validateData(newVillageData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        villageNameEn: newVillageData.villageNameEn,
        villageNameMal: newVillageData.villageNameMal,
        revTalukId: newVillageData.revTalukId,
        isActive: newVillageData.isActive,
        villageCodeApi: newVillageData.villageCodeApi,
        lsgCode: newVillageData.lsgCode,
        censusCode2001: newVillageData.censusCode2001 || "",
        censusCode2011: newVillageData.censusCode2011 || "",
      };
      await SettingService.saveVillage(payload);
      setSuccessMessage("Village added successfully!");
      setShowSuccessModal(true);
      toast.success("Village added successfully!");
      await fetchVillages();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add villages.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A village with this name or code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (village) => {
    setIsSaving(true);
    try {
      await SettingService.toggleVillageActive(village);
      const action = !village.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Village "${village.villageNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Village ${action}!`);
      await fetchVillages();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change village status.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Villages...</Typography>
      </Box>
    );
  }

  // Error state
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
      </Alert>
    );
  }

  return (
    <>
      {/* Filters */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Village"
          size="small"
          placeholder="Search by name (EN/ML) or code..."
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
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name (EN)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name (ML)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Revenue Taluk</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Code API</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2001</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Census 2011</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVillages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">No villages found</TableCell>
                </TableRow>
              ) : (
                paginatedVillages.map((village, index) => (
                  <TableRow 
                    key={village.villageId} 
                    sx={{ backgroundColor: !village.isActive ? '#fafafa' : 'inherit' }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{village.villageNameEn}</TableCell>
                    <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>
                      {village.villageNameMal}
                    </TableCell>
                    <TableCell>{getRevenueTalukName(village.revTalukId)}</TableCell>
                    <TableCell align="center">
                      <Chip label={village.villageCodeApi} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">{village.lsgCode}</TableCell>
                    <TableCell align="center">{village.censusCode2001 || "-"}</TableCell>
                    <TableCell align="center">{village.censusCode2011 || "-"}</TableCell>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredVillages.length}
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
          Showing {paginatedVillages.length} of {filteredVillages.length} villages {searchTerm && "(filtered)"}
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
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6" component="div">
            Add New Village
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the village details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Village Name (English)"
                fullWidth
                required
                value={newVillageData.villageNameEn}
                onChange={(e) => handleAddChange('villageNameEn', e.target.value)}
                error={!!addErrors.villageNameEn}
                helperText={addErrors.villageNameEn}
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
                      {taluk.revTalukNameEn} / {taluk.revTalukNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.revTalukId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
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
                placeholder="e.g., 12345"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2001"
                fullWidth
                value={newVillageData.censusCode2001}
                onChange={(e) => handleAddChange('censusCode2001', e.target.value)}
                placeholder="e.g., 123456"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Census Code 2011"
                fullWidth
                value={newVillageData.censusCode2011}
                onChange={(e) => handleAddChange('censusCode2011', e.target.value)}
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
            {isSaving ? "Adding..." : "Add Village"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Village Modal */}
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
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Village Name (English)"
                fullWidth
                required
                value={editedData.villageNameEn || ''}
                onChange={(e) => handleEditChange('villageNameEn', e.target.value)}
                error={!!editErrors.villageNameEn}
                helperText={editErrors.villageNameEn}
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
                      {taluk.revTalukNameEn} / {taluk.revTalukNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.revTalukId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
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

// ==================== Village Block Management Tab ====================
// ==================== Village Block Management Tab ====================
const VillageBlockManagementTab = () => {
  const [villageBlocks, setVillageBlocks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newBlockData, setNewBlockData] = useState({ 
    blockCode: "", 
    villageId: "", 
    isActive: true 
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
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch village blocks using SettingService
  const fetchVillageBlocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchAllVillageBlocks();
      setVillageBlocks(data);
      setFilteredBlocks(data);
      setPage(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch villages for dropdown using SettingService
  const fetchVillages = useCallback(async () => {
    try {
      const data = await SettingService.fetchAllVillages();
      setVillages(data.map((village) => ({ 
        villageId: village.villageId, 
        villageName: village.villageNameEn, 
        villageNameMal: village.villageNameMal 
      })));
    } catch (err) {
      console.error("Error fetching villages:", err);
      toast.error(err.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchVillageBlocks();
    fetchVillages();
  }, [fetchVillageBlocks, fetchVillages]);

  // Filter blocks based on search term
  useEffect(() => {
    let filtered = [...villageBlocks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((block) => {
        const village = villages.find((v) => v.villageId === block.villageId);
        const villageName = village?.villageName?.toLowerCase() || "";
        return block.blockCode?.toLowerCase().includes(term) || 
               villageName.includes(term) || 
               block.villageBlockId?.toString().includes(term);
      });
    }
    setFilteredBlocks(filtered);
    setPage(0);
  }, [searchTerm, villageBlocks, villages]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedBlocks = filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper functions
  const getVillageName = (villageId) => {
    const village = villages.find((v) => v.villageId === villageId);
    if (!village) return "Unknown Village";
    return `${village.villageName} / ${village.villageNameMal}`;
  };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  // Edit handlers
  const handleEditClick = (block) => {
    setSelectedBlock(block);
    setEditedData({ 
      villageBlockId: block.villageBlockId, 
      blockCode: block.blockCode, 
      villageId: block.villageId, 
      isActive: block.isActive 
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewBlockData({ blockCode: "", villageId: "", isActive: true });
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
    setNewBlockData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => { 
        const newErrors = { ...prev }; 
        delete newErrors[field]; 
        return newErrors; 
      });
    }
  };

  // Validation
  const validateData = (data) => {
    const errors = {};
    if (!data.blockCode?.trim()) errors.blockCode = "Block code is required";
    if (!data.villageId) errors.villageId = "Please select a village";
    return errors;
  };

  // Save edited block
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
        villageBlockId: editedData.villageBlockId, 
        blockCode: editedData.blockCode, 
        villageId: editedData.villageId, 
        isActive: editedData.isActive 
      };
      await SettingService.saveVillageBlock(payload);
      setSuccessMessage("Village block updated successfully!");
      setShowSuccessModal(true);
      toast.success("Village block updated successfully!");
      await fetchVillageBlocks();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit village blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A village block with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new block
  const handleSaveNewBlock = async () => {
    const errors = validateData(newBlockData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { 
        blockCode: newBlockData.blockCode, 
        villageId: newBlockData.villageId 
      };
      await SettingService.saveVillageBlock(payload);
      setSuccessMessage("Village block added successfully!");
      setShowSuccessModal(true);
      toast.success("Village block added successfully!");
      await fetchVillageBlocks();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add village blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A village block with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (block) => {
    setIsSaving(true);
    try {
      await SettingService.toggleVillageBlockActive(block);
      const action = !block.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Village block "${block.blockCode}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Village block ${action}!`);
      await fetchVillageBlocks();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change village block status.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Village Blocks...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }} 
        action={
          <Button color="inherit" size="small" onClick={fetchVillageBlocks}>
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
          label="Search"
          size="small"
          placeholder="Search by block code, village name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchVillageBlocks}>
          Refresh
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          sx={{ ml: 'auto' }}
        >
          Add New Block
        </Button>
      </Paper>

      {/* Table */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No village blocks found</TableCell>
                </TableRow>
              ) : (
                paginatedBlocks.map((block, index) => (
                  <TableRow 
                    key={block.villageBlockId} 
                    sx={{ backgroundColor: !block.isActive ? '#fafafa' : 'inherit' }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Chip label={block.blockCode} size="small" />
                    </TableCell>
                    <TableCell>{getVillageName(block.villageId)}</TableCell>
                    <TableCell>{block.villageId}</TableCell>
                    <TableCell align="center">{getStatusChip(block.isActive)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Block">
                        <IconButton color="primary" onClick={() => handleEditClick(block)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={block.isActive ? "Deactivate" : "Activate"}>
                        <IconButton 
                          color={block.isActive ? "warning" : "success"} 
                          onClick={() => handleToggleActive(block)} 
                          size="small" 
                          sx={{ ml: 1 }}
                        >
                          {block.isActive ? <Cancel /> : <CheckCircle />}
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
          count={filteredBlocks.length}
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
          Showing {paginatedBlocks.length} of {filteredBlocks.length} village blocks {searchTerm && "(filtered)"}
        </Typography>
      </Box>

      {/* Add New Village Block Modal */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        maxWidth="sm" 
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
            Add New Village Block
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the village block details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Block Code"
                fullWidth
                required
                value={newBlockData.blockCode}
                onChange={(e) => handleAddChange('blockCode', e.target.value)}
                error={!!addErrors.blockCode}
                helperText={addErrors.blockCode}
                placeholder="e.g., BLK1001"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!addErrors.villageId}>
                <InputLabel>Select Village</InputLabel>
                <Select
                  value={newBlockData.villageId}
                  label="Select Village"
                  onChange={(e) => handleAddChange('villageId', e.target.value)}
                >
                  <MenuItem value="">Select a village</MenuItem>
                  {villages.map((village) => (
                    <MenuItem key={village.villageId} value={village.villageId}>
                      {village.villageName} / {village.villageNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.villageId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.villageId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBlockData.isActive}
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
                  label={newBlockData.isActive ? "Active" : "Inactive"}
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
            onClick={handleSaveNewBlock}
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
            {isSaving ? "Adding..." : "Add Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Village Block Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="sm" 
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
            Edit Village Block
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            ID: {selectedBlock?.villageBlockId} | Current: {selectedBlock?.blockCode}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Block Code"
                fullWidth
                required
                value={editedData.blockCode || ''}
                onChange={(e) => handleEditChange('blockCode', e.target.value)}
                error={!!editErrors.blockCode}
                helperText={editErrors.blockCode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!editErrors.villageId}>
                <InputLabel>Select Village</InputLabel>
                <Select
                  value={editedData.villageId || ''}
                  label="Select Village"
                  onChange={(e) => handleEditChange('villageId', e.target.value)}
                >
                  <MenuItem value="">Select a village</MenuItem>
                  {villages.map((village) => (
                    <MenuItem key={village.villageId} value={village.villageId}>
                      {village.villageName} / {village.villageNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.villageId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.villageId}
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

// ==================== Local Body Management Tab ====================
// ==================== Local Body Management Tab ====================
const LocalBodyManagementTab = () => {
  const [localBodies, setLocalBodies] = useState([]);
  const [filteredLocalBodies, setFilteredLocalBodies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLocalBody, setSelectedLocalBody] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newLocalBodyData, setNewLocalBodyData] = useState({
    localbodyCode: "",
    distId: "",
    localbodyNameEn: "",
    localbodyNameMal: "",
    localbodyType: "",
    codeApi: "",
    lsgCode: "",
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
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch local bodies using SettingService
  const fetchLocalBodies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchAllLocalBodies();
      setLocalBodies(data);
      setFilteredLocalBodies(data);
      setPage(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch districts for dropdown using SettingService
  const fetchDistricts = useCallback(async () => {
    try {
      const data = await SettingService.fetchDistrictsRaw();
      setDistricts(data);
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error(err.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLocalBodies();
    fetchDistricts();
  }, [fetchLocalBodies, fetchDistricts]);

  // Filter local bodies based on search term
  useEffect(() => {
    let filtered = [...localBodies];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((lb) => 
        lb.localbodyNameEn?.toLowerCase().includes(term) || 
        lb.localbodyCode?.toLowerCase().includes(term) || 
        lb.codeApi?.toLowerCase().includes(term) ||
        lb.localbodyNameMal?.toLowerCase().includes(term)
      );
    }
    setFilteredLocalBodies(filtered);
    setPage(0);
  }, [searchTerm, localBodies]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedLocalBodies = filteredLocalBodies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper functions
  const getDistrictDisplay = (distId) => {
    const district = districts.find((d) => d.districtId === distId);
    if (!district) return "Unknown";
    return `${district.districtNameEn} / ${district.districtNameMal}`;
  };

  const getLocalBodyTypeLabel = (type) => {
    const option = LOCAL_BODY_TYPE_OPTIONS.find(opt => opt.value === type);
    return option ? option.label : "Unknown";
  };

  const getStatusChip = (isActive) => {
    return isActive ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  // Edit handlers
  const handleEditClick = (localBody) => {
    setSelectedLocalBody(localBody);
    setEditedData({
      localbodyId: localBody.localbodyId,
      localbodyCode: localBody.localbodyCode || "",
      distId: localBody.distId || "",
      localbodyNameEn: localBody.localbodyNameEn || "",
      localbodyNameMal: localBody.localbodyNameMal || "",
      localbodyType: localBody.localbodyType || "",
      codeApi: localBody.codeApi || "",
      lsgCode: localBody.lsgCode || "",
      isActive: localBody.isActive,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewLocalBodyData({
      localbodyCode: "",
      distId: "",
      localbodyNameEn: "",
      localbodyNameMal: "",
      localbodyType: "",
      codeApi: "",
      lsgCode: "",
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
    setNewLocalBodyData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation
  const validateData = (data) => {
    const errors = {};
    if (!data.localbodyCode?.trim()) errors.localbodyCode = "Local body code is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.localbodyNameEn?.trim()) errors.localbodyNameEn = "Local body name (English) is required";
    if (!data.localbodyNameMal?.trim()) errors.localbodyNameMal = "Local body name (Malayalam) is required";
    if (!data.localbodyType) errors.localbodyType = "Please select local body type";
    if (!data.codeApi?.trim()) errors.codeApi = "API code is required";
    if (!data.lsgCode?.trim()) errors.lsgCode = "LSG code is required";
    return errors;
  };

  // Save edited local body
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
        localbodyId: editedData.localbodyId,
        localbodyCode: editedData.localbodyCode,
        distId: editedData.distId,
        localbodyNameEn: editedData.localbodyNameEn,
        localbodyNameMal: editedData.localbodyNameMal,
        localbodyType: editedData.localbodyType,
        codeApi: editedData.codeApi,
        lsgCode: editedData.lsgCode,
        isActive: editedData.isActive,
      };
      await SettingService.saveLocalBody(payload);
      setSuccessMessage("Local body updated successfully!");
      setShowSuccessModal(true);
      toast.success("Local body updated successfully!");
      await fetchLocalBodies();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit local bodies.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A local body with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new local body
  const handleSaveNewLocalBody = async () => {
    const errors = validateData(newLocalBodyData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        localbodyCode: newLocalBodyData.localbodyCode,
        distId: newLocalBodyData.distId,
        localbodyNameEn: newLocalBodyData.localbodyNameEn,
        localbodyNameMal: newLocalBodyData.localbodyNameMal,
        localbodyType: newLocalBodyData.localbodyType,
        codeApi: newLocalBodyData.codeApi,
        lsgCode: newLocalBodyData.lsgCode,
        isActive: newLocalBodyData.isActive,
      };
      await SettingService.saveLocalBody(payload);
      setSuccessMessage("Local body added successfully!");
      setShowSuccessModal(true);
      toast.success("Local body added successfully!");
      await fetchLocalBodies();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add local bodies.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A local body with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (localBody) => {
    setIsSaving(true);
    try {
      await SettingService.toggleLocalBodyActive(localBody);
      const action = !localBody.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Local body "${localBody.localbodyNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Local body ${action}!`);
      await fetchLocalBodies();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change local body status.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Local Bodies...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }} 
        action={
          <Button color="inherit" size="small" onClick={fetchLocalBodies}>
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
          label="Search"
          size="small"
          placeholder="Search by name, code, API code or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLocalBodies}>
          Refresh
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          sx={{ ml: 'auto' }}
        >
          Add New Local Body
        </Button>
      </Paper>

      {/* Table */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Local Body Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Local Body Name (EN / ML)</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Type</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>API Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLocalBodies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No local bodies found</TableCell>
                </TableRow>
              ) : (
                paginatedLocalBodies.map((lb, index) => (
                  <TableRow 
                    key={lb.localbodyId} 
                    sx={{ backgroundColor: !lb.isActive ? '#fafafa' : 'inherit' }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Chip label={lb.localbodyCode} size="small" />
                    </TableCell>
                    <TableCell>
                      {lb.localbodyNameEn}
                      {lb.localbodyNameMal && (
                        <Typography 
                          variant="caption" 
                          display="block" 
                          sx={{ 
                            fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif', 
                            color: 'text.secondary' 
                          }}
                        >
                          {lb.localbodyNameMal}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getDistrictDisplay(lb.distId)}</TableCell>
                    <TableCell>{getLocalBodyTypeLabel(lb.localbodyType)}</TableCell>
                    <TableCell>{lb.codeApi}</TableCell>
                    <TableCell>{lb.lsgCode}</TableCell>
                    <TableCell align="center">{getStatusChip(lb.isActive)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Local Body">
                        <IconButton color="primary" onClick={() => handleEditClick(lb)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={lb.isActive ? "Deactivate" : "Activate"}>
                        <IconButton 
                          color={lb.isActive ? "warning" : "success"} 
                          onClick={() => handleToggleActive(lb)} 
                          size="small" 
                          sx={{ ml: 1 }}
                        >
                          {lb.isActive ? <Cancel /> : <CheckCircle />}
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
          count={filteredLocalBodies.length}
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
          Showing {paginatedLocalBodies.length} of {filteredLocalBodies.length} local bodies {searchTerm && "(filtered)"}
        </Typography>
      </Box>

      {/* Add New Local Body Modal */}
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
            Add New Local Body
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the local body details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Local Body Code"
                fullWidth
                required
                value={newLocalBodyData.localbodyCode}
                onChange={(e) => handleAddChange('localbodyCode', e.target.value)}
                error={!!addErrors.localbodyCode}
                helperText={addErrors.localbodyCode}
                placeholder="e.g., G01027"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!addErrors.distId}>
                <InputLabel>Select District</InputLabel>
                <Select
                  value={newLocalBodyData.distId}
                  label="Select District"
                  onChange={(e) => handleAddChange('distId', e.target.value)}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
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
                label="Local Body Name (English)"
                fullWidth
                required
                value={newLocalBodyData.localbodyNameEn}
                onChange={(e) => handleAddChange('localbodyNameEn', e.target.value)}
                error={!!addErrors.localbodyNameEn}
                helperText={addErrors.localbodyNameEn}
                placeholder="e.g., Thiruvananthapuram Corporation"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Local Body Name (Malayalam)"
                fullWidth
                required
                value={newLocalBodyData.localbodyNameMal}
                onChange={(e) => handleAddChange('localbodyNameMal', e.target.value)}
                error={!!addErrors.localbodyNameMal}
                helperText={addErrors.localbodyNameMal}
                InputProps={{ 
                  style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } 
                }}
                placeholder="e.g., തിരുവനന്തപുരം കോർപ്പറേഷൻ"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!addErrors.localbodyType}>
                <InputLabel>Select Local Body Type</InputLabel>
                <Select
                  value={newLocalBodyData.localbodyType}
                  label="Select Local Body Type"
                  onChange={(e) => handleAddChange('localbodyType', e.target.value)}
                >
                  <MenuItem value="">Select type</MenuItem>
                  {LOCAL_BODY_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.localbodyType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.localbodyType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="API Code"
                fullWidth
                required
                value={newLocalBodyData.codeApi}
                onChange={(e) => handleAddChange('codeApi', e.target.value)}
                error={!!addErrors.codeApi}
                helperText={addErrors.codeApi}
                placeholder="e.g., 01143"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LSG Code"
                fullWidth
                required
                value={newLocalBodyData.lsgCode}
                onChange={(e) => handleAddChange('lsgCode', e.target.value)}
                error={!!addErrors.lsgCode}
                helperText={addErrors.lsgCode}
                placeholder="e.g., 221763"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newLocalBodyData.isActive}
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
                  label={newLocalBodyData.isActive ? "Active" : "Inactive"}
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
            onClick={handleSaveNewLocalBody}
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
            {isSaving ? "Adding..." : "Add Local Body"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Local Body Modal */}
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
            Edit Local Body
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            ID: {selectedLocalBody?.localbodyId} | Current: {selectedLocalBody?.localbodyNameEn}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Local Body Code"
                fullWidth
                required
                value={editedData.localbodyCode || ''}
                onChange={(e) => handleEditChange('localbodyCode', e.target.value)}
                error={!!editErrors.localbodyCode}
                helperText={editErrors.localbodyCode}
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
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
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
                label="Local Body Name (English)"
                fullWidth
                required
                value={editedData.localbodyNameEn || ''}
                onChange={(e) => handleEditChange('localbodyNameEn', e.target.value)}
                error={!!editErrors.localbodyNameEn}
                helperText={editErrors.localbodyNameEn}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Local Body Name (Malayalam)"
                fullWidth
                required
                value={editedData.localbodyNameMal || ''}
                onChange={(e) => handleEditChange('localbodyNameMal', e.target.value)}
                error={!!editErrors.localbodyNameMal}
                helperText={editErrors.localbodyNameMal}
                InputProps={{ 
                  style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } 
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!editErrors.localbodyType}>
                <InputLabel>Select Local Body Type</InputLabel>
                <Select
                  value={editedData.localbodyType || ''}
                  label="Select Local Body Type"
                  onChange={(e) => handleEditChange('localbodyType', e.target.value)}
                >
                  <MenuItem value="">Select type</MenuItem>
                  {LOCAL_BODY_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.localbodyType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.localbodyType}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="API Code"
                fullWidth
                required
                value={editedData.codeApi || ''}
                onChange={(e) => handleEditChange('codeApi', e.target.value)}
                error={!!editErrors.codeApi}
                helperText={editErrors.codeApi}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LSG Code"
                fullWidth
                required
                value={editedData.lsgCode || ''}
                onChange={(e) => handleEditChange('lsgCode', e.target.value)}
                error={!!editErrors.lsgCode}
                helperText={editErrors.lsgCode}
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

// ==================== Master Block Management Tab ====================
// ==================== Master Block Management Tab ====================
const MasterBlockManagementTab = () => {
  const [blocks, setBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newBlockData, setNewBlockData] = useState({ 
    blockCode: "", 
    blockName: "", 
    district: "", 
    lsgCode: "", 
    valid: true 
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
    if (showSuccessModal) timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
    return () => clearTimeout(timeoutId);
  }, [showSuccessModal]);

  useEffect(() => {
    let timeoutId;
    if (showErrorModal) timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
    return () => clearTimeout(timeoutId);
  }, [showErrorModal]);

  // Fetch master blocks using SettingService
  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchAllMasterBlocks();
      setBlocks(data);
      setFilteredBlocks(data);
      setPage(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch districts for dropdown using SettingService
  const fetchDistricts = useCallback(async () => {
    try {
      const data = await SettingService.fetchDistrictsRaw();
      setDistricts(data);
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error(err.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBlocks();
    fetchDistricts();
  }, [fetchBlocks, fetchDistricts]);

  // Filter blocks based on search term
  useEffect(() => {
    let filtered = [...blocks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((block) => 
        block.blockName?.toLowerCase().includes(term) || 
        block.blockCode?.toLowerCase().includes(term) || 
        block.blockId?.toString().includes(term)
      );
    }
    setFilteredBlocks(filtered);
    setPage(0);
  }, [searchTerm, blocks]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedBlocks = filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper functions
  const getDistrictDisplay = (districtId) => {
    const district = districts.find((d) => d.districtId === districtId);
    if (!district) return "Unknown";
    return `${district.districtNameEn} / ${district.districtNameMal}`;
  };

  const getStatusChip = (isValid) => {
    return isValid ? (
      <Chip icon={<CheckCircle />} label="Active" color="success" size="small" />
    ) : (
      <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />
    );
  };

  // Edit handlers
  const handleEditClick = (block) => {
    setSelectedBlock(block);
    setEditedData({ 
      blockId: block.blockId, 
      blockCode: block.blockCode || "", 
      blockName: block.blockName || "", 
      district: block.district || "", 
      lsgCode: block.lsgCode || "", 
      valid: block.valid 
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewBlockData({ 
      blockCode: "", 
      blockName: "", 
      district: "", 
      lsgCode: "", 
      valid: true 
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
    setNewBlockData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validation
  const validateData = (data) => {
    const errors = {};
    if (!data.blockCode?.trim()) errors.blockCode = "Block code is required";
    if (!data.blockName?.trim()) errors.blockName = "Block name is required";
    if (!data.district) errors.district = "Please select a district";
    if (!data.lsgCode) errors.lsgCode = "LSG code is required";
    else if (isNaN(data.lsgCode) || data.lsgCode <= 0) errors.lsgCode = "Valid LSG code is required";
    return errors;
  };

  // Save edited block
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
        blockId: editedData.blockId, 
        blockCode: editedData.blockCode, 
        blockName: editedData.blockName,
        district: editedData.district, 
        lsgCode: editedData.lsgCode, 
        valid: editedData.valid 
      };
      await SettingService.saveMasterBlock(payload);
      setSuccessMessage("Block updated successfully!");
      setShowSuccessModal(true);
      toast.success("Block updated successfully!");
      await fetchBlocks();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A block with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new block
  const handleSaveNewBlock = async () => {
    const errors = validateData(newBlockData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = { 
        blockCode: newBlockData.blockCode, 
        blockName: newBlockData.blockName,
        district: newBlockData.district, 
        lsgCode: newBlockData.lsgCode, 
        valid: newBlockData.valid 
      };
      await SettingService.saveMasterBlock(payload);
      setSuccessMessage("Block added successfully!");
      setShowSuccessModal(true);
      toast.success("Block added successfully!");
      await fetchBlocks();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A block with this code already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (block) => {
    setIsSaving(true);
    try {
      await SettingService.toggleMasterBlockActive(block);
      const action = !block.valid ? "activated" : "deactivated";
      setSuccessMessage(`Block "${block.blockName}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Block ${action}!`);
      await fetchBlocks();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change block status.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Blocks...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 3 }} 
        action={
          <Button color="inherit" size="small" onClick={fetchBlocks}>
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
          label="Search"
          size="small"
          placeholder="Search by block name, code or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBlocks}>
          Refresh
        </Button>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddClick}
          sx={{ ml: 'auto' }}
        >
          Add New Block
        </Button>
      </Paper>

      {/* Table */}
      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No blocks found</TableCell>
                </TableRow>
              ) : (
                paginatedBlocks.map((block, index) => (
                  <TableRow 
                    key={block.blockId} 
                    sx={{ backgroundColor: !block.valid ? '#fafafa' : 'inherit' }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Chip label={block.blockCode} size="small" />
                    </TableCell>
                    <TableCell>{block.blockName}</TableCell>
                    <TableCell>{getDistrictDisplay(block.district)}</TableCell>
                    <TableCell>{block.lsgCode}</TableCell>
                    <TableCell align="center">{getStatusChip(block.valid)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Block">
                        <IconButton color="primary" onClick={() => handleEditClick(block)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={block.valid ? "Deactivate" : "Activate"}>
                        <IconButton 
                          color={block.valid ? "warning" : "success"} 
                          onClick={() => handleToggleActive(block)} 
                          size="small" 
                          sx={{ ml: 1 }}
                        >
                          {block.valid ? <Cancel /> : <CheckCircle />}
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
          count={filteredBlocks.length}
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
          Showing {paginatedBlocks.length} of {filteredBlocks.length} blocks {searchTerm && "(filtered)"}
        </Typography>
      </Box>

      {/* Add New Block Modal */}
      <Dialog 
        open={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        maxWidth="sm" 
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
            Add New Block
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Fill in the block details below
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Block Code"
                fullWidth
                required
                value={newBlockData.blockCode}
                onChange={(e) => handleAddChange('blockCode', e.target.value)}
                error={!!addErrors.blockCode}
                helperText={addErrors.blockCode}
                placeholder="e.g., B01003"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Block Name"
                fullWidth
                required
                value={newBlockData.blockName}
                onChange={(e) => handleAddChange('blockName', e.target.value)}
                error={!!addErrors.blockName}
                helperText={addErrors.blockName}
                placeholder="e.g., Athiyanoor"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!addErrors.district}>
                <InputLabel>Select District</InputLabel>
                <Select
                  value={newBlockData.district}
                  label="Select District"
                  onChange={(e) => handleAddChange('district', e.target.value)}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {addErrors.district && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {addErrors.district}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="LSG Code"
                type="number"
                fullWidth
                required
                value={newBlockData.lsgCode}
                onChange={(e) => handleAddChange('lsgCode', e.target.value)}
                error={!!addErrors.lsgCode}
                helperText={addErrors.lsgCode}
                placeholder="e.g., 6069"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBlockData.valid}
                      onChange={(e) => handleAddChange('valid', e.target.checked)}
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
                  label={newBlockData.valid ? "Active" : "Inactive"}
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
            onClick={handleSaveNewBlock}
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
            {isSaving ? "Adding..." : "Add Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Block Modal */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        maxWidth="sm" 
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
            Edit Block
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            ID: {selectedBlock?.blockId} | Current: {selectedBlock?.blockName}
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Block Code"
                fullWidth
                required
                value={editedData.blockCode || ''}
                onChange={(e) => handleEditChange('blockCode', e.target.value)}
                error={!!editErrors.blockCode}
                helperText={editErrors.blockCode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Block Name"
                fullWidth
                required
                value={editedData.blockName || ''}
                onChange={(e) => handleEditChange('blockName', e.target.value)}
                error={!!editErrors.blockName}
                helperText={editErrors.blockName}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!editErrors.district}>
                <InputLabel>Select District</InputLabel>
                <Select
                  value={editedData.district || ''}
                  label="Select District"
                  onChange={(e) => handleEditChange('district', e.target.value)}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.district && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {editErrors.district}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
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
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editedData.valid || false}
                      onChange={(e) => handleEditChange('valid', e.target.checked)}
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
                  label={editedData.valid ? "Active" : "Inactive"}
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

export default VillageSettings;