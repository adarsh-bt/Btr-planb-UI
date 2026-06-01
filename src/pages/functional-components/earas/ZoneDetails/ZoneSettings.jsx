import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button
} from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';

// Base API URL for your service
const API_BASE_URL = mainapi.BASE_URL;
const CURRENT_USER_ID = authservice.userid(); // Get current user ID

// Utility function to format the dates and academic year from API response
const formatKeyplotData = (apiData) => {
    return apiData.map(item => {
        return {
            keyplotSize: item.keyplotsLimit,
            academicYear: `${new Date(item.agriStartYear).getFullYear()} - ${new Date(item.agriEndYear).getFullYear()}`,
            date: new Date(item.agriStartYear).toLocaleDateString(),
            user: item.editPermitter ? 'Admin/Editor' : 'System',
            inActive: item.isActive ? 'Active' : 'Inactive',
            remark: item.remarks || 'N/A'
        };
    });
};

// ⭐ NEW: Utility function to format cluster data
const formatClusterData = (apiData) => {
    return apiData.map(item => {
        return {
            clusterMin: item.clusterMin,
            clusterMax: item.clusterMax,
            tsoLimit: item.tsoLimit,
            academicYear: `${new Date(item.agriStartYear).getFullYear()} - ${new Date(item.agriEndYear).getFullYear()}`,
            date: new Date(item.agriStartYear).toLocaleDateString(),
            inActive: item.inActive ? 'Active' : 'Inactive',
            remark: item.remarks || 'N/A'
        };
    });
};


