import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Grid, FormControl, InputLabel,
    Select, MenuItem, Button, Box, TextField, Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';
// Assuming ListboxComponent is available at this path
// import ListboxComponent from './Cluster_supports/ListboxComponent';

// Placeholder for ListboxComponent if it's not provided externally.
// In a real application, you would import it from the correct path.
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
    // syNo from URL is the main keyplot ID (e.g., "385")
    const [syNo, setSyNo] = useState('');
    // slNo from URL is the keyplot's Sub number (e.g., "4")
    const [slNo, setSLNo] = useState('');

    const [wardNumber, setWardNumber] = useState('');
    // Not used in API payload, but kept for form
    const [wetDry, setWetDry] = useState('W');
    // Not used in API payload, but kept for form
    const [keyplotType, setKeyplotType] = useState('K');
    const [reserveKeyplot, setReserveKeyplot] = useState('');

    const [keyplotDetails, setKeyplotDetails] = useState({
        villageBlock: '',
        panchayath: '',
        syNo: '', // This will be "385/4"
        areaCents: '',
        landType: '',
    });

    const [keyplots, setKeyplots] = useState([
        { id: 'N', label: 'N', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id:'' }] },
        { id: 'E', label: 'E', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id:'' }] },
        { id: 'S', label: 'S', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id:'' }] },
        { id: 'W', label: 'W', rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id:'' }] },
    ]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [svNoOptions, setSvNoOptions] = useState([]);

    // State to hold the parsed main Sv.No from keyplotDetails.syNo (e.g., "385")
    const [keyplotMainSvNo, setKeyplotMainSvNo] = useState('');
    // State to hold the parsed Sub number from keyplotDetails.syNo (or from slNo directly) (e.g., "4")
    const [keyplotSubNo, setKeyplotSubNo] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const syNoFromURL = urlParams.get('No'); // e.g., "385"
        const slnoFromURL = urlParams.get('slno'); // e.g., "4"

        if (syNoFromURL) {
            setSyNo(decodeURIComponent(syNoFromURL)); // syNo will be "385"
        }

        if (slnoFromURL) {
            setSLNo(decodeURIComponent(slnoFromURL)); // slNo will be "4"
            setKeyplotSubNo(decodeURIComponent(slnoFromURL)); // Set keyplotSubNo from slNo
        }

        const fetchKeyplotDetails = async (id) => {
            if (!id) return;
            try {
                const response = await fetch(`http://localhost:8082/btr-service/key-plots/get-keyplot/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
           
                if (data.payload) {
                    setKeyplotDetails(data.payload);
                    if (data.payload.sidePlots && Array.isArray(data.payload.sidePlots)) {
  // Build a new keyplots array with existing side plot data
  const updatedKeyplots = ['N', 'E', 'S', 'W'].map(label => {
    // Find if this side exists in the API response
    const existing = data.payload.sidePlots.find(sp => sp.label === label);
    if (existing) {
      // Map API rows to your row structure
      return {
        id: label,
        label,
        rows: existing.rows.map(row => ({
          svNo: row.svNo || '', // You may need to fetch or map this if available
          sub: row.subNo || '',  // You may need to fetch or map this if available
          block: row.bcode || '', // You may need to fetch or map this if available
          actual: row.actual || '',
          area: row.area ||  '', // You may need to fetch or map this if available
          subOptions: [],
          plot_id: row.plot_id || ''
        }))
      };
    } else {
      // Default empty row if not present in API
      return {
        id: label,
        label,
        rows: [{ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id: '' }]
      };
    }
  });
  setKeyplots(updatedKeyplots);
}

                    // Extract main Sv.No from keyplotDetails.syNo (e.g., "385/4")
                    const ssyNo = data.payload.syNo;
                    if (ssyNo) {
                        const [mainNo] = ssyNo.split('/');
                        setKeyplotMainSvNo(mainNo); // "385"
                        // Note: slNo (from URL) is the actual sub number for the keyplot.
                        // keyplotDetails.syNo might contain both, but slNo from URL is what we need for the keyplot's sub.
                    }
                }
            } catch (error) {
                console.error("Error fetching keyplot details:", error);
                setSnackbarMessage('Failed to load keyplot details.');
                setSnackbarOpen(true);
            }
        };

        const fetchSvNoOptions = async (id) => {
            if (!id) return;
            console.log("plot_id  ",id)
            try {
                const response = await fetch(`http://localhost:8082/btr-service/cluster-api/${id}/resvnos`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.resvnos) {
                    // Filter out the keyplot's own Sy.No (main part) from options
                    // We only filter the main part here, not the combined "385/4"
                    const filteredOptions = data.resvnos.map(String).filter(option => option !== syNoFromURL);
                    setSvNoOptions(filteredOptions);
                } else {
                    setSvNoOptions([]);
                }
            } catch (error) {
                console.error("Error fetching Sv.No options:", error);
                setSnackbarMessage('Failed to load Sv.No options.');
                setSnackbarOpen(true);
            }
        };

        if (syNoFromURL) {
            fetchKeyplotDetails(syNoFromURL);
            fetchSvNoOptions(syNoFromURL);
        }

    }, [location.search, syNo]); // syNo (from URL) and location.search as dependencies

    const fetchResbdnos = async (resvnoValue, currentSyNo, keyplotIndex, rowIndex) => {
        if (!resvnoValue || !currentSyNo) {
            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].subOptions = [];
                }
                return updatedKeyplots;
            });
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:8082/btr-service/cluster-api/${currentSyNo}/resbdnos?resvno=${resvnoValue}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let fetchedOptions = (data && data.resbdnos) ? data.resbdnos.filter(item => item !== null && item !== '') : [];

            // Validation 1: Filter out the keyplot's own sub number if Sv.No matches the keyplot's main Sv.No
            if (resvnoValue === keyplotMainSvNo) { // Check against the parsed main Sv.No of the keyplot
                fetchedOptions = fetchedOptions.filter(option => option !== keyplotSubNo); // Check against the keyplot's actual sub number
            }

            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].subOptions = fetchedOptions;
                }
                return updatedKeyplots;
            });

        } catch (error) {
            console.error('Error fetching resbdnos:', error);
            setSnackbarMessage('Failed to load Sub options for selected Sv.No.');
            setSnackbarOpen(true);
            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].subOptions = [];
                }
                return updatedKeyplots;
            });
        }
    };

    const fetchPlotDetails = async (currentSyNo, resvno, resbdno, keyplotIndex, rowIndex) => {
        if (!currentSyNo || !resvno || !resbdno) {
            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].block = '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].area = '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].plot_id = '';
                }
                return updatedKeyplots;
            });
            return;
        }
        try {
            const response = await fetch(
                `http://localhost:8082/btr-service/cluster-api/${currentSyNo}/plot-details?resvno=${resvno}&resbdno=${resbdno}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Plot details response:", data);

            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].block = data.bcode || '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].plot_id = data.plot_id || '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].area = data.area !== undefined && data.area !== null ? data.area.toFixed(2) : '';
                }
                return updatedKeyplots;
            });

        } catch (error) {
            console.error('Error fetching plot details:', error);
            setSnackbarMessage('Failed to load plot details (Block/Area).');
            setSnackbarOpen(true);
            setKeyplots(prevKeyplots => {
                const updatedKeyplots = [...prevKeyplots];
                if (updatedKeyplots[keyplotIndex] && updatedKeyplots[keyplotIndex].rows[rowIndex]) {
                    updatedKeyplots[keyplotIndex].rows[rowIndex].block = '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].actual = '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].area = '';
                    updatedKeyplots[keyplotIndex].rows[rowIndex].plot_id = '';
                }
                return updatedKeyplots;
            });
        }
    };


    const handleKeyplotLabelChange = (event, index) => {
        const newKeyplots = [...keyplots];
        newKeyplots[index].label = event.target.value.toUpperCase().slice(0, 4);
        setKeyplots(newKeyplots);
    };

    const handleKeyplotRowChange = (newValue, keyplotIndex, rowIndex, field) => {
        let valueToSet = (field === 'svNo')
            ? (newValue !== null ? String(newValue) : '')
            : (field === 'sub' ? newValue.target.value : newValue);

        const newKeyplots = JSON.parse(JSON.stringify(keyplots)); // Quick deep copy
        const currentRow = newKeyplots[keyplotIndex].rows[rowIndex];
        const currentArea = parseFloat(currentRow.area || 0);

        // --- Validation 1: Prevent Keyplot's Sv.No/Sub in Side Plots ---
        // Get the svNo and sub either from current row or incoming field
        const currentSvNo = field === 'svNo' ? valueToSet : currentRow.svNo;
        const currentSub = field === 'sub' ? valueToSet : currentRow.sub;

        // Combine to check if it's the same as the keyplot's full syNo (like "385/4")
        if (currentSvNo && currentSub) {
            const combined = `${currentSvNo}/${currentSub}`;
            if (keyplotDetails.syNo && combined === keyplotDetails.syNo) { // Ensure keyplotDetails.syNo is available
                setSnackbarMessage(`The combination Sv.No/Sub (${combined}) is already used in the keyplot. Please select a different combination.`);
                setSnackbarOpen(true);
                return; // Prevent further execution
            }
        }

        // --- End Validation 1 ---


        // --- Validation 2: Prevent duplicate Sv.No/Sub within the same Side Plot ---
        if (field === 'svNo' || field === 'sub') {
            const currentSvNoCheck = field === 'svNo' ? valueToSet : currentRow.svNo;
            const currentSubCheck = field === 'sub' ? valueToSet : currentRow.sub;

            if (currentSvNoCheck && currentSubCheck) { // Only check if both are selected
                const isDuplicate = newKeyplots[keyplotIndex].rows.some((row, idx) =>
                    idx !== rowIndex && row.svNo === currentSvNoCheck && row.sub === currentSubCheck
                );

                if (isDuplicate) {
                    setSnackbarMessage('This Sv.No and Sub combination is already used in this side plot. Please select a unique combination.');
                    setSnackbarOpen(true);
                    return; // Prevent updating the state
                }
            }
        }
        // --- End Validation 2 ---

        // Specific validation for 'actual' field
        if (field === 'actual') {
            if (valueToSet === '') {
                // Allow empty string for clearing the field
            } else {
                const newActualValue = parseFloat(valueToSet);

                if (isNaN(newActualValue)) {
                    setSnackbarMessage('Actual area must be a valid number.');
                    setSnackbarOpen(true);
                    return;
                }

                if (newActualValue < 0) {
                    setSnackbarMessage('Negative values are not allowed for Actual area.');
                    setSnackbarOpen(true);
                    return;
                }

                if (valueToSet.includes('.') && valueToSet.split('.')[1].length > 2) {
                    setSnackbarMessage('Actual area can only have up to two decimal places.');
                    setSnackbarOpen(true);
                    return;
                }

                if (!currentRow.area || currentArea === 0) {
                    setSnackbarMessage('Please select Sv.No and Sub to populate Area before entering Actual area.');
                    setSnackbarOpen(true);
                    return;
                }

                if (newActualValue > currentArea) {
                    setSnackbarMessage('Actual area cannot exceed the given Area.');
                    setSnackbarOpen(true);
                    return;
                }
            }
        }

        if (field === 'area' && valueToSet !== '' && parseFloat(valueToSet) < 0) {
            setSnackbarMessage('Negative values are not allowed for this field.');
            setSnackbarOpen(true);
            return;
        }

        newKeyplots[keyplotIndex].rows[rowIndex][field] = valueToSet;

        if (field === 'svNo') {
            fetchResbdnos(valueToSet, syNo, keyplotIndex, rowIndex);
            newKeyplots[keyplotIndex].rows[rowIndex].sub = ''; // Clear sub
            newKeyplots[keyplotIndex].rows[rowIndex].block = ''; // Clear block
            newKeyplots[keyplotIndex].rows[rowIndex].actual = ''; // Clear actual
            newKeyplots[keyplotIndex].rows[rowIndex].area = ''; // Clear area
            newKeyplots[keyplotIndex].rows[rowIndex].plot_id = ''; // Clear plot_id
        } else if (field === 'sub') {
            const currentSvNo = newKeyplots[keyplotIndex].rows[rowIndex].svNo;
            if (currentSvNo && valueToSet) {
                fetchPlotDetails(syNo, currentSvNo, valueToSet, keyplotIndex, rowIndex);
            } else {
                newKeyplots[keyplotIndex].rows[rowIndex].block = '';
                newKeyplots[keyplotIndex].rows[rowIndex].actual = '';
                newKeyplots[keyplotIndex].rows[rowIndex].area = '';
                newKeyplots[keyplotIndex].rows[rowIndex].plot_id = '';
            }
        }

        setKeyplots(newKeyplots);
    };


    const handleAreaInputBlur = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        setKeyplots(newKeyplots);
    };

    const addKeyplotRow = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        const lastRow = newKeyplots[keyplotIndex].rows[newKeyplots[keyplotIndex].rows.length - 1];

        // Check if the last row has all required fields filled before adding a new one
        if (!lastRow || !lastRow.svNo || !lastRow.sub || !lastRow.actual || !lastRow.plot_id) {
            setSnackbarMessage('Please select Sv.No, Sub, enter Actual area, and ensure plot details are loaded in the current row before adding a new row.');
            setSnackbarOpen(true);
            return;
        }

        newKeyplots[keyplotIndex].rows.push({ svNo: '', sub: '', block: '', actual: '', area: '', subOptions: [], plot_id:''});
        setKeyplots(newKeyplots);
    };

    const removeKeyplotRow = (keyplotIndex) => {
        const newKeyplots = [...keyplots];
        if (newKeyplots[keyplotIndex].rows.length > 1) {
            newKeyplots[keyplotIndex].rows.pop();
            setKeyplots(newKeyplots);
        }
    };

    const calculateTotalActual = (rows) => {
        return rows.reduce((sum, row) => sum + parseFloat(row.actual || 0), 0).toFixed(2);
    };

    const calculateTotalArea = (rows) => {
        const totalCents = rows.reduce((sum, row) => sum + parseFloat(row.area || 0), 0);
        const totalAres = totalCents * 0.00404686; // 1 cent = 0.00404686 ares
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

        // Filter out side plots and rows that do not have complete data
        const filteredSidePlots = keyplots.map(keyplot => {
            const filteredRows = keyplot.rows.filter(row => {
                // A row is considered valid for submission if:
                // 1. plot_id exists (meaning Sv.No and Sub were selected and plot details fetched)
                // 2. actual is not an empty string
                // 3. actual is a valid number (not NaN after parseFloat)
                return row.plot_id && row.actual !== '' && !isNaN(parseFloat(row.actual));
            }).map(row => ({
                // Format actual to 2 decimal places as per the example payload
                actual: parseFloat(row.actual).toFixed(2),
                plot_id: row.plot_id, // Use plot_id as 'id' in the payload
            }));

            // Only include the side plot in the payload if it contains at least one valid row
            if (filteredRows.length > 0) {
                return {
                    // Use the 'label' (N, E, S, W) from your state
                    label: keyplot.label,
                    rows: filteredRows
                };
            }
            return null; // Mark this side plot for exclusion
        }).filter(sidePlot => sidePlot !== null); // Remove all marked (null) side plots

        // If no valid side plots are left after filtering, show a message and prevent submission
        if (filteredSidePlots.length === 0) {
            setSnackbarMessage('No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.');
            setSnackbarOpen(true);
            return;
        }

        // Prepare the payload for the API with filtered data
        const payload = {
            keyplotId: syNo, // Using syNo from URL as the keyplotId
            clusterNo: parseInt(slNo, 10), // Convert slNo to integer
            sidePlots: filteredSidePlots
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('http://localhost:8082/btr-service/cluster-api/save-cluster', {
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
            // Optionally, navigate or clear form upon successful submission
            // navigate('/success-page');
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
                        <Grid item xs={3}> <Typography fontWeight="bold">Area</Typography> </Grid>

                        {/* Dynamic Rows */}
                        {keyplot.rows.map((row, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <Grid item xs={2}>
                                    <Autocomplete
                                        id={`svNo-autocomplete-${keyplot.id}-${rowIndex}`}
                                        options={svNoOptions.map(String)}
                                        getOptionLabel={(option) => String(option)}
                                        value={row.svNo ? String(row.svNo) : null}
                                        onChange={(event, newValue) => {
                                            handleKeyplotRowChange(newValue, index, rowIndex, 'svNo');
                                        }}
                                        ListboxComponent={ListboxComponent}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Sv.No"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Sub</InputLabel>
                                        <Select
                                            value={row.sub}
                                            label="Sub"
                                            onChange={(e) => handleKeyplotRowChange(e, index, rowIndex, 'sub')}
                                        >
                                            {row.subOptions.length > 0 ? (
                                                row.subOptions.map((option) => (
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
                                <Grid item xs={2}>
                                    <TextField
                                        value={row.block}
                                        onChange={(e) => handleKeyplotRowChange(e.target.value, index, rowIndex, 'block')}
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        value={row.actual}
                                        onChange={(e) => handleKeyplotRowChange(e.target.value, index, rowIndex, 'actual')}
                                        size="small"
                                        fullWidth
                                        type='number'
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        value={row.area}
                                        onChange={(e) => handleKeyplotRowChange(e.target.value, index, rowIndex, 'area')}
                                        onBlur={() => handleAreaInputBlur(index)}
                                        size="small"
                                        fullWidth
                                        type='number'
                                        InputProps={{
                                            readOnly: true,
                                        }}
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
