import React from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs, Chip, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";

const TALUK_SESSION_KEY = 'talukReportState';
const ZONE_SESSION_KEY = 'zoneReportState';

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

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Check if current page is part of Report module
  const isReportModule = pathnames.some((p) =>
    ['report', 'kerala_cluster_report', 'kerala_form_report', 'formreport', 'cce_report', 'cce'].includes(p.toLowerCase())
  );

  let items = [];

  if (isReportModule) {
    const officeInfo = getUserOfficeInfo();
    const officeType = location.state?.officeType || officeInfo.officeType || 'DIRECTORATE';

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
    const isFormReport = location.pathname.toLowerCase().includes('form_report') || location.pathname.toLowerCase().includes('formreport');

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
                  onDelete={() => {}}
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