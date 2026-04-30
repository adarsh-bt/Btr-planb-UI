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

  // Fetch zones
  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterZone`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied");
        if (response.status === 401) throw new Error("Session expired");
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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

  // Fetch districts from /districts endpoint
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
      } else {
        console.warn("Failed to fetch districts");
      }
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  }, []);

  // Fetch taluks from /getAllTaluk endpoint
  const fetchTaluks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllTaluk`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTaluks(data);
      } else {
        console.warn("Failed to fetch taluks");
      }
    } catch (err) {
      console.error("Error fetching taluks:", err);
    }
  }, []);

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

  const saveZone = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/btr-service/admin-manage/saveOrUpdateMasterZone`, {
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
    const result = await response.text();
    return result;
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
        zoneId: editedData.zoneId,
        zoneNameEn: editedData.zoneNameEn,
        zoneNameMal: editedData.zoneNameMal,
        desTalukId: Number(editedData.desTalukId),
        distId: Number(editedData.distId),
        btrTypeId: Number(editedData.btrTypeId),
        isActive: editedData.isActive,
        userId: userId,
      };
      await saveZone(payload);
      setSuccessMessage("Zone updated successfully!");
      setShowSuccessModal(true);
      toast.success("Zone updated!");
      await fetchZones();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to edit zones.";
      else if (err.message.includes("401")) errorMsg = "Your session has expired. Please login again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewZone = async () => {
    const errors = validateData(newZoneData);
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = {
        zoneNameEn: newZoneData.zoneNameEn,
        zoneNameMal: newZoneData.zoneNameMal,
        desTalukId: Number(newZoneData.desTalukId),
        distId: Number(newZoneData.distId),
        btrTypeId: Number(newZoneData.btrTypeId),
        isActive: newZoneData.isActive,
        userId: userId,
      };
      await saveZone(payload);
      setSuccessMessage("Zone added successfully!");
      setShowSuccessModal(true);
      toast.success("Zone added!");
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

  const handleToggleActive = async (zone) => {
    setIsSaving(true);
    try {
      const userId = authservice.userid();
      const payload = {
        zoneId: zone.zoneId,
        zoneNameEn: zone.zoneNameEn,
        zoneNameMal: zone.zoneNameMal,
        desTalukId: zone.desTalukId,
        distId: zone.distId,
        btrTypeId: zone.btrTypeId,
        isActive: !zone.isActive,
        userId: userId,
      };
      await saveZone(payload);
      const action = !zone.isActive ? "activated" : "deactivated";
      setSuccessMessage(`Zone "${zone.zoneNameEn}" ${action} successfully!`);
      setShowSuccessModal(true);
      toast.success(`Zone ${action}!`);
      await fetchZones();
    } catch (err) {
      console.error("Toggle error:", err);
      let errorMsg = err.message;
      if (err.message.includes("403")) errorMsg = "You don't have permission to change zone status.";
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
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>ID</TableCell>
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
                  paginatedZones.map((zone) => (
                    <TableRow key={zone.zoneId} sx={{ backgroundColor: !zone.isActive ? '#fafafa' : 'inherit' }}>
                      <TableCell>{zone.zoneId}</TableCell>
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
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2.5} sx={{ mt: 1 }}>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="District"
                  fullWidth
                  required
                  value={newZoneData.distId}
                  onChange={(e) => handleAddChange('distId', e.target.value)}
                  error={!!addErrors.distId}
                  helperText={addErrors.distId}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Taluk"
                  fullWidth
                  required
                  value={newZoneData.desTalukId}
                  onChange={(e) => handleAddChange('desTalukId', e.target.value)}
                  error={!!addErrors.desTalukId}
                  helperText={addErrors.desTalukId}
                >
                  <MenuItem value="">Select taluk</MenuItem>
                  {taluks.map((taluk) => (
                    <MenuItem key={taluk.desTalukId} value={taluk.desTalukId}>
                      {taluk.desTalukNameEn} / {taluk.desTalukNameMal}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="BTR Type"
                  fullWidth
                  required
                  value={newZoneData.btrTypeId}
                  onChange={(e) => handleAddChange('btrTypeId', e.target.value)}
                  error={!!addErrors.btrTypeId}
                  helperText={addErrors.btrTypeId}
                >
                  <MenuItem value="">Select BTR type</MenuItem>
                  {BTR_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
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
                        />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={() => setAddModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>
              Cancel
            </Button>
            <Button
                onClick={handleSaveNewZone}
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
                {isSaving ? "Adding..." : "Add Zone"}
                </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: '#05307a', color: 'white', pb: 2 }}>
            <Typography variant="h6">Edit Zone</Typography>
            <Typography variant="body2">ID: {selectedZone?.zoneId}</Typography>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
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
                <TextField
                  select
                  label="District"
                  fullWidth
                  required
                  value={editedData.distId || ''}
                  onChange={(e) => handleEditChange('distId', e.target.value)}
                  error={!!editErrors.distId}
                  helperText={editErrors.distId}
                >
                  <MenuItem value="">Select district</MenuItem>
                  {districts.map((dist) => (
                    <MenuItem key={dist.districtId} value={dist.districtId}>
                      {dist.districtNameEn} / {dist.districtNameMal}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Taluk"
                  fullWidth
                  required
                  value={editedData.desTalukId || ''}
                  onChange={(e) => handleEditChange('desTalukId', e.target.value)}
                  error={!!editErrors.desTalukId}
                  helperText={editErrors.desTalukId}
                >
                  <MenuItem value="">Select taluk</MenuItem>
                  {taluks.map((taluk) => (
                    <MenuItem key={taluk.desTalukId} value={taluk.desTalukId}>
                      {taluk.desTalukNameEn} / {taluk.desTalukNameMal}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="BTR Type"
                  fullWidth
                  required
                  value={editedData.btrTypeId || ''}
                  onChange={(e) => handleEditChange('btrTypeId', e.target.value)}
                  error={!!editErrors.btrTypeId}
                  helperText={editErrors.btrTypeId}
                >
                  <MenuItem value="">Select BTR type</MenuItem>
                  {BTR_TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
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
                        />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={() => setEditModalOpen(false)} variant="outlined" color="secondary" disabled={isSaving}>
              Cancel
            </Button>
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
      </Box>
    </Grid>
  );
};

export default MasterZoneSettings;