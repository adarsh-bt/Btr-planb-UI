import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import { AddCircle, Delete, ArrowDropDown, KeyboardArrowDown } from "@mui/icons-material";

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
  const [activeVillageTab, setActiveVillageTab] = useState({});
  const [localBodies, setLocalBodies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localBodyData, setLocalBodyData] = useState({});
  const [listTypes, setListTypes] = useState({});
  const [villageOptions, setVillageOptions] = useState([]);
  
  // Popover state
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedLocalBody, setSelectedLocalBody] = useState(null);

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

  // Get villages for a specific local body
  const getVillagesForLocalBody = (localBodyId) => {
    return villageOptions.filter(v => 
      v.revenueVillageName
    );
  };

  // Get current village key for local body
  const getCurrentVillageKey = (lbId) => {
    const villages = getVillagesForLocalBody(lbId);
    const currentIndex = activeVillageTab[lbId] || 0;
    return villages[currentIndex]?.revenueVillageName || "";
  };

  // Get current list type for local body and village
  const getCurrentListType = (lbId, villageName) => {
    return listTypes[`${lbId}_${villageName}`] || "House List";
  };

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

        // Initialize active village tab for each local body
        const initialVillageTabs = {};
        (data || []).forEach((lb) => {
          initialVillageTabs[lb.id] = 0;
        });
        setActiveVillageTab(initialVillageTabs);

        setLocalBodyData((prev) => {
          const next = { ...prev };
          (data || []).forEach((lb) => {
            if (!next[lb.id]) next[lb.id] = {};
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
        
        // Initialize list types for all village-local body combinations
        const initialListTypes = {};
        localBodies.forEach(lb => {
          (data || []).forEach(village => {
            initialListTypes[`${lb.id}_${village.revenueVillageName}`] = "House List";
          });
        });
        setListTypes(prev => ({ ...prev, ...initialListTypes }));
        
      } catch (err) {
        console.error("Error fetching villages:", err);
      }
    };
    fetchVillages();
  }, [zoneId, localBodies]);

  const totalKeyplots = Object.values(localBodyData).reduce(
    (sum, lbData) => sum + Object.values(lbData).reduce((villageSum, rows) => villageSum + (rows?.length || 0), 0),
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

  const sortedByLocalBodyAndVillage = useMemo(() => {
    const out = {};
    localBodies.forEach((lb) => {
      out[lb.id] = {};
      const villages = getVillagesForLocalBody(lb.id);
      villages.forEach(village => {
        const villageName = village.revenueVillageName;
        const rows = localBodyData[lb.id]?.[villageName] || [];
        out[lb.id][villageName] = [...rows].sort(getComparator(order, orderBy));
      });
    });
    return out;
  }, [localBodies, localBodyData, order, orderBy, villageOptions]);

  const handleChange = (lbId, villageName, id, field, value) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: (prev[lbId]?.[villageName] || []).map((row) =>
          row.id === id ? { ...row, [field]: value } : row
        ),
      },
    }));
  };

  const handleVillageChange = (lbId, villageName, id, newVillageName) => {
    const blocks = villageToBlocks[newVillageName] || [];
    const defaultBlock = blocks.length > 0 ? blocks[0] : "";
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: (prev[lbId]?.[villageName] || []).map((row) =>
          row.id === id
            ? {
                ...row,
                village: newVillageName,
                villageBlock: defaultBlock,
                villageBlockOptions: blocks,
              }
            : row
        ),
      },
    }));
  };

  const handleAddRow = (lbId, villageName) => {
    if (totalKeyplots >= TOTAL_REQUIRED) return;
    setLocalBodyData((prev) => {
      const current = prev[lbId]?.[villageName] || [];
      const newId =
        current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 1;
      const newSlNo =
        current.length > 0 ? Math.max(...current.map((r) => r.slNo)) + 1 : 1;
      
      // Get village blocks for the current village
      const villageBlocks = villageToBlocks[villageName] || [];
      const defaultBlock = villageBlocks.length > 0 ? villageBlocks[0] : "";
      
      return {
        ...prev,
        [lbId]: {
          ...prev[lbId],
          [villageName]: [
            ...current,
            {
              id: newId,
              slNo: newSlNo,
              village: villageName, // Set to current village tab
              villageBlock: defaultBlock, // Set default block
              villageBlockOptions: villageBlocks, // Set available blocks for this village
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
        },
      };
    });
  };

  const handleDeleteRow = (lbId, villageName, id) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: (prev[lbId]?.[villageName] || []).filter((row) => row.id !== id),
      },
    }));
  };

  const handleVillageTabClick = (event, lbId, villageName) => {
    setPopoverAnchorEl(event.currentTarget);
    setSelectedVillage(villageName);
    setSelectedLocalBody(lbId);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setSelectedVillage(null);
    setSelectedLocalBody(null);
  };

  const handleListTypeChange = (listType) => {
    if (selectedLocalBody && selectedVillage) {
      setListTypes((prev) => ({
        ...prev,
        [`${selectedLocalBody}_${selectedVillage}`]: listType,
      }));
      handlePopoverClose();
    }
  };

  const handleSaveAll = () => {
    const payload = {
      zoneId,
      keyplotsByLocalBodyAndVillage: Object.fromEntries(
        Object.entries(localBodyData).map(([lbId, villageData]) => [
          lbId,
          Object.fromEntries(
            Object.entries(villageData || {}).map(([villageName, rows]) => [
              villageName,
              {
                listType: getCurrentListType(lbId, villageName),
                keyplots: rows.map(
                  ({ villageBlockOptions, ...rest }) => rest
                ),
              },
            ])
          ),
        ])
      ),
    };
    console.log("Final Data:", payload);
    alert("All Keyplots saved! Check console for details.");
  };

  const getTableHeaders = (lbId, villageName) => {
    const baseHeaders = ["Sl. No", "Village Block"]; // Removed "Village" column
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

    const currentListType = getCurrentListType(lbId, villageName);

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

  const getVillageRowCount = (lbId, villageName) => {
    return localBodyData[lbId]?.[villageName]?.length || 0;
  };

  const getLocalBodyTotal = (lbId) => {
    const villages = getVillagesForLocalBody(lbId);
    return villages.reduce((sum, village) => {
      return sum + getVillageRowCount(lbId, village.revenueVillageName);
    }, 0);
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
          Non-BTR KeyPlot Entry
           {/* (Total Required: {TOTAL_REQUIRED}) */}
        </Typography>

        {/* Top-level tabs for Local Bodies */}
        {localBodies.length > 0 && !loading && !error && (
          <Paper elevation={3} sx={{ mb: 0 }}>
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
                  label={`${lb.name} (${getLocalBodyTotal(lb.id)})`}
                />
              ))}
            </Tabs>
          </Paper>
        )}

        {/* Second-level tabs for Villages and Content */}
        {localBodies.map((lb, idx) => {
          const villages = getVillagesForLocalBody(lb.id);
          const currentVillageIndex = activeVillageTab[lb.id] || 0;
          const currentVillage = villages[currentVillageIndex];
          const currentVillageName = currentVillage?.revenueVillageName || "";
          const sortedRows = sortedByLocalBodyAndVillage[lb.id]?.[currentVillageName] || [];
          const currentListType = getCurrentListType(lb.id, currentVillageName);
          const headers = getTableHeaders(lb.id, currentVillageName);
          const colSpan = headers.length;

          return (
            <div
              key={lb.id}
              style={{ display: activeTab === idx ? "block" : "none" }}
            >
              {/* Village tabs with dropdown - Only show dropdown on active village tab */}
              {villages.length > 0 && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    mb: 0,
                    mt: 0,  
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                >
                  <Tabs
                    value={activeVillageTab[lb.id] || 0}
                    onChange={(e, newVal) =>
                      setActiveVillageTab(prev => ({ ...prev, [lb.id]: newVal }))
                    }
                    indicatorColor="secondary"
                    textColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: 'auto',
                      '& .MuiTab-root': {
                        minHeight: 'auto',
                        py: 1,
                        px: 2,
                        fontSize: '0.875rem',
                      },
                      // Add this part for blue text color on selected village tab
                      '& .MuiTab-root.Mui-selected': {
                        color: '#1976d2', // This is the blue color
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#1976d2', // This makes the indicator blue too
                      }
                    }}
                  >
                    {villages.map((village, villageIdx) => {
                      // Check if this village tab is currently active
                      const isActiveVillageTab = (activeVillageTab[lb.id] || 0) === villageIdx;
                      
                      return (
                        <Tab
                          key={village.revenueVillageId}
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                textTransform: "none",
                              }}
                            >
                              <Typography variant="body2">
                                {`${village.revenueVillageName} (${getVillageRowCount(lb.id, village.revenueVillageName)})`}
                              </Typography>
                              
                              {/* Conditionally render dropdown only on active village tab */}
                              {isActiveVillageTab && (
                                <Box
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVillageTabClick(e, lb.id, village.revenueVillageName);
                                  }}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: 1,
                                    py: 0.5,
                                    bgcolor: 'rgba(0, 0, 0, 0.08)',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      bgcolor: 'rgba(0, 0, 0, 0.12)',
                                    },
                                    minWidth: 120,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                    {getCurrentListType(lb.id, village.revenueVillageName)}
                                  </Typography>
                                  <KeyboardArrowDown fontSize="small" />
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      );
                    })}
                  </Tabs>
                </Paper>
              )}

              {/* Table content with added spacing from tabs */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  mt: 2,
                  borderTopLeftRadius: villages.length > 0 ? 2 : 8,
                  borderTopRightRadius: villages.length > 0 ? 2 : 8,
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    {currentVillageName} - {currentListType}
                  </Typography>
                </Box>
                
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
                            
                            {/* Removed Village column - Village Block is now the second column */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.villageBlock}
                                onChange={(e) =>
                                  handleChange(
                                    lb.id,
                                    currentVillageName,
                                    row.id,
                                    "villageBlock",
                                    e.target.value
                                  )
                                }
                                sx={{ minWidth: 140 }}
                              >
                                {/* Use blocks for the current village tab instead of row.villageBlockOptions */}
                                {(villageToBlocks[currentVillageName] || []).map((code) => (
                                  <MenuItem key={code} value={code}>
                                    {code}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>

                            {/* Dynamic columns based on list type */}
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
                                        currentVillageName,
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
                                        currentVillageName,
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
                                      currentVillageName,
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
                                      currentVillageName,
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
                                        currentVillageName,
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
                                        currentVillageName,
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
                                    currentVillageName,
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
                                    currentVillageName,
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
                                    currentVillageName,
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
                                    currentVillageName,
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
                                onClick={() => handleDeleteRow(lb.id, currentVillageName, row.id)}
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
                            onClick={() => handleAddRow(lb.id, currentVillageName)}
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

        {/* Popover for list type selection */}
        <Popover
          open={Boolean(popoverAnchorEl)}
          anchorEl={popoverAnchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <List sx={{ py: 0, minWidth: 180 }}>
            {listTypeOptions.map((listType) => (
              <ListItem key={listType} disablePadding>
                <ListItemButton 
                  onClick={() => handleListTypeChange(listType)}
                  selected={selectedLocalBody && selectedVillage && getCurrentListType(selectedLocalBody, selectedVillage) === listType}
                >
                  <ListItemText primary={listType} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Popover>

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
