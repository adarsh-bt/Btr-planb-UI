import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  LocationOn,
  Map,
  Key,
  Apartment,
  Search,
  Clear,
  Close,
  SearchOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import mainapi from 'api/mainapi';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';

function AdminsZonelistUI() {
  const theme = useTheme();
  const BASE_URL = mainapi.BASE_URL;
  
  const [zoneData, setZoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const navigate = useNavigate();

  const handleBoxClick = (zone) => {
    setSelectedZone(zone);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedZone(null);
  };

  const handleMenuItemClick = (menuItem) => {
    if (!selectedZone?.zoneId) return;

    const routes = {
      'view-btr': `/schemes/earas/Zone_Details/btr/${selectedZone.zoneId}`,
      'view-zone-details': `/schemes/earas/Zone_Details/${selectedZone.zoneId}`,
      'view-keyplots': `/schemes/earas/Zone_Details/Key_plots/${selectedZone.zoneId}`,
      'view-clusters': `/schemes/earas/Zone_Details/clusters/${selectedZone.zoneId}`
    };

    if (routes[menuItem]) {
      navigate(routes[menuItem]);
    }
    
    handleCloseDialog();
  };

  const role = authservice.getrole();
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${BASE_URL}/user-access/zones/zone_lists`,
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

  // Filter logic
  const districts = [...new Set(zoneData.map(z => z.districtName))];
  const taluks = [...new Set(zoneData.map(z => z.talukName))];
  
  const filteredZones = zoneData.filter(zone => {
    const matchesDistrict = !selectedDistrict || zone.districtName === selectedDistrict;
    const matchesTaluk = !selectedTaluk || zone.talukName === selectedTaluk;
    const matchesSearch = !searchQuery || 
      zone.zoneNameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.districtName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.talukName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDistrict && matchesTaluk && matchesSearch;
  });

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center' 
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h5" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading your zones...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
        p: 3 
      }}>
        <Typography variant="h4" gutterBottom color="error">
          Oops! Something went wrong.
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: 500 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
          size="large"
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
  
        <Grid container spacing={3}>
      <Breadcrumb/>
      <Grid item xs={12}>
       
          
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography variant="h3" sx={{ 
                mb: 1,
                fontWeight: 700,
                background: 'linear-gradient(45deg, #04255e, #1976d2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                Your Assigned Zones
              </Typography>
              
            
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  You are assigned to {zoneData.length} zone{zoneData.length > 1 ? 's' : ''}
                </Typography>
              
            </Box>
          </Box>

          {/* Remove MainCard if it causes issues, use Card instead */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {/* Search and Filter Section */}
            <Box sx={{ 
              p: 3, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)'
            }}>
              <Grid container spacing={2} alignItems="center">
                {/* Search Box */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search zones, districts, taluks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                {/* District Filter */}
                {role != "Taluk Level Approver" && 
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>District</InputLabel>
                    <Select
                      value={selectedDistrict}
                      label="District"
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setSelectedTaluk('');
                      }}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Districts</MenuItem>
                      {districts.map((d) => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>}

                {/* Taluk Filter */}
                {role != "Taluk Level Approver" && 
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Taluk</InputLabel>
                    <Select
                      value={selectedTaluk}
                      label="Taluk"
                      onChange={(e) => setSelectedTaluk(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">All Taluks</MenuItem>
                      {taluks
                        .filter(t => !selectedDistrict || zoneData.some(z => z.talukName === t && z.districtName === selectedDistrict))
                        .map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>}
              </Grid>

              {/* Results Count */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredZones.length} of {zoneData.length} zones
                </Typography>
                {(selectedDistrict || selectedTaluk || searchQuery) && (
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      setSelectedDistrict('');
                      setSelectedTaluk('');
                      setSearchQuery('');
                    }}
                    startIcon={<Clear />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            </Box>

            {/* Zones Grid */}
            <Box sx={{ p: 3 }}>
              {filteredZones.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: 'text.secondary'
                }}>
                  <SearchOff sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No zones found
                  </Typography>
                  <Typography variant="body2">
                    {searchQuery || selectedDistrict || selectedTaluk 
                      ? "Try adjusting your search or filters"
                      : "No zones are available"}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {filteredZones.map((zone) => (
                   <Grid item xs={12} sm={6} md={4} lg={3} key={zone.zoneId}>
  <Card
    sx={{
      position: 'relative',   // ⬅️ IMPORTANT
      height: '100%',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 3,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        borderColor: 'primary.main'
      }
    }}
    onClick={() => handleBoxClick(zone)}
  >
    {/* ⭐ TOP-RIGHT BADGE ⭐ */}
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        px: 1.5,
        py: 0.5,
        backgroundColor: 'rgba(250, 180, 30, 1)',
        color: 'white',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 600,
        boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
      }}
    >
      {zone.zoneType}
    </Box>

    <CardContent
      sx={{
        p: 3,
        textAlign: 'center',
        '&:last-child': { pb: 3 }
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: 'primary.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'primary.main'
        }}
      >
        <LocationOn sx={{ fontSize: 30 }} />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1
        }}
      >
        {zone.zoneNameEn}
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Chip
          label={zone.districtName}
          size="small"
          variant="outlined"
          sx={{ mr: 1, mb: 1 }}
        />
        <Chip
          label={zone.talukName}
          size="small"
          variant="outlined"
          color="secondary"
        />
      </Box>
    </CardContent>
  </Card>
</Grid>

                  ))}
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>
      

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 3,
            background: 'linear-gradient(135deg, #04255e 0%, #1976d2 100%)',
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
              right: 12,
              top: 12,
              color: '#fff'
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: '#fafbff' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 3, 
              textAlign: 'center',
              color: 'text.secondary'
            }}>
              Choose what you want to view in this zone:
            </Typography>

            <Grid container spacing={2}>
              {[
                { 
                  key: 'view-zone-details', 
                  icon: <LocationOn sx={{ fontSize: 32 }} />, 
                  label: 'View Zone Details',
                  color: '#1a237e'
                },
                { 
                  key: 'view-btr', 
                  icon: <Map sx={{ fontSize: 32 }} />, 
                  label: 'View BTR',
                  color: '#1a237e'
                },
                { 
                  key: 'view-keyplots', 
                  icon: <Key sx={{ fontSize: 32 }} />, 
                  label: 'View Keyplots',
                  color: '#1a237e'
                },
                { 
                  key: 'view-clusters', 
                  icon: <Apartment sx={{ fontSize: 32 }} />, 
                  label: 'View Cluster',
                  color: '#1a237e'
                }
              ].map((item) => (
                <Grid item xs={6} key={item.key}>
                  <Paper
                    onClick={() => handleMenuItemClick(item.key)}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border: '2px solid transparent',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <Box sx={{ 
                      color: item.color,
                      mb: 1.5
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}>
                      {item.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}

export default AdminsZonelistUI;