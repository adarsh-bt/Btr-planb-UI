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
const listTypeOptions = [
  "House List",
  "Cultivators List",
  "Thandaper Number",
  "Others",
];
const TOTAL_REQUIRED = 100;

const KeyPlotEntryNonBtr = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [localBodies, setLocalBodies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localBodyData, setLocalBodyData] = useState({});
  const [listTypes, setListTypes] = useState({});
  const [villageOptions, setVillageOptions] = useState([]);

  const villageToBlocks = useMemo(() => {
    const map = {};
    (villageOptions || []).forEach((v) => {
      if (v?.revenueVillageName) map[v.revenueVillageName] = v.blockCodes || [];
    });
    return map;
  }, [villageOptions]);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("slNo");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const zoneId =
    typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;

  useEffect(() => {
    const fetchLocalBodies = async () => {
      if (!zoneId) {
        setLocalBodies([]);
        setLocalBodyData({});
        setListTypes({});
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:8082/btr-service/localbodies/by-zone/${zoneId}`
        );
        if (!res.ok)
          throw new Error(`Failed to load local bodies: ${res.status}`);
        const data = await res.json();
        setLocalBodies(data || []);

        const initialListTypes = {};
        (data || []).forEach((lb) => {
          initialListTypes[lb.id] = "House List";
        });
        setListTypes(initialListTypes);

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
        setError(err.message || "Error fetching local bodies");
      } finally {
        setLoading(false);
      }
    };
    fetchLocalBodies();
  }, [zoneId]);

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

  const descendingComparator = (a, b, orderBy) => {
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

  const handleVillageChange = (lbId, id, villageName) => {
    const blocks = villageToBlocks[villageName] || [];
    const defaultBlock = blocks.length > 0 ? blocks[0] : "";
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
      const newId =
        current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 1;
      const newSlNo =
        current.length > 0 ? Math.max(...current.map((r) => r.slNo)) + 1 : 1;
      return {
        ...prev,
        [lbId]: [
          ...current,
          {
            id: newId,
            slNo: newSlNo,
            village: "",
            villageBlock: "",
            villageBlockOptions: [],
            name: "",
            address: "",
            houseNo: "",
            thandaperNo: "",
            mainNo: "",
            subNo: "",
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

  const handleListTypeChange = (lbId, value) => {
    setListTypes((prev) => ({ ...prev, [lbId]: value }));
  };

  const handleSaveAll = () => {
    const payload = {
      zoneId,
      keyplotsByLocalBody: Object.fromEntries(
        Object.entries(localBodyData).map(([lbId, rows]) => [
          lbId,
          {
            listType: listTypes[lbId] || "House List",
            keyplots: rows.map(
              ({ villageBlockOptions, ...rest }) => rest
            ),
          },
        ])
      ),
    };
    console.log("Final Data:", payload);
    alert("All Keyplots saved! Check console for details.");
  };

  const getTableHeaders = (lbId) => {
    const baseHeaders = ["Sl. No", "Village", "Village Block"];
    const houseListHeaders = ["Name", "Address", "House No."];
    const cultivatorListHeaders = ["Name", "Address"];
    const thandaperHeaders = ["Name", "Address", "Thandaper No."];
    const othersHeaders = ["Name", "Address", "Main No.", "Sub No."];
    const finalHeaders = [
      "Survey No.",
      "Sub Div No.",
      "Area (Cents)",
      "Land Type",
      "Actions",
    ];

    const currentListType = listTypes[lbId];

    if (currentListType === "House List") {
      return [...baseHeaders, ...houseListHeaders, ...finalHeaders];
    }
    if (currentListType === "Cultivators List") {
      return [...baseHeaders, ...cultivatorListHeaders, ...finalHeaders];
    }
    if (currentListType === "Thandaper Number") {
      return [...baseHeaders, ...thandaperHeaders, ...finalHeaders];
    }
    if (currentListType === "Others") {
      return [...baseHeaders, ...othersHeaders, ...finalHeaders];
    }
    return [...baseHeaders, ...finalHeaders];
  };

  return (
    <Grid container spacing={3}>
      <Box
        sx={{
          p: 3,
          maxWidth: 1600,
          margin: "0 auto",
          width: "100%",
          minHeight: 400,
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Entry (Total Required: {TOTAL_REQUIRED})
        </Typography>

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
              {localBodies.map((lb, idx) => (
                <Tab
                  key={lb.id}
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1,
                        textTransform: "none",
                      }}
                    >
                      <Typography>
                        {`${lb.name} (${(localBodyData[lb.id] || []).length})`}
                      </Typography>
                      {activeTab === idx && (
                        <TextField
                          select
                          value={listTypes[lb.id] || "House List"}
                          onChange={(e) =>
                            handleListTypeChange(lb.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                          sx={{ minWidth: 180 }}
                        >
                          {listTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {localBodies.map((lb, idx) => {
          const sortedRows = sortedByLocalBody[lb.id] || [];
          const currentListType = listTypes[lb.id];
          const headers = getTableHeaders(lb.id);
          const colSpan = headers.length;

          return (
            <div
              key={lb.id}
              style={{ display: activeTab === idx ? "block" : "none" }}
            >
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {headers.map((col) => (
                          <TableCell
                            key={col}
                            align="center"
                            sx={{
                              bgcolor: "#05307a",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {col}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRows
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                        .map((row) => (
                          <TableRow key={row.id}>
                            <TableCell align="center">{row.slNo}</TableCell>
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.village}
                                onChange={(e) =>
                                  handleVillageChange(
                                    lb.id,
                                    row.id,
                                    e.target.value
                                  )
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

                            {(currentListType === "House List" ||
                              currentListType === "Cultivators List" ||
                              currentListType === "Thandaper Number" ||
                              currentListType === "Others") && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.name}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        row.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    value={row.address}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        row.id,
                                        "address",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            {currentListType === "House List" && (
                              <TableCell align="center">
                                <TextField
                                  value={row.houseNo}
                                  onChange={(e) =>
                                    handleChange(
                                      lb.id,
                                      row.id,
                                      "houseNo",
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>
                            )}

                            {currentListType === "Thandaper Number" && (
                              <TableCell align="center">
                                <TextField
                                  value={row.thandaperNo}
                                  onChange={(e) =>
                                    handleChange(
                                      lb.id,
                                      row.id,
                                      "thandaperNo",
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>
                            )}

                            {currentListType === "Others" && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.mainNo}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        row.id,
                                        "mainNo",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    value={row.subNo}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        row.id,
                                        "subNo",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            <TableCell align="center">
                              <TextField
                                value={row.surveyNo}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    row.id,
                                    "surveyNo",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={row.subDivNo}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    row.id,
                                    "subDivNo",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                value={row.area}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    row.id,
                                    "area",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.landType}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    row.id,
                                    "landType",
                                    e.target.value
                                  )
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
                        <TableCell colSpan={colSpan} align="right">
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

export default KeyPlotEntryNonBtr;
