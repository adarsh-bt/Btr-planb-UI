import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

function WorkAllocationForm() {
  const [tabIndex, setTabIndex] = useState(0);
  const [district, setDistrict] = useState('');

  const [areaDetails, setAreaDetails] = useState([
    { block: '', panchayat: '', wet: '', dry: '', total: '' },
  ]);

  const [forestDetails, setForestDetails] = useState([
    { a: '', b: '', c: '', under: '', notUnder: '', excluded: '', kayal: '' },
  ]);

  const [otherDetails, setOtherDetails] = useState([
    {
      dry13: '',
      wet14: '',
      total15: '',
      plotsDry16: '',
      plotsWet17: '',
      plotsTotal18: '',
      totalDry19: '',
      total20: '',
      totalDry21: '',
      total22: '',
      remarks: '',
    },
  ]);

  const handleAddRow = () => {
    if (tabIndex === 0) {
      setAreaDetails([...areaDetails, { block: '', panchayat: '', wet: '', dry: '', total: '' }]);
    } else if (tabIndex === 1) {
      setForestDetails([
        ...forestDetails,
        { a: '', b: '', c: '', under: '', notUnder: '', excluded: '', kayal: '' },
      ]);
    } else if (tabIndex === 2) {
      setOtherDetails([
        ...otherDetails,
        {
          dry13: '',
          wet14: '',
          total15: '',
          plotsDry16: '',
          plotsWet17: '',
          plotsTotal18: '',
          totalDry19: '',
          total20: '',
          totalDry21: '',
          total22: '',
          remarks: '',
        },
      ]);
    }
  };

  const handleSubmit = () => {
    const data = {
      district,
      areaDetails,
      forestDetails,
      otherDetails,
    };
    console.log(JSON.stringify(data, null, 2));
    alert('Form data has been logged to the console.');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ bgcolor: '#fff', mt: 4, p: 4, borderRadius: 2, boxShadow: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>
          WORK ALLOCATION STATEMENT
        </Typography>

        <TextField
          label="District"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{ mb: 2 }}>
          <Tab label="Area Details" />
          <Tab label="Forest Details" />
          <Tab label="Other Details" />
        </Tabs>

        {/* --- Tab 1: Area Details --- */}
        {tabIndex === 0 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Block</TableCell>
                  <TableCell>Panchayat</TableCell>
                  <TableCell>Wet</TableCell>
                  <TableCell>Dry</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areaDetails.map((row, index) => (
                  <TableRow key={index}>
                    {['block', 'panchayat', 'wet', 'dry', 'total'].map((field) => (
                      <TableCell key={field}>
                        <TextField
                          value={row[field]}
                          onChange={(e) =>
                            setAreaDetails((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [field]: e.target.value } : r
                              )
                            )
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* --- Tab 2: Forest Details --- */}
        {tabIndex === 1 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>A</TableCell>
                  <TableCell>B</TableCell>
                  <TableCell>C</TableCell>
                  <TableCell>Under Cultivation</TableCell>
                  <TableCell>Not Under</TableCell>
                  <TableCell>Excluded</TableCell>
                  <TableCell>Kayal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {forestDetails.map((row, index) => (
                  <TableRow key={index}>
                    {['a', 'b', 'c', 'under', 'notUnder', 'excluded', 'kayal'].map((field) => (
                      <TableCell key={field}>
                        <TextField
                          value={row[field]}
                          onChange={(e) =>
                            setForestDetails((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [field]: e.target.value } : r
                              )
                            )
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* --- Tab 3: Other Details --- */}
        {tabIndex === 2 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Dry (13)</TableCell>
                  <TableCell>Wet (14)</TableCell>
                  <TableCell>Total (15)</TableCell>
                  <TableCell>Plots Dry (16)</TableCell>
                  <TableCell>Plots Wet (17)</TableCell>
                  <TableCell>Plots Total (18)</TableCell>
                  <TableCell>Total Dry (19)</TableCell>
                  <TableCell>Total (20)</TableCell>
                  <TableCell>Total Dry (21)</TableCell>
                  <TableCell>Total (22)</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {otherDetails.map((row, index) => (
                  <TableRow key={index}>
                    {Object.keys(row).map((field) => (
                      <TableCell key={field}>
                        <TextField
                          value={row[field]}
                          onChange={(e) =>
                            setOtherDetails((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [field]: e.target.value } : r
                              )
                            )
                          }
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={handleAddRow}>
            Add Row
          </Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default WorkAllocationForm;
