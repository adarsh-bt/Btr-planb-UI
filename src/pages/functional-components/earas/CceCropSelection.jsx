import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Snackbar, Alert,
  TableSortLabel, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Breadcrumb from 'routes/Breadcrumb';
import axios from 'axios';
import mainapi from 'api/mainapi';

import authservice from "pages/authentication/services/authservice";

const BASE_URL = mainapi.FORM_API;
const themeColor = "#05307a";

const CropSelectionTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning"
  });
  const [tableData, setTableData] = useState([]);

  const showSnackbar = (message, severity = "warning") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const cropsPromise = axios.get(`${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-crops`, { headers });
      const logsPromise = axios.get(`${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs`, { headers });

      const [cropsResponse, logsResponse] = await Promise.all([cropsPromise, logsPromise]);

      const allCrops = cropsResponse.data;
      const existingLogs = logsResponse.data;

      // The logs endpoint returns a list of selected crops with their cropId.
      // We create a Set of these IDs for quick lookup.
      const selectedCropIds = new Set(existingLogs.map(log => log.cropId));

      const transformedData = allCrops.map(item => {
        // We check if the cropId from the master list exists in our set of selected crop IDs.
        const isSelected = selectedCropIds.has(item.cropId);
        return {
          id: item.cceId,
          name: item.cropName,
          frame: item.frameName,
          ccNumber: item.noOfCce,
          type: item.cceCropType.charAt(0).toUpperCase() + item.cceCropType.slice(1),
          selected: isSelected,
          // We can't get the logId from the current backend, so it remains null.
          logId: null
        };
      });

      setTableData(transformedData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showSnackbar("Error fetching data. Please check the console.", "error");
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleCheckboxChange = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    const currentUserId = authservice.userid();

    if (!currentUserId) {
        showSnackbar("User not authenticated. Please log in again.", "error");
        return;
    }

    const rowIndex = tableData.findIndex(row => row.id === id);
    const row = tableData[rowIndex];
    const isBeingSelected = !row.selected;

    // Optimistically update the UI to feel responsive
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex] = { ...row, selected: isBeingSelected };
    setTableData(updatedTableData);

    if (isBeingSelected) {
      // --- ACTION: SELECT (CREATE LOG) ---
      // This part works and will save the data.
      try {
        const payload = [{
          logId: null,
          cceId: id,
          addedBy: currentUserId,
          updatedBy: currentUserId,
          remarks: "Selected from frontend UI"
        }];

        await axios.post(
          `${BASE_URL}/earas-form1-entry/cce-crop-details/saveOrUpdate`,
          payload,
          { headers }
        );
        showSnackbar(`Crop "${row.name}" selected successfully.`, "success");
      } catch (error) {
        console.error("Error saving CCE log:", error);
        showSnackbar(`Failed to select crop "${row.name}".`, "error");
        // Revert UI on failure
        setTableData(tableData);
      }
    } else {
      // --- ACTION: DESELECT (NO BACKEND SUPPORT) ---
      // This action cannot be persisted. We will show a warning to the user.
      showSnackbar(
        `Deselection for "${row.name}" cannot be saved. It will be selected again on refresh.`,
        "error"
      );
      console.warn(`Cannot persist deselection for cceId ${id} because a DELETE endpoint is missing in the backend.`);
    }
  };

  // ... (rest of your component code remains the same)

  const getSelectedCountByType = (type) =>
    tableData.filter((row) => row.selected && row.type === type).length;

  const getTotalSelectedCount = () =>
    tableData.filter((row) => row.selected).length;

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
      (row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.frame && row.frame.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (row.type && row.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Grid container spacing={3}>
       <Breadcrumb />
      <Grid item xs={12}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000} // Increased duration for the warning
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              backgroundColor: snackbar.severity === 'success' ? '#4CAF50' : snackbar.severity === 'error' ? '#D32F2F' : themeColor,
              color: "white",
              fontWeight: "bold"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Box sx={{ p: 3 }}>
          <Paper sx={{ p: 4, boxShadow: 4, borderRadius: 3 }}>
            {/* ... (rest of your JSX is the same) ... */}
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
                          sx={{
                            '& .MuiTableSortLabel-icon': { color: 'white !important' },
                          }}
                        >
                          <strong style={{color: 'white'}}>{col.label}</strong>
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
      </Grid>
    </Grid>
  );
};

export default CropSelectionTable;
