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
        if (info) {
          sessionStorage.setItem('userOfficeInfo', JSON.stringify(info));
        }
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

      const { officeType, districtOfficeId, districtId, talukOfficeId, talukId } = officeInfo;

      const getCurrentMonthFormatted = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      };

      const currentMonth = getCurrentMonthFormatted();

      console.log('Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/Report/kerala_cluster_report', {
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

        navigate('/Report/kerala_cluster_report/taluk_cluster_report/direct', {
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
        // 'Report/kerala_cluster_report/zone_cluster_report/direct/:talukId'
        navigate(`/Report/kerala_cluster_report/zone_cluster_report/direct/${talukIdValue}`, {
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

      const { officeType, districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = officeInfo;

      const getAgriMonthFormatted = () => {
        const agriYear = AuthService.agriyear() || '2025-2026';
        const startYear = parseInt(agriYear.split('-')[0], 10) || new Date().getFullYear();
        const now = new Date();
        const monthIndex = now.getMonth(); // 0-indexed (0 = Jan, 6 = July)
        const monthNum = monthIndex + 1;
        const mm = String(monthNum).padStart(2, '0');
        const year = monthIndex >= 6 ? startYear : startYear + 1;
        return `${year}-${mm}`;
      };

      const currentMonth = getAgriMonthFormatted();

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

    // ═══════════════════ CCE PROGRESS REPORT (Form 5) ═══════════════════
    // NOTE: month filters are intentionally NOT seeded here. Form 5's month
    // state uses 'YYYY-MM' values and each level defaults the month internally
    // (getDefaultSingleMonth), so passing a month *name* would break the filter.
    else if (reportPath === '/schemes/earas/cce/KeralaForm5ReportList') {
      if (!officeInfo) {
        console.error('Office info not loaded');
        return;
      }

      const { officeType, districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = officeInfo;

      console.log('Form 5 Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level list
      if (officeType === 'DIRECTORATE') {
        navigate('/schemes/earas/cce/KeralaForm5ReportList', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk-wise CCE report for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId;

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukForm5Report with districtId:', districtIdValue);

        // Matches MainRoutes: '/kerala_form5_report/taluk_form5_report/:districtId'
        // (TalukForm5Report.resolveDistrictId reads state.districtId first, then the param)
        navigate(`/kerala_form5_report/taluk_form5_report/${districtIdValue}`, {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtOfficeId: districtIdValue,
            districtName: districtName || '',
            isDirectAccess: true,
          },
        });
      }

      // ── TALUK ── Jump straight to Zone-wise CCE report for this taluk
      else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneForm5Report with talukId:', talukIdValue);

        const dName = districtName || 'district';
        const tName = talukName || 'taluk';

        // Matches MainRoutes:
        // '/kerala_form5_report/taluk_form5_report/zone_form5_report/:districtName/:talukName'
        // (ZoneForm5Report.resolveTalukId reads state.talukId first, before the route)
        navigate(
          `/kerala_form5_report/taluk_form5_report/zone_form5_report/${encodeURIComponent(dName)}/${encodeURIComponent(tName)}`,
          {
            state: {
              officeType,
              viewLevel: 'taluk',
              talukId: talukIdValue,
              talukOfficeId: talukIdValue,
              talukName: talukName || '',
              districtId: districtOfficeId || districtId || null,
              districtName: districtName || '',
              isDirectAccess: true,
            },
          }
        );
      }
    }

    // ═══════════════════ FORM 2 (Land Utilization & Irrigation) ═══════════════════
    // Form 2 has no month filter — only agriYear (read from AuthService by each
    // level). DISTRICT/TALUK levels resolve their scope id from location.state.
    else if (reportPath === '/schemes/earas/cce/KeralaForm2') {
      const info = officeInfo || {};
      let officeType = info.officeType;

      if (!officeType) {
        try {
          const tokenRole = AuthService.getrole();
          const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
          const des = localStorage.getItem('des') || '';

          if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
            officeType = 'TALUK';
          } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
            officeType = 'DISTRICT';
          } else {
            officeType = 'DIRECTORATE';
          }
        } catch (e) {
          officeType = 'DIRECTORATE';
        }
      }

      const { districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = info;

      console.log('Form 2 Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/schemes/earas/cce/KeralaForm2', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk Form 2 for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId || localStorage.getItem('dis');

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukForm2 with districtId:', districtIdValue);

        navigate('/schemes/earas/cce/TalukForm2', {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtName: districtName || '',
            selectedDistrict: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }

      // ── TALUK ── Jump straight to Zone Form 2 for this taluk
      else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneForm2 with talukId:', talukIdValue);

        navigate('/schemes/earas/cce/ZoneForm2', {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukName: talukName || '',
            selectedTaluk: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }
    }

    // ═══════════════════ FORM 3A (Crop Area Report) ═══════════════════
    // Form 3A has no month filter — only agriYear (read from AuthService by
    // each level). All three levels (Kerala/Taluk/Zone) are state-only
    // routes (no path params), same as Form 2, and each also mirrors its
    // received state into sessionStorage (keralaForm3AState / talukForm3AState /
    // zoneForm3AState) so a refresh or back-navigation keeps working.
    else if (reportPath === '/schemes/earas/Report/Form3A/KeralaForm3A') {
      const currentOfficeInfo = officeInfo || {};
      let officeType = currentOfficeInfo.officeType;
      const districtOfficeId = currentOfficeInfo.districtOfficeId;
      const districtId = currentOfficeInfo.districtId;
      const talukOfficeId = currentOfficeInfo.talukOfficeId;
      const talukId = currentOfficeInfo.talukId;
      const districtName = currentOfficeInfo.districtName;
      const talukName = currentOfficeInfo.talukName;

      if (!officeType) {
        try {
          const tokenRole = AuthService.getrole();
          const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
          const des = localStorage.getItem('des') || '';

          if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
            officeType = 'TALUK';
          } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
            officeType = 'DISTRICT';
          } else {
            officeType = 'DIRECTORATE';
          }
        } catch (e) {
          officeType = 'DIRECTORATE';
        }
      }

      console.log('Form 3A Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/schemes/earas/Report/Form3A/KeralaForm3A', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk-wise Form 3A for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId || localStorage.getItem('dis');

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukForm3A with districtId:', districtIdValue);

        navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtName: districtName || '',
            selectedDistrict: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }

      // ── TALUK ── Jump straight to Zone-wise Form 3A for this taluk
      else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneForm3A with talukId:', talukIdValue);

        navigate('/schemes/earas/Report/Form3A/ZoneForm3A', {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukName: talukName || '',
            selectedTaluk: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }
    }

    // ═══════════════════ FORM 3B (Crop Area Report) ═══════════════════
    // Same shape as Form 3A: no month filter, agriYear read internally,
    // all three levels are state-only routes, each mirrors received state
    // into sessionStorage (talukForm3BState / zoneForm3BState) on its own.
    else if (reportPath === '/schemes/earas/Report/Form3B/KeralaForm3B') {
      const currentOfficeInfo = officeInfo || {};
      let officeType = currentOfficeInfo.officeType;
      const districtOfficeId = currentOfficeInfo.districtOfficeId;
      const districtId = currentOfficeInfo.districtId;
      const talukOfficeId = currentOfficeInfo.talukOfficeId;
      const talukId = currentOfficeInfo.talukId;
      const districtName = currentOfficeInfo.districtName;
      const talukName = currentOfficeInfo.talukName;

      if (!officeType) {
        try {
          const tokenRole = AuthService.getrole();
          const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
          const des = localStorage.getItem('des') || '';

          if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
            officeType = 'TALUK';
          } else if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
            officeType = 'DISTRICT';
          } else {
            officeType = 'DIRECTORATE';
          }
        } catch (e) {
          officeType = 'DIRECTORATE';
        }
      }

      console.log('Form 3B Navigation - Office Type:', officeType);

      // ── DIRECTORATE ── State-level view
      if (officeType === 'DIRECTORATE') {
        navigate('/schemes/earas/Report/Form3B/KeralaForm3B', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk-wise Form 3B for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId || localStorage.getItem('dis');

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        console.log('Navigating to TalukForm3B with districtId:', districtIdValue);

        navigate('/schemes/earas/Report/Form3B/TalukForm3B', {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtName: districtName || '',
            selectedDistrict: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }

      // ── TALUK ── Jump straight to Zone-wise Form 3B for this taluk
      else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

        console.log('Navigating to ZoneForm3B with talukId:', talukIdValue);

        navigate('/schemes/earas/Report/Form3B/ZoneForm3B', {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukName: talukName || '',
            selectedTaluk: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
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