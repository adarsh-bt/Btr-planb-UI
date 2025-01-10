import React, { useState } from 'react';
import { TextField, Button, Box, Grid, Radio, RadioGroup, FormControlLabel, FormControl, MenuItem, Select, InputLabel, FormControl as MuiFormControl } from '@mui/material';

const Register = ({ onBack }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState('PEN');  // PEN or TEN
  const [penNumber, setPenNumber] = useState('');  // Single string for PEN
  const [tenNumber, setTenNumber] = useState('');  // Single string for TEN
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [office, setOffice] = useState('');

  const handlePenChange = (e) => {
    setPenNumber(e.target.value);
  };

  const handleTenChange = (e) => {
    setTenNumber(e.target.value);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const idNumber = idType === 'PEN' ? penNumber : tenNumber;
    console.log("Registration submitted:", { fullName, email, phone, idType, idNumber, designation, dateOfJoining, dateOfBirth, office });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>

      {/* Full Name */}
      <TextField
        fullWidth
        variant="outlined"
        label="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Email Address */}
      <TextField
        fullWidth
        variant="outlined"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Phone Number */}
      <TextField
        fullWidth
        variant="outlined"
        label="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {/* Radio Button for PEN/TEN */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <RadioGroup
          row
          value={idType}
          onChange={(e) => setIdType(e.target.value)}
        >
          <FormControlLabel value="PEN" control={<Radio />} label="PEN Number" />
          <FormControlLabel value="TEN" control={<Radio />} label="TEN Number" />
        </RadioGroup>
      </FormControl>

      {/* Input for PEN/TEN Number */}
      {idType === 'PEN' ? (
        <TextField
          variant="outlined"
          label="PEN Number"
          value={penNumber}
          onChange={handlePenChange}
          inputProps={{ maxLength: 4 }}
          sx={{ mb: 2 }}
        />
      ) : (
        <TextField
          variant="outlined"
          label="TEN Number"
          value={tenNumber}
          onChange={handleTenChange}
          inputProps={{ maxLength: 6 }}
          sx={{ mb: 2 }}
        />
      )}

      {/* Designation Dropdown */}
      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Designation</InputLabel>
        <Select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          label="Designation"
        >
          <MenuItem value="Software Engineer">Software Engineer</MenuItem>
          <MenuItem value="Tester">Tester</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="Analyst">Analyst</MenuItem>
        </Select>
      </MuiFormControl>

      {/* Date of Joining and Date of Birth (Horizontal Alignment) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Date of Joining"
            type="date"
            value={dateOfJoining}
            onChange={(e) => setDateOfJoining(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            variant="outlined"
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      {/* Office to Join Dropdown */}
      <MuiFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Office to Join</InputLabel>
        <Select
          value={office}
          onChange={(e) => setOffice(e.target.value)}
          label="Office to Join"
        >
          <MenuItem value="Kollam">Kollam</MenuItem>
          <MenuItem value="Trivandrum">Trivandrum</MenuItem>
          <MenuItem value="Kottayam">Kottayam</MenuItem>
        </Select>
      </MuiFormControl>

      {/* Button Section */}
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
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: '20px' }}
            onClick={onBack}
          >
            Back to Sign In
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Register;
