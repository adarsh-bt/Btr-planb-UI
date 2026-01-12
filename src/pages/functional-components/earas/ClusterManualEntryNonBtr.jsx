import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Grid, Button, Box, TextField,
  Paper, Divider, Chip, Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  RadioGroup,
  Radio,
  IconButton,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import GrassIcon from '@mui/icons-material/Grass';
import mainapi from 'api/mainapi';
import Autocomplete from '@mui/material/Autocomplete';
import authservice from 'pages/authentication/services/authservice';

const BASE_URL = mainapi.BASE_URL;
const FORM_URL = mainapi.FORM_API;

// --- Constant for Side Plot Dropdown ---
const SIDE_PLOT_OPTIONS = ['S1', 'S2', 'S3', 'S4', 'E1', 'E2', 'E3', 'E4', 'N1', 'N2', 'N3', 'N4', 'W1', 'W2', 'W3', 'W4'];

// --- Sample Data for Dropdowns & Modal ---

const role = authservice.getrole();
// --- Helper Function ---
const isSamePlot = (rowA, rowB) => {
  if (!rowA || !rowB) return false;
  const hasIdentifiers = rowA.villageName && rowA.block && rowA.svNo && rowA.sub;
  if (!hasIdentifiers) return false;
  return (
    rowA.villageName === rowB.villageName &&
    rowA.block === rowB.block &&
    rowA.svNo === rowB.svNo &&
    rowA.sub === rowB.sub
  );
};

