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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { 
  AddCircle, 
  Delete, 
  CheckCircle,
  Cancel,
  Lock,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import mainapi from "api/mainapi";
import authservice from "pages/authentication/services/authservice";
import api from "api/api";
import Breadcrumb from 'routes/Breadcrumb';
import Chip from '@mui/material/Chip';
import ErrorIcon from '@mui/icons-material/Error';

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
  const [workAllocationStatus, setworkAllocationStatus] = useState(false);
  
  const [activeBTypes, setActiveBTypes] = useState([]);
  const [listTypeOptions, setListTypeOptions] = useState([]);
  const [nonBtrTypeMapping, setNonBtrTypeMapping] = useState({});
  const [btypesLoading, setBtypesLoading] = useState(false);
  const [keyplotLimit, setKeyplotLimit] = useState(null);
  const [remainingKeyplots, setRemainingKeyplots] = useState(0);
  
  const [globalEntryType, setGlobalEntryType] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  // --- Plot Validation States ---
  const [validationInfo, setValidationInfo] = useState(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validatingRow, setValidatingRow] = useState({ lbId: null, villageName: null, rowId: null });
  const [subdivisionDialogOpen, setSubdivisionDialogOpen] = useState(false);
  const [availableSubdivisions, setAvailableSubdivisions] = useState([]);
  const [pendingPlot, setPendingPlot] = useState(null);

  const BASE_URL = mainapi.BASE_URL;
  const zoneId = typeof window !== "undefined" ? localStorage.getItem("activeZone") : null;
  const userId = authservice.userid();

  const hasAnyData = useMemo(() => {
    return Object.values(localBodyData).some(lbData => 
      Object.values(lbData || {}).some(villageRows => villageRows && villageRows.length > 0)
    );
  }, [localBodyData]);

  const hasDataInCurrentTab = useMemo(() => {
    if (localBodies.length === 0 || activeTab === null) return false;
    const currentLb = localBodies[activeTab];
    if (!currentLb) return false;
    const lbData = localBodyData[currentLb.id];
    if (!lbData) return false;
    return Object.values(lbData).some(villageRows => villageRows && villageRows.length > 0);
  }, [localBodies, activeTab, localBodyData]);

  const handleTabChange = (event, newValue) => {
    if (hasDataInCurrentTab && newValue !== activeTab) {
      setPendingTabChange(newValue);
      setShowTabChangeWarning(true);
    } else {
      setActiveTab(newValue);
    }
  };

  // Dynamic theme mapping for the Work Allocation status badge
  const getWorkAllocationStatusChip = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return { label: "Allocation Approved", color: "success", variant: "filled" };
      case 'SUBMITTED':
      case 'PENDING':
        return { label: "Allocation Submitted", color: "warning", variant: "filled" };
      case 'UNDER REVIEW':
        return { label: "Allocation Under Review", color: "info", variant: "filled" };
      case 'RETURNED':
        return { label: "Allocation Returned", color: "error", variant: "filled" };
      case 'NOT SUBMITTED':
      default:
        return { label: "Allocation Not Submitted", color: "error", variant: "outlined" };
    }
  };

  const handleConfirmTabChange = () => {
    setShowTabChangeWarning(false);
    if (pendingTabChange !== null) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
  };

  const handleCancelTabChange = () => {
    setShowTabChangeWarning(false);
    setPendingTabChange(null);
  };

  const handleEntryTypeChange = (event) => {
    const newType = event.target.value;
    if (hasAnyData) {
      toast.warning("Entry Type cannot be changed after data has been entered. Please clear all data first.", {
        autoClose: 5000,
      });
    } else {
      setGlobalEntryType(newType);
    }
  };

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
          
          const nonBtrOptions = btypeData
            .filter(btype => btype.btypeId !== 1)
            .map(btype => btype.btypeName);
          
          setListTypeOptions(nonBtrOptions);
          
          if (nonBtrOptions.length > 0) {
            setGlobalEntryType(nonBtrOptions[0]);
          }
          
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
      } finally {
        setBtypesLoading(false);
      }
    };
    fetchActiveBTypes();
  }, [BASE_URL]);

  useEffect(() => {
    if (showSuccessModal) {
      const timeoutId = setTimeout(() => setShowSuccessModal(false), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    if (showErrorModal) {
      const timeoutId = setTimeout(() => setShowErrorModal(false), 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [showErrorModal]);

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

  const [order] = useState("asc");
  const [orderBy] = useState("slNo");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const getVillagesForLocalBody = (localBodyId) => {
    return villageOptions.filter(v => v.revenueVillageName);
  };

  const getCurrentListType = () => {
    return globalEntryType || listTypeOptions[0] || "House List";
  };

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
        if (!token) throw new Error("No token found, please log in again.");

        const requests = urls.map(url =>
          fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            return res.json();
          })
        );

        const [lbData, villageData, distData, talukData] = await Promise.all(requests);

        setLocalBodies(lbData || []);
        setVillageOptions(villageData || []);
        setDistrictInfo(distData);
        setTalukInfo(talukData || []);

        const initialVillage = {};
        (lbData || []).forEach((lb) => { initialVillage[lb.id] = 0; });
        setActiveVillage(initialVillage);

        setLocalBodyData((prev) => {
          const next = { ...prev };
          (lbData || []).forEach((lb) => {
            if (!next[lb.id]) next[lb.id] = {};
          });
          return next;
        });
        
        setActiveTab((t) => lbData && lbData.length > 0 ? Math.min(t, lbData.length - 1) : 0);
      } catch (err) {
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

  const checkPlotUsageInCurrentForm = (plotIdentifier, currentLbId, currentVillageName, currentRowId, btrTypeId) => {
    let duplicateRows = [];
    
    Object.entries(localBodyData).forEach(([lbId, villageData]) => {
      Object.entries(villageData || {}).forEach(([villageName, rows]) => {
        rows.forEach(row => {
          if (row.id === currentRowId && lbId === currentLbId.toString() && villageName === currentVillageName) return;

          let rowPlotIdentifier = '';
          if (btrTypeId === 2 && row.wardNo && row.houseNo) {
            rowPlotIdentifier = `${row.village}-${row.villageBlock}-${row.wardNo}-${row.houseNo}`;
          } else if (btrTypeId === 3 && row.name && row.address && row.area) {
            rowPlotIdentifier = `${row.village}-${row.villageBlock}-${row.name}-${row.address}-${row.area}`;
          } else if (btrTypeId === 4 && row.thandaperNo) {
            rowPlotIdentifier = `${row.village}-${row.villageBlock}-${row.thandaperNo}-${row.thandapersubNo || ''}`;
          } else if (btrTypeId === 5 && row.oldsvno) {
            rowPlotIdentifier = `${row.village}-${row.villageBlock}-${row.oldsvno}-${row.oldsubno || ''}`;
          }

          if (rowPlotIdentifier === plotIdentifier && rowPlotIdentifier !== '') {
            duplicateRows.push({ ...row, lbId, villageName });
          }
        });
      });
    });

    if (duplicateRows.length === 0) return { isUsed: false };

    const totalArea = parseFloat(duplicateRows[0].area) || 0;
    const usedArea = duplicateRows.reduce((sum, row) => sum + (parseFloat(row.area) || 0), 0);
    const remainingArea = Math.max(0, totalArea - usedArea);
    
    return {
      isUsed: true,
      location: 'this form',
      totalArea,
      usedArea,
      remainingArea
    };
  };

  const handlePlotValidation = async (lbId, villageName, rowId) => {
    const currentListType = getCurrentListType();
    const btrTypeId = nonBtrTypeMapping[currentListType];
    const row = localBodyData[lbId]?.[villageName]?.find(r => r.id === rowId);

    if (!row || !row.village || !row.villageBlock) return;

    if (btrTypeId === 2 && (!row.wardNo || !row.houseNo)) return;
    if (btrTypeId === 3 && (!row.name || !row.address || !row.area)) return;
    if (btrTypeId === 4 && (!row.thandaperNo)) return;
    if (btrTypeId === 5 && (!row.oldsvno)) return;

    let plotIdentifier = '';
    if (btrTypeId === 2) plotIdentifier = `${row.village}-${row.villageBlock}-${row.wardNo}-${row.houseNo}`;
    else if (btrTypeId === 3) plotIdentifier = `${row.village}-${row.villageBlock}-${row.name}-${row.address}-${row.area}`;
    else if (btrTypeId === 4) plotIdentifier = `${row.village}-${row.villageBlock}-${row.thandaperNo}-${row.thandapersubNo || ''}`;
    else if (btrTypeId === 5) plotIdentifier = `${row.village}-${row.villageBlock}-${row.oldsvno}-${row.oldsubno || ''}`;

    const existingUsageInForm = checkPlotUsageInCurrentForm(plotIdentifier, lbId, villageName, rowId, btrTypeId);
    
    if (existingUsageInForm.isUsed) {
      setValidationInfo({
        message: `This plot is already used in ${existingUsageInForm.location}.`,
        totalcent: existingUsageInForm.totalArea,
        remainingArea: existingUsageInForm.remainingArea,
        uiUsedRemaining: existingUsageInForm.remainingArea,
        isFromCurrentForm: true
      });
      setValidatingRow({ lbId, villageName, rowId });
      setIsValidationDialogOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const villageData = villageInfoMap.get(row.village);
      const lbData = localBodyInfoMap.get(parseInt(lbId));
      if (!villageData || !lbData) return;

      let payload = {
        btrtype: btrTypeId,
        vcode: villageData.vcode,
        bcode: row.villageBlock,
        resvno: row.surveyNo ? parseInt(row.surveyNo, 10) : null,
        resbdno: row.subDivNo && row.subDivNo.trim() !== "" ? row.subDivNo.trim() : null,
        lbcode: lbData.lbcode,
        zoneId: parseInt(zoneId, 10),
        agriYear: authservice.agriyear(),
      };

      if (btrTypeId === 2) {
        payload.wardno = parseInt(row.wardNo);
        payload.houseno = row.houseNo;
      } else if (btrTypeId === 3) {
        payload.ownername = row.name;
        payload.address = row.address;
        payload.totCent = parseFloat(row.area);
      } else if (btrTypeId === 4) {
        payload.tpno = parseInt(row.thandaperNo);
        payload.tbsubdivisionno = row.thandapersubNo ? row.thandapersubNo : null;
        payload.totCent = parseFloat(row.area) || 0;
      } else if (btrTypeId === 5) {
        payload.oldsvno = parseInt(row.oldsvno);
        payload.oldsubno = row.oldsubno ? row.oldsubno : null;
        payload.totCent = parseFloat(row.area) || 0;
      }

      const response = await fetch(`${BASE_URL}/btr-service/key-plots/validate-nonbtr-keyplots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = responseText ? JSON.parse(responseText) : {};

      if (response.status === 409 || data.remainingArea === 0 || (data.message && data.message.includes("already selected"))) {
        if (data.availableSubdivisions && data.availableSubdivisions.length > 0) {
          setAvailableSubdivisions(data.availableSubdivisions);
          setPendingPlot({ lbId, villageName, rowId, validationInfo: data });
          setSubdivisionDialogOpen(true);
        } else {
          setValidationInfo({
            message: data.message || "This plot has already been used in current or previous agricultural year.",
            totalcent: data.totalArea || data.totalcent || row.area || 0,
            remainingArea: data.remainingArea || 0,
            uiUsedRemaining: data.remainingArea || 0,
            isFromCurrentForm: false,
            plotId: data.id,
            landType: data.landType
          });
          setValidatingRow({ lbId, villageName, rowId });
          setIsValidationDialogOpen(true);
        }
      } else if (response.ok) {
        if (data.id) {
          handleChange(lbId, villageName, rowId, 'btrId', data.id);
          handleChange(lbId, villageName, rowId, 'area', data.totalcent ? data.totalcent.toString() : row.area);
          handleChange(lbId, villageName, rowId, 'isLocked', true);
          if (data.landType) {
             handleChange(lbId, villageName, rowId, 'landType', data.landType.charAt(0).toUpperCase() + data.landType.slice(1).toLowerCase());
          }
          toast.success(data.message || "Existing plot linked. Fields are locked.");
        } else {
          handleChange(lbId, villageName, rowId, 'btrId', null);
          handleChange(lbId, villageName, rowId, 'isLocked', false);
        }
      } else {
        throw new Error(data.message || `Validation failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleUseRecommendedPlot = (type) => {
    if (!validatingRow || !validationInfo) return;
    const { lbId, villageName, rowId } = validatingRow;

    setLocalBodyData(prev => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: prev[lbId][villageName].map(row => 
          row.id === rowId ? {
            ...row,
            btrId: validationInfo.plotId || null,
            area: type === 'remaining' && validationInfo.uiUsedRemaining > 0 
              ? validationInfo.uiUsedRemaining.toFixed(2) 
              : row.area,
            isLocked: true, 
            landType: validationInfo.landType 
              ? validationInfo.landType.charAt(0).toUpperCase() + validationInfo.landType.slice(1).toLowerCase() 
              : row.landType
          } : row
        )
      }
    }));

    setIsValidationDialogOpen(false);
    setValidationInfo(null);
    setValidatingRow({ lbId: null, villageName: null, rowId: null });
    if (type === 'remaining') {
      toast.success(`Using remaining area: ${validationInfo.uiUsedRemaining.toFixed(2)} cents. Fields locked.`);
    }
  };

  const handleRejectPlot = () => {
    if (!validatingRow || !validatingRow.lbId) return;
    const { lbId, villageName, rowId } = validatingRow;
    
    setLocalBodyData(prev => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: prev[lbId][villageName].map(row => 
          row.id === rowId ? { ...row, name: '', address: '', wardNo: '', houseNo: '', thandaperNo: '', thandapersubNo: '', oldsvno: '', oldsubno: '', area: '', btrId: null, isLocked: false } : row
        )
      }
    }));

    setIsValidationDialogOpen(false);
    setValidatingRow({ lbId: null, villageName: null, rowId: null });
    toast.warn("Plot rejected. Please enter a different one.");
  };

  const handleSubdivisionSelect = (selectedSub) => {
    if (!pendingPlot || !selectedSub) return;
    const { lbId, villageName, rowId, validationInfo } = pendingPlot;
    const currentListType = getCurrentListType();
    
    setLocalBodyData(prev => ({
      ...prev,
      [lbId]: {
        ...prev[lbId],
        [villageName]: prev[lbId][villageName].map(row => 
          row.id === rowId ? {
            ...row,
            thandapersubNo: currentListType === "Thandaper Number" ? selectedSub : row.thandapersubNo,
            oldsubno: currentListType === "Old Survey Number" ? selectedSub : row.oldsubno,
            subDivNo: (currentListType === "House List" || currentListType === "Cultivators List") ? selectedSub : row.subDivNo,
            btrId: validationInfo?.id || null,
            area: validationInfo?.totalcent ? validationInfo.totalcent.toString() : row.area,
            isLocked: !!validationInfo?.totalcent,
            landType: validationInfo?.landType 
              ? validationInfo.landType.charAt(0).toUpperCase() + validationInfo.landType.slice(1).toLowerCase() 
              : row.landType
          } : row
        )
      }
    }));

    setSubdivisionDialogOpen(false);
    setPendingPlot(null);
    toast.success(`Subdivision ${selectedSub} selected. Fields locked.`);
  };

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
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      case "Old Survey Number":
        return [
          { field: "village", label: "Village" },
          { field: "villageBlock", label: "Village Block" },
          { field: "oldsvno", label: "Old Survey No." },
          { field: "area", label: "Area (Cents)" },
          { field: "landType", label: "Land Type" },
        ];
      default:
        return [];
    }
  };

  // ✅ NEW: Helper function to determine if all fields are filled on the active row layout context
  const areAllFieldsFilled = (lbId) => {
    const currentListType = getCurrentListType();
    const requiredFields = getRequiredFieldsForRow(currentListType);
    const lbVillageData = localBodyData[lbId] || {};
    
    // Flatten rows inside this local body context across all structural villages
    const rows = Object.values(lbVillageData).flat();
    if (rows.length === 0) return true; // Accept first row addition unconditionally
    
    return rows.every((row) => 
      requiredFields.every(({ field }) => String(row[field] || "").trim() !== "")
    );
  };

  const sortedByLocalBodyAndVillage = useMemo(() => {
    const out = {};
    localBodies.forEach((lb) => {
      out[lb.id] = {};
      const villages = getVillagesForLocalBody(lb.id);
      villages.forEach(village => {
        const villageName = village.revenueVillageName;
        const rows = localBodyData[lb.id]?.[villageName] || [];
        out[lb.id][villageName] = [...rows];
      });
    });
    return out;
  }, [localBodies, localBodyData, villageOptions]);

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
              isLocked: false,
              btrId: null
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
    const fetchKeyplotLimit = async () => {
      const savedZone = authservice.getzone();
      const agriYear = localStorage.getItem("activeAgriYear");
      if (!savedZone || !agriYear) return;

      try {
        const response = await api.get(
          `/btr-service/api/keyplots/limit-status/${savedZone}`,
          { params: { agriYear: agriYear } }
        );
        setKeyplotLimit(response.data);
        setRemainingKeyplots(response.data.remainingKeyplots);
        setworkAllocationStatus(response.data.is_WorkAllocation);
      } catch (err) {
        console.error(err);
        toast.error("Unable to refresh keyplot limit");
      }
    };
    fetchKeyplotLimit();
  }, []);

  const handleActualSave = async () => {
    if (totalKeyplots > remainingKeyplots) {
      toast.error(`You can only save ${remainingKeyplots} keyplots for this zone`);
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
      const btrTypeId = nonBtrTypeMapping[currentListType];
      
      Object.entries(localBodyData).forEach(([lbId, villageData]) => {
        Object.entries(villageData || {}).forEach(([villageName, rows]) => {
          rows.forEach(row => {
            const vData = villageInfoMap.get(row.village || villageName);
            const lbInfo = localBodyInfoMap.get(parseInt(lbId));
            if (!vData || !lbInfo) return;

            dtoList.push({
              id: row.btrId || null,
              dcode: districtInfo.distId,
              tcode: talukInfo[0].revenueTalukId,
              vcode: vData.vcode,
              zoneId: parseInt(zoneId),
              bcode: row.villageBlock || "",
              lbcode: lbInfo.lbcode,
              ltype: row.landType ? row.landType.toUpperCase() : "",
              resvno: row.surveyNo ? parseInt(row.surveyNo) : null,
              resbdno: row.subDivNo || "",
              lsgcode: vData.lsgcode,
              agriYear: authservice.agriyear(),
              user_id: userId,
              totCent: row.area ? parseFloat(row.area) : 0.0,
              btrtype: btrTypeId,
              ownername: row.name || "",
              address: row.address || "",
              ...(btrTypeId === 2 && {
                wardno: row.wardNo ? parseInt(row.wardNo) : null,
                houseno: row.houseNo || ""
              }),
              ...(btrTypeId === 4 && {
                tpno: row.thandaperNo ? parseInt(row.thandaperNo) : null,
                tbsubdivisionno: row.thandapersubNo ? parseInt(row.thandapersubNo) : null
              }),
              ...(btrTypeId === 5 && {
                oldsvno: row.oldsvno ? parseInt(row.oldsvno) : null,
                oldsubno: row.oldsubno || ""
              })
            });
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
        setTimeout(() => { window.location.reload(); }, 1500);
      } else if (result.status === 'Validation Failed') {
        setValidationErrors(result.errors || []);
        setShowErrorModal(true);
        toast.error("Validation failed backend.");
      } else {
        setShowErrorModal(true);
        toast.error(result.message || "Failed to save keyplots.");
      }
    } catch (error) {
      console.error("Save error:", error);
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const getTableHeaders = () => {
    const currentListType = getCurrentListType();
    const baseHeaders = ["Sl. No", "Village", "Village Block"];
    const houseListHeaders = ["Name", "Address", "Ward No.", "House No."];
    const cultivatorListHeaders = ["Name", "Address"];
    const thandaperHeaders = ["Name", "Address", "Thandaper No.", "Thandaper Sub No."];
    const oldSurveyHeaders = ["Old Survey No.", "Old Sub No."];
    const finalHeaders = ["Survey No.", "Sub Div No.", "Area (Cents)", "Land Type", "Actions"];

    if (currentListType === "House List") return [...baseHeaders, ...houseListHeaders, ...finalHeaders];
    if (currentListType === "Cultivators List") return [...baseHeaders, ...cultivatorListHeaders, ...finalHeaders];
    if (currentListType === "Thandaper Number") return [...baseHeaders, ...thandaperHeaders, ...finalHeaders];
    if (currentListType === "Old Survey Number") return [...baseHeaders, ...oldSurveyHeaders, ...finalHeaders];
    return [...baseHeaders, ...finalHeaders];
  };

  const getLocalBodyTotal = (lbId) => {
    const villages = getVillagesForLocalBody(lbId);
    return villages.reduce((sum, v) => sum + (localBodyData[lbId]?.[v.revenueVillageName]?.length || 0), 0);
  };

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
       <Breadcrumb></Breadcrumb>
      <Box sx={{ p: 3, maxWidth: 1600, margin: "0 auto", width: "100%", minHeight: 400 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Non-BTR Key Plot Entry
        </Typography>

        {btypesLoading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}

        {listTypeOptions.length > 0 && (
          <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Entry Type:</Typography>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={globalEntryType}
                    onChange={handleEntryTypeChange}
                    disabled={hasAnyData}
                  >
                    {listTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

             {keyplotLimit && (
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: '#f8fafc', 
                  borderColor: '#e2e8f0', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                {/* Left Side: Numeric Metrics */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Typography variant="body1">
                    Zone Limit: <strong style={{ color: '#05307a' }}>{keyplotLimit.allowedKeyplotsLimit}</strong>
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                  <Typography variant="body1">
                    Formed Count: <strong style={{ color: '#05307a' }}>{keyplotLimit.usedKeyplotsCount}</strong>
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                  <Typography variant="body1">
                    Remaining Available: <strong style={{ color: keyplotLimit.remainingKeyplots > 0 ? '#10b981' : '#dc2626' }}>{keyplotLimit.remainingKeyplots}</strong>
                  </Typography>
                </Box>

                {/* Right Side: Dynamic Status Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Work Allocation Status:
                  </Typography>
                  <Chip 
                    label={getWorkAllocationStatusChip(keyplotLimit.status).label}
                    color={getWorkAllocationStatusChip(keyplotLimit.status).color}
                    variant={getWorkAllocationStatusChip(keyplotLimit.status).variant}
                    size="medium"
                    sx={{ fontWeight: 600, px: 1 }}
                  />
                </Box>
              </Paper>
            )}

            </Box>
          </Paper>
        )}
        {!workAllocationStatus && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />} 
            sx={{ mb: 3, borderRadius: 2, fontWeight: 500 }}
          >
            <strong>Keyplot Entry Disabled:</strong> The Work Allocation Statement for this Zone and Agricultural Year must be <strong>Approved</strong> by the administrator before you can record new keyplots.
          </Alert>
        )}

        {localBodies.length > 0 && (
          <Paper elevation={3}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              {localBodies.map((lb, idx) => (
                <Tab key={lb.id} label={`${lb.name} (${getLocalBodyTotal(lb.id)})`} />
              ))}
            </Tabs>
          </Paper>
        )}

        <Dialog open={showTabChangeWarning} onClose={handleCancelTabChange}>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#f57c00' }}>Complete Entry Required!</DialogTitle>
          <DialogContent><DialogContentText>You have unsaved data in the current local body.</DialogContentText></DialogContent>
          <DialogActions><Button onClick={handleCancelTabChange} variant="contained">OK</Button></DialogActions>
        </Dialog>

        {localBodies.map((lb, idx) => {
          const villages = getVillagesForLocalBody(lb.id);
          const currentVillageIndex = activeVillage[lb.id] || 0;
          const currentVillage = villages[currentVillageIndex];
          const currentVillageName = currentVillage?.revenueVillageName || "";
          const sortedRows = sortedByLocalBodyAndVillage[lb.id]?.[currentVillageName] || [];
          const currentListType = getCurrentListType();
          const headers = getTableHeaders();

          return (
            <div key={lb.id} style={{ display: activeTab === idx ? "block" : "none" }}>
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <TableContainer component={Paper}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {headers.map((col) => (
                          <TableCell key={col} align="center" sx={{ bgcolor: "#05307a", color: "white", fontWeight: "bold" }}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell align="center">{row.slNo}</TableCell>
                          <TableCell align="center">
                            <TextField select value={row.village} onChange={(e) => handleVillageChange(lb.id, currentVillageName, row.id, e.target.value)} sx={{ minWidth: 140 }}>
                              {getVillagesForLocalBody(lb.id).map(v => v.revenueVillageName).map((vName) => (
                                <MenuItem key={vName} value={vName}>{vName}</MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell align="center">
                            <TextField select value={row.villageBlock} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "villageBlock", e.target.value)} sx={{ minWidth: 140 }}>
                              {(villageToBlocks[row.village] || []).map((code) => (
                                <MenuItem key={code} value={code}>{code}</MenuItem>
                              ))}
                            </TextField>
                          </TableCell>

                          {(currentListType === "House List" || currentListType === "Cultivators List" || currentListType === "Thandaper Number") && (
                            <>
                              <TableCell align="center">
                                <TextField value={row.name} disabled={row.isLocked} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "name", e.target.value.slice(0, 60))} />
                              </TableCell>
                              <TableCell align="center">
                                <TextField value={row.address} disabled={row.isLocked} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "address", e.target.value.slice(0, 250))} />
                              </TableCell>
                            </>
                          )}

                          {currentListType === "House List" && (
                            <>
                              <TableCell align="center">
                                <TextField value={row.wardNo} disabled={row.isLocked} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "wardNo", e.target.value.replace(/\D/g, ""))} />
                              </TableCell>
                              <TableCell align="center">
                                <TextField value={row.houseNo} disabled={row.isLocked} onBlur={() => handlePlotValidation(lb.id, currentVillageName, row.id)} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "houseNo", e.target.value)} />
                              </TableCell>
                            </>
                          )}

                          {currentListType === "Thandaper Number" && (
                            <>
                              <TableCell align="center">
                                <TextField value={row.thandaperNo} disabled={row.isLocked} onBlur={() => handlePlotValidation(lb.id, currentVillageName, row.id)} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "thandaperNo", e.target.value.replace(/\D/g, ""))} />
                              </TableCell>
                              <TableCell align="center">
                                <TextField value={row.thandapersubNo} disabled={row.isLocked} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "thandapersubNo", e.target.value)} />
                              </TableCell>
                            </>
                          )}

                          {currentListType === "Old Survey Number" && (
                            <>
                              <TableCell align="center">
                                <TextField value={row.oldsvno} disabled={row.isLocked} onBlur={() => handlePlotValidation(lb.id, currentVillageName, row.id)} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "oldsvno", e.target.value.replace(/\D/g, ""))} />
                              </TableCell>
                              <TableCell align="center">
                                <TextField value={row.oldsubno} disabled={row.isLocked} onBlur={() => handlePlotValidation(lb.id, currentVillageName, row.id)} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "oldsubno", e.target.value)} />
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <TextField value={row.surveyNo} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "surveyNo", e.target.value.replace(/\D/g, ""))} />
                          </TableCell>
                          <TableCell align="center">
                            <TextField value={row.subDivNo} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "subDivNo", e.target.value)} />
                          </TableCell>
                          <TableCell align="center">
                            <TextField value={row.area} disabled={row.isLocked} onBlur={() => { if(currentListType === "Cultivators List") handlePlotValidation(lb.id, currentVillageName, row.id); }} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "area", e.target.value)} />
                          </TableCell>
                          <TableCell align="center">
                            <TextField select value={row.landType} disabled={row.isLocked} onChange={(e) => handleChange(lb.id, currentVillageName, row.id, "landType", e.target.value)} sx={{ minWidth: 90 }}>
                              {landTypeOptions.map((opt) => (<MenuItem key={opt} value={opt}>{opt}</MenuItem>))}
                            </TextField>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="error" onClick={() => handleDeleteRow(lb.id, currentVillageName, row.id)}><Delete /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={headers.length} align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                            {!workAllocationStatus && (
                              <Typography variant="body2" color="error.main" sx={{ fontWeight: 500, fontStyle: 'italic' }}>
                                * Work allocation must be approved to enable this action.
                              </Typography>
                            )}
                            <Button
                              startIcon={<AddCircle />}
                              variant="outlined"
                              color="success"
                              onClick={() => handleAddRow(lb.id, currentVillageName)}
                              disabled={
                                totalKeyplots >= remainingKeyplots ||
                                !areAllFieldsFilled(lb.id) || 
                                !workAllocationStatus
                              }
                            >
                              Add Keyplot
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination component="div" count={sortedRows.length} page={page} onPageChange={(e, nP) => setPage(nP)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} rowsPerPageOptions={[50, 100]} />
              </Paper>
            </div>
          );
        })}

        <Dialog open={showConfirmModal} onClose={handleCancelSave} maxWidth="sm" fullWidth>
          <DialogTitle>Confirm Save Operation</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to save {totalKeyplots} keyplots?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={handleCancelSave} color="secondary" variant="outlined">Cancel</Button>
            <Button onClick={handleConfirmSave} color="primary" variant="contained">Confirm & Save</Button>
          </DialogActions>
        </Dialog>

        {/* Dynamic & Synced Styling Plot Validation Dialog */}
        <Dialog open={isValidationDialogOpen} onClose={() => setIsValidationDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
          <DialogTitle sx={{ background: validationInfo?.isFromCurrentForm ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InfoIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {validationInfo?.isFromCurrentForm ? "Duplicate Plot Detected" : "Plot Already Allocated"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {validationInfo && (
              <Box>
                <Box sx={{ mb: 3, p: 2, borderRadius: 2, borderLeft: `4px solid ${validationInfo.isFromCurrentForm ? '#f59e0b' : '#3b82f6'}`, backgroundColor: validationInfo.isFromCurrentForm ? '#fef3c7' : '#eff6ff' }}>
                  <Typography variant="body1" sx={{ color: validationInfo.isFromCurrentForm ? '#92400e' : '#1e40af', fontWeight: 500 }}>
                    {validationInfo.message}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total Area</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{validationInfo.totalcent || 0} cents</Typography>
                  </Box>
                  {validationInfo.uiUsedRemaining !== undefined && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Remaining Available</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: validationInfo.uiUsedRemaining > 0 ? '#10b981' : '#ef4444' }}>
                        {validationInfo.uiUsedRemaining.toFixed(2)} cents
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
            {validationInfo && validationInfo.uiUsedRemaining > 0 && (
              <Button onClick={() => handleUseRecommendedPlot('remaining')} variant="contained" fullWidth sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
                Use Remaining Area ({validationInfo.uiUsedRemaining.toFixed(2)} cents)
              </Button>
            )}
            <Button onClick={handleRejectPlot} variant="outlined" fullWidth color="error">
              {validationInfo?.isFromCurrentForm ? 'Clear Entry' : 'Choose Different Plot'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={subdivisionDialogOpen} onClose={() => setSubdivisionDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Select Subdivision</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {availableSubdivisions.map((sub) => (
                <Button key={sub} variant="outlined" onClick={() => handleSubdivisionSelect(sub)}>Subdivision: {sub}</Button>
              ))}
            </Box>
          </DialogContent>
          <DialogActions><Button onClick={() => setSubdivisionDialogOpen(false)}>Cancel</Button></DialogActions>
        </Dialog>

        <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>Success!</Typography>
            <Typography>Successfully saved {savedCount} keyplots!</Typography>
          </DialogContent>
        </Dialog>

        <Dialog open={showErrorModal} onClose={() => setShowErrorModal(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            <Cancel sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#f44336', fontWeight: 'bold', mb: 1 }}>Error!</Typography>
            {validationErrors.length > 0 && validationErrors.slice(0, 3).map((e, idx) => (
              <Typography key={idx} variant="body2" color="error">{e.message}</Typography>
            ))}
          </DialogContent>
        </Dialog>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary" onClick={handleSaveButtonClick} disabled={totalKeyplots === 0 || isSaving}>
            {isSaving ? "Saving..." : `Save All Keyplots (${totalKeyplots})`}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default KeyPlotEntryNonBtr;