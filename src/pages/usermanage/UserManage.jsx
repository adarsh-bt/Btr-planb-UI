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
  InputLabel,Card,Tooltip,
  IconButton,Dialog,DialogTitle,DialogContent ,DialogActions,FormLabel 
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Alert } from '@mui/material';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/Settings';
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
  const [designationConfirmOpen, setDesignationConfirmOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [isEditingOffice, setIsEditingOffice] = useState(false);
  // Office selection states (same as Register component)
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [pendingUserStatus, setPendingUserStatus] = useState('');

 const [zones, setZones] = useState([]);
  const [zone, setZone] = useState('');
  const [zoneSaving, setZoneSaving] = useState(false);
  const [savedZone, setSavedZone] = useState(false);
  
  const [showEmailModal, setShowEmailModal] = useState(false);
const [newEmail, setNewEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [emailUpdating, setEmailUpdating] = useState(false);
const [emailSuccess, setEmailSuccess] = useState('');

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
  const [roleSchemes, setRoleSchemes] = useState([]);


  const [innerTabValue, setInnerTabValue] = useState(0);
  
const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmMessage, setConfirmMessage] = useState('');

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

const handleChangeEmail = async () => {
  // Reset messages
  setEmailError('');
  setEmailSuccess('');
  
  // Validation
  if (!newEmail || newEmail.trim() === '') {
    setEmailError('Email is required');
    return;
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    setEmailError('Please enter a valid email address');
    return;
  }
  
  // Check if email is same as current
  if (newEmail.toLowerCase() === userData.email.toLowerCase()) {
    setEmailError('New email is same as current email');
    return;
  }
  
  setEmailUpdating(true);
  
  try {
    const response = await ApprovedUserService.changeEmail({
      userId: userId,
      newEmail: newEmail.trim()
    });
    
    if (response.success) {
      setEmailSuccess(response.message || 'Email updated successfully');
      
      // Update local user data
      setUserData(prev => ({
        ...prev,
        email: newEmail.trim()
      }));
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowEmailModal(false);
        setNewEmail('');
        setEmailSuccess('');
      }, 2000);
    } else {
      setEmailError(response.message || 'Failed to update email');
    }
  } catch (error) {
    setEmailError(error.message || 'An error occurred while updating email');
  } finally {
    setEmailUpdating(false);
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

const handleUserStatusChange = (e) => {
    const newStatus = e.target.value;
    // Only open the dialog if the status is actually changing
    if (newStatus !== userStatus) {
      setPendingUserStatus(newStatus);
      setIsStatusConfirmOpen(true);
    }
  };
  // Roles.jsx
// ... existing code (place this function near handleUserStatusChange for clarity) ...

  // 💥 NEW FUNCTION 💥
  const handleConfirmStatusChange = async () => {
    setIsStatusConfirmOpen(false); // Close the dialog
    
    // Use the status that was saved when the user clicked the radio button
    const newStatus = pendingUserStatus;
    
    // Revert if somehow pending status is empty
    if (!newStatus) return;

    setUserStatus(newStatus); // Optimistic UI update

    setStatusUpdating(true);
    setStatusMessage('');
    
    try {
      // The API expects true for active, false for inactive
      const response = await ApprovedUserService.setUserActiveStatus(userId, newStatus === 'active');
      
      if (!response.error) {
        setStatusMessage(response.message || 'User status updated successfully');
        // Update userData to reflect new status
        setUserData((prev) => ({ ...prev, active: newStatus === 'active' }));
      } else {
        setStatusMessage(response.message || 'Failed to update user status');
        // Revert UI if backend fails
        setUserStatus(userData.active ? 'active' : 'inactive');
      }
    } catch (err) {
      setStatusMessage('An error occurred while updating status.');
      // Revert UI on error
      setUserStatus(userData.active ? 'active' : 'inactive');
    }
    setStatusUpdating(false);
    setPendingUserStatus(''); // Clear pending status
  };

// ... existing code ...

// 1️⃣ Add this function near your other handlers
const handleSchemeRoleActiveChange = (index, value) => {
  setSchemeRolePairs(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      isActive: value === "active"   // Convert string back to boolean
    };
    return updated;
  });
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
      // setSchemeRolePairs(
      //   (payload.roleSchemeResponses || []).map((r) => ({
      //     id:r.id,
      //     schemeId: r.schemeId,
      //     schemeName: r.schemeName,
      //     roleId: r.roleId,
      //     roleName: r.roleName,
      //     isActive:r.isActive
      //   }))
      // );
      // Replace the setSchemeRolePairs line with:
