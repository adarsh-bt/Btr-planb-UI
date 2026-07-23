import React, { useState, useEffect } from "react";
import {
  Box, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment, CircularProgress, Chip,
  TablePagination, Tabs, Tab, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch,
  FormControlLabel, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import Breadcrumb from 'routes/Breadcrumb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import mainapi from "api/mainapi";
import api from "api/api";

const themeColor = "#05307a";

const CropsManagement = () => {
  const BASE_URL = mainapi.BASE_URL;
  // Crops State
  const [crops, setCrops] = useState([]); // Displayed crops after pagination
  const [allCrops, setAllCrops] = useState([]); // Store all crops for filtering
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("cropNameEn");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCropsCount, setTotalCropsCount] = useState(0);
  
  // Units State
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsSearchTerm, setUnitsSearchTerm] = useState("");
  const [unitsOrder, setUnitsOrder] = useState("asc");
  const [unitsOrderBy, setUnitsOrderBy] = useState("unitName");
  const [unitsPage, setUnitsPage] = useState(0);
  const [unitsRowsPerPage, setUnitsRowsPerPage] = useState(10);
  
  // Stands Per Hectare State
  const [standsData, setStandsData] = useState([]);
  const [standsLoading, setStandsLoading] = useState(true);
  const [standsSearchTerm, setStandsSearchTerm] = useState("");
  const [standsOrder, setStandsOrder] = useState("asc");
  const [standsOrderBy, setStandsOrderBy] = useState("standsPerHectare");
  const [standsPage, setStandsPage] = useState(0);
  const [standsRowsPerPage, setStandsRowsPerPage] = useState(10);
  
  // Irrigation Sources State
  const [irrigationData, setIrrigationData] = useState([]);
  const [irrigationLoading, setIrrigationLoading] = useState(true);
  const [irrigationSearchTerm, setIrrigationSearchTerm] = useState("");
  const [irrigationOrder, setIrrigationOrder] = useState("asc");
  const [irrigationOrderBy, setIrrigationOrderBy] = useState("irrigationType");
  const [irrigationPage, setIrrigationPage] = useState(0);
  const [irrigationRowsPerPage, setIrrigationRowsPerPage] = useState(10);
  
  // CCE Crops State
const [cceCrops, setCceCrops] = useState([]);
const [cceLoading, setCceLoading] = useState(true);
const [cceSearchTerm, setCceSearchTerm] = useState("");
const [cceOrder, setCceOrder] = useState("asc");
const [cceOrderBy, setCceOrderBy] = useState("cceCropType");
const [ccePage, setCcePage] = useState(0);
const [cceRowsPerPage, setCceRowsPerPage] = useState(10);

  // Dropdown data states
  const [cropGroups, setCropGroups] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  // Loading states for dropdowns
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  // Additional dropdown data for CCE
const [frames, setFrames] = useState([]);
const [loadingFrames, setLoadingFrames] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState(0);

  // Dialog State for Add Crop
  const [addCropDialogOpen, setAddCropDialogOpen] = useState(false);
  const [newCropFormData, setNewCropFormData] = useState({
    cropNameEn: "",
    cropNameMal: "",
    isActive: true,
    scientificName: "",
    isHorti: false,
    cropGroupId: "",
    cropClassGroupId: "",
    hortiGroupId: "",
    cropTypeId: "",
    unitId: ""
  });
  
  // Dialog State for Edit Crop
  const [editCropDialogOpen, setEditCropDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [editCropFormData, setEditCropFormData] = useState({
    cropId: "",
    cropNameEn: "",
    cropNameMal: "",
    isActive: true,
    scientificName: "",
    isHorti: false,
    cropGroupId: "",
    cropClassGroupId: "",
    hortiGroupId: "",
    cropTypeId: "",
    unitId: ""
  });
  
  // Dialog State for Unit
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitFormData, setUnitFormData] = useState({
    unitId: "",
    unitName: "",
    isActive: true
  });
  
  // Dialog State for Stands Per Hectare
  const [standsDialogOpen, setStandsDialogOpen] = useState(false);
  const [editingStands, setEditingStands] = useState(null);
  const [standsFormData, setStandsFormData] = useState({
    standsPerHectareId: "",
    cropId: "",
    isState: false,
    distId: "",
    standsPerHectare: "",
    centPerTree: "",
    isActive: true
  });
  
  // Dialog State for Irrigation Source
  const [irrigationDialogOpen, setIrrigationDialogOpen] = useState(false);
  const [editingIrrigation, setEditingIrrigation] = useState(null);
  const [irrigationFormData, setIrrigationFormData] = useState({
    sourceId: "",
    irrigationType: "",
    irrigationCodeDes: "",
    isActive: true
  });

  // CCE Dialog State
const [cceDialogOpen, setCceDialogOpen] = useState(false);
const [editingCce, setEditingCce] = useState(null);
const [cceFormData, setCceFormData] = useState({
  cceId: "",
  cceCropType: "",
  noOfCce: "",
  selectionFromOutOfCluster: false,
  isCollectedRepeatedly: false,
  isRandomSelected: false,
  isTreeWiseCollection: false,
  isAlgorithmic: false,
  frameLength: "",
  frameWidth: "",
  cceVisitLimit: "",
  cropId: "",
  cceUnitId: "",
  frameUnitId: "",
  frameId: "",
  isActive: true
});

const validateIntegerField = (text, allowEmpty = true) => {
  if (allowEmpty && !text) return true;
  const numRegex = /^\d+$/;
  return numRegex.test(text);
};

