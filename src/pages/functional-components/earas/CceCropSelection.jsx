import React, { useState, useEffect } from "react";
import {
  Box, Button, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment, TablePagination
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import Breadcrumb from 'routes/Breadcrumb';

import axios from "axios";
import mainapi from 'api/mainapi';

const FORM_URL = mainapi.FORM_API;

const themeColor = "#05307a";

const userId = localStorage.getItem("userId"); // UUID


const CceCropSelection = () => {
  const [majorCount, setMajorCount] = useState("");
  const [minorCount, setMinorCount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning"
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

   const [tableData, setTableData] = useState([]);

  const sortedData = [...tableData].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];
    if (typeof valA === "boolean") {
      valA = valA ? 1 : 0;
      valB = valB ? 1 : 0;
    }
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.frame.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);



 

  const getTotalCountByType = (type) =>
  tableData.filter(row => row.type === type).length;

const getTotalMajorCount = () => getTotalCountByType("Major");
const getTotalMinorCount = () => getTotalCountByType("Minor");
const getTotalCropsCount = () => tableData.length; // since every row is either Major/Minor


useEffect(() => {
  fetchCrops();
}, []);

const fetchCrops = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${FORM_URL}/earas-form1-entry/cce-crop-details/fetch-cce-crop-selection`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const formattedData = response.data.map(item => ({
      id: item.cceId,
      name: item.cropName,
      frame: item.frameName,
      ccNumber: item.noOfCce,
      type: item.cceCropType === "major" ? "Major" : "Minor",

      selected: item.selected,   // 🔥 PRE-TICK
      logId: item.logId          // 🔥 REQUIRED FOR UPDATE
    }));

    setTableData(formattedData);
  } catch (error) {
    console.error("Error fetching crop data", error);
    showSnackbar("Failed to load crop details");
  }
};



  const totalCount = (Number(majorCount) || 0) + (Number(minorCount) || 0);

  const buildPayload = () => {
  const newlySelected = tableData
    .filter(row => row.selected && !row.logId)  // Newly selected (no logId)
    .map(row => ({
      logId: null,  // CREATE NEW
      cceId: row.id,
      addedBy: userId,
      updatedBy: userId,
      remarks: "CCE crop selected"
    }));

  const deselected = tableData
    .filter(row => !row.selected && row.logId)  // Previously selected, now unticked
    .map(row => ({
      logId: row.logId,  // DELETE
      cceId: row.id,
      action: "DELETE"    // NEW FLAG
    }));

  return { create: newlySelected, delete: deselected };
};


const handleSaveOrUpdate = async () => {
  const token = localStorage.getItem("token");
  const payload = buildPayload();

  if (payload.create.length === 0 && payload.delete.length === 0) {
    showSnackbar("No changes to save");
    return;
  }

  try {
    await axios.post(
      `${FORM_URL}/earas-form1-entry/cce-crop-details/saveOrUpdate`,
      payload,  // Now sends {create: [], delete: []}
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    setSnackbar({
      open: true,
      message: `Saved: ${payload.create.length} added, ${payload.delete.length} removed`,
      severity: "success"
    });

    fetchCrops(); // reload data
  } catch (error) {
    console.error("Save/Update failed", error);
    showSnackbar("Failed to save changes");
  }
};



  const getSelectedCountByType = (type) =>
    tableData.filter((row) => row.selected && row.type === type).length;

  const getTotalSelectedCount = () =>
    tableData.filter((row) => row.selected).length;

  const showSnackbar = (message) => {
    setSnackbar({ open: true, message, severity: "warning" });
  };

  // New checkbox handler
  const handleCheckboxChange = (id) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          if (!row.selected) {
            const selectedMajor = getSelectedCountByType("Major");
            const selectedMinor = getSelectedCountByType("Minor");
            const totalSelected = getTotalSelectedCount();

            // if (row.type === "Major" && selectedMajor >= (Number(majorCount) || 0)) {
            //   showSnackbar(`You can only select ${majorCount || 0} Major crops.`);
            //   return row;
            // }
            // if (row.type === "Minor" && selectedMinor >= (Number(minorCount) || 0)) {
            //   showSnackbar(`You can only select ${minorCount || 0} Minor crops.`);
            //   return row;
            // }
            // if (totalSelected >= totalCount) {
            //   showSnackbar(`You can only select ${totalCount} crops in total.`);
            //   return row;
            // }
          }
          return { ...row, selected: !row.selected };
        }
        return row;
      })
    );
  };

  const handleNumberInput = (setter) => (e) => {
  let value = e.target.value;

  // Allow empty string
  if (value === "") {
    setter("");
    return;
  }

  // Only digits allowed
  if (!/^\d+$/.test(value)) return;

  // Remove leading zeros
  value = value.replace(/^0+/, "");

  // Max 2 digits
  if (value.length > 2) return;

  setter(value);
};


  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };


  
  const currentYear = new Date().getFullYear();
const agriculturalYear = `AY ${currentYear} - ${currentYear + 1}`;


  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            backgroundColor: themeColor,
            color: "white",
            fontWeight: "bold"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Box sx={{ p: 3 }}>
      {/* Top Section */}
      {/* <Paper sx={{ p: 4, mb: 4, boxShadow: 6, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: themeColor }}>
          🌱 Crops Management 
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Major Crop Number"
              type="text"
              fullWidth
              value={majorCount}
              onChange={handleNumberInput(setMajorCount)}
              variant="outlined"
              inputProps={{ inputMode: "numeric" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Minor Crop Number"
              type="text"
              fullWidth
              value={minorCount}
              onChange={handleNumberInput(setMinorCount)}
              variant="outlined"
              inputProps={{ inputMode: "numeric" }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Agricultural Year"
              type="text"
              fullWidth
              value={`AY ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`}
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Total"
              type="number"
              fullWidth
              value={totalCount}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper> */}

      {/* Table Section */}
      <Paper sx={{ p: 4, boxShadow: 4, borderRadius: 3 }}>
        <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 2,
    flexWrap: "wrap"
  }}
>
  {/* Left Side - Table Title */}
  <Typography
    variant="h6"
    gutterBottom
    sx={{ color: themeColor, fontWeight: "bold", m: 0 }}
  >
    📋 Crop Selection Table
  </Typography>

  {/* Right Side - Search & Status */}
  <Box
    sx={{
      display: "flex",
      gap: 2,
      alignItems: "center",
      flexWrap: "wrap",
      ml: "auto"
    }}
  >
    {/* Status Row */}
    <Box
      sx={{
    display: "flex",
    gap: 3,
    alignItems: "center",
    backgroundColor: "#e3eaf6",
    borderRadius: 1,
    p: 1.5,
    flexWrap: "wrap"

    
  }}
>
  {/* 🌾 Agricultural Year */}
  <Box
    sx={{
      backgroundColor: themeColor,
      color: "white",
      px: 1.5,
      py: 0.5,
      borderRadius: 1,
      fontWeight: "bold",
      fontSize: "0.8rem"
    }}
  >
    {agriculturalYear}
  </Box>
  
      <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
    ✅ Major: {getSelectedCountByType("Major")} / {getTotalMajorCount()}
  </Typography>
  <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
    ✅ Minor: {getSelectedCountByType("Minor")} / {getTotalMinorCount()}
  </Typography>
  <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
    🌾 Total: {getTotalSelectedCount()} / {getTotalCropsCount()}
  </Typography>
    </Box>

    {/* Search Box */}
    <TextField
      variant="outlined"
      size="small"
      placeholder="Search..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        minWidth: 220,
        backgroundColor: "white",
        borderRadius: 1
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon sx={{ color: themeColor }} />
          </InputAdornment>
        )
      }}
    />
  </Box>
</Box>


        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: themeColor }}>
              <TableRow>
                {[
                  { id: "id", label: "Sl.No" },
                  { id: "name", label: "Crop Name" },
                  { id: "frame", label: "Frame" },
                  { id: "ccNumber", label: "Number of CC" },
                  { id: "type", label: "Crop Type" },
                  { id: "selected", label: "Select for CCE" }
                ].map((col) => (
                  <TableCell key={col.id} sx={{ color: "white" }}>
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleSort(col.id)}
                      sx={{ color: "white" }}
                    >
                      <strong>{col.label}</strong>
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.frame}</TableCell>
                  <TableCell>{row.ccNumber}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={row.selected}
                      onChange={() => handleCheckboxChange(row.id)}
                      sx={{ color: themeColor, "&.Mui-checked": { color: themeColor } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
<TablePagination
  component="div"
  count={filteredData.length}
  page={page}
  onPageChange={(_, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }}
  rowsPerPageOptions={[5, 10, 25, 50]}
/>
      </Paper>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
  <Button
    variant="contained"
    sx={{ backgroundColor: themeColor }}
    onClick={handleSaveOrUpdate}
  >
    Save Selection
  </Button>
</Box>

      </Box> 
    </Grid>
    </Grid>
  );
};

export default CceCropSelection;
