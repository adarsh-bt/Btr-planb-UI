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
} from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";

const landTypeOptions = ["Wet", "Dry"];
const TOTAL_REQUIRED = 100;

const KeyPlotEntry = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Local bodies from API
  const [localBodies, setLocalBodies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Rows per Local Body keyed by localBodyId
  const [localBodyData, setLocalBodyData] = useState({});

  // Taluks from API
  const [talukOptions, setTalukOptions] = useState([]);

  // Villages from API (each has revenueVillageId, revenueVillageName, blockCodes: string[])
  const [villageOptions, setVillageOptions] = useState([]);

  // Fast lookup: village name -> blockCodes[]
  const villageToBlocks = useMemo(() => {
    const map = {};
    (villageOptions || []).forEach((v) => {
      if (v?.revenueVillageName) map[v.revenueVillageName] = v.blockCodes || [];
    });
    return map;
  }, [villageOptions]);

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("slNo");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Read zone id from localStorage
  const zoneId =
    typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;

  /** 🔹 Fetch taluks by zone */
  useEffect(() => {
    if (!zoneId) return;
    const fetchTaluks = async () => {
      try {
        const res = await fetch(
          `http://localhost:8082/btr-service/localbodies/revenue-taluks/${zoneId}`
        );
        if (!res.ok) throw new Error("Failed to load taluks");
        const data = await res.json();
        setTalukOptions(data || []);
      } catch (err) {
        console.error("Error fetching taluks:", err);
      }
    };
    fetchTaluks();
  }, [zoneId]);

  /** 🔹 Fetch local bodies by zone */
  useEffect(() => {
    let abort = false;
    const fetchLocalBodies = async () => {
      if (!zoneId) {
        setLocalBodies([]);
        setLocalBodyData({});
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:8082/btr-service/localbodies/by-zone/${zoneId}`
        );
        if (!res.ok) throw new Error(`Failed to load local bodies: ${res.status}`);
        const data = await res.json();
        if (abort) return;
        setLocalBodies(data || []);
        setLocalBodyData((prev) => {
          const next = { ...prev };
          (data || []).forEach((lb) => {
            if (!next[lb.id]) next[lb.id] = [];
          });
          Object.keys(next).forEach((key) => {
            const exists = (data || []).some(
              (lb) => String(lb.id) === String(key)
            );
            if (!exists) delete next[key];
          });
          return next;
        });
        setActiveTab((t) =>
          data && data.length > 0 ? Math.min(t, data.length - 1) : 0
        );
      } catch (err) {
        if (!abort) setError(err.message || "Error fetching local bodies");
      } finally {
        if (!abort) setLoading(false);
      }
    };
    fetchLocalBodies();
    return () => {
      abort = true;
    };
  }, [zoneId]);

  /** 🔹 Fetch villages by zone (now includes blockCodes[]) */
  useEffect(() => {
    if (!zoneId) return;
    const fetchVillages = async () => {
      try {
        const res = await fetch(
          `http://localhost:8082/btr-service/localbodies/revenue-villages/${zoneId}`
        );
        if (!res.ok) throw new Error("Failed to load villages");
        const data = await res.json();
        setVillageOptions(data || []);
      } catch (err) {
        console.error("Error fetching villages:", err);
      }
    };
    fetchVillages();
  }, [zoneId]);

  const totalKeyplots = Object.values(localBodyData).reduce(
    (sum, rows) => sum + rows.length,
    0
  );

  // Sorting helpers
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };
  const descendingComparator = (a, b, orderBy) => {
    if (typeof a[orderBy] === "string" && typeof b[orderBy] === "string") {
      return b[orderBy].localeCompare(a[orderBy]);
    }
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };
  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };
  const sortedByLocalBody = useMemo(() => {
    const out = {};
    localBodies.forEach((lb) => {
      const rows = localBodyData[lb.id] || [];
      out[lb.id] = [...rows].sort(getComparator(order, orderBy));
    });
    return out;
  }, [localBodies, localBodyData, order, orderBy]);

  const handleChange = (lbId, id, field, value) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: prev[lbId].map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  };

  // When village changes, update village and its available block codes, and default villageBlock
  const handleVillageChange = (lbId, id, villageName) => {
    const blocks = villageToBlocks[villageName] || [];
    const defaultBlock = blocks.length ? blocks : "";
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: prev[lbId].map((row) =>
        row.id === id
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
      const current = prev[lbId] || [];
      const newId = current.length ? current[current.length - 1].id + 1 : 1;
      const newSlNo = current.length ? current[current.length - 1].slNo + 1 : 1;
      return {
        ...prev,
        [lbId]: [
          ...current,
          {
            id: newId,
            slNo: newSlNo,
            taluk: "",
            village: "",
            villageBlock: "",
            villageBlockOptions: [], // holds options for the selected village
            surveyNo: "",
            subDivNo: "",
            area: "",
            landType: "",
          },
        ],
      };
    });
  };

  const handleDeleteRow = (lbId, id) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: (prev[lbId] || []).filter((row) => row.id !== id),
    }));
  };

  const handleSaveAll = () => {
    const payload = {
      zoneId,
      keyplotsByLocalBody: Object.fromEntries(
        Object.entries(localBodyData).map(([lbId, rows]) => [lbId, rows])
      ),
    };
    console.log("Final Data:", payload);
    alert("All 100 Keyplots saved! Check console for details.");
  };

  return (
    <Grid container spacing={3}>
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: 1400, minHeight: 400 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Entry (Total Required: {TOTAL_REQUIRED})
        </Typography>

        {/* Tabs */}
        {localBodies.length > 0 && !loading && !error && (
          <Paper elevation={3} sx={{ mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {localBodies.map((lb) => (
                <Tab
                  key={lb.id}
                  label={`${lb.name} (${(localBodyData[lb.id] || []).length})`}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* Tables */}
        {localBodies.map((lb, idx) => {
          const sortedRows = sortedByLocalBody[lb.id] || [];
          return (
            <div key={lb.id} style={{ display: activeTab === idx ? "block" : "none" }}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {[
                          "Sl. No",
                          "Taluk",
                          "Village",
                          "Village Block",
                          "Survey No.",
                          "Sub Div No.",
                          "Area (Cents)",
                          "Land Type",
                          "Actions",
                        ].map((col, i) => (
                          <TableCell
                            key={i}
                            align="center"
                            sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}
                          >
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow key={row.id}>
                            <TableCell align="center">{row.slNo}</TableCell>

                            {/* ✅ Taluk Dropdown (from API) */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.taluk}
                                onChange={(e) =>
                                  handleChange(lb.id, row.id, "taluk", e.target.value)
                                }
                                sx={{ minWidth: 130 }}
                              >
                                {talukOptions.map((opt) => (
                                  <MenuItem
                                    key={opt.revenueTalukId}
                                    value={opt.revenueTalukName}
                                  >
                                    {opt.revenueTalukName}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Village dropdown (from API, drives Village Block options) */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.village}
                                onChange={(e) =>
                                  handleVillageChange(lb.id, row.id, e.target.value)
                                }
                                sx={{ minWidth: 160 }}
                              >
                                {villageOptions.map((opt) => (
                                  <MenuItem
                                    key={opt.revenueVillageId}
                                    value={opt.revenueVillageName}
                                  >
                                    {opt.revenueVillageName}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Village Block (dropdown from selected village’s blockCodes) */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.villageBlock}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    row.id,
                                    "villageBlock",
                                    e.target.value
                                  )
                                }
                                placeholder="Block Code"
                                sx={{ minWidth: 140 }}
                                disabled={!row.village}
                              >
                                {(row.villageBlockOptions || []).map((code) => (
                                  <MenuItem key={code} value={code}>
                                    {code}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Free text */}
                            <TableCell align="center">
                              <TextField
                                value={row.surveyNo}
                                onChange={(e) =>
                                  handleChange(lb.id, row.id, "surveyNo", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={row.subDivNo}
                                onChange={(e) =>
                                  handleChange(lb.id, row.id, "subDivNo", e.target.value)
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={row.area}
                                onChange={(e) =>
                                  handleChange(lb.id, row.id, "area", e.target.value)
                                }
                              />
                            </TableCell>

                            {/* Land Type */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.landType}
                                onChange={(e) =>
                                  handleChange(lb.id, row.id, "landType", e.target.value)
                                }
                                sx={{ minWidth: 90 }}
                              >
                                {landTypeOptions.map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Delete */}
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteRow(lb.id, row.id)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={9} align="right">
                          <Button
                            startIcon={<AddCircle />}
                            variant="outlined"
                            color="success"
                            onClick={() => handleAddRow(lb.id)}
                            disabled={totalKeyplots >= TOTAL_REQUIRED}
                          >
                            Add Keyplot
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={sortedRows.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) =>
                    setRowsPerPage(parseInt(e.target.value, 10))
                  }
                  rowsPerPageOptions={[50, 100, 150, 200]}
                />
              </Paper>
            </div>
          );
        })}

        {/* Save */}
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            disabled={totalKeyplots !== TOTAL_REQUIRED}
          >
            Save All Keyplots ({totalKeyplots}/{TOTAL_REQUIRED})
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default KeyPlotEntry;