const validateWordCount = (text, maxWords = 100) => {
  if (!text) return true; // Empty is allowed
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length <= maxWords;
};
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Validation error states
const [validationErrors, setValidationErrors] = useState({
  cropNameEn: "",
  cropNameMal: "",
  scientificName: "",
  unitName: "",
  irrigationType: ""
});

  // Fetch all crops and store them
  const fetchAllCrops = async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}/earas-form1-entry/api/master-crop/fetch-all?page=0&size=1000`;
      const response = await api.get(url);
      const data = response.data;
      
      let cropsArray = [];
      if (data && data.payload && data.payload.content) {
        cropsArray = data.payload.content;
      } else if (data && data.payload && Array.isArray(data.payload)) {
        cropsArray = data.payload;
      } else if (Array.isArray(data)) {
        cropsArray = data;
      }
      
      setAllCrops(cropsArray);
      applySearchAndPagination(cropsArray, searchTerm, page, rowsPerPage);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crops:", error);
      setSnackbar({ open: true, message: "Failed to load crops data", severity: "error" });
      setLoading(false);
    }
  };

  // Apply search filter and pagination
  const applySearchAndPagination = (cropsData, search, currentPage, pageSize) => {
    let filtered = cropsData;
    
    // Simple search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = cropsData.filter(crop => 
        (crop.cropNameEn && crop.cropNameEn.toLowerCase().includes(searchLower)) ||
        (crop.cropNameMal && crop.cropNameMal && crop.cropNameMal.toLowerCase().includes(searchLower)) ||
        (crop.scientificName && crop.scientificName.toLowerCase().includes(searchLower))
      );
    }
    
    setTotalCropsCount(filtered.length);
    
    // Apply pagination
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const paginatedData = filtered.slice(start, end);
    setCrops(paginatedData);
  };

  // Validation helper functions
const validateEnglishText = (text) => {
  if (!text) return true; // Empty is allowed
  // Allows English letters, spaces, hyphens, and parentheses
  const englishRegex = /^[A-Za-z\s\-\(\)]+$/;
  return englishRegex.test(text);
};

const validateMalayalamText = (text) => {
  if (!text) return true; // Empty is allowed
  // Malayalam Unicode range: U+0D00 to U+0D7F
  const malayalamRegex = /^[\u0D00-\u0D7F\s\-\(\)]+$/;
  return malayalamRegex.test(text);
};

const validateScientificName = (text) => {
  if (!text) return true; // Empty is allowed
  // Allows English letters, spaces, dots, parentheses, and numbers (for subspecies)
  const scientificRegex = /^[A-Za-z\s\.\(\)0-9]+$/;
  return scientificRegex.test(text);
};

const validateNumberField = (text) => {
  if (!text) return true; // Empty is allowed
  // Allows positive numbers with optional decimal
  const numberRegex = /^\d*\.?\d*$/;
  return numberRegex.test(text);
};

const validateTextFieldLength = (text, maxLength = 100) => {
  if (!text) return true;
  return text.length <= maxLength;
};

  // Handle search change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
    applySearchAndPagination(allCrops, value, 0, rowsPerPage);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    applySearchAndPagination(allCrops, searchTerm, newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    applySearchAndPagination(allCrops, searchTerm, 0, newRowsPerPage);
  };

  const fetchUnits = async () => {
    try {
      setUnitsLoading(true);
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-unit/fetch-all`);
      const data = response.data;
      
      let unitsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        unitsArray = data.payload;
      } else if (Array.isArray(data)) {
        unitsArray = data;
      }
      
      setUnits(unitsArray);
      setUnitsLoading(false);
    } catch (error) {
      console.error("Error fetching units:", error);
      setSnackbar({ open: true, message: "Failed to load units data", severity: "error" });
      setUnits([]);
      setUnitsLoading(false);
    }
  };

  const fetchStandsData = async () => {
    try {
      setStandsLoading(true);
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-stands-per-hectare/fetch-all`);
      const data = response.data;
      
      let standsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        standsArray = data.payload;
      } else if (Array.isArray(data)) {
        standsArray = data;
      }
      
      setStandsData(standsArray);
      setStandsLoading(false);
    } catch (error) {
      console.error("Error fetching stands data:", error);
      setSnackbar({ open: true, message: "Failed to load stands per hectare data", severity: "error" });
      setStandsData([]);
      setStandsLoading(false);
    }
  };

  // Updated fetchIrrigationData function - handles different status formats
const fetchIrrigationData = async () => {
  try {
    setIrrigationLoading(true);
    const response = await api.get(`${BASE_URL}/earas-form1-entry/irrigation-details/fetch-all-sources`);
    const data = response.data;
    
    let irrigationArray = [];
    if (data && data.payload && Array.isArray(data.payload)) {
      irrigationArray = data.payload;
    } else if (Array.isArray(data)) {
      irrigationArray = data;
    }
    
    // Normalize the isActive field to boolean
    const normalizedIrrigationArray = irrigationArray.map(item => ({
      ...item,
      isActive: normalizeActiveStatus(item.isActive || item.active || item.status)
    }));
    
    console.log("Normalized irrigation data:", normalizedIrrigationArray);
    
    setIrrigationData(normalizedIrrigationArray);
    setIrrigationLoading(false);
  } catch (error) {
    console.error("Error fetching irrigation data:", error);
    setSnackbar({ open: true, message: "Failed to load irrigation sources data", severity: "error" });
    setIrrigationData([]);
    setIrrigationLoading(false);
  }
};

const fetchCceCrops = async () => {
  try {
    setCceLoading(true);
    const response = await api.get(`${BASE_URL}/earas-form1-entry/cce-crop-details/master-cce-crops/fetch-all`);
    const data = response.data;
    
    let cceArray = [];
    if (data && data.payload && Array.isArray(data.payload)) {
      cceArray = data.payload;
    } else if (Array.isArray(data)) {
      cceArray = data;
    }
    
    setCceCrops(cceArray);
    setCceLoading(false);
  } catch (error) {
    console.error("Error fetching CCE crops:", error);
    setSnackbar({ open: true, message: "Failed to load CCE crops data", severity: "error" });
    setCceCrops([]);
    setCceLoading(false);
  }
};

// Fetch Frames
const fetchFrames = async () => {
  try {
    setLoadingFrames(true);
    const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-frame/fetch-all`);
    const data = response.data;
    
    let framesArray = [];
    if (data && data.payload && Array.isArray(data.payload)) {
      framesArray = data.payload;
    } else if (Array.isArray(data)) {
      framesArray = data;
    }
    
    setFrames(framesArray);
    setLoadingFrames(false);
  } catch (error) {
    console.error("Error fetching frames:", error);
    setFrames([]);
    setLoadingFrames(false);
  }
};

