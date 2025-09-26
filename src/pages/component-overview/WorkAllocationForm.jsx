import React, { useState ,useEffect} from 'react';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import Breadcrumb from 'routes/Breadcrumb';
import MainCard from 'components/MainCard';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Custom styles for text fields and tabs
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.75, 1),
    fontSize: theme.typography.pxToRem(14),
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  marginBottom: theme.spacing(1.5),
}));

// NEW: Styled components for better table borders
const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: 'collapse',
  width: '100%',
  '& th, & td': {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(1),
  },
  '& thead th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.grey[700],
    textAlign: 'center',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  padding: theme.spacing(1),
  fontSize: theme.typography.pxToRem(12),
}));


function WorkAllocationForm() {
  const [district, setDistrict] = useState('');
  const [activeTab, setActiveTab] = useState('tab1');
  const [areaDetailsRows, setAreaDetailsRows] = useState([{}]);
  const [forestDetailsRows, setForestDetailsRows] = useState([{}]);
  const [otherDetailsRows, setOtherDetailsRows] = useState([{}]);
  const [result, setResult] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const BASE_URL = mainapi.BASE_URL;

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

  const handleRemoveRow = (index) => {
    if (activeTab === 'tab1') {
      // Create a new array without the element at the specified index
      const newRows = areaDetailsRows.filter((_, i) => i !== index);
      setAreaDetailsRows(newRows);
    } else if (activeTab === 'tab2') {
      const newRows = forestDetailsRows.filter((_, i) => i !== index);
      setForestDetailsRows(newRows);
    } else if (activeTab === 'tab3') {
      const newRows = otherDetailsRows.filter((_, i) => i !== index);
      setOtherDetailsRows(newRows);
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user_id = authservice.userid();
        const zone_id = localStorage.getItem('activeZone');
        console.log(token," ",user_id)
        const response = await fetch(`${BASE_URL}/btr-service/btr-api/zone-details/${zone_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        console.log('data', result.payload);
        setResult(result.payload);
        setData(result.payload.data);
        console.log("re    ",result.payload.district)
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderAreaDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2}>Block</StyledTableCell>
          <StyledTableCell rowSpan={2}>Panchayat / Municipality / Corporation Zone</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Area as per village records (in cents)</StyledTableCell>
          <StyledTableCell rowSpan={2}>Action</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Wet in Cents</StyledTableCell>
          <StyledTableCell align="center">Dry in cents</StyledTableCell>
          <StyledTableCell align="center">Total in cents</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><FormInput name={`block[${index}]`} size="small" placeholder="Enter Block" value={row.blocks ? row.blocks.join(', ') : 'N/A'}/></StyledTableCell>
            <StyledTableCell><FormInput name={`panchayat[${index}]`} size="small" placeholder="Enter Panchayat" value={row.p_name} /></StyledTableCell>
            <StyledTableCell><FormInput name={`area_wet[${index}]`} size="small" placeholder="Wet" value={row.Wet_area || 0}/></StyledTableCell>
            <StyledTableCell><FormInput name={`area_dry[${index}]`} size="small" placeholder="Dry" value={row.Dry_area || 0}/></StyledTableCell>
            <StyledTableCell><FormInput name={`area_total[${index}]`} size="small" placeholder="Total" value={row.Total_area || 0} /></StyledTableCell>
            <StyledTableCell>
              <IconButton color="error" aria-label="remove row" onClick={() => handleRemoveRow(index)}>
                <DeleteIcon />
              </IconButton>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  const renderForestDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell align="center" colSpan={3}>Forest Area as per village records (in cents)</StyledTableCell>
          <StyledTableCell align="center" rowSpan={2}>Area under plantation (in cents)</StyledTableCell>
          <StyledTableCell align="center" colSpan={2}>Forest Area excluded from Village records if any (in cents)</StyledTableCell>
          <StyledTableCell align="center" rowSpan={2}>Kayal excluded from EARAS Survey (in cents)</StyledTableCell>
          <StyledTableCell rowSpan={2}>Action</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">A </StyledTableCell>
          <StyledTableCell align="center">B </StyledTableCell>
          <StyledTableCell align="center">C </StyledTableCell>
          <StyledTableCell align="center">Under Cultivation </StyledTableCell>
          <StyledTableCell align="center">Not Under Cultivation </StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {forestDetailsRows.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><FormInput name={`forest_a[${index}]`} size="small" placeholder="A" /></StyledTableCell>
            <StyledTableCell><FormInput name={`forest_b[${index}]`} size="small" placeholder="B" /></StyledTableCell>
            <StyledTableCell><FormInput name={`forest_c[${index}]`} size="small" placeholder="C" /></StyledTableCell>
            <StyledTableCell><FormInput name={`area_under[${index}]`} size="small" placeholder="0.0" /></StyledTableCell>
            <StyledTableCell><FormInput name={`plantation_under[${index}]`} size="small" placeholder="Under" /></StyledTableCell>
            <StyledTableCell><FormInput name={`plantation_not_under[${index}]`} size="small" placeholder="Not Under" /></StyledTableCell>
            <StyledTableCell><FormInput name={`kayal_excluded[${index}]`} size="small" /></StyledTableCell>
            <StyledTableCell>
              <IconButton color="error" aria-label="remove row" onClick={() => handleRemoveRow(index)}>
                <DeleteIcon />
              </IconButton>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  const renderOtherDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell align="center" colSpan={3}>Others excluded from EARAS Survey (in cents)</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>No. of Plots for Estimation purpose</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Total Area for Estimation Purpose (in cents)</StyledTableCell>
          <StyledTableCell align="left" rowSpan={2}>Remarks </StyledTableCell>
          <StyledTableCell rowSpan={2}>Action</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Wet (12)</StyledTableCell>
          <StyledTableCell align="center">Dry (13)</StyledTableCell>
          <StyledTableCell align="center">Total (14)</StyledTableCell>
          <StyledTableCell align="center">Wet (15)</StyledTableCell>
          <StyledTableCell align="center">Dry (16)</StyledTableCell>
          <StyledTableCell align="center">Total (17)</StyledTableCell>
          <StyledTableCell align="center">Wet (18)</StyledTableCell>
          <StyledTableCell align="center">Dry (20)</StyledTableCell>
          <StyledTableCell align="center">Total (19)</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {otherDetailsRows.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><FormInput name={`others_dry_13[${index}]`} size="small" placeholder="Dry" /></StyledTableCell>
            <StyledTableCell><FormInput name={`others_wet_14[${index}]`} size="small" placeholder="Wet" /></StyledTableCell>
            <StyledTableCell><FormInput name={`others_total[${index}]`} size="small" placeholder="Total" /></StyledTableCell>
            <StyledTableCell><FormInput name={`plots_dry_16[${index}]`} size="small" placeholder="Dry" /></StyledTableCell>
            <StyledTableCell><FormInput name={`plots_wet_17[${index}]`} size="small" placeholder="Wet" /></StyledTableCell>
            <StyledTableCell><FormInput name={`plots_total[${index}]`} size="small" placeholder="Total" /></StyledTableCell>
            <StyledTableCell><FormInput name={`total_area_wet_19[${index}]`} size="small" placeholder="Wet" /></StyledTableCell>
            <StyledTableCell><FormInput name={`total_area_dry_21[${index}]`} size="small" placeholder="Dry" /></StyledTableCell>
            <StyledTableCell><FormInput name={`total_area_total_20[${index}]`} size="small" placeholder="Total" /></StyledTableCell>
            <StyledTableCell><FormInput name={`remarks[${index}]`} size="small" placeholder="Enter Remarks" /></StyledTableCell>
            <StyledTableCell>
              <IconButton color="error" aria-label="remove row" onClick={() => handleRemoveRow(index)}>
                <DeleteIcon />
              </IconButton>
            </StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  if (loading) {
    return <LoadingScreen message="Fetching work allocation details..." />;
  }
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <DotLottieReact
            style={{ width: '50rem', maxWidth: '100%' }}
            src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
            loop
            autoplay
          />
        </Box>
        <Typography variant="h5" gutterBottom>
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {error} Please try refreshing the page.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            WORK ALLOCATION STATEMENT
          </Typography>
          <MainCard sx={{marginBottom:'1rem'}}>
            <Box className="bar-container">
              <Paper className="bar-paper" sx={{ p: 2 }}>
                {result && (
                  <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        District:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.district}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        Taluk:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.taluk}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        Zone:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.zone_name}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Box>
          </MainCard>
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