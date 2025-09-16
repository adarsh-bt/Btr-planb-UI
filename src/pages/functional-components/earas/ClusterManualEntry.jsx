import React, { useState } from 'react';
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
    FormControl, // Added for dropdowns
    InputLabel,  // Added for dropdowns
    Select,      // Added for dropdowns
    MenuItem     // Added for dropdowns
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
// import Breadcrumb from 'routes/Breadcrumb'; // Assuming this is a presentational component
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

// --- Static Data for UI ---
const initialKeyplotsData = [
    { id: 'K', label: 'K', rows: [{ villageName: 'Kilimanoor', block: 'Block 1', svNo: '123', sub: '4', area: '18.77', enumeratedArea: '18.77' }] },
    { id: 'N1', label: 'N1', rows: [] },
    { id: 'E1', label: 'E1', rows: [] },
    { id: 'S1', label: 'S1', rows: [] },
    { id: 'W1', label: 'W1', rows: [] },
];

const initialClusterInfo = {
    clusterNo: '1',
    localBody: 'Kilimanoor',
    landType: 'Wet',
    totalArea: 18.77,
    maxArea: 600, // 6 Acres in Cents
};

// --- Sample Data for Dropdowns ---
const villageOptions = ["Kilimanoor", "Pazhayakunnummel", "Madavoor", "Nagaroor"];
const blockOptions = ["Block 1", "Block 2", "Block 3", "Block 4"];