// Helper function to normalize active status from various formats
const normalizeActiveStatus = (status) => {
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status === 1;
  if (typeof status === 'string') {
    const upperStatus = status.toUpperCase();
    return upperStatus === 'ACTIVE' || upperStatus === 'TRUE' || upperStatus === 'YES' || upperStatus === '1';
  }
  return false; // Default to false if unknown
};

  const fetchCropGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-crop-group/fetch-all`);
      const data = response.data;
      
      let groupsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        groupsArray = data.payload;
      } else if (Array.isArray(data)) {
        groupsArray = data;
      }
      
      setCropGroups(groupsArray);
      setLoadingGroups(false);
    } catch (error) {
      console.error("Error fetching crop groups:", error);
      setCropGroups([]);
      setLoadingGroups(false);
    }
  };

  const fetchCropTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-crop-type/fetch-all`);
      const data = response.data;
      
      let typesArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        typesArray = data.payload;
      } else if (Array.isArray(data)) {
        typesArray = data;
      }
      
      setCropTypes(typesArray);
      setLoadingTypes(false);
    } catch (error) {
      console.error("Error fetching crop types:", error);
      setCropTypes([]);
      setLoadingTypes(false);
    }
  };

  const fetchUnitsList = async () => {
    try {
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-unit/fetch-all`);
      const data = response.data;
      
      let unitsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        unitsArray = data.payload;
      } else if (Array.isArray(data)) {
        unitsArray = data;
      }
      setUnitsList(unitsArray);
    } catch (error) {
      console.error("Error fetching units list:", error);
      setUnitsList([]);
    }
  };

  const fetchDistricts = async () => {
    try {
      setLoadingDistricts(true);
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-district/fetch-all`);
      const data = response.data;
      
      let districtsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        districtsArray = data.payload;
      } else if (Array.isArray(data)) {
        districtsArray = data;
      }
      
      setDistricts(districtsArray);
      setLoadingDistricts(false);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
      setLoadingDistricts(false);
    }
  };

  useEffect(() => {
    fetchAllCrops();
    fetchUnits();
    fetchStandsData();
    fetchIrrigationData();
    fetchCropGroups();
    fetchCropTypes();
    fetchUnitsList();
    fetchDistricts();
    fetchCceCrops();
  fetchFrames();
  }, []);

  // Add Crop Handler
  const handleAddCrop = () => {
    fetchCropGroups();
    fetchCropTypes();
    fetchUnitsList();
    
    setNewCropFormData({
      cropNameEn: "",
      cropNameMal: "",
      isActive: true,
      scientificName: "",
      isHorti: false,
      cropGroupId: "",
      cropClassGroupId: "",
      hortiGroupId: "",
      cropTypeId: "",
      unitId: ""
    });
    setAddCropDialogOpen(true);
  };

  const handleSaveNewCrop = async () => {
    if (!newCropFormData.cropNameEn.trim()) {
      setSnackbar({ open: true, message: "Crop name is required", severity: "warning" });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-crop/add`, {
        cropNameEn: newCropFormData.cropNameEn,
        cropNameMal: newCropFormData.cropNameMal,
        isActive: newCropFormData.isActive,
        scientificName: newCropFormData.scientificName,
        isHorti: newCropFormData.isHorti,
        cropGroupId: newCropFormData.cropGroupId ? parseInt(newCropFormData.cropGroupId) : null,
        cropClassGroupId: newCropFormData.cropClassGroupId ? parseInt(newCropFormData.cropClassGroupId) : null,
        hortiGroupId: newCropFormData.hortiGroupId ? parseInt(newCropFormData.hortiGroupId) : null,
        cropTypeId: newCropFormData.cropTypeId ? parseInt(newCropFormData.cropTypeId) : null,
        unitId: newCropFormData.unitId ? parseInt(newCropFormData.unitId) : null
      });
      
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: "Crop added successfully", severity: "success" });
        setAddCropDialogOpen(false);
        fetchAllCrops(); // Refresh the list
      } else {
        throw new Error("Failed to add crop");
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      setSnackbar({ open: true, message: "Failed to add crop", severity: "error" });
    }
  };

  // Edit Crop Handler
  const handleEditCrop = (crop) => {
    fetchCropGroups();
    fetchCropTypes();
    fetchUnitsList();

    // Clear validation errors when opening edit dialog
  setValidationErrors({
    cropNameEn: "",
    cropNameMal: "",
    scientificName: "",
    unitName: "",
    irrigationType: ""
  });
    
    setEditingCrop(crop);
    setEditCropFormData({
      cropId: crop.cropId || "",
      cropNameEn: crop.cropNameEn || "",
      cropNameMal: crop.cropNameMal || "",
      isActive: crop.isActive !== undefined ? crop.isActive : true,
      scientificName: crop.scientificName || "",
      isHorti: crop.isHorti || false,
      cropGroupId: crop.cropGroupId || "",
      cropClassGroupId: crop.cropClassGroupId || "",
      hortiGroupId: crop.hortiGroupId || "",
      cropTypeId: crop.cropTypeId || "",
      unitId: crop.unitId || ""
    });
    setEditCropDialogOpen(true);
  };

  const handleUpdateCrop = async () => {
    if (!editCropFormData.cropNameEn.trim()) {
      setSnackbar({ open: true, message: "Crop name is required", severity: "warning" });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-crop/add`, {
        cropId: editCropFormData.cropId,
        cropNameEn: editCropFormData.cropNameEn,
        cropNameMal: editCropFormData.cropNameMal,
        isActive: editCropFormData.isActive,
        scientificName: editCropFormData.scientificName,
        isHorti: editCropFormData.isHorti,
        cropGroupId: editCropFormData.cropGroupId ? parseInt(editCropFormData.cropGroupId) : null,
        cropClassGroupId: editCropFormData.cropClassGroupId ? parseInt(editCropFormData.cropClassGroupId) : null,
        hortiGroupId: editCropFormData.hortiGroupId ? parseInt(editCropFormData.hortiGroupId) : null,
        cropTypeId: editCropFormData.cropTypeId ? parseInt(editCropFormData.cropTypeId) : null,
        unitId: editCropFormData.unitId ? parseInt(editCropFormData.unitId) : null
      });
      
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: "Crop updated successfully", severity: "success" });
        setEditCropDialogOpen(false);
        fetchAllCrops(); // Refresh the list
      } else {
        throw new Error("Failed to update crop");
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      setSnackbar({ open: true, message: "Failed to update crop", severity: "error" });
    }
  };

  // Unit CRUD Operations
  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitFormData({ unitName: "", isActive: true });
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      unitId: unit.unitId || "",
      unitName: unit.unitName || "",
      isActive: unit.isActive !== undefined ? unit.isActive : true
    });
    setUnitDialogOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!unitFormData.unitName.trim()) {
      setSnackbar({ open: true, message: "Unit name is required", severity: "warning" });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-unit/add`, unitFormData);
      
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: editingUnit ? "Unit updated successfully" : "Unit added successfully", severity: "success" });
        setUnitDialogOpen(false);
        fetchUnits();
        fetchUnitsList();
      } else {
        throw new Error("Failed to save unit");
      }
    } catch (error) {
      console.error("Error saving unit:", error);
      setSnackbar({ open: true, message: "Failed to save unit", severity: "error" });
    }
  };

  // Stands Per Hectare CRUD Operations
  const handleAddStands = () => {
    fetchDistricts();
    setEditingStands(null);
    setStandsFormData({
      cropId: "",
      isState: false,
      distId: "",
      standsPerHectare: "",
      centPerTree: "",
      isActive: true
    });
    setStandsDialogOpen(true);
  };

  const handleEditStands = (stand) => {
    setEditingStands(stand);
    setStandsFormData({
      standsPerHectareId: stand.standsPerHectareId || "",
      cropId: stand.cropId || "",
      isState: stand.isState || false,
      distId: stand.distId || "",
      standsPerHectare: stand.standsPerHectare || "",
      centPerTree: stand.centPerTree || "",
      isActive: stand.isActive !== undefined ? stand.isActive : true
    });
    setStandsDialogOpen(true);
  };

  const handleSaveStands = async () => {
    if (!standsFormData.cropId || !standsFormData.standsPerHectare) {
      setSnackbar({ open: true, message: "Crop and Stands Per Hectare are required", severity: "warning" });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-stands-per-hectare/add`, standsFormData);
      
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: editingStands ? "Stands data updated successfully" : "Stands data added successfully", severity: "success" });
        setStandsDialogOpen(false);
        fetchStandsData();
      } else {
        throw new Error("Failed to save stands data");
      }
    } catch (error) {
      console.error("Error saving stands data:", error);
      setSnackbar({ open: true, message: "Failed to save stands data", severity: "error" });
    }
  };

  // Irrigation Sources CRUD Operations
  const handleAddIrrigation = () => {
    setEditingIrrigation(null);
    setIrrigationFormData({
      irrigationType: "",
      irrigationCodeDes: "",
      isActive: true
    });
    setIrrigationDialogOpen(true);
  };

  const handleEditIrrigation = (irrigation) => {
    setEditingIrrigation(irrigation);
    setIrrigationFormData({
      sourceId: irrigation.sourceId || "",
      irrigationType: irrigation.irrigationType || "",
      irrigationCodeDes: irrigation.irrigationCodeDes || "",
      isActive: irrigation.isActive !== undefined ? irrigation.isActive : true
    });
    setIrrigationDialogOpen(true);
  };

  const handleSaveIrrigation = async () => {
  if (!irrigationFormData.irrigationType.trim()) {
    setSnackbar({ open: true, message: "Irrigation type is required", severity: "warning" });
    return;
  }

  try {
    // Ensure isActive is sent as boolean
    const payload = {
      ...irrigationFormData,
      isActive: irrigationFormData.isActive === true || irrigationFormData.isActive === "true" || irrigationFormData.isActive === 1
    };
    
    const response = await api.post(`${BASE_URL}/earas-form1-entry/irrigation-details/master-irrigation-source/add`, payload);
    
    if (response.status === 200 || response.status === 201) {
      setSnackbar({ open: true, message: editingIrrigation ? "Irrigation source updated successfully" : "Irrigation source added successfully", severity: "success" });
      setIrrigationDialogOpen(false);
      fetchIrrigationData(); // Refresh the list
    } else {
      throw new Error("Failed to save irrigation source");
    }
  } catch (error) {
    console.error("Error saving irrigation source:", error);
    setSnackbar({ open: true, message: "Failed to save irrigation source", severity: "error" });
  }
};

// CCE Crop CRUD Operations
const handleAddCce = () => {
  fetchCropGroups();
  fetchUnitsList();
  fetchFrames();
  
  setEditingCce(null);
  setCceFormData({
    cceId: "",
    cceCropType: "",
    noOfCce: "",
    selectionFromOutOfCluster: false,
    isCollectedRepeatedly: false,
    isRandomSelected: false,
    isTreeWiseCollection: false,
    isAlgorithmic: false,
    frameLength: "",
    frameWidth: "",
    cceVisitLimit: "",
    cropId: "",
    cceUnitId: "",
    frameUnitId: "",
    frameId: "",
    isActive: true
  });
  setCceDialogOpen(true);
};

const handleEditCce = (cce) => {
  fetchCropGroups();
  fetchUnitsList();
  fetchFrames();
  
  setEditingCce(cce);
  setCceFormData({
    cceId: cce.cceId || "",
    cceCropType: cce.cceCropType || "",
    noOfCce: cce.noOfCce || "",
    selectionFromOutOfCluster: cce.selectionFromOutOfCluster || false,
    isCollectedRepeatedly: cce.isCollectedRepeatedly || false,
    isRandomSelected: cce.isRandomSelected || false,
    isTreeWiseCollection: cce.isTreeWiseCollection || false,
    isAlgorithmic: cce.isAlgorithmic || false,
    frameLength: cce.frameLength || "",
    frameWidth: cce.frameWidth || "",
    cceVisitLimit: cce.cceVisitLimit || "",
    cropId: cce.cropId || "",
    cceUnitId: cce.unitId || "",
    frameUnitId: cce.frameUnitId || "",
    frameId: cce.frameId || "",
    isActive: cce.isActive !== undefined ? cce.isActive : true
  });
  setCceDialogOpen(true);
};

