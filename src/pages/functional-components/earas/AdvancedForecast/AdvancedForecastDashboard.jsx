import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';

import authservice from 'pages/authentication/services/authservice';
import { getCurrentUserJurisdiction } from '../Report/workAllocationReport/userJurisdiction';

import EARASHeaderContext from './EARASHeaderContext';
import AdvanceForecastsDashboard from './AdvanceForecastsDashboard';
import ForecastEstimateLanding from './ForecastEstimateLanding';

const AdvancedForecastDashboard = () => {
  // Resolve user jurisdiction
  const userJurisdiction = useMemo(() => getCurrentUserJurisdiction(), []);

  // Resolve role dynamically from auth service or fallback to Field Data Collector
  const initialRole = useMemo(() => {
    const rawRole = authservice.getrole();
    const localDes = localStorage.getItem('des');
    let r = Array.isArray(rawRole) ? rawRole[0] : (typeof rawRole === 'string' ? rawRole : localDes);
    if (!r && userJurisdiction?.role) r = userJurisdiction.role;

    const strR = String(r || '').toLowerCase();
    if (strR.includes('inspector') || strR.includes('field')) {
      return 'Field Inspector';
    }
    if (strR.includes('taluk') || strR.includes('tahsildar')) {
      return 'Taluk Level Approver';
    }
    if (strR.includes('district') || strR.includes('approver')) {
      return 'District Level Approver';
    }
    return 'Field Data Collector';
  }, [userJurisdiction]);

  // Live state for role switching in prototype
  const [activeRole, setActiveRole] = useState(initialRole);

  // Navigation stage: 'dashboard' (choices card) or 'forecast_estimate'
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Breadcrumb />

      {/* Universal Header Context Bar with Role Switcher & Notifications */}
      <EARASHeaderContext activeRole={activeRole} onRoleChange={(newRole) => setActiveRole(newRole)} />

      {/* Main Module View Router */}
      {activeModule === 'dashboard' ? (
        <AdvanceForecastsDashboard onSelectModule={(moduleName) => setActiveModule(moduleName === 'Forecast Estimate' ? 'forecast_estimate' : 'dashboard')} />
      ) : (
        <ForecastEstimateLanding
          activeRole={activeRole}
          userJurisdiction={userJurisdiction}
          onBackToChoices={() => setActiveModule('dashboard')}
        />
      )}
    </Box>
  );
};

export default AdvancedForecastDashboard;
