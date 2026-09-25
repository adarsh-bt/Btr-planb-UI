import React from 'react';
import { Tabs, Tab, Box, Badge, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ApprovalIcon from '@mui/icons-material/Approval';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';

const TAB_ITEMS = [
  { id: 'dashboard', label: 'Estimation Dashboard', icon: <DashboardIcon /> },
  { id: 'create', label: 'Create Estimation', icon: <AddCircleIcon /> },
  { id: 'my_estimations', label: 'My Estimations', icon: <FormatListBulletedIcon /> },
  { id: 'pending_verification', label: 'Pending Verification', icon: <VerifiedUserIcon />, badgeKey: 'verification' },
  { id: 'pending_approval', label: 'Pending Approval', icon: <ApprovalIcon />, badgeKey: 'approval' },
  { id: 'approved', label: 'Approved Estimations', icon: <CheckCircleIcon /> },
  { id: 'returned', label: 'Returned / Rejected', icon: <ReplayIcon />, badgeKey: 'returned' },
  { id: 'defects', label: 'Defects', icon: <ReportProblemIcon />, badgeKey: 'defects' },
  { id: 'reports', label: 'Reports', icon: <AssessmentIcon /> },
  { id: 'audit_trail', label: 'Audit Trail', icon: <HistoryIcon /> }
];

const PENavigationTabs = ({ activeTab, onTabChange, badgeCounts = {} }) => {
  return (
    <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#ffffff', borderRadius: 2, px: 1 }}>
      <Tabs
        value={activeTab}
        onChange={(e, val) => onTabChange(val)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          '& .MuiTab-root': {
            fontWeight: 'bold',
            fontSize: '0.875rem',
            py: 1.5,
            minHeight: 48,
            textTransform: 'none'
          }
        }}
      >
        {TAB_ITEMS.map((t) => {
          const count = t.badgeKey ? badgeCounts[t.badgeKey] || 0 : 0;
          return (
            <Tab
              key={t.id}
              value={t.id}
              icon={
                count > 0 ? (
                  <Badge badgeContent={count} color="error" size="small">
                    {t.icon}
                  </Badge>
                ) : (
                  t.icon
                )
              }
              iconPosition="start"
              label={t.label}
            />
          );
        })}
      </Tabs>
    </Paper>
  );
};

export default PENavigationTabs;
