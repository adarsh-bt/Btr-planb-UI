import React, { useState ,useEffect} from 'react';
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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import Breadcrumb from 'routes/Breadcrumb';
import MainCard from 'components/MainCard';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import LoadingScreen from 'utils/loadingscreen';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';

// Custom styles for text fields and tabs
const FormInput = styled(TextField)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(12),
  width: '100%',
  boxSizing: 'border-box',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 0.15rem ${theme.palette.primary[200]}`,
  },
  '& .MuiInputBase-input': {
    padding: theme.spacing(0.75, 1),
    fontSize: theme.typography.pxToRem(14),
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 500,
  color: theme.palette.grey[700],
  cursor: 'pointer',
  borderBottom: `2px solid transparent`,
  transition: 'border-color 0.15s ease-in-out, color 0.15s ease-in-out',
  '&:hover': {
    borderBottomColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
  },
  '&.Mui-selected': {
    borderBottomColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const TabContent = styled('div')({
  display: 'none',
  '&.active': {
    display: 'block',
  },
});

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  marginBottom: theme.spacing(1.5),
}));

// NEW: Styled components for better table borders
const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: 'collapse',
  width: '100%',
  '& th, & td': {
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(1),
  },
  '& thead th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
    fontSize: theme.typography.pxToRem(12),
    color: theme.palette.grey[700],
    textAlign: 'center',
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[300]}`,
  padding: theme.spacing(1),
  fontSize: theme.typography.pxToRem(12),
}));


function WorkAllocationForm() {
  // Removed unused state: district
const [activeTab, setActiveTab] = useState('tab1');
const [result, setResult] = useState(null);
const [zoneData, setZoneData] = useState([]);
const [workAllocationData, setWorkAllocationData] = useState([]);
const [data, setData] = useState([]);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);
const [validationErrors, setValidationErrors] = useState({});
const [isdisabled,SetIsDisable] = useState(true)
 const [zonestatus,setZonestatus] = useState(false)


  const BASE_URL = mainapi.BASE_URL;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Removed: handleAddRow

  // Removed: handleRemoveRow - We'll remove the delete icon from the table as well.
useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user_id = authservice.userid();
      const zone_id = localStorage.getItem('activeZone');
            //  if (!resolvedZoneId || resolvedZoneId === "null" || !zoneId || zoneId ==="null" ) {
             if ( !zoneId || zoneId ==="null" ) {
     
    setError("No zones are assigned to you. Please contact your administrator.");
    setZonestatus(true)
    setLoading(false);
    return;
  }
      const response = await fetch(`${BASE_URL}/btr-service/btr-api/zone-details/${zone_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      console.log('Zone details data:', result.payload);
      setResult(result.payload);
      setZoneData(result.payload.data || []);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

const zoneId = authservice.getzone();

useEffect(() => {
  const fetchWorkAllocation = async () => {
    try {
      
      const token = localStorage.getItem('token');

      const res = await axios.get(`${BASE_URL}/btr-service/btr-api/work-allocation-view/${zoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const apiData = res.data;
      console.log("Work allocation data >>> ", apiData);
      
      // Check if data is in payload or directly in response
      if (apiData) {

        // If data is in payloadproperty
        if (apiData.payload) {
          setWorkAllocationData(apiData.payload);
          SetIsDisable(false)
        } 
        // If data is directly the array
        else if (Array.isArray(apiData)) {
          setWorkAllocationData(apiData);
        }
      }
    } catch (err) {
      console.error('Error fetching work allocation data:', err);
    }
  };

  if (zoneId) {
    fetchWorkAllocation();
  }
}, [zoneId]);