setSchemeRolePairs(
  (payload.roleSchemeResponses || []).slice(0, 1).map((r) => ({
    id: r.id,
    schemeId: r.schemeId,
    schemeName: r.schemeName,
    roleId: r.roleId,
    roleName: r.roleName,
    isActive: r.isActive
  }))
);

// If no role exists, initialize with an empty pair
if ((payload.roleSchemeResponses || []).length === 0) {
  setSchemeRolePairs([{
    id: null,
    schemeId: '',
    schemeName: '',
    roleId: '',
    roleName: '',
    isActive: true
  }]);
}

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

    // Find the selected zone
    const addedZone = availableZones.find(zone => zone.zoneId === selectedZoneIdToAdd);

    if (!addedZone) {
      setAddZoneError('Zone not found.');
      return;
    }
   
    
    const admin_id = authservice.userid(); // You must have this value available in scope
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
const role = authservice.getrole();
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
    setDesignationConfirmOpen(false);
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
const handleSaveDesignationClick = () => {
  if (selectedDesignationId) {
    setDesignationConfirmOpen(true);
  }
};
  const handleCancelDesignation = () => {
    setIsEditingDesignation(false);
    setDesignationError('');
  };
// Add this useEffect to debug state changes
useEffect(() => {

}, [schemeRolePairs, rolesByScheme]);

// Also add this to debug when editing mode changes
useEffect(() => {
  console.log('isEditingSchemes:', isEditingSchemes);
  
}, [isEditingSchemes]);

useEffect(() => {
  if (isEditingSchemes && schemeRolePairs[0]?.schemeId) {
    console.log('Current scheme in edit mode:', schemeRolePairs[0].schemeId);
    
  }
}, [isEditingSchemes, schemeRolePairs, rolesByScheme]);
  // --- Scheme and Role Handlers ---
const handleEditSchemes = async () => {
  setSchemesLoading(true);
  try {
    const schemes = await ApprovedUserService.getSchemes();
    if (!schemes.error) {
      setAllSchemes(schemes || []);
    }

    // If no role exists or the array is empty, ensure we have a pair
    if (schemeRolePairs.length === 0 || !schemeRolePairs[0]) {
      setSchemeRolePairs([{
        id: null,
        schemeId: '',
        schemeName: '',
        roleId: '',
        roleName: '',
        isActive: true
      }]);
    } else {
      // Preload roles for existing scheme if not already loaded
      const existingPair = schemeRolePairs[0];
      if (existingPair.schemeId && !rolesByScheme[existingPair.schemeId]) {
        try {
          const roles = await ApprovedUserService.getRolesbySchemes(existingPair.schemeId);
          let rolesList = [];
          
          if (Array.isArray(roles)) {
            rolesList = roles;
          } else if (roles?.payload && Array.isArray(roles.payload)) {
            rolesList = roles.payload;
          } else if (roles?.data && Array.isArray(roles.data)) {
            rolesList = roles.data;
          }
          
          // Transform roles to consistent format
          const transformedRoles = rolesList.map(role => ({
            id: role.id || role.roleId || role.value,
            name: role.name || role.roleName || role.label || '',
            roleName: role.roleName || role.name || role.label || ''
          }));
          
          setRolesByScheme((prev) => ({
            ...prev,
            [existingPair.schemeId]: transformedRoles
          }));
        } catch (err) {
          console.error('Failed to preload roles:', err);
        }
      }
    }

    setIsEditingSchemes(true);
  } catch (err) {
    alert('Failed to fetch schemes');
  }
  setSchemesLoading(false);
};
  // const handleSchemeChange = async (idx, schemeId) => {
  //   // Update the selected scheme in the pair
  //   const schemeObj = allSchemes.find((s) => s.id === schemeId);
  //   setSchemeRolePairs((pairs) =>
  //     pairs.map((pair, i) => (i === idx ? { ...pair, schemeId, schemeName: schemeObj?.schemeName || '', roleId: '', roleName: '' } : pair))
  //   );

  //   // Fetch roles for this scheme if not already fetched
  //   if (!rolesByScheme[schemeId]) {
  //     setRolesLoading(true);
  //     try {
  //       const roles = await ApprovedUserService.getRolesbySchemes(schemeId);
  //       setRolesByScheme((prev) => ({
  //         ...prev,
  //         [schemeId]: roles.error ? [] : roles || []
  //       }));
  //     } catch (err) {
  //       console.error('Failed to fetch roles:', err);
  //       setRolesByScheme((prev) => ({ ...prev, [schemeId]: [] }));
  //     } finally {
  //       setRolesLoading(false);
  //     }
  //   }
  // };
