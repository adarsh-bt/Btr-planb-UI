// material-ui
import React, { useState, useEffect } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import UniqueVisitorCard from 'pages/dashboard/UniqueVisitorCard';
import OrderTable from 'pages/dashboard/OrdersTable';
// project import
import MainCard from 'components/MainCard';
import authservice from 'pages/authentication/services/authservice';
import { Container, TextField, Button, Grid, Tabs, Tab, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// ==============================|| COMPONENTS - TYPOGRAPHY ||============================== //



function WorkAllocationStatement() {
    const [tabIndex, setTabIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [inputData, setInputData] = useState([]); // For user-entered values

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const user_id = authservice.userid();
                const response = await fetch(`http://localhost:8082/btr-service/btr-api/zone-details/${user_id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch data");

                const result = await response.json();
                setResult(result.payload);
                setData(result.payload.data);

                // Initialize input state with default 0s for each entry
                const initialized = result.payload.data.map(item => ({
                    name: item.p_name,
                    wet: 0,
                    dry: 0,
                    total: 0,
                    forestA: 0,
                    forestB: 0,
                    forestC: 0,
                    forestTotal: 0
                }));
                setInputData(result.payload.data);
                console.log("innn", result.payload.data)
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleInputChange = (index, field, value) => {
        const updated = [...inputData];
        updated[index][field] = Number(value);
        if (tabIndex === 0) {
            updated[index].total = updated[index].wet + updated[index].dry;
        } else {
            updated[index].forestTotal = updated[index].forestA + updated[index].forestB + updated[index].forestC;
        }
        setInputData(updated);
    };

    const getZoneTotals = (field) =>
        inputData.reduce((sum, item) => sum + (item[field] || 0), 0);

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Container sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Stack spacing={3}>
                        <MainCard title="Work Allocation Statement">
                            <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                                Work Allocation Report
                            </Typography>

                            <form>
                                {/* Auto-filled Zone Info */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="District" variant="outlined" fullWidth value={result.district || ''} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Taluk" variant="outlined" fullWidth value={result.taluk || ''}  />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Zone" variant="outlined" fullWidth value={result.zone_name || ''}/>
                                    </Grid>
                                </Grid>

                                {/* Tabs */}
                                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                                    <Tab label="Area as per village records (in acres)" />
                                    <Tab label="Forest Area" />
                                </Tabs>

                                <Box sx={{ mt: 3 }}>
                                    {/* Area Table */}
                                    {tabIndex === 0 && (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Panchayat</TableCell>
                                                        <TableCell>Wet in Ac</TableCell>
                                                        <TableCell>Dry in Ac</TableCell>
                                                        <TableCell>Total in Ac</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {inputData.map((row, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{row.p_name}</TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.Wet_area}
                                                                    onChange={(e) => handleInputChange(index, 'wet', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.Dry_area}
                                                                    onChange={(e) => handleInputChange(index, 'dry', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.Total_area}
                                                                    disabled
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell><b>Zone Total</b></TableCell>
                                                        <TableCell><TextField fullWidth value={result.totalWetArea.toFixed(2)} disabled /></TableCell>
                                                        <TableCell><TextField fullWidth value={result.totalDryArea.toFixed(2)} disabled /></TableCell>
                                                        <TableCell><TextField fullWidth value={result.totalArea.toFixed(2)} disabled /></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    {/* Forest Area Table */}
                                    {tabIndex === 1 && (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Panchayat</TableCell>
                                                        <TableCell>A</TableCell>
                                                        <TableCell>B</TableCell>
                                                        <TableCell>C</TableCell>
                                                        <TableCell>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {inputData.map((row, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{row.name}</TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.forestA}
                                                                    onChange={(e) => handleInputChange(index, 'forestA', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.forestB}
                                                                    onChange={(e) => handleInputChange(index, 'forestB', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.forestC}
                                                                    onChange={(e) => handleInputChange(index, 'forestC', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    type="number"
                                                                    fullWidth
                                                                    value={row.forestTotal}
                                                                    disabled
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell><b>Zone Total</b></TableCell>
                                                        <TableCell><TextField fullWidth value={getZoneTotals('forestA')} disabled /></TableCell>
                                                        <TableCell><TextField fullWidth value={getZoneTotals('forestB')} disabled /></TableCell>
                                                        <TableCell><TextField fullWidth value={getZoneTotals('forestC')} disabled /></TableCell>
                                                        <TableCell><TextField fullWidth value={getZoneTotals('forestTotal')} disabled /></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>

                                {/* Submit Button */}
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                    <Button variant="contained" color="primary" type="submit">Submit</Button>
                                </Box>
                            </form>
                        </MainCard>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
}

export default WorkAllocationStatement;

