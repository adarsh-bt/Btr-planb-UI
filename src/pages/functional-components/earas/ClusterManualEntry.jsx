import React, { useState, useEffect, useRef } from 'react';
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
    FormControlLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import GrassIcon from '@mui/icons-material/Grass'; // --- NEW: Icon for CCE Crops section


// --- Static Data for UI ---
const initialKeyplotsData = [
    { id: 'K', label: 'K', rows: [{ villageName: 'Kilimanoor', block: 'Block 1', svNo: '123', sub: '4', area: '18.77', enumeratedArea: '' }] },
    { id: 'N1', label: 'N1', rows: [] },
    { id: 'E1', label: 'E1', rows: [] },
    { id: 'S1', label: 'S1', rows: [] },
    { id: 'W1', label: 'W1', rows: [] },
];
const initialClusterInfo = {
    clusterNo: '1',
    localBody: 'Kilimanoor',
    landType: 'Wet',
    totalArea: 0,
    maxArea: 600, // 6 Acres in Cents
};



// --- Constant for Side Plot Dropdown ---
const SIDE_PLOT_OPTIONS = ['N1', 'E1', 'S1', 'W1', 'N2', 'E2', 'S2', 'W2'];



// --- Sample Data for Dropdowns & Modal ---
const villageOptions = ["Kilimanoor", "Pazhayakunnummel", "Madavoor", "Nagaroor"];
const blockOptions = ["Block 1", "Block 2", "Block 3", "Block 4"];
const cropOptions = [
    'Paddy', 'Banana', 'Tapioca', 'Ginger', 'Turmeric',
    'Elephant Foot Yam', 'Taro', 'Sweet Potato', 'Bitter Gourd',
    'Snake Gourd', 'Ash Gourd', 'Pumpkin', 'Cucumber', 'Beans',
    'Cowpea', 'Bhindi', 'Brinjal', 'Green Chilli', 'Tomato'
];



