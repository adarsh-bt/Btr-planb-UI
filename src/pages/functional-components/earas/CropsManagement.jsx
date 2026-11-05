import React, { useState, useEffect } from "react";
import {
  Box, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment, CircularProgress, Chip,
  TablePagination, Tabs, Tab, Button, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch,
  FormControlLabel, Select, MenuItem, FormControl, InputLabel,
  Checkbox,
  ListItemText, OutlinedInput, FormHelperText
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
import AuthService from "pages/authentication/services/authservice";

const themeColor = "#05307a";

const CropsManagement = () => {
  const BASE_URL = mainapi.BASE_URL;
  const [crops, setCrops] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("cropNameEn");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCropsCount, setTotalCropsCount] = useState(0);

  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsSearchTerm, setUnitsSearchTerm] = useState("");
  const [unitsOrder, setUnitsOrder] = useState("asc");
  const [unitsOrderBy, setUnitsOrderBy] = useState("unitName");
  const [unitsPage, setUnitsPage] = useState(0);
  const [unitsRowsPerPage, setUnitsRowsPerPage] = useState(10);

  const [standsData, setStandsData] = useState([]);
  const [standsLoading, setStandsLoading] = useState(true);
  const [standsSearchTerm, setStandsSearchTerm] = useState("");
  const [standsOrder, setStandsOrder] = useState("asc");
  const [standsOrderBy, setStandsOrderBy] = useState("standsPerHectare");
  const [standsPage, setStandsPage] = useState(0);
  const [standsRowsPerPage, setStandsRowsPerPage] = useState(10);

  const [irrigationData, setIrrigationData] = useState([]);
  const [irrigationLoading, setIrrigationLoading] = useState(true);
  const [irrigationSearchTerm, setIrrigationSearchTerm] = useState("");
  const [irrigationOrder, setIrrigationOrder] = useState("asc");
  const [irrigationOrderBy, setIrrigationOrderBy] = useState("irrigationType");
  const [irrigationPage, setIrrigationPage] = useState(0);
  const [irrigationRowsPerPage, setIrrigationRowsPerPage] = useState(10);

  const [cceCrops, setCceCrops] = useState([]);
  const [cceLoading, setCceLoading] = useState(true);
  const [cceSearchTerm, setCceSearchTerm] = useState("");
  const [cceOrder, setCceOrder] = useState("asc");
  const [cceOrderBy, setCceOrderBy] = useState("cceCropType");
  const [ccePage, setCcePage] = useState(0);
  const [cceRowsPerPage, setCceRowsPerPage] = useState(10);

  const [cropGroups, setCropGroups] = useState([]);
  const [cropClassGroups, setCropClassGroups] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [growthStages, setGrowthStages] = useState([]);

  // Loading states for dropdowns
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingGrowthStages, setLoadingGrowthStages] = useState(false);

  const [frames, setFrames] = useState([]);
  const [loadingFrames, setLoadingFrames] = useState(false);

  const [cropYieldTypes, setCropYieldTypes] = useState([]);
  const [yieldLoading, setYieldLoading] = useState(true);
  const [yieldSearchTerm, setYieldSearchTerm] = useState("");
  const [yieldOrder, setYieldOrder] = useState("asc");
  const [yieldOrderBy, setYieldOrderBy] = useState("cropYieldNameEn");
  const [yieldPage, setYieldPage] = useState(0);
  const [yieldRowsPerPage, setYieldRowsPerPage] = useState(10);
  const [totalYieldCount, setTotalYieldCount] = useState(0);

  const [yieldDialogOpen, setYieldDialogOpen] = useState(false);
  const [editingYield, setEditingYield] = useState(null);
  const [yieldFormData, setYieldFormData] = useState({
    cropYieldTypeId: "",
    cropId: "",
    cropYieldNameEn: "",
    cropYieldNameMal: "",
    resultType: "",
    resultUnit: "",
    isActive: true
  });

  const [yieldValidationErrors, setYieldValidationErrors] = useState({
    cropYieldNameEn: "",
    cropYieldNameMal: "",
    resultType: "",
    resultUnit: ""
  });

  const [activeTab, setActiveTab] = useState(0);

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
    unitId: "",
    classificationIds: []
  });

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
    unitId: "",
    classificationIds: []
  });

  const CropGrowthStageResponse = {
    classificationId: null,
    seasonalClassificationName: ""
  };

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitFormData, setUnitFormData] = useState({
    unitId: "",
    unitName: "",
    isActive: true,
    addedBy: AuthService.userid()
  });


  const [standsDialogOpen, setStandsDialogOpen] = useState(false);
  const [editingStands, setEditingStands] = useState(null);
  const [standsFormData, setStandsFormData] = useState({
    standsPerHectareId: "",
    cropId: "",
    isState: false,
    distId: "",
    standsPerHectare: "",
    centPerTree: "",
    isActive: true,
    addedBy: AuthService.userid()
  });

  const [irrigationDialogOpen, setIrrigationDialogOpen] = useState(false);
  const [editingIrrigation, setEditingIrrigation] = useState(null);
  const [irrigationFormData, setIrrigationFormData] = useState({
    sourceId: "",
    irrigationType: "",
    irrigationCodeDes: "",
    isActive: true
  });

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

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [validationErrors, setValidationErrors] = useState({
    cropNameEn: "",
    cropNameMal: "",
    scientificName: "",
    cropGroupId: "",
    cropClassGroupId: "",
    cropTypeId: "",
    unitId: "",
    classificationIds: "",
    hortiGroupId: "",
    unitName: "",
    irrigationType: "",
    irrigationCodeDes: "",
    noOfCce: "",
    cceUnitId: "",
    frameId: "",
    frameUnitId: "",
    standsPerHectare: "",
    centPerTree: "",
    frameLength: "",
    frameWidth: "",
    cceVisitLimit: ""
  });

  const fetchAllCrops = async (currentPage = 0, pageSize = 10, search = "") => {
    try {
      setLoading(true);

      const searchParam = search && search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const url = `${BASE_URL}/earas-form1-entry/api/master-crop/fetch-all?page=${currentPage}&size=${pageSize}${searchParam}`; const response = await api.get(url);
      const data = response.data;

      let cropsArray = [];
      let totalElements = 0;

      if (data && data.payload && data.payload.content) {
        cropsArray = data.payload.content;
        totalElements = data.payload.totalElements || 0;   // ✅ ADDED: use backend total
      } else if (data && data.payload && Array.isArray(data.payload)) {
        cropsArray = data.payload;
        totalElements = data.payload.length;
      } else if (Array.isArray(data)) {
        cropsArray = data;
        totalElements = data.length;
      }

      setCrops(cropsArray);
      setTotalCropsCount(totalElements);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching crops:", error);
      setSnackbar({ open: true, message: "Failed to load crops data", severity: "error" });
      setLoading(false);
    }
  };

  const fetchAllCropsForDropdown = async () => {
    try {
      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/api/master-crop/fetch-all?page=0&size=1000`
      );
      const data = response.data;

      let cropsArray = [];
      if (data?.payload?.content && Array.isArray(data.payload.content)) {
        cropsArray = data.payload.content;
      } else if (data?.payload && Array.isArray(data.payload)) {
        cropsArray = data.payload;
      } else if (Array.isArray(data)) {
        cropsArray = data;
      }

      setAllCrops(cropsArray);
    } catch (error) {
      console.error("Error fetching all crops for dropdown:", error);
      setAllCrops([]);
    }
  };

  const validateEnglishText = (text) => {
    if (!text) return true;
    const englishRegex = /^[A-Za-z\s\-\(\)]+$/;
    return englishRegex.test(text);
  };

  const validateIrrigationTypeText = (text) => {
    if (!text) return true;
    const regex = /^[A-Za-z\s\-\(\),]+$/;
    return regex.test(text);
  };

  const validateMalayalamText = (text) => {
    if (!text) return true;
    const malayalamRegex = /^[\u0D00-\u0D7F\s\-\(\)]+$/;
    return malayalamRegex.test(text);
  };

  const validateScientificName = (text) => {
    if (!text) return true;
    const scientificRegex = /^[A-Za-z\s\.\(\)0-9]+$/;
    return scientificRegex.test(text);
  };

  const validateNumberField = (text) => {
    if (!text) return true;
    const numberRegex = /^\d*\.?\d*$/;
    return numberRegex.test(text);
  };

  const validateTextFieldLength = (text, maxLength = 100) => {
    if (!text) return true;
    return text.length <= maxLength;
  };

  const handleDecimalNumberKeyDown = (e, fieldName) => {
    const allowedControlKeys = [
      "Backspace", "Delete", "Tab", "Enter", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End"
    ];

    if (allowedControlKeys.includes(e.key)) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    if (e.key === ".") {
      const currentVal = e.target.value || "";
      const selectionStart = e.target.selectionStart || 0;
      const selectionEnd = e.target.selectionEnd || 0;
      const selectedText = currentVal.substring(selectionStart, selectionEnd);
      if (!currentVal.includes(".") || selectedText.includes(".")) {
        return;
      }
    }

    e.preventDefault();
    if (fieldName) {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: "Only numbers and decimal numbers are allowed"
      }));
    }
  };

  const handleIntegerNumberKeyDown = (e, fieldName) => {
    const allowedControlKeys = [
      "Backspace", "Delete", "Tab", "Enter", "Escape",
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "Home", "End"
    ];

    if (allowedControlKeys.includes(e.key)) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      return;
    }

    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    e.preventDefault();
    if (fieldName) {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: "Only numbers allowed"
      }));
    }
  };

  const extractErrorMessage = (error, fallback = "Something went wrong") => {
    if (!error) return fallback;

    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) return data;

    if (data?.response && typeof data.response === "string" && data.response.trim()) {
      return data.response;
    }

    if (data?.errors && typeof data.errors === "object") {
      const firstKey = Object.keys(data.errors)[0];
      if (firstKey) return data.errors[firstKey];
    }

    if (data?.message && !/please try again later/i.test(data.message)) {
      return data.message;
    }
    if (data?.error && !/unexpected error/i.test(data.error)) {
      return data.error;
    }

    return error.message || fallback;
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchAllCrops(newPage, rowsPerPage, searchTerm);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchAllCrops(0, newRowsPerPage, searchTerm);
  };

  const fetchGrowthStages = async () => {
    try {
      setLoadingGrowthStages(true);
      console.log("Fetching growth stages...");

      const response = await api.get(`${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-crop-growth-stage`);
      const data = response.data;

      console.log("Full API Response:", data);

      let stagesArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        stagesArray = data.payload;
      } else if (Array.isArray(data)) {
        stagesArray = data;
      }

      console.log("Processed growth stages:", stagesArray);
      setGrowthStages(stagesArray);
      setLoadingGrowthStages(false);
    } catch (error) {
      console.error("Error fetching growth stages:", error);
      setSnackbar({
        open: true,
        message: "Failed to load growth stages data",
        severity: "error"
      });
      setGrowthStages([]);
      setLoadingGrowthStages(false);
    }
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

      const normalizedIrrigationArray = irrigationArray.map(item => ({
        ...item,
        isActive: normalizeActiveStatus(item.isActive || item.active || item.status)
      }));

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

  const normalizeActiveStatus = (status) => {
    if (typeof status === 'boolean') return status;
    if (typeof status === 'number') return status === 1;
    if (typeof status === 'string') {
      const upperStatus = status.toUpperCase();
      return upperStatus === 'ACTIVE' || upperStatus === 'TRUE' || upperStatus === 'YES' || upperStatus === '1';
    }
    return false;
  };

  const fetchCropClassGroups = async () => {
    try {
      const response = await api.get(`${BASE_URL}/earas-form1-entry/api/master-crop-group/fetch-all`);
      const data = response.data;

      let groupsArray = [];
      if (data && data.payload && Array.isArray(data.payload)) {
        groupsArray = data.payload;
      } else if (Array.isArray(data)) {
        groupsArray = data;
      }

      // Filter to only Food crops (crop_group_id: 1) and Non food crops (crop_group_id: 2)
      const filteredGroups = groupsArray.filter(group =>
        group.cropGroupId === 1 || group.cropGroupId === 2
      );

      setCropClassGroups(filteredGroups);
    } catch (error) {
      console.error("Error fetching crop class groups:", error);
      setCropClassGroups([]);
    }
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

      const filteredGroups = groupsArray.filter(group =>
        group.cropGroupId !== 1 && group.cropGroupId !== 2
      );

      setCropGroups(filteredGroups);
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

  const fetchCropYieldTypes = async (page = yieldPage, size = yieldRowsPerPage) => {
    try {
      setYieldLoading(true);

      console.log(`Fetching yield types - page: ${page}, size: ${size}`);

      const response = await api.get(
        `${BASE_URL}/earas-form1-entry/api/master/crop-yield-type/fetch-all?page=${page}&size=${size}`
      );
      const data = response.data;

      console.log("Yield Types API Response:", data);

      let yieldArray = [];
      let totalElements = 0;

      if (data && data.payload) {
        if (data.payload.content && Array.isArray(data.payload.content)) {
          yieldArray = data.payload.content;
          totalElements = data.payload.totalElements || 0;
        } else if (Array.isArray(data.payload)) {
          yieldArray = data.payload;
          totalElements = data.payload.length;
        }
      } else if (Array.isArray(data)) {
        yieldArray = data;
        totalElements = data.length;
      }

      console.log(`Received ${yieldArray.length} items, total: ${totalElements}`);

      setCropYieldTypes(yieldArray);
      setTotalYieldCount(totalElements);
      setYieldLoading(false);
    } catch (error) {
      console.error("Error fetching crop yield types:", error);
      setSnackbar({ open: true, message: "Failed to load yield types", severity: "error" });
      setCropYieldTypes([]);
      setYieldLoading(false);
    }
  };

  // Handle Add Yield
  const handleAddYield = () => {
    fetchAllCrops();
    fetchAllCropsForDropdown();  // Fetch crops for dropdown
    setEditingYield(null);
    setYieldFormData({
      cropYieldTypeId: "",
      cropId: "",
      cropYieldNameEn: "",
      cropYieldNameMal: "",
      resultType: "",
      resultUnit: "",
      isActive: true
    });
    setYieldValidationErrors({
      cropYieldNameEn: "",
      cropYieldNameMal: "",
      resultType: "",
      resultUnit: ""
    });
    setYieldDialogOpen(true);
  };

  const handleEditYield = (yieldType) => {
    fetchAllCrops();
    fetchAllCropsForDropdown();
    setEditingYield(yieldType);
    setYieldFormData({
      cropYieldTypeId: yieldType.cropYieldTypeId || "",
      cropId: yieldType.cropId || "",
      cropYieldNameEn: yieldType.cropYieldNameEn || "",
      cropYieldNameMal: yieldType.cropYieldNameMal || "",
      resultType: yieldType.resultType || "",
      resultUnit: yieldType.resultUnit || "",
      isActive: yieldType.isActive !== undefined ? yieldType.isActive : true
    });
    setYieldValidationErrors({
      cropYieldNameEn: "",
      cropYieldNameMal: "",
      resultType: "",
      resultUnit: ""
    });
    setYieldDialogOpen(true);
  };

  const handleCloseYieldDialog = () => {
    setYieldDialogOpen(false);
    setEditingYield(null);
    setYieldValidationErrors({
      cropYieldNameEn: "",
      cropYieldNameMal: "",
      resultType: "",
      resultUnit: ""
    });
  };

  const handleSaveYield = async () => {
    let hasError = false;
    const fieldErrors = {
      cropYieldNameEn: "",
      cropYieldNameMal: "",
      resultType: "",
      resultUnit: ""
    };

    if (!yieldFormData.cropId) {
      setSnackbar({ open: true, message: "Please select a crop", severity: "warning" });
      return;
    }

    const trimmedYieldNameEn = (yieldFormData.cropYieldNameEn || "").trim();
    if (!trimmedYieldNameEn) {
      fieldErrors.cropYieldNameEn = "Yield name (English) is required";
      hasError = true;
    } else if (!validateEnglishText(yieldFormData.cropYieldNameEn)) {
      fieldErrors.cropYieldNameEn = "Only English alphabets allowed";
      hasError = true;
    } else if (!validateTextFieldLength(yieldFormData.cropYieldNameEn, 100)) {
      fieldErrors.cropYieldNameEn = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedYieldNameMal = (yieldFormData.cropYieldNameMal || "").trim();
    if (!trimmedYieldNameMal) {
      fieldErrors.cropYieldNameMal = "Yield name (Malayalam) is required";
      hasError = true;
    } else if (!validateMalayalamText(yieldFormData.cropYieldNameMal)) {
      fieldErrors.cropYieldNameMal = "Only Malayalam characters allowed";
      hasError = true;
    } else if (!validateTextFieldLength(yieldFormData.cropYieldNameMal, 100)) {
      fieldErrors.cropYieldNameMal = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedResultType = (yieldFormData.resultType || "").trim();
    if (!trimmedResultType) {
      fieldErrors.resultType = "Result type is required";
      hasError = true;
    } else if (!validateEnglishText(yieldFormData.resultType)) {
      fieldErrors.resultType = "Only English alphabets allowed";
      hasError = true;
    } else if (!validateTextFieldLength(yieldFormData.resultType, 50)) {
      fieldErrors.resultType = "Maximum 50 characters allowed";
      hasError = true;
    }

    const trimmedResultUnit = (yieldFormData.resultUnit || "").trim();
    if (!trimmedResultUnit) {
      fieldErrors.resultUnit = "Result unit is required";
      hasError = true;
    } else if (!validateEnglishText(yieldFormData.resultUnit)) {
      fieldErrors.resultUnit = "Only English alphabets allowed";
      hasError = true;
    } else if (!validateTextFieldLength(yieldFormData.resultUnit, 20)) {
      fieldErrors.resultUnit = "Maximum 20 characters allowed";
      hasError = true;
    }

    setYieldValidationErrors(fieldErrors);

    if (hasError) {
      const firstError = Object.values(fieldErrors).find((msg) => !!msg);
      setSnackbar({ open: true, message: firstError || "Please fill in all mandatory fields", severity: "warning" });
      return;
    }

    try {
      const payload = {
        cropYieldTypeId: yieldFormData.cropYieldTypeId || null,
        cropId: parseInt(yieldFormData.cropId),
        cropYieldNameEn: yieldFormData.cropYieldNameEn.trim(),
        cropYieldNameMal: yieldFormData.cropYieldNameMal.trim(),
        resultType: yieldFormData.resultType.trim(),
        resultUnit: yieldFormData.resultUnit.trim(),
        isActive: yieldFormData.isActive,
        addedBy: AuthService.userid()
      };

      console.log("Saving yield payload:", payload);

      const response = await api.post(
        `${BASE_URL}/earas-form1-entry/api/master/crop-yield-type/save`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: editingYield ? "Crop yield type updated successfully" : "Crop yield type added successfully",
          severity: "success"
        });
        handleCloseYieldDialog();
        fetchCropYieldTypes();
      } else {
        throw new Error("Failed to save crop yield type");
      }
    } catch (error) {
      console.error("Error saving crop yield type:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to save crop yield type",
        severity: "error"
      });
    }
  };

  useEffect(() => {
    fetchAllCrops();
    fetchAllCropsForDropdown();
    fetchUnits();
    fetchStandsData();
    fetchIrrigationData();
    fetchCropGroups();
    fetchCropClassGroups();
    fetchCropTypes();
    fetchUnitsList();
    fetchDistricts();
    fetchCceCrops();
    fetchFrames();
    fetchGrowthStages();
    fetchCropYieldTypes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAllCrops(0, rowsPerPage, searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, rowsPerPage]);

  const handleCloseAddCropDialog = () => {
    setAddCropDialogOpen(false);
    setValidationErrors((prev) => ({
      ...prev,
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    }));
  };

  const handleCloseEditCropDialog = () => {
    setEditCropDialogOpen(false);
    setEditingCrop(null);
    setValidationErrors((prev) => ({
      ...prev,
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    }));
  };

  const handleAddCrop = () => {
    fetchCropGroups();
    fetchCropClassGroups();
    fetchCropTypes();
    fetchUnitsList();
    fetchGrowthStages();

    setValidationErrors((prev) => ({
      ...prev,
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    }));

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
      unitId: "",
      classificationIds: []
    });
    setAddCropDialogOpen(true);
  };

  const handleSaveNewCrop = async () => {
    let hasError = false;
    const fieldErrors = {
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    };

    const trimmedCropNameEn = (newCropFormData.cropNameEn || "").trim();
    if (!trimmedCropNameEn) {
      fieldErrors.cropNameEn = "Crop name (English) is required";
      hasError = true;
    } else if (!validateEnglishText(newCropFormData.cropNameEn)) {
      fieldErrors.cropNameEn = "Only English alphabets allowed";
      hasError = true;
    } else if (!validateTextFieldLength(newCropFormData.cropNameEn, 100)) {
      fieldErrors.cropNameEn = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedCropNameMal = (newCropFormData.cropNameMal || "").trim();
    if (!trimmedCropNameMal) {
      fieldErrors.cropNameMal = "Crop name (Malayalam) is required";
      hasError = true;
    } else if (!validateMalayalamText(newCropFormData.cropNameMal)) {
      fieldErrors.cropNameMal = "Only Malayalam characters allowed";
      hasError = true;
    } else if (!validateTextFieldLength(newCropFormData.cropNameMal, 100)) {
      fieldErrors.cropNameMal = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedScientificName = (newCropFormData.scientificName || "").trim();
    if (!trimmedScientificName) {
      fieldErrors.scientificName = "Scientific name is required";
      hasError = true;
    } else if (!validateScientificName(newCropFormData.scientificName)) {
      fieldErrors.scientificName = "Only English letters, spaces, dots, and parentheses allowed";
      hasError = true;
    } else if (!validateTextFieldLength(newCropFormData.scientificName, 200)) {
      fieldErrors.scientificName = "Maximum 200 characters allowed";
      hasError = true;
    }

    if (!newCropFormData.cropGroupId) {
      fieldErrors.cropGroupId = "Crop group is required";
      hasError = true;
    }

    if (!newCropFormData.cropClassGroupId) {
      fieldErrors.cropClassGroupId = "Crop class group is required";
      hasError = true;
    }

    if (!newCropFormData.cropTypeId) {
      fieldErrors.cropTypeId = "Crop type is required";
      hasError = true;
    }

    if (!newCropFormData.unitId) {
      fieldErrors.unitId = "Unit is required";
      hasError = true;
    }

    if (!newCropFormData.classificationIds || newCropFormData.classificationIds.length === 0) {
      fieldErrors.classificationIds = "At least one seasonal classification is required";
      hasError = true;
    }

    if (newCropFormData.isHorti && !newCropFormData.hortiGroupId) {
      fieldErrors.hortiGroupId = "Horti group is required";
      hasError = true;
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors
    }));

    if (hasError) {
      const firstErrorMessage = Object.values(fieldErrors).find((msg) => !!msg);
      setSnackbar({
        open: true,
        message: firstErrorMessage || "Please fill in all mandatory fields",
        severity: "warning"
      });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-crop/add`, {
        cropNameEn: newCropFormData.cropNameEn.trim(),
        cropNameMal: newCropFormData.cropNameMal ? newCropFormData.cropNameMal.trim() : "",
        isActive: newCropFormData.isActive,
        scientificName: newCropFormData.scientificName ? newCropFormData.scientificName.trim() : "",
        isHorti: newCropFormData.isHorti,
        cropGroupId: newCropFormData.cropGroupId ? parseInt(newCropFormData.cropGroupId) : null,
        cropClassGroupId: newCropFormData.cropClassGroupId ? parseInt(newCropFormData.cropClassGroupId) : null,
        hortiGroupId: newCropFormData.hortiGroupId ? parseInt(newCropFormData.hortiGroupId) : null,
        cropTypeId: newCropFormData.cropTypeId ? parseInt(newCropFormData.cropTypeId) : null,
        unitId: newCropFormData.unitId ? parseInt(newCropFormData.unitId) : null,
        classificationIds: newCropFormData.classificationIds.map(id => parseInt(id)),
        addedBy: AuthService.userid()
      });

      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: "Crop added successfully", severity: "success" });
        handleCloseAddCropDialog();
        fetchAllCrops();
      } else {
        throw new Error("Failed to add crop");
      }
    } catch (error) {
      console.error("Error adding crop:", error);
      setSnackbar({
        open: true,
        message: extractErrorMessage(error, "Failed to add crop"),
        severity: "error",
      });
    }
  };

  const handleEditCrop = (crop) => {
    fetchCropGroups();
    fetchCropClassGroups();
    fetchCropTypes();
    fetchUnitsList();
    fetchGrowthStages();

    setValidationErrors((prev) => ({
      ...prev,
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    }));

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
      unitId: crop.unitId || "",
      classificationIds: crop.cropGrowthStageResponseList
        ? crop.cropGrowthStageResponseList.map(item => item.classificationId)
        : []
    });
    setEditCropDialogOpen(true);
  };

  const handleUpdateCrop = async () => {
    let hasError = false;
    const fieldErrors = {
      cropNameEn: "",
      cropNameMal: "",
      scientificName: "",
      cropGroupId: "",
      cropClassGroupId: "",
      cropTypeId: "",
      unitId: "",
      classificationIds: "",
      hortiGroupId: ""
    };

    const trimmedCropNameEn = (editCropFormData.cropNameEn || "").trim();
    if (!trimmedCropNameEn) {
      fieldErrors.cropNameEn = "Crop name (English) is required";
      hasError = true;
    } else if (!validateEnglishText(editCropFormData.cropNameEn)) {
      fieldErrors.cropNameEn = "Only English alphabets allowed";
      hasError = true;
    } else if (!validateTextFieldLength(editCropFormData.cropNameEn, 100)) {
      fieldErrors.cropNameEn = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedCropNameMal = (editCropFormData.cropNameMal || "").trim();
    if (!trimmedCropNameMal) {
      fieldErrors.cropNameMal = "Crop name (Malayalam) is required";
      hasError = true;
    } else if (!validateMalayalamText(editCropFormData.cropNameMal)) {
      fieldErrors.cropNameMal = "Only Malayalam characters allowed";
      hasError = true;
    } else if (!validateTextFieldLength(editCropFormData.cropNameMal, 100)) {
      fieldErrors.cropNameMal = "Maximum 100 characters allowed";
      hasError = true;
    }

    const trimmedScientificName = (editCropFormData.scientificName || "").trim();
    if (!trimmedScientificName) {
      fieldErrors.scientificName = "Scientific name is required";
      hasError = true;
    } else if (!validateScientificName(editCropFormData.scientificName)) {
      fieldErrors.scientificName = "Only English letters, spaces, dots, and parentheses allowed";
      hasError = true;
    } else if (!validateTextFieldLength(editCropFormData.scientificName, 200)) {
      fieldErrors.scientificName = "Maximum 200 characters allowed";
      hasError = true;
    }

    if (!editCropFormData.cropGroupId) {
      fieldErrors.cropGroupId = "Crop group is required";
      hasError = true;
    }

    if (!editCropFormData.cropClassGroupId) {
      fieldErrors.cropClassGroupId = "Crop class group is required";
      hasError = true;
    }

    if (!editCropFormData.cropTypeId) {
      fieldErrors.cropTypeId = "Crop type is required";
      hasError = true;
    }

    if (!editCropFormData.unitId) {
      fieldErrors.unitId = "Unit is required";
      hasError = true;
    }

    if (!editCropFormData.classificationIds || editCropFormData.classificationIds.length === 0) {
      fieldErrors.classificationIds = "At least one seasonal classification is required";
      hasError = true;
    }

    if (editCropFormData.isHorti && !editCropFormData.hortiGroupId) {
      fieldErrors.hortiGroupId = "Horti group is required";
      hasError = true;
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors
    }));

    if (hasError) {
      const firstErrorMessage = Object.values(fieldErrors).find((msg) => !!msg);
      setSnackbar({
        open: true,
        message: firstErrorMessage || "Please fill in all mandatory fields",
        severity: "warning"
      });
      return;
    }

    try {
      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-crop/add`, {
        cropId: editCropFormData.cropId,
        cropNameEn: editCropFormData.cropNameEn.trim(),
        cropNameMal: editCropFormData.cropNameMal ? editCropFormData.cropNameMal.trim() : "",
        isActive: editCropFormData.isActive,
        scientificName: editCropFormData.scientificName ? editCropFormData.scientificName.trim() : "",
        isHorti: editCropFormData.isHorti,
        cropGroupId: editCropFormData.cropGroupId ? parseInt(editCropFormData.cropGroupId) : null,
        cropClassGroupId: editCropFormData.cropClassGroupId ? parseInt(editCropFormData.cropClassGroupId) : null,
        hortiGroupId: editCropFormData.hortiGroupId ? parseInt(editCropFormData.hortiGroupId) : null,
        cropTypeId: editCropFormData.cropTypeId ? parseInt(editCropFormData.cropTypeId) : null,
        unitId: editCropFormData.unitId ? parseInt(editCropFormData.unitId) : null,
        classificationIds: editCropFormData.classificationIds.map(id => parseInt(id)),
        addedBy: AuthService.userid()
      });

      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: "Crop updated successfully", severity: "success" });
        handleCloseEditCropDialog();
        fetchAllCrops();
      } else {
        throw new Error("Failed to update crop");
      }
    } catch (error) {
      console.error("Error updating crop:", error);
      setSnackbar({
        open: true,
        message: extractErrorMessage(error, "Failed to update crop"),
        severity: "error",
      });
    }
  };

  const handleCloseUnitDialog = () => {
    setUnitDialogOpen(false);
    setEditingUnit(null);
    setValidationErrors((prev) => ({
      ...prev,
      unitName: ""
    }));
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitFormData({
      unitId: null,                          // ✅ explicit null for insert
      unitName: "",
      isActive: true,
      addedBy: AuthService.userid()          // ✅ include
    });
    setValidationErrors((prev) => ({
      ...prev,
      unitName: ""
    }));
    setUnitDialogOpen(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitFormData({
      unitId: unit.unitId ?? null,          // ✅ null when absent, not ""
      unitName: unit.unitName || "",
      isActive: unit.isActive !== undefined ? unit.isActive : true,
      addedBy: AuthService.userid()         // ✅ always include
    });
    setValidationErrors((prev) => ({
      ...prev,
      unitName: ""
    }));
    setUnitDialogOpen(true);
  };

  const handleSaveUnit = async () => {
    const trimmedName = unitFormData.unitName.trim();
    let errorMsg = "";

    // 🔹 1. Required check
    if (!trimmedName) {
      errorMsg = "Unit name is required";
    } else if (!validateEnglishText(unitFormData.unitName)) {
      errorMsg = "Only English alphabets allowed";
    } else if (!validateTextFieldLength(unitFormData.unitName, 50)) {
      errorMsg = "Maximum 50 characters allowed";
    } else {
      // 🔹 2. Client-side duplicate check
      const isDuplicate = units.some(
        (u) =>
          u.unitName &&
          u.unitName.trim().toLowerCase() === trimmedName.toLowerCase() &&
          u.unitId !== unitFormData.unitId   // ignore self when editing
      );

      if (isDuplicate) {
        errorMsg = `Unit name already exists: ${trimmedName}`;
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      unitName: errorMsg
    }));

    if (errorMsg) {
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: errorMsg.includes("already exists") ? "error" : "warning"
      });
      return;
    }

    try {
      const payload = {
        unitId: unitFormData.unitId ?? null,   // ✅ null for insert
        unitName: trimmedName,
        isActive: unitFormData.isActive,
        addedBy: AuthService.userid()
      };

      console.log("Saving unit payload:", payload);

      const response = await api.post(
        `${BASE_URL}/earas-form1-entry/api/master-unit/add`,   // single upsert endpoint
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: editingUnit ? "Unit updated successfully" : "Unit added successfully",
          severity: "success"
        });
        handleCloseUnitDialog();
        fetchUnits();
        fetchUnitsList();
      } else {
        throw new Error("Failed to save unit");
      }
    } catch (error) {
      console.error("Error saving unit:", error);

      // 🔹 3. Surface backend duplicate/validation errors
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save unit";

      setSnackbar({ open: true, message: backendMsg, severity: "error" });
      if (/exist|already/i.test(backendMsg)) {
        setValidationErrors((prev) => ({
          ...prev,
          unitName: backendMsg
        }));
      }
    }
  };

  const handleCloseStandsDialog = () => {
    setStandsDialogOpen(false);
    setEditingStands(null);
    setValidationErrors((prev) => ({
      ...prev,
      standsPerHectare: "",
      centPerTree: ""
    }));
  };

  const handleAddStands = () => {
    fetchDistricts();
    setEditingStands(null);
    setStandsFormData({
      cropId: "",
      isState: false,
      distId: "",
      standsPerHectare: "",
      centPerTree: "",
      isActive: true,
      addedBy: AuthService.userid()
    });
    setValidationErrors((prev) => ({
      ...prev,
      standsPerHectare: "",
      centPerTree: ""
    }));
    setStandsDialogOpen(true);
  };

  const handleEditStands = (stand) => {
    fetchDistricts();
    setEditingStands(stand);
    setStandsFormData({
      standsPerHectareId: stand.standsPerHectareId || "",
      cropId: stand.cropId != null ? String(stand.cropId) : "",  // ← force string
      isState: stand.isState || false,
      distId: stand.distId != null ? String(stand.distId) : "",
      standsPerHectare: stand.standsPerHectare != null ? String(stand.standsPerHectare) : "",
      centPerTree: stand.centPerTree != null ? String(stand.centPerTree) : "",
      isActive: stand.isActive !== undefined ? stand.isActive : true,
      addedBy: AuthService.userid()
    });
    setValidationErrors((prev) => ({
      ...prev,
      standsPerHectare: "",
      centPerTree: ""
    }));
    setStandsDialogOpen(true);
  };

  const handleSaveStands = async () => {
    if (!standsFormData.cropId) {
      setSnackbar({ open: true, message: "Please select a crop", severity: "warning" });
      return;
    }

    if (!standsFormData.isState && !standsFormData.distId) {
      setSnackbar({ open: true, message: "Please select a district", severity: "warning" });
      return;
    }

    let hasError = false;
    const fieldErrors = {
      standsPerHectare: "",
      centPerTree: ""
    };

    const standsVal = standsFormData.standsPerHectare != null ? String(standsFormData.standsPerHectare).trim() : "";
    if (!standsVal) {
      fieldErrors.standsPerHectare = "Stands per hectare is required";
      hasError = true;
    } else if (!/^\d+(\.\d+)?$/.test(standsVal)) {
      fieldErrors.standsPerHectare = "Only numbers and decimal numbers are allowed";
      hasError = true;
    } else if (standsVal.length > 10) {
      fieldErrors.standsPerHectare = "Maximum 10 characters allowed";
      hasError = true;
    }

    const centVal = standsFormData.centPerTree != null ? String(standsFormData.centPerTree).trim() : "";
    if (centVal) {
      if (!/^\d+(\.\d+)?$/.test(centVal)) {
        fieldErrors.centPerTree = "Only numbers and decimal numbers are allowed";
        hasError = true;
      } else if (centVal.length > 10) {
        fieldErrors.centPerTree = "Maximum 10 characters allowed";
        hasError = true;
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors
    }));

    if (hasError) {
      if (fieldErrors.standsPerHectare === "Stands per hectare is required") {
        setSnackbar({ open: true, message: "Stands per hectare is required", severity: "warning" });
      } else {
        setSnackbar({ open: true, message: "Only numbers and decimal numbers are allowed", severity: "warning" });
      }
      return;
    }

    try {
      const payload = {
        ...standsFormData,
        cropId: parseInt(standsFormData.cropId),
        distId: standsFormData.isState ? null : (standsFormData.distId ? parseInt(standsFormData.distId) : null),
        standsPerHectare: standsVal,
        centPerTree: centVal || null,
        addedBy: AuthService.userid()
      };

      const response = await api.post(`${BASE_URL}/earas-form1-entry/api/master-stands-per-hectare/add`, payload);

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: editingStands ? "Stands data updated successfully" : "Stands data added successfully",
          severity: "success"
        });
        handleCloseStandsDialog();
        fetchStandsData();
      } else {
        throw new Error("Failed to save stands data");
      }
    } catch (error) {
      console.error("Error saving stands data:", error);
      setSnackbar({ open: true, message: extractErrorMessage(error, "Failed to save stands data"), severity: "error" });
    }
  };

  const handleCloseIrrigationDialog = () => {
    setIrrigationDialogOpen(false);
    setValidationErrors((prev) => ({
      ...prev,
      irrigationType: "",
      irrigationCodeDes: ""
    }));
  };

  const handleAddIrrigation = () => {
    setEditingIrrigation(null);
    setIrrigationFormData({
      sourceId: null,                  // ✅ explicit null → backend insert branch
      irrigationType: "",
      irrigationCodeDes: "",
      isActive: true,
      addedBy: AuthService.userid()
    });
    setValidationErrors((prev) => ({ ...prev, irrigationType: "", irrigationCodeDes: "" }));
    setIrrigationDialogOpen(true);
  };

  const handleEditIrrigation = (irrigation) => {
    setEditingIrrigation(irrigation);
    setIrrigationFormData({
      sourceId: irrigation.sourceId ?? null,     // ✅ preserve real id, null fallback
      irrigationType: irrigation.irrigationType || "",
      irrigationCodeDes: irrigation.irrigationCodeDes || "",
      isActive: irrigation.isActive === true || irrigation.isActive === 1 || irrigation.isActive === "true",
      addedBy: AuthService.userid()              // ✅ include
    });
    setValidationErrors((prev) => ({ ...prev, irrigationType: "", irrigationCodeDes: "" }));
    setIrrigationDialogOpen(true);
  };

  const handleSaveIrrigation = async () => {
    const trimmedType = irrigationFormData.irrigationType.trim();

    // 🔹 1. Required check
    if (!trimmedType) {
      setSnackbar({ open: true, message: "Irrigation type is required", severity: "warning" });
      setValidationErrors((prev) => ({ ...prev, irrigationType: "Irrigation type is required" }));
      return;
    }

    // 🔹 Format check allowing commas
    if (!validateIrrigationTypeText(trimmedType)) {
      setSnackbar({ open: true, message: "Only English alphabets and commas allowed for irrigation type", severity: "warning" });
      setValidationErrors((prev) => ({ ...prev, irrigationType: "Only English alphabets and commas allowed" }));
      return;
    }

    if (validationErrors.irrigationType) {
      setSnackbar({ open: true, message: validationErrors.irrigationType, severity: "warning" });
      return;
    }

    // 🔹 Validation check for irrigation code (max 3 digits)
    if (validationErrors.irrigationCodeDes) {
      setSnackbar({ open: true, message: validationErrors.irrigationCodeDes, severity: "warning" });
      return;
    }

    if (irrigationFormData.irrigationCodeDes !== "" && irrigationFormData.irrigationCodeDes !== null && irrigationFormData.irrigationCodeDes !== undefined) {
      const codeStr = String(irrigationFormData.irrigationCodeDes).trim();
      if (!/^\d+$/.test(codeStr)) {
        setSnackbar({ open: true, message: "Irrigation code must be numeric", severity: "warning" });
        return;
      }
      if (codeStr.length > 3) {
        setSnackbar({ open: true, message: "Maximum 3 digits allowed for irrigation code", severity: "warning" });
        return;
      }
    }

    // 🔹 2. Client-side duplicate check (case-insensitive, ignores self when editing)
    const isDuplicate = irrigationData.some(
      (irr) =>
        irr.irrigationType &&
        irr.irrigationType.trim().toLowerCase() === trimmedType.toLowerCase() &&
        irr.sourceId !== irrigationFormData.sourceId
    );

    if (isDuplicate) {
      setSnackbar({
        open: true,
        message: `Irrigation type already exists: ${trimmedType}`,
        severity: "error"
      });
      setValidationErrors((prev) => ({ ...prev, irrigationType: "Irrigation type already exists" }));
      return;
    }

    try {
      const isActiveBoolean =
        irrigationFormData.isActive === true ||
        irrigationFormData.isActive === "true" ||
        irrigationFormData.isActive === 1;

      const payload = {
        sourceId: irrigationFormData.sourceId ?? null,   // ✅ null → insert branch
        irrigationType: trimmedType,
        irrigationCodeDes: irrigationFormData.irrigationCodeDes || null,
        isActive: isActiveBoolean,
        addedBy: AuthService.userid()
      };

      console.log("Saving irrigation payload:", payload);

      const response = await api.post(
        `${BASE_URL}/earas-form1-entry/irrigation-details/master-irrigation-source/add`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        setSnackbar({
          open: true,
          message: editingIrrigation
            ? "Irrigation source updated successfully"
            : "Irrigation source added successfully",
          severity: "success"
        });
        handleCloseIrrigationDialog();
        fetchIrrigationData();
      } else {
        throw new Error("Failed to save irrigation source");
      }
    } catch (error) {
      console.error("Error saving irrigation source:", error);

      // 🔹 3. Surface backend duplicate / validation errors
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save irrigation source";

      setSnackbar({ open: true, message: backendMsg, severity: "error" });
    }
  };

  const handleCloseCceDialog = () => {
    setCceDialogOpen(false);
    setEditingCce(null);
    setValidationErrors((prev) => ({
      ...prev,
      noOfCce: "",
      cceUnitId: "",
      frameId: "",
      frameUnitId: "",
      frameLength: "",
      frameWidth: "",
      cceVisitLimit: ""
    }));
  };

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
    setValidationErrors((prev) => ({
      ...prev,
      noOfCce: "",
      cceUnitId: "",
      frameId: "",
      frameUnitId: "",
      frameLength: "",
      frameWidth: "",
      cceVisitLimit: ""
    }));
    setCceDialogOpen(true);
  };

  const handleEditCce = (cce) => {
    fetchCropGroups();
    fetchUnitsList();
    fetchFrames();

    setEditingCce(cce);
    setCceFormData({
      cceId: cce.cceId || "",
      cceCropType: cce.cceCropType
        ? (cce.cceCropType.toLowerCase() === "major"
          ? "Major"
          : cce.cceCropType.toLowerCase() === "minor"
            ? "Minor"
            : cce.cceCropType)
        : "",
      noOfCce: cce.noOfCce != null ? String(cce.noOfCce) : "",
      selectionFromOutOfCluster: cce.selectionFromOutOfCluster || false,
      isCollectedRepeatedly: cce.isCollectedRepeatedly || false,
      isRandomSelected: cce.isRandomSelected || false,
      isTreeWiseCollection: cce.isTreeWiseCollection || false,
      isAlgorithmic: cce.isAlgorithmic || false,
      frameLength: cce.frameLength != null ? String(cce.frameLength) : "",
      frameWidth: cce.frameWidth != null ? String(cce.frameWidth) : "",
      cceVisitLimit: cce.cceVisitLimit != null ? String(cce.cceVisitLimit) : "",
      cropId: cce.cropId || "",
      cceUnitId: cce.cceUnitId || cce.unitId || "",
      frameUnitId: cce.frameUnitId || "",
      frameId: cce.frameId || "",
      isActive: cce.isActive !== undefined ? cce.isActive : true
    });
    setValidationErrors((prev) => ({
      ...prev,
      noOfCce: "",
      cceUnitId: "",
      frameId: "",
      frameUnitId: "",
      frameLength: "",
      frameWidth: "",
      cceVisitLimit: ""
    }));
    setCceDialogOpen(true);
  };

  const handleSaveCce = async () => {
    if (!cceFormData.cceCropType || !cceFormData.cceCropType.trim()) {
      setSnackbar({ open: true, message: "CCE Crop Type is required", severity: "warning" });
      return;
    }

    if (!cceFormData.cropId) {
      setSnackbar({ open: true, message: "Please select a crop", severity: "warning" });
      return;
    }

    let hasError = false;
    const fieldErrors = {
      noOfCce: "",
      cceUnitId: "",
      frameId: "",
      frameUnitId: "",
      frameLength: "",
      frameWidth: "",
      cceVisitLimit: ""
    };

    if (cceFormData.noOfCce === "" || cceFormData.noOfCce === null || cceFormData.noOfCce === undefined || String(cceFormData.noOfCce).trim() === "") {
      fieldErrors.noOfCce = "Number of CCE is required";
      hasError = true;
    } else {
      const cceStr = String(cceFormData.noOfCce).trim();
      if (!/^\d+$/.test(cceStr)) {
        fieldErrors.noOfCce = "Only numbers allowed";
        hasError = true;
      } else if (cceStr.length > 2) {
        fieldErrors.noOfCce = "Maximum 2 digits allowed";
        hasError = true;
      } else if (parseInt(cceStr, 10) < 1) {
        fieldErrors.noOfCce = "Value must be greater than 0";
        hasError = true;
      }
    }

    if (!cceFormData.cceUnitId) {
      fieldErrors.cceUnitId = "CCE unit is required";
      hasError = true;
    }

    if (!cceFormData.frameId) {
      fieldErrors.frameId = "Frame is required";
      hasError = true;
    }

    if (!cceFormData.frameUnitId) {
      fieldErrors.frameUnitId = "Frame unit is required";
      hasError = true;
    }

    if (cceFormData.frameLength !== "" && cceFormData.frameLength !== null && cceFormData.frameLength !== undefined) {
      const flStr = String(cceFormData.frameLength).trim();
      if (!/^\d+$/.test(flStr)) {
        fieldErrors.frameLength = "Only numbers allowed";
        hasError = true;
      } else if (flStr.length > 3) {
        fieldErrors.frameLength = "Maximum 3 digits allowed";
        hasError = true;
      } else if (parseInt(flStr, 10) < 1) {
        fieldErrors.frameLength = "Value must be greater than 0";
        hasError = true;
      }
    }

    if (cceFormData.frameWidth !== "" && cceFormData.frameWidth !== null && cceFormData.frameWidth !== undefined) {
      const fwStr = String(cceFormData.frameWidth).trim();
      if (!/^\d+$/.test(fwStr)) {
        fieldErrors.frameWidth = "Only numbers allowed";
        hasError = true;
      } else if (fwStr.length > 3) {
        fieldErrors.frameWidth = "Maximum 3 digits allowed";
        hasError = true;
      } else if (parseInt(fwStr, 10) < 1) {
        fieldErrors.frameWidth = "Value must be greater than 0";
        hasError = true;
      }
    }

    if (cceFormData.cceVisitLimit !== "" && cceFormData.cceVisitLimit !== null && cceFormData.cceVisitLimit !== undefined) {
      const vlStr = String(cceFormData.cceVisitLimit).trim();
      if (!/^\d+$/.test(vlStr)) {
        fieldErrors.cceVisitLimit = "Only numbers allowed";
        hasError = true;
      } else if (vlStr.length > 2) {
        fieldErrors.cceVisitLimit = "Maximum 2 digits allowed";
        hasError = true;
      } else if (parseInt(vlStr, 10) < 1) {
        fieldErrors.cceVisitLimit = "Value must be greater than 0";
        hasError = true;
      }
    }

    setValidationErrors((prev) => ({
      ...prev,
      ...fieldErrors
    }));

    if (hasError) {
      const firstError = fieldErrors.noOfCce || fieldErrors.cceUnitId || fieldErrors.frameId || fieldErrors.frameUnitId || fieldErrors.frameLength || fieldErrors.frameWidth || fieldErrors.cceVisitLimit;
      setSnackbar({ open: true, message: firstError || "Please fill in all mandatory fields", severity: "warning" });
      return;
    }

    try {
      const payload = {
        ...cceFormData,
        noOfCce: cceFormData.noOfCce ? parseInt(cceFormData.noOfCce, 10) : null,
        frameLength: cceFormData.frameLength ? parseInt(cceFormData.frameLength, 10) : null,
        frameWidth: cceFormData.frameWidth ? parseInt(cceFormData.frameWidth, 10) : null,
        cceVisitLimit: cceFormData.cceVisitLimit ? parseInt(cceFormData.cceVisitLimit, 10) : null,
        cropId: parseInt(cceFormData.cropId, 10),
        cceUnitId: cceFormData.cceUnitId ? parseInt(cceFormData.cceUnitId, 10) : null,
        frameUnitId: cceFormData.frameUnitId ? parseInt(cceFormData.frameUnitId, 10) : null,
        frameId: cceFormData.frameId ? parseInt(cceFormData.frameId, 10) : null,
        addedBy: AuthService.userid()
      };

      const response = await api.post(`${BASE_URL}/earas-form1-entry/cce-crop-details/master-cce-crop/add`, payload);

      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: editingCce ? "CCE Crop updated successfully" : "CCE Crop added successfully", severity: "success" });
        setCceDialogOpen(false);
        fetchCceCrops();
      } else {
        throw new Error("Failed to save CCE crop");
      }
    } catch (error) {
      console.error("Error saving CCE crop:", error);
      setSnackbar({ open: true, message: "Failed to save CCE crop", severity: "error" });
    }
  };

  const getFilteredCce = () => {
    if (!Array.isArray(cceCrops) || cceCrops.length === 0) return [];
    if (!cceSearchTerm.trim()) return cceCrops;
    const searchLower = cceSearchTerm.toLowerCase();
    return cceCrops.filter((cce) =>
      (cce.cceCropType && cce.cceCropType.toLowerCase().includes(searchLower)) ||
      (cce.cropNameEn && cce.cropNameEn.toLowerCase().includes(searchLower))
    );
  };

  const getFilteredYieldTypes = () => {
    if (!Array.isArray(cropYieldTypes) || cropYieldTypes.length === 0) return [];

    if (!yieldSearchTerm || !yieldSearchTerm.trim()) return cropYieldTypes;

    const searchLower = yieldSearchTerm.toLowerCase().trim();

    return cropYieldTypes.filter((yieldType) => {
      if (yieldType.cropYieldNameEn &&
        yieldType.cropYieldNameEn.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (yieldType.cropYieldNameMal &&
        yieldType.cropYieldNameMal.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (yieldType.cropNameEn &&
        yieldType.cropNameEn.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (yieldType.resultType &&
        yieldType.resultType.toLowerCase().includes(searchLower)) {
        return true;
      }

      if (yieldType.resultUnit &&
        yieldType.resultUnit.toLowerCase().includes(searchLower)) {
        return true;
      }

      return false;
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
    return standsData.filter((stand) =>
      (stand.cropNameEn && stand.cropNameEn.toLowerCase().includes(searchLower)) ||
      (stand.distNameEn && stand.distNameEn.toLowerCase().includes(searchLower)) ||
      (stand.standsPerHectare && stand.standsPerHectare.toString().includes(searchLower))
    );
  };

  const getFilteredIrrigation = () => {
    if (!Array.isArray(irrigationData) || irrigationData.length === 0) return [];
    if (!irrigationSearchTerm.trim()) return irrigationData;
    const searchLower = irrigationSearchTerm.toLowerCase();
    return irrigationData.filter((irr) =>
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

  const cropColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
    { id: "cropNameEn", label: "Crop Name (English)", minWidth: 180 },
    { id: "cropNameMal", label: "Crop Name (Malayalam)", minWidth: 180 },
    { id: "scientificName", label: "Scientific Name", minWidth: 180 },
    { id: "isHorti", label: "Horticulture", minWidth: 100 },
    { id: "groupName", label: "Crop Group", minWidth: 130 },
    { id: "classGroupName", label: "Crop Class Group", minWidth: 140 },
    { id: "hortiGroupName", label: "Horti Group", minWidth: 130 },
    { id: "cropType", label: "Crop Type", minWidth: 120 },
    { id: "unitName", label: "Unit", minWidth: 100 },
    { id: "classification", label: "Seasonal Classification", minWidth: 180 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const unitColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
    { id: "unitName", label: "Unit Name", minWidth: 250 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const standsColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
    { id: "cropNameEn", label: "Crop Name", minWidth: 180 },
    { id: "isState", label: "Level", minWidth: 100 },
    { id: "districtName", label: "District Name", minWidth: 150 },
    { id: "standsPerHectare", label: "Stands/Hectare", minWidth: 130 },
    { id: "centPerTree", label: "Cent/Tree", minWidth: 100 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const irrigationColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
    { id: "irrigationType", label: "Irrigation Type", minWidth: 250 },
    { id: "irrigationCodeDes", label: "Irrigation Code", minWidth: 150 },
    { id: "isActive", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 100, sortable: false }
  ];

  const cceColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
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

  const yieldColumns = [
    { id: "slNo", label: "Sl.No", minWidth: 70, sortable: false },
    { id: "cropYieldNameEn", label: "Yield Name (English)", minWidth: 180 },
    { id: "cropYieldNameMal", label: "Yield Name (Malayalam)", minWidth: 180 },
    { id: "cropName", label: "Crop Name", minWidth: 180 },
    { id: "resultType", label: "Result Type", minWidth: 150 },
    { id: "resultUnit", label: "Result Unit", minWidth: 150 },
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
    } else if (type === 'cce') {
      const isAsc = cceOrderBy === property && cceOrder === "asc";
      setCceOrder(isAsc ? "desc" : "asc");
      setCceOrderBy(property);
    } else if (type === 'yield') {
      const isAsc = yieldOrderBy === property && yieldOrder === "asc";
      setYieldOrder(isAsc ? "desc" : "asc");
      setYieldOrderBy(property);
    }
  };

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Crops Settings
        </Typography>
        <Box>
          <Paper sx={{ p: 4, mb: 4, boxShadow: 6, borderRadius: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Crop Management" />
              <Tab label="Unit Management" />
              <Tab label="Stands Per Hectare Management" />
              <Tab label="Irrigation Source Management" />
              <Tab label="CCE Crop Management" />
              <Tab label="Crop Yield Management" />
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
                    inputProps={{ maxLength: 50 }}
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

                {searchTerm && !loading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: `${themeColor} !important`, fontWeight: "bold" }}
                      >
                      </Typography>{" "}
                      ({totalCropsCount} crops found)
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
                              <TableSortLabel
                                active={orderBy === column.id}
                                direction={orderBy === column.id ? order : "asc"}
                                onClick={() => handleRequestSort(column.id, 'crops')}
                                sx={{
                                  color: "white",
                                  '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                  '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                                }}
                              >
                                {column.label}
                              </TableSortLabel>
                            ) : (column.label)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={cropColumns.length} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : displayCrops.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={cropColumns.length} align="center">
                            {searchTerm ? "No matching crops found" : "No crops available"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        displayCrops.map((crop, index) => (
                          <TableRow hover key={crop.cropId}>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{crop.cropNameEn}</TableCell>
                            <TableCell>{crop.cropNameMal || "-"}</TableCell>
                            <TableCell>{crop.scientificName || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={crop.isHorti ? "Yes" : "No"}
                                color={crop.isHorti ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{crop.groupName || "-"}</TableCell>
                            <TableCell>{crop.classGroupName || "-"}</TableCell>
                            <TableCell>{crop.hortiGroupName || "-"}</TableCell>
                            <TableCell>{crop.cropType || "-"}</TableCell>
                            <TableCell>{crop.unitName || "-"}</TableCell>
                            <TableCell>
                              {/* Display Seasonal Classifications as Chips */}
                              {crop.cropGrowthStageResponseList && crop.cropGrowthStageResponseList.length > 0 ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {crop.cropGrowthStageResponseList.map((stage, idx) => (
                                    <Chip
                                      key={idx}
                                      label={stage.seasonalClassificationName}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem' }}
                                    />
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="textSecondary">-</Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={crop.isActive ? "Active" : "Inactive"} color={crop.isActive ? "success" : "default"} size="small" />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => handleEditCrop(crop)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

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
                  <TextField variant="outlined" size="small" placeholder="Search units..." value={unitsSearchTerm} onChange={(e) => { setUnitsSearchTerm(e.target.value); setUnitsPage(0); }} sx={{ width: '300px' }} inputProps={{ maxLength: 50 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchUnits}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddUnit} sx={{ backgroundColor: themeColor }}>Add Unit</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {unitColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel
                              active={unitsOrderBy === column.id}
                              direction={unitsOrderBy === column.id ? unitsOrder : "asc"}
                              onClick={() => handleRequestSort(column.id, 'units')}
                              sx={{
                                color: "white",
                                '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                              }}
                            >
                              {column.label}
                            </TableSortLabel>) : (column.label)}
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
                  <TextField variant="outlined" size="small" placeholder="Search by crop or stands..." value={standsSearchTerm} onChange={(e) => { setStandsSearchTerm(e.target.value); setStandsPage(0); }} sx={{ width: '300px' }} inputProps={{ maxLength: 50 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchStandsData}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStands} sx={{ backgroundColor: themeColor }}>Add Stands Data</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {standsColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel
                              active={standsOrderBy === column.id}
                              direction={standsOrderBy === column.id ? standsOrder : "asc"}
                              onClick={() => handleRequestSort(column.id, 'stands')}
                              sx={{
                                color: "white",
                                '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                              }}
                            >
                              {column.label}
                            </TableSortLabel>) : (column.label)}
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
                          return (
                            <TableRow hover key={stand.standsPerHectareId}>
                              <TableCell>{standsPage * standsRowsPerPage + index + 1}</TableCell>
                              <TableCell>{stand.cropNameEn || "-"}</TableCell>
                              <TableCell><Chip label={stand.isState ? "State" : "District"} color={stand.isState ? "primary" : "default"} size="small" /></TableCell>
                              <TableCell>{stand.isState ? "All Districts" : (stand.distNameEn || "-")}</TableCell>
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
                  <TextField variant="outlined" size="small" placeholder="Search irrigation type..." value={irrigationSearchTerm} onChange={(e) => { setIrrigationSearchTerm(e.target.value); setIrrigationPage(0); }} sx={{ width: '300px' }} inputProps={{ maxLength: 50 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
                  <Box><Tooltip title="Refresh"><IconButton onClick={fetchIrrigationData}><RefreshIcon /></IconButton></Tooltip><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddIrrigation} sx={{ backgroundColor: themeColor }}>Add Irrigation Source</Button></Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {irrigationColumns.map((column) => (
                          <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: themeColor, color: "white", fontWeight: "bold" }}>
                            {column.sortable !== false ? (<TableSortLabel
                              active={irrigationOrderBy === column.id}
                              direction={irrigationOrderBy === column.id ? irrigationOrder : "asc"}
                              onClick={() => handleRequestSort(column.id, 'irrigation')}
                              sx={{
                                color: "white",
                                '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                              }}
                            >
                              {column.label}
                            </TableSortLabel>) : (column.label)}
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
                            <TableCell>
                              <Chip
                                label={irr.isActive ? "Active" : "Inactive"}
                                color={irr.isActive ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => handleEditIrrigation(irr)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {!irrigationLoading && sortedIrrigation.length > 0 && (<TablePagination rowsPerPageOptions={[5, 10, 25, 50]} component="div" count={sortedIrrigation.length} rowsPerPage={irrigationRowsPerPage} page={irrigationPage} onPageChange={(e, p) => setIrrigationPage(p)} onRowsPerPageChange={(e) => { setIrrigationRowsPerPage(parseInt(e.target.value, 10)); setIrrigationPage(0); }} sx={{ mt: 2 }} />)}
              </>
            )}

            {/* CCE Crop Tab */}
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
                    inputProps={{ maxLength: 50 }}
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
                                sx={{
                                  color: "white",
                                  '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                  '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                                }}
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
                        paginatedCce.map((cce, index) => (
                          <TableRow hover key={cce.cceId}>
                            <TableCell>{ccePage * cceRowsPerPage + index + 1}</TableCell>
                            <TableCell>{cce.cceCropType}</TableCell>
                            <TableCell>{cce.cropNameEn || "-"}</TableCell>
                            <TableCell>{cce.noOfCce || "-"}</TableCell>

                            <TableCell>
                              {cce.frameId ? (
                                (() => {
                                  const frame = frames.find(f => f.id === cce.frameId);
                                  return frame ? (frame.frameName || frame.frame) : (cce.frame || cce.frameName || "-");
                                })()
                              ) : (
                                cce.frame || cce.frameName || "-"
                              )}
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
                                color={cce.isActive ? "success" : "error"}
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
            {/* Yield Management Tab */}
            {activeTab === 5 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search by yield name or crop..."
                    value={yieldSearchTerm}
                    onChange={(e) => {
                      setYieldSearchTerm(e.target.value);
                      setYieldPage(0);
                    }}
                    sx={{ width: '350px' }}
                    inputProps={{ maxLength: 50 }}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
                    }}
                  />
                  <Box>
                    <Tooltip title="Refresh">
                      <IconButton onClick={fetchCropYieldTypes}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddYield}
                      sx={{ backgroundColor: themeColor, ml: 1 }}
                    >
                      Add Yield Type
                    </Button>
                  </Box>
                </Box>

                {yieldSearchTerm && !yieldLoading && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                    </Typography>
                  </Box>
                )}

                <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {yieldColumns.map((column) => (
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
                                active={yieldOrderBy === column.id}
                                direction={yieldOrderBy === column.id ? yieldOrder : "asc"}
                                onClick={() => handleRequestSort(column.id, 'yield')}
                                sx={{
                                  color: "white",
                                  '&.Mui-active': { color: 'rgba(255, 255, 255, 0.7)' },
                                  '& .MuiTableSortLabel-icon': { color: 'rgba(255, 255, 255, 0.7) !important' }
                                }}
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
                      {yieldLoading ? (
                        <TableRow>
                          <TableCell colSpan={yieldColumns.length} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : getFilteredYieldTypes().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={yieldColumns.length} align="center">
                            {yieldSearchTerm ? "No matching yield types found" : "No yield types available"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        getFilteredYieldTypes().map((yieldType, index) => (
                          <TableRow hover key={yieldType.cropYieldTypeId || index}>
                            <TableCell>{yieldPage * yieldRowsPerPage + index + 1}</TableCell>
                            <TableCell>{yieldType.cropYieldNameEn || "-"}</TableCell>
                            <TableCell>{yieldType.cropYieldNameMal || "-"}</TableCell>
                            <TableCell>{yieldType.cropNameEn || "-"}</TableCell>
                            <TableCell>{yieldType.resultType || "-"}</TableCell>
                            <TableCell>{yieldType.resultUnit || "-"}</TableCell>
                            <TableCell>
                              <Chip
                                label={yieldType.isActive ? "Active" : "Inactive"}
                                color={yieldType.isActive ? "success" : "error"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => handleEditYield(yieldType)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {!yieldLoading && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalYieldCount}
                    rowsPerPage={yieldRowsPerPage}
                    page={yieldPage}
                    onPageChange={(e, newPage) => {
                      setYieldPage(newPage);
                      fetchCropYieldTypes(newPage, yieldRowsPerPage);
                    }}
                    onRowsPerPageChange={(e) => {
                      const newSize = parseInt(e.target.value, 10);
                      setYieldRowsPerPage(newSize);
                      setYieldPage(0);
                      fetchCropYieldTypes(0, newSize);
                    }}
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
          </Paper>
        </Box>
      </Grid>

      <Dialog open={addCropDialogOpen} onClose={handleCloseAddCropDialog} maxWidth="md" fullWidth>
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
                  setNewCropFormData((prev) => ({ ...prev, cropNameEn: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Crop name (English) is required" }));
                  } else if (!validateEnglishText(value)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Only English alphabets allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Maximum 100 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "" }));
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
                required
                value={newCropFormData.cropNameMal}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewCropFormData((prev) => ({ ...prev, cropNameMal: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Crop name (Malayalam) is required" }));
                  } else if (!validateMalayalamText(value)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Only Malayalam characters allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Maximum 100 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "" }));
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
                required
                value={newCropFormData.scientificName}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewCropFormData((prev) => ({ ...prev, scientificName: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Scientific name is required" }));
                  } else if (!validateScientificName(value)) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Only English letters, spaces, dots, and parentheses allowed" }));
                  } else if (!validateTextFieldLength(value, 200)) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Maximum 200 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "" }));
                  }
                }}
                error={!!validationErrors.scientificName}
                helperText={validationErrors.scientificName}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropGroupId}>
                <InputLabel id="add-crop-group-label">Crop Group</InputLabel>
                <Select
                  labelId="add-crop-group-label"
                  value={newCropFormData.cropGroupId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCropFormData((prev) => ({ ...prev, cropGroupId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropGroupId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropGroupId: "Crop group is required" }));
                    }
                  }}
                  label="Crop Group"
                >
                  {cropGroups.map((group) => (
                    <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropGroupId && (
                  <FormHelperText>{validationErrors.cropGroupId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropClassGroupId}>
                <InputLabel id="add-crop-class-group-label">Crop Class Group</InputLabel>
                <Select
                  labelId="add-crop-class-group-label"
                  value={newCropFormData.cropClassGroupId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCropFormData((prev) => ({ ...prev, cropClassGroupId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropClassGroupId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropClassGroupId: "Crop class group is required" }));
                    }
                  }}
                  label="Crop Class Group"
                >
                  {cropClassGroups.map((group) => (
                    <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropClassGroupId && (
                  <FormHelperText>{validationErrors.cropClassGroupId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropTypeId}>
                <InputLabel id="add-crop-type-label">Crop Type</InputLabel>
                <Select
                  labelId="add-crop-type-label"
                  value={newCropFormData.cropTypeId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCropFormData((prev) => ({ ...prev, cropTypeId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropTypeId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropTypeId: "Crop type is required" }));
                    }
                  }}
                  label="Crop Type"
                >
                  {cropTypes.map((type) => (
                    <MenuItem key={type.cropTypeId} value={type.cropTypeId}>
                      {type.cropType}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropTypeId && (
                  <FormHelperText>{validationErrors.cropTypeId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.unitId}>
                <InputLabel id="add-crop-unit-label">Unit</InputLabel>
                <Select
                  labelId="add-crop-unit-label"
                  value={newCropFormData.unitId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCropFormData((prev) => ({ ...prev, unitId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, unitId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, unitId: "Unit is required" }));
                    }
                  }}
                  label="Unit"
                >
                  {unitsList.map((unit) => (
                    <MenuItem key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.unitId && (
                  <FormHelperText>{validationErrors.unitId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.classificationIds}>
                <InputLabel id="add-seasonal-classifications-label">Seasonal Classifications</InputLabel>
                <Select
                  labelId="add-seasonal-classifications-label"
                  multiple
                  value={newCropFormData.classificationIds || []}
                  onChange={(e) => {
                    const selectedValues = e.target.value;
                    const ids = typeof selectedValues === 'string'
                      ? selectedValues.split(',')
                      : selectedValues;
                    setNewCropFormData((prev) => ({
                      ...prev,
                      classificationIds: ids
                    }));
                    if (ids && ids.length > 0) {
                      setValidationErrors((prev) => ({ ...prev, classificationIds: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, classificationIds: "At least one seasonal classification is required" }));
                    }
                  }}
                  input={<OutlinedInput label="Seasonal Classifications" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const stage = growthStages.find(s => s.classificationId === value);
                        return (
                          <Chip
                            key={value}
                            label={stage ? stage.seasonalClassificationName : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 300,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {growthStages.map((stage) => (
                    <MenuItem key={stage.classificationId} value={stage.classificationId}>
                      <Checkbox
                        checked={(newCropFormData.classificationIds || []).indexOf(stage.classificationId) > -1}
                        size="small"
                      />
                      <ListItemText primary={stage.seasonalClassificationName} />
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.classificationIds && (
                  <FormHelperText>{validationErrors.classificationIds}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newCropFormData.isHorti}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewCropFormData((prev) => ({
                        ...prev,
                        isHorti: checked,
                        hortiGroupId: checked ? prev.hortiGroupId : ""
                      }));
                      if (!checked) {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "" }));
                      }
                    }}
                    color="primary"
                  />
                }
                label="Horticulture Crop"
              />
            </Grid>

            {newCropFormData.isHorti && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.hortiGroupId}>
                  <InputLabel id="add-horti-group-label">Horti Group</InputLabel>
                  <Select
                    labelId="add-horti-group-label"
                    value={newCropFormData.hortiGroupId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewCropFormData((prev) => ({ ...prev, hortiGroupId: value }));
                      if (value) {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "" }));
                      } else {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "Horti group is required" }));
                      }
                    }}
                    label="Horti Group"
                  >
                    {cropGroups.map((group) => (
                      <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                        {group.groupName}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.hortiGroupId && (
                    <FormHelperText>{validationErrors.hortiGroupId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newCropFormData.isActive}
                    onChange={(e) => setNewCropFormData({ ...newCropFormData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCropDialog}>Cancel</Button>
          <Button onClick={handleSaveNewCrop} variant="contained" sx={{ backgroundColor: themeColor }}>
            Save Crop
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Crop Dialog */}
      <Dialog open={editCropDialogOpen} onClose={handleCloseEditCropDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
          Edit Crop
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Crop Name (English) */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Crop Name (English)"
                fullWidth
                required
                value={editCropFormData.cropNameEn}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditCropFormData((prev) => ({ ...prev, cropNameEn: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Crop name (English) is required" }));
                  } else if (!validateEnglishText(value)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Only English alphabets allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "Maximum 100 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, cropNameEn: "" }));
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
                required
                value={editCropFormData.cropNameMal}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditCropFormData((prev) => ({ ...prev, cropNameMal: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Crop name (Malayalam) is required" }));
                  } else if (!validateMalayalamText(value)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Only Malayalam characters allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "Maximum 100 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, cropNameMal: "" }));
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
                required
                value={editCropFormData.scientificName}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditCropFormData((prev) => ({ ...prev, scientificName: value }));
                  if (!value || value.trim().length === 0) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Scientific name is required" }));
                  } else if (!validateScientificName(value)) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Only English letters, spaces, dots, and parentheses allowed" }));
                  } else if (!validateTextFieldLength(value, 200)) {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "Maximum 200 characters allowed" }));
                  } else {
                    setValidationErrors((prev) => ({ ...prev, scientificName: "" }));
                  }
                }}
                error={!!validationErrors.scientificName}
                helperText={validationErrors.scientificName}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropGroupId}>
                <InputLabel id="edit-crop-group-label">Crop Group</InputLabel>
                <Select
                  labelId="edit-crop-group-label"
                  value={editCropFormData.cropGroupId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditCropFormData((prev) => ({ ...prev, cropGroupId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropGroupId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropGroupId: "Crop group is required" }));
                    }
                  }}
                  label="Crop Group"
                >
                  {cropGroups.map((group) => (
                    <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropGroupId && (
                  <FormHelperText>{validationErrors.cropGroupId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropClassGroupId}>
                <InputLabel id="edit-crop-class-group-label">Crop Class Group</InputLabel>
                <Select
                  labelId="edit-crop-class-group-label"
                  value={editCropFormData.cropClassGroupId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditCropFormData((prev) => ({ ...prev, cropClassGroupId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropClassGroupId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropClassGroupId: "Crop class group is required" }));
                    }
                  }}
                  label="Crop Class Group"
                >
                  {cropClassGroups.map((group) => (
                    <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                      {group.groupName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropClassGroupId && (
                  <FormHelperText>{validationErrors.cropClassGroupId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cropTypeId}>
                <InputLabel id="edit-crop-type-label">Crop Type</InputLabel>
                <Select
                  labelId="edit-crop-type-label"
                  value={editCropFormData.cropTypeId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditCropFormData((prev) => ({ ...prev, cropTypeId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cropTypeId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cropTypeId: "Crop type is required" }));
                    }
                  }}
                  label="Crop Type"
                >
                  {cropTypes.map((type) => (
                    <MenuItem key={type.cropTypeId} value={type.cropTypeId}>
                      {type.cropType}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cropTypeId && (
                  <FormHelperText>{validationErrors.cropTypeId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.unitId}>
                <InputLabel id="edit-crop-unit-label">Unit</InputLabel>
                <Select
                  labelId="edit-crop-unit-label"
                  value={editCropFormData.unitId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditCropFormData((prev) => ({ ...prev, unitId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, unitId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, unitId: "Unit is required" }));
                    }
                  }}
                  label="Unit"
                >
                  {unitsList.map((unit) => (
                    <MenuItem key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.unitId && (
                  <FormHelperText>{validationErrors.unitId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.classificationIds}>
                <InputLabel id="edit-seasonal-classifications-label">Seasonal Classifications</InputLabel>
                <Select
                  labelId="edit-seasonal-classifications-label"
                  multiple
                  value={editCropFormData.classificationIds || []}
                  onChange={(e) => {
                    const selectedValues = e.target.value;
                    const ids = typeof selectedValues === 'string'
                      ? selectedValues.split(',')
                      : selectedValues;
                    setEditCropFormData((prev) => ({
                      ...prev,
                      classificationIds: ids
                    }));
                    if (ids && ids.length > 0) {
                      setValidationErrors((prev) => ({ ...prev, classificationIds: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, classificationIds: "At least one seasonal classification is required" }));
                    }
                  }}
                  input={<OutlinedInput label="Seasonal Classifications" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const stage = growthStages.find(s => s.classificationId === value);
                        return (
                          <Chip
                            key={value}
                            label={stage ? stage.seasonalClassificationName : value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                        width: 300,
                      },
                    },
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                  }}
                >
                  {growthStages.map((stage) => (
                    <MenuItem key={stage.classificationId} value={stage.classificationId}>
                      <Checkbox
                        checked={(editCropFormData.classificationIds || []).indexOf(stage.classificationId) > -1}
                        size="small"
                      />
                      <ListItemText primary={stage.seasonalClassificationName} />
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.classificationIds && (
                  <FormHelperText>{validationErrors.classificationIds}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editCropFormData.isHorti}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditCropFormData((prev) => ({
                        ...prev,
                        isHorti: checked,
                        hortiGroupId: checked ? prev.hortiGroupId : ""
                      }));
                      if (!checked) {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "" }));
                      }
                    }}
                    color="primary"
                  />
                }
                label="Horticulture Crop"
              />
            </Grid>

            {editCropFormData.isHorti && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!validationErrors.hortiGroupId}>
                  <InputLabel id="edit-horti-group-label">Horti Group</InputLabel>
                  <Select
                    labelId="edit-horti-group-label"
                    value={editCropFormData.hortiGroupId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditCropFormData((prev) => ({ ...prev, hortiGroupId: value }));
                      if (value) {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "" }));
                      } else {
                        setValidationErrors((prev) => ({ ...prev, hortiGroupId: "Horti group is required" }));
                      }
                    }}
                    label="Horti Group"
                  >
                    {cropGroups.map((group) => (
                      <MenuItem key={group.cropGroupId} value={group.cropGroupId}>
                        {group.groupName}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.hortiGroupId && (
                    <FormHelperText>{validationErrors.hortiGroupId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editCropFormData.isActive}
                    onChange={(e) => setEditCropFormData({ ...editCropFormData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCropDialog}>Cancel</Button>
          <Button onClick={handleUpdateCrop} variant="contained" sx={{ backgroundColor: themeColor }}>
            Update Crop
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={unitDialogOpen} onClose={handleCloseUnitDialog} maxWidth="sm" fullWidth>
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
              setUnitFormData((prev) => ({ ...prev, unitName: value }));

              if (!value) {
                setValidationErrors((prev) => ({ ...prev, unitName: "" }));
              } else if (value.trim().length === 0) {
                setValidationErrors((prev) => ({ ...prev, unitName: "Unit name cannot be blank" }));
              } else if (!validateEnglishText(value)) {
                setValidationErrors((prev) => ({ ...prev, unitName: "Only English alphabets allowed" }));
              } else if (!validateTextFieldLength(value, 50)) {
                setValidationErrors((prev) => ({ ...prev, unitName: "Maximum 50 characters allowed" }));
              } else {
                setValidationErrors((prev) => ({ ...prev, unitName: "" }));
              }
            }}
            error={!!validationErrors.unitName}
            helperText={validationErrors.unitName}
            inputProps={{ maxLength: 50 }}
            required
          />
          <FormControlLabel control={<Switch checked={unitFormData.isActive} onChange={(e) => setUnitFormData((prev) => ({ ...prev, isActive: e.target.checked }))} color="primary" />} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnitDialog}>Cancel</Button>
          <Button onClick={handleSaveUnit} variant="contained" sx={{ backgroundColor: themeColor }}>
            {editingUnit ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={standsDialogOpen} onClose={handleCloseStandsDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>{editingStands ? "Edit Stands Data" : "Add Stands Data"}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <Select
              value={standsFormData.cropId || ""}
              onChange={(e) => setStandsFormData((prev) => ({ ...prev, cropId: e.target.value }))}
              label="Crop Name"
              displayEmpty
            >
              <MenuItem value="" disabled>Select Crop</MenuItem>
              {allCrops
                .filter((crop) => crop.isActive === true || crop.cropId === standsFormData.cropId)
                .map((crop) => (
                  <MenuItem key={crop.cropId} value={crop.cropId}>
                    {crop.cropNameEn}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControlLabel control={<Switch checked={standsFormData.isState} onChange={(e) => { setStandsFormData({ ...standsFormData, isState: e.target.checked, distId: "" }); }} color="primary" />} label="State Level (If unchecked, District level)" sx={{ mb: 2 }} />

          {!standsFormData.isState && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select District</InputLabel>
              <Select value={standsFormData.distId} onChange={(e) => setStandsFormData({ ...standsFormData, distId: e.target.value })} label="Select District">
                {districts.map((district) => (<MenuItem key={district.distId} value={district.distId}>{district.distNameEn}</MenuItem>))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Stands Per Hectare"
            fullWidth
            value={standsFormData.standsPerHectare}
            onKeyDown={(e) => handleDecimalNumberKeyDown(e, "standsPerHectare")}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setStandsFormData((prev) => ({ ...prev, standsPerHectare: "" }));
                setValidationErrors((prev) => ({ ...prev, standsPerHectare: "" }));
                return;
              }

              if (!/^\d*\.?\d*$/.test(value)) {
                setValidationErrors((prev) => ({ ...prev, standsPerHectare: "Only numbers and decimal numbers are allowed" }));
                return;
              }

              if (value.length > 10) {
                setValidationErrors((prev) => ({ ...prev, standsPerHectare: "Maximum 10 characters allowed" }));
                return;
              }

              setStandsFormData((prev) => ({ ...prev, standsPerHectare: value }));
              setValidationErrors((prev) => ({ ...prev, standsPerHectare: "" }));
            }}
            error={!!validationErrors.standsPerHectare}
            helperText={validationErrors.standsPerHectare}
            sx={{ mb: 2 }}
            required
            inputProps={{ maxLength: 10, inputMode: "decimal" }}
          />
          <TextField
            label="Cent Per Tree"
            fullWidth
            value={standsFormData.centPerTree}
            onKeyDown={(e) => handleDecimalNumberKeyDown(e, "centPerTree")}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "") {
                setStandsFormData((prev) => ({ ...prev, centPerTree: "" }));
                setValidationErrors((prev) => ({ ...prev, centPerTree: "" }));
                return;
              }

              if (!/^\d*\.?\d*$/.test(value)) {
                setValidationErrors((prev) => ({ ...prev, centPerTree: "Only numbers and decimal numbers are allowed" }));
                return;
              }

              if (value.length > 10) {
                setValidationErrors((prev) => ({ ...prev, centPerTree: "Maximum 10 characters allowed" }));
                return;
              }

              setStandsFormData((prev) => ({ ...prev, centPerTree: value }));
              setValidationErrors((prev) => ({ ...prev, centPerTree: "" }));
            }}
            error={!!validationErrors.centPerTree}
            helperText={validationErrors.centPerTree}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 10, inputMode: "decimal" }}
          />
          <FormControlLabel control={<Switch checked={standsFormData.isActive} onChange={(e) => setStandsFormData((prev) => ({ ...prev, isActive: e.target.checked }))} color="primary" />} label="Active" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStandsDialog}>Cancel</Button>
          <Button onClick={handleSaveStands} variant="contained" sx={{ backgroundColor: themeColor }}>
            {editingStands ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={irrigationDialogOpen} onClose={handleCloseIrrigationDialog} maxWidth="sm" fullWidth>
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

              // allow clearing
              if (value === "") {
                setIrrigationFormData((prev) => ({ ...prev, irrigationType: "" }));
                setValidationErrors((prev) => ({ ...prev, irrigationType: "" }));
                return;
              }

              if (validateIrrigationTypeText(value) && validateTextFieldLength(value, 100)) {
                if (value.trim().length === 0) {
                  setIrrigationFormData((prev) => ({ ...prev, irrigationType: value }));
                  setValidationErrors((prev) => ({ ...prev, irrigationType: "Irrigation type cannot be blank" }));
                  return;
                }
                setIrrigationFormData((prev) => ({ ...prev, irrigationType: value }));
                setValidationErrors((prev) => ({ ...prev, irrigationType: "" }));
              } else if (!validateIrrigationTypeText(value)) {
                setValidationErrors((prev) => ({ ...prev, irrigationType: "Only English alphabets and commas allowed" }));
              } else if (!validateTextFieldLength(value, 100)) {
                setValidationErrors((prev) => ({ ...prev, irrigationType: "Maximum 100 characters allowed" }));
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
              if (value === "") {
                setIrrigationFormData({ ...irrigationFormData, irrigationCodeDes: "" });
                setValidationErrors((prev) => ({ ...prev, irrigationCodeDes: "" }));
                return;
              }
              if (/^\d+$/.test(value)) {
                if (value.length <= 3) {
                  setIrrigationFormData({ ...irrigationFormData, irrigationCodeDes: value });
                  setValidationErrors((prev) => ({ ...prev, irrigationCodeDes: "" }));
                } else {
                  setValidationErrors((prev) => ({ ...prev, irrigationCodeDes: "Maximum 3 digits allowed" }));
                }
              } else {
                setValidationErrors((prev) => ({ ...prev, irrigationCodeDes: "Only numbers allowed" }));
              }
            }}
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            error={!!validationErrors.irrigationCodeDes}
            helperText={validationErrors.irrigationCodeDes}
            inputProps={{ min: 0, max: 999, maxLength: 3 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={irrigationFormData.isActive === true || irrigationFormData.isActive === "true" || irrigationFormData.isActive === 1}
                onChange={(e) => {
                  setIrrigationFormData({
                    ...irrigationFormData,
                    isActive: e.target.checked  // ← This sets it to true/false
                  });
                }}
                color="primary"
              />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions><Button onClick={handleCloseIrrigationDialog}>Cancel</Button><Button onClick={handleSaveIrrigation} variant="contained" sx={{ backgroundColor: themeColor }}>{editingIrrigation ? "Update" : "Save"}</Button></DialogActions>
      </Dialog>

      <Dialog open={yieldDialogOpen} onClose={handleCloseYieldDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
          {editingYield ? "Edit Crop Yield Type" : "Add Crop Yield Type"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Crop Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="yield-crop-name-label">Crop Name</InputLabel>
                <Select
                  labelId="yield-crop-name-label"
                  value={yieldFormData.cropId}
                  onChange={(e) => setYieldFormData({ ...yieldFormData, cropId: e.target.value })}
                  label="Crop Name"
                >
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
                label="Yield Name (English)"
                fullWidth
                required
                value={yieldFormData.cropYieldNameEn}
                onChange={(e) => {
                  const value = e.target.value;
                  setYieldFormData((prev) => ({ ...prev, cropYieldNameEn: value }));
                  if (!value || value.trim().length === 0) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameEn: "Yield name (English) is required" }));
                  } else if (!validateEnglishText(value)) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameEn: "Only English alphabets allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameEn: "Maximum 100 characters allowed" }));
                  } else {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameEn: "" }));
                  }
                }}
                error={!!yieldValidationErrors.cropYieldNameEn}
                helperText={yieldValidationErrors.cropYieldNameEn}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Yield Name (Malayalam)"
                fullWidth
                required
                value={yieldFormData.cropYieldNameMal}
                onChange={(e) => {
                  const value = e.target.value;
                  setYieldFormData((prev) => ({ ...prev, cropYieldNameMal: value }));
                  if (!value || value.trim().length === 0) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameMal: "Yield name (Malayalam) is required" }));
                  } else if (!validateMalayalamText(value)) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameMal: "Only Malayalam characters allowed" }));
                  } else if (!validateTextFieldLength(value, 100)) {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameMal: "Maximum 100 characters allowed" }));
                  } else {
                    setYieldValidationErrors((prev) => ({ ...prev, cropYieldNameMal: "" }));
                  }
                }}
                error={!!yieldValidationErrors.cropYieldNameMal}
                helperText={yieldValidationErrors.cropYieldNameMal}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Result Type"
                fullWidth
                required
                value={yieldFormData.resultType}
                onChange={(e) => {
                  const value = e.target.value;
                  setYieldFormData((prev) => ({ ...prev, resultType: value }));
                  if (!value || value.trim().length === 0) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultType: "Result type is required" }));
                  } else if (!validateEnglishText(value)) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultType: "Only English alphabets allowed" }));
                  } else if (!validateTextFieldLength(value, 50)) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultType: "Maximum 50 characters allowed" }));
                  } else {
                    setYieldValidationErrors((prev) => ({ ...prev, resultType: "" }));
                  }
                }}
                error={!!yieldValidationErrors.resultType}
                helperText={yieldValidationErrors.resultType}
                inputProps={{ maxLength: 50 }}
                placeholder="e.g., Quantity, Weight, etc."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Result Unit"
                fullWidth
                required
                value={yieldFormData.resultUnit}
                onChange={(e) => {
                  const value = e.target.value;
                  setYieldFormData((prev) => ({ ...prev, resultUnit: value }));
                  if (!value || value.trim().length === 0) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultUnit: "Result unit is required" }));
                  } else if (!validateEnglishText(value)) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultUnit: "Only English alphabets allowed" }));
                  } else if (!validateTextFieldLength(value, 20)) {
                    setYieldValidationErrors((prev) => ({ ...prev, resultUnit: "Maximum 20 characters allowed" }));
                  } else {
                    setYieldValidationErrors((prev) => ({ ...prev, resultUnit: "" }));
                  }
                }}
                error={!!yieldValidationErrors.resultUnit}
                helperText={yieldValidationErrors.resultUnit}
                inputProps={{ maxLength: 20 }}
                placeholder="e.g., Kg, Ton, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={yieldFormData.isActive}
                    onChange={(e) => setYieldFormData({ ...yieldFormData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseYieldDialog}>Cancel</Button>
          <Button onClick={handleSaveYield} variant="contained" sx={{ backgroundColor: themeColor }}>
            {editingYield ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={cceDialogOpen} onClose={handleCloseCceDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: themeColor, color: "white" }}>
          {editingCce ? "Edit CCE Crop" : "Add CCE Crop"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>CCE Crop Type</InputLabel>
                <Select
                  value={cceFormData.cceCropType}
                  onChange={(e) => setCceFormData({ ...cceFormData, cceCropType: e.target.value })}
                  label="CCE Crop Type"
                >
                  <MenuItem value="Major">Major</MenuItem>
                  <MenuItem value="Minor">Minor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Crop Name</InputLabel>
                <Select
                  value={cceFormData.cropId}
                  onChange={(e) => setCceFormData({ ...cceFormData, cropId: e.target.value })}
                  label="Crop Name"
                >
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
                fullWidth
                required
                value={cceFormData.noOfCce}
                onKeyDown={(e) => handleIntegerNumberKeyDown(e, "noOfCce")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCceFormData((prev) => ({ ...prev, noOfCce: "" }));
                    setValidationErrors((prev) => ({ ...prev, noOfCce: "Number of CCE is required" }));
                    return;
                  }
                  if (!/^\d+$/.test(value)) {
                    setCceFormData((prev) => ({ ...prev, noOfCce: value }));
                    setValidationErrors((prev) => ({ ...prev, noOfCce: "Only numbers allowed" }));
                    return;
                  }
                  if (value.length > 2) {
                    setCceFormData((prev) => ({ ...prev, noOfCce: value }));
                    setValidationErrors((prev) => ({ ...prev, noOfCce: "Maximum 2 digits allowed" }));
                    return;
                  }
                  if (parseInt(value, 10) < 1) {
                    setCceFormData((prev) => ({ ...prev, noOfCce: value }));
                    setValidationErrors((prev) => ({ ...prev, noOfCce: "Value must be greater than 0" }));
                    return;
                  }
                  setCceFormData((prev) => ({ ...prev, noOfCce: value }));
                  setValidationErrors((prev) => ({ ...prev, noOfCce: "" }));
                }}
                error={!!validationErrors.noOfCce}
                helperText={validationErrors.noOfCce}
                inputProps={{ maxLength: 2, inputMode: "numeric" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.cceUnitId}>
                <InputLabel id="cce-unit-label">CCE Unit</InputLabel>
                <Select
                  labelId="cce-unit-label"
                  value={cceFormData.cceUnitId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCceFormData((prev) => ({ ...prev, cceUnitId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, cceUnitId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, cceUnitId: "CCE unit is required" }));
                    }
                  }}
                  label="CCE Unit"
                >
                  {unitsList.filter(unit => unit.isActive === true).map((unit) => (
                    <MenuItem key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.cceUnitId && (
                  <FormHelperText>{validationErrors.cceUnitId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.frameId}>
                <InputLabel id="cce-frame-label">Frame</InputLabel>
                <Select
                  labelId="cce-frame-label"
                  value={cceFormData.frameId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCceFormData((prev) => ({ ...prev, frameId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, frameId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, frameId: "Frame is required" }));
                    }
                  }}
                  label="Frame"
                >
                  {frames.map((frame) => (
                    <MenuItem key={frame.id} value={frame.id}>
                      {frame.frame}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.frameId && (
                  <FormHelperText>{validationErrors.frameId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.frameUnitId}>
                <InputLabel id="cce-frame-unit-label">Frame Unit</InputLabel>
                <Select
                  labelId="cce-frame-unit-label"
                  value={cceFormData.frameUnitId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCceFormData((prev) => ({ ...prev, frameUnitId: value }));
                    if (value) {
                      setValidationErrors((prev) => ({ ...prev, frameUnitId: "" }));
                    } else {
                      setValidationErrors((prev) => ({ ...prev, frameUnitId: "Frame unit is required" }));
                    }
                  }}
                  label="Frame Unit"
                >
                  {unitsList.filter(unit => unit.isActive === true).map((unit) => (
                    <MenuItem key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.frameUnitId && (
                  <FormHelperText>{validationErrors.frameUnitId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Frame Length"
                fullWidth
                value={cceFormData.frameLength}
                onKeyDown={(e) => handleIntegerNumberKeyDown(e, "frameLength")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCceFormData((prev) => ({ ...prev, frameLength: "" }));
                    setValidationErrors((prev) => ({ ...prev, frameLength: "" }));
                    return;
                  }
                  if (!/^\d+$/.test(value)) {
                    setValidationErrors((prev) => ({ ...prev, frameLength: "Only numbers allowed" }));
                    return;
                  }
                  if (value.length > 3) {
                    setValidationErrors((prev) => ({ ...prev, frameLength: "Maximum 3 digits allowed" }));
                    return;
                  }
                  if (parseInt(value, 10) < 1) {
                    setCceFormData((prev) => ({ ...prev, frameLength: value }));
                    setValidationErrors((prev) => ({ ...prev, frameLength: "Value must be greater than 0" }));
                    return;
                  }
                  setCceFormData((prev) => ({ ...prev, frameLength: value }));
                  setValidationErrors((prev) => ({ ...prev, frameLength: "" }));
                }}
                error={!!validationErrors.frameLength}
                helperText={validationErrors.frameLength}
                inputProps={{ maxLength: 3, inputMode: "numeric" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Frame Width"
                fullWidth
                value={cceFormData.frameWidth}
                onKeyDown={(e) => handleIntegerNumberKeyDown(e, "frameWidth")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCceFormData((prev) => ({ ...prev, frameWidth: "" }));
                    setValidationErrors((prev) => ({ ...prev, frameWidth: "" }));
                    return;
                  }
                  if (!/^\d+$/.test(value)) {
                    setValidationErrors((prev) => ({ ...prev, frameWidth: "Only numbers allowed" }));
                    return;
                  }
                  if (value.length > 3) {
                    setValidationErrors((prev) => ({ ...prev, frameWidth: "Maximum 3 digits allowed" }));
                    return;
                  }
                  if (parseInt(value, 10) < 1) {
                    setCceFormData((prev) => ({ ...prev, frameWidth: value }));
                    setValidationErrors((prev) => ({ ...prev, frameWidth: "Value must be greater than 0" }));
                    return;
                  }
                  setCceFormData((prev) => ({ ...prev, frameWidth: value }));
                  setValidationErrors((prev) => ({ ...prev, frameWidth: "" }));
                }}
                error={!!validationErrors.frameWidth}
                helperText={validationErrors.frameWidth}
                inputProps={{ maxLength: 3, inputMode: "numeric" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="CCE Visit Limit"
                fullWidth
                value={cceFormData.cceVisitLimit}
                onKeyDown={(e) => handleIntegerNumberKeyDown(e, "cceVisitLimit")}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCceFormData((prev) => ({ ...prev, cceVisitLimit: "" }));
                    setValidationErrors((prev) => ({ ...prev, cceVisitLimit: "" }));
                    return;
                  }
                  if (!/^\d+$/.test(value)) {
                    setValidationErrors((prev) => ({ ...prev, cceVisitLimit: "Only numbers allowed" }));
                    return;
                  }
                  if (value.length > 2) {
                    setValidationErrors((prev) => ({ ...prev, cceVisitLimit: "Maximum 2 digits allowed" }));
                    return;
                  }
                  if (parseInt(value, 10) < 1) {
                    setCceFormData((prev) => ({ ...prev, cceVisitLimit: value }));
                    setValidationErrors((prev) => ({ ...prev, cceVisitLimit: "Value must be greater than 0" }));
                    return;
                  }
                  setCceFormData((prev) => ({ ...prev, cceVisitLimit: value }));
                  setValidationErrors((prev) => ({ ...prev, cceVisitLimit: "" }));
                }}
                error={!!validationErrors.cceVisitLimit}
                helperText={validationErrors.cceVisitLimit}
                inputProps={{ maxLength: 2, inputMode: "numeric" }}
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
          <Button onClick={handleCloseCceDialog}>Cancel</Button>
          <Button onClick={handleSaveCce} variant="contained" sx={{ backgroundColor: themeColor }}>
            {editingCce ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default CropsManagement;