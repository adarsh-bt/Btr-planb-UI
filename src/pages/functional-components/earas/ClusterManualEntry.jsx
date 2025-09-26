import React, { useState, useEffect, useRef, useCallback } from 'react';
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
const SIDE_PLOT_OPTIONS = ['N1', 'E1', 'S1', 'W1', 'N2', 'E2', 'S2', 'W2'];

// --- Sample Data for Dropdowns & Modal ---
const cropOptions = [
    'Paddy', 'Banana', 'Tapioca', 'Ginger', 'Turmeric',
    'Elephant Foot Yam', 'Taro', 'Sweet Potato', 'Bitter Gourd',
    'Snake Gourd', 'Ash Gourd', 'Pumpkin', 'Cucumber', 'Beans',
    'Cowpea', 'Bhindi', 'Brinjal', 'Green Chilli', 'Tomato'
];

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

const ClusterFormUI = () => {
    const [keyplotsData, setKeyplotsData] = useState([]);
    const [clusterInfo, setClusterInfo] = useState({
        clusterNo: '',
        localBody: '',
        landType: '',
        totalArea: 0,
        maxArea: 600
    });
    const [isCropsModalOpen, setCropsModalOpen] = useState(false);
    const [selectedCrops, setSelectedCrops] = useState({});
    const [savedCrops, setSavedCrops] = useState([]);

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
    
    // ✅ Submit-related states
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

    const [apiCropsData, setApiCropsData] = useState(null);
    const [loadingApiCrops, setLoadingApiCrops] = useState(false);

    
    const [keyplotDetails, setKeyplotDetails] = useState({
        villageBlock: '',
        panchayath: '',
        syNo: '',
        areaCents: '',
        landType: ''
    });
    const [rowBlockOptions, setRowBlockOptions] = useState({});

    // ✅ NEW: Function to fetch CCE crop details from API
    // Updated function to fetch and filter CCE crop details based on land type
const fetchCceCropDetails = async () => {
    setLoadingCrops(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${FORM_URL}/earas-form1-entry/cce-crop-details/fetch-cce-crops`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('CCE Crop Details:', data);
        
        // Ensure data is always an array
        const cropData = Array.isArray(data) ? data : (data.crops || data.payload || []);
        
        // Filter crops based on cluster land type
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

// Add this function to your ClusterFormUI component
// Add this function to fetch CCE crops from your API
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


// Add this useEffect after your existing useEffects
// Add this useEffect after your existing useEffects
useEffect(() => {
    if (clusterId) {
        fetchApiCceCrops();
    }
}, [clusterId, fetchApiCceCrops]);

// Helper function to get all currently selected crop names
const getSelectedCropNames = () => {
    const selectedCropNames = new Set();
    
    // Add saved crops
    savedCrops.forEach(crop => {
        const cropName = typeof crop === 'object' ? crop.cropName : crop;
        selectedCropNames.add(cropName);
    });
    
    // Add API crops
    if (apiCropsData && apiCropsData.crops) {
        apiCropsData.crops.forEach(crop => {
            selectedCropNames.add(crop.cropName);
        });
    }
    
    return selectedCropNames;
};


// New function to filter crops based on land type
const filterCropsByLandType = (crops, landType) => {
    if (!landType || !Array.isArray(crops)) return crops;
    
    const normalizedLandType = landType.toUpperCase();
    
    return crops.filter(crop => {
        if (!crop.frameName) return false;
        
        const frameName = crop.frameName.toUpperCase();
        
        // Filter logic based on frameName and landType
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
}, [clusterInfo.landType]); // Add dependency on landType

// Keep the original useEffect for initial load
useEffect(() => {
    fetchCceCropDetails();
}, []);


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
            setMinCluster(data.payload.clusterMin);
            setMaxCluster(data.payload.clusterMax);
            setMeanCluster(data.payload.clusterMean);
            setDefaultLbcode(data.payload.lbcode);
            
            console.log("data >>>> ", data.payload);
            
            setDefaultBlock(data.payload.villageBlock);
            setDefaultVillageId(data.payload.kvillageId);
            setDefaultVillage(data.payload.kvillageName);
            setClusterId(data.payload.clusterId);

            if (data.payload) {
                setKeyplotDetails(data.payload);

                setClusterInfo(prevInfo => ({
                    ...prevInfo,
                    clusterNo: data.payload.clusterNo || '1',
                    localBody: data.payload.kvillageName || 'N/A',
                    landType: data.payload.landType || 'Wet',
                    maxArea: data.payload.clusterMax || 600,
                }));

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
                                isExisting: true,
                                uniqueId: nextRowId.current++
                            }))
                        };
                    });
                }

                console.log("existed plots ", existingSidePlots);

                const fixed = ['K'];
                const existing = Object.keys(existingSidePlots).filter(l => l !== 'K');
                const defaults = ['N1', 'E1', 'S1', 'W1'];
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
                console.log("village >>> ", data);
                
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

    // ✅ WORKING: Submit functionality with proper API integration from paste.txt
    // ✅ FIXED: Submit functionality with proper plot_id handling
const handleSubmit = async () => {
    try {
        setSubmitting(true);
        setSubmitError('');

        // Get user info using existing authservice methods
        const userId = authservice.userid();
        const token = authservice.gettoken();

        console.log('Debug - User ID:', userId);
        console.log('Debug - Token exists:', !!token);
        console.log('Debug - Keyplot ID:', keyplotId);

        if (!userId) {
            throw new Error('User information not found. Please login again.');
        }

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        // Validate that we have at least keyplot data
        const keyplotData = keyplotsData.find(kp => kp.label === 'K');
        if (!keyplotData || keyplotData.rows.length === 0) {
            throw new Error('Keyplot data is required.');
        }

        // ✅ UPDATED: Modified validation to handle missing plot_id for new rows
        for (const keyplot of keyplotsData) {
            for (const row of keyplot.rows) {
                if (!row.villageName || !row.block || !row.svNo || !row.sub || !row.area || !row.enumeratedArea) {
                    throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
                }
                // ✅ FIXED: Only validate plot_id for existing rows, not new ones
                if (!row.isNew && !row.plot_id) {
                    throw new Error(`Plot ID is missing for existing ${keyplot.label} plot. Please ensure all plots are properly linked.`);
                }
            }
        }

        // ✅ PREPARE: Request data with better validation and plot_id handling
        const requestData = {
            userId: userId,
            keyplotId: keyplotId,
            clusterNo: clusterId,
            sidePlots: keyplotsData
                .filter(keyplot => keyplot.rows.length > 0) // Only include keyplots with rows
                .map(keyplot => ({
                    label: keyplot.label,
                    rows: keyplot.rows.map(row => {
                        // Ensure all numeric fields are properly converted
                        const svNo = parseInt(row.svNo);
                        const actual = parseFloat(row.enumeratedArea);
                        const area = parseFloat(row.area);

                        // Validate numeric conversions
                        if (isNaN(svNo)) {
                            throw new Error(`Invalid svNo for ${keyplot.label}: ${row.svNo}`);
                        }
                        if (isNaN(actual)) {
                            throw new Error(`Invalid actual area for ${keyplot.label}: ${row.enumeratedArea}`);
                        }
                        if (isNaN(area)) {
                            throw new Error(`Invalid area for ${keyplot.label}: ${row.area}`);
                        }

                        const rowData = {
                            // Only include id for existing rows (when b_id exists)
                            ...(row.b_id ? { id: row.b_id } : {}),
                            actual: actual,
                            svNo: svNo,
                            subNo: row.sub, // Keep as string
                            area: area,
                            bcode: isNaN(parseInt(row.block)) ? row.block : parseInt(row.block),
                            village: row.villageId
                        };

                        // ✅ FIXED: Handle plot_id for both existing and new rows
                        if (row.plot_id && row.plot_id !== '') {
                            // If plot_id exists, use it
                            rowData.plot_id = parseInt(row.plot_id);
                            
                            if (isNaN(rowData.plot_id)) {
                                throw new Error(`Invalid plot_id for ${keyplot.label}: ${row.plot_id}`);
                            }
                        } else if (row.isNew) {
                            // For new rows without plot_id, you can either:
                            // Option 1: Generate a temporary ID or use a default
                            rowData.plot_id = 0; // Use 0 to indicate new plot
                            
                            // Option 2: Omit plot_id entirely for new rows
                            // Don't include plot_id field at all
                            // delete rowData.plot_id;
                        }

                        return rowData;
                    })
                }))
        };

        console.log('✅ Final request data being sent:', JSON.stringify(requestData, null, 2));

        // ✅ ENHANCED: API call with better error handling
        const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save-cluster`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // ✅ ENHANCED: Better error handling
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            
            try {
                const errorText = await response.text();
                console.log('Raw error response:', errorText);
                
                // Try to parse as JSON
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    console.log('Parsed error data:', errorData);
                } catch (jsonError) {
                    // If not JSON, use the raw text
                    errorMessage = errorText || errorMessage;
                }
            } catch (textError) {
                console.log('Could not read error response:', textError);
            }
            
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Cluster saved successfully:', result);

        setSubmitSuccess(true);
        setSnackbarMessage('Cluster data saved successfully!');
        setSnackbarOpen(true);

        // Optionally redirect or refresh data after successful save
        // window.location.href = '/clusters'; // Uncomment if you want to redirect

    } catch (error) {
        console.error('❌ Error submitting cluster data:', error);
        setSubmitError(error.message);
        setSnackbarMessage(`Error: ${error.message}`);
        setSnackbarOpen(true);
    } finally {
        setSubmitting(false);
    }
};



    // ✅ UPDATED: Handle opening crops modal
    const handleOpenCropsModal = () => {
        // Pre-populate selectedCrops based on savedCrops
        const preSelected = {};
        savedCrops.forEach(crop => {
            if (crop.cropId) {
                preSelected[crop.cropId] = true;
            }
        });
        setSelectedCrops(preSelected);
        setCropsModalOpen(true);
    };

    // ✅ CORRECTED: Handle closing crops modal and saving selected crops to API