const handleSaveCce = async () => {
  if (!cceFormData.cceCropType.trim()) {
    setSnackbar({ open: true, message: "CCE Crop Type is required", severity: "warning" });
    return;
  }
  
  if (!cceFormData.cropId) {
    setSnackbar({ open: true, message: "Please select a crop", severity: "warning" });
    return;
  }

  try {
    const payload = {
      ...cceFormData,
      noOfCce: cceFormData.noOfCce ? parseInt(cceFormData.noOfCce) : null,
      frameLength: cceFormData.frameLength ? parseInt(cceFormData.frameLength) : null,
      frameWidth: cceFormData.frameWidth ? parseInt(cceFormData.frameWidth) : null,
      cceVisitLimit: cceFormData.cceVisitLimit ? parseInt(cceFormData.cceVisitLimit) : null,
      cropId: parseInt(cceFormData.cropId),
      cceUnitId: cceFormData.cceUnitId ? parseInt(cceFormData.cceUnitId) : null,
      frameUnitId: cceFormData.frameUnitId ? parseInt(cceFormData.frameUnitId) : null,
      frameId: cceFormData.frameId ? parseInt(cceFormData.frameId) : null
    };
    
    const response = await api.post(`${BASE_URL}/earas-form1-entry/cce-crop-details/master-cce-crop/add`, payload);
    
    if (response.status === 200 || response.status === 201) {
      setSnackbar({ open: true, message: editingCce ? "CCE Crop updated successfully" : "CCE Crop added successfully", severity: "success" });
      setCceDialogOpen(false);
      fetchCceCrops(); // Refresh the list
    } else {
      throw new Error("Failed to save CCE crop");
    }
  } catch (error) {
    console.error("Error saving CCE crop:", error);
    setSnackbar({ open: true, message: "Failed to save CCE crop", severity: "error" });
  }
};

// Add filter function for CCE
const getFilteredCce = () => {
  if (!Array.isArray(cceCrops) || cceCrops.length === 0) return [];
  if (!cceSearchTerm.trim()) return cceCrops;
  const searchLower = cceSearchTerm.toLowerCase();
  return cceCrops.filter((cce) =>
    (cce.cceCropType && cce.cceCropType.toLowerCase().includes(searchLower)) ||
    (cce.cropNameEn && cce.cropNameEn.toLowerCase().includes(searchLower))
  );
};

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sorting functions
  const sortData = (array, comparator) => {
    if (!Array.isArray(array) || array.length === 0) return [];
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (!a || !b) return 0;
    let aValue = a[orderBy];
    let bValue = b[orderBy];
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    if (bValue < aValue) return -1;
    if (bValue > aValue) return 1;
    return 0;
  };

  // Filter functions for other tabs
  const getFilteredUnits = () => {
    if (!Array.isArray(units) || units.length === 0) return [];
    if (!unitsSearchTerm.trim()) return units;
    const searchLower = unitsSearchTerm.toLowerCase();
    return units.filter((unit) =>
      unit.unitName && unit.unitName.toLowerCase().includes(searchLower)
    );
  };

  const getFilteredStands = () => {
    if (!Array.isArray(standsData) || standsData.length === 0) return [];
    if (!standsSearchTerm.trim()) return standsData;
    const searchLower = standsSearchTerm.toLowerCase();
    return standsData.filter((stand) => {
      const crop = allCrops.find(c => c.cropId === stand.cropId);
      return (crop && crop.cropNameEn && crop.cropNameEn.toLowerCase().includes(searchLower)) ||
             (stand.standsPerHectare && stand.standsPerHectare.toString().includes(searchLower));
    });
  };

  const getFilteredIrrigation = () => {
    if (!Array.isArray(irrigationData) || irrigationData.length === 0) return [];
    let activeSources = irrigationData.filter(irr => irr.isActive === true);
    if (!irrigationSearchTerm.trim()) return activeSources;
  const searchLower = irrigationSearchTerm.toLowerCase();
  return activeSources.filter((irr) =>
    irr.irrigationType && irr.irrigationType.toLowerCase().includes(searchLower)
  );
};

  const sortedCrops = sortData(crops, getComparator(order, orderBy));
  const displayCrops = sortedCrops;

  const filteredUnits = getFilteredUnits();
  const sortedUnits = sortData(filteredUnits, getComparator(unitsOrder, unitsOrderBy));
  const paginatedUnits = sortedUnits.slice(unitsPage * unitsRowsPerPage, unitsPage * unitsRowsPerPage + unitsRowsPerPage);

  const filteredStands = getFilteredStands();
  const sortedStands = sortData(filteredStands, getComparator(standsOrder, standsOrderBy));
  const paginatedStands = sortedStands.slice(standsPage * standsRowsPerPage, standsPage * standsRowsPerPage + standsRowsPerPage);

  const filteredIrrigation = getFilteredIrrigation();
  const sortedIrrigation = sortData(filteredIrrigation, getComparator(irrigationOrder, irrigationOrderBy));
  const paginatedIrrigation = sortedIrrigation.slice(irrigationPage * irrigationRowsPerPage, irrigationPage * irrigationRowsPerPage + irrigationRowsPerPage);

  const filteredCce = getFilteredCce();
