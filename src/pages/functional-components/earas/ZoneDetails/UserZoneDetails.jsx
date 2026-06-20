import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import '../earascss/zone_deta.css';
import authservice from 'pages/authentication/services/authservice';
import { Link } from 'react-router-dom';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import mainapi from 'api/mainapi';

function UserZoneDetails({zoneId}) {
  const BTR_URL = mainapi.BTR_API
  const theme = useTheme();
  const [data, setData] = useState([]); // State to store API data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null);
  const [district, setDistrict] = useState(null);
  const [taluk, setTaluk] = useState(null);
  const [localtype, setLocalType] = useState(null);
  const [zone, setZone] = useState(null);
  const [result, setResult] = useState(null);
  const [zoneName, setZoneName] = useState('')

     const BASE_URL = mainapi.BASE_URL;

  const [resolvedZoneId, setResolvedZoneId] = useState(() => {
  const role = authservice.getrole(); // Get the role
  return role === 'Field Data Collector'
    ? authservice.getzone()  // For Field Data Collector
    : zoneId;                         // For Admin or other roles
});


useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user_id = authservice.userid();
      
      const response = await fetch(`${BASE_URL}/btr-service/btr-api/zone-details/${resolvedZoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json(); // Always parse response body
console.log('API response:', result); // Log the entire response for debugging
      if (!response.ok) {
        // Handle specific case: "No value present"
        if (result?.response === "No value present") {
          setError("No zones are currently assigned to you.");
        } else {
          throw new Error(result?.message || 'Failed to fetch data');
        }
      } else {
      
        setResult(result.payload);
        setZoneName(result.payload.zone_name)
        setData(result.payload.data);
      }
    } catch (error) {
      setError(error.message+". Please try refreshing the page." || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


 if (loading) {
  return <LoadingScreen message="Fetching zone details..." />;
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
        {error} 
      </Typography>
      <Button variant="contained" color="error" onClick={() => window.location.reload()}>
        Retry
      </Button>
    </Box>
  );
}


  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>
        <Grid container sx={{ marginBottom: 2 }} alignItems="center">
          <Grid item xs={6}>
            <Typography variant="h3" sx={{ marginBottom: 2 }}>
              Zone Details : {zoneName}
            </Typography>
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
                   {result.localbodyType}:
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                     {result.local_name}
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
                 <Grid item xs={6} sm={3} >
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
                    Sl.No
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                    Local Body Name
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                    Village Name
                  
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                    Block Code
                  
                  </TableCell>
                  <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                     Number of Plots
                  </TableCell>
                  <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                   Area in cents
                  </TableCell>
                </TableRow>

                {/* Sub-header Row */}
                <TableRow>
              
                  {/* Plots Sub-columns */}
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet Plots</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry Plots</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total Plots</TableCell>

                  {/* Area Sub-columns */}
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet Area</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry Area</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total Area</TableCell>
                </TableRow>
              </TableHead>

            <TableBody>
              {/* Loop over the fetched data */}
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.p_name} {row.localbodytype}</TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                      {row.villages ? row.villages.map(village => village.charAt(0).toUpperCase() + village.slice(1).toLowerCase()).join(', ') : 'N/A'}

                      </TableCell>
                    <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.blocks ? row.blocks.join(', ') : 'N/A'}
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
                   <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Wet_area || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Dry_area || 0}
                  </TableCell>
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.Total_area || 0}
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

export default UserZoneDetails;
