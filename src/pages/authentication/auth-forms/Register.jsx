import React, { useState } from 'react';
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
  Typography,
  Alert,
} from '@mui/material';

import authservice from '../authservice';

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
  const [office, setOffice] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handlePenChange = (e) => {
    setPenNumber(e.target.value);
    if (e.target.value && errorMessage === 'PEN Number is required.') {
      setErrorMessage('');
    }
  };

  const handleTenChange = (e) => {
    setTenNumber(e.target.value);
    if (e.target.value && errorMessage === 'TEN Number is required.') {
      setErrorMessage('');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!fullName) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!email) {
      setErrorMessage('Email Address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Invalid email format.');
      return;
    }
    if (!phone) {
      setErrorMessage('Phone Number is required.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setErrorMessage('Phone Number must be exactly 10 digits.');
      return;
    }
    if (!designation) {
      setErrorMessage('Designation is required.');
      return;
    }
    if (!dateOfJoining) {
      setErrorMessage('Date of Joining is required.');
      return;
    }
    if (!dateOfBirth) {
      setErrorMessage('Date of Birth is required.');
      return;
    }
    if (new Date(dateOfJoining) > new Date()) {
      setErrorMessage('Date of Joining cannot be in the future.');
      return;
    }
    if (new Date(dateOfBirth) > new Date()) {
      setErrorMessage('Date of Birth cannot be in the future.');
      return;
    }
    if (idType === 'PEN' && !penNumber) {
      setErrorMessage('PEN Number is required.');
      return;
    } else if (idType === 'TEN' && !tenNumber) {
      setErrorMessage('TEN Number is required.');
      return;
    }

    const idNumber = idType === 'PEN' ? penNumber : tenNumber;

    console.log('Registration submitted:', { fullName, email, phone, idType, idNumber, designation, dateOfJoining, dateOfBirth, office });
    const userData = {
        name: fullName,
        email: email,
        mobileNumber: phone,
        penNumber: idType+idNumber,
        designation: designation,
        dateOfBirth: dateOfBirth,
        dateOfJoining: dateOfJoining,
        officeToJoining: office
    };
    try {
        const userDatas = authservice.registration(userData);
        if (userDatas.statusCode === 201) {
            setSuccessMessage('Registration submitted successfully.');
        }else{
            setErrorMessage(userDatas.message);
        }
    }catch{
        setErrorMessage('Registration failed.');
    }
    

    setErrorMessage('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 2, textAlign: 'center' }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage &&  <Stack sx={{ width: '100%',background:'#fff1f0' }} spacing={2}>
     <center>
     {/* icon={<CheckIcon fontSize="inherit" />} */}
     <Alert  severity="success" sx={{ textAlign: 'center',width:'max-content' }}>{successMessage}</Alert></center>
    </Stack>}
      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Full Name <Typography component="span" color="error">*</Typography>
          </>
        }
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Email Address <Typography component="span" color="error">*</Typography>
          </>
        }
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        variant="outlined"
        label={
          <>
            Phone Number <Typography component="span" color="error">*</Typography>
          </>
        }
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 2 }}
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
          sx={{ mb: 2 }}
        />
      ) : (
        <TextField
          variant="outlined"
          label="TEN"
          value={tenNumber}
          onChange={handleTenChange}
          inputProps={{ maxLength: 6 }}
          sx={{ mb: 2}}
        />
      )}

      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>
          Designation <Typography component="span" color="error">*</Typography>
        </InputLabel>
        <Select value={designation} onChange={(e) => setDesignation(e.target.value)} label="Designation">
          <MenuItem value="office">Staff</MenuItem>
          <MenuItem value="user">Normal User</MenuItem>
        </Select>
      </MuiFormControl>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <>
                Date of Joining <Typography component="span" color="error">*</Typography>
              </>
            }
            type="date"
            value={dateOfJoining}
            onChange={(e) => setDateOfJoining(e.target.value)}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            variant="outlined"
            label={
              <>
                Date of Birth <Typography component="span" color="error">*</Typography>
              </>
            }
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            InputProps={{ inputProps: { max: today } }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Office to Join<Typography component="span" color="error">*</Typography></InputLabel>
        <Select value={office} onChange={(e) => setOffice(e.target.value)} label="Office to Join">
          <MenuItem value="Kollam">Kollam</MenuItem>
          <MenuItem value="Trivandrum">Trivandrum</MenuItem>
          <MenuItem value="Kottayam">Kottayam</MenuItem>
        </Select>
      </MuiFormControl>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ borderRadius: '20px' }}
            onClick={handleRegisterSubmit}
          >
            Register
          </Button>
        </Grid>
        <Grid item xs={12}>
         
          <Typography variant="body2" onClick={onBack} sx={{ color: 'blue', cursor: 'pointer' }} textAlign="center">
                      {"Back to Sign In"}
                    </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
