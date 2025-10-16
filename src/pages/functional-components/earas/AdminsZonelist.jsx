import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import ApartmentIcon from '@mui/icons-material/Apartment';
import KeyIcon from '@mui/icons-material/Key';

function AdminsZonelistUI() {
  const theme = useTheme();
  const BASE_URL = mainapi.USER_API;
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const handleBoxClick = (zone) => {
    setSelectedZone(zone);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedZone(null);
  };

  const handleMenuItemClick = (menuItem) => {
    console.log(`Clicked on ${menuItem} for Zone ID: ${selectedZone?.zoneId}`);
    // Here you would add your navigation logic
    // For example, navigate to a new page based on the selected zone ID and menu item
    handleCloseDialog();
  };

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${BASE_URL}/user-access/zones/my`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();
        if (!response.ok) {
          if (result?.response === "No value present") {
            setError("No zones are currently assigned to you.");
          } else {
            throw new Error(result?.message || "Failed to fetch zones");
          }
        } else {
          setZoneData(result || []);
        }
      } catch (err) {
        setError(err.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your zones...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
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

  // UI when zones are available
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Your Assigned Zones
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          You are assigned to {zoneData.length} zone{zoneData.length > 1 ? 's' : ''}.
        </Typography>
        <MainCard>
          <Grid container spacing={2}>
            {zoneData.map((zone) => (
              <Grid item xs={12} sm={6} md={4} key={zone.zoneId}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    height: '100%',
                    backgroundColor: '#e3f2fd',
                    transition: 'transform 0.2s',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleBoxClick(zone)}
                >
                  <LocationOnIcon sx={{ fontSize: 20, color: '#1a237e', mb: 1 }} />
                  <Typography variant="h6" sx={{ color: '#1a237e', mb: 1 }}>
                    {zone.zoneNameEn}
                    Taluk : 
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </MainCard>
      </Grid>

      {/* The Dialog */}
   <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
  <DialogTitle
    sx={{
      m: 0,
      p: 2,
      background: '#04255e',
      color: '#fff',
      fontWeight: 'bold',
      position: 'relative'
    }}
  >
    {selectedZone?.zoneNameEn || 'Zone Details'}
    <IconButton
      aria-label="close"
      onClick={handleCloseDialog}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: '#fff'
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent
    sx={{
      backgroundColor: '#f9f9f9',
      p: 3
    }}
  >
    {/* <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
      Choose what you want to view in this zone:
    </Typography> */}

    <Grid container spacing={3} sx={{marginTop:'1rem'}}>
      {/* View BTR */}
      <Grid item xs={12} sm={4}>
        <Paper
          onClick={() => handleMenuItemClick('view-btr')}
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 2,
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              transform: 'translateY(-3px)',
              boxShadow: 3
            }
          }}
        >
          <MapIcon color="primary" sx={{ fontSize: 38 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            View BTR
          </Typography>
        </Paper>
      </Grid>

      {/* View Keyplots */}
      <Grid item xs={12} sm={4}>
        <Paper
          onClick={() => handleMenuItemClick('view-keyplots')}
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 2,
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              transform: 'translateY(-3px)',
              boxShadow: 3
            }
          }}
        >
          <KeyIcon color="primary" sx={{ fontSize: 38 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            View Keyplots
          </Typography>
        </Paper>
      </Grid>

       {/* View Cluster */}
      <Grid item xs={12} sm={4}>
        <Paper
          onClick={() => handleMenuItemClick('view-cluster')}
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 2,
            cursor: 'pointer',
            transition: '0.3s',
            '&:hover': {
              backgroundColor: '#e3f2fd',
              transform: 'translateY(-3px)',
              boxShadow: 3
            }
          }}
        >
          <ApartmentIcon color="primary" sx={{ fontSize: 38 }} />
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            View Cluster
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  </DialogContent>
</Dialog>

    </Grid>
  );
}

export default AdminsZonelistUI;