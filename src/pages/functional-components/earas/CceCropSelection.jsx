import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Divider,
  Snackbar,
  Alert,
  TableSortLabel,
  InputAdornment
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

  // Added "ccNumber" with random numbers
  const [tableData, setTableData] = useState([
    { id: 1, name: "Crop A", frame: "Wet", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 2, name: "Crop B", frame: "Dry", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 3, name: "Crop C", frame: "Wet", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 4, name: "Crop D", frame: "Dry", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 5, name: "Crop E", frame: "Wet", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 6, name: "Crop F", frame: "Dry", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 7, name: "Crop G", frame: "Wet", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false },
    { id: 8, name: "Crop H", frame: "Dry", ccNumber: Math.floor(Math.random() * 100), major: false, minor: false }
  ]);

  const totalCount = (Number(majorCount) || 0) + (Number(minorCount) || 0);

  const getSelectedCount = (type) =>
    tableData.filter((row) => row[type]).length;

  const showSnackbar = (message) => {
    setSnackbar({ open: true, message, severity: "warning" });
  };

  const handleCheckboxChange = (id, type) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const currentCount = getSelectedCount(type);
          const limit =
            type === "major"
              ? Number(majorCount) || 0
              : type === "minor"
              ? Number(minorCount) || 0
              : 0;

          if (!row[type] && currentCount >= limit) {
            showSnackbar(`You can only select up to ${limit} ${type} crops.`);
            return row;
          }

          const totalSelected =
            getSelectedCount("major") + getSelectedCount("minor");
          if (!row[type] && totalSelected >= totalCount) {
            showSnackbar(
              `You can only select up to ${totalCount} crops in total.`
            );
            return row;
          }

          return { ...row, [type]: !row[type] };
        }
        return row;
      })
    );
  };

  const handleNumberInput = (setter) => (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setter(value.replace(/^0+/, "")); // remove leading zeros
    }
  };

  // Sorting logic
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = [...tableData].sort((a, b) => {
    let valA = a[orderBy];
    let valB = b[orderBy];

    // For boolean columns (major/minor)
    if (typeof valA === "boolean") {
      valA = valA ? 1 : 0;
      valB = valB ? 1 : 0;
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Search filter
  const filteredData = sortedData.filter(
    (row) =>
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.frame.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Paper
        sx={{
          p: 4,
          mb: 4,
          boxShadow: 6,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: `1px solid ${themeColor}20`
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          sx={{
            color: themeColor,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)"
          }}
        >
          🌱 CCE Major Minor Crop Listing
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
              sx={{
                "& .MuiInputLabel-root": { color: themeColor, fontWeight: "bold" }
              }}
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
              sx={{
                "& .MuiInputLabel-root": { color: themeColor, fontWeight: "bold" }
              }}
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
              sx={{
                "& .MuiInputLabel-root": { color: themeColor, fontWeight: "bold" }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper
        sx={{
          p: 4,
          boxShadow: 4,
          borderRadius: 3,
          backgroundColor: "#ffffff"
        }}
      >
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
                ✅ Major: {getSelectedCount("major")} / {majorCount || 0}
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
                ✅ Minor: {getSelectedCount("minor")} / {minorCount || 0}
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ color: themeColor }}>
                🌾 Total: {getSelectedCount("major") + getSelectedCount("minor")} / {totalCount}
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
                  { id: "frame", label: "Frame (Wet/Dry)" },
                  { id: "ccNumber", label: "Number of CC" }, // new sortable column
                  { id: "major", label: "Major" },
                  { id: "minor", label: "Minor" }
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
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": { backgroundColor: "#f1f4fa" }
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.frame}</TableCell>
                  <TableCell>{row.ccNumber}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={row.major}
                      onChange={() => handleCheckboxChange(row.id, "major")}
                      sx={{
                        color: themeColor,
                        "&.Mui-checked": { color: themeColor }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={row.minor}
                      onChange={() => handleCheckboxChange(row.id, "minor")}
                      sx={{
                        color: themeColor,
                        "&.Mui-checked": { color: themeColor }
                      }}
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
