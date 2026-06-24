import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs, Chip, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";

const SESSION_KEY = 'talukReportState';

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
  return string
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get the parent path for a given segment
const getParentPath = (pathnames, currentIndex) => {
  const parentSegments = pathnames.slice(0, currentIndex + 1);
  return `/${parentSegments.join("/")}`;
};

function getSavedTalukState() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Filter visible segments for display
  const visibleSegments = [];
  const visibleIndices = [];

  pathnames.forEach((segment, index) => {
    // Hide 'direct' segment
    if (segment === 'direct') return;

    // Hide district name and taluk name when in zone_cluster_report
    if (pathnames[index - 1] === 'zone_cluster_report' &&
        (index === pathnames.indexOf('zone_cluster_report') + 1 ||
         index === pathnames.indexOf('zone_cluster_report') + 2)) {
      return;
    }

    // Hide numeric IDs
    if (!isNaN(segment)) return;

    // Hide segments with ID patterns (e.g. "talukname-123")
    if (segment.includes('-') && segment.split('-').pop().match(/^\d+$/)) return;

    visibleSegments.push(segment);
    visibleIndices.push(index);
  });

  const handleNavigation = (to, segment) => {
    if (segment === 'taluk_cluster_report' && pathnames.includes('zone_cluster_report')) {
      // Restore the saved district context so TalukClusterReport has its districtId
      const savedState = getSavedTalukState();
      navigate('/kerala_cluster_report/taluk_cluster_report/direct', {
        state: savedState,
      });
    } else {
      navigate(to);
    }
  };

  const getDisplayLabel = (segment) => {
    if (segment.includes('-')) {
      const namePart = segment.split('-')[0];
      return formatLabel(namePart);
    }
    return formatLabel(segment);
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

          {visibleSegments.map((segment, idx) => {
            const originalIndex = visibleIndices[idx];
            const to = getParentPath(pathnames, originalIndex);
            const isLast = idx === visibleSegments.length - 1;
            const label = getDisplayLabel(segment);

            if (isLast) {
              return (
                <StyledBreadcrumb
                  key={to}
                  label={label}
                  isLast={true}
                  deleteIcon={<ExpandMoreIcon />}
                  onDelete={() => {}}
                />
              );
            }

            return (
              <StyledBreadcrumb
                key={to}
                label={label}
                isLast={false}
                onClick={() => handleNavigation(to, segment)}
              />
            );
          })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
};

export default Breadcrumb;