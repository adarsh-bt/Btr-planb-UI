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
  FormHelperText
} from '@mui/material';
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
    office: '',
  });

  const today = new Date().toISOString().split('T')[0];

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





  const filteredTaluks = selectedDistrict
    ? [
        { id: selectedDistrict.distId, label: selectedDistrict.distOfficeNameEn },
        ...(selectedDistrict.distId === 1
          ? [
              { id: 1, label: 'Directorate Office' }
            ]
          : []),
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
      case 'dateOfJoining':
        return (!dateOfJoining || new Date(dateOfJoining) > new Date()) ? 'Date of Joining cannot be in the future.' : null;
      case 'dateOfBirth':
        return (!dateOfBirth || new Date(dateOfBirth) > new Date()) ? 'Date of Birth cannot be in the future.' : null;
      case 'idNumber':
        if (idType === 'PEN') {
          if (!penNumber) return 'PEN/TEN Number is required.';
          return penNumber.length !== 10 ? 'PEN Number must be exactly 10 characters.' : null;
        }
        if (idType === 'TEN') {
          if (!tenNumber) return 'PEN/TEN Number is required.';
          return (tenNumber.length < 6 || tenNumber.length > 10) ? 'TEN Number must be between 6 and 10 characters.' : null;
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
      setErrors(prevErrors => ({ ...prevErrors, fullName: '' })); // Clear error
    }
  };

  const handleEmailChange = (e) => {
    if (e.target.value.length <= 30) {
      setEmail(e.target.value);
      setErrors(prevErrors => ({ ...prevErrors, email: '' })); // Clear error
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
      setErrors(prevErrors => ({ ...prevErrors, phone: '' })); // Clear error
    }
  };

  const handlePenChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPenNumber(value);
      setErrors(prevErrors => ({ ...prevErrors, idNumber: '' })); // Clear error
    }
  };

  const handleTenChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTenNumber(value);
      setErrors(prevErrors => ({ ...prevErrors, idNumber: '' })); // Clear error
    }
  };

  const handleDesignationChange = (e) => {
    setDesignation(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, designation: '' })); // Clear error
  };

  const handleDateOfJoiningChange = (e) => {
    setDateOfJoining(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, dateOfJoining: '' })); // Clear error
  };

  const handleDateOfBirthChange = (e) => {
    setDateOfBirth(e.target.value);
    setErrors(prevErrors => ({ ...prevErrors, dateOfBirth: '' })); // Clear error
  };

  const handleDistrictChange = (event, newValue) => {
    setSelectedDistrict(newValue);
    setSelectedTaluk(null);
    setDistrictId(null);
    setTalukId(null);
    setOfficeType('');
    setErrors(prevErrors => ({ ...prevErrors, district: '' })); // Clear error
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
      setErrors(prevErrors => ({ ...prevErrors, office: '' })); // Clear error
    } else {
      setOfficeType('');
      setDistrictId(null);
      setTalukId(null);
      setErrors(prevErrors => ({ ...prevErrors, office: '' })); // Clear error
    }
  };


  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    let isValid = true;

    // Validate all fields
    for (const field in errors) {
      const message = validateField(field);
      if (message) {
        newErrors[field] = message;
        isValid = false;
      } else {
        newErrors[field] = ''; // Clear any previous error messages
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      return; // Stop submission if there are errors
    }

    const idNumber = idType === 'PEN' ? penNumber : tenNumber;

    const userData = {
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
    };

    try {
      setLoading(true);
      const userDatas = await authservice.registration(userData);
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
        // setErrors({ // Also clear any lingering errors
        //   fullName: '',
        //   email: '',
        //   phone: '',
        //   designation: '',
        //   dateOfJoining: '',
        //   dateOfBirth: '',
        //   idNumber: '',
        //   district: '',
        //   office: '',
        // });
      } else {
        setErrorMessage(userDatas.message);
      }
    } catch (err) {
      setErrorMessage('Registration failed.');
    }
  };

  return (
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
        value={fullName} onChange={handleFullNameChange}
        error={!!errors.fullName}
        helperText={errors.fullName}
        // onChange={(e) => {
        //   const value = e.target.value;
        //   // Allow only alphabets, spaces, and periods, and limit length to 20
        //   if (/^[A-Za-z\s.]*$/.test(value) && value.length <= 32) {
        //     setFullName(value); // Update state if value matches the pattern and length <= 20
        //   }
        // }}
        // error={errors.fullName}
        // helperText={errors.fullName ? errors.fullName : ''}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem' // Custom border-radius
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
          alignItems: 'center',
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem'
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
            borderRadius: '1rem'
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
          inputProps={{ maxLength: 10 }}
          error={!!errors.idNumber}
          helperText={errors.idNumber ? errors.idNumber : " "}
          sx={{ mb: 2 }}
        />
      
      ) : (
        <TextField
          variant="outlined"
          label="TEN"
          value={tenNumber}
          onChange={handleTenChange}
          inputProps={{ maxLength: 10 }}
          error={!!errors.idNumber}
          helperText={errors.idNumber ? errors.idNumber : " "}
          sx={{ mb: 2 }}
        />
      )}

     <MuiFormControl fullWidth sx={{ mb: 2 }} error={!!errors.designation}>
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
          <TextField
            fullWidth
            variant="outlined"
            label={
              <>
                Date of Joining{' '}
                <Typography component="span" color="error">
                  *
                </Typography>
              </>
            }
            type="date"
            value={dateOfJoining}
            onChange={handleDateOfJoiningChange}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dateOfJoining}
            helperText={errors.dateOfJoining}
          />
        </Grid>

      <Grid item xs={6}>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <>
                Date of Birth{' '}
                <Typography component="span" color="error">
                  *
                </Typography>
              </>
            }
            type="date"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth}
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
          getOptionLabel={(option) => (option ? option.distOfficeNameEn : '')}
          value={selectedDistrict}
          onChange={handleDistrictChange}
          isOptionEqualToValue={(option, value) => option?.distId === value?.distId}
          renderInput={(params) => <TextField {...params} label="Districts" required variant="outlined" />}
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
            sx={{ borderRadius: '20px' }}
            onClick={handleRegisterSubmit}
            disabled={loading} // Disable the button while loading
          >
            {loading ? <Typography sx={{ color: 'blue' }}>Registering...</Typography> : 'Register'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" onClick={onBack} sx={{ color: 'blue', cursor: 'pointer' }} textAlign="center">
            {'Back to Sign In'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
