import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import { useNavigate } from "react-router-dom";

export default function ZoneOptions() {
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [pendingZone, setPendingZone] = useState('');
  const BASE_URL = mainapi.BTR_API;
  const user_id = authservice.userid();
  const navigate = useNavigate();
  // Fetch zones and restore last selected zone
useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token || !user_id) return;

  axios
    .get(`${BASE_URL}/btr-service/btr-api/zones/assigned/${user_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const data = response.data || [];
      setZones(data);

      // 🚨 CASE 1: No zones assigned
      if (data.length === 0) {
        setZone('');
        localStorage.removeItem('activeZone');
        localStorage.removeItem('activeDistId');
        return;
      }

      const savedZone = localStorage.getItem('activeZone');

      // ✅ Validate saved zone
      const selectedZoneObj = data.find(
        (z) => z.zoneId.toString() === savedZone
      );

      let finalZone;

      if (savedZone && selectedZoneObj) {
        // ✅ valid zone
        finalZone = selectedZoneObj;
      } else {
        // ❌ invalid / removed zone → fallback
        finalZone = data[0];

        console.warn(
          '⚠️ Stored zone is invalid or removed. Resetting to default.'
        );
      }

      // ✅ Set state
      setZone(finalZone.zoneId.toString());

      // 🔑 Sync localStorage with backend truth
      localStorage.setItem('activeZone', finalZone.zoneId.toString());
      localStorage.setItem(
        'activeDistId',
        finalZone.dist_id.toString()
      );
    })
    .catch((error) => {
      console.error('Error fetching zones:', error);

      // 🚨 Optional: clear invalid state on error
      setZone('');
      localStorage.removeItem('activeZone');
      localStorage.removeItem('activeDistId');
    });
}, [BASE_URL, user_id]);


  const handleOpenDialog = (event) => {
    const newZone = event.target.value;
    if (newZone !== zone) {
      setPendingZone(newZone);
      setOpenDialog(true);
    }
  };

const handleConfirmSwitch = () => {
  const selectedZoneObj = zones.find(
    (z) => z.zoneId.toString() === pendingZone
  );

  if (selectedZoneObj) {
    setZone(pendingZone);

    // 🔑 SAVE BOTH VALUES
    localStorage.setItem('activeZone', pendingZone);
    localStorage.setItem(
      'activeDistId',
      selectedZoneObj.dist_id.toString()
    );
  }

  setOpenDialog(false);

  navigate('/schemes/earas');

};


  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Box sx={{   mt: 0.5 }}>
      <FormControl size="small" fullWidth sx={{ minWidth: 180 }}>
  <Select
    id="zone-select"
    value={zone}
    onChange={handleOpenDialog}
    IconComponent={() => null}
    sx={{
      color: 'white',
      border: 'none',
      '.MuiOutlinedInput-notchedOutline': { border: 'none' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
      '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontWeight: 500,
    }}
    renderValue={(selected) => {
      const selectedZone = zones.find((z) => z.zoneId.toString() === selected);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: '1rem' }} />
          {selectedZone ? selectedZone.zoneName : ''}
        </Box>
      );
    }}
  >
    {zones.map(({ zoneId, zoneName }) => (
      <MenuItem key={zoneId} value={zoneId.toString()} sx={{ color: 'black' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOnOutlinedIcon sx={{ color: 'action.active', fontSize: '1rem' }} />
          {zoneName}
        </Box>
      </MenuItem>
    ))}
  </Select>
</FormControl>


      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-zone-switch-dialog"
      >
        <DialogTitle id="confirm-zone-switch-dialog">Confirm Zone Switch</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to switch to the selected zone?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSwitch} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
