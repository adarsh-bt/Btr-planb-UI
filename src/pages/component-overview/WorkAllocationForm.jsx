import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  TextField,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Card,
  Divider,
  Tooltip,
  IconButton,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
  Switch,
  FormControlLabel,Stack
} from '@mui/material';
import { useParams } from 'react-router';
import { styled } from '@mui/system';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  RateReview as ReviewIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import Breadcrumb from 'routes/Breadcrumb';
import MainCard from 'components/MainCard';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';
import api from 'api/api';

// Transition for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// Custom styles for text fields and tabs
const FormInput = styled(TextField)(({ theme, disabled }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(12),
  width: '100%',
  boxSizing: 'border-box',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.75, 1),
    fontSize: theme.typography.pxToRem(14),
    backgroundColor: disabled ? theme.palette.grey[50] : 'transparent',
    color: theme.palette.text.primary,
  },
  '& .MuiInputBase-root': {
    backgroundColor: disabled ? theme.palette.grey[50] : 'transparent',
  },
  '& .Mui-disabled': {
    WebkitTextFillColor: disabled ? theme.palette.text.primary : undefined,
    opacity: 0.9,
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.5, 3),
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  color: theme.palette.grey[700],
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.lighter,
    color: theme.palette.primary.main,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    backgroundColor: theme.palette.primary.lighter,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: 'collapse',
  width: '100%',
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1.5),
  },
  '& thead th': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.text.primary,
    textAlign: 'center',
    padding: theme.spacing(1.5),
  },
  '& tbody tr:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  fontSize: theme.typography.pxToRem(12),
  verticalAlign: 'middle',
}));

const StatusCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 
    status === 'APPROVED' ? theme.palette.success.lighter :
    status === 'SUBMITTED' || status === 'PENDING' ? theme.palette.warning.lighter :
    status === 'RETURNED' ? theme.palette.error.lighter :
    status === 'UNDER REVIEW' ? theme.palette.info.lighter :
    theme.palette.info.lighter,
  borderLeft: `4px solid ${
    status === 'APPROVED' ? theme.palette.success.main :
    status === 'SUBMITTED' || status === 'PENDING' ? theme.palette.warning.main :
    status === 'RETURNED' ? theme.palette.error.main :
    status === 'UNDER REVIEW' ? theme.palette.info.main :
    theme.palette.info.main
  }`,
}));

const ActionButton = styled(Button)(({ theme, variant, color }) => ({
  padding: theme.spacing(1, 4),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: theme.typography.pxToRem(14),
  boxShadow: variant === 'contained' ? theme.shadows[2] : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
  },
  '&.Mui-disabled': {
    backgroundColor: variant === 'contained' ? theme.palette.grey[300] : 'transparent',
    color: theme.palette.grey[500],
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[10],
    width: '100%',
    maxWidth: 500,
    margin: '0 auto',
    position: 'fixed',
    top: theme.spacing(2),
    left: '50%',
    transform: 'translateX(-50%)',
  },
  '& .MuiDialog-container': {
    alignItems: 'flex-start',
  },
}));

function WorkAllocationForm() {
  const { zoneId } = useParams();
  const role = authservice.getrole()?.trim();

  const resolvedZoneId = role === 'Field Data Collector' ? authservice.getzone() : zoneId;

  const [activeTab, setActiveTab] = useState('tab1');
  const [result, setResult] = useState(null);
  const [zoneData, setZoneData] = useState([]);
  const [workAllocationData, setWorkAllocationData] = useState([]);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState('NEW');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Admin Tracking States
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isAdminEditEnabled, setIsAdminEditEnabled] = useState(false);
  const [approvalLogId, setApprovalLogId] = useState(null);
  const [remarksDialogOpen, setRemarksDialogOpen] = useState(false);

  const BASE_URL = mainapi.BASE_URL;

  // Determine if the current role context is an administrator
  const isAdmin = useMemo(() => {
    return ['Super Admin', 'IT Admin', 'District Level Approver', 'Taluk Level Approver'].includes(role);
  }, [role]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
// Premium ambient pulsing animation keyframes
const pulseAnimation = `
  @keyframes subtlePulse {
    0% {
      box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(211, 47, 47, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(211, 47, 47, 0);
    }
  }
`;

// Glowing button component for remarks
const GlowingActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 3),
  borderRadius: theme.shape.borderRadius,
  fontWeight: 600,
  textTransform: 'none',
  fontSize: theme.typography.pxToRem(14),
  animation: 'subtlePulse 2s infinite',
  border: `1px solid ${theme.palette.error.main}`,
  color: theme.palette.error.main,
  backgroundColor: 'rgba(211, 47, 47, 0.04)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    transform: 'translateY(-1px)',
  },
}));

