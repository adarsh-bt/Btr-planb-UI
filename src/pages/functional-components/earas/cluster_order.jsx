import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip,
  Button
} from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import axios from 'axios';
import Breadcrumb from 'routes/Breadcrumb';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';


function ClusterSeatMap() {
  const BTR_URL = mainapi.BTR_API
  const [clusters, setClusters] = useState([]);
  const [summary, setSummary] = useState({ completed: 0, ongoing: 0, notStarted: 0 ,underreview:0});
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   const BASE_URL = mainapi.BTR_API;

  useEffect(() => {
      const token = localStorage.getItem('token');
       setLoading(true);
    axios.get(`${BASE_URL}/btr-service/cluster-api/user-cluster-summary/3bc4b01d-8d4b-4c2c-94ab-50bf4fdce924`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                })
      .then(res => {
        // Sets the clusters data from the payload
        setClusters(res.data.payload || []);
        console.log("cluster data  ",res.data.payload)
        // Updates the summary counts
        setSummary({
          completed: res.data.completed || 0,
          ongoing: res.data.ongoing || 0,
          notStarted: res.data.notStarted || 0,
          underreview: res.data.underreview || 0,
        });
        setLoading(false);
          setError(null);
      })
      .catch(err => {
        // Logs an error if data fetching fails and resets state
        console.error('Failed to fetch data:', err);
         setClusters([]);
  setSummary({ completed: 0, ongoing: 0, notStarted: 0, underreview: 0 });
  setError('Failed to load cluster data. Please try again later.');
  setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Determines the border color of the card based on cluster status
  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Completed': return '#4caf50'; // Green for completed
      case 'Ongoing':
      case 'On Going': return '#ffc107';   // Amber for ongoing statuses
      case 'Under Review': return '#ffc107';   // Amber for ongoing statuses
      default: return '#9e9e9e';         // Grey for not started
    }
  };

  // Determines the background color of the card based on cluster type (now solid colors)
  const getClusterTypeBackgroundColor = (type) => {
    switch (type.toLowerCase()) {
      case 'wet': return '#DCEDC8'; // A very light pale green
      case 'dry': return '#FFCDD2'; // A very light pale red
      default: return '#F5F5F5'; // Default light grey
    }
  };


  const navigate = useNavigate();

const handleClusterClick = (syNo, slNo) => {
  const encodedSyNo = encodeURIComponent(syNo);
  const encodedSlNo = encodeURIComponent(slNo);
  navigate(`/schemes/earas/cluster?No=${encodedSyNo}&slno=${encodedSlNo}`);
};


  // Animated border style for 'Ongoing' clusters to make them stand out
  const ongoingBorderAnimation = {
    animation: 'borderPulse 2s infinite',
    '@keyframes borderPulse': {
      '0%': {
        boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)',
      },
      '50%': {
        boxShadow: '0 0 12px 4px rgba(255,193,7, 0.8)',
      },
      '100%': {
        boxShadow: '0 0 0px 0px rgba(255,193,7, 0.5)',
      },
    },
  };

  // Define the available statuses for filtering
  const statuses = ['All', 'Completed', 'On Going', 'Not Started','Under Review'];

  return (

    
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
       {loading ? (
  <Grid item xs={12}>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="300px"
      width="100%"
    >
      <LoadingScreen message="Loading cluster data..." />
    </Box>
  </Grid>
) : error ? (
  <Grid item xs={12}>
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="300px"
      textAlign="center"
      width="100%"
    >
      <DotLottieReact
              style={{ width: '50rem', maxWidth: '100%' }}
              src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
              loop
              autoplay
            />
       <Typography variant="h5" gutterBottom>
      Oops! Something went wrong.
    </Typography>
    <Typography variant="body1" sx={{ mb: 2 }}>
      {error}
    </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()} // or re-fetch via useEffect trigger
      >
        Retry
      </Button>
    </Box>
  </Grid>
) : (
  <>
 <Box
  sx={{
    padding: { xs: 3, sm: 4 },
    maxWidth: 'lg',
    margin: 'auto',
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  }}
>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold', color: '#3f51b5' }}>
        Cluster Operations Map
      </Typography>

      {/* --- Status Filter Tabs --- */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          marginBottom: 6,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {statuses.map((status) => {
          let count = 0;
          // Calculate count for each status tab
          if (status === 'All') {
            count = summary.completed + summary.ongoing + summary.notStarted + summary.underreview;
          } else if (status === 'Completed') count = summary.completed;
          else if (status === 'On Going') count = summary.ongoing;
          else if (status === 'Not Started') count = summary.notStarted;
          else if (status === 'Under Review') count = summary.underreview;

          const isActive = selectedStatus === status; // Check if the current tab is active

          return (
            <Chip
              key={status}
              label={`${status}${status !== 'All' ? `: ${count}` : ''}`} // Display status and count (except for 'All')
              onClick={() => setSelectedStatus(status)} // Set selected status on click
              sx={{
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                padding: '6px 16px',
                borderRadius: '8px', // Slightly less rounded for a keycap look
                // 3D effect styling
                backgroundColor: isActive ? '#556B2F' : '#E0E0E0', // Darker green/grey for pressed/unpressed
                color: isActive ? 'white' : '#333',
                boxShadow: isActive
                  ? 'inset 0 2px 5px rgba(0,0,0,0.3), 0 0 0px rgba(0,0,0,0)' // Pressed effect
                  : '0 3px 0px #A0A0A0, 0 5px 10px rgba(0,0,0,0.2)', // Base 3D shadow
                border: '1px solid #C0C0C0', // Slight border
                transition: 'all 0.1s ease-out', // Faster transition for click feel
                '&:hover': {
                  // Subtle lift effect on hover
                  transform: isActive ? 'none' : 'translateY(-1px)',
                  boxShadow: isActive
                    ? 'inset 0 2px 5px rgba(0,0,0,0.3), 0 0 0px rgba(0,0,0,0)'
                    : '0 4px 0px #909090, 0 6px 12px rgba(0,0,0,0.3)',
                },
                '&:active': {
                  transform: 'translateY(2px)', // Push down on active
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3), 0 0 0px rgba(0,0,0,0)',
                },
              }}
            />
          );
        })}
      </Stack>

      {/* --- Filtered Cluster Grid Display --- */}
      <Grid container spacing={1.5} justifyContent="center">
        {clusters
          .filter(cluster => selectedStatus === 'All' || cluster.status === selectedStatus) // Filter clusters based on selected status
          .map((cluster, index) => {
            // Get background color and border color for the current cluster card
            const cardBackgroundColor = getClusterTypeBackgroundColor(cluster.clusterType); // Changed to solid color
            const cardBorderColor = getStatusBorderColor(cluster.status);

            return (
              <Grid item xs={4} sm={3} md={2} lg={1} xl={1} key={cluster.keyplotId}
                onClick={() => handleClusterClick(cluster.keyplotId, index + 1)}>
                <Tooltip
                  title={ // Tooltip content to show detailed cluster information on hover
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.8rem' }}>
                        ID: <strong style={{ color: 'white' }}>{cluster.localbody}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: '0.8rem' }}>
                        Type: <strong style={{ color: 'white' }}>{cluster.clusterType.toUpperCase()}</strong>
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', fontSize: '0.8rem' }}>
                        Status: <strong style={{ color: 'white' }}>{cluster.status}</strong>
                      </Typography>
                    </Box>
                  }
                  arrow // Adds an arrow to the tooltip
                  placement="top" // Positions the tooltip above the element
                >
                  <Card
                    sx={{
                      background: cardBackgroundColor, // Apply the determined solid background color
                      border: `2px solid ${cardBorderColor}`, // Apply the determined border color
                      borderRadius: 2, // Rounded corners for the card
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out', // Smooth transition for hover effects
                      // Updated 3D box shadow for the cards
                      boxShadow: '0 3px 0px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.15)',
                      ...(cluster.status === 'Ongoing' || cluster.status === 'On Going' ? ongoingBorderAnimation : {}), // Apply animation for ongoing clusters
                      '&:hover': {
                        // Removed transform translateY, and kept the same boxShadow for normal look
                        boxShadow: '0 3px 0px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.15)',
                      },
                      minHeight: { xs: 70, sm: 80 }, // Minimum height for responsiveness
                      p: 0.5, // Padding around content
                    }}
                  >
                  <CardContent
                          sx={{
                              padding: '4px',
                              '&:last-child': { paddingBottom: '4px' },
                              width: '100%',
                              height: '50px', // Force uniform height
                              boxSizing: 'border-box',
                              }}>

                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 'bold',
                          color: '#2C3E50', // Darker text color for the cluster number
                          lineHeight: 1,
                        }}
                      >
                        {index + 1} {/* Display cluster number (1-indexed) */}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          color: '#7F8C8D', // Muted text color for cluster type
                          borderRadius: '3px',
                          padding: '1px 4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase', // Uppercase for cluster type
                        }}
                      >
                        {cluster.clusterType} {/* Display cluster type */}
                        <Typography>
                         {cluster.cce ? <LocalFloristIcon/> : null}
                        </Typography>

                      </Typography>
                    </CardContent>
                  </Card>
                </Tooltip>
              </Grid>
            );
          })}
      </Grid>
      
    </Box>
     </>
        )}
    </Grid>
  );
}

export default ClusterSeatMap;
