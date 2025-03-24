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
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Store the entire district object
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState(null); // Store the entire taluk object
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);

  const [designations, setDesignations] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [loading, setLoading] = useState(false);

  const [districtId, setDistrictId] = useState(null); // Initialize to null
  const [talukId, setTalukId] = useState(null); // Initialize to null
  const [officeType, setOfficeType] = useState(''); // Initialize to empty string

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    designation: false,
    dateOfJoining: false,
    dateOfBirth: false,
    idNumber: false,
    office: false,
    taluk: false
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
          setError(response.message || 'Failed to fetch districts: Invalid data format.');
        }
      } catch (err) {
        setError('Failed to fetch districts: ' + err.message);
      } finally {
        // setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchTaluks = async () => {
      if (selectedDistrict) {
        // setLoadingTaluks(true);
        try {
          const response = await RegisterService.getTaluks(selectedDistrict.distId);
          if (response.payload && Array.isArray(response.payload)) {
            setTaluks(response.payload);
          } else {
            setError(response.message || 'Failed to fetch taluks: Invalid data format.');
          }
        } catch (err) {
          setError('Failed to fetch taluks: ' + err.message);
        } finally {
          // setLoadingTaluks(false);
        }
      } else {
        setTaluks([]);
        setSelectedTaluk(null);
      }
    };

    fetchTaluks();
  }, [selectedDistrict]);

  const handleDistrictChange = (event, newValue) => {
    setSelectedDistrict(newValue);
    setSelectedTaluk(null); // Reset selectedTaluk when district changes
    //......//
    setDistrictId(null); // clear values
    setTalukId(null);
    setOfficeType('');
  };

  const handleTalukChange = (event, newValue) => {
    setSelectedTaluk(newValue);

    if (newValue) {
      const label = newValue.label;

      if (label?.startsWith('District Office')) {
        // If the selected value is a district
        setOfficeType('District');

        setDistrictId(newValue.id);
        console.log('dist ', newValue.id);
        setTalukId(null);
      } else if (label === 'Directorate Office') {
        setOfficeType('Directorate');
        setDistrictId(1);
        console.log('dire ', newValue.id); // Hardcode District ID as 1 for Directorate
        setTalukId(null);
      } else if (label?.startsWith('Taluk Statistical Office')) {
        // If it's a taluk
        setOfficeType('Taluk');
        setTalukId(newValue.id);
        console.log('taluk ', newValue.id);
        setDistrictId(null);
      }
    } else {
      alert('ok');
      // If nothing is selected, reset values
      setOfficeType('');
      setDistrictId(null);
      setTalukId(null);
    }
  };

  // Modify filteredTaluks to include the district name
  const filteredTaluks = selectedDistrict
    ? [
        { id: selectedDistrict.distId, label: selectedDistrict.distOfficeNameEn },
        ...(selectedDistrict.distId === 1
          ? [
              { id: 1, label: 'Directorate Office' } // Add Directorate Office only for Thiruvananthapuram
            ]
          : []),
        ...taluks.map((taluk) => ({
          id: taluk.desTalukId,
          label: taluk.talukOfficeNameEn
        }))
      ]
    : [];
  // const filteredTaluks = selectedDistrict
  //   ? [{ name: selectedDistrict.name }, ...selectedDistrict.talukMaster.map((taluk) => ({ name: taluk.talukOfficeNameEn }))]
  //   : [];

  const handlePenChange = (e) => {
    setPenNumber(e.target.value);
    if (e.target.value) setErrors({ ...errors, idNumber: false });
  };

  const handleTenChange = (e) => {
    setTenNumber(e.target.value);
    if (e.target.value) setErrors({ ...errors, idNumber: false });
  };

  const validateField = (field) => {
    // Return the error message if the field is invalid
    switch (field) {
      case 'fullName':
        if (!fullName) return 'Full Name is required.';
        return null;
      case 'email':
        if (!email) return 'Email Address is required.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Invalid email format.';
        return null;
      case 'phone':
        if (!phone) return 'Phone Number is required.';
        if (!/^\d{10}$/.test(phone)) return 'Phone Number must be exactly 10 digits.';
        return null;
      case 'designation':
        if (!designation) return 'Designation is required.';
        return null;
      case 'dateOfJoining':
        if (!dateOfJoining || new Date(dateOfJoining) > new Date()) return 'Date of Joining cannot be in the future.';
        return null;
      case 'dateOfBirth':
        if (!dateOfBirth || new Date(dateOfBirth) > new Date()) return 'Date of Birth cannot be in the future.';
        return null;
      case 'idNumber':
        if (idType === 'PEN' && !penNumber) return 'PEN Number is required.';
        if (idType === 'TEN' && !tenNumber) return 'TEN Number is required.';
        return null;
      // case 'office':
      //   if (!office) return 'Office is required.';
      //   return null;
      // case 'taluk':
      //   if (!taluk) return 'Taluk is required.';
      //   return null;
      default:
        return null;
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    let fieldErrors = { ...errors };
    let foundError = false;

    // Validate fields one by one
    for (let field in fieldErrors) {
      const errorMessage = validateField(field);
      if (errorMessage) {
        fieldErrors[field] = errorMessage;
        setErrors(fieldErrors);
        foundError = true;
        break; // Stop once the first error is found
      } else {
        fieldErrors[field] = false; // Clear previous errors
      }
    }

    if (foundError) return; // If there's an error, return and don't proceed

    const idNumber = idType === 'PEN' ? penNumber : tenNumber;
    
    const userData = {
      name: fullName,
      email: email,
      mobileNumber: phone,
      penNumber: idType + idNumber,
      designation: designation,
      dateOfBirth: dateOfBirth,
      dateOfJoining: dateOfJoining,
      officeType: officeType,
      distOfficeId: districtId,
      desTalukOfficeId: talukId
    };

    try {
      setLoading(true);
      const userDatas = await authservice.registration(userData); // Add await to resolve the Promise
      setLoading(false);

      if (userDatas.status === 201) {
        setSuccessMessage('Registration successfully submitted. Please wait for the approval.');
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
        value={fullName}
        onChange={(e) => {
          const value = e.target.value;
          // Allow only alphabets, spaces, and periods, and limit length to 20
          if (/^[A-Za-z\s.]*$/.test(value) && value.length <= 20) {
            setFullName(value); // Update state if value matches the pattern and length <= 20
          }
        }}
        error={errors.fullName}
        helperText={errors.fullName ? errors.fullName : ''}
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
        onChange={(e) => {
          if (e.target.value.length <= 30) {
            setEmail(e.target.value); // Update state if length is <= 50
          }
        }}
        error={errors.email}
        helperText={errors.email ? errors.email : ''}
        sx={{
          mb: 2,
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
        onChange={(e) => {
          const value = e.target.value;
          // Only allow digits and ensure max length is 10
          if (/^\d*$/.test(value) && value.length <= 10) {
            setPhone(value); // Update state if value is numeric and length <= 10
          }
        }}
        error={errors.phone}
        helperText={errors.phone ? errors.phone : ''}
        inputProps={{
          inputMode: 'numeric', // Ensure mobile keyboard is numeric
          maxLength: 10 // Prevent entering more than 10 characters
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
          inputProps={{ maxLength: 4 }}
          error={errors.idNumber}
          helperText={errors.idNumber ? errors.idNumber : ''}
          sx={{ mb: 2 }}
        />
      ) : (
        <TextField
          variant="outlined"
          label="TEN"
          value={tenNumber}
          onChange={handleTenChange}
          inputProps={{ maxLength: 6 }}
          sx={{ mb: 2 }}
        />
      )}

      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>
          Designation{' '}
          <Typography component="span" color="error">
            *
          </Typography>
        </InputLabel>
        <Select value={designation} onChange={(e) => setDesignation(e.target.value)} error={errors.designation}>
          {designations.map((designation) => (
            <MenuItem key={designation.id} value={designation.designation_name}>
              {designation.designation_name}
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
            onChange={(e) => setDateOfJoining(e.target.value)}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
            error={errors.dateOfJoining}
            helperText={errors.dateOfJoining ? errors.dateOfJoining : ''}
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
            onChange={(e) => setDateOfBirth(e.target.value)}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
            error={errors.dateOfBirth}
            helperText={errors.dateOfBirth ? errors.dateOfBirth : ''}
          />
        </Grid>
      </Grid>

      {/* District Office selection */}
      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <Autocomplete
          disablePortal
          options={districts.map((district) => ({
            distId: district.districtOfficeId,
            distOfficeNameEn: district.districtOfficeNameEn // Ensuring correct label display
          }))}
          getOptionLabel={(option) => (option ? option.distOfficeNameEn : '')}
          value={selectedDistrict}
          onChange={handleDistrictChange}
          isOptionEqualToValue={(option, value) => option.distId === value.distId} // ADD THIS LINE
          renderInput={(params) => <TextField {...params} label="Districts" required variant="outlined" />}
        />
      </MuiFormControl>

      {/* Taluk Office selection */}
      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <Autocomplete
          disablePortal
          options={filteredTaluks}
          getOptionLabel={(option) => (option ? option.label : '')}
          value={selectedTaluk}
          onChange={handleTalukChange}
          isOptionEqualToValue={(option, value) => option.id === value.id} // ADD THIS LINE
          renderInput={(params) => <TextField {...params} label="Office" required variant="outlined" />}
        />
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