const ClusterManualEntryNonBtr = () => {
  const [keyplotsData, setKeyplotsData] = useState([]);
  const [currentLabels, setCurrentLabels] = useState(['K', 'S1', 'E1', 'N1', 'W1']);
   const navigate = useNavigate();
    const { zoneId: paramZoneId } = useParams();

    // Helper to get effective zone ID
    const getEffectiveZoneId = () => {
        return paramZoneId || authservice.getzone();
    };
  const [clusterInfo, setClusterInfo] = useState({
    clusterNo: '',
    localBody: '',
    landType: '',
    totalArea: 0,
    maxArea: 600,
    BtrType: ''
  });
  const [isCropsModalOpen, setCropsModalOpen] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState({});
  const [savedCrops, setSavedCrops] = useState([]);
  const [BtrTypeId, setBtrTypeId] = useState('')

  const [cceCropDetails, setCceCropDetails] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  const [errors, setErrors] = useState({});
  const [villageOptions, setVillageOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [defaultLbcode, setDefaultLbcode] = useState('');
  const [syNo, setSyNo] = useState('');
  const [slNo, setSLNo] = useState('');
  const [keyplotId, setKeyplotId] = useState('');
  const [keyplotSubNo, setKeyplotSubNo] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingResvno, setLoadingResvno] = useState(false);

  // Submit-related states
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const nextRowId = useRef(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOpen1, setSnackbarOpen1] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mincluster, setMinCluster] = useState('');
  const [maxcluster, setMaxCluster] = useState('');
  const [meanCluster, setMeanCluster] = useState('');
  const [keyplotMainSvNo, setKeyplotMainSvNo] = useState('');
  const [modalBlockOptions, setModalBlockOptions] = useState([]);
  const [svNoDetails, setSvNoDetails] = useState([]);
  const [selectedSvNos, setSelectedSvNos] = useState([]);
  const [allVillageData, setAllVillageData] = useState([]);
  const [defaultVillageId, setDefaultVillageId] = useState(null);
  const [defaultVillage, setDefaultVillage] = useState('');
  const [clusterId, setClusterId] = useState('');
  const [defaultBlock, setDefaultBlock] = useState('');
  const [resvnoError, setResvnoError] = useState('');
  const [savingCrops, setSavingCrops] = useState(false);


  const [validationInfo, setValidationInfo] = useState(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validatingRow, setValidatingRow] = useState(null);

  const [apiCropsData, setApiCropsData] = useState(null);
  const [loadingApiCrops, setLoadingApiCrops] = useState(false);

  // non btr
  const [activeBTypes, setActiveBTypes] = useState([]);
  const [currentBType, setCurrentBType] = useState(null);
  const [nonBtrTypeMapping, setNonBtrTypeMapping] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [updatingRow, setUpdatingRow] = useState(null);

  // Fetch active btypes from API
  useEffect(() => {
    const fetchActiveBTypes = async () => {
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

          const mapping = {};
          btypeData.forEach(btype => {
            mapping[btype.btypeName] = btype.btypeId;
          });
          setNonBtrTypeMapping(mapping);
        }
      } catch (error) {
        console.error('Error fetching active btypes:', error);
      }
    };

    fetchActiveBTypes();
  }, []);

  const [keyplotDetails, setKeyplotDetails] = useState({
    villageBlock: '',
    panchayath: '',
    syNo: '',
    areaCents: '',
    landType: ''
  });
  const [rowBlockOptions, setRowBlockOptions] = useState({});

  // fetch and filter CCE crop details
  const fetchCceCropDetails = async () => {
    setLoadingCrops(true);
    try {
      const token = localStorage.getItem('token');
      const zoneid = getEffectiveZoneId();
      const response = await fetch(`${FORM_URL}/earas-form1-entry/cce-crop-details/fetch-cce-crops?zoneId=${zoneid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const cropData = Array.isArray(data) ? data : (data.crops || data.payload || []);
      const filteredCrops = filterCropsByLandType(cropData, clusterInfo.landType);
      setCceCropDetails(filteredCrops);
    } catch (error) {
      console.error('Error fetching CCE crop details:', error);
      setCceCropDetails([]);
      setSnackbarMessage('Failed to load crop details.');
      setSnackbarOpen(true);
    } finally {
      setLoadingCrops(false);
    }
  };


  const renderValidationDialogContent = () => {
    if (!validationInfo) return null;

    if (validationInfo.isFromCurrentForm) {
      return (
        <Box>
          <DialogContentText sx={{ mb: 2, color: 'warning.main' }}>
            ⚠️ This plot is already used in the current form in: <strong>{validationInfo.location}</strong>
          </DialogContentText>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Total Area:</strong> {validationInfo.totalArea} cents
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Already Used:</strong> {validationInfo.usedArea} cents
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Remaining Area:</strong> {validationInfo.remainingArea.toFixed(2)} cents
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box>
          <DialogContentText sx={{ mb: 2 }}>
            {validationInfo.message}
          </DialogContentText>
          {validationInfo.totalcent && (
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Total Area:</strong> {validationInfo.totalcent} cents
            </Typography>
          )}
          {validationInfo.remainingArea > 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Remaining Area:</strong> {validationInfo.remainingArea.toFixed(2)} cents
            </Typography>
          )}
        </Box>
      );
    }
  };
  const handleRejectPlot = () => {
    if (!validatingRow) return;

    const { keyplotId, rowUniqueId } = validatingRow;
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    // Clear the inputs for the rejected plot
    if (row) {
      row.svNo = '';
      row.sub = '';
      row.area = '';
      row.enumeratedArea = '';
      row.ward_number = '';
      row.houseno = '';
      row.address = '';
      row.ownername = '';
      row.oldsubno = '';
      row.oldsvno = '';
      row.tpno = '';
      row.tbsubdivisionno = '';
    }

    setKeyplotsData(newData);
    setIsValidationDialogOpen(false);
    setSnackbarMessage("This plot cannot be used. Please enter a different one.");
    setSnackbarOpen(true);
  };
  const handleUseRecommendedPlot = (type) => {
    if (!validatingRow || !validationInfo) return;

    const { keyplotId, rowUniqueId } = validatingRow;
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    if (row) {
      // ✅ IMPORTANT: Set the plot_id from validation response
      row.plot_id = validationInfo.id; // This is the actual plot ID from backend
      row.area = validationInfo.totalcent.toString();

      if (type === 'remaining') {
        row.enumeratedArea = validationInfo.remainingArea.toFixed(2);
      } else {
        row.enumeratedArea = '';
      }
    }

    setKeyplotsData(newData);
    setIsValidationDialogOpen(false);
    setValidationInfo(null);
    setValidatingRow(null);
  };


  const fetchApiCceCrops = useCallback(async () => {
    if (!clusterId) return;
    setLoadingApiCrops(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE_URL}/btr-service/crop-assignment-trail/${clusterId}/cce-crops`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApiCropsData(data);
    } catch (error) {
      console.error('Error fetching API CCE crops:', error);
    } finally {
      setLoadingApiCrops(false);
    }
  }, [clusterId, BASE_URL]);

  useEffect(() => {
    if (clusterId) {
      fetchApiCceCrops();
    }
  }, [clusterId, fetchApiCceCrops]);

  const getSelectedCropNames = () => {
    const selectedCropNames = new Set();
    savedCrops.forEach(crop => {
      const cropName = typeof crop === 'object' ? crop.cropName : crop;
      selectedCropNames.add(cropName);
    });
    if (apiCropsData && apiCropsData.crops) {
      apiCropsData.crops.forEach(crop => {
        selectedCropNames.add(crop.cropName);
      });
    }
    return selectedCropNames;
  };

  const filterCropsByLandType = (crops, landType) => {
    if (!landType || !Array.isArray(crops)) return crops;
    const normalizedLandType = landType.toUpperCase();
    return crops.filter(crop => {
      if (!crop.frameName) return false;
      const frameName = crop.frameName.toUpperCase();
      switch (frameName) {
        case 'WET':
          return normalizedLandType === 'WET';
        case 'DRY':
          return normalizedLandType === 'DRY';
        case 'WET / DRY':
          return normalizedLandType === 'WET' || normalizedLandType === 'DRY';
        default:
          return false;
      }
    });
  };

  useEffect(() => {
    fetchCceCropDetails();
  }, [clusterInfo.landType]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('No');
    const slnoFromURL = urlParams.get('slno');
    setKeyplotId(syNoFromURL);

    if (syNoFromURL) {
      setSyNo(decodeURIComponent(syNoFromURL));

      if (slnoFromURL) {
        setSLNo(decodeURIComponent(slnoFromURL));
        setKeyplotSubNo(decodeURIComponent(slnoFromURL));
      }

      const fetchAllInitialData = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchKeyplotDetails(syNoFromURL),
          ]);
        } catch (error) {
          console.error("Error fetching all initial data:", error);
          setSnackbarMessage('Failed to load some initial data.');
          setSnackbarOpen(true);
        } finally {
          setLoading(false);
        }
      };

      if (syNoFromURL) {
        fetchAllInitialData();
      } else {
        setLoading(false);
      }
    }
  }, [location.search]);

  const totalAreaProgress = clusterInfo.maxArea > 0 ? (clusterInfo.totalArea / clusterInfo.maxArea) * 100 : 0;

  const fetchKeyplotDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/btr-service/key-plots/get-keyplot/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("response >> ", data)
      const keyplotBTypeId = data.payload.btr_id;
      const keyplotBTypeName = data.payload.btr_type;
      setCurrentBType({
        id: keyplotBTypeId,
        name: keyplotBTypeName
      });
      setMinCluster(data.payload.clusterMin);
      setMaxCluster(data.payload.clusterMax);
      setMeanCluster(data.payload.clusterMean);
      setDefaultLbcode(data.payload.lbcode);

      setDefaultBlock(data.payload.villageBlock);
      setDefaultVillageId(data.payload.kvillageId);
      setDefaultVillage(data.payload.kvillageName);
      setClusterId(data.payload.clusterId);
      setBtrTypeId(data.payload.btr_id)

      if (data.payload) {
        setKeyplotDetails(data.payload);

        setClusterInfo(prevInfo => ({
          ...prevInfo,
          clusterNo: data.payload.clusterNo || '1',
          localBody: data.payload.panchayath || 'N/A',
          landType: data.payload.landType || 'Wet',
          maxArea: data.payload.clusterMax || 600,
          BtrType: data.payload.btr_type || 'NA',
        }));
        setBtrTypeId(data.payload.btr_id || 'NA')
        if (data.payload.cceCrops && Array.isArray(data.payload.cceCrops)) {
          setSavedCrops(data.payload.cceCrops);
        }

        const existingSidePlots = {};

        if (data.payload.syNo) {
          const [mainNo, subNo] = data.payload.syNo.split('/');
          setKeyplotMainSvNo(mainNo);
          setKeyplotSubNo(subNo || '');

          existingSidePlots['K'] = {
            id: 'K',
            label: 'K',
            rows: [{
              b_id: data.payload.id || '',
              svNo: mainNo || '',
              sub: subNo || '',
              block: data.payload.villageBlock || '',
              villageName: data.payload.kvillageName || '',
              enumeratedArea: data.payload.areaCents || '',
              area: data.payload.areaCents || '',
              subOptions: [],
              plot_id: data.payload.plot_id || '',
              oldsvno: data.payload.oldsvno || '', // ensure present
              oldsubno: data.payload.oldsubno || '', // ensure present
              isExisting: true,
              uniqueId: nextRowId.current++
            }]
          };
        }

        if (Array.isArray(data.payload.sidePlots)) {
          data.payload.sidePlots.forEach(sp => {
            const directionKey = sp.label;
            existingSidePlots[directionKey] = {
              id: sp.label,
              label: sp.label,
              rows: (sp.rows || []).map(row => ({
                b_id: row.id,
                svNo: row.svNo || '',
                sub: row.subNo || '',
                block: row.bcode || '',
                villageName: row.village || '',
                enumeratedArea: row.actual || '',
                area: row.area || '',
                subOptions: [],
                plot_id: row.plot_id || '',

                ownername: row.ownername || '',
                address: row.address || '',
                houseno: row.houseno || '',
                ward_number: row.ward_number || '',
                tpno: row.tpno || '',
                tbsubdivisionno: row.tbsubdivisionno || '',
                oldsvno: row.oldsvno || '',
                oldsubno: row.oldsubno || '',

                isExisting: true,
                uniqueId: nextRowId.current++
              }))
            };
          });
        }

        const fixed = ['K'];
        const existing = Object.keys(existingSidePlots).filter(l => l !== 'K');
        const defaults = ['S1', 'E1', 'N1', 'W1'];
        const uniqueDefaults = defaults.filter(d => !existing.includes(d));
        const sideplots = [...existing, ...uniqueDefaults].slice(0, 4);
        const allDirections = [...fixed, ...sideplots];

        const mergedKeyplots = allDirections.map(dir => {
          return existingSidePlots[dir] || {
            id: dir,
            label: dir,
            rows: []
          };
        });

        setKeyplotsData(mergedKeyplots);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching keyplot details:", error);
      throw error;
    }
  };

  // BType-specific fields as stacked items (preserve existing logic)
  const renderBTypeSpecificFields = (row, keyplot, isNewRow = false) => {
    if (!currentBType) return null;
    const bTypeName = currentBType.name;

    const commonFields = (
      <>
        <Grid item xs={12}>
          <TextField
            label="Name"
            size="small"
            fullWidth
            value={row.ownername || ''}
            InputProps={{ readOnly: !isNewRow }}
            onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'ownername')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Address"
            size="small"
            fullWidth
            value={row.address || ''}
            InputProps={{ readOnly: !isNewRow }}
            onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'address')}
          />
        </Grid>
      </>
    );

    switch (bTypeName) {
      case 'House List':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <TextField
                label="House No."
                size="small"
                fullWidth
                type="number"
                value={row.houseno || ''}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'houseno')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ward No."
                size="small"
                fullWidth
                type="number"
                value={row.ward_number || ''}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'ward_number')}
              />
            </Grid>
          </>
        );

      case 'Cultivators List':
        return commonFields;

      case 'Thandaper Number':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <TextField
                label="Thandaper No."
                size="small"
                fullWidth
                type="number"
                value={row.tpno || ''}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'tpno')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Thandaper Sub No."
                size="small"
                fullWidth
                value={row.tbsubdivisionno}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'tbsubdivisionno')}
              />
            </Grid>
          </>
        );

      case 'Others':
        return (
          <>
            {commonFields}
            <Grid item xs={12}>
              <TextField
                label="Main No."
                size="small"
                fullWidth
                type="number"
                value={row.mainno || ''}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'mainno')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Sub No."
                size="small"
                fullWidth
                value={row.subno || ''}
                InputProps={{ readOnly: !isNewRow }}
                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'subno')}
              />
            </Grid>
          </>
        );

      default:
        return commonFields;
    }
  };

  useEffect(() => {
    const fetchVillageData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${mainapi.BTR_API}/btr-service/cluster-api/${defaultLbcode}/villages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch villages");

        const data = await response.json();
        setVillageOptions(data);
        setAllVillageData(data);

        if (data.length > 0) {
          setBlockOptions(data[0].blocks.map(b => b.blockCode));
        }
      } catch (err) {
        console.error("Error fetching village/block data:", err);
      }
    };

    if (defaultLbcode) {
      fetchVillageData();
    }
  }, [defaultLbcode]);

  useEffect(() => {
    const newTotalArea = keyplotsData.reduce((total, keyplot) => {
      return total + keyplot.rows.reduce((subTotal, row) => subTotal + (parseFloat(row.enumeratedArea) || 0), 0);
    }, 0);
    setClusterInfo(prevInfo => ({ ...prevInfo, totalArea: newTotalArea }));
  }, [keyplotsData]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError('');

      const userId = authservice.userid();
      const token = authservice.gettoken();

      if (!userId) {
        throw new Error('User information not found. Please login again.');
      }
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      if (removedRows.length > 0) {
        await removeDeletedRows(token);
      }
      const keyplotData = keyplotsData.find(kp => kp.label === 'K');
      if (!keyplotData || keyplotData.rows.length === 0) {
        throw new Error('Keyplot data is required.');
      }

      for (const keyplot of keyplotsData) {
        for (const row of keyplot.rows) {
          if (BtrTypeId == 2) {
            if (!row.villageName || !row.block || !row.houseno || !row.ward_number || !row.area || !row.enumeratedArea) {
              throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
            }
            if (!row.isNew && !row.plot_id) {
              throw new Error(`Plot ID is missing for existing ${keyplot.label} plot. Please ensure all plots are properly linked.`);
            }
          } else if (BtrTypeId == 3) {
            if (!row.villageName || !row.block || !row.ownername || !row.address || !row.area || !row.enumeratedArea) {
              throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
            } if (!row.isNew && !row.plot_id) {
              throw new Error(`Plot ID is missing for existing ${keyplot.label} plot. Please ensure all plots are properly linked.`);
            }
          } else if (BtrTypeId == 4) {
            if (!row.villageName || !row.block || !row.tpno || !row.area || !row.enumeratedArea) {
              throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
            } if (!row.isNew && !row.plot_id) {
              throw new Error(`Plot ID is missing for existing ${keyplot.label} plot. Please ensure all plots are properly linked.`);
            }
          } else if (BtrTypeId == 5) {
            if (!row.villageName || !row.block || !row.oldsvno || !row.oldsubno || !row.area || !row.enumeratedArea) {
              throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
            } if (!row.isNew && !row.plot_id) {
              throw new Error(`Plot ID is missing for existing ${keyplot.label} plot. Please ensure all plots are properly linked.`);
            }
          }
        }
      }

      const requestData = {
        userId: userId,
        keyplotId: keyplotId,
        clusterNo: clusterId,
        btrType: currentBType?.id,
        sidePlots: keyplotsData
          .filter(keyplot => keyplot.rows.length > 0)
          .map(keyplot => ({
            label: keyplot.label,
            rows: keyplot.rows.map(row => {
              const baseRowData = {
                ...(row.b_id ? { id: row.b_id } : {}),
                actual: parseFloat(row.enumeratedArea),
                svNo: parseInt(row.svNo),
                subNo: row.sub,
                area: parseFloat(row.area),
                bcode: row.block,
                village: row.villageId,
                btrtype: currentBType?.id
              };

              if (currentBType) {
                switch (currentBType.name) {
                  case 'House List':
                    baseRowData.ownername = row.ownername || '';
                    baseRowData.address = row.address || '';
                    baseRowData.houseno = row.houseno?.trim() || '';
                    baseRowData.ward_number = row.ward_number ? parseInt(row.ward_number) : null;
                    break;
                  case 'Cultivators List':
                    baseRowData.ownername = row.ownername || '';
                    baseRowData.address = row.address || '';
                    break;
                  case 'Thandaper Number':
                    baseRowData.ownername = row.ownername || '';
                    baseRowData.address = row.address || '';
                    baseRowData.tpno = row.tpno ? parseInt(row.tpno) : null;
                    baseRowData.tbsubdivisionno = row.tbsubdivisionno ? parseInt(row.tbsubdivisionno) : null;
                    break;
                  case 'Old Survey Number':
                    baseRowData.ownername = row.ownername || '';
                    baseRowData.address = row.address || '';
                    baseRowData.oldsvno = row.oldsvno ? parseInt(row.oldsvno) : null;
                    baseRowData.oldsubno = row.oldsubno || '';
                    break;
                }
              }

              if (row.plot_id && row.plot_id !== '') {
                baseRowData.plot_id = parseInt(row.plot_id);
              } else if (row.isNew) {
                baseRowData.plot_id = 0;
              }

              return baseRowData;
            })
          }))
      };

      const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save-cluster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch { }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      setSubmitSuccess(true);
      setSnackbarMessage('Cluster data saved successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error submitting cluster data:', error);
      setSubmitError(error.message);
      setSnackbarMessage(`${error.message} (Maximum area: ${clusterInfo.maxArea} cents)`);
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const removeDeletedRows = async (token) => {
    console.log('Removing deleted rows:', removedRows);

    for (const removedRow of removedRows) {
      try {
        if (!removedRow.b_id) {
          console.warn('Skipping row without b_id:', removedRow);
          continue;
        }

        const response = await fetch(`${BASE_URL}/btr-service/cluster-api/delete-sideplot/${removedRow.b_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(`DELETE response for row ${removedRow.b_id}:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to remove row ${removedRow.b_id}: ${response.status} - ${errorText}`);
        }

        console.log(`✅ Successfully removed row: ${removedRow.b_id}`);
      } catch (error) {
        console.error(`❌ Error removing row ${removedRow.b_id}:`, error);
        throw new Error(`Failed to remove deleted plot: ${removedRow.villageName}-${removedRow.block}-${removedRow.svNo}-${removedRow.sub}`);
      }
    }

    // Clear removed rows after successful deletion
    setRemovedRows([]);
    console.log('✅ All deleted rows removed successfully');
  };
  const handleOpenCropsModal = () => {
    const preSelected = {};
    savedCrops.forEach(crop => {
      if (crop.cropId) {
        preSelected[crop.cropId] = true;
      }
    });
    setSelectedCrops(preSelected);
    setCropsModalOpen(true);
  };

  const handleCloseCropsModal = async () => {
    try {
      setSavingCrops(true);
      const selectedCropIds = Object.keys(selectedCrops).filter(cropId => selectedCrops[cropId]);

      if (selectedCropIds.length === 0) {
        setSnackbarMessage('Please select at least one crop before saving.');
        setSnackbarOpen(true);
        return;
      }

      const zoneId = localStorage.getItem("activeZone");
      const token = localStorage.getItem('token');
      if (!zoneId) {
        throw new Error('Zone ID not found. Please select an active zone.');
      }
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      if (!clusterId) {
        throw new Error('Cluster ID not found. Please ensure cluster data is loaded.');
      }

      const clusterIdNumber = parseInt(clusterId);
      if (isNaN(clusterIdNumber)) {
        throw new Error('Invalid cluster number. Please check cluster information.');
      }

      const cropAssignments = selectedCropIds.map(cropId => {
        return {
          cropId: parseInt(cropId),
          clusterId: clusterIdNumber,
          keyplotId: keyplotId,
          zoneId: parseInt(zoneId),
          landType: clusterInfo.landType || "WET",
          isLimitExceeded: false,
          isCurrentAssignment: true,
          rejectedBy: null,
          rejectedAt: null,
          assignedOn: new Date().toISOString().slice(0, 19)
        };
      });

      const response = await fetch(`${BASE_URL}/btr-service/crop-assignment-trail/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cropAssignments)
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch { }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      const cropsToSave = selectedCropIds.map(cropId => {
        const cropDetail = cceCropDetails.find(crop => crop.cropId === parseInt(cropId));
        return {
          cropId: parseInt(cropId),
          cropName: cropDetail ? cropDetail.cropName : `Crop ${cropId}`,
          noOfCce: cropDetail ? cropDetail.noOfCce : 0,
          isActive: cropDetail ? cropDetail.isActive : true
        };
      });

      setSavedCrops(cropsToSave);

      const cropUsageCount = {};
      selectedCropIds.forEach(cropId => {
        cropUsageCount[cropId] = (cropUsageCount[cropId] || 0) + 1;
      });

      const updatedCceCropDetails = cceCropDetails.map(crop => {
        const cropIdStr = crop.cropId.toString();
        if (selectedCrops[cropIdStr]) {
          const usageCount = cropUsageCount[cropIdStr] || 1;
          return {
            ...crop,
            noOfCce: Math.max(0, crop.noOfCce - usageCount)
          };
        }
        return crop;
      });

      setCceCropDetails(updatedCceCropDetails);
      setSelectedCrops({});
      setSnackbarMessage("CCE crops saved successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving CCE crops:', error);
      setSnackbarMessage(`Error saving crops: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setSavingCrops(false);
    }
  };

  const handleCropSelectionChange = (event) => {
    const cropId = parseInt(event.target.name);
    setSelectedCrops({
      ...selectedCrops,
      [cropId]: event.target.checked
    });
  };

  const validateAndSetData = (data) => {
    const newErrors = {};
    const plotUsage = new Map();

    data.forEach(kp => {
      kp.rows.forEach(r => {
        if (BtrTypeId == 2) {
          if (r.villageName && r.block && r.ward_number && r.houseno) {
            const plotId = `${r.villageName}-${r.block}-${r.ward_number}-${r.houseno}`;
            if (!plotUsage.has(plotId)) {
              plotUsage.set(plotId, { rows: [], totalArea: 0 });
            }
            plotUsage.get(plotId).rows.push(r);
          }
        } else if (BtrTypeId == 3) {
          if (r.villageName && r.block && r.ownername && r.address && r.area) {
            const plotId = `${r.villageName}-${r.block}-${r.ownername}-${r.address}-${r.area}`;
            if (!plotUsage.has(plotId)) {
              plotUsage.set(plotId, { rows: [], totalArea: 0 });
            }
            plotUsage.get(plotId).rows.push(r);
          }
        } else if (BtrTypeId == 4) {
          if (r.villageName && r.block && r.tpno) {
            const plotId = `${r.villageName}-${r.block}-${r.tpno}`;
            if (!plotUsage.has(plotId)) {
              plotUsage.set(plotId, { rows: [], totalArea: 0 });
            }
            plotUsage.get(plotId).rows.push(r);
          }
        } else if (BtrTypeId == 5) {
          if (r.villageName && r.block && r.oldsvno && r.oldsubno) {
            const plotId = `${r.villageName}-${r.block}-${r.oldsvno}-${r.oldsubno}`;
            if (!plotUsage.has(plotId)) {
              plotUsage.set(plotId, { rows: [], totalArea: 0 });
            }
            plotUsage.get(plotId).rows.push(r);
          }
        }
      });
    });

    plotUsage.forEach(plotInfo => {
      const firstInstance = plotInfo.rows[0];
      const masterArea = parseFloat(firstInstance.area) || 0;

      plotInfo.rows.forEach(row => {
        row.area = masterArea > 0 ? masterArea.toString() : row.area;
      });

      let cumulativeEnumerated = 0;
      plotInfo.rows.forEach(row => {
        const enumerated = parseFloat(row.enumeratedArea) || 0;
        const remainingArea = masterArea - cumulativeEnumerated;

        const errorKey = `${data.find(kp => kp.rows.some(r => r.uniqueId === row.uniqueId)).id}-${row.uniqueId}`;

        if (enumerated > remainingArea && masterArea > 0) {
          newErrors[errorKey] = `Exceeds remaining plot area of ${remainingArea.toFixed(2)}`;
        }

        cumulativeEnumerated += enumerated;
      });
    });

    setErrors(newErrors);
    setKeyplotsData(data);
  };

  const handleVillageChange = (newVillageId, keyplotId, rowUniqueId) => {
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    const selectedVillage = allVillageData.find(v => v.villageId === newVillageId);
    if (selectedVillage) {
      row.villageName = selectedVillage.village;
      row.villageId = newVillageId;
      row.block = '';
      row.svNo = '';
      row.sub = '';
      row.area = '';
      row.enumeratedArea = '';

      const rowKey = `${keyplotId}-${rowUniqueId}`;
      setRowBlockOptions(prev => ({
        ...prev,
        [rowKey]: selectedVillage.blocks.map(b => b.blockCode)
      }));
    } else {
      row.villageName = '';
      row.villageId = null;
      row.block = '';
      row.svNo = '';
      row.sub = '';
      row.area = '';
      row.enumeratedArea = '';

      const rowKey = `${keyplotId}-${rowUniqueId}`;
      setRowBlockOptions(prev => ({
        ...prev,
        [rowKey]: []
      }));
    }

    validateAndSetData(newData);
  };
  const handleOpenConfirmDialog = (keyplotId, rowUniqueId) => {
    const keyplot = keyplotsData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    setRowToDelete({
      keyplotId,
      rowUniqueId,
      rowData: row
    });
    setOpenConfirmDialog(true);
  };

  // Function to close the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setRowToDelete(null);
  };

  // Function to handle the actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!rowToDelete) return;

    const { keyplotId, rowUniqueId, rowData } = rowToDelete;

    try {
      const token = authservice.gettoken();

      // Only call API if the row has a b_id (existing saved row)
      if (rowData.b_id) {
        const response = await fetch(`${BASE_URL}/btr-service/cluster-api/delete-sideplot/${rowData.b_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to delete row from server');

        console.log(`✅ Successfully removed saved row: ${rowData.b_id}`);
      }

      // Remove row from UI after successful deletion (or if it was never saved)
      const newData = JSON.parse(JSON.stringify(keyplotsData));
      const keyplot = newData.find(k => k.id === keyplotId);
      keyplot.rows = keyplot.rows.filter(r => r.uniqueId !== rowUniqueId);

      // Clean up row block options
      const rowKey = `${keyplotId}-${rowUniqueId}`;
      setRowBlockOptions(prev => {
        const newOptions = { ...prev };
        delete newOptions[rowKey];
        return newOptions;
      });

      validateAndSetData(newData);
      handleCloseConfirmDialog();

    } catch (err) {
      console.error('Error deleting row:', err);
      setSnackbarMessage(`Failed to delete row: ${err.message}`);
      setSnackbarOpen(true);
      handleCloseConfirmDialog();
    }
  };
  const handleInputChange = (e, keyplotId, rowUniqueId, field) => {

    const value = e.target.value;
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    let processedValue = value;

    if (field === 'area' || field === 'enumeratedArea') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        processedValue = value;
      } else {
        return;
      }
    }

    row[field] = processedValue;

    let rowtitle = []
    if (BtrTypeId == 2) {
      rowtitle = ['villageName', 'block', 'ward_number', 'houseno']
    } else if (BtrTypeId == 3) {
      rowtitle = ['villageName', 'block', 'ownername', 'address', 'enumeratedArea']
    } else if (BtrTypeId == 4) {
      rowtitle = ['villageName', 'block', 'tpno', 'tbsubdivisionno']
    } else if (BtrTypeId == 5) {
      rowtitle = ['villageName', 'block', 'oldsvno', 'oldsubno']
    }

    if (rowtitle.includes(field)) {
      const allRows = newData.flatMap(kp => kp.rows);
      const masterRow = allRows.find(r => isSamePlot(r, row) && r.uniqueId !== row.uniqueId);

      if (masterRow) {
        row.area = masterRow.area;
      }

      if (field === 'area') {
        const allRows2 = newData.flatMap(kp => kp.rows);
        allRows2.forEach(otherRow => {
          if (isSamePlot(otherRow, row)) {
            otherRow.area = processedValue;
          }
        });
      }

      if (row.isNew) {
        switch (field) {
          case 'block':
            row.svNo = '';
            row.sub = '';
            row.area = '';
            row.enumeratedArea = '';
            break;
          case 'svNo':
            row.sub = '';
            row.area = '';
            row.enumeratedArea = '';
            break;
          case 'sub':
            row.area = '';
            row.enumeratedArea = '';
            break;
          default:
            break;
        }
      }
    }

    validateAndSetData(newData);
  };

  // In ClusterManualEntryNonBtr component, replace the existing handleInputBlur with this:

  const handleInputBlur = async (e, keyplotId, rowUniqueId, field) => {
    const { value } = e.target;
    const row = keyplotsData.find(kp => kp.id === keyplotId)?.rows.find(r => r.uniqueId === rowUniqueId);

    // 1. Only trigger for the 'enumeratedArea' field on an existing row that has a b_id
    if (field !== 'enumeratedArea' || !row || row.isNew || !row.b_id) {
      return; // Do nothing if it's not the right field or it's a new row
    }

    // 2. Prevent API call if value is empty or invalid
    const enumeratedArea = parseFloat(value);
    if (isNaN(enumeratedArea)) {
      return;
    }

    setUpdatingRow(row.uniqueId); // Show loading spinner for this row
    setSnackbarMessage(''); // Clear previous messages

    try {
      const token = authservice.gettoken();
      const userId = authservice.userid();

      if (!token || !userId) {
        throw new Error("Authentication failed. Please log in again.");
      }

      // 3. Make the PATCH request to the new endpoint
      const response = await fetch(`${BASE_URL}/btr-service/cluster-api/update-sideplot/${row.b_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          enumeratedArea: enumeratedArea,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setSnackbarMessage(result.message || 'Plot updated successfully!');
      setSubmitSuccess(true);
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error updating plot:', error);
      setSnackbarMessage(`Update failed: ${error.message}`);
      setSubmitSuccess(false);
      setSnackbarOpen(true);
    } finally {
      setUpdatingRow(null); // Hide loading spinner
    }
  };


  const handleAddRow = (keyplotId) => {
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);

    const baseNewRow = {
      uniqueId: nextRowId.current++,
      villageName: '',
      villageId: null,
      block: '',
      svNo: '',
      sub: '',
      area: '',
      enumeratedArea: '',
      plot_id: '',
      isNew: true,
    };

    if (currentBType) {
      switch (currentBType.name) {
        case 'House List':
          baseNewRow.ownername = '';
          baseNewRow.address = '';
          baseNewRow.houseno = '';
          baseNewRow.ward_number = ''; // NEW
          break;
        case 'Cultivators List':
          baseNewRow.ownername = '';
          baseNewRow.address = '';
          baseNewRow.area = '';
          break;
        case 'Thandaper Number':
          baseNewRow.ownername = '';
          baseNewRow.address = '';
          baseNewRow.tpno = '';
          baseNewRow.tbsubdivisionno = '';

          break;
        case 'Others':
          baseNewRow.ownername = '';
          baseNewRow.address = '';
          baseNewRow.oldsvno = '';
          baseNewRow.oldsubno = '';
          break;
      }
    }

    keyplot.rows.push(baseNewRow);
    setKeyplotsData(newData);
  };
  const [removedRows, setRemovedRows] = useState([]);
  const handleRemoveRow = (keyplotId, rowUniqueId) => {
    let newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const rowToRemove = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    // If it's an existing row (has b_id), add to removed rows tracking
    if (rowToRemove && rowToRemove.b_id) {
      handleOpenConfirmDialog(keyplotId, rowUniqueId);
    } else {
      setRemovedRows(prev => [...prev, {
        b_id: rowToRemove.b_id,
        plot_id: rowToRemove.plot_id,
        keyplotLabel: keyplot.label,
        villageName: rowToRemove.villageName,
        block: rowToRemove.block,
        ward_number: rowToRemove.ward_number,
        houseno: rowToRemove.houseno,
        ownername: rowToRemove.ownername,
        address: rowToRemove.address,
        // area:rowToRemove.area,
        tpno: rowToRemove.tpno,
        tbsubdivisionno: rowToRemove.tbsubdivisionno,
        oldsvno: rowToRemove.oldsvno,
        oldsubno: rowToRemove.oldsubno
      }]);

      console.log('Added to removed rows:', rowToRemove.b_id);
    }

    // Remove the row from UI
    keyplot.rows = keyplot.rows.filter(r => r.uniqueId !== rowUniqueId);

    // Clean up row block options
    const rowKey = `${keyplotId}-${rowUniqueId}`;
    setRowBlockOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[rowKey];
      return newOptions;
    });

    validateAndSetData(newData);
  };
  const handleLabelChange = (newLabel, keyplotId) => {
    setKeyplotsData(prevData =>
      prevData.map(kp =>
        kp.id === keyplotId ? { ...kp, label: newLabel } : kp
      )
    );
  };

  const hasAnyError = Object.values(errors).some(error => error !== null && error !== '');
    const getLabelStatus = (label) => {
        const keyplot = keyplotsData.find(kp => kp.label === label);

        // No plot or no rows → incomplete
        if (!keyplot || !Array.isArray(keyplot.rows) || keyplot.rows.length === 0) {
            return 'incomplete';
        }
const requiredFieldsByType = {
  2: ['villageName', 'block', 'houseno', 'ward_number', 'area', 'enumeratedArea'],
  3: ['villageName', 'block', 'ownername', 'address', 'area', 'enumeratedArea'],
  4: ['villageName', 'block', 'tpno', 'area', 'enumeratedArea'],
  5: ['villageName', 'block', 'oldsvno', 'oldsubno', 'area', 'enumeratedArea']
};
        // At least one valid row → complete
       const hasValidRow = keyplot.rows.some(row => {
  const requiredFields = requiredFieldsByType[BtrTypeId];
  if (!requiredFields) return false;

  return requiredFields.every(field => row[field]);
});

        return hasValidRow ? 'complete' : 'incomplete';
    };
  const checkPlotUsageInCurrentForm = (plotIdentifier, currentRowUniqueId) => {
    const allRows = keyplotsData.flatMap(kp => kp.rows);
    const duplicateRows = allRows.filter(row => {
      const rowPlotIdentifier = `${row.villageId}-${row.block}-${row.svNo}-${row.sub || ''}`;
      return rowPlotIdentifier === plotIdentifier && row.uniqueId !== currentRowUniqueId;
    });

    if (duplicateRows.length === 0) {
      return { isUsed: false };
    }

    // Calculate total area and used area
    const totalArea = parseFloat(duplicateRows[0].area) || 0;
    const usedArea = duplicateRows.reduce((sum, row) => sum + (parseFloat(row.enumeratedArea) || 0), 0);
    const remainingArea = totalArea - usedArea;

    const locations = duplicateRows.map(row => {
      const keyplot = keyplotsData.find(kp => kp.rows.some(r => r.uniqueId === row.uniqueId));
      return keyplot ? keyplot.label : 'Unknown';
    });

    return {
      isUsed: true,
      location: locations.join(', '),
      totalArea,
      usedArea,
      remainingArea
    };
  };
  const handlePlotValidation = async (keyplotId, rowUniqueId) => {

    const keyplot = keyplotsData.find(k => k.id === keyplotId);
    if (!keyplot) return;

    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    if (BtrTypeId == 2) {
      if (!row || !row.villageId || !row.block || !row.ward_number || !row.houseno) {
        return;
      }
    } else if (BtrTypeId == 3) {
      if (!row || !row.villageId || !row.block || !row.ownername || !row.address || !row.area) {
        return;
      }
    } else if (BtrTypeId == 4) {
      if (!row || !row.villageId || !row.block || !row.tpno) {
        return;
      }
    } else if (BtrTypeId == 5) {
      if (!row || !row.villageId || !row.block || !row.oldsvno || !row.oldsubno) {
        return;
      }
    }

    // First check if this plot is already used in the current form
    const plotIdentifier = `${row.villageId}-${row.block}-${row.svNo}-${row.sub || ''}`;
    const existingUsageInForm = checkPlotUsageInCurrentForm(plotIdentifier, rowUniqueId);

    if (existingUsageInForm.isUsed) {
      // Plot is already used in current form - show UI validation
      setValidationInfo({
        message: `This plot is already used in ${existingUsageInForm.location}.`,
        totalcent: existingUsageInForm.totalArea,
        remainingArea: existingUsageInForm.remainingArea,
        isFromCurrentForm: true
      });
      setValidatingRow({ keyplotId, rowUniqueId });
      setIsValidationDialogOpen(true);
      return;
    }

    // If not found in current form, check with backend
    try {
      const token = authservice.gettoken();
      const zoneId = authservice.getzone();
      let payload = null;
      if (BtrTypeId == 2) {
        payload = {
          btrtype: BtrTypeId,
          vcode: row.villageId,
          bcode: row.block,
          resvno: parseInt(row.svNo, 10),
          resbdno: row.sub && row.sub.trim() !== "" ? row.sub.trim() : null,
          wardno: row.ward_number,
          houseno: row.houseno,
          lbcode: defaultLbcode,
          zoneId: parseInt(zoneId, 10),
        };
      } else if (BtrTypeId == 3) {
        payload = {
          btrtype: BtrTypeId,
          vcode: row.villageId,
          bcode: row.block,
          resvno: parseInt(row.svNo, 10),
          resbdno: row.sub && row.sub.trim() !== "" ? row.sub.trim() : null,
          ownername: row.ownername,
          address: row.address,
          lbcode: defaultLbcode,
          totCent: row.area,
          zoneId: parseInt(zoneId, 10),
        };
      } else if (BtrTypeId == 4) {

        payload = {
          btrtype: BtrTypeId,
          vcode: row.villageId,
          bcode: row.block,
          resvno: parseInt(row.svNo, 10),
          resbdno: row.sub && row.sub.trim() !== "" ? row.sub.trim() : null,
          tpno: row.tpno,
          tbsubdivisionno: row.tbsubdivisionno,
          lbcode: defaultLbcode,
          totCent: row.area,
          zoneId: parseInt(zoneId, 10),
        };
      } else if (BtrTypeId == 5) {
        payload = {
          btrtype: BtrTypeId,
          vcode: row.villageId,
          bcode: row.block,
          resvno: parseInt(row.svNo, 10),
          resbdno: row.sub && row.sub.trim() !== "" ? row.sub.trim() : null,
          oldsvno: row.oldsvno,
          oldsubno: row.oldsubno,
          lbcode: defaultLbcode,
          totCent: row.area,
          zoneId: parseInt(zoneId, 10),
        };
      }

      console.log('Sending validation payload:', payload);

      const response = await fetch(`${BASE_URL}/btr-service/api/btr-data/validate-duplicate-nonbtr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.status === 409 || response.ok) {
        console.log('Validation result:', data);

        if (response.status === 409) {
          if (data.availableSubdivisions && data.availableSubdivisions.length > 0) {
            setAvailableSubdivisions(data.availableSubdivisions);
            setPendingPlot({ keyplotId, rowUniqueId, validationInfo: data });
            setSubdivisionDialogOpen(true);
          } else {
            setValidationInfo(data);
            setValidatingRow({ keyplotId, rowUniqueId });
            setIsValidationDialogOpen(true);
          }
        } else {
          setSnackbarMessage("Plot is available for use.");
          setSnackbarOpen(true);
        }
      } else {
        throw new Error(data.message || `Validation failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error validating duplicate plot:", error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handlePlotValidation2 = async (keyplotId, rowUniqueId) => {
    const keyplot = keyplotsData.find(k => k.id === keyplotId);
    if (!keyplot) return;

    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);
    if (!row || !row.villageId || !row.block || !row.svNo) {
      return;
    }

    // First check if this plot is already used in the current form
    const plotIdentifier = `${row.villageId}-${row.block}-${row.svNo}-${row.sub || ''}`;
    const existingUsageInForm = checkPlotUsageInCurrentForm(plotIdentifier, rowUniqueId);

    if (existingUsageInForm.isUsed) {
      // Plot is already used in current form - show UI validation
      setValidationInfo({
        message: `This plot is already used in ${existingUsageInForm.location}.`,
        totalcent: existingUsageInForm.totalArea,
        remainingArea: existingUsageInForm.remainingArea,
        isFromCurrentForm: true
      });
      setValidatingRow({ keyplotId, rowUniqueId });
      setIsValidationDialogOpen(true);
      return;
    }

    // If not found in current form, check with backend
    try {
      const token = authservice.gettoken();
      const zoneId = getEffectiveZoneId();

      const payload = {
        lbcode: defaultLbcode,
        vcode: row.villageId,
        bcode: row.block,
        resvno: parseInt(row.svNo, 10),
        resbdno: row.sub && row.sub.trim() !== "" ? row.sub.trim() : null,
        zoneId: parseInt(zoneId, 10),
      };

      console.log('Sending validation payload:', payload);

      const response = await fetch(`${BASE_URL}/btr-service/api/btr-data/validate-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.status === 409 || response.ok) {
        console.log('Validation result:', data);

        if (response.status === 409) {
          if (data.availableSubdivisions && data.availableSubdivisions.length > 0) {
            setAvailableSubdivisions(data.availableSubdivisions);
            setPendingPlot({ keyplotId, rowUniqueId, validationInfo: data });
            setSubdivisionDialogOpen(true);
          } else {
            setValidationInfo(data);
            setValidatingRow({ keyplotId, rowUniqueId });
            setIsValidationDialogOpen(true);
          }
        } else {
          setSnackbarMessage("Plot is available for use.");
          setSnackbarOpen(true);
        }
      } else {
        throw new Error(data.message || `Validation failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error validating duplicate plot:", error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const isSubmitDisabled = () => {
    if (hasAnyError || submitting) return true;

    const keyplotData = keyplotsData.find(kp => kp.label === 'K');
    if (!keyplotData || keyplotData.rows.length === 0) return true;

    for (const keyplot of keyplotsData) {
      for (const row of keyplot.rows) {

        if (BtrTypeId == 2) {
          if (!row.villageName || !row.block || !row.houseno || !row.ward_number || !row.area || !row.enumeratedArea) {
            return true;
          }
        } else if (BtrTypeId == 3) {
          if (!row.villageName || !row.block || !row.ownername || !row.address || !row.area || !row.enumeratedArea) {
            return true;
          }
        } else if (BtrTypeId == 4) {
          if (!row.villageName || !row.block || !row.tpno || !row.area || !row.enumeratedArea) {
            return true;
          }
        } else if (BtrTypeId == 5) {
          if (!row.villageName || !row.block || !row.oldsvno || !row.oldsubno || !row.area || !row.enumeratedArea) {
            return true;
          }
        }
      }
    }

    return false;
  };
   const getMissingLabels = () => {
        const labelsWithValidRows = new Set();

        // Check each keyplot
        for (const keyplot of keyplotsData) {
            const hasValidRow = keyplot.rows.some(row => {
                if (row.isExisting || row.isNew) {
                    return row.villageName &&
                        row.block &&
                        row.svNo &&
                        row.area &&
                        row.enumeratedArea;
                }
                return false;
            });

            if (hasValidRow) {
                labelsWithValidRows.add(keyplot.label);
            }
        }

        // K must have a row
        const missing = [];
        if (!labelsWithValidRows.has('K')) {
            missing.push('K');
        }

        // Need at least 4 other labels with rows
        const otherLabelsWithRows = [...labelsWithValidRows].filter(label => label !== 'K').length;
        const missingOtherCount = 4 - otherLabelsWithRows;

        if (missingOtherCount > 0) {
            // Find which other labels don't have rows
            const otherLabels = currentLabels.filter(label => label !== 'K');
            otherLabels.forEach(label => {
                if (!labelsWithValidRows.has(label) && missingOtherCount > 0) {
                    missing.push(label);
                }
            });
        }

        return missing;
    };
  const firstInstanceMap = new Map();
  keyplotsData.forEach(kp => {
    kp.rows.forEach(r => {
      if (r.villageName && r.block && r.svNo && r.sub) {
        const plotId = `${r.villageName}-${r.block}-${r.svNo}-${r.sub}`;
        if (!firstInstanceMap.has(plotId)) {
          firstInstanceMap.set(plotId, r.uniqueId);
        }
      }
    });
  });

  const selectedLabels = keyplotsData.map(kp => kp.label);

  // Helper: a stacked field with label above, field below, consistent spacing
  const StackedField = ({ children }) => (
    <Grid item xs={12}>
      {children}
    </Grid>
  );

  const renderRowFormSection = (
    keyplot,
    row,
    isNewRow,
    hasError,
    errorKey,
    currentRowBlockOptions,
    isAreaReadOnly,
    isKeyPlotFirstRow
  ) => {
    return (
      <Paper
        key={`${keyplot.id}-${row.uniqueId}`}
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          borderColor: hasError ? 'error.light' : 'divider',
          backgroundColor: 'white'
        }}
      >
        <Grid container spacing={2}>
          {/* Row 1: Village, Block, Survey No */}
          <Grid item xs={12} sm={6} md={4}>
            {isNewRow ? (
              <Autocomplete
                size="small"
                options={villageOptions}
                getOptionLabel={(option) => option.village || ''}
                value={
                  row.villageId
                    ? villageOptions.find((v) => v.villageId === row.villageId)
                    : null
                }
                onChange={(event, newValue) => {
                  handleVillageChange(
                    newValue ? newValue.villageId : null,
                    keyplot.id,
                    row.uniqueId
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Village"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                )}
              />
            ) : (
              <TextField
                label={<> Village.<span style={{ color: 'red' }}> *</span></>}
                value={row.villageName}
                InputProps={{ readOnly: true }}
                fullWidth
                size="small"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            {isNewRow ? (
              <FormControl fullWidth size="small">
                <InputLabel>Block</InputLabel>
                <Select
                  name="block"
                  label="Block"
                  value={row.block}
                  onChange={(e) =>
                    handleInputChange(e, keyplot.id, row.uniqueId, 'block')
                  }
                >
                  {currentRowBlockOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label={<>  Block.<span style={{ color: 'red' }}> *</span></>}
                value={row.block}
                InputProps={{ readOnly: true }}
                fullWidth
                size="small"
              />
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Survey No."
              size="small"
              fullWidth
              value={row.svNo}
              InputProps={{ readOnly: !isNewRow }}
              onChange={(e) =>
                handleInputChange(e, keyplot.id, row.uniqueId, 'svNo')
              }
              onBlur={() => handlePlotValidation2(keyplot.id, row.uniqueId)}
            />
          </Grid>

          {/* Row 2: Sub Div, Area, Enumerated Area */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Sub Div"
              size="small"
              fullWidth
              value={row.sub}
              InputProps={{ readOnly: !isNewRow }}
              onChange={(e) =>
                handleInputChange(e, keyplot.id, row.uniqueId, 'sub')
              }
              onBlur={() => handlePlotValidation2(keyplot.id, row.uniqueId)}
            />
          </Grid>

          {(() => {
            const b = currentBType?.name;
            const readOnly = !isNewRow;
            if (!b) return null;

            if (b === 'Cultivators List') {
              return (
                <>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label={<> Name.<span style={{ color: 'red' }}> *</span></>}
                      size="small"
                      fullWidth
                      value={row.ownername || ''}
                      InputProps={{ readOnly }}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          keyplot.id,
                          row.uniqueId,
                          'ownername'
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      label={<> Address<span style={{ color: 'red' }}> *</span></>}
                      size="small"
                      fullWidth
                      value={row.address || ''}
                      InputProps={{ readOnly }}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'address')
                      }
                    />
                  </Grid>

                </>
              );
            }

            if (b === 'House List') {
              return (
                <>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      value={row.ownername || ''}
                      InputProps={{ readOnly }}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          keyplot.id,
                          row.uniqueId,
                          'ownername'
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
                    <TextField
                      label="Address"
                      size="small"
                      fullWidth
                      value={row.address || ''}
                      InputProps={{ readOnly }}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'address')
                      }
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label={<> Ward No.<span style={{ color: 'red' }}> *</span></>}
                      size="small"
                      fullWidth
                      value={row.ward_number}
                      InputProps={{ readOnly }}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, "ward_number")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label={<> House No.<span style={{ color: 'red' }}> *</span></>}
                      size="small"
                      fullWidth
                      // type="number"
                      value={row.houseno || ''}
                      InputProps={{ readOnly }}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'houseno')
                      }
                    />
                  </Grid>
                </>
              );
            }

            if (b === 'Thandaper Number') {
              return (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="Name"
                      size="small"
                      fullWidth
                      value={row.ownername || ''}
                      InputProps={{ readOnly }}
                      onChange={(e) =>
                        handleInputChange(
                          e,
                          keyplot.id,
                          row.uniqueId,
                          'ownername'
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
                    <TextField
                      label="Address"
                      size="small"
                      fullWidth
                      value={row.address || ''}
                      InputProps={{ readOnly }}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'address')
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label={<> Thandaper No.<span style={{ color: 'red' }}> *</span></>}
                      size="small"
                      fullWidth
                      type="number"
                      value={row.tpno || ''}
                      InputProps={{ readOnly }}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'tpno')
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Thandaper Sub No."
                      size="small"
                      fullWidth
                      value={row.tbsubdivisionno}
                      onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                      // InputProps={{ readOnly }}
                      onChange={(e) =>
                        handleInputChange(e, keyplot.id, row.uniqueId, 'tbsubdivisionno')
                      }
                    />
                  </Grid>
                </>
              );
            }

            // Others
            return (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    value={row.ownername || ''}
                    InputProps={{ readOnly }}
                    onChange={(e) =>
                      handleInputChange(e, keyplot.id, row.uniqueId, 'ownername')
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Address"
                    size="small"
                    fullWidth
                    value={row.address || ''}
                    InputProps={{ readOnly }}
                    onChange={(e) =>
                      handleInputChange(e, keyplot.id, row.uniqueId, 'address')
                    }
                  />
                </Grid>
                {/* Only Old Survey fields */}
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label={<> Old Survey No.<span style={{ color: 'red' }}> *</span></>}
                    size="small"
                    fullWidth
                    value={row.oldsvno || ''}
                    InputProps={{ readOnly }}
                    onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                    onChange={(e) =>
                      handleInputChange(e, keyplot.id, row.uniqueId, 'oldsvno')
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Old Sub No."
                    size="small"
                    fullWidth
                    value={row.oldsubno || ''}
                    InputProps={{ readOnly }}
                    onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                    onChange={(e) =>
                      handleInputChange(e, keyplot.id, row.uniqueId, 'oldsubno')
                    }
                  />
                </Grid>
              </>
            );
          })()}

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={<> Area.<span style={{ color: 'red' }}> *</span></>}
              size="small"
              fullWidth
              type="number"
              value={row.area}

              InputProps={{
                // readOnly: !isKeyPlotFirstRow && isAreaReadOnly && !isNewRow
                readOnly: row.isExisting
              }}
              {...(BtrTypeId === 3 && {
                onBlur: () => handlePlotValidation(keyplot.id, row.uniqueId),
              })}
              onChange={(e) =>
                handleInputChange(e, keyplot.id, row.uniqueId, 'area')
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label={<> Enum. Area<span style={{ color: 'red' }}> *</span></>}
              size="small"
              fullWidth
              type="number"

              value={row.enumeratedArea}
              onChange={(e) =>
                handleInputChange(e, keyplot.id, row.uniqueId, 'enumeratedArea')
              }
              // This onBlur will now trigger the API call
              // onBlur={(e) =>
              //   handleInputBlur(e, keyplot.id, row.uniqueId, 'enumeratedArea')
              // }
              error={hasError}
              helperText={hasError ? errors[errorKey] : ''}
              // Add InputProps to show a loading spinner during update
              // InputProps={{
              //   endAdornment: updatingRow === row.uniqueId ? (
              //     <CircularProgress color="inherit" size={20} />
              //   ) : null,
              // }}
              InputProps={{ readOnly: row.isExisting }}
            />
          </Grid>


          {/* Row 3: BType-specific fields laid out responsively */}


          {/* Actions */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Grid item xs={1}>
              {row.isExisting && (
                <Chip label="Saved" size="small" color="success" variant="outlined" />
              )}</Grid>
            {(!isKeyPlotFirstRow || isNewRow) && (
              <Tooltip title="Remove Row">
                <IconButton
                  color="error"
                  onClick={() => handleRemoveRow(keyplot.id, row.uniqueId)}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Floating Summary Bar */}
       {/* {getMissingLabels().length > 0 && (
                          <Box sx={{ position: 'fixed', top: '15%', left: 0, zIndex: 1000, borderRight: '4px solid #05307a', borderRadius: '0 1rem 0 1rem', backgroundColor: 'rgba(247, 236, 186, 0.8)', p: 1.5, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '300px' }}>
                              <Typography variant="h6" fontWeight="bold" gutterBottom>SidePlots Requirements</Typography>
                              <Typography variant="body2" color="textSecondary">
                                  <strong>Requirements:</strong>
                                  <Box component="span" sx={{ ml: 1 }}>
                                      • <strong>K</strong> (Keyplot) must have at least one row<br />
                                      • <strong>4 other plots</strong> must each have at least one row
                                  </Box>
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                  <strong>Current plots:</strong> {currentLabels.join(', ')}
                              </Typography>
                              {getMissingLabels().length > 0 && (
                                  <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                                      <strong>Missing rows in:</strong> {getMissingLabels().join(', ')}
                                  </Typography>
                              )}
                              <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="textSecondary">
                                      <strong>Progress:</strong> K: {getLabelStatus('K') === 'complete' ? '✓' : '✗'} |
                                      Other plots: {[...currentLabels].filter(l => l !== 'K').filter(l => getLabelStatus(l) === 'complete').length}/4
                                  </Typography>
                              </Box>
                          </Box>)} */}

      <Box sx={{ position: 'fixed', top: '15%', right: 0, zIndex: 1000, borderRadius: '1rem 0 0 1rem', backgroundColor: 'rgba(212, 228, 231, 0.8)', p: 1.5, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '300px' }}>
        <Typography variant="subtitle1" fontWeight="bold">Cluster: {slNo} | {clusterInfo.localBody}</Typography>
        <Box sx={{ width: '100%', mt: 1 }}>
          <Typography variant="subtitle1"><strong>Total Enumerated Area:</strong> {clusterInfo.totalArea.toFixed(2)} Cent</Typography>
          <LinearProgress variant="determinate" value={totalAreaProgress} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
          <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
            {clusterInfo.totalArea.toFixed(2)} / {clusterInfo.maxArea} Cents
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Tooltip title="View FMB"><Button variant="contained" color="secondary"><MapIcon /></Button></Tooltip>
            {/* <Tooltip title="Reject Cluster"><Button variant="contained" color="error"><WarningAmberIcon /></Button></Tooltip> */}
            <Tooltip title="Submit">
              {role === 'Field Data Collector' && (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  disabled={isSubmitDisabled()}
                  startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {submitting ? 'Saving...' : 'Submit'}
                </Button>
              )}
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Typography variant="h4" align="center" gutterBottom color="primary">Cluster Land Form</Typography>

      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Cluster Info Section */}
        <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Cluster Info</Box>
        <Grid container spacing={2} mb={2} alignItems="flex-start">
          <Grid item xs={12} sm={6} md={3}><TextField label="Cluster No." value={slNo} InputProps={{ readOnly: true }} fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label="Local Body" value={clusterInfo.localBody} InputProps={{ readOnly: true }} fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label="Land Type" value={clusterInfo.landType} InputProps={{ readOnly: true }} fullWidth /></Grid>
          <Grid item xs={12} sm={6} md={3}><TextField label="Total area" value={`${clusterInfo.totalArea} cents`} InputProps={{ readOnly: true }} fullWidth /></Grid>
        </Grid>
        <center><Chip label={clusterInfo.BtrType} variant="outlined" /></center>

        {/* Selected CCE Crops */}
        {(savedCrops.length > 0 || (apiCropsData && apiCropsData.crops && apiCropsData.crops.length > 0)) && (
          <Paper elevation={2} sx={{ mt: 3, mb: 3, overflow: 'hidden', borderRadius: 1, border: '1px solid #ccc' }}>
            <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <GrassIcon />
              <Typography variant="h6" fontWeight="bold">Selected CCE Crops</Typography>
              {loadingApiCrops && <CircularProgress size={16} sx={{ color: 'white', ml: 1 }} />}
            </Box>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1}>
                {/* Combine and group all crops */}
                {(() => {
                  // Combine both saved crops and API crops
                  const allCrops = [];

                  // Add saved crops
                  savedCrops.forEach(crop => {
                    const cropName = typeof crop === 'object' ? crop.cropName : crop;
                    allCrops.push(cropName);
                  });

                  // Add API crops
                  if (apiCropsData && apiCropsData.crops) {
                    apiCropsData.crops.forEach(crop => {
                      allCrops.push(crop.cropName);
                    });
                  }

                  // Count occurrences of each crop
                  const cropCounts = {};
                  allCrops.forEach(cropName => {
                    cropCounts[cropName] = (cropCounts[cropName] || 0) + 1;
                  });

                  // Render unique crops with counts
                  return Object.entries(cropCounts).map(([cropName, count]) => (
                    <Grid item key={cropName}>
                      <Chip
                        label={count > 1 ? `${cropName}` : cropName}
                        color="success"
                        sx={{ mb: 1 }}
                      />
                    </Grid>
                  ));
                })()}
              </Grid>
            </Box>
          </Paper>
        )}
        {/* Action Buttons */}
        <Box sx={{ maxWidth: 900, margin: '0 auto', mb: 3 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item>
              {role === 'Field Data Collector' && (
                <Button variant="contained" color="info" onClick={handleOpenCropsModal}>Add CCE crops</Button>
              )}
            </Grid>
            <Grid item><Button variant="contained" color="secondary" startIcon={<MapIcon />}>View FMB</Button></Grid>
            {/* <Grid item><Button variant="contained" color="error" startIcon={<DeleteForeverIcon />}>Reject Cluster</Button></Grid> */}
          </Grid>
        </Box>

        {/* Keyplot Sections - REFACTORED TO STACKED FORM FIELDS */}
        {keyplotsData.map((keyplot) => {
          let isNewRowIncomplete = false;
          
          if (BtrTypeId === 2) {
            isNewRowIncomplete = keyplot.rows
              .filter(r => r.isNew)
              .some(r => !r.villageName || !r.block || !r.ward_number || !r.houseno || !r.area || !r.enumeratedArea);
          } else if (BtrTypeId === 3) {
            isNewRowIncomplete = keyplot.rows
              .filter(r => r.isNew)
              .some(r => !r.villageName || !r.block || !r.ownername || !r.address || !r.area || !r.enumeratedArea);
          } else if (BtrTypeId === 4) {
            isNewRowIncomplete = keyplot.rows
              .filter(r => r.isNew)
              .some(r => !r.villageName || !r.block || !r.tpno || !r.area || !r.enumeratedArea);
          } else if (BtrTypeId === 5) {
            isNewRowIncomplete = keyplot.rows
              .filter(r => r.isNew)
              .some(r => !r.villageName || !r.block || !r.oldsvno || !r.oldsubno || !r.area || !r.enumeratedArea);
          }

          const hasErrorInKeyplot = keyplot.rows.some(r => !!errors[`${keyplot.id}-${r.uniqueId}`]);
          return (
            <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, bgcolor: 'white', p: 0 }}>
              <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {keyplot.label === 'K' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>KEYPLOT:</Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: '2px 10px',
                        borderRadius: '6px',
                        borderColor: 'white',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {keyplot.label}
                      </Typography>
                    </Paper>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">Side Plot -</Typography>
                    <FormControl size="small" sx={{ minWidth: 90 }}>
                      <Select
                        value={keyplot.label}
                        onChange={(e) => handleLabelChange(e.target.value, keyplot.id)}
                        sx={{
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                          '& .MuiSvgIcon-root': { color: 'white' },
                        }}
                      >
                        {SIDE_PLOT_OPTIONS.map(option => {
                          const isDisabled = selectedLabels.includes(option) && option !== keyplot.label;
                          return (
                            <MenuItem key={option} value={option} disabled={isDisabled}>
                              {option}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: '6px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    Total:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    {keyplot.rows.reduce((total, row) => total + (parseFloat(row.enumeratedArea) || 0), 0).toFixed(2)} cents
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                {keyplot.rows.length === 0 && (
                  <Box sx={{ textAlign: 'center', color: 'text.secondary', p: 2 }}>
                    No rows added.
                  </Box>
                )}

                {keyplot.rows.map((row) => {
                  const errorKey = `${keyplot.id}-${row.uniqueId}`;
                  const hasError = !!errors[errorKey];

                  const plotId = (row.villageName && row.block && row.svNo && row.sub) ? `${row.villageName}-${row.block}-${row.svNo}-${row.sub}` : null;
                  const isFirstInstance = plotId ? firstInstanceMap.get(plotId) === row.uniqueId : true;
                  const isAreaReadOnly = !isFirstInstance;
                  const isKeyPlotFirstRow = keyplot.label === 'K' && isFirstInstance;

                  const rowKey = `${keyplot.id}-${row.uniqueId}`;
                  const currentRowBlockOptions = rowBlockOptions[rowKey] || [];

                  return renderRowFormSection(
                    keyplot,
                    row,
                    !!row.isNew,
                    hasError,
                    errorKey,
                    currentRowBlockOptions,
                    isAreaReadOnly,
                    isKeyPlotFirstRow
                  );
                })}
                {role === 'Field Data Collector' && (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => handleAddRow(keyplot.id)}
                      disabled={isNewRowIncomplete || hasErrorInKeyplot}
                    >
                      Add Row
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}

        {/* Main Submit Button */}
        {role === 'Field Data Collector' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              sx={{ minWidth: 200, height: 48 }}
            >
              {submitting ? 'Saving Cluster...' : 'Submit Cluster'}
            </Button>
          </Box>
        )}


        {/* Submit Error Display */}
        {/* {submitError && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                        <Typography variant="body2">
                            <strong>Submit Error:</strong> {submitError}
                        </Typography>
                    </Box>
                )} */}
      </Box>

      {/* CCE Crops Modal */}
      <Dialog open={isCropsModalOpen} onClose={() => setCropsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GrassIcon />
            <Typography variant="h6">Select CCE Crops</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please select the crops for Crop Cutting Experiment (CCE). Only active crops are available for selection.
          </DialogContentText>

          {loadingCrops ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {cceCropDetails
                .filter(crop => crop.cropId && crop.cropName)
                .map(crop => {
                  const selectedCropNames = getSelectedCropNames();
                  const isCropAlreadySelected = selectedCropNames.has(crop.cropName);
                  const isDisabled = crop.noOfCce <= 0 || isCropAlreadySelected;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={crop.cropId}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedCrops[crop.cropId] || false}
                            onChange={handleCropSelectionChange}
                            name={crop.cropId.toString()}
                            color="primary"
                            disabled={isDisabled}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                color: isCropAlreadySelected ? 'text.disabled' : 'text.primary'
                              }}
                            >
                              {crop.cropName} ({crop.noOfCce})
                              {isCropAlreadySelected && (
                                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'warning.main' }}>
                                  - Already Selected
                                </Typography>
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={isCropAlreadySelected ? 'text.disabled' : 'textSecondary'}
                            >
                              {crop.frameName} - {crop.noOfCce} CCE
                            </Typography>
                          </Box>
                        }
                        sx={{
                          width: '100%',
                          m: 0,
                          p: 1,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          backgroundColor: isCropAlreadySelected ? '#f5f5f5' : 'white',
                          opacity: isCropAlreadySelected ? 0.7 : 1,
                          '&:hover': {
                            backgroundColor: isCropAlreadySelected ? '#f5f5f5' : '#f5f5f5'
                          }
                        }}
                      />
                    </Grid>
                  );
                })
              }
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCropsModalOpen(false)}
            color="primary"
          >
            Close
          </Button>
          <Button
            onClick={handleCloseCropsModal}
            variant="contained"
            color="primary"
            disabled={loadingCrops || savingCrops}
            startIcon={savingCrops ? <CircularProgress size={20} /> : null}
          >
            {savingCrops ? "Saving..." : "Save Selection"}
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog
        open={isValidationDialogOpen}
        onClose={() => setIsValidationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color={validationInfo?.isFromCurrentForm ? "warning" : "primary"} />
            <Typography variant="h6">
              {validationInfo?.isFromCurrentForm ? "Duplicate Plot in Form" : "Plot Recommendation"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {renderValidationDialogContent()}
        </DialogContent>
        <DialogActions>
               {/* <Button onClick={() => setIsValidationDialogOpen(false)} color="secondary"> */}
                        {/*<Button onClick={handleRejectPlot} color="secondary">
                            Cancel
                        </Button>*/}

          {validationInfo && (
            <>
              {validationInfo.remainingArea > 0 && (
                <Button
                  onClick={() => handleUseRecommendedPlot('remaining')}
                  color="primary"
                  variant="contained"
                >
                  Use Remaining Area ({validationInfo.remainingArea.toFixed(2)} cents)
                </Button>
              )}

              <Button
                onClick={handleRejectPlot}
                color="error"
                variant="outlined"
              >
                {validationInfo.isFromCurrentForm ? 'Clear Entry' : 'Reject Plot'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This row is already saved in the Cluster. Do you want to delete it permanently?
            {rowToDelete && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Plot:</strong> {rowToDelete.rowData.villageName} - {rowToDelete.rowData.block} - {rowToDelete.rowData.svNo}/{rowToDelete.rowData.sub}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={submitSuccess ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClusterManualEntryNonBtr;
