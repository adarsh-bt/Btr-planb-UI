import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  FormControl as MuiFormControl,
  Autocomplete,
  Typography,
  Alert,
  Stack,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Checkbox
} from '@mui/material';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enIN } from 'date-fns/locale';

import authservice from '../services/authservice';
import RegisterService from 'pages/authentication/services/registerservice';

const Register = ({ onBack }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState('PEN');
  const [penNumber, setPenNumber] = useState('');
  const [tenNumber, setTenNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [designations, setDesignations] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const [districtId, setDistrictId] = useState(null);
  const [talukId, setTalukId] = useState(null);
  const [officeType, setOfficeType] = useState('');

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    dateOfJoining: '',
    dateOfBirth: '',
    idNumber: '',
    district: '',
    office: ''
  });

  // State for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingSubmissionData, setPendingSubmissionData] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false); // Checkbox state

  // const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const response = await RegisterService.getDesignations();
        if (response.payload && Array.isArray(response.payload)) {
         
          setDesignations(response.payload);
        } else {
          setErrorMessage(response.message || 'Failed to fetch designations.');
        }
      } catch (err) {
        setErrorMessage('Failed to fetch designations: ' + err.message);
      }
    };

    fetchDesignations();
  }, []);

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

  const getAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return false;
    // Check year is in a reasonable range
    const year = date.getFullYear();
    if (year < 1900 || year > new Date().getFullYear()) return false;
    return true;
  };

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

  const validateField = (field) => {
    switch (field) {
      case 'fullName':
        return !fullName ? 'Full Name is required.' : null;
      case 'email':
        if (!email) return 'Email Address is required.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return !emailRegex.test(email) ? 'Invalid email format.' : null;
      case 'phone':
        if (!phone) return 'Phone Number is required.';
        return !/^\d{10}$/.test(phone) ? 'Phone Number must be exactly 10 digits.' : null;
      case 'designation':
        return !designation ? 'Designation is required.' : null;
      case 'dateOfBirth':
        if (!dateOfBirth) return 'Date of Birth is required.';
        if (!isValidDate(dateOfBirth)) return 'Please enter a valid date of birth.';
        if (new Date(dateOfBirth) > new Date()) return 'Date of Birth cannot be in the future.';
        if (getAge(dateOfBirth) < 18) return 'You must be at least 18 years old to register.';
        return null;

      case 'dateOfJoining':
        if (!dateOfJoining) return 'Date of Joining is required.';
        if (!isValidDate(dateOfJoining)) return 'Please enter a valid date of joining.';
        if (new Date(dateOfJoining) > new Date()) return 'Date of Joining cannot be in the future.';
        return null;

        if (getAge(dateOfBirth) < 18) {
          return 'You must be at least 18 years old to register.';
        }
        return null;

      case 'idNumber':
        if (idType === 'PEN') {
          if (!penNumber) return 'PEN Number is required.';
          return penNumber.length !== 7 ? 'PEN Number must be exactly 7 characters.' : null;
        }
        if (idType === 'TEN') {
          if (!tenNumber) return 'PEN/TEN Number is required.';
          return tenNumber.length !== 7 || tenNumber.length > 7 ? 'TEN Number must be between 6 and 10 characters.' : null;
        }
        return null;
      case 'district':
        return !selectedDistrict ? 'Please select a District.' : null;
      case 'office':
        return !selectedTaluk ? 'Please select an Office.' : null;
      default:
        return null;
    }
  };

  const handleFullNameChange = (e) => {
    const value = e.target.value;
    if (/^[A-Za-z\s.]*$/.test(value) && value.length <= 32) {
      setFullName(value);
      setErrors((prevErrors) => ({ ...prevErrors, fullName: '' })); // Clear error
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value.length <= 256) {
      setEmail(e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, email: '' })); // Clear error
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
      setErrors((prevErrors) => ({ ...prevErrors, phone: '' })); // Clear error
    }
  };

    const handlePenBlur = () => {
  if (penNumber && penNumber.length === 6) {
    const paddedPen = penNumber.padStart(7, '0'); // makes 6 → 7 digits
    setPenNumber(paddedPen);
  }else{
    
  }
};

  const handlePenChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPenNumber(value);
      setErrors((prevErrors) => ({ ...prevErrors, idNumber: '' })); // Clear error
    }
  };

  const handleTenChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTenNumber(value);
      setErrors((prevErrors) => ({ ...prevErrors, idNumber: '' })); // Clear error
    }
  };

  const handleDesignationChange = (e) => {
    setDesignation(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, designation: '' })); // Clear error
  };

  const handleDateOfJoiningChange = (e) => {
    setDateOfJoining(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, dateOfJoining: '' })); // Clear error
  };

  const handleDateOfBirthChange = (e) => {
    setDateOfBirth(e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: '' })); // Clear error
  };

  const handleDistrictChange = (event, newValue) => {
    setSelectedDistrict(newValue);
    setSelectedTaluk(null);
    setDistrictId(null);
    setTalukId(null);
    setOfficeType('');
    setErrors((prevErrors) => ({ ...prevErrors, district: '' })); // Clear error
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
      setErrors((prevErrors) => ({ ...prevErrors, office: '' })); // Clear error
    } else {
      setOfficeType('');
      setDistrictId(null);
      setTalukId(null);
      setErrors((prevErrors) => ({ ...prevErrors, office: '' })); // Clear error
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // Get designation name by ID
  const getDesignationName = (designationId) => {
    const des = designations.find(d => d.id === designationId);
    return des ? des.designationName : 'N/A';
  };

  // Open confirmation dialog with form data
  const openConfirmationDialog = () => {
    // First validate all fields
    let newErrors = {};
    let isValid = true;

    for (const field in errors) {
      const message = validateField(field);
      if (message) {
        newErrors[field] = message;
        isValid = false;
      } else {
        newErrors[field] = '';
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      return; // Stop if validation fails
    }

    const idNumber = idType === 'PEN' ? penNumber : tenNumber;
    
    // Store the data for submission
    setPendingSubmissionData({
      name: fullName,
      email: email,
      mobileNumber: phone,
      penNumber: idType + idNumber,
      designationId: designation,
      dateOfBirth: dateOfBirth,
      dateOfJoining: dateOfJoining,
      officeType: officeType,
      distOfficeId: districtId,
      desTalukOfficeId: talukId
    });

    // Reset confirmation checkbox
    setIsConfirmed(false);
    // Open confirmation dialog
    setConfirmDialogOpen(true);
  };

  // Close confirmation dialog
  const closeConfirmationDialog = () => {
    setConfirmDialogOpen(false);
    setPendingSubmissionData(null);
    setIsConfirmed(false);
  };

  // Handle checkbox change
  const handleConfirmationCheckbox = (e) => {
    setIsConfirmed(e.target.checked);
  };

  // Proceed with registration after confirmation
  const handleConfirmRegistration = async () => {
    closeConfirmationDialog();
    
    if (!pendingSubmissionData) return;

    try {
      setLoading(true);
      const userDatas = await authservice.registration(pendingSubmissionData);
      setLoading(false);
      
      if (userDatas.status === 201) {
        setSuccessMessage('Registration successfully submitted. Please wait for the approval.');
        setErrorMessage('');
        // Clear the form fields
        setFullName('');
        setEmail('');
        setPhone('');
        setIdType('PEN');
        setPenNumber('');
        setTenNumber('');
        setDesignation('');
        setDateOfJoining('');
        setDateOfBirth('');
        setSelectedDistrict(null);
        setSelectedTaluk(null);
        setDistrictId(null);
        setTalukId(null);
        setOfficeType('');
      } else {
        setErrorMessage(userDatas.message);
      }
    } catch (err) {
      setErrorMessage('Registration failed.');
    } finally {
      setPendingSubmissionData(null);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    openConfirmationDialog();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enIN}>
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
      {errorMessage && (
        <Stack sx={{ width: '100%', marginBottom: '.5rem', background: '#fffaef' }} spacing={1}>
          <center>
            <Alert severity="warning" sx={{ width: 'max-content', textAlign: 'center' }}>
              {errorMessage}
            </Alert>
          </center>
        </Stack>
      )}

      {!errorMessage && successMessage && (
        <Stack sx={{ width: '100%', marginBottom: '.5rem' }} spacing={2}>
          <center>
            <Alert severity="success" sx={{ textAlign: 'center', width: '100%', maxWidth: 400, margin: 'auto' }}>
              {successMessage}
            </Alert>
          </center>
        </Stack>
      )}

      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Full Name{' '}
            <Typography component="span" color="error">
              *
            </Typography>
          </>
        }
        value={fullName}
        onChange={handleFullNameChange}
        error={!!errors.fullName}
        helperText={errors.fullName}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            top: '50%',
            borderRadius: '0.5rem',
            fontSize: '14px',
            paddingTop: '7.5px'
          }
        }}
      />

      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Email Address{' '}
            <Typography component="span" color="error">
              *
            </Typography>
          </>
        }
        value={email}
        onChange={handleEmailChange}
        error={!!errors.email}
        helperText={errors.email}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            top: '50%',
            borderRadius: '0.5rem',
            fontSize: '14px',
            paddingTop: '7.5px'
          }
        }}
      />

      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Phone Number{' '}
            <Typography component="span" color="error">
              *
            </Typography>
          </>
        }
        value={phone}
        onChange={handlePhoneChange}
        error={!!errors.phone}
        helperText={errors.phone}
        inputProps={{
          inputMode: 'numeric',
          maxLength: 10
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            top: '50%',
            borderRadius: '0.5rem',
            fontSize: '14px',
            paddingTop: '7.5px'
          }
        }}
      />

      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <RadioGroup row value={idType} onChange={(e) => setIdType(e.target.value)}>
          <FormControlLabel value="PEN" control={<Radio />} label="PEN" />
          <FormControlLabel value="TEN" control={<Radio />} label="TEN" />
        </RadioGroup>
      </FormControl>

      {idType === 'PEN' ? (
        <TextField
          variant="outlined"
          label="PEN"
          value={penNumber}
          onChange={handlePenChange}
          onBlur={handlePenBlur}
          inputProps={{ maxLength: 7 }}
          error={!!errors.idNumber}
          helperText={errors.idNumber ? errors.idNumber : ' '}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              top: '50%',
              borderRadius: '1rem',
              fontSize: '14px',
              paddingTop: '7.5px'
            }
          }}
        />
      ) : (
        <TextField
          variant="outlined"
          label="TEN"
          value={tenNumber}
          onChange={handleTenChange}
          inputProps={{ maxLength: 7 }}
          error={!!errors.idNumber}
          helperText={errors.idNumber ? errors.idNumber : ' '}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              top: '50%',
              borderRadius: '0.5rem',
              fontSize: '14px',
              paddingTop: '7.5px'
            }
          }}
        />
      )}

      <MuiFormControl
        fullWidth
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            fontSize: '14px',
            paddingTop: '7.5px'
          }
        }}
        error={!!errors.designation}
      >
        <InputLabel>
          Designation{' '}
          <Typography component="span" color="error">
            *
          </Typography>
        </InputLabel>
        <Select value={designation} onChange={handleDesignationChange} error={!!errors.designation}>
          {designations.map((designation) => (
            <MenuItem key={designation.id} value={designation.id}>
              {designation.designationName}
            </MenuItem>
          ))}
        </Select>
        {errors.designation && <FormHelperText error>{errors.designation}</FormHelperText>}
      </MuiFormControl>

   <Grid container spacing={2} sx={{ mb: 2 }}>
  <Grid item xs={6}>
  <DatePicker
    label={
      <>
        Joining of Service{' '}
        <Typography component="span" color="error">
          *
        </Typography>
      </>
    }
    value={dateOfJoining ? new Date(dateOfJoining) : null}
    onChange={(newValue) => {
      if (newValue) {
        const year = newValue.getFullYear();
        const month = String(newValue.getMonth() + 1).padStart(2, '0');
        const day = String(newValue.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        handleDateOfJoiningChange({ target: { value: localDate } });
      } else {
        handleDateOfJoiningChange({ target: { value: '' } });
      }
    }}
    maxDate={new Date()}
    renderInput={(params) => (
      <TextField
        {...params}
        fullWidth
        error={!!errors.dateOfJoining}
        helperText={errors.dateOfJoining}
        inputProps={{
          ...params.inputProps,
          readOnly: true,
        }}
      />
    )}
    inputFormat="dd/MM/yyyy"
  />
</Grid>

 <Grid item xs={6}>
  <DatePicker
    label={
      <>
        Date of Birth{' '}
        <Typography component="span" color="error">
          *
        </Typography>
      </>
    }
    value={dateOfBirth ? new Date(dateOfBirth) : null}
    onChange={(newValue) => {
      if (newValue) {
        const year = newValue.getFullYear();
        const month = String(newValue.getMonth() + 1).padStart(2, '0');
        const day = String(newValue.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;

        handleDateOfBirthChange({ target: { value: localDate } });
      } else {
        handleDateOfBirthChange({ target: { value: '' } });
      }
    }}
    maxDate={new Date()}
    renderInput={(params) => (
      <TextField
        {...params}
        fullWidth
        error={!!errors.dateOfBirth}
        helperText={errors.dateOfBirth}
        inputProps={{
          ...params.inputProps,
          readOnly: true,
        }}
      />
    )}
    inputFormat="dd/MM/yyyy"
  />
</Grid>
</Grid>

      <MuiFormControl fullWidth sx={{ mb: 2 }} error={!!errors.district}>
        <Autocomplete
          disablePortal
          options={districts.map((district) => ({
            distId: district.districtOfficeId,
            distOfficeNameEn: district.districtOfficeNameEn
          }))}
          getOptionLabel={(option) => (option ? option.distOfficeNameEn.slice(16) : '')}
          value={selectedDistrict}
          onChange={handleDistrictChange}
          isOptionEqualToValue={(option, value) => option?.distId === value?.distId}
          renderInput={(params) => <TextField {...params} label="District" required variant="outlined" />}
        />
        {errors.district && <FormHelperText error>{errors.district}</FormHelperText>}
      </MuiFormControl>

      <MuiFormControl fullWidth sx={{ mb: 2 }} error={!!errors.office}>
        <Autocomplete
          disablePortal
          options={filteredTaluks}
          getOptionLabel={(option) => (option ? option.label : '')}
          value={selectedTaluk}
          onChange={handleTalukChange}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label="Office" required variant="outlined" />}
        />
        {errors.office && <FormHelperText error>{errors.office}</FormHelperText>}
      </MuiFormControl>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ borderRadius: '20px', fontSize: '16px' }}
            onClick={handleRegisterSubmit}
            disabled={loading}
          >
            {loading ? <Typography sx={{ color: 'blue' }}>Registering...</Typography> : 'Register'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" onClick={onBack} sx={{ fontSize: '15px', color: 'blue', cursor: 'pointer' }} textAlign="center">
            {'Back to Sign In'}
          </Typography>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={closeConfirmationDialog}
        aria-labelledby="confirm-registration-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="confirm-registration-dialog-title" sx={{ bgcolor: '#d40606', color: 'white' ,alignItems: 'center', display: 'flex', justifyContent: 'center'}}>
          <Typography variant="h5" fontWeight="bold">Confirm Registration Details</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText component="div">
            <Typography variant="body1" gutterBottom fontWeight="bold">
              Please verify your information before submitting:
            </Typography>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{fullName || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{email || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{phone || 'N/A'}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">ID Type:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{idType}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">ID Number:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {idType === 'PEN' ? penNumber : tenNumber}
                  </Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Designation:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{getDesignationName(designation)}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Date of Joining:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{formatDate(dateOfJoining)}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">{formatDate(dateOfBirth)}</Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">District:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {selectedDistrict?.distOfficeNameEn?.slice(16) || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={5}>
                  <Typography variant="body2" color="text.secondary">Office:</Typography>
                </Grid>
                <Grid item xs={7}>
                  <Typography variant="body2" fontWeight="medium" color="text.primary">
                    {selectedTaluk?.label || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {/* Confirmation Checkbox */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={isConfirmed}
                onChange={handleConfirmationCheckbox}
                color="primary"
                id="confirm-checkbox"
              />
              <Typography 
                component="label" 
                htmlFor="confirm-checkbox"
                variant="body2"
                sx={{ cursor: 'pointer', fontWeight: 'medium' ,color: 'text.primary'}}
              >
                I confirm that all the information provided above is accurate and complete to the best of my knowledge.
              </Typography>
            </Box>
            
            <Typography variant="h6" color="#da0707" sx={{ mt: 2, fontWeight: 'bold' ,textAlign: 'center'}}>
              Please ensure all information is correct before confirming.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={closeConfirmationDialog} 
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRegistration} 
            color="primary" 
            variant="contained"
            disabled={!isConfirmed} // Button is disabled until checkbox is checked
            autoFocus
          >
            Confirm & Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </LocalizationProvider>
  );
};

export default Register;