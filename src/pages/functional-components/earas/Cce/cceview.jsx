import {React , useState ,useEffect}from 'react';


import { 
  useTheme, 
  Grid, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import { keyframes } from '@mui/system';

import { Link } from 'react-router-dom';

import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';



const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// --- 2. Main Component ---
function CceView() {
  const theme = useTheme();
  
  // State for data, loading, and handling "no data" logic
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(true);
const FORM_URL = mainapi.FORM_API;
  // --- 3. API Call ---
useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // A. Get Token and Zone ID
        const token = localStorage.getItem('token');
        const zoneid = authservice.getzone();

        if (!zoneid) {
          console.warn("No Zone ID found in authservice");
          setPlotData([]);
          setLoading(false);
          return;
        }

        // B. Fetch Data
        const response = await fetch(`${FORM_URL}/earas-form1-entry/cce-crop-details/fetch-cce-crops?zoneId=${zoneid}`, {
          method: 'GET', // Assuming GET based on query params, change to POST if required
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // C. Parse Response
        if (response.ok) {
          const data = await response.json();
         
          // Check if payload exists and has data
          if (data && data.payload && Array.isArray(data.payload)) {
            setPlotData(data.payload);
          } else {
            setPlotData([]); 
          }
        } else {
          // If response is not 200 OK
          console.error("API Error:", response.statusText);
          setPlotData([]); 
        }

      } catch (error) {
        console.error("Fetch error:", error);
        setPlotData([]); // On error, show empty state instead of crashing
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 4. Render Logic ---

  return (
    <Grid container spacing={3}>
      {/* <Breadcrumb/> */}
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Crop Cutting Experiment View
        </Typography>

        {/* --- Main Content Area --- */}
        {/* <MainCard title=""> */} 
        <Paper sx={{ padding: 3, minHeight: '400px' }}>
          
          {/* A. Loading State */}
          {loading ? (
             <Box display="flex" justifyContent="center" alignItems="center" height="300px">
               <CircularProgress />
             </Box>
          ) : plotData.length > 0 ? (
            
            /* B. Data Table State */
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="cce table">
                <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Sl.NO</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Crop Name</TableCell>
                    {/* <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Source Type</TableCell> */}
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Number of CCE</TableCell>
                    {/* <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Cluster ID</TableCell> */}
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Agri Year</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plotData.map((row,key) => (
                    <TableRow
                      key={row.cceAvailablePlotId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {key + 1}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {row.cropName}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.noOfCce} 
                          color="info" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      {/* <TableCell>{row.clusterId}</TableCell> */}
                      <TableCell>
                        {/* Format dates nicely: 2025-07-01 -> 2025/2026 */}
                        {/* {new Date(row.agriStartYear).getFullYear()} - {new Date(row.agriEndYear).getFullYear()} */}
                        2025 - 2026
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.isSelected ? "Selected" : "Available"} 
                          color={row.isSelected ? "success" : "default"} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          ) : (

            /* C. Empty State with Reflection Effect (Requested UI) */
            <Grid 
              container 
              direction="column" 
              alignItems="center" 
              justifyContent="center"
              sx={{ height: '300px' }}
            >
              <Grid item>
                 {/* Icon */}
                 <Box 
                   component="img"
                   src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png"
                   alt="No Data"
                   sx={{ width: 100, height: 100, marginBottom: 2, opacity: 0.6, filter: 'grayscale(100%)' }}
                 />
              </Grid>
              <Grid item>
                <Typography 
                  variant="h4" 
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    background: `linear-gradient(
                      to right, 
                      ${theme.palette.grey[400]} 20%, 
                      ${theme.palette.primary.main} 40%, 
                      ${theme.palette.primary.main} 60%, 
                      ${theme.palette.grey[400]} 80%
                    )`,
                    backgroundSize: '200% auto',
                    color: '#000',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${shimmer} 3s linear infinite`,
                  }}
                >
                  No CCE Plots Found for this Zone
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" sx={{ mt: 1 }}>
                  Please select a different zone or add new crop data.
                </Typography>
              </Grid>
            </Grid>

          )}
        </Paper>
        {/* </MainCard> */}
      </Grid>
    </Grid>
  );
}

export default CceView;