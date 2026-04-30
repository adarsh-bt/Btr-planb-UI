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
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 2, color: '#05307a' }}>
          Village Management
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

  const fetchRevenueTaluks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllRev`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueTaluks(data.filter(taluk => taluk.isActive === true));
      }
    } catch (err) {
      console.error("Error fetching revenue taluks:", err);
    }
  }, []);

  const fetchVillages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterVillage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied");
        if (response.status === 401) throw new Error("Session expired");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  useEffect(() => {
    fetchRevenueTaluks();
    fetchVillages();
  }, [fetchRevenueTaluks, fetchVillages]);

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
    setPage(0);
  }, [searchTerm, villages]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedVillages = filteredVillages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const validateData = (data) => {
    const errors = {};
    if (!data.villageNameEn?.trim()) errors.villageNameEn = "Village name (English) is required";
    if (!data.villageNameMal?.trim()) errors.villageNameMal = "Village name (Malayalam) is required";
    if (!data.revTalukId) errors.revTalukId = "Please select a revenue taluk";
    if (!data.villageCodeApi?.trim()) errors.villageCodeApi = "Village code API is required";
    if (!data.lsgCode && data.lsgCode !== 0) errors.lsgCode = "LSG code is required";
    return errors;
  };

  const saveVillage = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterVillage`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
      await saveVillage(payload);
      setSuccessMessage("Village updated successfully!");
      setShowSuccessModal(true);
      toast.success("Village updated!");
      await fetchVillages();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit villages.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewVillage = async () => {
    const errors = validateData(newVillageData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
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
      await saveVillage(payload);
      setSuccessMessage("Village added successfully!");
      setShowSuccessModal(true);
      toast.success("Village added!");
      await fetchVillages();
      setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add villages.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A village with this name already exists.";
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
      await saveVillage(payload);
      const action = !village.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Village "${village.villageNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Village ${action}!`);
      await fetchVillages();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change village status.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Villages...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }} action={<Button color="inherit" size="small" onClick={fetchVillages}>Retry</Button>}>
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search Village"
          size="small"
          placeholder="Search by name (EN/ML)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchVillages}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ ml: 'auto' }}>
          Add New Village
        </Button>
      </Paper>

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
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
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVillages.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center">No villages found</TableCell></TableRow>
              ) : (
                paginatedVillages.map((village) => (
                  <TableRow key={village.villageId} sx={{ backgroundColor: !village.isActive ? '#fafafa' : 'inherit' }}>
                    <TableCell>{village.villageId}</TableCell>
                    <TableCell>{village.villageNameEn}</TableCell>
                    <TableCell sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }}>{village.villageNameMal}</TableCell>
                    <TableCell>{getRevenueTalukName(village.revTalukId)}</TableCell>
                    <TableCell align="center">{village.villageCodeApi}</TableCell>
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

      {/* Add/Edit Modals - Village Management */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Add New Village</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Name (English)" fullWidth required value={newVillageData.villageNameEn}
                onChange={(e) => handleAddChange('villageNameEn', e.target.value)} error={!!addErrors.villageNameEn}
                helperText={addErrors.villageNameEn} placeholder="e.g., Thiruvananthapuram" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Name (Malayalam)" fullWidth required value={newVillageData.villageNameMal}
                onChange={(e) => handleAddChange('villageNameMal', e.target.value)} error={!!addErrors.villageNameMal}
                helperText={addErrors.villageNameMal} InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!addErrors.revTalukId}>
                <InputLabel>Select Revenue Taluk</InputLabel>
                <Select value={newVillageData.revTalukId} label="Select Revenue Taluk"
                  onChange={(e) => handleAddChange('revTalukId', e.target.value)}>
                  {revenueTaluks.map((taluk) => (
                    <MenuItem key={taluk.revTalukId} value={taluk.revTalukId}>{taluk.revTalukNameEn}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Code API" fullWidth required value={newVillageData.villageCodeApi}
                onChange={(e) => handleAddChange('villageCodeApi', e.target.value)} error={!!addErrors.villageCodeApi}
                helperText={addErrors.villageCodeApi} placeholder="e.g., TVM001" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="LSG Code" type="number" fullWidth required value={newVillageData.lsgCode}
                onChange={(e) => handleAddChange('lsgCode', e.target.value)} error={!!addErrors.lsgCode}
                helperText={addErrors.lsgCode} placeholder="e.g., 12345" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Census Code 2001" fullWidth value={newVillageData.censusCode2001}
                onChange={(e) => handleAddChange('censusCode2001', e.target.value)} placeholder="e.g., 123456" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Census Code 2011" fullWidth value={newVillageData.censusCode2011}
                onChange={(e) => handleAddChange('censusCode2011', e.target.value)} placeholder="e.g., 1234567" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
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
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveNewVillage}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Adding..." : "Add Village"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Edit Village</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Name (English)" fullWidth required value={editedData.villageNameEn || ''}
                onChange={(e) => handleEditChange('villageNameEn', e.target.value)} error={!!editErrors.villageNameEn}
                helperText={editErrors.villageNameEn} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Name (Malayalam)" fullWidth required value={editedData.villageNameMal || ''}
                onChange={(e) => handleEditChange('villageNameMal', e.target.value)} error={!!editErrors.villageNameMal}
                helperText={editErrors.villageNameMal} InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!editErrors.revTalukId}>
                <InputLabel>Select Revenue Taluk</InputLabel>
                <Select value={editedData.revTalukId || ''} label="Select Revenue Taluk"
                  onChange={(e) => handleEditChange('revTalukId', e.target.value)}>
                  {revenueTaluks.map((taluk) => (
                    <MenuItem key={taluk.revTalukId} value={taluk.revTalukId}>{taluk.revTalukNameEn}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Village Code API" fullWidth required value={editedData.villageCodeApi || ''}
                onChange={(e) => handleEditChange('villageCodeApi', e.target.value)} error={!!editErrors.villageCodeApi}
                helperText={editErrors.villageCodeApi} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="LSG Code" type="number" fullWidth required value={editedData.lsgCode || ''}
                onChange={(e) => handleEditChange('lsgCode', e.target.value)} error={!!editErrors.lsgCode}
                helperText={editErrors.lsgCode} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Census Code 2001" fullWidth value={editedData.censusCode2001 || ''}
                onChange={(e) => handleEditChange('censusCode2001', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Census Code 2011" fullWidth value={editedData.censusCode2011 || ''}
                onChange={(e) => handleEditChange('censusCode2011', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
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
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Modals */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button></DialogActions>
      </Dialog>

      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button></DialogActions>
      </Dialog>
    </>
  );
};

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
  const [newBlockData, setNewBlockData] = useState({ blockCode: "", villageId: "", isActive: true });
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

  const fetchVillageBlocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllVillageBlock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied");
        if (response.status === 401) throw new Error("Session expired");
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
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

  const fetchVillages = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterVillage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVillages(data.map((village) => ({ villageId: village.villageId, villageName: village.villageNameEn, villageNameMal: village.villageNameMal })));
      }
    } catch (err) {
      console.error("Error fetching villages:", err);
    }
  }, []);

  useEffect(() => {
    fetchVillageBlocks();
    fetchVillages();
  }, [fetchVillageBlocks, fetchVillages]);

  useEffect(() => {
    let filtered = [...villageBlocks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((block) => {
        const village = villages.find((v) => v.villageId === block.villageId);
        const villageName = village?.villageName?.toLowerCase() || "";
        return block.blockCode?.toLowerCase().includes(term) || villageName.includes(term) || block.villageBlockId?.toString().includes(term);
      });
    }
    setFilteredBlocks(filtered);
    setPage(0);
  }, [searchTerm, villageBlocks, villages]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedBlocks = filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getVillageName = (villageId) => {
    const village = villages.find((v) => v.villageId === villageId);
    if (!village) return "Unknown Village";
    return `${village.villageName} / ${village.villageNameMal}`;
  };

  const getStatusChip = (isActive) => {
    return isActive ? <Chip icon={<CheckCircle />} label="Active" color="success" size="small" /> : <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />;
  };

  const handleEditClick = (block) => {
    setSelectedBlock(block);
    setEditedData({ villageBlockId: block.villageBlockId, blockCode: block.blockCode, villageId: block.villageId, isActive: block.isActive });
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
      setEditErrors((prev) => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const handleAddChange = (field, value) => {
    setNewBlockData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) {
      setAddErrors((prev) => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
    }
  };

  const validateData = (data) => {
    const errors = {};
    if (!data.blockCode?.trim()) errors.blockCode = "Block code is required";
    if (!data.villageId) errors.villageId = "Please select a village";
    return errors;
  };

  const saveVillageBlock = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateVillageBlock`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
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
      const userId = authservice.userid();
      const payload = { villageBlockId: editedData.villageBlockId, blockCode: editedData.blockCode, villageId: Number(editedData.villageId), isActive: editedData.isActive, userId: userId };
      await saveVillageBlock(payload);
      setSuccessMessage("Village block updated successfully!");
      setShowSuccessModal(true);
      toast.success("Village block updated!");
      await fetchVillageBlocks();
      setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit village blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewBlock = async () => {
    const errors = validateData(newBlockData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { blockCode: newBlockData.blockCode, villageId: Number(newBlockData.villageId), userId: userId };
      await saveVillageBlock(payload);
      setSuccessMessage("Village block added successfully!");
      setShowSuccessModal(true);
      toast.success("Village block added!");
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

  const handleToggleActive = async (block) => {
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { villageBlockId: block.villageBlockId, blockCode: block.blockCode, villageId: block.villageId, isActive: !block.isActive, userId: userId };
      await saveVillageBlock(payload);
      const action = !block.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Village block "${block.blockCode}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Village block ${action}!`);
      await fetchVillageBlocks();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change status.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Village Blocks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }} action={<Button color="inherit" size="small" onClick={fetchVillageBlocks}>Retry</Button>}>
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Search" size="small" placeholder="Search by block code, village name or ID..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 250 }} />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchVillageBlocks}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ ml: 'auto' }}>Add New Block</Button>
      </Paper>

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Village ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlocks.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No village blocks found</TableCell></TableRow>
              ) : (
                paginatedBlocks.map((block) => (
                  <TableRow key={block.villageBlockId} sx={{ backgroundColor: !block.isActive ? '#fafafa' : 'inherit' }}>
                    <TableCell>{block.villageBlockId}</TableCell>
                    <TableCell><Chip label={block.blockCode} size="small" /></TableCell>
                    <TableCell>{getVillageName(block.villageId)}</TableCell>
                    <TableCell>{block.villageId}</TableCell>
                    <TableCell align="center">{getStatusChip(block.isActive)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Block"><IconButton color="primary" onClick={() => handleEditClick(block)} size="small"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title={block.isActive ? "Deactivate" : "Activate"}>
                        <IconButton color={block.isActive ? "warning" : "success"} onClick={() => handleToggleActive(block)} size="small" sx={{ ml: 1 }}>
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
        <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={filteredBlocks.length}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`} />
      </Paper>

      {/* Add/Edit Modals - Village Block Management */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}><Typography variant="h6">Add New Village Block</Typography></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField label="Block Code" fullWidth required value={newBlockData.blockCode}
              onChange={(e) => handleAddChange('blockCode', e.target.value)} error={!!addErrors.blockCode}
              helperText={addErrors.blockCode} placeholder="e.g., BLK1001" /></Grid>
            <Grid item xs={12}><TextField select label="Village" fullWidth required value={newBlockData.villageId}
              onChange={(e) => handleAddChange('villageId', e.target.value)} error={!!addErrors.villageId}
              helperText={addErrors.villageId}>
              <MenuItem value="">Select a village</MenuItem>
              {villages.map((village) => (<MenuItem key={village.villageId} value={village.villageId}>{village.villageName}</MenuItem>))}
            </TextField></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveNewBlock}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Adding..." : "Add Block"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
          <Typography variant="h6">Edit Village Block</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField label="Block Code" fullWidth required value={editedData.blockCode || ''}
              onChange={(e) => handleEditChange('blockCode', e.target.value)} error={!!editErrors.blockCode}
              helperText={editErrors.blockCode} /></Grid>
            <Grid item xs={12}><TextField select label="Village" fullWidth required value={editedData.villageId || ''}
              onChange={(e) => handleEditChange('villageId', e.target.value)} error={!!editErrors.villageId}
              helperText={editErrors.villageId}>
              <MenuItem value="">Select a village</MenuItem>
              {villages.map((village) => (<MenuItem key={village.villageId} value={village.villageId}>{village.villageName}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12}><Paper variant="outlined" sx={{ p: 2 }}>
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
              />
            </Paper></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Modals */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button></DialogActions>
      </Dialog>

      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button></DialogActions>
      </Dialog>
    </>
  );
};

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
    localbodyCode: "", distId: "", localbodyNameEn: "", localbodyNameMal: "", localbodyType: "", codeApi: "", lsgCode: "", isActive: true,
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

  const fetchLocalBodies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllLocalBody`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch local bodies: ${response.status}`);
      const data = await response.json();
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

  const fetchDistricts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  }, []);

  useEffect(() => {
    fetchLocalBodies();
    fetchDistricts();
  }, [fetchLocalBodies, fetchDistricts]);

  useEffect(() => {
    let filtered = [...localBodies];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((lb) => lb.localbodyNameEn?.toLowerCase().includes(term) || lb.localbodyCode?.toLowerCase().includes(term) || lb.codeApi?.toLowerCase().includes(term));
    }
    setFilteredLocalBodies(filtered);
    setPage(0);
  }, [searchTerm, localBodies]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedLocalBodies = filteredLocalBodies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    return isActive ? <Chip icon={<CheckCircle />} label="Active" color="success" size="small" /> : <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />;
  };

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

  const saveLocalBody = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateLocalBody`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (response.status === 403) throw new Error("Access denied");
    if (response.status === 401) throw new Error("Session expired");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return await response.text();
  };

  const handleEditClick = (localBody) => {
    setSelectedLocalBody(localBody);
    setEditedData({
      localbodyId: localBody.localbodyId, localbodyCode: localBody.localbodyCode || "", distId: localBody.distId || "",
      localbodyNameEn: localBody.localbodyNameEn || "", localbodyNameMal: localBody.localbodyNameMal || "", localbodyType: localBody.localbodyType || "",
      codeApi: localBody.codeApi || "", lsgCode: localBody.lsgCode || "", isActive: localBody.isActive,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewLocalBodyData({ localbodyCode: "", distId: "", localbodyNameEn: "", localbodyNameMal: "", localbodyType: "", codeApi: "", lsgCode: "", isActive: true });
    setAddErrors({});
    setAddModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) delete editErrors[field];
  };

  const handleAddChange = (field, value) => {
    setNewLocalBodyData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) delete addErrors[field];
  };

  const handleSaveEdit = async () => {
    const errors = validateData(editedData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fix validation errors"); return; }
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { localbodyId: editedData.localbodyId, localbodyCode: editedData.localbodyCode, distId: Number(editedData.distId),
        localbodyNameEn: editedData.localbodyNameEn, localbodyNameMal: editedData.localbodyNameMal, localbodyType: Number(editedData.localbodyType),
        codeApi: editedData.codeApi, lsgCode: editedData.lsgCode, isActive: editedData.isActive, userId: userId };
      await saveLocalBody(payload);
      setSuccessMessage("Local body updated successfully!"); setShowSuccessModal(true); toast.success("Local body updated!");
      await fetchLocalBodies(); setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit local bodies.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  const handleSaveNewLocalBody = async () => {
    const errors = validateData(newLocalBodyData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fix validation errors"); return; }
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { localbodyCode: newLocalBodyData.localbodyCode, distId: Number(newLocalBodyData.distId),
        localbodyNameEn: newLocalBodyData.localbodyNameEn, localbodyNameMal: newLocalBodyData.localbodyNameMal,
        localbodyType: Number(newLocalBodyData.localbodyType), codeApi: newLocalBodyData.codeApi, lsgCode: newLocalBodyData.lsgCode,
        isActive: newLocalBodyData.isActive, userId: userId };
      await saveLocalBody(payload);
      setSuccessMessage("Local body added successfully!"); setShowSuccessModal(true); toast.success("Local body added!");
      await fetchLocalBodies(); setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add local bodies.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A local body with this code already exists.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  const handleToggleActive = async (localBody) => {
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { ...localBody, isActive: !localBody.isActive, userId: userId };
      await saveLocalBody(payload);
      const action = !localBody.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Local body "${localBody.localbodyNameEn}" ${action} successfully!`);
      setShowSuccessModal(true); toast.success(`Local body ${action}!`);
      await fetchLocalBodies();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change local body status.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress /><Typography sx={{ ml: 2 }}>Loading Local Bodies...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }} action={<Button color="inherit" size="small" onClick={fetchLocalBodies}>Retry</Button>}>
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography><Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Search" size="small" placeholder="Search by name, code, API code or ID..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 250 }} />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchLocalBodies}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ ml: 'auto' }}>Add New Local Body</Button>
      </Paper>

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
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
              {paginatedLocalBodies.length === 0 ? (<TableRow><TableCell colSpan={9} align="center">No local bodies found</TableCell></TableRow>) : (
                paginatedLocalBodies.map((lb) => (
                  <TableRow key={lb.localbodyId} sx={{ backgroundColor: !lb.isActive ? '#fafafa' : 'inherit' }}>
                    <TableCell>{lb.localbodyId}</TableCell>
                    <TableCell><Chip label={lb.localbodyCode} size="small" /></TableCell>
                    <TableCell>{lb.localbodyNameEn}{lb.localbodyNameMal && (<Typography variant="caption" display="block" sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif', color: 'text.secondary' }}>{lb.localbodyNameMal}</Typography>)}</TableCell>
                    <TableCell>{getDistrictDisplay(lb.distId)}</TableCell>
                    <TableCell>{getLocalBodyTypeLabel(lb.localbodyType)}</TableCell>
                    <TableCell>{lb.codeApi}</TableCell>
                    <TableCell>{lb.lsgCode}</TableCell>
                    <TableCell align="center">{getStatusChip(lb.isActive)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Local Body"><IconButton color="primary" onClick={() => handleEditClick(lb)} size="small"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title={lb.isActive ? "Deactivate" : "Activate"}>
                        <IconButton color={lb.isActive ? "warning" : "success"} onClick={() => handleToggleActive(lb)} size="small" sx={{ ml: 1 }}>
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
        <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={filteredLocalBodies.length}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`} />
      </Paper>

      {/* Add/Edit Modals - Local Body Management */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}><Typography variant="h6">Add New Local Body</Typography></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField label="Local Body Code" fullWidth required value={newLocalBodyData.localbodyCode}
              onChange={(e) => handleAddChange('localbodyCode', e.target.value)} error={!!addErrors.localbodyCode}
              helperText={addErrors.localbodyCode} placeholder="e.g., G01027" /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="District" fullWidth required value={newLocalBodyData.distId}
              onChange={(e) => handleAddChange('distId', e.target.value)} error={!!addErrors.distId} helperText={addErrors.distId}>
              <MenuItem value="">Select district</MenuItem>
              {districts.map((dist) => (<MenuItem key={dist.districtId} value={dist.districtId}>{dist.districtNameEn} / {dist.districtNameMal}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="Local Body Name (English)" fullWidth required value={newLocalBodyData.localbodyNameEn}
              onChange={(e) => handleAddChange('localbodyNameEn', e.target.value)} error={!!addErrors.localbodyNameEn}
              helperText={addErrors.localbodyNameEn} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Local Body Name (Malayalam)" fullWidth required value={newLocalBodyData.localbodyNameMal}
              onChange={(e) => handleAddChange('localbodyNameMal', e.target.value)} error={!!addErrors.localbodyNameMal}
              helperText={addErrors.localbodyNameMal} InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Local Body Type" fullWidth required value={newLocalBodyData.localbodyType}
              onChange={(e) => handleAddChange('localbodyType', e.target.value)} error={!!addErrors.localbodyType} helperText={addErrors.localbodyType}>
              <MenuItem value="">Select type</MenuItem>
              {LOCAL_BODY_TYPE_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="API Code" fullWidth required value={newLocalBodyData.codeApi}
              onChange={(e) => handleAddChange('codeApi', e.target.value)} error={!!addErrors.codeApi}
              helperText={addErrors.codeApi} placeholder="e.g., 01143" /></Grid>
            <Grid item xs={12} sm={6}><TextField label="LSG Code" fullWidth required value={newLocalBodyData.lsgCode}
              onChange={(e) => handleAddChange('lsgCode', e.target.value)} error={!!addErrors.lsgCode}
              helperText={addErrors.lsgCode} placeholder="e.g., 221763" /></Grid>
            <Grid item xs={12} sm={6}><Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
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
              />
            </Paper></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveNewLocalBody}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Adding..." : "Add Local Body"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}><Typography variant="h6">Edit Local Body</Typography></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField label="Local Body Code" fullWidth required value={editedData.localbodyCode || ''}
              onChange={(e) => handleEditChange('localbodyCode', e.target.value)} error={!!editErrors.localbodyCode}
              helperText={editErrors.localbodyCode} /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="District" fullWidth required value={editedData.distId || ''}
              onChange={(e) => handleEditChange('distId', e.target.value)} error={!!editErrors.distId} helperText={editErrors.distId}>
              <MenuItem value="">Select district</MenuItem>
              {districts.map((dist) => (<MenuItem key={dist.districtId} value={dist.districtId}>{dist.districtNameEn} / {dist.districtNameMal}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="Local Body Name (English)" fullWidth required value={editedData.localbodyNameEn || ''}
              onChange={(e) => handleEditChange('localbodyNameEn', e.target.value)} error={!!editErrors.localbodyNameEn}
              helperText={editErrors.localbodyNameEn} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="Local Body Name (Malayalam)" fullWidth required value={editedData.localbodyNameMal || ''}
              onChange={(e) => handleEditChange('localbodyNameMal', e.target.value)} error={!!editErrors.localbodyNameMal}
              helperText={editErrors.localbodyNameMal} InputProps={{ style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' } }} /></Grid>
            <Grid item xs={12} sm={6}><TextField select label="Local Body Type" fullWidth required value={editedData.localbodyType || ''}
              onChange={(e) => handleEditChange('localbodyType', e.target.value)} error={!!editErrors.localbodyType} helperText={editErrors.localbodyType}>
              <MenuItem value="">Select type</MenuItem>
              {LOCAL_BODY_TYPE_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12} sm={6}><TextField label="API Code" fullWidth required value={editedData.codeApi || ''}
              onChange={(e) => handleEditChange('codeApi', e.target.value)} error={!!editErrors.codeApi}
              helperText={editErrors.codeApi} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="LSG Code" fullWidth required value={editedData.lsgCode || ''}
              onChange={(e) => handleEditChange('lsgCode', e.target.value)} error={!!editErrors.lsgCode}
              helperText={editErrors.lsgCode} /></Grid>
            <Grid item xs={12} sm={6}><Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={editedData.isActive || false} onChange={(e) => handleEditChange('isActive', e.target.checked)} color="success" />}
                label={editedData.isActive ? "Active" : "Inactive"} />
            </Paper></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Modals */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button></DialogActions>
      </Dialog>

      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button></DialogActions>
      </Dialog>
    </>
  );
};

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
  const [newBlockData, setNewBlockData] = useState({ blockCode: "", blockName: "", district: "", lsgCode: "", valid: true });
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

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterBlock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to fetch blocks: ${response.status}`);
      const data = await response.json();
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

  const fetchDistricts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
    fetchDistricts();
  }, [fetchBlocks, fetchDistricts]);

  useEffect(() => {
    let filtered = [...blocks];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((block) => block.blockName?.toLowerCase().includes(term) || block.blockCode?.toLowerCase().includes(term) || block.blockId?.toString().includes(term));
    }
    setFilteredBlocks(filtered);
    setPage(0);
  }, [searchTerm, blocks]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedBlocks = filteredBlocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getDistrictDisplay = (districtId) => {
    const district = districts.find((d) => d.districtId === districtId);
    if (!district) return "Unknown";
    return `${district.districtNameEn} / ${district.districtNameMal}`;
  };

  const getStatusChip = (isValid) => {
    return isValid ? <Chip icon={<CheckCircle />} label="Active" color="success" size="small" /> : <Chip icon={<Cancel />} label="Inactive" color="error" size="small" />;
  };

  const validateData = (data) => {
    const errors = {};
    if (!data.blockCode?.trim()) errors.blockCode = "Block code is required";
    if (!data.blockName?.trim()) errors.blockName = "Block name is required";
    if (!data.district) errors.district = "Please select a district";
    if (!data.lsgCode) errors.lsgCode = "LSG code is required";
    else if (isNaN(data.lsgCode) || data.lsgCode <= 0) errors.lsgCode = "Valid LSG code is required";
    return errors;
  };

  const saveBlock = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateBlock`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (response.status === 403) throw new Error("Access denied");
    if (response.status === 401) throw new Error("Session expired");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    return await response.text();
  };

  const handleEditClick = (block) => {
    setSelectedBlock(block);
    setEditedData({ blockId: block.blockId, blockCode: block.blockCode || "", blockName: block.blockName || "", district: block.district || "", lsgCode: block.lsgCode || "", valid: block.valid });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewBlockData({ blockCode: "", blockName: "", district: "", lsgCode: "", valid: true });
    setAddErrors({});
    setAddModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    if (editErrors[field]) delete editErrors[field];
  };

  const handleAddChange = (field, value) => {
    setNewBlockData((prev) => ({ ...prev, [field]: value }));
    if (addErrors[field]) delete addErrors[field];
  };

  const handleSaveEdit = async () => {
    const errors = validateData(editedData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fix validation errors"); return; }
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { blockId: editedData.blockId, blockCode: editedData.blockCode, blockName: editedData.blockName,
        district: Number(editedData.district), lsgCode: Number(editedData.lsgCode), userId: userId, valid: editedData.valid };
      await saveBlock(payload);
      setSuccessMessage("Block updated successfully!"); setShowSuccessModal(true); toast.success("Block updated!");
      await fetchBlocks(); setEditModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  const handleSaveNewBlock = async () => {
    const errors = validateData(newBlockData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fix validation errors"); return; }
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { blockCode: newBlockData.blockCode, blockName: newBlockData.blockName, district: Number(newBlockData.district),
        lsgCode: Number(newBlockData.lsgCode), userId: userId, valid: newBlockData.valid };
      await saveBlock(payload);
      setSuccessMessage("Block added successfully!"); setShowSuccessModal(true); toast.success("Block added!");
      await fetchBlocks(); setAddModalOpen(false);
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add blocks.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A block with this code already exists.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  const handleToggleActive = async (block) => {
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = { ...block, valid: !block.valid, userId: userId };
      await saveBlock(payload);
      const action = !block.valid ? "activated" : "deactivated";
      setSuccessMessage(`Block "${block.blockName}" ${action} successfully!`);
      setShowSuccessModal(true); toast.success(`Block ${action}!`);
      await fetchBlocks();
    } catch (err) {
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change block status.";
      setErrorMessage(errorMsg); setShowErrorModal(true); toast.error(errorMsg);
    } finally { setIsSaving(false); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress /><Typography sx={{ ml: 2 }}>Loading Blocks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }} action={<Button color="inherit" size="small" onClick={fetchBlocks}>Retry</Button>}>
        <Typography variant="subtitle1" fontWeight="bold">Access Error</Typography><Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Search" size="small" placeholder="Search by block name, code or ID..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} sx={{ minWidth: 250 }} />
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBlocks}>Refresh</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick} sx={{ ml: 'auto' }}>Add New Block</Button>
      </Paper>

      <Paper elevation={3}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Block Name</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>LSG Code</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBlocks.length === 0 ? (<TableRow><TableCell colSpan={7} align="center">No blocks found</TableCell></TableRow>) : (
                paginatedBlocks.map((block) => (
                  <TableRow key={block.blockId} sx={{ backgroundColor: !block.valid ? '#fafafa' : 'inherit' }}>
                    <TableCell>{block.blockId}</TableCell>
                    <TableCell><Chip label={block.blockCode} size="small" /></TableCell>
                    <TableCell>{block.blockName}</TableCell>
                    <TableCell>{getDistrictDisplay(block.district)}</TableCell>
                    <TableCell>{block.lsgCode}</TableCell>
                    <TableCell align="center">{getStatusChip(block.valid)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Block"><IconButton color="primary" onClick={() => handleEditClick(block)} size="small"><EditIcon /></IconButton></Tooltip>
                      <Tooltip title={block.valid ? "Deactivate" : "Activate"}>
                        <IconButton color={block.valid ? "warning" : "success"} onClick={() => handleToggleActive(block)} size="small" sx={{ ml: 1 }}>
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
        <TablePagination rowsPerPageOptions={[5, 10, 25, 50, 100]} component="div" count={filteredBlocks.length}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`} />
      </Paper>

      {/* Add/Edit Modals - Master Block Management */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}><Typography variant="h6">Add New Block</Typography></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField label="Block Code" fullWidth required value={newBlockData.blockCode}
              onChange={(e) => handleAddChange('blockCode', e.target.value)} error={!!addErrors.blockCode}
              helperText={addErrors.blockCode} placeholder="e.g., B01003" /></Grid>
            <Grid item xs={12}><TextField label="Block Name" fullWidth required value={newBlockData.blockName}
              onChange={(e) => handleAddChange('blockName', e.target.value)} error={!!addErrors.blockName}
              helperText={addErrors.blockName} placeholder="e.g., Athiyanoor" /></Grid>
            <Grid item xs={12}><TextField select label="District" fullWidth required value={newBlockData.district}
              onChange={(e) => handleAddChange('district', e.target.value)} error={!!addErrors.district} helperText={addErrors.district}>
              <MenuItem value="">Select district</MenuItem>
              {districts.map((dist) => (<MenuItem key={dist.districtId} value={dist.districtId}>{dist.districtNameEn} / {dist.districtNameMal}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12}><TextField label="LSG Code" type="number" fullWidth required value={newBlockData.lsgCode}
              onChange={(e) => handleAddChange('lsgCode', e.target.value)} error={!!addErrors.lsgCode}
              helperText={addErrors.lsgCode} placeholder="e.g., 6069" /></Grid>
            <Grid item xs={12}><Paper variant="outlined" sx={{ p: 2 }}>
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
              />
            </Paper></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSaveNewBlock}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
            sx={{
              backgroundColor: '#05307a',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#04265f',
              },
              '&.Mui-disabled': {
                backgroundColor: '#a0a0a0',
                color: '#fff',
              },
            }}
          >
            {isSaving ? "Adding..." : "Add Block"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}><Typography variant="h6">Edit Block</Typography></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField label="Block Code" fullWidth required value={editedData.blockCode || ''}
              onChange={(e) => handleEditChange('blockCode', e.target.value)} error={!!editErrors.blockCode}
              helperText={editErrors.blockCode} /></Grid>
            <Grid item xs={12}><TextField label="Block Name" fullWidth required value={editedData.blockName || ''}
              onChange={(e) => handleEditChange('blockName', e.target.value)} error={!!editErrors.blockName}
              helperText={editErrors.blockName} /></Grid>
            <Grid item xs={12}><TextField select label="District" fullWidth required value={editedData.district || ''}
              onChange={(e) => handleEditChange('district', e.target.value)} error={!!editErrors.district} helperText={editErrors.district}>
              <MenuItem value="">Select district</MenuItem>
              {districts.map((dist) => (<MenuItem key={dist.districtId} value={dist.districtId}>{dist.districtNameEn} / {dist.districtNameMal}</MenuItem>))}
            </TextField></Grid>
            <Grid item xs={12}><TextField label="LSG Code" type="number" fullWidth required value={editedData.lsgCode || ''}
              onChange={(e) => handleEditChange('lsgCode', e.target.value)} error={!!editErrors.lsgCode}
              helperText={editErrors.lsgCode} /></Grid>
            <Grid item xs={12}><Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel control={<Switch checked={editedData.valid || false} onChange={(e) => handleEditChange('valid', e.target.checked)} color="success" />}
                label={editedData.valid ? "Active" : "Inactive"} />
            </Paper></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary" disabled={isSaving} startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Modals */}
      <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{successMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowSuccessModal(false)} variant="contained" color="success">OK</Button></DialogActions>
      </Dialog>

      <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle><Box sx={{ textAlign: 'center' }}><ErrorIcon sx={{ fontSize: 60, color: '#f44336', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#f44336' }}>Error!</Typography></Box></DialogTitle>
        <DialogContent><DialogContentText sx={{ textAlign: 'center' }}>{errorMessage}</DialogContentText></DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}><Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button></DialogActions>
      </Dialog>
    </>
  );
};

export default VillageSettings;