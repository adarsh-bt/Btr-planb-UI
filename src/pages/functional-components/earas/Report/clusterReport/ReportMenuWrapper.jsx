// ReportMenuWrapper.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import AuthService from 'pages/authentication/services/authservice';

function ReportMenuWrapper({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [officeInfo, setOfficeInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfficeInfo = async () => {
      try {
        const info = await AuthService.getUserOfficeInfo();
        console.log('Office Info received:', info);
        setOfficeInfo(info);
      } catch (err) {
        setError('Failed to load office information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficeInfo();
  }, []);

  const handleReportNavigation = (reportPath) => {
    // ═══════════════════ CLUSTER REPORT ═══════════════════
    if (reportPath === '/kerala_cluster_report') {
      if (!officeInfo) {
        console.error('Office info not loaded');
        return;
      }

      const {
        officeType,
        districtOfficeId,
        districtId,
        talukOfficeId,
        talukId,
      } = officeInfo;

      const currentMonth = new Date().toLocaleString('default', { month: 'long' });

      console.log('Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/kerala_cluster_report', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk report for this district
      else if (officeType === 'DISTRICT') {
        // districtOfficeId is the primary key used by the taluk-wise API
        const districtIdValue = districtOfficeId || districtId;

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukClusterReport with districtId:', districtIdValue);

        navigate('/kerala_cluster_report/taluk_cluster_report/direct', {
          state: {
            officeType,
            viewLevel: 'district',
            // Pass BOTH so TalukClusterReport always finds the id
            districtId: districtIdValue,
            districtOfficeId: districtIdValue,
            isDirectAccess: true,
            filterType: 'single',
            singleMonth: currentMonth,
            fromMonth: '',
            toMonth: '',
            seasonTab: 'ALL',
            landType: null,
          },
        });
      }

      // ── TALUK ── Jump straight to Zone report for this taluk
      else if (officeType === 'TALUK') {
        // talukOfficeId is the primary key used by the zones API
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneClusterReport with talukId:', talukIdValue);

        // Use the same route pattern that MainRoutes already defines:
        // 'kerala_cluster_report/zone_cluster_report/direct/:talukId'
        navigate(`/kerala_cluster_report/zone_cluster_report/direct/${talukIdValue}`, {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukOfficeId: talukIdValue,
            isDirectAccess: true,
            filterType: 'single',
            singleMonth: currentMonth,
            fromMonth: '',
            toMonth: '',
            seasonTab: 'ALL',
            landType: null,
          },
        });
      }
    }

    // ═══════════════════ FORM REPORT (Cluster Enumeration) ═══════════════════
    else if (reportPath === '/FormReport/Kerala' || reportPath === '/kerala_form_report') {
      if (!officeInfo) {
        console.error('Office info not loaded');
        return;
      }

      const {
        officeType,
        districtOfficeId,
        districtId,
        talukOfficeId,
        talukId,
        districtName,
        talukName,
      } = officeInfo;

      const currentMonth = new Date().toLocaleString('default', { month: 'long' });

      console.log('Form Report Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/FormReport/Kerala', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk form report for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId;

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukFormReport with districtId:', districtIdValue);

        navigate('/kerala_form_report/taluk_form_report/direct', {
          state: {
            officeType,
            viewLevel: 'district',
            // Pass BOTH so TalukFormReport always finds the id
            districtId: districtIdValue,
            districtOfficeId: districtIdValue,
            districtName: districtName || '',
            isDirectAccess: true,
            filterType: 'single',
            singleMonth: currentMonth,
            fromMonth: '',
            toMonth: '',
            seasonTab: 'ALL',
            selectedSeason: '',
          },
        });
      }

      // ── TALUK ── Jump straight to Zone form report for this taluk
      else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneFormReport with talukId:', talukIdValue);

        // Route already defined in MainRoutes:
        // 'kerala_form_report/zone_form_report/direct/:talukId'
        navigate(`/kerala_form_report/zone_form_report/direct/${talukIdValue}`, {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukOfficeId: talukIdValue,
            talukName: talukName || '',
            districtName: districtName || '',
            isDirectAccess: true,
            filterType: 'single',
            singleMonth: currentMonth,
            fromMonth: '',
            toMonth: '',
            seasonTab: 'ALL',
            selectedSeason: '',
          },
        });
      }
    }

    // ═══════════════════ EVERYTHING ELSE ═══════════════════
    else {
      navigate(reportPath);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return React.cloneElement(children, {
    onReportNavigation: handleReportNavigation,
    officeInfo,
  });
}

export default ReportMenuWrapper;