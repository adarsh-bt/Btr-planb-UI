import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs, Chip, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import AuthService from "pages/authentication/services/authservice";

const TALUK_SESSION_KEY = 'talukReportState';
const ZONE_SESSION_KEY = 'zoneReportState';
const TALUK_FORM5_SESSION_KEY = 'talukForm5ReportState';
const ZONE_FORM5_SESSION_KEY = 'zoneForm5ReportState';
const TALUK_FORM2_SESSION_KEY = 'talukForm2State';
const ZONE_FORM2_SESSION_KEY = 'zoneForm2State';
const FORM2_SESSION_KEY = 'form2State';
const TALUK_FORM3A_SESSION_KEY = 'talukForm3AState';
const ZONE_FORM3A_SESSION_KEY = 'zoneForm3AState';
const FORM3A_SESSION_KEY = 'form3AState';
const TALUK_FORM3B_SESSION_KEY = 'talukForm3BState';
const ZONE_FORM3B_SESSION_KEY = 'zoneForm3BState';
const FORM3B_SESSION_KEY = 'form3BState';

// Styled Chip for Breadcrumb
const StyledBreadcrumb = styled(Chip)(({ theme, isLast }) => {
  const backgroundColor = isLast
    ? "#e3f2fd"
    : theme.palette.grey[200];

  return {
    backgroundColor,
    height: theme.spacing(3),
    color: isLast ? "#1e88e5" : theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(16),
    cursor: isLast ? "default" : "pointer",

    '&:hover, &:focus': {
      backgroundColor: !isLast
        ? emphasize(backgroundColor, 0.1)
        : backgroundColor,
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: !isLast
        ? emphasize(backgroundColor, 0.2)
        : backgroundColor,
    },
  };
});