const handleSchemeChange = async (idx, schemeId) => {
  // Update the selected scheme in the pair
  const schemeObj = allSchemes.find((s) => s.id === schemeId);
  
  const updatedPair = { 
    ...(schemeRolePairs[0] || {}), 
    schemeId, 
    schemeName: schemeObj?.schemeName || '', 
    roleId: '', 
    roleName: '' 
  };
  
  setSchemeRolePairs([updatedPair]);

  // If roles for this scheme are already cached, use them
  if (rolesByScheme[schemeId]) {
    
    return;
  }
  
  // Otherwise fetch them
 
  setRolesLoading(true);
  try {
    const roles = await ApprovedUserService.getRolesbySchemes(schemeId);
   
    
    let rolesList = [];
    if (Array.isArray(roles)) {
      rolesList = roles;
    } else if (roles?.payload && Array.isArray(roles.payload)) {
      rolesList = roles.payload;
    } else if (roles?.data && Array.isArray(roles.data)) {
      rolesList = roles.data;
    } else if (roles?.error) {
      console.error('Error in roles response:', roles.message);
    }
    
    // Transform roles to consistent format
    const transformedRoles = rolesList.map(role => ({
      id: role.id || role.roleId || role.value,
      name: role.name || role.roleName || role.label || '',
      roleName: role.roleName || role.name || role.label || ''
    }));
    
    setRolesByScheme((prev) => ({
      ...prev,
      [schemeId]: transformedRoles
    }));
    
  
  } catch (err) {
    console.error('Failed to fetch roles:', err);
    setRolesByScheme((prev) => ({ ...prev, [schemeId]: [] }));
  } finally {
    setRolesLoading(false);
  }
};

