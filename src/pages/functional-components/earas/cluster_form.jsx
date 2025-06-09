import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Grid, FormControl, InputLabel,
    Select, MenuItem, Button, Box, TextField, Snackbar, Alert,
    CircularProgress, Modal, Paper // Import Modal and Paper for the modal
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';

// Placeholder for ListboxComponent if it's not provided externally.
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    return (
        <ul {...other} ref={ref}>
            {children}
        </ul>
    );
});

const ClusterForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [syNo, setSyNo] = useState('');
    const [slNo, setSLNo] = useState('');

    const [wardNumber, setWardNumber] = useState('');
    const [reserveKeyplot, setReserveKeyplot] = useState('');

    const [keyplotDetails, setKeyplotDetails] = useState({
        villageBlock: '',
        panchayath: '',
        syNo: '',
        areaCents: '',
        landType: '',
    });

    const [keyplots, setKeyplots] = useState([
        { id: 'N', label: 'N', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id: '' }] },
        { id: 'E', label: 'E', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id: '' }] },
        { id: 'S', label: 'S', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id: '' }] },
        { id: 'W', label: 'W', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id: '' }] },
    ]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [svNoOptions, setSvNoOptions] = useState([]);

    const [keyplotMainSvNo, setKeyplotMainSvNo] = useState('');
    const [keyplotSubNo, setKeyplotSubNo] = useState('');

    const [loading, setLoading] = useState(true);

    // --- Modal related states ---
    const [modalOpen, setModalOpen] = useState(false);
    const [currentKeyplotIndex, setCurrentKeyplotIndex] = useState(null);
    const [modalRowData, setModalRowData] = useState({
        svNo: null,
        sub: '',
        block: '',
        actual: '',
        area: '',
        village: '', // New field for modal
        modalBlock: '' // New field for modal, renamed to avoid conflict
    });
    // Placeholder options for modal's new dropdowns (replace with actual fetches if needed)
    const [villageOptions, setVillageOptions] = useState(['Village A', 'Village B', 'Village C', 'Village D']);
    const [modalBlockOptions, setModalBlockOptions] = useState(['Block 1', 'Block 2', 'Block 3', 'Block 4']);
    // --- End Modal related states ---

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const syNoFromURL = urlParams.get('No');
        const slnoFromURL = urlParams.get('slno');

        if (syNoFromURL) {
            setSyNo(decodeURIComponent(syNoFromURL));
        }
        if (slnoFromURL) {
            setSLNo(decodeURIComponent(slnoFromURL));
            setKeyplotSubNo(decodeURIComponent(slnoFromURL));
        }

        const fetchAllInitialData = async () => {
            setLoading(true);

            const keyplotDetailsPromise = fetchKeyplotDetails(syNoFromURL);
            const svNoOptionsPromise = fetchSvNoOptions(syNoFromURL);

            try {
                await Promise.all([keyplotDetailsPromise, svNoOptionsPromise]);
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

    }, [location.search, syNo]);

    const fetchKeyplotDetails = async (id) => {
        if (!id) return;
         const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8080/btr-service/key-plots/get-keyplot/${id}`,{
                
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.payload) {
                setKeyplotDetails(data.payload);
                if (data.payload.sidePlots && Array.isArray(data.payload.sidePlots)) {
                    const updatedKeyplots = ['N', 'E', 'S', 'W'].map(label => {
                        const existing = data.payload.sidePlots.find(sp => sp.label === label);
                        if (existing) {
                            return {
                                id: label,
                                label,
                                rows: existing.rows.map(row => ({
                                    svNo: row.svNo || '',
                                    sub: row.subNo || '',
                                    block: row.bcode || '',
                                    actual: row.actual || '',
                                    area: row.area || '',
                                    subOptions: [], // These need to be fetched dynamically
                                    plot_id: row.plot_id || ''
                                }))
                            };
                        } else {
                            return {
                                id: label,
                                label,
                                rows: [] // Start with no rows for non-existing side plots
                            };
                        }
                    });
                    setKeyplots(updatedKeyplots);
                }

                const ssyNo = data.payload.syNo;
                if (ssyNo) {
                    const [mainNo] = ssyNo.split('/');
                    setKeyplotMainSvNo(mainNo);
                }
            }
        } catch (error) {
            console.error("Error fetching keyplot details:", error);
            throw error;
        }
    };

    const fetchSvNoOptions = async (id) => {
        if (!id) return;
        try {
             const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/btr-service/cluster-api/${id}/resvnos`,{
                
          headers: {
            Authorization: `Bearer ${token}` // Ensure token is included
          }
        });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.resvnos) {
                const filteredOptions = data.resvnos.map(String).filter(option => option !== id);
                setSvNoOptions(filteredOptions);
            } else {
                setSvNoOptions([]);
            }
        } catch (error) {
            console.error("Error fetching Sv.No options:", error);
            throw error;
        }
    };

    // This function will now be called when modal's Sv.No changes
    const fetchResbdnos = async (resvnoValue, currentSyNo, keyplotIndex, rowIndex) => {
        if (!resvnoValue || !currentSyNo) {
            setModalRowData(prev => ({ ...prev, sub: '', block: '', area: '' }));
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:8080/btr-service/cluster-api/${currentSyNo}/resbdnos?resvno=${resvnoValue}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let fetchedOptions = (data && data.resbdnos) ? data.resbdnos.filter(item => item !== null && item !== '') : [];

            if (resvnoValue === keyplotMainSvNo) {
                fetchedOptions = fetchedOptions.filter(option => option !== keyplotSubNo);
            }

            // Update subOptions for the *modal's context* or for dynamic display if needed
            // For now, we'll just set it temporarily for modal's sub dropdown
            setModalRowData(prev => ({
                ...prev,
                subOptions: fetchedOptions, // Temporary storage for modal's sub dropdown
                sub: '' // Reset sub when Sv.No changes
            }));

        } catch (error) {
            console.error('Error fetching resbdnos:', error);
            setSnackbarMessage('Failed to load Sub options for selected Sv.No.');
            setSnackbarOpen(true);
            setModalRowData(prev => ({ ...prev, subOptions: [], sub: '' }));
        }
    };

    // This function will now be called when modal's Sub changes
    const fetchPlotDetails = async (currentSyNo, resvno, resbdno) => {
        if (!currentSyNo || !resvno || !resbdno) {
            setModalRowData(prev => ({ ...prev, block: '', area: '', plot_id: '' }));
            return;
        }
        try {
             const token = localStorage.getItem('token');

const response = await fetch(
  `http://localhost:8080/btr-service/cluster-api/${currentSyNo}/plot-details?resvno=${resvno}&resbdno=${resbdno}`,
  {
    method: 'GET', // optional here since GET is default, but it's good practice to include
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Plot details response:", data);

            setModalRowData(prev => ({
                ...prev,
                block: data.bcode || '',
                plot_id: data.plot_id || '',
                area: data.area !== undefined && data.area !== null ? data.area.toFixed(2) : '',
            }));

        } catch (error) {
            console.error('Error fetching plot details:', error);
            setSnackbarMessage('Failed to load plot details (Block/Area).');
            setSnackbarOpen(true);
            setModalRowData(prev => ({ ...prev, block: '', actual: '', area: '', plot_id: '' }));
        }
    };

    const handleKeyplotLabelChange = (event, index) => {
        const newKeyplots = [...keyplots];
        newKeyplots[index].label = event.target.value.toUpperCase().slice(0, 4);
        setKeyplots(newKeyplots);
    };

    // This function now primarily handles updates to the main form's details,
    // or if you re-introduce editable fields to displayed rows later.
    // For now, rows are read-only, so this function's direct usage for row fields will be limited.
    const handleKeyplotRowChange = (newValue, keyplotIndex, rowIndex, field) => {
        // This function will mostly be for "display-only" purposes now.
        // If you had direct input fields in the main form, this would be where you handle their changes.
        // With the modal, this is less relevant for data input.
        console.warn("handleKeyplotRowChange is less relevant now as row inputs are in modal. Consider refactoring if direct row editing is needed.");
    };

    // --- New handler for modal input changes ---
    const handleModalInputChange = (value, field) => {
        setModalRowData(prev => {
            const newState = { ...prev, [field]: value };

            // Logic for Sv.No change in modal
            if (field === 'svNo') {
                fetchResbdnos(value, syNo, currentKeyplotIndex, null); // Pass null for rowIndex as it's modal specific
                newState.sub = ''; // Clear sub and dependent fields
                newState.block = '';
                newState.area = '';
                newState.actual = '';
                newState.plot_id = '';
            } else if (field === 'sub') {
                // Fetch plot details when Sv.No and Sub are selected in modal
                if (newState.svNo && value) {
                    fetchPlotDetails(syNo, newState.svNo, value);
                } else {
                    newState.block = '';
                    newState.area = '';
                    newState.actual = '';
                    newState.plot_id = '';
                }
            } else if (field === 'actual') {
                // Validation for 'actual' in modal
                if (value === '') {
                    // Allow empty string
                } else {
                    const newActualValue = parseFloat(value);
                    const currentArea = parseFloat(newState.area || 0);

                    if (isNaN(newActualValue)) {
                        setSnackbarMessage('Actual area must be a valid number.');
                        setSnackbarOpen(true);
                        return prev; // Revert state
                    }
                    if (newActualValue < 0) {
                        setSnackbarMessage('Negative values are not allowed for Actual area.');
                        setSnackbarOpen(true);
                        return prev; // Revert state
                    }
                    if (!newState.area || currentArea === 0) {
                        setSnackbarMessage('Please select Sv.No and Sub to populate Area before entering Actual area.');
                        setSnackbarOpen(true);
                        return prev; // Revert state
                    }
                    if (newActualValue > currentArea) {
                        setSnackbarMessage('Actual area cannot exceed the given Area.');
                        setSnackbarOpen(true);
                        return prev; // Revert state
                    }
                }
            }
            return newState;
        });
    };
    // --- End new handler for modal input changes ---


    const handleAreaInputBlur = (keyplotIndex) => {
        // This function might still be useful for formatting 'actual' field on blur
        // For 'area', it's read-only, so no change is needed.
        const newKeyplots = [...keyplots];
        newKeyplots[keyplotIndex].rows.forEach(row => {
            if (row.actual !== '' && !isNaN(parseFloat(row.actual))) {
                row.actual = parseFloat(row.actual).toFixed(2);
            }
        });
        setKeyplots(newKeyplots);
    };

    // Modified addKeyplotRow to open the modal
    const addKeyplotRow = (keyplotIndex) => {
        setCurrentKeyplotIndex(keyplotIndex);
        setModalRowData({ // Reset modal data
            svNo: null,
            sub: '',
            block: '',
            actual: '',
            area: '',
            village: '',
            modalBlock: '',
            subOptions: [] // Clear sub options for new entry
        });
        setModalOpen(true);
    };

    const removeKeyplotRow = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        if (newKeyplots[keyplotIndex].rows.length > 0) { // Allow removing even if it's the last one for flexibility
            newKeyplots[keyplotIndex].rows.pop();
            setKeyplots(newKeyplots);
        } else {
            setSnackbarMessage("No rows to remove in this side plot.");
            setSnackbarOpen(true);
        }
    };

    // --- New function to handle adding a row from the modal ---
    const handleModalAddRow = () => {
        if (currentKeyplotIndex === null) return;

        // Validation for modal data before adding
        if (!modalRowData.svNo || !modalRowData.sub || !modalRowData.actual || !modalRowData.plot_id || parseFloat(modalRowData.actual) === 0) {
            setSnackbarMessage('Please ensure Sv.No, Sub, valid Actual area (>0), and plot details are filled in the modal.');
            setSnackbarOpen(true);
            return;
        }

        // --- Validation: Prevent Keyplot's Sv.No/Sub in Side Plots ---
        const combinedModal = `${modalRowData.svNo}/${modalRowData.sub}`;
        if (keyplotDetails.syNo && combinedModal === keyplotDetails.syNo) {
            setSnackbarMessage(`The combination Sv.No/Sub (${combinedModal}) is already used in the keyplot. Please select a different combination.`);
            setSnackbarOpen(true);
            return;
        }

        // --- Validation: Prevent duplicate Sv.No/Sub within the same Side Plot (existing rows) ---
        const isDuplicateInSidePlot = keyplots[currentKeyplotIndex].rows.some(row =>
            row.svNo === modalRowData.svNo && row.sub === modalRowData.sub
        );
        if (isDuplicateInSidePlot) {
            setSnackbarMessage('This Sv.No and Sub combination is already used in this side plot. Please select a unique combination.');
            setSnackbarOpen(true);
            return;
        }

        const newKeyplots = [...keyplots];
        const newRow = {
            svNo: String(modalRowData.svNo),
            sub: String(modalRowData.sub),
            block: modalRowData.block,
            actual: parseFloat(modalRowData.actual).toFixed(2), // Ensure two decimal places
            area: parseFloat(modalRowData.area).toFixed(2), // Ensure two decimal places
            plot_id: modalRowData.plot_id,
            // You might want to store village and modalBlock if they are relevant to the row
            // village: modalRowData.village,
            // modalBlock: modalRowData.modalBlock,
            subOptions: [] // Clear sub options for future use
        };

        newKeyplots[currentKeyplotIndex].rows.push(newRow);
        setKeyplots(newKeyplots);
        setModalOpen(false); // Close modal
        setCurrentKeyplotIndex(null); // Reset index
        setSnackbarMessage('Row added successfully!');
        setSnackbarOpen(true);
    };
    // --- End new function to handle adding a row from the modal ---


    const calculateTotalActual = (rows) => {
        return rows.reduce((sum, row) => sum + parseFloat(row.actual || 0), 0).toFixed(2);
    };

    const calculateTotalArea = (rows) => {
        const totalCents = rows.reduce((sum, row) => sum + parseFloat(row.area || 0), 0);
        const totalAres = totalCents * 0.00404686;
        return totalAres.toFixed(2);
    };

    const calculateOverallTotalActual = () => {
        let total = 0;
        keyplots.forEach(keyplot => {
            total += parseFloat(calculateTotalActual(keyplot.rows));
        });
        return total.toFixed(2);
    };

    const calculateOverallTotalArea = () => {
        let totalCents = 0;
        keyplots.forEach(keyplot => {
            totalCents += keyplot.rows.reduce((sum, row) => sum + parseFloat(row.area || 0), 0);
        });
        const totalAres = totalCents * 0.00404686;
        return totalAres.toFixed(2);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const overallTotalAreaAres = parseFloat(calculateOverallTotalArea());
        const maxAllowedAreaAres = 5.00;

        if (overallTotalAreaAres > maxAllowedAreaAres) {
            setSnackbarMessage(`Overall Total Area (${overallTotalAreaAres} ares) cannot exceed ${maxAllowedAreaAres} ares.`);
            setSnackbarOpen(true);
            return;
        }

        const filteredSidePlots = keyplots.map(keyplot => {
            const filteredRows = keyplot.rows.filter(row => {
                return row.plot_id && row.actual !== '' && !isNaN(parseFloat(row.actual));
            }).map(row => ({
                actual: parseFloat(row.actual).toFixed(2),
                plot_id: row.plot_id,
            }));

            if (filteredRows.length > 0) {
                return {
                    label: keyplot.label,
                    rows: filteredRows
                };
            }
            return null;
        }).filter(sidePlot => sidePlot !== null);

        if (filteredSidePlots.length === 0) {
            setSnackbarMessage('No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.');
            setSnackbarOpen(true);
            return;
        }

        const payload = {
            keyplotId: syNo,
            clusterNo: parseInt(slNo, 10),
            sidePlots: filteredSidePlots
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('http://localhost:8080/btr-service/cluster-api/save-cluster', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setSnackbarMessage('Form submitted successfully!');
            setSnackbarOpen(true);
            console.log('API response:', result);
        } catch (error) {
            console.error('Error submitting form:', error);
            setSnackbarMessage(`Failed to submit form: ${error.message}`);
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading cluster data...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h4" align="center" gutterBottom color="primary">
                Cluster Land Form
            </Typography>

            <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Cluster Info
            </Box>

            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="Cluster No." value={slNo || 'Not Available'} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="പഞ്ചായത്ത്" value={keyplotDetails.panchayath || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="വാർഡ് നമ്പർ" value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="Land Type" value={keyplotDetails.landType || ''} InputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="KEYPLOT" value={"K" || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="SY.No." value={keyplotDetails.syNo || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="AREA (Cent)" value={keyplotDetails.areaCents || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="BLOCK/VILLAGE" value={keyplotDetails.villageBlock || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="RESERVE KEYPLOT" value={reserveKeyplot} onChange={(e) => setReserveKeyplot(e.target.value)} placeholder="-" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="TOTAL ACTUAL AREA (Cent)" value={calculateOverallTotalActual()} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="TOTAL AREA (Ares)" value={calculateOverallTotalArea()} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
            </Grid>

            {keyplots.map((keyplot, index) => (
                <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
                    <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                            <Typography sx={{ mr: 1 }}>SIDE PLOT:</Typography>
                            <TextField
                                value={keyplot.label}
                                onChange={(e) => handleKeyplotLabelChange(e, index)}
                                inputProps={{ maxLength: 4, style: { color: 'white' } }}
                                size="small"
                                sx={{ bgcolor: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '50px' }}
                            />
                        </Box>
                        <Typography>Total Actual Area (Cent): {calculateTotalActual(keyplot.rows)}</Typography>
                        <Typography>Total Area (Ares): {calculateTotalArea(keyplot.rows)}</Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
                        {/* Column Headers */}
                        <Grid item xs={2}> <Typography fontWeight="bold">Sv.No</Typography> </Grid>
                        <Grid item xs={2}> <Typography fontWeight="bold">Sub</Typography> </Grid>
                        <Grid item xs={2}> <Typography fontWeight="bold">Block</Typography> </Grid>
                        <Grid item xs={3}> <Typography fontWeight="bold">Actual</Typography> </Grid>
                        <Grid item xs={3}> <Typography fontWeight="bold">Area For Enumerated</Typography> </Grid>

                        {/* Dynamic Rows - Display Only (inputs are now in modal) */}
                        {keyplot.rows.map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <Grid item xs={2}>
                                    <TextField value={row.svNo || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField value={row.sub || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField value={row.block || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField value={row.actual || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField value={row.area || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                                </Grid>
                            </React.Fragment>
                        ))}
                        <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                            <Button startIcon={<AddIcon />} onClick={() => addKeyplotRow(index)} size="small" sx={{ mr: 1 }} variant="contained" color="success">
                                Add Row
                            </Button>
                            <Button startIcon={<RemoveIcon />} onClick={() => removeKeyplotRow(index)} size="small" variant="contained" color="error">
                                Remove Last Row
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, display: 'block', margin: '20px auto 0' }} onClick={handleSubmit}>
                Submit
            </Button>

            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* --- Modal for adding a new row --- */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="add-row-modal-title"
                aria-describedby="add-row-modal-description"
            >
                <Paper sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 400, md: 500 }, // Responsive width
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    <Typography id="add-row-modal-title" variant="h6" component="h2" gutterBottom>
                        Add New Side Plot Row
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                id="modal-village-autocomplete"
                                options={villageOptions}
                                getOptionLabel={(option) => String(option)}
                                value={modalRowData.village}
                                onChange={(event, newValue) => handleModalInputChange(newValue, 'village')}
                                renderInput={(params) => <TextField {...params} label="Village" variant="outlined" size="small" fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                id="modal-block-autocomplete"
                                options={modalBlockOptions}
                                getOptionLabel={(option) => String(option)}
                                value={modalRowData.modalBlock}
                                onChange={(event, newValue) => handleModalInputChange(newValue, 'modalBlock')}
                                renderInput={(params) => <TextField {...params} label="Block" variant="outlined" size="small" fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Autocomplete
                                id="modal-svNo-autocomplete"
                                options={svNoOptions.map(String)}
                                getOptionLabel={(option) => String(option)}
                                value={modalRowData.svNo ? String(modalRowData.svNo) : null}
                                onChange={(event, newValue) => handleModalInputChange(newValue, 'svNo')}
                                ListboxComponent={ListboxComponent}
                                renderInput={(params) => <TextField {...params} label="Sv.No" variant="outlined" size="small" fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Sub</InputLabel>
                                <Select
                                    value={modalRowData.sub}
                                    label="Sub"
                                    onChange={(e) => handleModalInputChange(e.target.value, 'sub')}
                                    disabled={!modalRowData.svNo || modalRowData.subOptions?.length === 0}
                                >
                                    {modalRowData.subOptions && modalRowData.subOptions.length > 0 ? (
                                        modalRowData.subOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>Select Sv.No first...</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Block (from Plot Details)"
                                value={modalRowData.block}
                                InputProps={{ readOnly: true }} // This block comes from plot details API
                                size="small"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Area (from Plot Details)"
                                value={modalRowData.area}
                                InputProps={{ readOnly: true }} // This area comes from plot details API
                                size="small"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Actual Area (Cent)"
                                value={modalRowData.actual}
                                onChange={(e) => handleModalInputChange(e.target.value, 'actual')}
                                size="small"
                                fullWidth
                                type='number'
                                inputProps={{ step: "0.01" }} // Allow decimal input
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={() => setModalOpen(false)} sx={{ mr: 1 }}>Cancel</Button>
                            <Button variant="contained" onClick={handleModalAddRow}>Add Row</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Modal>
            {/* --- End Modal --- */}
        </Container>
    );
};

export default ClusterForm;