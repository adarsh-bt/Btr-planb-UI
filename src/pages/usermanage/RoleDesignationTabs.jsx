import React, { useState } from 'react';
import { Box, Tabs, Tab,Grid,Typography } from '@mui/material';
import RoleManage from './RoleManage';
import DesignationManage from './DesignationManage';
import Breadcrumb from 'routes/Breadcrumb';

const RoleDesignationTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
     <Grid container spacing={3}>
          <Breadcrumb></Breadcrumb>
          <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
    <Box sx={{ width: '100%' }}>
     
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab
          label="Role Management"
          sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        />
        <Tab
          label="Designation Management"
          sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && <RoleManage />}
        {tabValue === 1 && <DesignationManage />}
      </Box>
    </Box></Grid>
    </Grid>
  );
};

export default RoleDesignationTabs;
