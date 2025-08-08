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
  Alert
} from "@mui/material";

const themeColor = "#05307a";

const CceCropSelection = () => {
  const [majorCount, setMajorCount] = useState("");
  const [minorCount, setMinorCount] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "warning" });

  const [tableData, setTableData] = useState([
    { id: 1, name: "Crop A", frame: "Wet", major: false, minor: false },
    { id: 2, name: "Crop B", frame: "Dry", major: false, minor: false },
    { id: 3, name: "Crop C", frame: "Wet", major: false, minor: false },
    { id: 4, name: "Crop D", frame: "Dry", major: false, minor: false },
    { id: 5, name: "Crop E", frame: "Wet", major: false, minor: false },
    { id: 6, name: "Crop F", frame: "Dry", major: false, minor: false },
    { id: 7, name: "Crop G", frame: "Wet", major: false, minor: false },
    { id: 8, name: "Crop H", frame: "Dry", major: false, minor: false },
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
            showSnackbar(`You can only select up to ${totalCount} crops in total.`);
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
            fontWeight: "bold",
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
          border: `1px solid ${themeColor}20`,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          fontWeight="bold"
          sx={{
            color: themeColor,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
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
                "& .MuiInputLabel-root": {
                  color: themeColor,
                  fontWeight: "bold",
                },
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
                "& .MuiInputLabel-root": {
                  color: themeColor,
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Total"
              type="number"
              fullWidth
              value={totalCount}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": {
                  color: themeColor,
                  fontWeight: "bold",
                },
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
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: themeColor, fontWeight: "bold" }}
        >
          📋 Crop Selection Table
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#05307a" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>
                  <strong>Sl.No</strong>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <strong>Crop Name</strong>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <strong>Frame (Wet/Dry)</strong>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <strong>Major</strong>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <strong>Minor</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f1f4fa",
                    },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.frame}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={row.major}
                      onChange={() => handleCheckboxChange(row.id, "major")}
                      sx={{
                        color: themeColor,
                        "&.Mui-checked": {
                          color: themeColor,
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={row.minor}
                      onChange={() => handleCheckboxChange(row.id, "minor")}
                      sx={{
                        color: themeColor,
                        "&.Mui-checked": {
                          color: themeColor,
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Status Section */}
        <Box
          mt={3}
          p={2}
          sx={{
            backgroundColor: "#e3eaf6",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" fontWeight="bold" sx={{ color: themeColor }}>
            ✅ Major selected: {getSelectedCount("major")} / {majorCount || 0}
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ color: themeColor }}>
            ✅ Minor selected: {getSelectedCount("minor")} / {minorCount || 0}
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ color: themeColor }}>
            🌾 Total selected: {getSelectedCount("major") + getSelectedCount("minor")} / {totalCount}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CceCropSelection;