const sortedCce = sortData(filteredCce, getComparator(cceOrder, cceOrderBy));
const paginatedCce = sortedCce.slice(ccePage * cceRowsPerPage, ccePage * cceRowsPerPage + cceRowsPerPage);
  // Table columns
  const cropColumns = [
    { id: "slNo", label: "SL No", minWidth: 70, sortable: false },
    { id: "cropNameEn", label: "Crop Name (English)", minWidth: 180 },
    { id: "cropNameMal", label: "Crop Name (Malayalam)", minWidth: 180 },
    { id: "scientificName", label: "Scientific Name", minWidth: 180 },
    { id: "isHorti", label: "Horticulture", minWidth: 100 },
    { id: "groupName", label: "Crop Group", minWidth: 130 },
    { id: "classGroupName", label: "Crop Class Group", minWidth: 140 },
    { id: "hortiGroupName", label: "Horti Group", minWidth: 130 },
    { id: "cropType", label: "Crop Type", minWidth: 120 },
    { id: "unitName", label: "Unit", minWidth: 100 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const unitColumns = [
    { id: "slNo", label: "SL No", minWidth: 70, sortable: false },
    { id: "unitName", label: "Unit Name", minWidth: 250 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const standsColumns = [
    { id: "slNo", label: "SL No", minWidth: 70, sortable: false },
    { id: "cropName", label: "Crop Name", minWidth: 180 },
    { id: "isState", label: "Level", minWidth: 100 },
    { id: "districtName", label: "District Name", minWidth: 150 },
    { id: "standsPerHectare", label: "Stands/Hectare", minWidth: 130 },
    { id: "centPerTree", label: "Cent/Tree", minWidth: 100 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const irrigationColumns = [
    { id: "slNo", label: "SL No", minWidth: 70, sortable: false },
    { id: "irrigationType", label: "Irrigation Type", minWidth: 250 },
    { id: "irrigationCodeDes", label: "Irrigation Code", minWidth: 150 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

const cceColumns = [
  { id: "slNo", label: "SL No", minWidth: 70, sortable: false },
  { id: "cceCropType", label: "CCE Crop Type", minWidth: 180 },
  { id: "cropName", label: "Crop Name", minWidth: 180 },
  { id: "noOfCce", label: "No. of CCE", minWidth: 120 },
  { id: "frameDetails", label: "Frame Details", minWidth: 150 },
  { id: "frameMeasurements", label: "Frame Measurements", minWidth: 150 },
  { id: "cceVisitLimit", label: "CCE Visit Limit", minWidth: 120 },
  { id: "collectionSettings", label: "Collection Settings", minWidth: 180 },
  { id: "isActive", label: "Status", minWidth: 100 },
  { id: "actions", label: "Actions", minWidth: 100, sortable: false }
];

  const handleRequestSort = (property, type) => {
    if (type === 'crops') {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    } else if (type === 'units') {
      const isAsc = unitsOrderBy === property && unitsOrder === "asc";
      setUnitsOrder(isAsc ? "desc" : "asc");
      setUnitsOrderBy(property);
    } else if (type === 'stands') {
      const isAsc = standsOrderBy === property && standsOrder === "asc";
      setStandsOrder(isAsc ? "desc" : "asc");
      setStandsOrderBy(property);
    } else if (type === 'irrigation') {
      const isAsc = irrigationOrderBy === property && irrigationOrder === "asc";
      setIrrigationOrder(isAsc ? "desc" : "asc");
      setIrrigationOrderBy(property);
    }else if (type === 'cce') {  // Add this block
    const isAsc = cceOrderBy === property && cceOrder === "asc";
    setCceOrder(isAsc ? "desc" : "asc");
    setCceOrderBy(property);
  }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
       <Typography variant="h3" sx={{ marginBottom: 2 }}>
                Crops Settings
              </Typography>
        <Box >
          <Paper sx={{ p: 4, mb: 4, boxShadow: 6, borderRadius: 3 }}>
         
            
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Crop Management" />
              <Tab label="Unit Management" />
              <Tab label="Stands Per Hectare Management" />
              <Tab label="Irrigation Source Management" />
              <Tab label="CCE Crops Management" />
            </Tabs>

            {/* Crops Tab */}
            {activeTab === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    placeholder="Search by crop name, scientific name..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ width: '350px' }}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCrop}
                    sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: '#04205a' } }}
                  >
                    Add Crop
                  </Button>
                </Box>

                {/* Show search results info */}
                {searchTerm && !loading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Showing results for: <strong>"{searchTerm}"</strong> ({totalCropsCount} crops found)
                    </Typography>
                  </Box>
                )}

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {cropColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (
                              <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : "asc"} onClick={() => handleRequestSort(column.id, 'crops')} sx={{ color: "white" }}>
                                {column.label}
                              </TableSortLabel>
                            ) : (column.label)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={cropColumns.length} align="center"><CircularProgress /></TableCell></TableRow>
                      ) : displayCrops.length === 0 ? (
                        <TableRow><TableCell colSpan={cropColumns.length} align="center">
                          {searchTerm ? "No matching crops found" : "No crops available"}
                        </TableCell></TableRow>
                      ) : (
                        displayCrops
                        .filter(crop => crop.isActive === true)
                        .map((crop, index) => (
                          <TableRow hover key={crop.cropId}>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{crop.cropNameEn}</TableCell>
                            <TableCell>{crop.cropNameMal || "-"}</TableCell>
                            <TableCell>{crop.scientificName || "-"}</TableCell>
                            <TableCell><Chip label={crop.isHorti ? "Yes" : "No"} color={crop.isHorti ? "success" : "default"} size="small" /></TableCell>
                            <TableCell>{crop.groupName || "-"}</TableCell>
                            <TableCell>{crop.classGroupName || "-"}</TableCell>
                            <TableCell>{crop.hortiGroupName || "-"}</TableCell>
                            <TableCell>{crop.cropType || "-"}</TableCell>
                            <TableCell>{crop.unitName || "-"}</TableCell>
                            <TableCell><Chip label={crop.isActive ? "Active" : "Inactive"} color={crop.isActive ? "success" : "default"} size="small" /></TableCell>
                            <TableCell><IconButton size="small" onClick={() => handleEditCrop(crop)} color="primary"><EditIcon /></IconButton></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {!loading && totalCropsCount > 0 && (
                  <TablePagination 
                    rowsPerPageOptions={[5, 10, 25, 50]} 
                    component="div" 
                    count={totalCropsCount} 
                    rowsPerPage={rowsPerPage} 
                    page={page} 
                    onPageChange={handleChangePage} 
                    onRowsPerPageChange={handleChangeRowsPerPage} 
                    labelRowsPerPage="Rows per page:" 
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`} 
                    sx={{ mt: 2 }} 
                  />
                )}
              </>
            )}

            {/* Units Tab */}
            {activeTab === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <TextField variant="outlined" size="small" placeholder="Search units..." value={unitsSearchTerm} onChange={(e) => { setUnitsSearchTerm(e.target.value); setUnitsPage(0); }} sx={{ width: '300px' }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchUnits}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUnit} sx={{ backgroundColor: themeColor }}>Add Unit</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {unitColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel active={unitsOrderBy === column.id} direction={unitsOrderBy === column.id ? unitsOrder : "asc"} onClick={() => handleRequestSort(column.id, 'units')} sx={{ color: "white" }}>{column.label}</TableSortLabel>) : (column.label)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unitsLoading ? (
                        <TableRow><TableCell colSpan={unitColumns.length} align="center"><CircularProgress /></TableCell></TableRow>
                      ) : paginatedUnits.length === 0 ? (
                        <TableRow><TableCell colSpan={unitColumns.length} align="center">No units available</TableCell></TableRow>
                      ) : (
                        paginatedUnits.map((unit, index) => (
                          <TableRow hover key={unit.unitId}>
                            <TableCell>{unitsPage * unitsRowsPerPage + index + 1}</TableCell>
                            <TableCell>{unit.unitName}</TableCell>
                            <TableCell><Chip label={unit.isActive ? "Active" : "Inactive"} color={unit.isActive ? "success" : "default"} size="small" /></TableCell>
                            <TableCell><IconButton size="small" onClick={() => handleEditUnit(unit)} color="primary"><EditIcon /></IconButton></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!unitsLoading && sortedUnits.length > 0 && (<TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedUnits.length} rowsPerPage={unitsRowsPerPage} page={unitsPage} onPageChange={(e, p) => setUnitsPage(p)} onRowsPerPageChange={(e) => { setUnitsRowsPerPage(parseInt(e.target.value, 10)); setUnitsPage(0); }} sx={{ mt: 2 }} />)}
              </>
            )}

            {/* Stands Per Hectare Tab */}
            {activeTab === 2 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <TextField variant="outlined" size="small" placeholder="Search by crop or stands..." value={standsSearchTerm} onChange={(e) => { setStandsSearchTerm(e.target.value); setStandsPage(0); }} sx={{ width: '300px' }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchStandsData}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStands} sx={{ backgroundColor: themeColor }}>Add Stands Data</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {standsColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel active={standsOrderBy === column.id} direction={standsOrderBy === column.id ? standsOrder : "asc"} onClick={() => handleRequestSort(column.id, 'stands')} sx={{ color: "white" }}>{column.label}</TableSortLabel>) : (column.label)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {standsLoading ? (
                        <TableRow><TableCell colSpan={standsColumns.length} align="center"><CircularProgress /></TableCell></TableRow>
                      ) : paginatedStands.length === 0 ? (
                        <TableRow><TableCell colSpan={standsColumns.length} align="center">No stands data available</TableCell></TableRow>
                      ) : (
                        paginatedStands.map((stand, index) => {
                          const crop = allCrops.find(c => c.cropId === stand.cropId);
                          const district = districts.find(d => (d.districtId || d.distId) === stand.distId);
                          return (
                            <TableRow hover key={stand.standsPerHectareId}>
                              <TableCell>{standsPage * standsRowsPerPage + index + 1}</TableCell>
                              <TableCell>{crop ? crop.cropNameEn : "-"}</TableCell>
                              <TableCell><Chip label={stand.isState ? "State" : "District"} color={stand.isState ? "primary" : "default"} size="small" /></TableCell>
                              <TableCell>{stand.isState ? "All Districts" : (district ? (district.districtName || district.distNameEn) : "-")}</TableCell>
                              <TableCell>{stand.standsPerHectare}</TableCell>
                              <TableCell>{stand.centPerTree || "-"}</TableCell>
                              <TableCell><Chip label={stand.isActive ? "Active" : "Inactive"} color={stand.isActive ? "success" : "default"} size="small" /></TableCell>
                              <TableCell><IconButton size="small" onClick={() => handleEditStands(stand)} color="primary"><EditIcon /></IconButton></TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!standsLoading && sortedStands.length > 0 && (<TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedStands.length} rowsPerPage={standsRowsPerPage} page={standsPage} onPageChange={(e, p) => setStandsPage(p)} onRowsPerPageChange={(e) => { setStandsRowsPerPage(parseInt(e.target.value, 10)); setStandsPage(0); }} sx={{ mt: 2 }} />)}
              </>
            )}

            {/* Irrigation Sources Tab */}
            {activeTab === 3 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <TextField variant="outlined" size="small" placeholder="Search irrigation type..." value={irrigationSearchTerm} onChange={(e) => { setIrrigationSearchTerm(e.target.value); setIrrigationPage(0); }} sx={{ width: '300px' }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchIrrigationData}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddIrrigation} sx={{ backgroundColor: themeColor }}>Add Irrigation Source</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {irrigationColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel active={irrigationOrderBy === column.id} direction={irrigationOrderBy === column.id ? irrigationOrder : "asc"} onClick={() => handleRequestSort(column.id, 'irrigation')} sx={{ color: "white" }}>{column.label}</TableSortLabel>) : (column.label)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irrigationLoading ? (
                        <TableRow><TableCell colSpan={irrigationColumns.length} align="center"><CircularProgress /></TableCell></TableRow>
                      ) : paginatedIrrigation.length === 0 ? (
                        <TableRow><TableCell colSpan={irrigationColumns.length} align="center">No irrigation sources available</TableCell></TableRow>
                      ) : (
                        paginatedIrrigation.map((irr, index) => (
                          <TableRow hover key={irr.sourceId}>
                            <TableCell>{irrigationPage * irrigationRowsPerPage + index + 1}</TableCell>
                            <TableCell>{irr.irrigationType}</TableCell>
                            <TableCell>{irr.irrigationCodeDes || "-"}</TableCell>
                            <TableCell><Chip label={irr.isActive ? "Active" : "Inactive"} color={irr.isActive ? "success" : "default"} size="small" /></TableCell>
                            <TableCell><IconButton size="small" onClick={() => handleEditIrrigation(irr)} color="primary"><EditIcon /></IconButton></TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!irrigationLoading && sortedIrrigation.length > 0 && (<TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedIrrigation.length} rowsPerPage={irrigationRowsPerPage} page={irrigationPage} onPageChange={(e, p) => setIrrigationPage(p)} onRowsPerPageChange={(e) => { setIrrigationRowsPerPage(parseInt(e.target.value, 10)); setIrrigationPage(0); }} sx={{ mt: 2 }} />)}
              </>
            )}

            {activeTab === 4 && (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <TextField 
        variant="outlined" 
        size="small" 
        placeholder="Search by CCE crop type or crop name..." 
        value={cceSearchTerm} 
        onChange={(e) => { 
          setCceSearchTerm(e.target.value); 
          setCcePage(0); 
        }} 
        sx={{ width: '350px' }} 
        InputProps={{ 
          startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) 
        }} 
      />
      <Box>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchCceCrops}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddCce} 
          sx={{ backgroundColor: themeColor, ml: 1 }}
        >
          Add CCE Crop
        </Button>
      </Box>
    </Box>

    <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {cceColumns.map((column) => (
              <TableCell 
                key={column.id} 
                style={{ 
                  minWidth: column.minWidth, 
                  backgroundColor: themeColor, 
                  color: "white", 
                  fontWeight: "bold" 
                }}
              >
                {column.sortable !== false ? (
                  <TableSortLabel 
                    active={cceOrderBy === column.id} 
                    direction={cceOrderBy === column.id ? cceOrder : "asc"} 
                    onClick={() => handleRequestSort(column.id, 'cce')} 
                    sx={{ color: "white" }}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
  {cceLoading ? (
    <TableRow>
      <TableCell colSpan={cceColumns.length} align="center">
        <CircularProgress />
      </TableCell>
    </TableRow>
  ) : paginatedCce.length === 0 ? (
    <TableRow>
      <TableCell colSpan={cceColumns.length} align="center">
        No CCE crops available
      </TableCell>
    </TableRow>
  ) : (
    paginatedCce
    .map((cce, index) => (
      <TableRow hover key={cce.cceId}>
        <TableCell>{ccePage * cceRowsPerPage + index + 1}</TableCell>
        <TableCell>{cce.cceCropType}</TableCell>
        <TableCell>{cce.cropNameEn || "-"}</TableCell>
        <TableCell>{cce.noOfCce || "-"}</TableCell>
        <TableCell>
          {cce.frameName ? `${cce.frameName}` : "-"}
          {cce.unitName && ` (${cce.unitName})`}
        </TableCell>
        <TableCell>
          {cce.frameLength && cce.frameWidth 
            ? `${cce.frameLength} x ${cce.frameWidth} ${cce.frameUnitName || ''}`
            : "-"}
        </TableCell>
        <TableCell>{cce.cceVisitLimit || "-"}</TableCell>
        <TableCell>
          <Grid container spacing={1} sx={{ minWidth: 200 }}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {cce.isCollectedRepeatedly ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CancelIcon color="error" fontSize="small" />
                )}
                <Typography variant="caption">Repeated</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {cce.isRandomSelected ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CancelIcon color="error" fontSize="small" />
                )}
                <Typography variant="caption">Random</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {cce.isTreeWiseCollection ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CancelIcon color="error" fontSize="small" />
                )}
                <Typography variant="caption">Tree Wise</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {cce.isAlgorithmic ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CancelIcon color="error" fontSize="small" />
                )}
                <Typography variant="caption">Algorithmic</Typography>
              </Box>
            </Grid>
            {cce.selectionFromOutOfCluster && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="caption">Selection From Out of Cluster</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </TableCell>
        <TableCell>
          <Chip 
            label={cce.isActive ? "Active" : "Inactive"} 
            color={cce.isActive ? "success" : "default"} 
            size="small" 
          />
        </TableCell>
        <TableCell>
          <IconButton size="small" onClick={() => handleEditCce(cce)} color="primary">
            <EditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
      </Table>
    </TableContainer>
    
    {!cceLoading && sortedCce.length > 0 && (
      <TablePagination 
        rowsPerPageOptions={[5, 10, 25, 50]} 
        component="div" 
        count={sortedCce.length} 
        rowsPerPage={cceRowsPerPage} 
        page={ccePage} 
        onPageChange={(e, p) => setCcePage(p)} 
        onRowsPerPageChange={(e) => { 
          setCceRowsPerPage(parseInt(e.target.value, 10)); 
          setCcePage(0); 
        }} 
        sx={{ mt: 2 }} 
      />
    )}
  </>
)}
          </Paper>
        </Box>
      </Grid>

      {/* Add Crop Dialog */}
      <Dialog open={addCropDialogOpen} onClose={() => setAddCropDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
  Add New Crop
</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
<Grid item xs={12} sm={6}>
  <TextField 
    label="Crop Name (English)" 
    fullWidth 
    required 
    value={newCropFormData.cropNameEn} 
    onChange={(e) => {
  const value = e.target.value;
  if (validateEnglishText(value) && validateWordCount(value, 100)) {
    setNewCropFormData({ ...newCropFormData, cropNameEn: value });
    setValidationErrors({ ...validationErrors, cropNameEn: "" });
  } else if (!validateEnglishText(value)) {
    setValidationErrors({ ...validationErrors, cropNameEn: "Only English alphabets allowed" });
  } else if (!validateWordCount(value, 100)) {
    setValidationErrors({ ...validationErrors, cropNameEn: "Maximum 100 words allowed" });
  }
}}
    error={!!validationErrors.cropNameEn}
    helperText={validationErrors.cropNameEn}
    inputProps={{ maxLength: 100 }}
  />
</Grid>

<Grid item xs={12} sm={6}>
  <TextField 
    label="Crop Name (Malayalam)" 
    fullWidth 
    value={newCropFormData.cropNameMal} 
    onChange={(e) => {
  const value = e.target.value;
  if (validateMalayalamText(value) && validateWordCount(value, 100)) {
    setNewCropFormData({ ...newCropFormData, cropNameMal: value });
    setValidationErrors({ ...validationErrors, cropNameMal: "" });
  } else if (!validateMalayalamText(value)) {
    setValidationErrors({ ...validationErrors, cropNameMal: "Only Malayalam characters allowed" });
  } else if (!validateWordCount(value, 100)) {
    setValidationErrors({ ...validationErrors, cropNameMal: "Maximum 100 words allowed" });
  }
}}
    error={!!validationErrors.cropNameMal}
    helperText={validationErrors.cropNameMal}
    inputProps={{ maxLength: 100 }}
  />
</Grid>

<Grid item xs={12} sm={6}>
  <TextField 
    label="Scientific Name" 
    fullWidth 
    value={newCropFormData.scientificName} 
    onChange={(e) => {
  const value = e.target.value;
  if (validateScientificName(value) && validateWordCount(value, 100)) {
    setNewCropFormData({ ...newCropFormData, scientificName: value });
    setValidationErrors({ ...validationErrors, scientificName: "" });
  } else if (!validateScientificName(value)) {
    setValidationErrors({ ...validationErrors, scientificName: "Only English letters, spaces, dots, and parentheses allowed" });
  } else if (!validateWordCount(value, 100)) {
    setValidationErrors({ ...validationErrors, scientificName: "Maximum 100 words allowed" });
  }
}}
    error={!!validationErrors.scientificName}
    helperText={validationErrors.scientificName}
    inputProps={{ maxLength: 200 }}
  />
</Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Group</InputLabel>
                <Select value={newCropFormData.cropGroupId} onChange={(e) => setNewCropFormData({ ...newCropFormData, cropGroupId: e.target.value })} label="Crop Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Class Group</InputLabel>
                <Select value={newCropFormData.cropClassGroupId} onChange={(e) => setNewCropFormData({ ...newCropFormData, cropClassGroupId: e.target.value })} label="Crop Class Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Horti Group</InputLabel>
                <Select value={newCropFormData.hortiGroupId} onChange={(e) => setNewCropFormData({ ...newCropFormData, hortiGroupId: e.target.value })} label="Horti Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Type</InputLabel>
                <Select value={newCropFormData.cropTypeId} onChange={(e) => setNewCropFormData({ ...newCropFormData, cropTypeId: e.target.value })} label="Crop Type">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropTypes.map((type) => (<MenuItem key={type.cropTypeId} value={type.cropTypeId}>{type.cropType}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select value={newCropFormData.unitId} onChange={(e) => setNewCropFormData({ ...newCropFormData, unitId: e.target.value })} label="Unit">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {unitsList.map((unit) => (<MenuItem key={unit.unitId} value={unit.unitId}>{unit.unitName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={newCropFormData.isHorti} onChange={(e) => setNewCropFormData({ ...newCropFormData, isHorti: e.target.checked })} color="primary" />} label="Horticulture Crop" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={newCropFormData.isActive} onChange={(e) => setNewCropFormData({ ...newCropFormData, isActive: e.target.checked })} color="primary" />} label="Active" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCropDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveNewCrop} variant="contained" sx={{ backgroundColor: themeColor }}>Save Crop</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Crop Dialog */}
      <Dialog open={editCropDialogOpen} onClose={() => setEditCropDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
  Edit Crop
</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
<Grid item xs={12} sm={6}>
  <TextField 
    label="Crop Name (English)" 
    fullWidth 
    required 
    value={editCropFormData.cropNameEn} 
    onChange={(e) => {
      const value = e.target.value;
      if (validateEnglishText(value) && validateTextFieldLength(value, 100)) {
        setEditCropFormData({ ...editCropFormData, cropNameEn: value }); 
        setValidationErrors({ ...validationErrors, cropNameEn: "" });
      } else if (!validateEnglishText(value)) {
        setValidationErrors({ ...validationErrors, cropNameEn: "Only English alphabets allowed" });
      } else if (!validateTextFieldLength(value, 100)) {
        setValidationErrors({ ...validationErrors, cropNameEn: "Maximum 100 characters allowed" });
      }
    }}
    error={!!validationErrors.cropNameEn}
    helperText={validationErrors.cropNameEn}
    inputProps={{ maxLength: 100 }}
  />
</Grid>

<Grid item xs={12} sm={6}>
  <TextField 
    label="Crop Name (Malayalam)" 
    fullWidth 
    value={editCropFormData.cropNameMal}
    onChange={(e) => {
      const value = e.target.value;
      if (validateMalayalamText(value) && validateTextFieldLength(value, 100)) {
        setEditCropFormData({ ...editCropFormData, cropNameMal: value });  // Changed
        setValidationErrors({ ...validationErrors, cropNameMal: "" });
      } else if (!validateMalayalamText(value)) {
        setValidationErrors({ ...validationErrors, cropNameMal: "Only Malayalam characters allowed" });
      } else if (!validateTextFieldLength(value, 100)) {
        setValidationErrors({ ...validationErrors, cropNameMal: "Maximum 100 characters allowed" });
      }
    }}
    error={!!validationErrors.cropNameMal}
    helperText={validationErrors.cropNameMal}
    inputProps={{ maxLength: 100 }}
  />
</Grid>

<Grid item xs={12} sm={6}>
  <TextField 
    label="Scientific Name" 
    fullWidth 
    value={editCropFormData.scientificName}
    onChange={(e) => {
      const value = e.target.value;
      if (validateScientificName(value) && validateTextFieldLength(value, 200)) {
        setEditCropFormData({ ...editCropFormData, scientificName: value });
        setValidationErrors({ ...validationErrors, scientificName: "" });
      } else if (!validateScientificName(value)) {
        setValidationErrors({ ...validationErrors, scientificName: "Only English letters, spaces, dots, and parentheses allowed" });
      } else if (!validateTextFieldLength(value, 200)) {
        setValidationErrors({ ...validationErrors, scientificName: "Maximum 200 characters allowed" });
      }
    }}
    error={!!validationErrors.scientificName}
    helperText={validationErrors.scientificName}
    inputProps={{ maxLength: 200 }}
  />
</Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Group</InputLabel>
                <Select value={editCropFormData.cropGroupId} onChange={(e) => setEditCropFormData({ ...editCropFormData, cropGroupId: e.target.value })} label="Crop Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Class Group</InputLabel>
                <Select value={editCropFormData.cropClassGroupId} onChange={(e) => setEditCropFormData({ ...editCropFormData, cropClassGroupId: e.target.value })} label="Crop Class Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Horti Group</InputLabel>
                <Select value={editCropFormData.hortiGroupId} onChange={(e) => setEditCropFormData({ ...editCropFormData, hortiGroupId: e.target.value })} label="Horti Group">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropGroups.map((group) => (<MenuItem key={group.cropGroupId} value={group.cropGroupId}>{group.groupName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Crop Type</InputLabel>
                <Select value={editCropFormData.cropTypeId} onChange={(e) => setEditCropFormData({ ...editCropFormData, cropTypeId: e.target.value })} label="Crop Type">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {cropTypes.map((type) => (<MenuItem key={type.cropTypeId} value={type.cropTypeId}>{type.cropType}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select value={editCropFormData.unitId} onChange={(e) => setEditCropFormData({ ...editCropFormData, unitId: e.target.value })} label="Unit">
                  <MenuItem value=""><em>None</em></MenuItem>
                  {unitsList.map((unit) => (<MenuItem key={unit.unitId} value={unit.unitId}>{unit.unitName}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={editCropFormData.isHorti} onChange={(e) => setEditCropFormData({ ...editCropFormData, isHorti: e.target.checked })} color="primary" />} label="Horticulture Crop" />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch checked={editCropFormData.isActive} onChange={(e) => setEditCropFormData({ ...editCropFormData, isActive: e.target.checked })} color="primary" />} label="Active" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCropDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateCrop} variant="contained" sx={{ backgroundColor: themeColor }}>Update Crop</Button>
        </DialogActions>
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialogOpen} onClose={() => setUnitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
    {editingUnit ? "Edit Unit" : "Add New Unit"}
  </DialogTitle>
        <DialogContent>
<TextField 
  autoFocus 
  margin="dense" 
  label="Unit Name" 
  fullWidth 
  value={unitFormData.unitName} 
  onChange={(e) => {
    const value = e.target.value;
    if (validateEnglishText(value) && validateTextFieldLength(value, 50)) {
      setUnitFormData({ ...unitFormData, unitName: value });
      setValidationErrors({ ...validationErrors, unitName: "" });
    } else if (!validateEnglishText(value)) {
      setValidationErrors({ ...validationErrors, unitName: "Only English alphabets allowed" });
    } else if (!validateTextFieldLength(value, 50)) {
      setValidationErrors({ ...validationErrors, unitName: "Maximum 50 characters allowed" });
    }
  }}
  error={!!validationErrors.unitName}
  helperText={validationErrors.unitName}
  inputProps={{ maxLength: 50 }}
  required 
/>          <FormControlLabel control={<Switch checked={unitFormData.isActive} onChange={(e) => setUnitFormData({ ...unitFormData, isActive: e.target.checked })} color="primary" />} label="Active" />
        </DialogContent>
        <DialogActions><Button onClick={() => setUnitDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveUnit} variant="contained" sx={{ backgroundColor: themeColor }}>{editingUnit ? "Update" : "Save"}</Button></DialogActions>
      </Dialog>

      {/* Stands Per Hectare Dialog */}
      <Dialog open={standsDialogOpen} onClose={() => setStandsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>{editingStands ? "Edit Stands Data" : "Add Stands Data"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Crop Name</InputLabel>
            <Select value={standsFormData.cropId} onChange={(e) => setStandsFormData({ ...standsFormData, cropId: e.target.value })} label="Crop Name">
              {allCrops.map((crop) => (<MenuItem key={crop.cropId} value={crop.cropId}>{crop.cropNameEn}</MenuItem>))}
            </Select>
          </FormControl>
          
          <FormControlLabel control={<Switch checked={standsFormData.isState} onChange={(e) => { setStandsFormData({ ...standsFormData, isState: e.target.checked, distId: "" }); }} color="primary" />} label="State Level (If unchecked, District level)" sx={{ mb: 2 }} />
          
          {!standsFormData.isState && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select District</InputLabel>
              <Select value={standsFormData.distId} onChange={(e) => setStandsFormData({ ...standsFormData, distId: e.target.value })} label="Select District">
                <MenuItem value=""><em>None</em></MenuItem>
                {districts.map((district) => (<MenuItem key={district.distId} value={district.distId}>{district.distNameEn}</MenuItem>))}
              </Select>
            </FormControl>
          )}
          
          <TextField label="Stands Per Hectare" type="number" fullWidth value={standsFormData.standsPerHectare} onChange={(e) => setStandsFormData({ ...standsFormData, standsPerHectare: e.target.value })} sx={{ mb: 2 }} required />
          <TextField label="Cent Per Tree" type="number" fullWidth value={standsFormData.centPerTree} onChange={(e) => setStandsFormData({ ...standsFormData, centPerTree: e.target.value })} sx={{ mb: 2 }} />
          <FormControlLabel control={<Switch checked={standsFormData.isActive} onChange={(e) => setStandsFormData({ ...standsFormData, isActive: e.target.checked })} color="primary" />} label="Active" />
        </DialogContent>
        <DialogActions><Button onClick={() => setStandsDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveStands} variant="contained" sx={{ backgroundColor: themeColor }}>{editingStands ? "Update" : "Save"}</Button></DialogActions>
      </Dialog>

      {/* Irrigation Sources Dialog */}
      <Dialog open={irrigationDialogOpen} onClose={() => setIrrigationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>{editingIrrigation ? "Edit Irrigation Source" : "Add Irrigation Source"}</DialogTitle>
        <DialogContent>
<TextField 
  autoFocus 
  margin="dense" 
  label="Irrigation Type" 
  fullWidth 
  value={irrigationFormData.irrigationType} 
  onChange={(e) => {
    const value = e.target.value;
    if (validateEnglishText(value) && validateTextFieldLength(value, 100)) {
      setIrrigationFormData({ ...irrigationFormData, irrigationType: value });
      setValidationErrors({ ...validationErrors, irrigationType: "" });
    } else if (!validateEnglishText(value)) {
      setValidationErrors({ ...validationErrors, irrigationType: "Only English alphabets allowed" });
    } else if (!validateTextFieldLength(value, 100)) {
      setValidationErrors({ ...validationErrors, irrigationType: "Maximum 100 characters allowed" });
    }
  }}
  error={!!validationErrors.irrigationType}
  helperText={validationErrors.irrigationType}
  inputProps={{ maxLength: 100 }}
  required 
/>

<TextField 
  label="Irrigation Code" 
  type="number" 
  fullWidth 
  value={irrigationFormData.irrigationCodeDes} 
  onChange={(e) => {
    const value = e.target.value;
    if (validateNumberField(value)) {
      setIrrigationFormData({ ...irrigationFormData, irrigationCodeDes: value });
    }
  }}
  inputProps={{ maxLength: 10 }}
/>
       <FormControlLabel control={<Switch checked={irrigationFormData.isActive} onChange={(e) => setIrrigationFormData({ ...irrigationFormData, isActive: e.target.checked })} color="primary" />} label="Active" />
        </DialogContent>
        <DialogActions><Button onClick={() => setIrrigationDialogOpen(false)}>Cancel</Button><Button onClick={handleSaveIrrigation} variant="contained" sx={{ backgroundColor: themeColor }}>{editingIrrigation ? "Update" : "Save"}</Button></DialogActions>
      </Dialog>

      {/* CCE Crop Dialog */}
<Dialog open={cceDialogOpen} onClose={() => setCceDialogOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
    {editingCce ? "Edit CCE Crop" : "Add CCE Crop"}
  </DialogTitle>
  <DialogContent>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6}>
        <TextField 
            label="CCE Crop Type" 
            fullWidth 
            required 
            value={cceFormData.cceCropType} 
            onChange={(e) => {
              const value = e.target.value;
              if (validateEnglishText(value) && validateTextFieldLength(value, 100)) {
                setCceFormData({ ...cceFormData, cceCropType: value });
                setValidationErrors({ ...validationErrors, cceCropType: "" });
              } else if (!validateEnglishText(value)) {
                setValidationErrors({ ...validationErrors, cceCropType: "Only English alphabets allowed" });
              } else if (!validateTextFieldLength(value, 100)) {
                setValidationErrors({ ...validationErrors, cceCropType: "Maximum 100 characters allowed" });
              }
            }}
            error={!!validationErrors.cceCropType}
            helperText={validationErrors.cceCropType}
            inputProps={{ maxLength: 100 }}
          />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel>Crop Name</InputLabel>
          <Select 
            value={cceFormData.cropId} 
            onChange={(e) => setCceFormData({ ...cceFormData, cropId: e.target.value })} 
            label="Crop Name"
          >
            <MenuItem value=""><em>Select Crop</em></MenuItem>
            {allCrops.filter(crop => crop.isActive === true).map((crop) => (
              <MenuItem key={crop.cropId} value={crop.cropId}>
                {crop.cropNameEn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField 
          label="Number of CCE" 
          type="number" 
          fullWidth 
          value={cceFormData.noOfCce} 
          onChange={(e) => {
            const value = e.target.value;
            if (validateIntegerField(value)) {
              setCceFormData({ ...cceFormData, noOfCce: value });
            }
          }}
          inputProps={{ min: 0 }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>CCE Unit</InputLabel>
          <Select 
            value={cceFormData.cceUnitId} 
            onChange={(e) => setCceFormData({ ...cceFormData, cceUnitId: e.target.value })} 
            label="CCE Unit"
          >
            <MenuItem value=""><em>Select Unit</em></MenuItem>
            {unitsList.filter(unit => unit.isActive === true).map((unit) => (
              <MenuItem key={unit.unitId} value={unit.unitId}>
                {unit.unitName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Frame</InputLabel>
          <Select 
            value={cceFormData.frameId} 
            onChange={(e) => setCceFormData({ ...cceFormData, frameId: e.target.value })} 
            label="Frame"
          >
            <MenuItem value=""><em>Select Frame</em></MenuItem>
            {frames.map((frame) => (
              <MenuItem key={frame.id} value={frame.id}>
                {frame.frameName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth>
          <InputLabel>Frame Unit</InputLabel>
          <Select 
            value={cceFormData.frameUnitId} 
            onChange={(e) => setCceFormData({ ...cceFormData, frameUnitId: e.target.value })} 
            label="Frame Unit"
          >
            <MenuItem value=""><em>Select Unit</em></MenuItem>
            {unitsList.filter(unit => unit.isActive === true).map((unit) => (
              <MenuItem key={unit.unitId} value={unit.unitId}>
                {unit.unitName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField 
          label="Frame Length" 
          type="number" 
          fullWidth 
          value={cceFormData.frameLength} 
          onChange={(e) => {
            const value = e.target.value;
            if (validateIntegerField(value)) {
              setCceFormData({ ...cceFormData, frameLength: value });
            }
          }}
          inputProps={{ min: 0 }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField 
          label="Frame Width" 
          type="number" 
          fullWidth 
          value={cceFormData.frameWidth} 
          onChange={(e) => {
            const value = e.target.value;
            if (validateIntegerField(value)) {
              setCceFormData({ ...cceFormData, frameWidth: value });
            }
          }}
          inputProps={{ min: 0 }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField 
          label="CCE Visit Limit" 
          type="number" 
          fullWidth 
          value={cceFormData.cceVisitLimit} 
          onChange={(e) => {
            const value = e.target.value;
            if (validateIntegerField(value)) {
              setCceFormData({ ...cceFormData, cceVisitLimit: value });
            }
          }}
          inputProps={{ min: 0 }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Collection Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.selectionFromOutOfCluster} 
              onChange={(e) => setCceFormData({ ...cceFormData, selectionFromOutOfCluster: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Selection From Out of Cluster" 
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.isCollectedRepeatedly} 
              onChange={(e) => setCceFormData({ ...cceFormData, isCollectedRepeatedly: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Collected Repeatedly" 
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.isRandomSelected} 
              onChange={(e) => setCceFormData({ ...cceFormData, isRandomSelected: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Random Selected" 
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.isTreeWiseCollection} 
              onChange={(e) => setCceFormData({ ...cceFormData, isTreeWiseCollection: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Tree Wise Collection" 
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.isAlgorithmic} 
              onChange={(e) => setCceFormData({ ...cceFormData, isAlgorithmic: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Algorithmic" 
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel 
          control={
            <Switch 
              checked={cceFormData.isActive} 
              onChange={(e) => setCceFormData({ ...cceFormData, isActive: e.target.checked })} 
              color="primary" 
            />
          } 
          label="Active" 
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setCceDialogOpen(false)}>Cancel</Button>
    <Button onClick={handleSaveCce} variant="contained" sx={{ backgroundColor: themeColor }}>
      {editingCce ? "Update" : "Save"}
    </Button>
  </DialogActions>
</Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Grid>
  );
};

export default CropsManagement;