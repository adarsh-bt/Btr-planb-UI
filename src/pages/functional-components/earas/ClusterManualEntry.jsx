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
    
    // ✅ NEW: Submit-related states
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
    const [defaultBlock, setDefaultBlock] = useState('');
    const [resvnoError, setResvnoError] = useState('');
    
    const [keyplotDetails, setKeyplotDetails] = useState({
        villageBlock: '',
        panchayath: '',
        syNo: '',
        areaCents: '',
        landType: ''
    });

    const [rowBlockOptions, setRowBlockOptions] = useState({});

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

    // ✅ NEW: Submit functionality
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setSubmitError('');
            
            // Get user info
            const userInfo = authservice.getUserInfo();
            const userId = userInfo?.userId;
            
            if (!userId) {
                throw new Error('User information not found. Please login again.');
            }

            // Validate that we have at least keyplot data
            const keyplotData = keyplotsData.find(kp => kp.label === 'K');
            if (!keyplotData || keyplotData.rows.length === 0) {
                throw new Error('Keyplot data is required.');
            }

            // Validate all rows have required data
            for (const keyplot of keyplotsData) {
                for (const row of keyplot.rows) {
                    if (!row.villageName || !row.block || !row.svNo || !row.sub || !row.area || !row.enumeratedArea) {
                        throw new Error(`Incomplete data in ${keyplot.label} plot. All fields are required.`);
                    }
                    if (!row.plot_id) {
                        throw new Error(`Plot ID is missing for ${keyplot.label}. Please ensure all plots are properly linked.`);
                    }
                }
            }

            // Prepare request data according to backend DTO structure
            const requestData = {
                userId: userId,
                keyplotId: keyplotId,
                clusterNo: parseInt(clusterInfo.clusterNo) || 1,
                sidePlots: keyplotsData
                    .filter(keyplot => keyplot.rows.length > 0) // Only include keyplots with rows
                    .map(keyplot => ({
                        label: keyplot.label,
                        rows: keyplot.rows.map(row => ({
                            id: row.b_id || null, // For existing rows
                            plot_id: parseInt(row.plot_id),
                            actual: parseFloat(row.enumeratedArea),
                            svNo: parseInt(row.svNo),
                            subNo: row.sub,
                            area: parseFloat(row.area),
                            bcode: row.block,
                            village: row.villageName
                        }))
                    }))
            };

            console.log('Submitting cluster data:', requestData);

            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Cluster saved successfully:', result);
            
            setSubmitSuccess(true);
            setSnackbarMessage('Cluster data saved successfully!');
            setSnackbarOpen(true);

            // Optionally redirect or refresh data after successful save
            // window.location.href = '/clusters'; // Uncomment if you want to redirect

        } catch (error) {
            console.error('Error submitting cluster data:', error);
            setSubmitError(error.message);
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarOpen(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenCropsModal = () => setCropsModalOpen(true);
    const handleCloseCropsModal = () => handleCropsModalSave();

    const handleCropsModalSave = () => {
        const cropsToSave = Object.keys(selectedCrops).filter(crop => selectedCrops[crop]);
        setSavedCrops(cropsToSave);
        console.log("Saved crops:", cropsToSave);
        setCropsModalOpen(false);
    };

    const handleCropSelectionChange = (event) => {
        setSelectedCrops({ ...selectedCrops, [event.target.name]: event.target.checked });
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

        plotUsage.forEach((plotInfo) => {
            const firstInstance = plotInfo.rows[0];
            const masterArea = parseFloat(firstInstance.area) || 0;

            plotInfo.rows.forEach(row => {
                row.area = masterArea.toFixed(2);
            });

            let cumulativeEnumerated = 0;
            plotInfo.rows.forEach(row => {
                const enumerated = parseFloat(row.enumeratedArea) || 0;
                const remainingArea = masterArea - cumulativeEnumerated;

                const errorKey = `${data.find(kp => kp.rows.some(r => r.uniqueId === row.uniqueId)).id}-${row.uniqueId}`;
                if (enumerated > remainingArea) {
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
        const { value } = e.target;
        const newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);

        let processedValue = value;
        if ((field === 'area' || field === 'enumeratedArea') && parseFloat(value) < 0 && value !== '') {
            processedValue = '';
        }

        row[field] = processedValue;

        if (['villageName', 'block', 'svNo', 'sub'].includes(field)) {
            const allRows = newData.flatMap(kp => kp.rows);
            const masterRow = allRows.find(r => isSamePlot(r, row) && r.uniqueId !== row.uniqueId);
            if (masterRow) {
                row.area = masterRow.area;
            }
        }

        if (field === 'area') {
            const allRows = newData.flatMap(kp => kp.rows);
            allRows.forEach(otherRow => {
                if (isSamePlot(otherRow, row)) {
                    otherRow.area = processedValue;
                }
            });
        }
        
        if (row.isNew) {
            switch (field) {
                case 'block':
                    row.svNo = ''; row.sub = ''; row.area = ''; row.enumeratedArea = ''; break;
                case 'svNo':
                    row.sub = ''; row.area = ''; row.enumeratedArea = ''; break;
                case 'sub':
                    row.area = ''; row.enumeratedArea = ''; break;
                default: break;
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

    // ✅ NEW: Validation for submit button
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
            {/* Floating Summary Bar */}
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
                {/* Cluster Info Section */}
                <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>Cluster Info</Box>
                <Grid container spacing={2} mb={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={3}><TextField label="Cluster No." value={clusterInfo.clusterNo} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={4}><TextField label="Local Body" value={clusterInfo.localBody} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField label="Land Type" value={clusterInfo.landType} InputProps={{ readOnly: true }} fullWidth /></Grid>
                </Grid>

                {/* CCE Crops Section */}
                {savedCrops.length > 0 && (
                    <Paper elevation={2} sx={{ mt: 3, mb: 3, overflow: 'hidden', borderRadius: 1, border: '1px solid #ccc' }}>
                        <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <GrassIcon />
                            <Typography variant="h6" fontWeight="bold">Selected CCE Crops</Typography>
                        </Box>
                        <Box sx={{ p: 2 }}>
                            <Grid container spacing={1}>
                                {savedCrops.map(crop => (
                                    <Grid item key={crop}>
                                        <Chip label={crop} color="primary" />
                                    </Grid>
                                ))}
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

                {/* Keyplot Sections */}
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
                                <Grid item xs={2}><Typography fontWeight="bold">Total Area (Actual)</Typography></Grid>
                                <Grid item xs={2}><Typography fontWeight="bold">Total Area (Enumerated)</Typography></Grid>
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

                {/* ✅ NEW: Main Submit Button */}
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
                
                {/* ✅ NEW: Submit Error Display */}
                {submitError && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, color: 'error.contrastText' }}>
                        <Typography variant="body2">
                            <strong>Submit Error:</strong> {submitError}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* CCE Crops Modal */}
            <Dialog open={isCropsModalOpen} onClose={() => setCropsModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Select CCE Crops</DialogTitle>
                <DialogContent>
                    <DialogContentText>Please select the crops for Crop Cutting Experiment (CCE).</DialogContentText>
                    <Grid container spacing={1} sx={{ mt: 2 }}>
                        {cropOptions.map((crop) => (
                            <Grid item xs={6} sm={4} key={crop}><FormControlLabel control={<Checkbox checked={selectedCrops[crop] || false} onChange={handleCropSelectionChange} name={crop} />} label={crop} /></Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCropsModalOpen(false)} color="primary">Cancel</Button>
                    <Button onClick={handleCloseCropsModal} variant="contained" color="primary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* ✅ NEW: Success/Error Snackbar */}
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
