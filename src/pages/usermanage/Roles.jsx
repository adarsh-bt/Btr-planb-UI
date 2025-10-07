// Roles.jsx

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Chip,
  Avatar,
  MenuItem,
  FormControl,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Autocomplete,
  Button,
  InputLabel,
  IconButton,Dialog,DialogTitle,DialogContent ,DialogActions,FormLabel ,
  FormHelperText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import { useLocation } from 'react-router-dom';
import ApprovedUserService from 'pages/functional-components/approvels/ApprovedUserService';
import RegisterService from 'pages/authentication/services/registerservice';
import authservice from 'pages/authentication/services/authservice';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { set } from 'lodash';
import approvalservice from 'pages/functional-components/approvels/approvalservice';

const Roles = () => {
  const location = useLocation();
  const userId = location.state?.userId;

  // State for fetched user data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loginId, setLoginId] = useState('');

  // UI States
  const [tabValue, setTabValue] = useState(0);

  const [isEditingSchemes, setIsEditingSchemes] = useState(false);
  const [allSchemes, setAllSchemes] = useState([]);
  const [rolesByScheme, setRolesByScheme] = useState({}); // { [schemeId]: [roles] }
  const [schemeRolePairs, setSchemeRolePairs] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  // Office selection states (same as Register component)
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

 const [zones, setZones] = useState([]);
  const [zone, setZone] = useState('');
  const [zoneSaving, setZoneSaving] = useState(false);
  const [savedZone, setSavedZone] = useState(false);
  

const [modalOpen, setModalOpen] = useState(false);

const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
const [selectedZoneIdToAdd, setSelectedZoneIdToAdd] = useState('');
const [addZoneSaving, setAddZoneSaving] = useState(false);
const [addZoneError, setAddZoneError] = useState('');
const [availableZones, setAvailableZones] = useState([]);

  const [districtId, setDistrictId] = useState(null);
  const [talukId, setTalukId] = useState(null);
  const [office, setOffice] = useState('');
  const [officeType, setOfficeType] = useState('');
  const [userStatus, setUserStatus] = useState('active');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [innerTabValue, setInnerTabValue] = useState(0);
  

  // Designation Change States
  const [isEditingDesignation, setIsEditingDesignation] = useState(false);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [selectedDesignationId, setSelectedDesignationId] = useState(null);
  const [designationLoading, setDesignationLoading] = useState(false);
  const [designationError, setDesignationError] = useState('');

  // zone State
  const [isAddZoneClicked, setIsAddZoneClicked] = useState(false);
  const [selectedNewZone, setSelectedNewZone] = useState('');
  const [selectedZoneForModal, setSelectedZoneForModal] = useState(null);
const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);



  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({ district: '', office: '' });

  // Fetch districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const response = await RegisterService.getDistricts();
        if (response.payload && Array.isArray(response.payload)) {
          setDistricts(response.payload);
        } else {
          setErrorMessage(response.message || 'Failed to fetch districts: Invalid data format.');
        }
      } catch (err) {
        setErrorMessage('Failed to fetch districts: ' + err.message);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch taluks when district changes
  useEffect(() => {
    const fetchTaluks = async () => {
      if (selectedDistrict) {
        try {
          const response = await RegisterService.getTaluks(selectedDistrict.distId);
          if (response.payload && Array.isArray(response.payload)) {
            setTaluks(response.payload);
          } else {
            setErrorMessage(response.message || 'Failed to fetch taluks: Invalid data format.');
          }
        } catch (err) {
          setErrorMessage('Failed to fetch taluks: ' + err.message);
        }
      } else {
        setTaluks([]);
        setSelectedTaluk(null);
      }
    };

    fetchTaluks();
  }, [selectedDistrict]);

  // Same filteredTaluks logic as Register component
  const filteredTaluks = selectedDistrict
    ? [
        { id: selectedDistrict.distId, label: selectedDistrict.distOfficeNameEn },
        ...(selectedDistrict.distId === 1 ? [{ id: 1, label: 'Directorate Office' }] : []),
        ...taluks.map((taluk) => ({
          id: taluk.desTalukId,
          label: taluk.talukOfficeNameEn
        }))
      ]
    : [];

  // Validation functions
  const validateField = (field) => {
    switch (field) {
      case 'district':
        return !selectedDistrict ? 'Please select a District.' : null;
      case 'office':
        return !selectedTaluk ? 'Please select an Office.' : null;
      default:
        return null;
    }
  };

  // Event handlers (same logic as Register component)
  const handleDistrictChange = (event, newValue) => {
    setSelectedDistrict(newValue);
    setSelectedTaluk(null);
    setDistrictId(null);
    setTalukId(null);
    setOfficeType('');
    setErrors((prevErrors) => ({ ...prevErrors, district: '' }));
  };

  const handleTalukChange = (event, newValue) => {
    setSelectedTaluk(newValue);

    if (newValue) {
      const label = newValue.label;

      if (label?.startsWith('District Office')) {
        setOfficeType('DISTRICT');
        setDistrictId(newValue.id);
        setTalukId(null);
      } else if (label === 'Directorate Office') {
        setOfficeType('DIRECTORATE');
        setDistrictId(1);
        setTalukId(null);
      } else if (label?.startsWith('Taluk Statistical Office')) {
        setOfficeType('TALUK');
        setTalukId(newValue.id);
        setDistrictId(null);
      }
      setErrors((prevErrors) => ({ ...prevErrors, office: '' }));
    } else {
      setOfficeType('');
      setDistrictId(null);
      setTalukId(null);
      setErrors((prevErrors) => ({ ...prevErrors, office: '' }));
    }
  };

  const handleEditOffice = () => {
    setIsEditingOffice(true);
    setErrorMessage('');
    setSuccessMessage('');
    // Optionally, pre-select current office info if available
    if (userData?.distOfficeId) {
      const dist = districts.find((d) => d.districtOfficeId === userData.distOfficeId);
      setSelectedDistrict(dist || null);
      setDistrictId(userData.distOfficeId);
    }
    if (userData?.desTalukOfficeId) {
      const taluk = taluks.find((t) => t.desTalukOfficeId === userData.desTalukOfficeId);
      setSelectedTaluk(taluk || null);
      setTalukId(userData.desTalukOfficeId);
    }
    setOfficeType(userData?.officeType || '');
  };

  const handleCancelEdit = () => {
    setIsEditingOffice(false);
    setSelectedDistrict(null);
    setSelectedTaluk(null);
    setDistrictId(null);
    setTalukId(null);
    setOfficeType('');
    setErrors({ district: '', office: '' });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSaveOfficeChange = async () => {
    // Validation
    let newErrors = {
      district: !selectedDistrict ? 'Please select a District.' : '',
      office: !selectedTaluk ? 'Please select an Office.' : ''
    };
    setErrors(newErrors);
    if (newErrors.district || newErrors.office) return;

    // Build payload
    const payload = {
      userId,
      officeType,
      ...(officeType === 'TALUK' && { desTalukOfficeId: talukId }),
      ...((officeType === 'DISTRICT' || officeType === 'DIRECTORATE') && { distOfficeId: districtId })
    };

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await ApprovedUserService.updateUserOfficeType(payload);
      setLoading(false);

      if (response.error) {
        setErrorMessage(response.message || 'Failed to update office type.');
        setSuccessMessage('');
      } else {
        setSuccessMessage('Office type updated successfully.');
        setErrorMessage('');
        setIsEditingOffice(false);
        // Optionally refresh user data
        const updatedRes = await ApprovedUserService.fetchUserById(userId);
        if (!updatedRes.error) {
          setUserData(updatedRes.payload);
          setOfficeType(updatedRes.payload.officeType || '');
        }
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('Failed to update office type: ' + err.message);
      setSuccessMessage('');
    }
  };

  const handleUserStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUserStatus(newStatus);
    setStatusUpdating(true);
    setStatusMessage('');
    try {
      const response = await ApprovedUserService.setUserActiveStatus(userId, newStatus === 'active');
      if (!response.error) {
        setStatusMessage(response.message || 'User status updated successfully');
        // Optionally update userData to reflect new status
        setUserData((prev) => ({ ...prev, active: newStatus === 'active' }));
      } else {
        setStatusMessage(response.message || 'Failed to update user status');
        // Optionally revert UI if backend fails
        setUserStatus(userData.active ? 'active' : 'inactive');
      }
    } catch (err) {
      setStatusMessage('An error occurred while updating status.');
      setUserStatus(userData.active ? 'active' : 'inactive');
    }
    setStatusUpdating(false);
  };



  // Fetch user details on mount
  useEffect(() => {
    if (!userId) {
      setError('No user selected');
      setLoading(false);
      return;
    }
    setLoading(true);
   ApprovedUserService.fetchUserById(userId)
  .then((res) => {
    if (res.error) {
      setError(res.message || 'Failed to fetch user');
      setUserData(null);
    } else {
      const payload = res.payload;
      setUserData(payload);
     

      const logid = payload.logid || '';
      setLoginId(logid); // still store it in state if needed elsewhere

      // 🔥 Call getZonesByUserId immediately
      
      ApprovedUserService.getZonesByUserId(logid)
        .then((response) => {
          const data = Array.isArray(response.data) ? response.data : [];
          
          setZones(data);

          if (data.length > 0) {
   
            if (savedZone && data.some((z) => z.zoneId.toString() === savedZone)) {
              setZone(savedZone);
            } else {
              setZone('');
            
              console.warn('No zones assigned to this user.');
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching zones:', error);
        });

      // Other state updates...
      setSchemeRolePairs(
        (payload.roleSchemeResponses || []).map((r) => ({
          schemeId: r.schemeId,
          schemeName: r.schemeName,
          roleId: r.roleId,
          roleName: r.roleName
        }))
      );
      setOffice(payload.officeLocation || '');
      setOfficeType(payload.officeType || '');
      setUserStatus(payload.active ? 'active' : 'inactive');
      setError('');
    }
  })
  .catch(() => {
    setError('Failed to fetch user');
    setUserData(null);
  })
  .finally(() => setLoading(false));
  }, [userId]);

  // Load available schemes on mount
  useEffect(() => {
    ApprovedUserService.getSchemes()
      .then((res) => {
        if (res.error) {
          console.error('Failed to load schemes:', res.message);
        } else {
          setAllSchemes(res || []);
        }
      })
      .catch((err) => {
        console.error('Error loading schemes:', err);
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setActiveTab(newValue);
    // Reset states when switching tabs
    setErrorMessage('');
    setSuccessMessage('');
    if (newValue !== 1) {
      // If not on "Change Office Type" tab
      setIsEditingOffice(false);
    }
  };

const handleSaveZoneStatus = async () => {
  if (!selectedZoneForModal) return;

  try {
    setZoneSaving(true);
    
    console.log("user id   ",loginId)
    const zoneId = selectedZoneForModal.zoneId;
    const user_id = loginId;
    const assigner_id = authservice.userid();
    const is_active = selectedZoneForModal.status === 'active';

    const userData = {
      zoneId: parseInt(zoneId, 10),
      user_id: user_id,
      assigner_id: assigner_id,
      is_active: is_active,
    };

    // Pass userData directly, not wrapped inside an object
    const res = await ApprovedUserService.updateZoneAssignmentStatus(userData);

    if (res.error) {
      setErrorMessage?.(res.message || 'Failed to update zone status');
      return;
    }

    setSuccessMessage?.(res.message || 'Zone status updated successfully');

    try {
      const refreshed = await ApprovedUserService.getZonesByUserId(loginId);
      setZones(refreshed?.data || []);
    } catch {
      setZones((prev = []) =>
        prev.map((z) =>
          z.zoneId === zoneId ? { ...z, status: is_active ? 'Active' : 'Inactive' } : z
        )
      );
    }

    setIsZoneModalOpen(false);
  } catch (e) {
    setErrorMessage?.(e.message || 'Unexpected error while updating zone status');
  } finally {
    setZoneSaving(false);
  }
};

useEffect(() => {
  if (isAddZoneOpen) {
    const fetchZones = async () => {
      try {
        const response = await approvalservice.zoneslist(userData.officeType, userData.officeId);
        if (response) {
          setAvailableZones(response);
          console.log("usess  ",userData)
        } else {
          setAddZoneError('No zones found.');
          setAvailableZones([]);
        }
      } catch (error) {
        console.error("Fetch zones failed:", error); // ✅ Log the error
        setAddZoneError('Failed to fetch zones');
        setAvailableZones([]);
      }
    };

    fetchZones();
  }
}, [isAddZoneOpen, userData]);  // ✅ Correct dependency




const handleSaveAddZone = async () => {
  if (!selectedZoneIdToAdd) {
    setAddZoneError('Please select a zone');
    return;
  }

  try {
    setAddZoneSaving(true);
    setAddZoneError('');
console.log("selectedZoneIdToAdd", selectedZoneIdToAdd);
    // Find the selected zone
    const addedZone = availableZones.find(zone => zone.zoneId === selectedZoneIdToAdd);

    if (!addedZone) {
      setAddZoneError('Zone not found.');
      return;
    }
   
    const admin_id = authservice.userid(); // You must have this value available in scope
    console.log("user id >> "+userData.logid)
    console.log("admin id >> "+admin_id)
    // ✅ Call the API to save the zone
    await approvalservice.zone_save(
      selectedZoneIdToAdd,                     // Pass entire zone object (or zone.zoneId if API expects just ID)
      userData.logid,              // Assuming you have userData with loginId
      admin_id                       // You must have this value available in scope
    );

    // ✅ Update local state so UI reflects the new zone
    setZones(prev => [
      ...prev,
      {
        zoneId: selectedZoneIdToAdd,
        zoneName: addedZone.zoneNameEn,
        status: 'active',
      },
    ]);

    // ✅ Reset form & close modal
    setIsAddZoneOpen(false);
    setSelectedZoneIdToAdd('');
  } catch (error) {
    console.error("Zone save failed:", error);
    setAddZoneError('Failed to add zone. Try again.');
  } finally {
    setAddZoneSaving(false);
  }
};



  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>{value === index && <Box sx={{ p: 3 }}>{children}</Box>}</div>
  );

  const handleChangeSubmit = async () => {
    setLoading(true);

    const payload = {
      userId: userId,
      schemeRoleUpdates: schemeRolePairs.map(({ schemeId, roleId }) => ({ schemeId, roleId })),
      officeLocation: office,
      officeType: officeType,
      active: userStatus === 'active'
    };

    const res = await ApprovedUserService.updateUserRolesAndOffice(payload);
    setLoading(false);

    if (res.error) {
      alert(res.message);
    } else {
      alert('User details updated successfully!');
      // Optionally refresh user data
      ApprovedUserService.fetchUserById(userId).then((updatedRes) => {
        if (!updatedRes.error) {
          setUserData(updatedRes.payload);
          setSchemeRolePairs(
            (updatedRes.payload.roleSchemeResponses || []).map((r) => ({
              schemeId: r.schemeId,
              schemeName: r.schemeName,
              roleId: r.roleId,
              roleName: r.roleName
            }))
          );
          setOffice(updatedRes.payload.officeLocation || '');
          setOfficeType(updatedRes.payload.officeType || '');
          setUserStatus(updatedRes.payload.active ? 'active' : 'inactive');
        }
      });
    }
  };

  // --- Designation Change Handlers ---
  const handleEditDesignation = async () => {
    setDesignationLoading(true);
    setDesignationError('');
    const res = await ApprovedUserService.getDesignations();
    if (res.error) {
      setDesignationError(res.message);
    } else {
      setDesignationOptions(res.payload);
      // Set current designation as selected
      const current = res.payload.find((d) => d.designationName === userData.designation);
      setSelectedDesignationId(current ? current.id : '');
      setIsEditingDesignation(true);
    }
    setDesignationLoading(false);
  };

  const handleDesignationSelect = (e) => {
    setSelectedDesignationId(Number(e.target.value));
  };

  const handleSaveDesignation = async () => {
    if (!selectedDesignationId) return;
    setDesignationLoading(true);
    setDesignationError('');
    const res = await ApprovedUserService.updateUserDesignation(userId, selectedDesignationId);
    setDesignationLoading(false);
    if (res.error) {
      setDesignationError(res.message);
    } else {
      // Refresh user data after update
      const updatedRes = await ApprovedUserService.fetchUserById(userId);
      if (!updatedRes.error) {
        setUserData(updatedRes.payload);
      }
      setIsEditingDesignation(false);
    }
  };

  const handleCancelDesignation = () => {
    setIsEditingDesignation(false);
    setDesignationError('');
  };

  // --- Scheme and Role Handlers ---
  const handleEditSchemes = async () => {
  setSchemesLoading(true);
  try {
    const schemes = await ApprovedUserService.getSchemes();
    if (!schemes.error) {
      setAllSchemes(schemes || []);
    }

    // For each current scheme-role pair, fetch roles if not already loaded
    for (const pair of schemeRolePairs) {
      if (!rolesByScheme[pair.schemeId]) {
        const roles = await ApprovedUserService.getRolesbySchemes(pair.schemeId);
        setRolesByScheme((prev) => ({
          ...prev,
          [pair.schemeId]: roles.error ? [] : roles || []
        }));
      }
    }

    setIsEditingSchemes(true);
  } catch (err) {
    alert('Failed to fetch schemes');
  }
  setSchemesLoading(false);
};

  const handleSchemeChange = async (idx, schemeId) => {
    // Update the selected scheme in the pair
    const schemeObj = allSchemes.find((s) => s.id === schemeId);
    setSchemeRolePairs((pairs) =>
      pairs.map((pair, i) => (i === idx ? { ...pair, schemeId, schemeName: schemeObj?.schemeName || '', roleId: '', roleName: '' } : pair))
    );

    // Fetch roles for this scheme if not already fetched
    if (!rolesByScheme[schemeId]) {
      setRolesLoading(true);
      try {
        const roles = await ApprovedUserService.getRolesbySchemes(schemeId);
        setRolesByScheme((prev) => ({
          ...prev,
          [schemeId]: roles.error ? [] : roles || []
        }));
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setRolesByScheme((prev) => ({ ...prev, [schemeId]: [] }));
      } finally {
        setRolesLoading(false);
      }
    }
  };

  const handleRoleChange = (idx, roleId) => {
    const pair = schemeRolePairs[idx];
    const roleObj = (rolesByScheme[pair.schemeId] || []).find((r) => r.id === roleId);
    setSchemeRolePairs((pairs) => pairs.map((pair, i) => (i === idx ? { ...pair, roleId, roleName: roleObj?.name || '' } : pair)));
  };

  const handleAddPair = () => {
    setSchemeRolePairs((pairs) => [...pairs, { schemeId: '', schemeName: '', roleId: '', roleName: '' }]);
  };

  const handleRemovePair = (idx) => {
    setSchemeRolePairs((pairs) => pairs.filter((_, i) => i !== idx));
  };

  const handleSaveSchemes = async () => {
    const roleScheme = schemeRolePairs
      .filter((pair) => pair.schemeId && pair.roleId)
      .map((pair) => ({ schemeId: pair.schemeId, roleId: pair.roleId }));

    try {
      const result = await ApprovedUserService.updateUserRoleScheme({
        userId,
        isActive: userStatus === 'active',
        roleScheme
      });

      if (result.error) {
        alert(`Failed to update schemes/roles: ${result.message}`);
      } else {
        alert('Schemes and roles updated!');
        setIsEditingSchemes(false);

        // Refresh user data
        const updatedRes = await ApprovedUserService.fetchUserById(userId);
        if (!updatedRes.error) {
          setUserData(updatedRes.payload);
          setSchemeRolePairs(
            (updatedRes.payload.roleSchemeResponses || []).map((r) => ({
              schemeId: r.schemeId,
              schemeName: r.schemeName,
              roleId: r.roleId,
              roleName: r.roleName
            }))
          );
        }
      }
    } catch (err) {
      alert('Failed to update schemes/roles');
    }
  };

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!userData) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          User Profile
        </Typography>

        <MainCard title="">
          <Grid container spacing={4}>
            {/* Left Section */}
            <Grid item xs={12} sm={4} md={3} lg={3}>
              <Paper
                elevation={3}
                sx={{
                  padding: 3,
                  textAlign: 'center',
                  borderRadius: 2
                }}
              >
                <Avatar
                  src={userData.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt={userData.name}
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 1rem'
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: 0.5 }}>
                  {userData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                  {userData.designation}
                </Typography>
                <Typography variant="body2" color="text.primary">
                  <strong>Pen Number:</strong> {userData.penNumber || userData.id || 'NA'}
                </Typography>
              </Paper>
            </Grid>

            {/* Right Section */}
            <Grid item xs={12} sm={8} md={9} lg={9}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Details" />
                <Tab label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Actions</Box>} />
              </Tabs>

              {/* Details Tab */}
              {tabValue === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Email', value: userData.email },
                      { label: 'Phone Number', value: userData.mobileNumber || userData.phone },
                      { label: 'Office Type', value: userData.officeType },
                      { label: 'Office Location', value: userData.officeLocation || '' },
                      { label: 'Date Of Join', value: userData.dateOfJoining || userData.dateOfJoin },
                      { label: 'Date Of Birth', value: userData.dateOfBirth },
                      {
                        label: 'Schemes',
                        value: userData.roleSchemeResponses?.map((r) => r.schemeName).join(' | ') || ''
                      },
                      {
                        label: 'Roles',
                        value: userData.roleSchemeResponses?.map((r) => r.roleName).join(' | ') || ''
                      },
                      { label: 'Register Date', value: userData.createdAt?.slice(0, 10) || userData.registerDate },
                      {
                        label: 'Status',
                        value: (
                          <Chip
                            label={userData.active ? 'Activ' : 'Inactive'}
                            color={userData.active ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 'bold', color: '#fff' }}
                          />
                        )
                      },
                      { label: 'Active Date', value: userData.updatedAt?.slice(0, 10) || userData.activeDate }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        {typeof item.value === 'string' || typeof item.value === 'number' ? (
                          <TextField
                            label={item.label}
                            value={item.value}
                            variant="outlined"
                            fullWidth
                            size="small"
                            InputProps={{
                              readOnly: true
                            }}
                          />
                        ) : (
                          <Box sx={{ mt: 1 }}>{item.value}</Box>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
                
              {/* Actions Tab */}
              {tabValue === 1 && (
                <Box sx={{ mt: 3 }}>
                  <Tabs value={innerTabValue} onChange={(e, newValue) => setInnerTabValue(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Change Schemes & Roles" />
                    <Tab label="Change Designations" />
                    <Tab label="Change Office Type" />
                    <Tab label="Zone Manage" />
                    <Tab label="Change user status" />
                  </Tabs>

                  {/* Change Schemes & Roles */}
                  <hr></hr>
                  {innerTabValue === 0 && (
                    <Grid container spacing={2}>
                      {!isEditingSchemes ? (
                        <>
                          {schemeRolePairs.map((pair, idx) => (
                            <Grid item xs={12} key={idx}>
                              <Typography>
                                <strong>Scheme:</strong> {pair.schemeName} | <strong>Role:</strong> {pair.roleName}
                              </Typography>
                            </Grid>
                          ))}
                          <Grid item xs={12}>
                            <Button variant="outlined" onClick={handleEditSchemes}>
                              Edit
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          {schemeRolePairs.map((pair, idx) => (
                            <React.Fragment key={idx}>
                              <Grid item xs={5}>
                                <FormControl fullWidth size="small">
                                  <Typography variant="body2">Scheme</Typography>
                                  <Select
                                    value={pair.schemeId}
                                    onChange={(e) => handleSchemeChange(idx, e.target.value)}
                                    disabled={schemesLoading}
                                  >
                                    {allSchemes.map((s) => (
                                      <MenuItem key={s.id} value={s.id}>
                                        {s.schemeName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={5}>
                                <FormControl fullWidth size="small">
                                  <Typography variant="body2">Role</Typography>
                                  <Select
                                    value={pair.roleId}
                                    onChange={(e) => handleRoleChange(idx, e.target.value)}
                                    disabled={!pair.schemeId || rolesLoading}
                                  >
                                    {(rolesByScheme[pair.schemeId] || []).map((r) => (
                                      <MenuItem key={r.id} value={r.id}>
                                        {r.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={pair.active ? 'active' : 'inactive'}
                  onChange={(e) => handleSchemeRoleActiveChange(idx, e.target.value)}
                >
                  <FormControlLabel value="active" control={<Radio color="primary" />} label="Active" />
                  <FormControlLabel value="inactive" control={<Radio color="secondary" />} label="Inactive" />
                </RadioGroup>
              </FormControl>
            </Grid>
                            </React.Fragment>
                          ))}
                          <Grid item xs={12}>
                            <Button onClick={handleAddPair}>Add Scheme/Role</Button>
                          </Grid>
                          <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleSaveSchemes}>
                              Save
                            </Button>
                            <Button sx={{ ml: 2 }} onClick={() => setIsEditingSchemes(false)}>
                              Cancel
                            </Button>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  )}

                  {/* Change Designations */}
                  {innerTabValue === 1 && (
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Designation</Typography>
                            {!isEditingDesignation && (
                              <IconButton
                                aria-label="edit"
                                onClick={handleEditDesignation}
                                sx={{
                                  color: 'primary.main',
                                  backgroundColor: 'background.paper',
                                  borderRadius: 1,
                                  boxShadow: 1,
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                          </Box>
                          
                          {!isEditingDesignation ? (
                            <TextField value={userData.designation} variant="outlined" size="small" InputProps={{ readOnly: true }} />
                          ) : (
                            <>
                              <Select
                                value={selectedDesignationId || ''}
                                onChange={handleDesignationSelect}
                                disabled={designationLoading}
                                fullWidth
                                size="small"
                              >
                                {designationOptions.map((option) => (
                                  <MenuItem key={option.id} value={option.id}>
                                    {option.designationName}
                                  </MenuItem>
                                ))}
                              </Select>
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  onClick={handleSaveDesignation}
                                  variant="contained"
                                  color="primary"
                                  disabled={designationLoading || !selectedDesignationId}
                                  sx={{ mr: 1 }}
                                >
                                  Save
                                </Button>
                                <Button onClick={handleCancelDesignation} variant="outlined" disabled={designationLoading}>
                                  Cancel
                                </Button>
                              </Box>
                              {designationError && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                  {designationError}
                                </Typography>
                              )}
                            </>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {innerTabValue === 2 && (
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Office Type</Typography>
                            {!isEditingOffice && (
                              <IconButton
                                aria-label="edit"
                                onClick={handleEditOffice}
                                sx={{
                                  color: 'primary.main',
                                  backgroundColor: 'background.paper',
                                  borderRadius: 1,
                                  boxShadow: 1,
                                  '&:hover': { backgroundColor: 'primary.light' }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            )}
                          </Box>

                          {/* VIEW MODE */}
                          {!isEditingOffice ? (
                            <>
                              <TextField
                                value={officeType || 'Not set'}
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
                                sx={{ mb: 2 }}
                              />
                              <TextField
                                value={selectedTaluk?.label || office || 'Not selected'}
                                variant="outlined"
                                size="small"
                                InputProps={{ readOnly: true }}
                                label="Office"
                              />
                            </>
                          ) : (
                            <>
                              <Autocomplete
                                disablePortal
                                options={districts.map((district) => ({
                                  distId: district.districtOfficeId,
                                  distOfficeNameEn: district.districtOfficeNameEn
                                }))}
                                getOptionLabel={(option) => option?.distOfficeNameEn || ''}
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                isOptionEqualToValue={(option, value) => option?.distId === value?.distId}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Districts"
                                    required
                                    variant="outlined"
                                    size="small"
                                    sx={{ mb: 2 }}
                                    error={!!errors.district}
                                    helperText={errors.district}
                                  />
                                )}
                              />
                              <Autocomplete
                                disablePortal
                                options={filteredTaluks}
                                getOptionLabel={(option) => option?.label || ''}
                                value={selectedTaluk}
                                onChange={handleTalukChange}
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Office"
                                    required
                                    variant="outlined"
                                    size="small"
                                    error={!!errors.office}
                                    helperText={errors.office}
                                  />
                                )}
                                sx={{ mb: 2 }}
                              />
                              <Box sx={{ mt: 2 }}>
                                <Button
                                  onClick={handleSaveOfficeChange}
                                  variant="contained"
                                  color="primary"
                                  disabled={loading || !selectedDistrict || !selectedTaluk}
                                  sx={{ mr: 1 }}
                                >
                                  {loading ? 'Saving...' : 'Save'}
                                </Button>
                                <Button onClick={handleCancelEdit} variant="outlined" disabled={loading}>
                                  Cancel
                                </Button>
                              </Box>
                              {errorMessage && (
                                <Typography color="error" sx={{ mt: 1 }}>
                                  {errorMessage}
                                </Typography>
                              )}
                              {successMessage && (
                                <Typography color="success.main" sx={{ mt: 1 }}>
                                  {successMessage}
                                </Typography>
                              )}
                            </>
                          )}
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}

                  {innerTabValue === 3 && (
                    
                      <Grid container spacing={2}>
                        <Grid item xs={12} >
                          <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
  
  <Button variant="contained" sx={{padding:1}} onClick={() => setIsAddZoneOpen(true)}>
    <AddCircleOutlineIcon /> Add Zone 
  </Button>
</Box>
<hr></hr>
                        </Grid>
                          {zones.length === 0 ? (
                            <Grid item xs={12}>
                              <Typography variant="body2">No zones assigned</Typography>
                            </Grid>
                          ) : (
                            zones.map((z) => (
                              <Grid item xs={12} sm={6} md={4} key={z.zoneId}>
                                <Box
                                  role="button"
                                  tabIndex={0}
                                  sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    padding: 2,
                                    cursor: 'pointer',
                                    backgroundColor: '#f9f9f9',
                                    '&:hover': {
                                      backgroundColor: '#e6f7ff',
                                    },
                                    outline: 'none',
                                    '&:focus-visible': {
                                      outline: '2px solid #1890ff',
                                    },
                                  }}
                                  onClick={() => {
                                    setSelectedZoneForModal(z);
                                    setIsZoneModalOpen(true);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      setSelectedZoneForModal(z);
                                      setIsZoneModalOpen(true);
                                    }
                                  }}
                                >
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {z.zoneName}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {/* Status: {z.status || 'Inactive'} */}
                                    Status: {'Active'}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))
                          )}
                          </Grid>


                  )}

                  {/* Change user status */}
                  {innerTabValue === 4 && (
                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        User Status
                      </Typography>
                      <RadioGroup row value={userStatus} onChange={handleUserStatusChange} disabled={statusUpdating}>
                        <FormControlLabel value="active" control={<Radio />} label="Active" />
                        <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
                      </RadioGroup>
                      {statusUpdating && <Typography sx={{ mt: 1, color: 'primary.main' }}>Updating status...</Typography>}
                      {statusMessage && (
                        <Typography sx={{ mt: 1, color: statusMessage.toLowerCase().includes('success') ? 'green' : 'red' }}>
                          {statusMessage}
                        </Typography>
                      )}
                    </FormControl>
                  )}

                  <Box sx={{ mt: 3 }}>
                    
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      {/* zone active */}
    <Dialog open={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Zone Settings</DialogTitle>
  <DialogContent>
    {selectedZoneForModal && (
      <>
        <Typography variant="subtitle1" gutterBottom>
          {selectedZoneForModal.zoneName}
        </Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">Zone Status</FormLabel>
          <RadioGroup
            row
            value={selectedZoneForModal.status || 'active'}
            onChange={(e) =>
              setSelectedZoneForModal({
                ...selectedZoneForModal,
                status: e.target.value
              })
            }
          >
            <FormControlLabel value="active" control={<Radio />} label="Active" />
            <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
          </RadioGroup>
        </FormControl>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setIsZoneModalOpen(false)}>Cancel</Button>
    <Button variant="contained" disabled={zoneSaving || !selectedZoneForModal} onClick={handleSaveZoneStatus}>
  {zoneSaving ? 'Saving…' : 'Save'}
</Button>

  </DialogActions>
</Dialog>

{/* multiple zone selection */}
  <Dialog open={isAddZoneOpen} onClose={() => setIsAddZoneOpen(false)} maxWidth="xs" fullWidth>
    <DialogTitle sx={{backgroundColor: '#05307a',color:'white' }} variant='h5' align='center'>Add Zone</DialogTitle>
    <DialogContent>
 <FormControl
      fullWidth
      size="small"
      sx={{
        mt: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}
      >
        Select Zone
      </Typography>

      <Autocomplete
        fullWidth
        size="small"
        options={availableZones}
        getOptionLabel={(option) => option.zoneNameEn}
        value={availableZones.find((z) => z.zoneId === selectedZoneIdToAdd) || null}
        onChange={(event, newValue) => {
          if (newValue) {
            setSelectedZoneIdToAdd(newValue.zoneId);
            setAddZoneError('');
          } else {
            setSelectedZoneIdToAdd('');
          }
        }}
        isOptionEqualToValue={(option, value) => option.zoneId === value.zoneId}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Zone"
            error={Boolean(addZoneError)}
            helperText={addZoneError || 'Start typing to search'}
          />
        )}
        noOptionsText="No matching zones"
        clearOnEscape
      />
    </FormControl>

    </DialogContent>
    <DialogActions>
      <Button onClick={() => setIsAddZoneOpen(false)}>Cancel</Button>
      <Button
        variant="contained"
        disabled={addZoneSaving || !selectedZoneIdToAdd}
        onClick={handleSaveAddZone}
      >
        {addZoneSaving ? 'Saving…' : 'Save'}
      </Button>
    </DialogActions>
  </Dialog>

    </Grid>
  );
};

export default Roles;