const formatLabel = (string) => {
  if (!string) return '';
  return string
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

function getSavedSessionState(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function getUserOfficeInfo() {
  try {
    return JSON.parse(sessionStorage.getItem('userOfficeInfo') || '{}');
  } catch {
    return {};
  }
}

function getEffectiveOfficeType(locationState, officeInfo) {
  if (locationState?.officeType) return locationState.officeType;
  if (officeInfo?.officeType) return officeInfo.officeType;

  try {
    const tokenRole = AuthService.getrole();
    const roles = Array.isArray(tokenRole) ? tokenRole : [tokenRole];
    const des = localStorage.getItem('des') || '';

    if (roles.some(r => ['Taluk Level Approver', 'Taluk Level Data Viewer', 'Field Inspector', 'Taluk Statistical Officer'].includes(r)) || des.includes('Taluk')) {
      return 'TALUK';
    }
    if (roles.some(r => ['District Level Approver', 'District Level Data Viewer'].includes(r)) || des.includes('District')) {
      return 'DISTRICT';
    }
  } catch (e) {
    console.error('Error resolving officeType from role in Breadcrumb:', e);
  }

  return 'DIRECTORATE';
}

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Check if current page is part of Report module
  const isReportModule =
    location.pathname.toLowerCase().includes('report') ||
    location.pathname.toLowerCase().includes('form5') ||
    location.pathname.toLowerCase().includes('form_5') ||
    location.pathname.toLowerCase().includes('form2') ||
    location.pathname.toLowerCase().includes('form_2') ||
    location.pathname.toLowerCase().includes('form3a') ||
    location.pathname.toLowerCase().includes('form_3a') ||
    location.pathname.toLowerCase().includes('form3b') ||
    location.pathname.toLowerCase().includes('form_3b') ||
    location.pathname.toLowerCase().includes('ccedataview') ||
    location.state?.from === 'form5';

  let items = [];

  if (isReportModule) {
    const officeInfo = getUserOfficeInfo();
    const officeType = getEffectiveOfficeType(location.state, officeInfo);

    const talukSessionState = getSavedSessionState(TALUK_SESSION_KEY);
    const zoneSessionState = getSavedSessionState(ZONE_SESSION_KEY);

    const districtId = location.state?.districtId || talukSessionState.districtId || zoneSessionState.districtId || (params.districtId && !isNaN(params.districtId) ? params.districtId : null);
    const districtName = location.state?.districtName || talukSessionState.districtName || zoneSessionState.districtName || params.districtName || '';
    const talukId = location.state?.talukId || zoneSessionState.talukId || (params.talukId && !isNaN(params.talukId) ? params.talukId : null);
    const talukName = location.state?.talukName || zoneSessionState.talukName || params.talukName || '';

    // Always start with Report Menu
    items.push({
      label: 'Report',
      path: '/Report',
    });

    const isClusterReport = location.pathname.toLowerCase().includes('cluster_report') || location.pathname.toLowerCase().includes('kerala_cluster');
    const isForm5Report =
      location.pathname.toLowerCase().includes('form5') ||
      location.pathname.toLowerCase().includes('form_5') ||
      location.pathname.toLowerCase().includes('ccedataview') ||
      location.state?.from === 'form5';
    const isForm2Report =
      location.pathname.toLowerCase().includes('form2') ||
      location.pathname.toLowerCase().includes('form_2');
    const isForm3AReport =
      location.pathname.toLowerCase().includes('form3a') ||
      location.pathname.toLowerCase().includes('form_3a');
    const isForm3BReport =
      location.pathname.toLowerCase().includes('form3b') ||
      location.pathname.toLowerCase().includes('form_3b');
    const isFormReport = (location.pathname.toLowerCase().includes('form_report') || location.pathname.toLowerCase().includes('formreport')) && !isForm5Report && !isForm2Report && !isForm3AReport && !isForm3BReport;

    if (isClusterReport) {
      const isStateLevel = location.pathname === '/Report/kerala_cluster_report' || location.pathname === '/kerala_cluster_report';
      const isDistrictLevel = location.pathname.includes('/district/') || location.pathname.includes('/taluk_cluster_report/direct');
      const isTalukLevel = location.pathname.includes('/zone_cluster_report') && !location.pathname.includes('/clusters');
      const isClusterLevel = location.pathname.includes('/clusters');

      // STATE segment (only for Directorate role)
      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({
          label: 'State',
          path: '/Report/kerala_cluster_report',
          state: { officeType: 'DIRECTORATE', viewLevel: 'state' },
        });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({
          label: 'State',
          path: null,
        });
      }

      // DISTRICT segment
      if (isDistrictLevel || isTalukLevel || isClusterLevel) {
        if (officeType === 'DIRECTORATE' || officeType === 'DISTRICT') {
          const districtLabel = districtName ? `District: ${formatLabel(districtName)}` : 'District';
          const targetDistrictPath = officeType === 'DISTRICT'
            ? '/Report/kerala_cluster_report/taluk_cluster_report/direct'
            : (districtId ? `/Report/kerala_cluster_report/district/taluk_cluster_report/${districtId}` : '/Report/kerala_cluster_report');

          const districtState = {
            officeType,
            districtId: districtId || officeInfo.districtOfficeId || officeInfo.districtId,
            districtOfficeId: districtId || officeInfo.districtOfficeId || officeInfo.districtId,
            districtName: districtName,
            ...(talukSessionState || {}),
          };

          items.push({
            label: districtLabel,
            path: isDistrictLevel ? null : targetDistrictPath,
            state: districtState,
          });
        }
      }

      // TALUK segment
      if (isTalukLevel || isClusterLevel) {
        const rawTalukLabel = talukName ? talukName.split('-')[0] : '';
        const talukLabel = rawTalukLabel ? `Taluk: ${formatLabel(rawTalukLabel)}` : 'Taluk';
        const formattedTalukSlug = talukName ? talukName : (rawTalukLabel && talukId ? `${rawTalukLabel.toLowerCase()}-${talukId}` : '');
        const targetTalukPath = officeType === 'TALUK'
          ? `/Report/kerala_cluster_report/zone_cluster_report/direct/${talukId || officeInfo.talukOfficeId || officeInfo.talukId}`
          : (districtName && formattedTalukSlug
            ? `/Report/kerala_cluster_report/taluk_cluster_report/zone_cluster_report/${districtName.toLowerCase()}/${formattedTalukSlug}`
            : (talukId ? `/Report/kerala_cluster_report/zone_cluster_report/direct/${talukId}` : null));

        const talukState = {
          officeType,
          talukId: talukId || officeInfo.talukOfficeId || officeInfo.talukId,
          talukName: rawTalukLabel || talukName,
          districtName,
          districtId,
          ...(zoneSessionState || {}),
        };

        items.push({
          label: talukLabel,
          path: isTalukLevel ? null : targetTalukPath,
          state: talukState,
        });
      }

      // CLUSTER segment
      if (isClusterLevel) {
        items.push({
          label: 'Cluster',
          path: null,
        });
      }

    } else if (isForm5Report) {
      const talukForm5SessionState = getSavedSessionState(TALUK_FORM5_SESSION_KEY);
      const zoneForm5SessionState = getSavedSessionState(ZONE_FORM5_SESSION_KEY);
      const form5SessionState = getSavedSessionState('form5ReportState');

      const isStateLevel = location.pathname.toLowerCase().includes('keralaform5reportlist') || location.pathname === '/schemes/earas/cce/KeralaForm5ReportList';
      const isTalukLevel = location.pathname.toLowerCase().includes('taluk_form5_report') && !location.pathname.toLowerCase().includes('zone_form5_report');
      const isZoneLevel = location.pathname.toLowerCase().includes('zone_form5_report');
      const isCceDataViewPage = location.pathname.toLowerCase().includes('ccedataview') || location.state?.from === 'form5';
      const isForm5OverviewPage = location.pathname.toLowerCase().includes('/form5') && !isStateLevel && !isTalukLevel && !isZoneLevel && !isCceDataViewPage;

      const f5DistrictId = location.state?.districtId || form5SessionState.districtId || zoneForm5SessionState.districtId || talukForm5SessionState.districtId || (params.districtId && !isNaN(params.districtId) ? params.districtId : null);
      const f5DistrictName = location.state?.districtName || form5SessionState.districtName || zoneForm5SessionState.districtName || talukForm5SessionState.districtName || params.districtName || '';
      const f5TalukId = location.state?.talukId || form5SessionState.talukId || zoneForm5SessionState.talukId || talukForm5SessionState.talukId || (params.talukId && !isNaN(params.talukId) ? params.talukId : null);
      const f5TalukName = location.state?.talukName || form5SessionState.talukName || zoneForm5SessionState.talukName || talukForm5SessionState.talukName || params.talukName || '';
      const f5ZoneId = location.state?.zoneId || form5SessionState.zoneId || null;
      const f5ZoneName = location.state?.zoneName || form5SessionState.zoneName || '';

      // STATE segment (only for DIRECTORATE role)
      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({
          label: 'State',
          path: '/schemes/earas/cce/KeralaForm5ReportList',
          state: { officeType: 'DIRECTORATE', viewLevel: 'state' },
        });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({
          label: 'State',
          path: null,
        });
      }

      // DISTRICT segment
      if (isTalukLevel || isZoneLevel || isForm5OverviewPage || isCceDataViewPage) {
        if (officeType === 'DIRECTORATE' || officeType === 'DISTRICT') {
          const districtLabel = f5DistrictName ? `District: ${formatLabel(f5DistrictName)}` : 'District';
          const targetDistrictId = f5DistrictId || officeInfo.districtOfficeId || officeInfo.districtId;
          const targetDistrictPath = officeType === 'DISTRICT'
            ? `/kerala_form5_report/taluk_form5_report/${targetDistrictId}`
            : (targetDistrictId ? `/kerala_form5_report/taluk_form5_report/${targetDistrictId}` : '/schemes/earas/cce/KeralaForm5ReportList');

          const districtState = {
            officeType,
            districtId: targetDistrictId,
            districtOfficeId: targetDistrictId,
            districtName: f5DistrictName,
            isDirectAccess: officeType === 'DISTRICT',
            ...(talukForm5SessionState || {}),
          };

          items.push({
            label: districtLabel,
            path: (isTalukLevel && !isZoneLevel && !isForm5OverviewPage && !isCceDataViewPage) ? null : targetDistrictPath,
            state: districtState,
          });
        }
      }

      // TALUK segment
      if (isZoneLevel || isForm5OverviewPage || isCceDataViewPage) {
        const rawTalukLabel = f5TalukName ? f5TalukName.split('-')[0] : '';
        const talukLabel = rawTalukLabel ? `Taluk: ${formatLabel(rawTalukLabel)}` : 'Taluk';
        const formattedTalukSlug = f5TalukName ? f5TalukName : (rawTalukLabel && f5TalukId ? `${rawTalukLabel.toLowerCase()}-${f5TalukId}` : '');
        const targetTalukId = f5TalukId || officeInfo.talukOfficeId || officeInfo.talukId;

        const targetTalukPath = officeType === 'TALUK'
          ? `/kerala_form5_report/zone_form5_report/direct/${targetTalukId}`
          : (f5DistrictName && formattedTalukSlug
            ? `/kerala_form5_report/taluk_form5_report/zone_form5_report/${f5DistrictName.toLowerCase()}/${formattedTalukSlug}`
            : (targetTalukId ? `/kerala_form5_report/zone_form5_report/direct/${targetTalukId}` : null));

        const talukState = {
          officeType,
          talukId: targetTalukId,
          talukOfficeId: targetTalukId,
          talukName: rawTalukLabel || f5TalukName,
          districtName: f5DistrictName,
          districtId: f5DistrictId,
          isDirectAccess: officeType === 'TALUK',
          ...(zoneForm5SessionState || {}),
        };

        items.push({
          label: talukLabel,
          path: (isZoneLevel && !isForm5OverviewPage && !isCceDataViewPage) ? null : targetTalukPath,
          state: talukState,
        });
      }

      // OVERVIEW segment (Form 5 page)
      if (isForm5OverviewPage || isCceDataViewPage) {
        const overviewLabel = f5ZoneName ? `${formatLabel(f5ZoneName)} CCE Overview` : 'CCE Progress Status Overview';
        const form5Path = '/schemes/earas/cce/Form5';
        const form5State = {
          officeType,
          zoneId: f5ZoneId,
          zoneName: f5ZoneName,
          talukId: f5TalukId,
          talukName: f5TalukName,
          districtId: f5DistrictId,
          districtName: f5DistrictName,
          ...(form5SessionState || {}),
          ...(location.state || {})
        };

        items.push({
          label: overviewLabel,
          path: isCceDataViewPage ? form5Path : null,
          state: form5State,
        });
      }

      // CCE DATA VIEW segment (Last detail page of Form 5)
      if (isCceDataViewPage) {
        items.push({
          label: 'CCE Data View',
          path: null,
        });
      }

    } else if (isForm2Report) {
      const talukForm2SessionState = getSavedSessionState(TALUK_FORM2_SESSION_KEY);
      const zoneForm2SessionState = getSavedSessionState(ZONE_FORM2_SESSION_KEY);
      const form2SessionState = getSavedSessionState(FORM2_SESSION_KEY);

      const isStateLevel = location.pathname.toLowerCase().includes('keralaform2') || location.pathname === '/schemes/earas/cce/KeralaForm2';
      const isDistrictLevel = location.pathname.toLowerCase().includes('talukform2') || location.pathname === '/schemes/earas/cce/TalukForm2';
      const isTalukLevel = location.pathname.toLowerCase().includes('zoneform2') || location.pathname === '/schemes/earas/cce/ZoneForm2';
      const isForm2OverviewPage = (location.pathname.toLowerCase().endsWith('/form2') || location.pathname === '/schemes/earas/cce/Form2') && !isStateLevel && !isDistrictLevel && !isTalukLevel;

      const f2DistrictId = location.state?.districtId || form2SessionState.districtId || zoneForm2SessionState.districtId || talukForm2SessionState.districtId || (params.districtId && !isNaN(params.districtId) ? params.districtId : null);
      const f2DistrictName = location.state?.districtName || location.state?.selectedDistrict || form2SessionState.districtName || zoneForm2SessionState.districtName || talukForm2SessionState.districtName || params.districtName || '';
      const f2TalukId = location.state?.talukId || form2SessionState.talukId || zoneForm2SessionState.talukId || talukForm2SessionState.talukId || (params.talukId && !isNaN(params.talukId) ? params.talukId : null);
      const f2TalukName = location.state?.talukName || location.state?.selectedTaluk || form2SessionState.talukName || zoneForm2SessionState.talukName || talukForm2SessionState.talukName || params.talukName || '';
      const f2ZoneName = location.state?.zoneName || form2SessionState.zoneName || zoneForm2SessionState.zoneName || '';

      // STATE segment (only for DIRECTORATE role)
      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({
          label: 'State',
          path: '/schemes/earas/cce/KeralaForm2',
          state: { officeType: 'DIRECTORATE', viewLevel: 'state' },
        });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({
          label: 'State',
          path: null,
        });
      }

      // DISTRICT segment
      if (isDistrictLevel || isTalukLevel || isForm2OverviewPage) {
        if (officeType === 'DIRECTORATE' || officeType === 'DISTRICT') {
          const districtLabel = f2DistrictName ? `District: ${formatLabel(f2DistrictName)}` : 'District';
          const targetDistrictId = f2DistrictId || officeInfo.districtOfficeId || officeInfo.districtId;
          const targetDistrictPath = '/schemes/earas/cce/TalukForm2';

          const districtState = {
            officeType,
            districtId: targetDistrictId,
            districtOfficeId: targetDistrictId,
            districtName: f2DistrictName,
            selectedDistrict: f2DistrictName,
            isDirectAccess: officeType === 'DISTRICT',
            ...(talukForm2SessionState || {}),
          };

          items.push({
            label: districtLabel,
            path: isDistrictLevel ? null : targetDistrictPath,
            state: districtState,
          });
        }
      }

      // TALUK segment
      if (isTalukLevel || isForm2OverviewPage) {
        const rawTalukLabel = f2TalukName ? f2TalukName.split('-')[0] : '';
        const talukLabel = rawTalukLabel ? `Taluk: ${formatLabel(rawTalukLabel)}` : 'Taluk';
        const targetTalukId = f2TalukId || officeInfo.talukOfficeId || officeInfo.talukId;
        const targetTalukPath = '/schemes/earas/cce/ZoneForm2';

        const talukState = {
          officeType,
          talukId: targetTalukId,
          talukOfficeId: targetTalukId,
          talukName: rawTalukLabel || f2TalukName,
          selectedTaluk: rawTalukLabel || f2TalukName,
          districtName: f2DistrictName,
          districtId: f2DistrictId,
          isDirectAccess: officeType === 'TALUK',
          ...(zoneForm2SessionState || {}),
        };

        items.push({
          label: talukLabel,
          path: isTalukLevel ? null : targetTalukPath,
          state: talukState,
        });
      }

      // FORM 2 OVERVIEW segment
      if (isForm2OverviewPage) {
        const overviewLabel = f2ZoneName ? `${formatLabel(f2ZoneName)} Form 2 Overview` : 'Form 2 Overview';
        items.push({
          label: overviewLabel,
          path: null,
        });
      }

    } else if (isForm3AReport) {
      const talukForm3ASessionState = getSavedSessionState(TALUK_FORM3A_SESSION_KEY);
      const zoneForm3ASessionState = getSavedSessionState(ZONE_FORM3A_SESSION_KEY);
      const form3ASessionState = getSavedSessionState(FORM3A_SESSION_KEY);

      const isStateLevel = location.pathname.toLowerCase().includes('keralaform3a') || location.pathname === '/schemes/earas/Report/Form3A/KeralaForm3A';
      const isDistrictLevel = location.pathname.toLowerCase().includes('talukform3a') || location.pathname === '/schemes/earas/Report/Form3A/TalukForm3A';
      const isTalukLevel = location.pathname.toLowerCase().includes('zoneform3a') || location.pathname === '/schemes/earas/Report/Form3A/ZoneForm3A';
      const isForm3AOverviewPage = (location.pathname.toLowerCase().endsWith('/form3a') || location.pathname === '/schemes/earas/Report/Form3A/Form3A') && !isStateLevel && !isDistrictLevel && !isTalukLevel;

      const f3aDistrictId = location.state?.districtId || form3ASessionState.districtId || zoneForm3ASessionState.districtId || talukForm3ASessionState.districtId || (params.districtId && !isNaN(params.districtId) ? params.districtId : null);
      const f3aDistrictName = location.state?.districtName || location.state?.selectedDistrict || form3ASessionState.districtName || zoneForm3ASessionState.districtName || talukForm3ASessionState.districtName || params.districtName || '';
      const f3aTalukId = location.state?.talukId || form3ASessionState.talukId || zoneForm3ASessionState.talukId || talukForm3ASessionState.talukId || (params.talukId && !isNaN(params.talukId) ? params.talukId : null);
      const f3aTalukName = location.state?.talukName || location.state?.selectedTaluk || form3ASessionState.talukName || zoneForm3ASessionState.talukName || talukForm3ASessionState.talukName || params.talukName || '';
      const f3aZoneName = location.state?.zoneName || location.state?.selectedZone || form3ASessionState.zoneName || zoneForm3ASessionState.zoneName || '';

      // STATE segment (only for DIRECTORATE role)
      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({
          label: 'State',
          path: '/schemes/earas/Report/Form3A/KeralaForm3A',
          state: { officeType: 'DIRECTORATE', viewLevel: 'state' },
        });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({
          label: 'State',
          path: null,
        });
      }

      // DISTRICT segment
      if (isDistrictLevel || isTalukLevel || isForm3AOverviewPage) {
        if (officeType === 'DIRECTORATE' || officeType === 'DISTRICT') {
          const districtLabel = f3aDistrictName ? `District: ${formatLabel(f3aDistrictName)}` : 'District';
          const targetDistrictId = f3aDistrictId || officeInfo.districtOfficeId || officeInfo.districtId;
          const targetDistrictPath = '/schemes/earas/Report/Form3A/TalukForm3A';

          const districtState = {
            officeType,
            districtId: targetDistrictId,
            districtOfficeId: targetDistrictId,
            districtName: f3aDistrictName,
            selectedDistrict: f3aDistrictName,
            isDirectAccess: officeType === 'DISTRICT',
            ...(talukForm3ASessionState || {}),
          };

          items.push({
            label: districtLabel,
            path: isDistrictLevel ? null : targetDistrictPath,
            state: districtState,
          });
        }
      }

      // TALUK segment
      if (isTalukLevel || isForm3AOverviewPage) {
        const rawTalukLabel = f3aTalukName ? f3aTalukName.split('-')[0] : '';
        const talukLabel = rawTalukLabel ? `Taluk: ${formatLabel(rawTalukLabel)}` : 'Taluk';
        const targetTalukId = f3aTalukId || officeInfo.talukOfficeId || officeInfo.talukId;
        const targetTalukPath = '/schemes/earas/Report/Form3A/ZoneForm3A';

        const talukState = {
          officeType,
          talukId: targetTalukId,
          talukOfficeId: targetTalukId,
          talukName: rawTalukLabel || f3aTalukName,
          selectedTaluk: rawTalukLabel || f3aTalukName,
          districtName: f3aDistrictName,
          districtId: f3aDistrictId,
          isDirectAccess: officeType === 'TALUK',
          ...(zoneForm3ASessionState || {}),
        };

        items.push({
          label: talukLabel,
          path: isTalukLevel ? null : targetTalukPath,
          state: talukState,
        });
      }

      // FORM 3A OVERVIEW segment
      if (isForm3AOverviewPage) {
        const overviewLabel = f3aZoneName ? `${formatLabel(f3aZoneName)} Form 3A Overview` : 'Form 3A Overview';
        items.push({
          label: overviewLabel,
          path: null,
        });
      }

    } else if (isForm3BReport) {
      const talukForm3BSessionState = getSavedSessionState(TALUK_FORM3B_SESSION_KEY);
      const zoneForm3BSessionState = getSavedSessionState(ZONE_FORM3B_SESSION_KEY);
      const form3BSessionState = getSavedSessionState(FORM3B_SESSION_KEY);

      const isStateLevel = location.pathname.toLowerCase().includes('keralaform3b') || location.pathname === '/schemes/earas/Report/Form3B/KeralaForm3B';
      const isDistrictLevel = location.pathname.toLowerCase().includes('talukform3b') || location.pathname === '/schemes/earas/Report/Form3B/TalukForm3B';
      const isTalukLevel = location.pathname.toLowerCase().includes('zoneform3b') || location.pathname === '/schemes/earas/Report/Form3B/ZoneForm3B';
      const isForm3BOverviewPage = (location.pathname.toLowerCase().endsWith('/form3b') || location.pathname === '/schemes/earas/Report/Form3B/Form3B') && !isStateLevel && !isDistrictLevel && !isTalukLevel;

      const f3bDistrictId = location.state?.districtId || form3BSessionState.districtId || zoneForm3BSessionState.districtId || talukForm3BSessionState.districtId || (params.districtId && !isNaN(params.districtId) ? params.districtId : null);
      const f3bDistrictName = location.state?.districtName || location.state?.selectedDistrict || form3BSessionState.districtName || zoneForm3BSessionState.districtName || talukForm3BSessionState.districtName || params.districtName || '';
      const f3bTalukId = location.state?.talukId || form3BSessionState.talukId || zoneForm3BSessionState.talukId || talukForm3BSessionState.talukId || (params.talukId && !isNaN(params.talukId) ? params.talukId : null);
      const f3bTalukName = location.state?.talukName || location.state?.selectedTaluk || form3BSessionState.talukName || zoneForm3BSessionState.talukName || talukForm3BSessionState.talukName || params.talukName || '';
      const f3bZoneName = location.state?.zoneName || location.state?.selectedZone || form3BSessionState.zoneName || zoneForm3BSessionState.zoneName || '';

      // STATE segment (only for DIRECTORATE role)
      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({
          label: 'State',
          path: '/schemes/earas/Report/Form3B/KeralaForm3B',
          state: { officeType: 'DIRECTORATE', viewLevel: 'state' },
        });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({
          label: 'State',
          path: null,
        });
      }

      // DISTRICT segment
      if (isDistrictLevel || isTalukLevel || isForm3BOverviewPage) {
        if (officeType === 'DIRECTORATE' || officeType === 'DISTRICT') {
          const districtLabel = f3bDistrictName ? `District: ${formatLabel(f3bDistrictName)}` : 'District';
          const targetDistrictId = f3bDistrictId || officeInfo.districtOfficeId || officeInfo.districtId;
          const targetDistrictPath = '/schemes/earas/Report/Form3B/TalukForm3B';

          const districtState = {
            officeType,
            districtId: targetDistrictId,
            districtOfficeId: targetDistrictId,
            districtName: f3bDistrictName,
            selectedDistrict: f3bDistrictName,
            isDirectAccess: officeType === 'DISTRICT',
            ...(talukForm3BSessionState || {}),
          };

          items.push({
            label: districtLabel,
            path: isDistrictLevel ? null : targetDistrictPath,
            state: districtState,
          });
        }
      }

      // TALUK segment
      if (isTalukLevel || isForm3BOverviewPage) {
        const rawTalukLabel = f3bTalukName ? f3bTalukName.split('-')[0] : '';
        const talukLabel = rawTalukLabel ? `Taluk: ${formatLabel(rawTalukLabel)}` : 'Taluk';
        const targetTalukId = f3bTalukId || officeInfo.talukOfficeId || officeInfo.talukId;
        const targetTalukPath = '/schemes/earas/Report/Form3B/ZoneForm3B';

        const talukState = {
          officeType,
          talukId: targetTalukId,
          talukOfficeId: targetTalukId,
          talukName: rawTalukLabel || f3bTalukName,
          selectedTaluk: rawTalukLabel || f3bTalukName,
          districtName: f3bDistrictName,
          districtId: f3bDistrictId,
          isDirectAccess: officeType === 'TALUK',
          ...(zoneForm3BSessionState || {}),
        };

        items.push({
          label: talukLabel,
          path: isTalukLevel ? null : targetTalukPath,
          state: talukState,
        });
      }

      // FORM 3B OVERVIEW segment
      if (isForm3BOverviewPage) {
        const overviewLabel = f3bZoneName ? `${formatLabel(f3bZoneName)} Form 3B Overview` : 'Form 3B Overview';
        items.push({
          label: overviewLabel,
          path: null,
        });
      }

    } else if (isFormReport) {
      const isStateLevel = location.pathname.includes('/FormReport/Kerala');
      const isTalukLevel = location.pathname.includes('/taluk_form_report');
      const isZoneLevel = location.pathname.includes('/zone_form_report');

      if (officeType === 'DIRECTORATE' && !isStateLevel) {
        items.push({ label: 'State', path: '/FormReport/Kerala' });
      } else if (officeType === 'DIRECTORATE' && isStateLevel) {
        items.push({ label: 'State', path: null });
      }

      if (isTalukLevel || isZoneLevel) {
        items.push({
          label: params.districtName ? `District: ${formatLabel(params.districtName)}` : 'District',
          path: isTalukLevel ? null : `/kerala_form_report/taluk_form_report/${params.districtName}`,
        });
      }

      if (isZoneLevel) {
        items.push({
          label: params.talukName ? `Taluk: ${formatLabel(params.talukName)}` : 'Taluk',
          path: null,
        });
      }
    } else {
      // Default fallback for other report pages
      let currentPath = '';
      pathnames.forEach((seg, idx) => {
        if (seg.toLowerCase() === 'report') return;
        if (!isNaN(seg) || seg === 'direct') return;
        if (seg.includes('-') && seg.split('-').pop().match(/^\d+$/)) return;

        currentPath += `/${seg}`;
        const isLast = idx === pathnames.length - 1;
        items.push({
          label: formatLabel(seg.split('-')[0]),
          path: isLast ? null : `/Report${currentPath}`,
        });
      });
    }
  } else {
    // Non-report pages general breadcrumb
    let accumulatedPath = '';
    pathnames.forEach((segment, index) => {
      if (segment === 'direct') return;
      if (!isNaN(segment)) return;
      if (segment.includes('-') && segment.split('-').pop().match(/^\d+$/)) return;

      accumulatedPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;
      items.push({
        label: formatLabel(segment.split('-')[0]),
        path: isLast ? null : accumulatedPath,
      });
    });
  }

  const handleNavigation = (item) => {
    if (!item.path) return;
    if (item.state) {
      navigate(item.path, { state: item.state });
    } else {
      navigate(item.path);
    }
  };

  return (
    <Box sx={{ p: 1, backgroundColor: "#f9f9f9", borderRadius: 2, width: "100%" }}>
      <Paper elevation={0} sx={{ p: 1, backgroundColor: "#ffffff", borderRadius: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />

          {items.map((item, idx) => {
            const isLast = idx === items.length - 1 || !item.path;

            if (isLast) {
              return (
                <StyledBreadcrumb
                  key={`${item.label}-${idx}`}
                  label={item.label}
                  isLast={true}
                  deleteIcon={<ExpandMoreIcon />}
                  onDelete={() => { }}
                />
              );
            }

            return (
              <StyledBreadcrumb
                key={`${item.label}-${idx}`}
                label={item.label}
                isLast={false}
                onClick={() => handleNavigation(item)}
              />
            );
          })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
};

export default Breadcrumb;