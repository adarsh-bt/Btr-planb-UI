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
  Select,
  FormControl,
  InputLabel,
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
  CheckCircle,
  Cancel,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import mainapi from "api/mainapi";
import authservice from "pages/authentication/services/authservice";

const landTypeOptions = ["Wet", "Dry"];

const KeyPlotEntryNonBtr = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingTabChange, setPendingTabChange] = useState(null);
  const [showTabChangeWarning, setShowTabChangeWarning] = useState(false);
  const [activeVillage, setActiveVillage] = useState({});
  const [localBodies, setLocalBodies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localBodyData, setLocalBodyData] = useState({});
  const [villageOptions, setVillageOptions] = useState([]);
  const [districtInfo, setDistrictInfo] = useState(null);
  const [talukInfo, setTalukInfo] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // BTypes API integration states
  const [activeBTypes, setActiveBTypes] = useState([]);
  const [listTypeOptions, setListTypeOptions] = useState([]);
  const [nonBtrTypeMapping, setNonBtrTypeMapping] = useState({});
  const [btypesLoading, setBtypesLoading] = useState(false);
  const [keyplotLimit, setKeyplotLimit] = useState(null);
  const [remainingKeyplots, setRemainingKeyplots] = useState(0);
  
  // Global entry type state
  const [globalEntryType, setGlobalEntryType] = useState("");

  // Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  const BASE_URL = mainapi.BASE_URL;
  const zoneId = typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;

  const userId = authservice.userid();

  // Check if any data has been entered in any local body
  const hasAnyData = useMemo(() => {
    return Object.values(localBodyData).some(lbData => 
      Object.values(lbData || {}).some(villageRows => villageRows && villageRows.length > 0)
    );
  }, [localBodyData]);

  // Check if current local body has any data
  const hasDataInCurrentTab = useMemo(() => {
    if (localBodies.length === 0 || activeTab === null) return false;
    
    const currentLb = localBodies[activeTab];
    if (!currentLb) return false;
    
    const lbData = localBodyData[currentLb.id];
    if (!lbData) return false;
    
    // Check if there's any data in any village for this local body
    return Object.values(lbData).some(villageRows => villageRows && villageRows.length > 0);
  }, [localBodies, activeTab, localBodyData]);

  // Handle tab change with warning
  const handleTabChange = (event, newValue) => {
    // If there's data in current tab and we're trying to switch to a different tab
    if (hasDataInCurrentTab && newValue !== activeTab) {
      setPendingTabChange(newValue);
      setShowTabChangeWarning(true);
    } else {
      // No data or same tab, allow change
      setActiveTab(newValue);
    }
  };

  // Handle confirmation of tab change
  const handleConfirmTabChange = () => {
    setShowTabChangeWarning(false);
    if (pendingTabChange !== null) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
  };

  // Handle cancellation of tab change
  const handleCancelTabChange = () => {
    setShowTabChangeWarning(false);
    setPendingTabChange(null);
  };

  // Handle entry type change with warning if data exists
  const handleEntryTypeChange = (event) => {
    const newType = event.target.value;
    
    if (hasAnyData) {
      // Show warning that entry type cannot be changed after data entry
      toast.warning("Entry Type cannot be changed after data has been entered. Please clear all data first or save and start fresh.", {
        autoClose: 5000,
      });
    } else {
      setGlobalEntryType(newType);
    }
  };

  // Fetch active btypes from API
  useEffect(() => {
    const fetchActiveBTypes = async () => {
      setBtypesLoading(true);
      try {
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
          
          // Set default entry type
          if (nonBtrOptions.length > 0) {
            setGlobalEntryType(nonBtrOptions[0]);
          }
          
          // Create dynamic mapping
          const mapping = {};
          btypeData.forEach(btype => {
            mapping[btype.btypeName] = btype.btypeId;
          });
          setNonBtrTypeMapping(mapping);
          
        } else {
          throw new Error(`Failed to fetch btypes: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching active btypes:', error);
        toast.error('Failed to load btypes');
        setListTypeOptions([]);
        setNonBtrTypeMapping({});
      } finally {
        setBtypesLoading(false);
      }
    };
    
    fetchActiveBTypes();
  }, [BASE_URL]);

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
    return villageOptions.filter(v => v.revenueVillageName);
  };

  // Get current village for local body
  const getCurrentVillage = (lbId) => {
    const villages = getVillagesForLocalBody(lbId);
    const currentIndex = activeVillage[lbId] || 0;
    return villages[currentIndex]?.revenueVillageName || "";
  };

  // Get current list type (now global)
  const getCurrentListType = () => {
    return globalEntryType || listTypeOptions[0] || "House List";
  };

  // Data Fetching
  useEffect(() => {
    if (!zoneId) {
      setLocalBodies([]);
      setLocalBodyData({});
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

        // Initialize active village for each local body
        const initialVillage = {};
        (lbData || []).forEach((lb) => {
          initialVillage[lb.id] = 0;
        });
        setActiveVillage(initialVillage);

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

  // Returns an array of { field, label } that must be filled for this row based on current list type
  const getRequiredFieldsForRow = (currentListType) => {
    switch (currentListType) {
      case "House List":
        return [
          { field: "village", label: "Village" },
          { field: "villageBlock", label: "Village Block" },
          { field: "wardNo", label: "Ward No." },
          { field: "houseNo", label: "House No." },
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      case "Cultivators List":
        return [
          { field: "village", label: "Village" },
          { field: "villageBlock", label: "Village Block" },
          { field: "name", label: "Name" },
          { field: "address", label: "Address" },
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      case "Thandaper Number":
        return [
          { field: "village", label: "Village" },
          { field: "villageBlock", label: "Village Block" },
          { field: "thandaperNo", label: "Thandaper No." },
          { field: "thandapersubNo", label: "Thandaper Sub No." },
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      case "Old Survey Number":
        return [
          { field: "village", label: "Village" },
          { field: "villageBlock", label: "Village Block" },
          { field: "oldsvno", label: "Old Survey No." },
          { field: "oldsubno", label: "Old Sub No." },
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      default:
        return [];
    }
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
    if (totalKeyplots >= remainingKeyplots) {
      toast.warn(`Only ${remainingKeyplots} keyplots can be added for this zone`);
      return;
    }
    
    setLocalBodyData((prev) => {
      const current = prev[lbId]?.[villageName] || [];
      const newId = current.length > 0 ? Math.max(...current.map((r) => r.id)) + 1 : 1;
      const newSlNo = current.length > 0 ? Math.max(...current.map((r) => r.slNo)) + 1 : 1;
      
      const villageBlocks = villageToBlocks[villageName] || [];
      const defaultBlock = villageBlocks.length > 0 ? villageBlocks[0] : "";
      const allVillages = getVillagesForLocalBody(lbId).map(v => v.revenueVillageName);
      
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
              allVillages: allVillages,
              villageBlock: defaultBlock,
              villageBlockOptions: villageBlocks,
              dcode: null,
              tcode: null,
              vcode: null,
              name: "",
              address: "",
              houseNo: "",
              thandaperNo: "",
              thandapersubNo: "",
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

  useEffect(() => {
    const savedZone = localStorage.getItem('activeZone');
    if (!savedZone) return;
    
    fetchKeyplotLimit();
  }, [BASE_URL]);

  const fetchKeyplotLimit = async () => {
    const savedZone = localStorage.getItem('activeZone');
    if (!savedZone) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${BASE_URL}/btr-service/api/keyplots/limit-status/${savedZone}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch keyplot limit');

      const data = await res.json();
      setKeyplotLimit(data);
      setRemainingKeyplots(data.remainingKeyplots);
    } catch (err) {
      console.error(err);
      toast.error('Unable to refresh keyplot limit');
    }
  };

  const handleActualSave = async () => {
    if (totalKeyplots > remainingKeyplots) {
      toast.error(`You can only save ${remainingKeyplots} keyplots for this zone`);
      setIsSaving(false);
      return;
    }
    
    if (!districtInfo || talukInfo.length === 0) {
      toast.error("District or Taluk data is not yet loaded. Please wait.");
      return;
    }

    const currentListType = getCurrentListType();
    const newValidationErrors = [];

    Object.entries(localBodyData).forEach(([lbId, villageData]) => {
      Object.entries(villageData || {}).forEach(([villageName, rows]) => {
        const requiredFields = getRequiredFieldsForRow(currentListType);

        (rows || []).forEach((row) => {
          requiredFields.forEach(({ field, label }) => {
            const val = row[field];
            const isEmpty = val === null || val === undefined || (typeof val === "string" && val.trim() === "");
            if (isEmpty) {
              newValidationErrors.push({
                message: `Row ${row.slNo || row.id}: ${label} is required in ${currentListType} (${villageName}).`,
              });
            }
          });
        });
      });
    });

    if (newValidationErrors.length > 0) {
      setValidationErrors(newValidationErrors);
      setShowErrorModal(true);
      toast.error("Validation failed. Please fill all required fields.");
      return;
    }

    setIsSaving(true);
    
    try {
      const dtoList = [];
      const currentListType = getCurrentListType();
      const btrTypeId = nonBtrTypeMapping[currentListType];
      
      Object.entries(localBodyData).forEach(([lbId, villageData]) => {
        Object.entries(villageData || {}).forEach(([villageName, rows]) => {
          rows.forEach(row => {
            const villageData = villageInfoMap.get(row.village || villageName);
            const localBodyData = localBodyInfoMap.get(parseInt(lbId));
            
            if (!villageData || !localBodyData) {
              console.warn(`Missing data for village: ${row.village || villageName} or local body: ${lbId}`);
              return;
            }

            const dto = {
              dcode: districtInfo.distId,
              tcode: talukInfo[0].revenueTalukId,
              vcode: villageData.vcode,
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
              ...(btrTypeId === 2 && {
                ownername: row.name || "",
                address: row.address || "",
                wardno: row.wardNo ? parseInt(row.wardNo) : null,
                houseno: row.houseNo || ""
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
        setLocalBodyData({});
        await fetchKeyplotLimit();
      } else if (result.status === 'Validation Failed') {
        setValidationErrors(result.errors || []);
        setShowErrorModal(true);
        toast.error(`Validation failed: ${result.errors?.length || 0} errors found`);
      } else {
        setShowErrorModal(true);
        toast.error(result.message || "Failed to save keyplots. Please try again.");
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
    const currentListType = getCurrentListType();
    const baseHeaders = ["Sl. No", "Village"];
    const villageBlockHeaders = ["Village Block"];
    const houseListHeaders = ["Name", "Address", "Ward No.", "House No."];
    const cultivatorListHeaders = ["Name", "Address"];
    const thandaperHeaders = ["Name", "Address", "Thandaper No.", "Thandaper Sub No."];
    const othersHeaders = ["Old Survey No.", "Old Sub No."];
    const finalHeaders = [
      "Survey No.",
      "Sub Div No.",
      "Area (Cents)",
      "Land Type",
      "Actions",
    ];

    if (currentListType === "House List") {
      return [...baseHeaders, ...villageBlockHeaders, ...houseListHeaders, ...finalHeaders];
    }
    if (currentListType === "Cultivators List") {
      return [...baseHeaders, ...villageBlockHeaders, ...cultivatorListHeaders, ...finalHeaders];
    }
    if (currentListType === "Thandaper Number") {
      return [...baseHeaders, ...villageBlockHeaders, ...thandaperHeaders, ...finalHeaders];
    }
    if (currentListType === "Old Survey Number") {
      return [...baseHeaders, ...villageBlockHeaders, ...othersHeaders, ...finalHeaders];
    }
    return [...baseHeaders, ...villageBlockHeaders, ...finalHeaders];
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

        {/* Global Entry Type Dropdown with Keyplot Limit Info */}
{listTypeOptions.length > 0 && (
  <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Entry Type:
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={globalEntryType}
            onChange={handleEntryTypeChange}
            displayEmpty
            disabled={hasAnyData}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {hasAnyData && <Lock fontSize="small" sx={{ color: 'action.disabled' }} />}
                {selected}
              </Box>
            )}
          >
            {listTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Keyplot Limit Info - Aligned to the right */}
      {keyplotLimit && (
        <Box sx={{ 
          display: 'flex', 
          gap: 3,
          bgcolor: 'primary.light',
          borderRadius: 1,
          px: 2,
          py: 1,
          color: 'primary.contrastText'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Zone Limit:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{keyplotLimit.allowedKeyplotsLimit}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Formed Count:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{keyplotLimit.usedKeyplotsCount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Remaining:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: keyplotLimit.remainingKeyplots < 10 ? 'error.main' : 'inherit' }}>
              {keyplotLimit.remainingKeyplots}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  </Paper>
)}


        {/* Top-level tabs for Local Bodies */}
        {localBodies.length > 0 && !loading && !error && (
          <Paper elevation={3} sx={{ mb: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
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

        {/* Tab Change Warning Modal */}
        <Dialog
          open={showTabChangeWarning}
          onClose={handleCancelTabChange}
          aria-labelledby="tab-change-warning-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="tab-change-warning-title" sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                Complete Entry Required!
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              You have unsaved data in the current local body.
              <br />
              Please complete the entry or save the data before switching to another local body.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={handleCancelTabChange} 
              variant="contained" 
              color="primary"
              sx={{ minWidth: 120 }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

        {/* Village selector and Table content */}
        {localBodies.map((lb, idx) => {
          const villages = getVillagesForLocalBody(lb.id);
          const currentVillageIndex = activeVillage[lb.id] || 0;
          const currentVillage = villages[currentVillageIndex];
          const currentVillageName = currentVillage?.revenueVillageName || "";
          const sortedRows = sortedByLocalBodyAndVillage[lb.id]?.[currentVillageName] || [];
          const currentListType = getCurrentListType();

          const headerToFieldKey = {
            "Sl. No": "slNo",
            "Village": "village",
            "Village Block": "villageBlock",
            "Name": "name",
            "Address": "address",
            "Ward No.": "wardNo",
            "House No.": "houseNo",
            "Thandaper No.": "thandaperNo",
            "Thandaper Sub No.": "thandapersubNo",
            "Old Survey No.": "oldsvno",
            "Old Sub No.": "oldsubno",
            "Survey No.": "surveyNo",
            "Sub Div No.": "subDivNo",
            "Area (Cents)": "area",
            "Land Type": "landType",
            "Actions": "__actions__",
          };

          const requiredFields = getRequiredFieldsForRow(currentListType);
          const requiredSet = new Set(requiredFields.map(f => f.field));
          const allRequiredFilled = sortedRows.every(row =>
            requiredFields.every(({ field }) => {
              const val = row[field];
              if (val === null || val === undefined) return false;
              if (typeof val === "string") return val.trim() !== "";
              return String(val).trim() !== "";
            })
          );

          const headers = getTableHeaders(lb.id, currentVillageName);
          const colSpan = headers.length;

          return (
            <div
              key={lb.id}
              style={{ display: activeTab === idx ? "block" : "none" }}
            >
              {/* Table content */}
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  mt: 2
                }}
              >
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {headers.map((col) => {
                          const key = headerToFieldKey[col] || null;
                          const isRequired = key && requiredSet.has(key);
                          return (
                            <TableCell
                              key={col}
                              align="center"
                              sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}
                            >
                              <span>
                                {col}
                                {isRequired && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {sortedRows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow key={row.id}>
                            <TableCell align="center">{row.slNo}</TableCell>
                            
                            {/* Village dropdown */}
                            <TableCell align="center">
                              <TextField
                                select
                                value={row.village}
                                onChange={(e) =>
                                  handleVillageChange(
                                    lb.id,
                                    currentVillageName,
                                    row.id,
                                    e.target.value
                                  )
                                }
                                sx={{ minWidth: 140 }}
                                required={requiredFields.some(f => f.field === "village")}
                                error={requiredFields.some(f => f.field === "village") && !row.village}
                                helperText={requiredFields.some(f => f.field === "village") && !row.village ? "Required" : ""}
                              >
                                {getVillagesForLocalBody(lb.id).map(v => v.revenueVillageName).map((villageName) => (
                                  <MenuItem key={villageName} value={villageName}>
                                    {villageName}
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
                                    currentVillageName,
                                    row.id,
                                    "villageBlock",
                                    e.target.value
                                  )
                                }
                                sx={{ minWidth: 140 }}
                                required={requiredFields.some(f => f.field === "villageBlock")}
                                error={requiredFields.some(f => f.field === "villageBlock") && !row.villageBlock}
                                helperText={requiredFields.some(f => f.field === "villageBlock") && !row.villageBlock ? "Required" : ""}
                              >
                                {(villageToBlocks[row.village] || []).map((code) => (
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
                              currentListType === "Old Survey Number") && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.name ?? ""}
                                    onChange={(e) => {
                                      const raw = e.target.value ?? "";
                                      const v = raw.slice(0, 60);
                                      if (v === "" || /^[A-Za-z ]*$/.test(v)) {
                                        handleChange(lb.id, currentVillageName, row.id, "name", v);
                                      }
                                    }}
                                    placeholder="Name"
                                    inputProps={{
                                      maxLength: 60,
                                      pattern: "^[A-Za-z ]*$",
                                      title: "Only alphabets and spaces, up to 60 characters",
                                    }}
                                    required={requiredFields.some((f) => f.field === "name")}
                                    error={
                                      requiredFields.some((f) => f.field === "name") &&
                                      (!(row.name ?? "").trim() || (!!row.name && !/^[A-Za-z ]{1,60}$/.test(row.name)))
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "name")
                                        ? (!(row.name ?? "").trim()
                                            ? "Required"
                                            : (!!row.name && !/^[A-Za-z ]{1,60}$/.test(row.name)
                                                ? "Only alphabets and spaces, max 60"
                                                : ""))
                                        : ""
                                    }
                                  />
                                </TableCell>

                                <TableCell align="center">
                                  <TextField
                                    value={row.address || ""}
                                    onChange={(e) => {
                                      const v = e.target.value.slice(0, 250);
                                      handleChange(lb.id, currentVillageName, row.id, "address", v);
                                    }}
                                    placeholder="Address"
                                    inputProps={{
                                      maxLength: 250,
                                      title: "Up to 250 characters",
                                    }}
                                    required={requiredFields.some((f) => f.field === "address")}
                                    error={
                                      requiredFields.some((f) => f.field === "address") &&
                                      !row.address?.trim()
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "address") &&
                                      (!row.address?.trim() ? "Required" : `${(row.address || "").length}/250`)
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            {currentListType === "House List" && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.wardNo ?? ""}
                                    onChange={(e) => {
                                      const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
                                      handleChange(lb.id, currentVillageName, row.id, "wardNo", digits);
                                    }}
                                    placeholder="Ward No."
                                    inputMode="numeric"
                                    inputProps={{
                                      pattern: "^\\d{0,5}$",
                                      maxLength: 5,
                                      title: "Up to 5 digits",
                                    }}
                                    required={requiredFields.some((f) => f.field === "wardNo")}
                                    error={
                                      requiredFields.some((f) => f.field === "wardNo") &&
                                      !(String(row.wardNo || "").trim())
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "wardNo") &&
                                      !(String(row.wardNo || "").trim()) ? "Required" : ""
                                    }
                                  />
                                </TableCell>

                                <TableCell align="center">
                                  <TextField
                                    value={row.houseNo ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value.slice(0, 10);
                                      handleChange(lb.id, currentVillageName, row.id, "houseNo", value);
                                    }}
                                    placeholder="House No."
                                    inputProps={{
                                      maxLength: 10,
                                      title: "Up to 10 characters",
                                    }}
                                    required={requiredFields.some((f) => f.field === "houseNo")}
                                    error={
                                      requiredFields.some((f) => f.field === "houseNo") &&
                                      !String(row.houseNo || "").trim()
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "houseNo") &&
                                      !String(row.houseNo || "").trim()
                                        ? "Required"
                                        : ""
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            {currentListType === "Thandaper Number" && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.thandaperNo ?? ""}
                                    onChange={(e) => {
                                      const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
                                      handleChange(lb.id, currentVillageName, row.id, "thandaperNo", digits);
                                    }}
                                    placeholder="Thandaper No."
                                    inputMode="numeric"
                                    inputProps={{
                                      pattern: "^\\d{0,5}$",
                                      maxLength: 5,
                                      title: "Up to 5 digits",
                                    }}
                                    required={requiredFields.some((f) => f.field === "thandaperNo")}
                                    error={
                                      requiredFields.some((f) => f.field === "thandaperNo") &&
                                      !(String(row.thandaperNo || "").trim())
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "thandaperNo") &&
                                      !(String(row.thandaperNo || "").trim()) ? "Required" : ""
                                    }
                                  />
                                </TableCell>

                                <TableCell align="center">
                                  <TextField
                                    value={row.thandapersubNo ?? ""}
                                    onChange={(e) => {
                                      const v = (e.target.value || "").slice(0, 5);
                                      handleChange(lb.id, currentVillageName, row.id, "thandapersubNo", v);
                                    }}
                                    placeholder="Thandaper Sub No."
                                    inputProps={{
                                      maxLength: 5,
                                      title: "Up to 5 characters",
                                    }}
                                    required={requiredFields.some((f) => f.field === "thandapersubNo")}
                                    error={
                                      requiredFields.some((f) => f.field === "thandapersubNo") &&
                                      !(String(row.thandapersubNo || "").trim())
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "thandapersubNo") &&
                                      !(String(row.thandapersubNo || "").trim()) ? "Required" : ""
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            {currentListType === "Old Survey Number" && (
                              <>
                                <TableCell align="center">
                                  <TextField
                                    value={row.oldsvno ?? ""}
                                    onChange={(e) => {
                                      const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
                                      handleChange(lb.id, currentVillageName, row.id, "oldsvno", digits);
                                    }}
                                    placeholder="Old Survey No."
                                    inputMode="numeric"
                                    inputProps={{
                                      pattern: "^\\d{0,5}$",
                                      maxLength: 5,
                                      title: "Up to 5 digits",
                                    }}
                                    required={requiredFields.some((f) => f.field === "oldsvno")}
                                    error={
                                      requiredFields.some((f) => f.field === "oldsvno") &&
                                      !(String(row.oldsvno || "").trim())
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "oldsvno") &&
                                      !(String(row.oldsvno || "").trim()) ? "Required" : ""
                                    }
                                  />
                                </TableCell>

                                <TableCell align="center">
                                  <TextField
                                    value={row.oldsubno ?? ""}
                                    onChange={(e) => {
                                      const v = (e.target.value || "").slice(0, 5);
                                      handleChange(lb.id, currentVillageName, row.id, "oldsubno", v);
                                    }}
                                    placeholder="Old Sub No."
                                    inputProps={{
                                      maxLength: 5,
                                      title: "Up to 5 characters",
                                    }}
                                    required={requiredFields.some((f) => f.field === "oldsubno")}
                                    error={
                                      requiredFields.some((f) => f.field === "oldsubno") &&
                                      !(String(row.oldsubno || "").trim())
                                    }
                                    helperText={
                                      requiredFields.some((f) => f.field === "oldsubno") &&
                                      !(String(row.oldsubno || "").trim()) ? "Required" : ""
                                    }
                                  />
                                </TableCell>
                              </>
                            )}

                            <TableCell align="center">
                              <TextField
                                value={row.surveyNo ?? ""}
                                onChange={(e) => {
                                  const digits = (e.target.value || "").replace(/\D/g, "").slice(0, 5);
                                  handleChange(lb.id, currentVillageName, row.id, "surveyNo", digits);
                                }}
                                placeholder="Survey No."
                                inputMode="numeric"
                                inputProps={{
                                  pattern: "^\\d{0,5}$",
                                  maxLength: 5,
                                  title: "Up to 5 digits",
                                }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                value={row.subDivNo ?? ""}
                                onChange={(e) => {
                                  const v = (e.target.value || "").slice(0, 5);
                                  handleChange(lb.id, currentVillageName, row.id, "subDivNo", v);
                                }}
                                placeholder="Sub Div No."
                                inputProps={{
                                  maxLength: 5,
                                  title: "Up to 5 characters",
                                }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                value={row.area ?? ""}
                                onChange={(e) => {
                                  let v = (e.target.value || "").replace(/[^0-9.]/g, "");
                                  const firstDot = v.indexOf(".");
                                  if (firstDot !== -1) {
                                    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
                                  }
                                  const m = v.match(/^(\d{0,5})(?:\.(\d{0,2})?)?$/);
                                  if (m) {
                                    handleChange(lb.id, currentVillageName, row.id, "area", v);
                                  } else {
                                    const parts = v.split(".");
                                    let intPart = (parts[0] || "").slice(0, 5);
                                    let decPart = parts[1] !== undefined ? parts[1].slice(0, 2) : undefined;
                                    const coerced = decPart !== undefined ? `${intPart}.${decPart}` : intPart;
                                    handleChange(lb.id, currentVillageName, row.id, "area", coerced);
                                  }
                                }}
                                placeholder="Area (Cents)"
                                inputMode="decimal"
                                inputProps={{
                                  pattern: "^\\d{0,5}(\\.\\d{0,2})?$",
                                  title: "Up to 5 digits, optional decimal with 2 digits",
                                }}
                                required={requiredFields.some((f) => f.field === "area")}
                                error={
                                  requiredFields.some((f) => f.field === "area") &&
                                  !(String(row.area || "").trim())
                                }
                                helperText={
                                  requiredFields.some((f) => f.field === "area") &&
                                  !(String(row.area || "").trim()) ? "Required" : ""
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <TextField
                                select
                                value={row.landType}
                                onChange={(e) =>
                                  handleChange(lb.id, currentVillageName, row.id, "landType", e.target.value)
                                }
                                sx={{ minWidth: 90 }}
                                required={requiredFields.some(f => f.field === "landType")}
                                error={requiredFields.some(f => f.field === "landType") && !row.landType}
                                helperText={requiredFields.some(f => f.field === "landType") && !row.landType ? "Required" : ""}
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
                            disabled={totalKeyplots >= remainingKeyplots || !allRequiredFilled}
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

        {/* Confirmation Modal */}
        <Dialog
          open={showConfirmModal}
          onClose={handleCancelSave}
          aria-labelledby="confirm-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="confirm-dialog-title">
            Confirm Save Operation
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
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
            {validationErrors.length > 0 && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
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

        <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
      </Box>
    </Grid>
  );
};

export default KeyPlotEntryNonBtr;