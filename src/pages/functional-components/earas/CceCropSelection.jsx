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
import api from "api/api";
import AuthService from "pages/authentication/services/authservice";

const FORM_URL = mainapi.FORM_API;

const themeColor = "#05307a";

const userId = localStorage.getItem("userId"); // UUID

const CceCropSelection = () => {
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
      // Fetch all available crops
      const allCropsResponse = await axios.get(
        `${FORM_URL}/earas-form1-entry/cce-crop-details/cce-crops/fetch-all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("All Crops API RESPONSE:", allCropsResponse.data);

      if (!allCropsResponse.data || !allCropsResponse.data.payload || !Array.isArray(allCropsResponse.data.payload)) {
        throw new Error("Invalid API response format");
      }
      const agriYear = AuthService.agriyear();
      // Fetch already selected crops for the current year
      const selectedCropsResponse = await api.get(
        `${FORM_URL}/earas-form1-entry/cce-crop-details/cce-crops-selected/fetch-all`,
        {
          params: {
            agriYear: agriYear,
          }
        }
      );

      console.log("Selected Crops API RESPONSE:", selectedCropsResponse.data);

      // Create a Set of selected crop IDs for easy lookup
      const selectedCceIds = new Set();
      const selectedCropsMap = new Map(); // Store logId and other details

      if (selectedCropsResponse.data && selectedCropsResponse.data.payload && Array.isArray(selectedCropsResponse.data.payload)) {
        selectedCropsResponse.data.payload.forEach(item => {
          selectedCceIds.add(item.cceId);
          selectedCropsMap.set(item.cceId, {
            logId: item.logId,
            selectedDate: item.selectedDate,
            addedBy: item.addedBy
          });
        });
      }

      const formattedData = allCropsResponse.data.payload
        .map(item => {
          const isAlreadySelected = selectedCceIds.has(item.cceId);
          const selectedInfo = selectedCropsMap.get(item.cceId);

          return {
            id: item.cceId,
            name: item.cropNameEn,
            frame: item.frameName,
            ccNumber: item.noOfCce,
            type: item.cceCropType === "major" ? "Major" : "Minor",
            selected: isAlreadySelected, // Mark as selected if already in DB
            logId: selectedInfo ? selectedInfo.logId : null,
            isAlreadySelected: isAlreadySelected // Add flag for already selected crops
          };
        });

      setTableData(formattedData);

    } catch (error) {
      console.error("FULL ERROR:", error);
      showSnackbar("Failed to load crop details");
    }
  };

  const buildPayload = () => {
    const createPayload = [];
    const deletePayload = [];

    // For newly selected crops (without logId)
    tableData.forEach(row => {
      if (row.selected && !row.logId && !row.isAlreadySelected) {
        createPayload.push({
          cceId: row.id,
          addedBy: userId,
          remarks: "CCE crop selected",
          agriYear: AuthService.agriyear()
          // logId will be null for new records
        });
      }
      // For deselected crops (that were previously selected)
      else if (!row.selected && row.logId && row.isAlreadySelected) {
        deletePayload.push({
          logId: row.logId,
          cceId: row.id,
          action: "DELETE"
        });
      }
    });

    // Combine both operations in the format expected by backend
    const payload = [...createPayload, ...deletePayload];

    console.log("Final Payload:", payload);
    return payload;
  };

  const handleSaveOrUpdate = async () => {
    const token = localStorage.getItem("token");
    const payload = buildPayload();

    if (payload.length === 0) {
      showSnackbar("No changes to save");
      return;
    }
    console.log("payload   " + payload)
    try {
      await api.post(
        `${FORM_URL}/earas-form1-entry/cce-crop-details/saveOrUpdate`,
        payload);

      setSnackbar({
        open: true,
        message: `Saved successfully`,
        severity: "success"
      });

      fetchCrops(); // Refresh the data
    } catch (error) {
      console.error("Save/Update failed", error);
      console.error("Error response:", error.response?.data);
      showSnackbar(error.response?.data?.message || "Failed to save changes");
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
        if (row.id === id && !row.isAlreadySelected) {
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

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" >
          Crop Selection
        </Typography>
        {/* Snackbar - Now positioned at top center */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={{ mt: 8 }} // Add margin top to avoid overlapping with breadcrumb
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              backgroundColor: snackbar.severity === "success" ? "#4caf50" : themeColor,
              color: "white",
              fontWeight: "bold",
              '& .MuiAlert-icon': {
                color: "white"
              }
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
              <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: themeColor }}>
                📋 Crop Selection
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
                      { id: "ccNumber", label: "Number of CCE" },
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
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                              checked={row.selected}
                              onChange={() => handleCheckboxChange(row.id)}
                              disabled={row.isAlreadySelected}
                              sx={{
                                color: themeColor,
                                "&.Mui-checked": {
                                  color: themeColor
                                }
                              }}
                            />
                            {row.isAlreadySelected && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#666',
                                  fontStyle: 'italic',
                                  fontSize: '0.7rem'
                                }}
                              >
                                (Already selected)
                              </Typography>
                            )}
                          </Box>
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