const handleCloseCropsModal = async () => {
    try {
        setSavingCrops(true);
        const selectedCropIds = Object.keys(selectedCrops).filter(cropId => selectedCrops[cropId]);
        
        if (selectedCropIds.length === 0) {
            setSnackbarMessage('Please select at least one crop before saving.');
            setSnackbarOpen(true);
            // setCropsModalOpen(false);
            return;
        }

        // Get required data with proper validation
        const zoneId = localStorage.getItem("activeZone");
        const token = localStorage.getItem('token');
        
        if (!zoneId) {
            throw new Error('Zone ID not found. Please select an active zone.');
        }

        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        // Validate clusterId exists
        if (!clusterId) {
        throw new Error('Cluster ID not found. Please ensure cluster data is loaded.')
        }

        // Ensure clusterId is properly converted to integer
        const clusterIdNumber = parseInt(clusterId)
        if (isNaN(clusterId)) {
            throw new Error('Invalid cluster number. Please check cluster information.');
        }

        // Prepare the crop assignment data with proper data types
        const cropAssignments = selectedCropIds.map(cropId => {
            return {
                cropId: parseInt(cropId),
                clusterId: clusterIdNumber,
                keyplotId: keyplotId, // This should be the UUID from URL params
                zoneId: parseInt(zoneId),
                landType: clusterInfo.landType || "WET",
                isLimitExceeded: false,
                isCurrentAssignment: true,
                rejectedBy: null,
                rejectedAt: null,
                assignedOn: new Date().toISOString().slice(0, 19) // Format: YYYY-MM-DDTHH:mm:ss
            };
        });

        console.log('Saving crop assignments:', cropAssignments);

        // Make the API call with proper error handling
        const response = await fetch(`${BASE_URL}/btr-service/crop-assignment-trail/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cropAssignments)
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
            } catch (e) {
                console.log('Could not read error response');
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Crop assignments saved successfully:', result);

        // Update local state
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
        // **UPDATE CCE CROP DETAILS TO REFLECT DECREASED noOfCce**
    // Calculate how many crops were selected for each crop type
    const cropUsageCount = {};
    selectedCropIds.forEach(cropId => {
      cropUsageCount[cropId] = (cropUsageCount[cropId] || 0) + 1;
    });

    // Update cceCropDetails to decrease noOfCce for selected crops
    const updatedCceCropDetails = cceCropDetails.map(crop => {
      const cropIdStr = crop.cropId.toString();
      if (selectedCrops[cropIdStr]) {
        // Decrease noOfCce by the number of times this crop was selected
        const usageCount = cropUsageCount[cropIdStr] || 1;
        return {
          ...crop,
          noOfCce: Math.max(0, crop.noOfCce - usageCount) // Ensure it doesn't go below 0
        };
      }
      return crop;
    });

    // Update the state with new crop details
    setCceCropDetails(updatedCceCropDetails);

    // Clear selected crops for next selection
    setSelectedCrops({});

    setSnackbarMessage("CCE crops saved successfully!");
        setSnackbarOpen(true);
        // setCropsModalOpen(false);

    } catch (error) {
        console.error('Error saving CCE crops:', error);
        setSnackbarMessage(`Error saving crops: ${error.message}`);
        setSnackbarOpen(true);
    } finally {
        setSavingCrops(false);
    }
};



   

    // ✅ UPDATED: Handle crop selection with crop ID
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
      if (r.villageName && r.block && r.svNo && r.sub) {
        const plotId = `${r.villageName}-${r.block}-${r.svNo}-${r.sub}`;
        if (!plotUsage.has(plotId)) {
          plotUsage.set(plotId, { rows: [], totalArea: 0 });
        }
        plotUsage.get(plotId).rows.push(r);
      }
    });
  });

  plotUsage.forEach(plotInfo => {
    const firstInstance = plotInfo.rows[0];
    // Convert to number for calculations but preserve string in UI
    const masterArea = parseFloat(firstInstance.area) || 0;
    
    plotInfo.rows.forEach(row => {
      row.area = masterArea > 0 ? masterArea.toString() : row.area;
    });

    let cumulativeEnumerated = 0;
    plotInfo.rows.forEach(row => {
      // Convert to number for validation
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

    const handleInputChange = (e, keyplotId, rowUniqueId, field) => {
  const value = e.target.value;
  const newData = JSON.parse(JSON.stringify(keyplotsData));
  const keyplot = newData.find(k => k.id === keyplotId);
  const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

  let processedValue = value;

  // Special handling for area fields to preserve decimal input
  if (field === 'area' || field === 'enumeratedArea') {
    // Allow empty string or valid decimal input
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      processedValue = value; // Keep as string to preserve decimal input
    } else {
      return; // Don't update if invalid format
    }
  }

  row[field] = processedValue;

  // Existing logic for syncing related fields...
  if (['villageName', 'block', 'svNo', 'sub'].includes(field)) {
    const allRows = newData.flatMap(kp => kp.rows);
    const masterRow = allRows.find(r => isSamePlot(r, row) && r.uniqueId !== row.uniqueId);
    
    if (masterRow) {
      row.area = masterRow.area;
    }

    if (field === 'area') {
      const allRows = newData.flatMap(kp => kp.rows);
      allRows.forEach(otherRow => {
        if (isSamePlot(otherRow, row)) {
          otherRow.area = processedValue;
        }
      });
    }

    // Clear dependent fields when parent fields change
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


    const handleInputBlur = (e, keyplotId, rowUniqueId, field) => {
        // This can be used for additional validation if needed
    };

    const handleAddRow = (keyplotId) => {
        const newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        const newRow = {
            uniqueId: nextRowId.current++,
            villageName: '', 
            villageId: null,
            block: '', 
            svNo: '', 
            sub: '', 
            area: '', 
            enumeratedArea: '', 
            plot_id: '', // Will be set when plot details are fetched
            isNew: true
        };
        keyplot.rows.push(newRow);
        setKeyplotsData(newData);
    };

    const handleRemoveRow = (keyplotId, rowUniqueId) => {
        let newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        keyplot.rows = keyplot.rows.filter(r => r.uniqueId !== rowUniqueId);

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

    // ✅ Validation for submit button
    const isSubmitDisabled = () => {
        if (hasAnyError || submitting) return true;
        
        // Check if keyplot has at least one row
        const keyplotData = keyplotsData.find(kp => kp.label === 'K');
        if (!keyplotData || keyplotData.rows.length === 0) return true;
        
        // Check if all rows have required data
        for (const keyplot of keyplotsData) {
            for (const row of keyplot.rows) {
                if (!row.villageName || !row.block || !row.svNo || !row.sub || !row.area || !row.enumeratedArea) {
                    return true;
                }
            }
        }
        
        return false;
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

    return (
        <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Floating Summary Bar - ORIGINAL UI PRESERVED */}
            <Box sx={{ position: 'fixed', top: '15%', right: 0, zIndex: 1000, borderRadius: '1rem 0 0 1rem', backgroundColor: 'rgba(212, 228, 231, 0.8)', p: 1.5, boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '300px' }}>
                <Typography variant="subtitle1" fontWeight="bold">Cluster: {clusterInfo.clusterNo} | {clusterInfo.localBody}</Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Typography variant="subtitle1"><strong>Total Enumerated Area:</strong> {clusterInfo.totalArea.toFixed(2)} Cent</Typography>
                    <LinearProgress variant="determinate" value={totalAreaProgress} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
                        {clusterInfo.totalArea.toFixed(2)} / {clusterInfo.maxArea} Cents
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Tooltip title="View FMB"><Button variant="contained" color="secondary"><MapIcon /></Button></Tooltip>
                        <Tooltip title="Reject Cluster"><Button variant="contained" color="error"><WarningAmberIcon /></Button></Tooltip>
                        <Tooltip title="Submit">
                            <Button 
                                onClick={handleSubmit} 
                                variant="contained" 
                                color="primary" 
                                disabled={isSubmitDisabled()}
                                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                {submitting ? 'Saving...' : 'Submit'}
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            <Typography variant="h4" align="center" gutterBottom color="primary">Cluster Land Form</Typography>

            <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                {/* Cluster Info Section - ORIGINAL UI PRESERVED */}
                <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Cluster Info</Box>
                <Grid container spacing={2} mb={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}><TextField label="Cluster No." value={slNo} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Local Body" value={clusterInfo.localBody} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField label="Land Type" value={clusterInfo.landType} InputProps={{ readOnly: true }} fullWidth /></Grid>
                </Grid>

                {/* CCE Crops Section - ORIGINAL UI PRESERVED */}
                {/* Updated section that combines both savedCrops and API crops */}
                {(savedCrops.length > 0 || (apiCropsData && apiCropsData.crops && apiCropsData.crops.length > 0)) && (
    <Paper elevation={2} sx={{ mt: 3, mb: 3, overflow: 'hidden', borderRadius: 1, border: '1px solid #ccc' }}>
        <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
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
                                label={count > 1 ? `${cropName} (${count})` : cropName}
                                color="primary"
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
                        <Grid item><Button variant="contained" color="info" onClick={handleOpenCropsModal}>Add CCE crops</Button></Grid>
                        <Grid item><Button variant="contained" color="secondary" startIcon={<MapIcon />}>View FMB</Button></Grid>
                        <Grid item><Button variant="contained" color="error" startIcon={<DeleteForeverIcon />}>Reject Cluster</Button></Grid>
                    </Grid>
                </Box>

                {/* Keyplot Sections - ORIGINAL UI PRESERVED */}
                {keyplotsData.map((keyplot) => {
                    const isNewRowIncomplete = keyplot.rows.filter(r => r.isNew).some(r => !r.villageName || !r.block || !r.svNo || !r.sub || !r.area || !r.enumeratedArea);
                    const hasErrorInKeyplot = keyplot.rows.some(r => !!errors[`${keyplot.id}-${r.uniqueId}`]);
                    return (
                        <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
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
                            </Box>
                            <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
                                {/* Headers */}
                                <Grid item xs={2}><Typography fontWeight="bold">Village</Typography></Grid>
                                <Grid item xs={1.5}><Typography fontWeight="bold">Block</Typography></Grid>
                                <Grid item xs={1.5}><Typography fontWeight="bold">Survey No.</Typography></Grid>
                                <Grid item xs={1}><Typography fontWeight="bold">Sub Div No.</Typography></Grid>
                                <Grid item xs={2}><Typography fontWeight="bold">Actual Area</Typography></Grid>
                                <Grid item xs={2}><Typography fontWeight="bold">Enumerated Area</Typography></Grid>
                                <Grid item xs={2} />

                                {keyplot.rows.length === 0 && <Grid item xs={12} sx={{ textAlign: 'center', color: 'text.secondary', p: 2 }}>No rows added.</Grid>}

                                {keyplot.rows.map((row) => {
                                    const errorKey = `${keyplot.id}-${row.uniqueId}`;
                                    const hasError = !!errors[errorKey];

                                    const plotId = (row.villageName && row.block && row.svNo && row.sub) ? `${row.villageName}-${row.block}-${row.svNo}-${row.sub}` : null;
                                    const isFirstInstance = plotId ? firstInstanceMap.get(plotId) === row.uniqueId : true;
                                    const isAreaReadOnly = !isFirstInstance;
                                    const isKeyPlotFirstRow = keyplot.label === 'K' && isFirstInstance;
                                    
                                    const rowKey = `${keyplot.id}-${row.uniqueId}`;
                                    const currentRowBlockOptions = rowBlockOptions[rowKey] || [];

                                    return (
                                        <React.Fragment key={`${keyplot.id}-${row.uniqueId}`}>
                                            {row.isNew ? (
                                                <>
                                                    <Grid item xs={2}>
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
                                                                handleVillageChange(newValue ? newValue.villageId : null, keyplot.id, row.uniqueId);
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
                                                    </Grid>
                                                    <Grid item xs={1.5}>
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel>Block</InputLabel>
                                                            <Select 
                                                                name="block" 
                                                                label="Block" 
                                                                value={row.block} 
                                                                onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'block')}
                                                            >
                                                                {currentRowBlockOptions.map(option => 
                                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={1.5}><TextField label="Survey No" size="small" fullWidth value={row.svNo} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'svNo')} /></Grid>
                                                    <Grid item xs={1}><TextField label="Sub Div" size="small" fullWidth value={row.sub} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'sub')} /></Grid>
                                                    <Grid item xs={2}><TextField label="Area" size="small" fullWidth type="number" value={row.area} InputProps={{ readOnly: isAreaReadOnly }} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'area')} /></Grid>
                                                    <Grid item xs={2}><TextField label="Enum. Area" size="small" fullWidth type="number" value={row.enumeratedArea} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'enumeratedArea')} onBlur={(e) => handleInputBlur(e, keyplot.id, row.uniqueId, 'enumeratedArea')} error={hasError} helperText={hasError ? errors[errorKey] : ''} /></Grid>
                                                    <Grid item xs={2}><Tooltip title="Remove Row"><IconButton color="error" onClick={() => handleRemoveRow(keyplot.id, row.uniqueId)}><RemoveCircleOutlineIcon /></IconButton></Tooltip></Grid>
                                                </>
                                            ) : (
                                                <>
                                                    <Grid item xs={2}><TextField value={row.villageName} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                    <Grid item xs={1.5}><TextField value={row.block} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                    <Grid item xs={1.5}><TextField value={row.svNo} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                    <Grid item xs={1}><TextField value={row.sub} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                    <Grid item xs={2}><TextField value={row.area} InputProps={{ readOnly: !isKeyPlotFirstRow && isAreaReadOnly }} fullWidth size="small" type="number" onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'area')} /></Grid>
                                                    <Grid item xs={2}><TextField label="Enum. Area" size="small" fullWidth type="number" value={row.enumeratedArea} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'enumeratedArea')} onBlur={(e) => handleInputBlur(e, keyplot.id, row.uniqueId, 'enumeratedArea')} error={hasError} helperText={hasError ? errors[errorKey] : ''} /></Grid>
                                                    <Grid item xs={2}>{!isKeyPlotFirstRow && (<Tooltip title="Remove Row"><IconButton onClick={() => handleRemoveRow(keyplot.id, row.uniqueId)} size="small" color="error"><RemoveCircleOutlineIcon /></IconButton></Tooltip>)}</Grid>
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                                    <Button startIcon={<AddCircleOutlineIcon />} size="small" variant="contained" color="success" onClick={() => handleAddRow(keyplot.id)} disabled={isNewRowIncomplete || hasErrorInKeyplot}>Add Row</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    );
                })}

                {/* ✅ Main Submit Button - ORIGINAL UI PRESERVED */}
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
                
                {/* ✅ Submit Error Display - ORIGINAL UI PRESERVED */}
                {submitError && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                        <Typography variant="body2">
                            <strong>Submit Error:</strong> {submitError}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* CCE Crops Modal - ORIGINAL UI PRESERVED */}
            {/* ✅ UPDATED: CCE Crops Modal with API integration */}
            {/* ✅ CCE Crops Modal - FIXED */}
        {/* CCE Crops Modal - UPDATED to handle API response without isActive field */}
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
        .filter(crop => crop.cropId && crop.cropName) // Filter valid crops
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
        
        {/* Remove or comment out the inactive crops section since all crops should be active */}
        {/* 
        {cceCropDetails.filter(crop => !crop.isActive).length > 0 && (
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Inactive Crops (Not Available for Selection)
                </Typography>
                <Grid container spacing={1}>
                    {cceCropDetails
                        .filter(crop => !crop.isActive)
                        .map(crop => (
                            <Grid item key={crop.cropId}>
                                <Chip label={crop.cropName} size="small" disabled sx={{ opacity: 0.6 }} />
                            </Grid>
                        ))
                    }
                </Grid>
            </Box>
        )}
        */}
    </DialogContent>
<DialogActions>
  {/* <Button onClick={() => setCropsModalOpen(false)} color="secondary">
    Close
  </Button> */}
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


            {/* ✅ Success/Error Snackbar - ORIGINAL UI PRESERVED */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ClusterFormUI;
