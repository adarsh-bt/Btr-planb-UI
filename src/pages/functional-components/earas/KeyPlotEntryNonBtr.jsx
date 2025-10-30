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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { 
  AddCircle, 
  Delete, 
  ArrowDropDown, 
  KeyboardArrowDown,
  CheckCircle,
  Cancel,
  Error as ErrorIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import mainapi from "api/mainapi";
import authservice from "pages/authentication/services/authservice";

const landTypeOptions = ["Wet", "Dry"];
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
  const [districtInfo, setDistrictInfo] = useState(null);
  const [talukInfo, setTalukInfo] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // BTypes API integration states
  const [activeBTypes, setActiveBTypes] = useState([]);
  const [listTypeOptions, setListTypeOptions] = useState([]);
  const [nonBtrTypeMapping, setNonBtrTypeMapping] = useState({});
  const [btypesLoading, setBtypesLoading] = useState(false);
  
  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Popover state
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedLocalBody, setSelectedLocalBody] = useState(null);

  const BASE_URL = mainapi.BASE_URL;
  const zoneId = typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;

  /**
   * Safely parses user info from localStorage to prevent JSON parsing errors.
   */
  const getUserInfo = () => {
    if (typeof window === "undefined") return null;
    try {
      const userItem = localStorage.getItem("user");
      return userItem ? JSON.parse(userItem) : null;
    } catch (error) {
      console.error("Failed to parse user info from localStorage:", error);
      
      return null;
    }
  };

  const userInfo = getUserInfo();
  const userId = authservice.userid();

  // Fetch active btypes from API
  useEffect(() => {
    const fetchActiveBTypes = async () => {
      setBtypesLoading(true);
      try {
        const BASE_URL = mainapi.BASE_URL;
        const response = await fetch(
          `${BASE_URL}/btr-service/api/btr-data/btypes/active`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        
        if (response.ok) {
          const btypeData = await response.json();
          setActiveBTypes(btypeData);
          
          // Filter out BTR (btypeId = 1) and create options
          const nonBtrOptions = btypeData
            .filter(btype => btype.btypeId !== 1)
            .map(btype => btype.btypeName);
          
          setListTypeOptions(nonBtrOptions);
          
          // Create dynamic mapping
          const mapping = {};
          btypeData.forEach(btype => {
            mapping[btype.btypeName] = btype.btypeId;
          });
          setNonBtrTypeMapping(mapping);
          
          console.log('Active BTypes loaded:', btypeData);
          console.log('Dynamic mapping created:', mapping);
          
        } else {
          throw new Error(`Failed to fetch btypes: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching active btypes:', error);
        toast.error('Failed to load btypes');

        // NO FALLBACK - Keep states empty
      setListTypeOptions([]);
      setNonBtrTypeMapping({});
    } finally {
      setBtypesLoading(false);
    }
  };
  
  fetchActiveBTypes();
}, []);
        
  //       // Fallback to hardcoded mapping if API fails
  //       setListTypeOptions([
  //         "House List",
  //         "Cultivators List", 
  //         "Thandaper Number",
  //         "Others"
  //       ]);
  //       setNonBtrTypeMapping({
  //         "House List": 2,
  //         "Cultivators List": 3,
  //         "Thandaper Number": 4,
  //         "Others": 5
  //       });
  //     } finally {
  //       setBtypesLoading(false);
  //     }
  //   };
    
  //   fetchActiveBTypes();
  // }, []);

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    let timeoutId;
    if (showSuccessModal) {
      timeoutId = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showSuccessModal]);

  // Auto-close error modal after 4 seconds
  useEffect(() => {
    let timeoutId;
    if (showErrorModal) {
      timeoutId = setTimeout(() => {
        setShowErrorModal(false);
      }, 4000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showErrorModal]);

  // Memoized Lookups
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
    return listTypes[`${lbId}_${villageName}`] || (listTypeOptions[0] || "House List");
  };

  // Data Fetching
  useEffect(() => {
    if (!zoneId) {
      setLocalBodies([]);
      setLocalBodyData({});
      setListTypes({});
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      const urls = [
        `${BASE_URL}/btr-service/localbodies/by-zone/${zoneId}`,
        `${BASE_URL}/btr-service/localbodies/revenue-villages/${zoneId}`,
        `${BASE_URL}/btr-service/localbodies/district/${zoneId}`,
        `${BASE_URL}/btr-service/localbodies/revenue-taluks/${zoneId}`,
      ];

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found, please log in again.");
        }

        const requests = urls.map(url =>
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
            return res.json();
          })
        );

        const [lbData, villageData, distData, talukData] = await Promise.all(requests);

        setLocalBodies(lbData || []);
        setVillageOptions(villageData || []);
        setDistrictInfo(distData);
        setTalukInfo(talukData || []);

        // Initialize active village tab for each local body
        const initialVillageTabs = {};
        (lbData || []).forEach((lb) => {
          initialVillageTabs[lb.id] = 0;
        });
        setActiveVillageTab(initialVillageTabs);

        setLocalBodyData((prev) => {
          const next = { ...prev };
          (lbData || []).forEach((lb) => {
            if (!next[lb.id]) next[lb.id] = {};
          });
          Object.keys(next).forEach((key) => {
            const exists = (lbData || []).some(
              (lb) => String(lb.id) === String(key)
            );
            if (!exists) delete next[key];
          });
          return next;
        });
        
        setActiveTab((t) =>
          lbData && lbData.length > 0 ? Math.min(t, lbData.length - 1) : 0
        );

      } catch (err) {
        console.error("Data fetching error:", err);
        setError(err.message);
        toast.error(`Data loading failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zoneId, BASE_URL]);

  useEffect(() => {
    if (!zoneId || !listTypeOptions.length) return;
    
    // Initialize list types for all village-local body combinations
    const initialListTypes = {};
    localBodies.forEach(lb => {
      villageOptions.forEach(village => {
        initialListTypes[`${lb.id}_${village.revenueVillageName}`] = listTypeOptions[0] || "House List";
      });
    });
    setListTypes(prev => ({ ...prev, ...initialListTypes }));
  }, [zoneId, localBodies, villageOptions, listTypeOptions]);

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
              village: villageName,
              villageBlock: defaultBlock,
              villageBlockOptions: villageBlocks,
              // Required fields for backend
              dcode: null,
              tcode: null,
              vcode: null,
              name: "",
              address: "",
              houseNo: "",
              thandaperNo: "",
              thandapersubNo:"",
              oldsvno: "",
              oldsubno: "",
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

  // Save handlers with modals
  const handleSaveButtonClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmModal(false);
    handleActualSave();
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  // Updated handleActualSave with backend integration and district/taluk data
  const handleActualSave = async () => {
    // Check if required reference data is loaded
    if (!districtInfo || talukInfo.length === 0) {
      toast.error("District or Taluk data is not yet loaded. Please wait.");
      return;
    }

    setIsSaving(true);
    
    try {
      // Transform data to match TblBtrDataDTO structure
      const dtoList = [];
      
      Object.entries(localBodyData).forEach(([lbId, villageData]) => {
        Object.entries(villageData || {}).forEach(([villageName, rows]) => {
          const currentListType = getCurrentListType(lbId, villageName);
          const btrTypeId = nonBtrTypeMapping[currentListType];
          
          rows.forEach(row => {
            // Get village data for vcode
            const villageData = villageInfoMap.get(row.village || villageName);
            const localBodyData = localBodyInfoMap.get(parseInt(lbId));
            
            if (!villageData || !localBodyData) {
              console.warn(`Missing data for village: ${row.village || villageName} or local body: ${lbId}`);
              return;
            }

            const dto = {
              dcode: districtInfo.distId, // From district API
              tcode: talukInfo[0].revenueTalukId, // From taluk API (assuming first taluk)
              vcode: villageData.vcode, // From village lookup
              bcode: row.villageBlock || "",
              lbcode: localBodyData.lbcode,
              ltype: row.landType || "",
              resvno: row.surveyNo ? parseInt(row.surveyNo) : null,
              resbdno: row.subDivNo || "",
              lsgcode: villageData.lsgcode,
              zoneId: parseInt(zoneId),
              user_id: userId,
              totCent: row.area ? parseFloat(row.area) : 0.0,
              btrtype: btrTypeId,
              // Conditional fields based on btrtype
              ...(btrTypeId === 2 && {
                ownername: row.name || "",
                address: row.address || "",
                wardno: row.wardNo ? parseInt(row.wardNo) : null,
                houseno: row.houseNo ? parseInt(row.houseNo) : null
              }),
              ...(btrTypeId === 3 && {
                ownername: row.name || "",
                address: row.address || ""
              }),
              ...(btrTypeId === 4 && {
                ownername: row.name || "",
                address: row.address || "",
                tpno: row.thandaperNo ? parseInt(row.thandaperNo) : null,
                tbsubdivisionno: row.thandapersubNo ? parseInt(row.thandapersubNo) : null
              }),
              ...(btrTypeId === 5 && {
                ownername: row.name || "",
                address: row.address || "",
                oldsvno: row.oldsvno ? parseInt(row.oldsvno) : null,
                oldsubno: row.oldsubno || ""
              })
            };
            
            dtoList.push(dto);
          });
        });
      });

      console.log("Final DTO List for POST:", dtoList);
      const BASE_URL = mainapi.BASE_URL;
      // Make POST request to saveAll endpoint
      const response = await fetch(
        `${BASE_URL}/btr-service/api/btr-data/saveAll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(dtoList),
        }
      );

      const result = await response.json();
      
      if (response.ok && result.status === 'Success') {
        setSavedCount(result.ids?.length || totalKeyplots);
        setShowSuccessModal(true);
        toast.success(`Successfully saved ${result.ids?.length || totalKeyplots} keyplots!`);
        
        // Optional: Clear the form data after successful save
        // setLocalBodyData({});
        // setListTypes({});
        
      } else if (result.status === 'Validation Failed') {
        setValidationErrors(result.errors || []);
        console.log("ress  ",result)
        setShowErrorModal(true);
        console.error("Validation errors:", result.errors);
        toast.error(`Validation failed: ${result.errors?.length || 0} errors found`);
      } else {
        setShowErrorModal(true);
        toast.error(result.message || "Failed to save keyplots. Please try again.");
        console.error("Save error:", result);
      }
      
    } catch (error) {
      console.error("Save error:", error);
      setShowErrorModal(true);
      toast.error(`Error saving keyplots: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getTableHeaders = (lbId, villageName) => {
    const baseHeaders = ["Sl. No", "Village Block"];
    const houseListHeaders = ["Name", "Address","Ward No.", "House No."];
    const cultivatorListHeaders = ["Name", "Address"];
    const thandaperHeaders = ["Name", "Address", "Thandaper No.","Thandaper Sub No."];
    const othersHeaders = [ "Old Survey No.", "Old Sub No."];
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
    if (currentListType === "Old Survey Number") {
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

  // Render Logic
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Zone Data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

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
          Non-BTR Key Plot Entry
        </Typography>

        {/* Loading state for btypes */}
        {btypesLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
            <Typography ml={2}>Loading btypes...</Typography>
          </Box>
        )}

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
              {/* Village tabs with dropdown */}
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
                      '& .MuiTab-root.Mui-selected': {
                        color: '#1976d2',
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#1976d2',
                      }
                    }}
                  >
                    {villages.map((village, villageIdx) => {
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

              {/* Table content */}
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
                              currentListType === "Old Survey Numbera") && (
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
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.wardNo}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        currentVillageName,
                                        row.id,
                                        "wardNo",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Ward No."
                                  />
                                </TableCell>
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
                                    placeholder="House No."
                                  />
                                </TableCell>
                              </>
                            )}


                            {currentListType === "Thandaper Number" && (
                              <>
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
                              <TableCell align="center">
                                <TextField
                                  value={row.thandapersubNo}
                                  onChange={(e) =>
                                    handleChange(
                                      lb.id,
                                      currentVillageName,
                                      row.id,
                                      "thandapersubNo",
                                      e.target.value
                                    )
                                  }
                                />
                              </TableCell>
                              </>
                            )}

                            {currentListType === "Old Survey Number" && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.oldsvno}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        currentVillageName,
                                        row.id,
                                        "oldsvno",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <TextField
                                    value={row.oldsubno}
                                    onChange={(e) =>
                                      handleChange(
                                        lb.id,
                                        currentVillageName,
                                        row.id,
                                        "oldsubno",
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

        {/* Confirmation Modal */}
        <Dialog
          open={showConfirmModal}
          onClose={handleCancelSave}
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="confirm-dialog-title">
            Confirm Save Operation
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="confirm-dialog-description">
              Are you sure you want to save {totalKeyplots} keyplot{totalKeyplots !== 1 ? 's' : ''}? 
              This action will save all the entered data to the database.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelSave} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleConfirmSave} color="primary" variant="contained" autoFocus>
              Confirm & Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Modal */}
        <Dialog
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          aria-labelledby="success-dialog-title"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              textAlign: 'center',
              py: 2
            }
          }}
        >
          <DialogTitle id="success-dialog-title" sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircle 
                sx={{ 
                  fontSize: 64, 
                  color: '#4caf50',
                  animation: 'pulse 1.5s infinite'
                }} 
              />
              <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                Success!
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              Successfully saved {savedCount} keyplot{savedCount !== 1 ? 's' : ''}!
              <br />
              All data has been saved to the database.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setShowSuccessModal(false)} 
              variant="contained" 
              color="success"
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Modal */}
        <Dialog
          open={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          aria-labelledby="error-dialog-title"
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              textAlign: 'center',
              py: 2
            }
          }}
        >
          <DialogTitle id="error-dialog-title" sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Cancel 
                sx={{ 
                  fontSize: 64, 
                  color: '#f44336',
                  animation: 'shake 0.5s ease-in-out'
                }} 
              />
              <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                Error!
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              {validationErrors.length > 0 
                ? `Validation failed with ${validationErrors.length} errors. Please check the form and try again.`
                : "Error saving keyplots! Please check the form for errors and try again."
              }
            </DialogContentText>
            {validationErrors.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Validation Errors:
                </Typography>
                {validationErrors.slice(0, 5).map((error, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5, color: '#f44336' }}>
                     {error.message}
                  </Typography>
                ))}
                {validationErrors.length > 5 && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#666' }}>
                    ... and {validationErrors.length - 5} more errors
                  </Typography>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={() => setShowErrorModal(false)} 
              variant="contained" 
              color="error"
              sx={{ minWidth: 100 }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveButtonClick}
            disabled={totalKeyplots === 0 || isSaving || btypesLoading}
            startIcon={isSaving ? <CircularProgress size={20} /> : null}
          >
            {isSaving ? "Saving..." : `Save All Keyplots (${totalKeyplots})`}
          </Button>
        </Box>

        {/* Add CSS animations for the modal icons */}
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
        `}</style>
      </Box>
    </Grid>
  );
};

export default KeyPlotEntryNonBtr;
