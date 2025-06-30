import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import './earascss/zone_deta.css';
import authservice from 'pages/authentication/services/authservice';
import { Link } from 'react-router-dom';
import mainapi from 'api/mainapi';

function ZoneDetails() {
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

  useEffect(() => {
    const fetchData = async () => {
  setLoading(true);
  try {
    const token   = localStorage.getItem('token');
    const user_id = authservice.userid();

    // ✅ Correct URL
    const res = await fetch(
      `${BTR_URL}/btr-service/btr-api/zone-details/${user_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!res.ok) {
      // Grab the raw text so you can see the HTML / error message
      const errorText = await res.text();
      console.error(`Server error ${res.status}:`, errorText);
      throw new Error(`Server responded ${res.status}`);
    }

    const { payload } = await res.json();   // <- will succeed only if JSON
    console.log("payload", payload);

    setResult(payload);
    setData(payload.data || []);
  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
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
        </Grid>
        <MainCard>
          <Box className="bar-container">
            <Paper className="bar-paper">
              <Grid container spacing={2}>

                 <Grid item xs={6} sm={3} className="bar-grid-item">
                  <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                    Zone:
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                    {result.zone_name}
                  </Typography>
                </Grid>

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

               

                <Grid item xs={6} sm={3}>
                  <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                    Local Body Type:
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                    {result.local_type}
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
                    LocalBody Name
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                    Village
                  </TableCell>
                  <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>
                    Block
                  </TableCell>
                  <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                    Area in cents
                  </TableCell>
                  <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>
                    Number of Plots
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
                  <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                      {row.villages ? row.villages.join(', ') : 'N/A'}
                      </TableCell>
                    <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>
                    {row.blocks ? row.blocks.join(', ') : 'N/A'}
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