// Merge zone data with work allocation data
useEffect(() => {
  console.log("zone data   ",zoneData)
  console.log("work all >>>>> data   ",workAllocationData)
  if (zoneData.length > 0 && workAllocationData.length > 0) {
    const merged = zoneData.map(zoneItem => {
     
      // Find matching work allocation data by lbcode
      const workItem = workAllocationData.find(work => work.lbcode === zoneItem.lbcode);
      console.log("A   ",workAllocationData)
       console.log("work      ",zoneItem.lbcode)
      // console.log("zoneITM         ",work.lbcode)
      return {
        // Zone details
        blocks: zoneItem.blocks || [],
        p_name: zoneItem.p_name || '',
        lbcode: zoneItem.lbcode || '',
        
        // Work allocation data (if exists)
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
    
    console.log("Merged data:", merged);
    setData(merged);
  } else if (zoneData.length > 0) {
    // If no work allocation data, just use zone data with empty form fields
    const zoneDataWithEmptyFields = zoneData.map(zoneItem => ({
      blocks: zoneItem.blocks || [],
      p_name: zoneItem.p_name || '',
      lbcode: zoneItem.lbcode || '',
      Wet_area: zoneItem.Wet_area || '',
      Dry_area: zoneItem.Dry_area || '',
      Total_area: zoneItem.Total_area || '',
      forest_a: '',
      forest_b: '',
      forest_c: '',
      area_under: '',
      plantation_under: '',
      plantation_not_under: '',
      kayal_excluded: '',
      others_dry_13: '',
      others_wet_14: '',
      others_total: '',
      plots_dry_16: '',
      plots_wet_17: '',
      plots_total: '',
      total_area_wet_19: '',
      total_area_dry_21: '',
      total_area_total_20: '',
      remarks: ''
    }));
    setData(zoneDataWithEmptyFields);
  }
}, [zoneData, workAllocationData]);
  // 🔹 Utility validation function
const validateNumber = (value) => {
  if (value === '' || value === null || value === undefined) return 'This field is required';
  if (!/^\d*\.?\d*$/.test(value)) return 'Only numbers allowed';
  return '';
};
const handleInputChange = (index, field, value) => {
  const updatedData = [...data];
  updatedData[index] = { ...updatedData[index], [field]: value };
  setData(updatedData);

  // Validate only numeric fields
  const numericFields = [
    'Wet_area','Dry_area','Total_area',
    'forest_a','forest_b','forest_c',
    'area_under','plantation_under','plantation_not_under',
    'kayal_excluded','others_dry_13','others_wet_14','others_total',
    'plots_dry_16','plots_wet_17','plots_total',
    'total_area_wet_19','total_area_dry_21','total_area_total_20'
  ];

  if (numericFields.includes(field)) {
    const errorMsg = validateNumber(value);
    setValidationErrors((prev) => ({
      ...prev,
      [`${field}_${index}`]: errorMsg,
    }));
  }
};



const handleSubmit = async () => {
  const hasErrors = Object.values(validationErrors).some((msg) => msg !== '');
  if (hasErrors) {
    alert('⚠️ Please correct all invalid fields before submitting.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const user_id = authservice.userid();
    const zone_id = localStorage.getItem('activeZone');

    const rowsToSave = data.map((row) => ({
      zoneId: zone_id,
      lbcode: row.lbcode || "LB-2025-001",


      // Area Details
      villageWetArea: parseFloat(row.Wet_area) || 0,
      villageDryArea: parseFloat(row.Dry_area) || 0,
      villageTotalArea: parseFloat(row.Total_area) || 0,

      // Forest Details
      forestAreaA: parseFloat(row.forest_a) || 0,
      forestAreaB: parseFloat(row.forest_b) || 0,
      forestAreaC: parseFloat(row.forest_c) || 0,
      areaUnderPlant: parseFloat(row.area_under) || 0,
      forestExcludeUnclutivate: parseFloat(row.plantation_under) || 0,
      forestExcludeNotUnclutivate: parseFloat(row.plantation_not_under) || 0,
      kayalExcludeArea: parseFloat(row.kayal_excluded) || 0,

      // Other Details
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
      isActive: true
    }));

    console.log("🧾 Rows ready to save:", rowsToSave);

    const response = await fetch(`${BASE_URL}/btr-service/btr-api/work-allocation-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(rowsToSave)
    });

    if (!response.ok) throw new Error('Failed to save work allocation');
    const saveResponse = await response.json();
    alert('✅ Work allocation rows saved successfully!');
    console.log(saveResponse.payload);

  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error saving data: ' + error.message);
  }
};
  const renderAreaDetailsTable = () => (
    <StyledTable size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell rowSpan={2}>Block</StyledTableCell>
          <StyledTableCell rowSpan={2}>Panchayat / Municipality / Corporation Zone</StyledTableCell>
          <StyledTableCell align="center" colSpan={3}>Area as per village records (in cents)</StyledTableCell>
          {/* Removed Action column header */}
        </TableRow>
        <TableRow>
          <StyledTableCell align="center">Wet in Cents</StyledTableCell>
          <StyledTableCell align="center">Dry in cents</StyledTableCell>
          <StyledTableCell align="center">Total in cents</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, index) => ( // Use 'data'
          <TableRow key={index}>
            <StyledTableCell><FormInput name={`block[${index}]`} size="small" placeholder="Enter Block" value={row.blocks ? row.blocks.join(', ') : 'N/A'}/></StyledTableCell>
            <StyledTableCell><FormInput name={`panchayat[${index}]`} size="small" placeholder="Enter Panchayat" value={row.p_name} /></StyledTableCell>
            <StyledTableCell><FormInput name={`area_wet[${index}]`} size="small" placeholder="Wet" value={row.Wet_area || 0} onChange={(e) => handleInputChange(index, 'Wet_area', e.target.value)}
  error={!!validationErrors[`Wet_area_${index}`]}
  helperText={validationErrors[`Wet_area_${index}`]}/></StyledTableCell>
            <StyledTableCell><FormInput name={`area_dry[${index}]`} size="small" placeholder="Dry" value={row.Dry_area || 0} onChange={(e) => handleInputChange(index, 'Dry_area', e.target.value)}
  error={!!validationErrors[`Dry_area_${index}`]}
  helperText={validationErrors[`Dry_area_${index}`]}/></StyledTableCell>
            <StyledTableCell><FormInput name={`area_total[${index}]`} size="small" placeholder="Total" value={row.Total_area || 0} onChange={(e) => handleInputChange(index, 'Total_area', e.target.value)}
  error={!!validationErrors[`Total_area_${index}`]}
  helperText={validationErrors[`Total_area_${index}`]}/></StyledTableCell>
            {/* Removed the action cell with the DeleteIcon */}
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
        <StyledTableCell align="center">A </StyledTableCell>
        <StyledTableCell align="center">B </StyledTableCell>
        <StyledTableCell align="center">C </StyledTableCell>
        <StyledTableCell align="center">Under Cultivation </StyledTableCell>
        <StyledTableCell align="center">Not Under Cultivation </StyledTableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((row, index) => (
        <TableRow key={index}>
          <StyledTableCell><Typography variant="body2">{row.p_name}</Typography></StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`forest_a[${index}]`} 
              size="small" 
              placeholder="A" 
              value={row.forest_a || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'forest_a', e.target.value)}
              error={!!validationErrors[`forest_a_${index}`]}
              helperText={validationErrors[`forest_a_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`forest_b[${index}]`} 
              size="small" 
              placeholder="B" 
              value={row.forest_b || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'forest_b', e.target.value)}
              error={!!validationErrors[`forest_b_${index}`]}
              helperText={validationErrors[`forest_b_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`forest_c[${index}]`} 
              size="small" 
              placeholder="C" 
              value={row.forest_c || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'forest_c', e.target.value)}
              error={!!validationErrors[`forest_c_${index}`]}
              helperText={validationErrors[`forest_c_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`area_under[${index}]`} 
              size="small" 
              placeholder="0.0" 
              value={row.area_under || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'area_under', e.target.value)}
              error={!!validationErrors[`area_under_${index}`]}
              helperText={validationErrors[`area_under_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`plantation_under[${index}]`} 
              size="small" 
              placeholder="Under" 
              value={row.plantation_under || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'plantation_under', e.target.value)}
              error={!!validationErrors[`plantation_under_${index}`]}
              helperText={validationErrors[`plantation_under_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`plantation_not_under[${index}]`} 
              size="small" 
              placeholder="Not Under" 
              value={row.plantation_not_under || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'plantation_not_under', e.target.value)}
              error={!!validationErrors[`plantation_not_under_${index}`]}
              helperText={validationErrors[`plantation_not_under_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`kayal_excluded[${index}]`} 
              size="small" 
              value={row.kayal_excluded || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'kayal_excluded', e.target.value)}
              error={!!validationErrors[`kayal_excluded_${index}`]}
              helperText={validationErrors[`kayal_excluded_${index}`]}
            />
          </StyledTableCell>
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
        <StyledTableCell align="left" rowSpan={2}>Remarks </StyledTableCell>
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
          <StyledTableCell><Typography variant="body2">{row.p_name}</Typography></StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`others_dry_13[${index}]`} 
              size="small" 
              placeholder="Dry" 
              value={row.others_dry_13 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'others_dry_13', e.target.value)}
              error={!!validationErrors[`others_dry_13_${index}`]}
              helperText={validationErrors[`others_dry_13_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`others_wet_14[${index}]`} 
              size="small" 
              placeholder="Wet" 
              value={row.others_wet_14 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'others_wet_14', e.target.value)}
              error={!!validationErrors[`others_wet_14_${index}`]}
              helperText={validationErrors[`others_wet_14_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`others_total[${index}]`} 
              size="small" 
              placeholder="Total" 
              value={row.others_total || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'others_total', e.target.value)}
              error={!!validationErrors[`others_total_${index}`]}
              helperText={validationErrors[`others_total_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`plots_dry_16[${index}]`} 
              size="small" 
              placeholder="Dry" 
              value={row.plots_dry_16 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'plots_dry_16', e.target.value)}
              error={!!validationErrors[`plots_dry_16_${index}`]}
              helperText={validationErrors[`plots_dry_16_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`plots_wet_17[${index}]`} 
              size="small" 
              placeholder="Wet" 
              value={row.plots_wet_17 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'plots_wet_17', e.target.value)}
              error={!!validationErrors[`plots_wet_17_${index}`]}
              helperText={validationErrors[`plots_wet_17_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`plots_total[${index}]`} 
              size="small" 
              placeholder="Total" 
              value={row.plots_total || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'plots_total', e.target.value)}
              error={!!validationErrors[`plots_total_${index}`]}
              helperText={validationErrors[`plots_total_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`total_area_wet_19[${index}]`} 
              size="small" 
              placeholder="Wet" 
              value={row.total_area_wet_19 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'total_area_wet_19', e.target.value)}
              error={!!validationErrors[`total_area_wet_19_${index}`]}
              helperText={validationErrors[`total_area_wet_19_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`total_area_dry_21[${index}]`} 
              size="small" 
              placeholder="Dry" 
              value={row.total_area_dry_21 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'total_area_dry_21', e.target.value)}  // FIX THIS - was using wrong field name
              error={!!validationErrors[`total_area_dry_21_${index}`]}
              helperText={validationErrors[`total_area_dry_21_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`total_area_total_20[${index}]`} 
              size="small" 
              placeholder="Total" 
              value={row.total_area_total_20 || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'total_area_total_20', e.target.value)}
              error={!!validationErrors[`total_area_total_20_${index}`]}
              helperText={validationErrors[`total_area_total_20_${index}`]}
            />
          </StyledTableCell>
          <StyledTableCell>
            <FormInput 
              name={`remarks[${index}]`} 
              size="small" 
              placeholder="Enter Remarks"
              value={row.remarks || ''}  // ADD THIS
              onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
            />
          </StyledTableCell>
        </TableRow>
      ))}
    </TableBody>
  </StyledTable>
);
  if (loading) {
    return <LoadingScreen message="Fetching work allocation details..." />;
  }
  if (error) {
    // ... (Error handling remains the same)
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <DotLottieReact
            style={{ width: '50rem', maxWidth: '100%' }}
            src="https://lottie.host/ae6ba3d5-ea79-454d-ae28-fbcb986a5f7b/9vhgZMKvHq.lottie"
            loop
            autoplay
          />
        </Box>
        {zonestatus && (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      bgcolor: "#f5a123ff",
      color: "#faf9f7ff",
      border: "1px solid #FFEEBA",
      borderRadius: 2,
      p: 2,
      mb: 3,
      width: "60%",
      mx: "auto",
    }}
  >
    {/* MOVING REFLECTOR EFFECT */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: "-150px",
        width: "120px",
        height: "100%",
        background:
          "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255,255,255,0) 100%)",
        transform: "skewX(-20deg)",
        animation: "shine 2.5s infinite",
      }}
    />

    <Typography variant="h5" sx={{ position: "relative", zIndex: 2 }}>
       {error} 
    </Typography>

    {/* ANIMATION KEYFRAMES */}
    <style>
      {`
        @keyframes shine {
          0% { left: -150px; }
          60% { left: 100%; }
          100% { left: 100%; }
        }
      `}
    </style>
  </Box>
)}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {error} Please try refreshing the page.
        </Typography>
        <Button
          variant="contained"
          color="error"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            WORK ALLOCATION STATEMENT
          </Typography>
          <MainCard sx={{marginBottom:'1rem'}}>
            <Box className="bar-container">
              <Paper className="bar-paper" sx={{ p: 2 }}>
                {result && (
                  <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        District:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.district}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        Taluk:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.taluk}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
                        Zone:
                      </Typography>
                      <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
                        {result.zone_name}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Paper>
            </Box>
          </MainCard>
          <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="work allocation tabs">
            <StyledTab label="Area Details" value="tab1" />
            <StyledTab label="Forest Details" value="tab2" />
            <StyledTab label="Other Details" value="tab3" />
          </StyledTabs>
          <Box sx={{ overflowX: 'auto', mb: 2 }}>
            {activeTab === 'tab1' && (
              <TabContent className={activeTab === 'tab1' ? 'active' : ''}>
                {renderAreaDetailsTable()}
              </TabContent>
            )}
            {activeTab === 'tab2' && (
              <TabContent className={activeTab === 'tab2' ? 'active' : ''}>
                {renderForestDetailsTable()}
              </TabContent>
            )}
            {activeTab === 'tab3' && (
              <TabContent className={activeTab === 'tab3' ? 'active' : ''}>
                {renderOtherDetailsTable()}
              </TabContent>
            )}
          </Box>
          <Grid container spacing={2} justifyContent="flex-end">
            {/* Removed Add Row button */}
            <Grid item>
              <Button variant="contained" color="success" onClick={handleSubmit} disabled={isdisabled}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Grid>
  );
}

export default WorkAllocationForm;