import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import RoleManage from './RoleManage';
import DesignationManage from './DesignationManage';

const RoleDesignationTabs = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
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
    </Box>
  );
};

export default RoleDesignationTabs;