// --- Helper Function ---
/**
 * MODIFIED: Checks if two rows belong to the same base plot by comparing their identifiers, including Sub Div No.
 * The check is only valid if the identifiers are not empty.
 * @param {object} rowA - The first row object.
 * @param {object} rowB - The second row object.
 * @returns {boolean} - True if they are the same plot, false otherwise.
 */
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
    const [clusterInfo, setClusterInfo] = useState(initialClusterInfo);
    const [isCropsModalOpen, setCropsModalOpen] = useState(false);
    const [selectedCrops, setSelectedCrops] = useState({});
    const [savedCrops, setSavedCrops] = useState([]);
    const [errors, setErrors] = useState({});
    const nextRowId = useRef(0);



    // Initialize data with unique IDs for robust tracking
    useEffect(() => {
        const dataWithIds = JSON.parse(JSON.stringify(initialKeyplotsData)).map(kp => {
            kp.rows = kp.rows.map(row => ({
                ...row,
                uniqueId: nextRowId.current++
            }));
            return kp;
        });
        setKeyplotsData(dataWithIds);
    }, []);



    const totalAreaProgress = clusterInfo.maxArea > 0 ? (clusterInfo.totalArea / clusterInfo.maxArea) * 100 : 0;



    useEffect(() => {
        const newTotalArea = keyplotsData.reduce((total, keyplot) => {
            return total + keyplot.rows.reduce((subTotal, row) => subTotal + (parseFloat(row.enumeratedArea) || 0), 0);
        }, 0);
        setClusterInfo(prevInfo => ({ ...prevInfo, totalArea: newTotalArea }));
    }, [keyplotsData]);



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



    /**
     * Central function to recalculate areas for all subdivisions of a plot globally.
     */
    const recalculateAndSetData = (updatedData) => {
        const plotUsage = new Map();
        // Identify all unique plots and their rows
        updatedData.forEach(kp => {
            kp.rows.forEach(r => {
                // MODIFIED: Plot ID now includes the Sub Division No.
                if (r.villageName && r.block && r.svNo && r.sub) {
                    const plotId = `${r.villageName}-${r.block}-${r.svNo}-${r.sub}`;
                    if (!plotUsage.has(plotId)) {
                        plotUsage.set(plotId, []);
                    }
                    plotUsage.get(plotId).push(r);
                }
            });
        });



        // For each plot with subdivisions, recalculate the 'area' chain
        plotUsage.forEach(chain => {
            for (let i = 0; i < chain.length - 1; i++) {
                const current = chain[i];
                const next = chain[i + 1];
                const remaining = (parseFloat(current.area) || 0) - (parseFloat(current.enumeratedArea) || 0);
                // --- MODIFIED: Prevent zero or negative area ---
                next.area = remaining > 0 ? remaining.toFixed(2) : '';
            }
        });



        // Final validation check after all calculations
        const newErrors = {};
        updatedData.forEach(kp => {
            kp.rows.forEach(row => {
                const errorKey = `${kp.id}-${row.uniqueId}`;
                const currentActual = parseFloat(row.area) || 0;
                const currentEnumerated = parseFloat(row.enumeratedArea) || 0;
                if (currentEnumerated > currentActual) {
                    newErrors[errorKey] = `Cannot exceed actual area of ${currentActual}`;
                }
            });
        });



        setErrors(newErrors);
        setKeyplotsData(updatedData);
    };



    const handleInputChange = (e, keyplotId, rowUniqueId, field) => {
        const { value } = e.target;
        const newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);



        let processedValue = value;
        // --- NEW: Prevent zero or negative numbers for area fields ---
        if ((field === 'area' || field === 'enumeratedArea') && parseFloat(value) <= 0 && value !== '') {
            processedValue = ''; // Reset to empty if invalid number is entered
        }



        // Always update the field that triggered the change
        row[field] = processedValue;



        // --- NEW: Cascading Reset Logic ---
        // If a dropdown/field is changed in a new row, reset the fields to its right.
        if (row.isNew) {
            switch (field) {
                case 'villageName':
                    row.block = '';
                    row.svNo = '';
                    row.sub = '';
                    row.area = '';
                    row.enumeratedArea = '';
                    break;
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
                    // No reset needed for 'area' or 'enumeratedArea' changes
                    break;
            }
        }



        recalculateAndSetData(newData);
    };



    const handleInputBlur = (e, keyplotId, rowUniqueId, field) => {
        const errorKey = `${keyplotId}-${rowUniqueId}`;
        if (errors[errorKey] && field === 'enumeratedArea') {
            const keyplot = keyplotsData.find(k => k.id === keyplotId);
            const row = keyplot.rows.find(r => r.uniqueId === rowUniqueId);
            const event = { target: { value: row.area } }; // Reset to max allowed value
            handleInputChange(event, keyplotId, rowUniqueId, 'enumeratedArea');
        }
    };



    // Simply adds a new blank row. The smart calculation happens in `handleInputChange`.
    const handleAddRow = (keyplotId) => {
        const newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        const newRow = {
            uniqueId: nextRowId.current++,
            villageName: '', block: '', svNo: '', sub: '', area: '', enumeratedArea: '', isNew: true
        };
        keyplot.rows.push(newRow);
        setKeyplotsData(newData);
    };



    const handleRemoveRow = (keyplotId, rowUniqueId) => {
        let newData = JSON.parse(JSON.stringify(keyplotsData));
        const keyplot = newData.find(k => k.id === keyplotId);
        keyplot.rows = keyplot.rows.filter(r => r.uniqueId !== rowUniqueId);
        // After removing, re-run the global calculation to fix any broken area chains
        recalculateAndSetData(newData);
    };



    const handleLabelChange = (newLabel, keyplotId) => {
        setKeyplotsData(prevData =>
            prevData.map(kp =>
                kp.id === keyplotId ? { ...kp, label: newLabel } : kp
            )
        );
    };



    const hasAnyError = Object.values(errors).some(error => error !== null && error !== '');



    // Create a map of the first occurrence of each plot for the read-only check
    const firstInstanceMap = new Map();
    keyplotsData.forEach(kp => {
        kp.rows.forEach(r => {
            // MODIFIED: Plot ID now includes the Sub Division No.
            if (r.villageName && r.block && r.svNo && r.sub) {
                const plotId = `${r.villageName}-${r.block}-${r.svNo}-${r.sub}`;
                if (!firstInstanceMap.has(plotId)) {
                    firstInstanceMap.set(plotId, r.uniqueId);
                }
            }
        });
    });



    // --- MODIFIED: Simplified disabling logic ---
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
                        <Tooltip title="Submit"><Button type="submit" variant="contained" color="primary" disabled={hasAnyError}><SaveIcon /></Button></Tooltip>
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

                {/* --- UI-ENHANCED: Display for Saved CCE Crops --- */}
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
                                {/* Header with Dropdown for Side Plots */}
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
                                                    // --- MODIFIED: Simplified disabling logic ---
                                                    // An option is disabled only if it's already selected by another side plot.
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


                                    // Global check to see if this is the first instance of the plot
                                    const plotId = (row.villageName && row.block && row.svNo && row.sub) ? `${row.villageName}-${row.block}-${row.svNo}-${row.sub}` : null;
                                    const isFirstInstance = plotId ? firstInstanceMap.get(plotId) === row.uniqueId : true;
                                    const isAreaReadOnly = !isFirstInstance;
                                    const isKeyPlotFirstRow = keyplot.label === 'K' && isFirstInstance;
                                    return (
                                        <React.Fragment key={`${keyplot.id}-${row.uniqueId}`}>
                                            {/* Row content */}
                                            {row.isNew ? (
                                                <>
                                                    <Grid item xs={2}><FormControl fullWidth size="small"><InputLabel>Village</InputLabel><Select name="villageName" label="Village" value={row.villageName} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'villageName')}>{villageOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}</Select></FormControl></Grid>
                                                    <Grid item xs={1.5}><FormControl fullWidth size="small"><InputLabel>Block</InputLabel><Select name="block" label="Block" value={row.block} onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'block')}>{blockOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}</Select></FormControl></Grid>
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
                                                    <Grid item xs={2}><TextField value={row.area} InputProps={{ readOnly: !isKeyPlotFirstRow }} fullWidth size="small" type="number" onChange={(e) => handleInputChange(e, keyplot.id, row.uniqueId, 'area')} /></Grid>
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


                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, display: 'block', margin: '20px auto 0' }} disabled={hasAnyError}>Submit</Button>
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
        </Container>
    );
};



export default ClusterFormUI;