const handleRoleChange = (idx, roleId) => {
  const pair = schemeRolePairs[0] || {};
  // First try to find role in rolesByScheme with the current schemeId
  const availableRoles = rolesByScheme[pair.schemeId] || [];
  
  // Try different property names
  const roleObj = availableRoles.find((r) => 
    r.id === roleId || 
    r.roleId === roleId ||
    r.value === roleId
  );
  
  const updatedPair = {
    ...pair,
    roleId,
    roleName: roleObj?.name || roleObj?.roleName || roleObj?.label || ''
  };
  
  setSchemeRolePairs([updatedPair]);
};

  // const handleSaveSchemes = async () => {
  //   const roleScheme = schemeRolePairs
  //   .filter((pair) => pair.schemeId && pair.roleId)
  //   .map((pair) => ({
  //     schemeId: pair.schemeId,
  //     roleId: pair.roleId,
  //     id: pair.id,
  //     isActive: pair.isActive, // Use the correct property name
  //   }));

  //  try {
  //   const result = await ApprovedUserService.updateUserRoleScheme({
  //     userId,
  //     isActive: userStatus === 'active',
  //     roleScheme
  //   });

  //     if (result.error) {
  //      setConfirmMessage(`Failed to update schemes/roles: ${result.message}`);
  //     } else {
  //       setConfirmMessage('Schemes and roles updated!');
  //       setIsEditingSchemes(false);

  //       // Refresh user data
  //       const updatedRes = await ApprovedUserService.fetchUserById(userId);
        
  //       if (!updatedRes.error) {
  //         setUserData(updatedRes.payload);
  //         console.log("schemes rolesss "+updatedRes.payload)
  //         setSchemeRolePairs(
  //           (updatedRes.payload.roleSchemeResponses || []).map((r) => ({
  //             schemeId: r.schemeId,
  //             schemeName: r.schemeName,
  //             roleId: r.roleId,
  //             roleName: r.roleName
  //           }))
  //         );
  //       }
  //     }
  //     setConfirmOpen(true);
  //   } catch (err) {
  //     setConfirmMessage('Failed to update schemes/roles');
  //   }
  // };
  const handleSaveSchemes = async () => {
  // Ensure we only have one role
  const roleScheme = schemeRolePairs
    .filter((pair) => pair.schemeId && pair.roleId)
    .slice(0, 1) // Only take the first one
    .map((pair) => ({
      schemeId: pair.schemeId,
      roleId: pair.roleId,
      id: pair.id,
      isActive: pair.isActive,
    }));
console.log("roleScheme ",roleScheme)
   try {
    
    const result = await ApprovedUserService.updateUserRoleScheme({
      userId: userId,
      isActive: userStatus === 'active',
      roleScheme
    });

    if (result.error) {
      setConfirmMessage(`Failed to update role: ${result.message}`);
    } else {
      setConfirmMessage('Role updated successfully!');
      setIsEditingSchemes(false);

      // Refresh user data
      const updatedRes = await ApprovedUserService.fetchUserById(userId);
      
      if (!updatedRes.error) {
        setUserData(updatedRes.payload);
      setSchemeRolePairs(
  (payload.roleSchemeResponses || []).slice(0, 1).map((r) => ({
    id: r.id,
    schemeId: r.schemeId,
    schemeName: r.schemeName,
    roleId: r.roleId,
    roleName: r.roleName,
    isActive: r.isActive
  }))
);

      }
    }
    setConfirmOpen(true);
  } catch (err) {
    setConfirmMessage('Failed to update role');
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

        <MainCard title="User Details" sx={{ padding: 1 }}>
          {/* <Grid container spacing={4}> */}
            {/* Left Section */}
          <Grid container spacing={3}>
  {/* User Profile Card - Full Width Top */}
  <Grid item xs={12}>
    <Paper
      elevation={3}
      sx={{
        padding: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)'
        }
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Avatar Section */}
        <Grid item xs={12} sm={3} md={2}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              src={userData.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
              alt={userData.name}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          </Box>
        </Grid>

        {/* User Info Section */}
        <Grid item xs={12} sm={6} md={7}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              marginBottom: 1,
              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {userData.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ 
              marginBottom: 1,
              fontStyle: 'italic'
            }}>
              {userData.designation}
            </Typography>
            <Typography variant="body1" color="text.primary">
              {userData.roleSchemeResponses?.[0]?.roleName || 'Role not specified'}
            </Typography>
          </Box>
        </Grid>

        {/* Pen Number Section */}
        <Grid item xs={12} sm={3} md={3}>
          <Box sx={{
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 2,
            padding: 2,
            textAlign: 'center',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Employee ID
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {userData.penNumber || userData.id || 'NA'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  </Grid>

  {/* Tabs Section - Full Width */}
  <Grid item xs={12}>
    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{
          backgroundColor: '#f8f9fa',
          '& .MuiTab-root': {
            fontWeight: 'bold',
            fontSize: '1rem',
            minHeight: 60,
            paddingX: 5,
          }
        }}
      >
        <Tab label="Personal Details" />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center' }}>Actions</Box>} />
      </Tabs>

      {/* Details Tab Content */}
      {tabValue === 0 && (
        <Box sx={{ p: 3, minHeight: '400px' }}>
        {role === 'IT Admin' && (
       <Grid container spacing={3} sx={{ mb: 2 }}>
  <Box
    sx={{
      width: '100%',
      mb: 2,
      display: 'flex',
      justifyContent: 'flex-end',  // 👈 pushes button right
    }}
  >
    <Button
      variant="contained"
      color="error"
      onClick={() => setShowEmailModal(true)}
    >
      <SettingsIcon sx={{ mr: 1 }} /> Edit Email
    </Button>
  </Box>
</Grid>
)}
          <Grid container spacing={3}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1 }}>📞</Box>
                  Contact Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { icon: '✉️', label: 'Email', value: userData.email },
                    { icon: '📞', label: 'Phone', value: userData.mobileNumber || userData.phone || 'Not provided' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        backgroundColor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Work Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1 }}>💼</Box>
                  Work Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { icon: '🏢', label: 'Office Type', value: userData.officeType || 'Not specified' },
                    { icon: '📍', label: 'Office Location', value: userData.officeLocation || 'Not specified' },
                    { icon: '📅', label: 'Date of Join', value: userData.dateOfJoining ? new Date(userData.dateOfJoining).toLocaleDateString('en-GB') : userData.dateOfJoin ? new Date(userData.dateOfJoin).toLocaleDateString('en-GB') : 'Not specified' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        backgroundColor: 'secondary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Account Status */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1 }}>📊</Box>
                  Account Status
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip
                        label={userData.active ? 'Active' : 'Inactive'}
                        color={userData.active ? 'success' : 'default'}
                        size="large"
                        sx={{
                          fontWeight: 'bold', 
                          fontSize: '1rem',
                          px: 2,
                          py: 1
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Registered Date
                      </Typography>
                      <Typography variant="body1">
                        {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ mr: 1 }}>📋</Box>
                  Additional Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { icon: '🎂', label: 'Date of Birth', value: userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('en-GB') : 'Not specified' },
                    { icon: '⏰', label: 'Last Activity', value: userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : 'N/A' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <Box sx={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1">
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  </Grid>

            {/* Right Section */}
            <Grid item xs={12} sm={8} md={9} lg={9}>
              {/* Actions Tab */}
              {tabValue === 1 && (
                <Box sx={{ mt: 3 }}>
                 <Tabs
  value={innerTabValue}
  onChange={(e, newValue) => setInnerTabValue(newValue)}
  variant="scrollable"
  scrollButtons="auto"
  allowScrollButtonsMobile
  sx={{ mb: 2 }}
>
  <Tab label="Change Schemes & Roles" />
  <Tab label="Change Designations" />
  <Tab label="Change Office Type" />
  {userData.roleSchemeResponses?.[0]?.roleId === 1 && (
    <Tab label="Zone Manage" />
  )}
  <Tab label="Change user status" />
</Tabs>

                  {/* Change Schemes & Roles */}
                  <hr></hr>
                  {innerTabValue === 0 && (
          <Grid container spacing={3}>
                   {!isEditingSchemes ? (
                        <>
                          {/* --- VIEW MODE --- */}
                          {schemeRolePairs.length === 0 ? (
                            <Grid item xs={12}>
                              <Typography color="text.secondary">No schemes or roles assigned.</Typography>
                            </Grid>
                          ) : (
                            schemeRolePairs.map((pair, idx) => (
                              <Grid item xs={12} sm={6} md={4} key={idx} >
                                <Paper elevation={2} sx={{ p: 2, borderLeft: pair.active === false ? '4px solid red' : '4px solid green',background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', }}>
                                  <Typography variant="subtitle1" fontWeight="bold">{pair.schemeName}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Role: {pair.roleName}</Typography>
                                  
                                  {/* Container for Status and Date on the same row */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    
                                    {/* Status Chip */}
                                 
                                    <Chip
                                      label={pair.isActive === false ? 'Inactive' : 'Active'} // Use isActive
                                      color={pair.isActive === false ? 'error' : 'success'}
                                      size="small"
                                      sx={{ color: '#fff' }}
                                    />
                                    
                                    {/* 💥 NEW: Sample Date Display 💥 */}
                                    <Typography variant="caption" color="text.secondary">
                                      2024-10-25 {/* Note: If 'pair' had a date field (e.g., pair.startDate), you would use that here. */}
                                    </Typography>
                                  </Box>
                                  
                                </Paper>
                              </Grid>
                            ))
                          )}
                          {/* <Grid item xs={12}>
                            <Button variant="outlined" disabled={true}  startIcon={<EditIcon />} onClick={handleEditSchemes} sx={{ mt: 2 }}>
                              Edit Schemes & Roles
                            </Button>
                          </Grid> */}
                          <Grid item xs={12}>
                            <Button variant="outlined"  startIcon={<EditIcon />} onClick={handleEditSchemes} sx={{ mt: 2 }}>
                              Edit Schemes & Roles
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          {/* --- EDIT MODE --- */}
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>Edit Scheme & Role Assignments</Typography>
                          </Grid>
                          
                          {/* Dynamic Scheme/Role Pair Cards */}
                          {schemeRolePairs.map((pair, idx) => (
                            <Grid item xs={12} key={idx}>
                              <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', border: '1px solid #ddd' }}>
                                
                                {/* Scheme Select */}
                                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                                  <InputLabel id={`scheme-label-${idx}`}>Scheme</InputLabel>
                                  <Select
                                    labelId={`scheme-label-${idx}`}
                                    value={pair.schemeId}
                                    onChange={(e) => handleSchemeChange(idx, e.target.value)}
                                    disabled={schemesLoading}
                                    label="Scheme"
                                  >
                                    {allSchemes.map((s) => (
                                      <MenuItem key={s.id} value={s.id}>
                                        {s.schemeName}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                {/* Role Select */}
                                <FormControl fullWidth size="small" sx={{ flex: 1 }}>
                                  <InputLabel id={`role-label-${idx}`}>Role</InputLabel>
                                  <Select
                                    labelId={`role-label-${idx}`}
                                    value={pair.roleId}
                                    onChange={(e) => handleRoleChange(idx, e.target.value)}
                                    disabled={!pair.schemeId || rolesLoading}
                                    label="Role"
                                  >
                                    {/* The "rolesByScheme" state should handle loading the roles */}
                                    {(rolesByScheme[pair.schemeId] || []).map((r) => (
                                      <MenuItem key={r.id} value={r.id}>
                                        {r.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                
                                {/* Status Radio Buttons */}

<FormControl component="fieldset" sx={{ flex: '0 0 auto', minWidth: 160 }}>
  <RadioGroup
    row
    value={pair.isActive ? "active" : "inactive"} // Convert boolean to string
    onChange={(e) => handleSchemeRoleActiveChange(idx, e.target.value)}
  >
    <FormControlLabel
      value="active"
      control={<Radio size="small" color="primary" />}
      label="Active"
    />
    <FormControlLabel
      value="inactive"
      control={<Radio size="small" color="error" />}
      label="Inactive"
    />
  </RadioGroup>
</FormControl>

                                
                                {/* Remove Button */}
                                  {/* Replace with a more visible delete icon */}
                                {/* <IconButton 
                                  aria-label="remove" 
                                  onClick={() => handleRemovePair(idx)} 
                                  color="error"
                                  sx={{ flexShrink: 0, ml: { xs: 0, sm: 2 } }}
                                >
                                  <span style={{ fontSize: '1rem' }}>❌</span>
                                </IconButton> */}
                              </Paper>
                            </Grid>
                          ))}
                          
                          {/* Action Buttons */}
                          <Grid item xs={12}>
                            {/* <Button 
                              startIcon={<AddCircleOutlineIcon />} 
                              onClick={handleAddPair}
                              variant="outlined"
                            >
                              Add Scheme/Role
                            </Button> */}
                          </Grid>
                          <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={handleSaveSchemes}>
                              Save Changes
                            </Button>
                            <Button sx={{ ml: 2 }} onClick={() => setIsEditingSchemes(false)} variant="outlined" color="secondary">
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
  <Grid item xs={12}>
    <Card 
      elevation={1} 
      sx={{ 
        p: 2, 
        borderRadius: 2,
        border: '1px solid',
        borderColor: isEditingDesignation ? 'primary.main' : 'grey.200',
       background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Designation
          </Typography>
          {!isEditingDesignation ? (
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
              {userData.designation || 'Not assigned'}
            </Typography>
          ) : (
            <FormControl size="small" sx={{ minWidth: 200, mt: 1 }}>
              <Select
                value={selectedDesignationId || ''}
                onChange={handleDesignationSelect}
                disabled={designationLoading}
                displayEmpty
                sx={{ fontWeight: 'medium' }}
              >
                <MenuItem value="" disabled>
                  Select designation
                </MenuItem>
                {designationOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.designationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isEditingDesignation ? (
            <Tooltip title="Edit Designation">
              <IconButton
                size="large"
                onClick={handleEditDesignation}
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.light' }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save">
                <IconButton
                  size="large"
                  onClick={handleSaveDesignationClick}
                  disabled={designationLoading || !selectedDesignationId}
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                    color: 'success.main',
                    '&:hover': { backgroundColor: 'success.light' }
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton
                  size="large"
                  onClick={handleCancelDesignation}
                  disabled={designationLoading}
                  sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    boxShadow: 1,
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.light' }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {isEditingDesignation && designationError && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {designationError}
        </Typography>
      )}
    </Card>
  </Grid>
</Grid>
                  )}

                  {innerTabValue === 2 && (
                 <Grid container spacing={2} alignItems="center">
  <Grid item xs={12}>
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid #e0e0e0'
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'primary.main',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <BusinessIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
          Office Information
        </Typography>
        
        {!isEditingOffice && (
          <Tooltip title="Edit Office Information">
            <IconButton
              aria-label="edit"
              onClick={handleEditOffice}
              sx={{
                color: 'primary.main',
                backgroundColor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* VIEW MODE */}
      {!isEditingOffice ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                backgroundColor: 'white',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Office Type
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BusinessCenterIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {officeType || 'Not set'}
                </Typography>
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                p: 2, 
                borderRadius: 2,
                backgroundColor: 'white',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                Office Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon sx={{ mr: 1, color: 'secondary.main', fontSize: '1.2rem' }} />
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'medium' }}>
                  {selectedTaluk?.label || office || 'Not selected'}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* EDIT MODE */
        <Box sx={{ 
          backgroundColor: 'white',
          p: 3,
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'primary.light',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3, color: 'primary.main' }}>
            Update Office Details
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Select District
                </Typography>
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
                      placeholder="Choose district..."
                      variant="outlined"
                      size="medium"
                      error={!!errors.district}
                      helperText={errors.district}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Select Office
                </Typography>
                <Autocomplete
                  disablePortal
                  options={filteredTaluks}
                  getOptionLabel={(option) => option?.label || ''}
                  value={selectedTaluk}
                  onChange={handleTalukChange}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  disabled={!selectedDistrict}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={selectedDistrict ? "Choose office..." : "Select district first"}
                      variant="outlined"
                      size="medium"
                      error={!!errors.office}
                      helperText={errors.office}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>

          {/* Status Messages */}
          {errorMessage && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                alignItems: 'center'
              }}
            >
              {errorMessage}
            </Alert>
          )}
          
          {successMessage && (
            <Alert 
              severity="success" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                alignItems: 'center'
              }}
            >
              {successMessage}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <Button
              onClick={handleSaveOfficeChange}
              variant="contained"
              color="primary"
              disabled={loading || !selectedDistrict || !selectedTaluk}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 'bold',
                minWidth: 120,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button 
              onClick={handleCancelEdit} 
              variant="outlined" 
              disabled={loading}
              startIcon={<CloseIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 'bold',
                minWidth: 120,
                borderColor: 'grey.400',
                '&:hover': {
                  borderColor: 'grey.600',
                  backgroundColor: 'grey.50'
                }
              }}
            >
              Cancel
            </Button>
          </Box>

          {/* Helper Text */}
          {!selectedDistrict && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              💡 Please select a district first to see available offices
            </Typography>
          )}
        </Box>
      )}
    </Paper>
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
                                   background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                                  </Typography><Typography variant="h6" >{z.zone_type_name}</Typography>
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
                <Card variant="outlined" sx={{ p: 2, mt: 2,background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', }}>
  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
    <Typography variant="subtitle1" fontWeight="bold">
      User Status
    </Typography>
    <Chip
      label={userStatus === 'active' ? 'Active' : 'Inactive'}
      color={userStatus === 'active' ? 'success' : 'default'}
      size="small"
    />
  </Box>

  <FormControl component="fieldset" fullWidth>
    <RadioGroup row value={userStatus} onChange={handleUserStatusChange} disabled={statusUpdating}>
      <FormControlLabel 
        value="active" 
        control={<Radio />} 
        label="Active" 
        sx={{ mr: 3 }}
      />
      <FormControlLabel 
        value="inactive" 
        control={<Radio />} 
        label="Inactive" 
      />
    </RadioGroup>

    {statusUpdating && (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <CircularProgress size={16} sx={{ mr: 1 }} />
        <Typography variant="caption">Updating...</Typography>
      </Box>
    )}
    
    {statusMessage && (
      <Typography 
        variant="caption" 
        sx={{ 
          mt: 1, 
          display: 'block',
          color: statusMessage.toLowerCase().includes('success') ? 'success.main' : 'error.main'
        }}
      >
        {statusMessage}
      </Typography>
    )}
  </FormControl>
</Card>
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
      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }} align='center'>Select Zone</Typography>
        <Select
          value={selectedZoneIdToAdd}
          onChange={(e) => setSelectedZoneIdToAdd(Number(e.target.value))}
          displayEmpty
        >
          <MenuItem value="">
            <em>Select a zone</em>
          </MenuItem>
          {availableZones.map((zone) => (
  <MenuItem key={zone.zoneId} value={zone.zoneId}>
    <Box display="flex" justifyContent="space-between" width="100%">
      <Typography variant="body1">
        {zone.zoneNameEn}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {zone.zoneType}
      </Typography>
    </Box>
  </MenuItem>
))}

        </Select>
        {addZoneError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {addZoneError}
          </Typography>
        )}
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


{/* Designation Change Confirmation Dialog */}
<Dialog open={designationConfirmOpen} onClose={() => setDesignationConfirmOpen(false)}>
  <DialogTitle sx={{background:"#04255e",color:"white"}}>Confirm Designation Change</DialogTitle>
  <DialogContent sx={{ mt: 2 }}>
    <Typography>
      Are you sure you want to change the designation to{" "}
      <strong>
        {designationOptions.find(d => d.id === selectedDesignationId)?.designationName}
      </strong>
      ?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDesignationConfirmOpen(false)}>Cancel</Button>
    <Button 
      onClick={handleSaveDesignation} 
      variant="contained" 
      color="primary"
    >
      Confirm Change
    </Button>
  </DialogActions>
</Dialog>



  {/* 💥 NEW USER STATUS CONFIRMATION DIALOG 💥 */}
  <Dialog open={isStatusConfirmOpen} onClose={() => setIsStatusConfirmOpen(false)}>
    <DialogTitle sx={{ background: pendingUserStatus === 'inactive' ? "#d32f2f" : "#04255e", color: "white" }}>
      {pendingUserStatus === 'inactive' ? 'Warning: Deactivate User' : 'Confirm Activate User'}
    </DialogTitle>
    <DialogContent sx={{ mt: 2 }}>
      <Typography>
        Are you sure you want to change the user status to{" "}
        <strong>{pendingUserStatus.toUpperCase()}</strong>?
      </Typography>
      {pendingUserStatus === 'inactive' && (
        <Typography color="error" sx={{ mt: 1 }}>
          Deactivating a user will block their access to the system.
        </Typography>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setIsStatusConfirmOpen(false)}>Cancel</Button>
      <Button 
        onClick={handleConfirmStatusChange} 
        variant="contained" 
        color={pendingUserStatus === 'inactive' ? 'error' : 'primary'}
      >
        {pendingUserStatus === 'inactive' ? 'Deactivate' : 'Activate'}
      </Button>
    </DialogActions>
  </Dialog>



<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
  <DialogTitle sx={{ background: "#04255e", color: "white" }}>
    Update Status
  </DialogTitle>
  <DialogContent>
    <Typography sx={{ mt: 2 }}>{confirmMessage}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmOpen(false)} variant="contained" color="primary">
      OK
    </Button>
  </DialogActions>
</Dialog>
<Dialog 
  open={showEmailModal} 
  onClose={() => !emailUpdating && setShowEmailModal(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: '12px',
      overflow: 'hidden'
    }
  }}
>
  <DialogTitle sx={{ 
    backgroundColor: '#04255e', 
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    py: 2
  }}>
    Edit Email Address
  </DialogTitle>
  
  <DialogContent sx={{ p: 3 }}>
    {/* Warning Message */}
    <Box sx={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffeeba',
      borderRadius: '8px',
      p: 2,
      mb: 3,
      mt:3,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5
    }}>
      <Box component="span" sx={{ fontSize: '1.5rem',  }}>⚠️</Box>
      <Typography sx={{ color: '#856404', fontSize: '0.95rem' }}>
        <strong>Admin Responsibility:</strong> Changing email is your full responsibility. 
        Please verify the new email address is correct before saving.
      </Typography>
    </Box>

    {/* Email Input */}
    <TextField
      fullWidth
      label="New Email Address"
      type="email"
      value={newEmail}
      onChange={(e) => {
        setNewEmail(e.target.value);
        setEmailError('');
        setEmailSuccess('');
      }}
      disabled={emailUpdating}
      error={!!emailError}
      helperText={emailError}
      placeholder="Enter new email address"
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          '&.Mui-focused fieldset': {
            borderColor: '#04255e',
            borderWidth: '2px'
          }
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#04255e'
        }
      }}
    />

    {/* Success Message */}
    {emailSuccess && (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 2,
        p: 1.5,
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '6px',
        color: '#155724'
      }}>
        <CheckCircleIcon sx={{ fontSize: '1.2rem' }} />
        <Typography variant="body2">{emailSuccess}</Typography>
      </Box>
    )}
  </DialogContent>
  
  <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
    <Button
      onClick={() => {
        setShowEmailModal(false);
        setNewEmail('');
        setEmailError('');
        setEmailSuccess('');
      }}
      disabled={emailUpdating}
      variant="outlined"
      sx={{
        borderRadius: '6px',
        px: 3,
        py: 1,
        borderColor: '#ced4da',
        color: '#495057',
        '&:hover': {
          borderColor: '#adb5bd',
          backgroundColor: '#f8f9fa'
        }
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleChangeEmail}
      disabled={emailUpdating || !newEmail.trim()}
      variant="contained"
      sx={{
        backgroundColor: '#04255e',
        borderRadius: '6px',
        px: 3,
        py: 1,
        '&:hover': {
          backgroundColor: '#05307a',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(4,37,94,0.2)'
        },
        '&:disabled': {
          backgroundColor: '#6c757d'
        }
      }}
    >
      {emailUpdating ? (
        <>
          <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
          Updating...
        </>
      ) : (
        'Save Changes'
      )}
    </Button>
  </DialogActions>
</Dialog>
    </Grid>
  );
};

export default Roles;