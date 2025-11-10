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
const SIDE_PLOT_OPTIONS = ['N1','N2','N3','N4','E1','E2','E3','E4','S1','S2','S3','S4','W1', 'W2', 'W3', 'W4'];

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
    
    const [currentFormPlots, setCurrentFormPlots] = useState(new Map());
    
    const nextRowId = useRef(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarOpen1, setSnackbarOpen1] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [mincluster, setMinCluster] = useState('');
    const [maxcluster, setMaxCluster] = useState('');
    const [meanCluster, setMeanCluster] = useState('');
    const [keyplotMainSvNo, setKeyplotMainSvNo] = useState('');
    const [lbcode, setLbcode] = useState('');
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

    const [validationInfo, setValidationInfo] = useState(null);
    const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
    const [validatingRow, setValidatingRow] = useState(null);
const [subdivisionDialogOpen, setSubdivisionDialogOpen] = useState(false);
const [availableSubdivisions, setAvailableSubdivisions] = useState([]);
const [selectedSubdivision, setSelectedSubdivision] = useState('');
const [pendingPlot, setPendingPlot] = useState(null);
    
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
        const zoneid = authservice.getzone();
        const response = await fetch(`${FORM_URL}/earas-form1-entry/cce-crop-details/fetch-cce-crops?zoneId=${zoneid}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
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
    }

    setKeyplotsData(newData);
    setIsValidationDialogOpen(false);
    setSnackbarMessage("This plot cannot be used. Please enter a different one.");
    setSnackbarOpen(true);
};

const checkPlotUsageInCurrentForm = (plotIdentifier, currentRowUniqueId) => {
    // Collect all rows from the current form, including saved (isExisting) ones
    const allRows = keyplotsData.flatMap(kp => kp.rows);

    // Find all rows (existing + new) with the same plot identifier
    const duplicateRows = allRows.filter(row => {
        const rowPlotIdentifier = `${row.villageName}-${row.block}-${row.svNo}-${row.sub || ''}`;
        return rowPlotIdentifier === plotIdentifier;
    });

    if (duplicateRows.length === 0) {
        return { isUsed: false };
    }

    // ✅ Pick master area from the first occurrence (existing or not)
    const masterRow = duplicateRows[0];
    const totalArea = parseFloat(masterRow.area) || 0;

    // ✅ Calculate used area from ALL duplicate rows EXCEPT the current one being validated
    const usedArea = duplicateRows.reduce((sum, row) => {
        // Don't count the current row being validated in the used area calculation
        if (row.uniqueId === currentRowUniqueId) {
            return sum;
        }
        const val = parseFloat(row.enumeratedArea) || 0;
        return sum + val;
    }, 0);

    const remainingArea = Math.max(0, totalArea - usedArea);

    const locations = duplicateRows
        .filter(row => row.uniqueId !== currentRowUniqueId) // Exclude current row from locations
        .map(row => {
            const keyplot = keyplotsData.find(kp => kp.rows.some(r => r.uniqueId === row.uniqueId));
            return keyplot ? keyplot.label : 'Unknown';
        });

    return {
        isUsed: locations.length > 0, // Only considered "used" if there are other rows using this plot
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
        const zoneId = authservice.getzone();
        
        const payload = {
            lbcode:defaultLbcode,
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

// New function to fetch available subdivisions when user enters only survey number
const fetchAvailableSubdivisions = async (villageId, block, svNo, keyplotId, rowUniqueId) => {
    try {
        const token = authservice.gettoken();
        const zoneId = authservice.getzone();
        
        const payload = {
            vcode: villageId,
            bcode: block,
            resvno: parseInt(svNo, 10),
            resbdno: null, // Explicitly null to get all subdivisions
            zoneId: parseInt(zoneId, 10),
        };

        console.log('Fetching subdivisions with payload:', payload);

        const response = await fetch(`${BASE_URL}/btr-service/api/btr-data/validate-duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (response.status === 409) {
            const data = await response.json();
            if (data.availableSubdivisions && data.availableSubdivisions.length > 0) {
                console.log('Found subdivisions for survey number:', data.availableSubdivisions);
                setAvailableSubdivisions(data.availableSubdivisions);
                setPendingPlot({ 
                    keyplotId, 
                    rowUniqueId, 
                    validationInfo: data,
                    isSubdivisionSelection: true 
                });
                setSubdivisionDialogOpen(true);
            }
        }
    } catch (error) {
        console.error("Error fetching subdivisions:", error);
    }
};
// Handle subdivision selection
// Update the subdivision selection handler
const handleSubdivisionSelect = () => {
    if (!pendingPlot || !selectedSubdivision) return;

    const { keyplotId, rowUniqueId, validationInfo, isSubdivisionSelection } = pendingPlot;
    const newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

    if (row) {
        row.sub = selectedSubdivision;
        
        // If this was a subdivision selection (user entered only survey number initially),
        // we can auto-fill the area from the validation info
        if (isSubdivisionSelection && validationInfo && validationInfo.totalcent) {
            row.area = validationInfo.totalcent.toString();
        } else if (validationInfo && validationInfo.totalcent) {
            // For normal cases, use the total area
            row.area = validationInfo.totalcent.toString();
        }
    }

    setKeyplotsData(newData);
    setSubdivisionDialogOpen(false);
    setSelectedSubdivision('');
    setPendingPlot(null);
    
    setSnackbarMessage(`Subdivision ${selectedSubdivision} selected. Please complete the entry.`);
    setSnackbarOpen(true);
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

        // Get user info
        const userId = authservice.userid();
        const token = authservice.gettoken();

        if (!userId || !token) {
            throw new Error('Authentication required. Please login again.');
        }

        // ✅ STEP 1: First remove deleted rows via DELETE API
        if (removedRows.length > 0) {
            await removeDeletedRows(token);
        }

        // ✅ STEP 2: Validate that we have at least keyplot data
        const keyplotData = keyplotsData.find(kp => kp.label === 'K');
        if (!keyplotData || keyplotData.rows.length === 0) {
            throw new Error('Keyplot data is required.');
        }

        // ✅ STEP 3: Prepare request data with proper plot_id handling
        const requestData = {
            userId: userId,
            keyplotId: keyplotId,
            clusterNo: clusterId,
            sidePlots: keyplotsData
                .filter(keyplot => keyplot.rows.length > 0)
                .map(keyplot => ({
                    label: keyplot.label,
                    rows: keyplot.rows.map(row => {
                        // Ensure all numeric fields are properly converted
                        const svNo = parseInt(row.svNo);
                        const actual = parseFloat(row.enumeratedArea);
                        const area = parseFloat(row.area);

                        // Validate numeric conversions
                        if (isNaN(svNo)) throw new Error(`Invalid svNo for ${keyplot.label}: ${row.svNo}`);
                        if (isNaN(actual)) throw new Error(`Invalid actual area for ${keyplot.label}: ${row.enumeratedArea}`);
                        if (isNaN(area)) throw new Error(`Invalid area for ${keyplot.label}: ${row.area}`);

                        // ✅ CRITICAL FIX: Proper plot_id handling
                        let plot_id;
                        if (row.plot_id && row.plot_id !== '' && row.plot_id !== 0) {
                            // Use existing plot_id for saved rows
                            plot_id = parseInt(row.plot_id);
                            if (isNaN(plot_id)) throw new Error(`Invalid plot_id for ${keyplot.label}: ${row.plot_id}`);
                        } else if (row.isNew) {
                            // For new rows, use 0 to indicate new plot creation
                            plot_id = 0;
                        } else {
                            // For existing rows without plot_id, this should not happen
                            throw new Error(`Missing plot_id for existing ${keyplot.label} plot`);
                        }

                        const rowData = {
                            // Include id only for existing rows (for updating)
                            ...(row.b_id ? { id: row.b_id } : {}),
                            plot_id: plot_id,
                            actual: actual,
                            svNo: svNo,
                            subNo: row.sub,
                            area: area,
                            bcode: row.block,
                            village: row.villageId
                        };

                        console.log(`Row data for ${keyplot.label}:`, rowData);
                        return rowData;
                    })
                }))
        };

        console.log('✅ Final request data being sent:', JSON.stringify(requestData, null, 2));

        // ✅ STEP 4: Send main save request
        const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save-cluster`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        console.log('Response status:', response.status);

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
            } catch {
                // Ignore text read errors
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Cluster saved successfully:', result);

        setSubmitSuccess(true);
        setSnackbarMessage('Cluster data saved successfully!');
        setSnackbarOpen(true);

    } catch (error) {
        console.error('❌ Error submitting cluster data:', error);
        setSubmitError(error.message);
        setSnackbarMessage(`Error: ${error.message}`);
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

const getRemovedRowsInfo = () => {
    return removedRows.map(row => ({
        id: row.b_id,
        plot_id: row.plot_id,
        label: row.keyplotLabel,
        village: row.villageName,
        block: row.block,
        svNo: row.svNo,
        sub: row.sub
    }));
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

        // Added line
        setCropsModalOpen(false);

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

  // First pass: collect all plot information
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

  // Second pass: validate each plot's area usage
  plotUsage.forEach((plotInfo, plotId) => {
    const firstInstance = plotInfo.rows[0];
    const masterArea = parseFloat(firstInstance.area) || 0;
    
    // Calculate total used area for this plot
    const totalUsedArea = plotInfo.rows.reduce((sum, row) => {
      return sum + (parseFloat(row.enumeratedArea) || 0);
    }, 0);

    // Validate each row in this plot
    plotInfo.rows.forEach(row => {
      const enumerated = parseFloat(row.enumeratedArea) || 0;
      const remainingArea = masterArea - (totalUsedArea - enumerated); // Subtract current row's area from total
      
      const errorKey = `${data.find(kp => kp.rows.some(r => r.uniqueId === row.uniqueId)).id}-${row.uniqueId}`;
      
      if (enumerated > remainingArea && masterArea > 0) {
        newErrors[errorKey] = `Exceeds remaining plot area of ${remainingArea.toFixed(2)} cents`;
      }
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

  if (field === 'area' && row.isNew) {
        row.enumeratedArea = processedValue;
    }


  // Trigger validation when plot details change
  if (['svNo', 'sub', 'enumeratedArea'].includes(field)) {
    if (row.villageId && row.block && row.svNo) {
      setTimeout(() => {
        handlePlotValidation(keyplotId, rowUniqueId);
      }, 300);
    }
  }

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
const [removedRows, setRemovedRows] = useState([]);
const handleRemoveRow = (keyplotId, rowUniqueId) => {
    let newData = JSON.parse(JSON.stringify(keyplotsData));
    const keyplot = newData.find(k => k.id === keyplotId);
    const rowToRemove = keyplot.rows.find(r => r.uniqueId === rowUniqueId);
    
    // If it's an existing row (has b_id), add to removed rows tracking
    if (rowToRemove && rowToRemove.b_id) {
        setRemovedRows(prev => [...prev, {
            b_id: rowToRemove.b_id,
            plot_id: rowToRemove.plot_id,
            keyplotLabel: keyplot.label,
            villageName: rowToRemove.villageName,
            block: rowToRemove.block,
            svNo: rowToRemove.svNo,
            sub: rowToRemove.sub
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

// ✅ Clear removed rows when component loads
useEffect(() => {
    setRemovedRows([]);
}, [keyplotId]);
// ✅ ADD THIS: Function to clear removed rows when component loads or resets
useEffect(() => {
    // Clear removed rows when component mounts or keyplotId changes
    setRemovedRows([]);
}, [keyplotId]);

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
                if (!row.villageName || !row.block || !row.svNo || !row.area || !row.enumeratedArea) {
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
                    const isNewRowIncomplete = keyplot.rows.filter(r => r.isNew).some(r => !r.villageName || !r.block || !r.svNo || !r.area || !r.enumeratedArea);

                    const entryRecommed = keyplot.rows
                            .filter(r => r.isNew)
                            .some(r => r.villageName && r.block && r.svNo && r.area);
                    {/* if(entryRecommed){
                       console.log("alert   ")
                    }else{
                        console.log("else >" )
                    } */}
                    
                
                    const hasErrorInKeyplot = keyplot.rows.some(r => !!errors[`${keyplot.id}-${r.uniqueId}`]);
                    return (
                      <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
                            <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {/* LEFT SIDE: Section label (existing code) */}
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

                                {/* RIGHT SIDE: Total enumerated area for this section */}
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
                                                    <Grid item xs={1.5}><TextField label="Survey No" size="small" fullWidth value={row.svNo}  onChange={(e) => {const value = e.target.value; if (value.length <= 5 && /^\d*$/.test(value)) {
                                                         handleInputChange(e, keyplot.id, row.uniqueId, 'svNo');}}} 
                                                         onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)} inputProps={{ maxLength: 5 }}
                                                    /></Grid>
                                                    <Grid item xs={1}><TextField label="Sub Div" size="small" fullWidth value={row.sub} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'sub')} 
                                                        onBlur={() => handlePlotValidation(keyplot.id, row.uniqueId)}
                                                    /></Grid>
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


{/* Subdivision Selection Dialog */}
{/* Validation Dialog */}
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
        <Button onClick={() => setIsValidationDialogOpen(false)} color="secondary">
            Cancel
        </Button>
        
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