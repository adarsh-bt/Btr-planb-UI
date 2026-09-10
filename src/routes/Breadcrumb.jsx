import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Chip, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { emphasize, styled } from '@mui/material/styles';

// Styled Chip for Breadcrumb
const StyledBreadcrumb = styled(Chip)(({ theme, isLast }) => {
  const backgroundColor = isLast ? '#e3f2fd' : theme.palette.grey[200];

  return {
    backgroundColor,
    height: theme.spacing(3.2),
    color: isLast ? '#1565c0' : theme.palette.text.primary,
    fontWeight: isLast ? 700 : theme.typography.fontWeightMedium,
    fontSize: '0.85rem',
    cursor: isLast ? 'default' : 'pointer',
    borderRadius: '16px',

    '&:hover, &:focus': {
      backgroundColor: !isLast ? emphasize(backgroundColor, 0.1) : backgroundColor
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: !isLast ? emphasize(backgroundColor, 0.2) : backgroundColor
    }
  };
});

const formatLabel = (string) => {
  if (!string) return '';
  return string
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Route resolver for specific report hierarchies
const resolveCustomBreadcrumbs = (pathname) => {
  const decodedPath = decodeURIComponent(pathname);

  // Work Allocation Abstract Hierarchy
  if (decodedPath.startsWith('/kerala_work_allocation_report')) {
    const parts = decodedPath.split('/').filter(Boolean);
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Reports', to: '/reports' },
      { label: 'Work Allocation Abstract', to: '/kerala_work_allocation_report' }
    ];

    if (parts[1] === 'taluk' && parts[2]) {
      items.push({
        label: `${parts[2]} District`,
        to: `/kerala_work_allocation_report/taluk/${encodeURIComponent(parts[2])}`
      });
    } else if (parts[1] === 'zone' && parts[2]) {
      items.push({
        label: `${parts[2]} District`,
        to: `/kerala_work_allocation_report/taluk/${encodeURIComponent(parts[2])}`
      });
      if (parts[3]) {
        items.push({
          label: `${parts[3]} Taluk`,
          to: `/kerala_work_allocation_report/zone/${encodeURIComponent(parts[2])}/${encodeURIComponent(parts[3])}`
        });
      }
    }
    return items;
  }

  // Cluster Report Hierarchy
  if (decodedPath.startsWith('/kerala_cluster_report')) {
    const parts = decodedPath.split('/').filter(Boolean);
    const items = [
      { label: 'Home', to: '/' },
      { label: 'Reports', to: '/reports' },
      { label: 'Cluster Report', to: '/kerala_cluster_report' }
    ];

    if (parts[1] === 'taluk' && parts[2]) {
      items.push({
        label: `${parts[2]} District`,
        to: `/kerala_cluster_report/taluk/${encodeURIComponent(parts[2])}`
      });
    } else if (parts[1] === 'zone' && parts[2]) {
      items.push({
        label: `${parts[2]} District`,
        to: `/kerala_cluster_report/taluk/${encodeURIComponent(parts[2])}`
      });
      if (parts[3]) {
        items.push({
          label: `${parts[3]} Taluk`,
          to: `/kerala_cluster_report/zone/${encodeURIComponent(parts[2])}/${encodeURIComponent(parts[3])}`
        });
      }
    }
    return items;
  }

  return null;
};

const Breadcrumb = () => {
  const location = useLocation();
  const customItems = resolveCustomBreadcrumbs(location.pathname);

  if (customItems) {
    return (
      <Box sx={{ p: 0.5, mb: 1, width: '100%' }}>
        <Paper elevation={0} sx={{ p: 1, px: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9e9e9e' }} />} aria-label="breadcrumb">
            {customItems.map((item, index) => {
              const isLast = index === customItems.length - 1;
              if (index === 0) {
                return (
                  <StyledBreadcrumb
                    key={item.to}
                    component={Link}
                    to={item.to}
                    label={item.label}
                    isLast={isLast}
                    icon={<HomeIcon fontSize="small" sx={{ color: isLast ? '#1565c0' : 'inherit' }} />}
                  />
                );
              }

              return isLast ? (
                <StyledBreadcrumb key={item.to} label={item.label} isLast={true} />
              ) : (
                <StyledBreadcrumb key={item.to} component={Link} to={item.to} label={item.label} isLast={false} />
              );
            })}
          </Breadcrumbs>
        </Paper>
      </Box>
    );
  }

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ p: 0.5, mb: 1, width: '100%' }}>
      <Paper elevation={0} sx={{ p: 1, px: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#9e9e9e' }} />} aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          {pathnames
            .filter((segment) => isNaN(segment))
            .map((value, index, arr) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === arr.length - 1;
              const label = formatLabel(decodeURIComponent(value));

              return isLast ? (
                <StyledBreadcrumb key={to} label={label} isLast={true} />
              ) : (
                <StyledBreadcrumb key={to} component={Link} to={to} label={label} isLast={false} />
              );
            })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
};

export default Breadcrumb;