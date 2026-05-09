import React, { useState } from "react";
import {
  Box, Grid, Paper, Typography, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Checkbox, Divider, Snackbar, Alert,
  TableSortLabel, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Breadcrumb from 'routes/Breadcrumb';

const themeColor = "#05307a";

const CropsManagement = () => {

 

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
      {/* Snackbar */}
   
      <Box sx={{ p: 3 }}>
      {/* Top Section */}
      <Paper sx={{ p: 4, mb: 4, boxShadow: 6, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ color: themeColor }}>
          🌱 Crops Management 
        </Typography>
        <Divider sx={{ mb: 3 }} />
       
      </Paper>
      </Box>    
    </Grid>
    </Grid>
  );
};

export default CropsManagement;
