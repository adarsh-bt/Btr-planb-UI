import React, { useState, useMemo, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";

const landTypeOptions = ["Wet", "Dry"];
const TOTAL_REQUIRED = 3;

/**
 * A robust fetch wrapper that handles non-OK responses and non-JSON content.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>} - The JSON response.
 */
const robustFetch = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Request failed with status ${response.status}: ${errorText || response.statusText}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  const responseText = await response.text();
  throw new Error(`Expected JSON response, but received: '${responseText.substring(0, 100)}...'`);
};


const KeyPlotEntry = () => {
  const [activeTab, setActiveTab] = useState(0);

  // API Data States
  const [localBodies, setLocalBodies] = useState([]);
  const [villageOptions, setVillageOptions] = useState([]);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [talukInfo, setTalukInfo] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Form data state, keyed by localBodyId
  const [localBodyData, setLocalBodyData] = useState({});
  
  /**
   * Safely parses user info from localStorage to prevent JSON parsing errors.
   * @returns {object|null} The parsed user object or null if it fails.
   */
  const getUserInfo = () => {
    if (typeof window === "undefined") return null;
    try {
      const userItem = localStorage.getItem("user");
      return userItem ? JSON.parse(userItem) : null;
    } catch (error) {
      console.error("Failed to parse user info from localStorage:", error);
      // Optionally remove the corrupted item
      localStorage.removeItem("user");
      return null;
    }
  };

  // Read IDs from localStorage
  const zoneId = typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;
  const userInfo = getUserInfo();
  const userId = userInfo?.id || "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // Fallback for testing

  // --- Data Fetching ---
  useEffect(() => {
    if (!zoneId) {
        setLoading(false);
        setError("No active zone selected. Please select a zone first.");
        toast.warn("No active zone found.");
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all initial data in parallel for efficiency
        const [lbData, villageData, distData, talukData] = await Promise.all([
          robustFetch(`http://localhost:8082/btr-service/localbodies/by-zone/${zoneId}`),
          robustFetch(`http://localhost:8082/btr-service/localbodies/revenue-villages/${zoneId}`),
          robustFetch(`http://localhost:8082/btr-service/localbodies/district/${zoneId}`),
          robustFetch(`http://localhost:8082/btr-service/localbodies/revenue-taluks/${zoneId}`),
        ]);

        setLocalBodies(lbData || []);
        setVillageOptions(villageData || []);
        setDistrictInfo(distData);
        setTalukInfo(talukData || []);

        // Initialize localBodyData state for each fetched local body
        setLocalBodyData((prev) => {
          const next = { ...prev };
          (lbData || []).forEach((lb) => {
            if (!next[lb.id]) next[lb.id] = [];
          });
          return next;
        });

      } catch (err) {
        console.error("Data fetching error:", err);
        setError(err.message);
        toast.error(`Data loading failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zoneId]);

  // --- Memoized Lookups for efficient data mapping ---
  const villageInfoMap = useMemo(() => {
    const map = new Map();
    villageOptions.forEach((v) => {
      map.set(v.revenueVillageName, {
        vcode: v.revenueVillageId,
        lsgcode: v.lsgCode,
        blockCodes: v.blockCodes || [],
      });
    });
    return map;
  }, [villageOptions]);

  const localBodyInfoMap = useMemo(() => {
    const map = new Map();
    localBodies.forEach((lb) => {
      map.set(lb.id, { lbcode: lb.code });
    });
    return map;
  }, [localBodies]);

  const totalKeyplots = Object.values(localBodyData).reduce(
    (sum, rows) => sum + (rows?.length || 0),
    0
  );

  // --- Handlers ---
  const handleChange = (lbId, rowId, field, value) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: prev[lbId].map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };

  const handleVillageChange = (lbId, rowId, villageName) => {
    const villageData = villageInfoMap.get(villageName);
    const blocks = villageData ? villageData.blockCodes : [];
    const defaultBlock = blocks.length > 0 ? blocks[0] : "";

    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: prev[lbId].map((row) =>
        row.id === rowId
          ? {
              ...row,
              village: villageName,
              villageBlock: defaultBlock,
              villageBlockOptions: blocks,
            }
          : row
      ),
    }));
  };

  const handleAddRow = (lbId) => {
    if (totalKeyplots >= TOTAL_REQUIRED) return;
    setLocalBodyData((prev) => {
      const currentRows = prev[lbId] || [];
      const newId = Date.now(); // Unique ID for the new row
      const newSlNo =
        currentRows.length > 0
          ? Math.max(...currentRows.map((r) => r.slNo)) + 1
          : 1;
      return {
        ...prev,
        [lbId]: [
          ...currentRows,
          {
            id: newId,
            slNo: newSlNo,
            village: "",
            villageBlock: "",
            villageBlockOptions: [],
            surveyNo: "",
            subDivNo: "",
            area: "",
            landType: "Wet", // Default value
          },
        ],
      };
    });
  };

  const handleDeleteRow = (lbId, rowId) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: (prev[lbId] || []).filter((row) => row.id !== rowId),
    }));
  };

  const handleSaveAll = async () => {
    if (!districtInfo || talukInfo.length === 0) {
      toast.error("District or Taluk data is not yet loaded. Please wait.");
      return;
    }

    setIsSaving(true);
    
    const allKeyplots = Object.entries(localBodyData).flatMap(([lbId, rows]) =>
        rows.map(row => ({ ...row, lbId: parseInt(lbId, 10) }))
    );

    const payload = allKeyplots.map((row) => {
      const villageData = villageInfoMap.get(row.village);
      const localBodyData = localBodyInfoMap.get(row.lbId);

      // Return null for invalid rows to filter them out later
      if (!villageData || !localBodyData || !row.surveyNo) {
        return null;
      }
      
      return {
        dcode: districtInfo.distId,
        tcode: talukInfo[0].revenueTalukId, // Assuming one taluk per zone
        vcode: villageData.vcode,
        lsgcode: villageData.lsgcode,
        lbcode: localBodyData.lbcode,
        zoneId: parseInt(zoneId, 10),
        user_id: userId,
        bcode: parseInt(row.villageBlock, 10) || null,
        ltype: row.landType.toUpperCase(),
        resvno: parseInt(row.surveyNo, 10),
        resbdno: row.subDivNo,
        totCent:row.area
      };
    }).filter(Boolean); // Filter out any null entries from invalid rows

    if (payload.length !== totalKeyplots) {
        toast.error("Some rows have missing or invalid data. Please check all fields.");
        setIsSaving(false);
        return;
    }

    try {
      const response = await fetch(
        "http://localhost:8082/btr-service/api/btr-data/saveAll",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      toast.success("All keyplots saved successfully!");
      console.log("Save successful:", result);
      // Optional: Reset form state after successful save
      // setLocalBodyData({}); 
    } catch (err) {
      console.error("Failed to save keyplots:", err);
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Zone Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" align="center" sx={{ p: 3 }}>Error: {error}</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Entry (Total Required: {TOTAL_REQUIRED})
        </Typography>

        {localBodies.length > 0 && (
          <Paper elevation={3} sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {localBodies.map((lb, index) => (
                <Tab
                  key={lb.id}
                  label={`${lb.name} (${(localBodyData[lb.id] || []).length})`}
                  id={`tab-${index}`}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {localBodies.map((lb, idx) => {
          const rows = localBodyData[lb.id] || [];
          return (
            <div
              key={lb.id}
              role="tabpanel"
              hidden={activeTab !== idx}
              id={`tabpanel-${idx}`}
            >
              {activeTab === idx && (
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                  <TableContainer component={Paper}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          {[ "Sl. No", "Village", "Village Block", "Survey No.", "Sub Div No.", "Area (Cents)", "Land Type", "Actions" ].map((col) => (
                            <TableCell key={col} align="center" sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell align="center">{row.slNo}</TableCell>
                            <TableCell>
                              <TextField select value={row.village} onChange={(e) => handleVillageChange(lb.id, row.id, e.target.value)} fullWidth>
                                {villageOptions.map((opt) => (
                                  <MenuItem key={opt.revenueVillageId} value={opt.revenueVillageName}>
                                    {opt.revenueVillageName}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField select value={row.villageBlock} onChange={(e) => handleChange(lb.id, row.id, "villageBlock", e.target.value)} fullWidth disabled={!row.village}>
                                {(row.villageBlockOptions || []).map((code) => (
                                  <MenuItem key={code} value={code}>{code}</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell><TextField value={row.surveyNo} onChange={(e) => handleChange(lb.id, row.id, "surveyNo", e.target.value)}/></TableCell>
                            <TableCell><TextField value={row.subDivNo} onChange={(e) => handleChange(lb.id, row.id, "subDivNo", e.target.value)}/></TableCell>
                            <TableCell><TextField value={row.area} onChange={(e) => handleChange(lb.id, row.id, "area", e.target.value)}/></TableCell>
                            <TableCell>
                              <TextField select value={row.landType} onChange={(e) => handleChange(lb.id, row.id, "landType", e.target.value)}>
                                {landTypeOptions.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                              </TextField>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => handleDeleteRow(lb.id, row.id)}><Delete /></IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={8} align="right">
                            <Button startIcon={<AddCircle />} variant="outlined" color="success" onClick={() => handleAddRow(lb.id)} disabled={totalKeyplots >= TOTAL_REQUIRED}>
                              Add Keyplot
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </div>
          );
        })}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            disabled={totalKeyplots !== TOTAL_REQUIRED || isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? "Saving..." : `Save All Keyplots (${totalKeyplots}/${TOTAL_REQUIRED})`}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default KeyPlotEntry;
