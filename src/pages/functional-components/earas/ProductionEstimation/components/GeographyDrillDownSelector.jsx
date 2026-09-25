import React, { useMemo } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Alert,
  Typography,
  Chip,
  Box
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { DISTRICTS_MASTER, CROPS_MASTER } from '../productionEstimationService';

const GeographyDrillDownSelector = ({
  selectedDistrict,
  selectedTaluk,
  selectedBlock,
  selectedPanchayath,
  selectedCrop,
  onLocationChange
}) => {
  const cropConfig = useMemo(() => {
    return CROPS_MASTER.find((c) => c.id === selectedCrop) || CROPS_MASTER[0];
  }, [selectedCrop]);

  const isPanchayathRequired = cropConfig.level === 'Panchayath';

  // Selected district object
  const activeDistrictObj = useMemo(() => {
    return DISTRICTS_MASTER.find((d) => d.name === selectedDistrict) || DISTRICTS_MASTER[0];
  }, [selectedDistrict]);

  // Selected taluk object
  const activeTalukObj = useMemo(() => {
    return activeDistrictObj?.taluks.find((t) => t.name === selectedTaluk) || activeDistrictObj?.taluks[0];
  }, [activeDistrictObj, selectedTaluk]);

  // Selected block object
  const activeBlockObj = useMemo(() => {
    return activeTalukObj?.blocks.find((b) => b.name === selectedBlock) || activeTalukObj?.blocks[0];
  }, [activeTalukObj, selectedBlock]);

  // Panchayath options
  const panchayathsList = useMemo(() => {
    return activeBlockObj?.panchayaths || [];
  }, [activeBlockObj]);

  return (
    <Box>
      <Alert
        severity={isPanchayathRequired ? 'info' : 'success'}
        icon={<LocationOnIcon />}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          Geographic Level Rule: {selectedCrop} Estimation is performed at{' '}
          <Chip
            label={`${cropConfig.level}-Level`}
            color={isPanchayathRequired ? 'primary' : 'secondary'}
            size="small"
            sx={{ fontWeight: 'bold', ml: 0.5 }}
          />
        </Typography>
        <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5 }}>
          {isPanchayathRequired
            ? 'For Paddy, Panchayath selection is mandatory as per state agricultural estimation guidelines.'
            : 'For non-Paddy crops, estimation is conducted at the Block level. Panchayath selection is omitted.'}
        </Typography>
      </Alert>

      <Grid container spacing={2.5}>
        {/* District */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="District"
            value={selectedDistrict}
            onChange={(e) => {
              const dName = e.target.value;
              const dObj = DISTRICTS_MASTER.find((d) => d.name === dName);
              const firstTaluk = dObj?.taluks[0]?.name || '';
              const firstBlock = dObj?.taluks[0]?.blocks[0]?.name || '';
              const firstPanchayath = dObj?.taluks[0]?.blocks[0]?.panchayaths[0] || '';
              onLocationChange({
                district: dName,
                taluk: firstTaluk,
                block: firstBlock,
                panchayath: isPanchayathRequired ? firstPanchayath : 'N/A (Block-Level Estimation)'
              });
            }}
          >
            {DISTRICTS_MASTER.map((dist) => (
              <MenuItem key={dist.id} value={dist.name}>
                {dist.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Taluk */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Taluk"
            value={selectedTaluk}
            onChange={(e) => {
              const tName = e.target.value;
              const tObj = activeDistrictObj?.taluks.find((t) => t.name === tName);
              const firstBlock = tObj?.blocks[0]?.name || '';
              const firstPanchayath = tObj?.blocks[0]?.panchayaths[0] || '';
              onLocationChange({
                district: selectedDistrict,
                taluk: tName,
                block: firstBlock,
                panchayath: isPanchayathRequired ? firstPanchayath : 'N/A (Block-Level Estimation)'
              });
            }}
          >
            {activeDistrictObj?.taluks.map((tlk) => (
              <MenuItem key={tlk.id} value={tlk.name}>
                {tlk.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Block */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Block"
            value={selectedBlock}
            onChange={(e) => {
              const bName = e.target.value;
              const bObj = activeTalukObj?.blocks.find((b) => b.name === bName);
              const firstPanchayath = bObj?.panchayaths[0] || '';
              onLocationChange({
                district: selectedDistrict,
                taluk: selectedTaluk,
                block: bName,
                panchayath: isPanchayathRequired ? firstPanchayath : 'N/A (Block-Level Estimation)'
              });
            }}
          >
            {activeTalukObj?.blocks.map((blk) => (
              <MenuItem key={blk.id} value={blk.name}>
                {blk.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Panchayath */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select={isPanchayathRequired}
            disabled={!isPanchayathRequired}
            fullWidth
            label="Panchayath"
            value={isPanchayathRequired ? selectedPanchayath : 'N/A (Block-Level Estimation)'}
            onChange={(e) => {
              onLocationChange({
                district: selectedDistrict,
                taluk: selectedTaluk,
                block: selectedBlock,
                panchayath: e.target.value
              });
            }}
            helperText={isPanchayathRequired ? 'Mandatory for Paddy' : 'Omitted for Block-Level Crop'}
          >
            {isPanchayathRequired ? (
              panchayathsList.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="N/A (Block-Level Estimation)">N/A (Block-Level Estimation)</MenuItem>
            )}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeographyDrillDownSelector;
