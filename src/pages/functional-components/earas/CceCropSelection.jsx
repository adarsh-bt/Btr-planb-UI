import React, { useState } from "react";
import {
  Box, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const themeColor = "#05307a";

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

  // Updated: Added type & selected fields
  const [tableData, setTableData] = useState([
    { id: 1, name: "Crop A", frame: "Wet", ccNumber: 45, type: "Major", selected: false },
    { id: 2, name: "Crop B", frame: "Dry", ccNumber: 20, type: "Minor", selected: false },
    { id: 3, name: "Crop C", frame: "Wet", ccNumber: 60, type: "Major", selected: false },
    { id: 4, name: "Crop D", frame: "Dry", ccNumber: 15, type: "Minor", selected: false },
    { id: 5, name: "Crop E", frame: "Wet", ccNumber: 30, type: "Major", selected: false },
    { id: 6, name: "Crop F", frame: "Dry", ccNumber: 10, type: "Minor", selected: false }
  ]);

  const totalCount = (Number(majorCount) || 0) + (Number(minorCount) || 0);

  

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

            if (row.type === "Major" && selectedMajor >= (Number(majorCount) || 0)) {
              showSnackbar(`You can only select ${majorCount || 0} Major crops.`);
              return row;
            }
            if (row.type === "Minor" && selectedMinor >= (Number(minorCount) || 0)) {
              showSnackbar(`You can only select ${minorCount || 0} Minor crops.`);
              return row;
            }
            if (totalSelected >= totalCount) {
              showSnackbar(`You can only select ${totalCount} crops in total.`);
              return row;
            }
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

  return (
    <Box p={4} sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
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

      {/* Top Section */}
      <Paper sx={{ p: 4, mb: 4, boxShadow: 6, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: themeColor }}>
          🌱 CCE Crop Selection
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
          {/* Agricultural Year */}
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
      </Paper>

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
        backgroundColor: "#e3eaf6",
        borderRadius: 1,
        p: 1.5
      }}
    >
      <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
        ✅ Major: {getSelectedCountByType("Major")} / {majorCount || 0}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
        ✅ Minor: {getSelectedCountByType("Minor")} / {minorCount || 0}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
        🌾 Total: {getTotalSelectedCount()} / {totalCount}
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
              {filteredData.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
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
      </Paper>
    </Box>
  );
};

export default CceCropSelection;