const ZoneSettings = () => {
    const [tabValue, setTabValue] = useState(0);
    const [keyplotSize, setKeyplotSize] = useState('');
    const [entries, setEntries] = useState([]);

    // Cluster States
    const [minClusterArea, setMinClusterArea] = useState('');
    const [maxClusterArea, setMaxClusterArea] = useState('');
    const [meanClusterArea, setMeanClusterArea] = useState(''); // TSO Approval Cluster Area maps to tsoLimit
    const [clusterEntries, setClusterEntries] = useState([]);
    const [clusterError, setClusterError] = useState(''); // State for cluster form validation errors

    const [remark, setRemark] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    const [keyplotError, setKeyplotError] = useState('');

    // Snackbar & Dialog states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // --- Data Fetching Hooks ---
    useEffect(() => {
        fetchKeyplotLimits();
        fetchClusterLimits(); // ⭐ ADDED
    }, []);

    const fetchKeyplotLimits = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/btr-service/admin-manage/keyplot-limits`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) { throw new Error("Failed to fetch keyplot limits data."); }
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.agriStartYear) - new Date(a.agriStartYear)); 
            
            const formattedEntries = formatKeyplotData(sortedData);
            setEntries(formattedEntries);
console.log("Fetched keyplot limits:", formattedEntries);
            if (formattedEntries.length > 0) {
                setKeyplotSize(String(formattedEntries[0].keyplotSize));
            }

        } catch (err) {
            console.error("Error fetching keyplot data:", err);
        }
    };

    // ⭐ NEW: Fetch Cluster Limits Function
    const fetchClusterLimits = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/btr-service/admin-manage/cluster-limits`, {
                method: "GET",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            if (!response.ok) { throw new Error("Failed to fetch cluster limits data."); }
            const data = await response.json();
            const sortedData = data.sort((a, b) => new Date(b.agriStartYear) - new Date(a.agriStartYear)); 
            
            const formattedEntries = formatClusterData(sortedData);
            setClusterEntries(formattedEntries);
            
            // ⭐ Set initial form state to the latest active limit (assuming the first element is the latest)
            const latestActive = sortedData.find(item => item.inActive === true); 
            if (latestActive) {
                setMinClusterArea(String(latestActive.clusterMin).replace(/\.0$/, ''));
                setMaxClusterArea(String(latestActive.clusterMax).replace(/\.0$/, ''));
                setMeanClusterArea(String(latestActive.tsoLimit).replace(/\.0$/, ''));
            } else if (formattedEntries.length > 0) {
                 // Fallback to the very latest entry if 'inActive' field isn't reliably true for the current limit
                setMinClusterArea(String(formattedEntries[0].clusterMin).replace(/\.0$/, ''));
                setMaxClusterArea(String(formattedEntries[0].clusterMax).replace(/\.0$/, ''));
                setMeanClusterArea(String(formattedEntries[0].tsoLimit).replace(/\.0$/, ''));
            }

        } catch (err) {
            console.error("Error fetching cluster data:", err);
        }
    };
    // ----------------------------------------

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setKeyplotError('');
        setClusterError('');
    };

    const requestConfirmation = (formType) => {
        setRemark(''); 
        setPendingAction(formType);
        setDialogOpen(true);
    };

    const handleKeyplotSizeChange = (e) => {
        const value = e.target.value.slice(0, 4);
        setKeyplotSize(value);
        if (keyplotError) { setKeyplotError(''); }
    };
    
    // ⭐ UPDATED: Input handler for Cluster fields - Enforces max 4 digits
    const handleClusterChange = (e, setState) => {
        let value = e.target.value;
        
        // 1. Enforce max length of 4 (as per your keyplot limit/max enter limit request)
        value = value.slice(0, 4); 
        
        // 2. Remove leading zeros (unless the value is "0")
        if (value.length > 1 && value.startsWith('0')) {
            value = value.substring(1);
        }
        
        setState(value);
        // Clear general error state on change
        setClusterError('');
    };

    const confirmSubmission = async (remarkText) => {
        const token = localStorage.getItem('token');

        try {
            let payload = {};
            let url = '';
            let successMessage = '';
            
            if (pendingAction === 'keyplot') {
                if (!keyplotSize) return;
                payload = {
                    keyplotsLimit: Number(keyplotSize),
                    addedBy: CURRENT_USER_ID,
                    remarks: remarkText || "No remarks provided",
                };
                url = `${API_BASE_URL}/btr-service/admin-manage/save-keyplot-limits`;
                successMessage = "Keyplot limit saved successfully!";
                
            } 
            else if (pendingAction === 'cluster') {
                if (!minClusterArea || !maxClusterArea || !meanClusterArea) return;
                
                if (!validateClusterForm()) {
                     throw new Error("Cluster validation failed. Check Min, TSO, and Max values.");
                }

                payload = {
                    clusterMin: Number(minClusterArea),
                    clusterMax: Number(maxClusterArea),
                    tsoLimit: Number(meanClusterArea),
                    addedBy: CURRENT_USER_ID,
                    remarks: remarkText || "No remarks provided",
                };
                url = `${API_BASE_URL}/btr-service/admin-manage/save-cluster-limits`;
                successMessage = "Cluster limits saved successfully!";
            } else {
                setDialogOpen(false);
                return;
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.text();
                let message = "Failed to save limits.";
                try {
                    const parsed = JSON.parse(errorData);
                    if (parsed.response) message = parsed.response; 
                    else if (parsed.message) message = parsed.message;
                    
                } catch {
                    message = errorData;
                }
                throw new Error(message);
            }

           
            
            if (pendingAction === 'keyplot') {
                await fetchKeyplotLimits(); 
                setKeyplotSize('');
            }
            if (pendingAction === 'cluster') {
                // Refresh list and re-populate with newly saved values
                await fetchClusterLimits(); 
                // Clear inputs after save, as they will be re-populated by fetchClusterLimits
                setMinClusterArea('');
                setMaxClusterArea('');
                setMeanClusterArea('');
            }

            setRemark('');
            setSnackbarOpen(true);

        } catch (err) {
            console.error(`❌ Error saving ${pendingAction} limits:`, err);
            setErrorMessage(err.message || "Something went wrong!");
            setErrorSnackbarOpen(true);
        }

        setDialogOpen(false);
    };

    // Cluster form validation logic (Min < TSO < Max)
    const validateClusterForm = () => {
        setClusterError('');
        const min = Number(minClusterArea);
        const max = Number(maxClusterArea);
        const tso = Number(meanClusterArea);

        // Basic presence and positive checks
        if (!min || !max || !tso || min <= 0 || max <= 0 || tso <= 0) {
            setClusterError("All cluster area fields must be valid positive numbers.");
            return false;
        }

        // 1. Min must be strictly less than TSO (Minimum must be greater value in TSO) -> Min < TSO
        if (min >= tso) {
            setClusterError("Minimum Cluster Area must be strictly less than TSO Approval Area (Min < TSO).");
            return false;
        }
        
        // 2. TSO must be strictly less than Max (TSO must be greater than Maximum) -> TSO < Max
        if (tso >= max) {
            setClusterError("TSO Approval Area must be strictly less than Maximum Cluster Area (TSO < Max).");
            return false;
        }
        
        // Overall check (min < TSO < max)
        if (!(min < tso && tso < max)) {
            setClusterError("The cluster limits must follow the correct order: Min < TSO < Max.");
            return false;
        }

        return true;
    };


    return (
        <Grid container spacing={3}>
            <Breadcrumb />
            <Grid item xs={12}>
                <Typography variant="h3" sx={{ mb: 2 }}>
                    Zone Settings
                </Typography>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    centered
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ mb: 3 }}
                >
                    <Tab label="Key Plot Limit" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                    <Tab label="Cluster Area Limit" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} />
                </Tabs>

                {/* --- Key Plot Limit Tab (unchanged) --- */}
                {tabValue === 0 && (
                    <Paper sx={{ p: 4 }} elevation={2}>
                        <Typography variant="h5" fontWeight="bold"> Keyplot Limit Settings </Typography>
                        <hr />
                        <Typography variant="h6" color="primary" gutterBottom>
                            Keyplot limit size needed:
                        </Typography>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const value = keyplotSize.trim();
                                setKeyplotError('');
                                
                                // ... Existing Validations ...
                                if (value.includes('---')) { setKeyplotError("Keyplot Limit should not contain '---'"); return; }
                                if (value.startsWith('0') && value.length > 1) { setKeyplotError("Keyplot Limit should not start with 0"); return; }
                                if (Number(value) < 10) { setKeyplotError("Minimum Keyplot Limit must be 10 or above"); return; }

                                requestConfirmation('keyplot');
                            }}
                            style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            <Box sx={{ flex: 1 }}>
                                <label>Keyplot Count Limit (Max 4 Digits)</label>
                                <input
                                    type="number"
                                    value={keyplotSize}
                                    inputMode="numeric"
                                    onChange={handleKeyplotSizeChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        border: `1px solid ${keyplotError ? 'red' : '#ccc'}`,
                                        marginTop: '0.5rem'
                                    }}
                                />
                                {keyplotError && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                        {keyplotError}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <label>Agriculture  Year</label>
                                <Box sx={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    AY {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                                </Box>
                            </Box>
                            <Box sx={{ alignSelf: 'flex-end' }}>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#05307a',
                                        color: 'white',
                                        borderRadius: '4px',
                                        border: 'none'
                                    }}
                                >
                                    Submit
                                </button>
                            </Box>
                        </form>

                        {/* Keyplot History Table (unchanged) */}
                        {entries.length > 0 && (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '2rem' }}>
                                <thead style={{ backgroundColor: '#e0f2fe' }}>
                                    <tr>
                                        <th style={thStyle}>Sl. No.</th>
                                        <th style={thStyle}>Keyplot Size</th>
                                        <th style={thStyle}>Agricultural Year (Start - End)</th>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Remark</th>
                                        <th style={thStyle}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, index) => (
                                        <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>{entry.keyplotSize}</td>
                                            <td style={tdStyle}>{entry.academicYear}</td>
                                            <td style={tdStyle}>{entry.date}</td>
                                            <td style={tdStyle}>{entry.remark}</td>
                                            <td style={tdStyle}>{entry.inActive}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Paper>
                )}


                {/* --- Cluster Area Limit Tab (Input handlers applied & History added) --- */}
                {tabValue === 1 && (
                    <Paper sx={{ p: 4 }} elevation={2}>
                        <Typography variant="h5" fontWeight="bold">
                            Cluster Forming Area Settings
                        </Typography>
                        <hr style={{marginBottom: '2rem'}}/>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (validateClusterForm()) {
                                    requestConfirmation('cluster');
                                }
                            }}
                            style={{ marginBottom: '2rem' }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" color="primary" gutterBottom>
                                            Define Cluster Limits (Max 4 Digits & Min &lt; TSO &lt; Max)
                                        </Typography>
                                        
                                        <Grid container spacing={2} display="flex" justifyContent="center">
                                            <Grid item xs={12} sm={4}>
                                                <label>Minimum Cluster Area in cents *</label>
                                                <input
                                                    type="number"
                                                    value={minClusterArea}
                                                    onChange={(e) => handleClusterChange(e, setMinClusterArea)} 
                                                    required
                                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${clusterError && minClusterArea >= Number(meanClusterArea) ? 'red' : '#ccc'}`, marginTop: '1rem' }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <label>TSO Approval Cluster Area in cents *</label>
                                                <input
                                                    type="number"
                                                    value={meanClusterArea}
                                                    onChange={(e) => handleClusterChange(e, setMeanClusterArea)}
                                                    required
                                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${clusterError && (Number(meanClusterArea) <= Number(minClusterArea) || Number(meanClusterArea) >= Number(maxClusterArea)) ? 'red' : '#ccc'}`, marginTop: '1rem' }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={4}>
                                                <label>Maximum Cluster Area in cents *</label>
                                                <input
                                                    type="number"
                                                    value={maxClusterArea}
                                                    onChange={(e) => handleClusterChange(e, setMaxClusterArea)}
                                                    required
                                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: `1px solid ${clusterError && maxClusterArea <= Number(meanClusterArea) ? 'red' : '#ccc'}`, marginTop: '1rem' }}
                                                />
                                            </Grid>
                                        </Grid>
                                        {/* Cluster Error Display */}
                                        {clusterError && (
                                            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                                **{clusterError}**
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '10px 30px',
                                                backgroundColor: '#05307a',
                                                color: 'white',
                                                borderRadius: '4px',
                                                border: 'none'
                                            }}
                                        >
                                            Submit
                                        </button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>

                        {/* ⭐ Cluster History Table */}
                        {clusterEntries.length > 0 && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Cluster Limit History</Typography>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#e0f2fe' }}>
                                        <tr>
                                            <th style={thStyle}>Sl. No.</th>
                                            <th style={thStyle}>Min Area (cents)</th>
                                            <th style={thStyle}>TSO Area (cents)</th>
                                            <th style={thStyle}>Max Area (cents)</th>
                                            <th style={thStyle}>Agricultural Year</th>
                                            <th style={thStyle}>Date Set</th>
                                            <th style={thStyle}>Remark</th>
                                            <th style={thStyle}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clusterEntries.map((entry, index) => (
                                            <tr key={index} style={{ backgroundColor: index % 2 ? '#f8fafc' : 'white' }}>
                                                <td style={tdStyle}>{index + 1}</td>
                                                <td style={tdStyle}>{entry.clusterMin}</td>
                                                <td style={tdStyle}>{entry.tsoLimit}</td>
                                                <td style={tdStyle}>{entry.clusterMax}</td>
                                                <td style={tdStyle}>{entry.academicYear}</td>
                                                <td style={tdStyle}>{entry.date}</td>
                                                <td style={tdStyle}>{entry.remark}</td>
                                                <td style={{...tdStyle, fontWeight: entry.inActive === 'Active' ? 'bold' : 'normal' }}>{entry.inActive}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Box>
                        )}
                         {clusterEntries.length === 0 && (
                            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                                No cluster limit history available yet.
                            </Typography>
                        )}
                    </Paper>
                )}

                {/* --- Confirmation Dialog (unchanged) --- */}
                <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ color: "#b71c1c", fontWeight: "bold" }}>
                        ⚠️ Important Confirmation
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText sx={{ mb: 2, color: "#374151" }}>
                            You are about to modify a **critical {pendingAction === 'keyplot' ? 'Keyplot' : 'Cluster Area'} Setting**.
                            This change may affect system-wide limits.
                            Please double-check the entered values and provide a remark explaining the reason for this update.
                            
                            {/* Display the value(s) being confirmed */}
                            {pendingAction === 'keyplot' && (
                                <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    **New Keyplot Limit:** {keyplotSize}
                                </Box>
                            )}
                             {pendingAction === 'cluster' && (
                                <Box sx={{ mt: 1, p: 1, border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                    **Min Cluster:** {minClusterArea} cents, **TSO Limit:** {meanClusterArea} cents, **Max Cluster:** {maxClusterArea} cents
                                </Box>
                            )}
                        </DialogContentText>

                        {/* Remark input field */}
                        <Box sx={{ mt: 2 }}>
                            <label style={{ fontWeight: "bold" }}>Remark (Required)</label>
                            <textarea
                                rows="3"
                                value={remark || ""}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter reason for this change (required)"
                                required
                                aria-required="true"
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: `1px solid ${remark.trim() ? '#ccc' : '#b71c1c'}`,
                                    resize: "none",
                                    marginTop: "6px",
                                }}
                            />
                            {!remark.trim() && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                    A remark is required to log this change.
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => {
                                setRemark('');
                                setDialogOpen(false);
                            }}
                            sx={{ color: "#555", borderColor: "#ccc" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!remark.trim()) return;
                                confirmSubmission(remark);
                            }}
                            disabled={!remark.trim()}
                            variant="contained"
                            sx={{
                                backgroundColor: "#b71c1c",
                                "&:hover": { backgroundColor: "#d32f2f" },
                            }}
                        >
                            Yes, Confirm & Save
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* --- Snackbars (unchanged) --- */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="success" sx={{ width: '100%' }}>
                        Entry submitted successfully!
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={errorSnackbarOpen}
                    autoHideDuration={5000}
                    onClose={() => setErrorSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity="error" sx={{ width: '100%' }}>
                        **Error:** {errorMessage}
                    </Alert>
                </Snackbar>
            </Grid>
        </Grid>
    );
};

const thStyle = {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    textAlign: 'left',
};

const tdStyle = {
    padding: '10px',
    borderBottom: '1px solid #eee',
};

export default ZoneSettings;