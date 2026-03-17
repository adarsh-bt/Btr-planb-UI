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
  Stack,Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField, Checkbox,
  ListItemText
} from '@mui/material';
import { 
  AddCircleOutline,
  RemoveCircleOutline,
  Edit
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

const ZoneManage = () => {
  const { zoneId } = useParams();

  const [zoneDetails, setZoneDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
const [taluks, setTaluks] = useState([]);
const [villages, setVillages] = useState([]);
const [blocks, setBlocks] = useState([]);
const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmType, setConfirmType] = useState(""); 
// block | village | taluk
const [confirmId, setConfirmId] = useState(null);
const [currentRow, setCurrentRow] = useState(null);
  // ================= FETCH DATA =================

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
    setTaluks(data);

  };

  fetchTaluks();
}, [openAddDialog]);

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
    setVillages(data);

  };
  fetchVillages();
}, [selectedTaluk]);

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
    setBlocks(data);

  };

  fetchBlocks();

}, [selectedVillage]);
  // ================= TRANSFORM TABLE DATA =================
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

    // reset form
    setSelectedTaluk("");
    setSelectedVillage("");
    setSelectedBlocks([]);

    // reload table data
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

    // CASE 1: Taluk without villages
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

    // CASE 2: Taluk with villages
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
  const handleAddVillage = (talukId, villageId) => {
    console.log('Add village:', { talukId, villageId });
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

  const handleEditBlockCodes = (talukId, villageId) => {
    console.log('Edit block codes:', { talukId, villageId });
    // Implement edit functionality
  };
  if (loading) {
    return <LoadingScreen message="Fetching zone mapping..." />;
  }

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
      alert("Removing block with ID: " + confirmId);
      console.log("Removing block with ID:", confirmId);
      url = `${BASE_URL}/btr-service/admin-manage/remove-block/${confirmId}?userid=${userId}`;
    }

    if (confirmType === "village") {
        alert("Removing village with ID: " + confirmId);
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
       <Typography variant="h3"  gutterBottom sx={{ mb: 4 }}>
                Zone Mangement : {zoneDetails?.zoneName || 'N/A'} <Chip label={zoneDetails?.zoneType || 'Unknown Type'} size="medium" color="success"  sx={{ ml: 2 }} />
              </Typography>
       
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
                  <TableCell 
                    sx={{ 
                      bgcolor: "#05307a", 
                      color: "white", 
                      fontWeight: "bold",
                      width: '200px'
                    }}
                  >
                    Taluk
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: "#05307a", 
                      color: "white", 
                      fontWeight: "bold",
                      width: '200px'
                    }}
                  >
                    Village
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: "#05307a", 
                      color: "white", 
                      fontWeight: "bold",
                      width: '200px'
                    }}
                  >
                    Block Codes
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      bgcolor: "#05307a", 
                      color: "white", 
                      fontWeight: "bold",
                      textAlign: 'center'
                    }}
                  >
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
                      key={`${row.talukId}-${row.villageId}`}
                      sx={{
                        '&:hover': { bgcolor: "#f1f6ff" },
                        '&:nth-of-type(odd)': { bgcolor: row.isFirstInTaluk ? '#f8f9fa' : 'inherit' }
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: row.talukName ? "bold" : "normal",
                          borderRight: '1px solid #e0e0e0',
                          bgcolor: row.talukName ? '#f0f7ff' : 'inherit'
                        }}
                      >
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

                          {/* <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleAddVillage(row.talukId, row.villageId)}
                            title="Add Village"
                            sx={{ 
                              bgcolor: '#e8f5e8',
                              '&:hover': { bgcolor: '#c8e6c9' }
                            }}
                          >
                            <AddCircleOutline fontSize="small" />
                          </IconButton> */}

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

                          {/* <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditBlockCodes(row.talukId, row.villageId)}
                            title="Edit Block Codes"
                            sx={{ 
                              bgcolor: '#e3f2fd',
                              '&:hover': { bgcolor: '#bbdefb' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton> */}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
<Dialog
  open={openRemoveDialog}
  onClose={() => setOpenRemoveDialog(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>Remove Mapping</DialogTitle>

  <DialogContent>

    {/* TALUK */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2">Taluk</Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography>{currentRow?.talukName}</Typography>

        <Button
          color="error"
          size="small"
         onClick={() => openConfirmDialog("taluk", currentRow.talukMappingId)}
        >
          Remove Taluk
        </Button>
      </Box>
    </Box>


    {/* VILLAGE */}
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2">Village</Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography>{currentRow?.villageName}</Typography>

        <Button
          color="error"
          size="small"
          onClick={() => openConfirmDialog("village", currentRow.villageMappingId)}
        >
          Remove Village
        </Button>
      </Box>
    </Box>


    {/* BLOCKS */}
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Blocks
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>

        {currentRow?.blocks?.map((block) => (
         <Chip
  label={block.blockCode}
  onDelete={() => openConfirmDialog("block", block.blockMappingId)}
/>
        ))}

      </Box>
    </Box>

  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenRemoveDialog(false)}>
      Close
    </Button>
  </DialogActions>

</Dialog>
<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>

  <DialogTitle>
    Confirm Removal
  </DialogTitle>

  <DialogContent>

    <Typography>
      Are you sure you want to remove this {confirmType}?
    </Typography>

  </DialogContent>

  <DialogActions>

    <Button onClick={() => setConfirmOpen(false)}>
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={handleConfirmRemove}
    >
      Remove
    </Button>

  </DialogActions>

</Dialog>
          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>

  <DialogTitle>Add New Mapping</DialogTitle>

  <DialogContent>

    {/* TALUK */}
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
        {taluks.map((taluk) => (
          <MenuItem key={taluk.talukId} value={taluk.talukId}>
            {taluk.talukName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>


    {/* VILLAGE */}
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


    {/* BLOCKS */}
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
  <MenuItem disabled>
    All blocks already mapped
  </MenuItem>
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

    <Button onClick={() => setOpenAddDialog(false)}>
      Cancel
    </Button>

    <Button
  variant="contained"
  disabled={!selectedTaluk}
  onClick={handleAddMapping}
>
  Save
</Button>

  </DialogActions>

</Dialog>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default ZoneManage;