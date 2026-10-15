import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Breadcrumb from 'routes/Breadcrumb';

import ProductionEstimationService from './productionEstimationService';
import PEHeaderContext from './PEHeaderContext';
import DefectDrawer from './components/DefectDrawer';

// Views
import PEDashboardView from './views/PEDashboardView';
import EstimationDetailView from './views/EstimationDetailView';
import Verifier1ReviewView from './views/Verifier1ReviewView';
import Verifier2ReviewView from './views/Verifier2ReviewView';
import EaradAdminApprovalView from './views/EaradAdminApprovalView';
import Approver2ReviewView from './views/Approver2ReviewView';
import DirectorStateApprovalView from './views/DirectorStateApprovalView';

import ProductionEstimationResultsPage from './views/ProductionEstimationResultsPage';

const ProductionEstimationDashboard = () => {
  // Global Service States
  const [estimations, setEstimations] = useState([]);
  const [defects, setDefects] = useState([]);

  // Active Role State (Defaults to Production Estimator, switchable anytime in header)
  const [activeRole, setActiveRole] = useState('Production Estimator');

  // Navigation & Selection States
  const [financialYear, setFinancialYear] = useState('2025-2026');
  const [season, setSeason] = useState('Autumn (Virippu)');
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [viewResultsCrop, setViewResultsCrop] = useState(null);

  // Defect Drawer State
  const [defectDrawerOpen, setDefectDrawerOpen] = useState(false);
  const [defectTargetRecord, setDefectTargetRecord] = useState(null);

  // Refresh local data from service
  const refreshData = () => {
    setEstimations(ProductionEstimationService.getEstimations());
    setDefects(ProductionEstimationService.getDefects());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Select Individual Estimation for Review or Detail
  const handleSelectEstimation = (record) => {
    setSelectedEstimation(record);
  };

  // Open Defect Drawer for a target record
  const handleOpenMarkDefect = (record = null) => {
    setDefectTargetRecord(record || selectedEstimation);
    setDefectDrawerOpen(true);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header Context with Role Switcher */}
      <PEHeaderContext
        activeRole={activeRole}
        onRoleChange={(newRole) => {
          setActiveRole(newRole);
          setSelectedEstimation(null);
          setViewResultsCrop(null);
        }}
        financialYear={financialYear}
        onYearChange={setFinancialYear}
        season={season}
        onSeasonChange={setSeason}
        onOpenDefectsTab={() => {
          setSelectedEstimation(null);
          setViewResultsCrop(null);
        }}
        onResetData={() => {
          ProductionEstimationService.resetDemoData();
          refreshData();
        }}
      />

      {/* Main Single Dashboard Container (No Tabs) */}
      <Box sx={{ mt: 2 }}>
        {viewResultsCrop ? (
          <ProductionEstimationResultsPage
            selectedCrop={viewResultsCrop}
            estimations={estimations}
            defects={defects}
            onBackToDashboard={() => setViewResultsCrop(null)}
            onOpenMarkDefect={(rec) => handleOpenMarkDefect(rec)}
            activeRole={activeRole}
          />
        ) : selectedEstimation ? (
          activeRole === 'Production Estimator Verifier 1' && selectedEstimation.status === 'Pending Verifier 1' ? (
            <Verifier1ReviewView
              record={selectedEstimation}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onActionComplete={() => {
                refreshData();
                setSelectedEstimation(null);
              }}
              activeRoleUser="Dr. Suresh Kumar (Verifier 1)"
            />
          ) : activeRole === 'Production Estimator Verifier 2' && selectedEstimation.status === 'Pending Verifier 2' ? (
            <Verifier2ReviewView
              record={selectedEstimation}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onActionComplete={() => {
                refreshData();
                setSelectedEstimation(null);
              }}
              activeRoleUser="Prof. Mary John (Verifier 2)"
            />
          ) : activeRole === 'EARAD Admin' && selectedEstimation.status === 'Pending EARAD Admin' ? (
            <EaradAdminApprovalView
              record={selectedEstimation}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onActionComplete={() => {
                refreshData();
                setSelectedEstimation(null);
              }}
              activeRoleUser="K. S. Narayanan (EARAD Admin)"
            />
          ) : activeRole === 'Production Estimate Approver 2' && selectedEstimation.status === 'Pending Approver 2' ? (
            <Approver2ReviewView
              record={selectedEstimation}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onActionComplete={() => {
                refreshData();
                setSelectedEstimation(null);
              }}
              activeRoleUser="Vijayachandran P. (Approver 2)"
            />
          ) : activeRole === 'Director / State Level Approver' ? (
            <DirectorStateApprovalView
              record={selectedEstimation}
              estimations={estimations}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onSelectIndividual={(rec) => setSelectedEstimation(rec)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onActionComplete={() => {
                refreshData();
                setSelectedEstimation(null);
              }}
              activeRoleUser="Director of Agriculture (State Approver)"
            />
          ) : (
            <EstimationDetailView
              record={selectedEstimation}
              defects={defects}
              onBack={() => setSelectedEstimation(null)}
              onOpenMarkDefect={() => handleOpenMarkDefect(selectedEstimation)}
              onOpenReviewAction={() => {}}
              activeRole={activeRole}
            />
          )
        ) : (
          <PEDashboardView
            estimations={estimations}
            onSelectEstimation={handleSelectEstimation}
            onViewDefects={(rec) => handleOpenMarkDefect(rec)}
            onViewResults={(crop) => setViewResultsCrop(crop)}
            activeRole={activeRole}
          />
        )}
      </Box>

      {/* Defect Drawer */}
      <DefectDrawer
        open={defectDrawerOpen}
        onClose={() => setDefectDrawerOpen(false)}
        estimationRecord={defectTargetRecord}
        activeUser={activeRole}
        activeRole={activeRole}
        onDefectSaved={() => refreshData()}
      />
    </Box>
  );
};

export default ProductionEstimationDashboard;
