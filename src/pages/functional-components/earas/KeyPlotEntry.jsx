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
  TextField,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { 
  AddCircle, 
  Delete, 
  Error as ErrorIcon, 
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import { toast } from "react-toastify";
import mainapi from "api/mainapi";
import authservice from "pages/authentication/services/authservice";
import Breadcrumb from "routes/Breadcrumb";

const landTypeOptions = ["Wet", "Dry"];
const TOTAL_REQUIRED = 100;


/** * A robust fetch wrapper that handles non-OK responses and non-JSON content. */
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const BASE_URL = mainapi.BASE_URL;
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Success and Error Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  
  // Form data and validation states
  const [localBodyData, setLocalBodyData] = useState({});
  const [duplicateErrors, setDuplicateErrors] = useState({}); // For backend duplicate errors
  const [fieldErrors, setFieldErrors] = useState({}); // For client-side field validation errors
  const [clientDuplicateErrors, setClientDuplicateErrors] = useState({}); // For client-side duplicate validation

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

  // Read IDs from localStorage
  const zoneId = typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;
  const userInfo = getUserInfo();
  const userId = authservice.userid();

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
    const BASE_URL = mainapi.BASE_URL;
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

      setLocalBodyData(prev => {
        const next = { ...prev };
        (lbData || []).forEach(lb => {
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



  // --- Memoized Lookups ---
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

  // --- Client-side Duplicate Detection Logic ---
  const checkForClientDuplicates = (allRows) => {
    const duplicateErrors = {};
    const combinationMap = new Map();
    allRows.forEach((row) => {
      // Only check rows that have all required fields filled
      if (row.village && row.villageBlock && row.surveyNo && row.subDivNo) {
        const key = `${row.village}_${row.villageBlock}_${row.surveyNo}_${row.subDivNo}`;
        const rowIdentifier = `${row.lbId}_${row.id}`;
        if (combinationMap.has(key)) {
          // Found duplicate - mark both rows
          const existingRowIdentifier = combinationMap.get(key);
          duplicateErrors[existingRowIdentifier] = `Duplicate combination: Village "${row.village}", Block "${row.villageBlock}", Survey No. "${row.surveyNo}", Sub Div No. "${row.subDivNo}" already exists`;
          duplicateErrors[rowIdentifier] = `Duplicate combination: Village "${row.village}", Block "${row.villageBlock}", Survey No. "${row.surveyNo}", Sub Div No. "${row.subDivNo}" already exists`;
        } else {
          combinationMap.set(key, rowIdentifier);
        }
      }
    });
    return duplicateErrors;
  };

  // Real-time duplicate checking effect
  useEffect(() => {
    const allRows = Object.entries(localBodyData).flatMap(([lbId, rows]) =>
      rows.map(row => ({ ...row, lbId: parseInt(lbId, 10) }))
    );
    const clientDuplicates = checkForClientDuplicates(allRows);
    setClientDuplicateErrors(clientDuplicates);
  }, [localBodyData]);

  // --- Validation Functions ---
  const validateField = (field, value, rowData = {}) => {
    switch (field) {
      case 'village':
        return !value ? 'Village is required' : null;
      case 'villageBlock':
        return !value ? 'Village Block is required' : null;
      case 'surveyNo':
        return !value ? 'Survey Number is required' :
                !/^\d+$/.test(value) ? 'Survey Number must be numeric' : null;
      // case 'subDivNo':
      //   return !value ? 'Sub Division Number is required' : null;
      case 'area':
        return !value ? 'Area is required' :
                !/^\d*\.?\d+$/.test(value) ? 'Area must be a valid number' : null;
      case 'landType':
        return !value ? 'Land Type is required' : null;
      default:
        return null;
    }
  };

  const validateRow = (rowData) => {
    const errors = {};
    const fields = ['village', 'villageBlock', 'surveyNo', 'subDivNo', 'area', 'landType'];
        
    fields.forEach(field => {
      const error = validateField(field, rowData[field], rowData);
      if (error) {
        errors[field] = error;
      }
    });
        
    return errors;
  };

  const clearValidationErrors = () => {
    setDuplicateErrors({});
    setFieldErrors({});
    setClientDuplicateErrors({});
  };

  // --- Save Handlers ---
  const handleSaveButtonClick = () => {
    // Show confirmation modal instead of directly saving
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmModal(false);
    handleActualSave();
  };

  const handleCancelSave = () => {
    setShowConfirmModal(false);
  };

  const handleActualSave = async () => {
    if (!districtInfo || talukInfo.length === 0) {
      toast.error("District or Taluk data is not yet loaded. Please wait.");
      return;
    }
    // Clear previous errors
    clearValidationErrors();
    setIsSaving(true);
        
    const allKeyplots = Object.entries(localBodyData).flatMap(([lbId, rows]) =>
      rows.map(row => ({ ...row, lbId: parseInt(lbId, 10) }))
    );
    // Check for client-side duplicates first
    const clientDuplicates = checkForClientDuplicates(allKeyplots);
    if (Object.keys(clientDuplicates).length > 0) {
      setClientDuplicateErrors(clientDuplicates);
      toast.error(`Found ${Object.keys(clientDuplicates).length} duplicate combination(s). Please fix before saving.`);
      setIsSaving(false);
      return;
    }

    // Client-side field validation
    let hasValidationErrors = false;
    const newFieldErrors = {};
    allKeyplots.forEach((row) => {
      const rowErrors = validateRow(row);
      Object.keys(rowErrors).forEach(field => {
        const errorKey = `${row.lbId}_${row.id}_${field}`;
        newFieldErrors[errorKey] = rowErrors[field];
        hasValidationErrors = true;
      });
    });
    if (hasValidationErrors) {
      setFieldErrors(newFieldErrors);
      toast.error("Please fix all validation errors before saving.");
      setIsSaving(false);
      return;
    }

    const zoneId = authservice.getzone();
    const payload = allKeyplots.map((row) => {
      const villageData = villageInfoMap.get(row.village);
      const localBodyData = localBodyInfoMap.get(row.lbId);
      if (!villageData || !localBodyData || !row.surveyNo) {
        return null;
      }
    
      return {
        dcode: districtInfo.distId,
        tcode: talukInfo[0].revenueTalukId,
        vcode: villageData.vcode,
        lsgcode: villageData.lsgcode,
        lbcode: localBodyData.lbcode,
        zoneId: parseInt(zoneId, 10),
        user_id: userId,
        bcode: row.villageBlock || null,
        ltype: row.landType.toUpperCase(),
        resvno: parseInt(row.surveyNo, 10),
        resbdno: row.subDivNo,
        totCent: row.area,
        btrtype:1
      };
    }).filter(Boolean);

    if (payload.length !== totalKeyplots) {
      toast.error("Some rows have missing or invalid data. Please check all fields.");
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

  const response = await fetch(
    `${BASE_URL}/btr-service/api/btr-data/saveAll`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    }
  );

      const result = await response.json();
      if (!response.ok) {
        // Handle different types of error responses from backend
        if (result.status === "Validation Failed" && result.errors) {
          // Backend validation errors - Map duplicate errors to specific rows
          const backendDuplicateErrors = {};
          result.errors.forEach((error) => {
            // Find matching row and create error key
            const matchingRow = allKeyplots.find(row => 
              row.surveyNo === error.resvno?.toString() &&
              row.subDivNo === error.resbdno
            );
            if (matchingRow) {
              const duplicateKey = `${matchingRow.lbId}_${matchingRow.id}`;
              backendDuplicateErrors[duplicateKey] = error.message;
            }
          });
                    
          setDuplicateErrors(backendDuplicateErrors);
          toast.error(`Validation failed: ${result.errors.length} duplicate error(s) found`);
          // Show error modal for duplicate errors
          setShowErrorModal(true);
        } else {
          // Other API errors
          const errorMessage = result.message || `API Error: ${response.status}`;
          toast.error(errorMessage);
          // Show error modal for other API errors
          setShowErrorModal(true);
        }
        setIsSaving(false);
        return;
      }
      // Success response
      console.log("API save response:", result);
      if (result.status === "Success") {
        const savedKeyplotCount = result.ids?.length || totalKeyplots;
        setSavedCount(savedKeyplotCount);
        setShowSuccessModal(true);
        toast.success(`Successfully saved! All ${savedKeyplotCount} keyplots have been saved successfully.`);
        console.log("Save successful:", result);
        // Optional: Reset form state after successful save
        // setLocalBodyData({});
        clearValidationErrors();
      } else {
        toast.warning("Unexpected response format from server.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Failed to save keyplots:", err);
      toast.error(`Network error: ${err.message}`);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Other Handlers (unchanged) ---
  const handleChange = (lbId, rowId, field, value) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: prev[lbId].map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
    // Clear field-specific error when user starts typing
    const errorKey = `${lbId}_${rowId}_${field}`;
    if (fieldErrors[errorKey]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    // Clear backend duplicate error when user modifies survey no or sub div no
    if (field === 'surveyNo' || field === 'subDivNo') {
      const duplicateKey = `${lbId}_${rowId}`;
      if (duplicateErrors[duplicateKey]) {
        setDuplicateErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[duplicateKey];
          return newErrors;
        });
      }
    }
    // Real-time validation
    const error = validateField(field, value);
    if (error) {
      setFieldErrors(prev => ({
        ...prev,
        [errorKey]: error
      }));
    }
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
    // Clear errors for village and villageBlock
    const villageErrorKey = `${lbId}_${rowId}_village`;
    const blockErrorKey = `${lbId}_${rowId}_villageBlock`;
        
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[villageErrorKey];
      delete newErrors[blockErrorKey];
      return newErrors;
    });
  };

  const handleAddRow = (lbId) => {
    if (totalKeyplots >= TOTAL_REQUIRED) return;
    setLocalBodyData((prev) => {
      const currentRows = prev[lbId] || [];
      const newId = Date.now();
      const newSlNo = currentRows.length > 0 ? Math.max(...currentRows.map((r) => r.slNo)) + 1 : 1;
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
            landType: "Wet",
          },
        ],
      };
    });
  };

  // Add this function after your existing helper functions, around line 280
