import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Card,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  TableSortLabel,
  TablePagination,
  Stack,
  TextareaAutosize,Snackbar,FormControlLabel,Switch,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Edit,
  PendingActions,
  Clear,
  Visibility,
  Download,
  FilterList,
  Refresh,Person,
  Cancel,
  CalendarToday,Info,Warning,PlayCircleOutline,PlayCircleFilled
  
} from '@mui/icons-material';
import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import { useTheme } from '@mui/material/styles';

function FormApprovals() {
  const theme = useTheme();
  const role = authservice.getrole()?.trim();
  const BASE_URL = mainapi.BASE_URL;
  


  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          Form Approval Requests 
        </Typography>
        
        <Card sx={{ p: 1, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {/* Header Section */}
        


         
        </Card>
      </Grid>



    </Grid>
  );
}

export default FormApprovals;