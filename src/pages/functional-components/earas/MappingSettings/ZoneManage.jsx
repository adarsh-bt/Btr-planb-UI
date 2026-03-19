import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Divider,
  IconButton,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  ListItemText,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  AddCircleOutline,
  RemoveCircleOutline,
  Edit,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import RegisterService from 'pages/authentication/services/RegisterService'; // Adjust the import path as needed

const ZoneManage = () => {
  const { zoneId } = useParams();

  const [zoneDetails, setZoneDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal states
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    zoneNameEn: '',
    zoneNameMal: '',
    districtName: '',
    btrType: '',
    talukName: '',
    btrTypeId: null,
    distId: null,
    desTalukId: null
  });
  
  // Hardcoded BTR types
  const btrTypes = [
    { btrTypeId: 1, btrType: 'BTR' },
    { btrTypeId: 2, btrType: 'Non-BTR' }
  ];
  
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [taluks, setTaluks] = useState([]);
  const [taluksLoading, setTaluksLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const BASE_URL = mainapi.BASE_URL;

  const resolvedZoneId = useState(() => {
    const role = authservice.getrole();
    return role === "Field Data Collector"
      ? authservice.getzone()
      : zoneId;
  })[0];
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [taluksList, setTaluksList] = useState([]);
  const [villages, setVillages] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(""); 
  const [confirmId, setConfirmId] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  // ================= FETCH ZONE DETAILS =================
  useEffect(() => {
    const fetchZoneDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${BASE_URL}/btr-service/admin-manage/zone-mapping-details/${resolvedZoneId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Failed to fetch zone details");
        }
        setZoneDetails(result);
      } catch (error) {
        setError(error.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    fetchZoneDetails();
  }, [resolvedZoneId, BASE_URL]);

  // ================= FETCH DISTRICTS using RegisterService =================
  useEffect(() => {
    const fetchDistricts = async () => {
      setDistrictsLoading(true);
      try {
        // Use RegisterService to fetch districts
        const response = await RegisterService.getDistricts();
        
        // Handle the response based on your API structure
        if (Array.isArray(response)) {
          setDistricts(response);
        } else if (response?.payload && Array.isArray(response.payload)) {
          // If response has payload property (like in your example)
          setDistricts(response.payload);
        } else if (response?.data && Array.isArray(response.data)) {
          setDistricts(response.data);
        } else {
          console.warn("Districts data is not in expected format:", response);
          setDistricts([]);
        }
      } catch (error) {
        console.error("Failed to fetch districts:", error);
        setDistricts([]);
        showSnackbar("Failed to load districts", "error");
      } finally {
        setDistrictsLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  // ================= FETCH TALUKS BY DISTRICT using RegisterService =================
  useEffect(() => {
    const fetchTaluksByDistrict = async () => {
      if (!editFormData.distId) {
        setTaluks([]);
        return;
      }
      setTaluksLoading(true);
      try {
        // Use RegisterService to fetch taluks
        const response = await RegisterService.getTaluks(editFormData.distId);
        
        // Handle the response based on your API structure
        if (Array.isArray(response)) {
          setTaluks(response);
        } else if (response?.payload && Array.isArray(response.payload)) {
          // If response has payload property (like in your example)
          setTaluks(response.payload);
        } else if (response?.data && Array.isArray(response.data)) {
          setTaluks(response.data);
        } else {
          console.warn("Taluks data is not in expected format:", response);
          setTaluks([]);
        }
      } catch (error) {
        console.error("Failed to fetch taluks:", error);
        setTaluks([]);
        showSnackbar("Failed to load taluks", "error");
      } finally {
        setTaluksLoading(false);
      }
    };
    fetchTaluksByDistrict();
  }, [editFormData.distId]);

  // ================= FETCH ZONE EDIT DATA =================
  const fetchZoneEditData = async () => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/btr-service/localbodies/${resolvedZoneId}/btr-type`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      
      setEditFormData({
        zoneNameEn: data.zoneNameEn || data.zoneName || '',
        zoneNameMal: data.zoneNameMal || '',
        districtName: data.districtName || '',
        btrType: data.btrType || '',
        talukName: data.talukName || '',
        btrTypeId: data.btrTypeId || null,
        distId: data.distId || data.desDistId || null,
        desTalukId: data.desTalukId || null
      });
    } catch (error) {
      console.error("Failed to fetch zone edit data:", error);
      showSnackbar("Failed to load zone data for editing", "error");
    } finally {
      setEditLoading(false);
    }
  };

  // ================= HANDLE EDIT MODAL OPEN =================
  const handleEditClick = () => {
    fetchZoneEditData();
    setOpenEditModal(true);
  };

  // ================= HANDLE FORM CHANGES =================
  const handleFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset taluk when district changes
      ...(field === 'distId' && { desTalukId: null, talukName: '' })
    }));
  };

  // ================= HANDLE SAVE EDIT =================
  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Prepare payload for save-or-update API
      const payload = {
        zoneId: resolvedZoneId,
        zoneNameEn: editFormData.zoneNameEn,
        zoneNameMal: editFormData.zoneNameMal || '',
        distId: editFormData.distId,
        desTalukId: editFormData.desTalukId,
        btrTypeId: editFormData.btrTypeId
      };

      console.log("Saving payload:", payload);

      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/save-or-update`,
        {
          method: "POST", // Using POST as per your API endpoint
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.message || "Failed to update zone");
      }

      showSnackbar("Zone updated successfully", "success");
      setOpenEditModal(false);
      
      // Refresh zone details
      setLoading(true);
      const refreshResponse = await fetch(
        `${BASE_URL}/btr-service/admin-manage/zone-mapping-details/${resolvedZoneId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const refreshedData = await refreshResponse.json();
      setZoneDetails(refreshedData);
      
    } catch (error) {
      console.error("Failed to update zone:", error);
      showSnackbar(error.message || "Failed to update zone", "error");
    } finally {
      setEditLoading(false);
      setLoading(false);
    }
  };

  // ================= SNACKBAR HELPER =================
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ================= EXISTING CODE (unchanged) =================
  useEffect(() => {
    if (!openAddDialog) return;
    const fetchTaluks = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/taluks?zoneId=${resolvedZoneId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setTaluksList(Array.isArray(data) ? data : []);
    };
    fetchTaluks();
  }, [openAddDialog, resolvedZoneId, BASE_URL]);

  useEffect(() => {
    if (!selectedTaluk) return;
    const fetchVillages = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/villages?zoneId=${zoneId}&talukId=${selectedTaluk}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setVillages(Array.isArray(data) ? data : []);
    };
    fetchVillages();
  }, [selectedTaluk, zoneId, BASE_URL]);

  useEffect(() => {
    if (!selectedVillage) return;
    const fetchBlocks = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/blocks?villageId=${selectedVillage}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setBlocks(Array.isArray(data) ? data : []);
    };
    fetchBlocks();
  }, [selectedVillage, BASE_URL]);

  const handleAddMapping = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        zoneId: resolvedZoneId,
        talukId: selectedTaluk,
        villageId: selectedVillage,
        blockCodes: selectedBlocks
      };

      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/add-zone-mapping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save mapping");
      }

      setOpenAddDialog(false);
      setSelectedTaluk("");
      setSelectedVillage("");
      setSelectedBlocks([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const transformDataForTable = () => {
    if (!zoneDetails?.data) return [];
    const tableData = [];
    zoneDetails.data.forEach((taluk) => {
      if (!taluk.villages || taluk.villages.length === 0) {
        tableData.push({
          talukName: taluk.talukName,
          talukId: taluk.talukId,
          talukMappingId: taluk.talukMappingId,
          villageName: '',
          villageId: null,
          villageMappingId: null,
          blockCodes: '',
          blocks: [],
          isFirstInTaluk: true
        });
        return;
      }
      taluk.villages.forEach((village, villageIndex) => {
        tableData.push({
          talukName: villageIndex === 0 ? taluk.talukName : '',
          talukId: taluk.talukId,
          talukMappingId: taluk.talukMappingId,
          villageName: village.villageName,
          villageId: village.villageId,
          villageMappingId: village.villageMappingId,
          blockCodes: village.blocks.map(b => b.blockCode).join(', '),
          blocks: village.blocks,
          isFirstInTaluk: villageIndex === 0
        });
      });
    });
    return tableData;
  };

  const tableData = transformDataForTable();

  const getAvailableBlocks = () => {
    if (!selectedVillage) return blocks;
    const mappedBlocks = tableData
      .filter(row => row.villageId === selectedVillage)
      .flatMap(row => row.blocks.map(b => b.blockCode));
    return blocks.filter(block =>
      !mappedBlocks.includes(block.blockCode)
    );
  };

  const availableBlocks = getAvailableBlocks();

  const handleRemoveVillage = async (villageMappingId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/btr-service/admin-manage/remove-village/${villageMappingId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!response.ok) {
        throw new Error("Failed to remove village");
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to remove village");
    }
  };

  const handleOpenRemoveDialog = (row) => {
    setCurrentRow(row);
    setOpenRemoveDialog(true);
  };

  const openConfirmDialog = (type, id) => {
    setConfirmType(type);
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    try {
      const token = localStorage.getItem("token");
      let url = "";
      const userId = authservice.userid();
      
      if (confirmType === "block") {
        url = `${BASE_URL}/btr-service/admin-manage/remove-block/${confirmId}?userid=${userId}`;
      }
      if (confirmType === "village") {
        url = `${BASE_URL}/btr-service/admin-manage/remove-village/${confirmId}?userid=${userId}`;
      }
      if (confirmType === "taluk") {
        url = `${BASE_URL}/btr-service/admin-manage/remove-taluk/${confirmId}?userid=${userId}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Remove failed");
      }

      setConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper function to get BTR type display name
  const getBtrTypeDisplay = (btrTypeId) => {
    const type = btrTypes.find(t => t.btrTypeId === btrTypeId);
    return type ? type.btrType : 'Unknown';
  };

  if (loading) {
    return <LoadingScreen message="Fetching zone mapping..." />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <DotLottieReact
          style={{ width: "40rem", maxWidth: "100%" }}
          src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
          loop
          autoplay
        />
        <Typography variant="h5" gutterBottom>Something went wrong</Typography>
        <Typography color="text.secondary">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // ================= UI =================
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      
      {/* MAIN TABLE */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" gutterBottom sx={{ mb: 0 }}>
            Zone Management : {zoneDetails?.zoneName || 'N/A'} 
            <Chip 
              label={zoneDetails?.zoneType || getBtrTypeDisplay(zoneDetails?.btrTypeId) || 'Unknown Type'} 
              size="medium" 
              color="success"  
              sx={{ ml: 2 }} 
            />
          </Typography>
          
          {/* Edit Button */}
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditClick}
            sx={{ 
              borderColor: '#05307a', 
              color: '#05307a',
              '&:hover': {
                borderColor: '#032050',
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            Edit Zone Details
          </Button>
        </Box>
        
        <MainCard title="Taluk - Village Mapping">
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddCircleOutline />}
              onClick={() => setOpenAddDialog(true)}
            >
              Add Mapping
            </Button>
          </Box>
          
          <TableContainer component={Paper} sx={{ maxHeight: 500, border: '1px solid #e0e0e0' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold", width: '200px' }}>
                    Taluk
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold", width: '200px' }}>
                    Village
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold", width: '200px' }}>
                    Block Codes
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold", textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row, index) => (
                    <TableRow
                      key={`${row.talukId}-${row.villageId}-${index}`}
                      sx={{
                        '&:hover': { bgcolor: "#f1f6ff" },
                        '&:nth-of-type(odd)': { bgcolor: row.isFirstInTaluk ? '#f8f9fa' : 'inherit' }
                      }}
                    >
                      <TableCell sx={{ 
                        fontWeight: row.talukName ? "bold" : "normal",
                        borderRight: '1px solid #e0e0e0',
                        bgcolor: row.talukName ? '#f0f7ff' : 'inherit'
                      }}>
                        {row.talukName && (
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {row.talukName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {row.talukId}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>

                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        <Box>
                          <Typography variant="body1">
                            {row.villageName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {row.villageId}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {row.blockCodes.split(', ').map((code, idx) => (
                            <Chip
                              key={idx}
                              label={code}
                              size="small"
                              sx={{
                                bgcolor: "#e3f2fd",
                                fontWeight: "bold",
                                color: "#05307a"
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenRemoveDialog(row)}
                            title="Remove Village"
                            sx={{ 
                              bgcolor: '#ffebee',
                              '&:hover': { bgcolor: '#ffcdd2' }
                            }}
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Remove Dialog */}
          <Dialog open={openRemoveDialog} onClose={() => setOpenRemoveDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Remove Mapping</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Taluk</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>{currentRow?.talukName}</Typography>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => openConfirmDialog("taluk", currentRow?.talukMappingId)}
                    disabled={!currentRow?.talukMappingId}
                  >
                    Remove Taluk
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Village</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography>{currentRow?.villageName}</Typography>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => openConfirmDialog("village", currentRow?.villageMappingId)}
                    disabled={!currentRow?.villageMappingId}
                  >
                    Remove Village
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Blocks</Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {currentRow?.blocks?.map((block) => (
                    <Chip
                      key={block.blockMappingId}
                      label={block.blockCode}
                      onDelete={() => openConfirmDialog("block", block.blockMappingId)}
                    />
                  ))}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenRemoveDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Confirm Dialog */}
          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to remove this {confirmType}?</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button color="error" variant="contained" onClick={handleConfirmRemove}>
                Remove
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Mapping Dialog */}
          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Mapping</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Taluk</InputLabel>
                <Select
                  value={selectedTaluk}
                  label="Taluk"
                  onChange={(e) => {
                    setSelectedTaluk(e.target.value);
                    setSelectedVillage("");
                    setSelectedBlocks([]);
                  }}
                >
                  {taluksList.map((taluk) => (
                    <MenuItem key={taluk.talukId} value={taluk.talukId}>
                      {taluk.talukName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 3 }} disabled={!selectedTaluk}>
                <InputLabel>Village</InputLabel>
                <Select
                  value={selectedVillage}
                  label="Village"
                  onChange={(e) => {
                    setSelectedVillage(e.target.value);
                    setSelectedBlocks([]);
                  }}
                >
                  {villages.map((village) => (
                    <MenuItem key={village.villageId} value={village.villageId}>
                      {village.villageName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 3 }} disabled={!selectedVillage}>
                <InputLabel>Blocks</InputLabel>
                <Select
                  multiple
                  value={selectedBlocks}
                  label="Blocks"
                  onChange={(e) => setSelectedBlocks(e.target.value)}
                  renderValue={(selected) =>
                    selected
                      .map((id) => {
                        const block = availableBlocks.find(
                          (b) => b.blockMappingId === id
                        );
                        return block ? block.blockCode : id;
                      })
                      .join(", ")
                  }
                >
                  {getAvailableBlocks().length === 0 ? (
                    <MenuItem disabled>All blocks already mapped</MenuItem>
                  ) : (
                    getAvailableBlocks().map((block) => (
                      <MenuItem key={block.villageBlockId} value={block.blockMappingId}>
                        <Checkbox checked={selectedBlocks.includes(block.blockMappingId)} />
                        <ListItemText primary={block.blockCode} />
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button variant="contained" disabled={!selectedTaluk} onClick={handleAddMapping}>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Zone Modal */}
          <Dialog 
            open={openEditModal} 
            onClose={() => setOpenEditModal(false)} 
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle sx={{ 
              bgcolor: '#05307a', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Edit />
                Edit Zone Details
              </Box>
              <IconButton 
                onClick={() => setOpenEditModal(false)}
                sx={{ color: 'white' }}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
              {editLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading zone data...</Typography>
                </Box>
              ) : (
                <Box sx={{ pt: 2 }}>
                  {/* Zone Name (English) */}
                  <TextField
                    fullWidth
                    label="Zone Name (English)"
                    value={editFormData.zoneNameEn}
                    onChange={(e) => handleFormChange('zoneNameEn', e.target.value)}
                    margin="normal"
                    variant="outlined"
                    required
                  />

                  {/* Zone Name (Malayalam) */}
                  <TextField
                    fullWidth
                    label="Zone Name (Malayalam)"
                    value={editFormData.zoneNameMal || ''}
                    onChange={(e) => handleFormChange('zoneNameMal', e.target.value)}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      style: { fontFamily: '"Noto Sans Malayalam", "Malayalam MN", sans-serif' }
                    }}
                  />

                  {/* District */}
                  {/* <FormControl fullWidth margin="normal" required>
                    <InputLabel>District</InputLabel>
                    {districtsLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <CircularProgress size={20} />
                        <Typography sx={{ ml: 1 }}>Loading districts...</Typography>
                      </Box>
                    ) : (
                      <Select
                        value={editFormData.distId || ''}
                        label="District"
                        onChange={(e) => handleFormChange('distId', e.target.value)}
                      >
                        {districts.length > 0 ? (
                          districts.map((district) => (
                            <MenuItem key={district.districtOfficeId || district.distId} value={district.districtOfficeId || district.distId}>
                              {(district.districtOfficeNameEn || district.districtName || '').replace('District Office ', '')}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No districts available</MenuItem>
                        )}
                      </Select>
                    )}
                  </FormControl> */}

                  {/* Taluk */}
                  {/* <FormControl fullWidth margin="normal" required disabled={!editFormData.distId}>
                    <InputLabel>Taluk</InputLabel>
                    {taluksLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <CircularProgress size={20} />
                        <Typography sx={{ ml: 1 }}>Loading taluks...</Typography>
                      </Box>
                    ) : (
                      <Select
                        value={editFormData.desTalukId || ''}
                        label="Taluk"
                        onChange={(e) => {
                          const selectedTaluk = taluks.find(t => (t.desTalukId || t.talukId) === e.target.value);
                          handleFormChange('desTalukId', e.target.value);
                          handleFormChange('talukName', selectedTaluk?.talukOfficeNameEn || selectedTaluk?.talukName || '');
                        }}
                      >
                        {taluks.length > 0 ? (
                          taluks.map((taluk) => (
                            <MenuItem key={taluk.desTalukId || taluk.talukId} value={taluk.desTalukId || taluk.talukId}>
                              {(taluk.talukOfficeNameEn || taluk.talukName || '').replace('Taluk Statistical Office ', '')}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No taluks available</MenuItem>
                        )}
                      </Select>
                    )}
                  </FormControl> */}

                  {/* BTR Type - Hardcoded options */}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Zone Type</InputLabel>
                    <Select
                      value={editFormData.btrTypeId || ''}
                      label="Zone Type"
                      onChange={(e) => {
                        const selectedType = btrTypes.find(t => t.btrTypeId === e.target.value);
                        handleFormChange('btrTypeId', e.target.value);
                        handleFormChange('btrType', selectedType?.btrType || '');
                      }}
                    >
                      {btrTypes.map((type) => (
                        <MenuItem key={type.btrTypeId} value={type.btrTypeId}>
                          {type.btrType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Read-only fields for display */}
                  {/* <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Current Values:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">District:</Typography>
                        <Typography variant="body2">{editFormData.districtName || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Taluk:</Typography>
                        <Typography variant="body2">{editFormData.talukName || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Zone Type:</Typography>
                        <Typography variant="body2">{editFormData.btrType || getBtrTypeDisplay(editFormData.btrTypeId) || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </Box> */}
                </Box>
              )}
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => setOpenEditModal(false)}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                variant="contained"
                disabled={editLoading || !editFormData.zoneNameEn || !editFormData.distId || !editFormData.desTalukId || !editFormData.btrTypeId}
                startIcon={<SaveIcon />}
                sx={{ bgcolor: '#05307a', '&:hover': { bgcolor: '#032050' } }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default ZoneManage;