// Inject style tag to handle keyframes cleanly
const styleTag = document.createElement('style');
styleTag.innerHTML = pulseAnimation;
document.head.appendChild(styleTag);
  // Fetch Zone details initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${BASE_URL}/btr-service/btr-api/zone-details/${resolvedZoneId}`);
        const result = response.data;
        setResult(result.payload);
        setZoneData(result.payload?.data || []);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resolvedZoneId]);



// Fetch saved allocations and read their approval status
  const fetchWorkAllocation = React.useCallback(async () => {
    if (!resolvedZoneId) return;
    const agriYear = authservice.agriyear();
    
    try {
      const res = await api.get(`${BASE_URL}/btr-service/btr-api/work-allocation-view/${resolvedZoneId}/${agriYear}`);
      const apiData = res.data;
      console.log("data ",apiData)
      if (apiData) {
        const allocations = apiData.payload || (Array.isArray(apiData) ? apiData : []);
        setWorkAllocationData(allocations);

        if (allocations.length > 0) {
          setApprovalLogId(allocations[0].approveId);
          const backendStatus = allocations[0].status || (allocations[0].isEdit ? 'DRAFT' : 'SUBMITTED');
          setFormStatus(backendStatus);
          
          if (isAdmin) {
            setIsDisabled(true);
          } else {
            if (backendStatus === 'SUBMITTED' || backendStatus === 'PENDING' || backendStatus === 'APPROVED') {
              setIsDisabled(true);
            } else {
              setIsDisabled(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching work allocation data:', err);
    }
  }, [resolvedZoneId, isAdmin, BASE_URL]);

  // Clean, separate trigger hook on mount
  useEffect(() => {
    fetchWorkAllocation();
  }, [fetchWorkAllocation]);


  // Form completion validator rules
  const canSubmit = useMemo(() => {
    if (!data || data.length === 0) return false;
    const requiredFields = [
      'Wet_area', 'Dry_area', 'Total_area', 'forest_a', 'forest_b', 'forest_c',
      'area_under', 'plantation_under', 'plantation_not_under', 'kayal_excluded',
      'others_dry_13', 'others_wet_14', 'others_total', 'plots_dry_16', 'plots_wet_17',
      'plots_total', 'total_area_wet_19', 'total_area_dry_21', 'total_area_total_20'
    ];
    const hasEmptyFields = data.some((row) =>
      requiredFields.some((field) => row[field] === '' || row[field] === null || row[field] === undefined)
    );
    const hasErrors = Object.values(validationErrors).some((msg) => msg !== '');
    return !hasEmptyFields && !hasErrors;
  }, [data, validationErrors]);

  // Merge datasets
  useEffect(() => {
    if (zoneData.length > 0 && workAllocationData.length > 0) {
      const merged = zoneData.map(zoneItem => {
        const workItem = workAllocationData.find(work => work.lbcode === zoneItem.lbcode);
        return {
          blocks: zoneItem.blocks || [],
          p_name: zoneItem.p_name || '',
          lbcode: zoneItem.lbcode || '',
          Wet_area: workItem?.villageWetArea?.toString() || '',
          Dry_area: workItem?.villageDryArea?.toString() || '',
          Total_area: workItem?.villageTotalArea?.toString() || '',
          forest_a: workItem?.forestAreaA?.toString() || '',
          forest_b: workItem?.forestAreaB?.toString() || '',
          forest_c: workItem?.forestAreaC?.toString() || '',
          area_under: workItem?.areaUnderPlant?.toString() || '',
          plantation_under: workItem?.forestExcludeUnclutivate?.toString() || '',
          plantation_not_under: workItem?.forestExcludeNotUnclutivate?.toString() || '',
          kayal_excluded: workItem?.kayalExcludeArea?.toString() || '',
          others_dry_13: workItem?.otherExcludeFWet?.toString() || '',
          others_wet_14: workItem?.otherExcludedFDry?.toString() || '',
          others_total: workItem?.otherExcludeFTotal?.toString() || '',
          plots_dry_16: workItem?.noOfPlotsDry?.toString() || '',
          plots_wet_17: workItem?.noOfPlotsWet?.toString() || '',
          plots_total: workItem?.noOfPlotsTotal?.toString() || '',
          total_area_wet_19: workItem?.totalAreaWet?.toString() || '',
          total_area_dry_21: workItem?.totalAreaDry?.toString() || '',
          total_area_total_20: workItem?.totalAreaForEstimation?.toString() || '',
          remarks: workItem?.remarks || ''
        };
      });
      setData(merged);
    } else if (zoneData.length > 0) {
      const zoneDataWithEmptyFields = zoneData.map(zoneItem => ({
        blocks: zoneItem.blocks || [],
        p_name: zoneItem.p_name || '',
        lbcode: zoneItem.lbcode || '',
        Wet_area: zoneItem.Wet_area || '',
        Dry_area: zoneItem.Dry_area || '',
        Total_area: zoneItem.Total_area || '',
        forest_a: '', forest_b: '', forest_c: '', area_under: '',
        plantation_under: '', plantation_not_under: '', kayal_excluded: '',
        others_dry_13: '', others_wet_14: '', others_total: '',
        plots_dry_16: '', plots_wet_17: '', plots_total: '',
        total_area_wet_19: '', total_area_dry_21: '', total_area_total_20: '',
        remarks: ''
      }));
      setData(zoneDataWithEmptyFields);
    }
  }, [zoneData, workAllocationData]);

  const validateNumber = (value) => {
    if (value === '' || value === null || value === undefined) return 'This field is required';
    if (!/^\d*\.?\d*$/.test(value)) return 'Only numbers allowed';
    return '';
  };

  const handleInputChange = (index, field, value) => {
    if (isDisabled) return;
    
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);

    const numericFields = [
      'Wet_area','Dry_area','Total_area', 'forest_a','forest_b','forest_c',
      'area_under','plantation_under','plantation_not_under', 'kayal_excluded',
      'others_dry_13','others_wet_14','others_total', 'plots_dry_16','plots_wet_17',
      'plots_total', 'total_area_wet_19','total_area_dry_21','total_area_total_20'
    ];

    if (numericFields.includes(field)) {
      const errorMsg = validateNumber(value);
      setValidationErrors((prev) => ({
        ...prev,
        [`${field}_${index}`]: errorMsg,
      }));
    }
  };

  const showTemporaryMessage = (message, isError = false) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleSubmitClick = () => {
    const hasErrors = Object.values(validationErrors).some((msg) => msg !== '');
    if (hasErrors) {
      showTemporaryMessage('⚠️ Please correct all invalid fields before submitting.', true);
      return;
    }
    setConfirmDialogOpen(true);
  };

const handleConfirmSubmit = async () => {
    setConfirmDialogOpen(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const user_id = authservice.userid();

      const rowsToSave = data.map((row) => ({
        zoneId: resolvedZoneId,
        lbcode: row.lbcode || "LB-2025-001",
        villageWetArea: parseFloat(row.Wet_area) || 0,
        villageDryArea: parseFloat(row.Dry_area) || 0,
        villageTotalArea: parseFloat(row.Total_area) || 0,
        forestAreaA: parseFloat(row.forest_a) || 0,
        forestAreaB: parseFloat(row.forest_b) || 0,
        forestAreaC: parseFloat(row.forest_c) || 0,
        areaUnderPlant: parseFloat(row.area_under) || 0,
        forestExcludeUnclutivate: parseFloat(row.plantation_under) || 0,
        forestExcludeNotUnclutivate: parseFloat(row.plantation_not_under) || 0,
        kayalExcludeArea: parseFloat(row.kayal_excluded) || 0,
        otherExcludeFWet: parseFloat(row.others_dry_13) || 0,
        otherExcludedFDry: parseFloat(row.others_wet_14) || 0,
        otherExcludeFTotal: parseFloat(row.others_total) || 0,
        noOfPlotsWet: parseFloat(row.plots_wet_17) || 0,
        noOfPlotsDry: parseFloat(row.plots_dry_16) || 0,
        noOfPlotsTotal: parseFloat(row.plots_total) || 0,
        totalAreaWet: parseFloat(row.total_area_wet_19) || 0,
        totalAreaDry: parseFloat(row.total_area_dry_21) || 0,
        totalAreaForEstimation: parseFloat(row.total_area_total_20) || 0,
        remarks: row.remarks || "",
        userId: user_id,
        agriYear: authservice.agriyear(),
      }));

      // ✅ FIXED: Points back to user submission API endpoint
      const response = await fetch(`${BASE_URL}/btr-service/btr-api/work-allocation-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rowsToSave) // ✅ FIXED: Correctly passes rowsToSave payload array
      });

      if (!response.ok) throw new Error('Failed to submit work allocation statement form data.');
      
      // ✅ Refresh allocation state data records locally on runtime without requiring a reload
      await fetchWorkAllocation();
      
      setInfoDialogOpen(true);

    } catch (error) {
      console.error('❌ Error:', error);
      showTemporaryMessage('Error submitting data: ' + error.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isDisabled) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const user_id = authservice.userid();

      const rowsToSave = data.map((row) => ({
        zoneId: resolvedZoneId,
        lbcode: row.lbcode || "LB-2025-001",
        villageWetArea: parseFloat(row.Wet_area),
        villageDryArea: parseFloat(row.Dry_area),
        villageTotalArea: parseFloat(row.Total_area) ,
        forestAreaA: parseFloat(row.forest_a) ,
        forestAreaB: parseFloat(row.forest_b) ,
        forestAreaC: parseFloat(row.forest_c) ,
        areaUnderPlant: parseFloat(row.area_under) ,
        forestExcludeUnclutivate: parseFloat(row.plantation_under) ,
        forestExcludeNotUnclutivate: parseFloat(row.plantation_not_under) ,
        kayalExcludeArea: parseFloat(row.kayal_excluded) ,
        otherExcludeFWet: parseFloat(row.others_dry_13) ,
        otherExcludedFDry: parseFloat(row.others_wet_14) ,
        otherExcludeFTotal: parseFloat(row.others_total) ,
        noOfPlotsWet: parseFloat(row.plots_wet_17) ,
        noOfPlotsDry: parseFloat(row.plots_dry_16) ,
        noOfPlotsTotal: parseFloat(row.plots_total) ,
        totalAreaWet: parseFloat(row.total_area_wet_19) ,
        totalAreaDry: parseFloat(row.total_area_dry_21) ,
        totalAreaForEstimation: parseFloat(row.total_area_total_20),
        remarks: row.remarks || "",
        userId: user_id,
        agriYear: authservice.agriyear(),
      }));

      const response = await fetch(`${BASE_URL}/btr-service/btr-api/work-allocation-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(rowsToSave)
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setFormStatus('DRAFT');
      showTemporaryMessage('✅ Draft saved successfully!');

    } catch (error) {
      console.error('❌ Error:', error);
      showTemporaryMessage('Error saving data: ' + error.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Admin Review Action directly from the form workflow footer
  const handleAdminAction = async (isApprove) => {
    console.log('Admin action initiated. Approve:', isApprove, 'Remarks:', adminRemarks, 'ApprovalLogId:', approvalLogId, 'Current form status:', formStatus);
    if (!approvalLogId) {
      showTemporaryMessage('⚠️ Error: No active workflow approval entry reference found.', true);
      return;
    }
    if (!isApprove && !adminRemarks.trim()) {
      showTemporaryMessage('⚠️ Error: A context remark is mandatory to return this statement form.', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const requestBody = {
        approvalLogId: approvalLogId,
        approve: isApprove,
        approver_id: authservice.userid(),
        remarks: adminRemarks || null,
        is_edit: isApprove ? isAdminEditEnabled : true // Force open editing windows automatically upon return
      };

      const response = await fetch(`${BASE_URL}/btr-service/admin-manage/approve-reject-workAllocation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Server returned error matching request transaction path');

      const expectedStatus = isApprove ? (isAdminEditEnabled ? 'UNDER REVIEW' : 'APPROVED') : 'RETURNED';
      setFormStatus(expectedStatus);
      setAdminRemarks('');
      showTemporaryMessage(`✅ Statement form updated successfully to ${expectedStatus}!`);

    } catch (err) {
      console.error(err);
      showTemporaryMessage('Error processing transaction action: ' + err.message, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (formStatus) {
      case 'SUBMITTED':
      case 'PENDING':
        return <PendingIcon sx={{ fontSize: 28, color: 'warning.main' }} />;
      case 'APPROVED':
        return <CheckCircleIcon sx={{ fontSize: 28, color: 'success.main' }} />;
      case 'RETURNED':
        return <ErrorIcon sx={{ fontSize: 28, color: 'error.main' }} />;
      case 'UNDER REVIEW':
        return <ReviewIcon sx={{ fontSize: 28, color: 'info.main' }} />;
      case 'DRAFT':
        return <EditIcon sx={{ fontSize: 28, color: 'info.main' }} />;
      default:
        return null;
    }
  };

const renderStatusBanner = () => {
  // Safely extract remarks from your fetched backend allocation payload
  const adminNotes = workAllocationData[0]?.adminRemarks || workAllocationData[0]?.remarks;

  const statusConfig = {
    'SUBMITTED': {
      severity: 'warning',
      title: 'Waiting for Approval',
      message: 'This form has been submitted and is currently under review by the administrator. Editing is locked until a decision is made.',
      action: null
    },
    'PENDING': {
      severity: 'warning',
      title: 'Pending Approval',
      message: 'Your submission is in the approval queue. You will be notified once reviewed.',
      action: null
    },
    'APPROVED': {
      severity: 'success',
      title: 'Form Approved',
      message: 'This statement has been successfully approved by the admin. The data is now finalized and view-only.',
      action: null
    },
    'RETURNED': {
      severity: 'error',
      title: 'Form Returned',
      message: 'The administrator has requested changes. Please review the remarks, make corrections, and resubmit.',
      action: (
        <Stack direction="row" spacing={2} alignItems="center">
          {/* ✅ If remarks exist, show the beautiful pulsing action button */}
          {adminNotes && (
            <GlowingActionButton 
              variant="outlined" 
              onClick={() => setRemarksDialogOpen(true)}
              startIcon={<VisibilityIcon />}
            >
              View Remarks
            </GlowingActionButton>
          )}
          {/* <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => setIsDisabled(false)}
            startIcon={<EditIcon />}
            sx={{ fontWeight: 600, textTransform: 'none', px: 3 }}
          >
            Edit Form
          </Button> */}
        </Stack>
      )
    },
    'DRAFT': {
      severity: 'info',
      title: 'Draft Mode',
      message: 'This is a work in progress. Fill in all required fields to enable submission.',
      action: null
    }
  };

  const config = statusConfig[formStatus] || statusConfig['DRAFT'];

  return (
    <Zoom in>
      <StatusCard status={formStatus} elevation={0}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            {getStatusIcon()}
          </Grid>
          <Grid item xs>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {config.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.message}
            </Typography>
          </Grid>
          {config.action && (
            <Grid item>
              {config.action}
            </Grid>
          )}
        </Grid>
      </StatusCard>
    </Zoom>
  );
};

  const renderAreaDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2}>Block</StyledTableCell>
          <StyledTableCell rowSpan={2}>Panchayat / Municipality / Corporation Zone</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Area as per village records (in cents)</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Wet in Cents</StyledTableCell>
          <StyledTableCell align="center">Dry in cents</StyledTableCell>
          <StyledTableCell align="center">Total in cents</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><FormInput size="small" value={row.blocks ? row.blocks.join(', ') : 'N/A'} disabled={true} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.p_name} disabled={true} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.Wet_area || 0} onChange={(e) => handleInputChange(index, 'Wet_area', e.target.value)} error={!!validationErrors[`Wet_area_${index}`]} helperText={validationErrors[`Wet_area_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.Dry_area || 0} onChange={(e) => handleInputChange(index, 'Dry_area', e.target.value)} error={!!validationErrors[`Dry_area_${index}`]} helperText={validationErrors[`Dry_area_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.Total_area || 0} onChange={(e) => handleInputChange(index, 'Total_area', e.target.value)} error={!!validationErrors[`Total_area_${index}`]} helperText={validationErrors[`Total_area_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  const renderForestDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2}>Panchayat / Municipality / Corporation Zone</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Forest Area as per village records (in cents)</StyledTableCell>
          <StyledTableCell align="center" rowSpan={2}>Area under plantation (in cents)</StyledTableCell>
          <StyledTableCell align="center" colSpan={2}>Forest Area excluded from Village records if any (in cents)</StyledTableCell>
          <StyledTableCell align="center" rowSpan={2}>Kayal excluded from EARAS Survey (in cents)</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">A</StyledTableCell>
          <StyledTableCell align="center">B</StyledTableCell>
          <StyledTableCell align="center">C</StyledTableCell>
          <StyledTableCell align="center">Under Cultivation</StyledTableCell>
          <StyledTableCell align="center">Not Under Cultivation</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><Typography variant="body2" fontWeight={500}>{row.p_name}</Typography></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.forest_a || ''} onChange={(e) => handleInputChange(index, 'forest_a', e.target.value)} error={!!validationErrors[`forest_a_${index}`]} helperText={validationErrors[`forest_a_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.forest_b || ''} onChange={(e) => handleInputChange(index, 'forest_b', e.target.value)} error={!!validationErrors[`forest_b_${index}`]} helperText={validationErrors[`forest_b_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.forest_c || ''} onChange={(e) => handleInputChange(index, 'forest_c', e.target.value)} error={!!validationErrors[`forest_c_${index}`]} helperText={validationErrors[`forest_c_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.area_under || ''} onChange={(e) => handleInputChange(index, 'area_under', e.target.value)} error={!!validationErrors[`area_under_${index}`]} helperText={validationErrors[`area_under_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.plantation_under || ''} onChange={(e) => handleInputChange(index, 'plantation_under', e.target.value)} error={!!validationErrors[`plantation_under_${index}`]} helperText={validationErrors[`plantation_under_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.plantation_not_under || ''} onChange={(e) => handleInputChange(index, 'plantation_not_under', e.target.value)} error={!!validationErrors[`plantation_not_under_${index}`]} helperText={validationErrors[`plantation_not_under_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.kayal_excluded || ''} onChange={(e) => handleInputChange(index, 'kayal_excluded', e.target.value)} error={!!validationErrors[`kayal_excluded_${index}`]} helperText={validationErrors[`kayal_excluded_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  const renderOtherDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2}>Panchayat / Municipality / Corporation Zone</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Others excluded from EARAS Survey (in cents)</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>No. of Plots for Estimation purpose</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Total Area for Estimation Purpose (in cents)</StyledTableCell>
          <StyledTableCell align="left" rowSpan={2}>Remarks</StyledTableCell>
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Wet (12)</StyledTableCell>
          <StyledTableCell align="center">Dry (13)</StyledTableCell>
          <StyledTableCell align="center">Total (14)</StyledTableCell>
          <StyledTableCell align="center">Wet (15)</StyledTableCell>
          <StyledTableCell align="center">Dry (16)</StyledTableCell>
          <StyledTableCell align="center">Total (17)</StyledTableCell>
          <StyledTableCell align="center">Wet (18)</StyledTableCell>
          <StyledTableCell align="center">Dry (20)</StyledTableCell>
          <StyledTableCell align="center">Total (19)</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <StyledTableCell><Typography variant="body2" fontWeight={500}>{row.p_name}</Typography></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.others_dry_13 || ''} onChange={(e) => handleInputChange(index, 'others_dry_13', e.target.value)} error={!!validationErrors[`others_dry_13_${index}`]} helperText={validationErrors[`others_dry_13_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.others_wet_14 || ''} onChange={(e) => handleInputChange(index, 'others_wet_14', e.target.value)} error={!!validationErrors[`others_wet_14_${index}`]} helperText={validationErrors[`others_wet_14_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.others_total || ''} onChange={(e) => handleInputChange(index, 'others_total', e.target.value)} error={!!validationErrors[`others_total_${index}`]} helperText={validationErrors[`others_total_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.plots_dry_16 || ''} onChange={(e) => handleInputChange(index, 'plots_dry_16', e.target.value)} error={!!validationErrors[`plots_dry_16_${index}`]} helperText={validationErrors[`plots_dry_16_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.plots_wet_17 || ''} onChange={(e) => handleInputChange(index, 'plots_wet_17', e.target.value)} error={!!validationErrors[`plots_wet_17_${index}`]} helperText={validationErrors[`plots_wet_17_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.plots_total || ''} onChange={(e) => handleInputChange(index, 'plots_total', e.target.value)} error={!!validationErrors[`plots_total_${index}`]} helperText={validationErrors[`plots_total_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.total_area_wet_19 || ''} onChange={(e) => handleInputChange(index, 'total_area_wet_19', e.target.value)} error={!!validationErrors[`total_area_wet_19_${index}`]} helperText={validationErrors[`total_area_wet_19_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.total_area_dry_21 || ''} onChange={(e) => handleInputChange(index, 'total_area_dry_21', e.target.value)} error={!!validationErrors[`total_area_dry_21_${index}`]} helperText={validationErrors[`total_area_dry_21_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.total_area_total_20 || ''} onChange={(e) => handleInputChange(index, 'total_area_total_20', e.target.value)} error={!!validationErrors[`total_area_total_20_${index}`]} helperText={validationErrors[`total_area_total_20_${index}`]} disabled={isDisabled} variant="outlined" /></StyledTableCell>
            <StyledTableCell><FormInput size="small" value={row.remarks || ''} onChange={(e) => handleInputChange(index, 'remarks', e.target.value)} disabled={isDisabled} variant="outlined" multiline rows={2} /></StyledTableCell>
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );

  if (loading) {
    return <LoadingScreen message="Fetching work allocation details..." />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <DotLottieReact style={{ width: '50rem', maxWidth: '100%' }} src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie" loop autoplay />
        </Box>
        <Typography variant="h5" gutterBottom>Oops! Something went wrong.</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{error} Please try refreshing the page.</Typography>
        <Button variant="contained" color="error" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Container maxWidth="xl">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00796b' }}>
            WORK ALLOCATION STATEMENT
          </Typography>
          {isAdmin && (
            <Chip icon={<LockIcon />} label="Admin View Mode" color="secondary" sx={{ fontWeight: 600 }} />
          )}
          {!isAdmin && isDisabled && formStatus !== 'RETURNED' && (
            <Chip icon={<LockIcon />} label={formStatus === 'APPROVED' ? 'Approved & Locked' : 'Under Review'} color={formStatus === 'APPROVED' ? 'success' : 'warning'} sx={{ fontWeight: 500 }} />
          )}
        </Box>
        
        {/* Alerts Center Notification Toast */}
        <Fade in={showSuccessMessage}>
          <Alert severity={successMessage.includes('✅') ? 'success' : 'error'} sx={{ position: 'fixed', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, minWidth: 300, boxShadow: 3 }} onClose={() => setShowSuccessMessage(false)}>
            {successMessage}
          </Alert>
        </Fade>

        {/* Dynamic Status Display Banner */}
        {renderStatusBanner()}

        <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
          <MainCard sx={{ marginBottom: '1rem' }}>
            <Box className="bar-container">
              <Paper className="bar-paper" sx={{ p: 2, bgcolor: 'grey.50' }}>
                {result && (
                  <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>District</Typography>
                      <Typography variant="h6" align="center" sx={{ color: '#00796b', fontWeight: 500 }}>{result.district}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Taluk</Typography>
                      <Typography variant="h6" align="center" sx={{ color: '#00796b', fontWeight: 500 }}>{result.taluk}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Zone</Typography>
                      <Typography variant="h6" align="center" sx={{ color: '#00796b', fontWeight: 500 }}>{result.zone_name}</Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Box>
          </MainCard>

          <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="work allocation tabs">
            <StyledTab label="📊 Area Details" value="tab1" />
            <StyledTab label="🌲 Forest Details" value="tab2" />
            <StyledTab label="📋 Other Details" value="tab3" />
          </StyledTabs>

          <Box sx={{ overflowX: 'auto', mb: 3 }}>
            {activeTab === 'tab1' && renderAreaDetailsTable()}
            {activeTab === 'tab2' && renderForestDetailsTable()}
            {activeTab === 'tab3' && renderOtherDetailsTable()}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* DYNAMIC ACTION RENDERING BLOCK: ADMIN ACTIONS vs DATA COLLECTOR ACTIONS */}
          {isAdmin ? (
            // ADMINISTRATIVE ACTION INTERFACE CARD PANEL
            ['SUBMITTED', 'PENDING', 'UNDER REVIEW'].includes(formStatus) && (
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#05307a', mb: 2 }}>
                  Administrative Approval Panel
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Approver Decision Notes / Remarks"
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      placeholder="Add observations, notes, or required amendments context..."
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Card variant="outlined" sx={{ p: 2, bgcolor: isAdminEditEnabled ? '#fff8e1' : '#f0fdf4', border: 1, borderColor: isAdminEditEnabled ? '#ffb74d' : '#bbf7d0' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isAdminEditEnabled}
                            onChange={(e) => setIsAdminEditEnabled(e.target.checked)}
                            color="warning"
                          />
                        }
                        label={<Typography variant="subtitle2" fontWeight={600}>Set Form Status to "Under Review"</Typography>}
                      />
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {isAdminEditEnabled 
                          ? '⚠️ ON: The statement will pass validation checks but remain editable for modifications.' 
                          : '✓ OFF: Form metrics will lock down completely into view-only records upon approval.'}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleAdminAction(false)}
                    disabled={isSubmitting || !adminRemarks.trim()}
                  >
                    Return for Correction
                  </Button>
                  <Button
                    variant="contained"
                    color={isAdminEditEnabled ? "warning" : "success"}
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleAdminAction(true)}
                    disabled={isSubmitting}
                  >
                    {isAdminEditEnabled ? 'Save Under Review' : 'Approve Statement'}
                  </Button>
                </Box>
              </Box>
            )
          ) : (
            // STANDARD FIELD DATA COLLECTOR SAVE / SUBMIT SYSTEM ACTIONS BUTTONS
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Tooltip title={isDisabled ? 'Form parameters are currently locked' : 'Save entries as draft'}>
                  <span>
                    <ActionButton variant="outlined" color="primary" onClick={handleSaveDraft} disabled={isDisabled || isSubmitting} startIcon={<SaveIcon />}>
                      {isSubmitting ? 'Saving...' : 'Save Draft'}
                    </ActionButton>
                  </span>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title={!canSubmit && !isDisabled ? 'Please complete all metric fields' : ''}>
                  <span>
                    <ActionButton variant="contained" color="success" onClick={handleSubmitClick} disabled={isDisabled || !canSubmit || isSubmitting} startIcon={<SendIcon />}>
                      {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                    </ActionButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          )}

          {/* Form Completion Progress Tracking Metric indicator */}
          {!isDisabled && !isAdmin && formStatus !== 'APPROVED' && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Chip label={canSubmit ? "✓ Data complete - Ready to send" : "⚠️ Incomplete fields remaining"} color={canSubmit ? "success" : "warning"} size="small" variant="outlined" />
            </Box>
          )}
        </Paper>
      </Container>

      {/* Confirmation Dialog for Submit */}
      <StyledDialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} TransitionComponent={Transition} keepMounted>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', bgcolor: 'warning.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>Confirm Submission</Typography>
          </Box>
          <IconButton onClick={() => setConfirmDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>⚠️ Important!</AlertTitle>
            Once submitted, you will <strong>not be able to edit</strong> this form until the administrator reviews it.
          </Alert>
          <DialogContentText component="div">
            <Typography variant="body1" gutterBottom>Are you sure you want to submit this Work Allocation Statement for approval?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="success" startIcon={<SendIcon />} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Yes, Submit for Approval'}
          </Button>
        </DialogActions>
      </StyledDialog>
{/* Admin Remarks Details Modal Popup */}
      <StyledDialog
        open={remarksDialogOpen}
        onClose={() => setRemarksDialogOpen(false)}
        TransitionComponent={Transition}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'error.lighter',
          borderBottom: '1px solid',
          borderColor: 'error.light'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            <Typography variant="h6" fontWeight={600} color="error.main">
              Administrator Remarks
            </Typography>
          </Box>
          <IconButton onClick={() => setRemarksDialogOpen(false)} size="small" color="error">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <DialogContentText component="div">
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              The following feedback was provided by the reviewer:
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                mt: 1, 
                bgcolor: 'grey.50', 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                fontStyle: 'italic',
                color: 'text.primary',
                fontSize: '1rem',
                lineHeight: 1.5
              }}
            >
              "{workAllocationData[0]?.adminRemarks || workAllocationData[0]?.remarks || 'No message logged.'}"
            </Paper>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setRemarksDialogOpen(false)} 
            variant="contained" 
            color="error"
            fullWidth
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Close & Start Corrections
          </Button>
        </DialogActions>
      </StyledDialog>
      {/* Success Info Dialog after Submission */}
      <StyledDialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} TransitionComponent={Transition}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justify: 'space-between', bgcolor: 'success.lighter', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            <Typography variant="h6" fontWeight={600}>Submission Successful</Typography>
          </Box>
          <IconButton onClick={() => setInfoDialogOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>✅ Form Submitted Successfully!</AlertTitle>
            Your Work Allocation Statement has been sent for approval.
          </Alert>
          <DialogContentText component="div">
            <Typography variant="body1" paragraph>The form is now <strong>locked and under review</strong> by the administrator.</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInfoDialogOpen(false)} variant="contained" color="primary" fullWidth>Got it, Thanks!</Button>
        </DialogActions>
      </StyledDialog>
    </Grid>
  );
}

export default WorkAllocationForm;