import React, { useState, useEffect } from "react";
import {
  Box, Button, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment, TablePagination, Tab, Tabs
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
  const [tabValue, setTabValue] = useState(0); // 0 for Major, 1 for Minor

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning"
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState([]);

  // Get filtered data based on tab
  const getDataByTab = () => {
    const tabType = tabValue === 0 ? "Major" : "Minor";
    return tableData.filter(row => row.type === tabType);
  };

  const tabData = getDataByTab();

  const sortedData = [...tabData].sort((a, b) => {
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
      row.frame.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getTotalCountByType = (type) =>
    tableData.filter(row => row.type === type).length;

  const getTotalMajorCount = () => getTotalCountByType("Major");
  const getTotalMinorCount = () => getTotalCountByType("Minor");
  const getTotalCropsCount = () => tableData.length;

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
        selected: item.selected,
        logId: item.logId
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error("Error fetching crop data", error);
      showSnackbar("Failed to load crop details");
    }
  };

  const buildPayload = () => {
    const newlySelected = tableData
      .filter(row => row.selected && !row.logId)
      .map(row => ({
        logId: null,
        cceId: row.id,
        addedBy: userId,
        updatedBy: userId,
        remarks: "CCE crop selected"
      }));

    const deselected = tableData
      .filter(row => !row.selected && row.logId)
      .map(row => ({
        logId: row.logId,
        cceId: row.id,
        action: "DELETE"
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
        payload,
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

      fetchCrops();
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

  const handleCheckboxChange = (id) => {
    setTableData((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          return { ...row, selected: !row.selected };
        }
        return row;
      })
    );
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    setSearchTerm("");
    setOrder("asc");
    setOrderBy("id");
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
                  {/* Agricultural Year */}
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

            {/* Tabs for Major and Minor */}
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                mb: 3,
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontSize: '0.5 rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: themeColor,
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: themeColor,
                }
              }}
            >
              <Tab 
                label={`Major Crops (${getTotalMajorCount()})`} 
                sx={{ 
                  '&:hover': { color: themeColor }
                }} 
              />
              <Tab 
                label={`Minor Crops (${getTotalMinorCount()})`} 
                sx={{ 
                  '&:hover': { color: themeColor }
                }} 
              />
            </Tabs>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: themeColor }}>
                  <TableRow>
                    {[
                      { id: "id", label: "Sl.No" },
                      { id: "name", label: "Crop Name" },
                      { id: "frame", label: "Frame" },
                      { id: "ccNumber", label: "Number of CC" },
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
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                        <Typography variant="body1" color="textSecondary">
                          No {tabValue === 0 ? "Major" : "Minor"} crops available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.frame}</TableCell>
                        <TableCell>{row.ccNumber}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={row.selected}
                            onChange={() => handleCheckboxChange(row.id)}
                            sx={{ 
                              color: themeColor, 
                              "&.Mui-checked": { color: themeColor } 
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {paginatedData.length > 0 && (
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
            )}
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