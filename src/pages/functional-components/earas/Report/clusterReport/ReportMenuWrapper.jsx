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
    const currentOfficeInfo = officeInfo || {};
    const tokenRole = AuthService.getrole();
    const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
    const des = localStorage.getItem('des') || '';

    const isFdcRole =
      roles.includes('Field Data Collector') ||
      des.includes('Field Data Collector') ||
      currentOfficeInfo.officeType === 'FIELD_DATA_COLLECTOR';

    // ═══════════════════ WORK ALLOCATION REPORT ═══════════════════
    if (reportPath === '/report/kerala_work_allocation_report') {
      let officeType = currentOfficeInfo.officeType;
      const districtOfficeId = currentOfficeInfo.districtOfficeId;
      const districtId = currentOfficeInfo.districtId;
      const talukOfficeId = currentOfficeInfo.talukOfficeId;
      const talukId = currentOfficeInfo.talukId;
      const districtName = currentOfficeInfo.districtName || 'district';
      const talukName = currentOfficeInfo.talukName || 'taluk';

      if (isFdcRole) {
        officeType = 'FIELD_DATA_COLLECTOR';
      } else if (!officeType) {
        try {
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

      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        navigate(`/report/kerala_work_allocation_report/zone/${encodeURIComponent(districtName.toLowerCase())}/${encodeURIComponent(talukName.toLowerCase())}`, {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
            talukId: talukOfficeId || talukId,
            talukName: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true
          },
        });
      } else if (officeType === 'DIRECTORATE') {
        navigate('/report/kerala_work_allocation_report', {
          state: { officeType, viewLevel: 'state' },
        });
      } else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId || localStorage.getItem('dis');
        navigate(`/report/kerala_work_allocation_report/taluk/${encodeURIComponent(districtName.toLowerCase())}`, {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtName: districtName || '',
            isDirectAccess: true
          },
        });
      } else if (officeType === 'TALUK') {
        const talukIdValue = talukOfficeId || talukId;
        navigate(`/report/kerala_work_allocation_report/zone/${encodeURIComponent(districtName.toLowerCase())}/${encodeURIComponent(talukName.toLowerCase())}`, {
          state: {
            officeType,
            viewLevel: 'taluk',
            talukId: talukIdValue,
            talukName: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true
          },
        });
      }
    }

    // ═══════════════════ CLUSTER REPORT ═══════════════════
    else if (reportPath === '/kerala_cluster_report') {
      let officeType = currentOfficeInfo.officeType;
      const { districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = currentOfficeInfo;

      if (isFdcRole) {
        officeType = 'FIELD_DATA_COLLECTOR';
      }

      const getCurrentMonthFormatted = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      };

      const currentMonth = getCurrentMonthFormatted();

      // ── FIELD DATA COLLECTOR ── Jump straight to Zone cluster report for their zone
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        const talukIdValue = talukOfficeId || talukId;
        navigate(`/Report/kerala_cluster_report/zone_cluster_report/direct/${talukIdValue}`, {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
            talukId: talukIdValue,
            talukOfficeId: talukIdValue,
            talukName: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
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

      // ── DIRECTORATE ── State-level view
      else if (officeType === 'DIRECTORATE') {
        navigate('/Report/kerala_cluster_report', {
          state: {
            officeType,
            viewLevel: 'state',
          },
        });
      }

      // ── DISTRICT ── Jump straight to Taluk report for this district
      else if (officeType === 'DISTRICT') {
        const districtIdValue = districtOfficeId || districtId;

        if (!districtIdValue) {
          console.error('District ID not found for DISTRICT office type');
          return;
        }

        navigate('/Report/kerala_cluster_report/taluk_cluster_report/direct', {
          state: {
            officeType,
            viewLevel: 'district',
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
        const talukIdValue = talukOfficeId || talukId;

        if (!talukIdValue) {
          console.error('Taluk ID not found for TALUK office type');
          return;
        }

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
      let officeType = currentOfficeInfo.officeType;
      const { districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = currentOfficeInfo;

      if (isFdcRole) {
        officeType = 'FIELD_DATA_COLLECTOR';
      }

      const getAgriMonthFormatted = () => {
        const agriYear = AuthService.agriyear() || '2025-2026';
        const startYear = parseInt(agriYear.split('-')[0], 10) || new Date().getFullYear();
        const now = new Date();
        const monthIndex = now.getMonth();
        const monthNum = monthIndex + 1;
        const mm = String(monthNum).padStart(2, '0');
        const year = monthIndex >= 6 ? startYear : startYear + 1;
        return `${year}-${mm}`;
      };

      const currentMonth = getAgriMonthFormatted();

      // ── FIELD DATA COLLECTOR ── Jump straight to Zone form report for their zone
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        const talukIdValue = talukOfficeId || talukId;
        navigate(`/kerala_form_report/zone_form_report/direct/${talukIdValue}`, {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
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

      // ── DIRECTORATE ── State-level view
      else if (officeType === 'DIRECTORATE') {
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

        navigate('/kerala_form_report/taluk_form_report/direct', {
          state: {
            officeType,
            viewLevel: 'district',
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
    else if (reportPath === '/schemes/earas/cce/KeralaForm5ReportList') {
      let officeType = currentOfficeInfo.officeType;
      const { districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = currentOfficeInfo;

      if (isFdcRole) {
        officeType = 'FIELD_DATA_COLLECTOR';
      }

      // ── FIELD DATA COLLECTOR ── Jump straight to Zone-wise CCE report for their zone
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        const talukIdValue = talukOfficeId || talukId;
        const dName = districtName || 'district';
        const tName = talukName || 'taluk';

        navigate(
          `/kerala_form5_report/taluk_form5_report/zone_form5_report/${encodeURIComponent(dName)}/${encodeURIComponent(tName)}`,
          {
            state: {
              officeType,
              viewLevel: 'cluster',
              zoneId,
              zoneName: currentOfficeInfo.zoneName || '',
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

      // ── DIRECTORATE ── State-level list
      else if (officeType === 'DIRECTORATE') {
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

        const dName = districtName || 'district';
        const tName = talukName || 'taluk';

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
    else if (reportPath === '/schemes/earas/cce/KeralaForm2') {
      let officeType = currentOfficeInfo.officeType;

      if (isFdcRole) {
        officeType = 'FIELD_DATA_COLLECTOR';
      } else if (!officeType) {
        try {
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

      const { districtOfficeId, districtId, talukOfficeId, talukId, districtName, talukName } = currentOfficeInfo;

      // ── FIELD DATA COLLECTOR ── Jump straight to Zone Form 2 for their zone
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/cce/ZoneForm2', {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
            talukId: talukOfficeId || talukId,
            talukName: talukName || '',
            selectedTaluk: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            activeTab: 0,
          },
        });
      }

      // ── DIRECTORATE ── State-level view
      else if (officeType === 'DIRECTORATE') {
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

      const tokenRole = AuthService.getrole();
      const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
      const des = localStorage.getItem('des') || '';

      if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
        officeType = 'FIELD_DATA_COLLECTOR';
      } else if (!officeType) {
        try {
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



      // ── FIELD DATA COLLECTOR ── Jump straight to Cluster-wise Form 3A
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/Report/Form3A/ClusterForm3A', {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
            talukId: talukOfficeId || talukId,
            talukName: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            irrigation: 'ALL',
            activeTab: -1
          },
        });
      }

      // ── DIRECTORATE ── State-level view
      else if (officeType === 'DIRECTORATE') {
        navigate('/schemes/earas/Report/Form3A/KeralaForm3A', {
          state: {
            officeType,
            viewLevel: 'state',
            isDirectAccess: true,
            irrigation: 'ALL',
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


        navigate('/schemes/earas/Report/Form3A/TalukForm3A', {
          state: {
            officeType,
            viewLevel: 'district',
            districtId: districtIdValue,
            districtName: districtName || '',
            selectedDistrict: districtName || '',
            isDirectAccess: true,
            irrigation: 'ALL',
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
            irrigation: 'ALL',
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

      const tokenRole = AuthService.getrole();
      const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
      const des = localStorage.getItem('des') || '';

      if (roles.includes('Field Data Collector') || des.includes('Field Data Collector')) {
        officeType = 'FIELD_DATA_COLLECTOR';
      } else if (!officeType) {
        try {
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



      // ── FIELD DATA COLLECTOR ── Jump straight to Cluster-wise Form 3B
      if (officeType === 'FIELD_DATA_COLLECTOR') {
        const zoneId = currentOfficeInfo.zoneId || AuthService.getzone();
        navigate('/schemes/earas/Report/Form3B/ClusterForm3B', {
          state: {
            officeType,
            viewLevel: 'cluster',
            zoneId,
            zoneName: currentOfficeInfo.zoneName || '',
            talukId: talukOfficeId || talukId,
            talukName: talukName || '',
            districtId: districtOfficeId || districtId || localStorage.getItem('dis') || null,
            districtName: districtName || '',
            isDirectAccess: true,
            activeTab: -1
          },
        });
      }

      // ── DIRECTORATE ── State-level view
      else if (officeType === 'DIRECTORATE') {
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

    // ═══════════════════ INSPECTION REPORT ═══════════════════
    else if (reportPath === '/Report/kerala_inspection_report' || reportPath === '/schemes/earas/kerala_inspection_report') {
      if (!officeInfo) {
        navigate('/Report/kerala_inspection_report');
        return;
      }

      let { officeType, districtName, talukName } = officeInfo;
      if (!officeType) {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            const userRole = userObj?.role || '';
            if (userRole.toLowerCase().includes('district')) officeType = 'DISTRICT';
            else if (userRole.toLowerCase().includes('taluk')) officeType = 'TALUK';
            else officeType = 'DIRECTORATE';
          }
        } catch (e) {
          officeType = 'DIRECTORATE';
        }
      }

      if (officeType === 'DIRECTORATE') {
        navigate('/Report/kerala_inspection_report');
      } else if (officeType === 'DISTRICT') {
        const distName = districtName || localStorage.getItem('userDistrict') || 'thiruvananthapuram';
        navigate(`/kerala_inspection_report/taluk_inspection_report/${encodeURIComponent(distName.toLowerCase())}`, {
          state: { officeType, viewLevel: 'district', districtName: distName, isDirectAccess: true }
        });
      } else if (officeType === 'TALUK') {
        const distName = districtName || localStorage.getItem('userDistrict') || 'thiruvananthapuram';
        const tName = talukName || localStorage.getItem('userTaluk') || 'neyyattinkara';
        navigate(`/kerala_inspection_report/zone_inspection_report/${encodeURIComponent(distName.toLowerCase())}/${encodeURIComponent(tName.toLowerCase())}`, {
          state: { officeType, viewLevel: 'taluk', districtName: distName, talukName: tName, isDirectAccess: true }
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