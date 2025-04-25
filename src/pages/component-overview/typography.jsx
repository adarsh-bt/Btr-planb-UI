// material-ui
import React, { useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import UniqueVisitorCard from 'pages/dashboard/UniqueVisitorCard';
import OrderTable from 'pages/dashboard/OrdersTable';
// project import
import MainCard from 'components/MainCard';
import { Container, TextField, Button, Grid, Tabs, Tab, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// ==============================|| COMPONENTS - TYPOGRAPHY ||============================== //



function WorkAllocationStatement() {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={12}>
                    <Stack spacing={3}>
                        <MainCard title="Work Allocation Statement">
                            <Typography variant="h4" align="center" sx={{mb:3}}>Work Allocation Report</Typography>
                            <form>
                                {/* First Row: District, Taluk, Zone */}
                                <Grid container spacing={3} sx={{ mb: 3 }}>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="District" variant="outlined" fullWidth required />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Taluk" variant="outlined" fullWidth required />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField label="Zone" variant="outlined" fullWidth required />
                                    </Grid>
                                </Grid>

                                {/* Tab Navigation for Panchayats */}
                                <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
                                    <Tab label="Area as per village records (in acres)" />
                                    <Tab label="Forest Area" />
                                </Tabs>

                                <Box sx={{ mt: 3 }}>
                                    {/* Area as per village records Tabs Content */}
                                    {tabIndex === 0 && (
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650 }} aria-label="Area records table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Panchayat</TableCell>
                                                        <TableCell>Wet</TableCell>
                                                        <TableCell>Dry</TableCell>
                                                        <TableCell>Total</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {['Panchayat 1', 'Panchayat 2', 'Panchayat 3'].map((panchayat, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{panchayat}</TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell><b> Zone Total</b></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}

                                    {/* Forest Area Tabs Content */}
                                    {tabIndex === 1 && (
                                        <TableContainer component={Paper}>
                                            <Table sx={{ minWidth: 650 }} aria-label="Forest area table">
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
                                                    {['Panchayat 1', 'Panchayat 2', 'Panchayat 3'].map((panchayat, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{panchayat}</TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                            <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        </TableRow>
                                                    ))}
                                                    <TableRow>
                                                        <TableCell><b> Zone Total</b></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
                                                        <TableCell><TextField type="number" fullWidth required /></TableCell>
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

                {/* Uncomment and adjust as needed for additional components */}
                {/* <Grid item xs={12} lg={6}>
                    <Stack spacing={3}>
                        <MainCard title="Alignment">
                            <MainCard sx={{ mt: 2 }} content={false}>
                                <OrderTable />
                            </MainCard>
                        </MainCard>
                    </Stack>
                </Grid> */}
            </Grid>
        </Container>
    );
}

export default WorkAllocationStatement;