const ClusterFormUI = () => {
    const [keyplotsData, setKeyplotsData] = useState(initialKeyplotsData);
    const [clusterInfo, setClusterInfo] = useState(initialClusterInfo);

    const totalAreaProgress = (clusterInfo.totalArea / clusterInfo.maxArea) * 100;

    const handleAddRow = (keyplotId) => {
        setKeyplotsData(prevData =>
            prevData.map(keyplot => {
                if (keyplot.id === keyplotId) {
                    const newRow = { villageName: '', block: '', svNo: '', sub: '', area: '', enumeratedArea: '', isNew: true };
                    return { ...keyplot, rows: [...keyplot.rows, newRow] };
                }
                return keyplot;
            })
        );
    };

    const handleRemoveRow = (keyplotId, rowIndex) => {
        setKeyplotsData(prevData =>
            prevData.map(keyplot => {
                if (keyplot.id === keyplotId) {
                    return { ...keyplot, rows: keyplot.rows.filter((_, index) => index !== rowIndex) };
                }
                return keyplot;
            })
        );
    };

    const handleInputChange = (e, keyplotId, rowIndex, field) => {
        const { value } = e.target;
        setKeyplotsData(prevData =>
            prevData.map(keyplot => {
                if (keyplot.id === keyplotId) {
                    const updatedRows = keyplot.rows.map((row, index) =>
                        index === rowIndex ? { ...row, [field]: value } : row
                    );
                    return { ...keyplot, rows: updatedRows };
                }
                return keyplot;
            })
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* --- Floating Summary Bar --- */}
            <Box sx={{
                position: 'fixed', top: '15%', right: 0, zIndex: 1000, borderRadius: '1rem 0 0 1rem',
                backgroundColor: 'rgba(212, 228, 231, 0.8)', p: 1.5, boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '300px',
            }}>
                <Typography variant="subtitle1" fontWeight="bold">Cluster: {clusterInfo.clusterNo} | {clusterInfo.localBody}</Typography>
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Typography variant="subtitle1"><strong>Total Area:</strong> {clusterInfo.totalArea.toFixed(2)} Cent</Typography>
                    <LinearProgress variant="determinate" value={totalAreaProgress} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
                        {clusterInfo.totalArea.toFixed(2)} / {clusterInfo.maxArea} Cents
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Tooltip title="View FMB"><Button variant="contained" color="secondary"><MapIcon /></Button></Tooltip>
                        <Tooltip title="Reject Cluster"><Button variant="contained" color="error"><WarningAmberIcon /></Button></Tooltip>
                        <Tooltip title="Submit"><Button type="submit" variant="contained" color="primary"><SaveIcon /></Button></Tooltip>
                    </Box>
                </Box>
            </Box>

            <Typography variant="h4" align="center" gutterBottom color="primary">Cluster Land Form</Typography>

            {/* --- Centered Content Box --- */}
            <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                {/* --- Cluster Info Section --- */}
                <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                    Cluster Info
                </Box>
                <Grid container spacing={2} mb={2} alignItems="flex-start">
                    <Grid item xs={12} sm={6} md={2}><TextField label="Cluster No." value={clusterInfo.clusterNo} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={3}><TextField label="Local Body" value={clusterInfo.localBody} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={2}><TextField label="Land Type" value={clusterInfo.landType} InputProps={{ readOnly: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField label="Total Actual Area (in cents)" value={clusterInfo.totalArea.toFixed(2)} InputProps={{ readOnly: true }} fullWidth />
                        <Box sx={{ width: '100%', mt: 1 }}>
                            <LinearProgress variant="determinate" value={totalAreaProgress} sx={{ height: 10, borderRadius: 5 }} />
                            <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
                                {clusterInfo.totalArea.toFixed(2)} / {clusterInfo.maxArea} Cents (Max 6 Acres)
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                <Box sx={{ maxWidth: 800, margin: '0 auto', mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6}><Button variant="contained" color="secondary" startIcon={<MapIcon />}>View FMB</Button></Grid>
                        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="contained" color="error" startIcon={<DeleteForeverIcon />}>Reject Cluster</Button></Grid>
                    </Grid>
                </Box>

                {/* --- Keyplot & Sideplot Sections --- */}
                {keyplotsData.map((keyplot) => {
                    const isNewRowIncomplete = keyplot.rows
                        .filter(row => row.isNew)
                        .some(row => 
                            !row.villageName || !row.block || !row.svNo || 
                            !row.sub || !row.area || !row.enumeratedArea
                        );

                    return (
                        <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
                            <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">{keyplot.label === 'K' ? 'Key Plot Details' : `Side Plot - ${keyplot.label}`}</Typography>
                                <Typography>Total Actual Area (Cent): {clusterInfo.totalArea.toFixed(2)}</Typography>
                            </Box>
                            <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
                                <Grid item xs={2}><Typography fontWeight="bold">Village</Typography></Grid>
                                <Grid item xs={1.5}><Typography fontWeight="bold">Block</Typography></Grid>
                                <Grid item xs={1.5}><Typography fontWeight="bold">Survey No.</Typography></Grid>
                                <Grid item xs={1}><Typography fontWeight="bold">Sub Div No.</Typography></Grid>
                                <Grid item xs={2}><Typography fontWeight="bold">Total Area (Actual)</Typography></Grid>
                                <Grid item xs={2}><Typography fontWeight="bold">Total Area (Enumerated)</Typography></Grid>
                                <Grid item xs={2} /> {/* MODIFIED: Empty grid item to align columns since "Actions" header is removed */}

                                {keyplot.rows.length === 0 && <Grid item xs={12} sx={{ textAlign: 'center', color: 'text.secondary', p: 2 }}>No rows added.</Grid>}
                                
                                {keyplot.rows.map((row, rowIndex) => (
                                    <React.Fragment key={rowIndex}>
                                        {row.isNew ? (
                                            <>
                                                {/* --- MODIFIED: Village and Block are now dropdowns --- */}
                                                <Grid item xs={2}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Village</InputLabel>
                                                        <Select name="villageName" label="Village" value={row.villageName} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'villageName')}>
                                                            {villageOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={1.5}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Block</InputLabel>
                                                        <Select name="block" label="Block" value={row.block} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'block')}>
                                                            {blockOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={1.5}><TextField label="Survey No" size="small" fullWidth value={row.svNo} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'svNo')} /></Grid>
                                                <Grid item xs={1}><TextField label="Sub Div" size="small" fullWidth value={row.sub} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'sub')} /></Grid>
                                                <Grid item xs={2}><TextField label="Area" size="small" fullWidth type="number" value={row.area} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'area')} /></Grid>
                                                <Grid item xs={2}><TextField label="Enum. Area" size="small" fullWidth type="number" value={row.enumeratedArea} onChange={(e) => handleInputChange(e, keyplot.id, rowIndex, 'enumeratedArea')} /></Grid>
                                                <Grid item xs={2}>
                                                    <Tooltip title="Remove Row"><IconButton color="error" onClick={() => handleRemoveRow(keyplot.id, rowIndex)}><RemoveCircleOutlineIcon /></IconButton></Tooltip>
                                                </Grid>
                                            </>
                                        ) : (
                                            <>
                                                <Grid item xs={2}><TextField value={row.villageName} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={1.5}><TextField value={row.block} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={1.5}><TextField value={row.svNo} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={1}><TextField value={row.sub} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={2}><TextField value={row.area} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={2}><TextField value={row.enumeratedArea} InputProps={{ readOnly: true }} fullWidth size="small" /></Grid>
                                                <Grid item xs={2}>
                                                    {!(keyplot.label === "K" && rowIndex === 0) && (
                                                        <Tooltip title="Remove Row"><IconButton onClick={() => handleRemoveRow(keyplot.id, rowIndex)} size="small" color="error"><RemoveCircleOutlineIcon /></IconButton></Tooltip>
                                                    )}
                                                </Grid>
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}

                                <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                                    <Button
                                        startIcon={<AddCircleOutlineIcon />}
                                        size="small"
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleAddRow(keyplot.id)}
                                        disabled={isNewRowIncomplete}
                                    >
                                        Add Row
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )
                })}

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, display: 'block', margin: '20px auto 0' }}>
                    Submit
                </Button>
            </Box>
        </Container>
    );
};

export default ClusterFormUI;
