import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

import FieldDataCollectorView from './FieldDataCollectorView';
import InspectorVerificationView from './InspectorVerificationView';
import DistrictApproverView from './DistrictApproverView';
import CultivatorSelectionView from './CultivatorSelectionView';

const ForecastEstimateLanding = ({ activeRole, userJurisdiction, onBackToChoices }) => {
  // Tab state for Inspector / TSO views
  const [subTab, setSubTab] = useState(0); // 0 = Cultivator Selection, 1 = Verification List

  const isInspector =
    activeRole === 'Field Inspector' ||
    activeRole === 'Taluk Field Inspector' ||
    activeRole === 'Taluk Level Approver / Field Inspector';

  return (
    <Box>
      {/* Breadcrumb & Navigation Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link underline="hover" color="inherit" onClick={onBackToChoices} sx={{ cursor: 'pointer', fontWeight: 600 }}>
              Advance Forecasts
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 700 }}>
              Forecast Estimate &amp; Cultivator Selection
            </Typography>
          </Breadcrumbs>

          <Button size="small" startIcon={<ArrowBackIcon />} onClick={onBackToChoices} sx={{ fontWeight: 600 }}>
            Back to Advance Forecasts Menu
          </Button>
        </Box>

        {/* Sub-tab Navigation for Field Inspector / TSO */}
        {isInspector && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
            <Tabs
              value={subTab}
              onChange={(e, val) => setSubTab(val)}
              indicatorColor="primary"
              textColor="primary"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  minHeight: 44
                }
              }}
            >
              <Tab icon={<CheckBoxOutlinedIcon fontSize="small" />} iconPosition="start" label="Block-wise Cultivator Selection Workflow" />
              <Tab icon={<FactCheckOutlinedIcon fontSize="small" />} iconPosition="start" label="Forecast Verification & Audit Table" />
            </Tabs>
          </Box>
        )}
      </Paper>

      {/* Render View Based on Active Role Selected in Header */}
      {activeRole === 'Field Data Collector' && (
        <FieldDataCollectorView userJurisdiction={userJurisdiction} />
      )}

      {isInspector && (
        <React.Fragment>
          {subTab === 0 ? (
            <CultivatorSelectionView userJurisdiction={userJurisdiction} activeRole={activeRole} />
          ) : (
            <InspectorVerificationView userJurisdiction={userJurisdiction} initialMode="inspector" />
          )}
        </React.Fragment>
      )}

      {activeRole === 'Taluk Level Approver' && (
        <InspectorVerificationView userJurisdiction={userJurisdiction} initialMode="approver" />
      )}

      {activeRole === 'District Level Approver' && (
        <DistrictApproverView userJurisdiction={userJurisdiction} />
      )}
    </Box>
  );
};

export default ForecastEstimateLanding;
