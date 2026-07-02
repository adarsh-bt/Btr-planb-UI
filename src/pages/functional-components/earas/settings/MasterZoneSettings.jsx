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
  TablePagination,
  FormControl,
  InputLabel,
  Select,
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
import Breadcrumb from "routes/Breadcrumb";
import SettingService from "./SettingService";

// BTR type options (adjust according to your business logic)
const BTR_TYPE_OPTIONS = [
  { value: 1, label: "BTR" },
  { value: 2, label: "Non BTR" },
];

const MasterZoneSettings = () => {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dropdown data
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [newZoneData, setNewZoneData] = useState({
    zoneNameEn: "",
    zoneNameMal: "",
    distId: "",
    desTalukId: "",
    btrTypeId: "",
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

  // Fetch zones using SettingService
  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await SettingService.fetchAllMasterZones();
      setZones(data);
      setFilteredZones(data);
      setPage(0);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch districts using SettingService
  const fetchDistricts = useCallback(async () => {
    try {
      const data = await SettingService.fetchDistrictsRaw();
      setDistricts(data);
    } catch (err) {
      console.error("Error fetching districts:", err);
      toast.error(err.message);
    }
  }, []);

  // Fetch taluks using SettingService
  const fetchTaluks = useCallback(async () => {
    try {
      const data = await SettingService.fetchAllTaluks();
      setTaluks(data);
    } catch (err) {
      console.error("Error fetching taluks:", err);
      toast.error(err.message);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchZones();
    fetchDistricts();
    fetchTaluks();
  }, [fetchZones, fetchDistricts, fetchTaluks]);

  // Filter zones
  useEffect(() => {
    let filtered = [...zones];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (zone) =>
          zone.zoneNameEn?.toLowerCase().includes(term) ||
          zone.zoneNameMal?.toLowerCase().includes(term) ||
          zone.zoneCode?.toLowerCase().includes(term) ||
          zone.zoneId?.toString().includes(term)
      );
    }
    setFilteredZones(filtered);
    setPage(0);
  }, [searchTerm, zones]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedZones = filteredZones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Helper to get district display name (EN / ML)
  const getDistrictDisplay = (distId) => {
    const district = districts.find((d) => d.districtId === distId);
    if (!district) return "Unknown";
    return `${district.districtNameEn} / ${district.districtNameMal}`;
  };

  // Helper to get taluk display name (EN / ML)
  const getTalukDisplay = (talukId) => {
    const taluk = taluks.find((t) => t.desTalukId === talukId);
    if (!taluk) return "Unknown";
    return `${taluk.desTalukNameEn} / ${taluk.desTalukNameMal}`;
  };

  // Edit & Add handlers
  const handleEditClick = (zone) => {
    setSelectedZone(zone);
    setEditedData({
      zoneId: zone.zoneId,
      zoneNameEn: zone.zoneNameEn || "",
      zoneNameMal: zone.zoneNameMal || "",
      distId: zone.distId || "",
      desTalukId: zone.desTalukId || "",
      btrTypeId: zone.btrTypeId || "",
      isActive: zone.isActive,
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleAddClick = () => {
    setNewZoneData({
      zoneNameEn: "",
      zoneNameMal: "",
      distId: "",
      desTalukId: "",
      btrTypeId: "",
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
    setNewZoneData((prev) => ({ ...prev, [field]: value }));
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
    if (!data.zoneNameEn?.trim()) errors.zoneNameEn = "Zone name (English) is required";
    if (!data.zoneNameMal?.trim()) errors.zoneNameMal = "Zone name (Malayalam) is required";
    if (!data.distId) errors.distId = "Please select a district";
    if (!data.desTalukId) errors.desTalukId = "Please select a taluk";
    if (!data.btrTypeId) errors.btrTypeId = "Please select BTR type";
    return errors;
  };

  // Save edited zone
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
        zoneId: editedData.zoneId,
        zoneNameEn: editedData.zoneNameEn,
        zoneNameMal: editedData.zoneNameMal,
        desTalukId: editedData.desTalukId,
        distId: editedData.distId,
        btrTypeId: editedData.btrTypeId,
        isActive: editedData.isActive,
      };
      await SettingService.saveMasterZone(payload);
      setSuccessMessage("Zone updated successfully!");
      setShowSuccessModal(true);
      toast.success("Zone updated successfully!");
      await fetchZones();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit zones.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate")) errorMsg = "A zone with this name already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Save new zone
  const handleSaveNewZone = async () => {
    const errors = validateData(newZoneData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        zoneNameEn: newZoneData.zoneNameEn,
        zoneNameMal: newZoneData.zoneNameMal,
        desTalukId: newZoneData.desTalukId,
        distId: newZoneData.distId,
        btrTypeId: newZoneData.btrTypeId,
        isActive: newZoneData.isActive,
      };
      await SettingService.saveMasterZone(payload);
      setSuccessMessage("Zone added successfully!");
      setShowSuccessModal(true);
      toast.success("Zone added successfully!");
      await fetchZones();
      setAddModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to add zones.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      else if (err.message.includes("duplicate") || err.message.includes("already exists"))
        errorMsg = "A zone with this name already exists.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (zone) => {
    setIsSaving(true);
    try {
      await SettingService.toggleMasterZoneActive(zone);
      const action = !zone.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Zone "${zone.zoneNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Zone ${action}!`);
      await fetchZones();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change zone status.";
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Zones...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchZones}>
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
    <Grid container spacing={3}>
      <Breadcrumb />
       <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Crops Management
        </Typography>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, color: '#05307a' }}>
          Master Zone Management
        </Typography>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            size="small"
            placeholder="Search by zone name, code or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchZones}>
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{ ml: 'auto' }}
          >
            Add New Zone
          </Button>
        </Paper>

        {/* Table */}
        <Paper elevation={3}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Sl.No</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Zone Code</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Zone Name (EN / ML)</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>District</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Taluk</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>BTR Type</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedZones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No zones found</TableCell>
                  </TableRow>
                ) : (
                  paginatedZones.map((zone, index) => (
                    <TableRow key={zone.zoneId} sx={{ backgroundColor: !zone.isActive ? '#fafafa' : 'inherit' }}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{zone.zoneCode || "-"}</TableCell>
                      <TableCell>
                        {zone.zoneNameEn}
                        {zone.zoneNameMal && (
                          <Typography variant="caption" display="block" sx={{ fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif', color: 'text.secondary' }}>
                            {zone.zoneNameMal}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getDistrictDisplay(zone.distId)}</TableCell>
                      <TableCell>{getTalukDisplay(zone.desTalukId)}</TableCell>
                      <TableCell>{BTR_TYPE_OPTIONS.find(opt => opt.value === zone.btrTypeId)?.label || zone.btrTypeId}</TableCell>
                      <TableCell align="center">{getStatusChip(zone.isActive)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Zone">
                          <IconButton color="primary" onClick={() => handleEditClick(zone)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={zone.isActive ? "Deactivate" : "Activate"}>
                          <IconButton
                            color={zone.isActive ? "warning" : "success"}
                            onClick={() => handleToggleActive(zone)}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            {zone.isActive ? <Cancel /> : <CheckCircle />}
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
            count={filteredZones.length}
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
            Showing {paginatedZones.length} of {filteredZones.length} zones {searchTerm && "(filtered)"}
          </Typography>
        </Box>

        {/* Add New Zone Modal */}
        <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
            <Typography variant="h6">Add New Zone</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              Fill in the zone details below
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!addErrors.distId}>
                  <InputLabel>Select District</InputLabel>
                  <Select
                    value={newZoneData.distId}
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
                <FormControl fullWidth required error={!!addErrors.desTalukId}>
                  <InputLabel>Select Taluk</InputLabel>
                  <Select
                    value={newZoneData.desTalukId}
                    label="Select Taluk"
                    onChange={(e) => handleAddChange('desTalukId', e.target.value)}
                  >
                    <MenuItem value="">Select taluk</MenuItem>
                    {taluks.map((taluk) => (
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
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!addErrors.btrTypeId}>
                  <InputLabel>Select BTR Type</InputLabel>
                  <Select
                    value={newZoneData.btrTypeId}
                    label="Select BTR Type"
                    onChange={(e) => handleAddChange('btrTypeId', e.target.value)}
                  >
                    <MenuItem value="">Select BTR type</MenuItem>
                    {BTR_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {addErrors.btrTypeId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {addErrors.btrTypeId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zone Name (English)"
                  fullWidth
                  required
                  value={newZoneData.zoneNameEn}
                  onChange={(e) => handleAddChange('zoneNameEn', e.target.value)}
                  error={!!addErrors.zoneNameEn}
                  helperText={addErrors.zoneNameEn}
                  placeholder="e.g., North Zone"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zone Name (Malayalam)"
                  fullWidth
                  required
                  value={newZoneData.zoneNameMal}
                  onChange={(e) => handleAddChange('zoneNameMal', e.target.value)}
                  error={!!addErrors.zoneNameMal}
                  helperText={addErrors.zoneNameMal}
                  InputProps={{
                    style: { fontFamily: 'Noto Sans Malayalam, "Malayalam MN", sans-serif' }
                  }}
                  placeholder="e.g., വടക്കൻ സോൺ"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newZoneData.isActive}
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
                    label={newZoneData.isActive ? "Active" : "Inactive"}
                    sx={{ ml: 0 }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 2 }}>
            <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving} size="large">
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewZone}
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
              {isSaving ? "Adding..." : "Add Zone"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
            <Typography variant="h6">Edit Zone</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
              ID: {selectedZone?.zoneId} | Current: {selectedZone?.zoneNameEn}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zone Name (English)"
                  fullWidth
                  required
                  value={editedData.zoneNameEn || ''}
                  onChange={(e) => handleEditChange('zoneNameEn', e.target.value)}
                  error={!!editErrors.zoneNameEn}
                  helperText={editErrors.zoneNameEn}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Zone Name (Malayalam)"
                  fullWidth
                  required
                  value={editedData.zoneNameMal || ''}
                  onChange={(e) => handleEditChange('zoneNameMal', e.target.value)}
                  error={!!editErrors.zoneNameMal}
                  helperText={editErrors.zoneNameMal}
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
                <FormControl fullWidth required error={!!editErrors.desTalukId}>
                  <InputLabel>Select Taluk</InputLabel>
                  <Select
                    value={editedData.desTalukId || ''}
                    label="Select Taluk"
                    onChange={(e) => handleEditChange('desTalukId', e.target.value)}
                  >
                    <MenuItem value="">Select taluk</MenuItem>
                    {taluks.map((taluk) => (
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
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!editErrors.btrTypeId}>
                  <InputLabel>Select BTR Type</InputLabel>
                  <Select
                    value={editedData.btrTypeId || ''}
                    label="Select BTR Type"
                    onChange={(e) => handleEditChange('btrTypeId', e.target.value)}
                  >
                    <MenuItem value="">Select BTR type</MenuItem>
                    {BTR_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {editErrors.btrTypeId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                      {editErrors.btrTypeId}
                    </Typography>
                  )}
                </FormControl>
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
            <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving} size="large">
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
        <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            <Box sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 1 }} />
              <Typography variant="h5" sx={{ color: '#4caf50' }}>Success!</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>{successMessage}</DialogContentText>
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
            <DialogContentText sx={{ textAlign: 'center', fontSize: '1rem' }}>{errorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button onClick={() => setShowErrorModal(false)} variant="contained" color="error">OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Grid>
  );
};

export default MasterZoneSettings;