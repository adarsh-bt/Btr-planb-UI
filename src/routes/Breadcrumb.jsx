import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Breadcrumbs, Chip, Paper, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";

// Styled Chip for Breadcrumb
const StyledBreadcrumb = styled(Chip)(({ theme, isLast }) => {
  const backgroundColor = isLast
    ? "#e3f2fd" // Light blue for current path
    : theme.palette.grey[200];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: isLast ? "#1e88e5" : theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.pxToRem(16), // <-- Increase font size here
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.1),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.2),
    },
  };
});

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const formatLabel = (string) => {
  return string
    .replace(/_/g, ' ')                     // Replace underscores with spaces
    .split(' ')                             // Split into words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each
    .join(' ');                             // Join back into a string
};



const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

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

          {pathnames
            // ✅ hide numeric or unwanted segments
            .filter((segment) => isNaN(segment))
            .map((value, index, arr) => {
              const to = `/${pathnames
                .slice(0, pathnames.indexOf(value) + 1)
                .join("/")}`;
              const isLast = index === arr.length - 1;
              const label = formatLabel(value);

              return isLast ? (
                <StyledBreadcrumb
                  key={to}
                  label={label}
                  isLast={isLast}
                  deleteIcon={<ExpandMoreIcon />}
                  onDelete={() => {}}
                />
              ) : (
                <StyledBreadcrumb
                  key={to}
                  component={Link}
                  to={to}
                  label={label}
                  isLast={false}
                />
              );
            })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
};


export default Breadcrumb;