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
  Badge,
  Avatar,
  Tooltip,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Map,
  Key,
  Search,
  Clear,
  Close,
  SearchOff,
  Person,
  PersonOutline,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import AppsIcon from '@mui/icons-material/Apps';
import SummarizeIcon from '@mui/icons-material/Summarize';
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
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  
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
      'view-clusters': `/schemes/earas/Zone_Details/clusters/${selectedZone.zoneId}`,
      'view-forms': `/schemes/earas/Zone_Details/Clusters_Form/${selectedZone.zoneId}`,
    };

    if (routes[menuItem]) {
      navigate(routes[menuItem]);
    }
    
    handleCloseDialog();
  };

  const role = authservice.getrole();
  const currentUser = authservice.getusername(); // Assuming you have a method to get current user

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
        console.log("Fetching zones with token:", token); // Debug log
console.log("Fetching zones with token:", response); // Debug log
        const result = await response.json();
     console.log("Fetched zones:", result); // Debug log
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
      zone.talukName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (zone.assignedUsername?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesAssignedFilter = !showAssignedOnly || zone.assignedUserId;
    
    return matchesDistrict && matchesTaluk && matchesSearch && matchesAssignedFilter;
  });

  // Group zones by assignment status
  const assignedZones = filteredZones.filter(zone => zone.assignedUserId);
  const unassignedZones = filteredZones.filter(zone => !zone.assignedUserId);

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
              Zone Lists
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Total Zones: {zoneData.length}
              </Typography>
              <Typography variant="body1" sx={{ color: 'success.main' }}>
                • Assigned: {zoneData.filter(z => z.assignedUserId).length}
              </Typography>
              <Typography variant="body1" sx={{ color: 'warning.main' }}>
                • Unassigned: {zoneData.filter(z => !z.assignedUserId).length}
              </Typography>
            </Box>
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search zones, districts, taluks, users..."
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

              {/* Assigned/Unassigned Filter */}
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Assignment Status</InputLabel>
                  <Select
                    value={showAssignedOnly ? 'assigned' : 'all'}
                    label="Assignment Status"
                    onChange={(e) => setShowAssignedOnly(e.target.value === 'assigned')}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Zones</MenuItem>
                    <MenuItem value="assigned">Assigned Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* District Filter */}
              {role != "Taluk Level Approver" && 
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
              {(selectedDistrict || selectedTaluk || searchQuery || showAssignedOnly) && (
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    setSelectedDistrict('');
                    setSelectedTaluk('');
                    setSearchQuery('');
                    setShowAssignedOnly(false);
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
                  {searchQuery || selectedDistrict || selectedTaluk || showAssignedOnly
                    ? "Try adjusting your search or filters"
                    : "No zones are available"}
                </Typography>
              </Box>
            ) : (
              <>
                {/* Assigned Zones Section */}
                {assignedZones.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6" color="success.main">
                        Assigned Zones ({assignedZones.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {assignedZones.map((zone) => (
                        <ZoneCard 
                          key={zone.zoneId} 
                          zone={zone} 
                          handleBoxClick={handleBoxClick}
                          isAssigned={true}
                        />
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Unassigned Zones Section */}
                {unassignedZones.length > 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RadioButtonUnchecked sx={{ color: 'warning.main', mr: 1 }} />
                      <Typography variant="h6" color="warning.main">
                        Unassigned Zones ({unassignedZones.length})
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {unassignedZones.map((zone) => (
                        <ZoneCard 
                          key={zone.zoneId} 
                          zone={zone} 
                          handleBoxClick={handleBoxClick}
                          isAssigned={false}
                        />
                      ))}
                    </Grid>
                  </Box>
                )}
              </>
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
          {selectedZone?.assignedUsername && (
            <Typography variant="caption" sx={{ display: 'block', color: '#e3f2fd', mt: 0.5 }}>
              Assigned to: {selectedZone.assignedUsername}
            </Typography>
          )}
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
                  icon: <AppsIcon sx={{ fontSize: 32 }} />, 
                  label: 'View Cluster',
                  color: '#1a237e'
                },
                { 
                  key: 'view-forms', 
                  icon: <SummarizeIcon sx={{ fontSize: 32 }} />, 
                  label: 'View Forms',
                  color: '#1a237e'
                }
              ].map((item) => (
                <Grid item xs={4} key={item.key}>
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

// Separate Zone Card Component for better organization
function ZoneCard({ zone, handleBoxClick, isAssigned }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{
          position: 'relative',
          height: '100%',
          cursor: 'pointer',
          transition: 'all 0.3s ease-in-out',
          border: '1px solid',
          borderColor: isAssigned ? 'success.light' : 'warning.light',
          borderRadius: 3,
          background: isAssigned 
            ? 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #fff8e1 100%)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: isAssigned 
              ? '0 12px 40px rgba(46, 125, 50, 0.15)'
              : '0 12px 40px rgba(237, 108, 2, 0.15)',
            borderColor: isAssigned ? 'success.main' : 'warning.main'
          }
        }}
        onClick={() => handleBoxClick(zone)}
      >
        {/* Zone Type Badge */}
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
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            zIndex: 1
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
          {/* Assignment Status Icon */}
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: isAssigned ? 'success.light' : 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: isAssigned ? 'success.main' : 'warning.main'
              }}
            >
              <LocationOn sx={{ fontSize: 30 }} />
            </Box>
            {isAssigned ? (
              <CheckCircle 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0,
                  fontSize: 20,
                  color: 'success.main',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} 
              />
            ) : (
              <RadioButtonUnchecked 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0,
                  fontSize: 20,
                  color: 'warning.main',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} 
              />
            )}
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

          {/* Assigned User Info */}
          {zone.assignedUsername ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 0.5,
              mb: 1,
              color: 'success.dark'
            }}>
              <Person sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {zone.assignedUsername}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 0.5,
              mb: 1,
              color: 'warning.dark'
            }}>
              <PersonOutline sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Unassigned
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 1 }}>
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
  );
}

export default AdminsZonelistUI;