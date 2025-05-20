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
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.1),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.2),
    },
  };
});

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Box sx={{ p: 1, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
      <Paper elevation={0} sx={{ p: 1, backgroundColor: "#ffffff", borderRadius: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return isLast ? (
              <StyledBreadcrumb
                key={to}
                label={value}
                isLast={isLast}
                deleteIcon={<ExpandMoreIcon />}
                onDelete={() => {}}
              />
            ) : (
              <StyledBreadcrumb key={to} component={Link} to={to} label={value} isLast={false} />
            );
          })}
        </Breadcrumbs>
      </Paper>
    </Box>
  );
};

export default Breadcrumb;