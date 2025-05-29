import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, Box, TextField, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const ClusterForm = () => {
    const location = useLocation();
    const [syNo, setSyNo] = useState('');
    const [wardNumber, setWardNumber] = useState('');
    const [wetDry, setWetDry] = useState('W');
    const [keyplotType, setKeyplotType] = useState('K');
    const [reserveKeyplot, setReserveKeyplot] = useState('');
    const [keyplotDetails, setKeyplotDetails] = useState({ // New state for API fetched data
        villageBlock: '',
        panchayath: '',
        syNo: '',
        areaCents: ''
    });
    const [keyplots, setKeyplots] = useState([
        {
            id: 'w',
            label: 'W',
            rows: [{ svNo: '', sub: '', block: '', actual: '', area: '' }], // Empty row
        },
        {
            id: 'w1',
            label: 'W1',
            rows: [{ svNo: '', sub: '', block: '', actual: '', area: '' }], // Empty row
        },
        {
            id: 'n2',
            label: 'N2',
            rows: [{ svNo: '', sub: '', block: '', actual: '', area: '' }], // Empty row
        },
        {
            id: 'w2',
            label: 'W2',
            rows: [{ svNo: '', sub: '', block: '', actual: '', area: '' }], // Empty row
        },
    ]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

   useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('syNo');
    if (syNoFromURL) {
        setSyNo(decodeURIComponent(syNoFromURL));
    }

    if (syNo) {
        console.log('Fetching keyplot details for syNo:', syNo);
        const fetchKeyplotDetails = async () => {
            try {

              const response = await fetch(`http://localhost:8082/btr-service/key-plots/get-keyplot/${syNo}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.payload) {
                    setKeyplotDetails(data.payload);
                }
            } catch (error) {
                console.error("Error fetching keyplot details:", error);
                setSnackbarMessage('Failed to load keyplot details.');
                setSnackbarOpen(true);
            }
        };
        fetchKeyplotDetails();
    }
}, [location, syNo]);

    const handleKeyplotLabelChange = (event, index) => {
        const newKeyplots = [...keyplots];
        newKeyplots[index].label = event.target.value.toUpperCase().slice(0, 4);
        setKeyplots(newKeyplots);
    };

    const handleKeyplotRowChange = (event, keyplotIndex, rowIndex, field) => {
        const { value } = event.target;
        // Allow empty string for initial input or if user clears the field
        // Otherwise, convert to number and check if it's negative for 'actual' and 'area'
        if ((field === 'actual' || field === 'area') && value !== '' && parseFloat(value) < 0) {
            setSnackbarMessage('Negative values are not allowed for this field.');
            setSnackbarOpen(true);
            return; // Do not update state if value is negative
        }

        const newKeyplots = [...keyplots];
        newKeyplots[keyplotIndex].rows[rowIndex][field] = value;
        setKeyplots(newKeyplots);
    };


    const handleAreaInputBlur = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        setKeyplots(newKeyplots);
    };

    const addKeyplotRow = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        const lastRowSvNo = newKeyplots[keyplotIndex].rows[newKeyplots[keyplotIndex].rows.length - 1]?.svNo;

        if (!lastRowSvNo) {
            setSnackbarMessage('Please fill Sv.No in the current row before adding a new row.');
            setSnackbarOpen(true);
            return;
        }

        newKeyplots[keyplotIndex].rows.push({ svNo: '', sub: '', block: '', actual: '', area: '' });
        setKeyplots(newKeyplots);
    };

    const removeKeyplotRow = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        if (newKeyplots[keyplotIndex].rows.length > 1) {
            newKeyplots[keyplotIndex].rows.pop();
            setKeyplots(newKeyplots);
        }
    };

    const calculateTotalArea = (rows) => {
        return rows.reduce((sum, row) => sum + parseFloat(row.area || 0), 0).toFixed(2);
    };

    const calculateOverallTotalArea = () => {
        let total = 0;
        keyplots.forEach(keyplot => {
            total += parseFloat(calculateTotalArea(keyplot.rows));
        });
        return total.toFixed(2);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form submitted with data:', { wardNumber, wetDry, keyplotType, reserveKeyplot, keyplots, keyplotDetails });
        // Add your submission logic here
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4,overflowY:"scroll", bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h4" align="center" gutterBottom color="primary">
                Cluster Land Form
            </Typography>

            <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                Cluster Info
            </Box>

            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="Cluster No." value={syNo || 'Not Available'} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField label="പഞ്ചായത്ത്" value={keyplotDetails.panchayath || ''} InputProps={{ readOnly: true }} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                    <TextField label="വാർഡ് നമ്പർ" value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} fullWidth />
                </Grid>
                   <Grid item xs={12} sm={6} md={2}>
                    <TextField label="Land Type" value={keyplotDetails.landType || ''} InputProps={{ readOnly: true }} InputLabelProps={{ shrink: true }} fullWidth/>
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
                    <TextField label="TOTAL AREA" value={calculateOverallTotalArea()} InputProps={{ readOnly: true }} fullWidth />
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
                        <Typography>Total Area: {calculateTotalArea(keyplot.rows)}</Typography>
                    </Box>
                    <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
                        <Grid item xs={2}>
                            <Typography fontWeight="bold">Sv.No</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography fontWeight="bold">Sub</Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Typography fontWeight="bold">Block</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography fontWeight="bold">Actual</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography fontWeight="bold">Area</Typography>
                        </Grid>
                        {keyplot.rows.map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <Grid item xs={2}>
                                    <TextField value={row.svNo} onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'svNo')} size="small" fullWidth />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField value={row.sub} onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'sub')} size="small" fullWidth />
                                </Grid>
                                <Grid item xs={2}>
                                    <TextField value={row.block} onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'block')} size="small" fullWidth />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        value={row.actual}
                                        onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'actual')}
                                        size="small"
                                        fullWidth
                                        type='number' // Ensure number input
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        value={row.area}
                                        onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'area')}
                                        onBlur={() => handleAreaInputBlur(index)}
                                        size="small"
                                        fullWidth
                                        type='number' // Ensure number input
                                    />
                                </Grid>
                            </React.Fragment>
                        ))}
                        <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                            <Button startIcon={<AddIcon />} onClick={() => addKeyplotRow(index)} size="small" sx={{ mr: 1 }} variant="contained" color="success">
                                Add Row
                            </Button>
                            <Button startIcon={<RemoveIcon />} onClick={() => removeKeyplotRow(index)} size="small" variant="contained" color="error">
                                Remove Row
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
        </Container>
    );
};

export default ClusterForm;