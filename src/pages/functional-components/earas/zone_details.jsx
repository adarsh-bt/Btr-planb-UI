import React, {useEffect,useState} from 'react';
import { Grid, Typography,Box,Paper,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import './earascss/zone_deta.css'
import authservice from 'pages/authentication/services/authservice';
import { Link } from 'react-router-dom';


const columns = [
  { name: 'SL. NO', selector: (row, index) => index + 1 },
  { name: 'Panchayth Names', selector: (row) => row.Panchayth_name || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Wet', selector: (row) => row.Wet_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Dry', selector: (row) => row.Dry_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Total', selector: (row) => row.Total_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
];


const rows = [
  {
    sl: 1,
    name: 'P1',
    village: 'Village A',
    block: 'Block 1',
    wetArea: 30,
    dryArea: 50,
    totalArea: 80,
    wetPlots: 10,
    dryPlots: 20,
    totalPlots: 30,
  },
  {
    sl: 2,
    name: 'P2',
    village: 'Village B',
    block: 'Block 2',
    wetArea: 40,
    dryArea: 60,
    totalArea: 100,
    wetPlots: 15,
    dryPlots: 25,
    totalPlots: 40,
  },
  // Add more rows as needed
];

const sampleData = [
  {
    villageName: 'Village A',
    bcode: 'Wet Code 1',
    resvno: 'Dry Code 1',
    resbdno: 'Total 1',
  },
  {
    villageName: 'Village B',
    bcode: 'Wet Code 2',
    resvno: 'Dry Code 2',
    resbdno: 'Total 2',
  },
  {
    villageName: 'Village C',
    bcode: 'Wet Code 3',
    resvno: 'Dry Code 3',
    resbdno: 'Total 3',
  },
];

function ZoneDetails() {

    const theme = useTheme();
    const [data, setData] = useState([]); // State to store API data
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null);
    const [district, setDistrict] = useState(null);
    const [taluk, setTaluk] = useState(null);
    const [localtype, setLocalType] = useState(null);
    const [zone, setZone] = useState(null);
    const [result,setResult] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
          try {
            const token = localStorage.getItem('token');
            
            const user_id = authservice.userid()
            const response = await fetch(`http://localhost:8082/btr-service/btr-api/keyplots/${user_id}`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                });
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            console.log("data",result.payload)
            setResult(result.payload);
            setData(result.payload.data); // Set the fetched data to state
          } catch (error) {
            setError(error.message); // Set error message if something goes wrong
          } finally {
            setLoading(false); // Set loading to false after the request completes
          }
        };
    
        fetchData();
      }, []);
    
      if (loading) {
        return <Typography>Loading...</Typography>; // Display loading message
      }
    
      if (error) {
        return <Typography color="error">Error: {error}</Typography>; // Display error message
      }

  return (
    <Grid container spacing={3}>
    <Breadcrumb></Breadcrumb>
    <Grid item xs={12}>
    <Grid container sx={{ marginBottom: 2 }} alignItems="center">
      <Grid item xs={6}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Zone Details
        </Typography>
      </Grid>
      <Grid item xs={6} container justifyContent="flex-end">
      <Link to="/schemes/earas/cluster/keyplots" style={{ textDecoration: 'none' }}>
        <Button variant="contained" sx={{background:'blue'}} endIcon={<SendIcon />}>
          Generate KeyPlots
        </Button>
        </Link>
      </Grid>
    </Grid>
      <MainCard>
        <Box className="bar-container">
          <Paper className="bar-paper">
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3} className="bar-grid-item">
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                  District:
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                  {result.district}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3} className="bar-grid-item">
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                  Taluk:
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                  {result.taluk}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3} className="bar-grid-item">
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                  LocalBody:
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                  {result.local_type}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                  Zone:
                </Typography>
                <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                  {result.zone_name}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </MainCard>

      <MainCard title="">
        <TableContainer component={Paper}>
          <Table sx={{ border: 1, borderColor: 'grey.300' }}>
            <TableHead>
              {/* Main Header Row */}
              <TableRow>
                <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                  SL
                </TableCell>
                <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                  Name
                </TableCell>
                <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                  Village
                </TableCell>
                <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                  Block
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                  Area
                </TableCell>
                <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                  Plots
                </TableCell>
              </TableRow>

              {/* Sub-header Row */}
              <TableRow>
                {/* Area Sub-columns */}
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet</TableCell>
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry</TableCell>
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total</TableCell>

                {/* Plots Sub-columns */}
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet</TableCell>
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry</TableCell>
                <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Loop over the fetched data */}
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.p_name}</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.village || 'N/A'}</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.block || 'N/A'}</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Wet_area || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Dry_area || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Total_area || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Wet_plot || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.dry_plot || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.t_plot || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
    </Grid>
    </Grid>
  );
}

export default ZoneDetails;