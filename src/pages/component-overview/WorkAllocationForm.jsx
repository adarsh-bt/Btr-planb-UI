import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { styled } from '@mui/system';
import { makeStyles } from '@mui/styles';
import Breadcrumb from 'routes/Breadcrumb';


// Custom styles using MUI's styled API
const FormHeader = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', // Initial columns for Tab 1
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0.5),
  fontWeight: 600,
  fontSize: theme.typography.pxToRem(12),
  color: theme.palette.grey[700],
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', // Adjust for larger screens if needed
  },
}));

const FormHeaderCell = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  wordWrap: 'break-word',
});

const FormInput = styled(TextField)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(12),
  width: '100%',
  boxSizing: 'border-box',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 0.15rem ${theme.palette.primary[200]}`,
  },
  '& .MuiInputBase-input': { // Adjust MUI input base styles
    padding: theme.spacing(0.75, 1), // Adjust padding inside the input
    fontSize: theme.typography.pxToRem(14), // Adjust input text size
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  color: theme.palette.grey[700],
  cursor: 'pointer',
  borderBottom: `2px solid transparent`,
  transition: 'border-color 0.15s ease-in-out, color 0.15s ease-in-out',
  '&:hover': {
    borderBottomColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  '&.Mui-selected': {
    borderBottomColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const TabContent = styled('div')({
  display: 'none',
  '&.active': {
    display: 'block',
  },
});

// Definition for StyledTabs
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  marginBottom: theme.spacing(1.5),
}));

function WorkAllocationForm() {
  const [district, setDistrict] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const [areaDetailsRows, setAreaDetailsRows] = useState([{}]);
  const [forestDetailsRows, setForestDetailsRows] = useState([{}]);
  const [otherDetailsRows, setOtherDetailsRows] = useState([{}]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddRow = () => {
    if (activeTab === 'tab1') {
      setAreaDetailsRows([...areaDetailsRows, {}]);
    } else if (activeTab === 'tab2') {
      setForestDetailsRows([...forestDetailsRows, {}]);
    } else if (activeTab === 'tab3') {
      setOtherDetailsRows([...otherDetailsRows, {}]);
    }
  };

  const handleSubmit = () => {
    const formData = {
      district,
      areaDetails: areaDetailsRows,
      forestDetails: forestDetailsRows,
      otherDetails: otherDetailsRows,
    };
    console.log(JSON.stringify(formData, null, 2));
    alert('Form data has been logged to the console. Check the console to see the data.');
    // In a real application, you would send this data to your server
  };

  const renderAreaDetailsTable = () => (
    <Table size="small">
      <TableHead sx={{ backgroundColor: 'grey.50' }}>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Block (1)</TableCell>
          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Panchayat / Municipality / Corporation Zone (2)</TableCell>
          <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Area as per village records (in cents)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Wet (3)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Dry (4)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total (5)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {areaDetailsRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell><FormInput name={`block[${index}]`} size="small" placeholder="Enter Block" /></TableCell>
            <TableCell><FormInput name={`panchayat[${index}]`} size="small" placeholder="Enter Panchayat" /></TableCell>
            <TableCell><FormInput name={`area_wet[${index}]`} size="small" placeholder="Wet" /></TableCell>
            <TableCell><FormInput name={`area_dry[${index}]`} size="small" placeholder="Dry" /></TableCell>
            <TableCell><FormInput name={`area_total[${index}]`} size="small" placeholder="Total" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderForestDetailsTable = () => (
    <Table size="small">
      <TableHead sx={{ backgroundColor: 'grey.50' }}>
        <TableRow>
          <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Forest Area as per village records (in cents)</TableCell>
          <TableCell align="center" colSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Area under plantation (in cents)</TableCell>
          <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Forest Area excluded from Village records if any (in cents) (11)</TableCell>
          <TableCell align="center" rowSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Kayal excluded from EARAS Survey (in cents) (12)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>A (6)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>B (7)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>C (8)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Under Cultivation (9)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Not Under Cultivation (10)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {forestDetailsRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell><FormInput name={`forest_a[${index}]`} size="small" placeholder="A" /></TableCell>
            <TableCell><FormInput name={`forest_b[${index}]`} size="small" placeholder="B" /></TableCell>
            <TableCell><FormInput name={`forest_c[${index}]`} size="small" placeholder="C" /></TableCell>
            <TableCell><FormInput name={`plantation_under[${index}]`} size="small" placeholder="Under" /></TableCell>
            <TableCell><FormInput name={`plantation_not_under[${index}]`} size="small" placeholder="Not Under" /></TableCell>
            <TableCell><FormInput name={`forest_excluded[${index}]`} size="small" /></TableCell>
            <TableCell><FormInput name={`kayal_excluded[${index}]`} size="small" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderOtherDetailsTable = () => (
    <Table size="small">
      <TableHead sx={{ backgroundColor: 'grey.50' }}>
        <TableRow>
          <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Others excluded from EARAS Survey (in cents)</TableCell>
          <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>No. of Plots for Estimation purpose</TableCell>
          <TableCell align="center" colSpan={3} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total Area for Estimation Purpose (in cents)</TableCell>
          <TableCell align="left" rowSpan={2} sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Remarks (23)</TableCell>
        </TableRow>
        <TableRow>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Dry (13)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Wet (14)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total (15)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Dry (16)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Wet (17)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total (18)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Dry (19)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total (20)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Dry (21)</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'grey.500' }}>Total (22)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {otherDetailsRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell><FormInput name={`others_dry_13[${index}]`} size="small" placeholder="Dry" /></TableCell>
            <TableCell><FormInput name={`others_wet_14[${index}]`} size="small" placeholder="Wet" /></TableCell>
            <TableCell><FormInput name={`others_total[${index}]`} size="small" placeholder="Total" /></TableCell>
            <TableCell><FormInput name={`plots_dry_16[${index}]`} size="small" placeholder="Dry" /></TableCell>
            <TableCell><FormInput name={`plots_wet_17[${index}]`} size="small" placeholder="Wet" /></TableCell>
            <TableCell><FormInput name={`plots_total[${index}]`} size="small" placeholder="Total" /></TableCell>
            <TableCell><FormInput name={`total_area_dry_19[${index}]`} size="small" placeholder="Dry" /></TableCell>
            <TableCell><FormInput name={`total_area_total_20[${index}]`} size="small" placeholder="Total" /></TableCell>
            <TableCell><FormInput name={`total_area_dry_21[${index}]`} size="small" placeholder="Dry" /></TableCell>
            <TableCell><FormInput name={`total_area_total_22[${index}]`} size="small" placeholder="Total" /></TableCell>
            <TableCell><FormInput name={`remarks[${index}]`} size="small" placeholder="Enter Remarks" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          WORK ALLOCATION STATEMENT
        </Typography>
        <TextField
          fullWidth
          label="District"
          id="district"
          name="district"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          margin="normal"
          size="small"
        />
        <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="work allocation tabs">
          <StyledTab label="Area Details" value="tab1" />
          <StyledTab label="Forest Details" value="tab2" />
          <StyledTab label="Other Details" value="tab3" />
        </StyledTabs>
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          {activeTab === 'tab1' && (
            <TabContent className={activeTab === 'tab1' ? 'active' : ''}>
              {renderAreaDetailsTable()}
            </TabContent>
          )}
          {activeTab === 'tab2' && (
            <TabContent className={activeTab === 'tab2' ? 'active' : ''}>
              {renderForestDetailsTable()}
            </TabContent>
          )}
          {activeTab === 'tab3' && (
            <TabContent className={activeTab === 'tab3' ? 'active' : ''}>
              {renderOtherDetailsTable()}
            </TabContent>
          )}
        </Box>
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleAddRow}>
              Add Row
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
    </Grid>
  );
}

export default WorkAllocationForm;