const areAllFieldsFilled = (lbId) => {
  const rows = localBodyData[lbId] || [];
  if (rows.length === 0) return true; // Allow adding first row
  
  return rows.every((row) => {
    return (
      row.village &&
      row.villageBlock &&
      row.surveyNo &&
      // row.subDivNo &&
      row.area &&
      row.landType
    );
  });
};


  const handleDeleteRow = (lbId, rowId) => {
    setLocalBodyData((prev) => ({
      ...prev,
      [lbId]: (prev[lbId] || []).filter((row) => row.id !== rowId),
    }));
    // Clear validation errors for deleted row
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(`${lbId}_${rowId}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
    // Clear duplicate errors for deleted row
    const duplicateKey = `${lbId}_${rowId}`;
    if (duplicateErrors[duplicateKey]) {
      setDuplicateErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[duplicateKey];
        return newErrors;
      });
    }
  };

  // Helper function to get field error (only for client-side validation)
  const getFieldError = (lbId, rowId, field) => {
    return fieldErrors[`${lbId}_${rowId}_${field}`];
  };

  // Helper function to check if field has error
  const hasFieldError = (lbId, rowId, field) => {
    return Boolean(getFieldError(lbId, rowId, field));
  };

  // Helper function to check if row has backend duplicate error
  const hasDuplicateError = (lbId, rowId) => {
    return Boolean(duplicateErrors[`${lbId}_${rowId}`]);
  };

  // Helper function to get backend duplicate error message
  const getDuplicateError = (lbId, rowId) => {
    return duplicateErrors[`${lbId}_${rowId}`];
  };

  // Helper function to check if row has client-side duplicate error
  const hasClientDuplicateError = (lbId, rowId) => {
    return Boolean(clientDuplicateErrors[`${lbId}_${rowId}`]);
  };

  // Helper function to get client-side duplicate error message
  const getClientDuplicateError = (lbId, rowId) => {
    return clientDuplicateErrors[`${lbId}_${rowId}`];
  };

  // Combined function to check for any duplicate error (backend or client-side)
  const hasAnyDuplicateError = (lbId, rowId) => {
    return hasDuplicateError(lbId, rowId) || hasClientDuplicateError(lbId, rowId);
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
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
    <Breadcrumb> </Breadcrumb> 
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          KeyPlot Entry 
          {/* (Total Required: {TOTAL_REQUIRED}) */}
        </Typography>
        {/* {localBodies.length > 0 && (
  <Paper elevation={3} sx={{ mb: 2 }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      px: 2, 
      pt: 2, 
      pb: 1,
      gap: 2 
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#05307a',
          minWidth: 'max-content',
          flexShrink: 0
        }}
      >
        Local Body:
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(e, newVal) => setActiveTab(newVal)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ flex: 1 }}
      >
        {localBodies.map((lb, index) => {
          const rowCount = (localBodyData[lb.id] || []).length;
          const hasErrors = Object.keys(fieldErrors).some(key => key.startsWith(`${lb.id}_`)) ||
                           Object.keys(duplicateErrors).some(key => key.startsWith(`${lb.id}_`)) ||
                           Object.keys(clientDuplicateErrors).some(key => key.startsWith(`${lb.id}_`));
                          
          return (
            <Tab
              key={lb.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {`${lb.name} (${rowCount})`}
                  {hasErrors && <ErrorIcon color="error" fontSize="small" />}
                </Box>
              }
              id={`tab-${index}`}
            />
          );
        })}
      </Tabs>
    </Box>
  </Paper>
)} */}



        {/* {localBodies.length > 0 && (
          <Paper elevation={3} sx={{ mb: 2 }}>
            
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {localBodies.map((lb, index) => {
                const rowCount = (localBodyData[lb.id] || []).length;
                const hasErrors = Object.keys(fieldErrors).some(key => key.startsWith(`${lb.id}_`)) ||
                                 Object.keys(duplicateErrors).some(key => key.startsWith(`${lb.id}_`)) ||
                                 Object.keys(clientDuplicateErrors).some(key => key.startsWith(`${lb.id}_`));
                                
                return (
                  <Tab
                    key={lb.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {`${lb.name} (${rowCount})`}
                        {hasErrors && <ErrorIcon color="error" fontSize="small" />}
                      </Box>
                    }
                    id={`tab-${index}`}
                  />
                );
              })}
            </Tabs>
          </Paper>
        )} */}
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
                         {["Sl. No", "Local Body", "Village", "Village Block", "Survey No.", "Sub Div No.", "Area (Cents)", "Land Type", "Actions"].map((col) => (

                            <TableCell key={col} align="center" sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow
                             key={row.id}
                            sx={{
                              backgroundColor: hasAnyDuplicateError(lb.id, row.id) ? '#ffebee' : 'inherit'
                            }}
                          >
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                {row.slNo}
                                {hasAnyDuplicateError(lb.id, row.id) && (
                                  <Chip
                                     icon={<ErrorIcon />}
                                     label="Duplicate"
                                     color="error"
                                     size="small"
                                   />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                          <TextField
                            select
                            value={row.localBody || ""}
                            onChange={(e) => handleChange(lb.id, row.id, "localBody", e.target.value)}
                            fullWidth
                            error={hasFieldError(lb.id, row.id, "localBody")}
                            helperText={getFieldError(lb.id, row.id, "localBody")}
                            size="small"
                          >
                            {localBodies.map((opt) => (
                              <MenuItem key={opt.id} value={opt.name}>
                                {opt.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>

                            <TableCell>
                              <TextField
                                 select
                                 value={row.village}
                                 onChange={(e) => handleVillageChange(lb.id, row.id, e.target.value)}
                                 fullWidth
                                error={hasFieldError(lb.id, row.id, 'village')}
                                helperText={getFieldError(lb.id, row.id, 'village')}
                                size="small"
                              >
                                {villageOptions.map((opt) => (
                                  <MenuItem key={opt.revenueVillageId} value={opt.revenueVillageName}>
                                    {opt.revenueVillageName}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField
                                 select
                                 value={row.villageBlock}
                                 onChange={(e) => handleChange(lb.id, row.id, "villageBlock", e.target.value)}
                                 fullWidth
                                 disabled={!row.village}
                                error={hasFieldError(lb.id, row.id, 'villageBlock')}
                                helperText={getFieldError(lb.id, row.id, 'villageBlock')}
                                size="small"
                              >
                                {(row.villageBlockOptions || []).map((code) => (
                                  <MenuItem key={code} value={code}>{code}</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell>
                              <TextField
                                 value={row.surveyNo}
                                 onChange={(e) => handleChange(lb.id, row.id, "surveyNo", e.target.value)}
                                error={hasFieldError(lb.id, row.id, 'surveyNo')}
                                helperText={getFieldError(lb.id, row.id, 'surveyNo')}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                 value={row.subDivNo}
                                 onChange={(e) => handleChange(lb.id, row.id, "subDivNo", e.target.value)}
                                error={hasFieldError(lb.id, row.id, 'subDivNo')}
                                helperText={getFieldError(lb.id, row.id, 'subDivNo')}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                 value={row.area}
                                 onChange={(e) => handleChange(lb.id, row.id, "area", e.target.value)}
                                error={hasFieldError(lb.id, row.id, 'area')}
                                helperText={getFieldError(lb.id, row.id, 'area')}
                                size="small"
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                 select
                                 value={row.landType}
                                 onChange={(e) => handleChange(lb.id, row.id, "landType", e.target.value)}
                                error={hasFieldError(lb.id, row.id, 'landType')}
                                helperText={getFieldError(lb.id, row.id, 'landType')}
                                size="small"
                                fullWidth
                              >
                                {landTypeOptions.map((opt) => (
                                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton color="error" onClick={() => handleDeleteRow(lb.id, row.id)}>
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={8} align="right">
                            <Button
                              startIcon={<AddCircle />}
                              variant="outlined"
                              color="success"
                              onClick={() => handleAddRow(lb.id)}
                              disabled={
                                totalKeyplots >= TOTAL_REQUIRED || 
                                !areAllFieldsFilled(lb.id)
                              }
                            >
                              Add Keyplot
                            </Button>
                          </TableCell>
                        </TableRow>

                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Show duplicate error details below the table */}
                  {(Object.keys(duplicateErrors).some(key => key.startsWith(`${lb.id}_`)) ||
                    Object.keys(clientDuplicateErrors).some(key => key.startsWith(`${lb.id}_`))) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Duplicate Records Found:
                      </Typography>
                                            
                      {/* Backend duplicate errors */}
                      {Object.entries(duplicateErrors)
                        .filter(([key]) => key.startsWith(`${lb.id}_`))
                        .map(([key, message]) => (
                          <Typography key={key} variant="body2" sx={{ mt: 1 }}>
                            • {message}
                          </Typography>
                        ))}
                                            
                      {/* Client-side duplicate errors */}
                      {Object.entries(clientDuplicateErrors)
                        .filter(([key]) => key.startsWith(`${lb.id}_`))
                        .map(([key, message]) => (
                          <Typography key={key} variant="body2" sx={{ mt: 1, color: '#ff6b35' }}>
                            • {message}
                          </Typography>
                        ))}
                    </Alert>
                  )}
                </Paper>
              )}
            </div>
          );
        })}

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
              Error saving keyplots!
              <br />
              Please check the form for errors and try again.
            </DialogContentText>
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
            disabled={totalKeyplots === 0 || isSaving || Object.keys(clientDuplicateErrors).length > 0}
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

export default KeyPlotEntry;
