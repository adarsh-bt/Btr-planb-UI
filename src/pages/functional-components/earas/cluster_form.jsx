import React, { useState, useEffect,useCallback ,useRef,useMemo} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import {
    Container, Typography, Grid, FormControlLabel, List,
    ListItemText, ListItem, Button, Box, TextField, Snackbar, Alert,FormControl,InputLabel,Select ,MenuItem,
    CircularProgress, Modal, Paper,FormGroup,Checkbox,Divider,Chip,Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  RadioGroup,
  Radio,Stack
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types'; // For ListboxComponent prop-types
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

import authservice from 'pages/authentication/services/authservice';
import LinearProgress from '@mui/material/LinearProgress';
import MapIcon from '@mui/icons-material/Map';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip'; 

import SaveIcon from '@mui/icons-material/Save';
import { FixedSizeList } from 'react-window';
import mainapi from 'api/mainapi';



// Placeholder for ListboxComponent if it's not provided externally.
const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = [];
    (children && Array.isArray(children)) && children.forEach((item) => {
        itemData.push(item);
        if (Array.isArray(item)) {
            item.forEach((nestedItem) => {
                itemData.push(nestedItem);
            });
        }
    });


  

    const itemCount = itemData.length;
    const itemSize = 48; // Adjust based on your MenuItem height
 
    return (
        <div ref={ref}>
            <FixedSizeList
                height={itemCount > 8 ? 8 * itemSize : itemCount * itemSize} // Max 8 items visible, then scroll
                width="auto"
                itemCount={itemCount}
                itemSize={itemSize}
                {...other}
            >
                {({ index, style }) => (
                    <div style={style}>
                        {itemData[index]}
                    </div>
                )}
            </FixedSizeList>
        </div>
    );
});

ListboxComponent.propTypes = {
    children: PropTypes.node,
};

// --- ClusterForm Component Start ---
const ClusterForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

    // --- Main Form States ---
    const [syNo, setSyNo] = useState('');
    const [slNo, setSLNo] = useState('');
    const [wardNumber, setWardNumber] = useState(''); // Not directly used in the provided snippet, but keeping
    const [reserveKeyplot, setReserveKeyplot] = useState(''); // Not directly used, but keeping
const [svNoDetails, setSvNoDetails] = useState([]); // For API data
const [selectedSvNos, setSelectedSvNos] = useState([]); // For checkbox selection
const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null); // Stores { keyplotIndex, rowIndexToRemove, rowData }
const [defaultVillageId, setDefaultVillageId] = useState(null);
const [defaultVillage, setDefaultVillage] = useState('');
const [defaultBlock, setDefaultBlock] = useState('');
const [defaultLbcode, setDefaultLbcode] = useState('');
const [mincluster, setMinCluster] = useState('');
const [maxcluster, setMaxCluster] = useState('');
const[meanCluster,setMeanCluster] = useState('');
 const [selectAllChecked, setSelectAllChecked] = useState(false);
const [resvnoError, setResvnoError] = useState('');
const [loadingResvno, setLoadingResvno] = useState(false);

  const [openRejectDialog, setOpenRejectDialog] = useState(false);
const [rejectReason, setRejectReason] = useState('');
const [customReason, setCustomReason] = useState('');
const [openLimitDialog, setOpenLimitDialog] = useState(false);
const [limitMessage, setLimitMessage] = useState('');
// add these
const [confirmLabel, setConfirmLabel] = useState('Save');
const [confirmColor, setConfirmColor] = useState('primary'); // 'warning' | 'primary' | 'success'
const [snackbarSeverity, setSnackbarSeverity] = useState("success"); 
const [dialogIcon, setDialogIcon] = useState(null);
const [dialogIconColor, setDialogIconColor] = useState("inherit");

const [pendingSidePlots, setPendingSidePlots] = useState(null);


  const [keyplotDetails, setKeyplotDetails] = useState({
    villageBlock: '',
    panchayath: '',
    syNo: '',
    areaCents: '',
    landType: ''
  });

  // Inside your ClusterForm component, or as a constant outside if preferred
const sidePlotLabelOptions = [
     'N1', 'E1', 'S1', 'W1', 'N2', 'E2', 'S2', 'W2'
  // Add more as needed
];
   const BASE_URL = mainapi.BTR_API;
    // Structure for storing side plot rows for each direction (N, E, S, W)
    const [keyplots, setKeyplots] = useState([
        { id: 'K', label: 'K', rows: [] },
        { id: 'N1', label: 'N1', rows: [] }, // Initialize with empty rows
        { id: 'E1', label: 'E1', rows: [] },
        { id: 'S1', label: 'S1', rows: [] },
        { id: 'W1', label: 'W1', rows: [] },
    ]);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarOpen1, setSnackbarOpen1] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [svNoOptions, setSvNoOptions] = useState([]); // For main form's Sv.No options
    const [keyplotMainSvNo, setKeyplotMainSvNo] = useState(''); // Main Sv.No of the keyplot itself
    const [keyplotSubNo, setKeyplotSubNo] = useState(''); // Sub No of the keyplot itself
    const [loading, setLoading] = useState(true);
    const [selectedKeyplotIndex, setSelectedKeyplotIndex] = useState(null);
    // --- Modal related states ---
    const [modalOpen, setModalOpen] = useState(false);
    const [currentKeyplotIndex, setCurrentKeyplotIndex] = useState(null); // Index of N, E, S, W keyplot being edited

    const [modalRowData, setModalRowData] = useState({
        village: null,          // Selected village name in modal
        modalBlock: null,       // Selected block code in modal
        svNo: null,             // Selected survey number in modal
        sub: '',                // Selected sub-division in modal
        block: '',              // Block from plot details API (read-only)
        area: '',               // Area from plot details API (read-only)
        actual: '',             // User-entered actual area in modal
        subOptions: [],         // Options for the 'sub' dropdown in modal
        plot_id: ''             // plot_id from plot details API
    });

    // Options for modal's village and block dropdowns
    // These will be populated from API
    const [villageOptions, setVillageOptions] = useState([]);
    const [modalBlockOptions, setModalBlockOptions] = useState([]);
const [pendingRows, setPendingRows] = useState([]);
    // --- New state to store all fetched village data ---
    const [allVillageData, setAllVillageData] = useState([]);
const[keyplotId,setKeyplotId] = useState('');
    // --- Effects (API Calls and Data Processing) ---

    // Effect 1: Initial data fetching (Keyplot details, Sv.No options for main form)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const syNoFromURL = urlParams.get('No');
        const slnoFromURL = urlParams.get('slno');
        setKeyplotId(syNoFromURL)
        if (syNoFromURL) {
            setSyNo(decodeURIComponent(syNoFromURL));
        }
        if (slnoFromURL) {
            setSLNo(decodeURIComponent(slnoFromURL));
            setKeyplotSubNo(decodeURIComponent(slnoFromURL));
        }

        const fetchAllInitialData = async () => {
            setLoading(true);
            try {
                // Fetch keyplot details and Sv.No options concurrently
                await Promise.all([
                    fetchKeyplotDetails(syNoFromURL),
                    // fetchSvNoOptions(syNoFromURL)
                ]);
            } catch (error) {
                console.error("Error fetching all initial data:", error);
                setSnackbarMessage('Failed to load some initial data.');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        if (syNoFromURL) {
            fetchAllInitialData();
        } else {
            setLoading(false); // No syNo, so no data to fetch for keyplot
        }

    }, [location.search]); // Depend on location.search to re-run if URL params change




    // Api for Svno
    // --- API Fetching Functions ---
    // Fetches details for the main keyplot (used in initial load)
    const fetchKeyplotDetails = async (id) => {
    if (!id) return;
 setLoading(true);
    try {
          const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/btr-service/key-plots/get-keyplot/${id}`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                }
              );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
      
        setMinCluster(data.payload.clusterMin)
        setMaxCluster(data.payload.clusterMax)
        setMeanCluster(data.payload.clusterMean)
        setDefaultLbcode(data.payload.lbcode)
        setDefaultBlock(data.payload.villageBlock);
        setDefaultVillageId(data.payload.kvillageId);
        setDefaultVillage(data.payload.kvillageName);

        if (data.payload) {
            setKeyplotDetails(data.payload);

            // Prepare a map of existing side plots from the response
            const existingSidePlots = {};
            if (Array.isArray(data.payload.sidePlots)) {
               // ✅ Use full label instead of only first char
data.payload.sidePlots.forEach(sp => {
    const directionKey = sp.label;   // "N1", "E2", "S1", etc.
    existingSidePlots[directionKey] = {
        id: sp.label,
        label: sp.label,
        rows: (sp.rows || []).map(row => ({
            b_id: row.id,
            svNo: row.svNo || '',
            sub: row.subNo || '',
            block: row.bcode || '',
            villageName: row.village || '',
            enumeratedArea: row.actual || '',
            area: row.area || '',
            subOptions: [],
            plot_id: row.plot_id || '',
            isExisting: true
        }))
    };
});

            }
            console.log("existed plotss ",existingSidePlots)
          
// Always include keyplot "K"
const fixed = ['K'];

// Take all existing sideplots from backend (excluding K)
const existing = Object.keys(existingSidePlots).filter(l => l !== 'K');

// Define fallback defaults if backend has fewer than 4
const defaults = ['N1','E1','S1','W1'];

const uniqueDefaults = defaults.filter(d => !existing.includes(d));

const sideplots = [...existing, ...uniqueDefaults].slice(0, 4);
// Ensure exactly 4 sideplots
// let sideplots = [];
// if (existing.length >= 4) {
//   sideplots = existing.slice(0, 4);
// } else {
//   sideplots = [...existing, ...defaults].slice(0, 4);
// }

// Final plot directions
const allDirections = [...fixed, ...sideplots];

// Merge backend + defaults
const mergedKeyplots = allDirections.map(dir => {
  return existingSidePlots[dir] || {
    id: dir,
    label: dir,
    rows: []
  };
});
setKeyplots(mergedKeyplots);



            setLoading(false);
            // Parse syNo like "385/4"
            const ssyNo = data.payload.syNo;
            if (ssyNo) {
                const [mainNo, subNo] = ssyNo.split('/');
                setKeyplotMainSvNo(mainNo);
                setKeyplotSubNo(subNo || '');
            }
        }
    } catch (error) {
        console.error("Error fetching keyplot details:", error);
        throw error;
    }
};

    // Effect 2: Fetch all village data for the modal's village/block dropdowns
    // This runs only once on component mount
  useEffect(() => {
    const fetchAllVillageDataForModal = async () => {
        if (!defaultLbcode) return; // prevent fetch if lbcode not set yet
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            alert(defaultLbcode)
            const response = await fetch(`${BASE_URL}/btr-service/cluster-api/${defaultLbcode}/villages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAllVillageData(data);
            setVillageOptions(data);
        } catch (error) {
            console.error("Failed to fetch village data for modal:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAllVillageDataForModal();
}, [defaultLbcode]); // 👈 Now it listens for changes to lbcode

const listRef = useRef();
const preserveScrollPosition = useCallback(() => {
  if (listRef.current) {
    const currentScrollOffset = listRef.current._outerRef.scrollTop;
    // After state update, restore the scroll position
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTo(currentScrollOffset);
      }
    }, 0);
  }
}, []);
 // Empty dependency array: runs only once on mount
const handleSvNoSelection = useCallback((id) => {
  preserveScrollPosition();
  
  // Your existing selection logic
  if (selectedSvNos.includes(id)) {
    setSelectedSvNos(selectedSvNos.filter(item => item !== id));
  } else {
    setSelectedSvNos([...selectedSvNos, id]);
  }
}, [selectedSvNos, preserveScrollPosition]);




const closeModal = () => {
  setModalOpen(false);
  setModalRowData({ /* reset fields */ });
  setSvNoDetails([]);
  setSelectedSvNos([]);
  setSelectedKeyplotIndex(null);
  setResvnoError('');
};
    const fetchPlotDetails = async (currentSyNo, resvno, resbdno) => {
        if (!currentSyNo || !resvno || !resbdno) {
            setModalRowData(prev => ({ ...prev, block: '', area: '', plot_id: '' }));
            return;
        }
        try {
           const token = localStorage.getItem('token');
            const response = await fetch(
                `${BASE_URL}/btr-service/cluster-api/${currentSyNo}/plot-details?resvno=${resvno}&resbdno=${resbdno}`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                });
            
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setModalRowData(prev => ({
                ...prev,
                block: data.bcode || '', // Set block from plot details
                plot_id: data.plot_id || '', // Set plot_id from plot details
                area: data.area !== undefined && data.area !== null ? parseFloat(data.area).toFixed(2) : '', // Format area
                actual: '' // Reset actual area when plot details change
            }));

        } catch (error) {
            console.error('Error fetching plot details:', error);
            setSnackbarMessage('Failed to load plot details (Block/Area).');
            setSnackbarOpen(true);
            setModalRowData(prev => ({ ...prev, block: '', actual: '', area: '', plot_id: '' }));
        }
    };

    // --- Event Handlers and Functions ---

    // Handles changes in the main keyplot label (N, E, S, W)
  const handleKeyplotLabelChange = (event, index) => { // Removed 'newValue' as it's not from Autocomplete
    const newKeyplots = [...keyplots];
    const newLabel = event.target.value; // Get value from event.target.value for Select
    newKeyplots[index].label = newLabel;
    setKeyplots(newKeyplots);
};

useEffect(() => {
  // 1. Check if a village is selected in modalRowData and if you have all village data loaded
  if (modalRowData.village && allVillageData.length > 0) {
    // 2. Find the selected village object from your `allVillageData`
    const selectedVillage = allVillageData.find(
      (v) => v.villageId === modalRowData.village
    );

    // 3. If the selected village is found and it has 'blocks' property
    if (selectedVillage && selectedVillage.blocks) {
      // 4. Map the 'blocks' array to get only the `blockCode` values
      //    and set them as the options for the Block Autocomplete.
      setModalBlockOptions(selectedVillage.blocks.map(b => b.blockCode));
    } else {
      // 5. If the village is not found or has no blocks, clear the block options.
      setModalBlockOptions([]);
    }
  } else {
    // 6. If no village is selected, clear the block options.
    setModalBlockOptions([]);
  }
}, [modalRowData.village, allVillageData]);
    // This function is less relevant now as actual row data input happens in the modal.
    // It's kept for completeness but might be removed or refactored if direct row editing is not needed.
    const handleKeyplotRowChange = (newValue, keyplotIndex, rowIndex, field) => {
        console.warn("handleKeyplotRowChange is less relevant now as row inputs are in modal. Consider refactoring if direct row editing is needed.");
        // Example: If you had an edit button that loads existing row data into modal,
        // this function could be used to update the main keyplots state after modal submission.
    };

    // --- Main handler for all input changes in the Modal Form ---
    // This is a crucial function for updating modalRowData and triggering dependent fetches/updates.
const handleModalInputChange = useCallback((value, field) => {
  console.log("Changing field:", field, "to value:", value);

  setModalRowData(prev => {
    let newState = { ...prev, [field]: value };

 if (field === 'village') {
  const selectedVillage = allVillageData.find(v => v.villageId === value);
  if (selectedVillage) {
    setModalBlockOptions(selectedVillage.blocks.map(b => b.blockCode));
    newState = {
      ...newState,
      modalBlock: null,
      svNo: null,
      sub: '',
      block: '',
      area: '',
      actual: '',
      plot_id: '',
      subOptions: [],
      resvnoStart: '',
      resvnoEnd: ''
    };
  } else {
    setModalBlockOptions([]);
    setSvNoDetails([]);
    setSelectedSvNos([]);
    newState = {
      ...newState,
      modalBlock: null,
      svNo: null,
      sub: '',
      block: '',
      area: '',
      actual: '',
      plot_id: '',
      subOptions: [],
      resvnoStart: '',
      resvnoEnd: ''
    };
  }
}


    else if (field === 'modalBlock') {
      newState = {
        ...newState,
        svNo: null,
        sub: '',
        block: '',
        area: '',
        actual: '',
        plot_id: '',
        subOptions: []
      };
       setSvNoDetails([]);
      setSelectedSvNos([]);
    }

else if (field === 'resvnoStart' || field === 'resvnoEnd') {
  const updatedStart = field === 'resvnoStart' ? value : newState.resvnoStart;
  const updatedEnd = field === 'resvnoEnd' ? value : newState.resvnoEnd;

  newState = {
    ...newState,
    [field]: value
  };

  const startNum = parseInt(updatedStart);
  const endNum = parseInt(updatedEnd);

  if (
    updatedStart !== '' &&
    updatedEnd !== '' &&
    !isNaN(startNum) &&
    !isNaN(endNum)
  ) {
    if (endNum <= startNum) {
      setResvnoError("Resvno End must be greater than Resvno Start.");
 
   setSvNoDetails([]);       // Clear old results
  setSelectedSvNos([]);     // Clear selections
  
    } else {
      setResvnoError(""); // Clear error
      // ✅ Only call API when valid
      const kpId = keyplotId;
      const url = `${BASE_URL}/btr-service/cluster-api/${kpId}/resbdnos-by-village-block?villageId=${newState.village}&blockCode=${newState.modalBlock}&resvnoStart=${updatedStart}&resvnoEnd=${updatedEnd}`;
        const token = localStorage.getItem('token');
        console.log("url >>> ",url)
    setLoadingResvno(true); // <== Start loader before fetch

fetch(url,{
  headers: {
    'Authorization': `Bearer ${token}` // Token added here
  }
})
  .then((res) => res.json())
  .then((data) => {
    setSvNoDetails(data.resbdnoDetails || []);
    setSelectedSvNos([]);

    if (data.statusMessage && (!data.resbdnoDetails || data.resbdnoDetails.length === 0)) {
      setResvnoError(data.statusMessage);
    } else {
      setResvnoError('');
    }
  })
  .catch((error) => {
    console.error("Error fetching resbdno details:", error);
    setSvNoDetails([]);
    setResvnoError('Failed to fetch reservation data.');
  })
  .finally(() => {
    setLoadingResvno(false); // <== Stop loader
  });

    }
  } else {
    setResvnoError('');
  setResvnoError('');
   setSvNoDetails([]);       // Clear old results
   setSelectedSvNos([]);     // Clear selections
  }

  return newState;
}




    else if (field === 'sub') {
      if (newState.svNo && value) {
        fetchPlotDetails(syNo, newState.svNo, value);
      } else {
        newState = {
          ...newState,
          block: '',
          area: '',
          actual: '',
          plot_id: ''
        };
      }
    }

    else if (field === 'actual') {
      if (value === '') {
        // Allow blank entry for editing
      } else {
        const newActualValue = parseFloat(value);
        const currentArea = parseFloat(newState.area || 0);

        if (isNaN(newActualValue)) {
          setSnackbarMessage('Actual area must be a valid number.');
          setSnackbarOpen(true);
          return prev;
        }

        if (newActualValue < 0) {
          setSnackbarMessage('Negative values are not allowed for Actual area.');
          setSnackbarOpen(true);
          return prev;
        }

        if (newState.area && currentArea !== 0 && newActualValue > currentArea) {
          setSnackbarMessage('Actual area cannot exceed the given Area.');
          setSnackbarOpen(true);
          return prev;
        }
      }
    }

    return newState;
  });
}, [syNo, allVillageData]);

// Dependencies for useCallback

    // Handler to open the Add Row modal
    const addKeyplotRow = (keyplotIndex) => {
        setSelectedKeyplotIndex(keyplotIndex);
        setCurrentKeyplotIndex(keyplotIndex); // Store which N, E, S, W section we're adding to
        setModalRowData({ // Reset modal data for a fresh entry
            village: defaultVillageId, // Pre-set villageId
            villageName: defaultVillage, // Pre-set villageName for display/internal use
            modalBlock: defaultBlock, 
            svNo: null,
            sub: '',
            block: '',
            actual: '',
            area: '',
            subOptions: [],
            plot_id: '',
            isExisting: false
        });
        setModalOpen(true);
        
         // Open the modal
    };

    // Handler to remove the last row from a side plot
const handleOpenConfirmDialog = (keyplotIndex, rowIndexToRemove) => {
    setRowToDelete({
      keyplotIndex,
      rowIndexToRemove,
      rowData: keyplots[keyplotIndex].rows[rowIndexToRemove],
    });
    setOpenConfirmDialog(true);
  };

  // Function to close the confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setRowToDelete(null); // Clear the rowToDelete state
  };

  // Function to handle the actual deletion after confirmation
  const handleConfirmDelete = async () => {
  if (!rowToDelete) return;

  const { keyplotIndex, rowIndexToRemove, rowData } = rowToDelete;

   try {
      const token = localStorage.getItem('token');
  const response = await fetch(
    `${BASE_URL}/btr-service/cluster-api/delete-sideplot/${rowData.b_id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );;

    if (!response.ok) throw new Error('Failed to delete row from server');

    // Remove row from UI after successful deletion
    setKeyplots((prevKeyplots) =>
      prevKeyplots.map((keyplot, idx) => {
        if (idx === keyplotIndex) {
          const newRows = keyplot.rows.filter(
            (_, rIdx) => rIdx !== rowIndexToRemove
          );
          return { ...keyplot, rows: newRows };
        }
        return keyplot;
      })
    );

    handleCloseConfirmDialog(); // Close dialog after successful deletion
  } catch (err) {
    console.error('Error deleting row:', err);
    alert('Failed to delete row. Try again.');
    handleCloseConfirmDialog();
  }
};

  const removeKeyplotRow = async (keyplotIndex, rowIndexToRemove) => {
    const row = keyplots[keyplotIndex].rows[rowIndexToRemove];

    if (row.isExisting) {
      // Open the MUI confirmation dialog instead of window.confirm
      handleOpenConfirmDialog(keyplotIndex, rowIndexToRemove);
    } else {
      // Just remove the row from the UI
      setKeyplots((prevKeyplots) =>
        prevKeyplots.map((keyplot, idx) => {
          if (idx === keyplotIndex) {
            const newRows = keyplot.rows.filter(
              (_, rIdx) => rIdx !== rowIndexToRemove
            );
            return { ...keyplot, rows: newRows };
          }
          return keyplot;
        })
      );
    }
  };



const getRemainingArea = (villageId, blockCode, resvno, resbdno) => {
  // Find the plot details from the API response

const normalize = (val) => (val != null ? val.toString() : "NA");

const detail = svNoDetails.find(d =>
  normalize(d.resvno) === normalize(resvno) &&
  normalize(d.resbdno) === normalize(resbdno)
);
  if (!detail) return 0;

  // Get all rows that are using this plot from keyplots
  const allRows = keyplots.flatMap(k => k.rows).filter(row => 
    row.village === villageId && 
    row.block === blockCode &&
    row.svNo.toString() === resvno.toString() &&
    row.sub.toString() === resbdno.toString()
  );

  // Calculate total used area
  const usedArea = allRows.reduce((sum, row) => sum + parseFloat(row.enumeratedArea || 0), 0);

  // Calculate remaining area considering backend balance
  let remaining;
  
  if (detail.balance && detail.balance > 0) {
    // If there's a backend balance, add it to the remaining calculation
    remaining = detail.balance - usedArea;
    
  } else {
    // Otherwise just use the total area minus used area
    remaining = detail.area - usedArea;
       
  }

  // Ensure we don't return negative values
  return Math.max(0, remaining);
};


    // Handler to add a new row from the modal to the main keyplots state
const handleModalAddRow = () => {
  if (selectedKeyplotIndex === null) return;

  // safety: nothing selected
  if (!svNoDetails.length || !selectedSvNos.length) {
    setSnackbarMessage(selectedSvNos.length ? "Selected plots already exist or data is invalid." : "Please select at least one plot.");
    setSnackbarOpen(true);
    return;
  }

  // safety cap
  if (selectedSvNos.length > MAX_ALLOWED_ROWS) {
    setSnackbarMessage(`Too many selected plots (${selectedSvNos.length}). Select up to ${MAX_ALLOWED_ROWS} at a time.`);
    setSnackbarOpen(true);
    return;
  }

  // 1) compute new rows & check cluster max
  const currentTotal = parseFloat(calculateOverallTotalActual() || 0);
  let newRowsTotal = 0;
  const preparedRows = [];

  selectedSvNos.forEach((selectedId) => {
    const [resvno, resbdno] = selectedId.split('-');
    const detail = svNoDetails.find(d =>
      d.resvno?.toString() === resvno?.toString() && d.resbdno?.toString() === resbdno?.toString()
    );

    if (!detail) return;

    const remainingArea = parseFloat(getRemainingArea(
      modalRowData.village,
      modalRowData.modalBlock,
      resvno,
      resbdno
    ) || 0);
console.log("ggg ",remainingArea)
    if (remainingArea > 0) {
      newRowsTotal += remainingArea;
      console.log("totla  ",newRowsTotal)
      preparedRows.push({
        village: modalRowData.village,
        villageName: villageOptions.find(v => v.villageId === modalRowData.village)?.village || '',
        block: modalRowData.modalBlock,
        svNo: resvno,
        sub: resbdno,
        area: detail.area,
        enumeratedArea: remainingArea.toFixed(2),
        plot_id: detail.plotId?.toString(),
        isExisting: false,
        isPending: true
      });
    }
  });

  // Check cluster max
  if (maxcluster && !isNaN(parseFloat(maxcluster)) && (currentTotal + newRowsTotal) > parseFloat(maxcluster)) {
    setSnackbarMessage(`Cannot add selected plots — adding ${newRowsTotal.toFixed(2)} cents would exceed cluster max (${maxcluster}).`);
    setSnackbarOpen(true);
    return;
  }

  if (preparedRows.length === 0) {
    setSnackbarMessage("No valid rows to add (maybe remaining area is 0).");
    setSnackbarOpen(true);
    return;
  }

  // 2) Add rows in one update (fast)
  setKeyplots(prevKeyplots => {
    const updated = [...prevKeyplots];
    updated[selectedKeyplotIndex] = {
      ...updated[selectedKeyplotIndex],
      rows: [...updated[selectedKeyplotIndex].rows, ...preparedRows]
    };
    return updated;
  });

  // 3) reset modal state
  setModalRowData({
    village: null,
    modalBlock: null,
    svNo: null,
    sub: '',
    block: '',
    area: '',
    actual: '',
    plot_id: '',
    subOptions: [],
    resvnoStart: '',
    resvnoEnd: ''
  });
  setSvNoDetails([]);
  setSelectedSvNos([]);
  setSelectAllChecked(false);
  setModalOpen(false);
  setResvnoError('');
};


const totalSelectedArea = useMemo(() => {
  return selectedSvNos.reduce((sum, id) => {
    const [resvno, resbdno] = id.split("-");
    const area = parseFloat(
      getRemainingArea(
        modalRowData.village,
        modalRowData.modalBlock,
        resvno,
        resbdno
      ) || 0
    );
    return sum + area;
  }, 0);
}, [selectedSvNos, modalRowData, getRemainingArea]);

const isResbdnoAlreadyAdded = (itemResvno, itemResbdno) => { // Pass both parts
  if (selectedKeyplotIndex === null) return false;
  const currentRows = keyplots[selectedKeyplotIndex].rows;
  return currentRows.some(row => 
    row.village === modalRowData.village && // Or compare villageName if that's what's used in rows
    row.block === modalRowData.modalBlock &&
    row.svNo === itemResvno &&
    row.sub === itemResbdno
  );
};

const isAddButtonDisabled = () => {
  if (svNoDetails.length > 0) {
    return selectedSvNos.length === 0 || 
      selectedSvNos.every(id => {
        const [resvno, resbdno] = id.split('-');
        return getRemainingArea(
          modalRowData.village,
          modalRowData.modalBlock,
          resvno,
          resbdno
        ) <= 0;
      });
  }
  return !modalRowData.svNo || !modalRowData.actual;
};
    // Handler for blurring the 'actual' area input (if you have one outside the modal)
    // For the modal, this could be handled by `handleModalInputChange` or before `handleModalAddRow`
    const handleAreaInputBlur = (keyplotIndex) => {
        // This function was originally for direct input fields in the main form.
        // With modal, actual area formatting should occur within the modal's context or on submission.
        // If you keep direct input fields in the main form, this would still apply to them.
        console.log("handleAreaInputBlur called. Consider if still needed with modal.");
    };

    // Calculate total actual area for a specific side plot
    const calculateTotalActual = (rows) => {
        return rows.reduce((sum, row) => sum + parseFloat(row.enumeratedArea || 0), 0).toFixed(2);
    };

    // Calculate total area in Ares for a specific side plot
    const calculateTotalArea = (rows) => {
        const totalCents = rows.reduce((sum, row) => sum + parseFloat(row.enumeratedArea || 0), 0);
        const totalAres = totalCents * 0.00404686; // Conversion: 1 cent = 0.00404686 ares
        return totalAres.toFixed(2);
    };

    // Calculate overall total actual area across all side plots
    const calculateOverallTotalActual = () => {
        let total = 0;
        keyplots.forEach(keyplot => {
            total += parseFloat(calculateTotalActual(keyplot.rows));
        });
        return total.toFixed(2);
    };

    // Calculate overall total area in Ares across all side plots
    const calculateOverallTotalArea = () => {
        let totalCents = 0;
        keyplots.forEach(keyplot => {
            totalCents += keyplot.rows.reduce((sum, row) => sum + parseFloat(row.enumeratedArea || 0), 0);
        });
        const totalAres = totalCents * 0.00404686;
        return totalAres.toFixed(2);
    };

    // Handles the form submission
// const handleSubmit = async (event) => {
//     event.preventDefault();

//     // 1. Validate total cluster area
//  const overallTotalAreaCents = parseFloat(calculateOverallTotalArea()); // in cents

// // This comes from admin or backend config (e.g., 5 acres)


// // Dynamically calculate limits

// // if (overallTotalAreaCents < minAllowedCents || overallTotalAreaCents > maxAllowedCents) {
// //     const totalAreaAcres = (overallTotalAreaCents / 100).toFixed(2);
// //     setSnackbarMessage(
// //         `Total area (${totalAreaAcres} acres) must be between ${adminDefinedAcres - 1} and ${adminDefinedAcres + 1} acres.`
// //     );
// //     setSnackbarOpen(true);
// //     return;
// // }
// const totalCents = parseFloat(calculateOverallTotalActual());
//   const minCents = parseFloat(mincluster || 0); 
//   const maxCents = parseFloat(maxcluster || 0);

//   // ✅ Just show messages, don't block save
//   if (minCents && totalCents < minCents) {
//     setSnackbarMessage(
//       `Total area (${totalCents.toFixed(2)} cents) is below minimum (${minCents} cents). Cluster not complete.`
//     );
//     setSnackbarOpen(true);
//   }

//   if (maxCents && totalCents > maxCents) {
//     setSnackbarMessage(
//       `Total area (${totalCents.toFixed(2)} cents) exceeds maximum (${maxCents} cents). Cluster not complete.`
//     );
//     setSnackbarOpen(true);
//   }



//     const sidePlotsToSubmit = [];
//     let hasValidationError = false;

//     // Track total used area per plot (village+block+svNo+sub)
//     const plotUsageMap = new Map();

//     // First pass: Calculate total usage for each plot
//     keyplots.forEach(keyplot => {
//         keyplot.rows.forEach(row => {
//             if (!row.plot_id) return;

//             const plotKey = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
//             const currentUsage = parseFloat(row.enumeratedArea || 0);
            
//             if (plotUsageMap.has(plotKey)) {
//                 plotUsageMap.set(plotKey, plotUsageMap.get(plotKey) + currentUsage);
//             } else {
//                 plotUsageMap.set(plotKey, currentUsage);
//             }
//         });
//     });

//     // Second pass: Validate each row
//     for (const keyplot of keyplots) {
//         const filteredRows = [];
        
//         for (const row of keyplot.rows) {
//             // Skip rows without plot_id
//             if (!row.plot_id) continue;

//             const enumeratedArea = parseFloat(row.enumeratedArea || 0);
//             const plotKey = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
//             const totalUsedArea = plotUsageMap.get(plotKey) || 0;
//             const plotArea = parseFloat(row.area || 0);

//             // Basic validations
//             if (row.enumeratedArea === '' || isNaN(enumeratedArea)) {
//               setKeyplots(prevKeyplots =>
//   prevKeyplots.map((kp, kpIndex) => {
//     if (kpIndex !== keyplots.indexOf(keyplot)) return kp;

//     const updatedRows = kp.rows.map((r, rIdx) => {
//       if (
//         r.village === row.village &&
//         r.block === row.block &&
//         r.svNo === row.svNo &&
//         r.sub === row.sub
//       ) {
//         return { ...r, areaError: "Please enter a valid Actual Area" };
//       }
//       return r;
//     });

//     return { ...kp, rows: updatedRows };
//   })
// );
// setSnackbarMessage(`Please enter a valid 'Actual Area' for Sv.No: ${row.svNo}/${row.sub} in ${keyplot.label}.`);
// setSnackbarOpen(true);
// hasValidationError = true;
// break;
//             }

//             if (enumeratedArea <= 0) {
//                 setSnackbarMessage(`Area must be greater than 0 for Sv.No: ${row.svNo}/${row.sub}.`);
//                 setSnackbarOpen(true);
//                 hasValidationError = true;
//                 break;
//             }

//             // Validate against total plot area
//             if (totalUsedArea > plotArea) {
//                 setSnackbarMessage(
//                     `Total enumerated area (${totalUsedArea.toFixed(2)}) exceeds plot area (${plotArea.toFixed(2)}) ` +
//                     `for ${row.svNo}/${row.sub}. Please reduce by ${(totalUsedArea - plotArea).toFixed(2)} cents.`
//                 );
//                 setSnackbarOpen(true);
//                 hasValidationError = true;
//                 break;
//             }

//             // If validation passes, add to submission
//             filteredRows.push({
//                 actual: enumeratedArea.toFixed(2),
//                 plot_id: row.plot_id,
//             });
//         }

//         if (hasValidationError) break;

//         if (filteredRows.length > 0) {
//             sidePlotsToSubmit.push({
//                 label: keyplot.label,
//                 rows: filteredRows,
//             });
//         }
//     }

//     if (hasValidationError) return;

//     if (sidePlotsToSubmit.length === 0) {
//         setSnackbarMessage('No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.');
//         setSnackbarOpen(true);
//         return;
//     }

//     // Prepare payload
//     const payload = {
//         userId: authservice.userid(),
//         keyplotId: syNo,
//         clusterNo: parseInt(slNo, 10),
//         sidePlots: sidePlotsToSubmit,
//     };

//     console.log('Submitting payload:', payload);

//     try {
//           const token = localStorage.getItem('token');
//         const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save-cluster`, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}` // Add token here
//     },
//     body: JSON.stringify(payload),
// });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     setSnackbarMessage('Form submitted successfully!');
//     setSnackbarOpen1(true);
//     setPendingRows([]); // Clear pending rows after successful submission
//     console.log('API response:', result);
    
//   } catch (error) {
//     console.error('Error submitting form:', error);
//     setSnackbarMessage(`Failed to submit form: ${error.message}`);
//     setSnackbarOpen(true);
//   }
// };

const handleSubmit = async (event) => {
  event.preventDefault();

  // Step 1: Run validations first
  const sidePlotsToSubmit = [];
  let hasValidationError = false;
  const plotUsageMap = new Map();

  // First pass: calculate total usage
  keyplots.forEach(keyplot => {
    keyplot.rows.forEach(row => {
      if (!row.plot_id) return;
      const key = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
      const area = parseFloat(row.enumeratedArea || 0);
      plotUsageMap.set(key, (plotUsageMap.get(key) || 0) + area);
    });
  });

  // Second pass: validate rows
  for (const keyplot of keyplots) {
    const validRows = [];

    for (const row of keyplot.rows) {
      if (!row.plot_id) continue;

      const enumeratedArea = parseFloat(row.enumeratedArea || 0);
      const key = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
      const totalUsed = plotUsageMap.get(key) || 0;
      const plotArea = parseFloat(row.area || 0);

      // Validation: must be a number
      if (row.enumeratedArea === '' || isNaN(enumeratedArea)) {
        setKeyplots(prev =>
          prev.map((kp, idx) => {
            if (idx !== keyplots.indexOf(keyplot)) return kp;
            return {
              ...kp,
              rows: kp.rows.map(r => {
                if (
                  r.village === row.village &&
                  r.block === row.block &&
                  r.svNo === row.svNo &&
                  r.sub === row.sub
                ) {
                  return { ...r, areaError: "Please enter a valid Actual Area" };
                }
                return r;
              }),
            };
          })
        );

        setSnackbarMessage(
          `Please enter a valid 'Actual Area' for Sv.No: ${row.svNo}/${row.sub} in ${keyplot.label}.`
        );
        setSnackbarOpen(true);
        hasValidationError = true;
        break;
      }

      // Validation: must be > 0
      if (enumeratedArea <= 0) {
        setSnackbarMessage(
          `Area must be greater than 0 for Sv.No: ${row.svNo}/${row.sub}.`
        );
        setSnackbarOpen(true);
        hasValidationError = true;
        break;
      }

      // Validation: not exceed plot area
      if (totalUsed > plotArea) {
        setSnackbarMessage(
          `Total enumerated area (${totalUsed.toFixed(2)}) exceeds plot area (${plotArea.toFixed(
            2
          )}) for ${row.svNo}/${row.sub}. Please reduce by ${(
            totalUsed - plotArea
          ).toFixed(2)} cents.`
        );
        setSnackbarOpen(true);
        hasValidationError = true;
        break;
      }

      // Valid row
      validRows.push({
        actual: enumeratedArea.toFixed(2),
        plot_id: row.plot_id,
      });
    }

    if (hasValidationError) break;

    if (validRows.length > 0) {
      sidePlotsToSubmit.push({
        label: keyplot.label,
        rows: validRows,
      });
    }
  }

  if (hasValidationError) return;

  if (sidePlotsToSubmit.length === 0) {
    setSnackbarMessage(
      'No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.'
    );
    setSnackbarOpen(true);
    return;
  }

  // Step 2: Now check total cluster area limits
  const totalCents = parseFloat(calculateOverallTotalActual() || 0);
  const minCents = parseFloat(mincluster || 0);
  const meanCents = parseFloat(meanCluster || 0);
  const maxCents = parseFloat(maxcluster || 0);

  // ❌ Block if over max
  if (maxCents && totalCents > maxCents) {
    setSnackbarMessage(
      `❌ Error: Cluster area (${totalCents.toFixed(
        2
      )} cents) exceeds the maximum allowed (${maxCents} cents).`
    );
    setSnackbarOpen(true);
    return;
  }

  // ✅ Decide dialog label & message
  setPendingSidePlots(sidePlotsToSubmit);

if (minCents && totalCents < minCents) {
  setLimitMessage(
    `⚠️ Cluster area (${totalCents.toFixed(2)} cents) is below the minimum (${minCents}). 
     Do you want to save this work as a Draft so you can continue later?`
  );
  setConfirmLabel("Save Draft");
  setConfirmColor("warning");

  // 🟡 Draft → warning icon
  setDialogIcon(<WarningAmberIcon />);
  setDialogIconColor("warning.main");

} else if (meanCents && totalCents < meanCents) {
  setLimitMessage(
    `ℹ️ Cluster area (${totalCents.toFixed(2)} cents) reached the minimum (${minCents}) 
     but has not yet reached the mean (${meanCents}). 
     Do you want to Send this cluster for Approval?`
  );
  setConfirmLabel("Send for Approval");
  setConfirmColor("primary");

  // 🔵 Approval → info icon
  setDialogIcon(<InfoIcon />);
  setDialogIconColor("info.main");

} else {
  setLimitMessage(
    `✅ Cluster area (${totalCents.toFixed(2)} cents) is valid (≥ ${meanCents}, ≤ ${maxCents}). 
     Do you want to Submit the Cluster now?`
  );
  setConfirmLabel("Submit the Cluster");
  setConfirmColor("success");

  // 🟢 Submit → check icon
  setDialogIcon(<CheckCircleIcon />);
  setDialogIconColor("success.main");
}


  // 👉 Open dialog (doSubmit will be called only after user confirms)
  setOpenLimitDialog(true);
};



const doSubmit = async (sidePlotsToSubmit, actionLabel) => {
  if (!sidePlotsToSubmit || sidePlotsToSubmit.length === 0) {
    setSnackbarMessage('Nothing to submit.');
    setSnackbarOpen(true);
    return;
  }

  const payload = {
    userId: authservice.userid(),
    keyplotId: syNo,
    clusterNo: parseInt(slNo, 10),
    sidePlots: sidePlotsToSubmit,
  };

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/btr-service/cluster-api/save-cluster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Save failed');

    const result = await response.json();

    // 🔹 Map actionLabel → friendly message
// 🔹 Map actionLabel → friendly message + color
let successMsg = "Form submitted successfully!";
let severity = "success"; // default green

if (actionLabel === "Save Draft") {
  successMsg = "Draft saved successfully!";
  severity = "warning"; // yellow
} else if (actionLabel === "Send for Approval") {
  successMsg = "Cluster sent for approval successfully!";
  severity = "info"; // blue
} else if (actionLabel === "Submit the Cluster") {
  successMsg = "Cluster submitted successfully!";
  severity = "success"; // green
}

setSnackbarMessage(successMsg);
setSnackbarSeverity(severity);
setSnackbarOpen1(true);


  } catch (err) {
    setSnackbarMessage(`Failed to submit form: ${err.message}`);
    setSnackbarOpen(true);
  }
};



// savee

//rejection
const handleOpenRejectDialog = () => {
  setOpenRejectDialog(true);
};

const handleCloseRejectDialog = () => {
  setOpenRejectDialog(false);
  setRejectReason(''); // Reset reason on close
  setCustomReason(''); // Reset custom reason on close
};

const handleRejectReasonChange = (event) => {
  const newReason = event.target.value;
  setRejectReason(newReason);
  if (newReason !== 'other') {
    setCustomReason(''); // Clear custom reason if another option is selected
  }
};

const handleConfirmReject = async () => {
  // Set loading to true to show the loading indicator
  setLoading(true);

  // Logic to handle the rejection
  const reasonToSubmit = rejectReason === 'other' ? customReason : rejectReason;
  console.log('Rejecting cluster with reason:', reasonToSubmit);

  try {
    const token = localStorage.getItem('token');
    const kPlotObj = keyplots.find(item => item.id === "K");
    const plotId = kPlotObj?.rows?.[0]?.plot_id || null;

    if (!plotId) {
      throw new Error("Plot ID not found.");
    }

    const response = await fetch(`${BASE_URL}/btr-service/cluster-api/reject-cluster/${plotId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason_for_cluster: reasonToSubmit,
        userid: authservice.userid(),
        zone_id: '758',
        reason: 'Cluster Rejected',
      }),
    });

    const data = await response.json();


    // Check if the response was successful
    if (response.ok) {
      // Show success snackbar message
      setSnackbarMessage('Cluster rejected successfully!');
      setSnackbarOpen1(true);
      // Navigate after a short delay to allow the user to see the snackbar
      setTimeout(() => {
        navigate('/schemes/earas/clusters');
      }, 1500); // 1.5-second delay
    } else {
      // Handle non-2xx status codes
      const errorMessage = data.statusMessage || `Failed to reject cluster: ${response.status}`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error rejecting cluster:", error);
    // Show error snackbar message
    setSnackbarMessage(`Error: ${error.message}`);
    setSnackbarOpen(true);
  } finally {
    // Set loading to false and close the dialog regardless of success or failure
    setLoading(false);
    handleCloseRejectDialog();
  }
};


    // Handles closing the Snackbar message
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
        setSnackbarOpen1(false);
    };


const handleEnumeratedAreaChange = (value, keyplotIndex, rowIndex) => {
  const row = keyplots[keyplotIndex].rows[rowIndex];

  // Allow clearing the input
  if (value === '') {
    setKeyplots(prev => prev.map((k, idx) => 
      idx === keyplotIndex ? {
        ...k,
        rows: k.rows.map((r, rIdx) => 
          rIdx === rowIndex ? { ...r, enumeratedArea: '', areaError: '' } : r
        )
      } : k
    ));
    return;
  }

  // Validate numeric input
  const newArea = parseFloat(value);
  if (isNaN(newArea)) {
    setKeyplots(prev => prev.map((k, idx) => 
      idx === keyplotIndex ? {
        ...k,
        rows: k.rows.map((r, rIdx) => 
          rIdx === rowIndex ? { ...r, enumeratedArea: '', areaError: 'Please enter a valid number' } : r
        )
      } : k
    ));
    return;
  }

  if (newArea <= 0) {
    setKeyplots(prev => prev.map((k, idx) => 
      idx === keyplotIndex ? {
        ...k,
        rows: k.rows.map((r, rIdx) => 
          rIdx === rowIndex ? { ...r, enumeratedArea: '', areaError: 'Area must be greater than 0' } : r
        )
      } : k
    ));
    return;
  }

  // Calculate remaining area
  const totalUsedAreaExcludingCurrent = keyplots
    .flatMap(k => k.rows)
    .filter(r => 
      r.village === row.village &&
      r.block === row.block &&
      r.svNo === row.svNo &&
      r.sub === row.sub &&
      r !== row &&
      (!r.b_id || r.b_id !== row.b_id)
    )
    .reduce((sum, r) => sum + parseFloat(r.enumeratedArea || 0), 0);

  const maxAllowedForCurrent = parseFloat(row.area || 0) - totalUsedAreaExcludingCurrent;

  if (newArea > maxAllowedForCurrent) {
    // Prevent exceeding by not updating the value
    setKeyplots(prev => prev.map((k, idx) => 
      idx === keyplotIndex ? {
        ...k,
        rows: k.rows.map((r, rIdx) => 
          rIdx === rowIndex ? { 
            ...r, 
            // Keep existing value (don't update to invalid value)
            areaError: `Cannot exceed ${maxAllowedForCurrent.toFixed(2)} cents` 
          } : r
        )
      } : k
    ));
  } else {
    // Valid input - update normally
    setKeyplots(prev => prev.map((k, idx) => 
      idx === keyplotIndex ? {
        ...k,
        rows: k.rows.map((r, rIdx) => 
          rIdx === rowIndex ? { 
            ...r, 
            enumeratedArea: value, 
            areaError: '' 
          } : r
        )
      } : k
    ));
  }
};
const [showFloatingSummary, setShowFloatingSummary] = useState(false);
const totalAreaRef = useRef(null);

useEffect(() => {
  const handleScroll = () => {
    if (totalAreaRef.current) {
      const { top } = totalAreaRef.current.getBoundingClientRect();
      setShowFloatingSummary(top < 0); // Show when the element is scrolled out of view
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


useEffect(() => {
  const eligibleIds = svNoDetails
    .filter(item => {
      const remaining = parseFloat(
        getRemainingArea(
          modalRowData.village,
          modalRowData.modalBlock,
          item.resvno?.toString(),
          item.resbdno?.toString()
        ) || 0
      );
      return remaining > 0;
    })
    .map(item => `${item.resvno}-${item.resbdno}`);

  const selectedEligible = selectedSvNos.filter(id => eligibleIds.includes(id));
  setSelectAllChecked(eligibleIds.length > 0 && selectedEligible.length === eligibleIds.length);
}, [svNoDetails, selectedSvNos, modalRowData, getRemainingArea]);


const handleSelectAll = useCallback(() => {
  if (selectAllChecked) {
    setSelectedSvNos([]);
  } else {
    const allSelectableIds = svNoDetails
      .filter(item => {
        const remaining = parseFloat(getRemainingArea(
          modalRowData.village,
          modalRowData.modalBlock,
          item.resvno?.toString(),
          item.resbdno?.toString()
        ) || 0);
        return remaining > 0;
      })
      .map(item => `${item.resvno}-${item.resbdno}`);
    
    setSelectedSvNos(allSelectableIds);
  }
}, [selectAllChecked, svNoDetails, modalRowData, getRemainingArea]);


const Row = useCallback(({ index, style }) => {
  const item = svNoDetails[index];
  const id = `${item.resvno}-${item.resbdno}`;
  const remaining = parseFloat(getRemainingArea(
    modalRowData.village,
    modalRowData.modalBlock,
    item.resvno?.toString(),
    item.resbdno?.toString()
  ) || 0);
  const disabled = remaining <= 0;
  const checked = selectedSvNos.includes(id);

  return (
    <div style={style} key={id}>
      <ListItem
        disableGutters
        sx={{
          px: 1,
          height: VIRTUAL_ITEM_SIZE,          // <-- fixed, matches list itemSize
          alignItems: 'center',
          borderBottom: '1px solid #eee'      // <-- replaces <Divider />
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={() => handleSvNoSelection(id)}
              disabled={disabled}
              size="small"
            />
          }
          label={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ pr: 1, overflowY: 'hidden' }}>
                <Typography variant="h6" noWrap>
                  <strong>{item.resvno}/{item.resbdno}</strong>
                </Typography>
                <Typography variant="p" noWrap>
                  Area: {item.area} cent
                  {/* | Balance: {remaining.toFixed(2)}c */}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                {disabled ? (
                  <Typography variant="caption" color="text.secondary">No remaining</Typography>
                ) : (
                  <Typography variant="p">Remaining {remaining.toFixed(2)}c</Typography>
                )}
              </Box>
            </Box>
          }
          sx={{ width: '100%' }}
        />
      </ListItem>
    </div>
  );
}, [selectedSvNos, handleSvNoSelection, modalRowData, svNoDetails]);



// === Performance & limit constants ===
const MAX_ALLOWED_ROWS = maxcluster; // safety cap for number of rows selected at once. adjust if needed.
const VIRTUAL_ITEM_SIZE = 64; // px height for each row in virtual list
const VIRTUAL_MAX_VISIBLE = 8; // show up to 8 items height in the modal before scrolling

// Virtualized renderer for svNoDetails in modal
const SvNoVirtualList = React.memo(() => {
  const items = svNoDetails || [];
  const itemSize = VIRTUAL_ITEM_SIZE;
  const height = Math.min(items.length, VIRTUAL_MAX_VISIBLE) * itemSize || itemSize;

  if (!items.length) {
    return <Typography variant="body2" sx={{ mt: 1 }}>No plots found for the selected range.</Typography>;
  }

  return (
    <FixedSizeList
      ref={listRef}
      height={height}
      itemCount={items.length}
      itemSize={itemSize}
      width="100%"
      style={{ marginTop: 8 }}
    >
      {Row}
    </FixedSizeList>
  );
});


const SvNoList = () => {
  const itemSize = VIRTUAL_ITEM_SIZE;
  const maxVisibleRows = 6;
  const height = Math.min(svNoDetails.length, maxVisibleRows) * itemSize || itemSize;

  if (!svNoDetails.length) {
    return (
      <Typography variant="body2" sx={{ mt: 1 }}>
        No plots found for the selected range.
      </Typography>
    );
  }

  return (
    <FixedSizeList
      ref={listRef}           // <-- attach the ref you're using in preserveScrollPosition
      height={height}
      itemCount={svNoDetails.length}
      itemSize={itemSize}
      width="100%"
      style={{ marginTop: 8 }}
    >
      {Row}
    </FixedSizeList>
  );
};


const combinedTotal = useMemo(() => {
  const selectedTotal = selectedSvNos.reduce((sum, id) => {
    const [resvno, resbdno] = id.split("-");
    const area = parseFloat(
      getRemainingArea(
        modalRowData.village,
        modalRowData.modalBlock,
        resvno,
        resbdno
      ) || 0
    );
    return sum + area;
  }, 0);

  return parseFloat(calculateOverallTotalActual() || 0) + selectedTotal;
}, [selectedSvNos, modalRowData, getRemainingArea, calculateOverallTotalActual]);



// In your modal component, update the reservation selection section:
{/* <>
  <Divider sx={{ my: 2 }} />

  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
    ✅ Reservation Sub Numbers
  </Typography>

<Box
  sx={{
    minHeight: 150,
    maxHeight: 350,
    px: 2,
    py: 1,
    border: '1px dashed #ccc',
    borderRadius: 2,
    backgroundColor: '#fafafa',
  }}
>
  {loadingResvno ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
      <CircularProgress size={30} />
    </Box>
  ) : svNoDetails.length > 0 ? (
    <>
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
    <FormControlLabel
      control={<Checkbox checked={selectAllChecked} onChange={handleSelectAll} />}
      label="Select all visible (only with remaining > 0)"
    />
    <Typography variant="caption" color="text.secondary">{svNoDetails.length} results</Typography>
  </Box>
  <SvNoList />
</>

  ) : resvnoError ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '120px',
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
        alt="No Data"
        width={50}
        height={50}
        style={{ marginBottom: 8, opacity: 0.6 }}
      />
      <Typography variant="body1" fontWeight="bold" color="error">
        {resvnoError}
      </Typography>
      <Typography variant="body2">
        Please adjust the Resvno range and try again.
      </Typography>
    </Box>
  ) : null}
</Box>
</> */}
    // --- Loading State (before JSX) ---
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading cluster data...</Typography>
            </Container>
        );
    }

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {/* Floating Summary Bar - Add this right after opening Container */}


{showFloatingSummary && (
  <Box sx={{
    position: 'fixed',
    top: '15%',
    right: 0,
    zIndex: 1000,
    borderRadius:'1rem 1rem',
    backgroundColor: 'rgba(212, 228, 231, 0.8)',
    p: 1.5,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: 2,
    borderBottom: '1px solid #e0e0e0',
    width: 'auto',
    minWidth: '300px',
  }}>
    <Typography variant="subtitle1" fontWeight="bold">
      Cluster: {slNo || 'Not Available'} | {keyplotDetails.panchayath || ''}
    </Typography>
    <Box sx={{ width: '100%', mt: 1 }}>
      <Typography variant="subtitle1">
        <strong>Total Area:</strong> {calculateOverallTotalActual()} Cent
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(parseFloat(calculateOverallTotalActual()) / 600) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          mt: 0.5,
          '& .MuiLinearProgress-bar': {
            backgroundColor: () => {
              const totalCents = parseFloat(calculateOverallTotalActual());
              if (totalCents > maxcluster) {
                return 'error.main';
              } else if (totalCents > mincluster) {
                return 'warning.main';
              }
              return 'success.main';
            },
          },
        }}
      />
      <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
        {parseFloat(calculateOverallTotalActual()).toFixed(2)} / {maxcluster} Cents
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Tooltip title="View FMB">
          <Button variant="contained" color="secondary" onClick={() => {/* handle view FMB */}}>
            <MapIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Reject Cluster">
          <Button variant="contained" color="error" onClick={handleOpenRejectDialog}>
            <WarningAmberIcon />
          </Button>
        </Tooltip>
        <Tooltip title="Submit">
          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
            <SaveIcon />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  </Box>
)}

        <Typography variant="h4" align="center" gutterBottom color="primary">
          Cluster Land Form
        </Typography>

        <Box sx={{ bgcolor: '#3066c2', color: 'white', p: 1, borderRadius: 1, mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Cluster Info
        </Box>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="Cluster No." value={slNo || 'Not Available'} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="Local Body" value={keyplotDetails.panchayath || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Land Type"
              value={keyplotDetails.landType || ''}
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid> 
         
          <Grid item xs={12} sm={6} md={3} ref={totalAreaRef}>
            <TextField label="Total Actual Area (in cents)" value={calculateOverallTotalActual()} InputProps={{ readOnly: true }} fullWidth/>
            {/* THIS IS WHERE THE NEW CODE FOR LinearProgress IS ADDED */}
            <Box sx={{ width: '100%', mt: 1 }}>

              <LinearProgress
                variant="determinate"
                value={(parseFloat(calculateOverallTotalActual()) / 600) * 100} // Assuming 600 cents is 6 acres
                sx={{
                  height: 10,
                  borderRadius: 5,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: () => {
                      const totalCents = parseFloat(calculateOverallTotalActual());
                      if (totalCents > 550) { // Example: Warning when close to limit (e.g., over 5.5 acres)
                        return 'error.main'; // Red
                      } else if (totalCents > 450) { // Example: Approaching limit (e.g., over 4.5 acres)
                        return 'warning.main'; // Orange/Yellow
                      }
                      return 'success.main'; // Green
                    },
                  },
                }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 0.5, textAlign: 'right', color: 'text.secondary' }}>
                {parseFloat(calculateOverallTotalActual()).toFixed(2)} / 600 Cents (Max 6 Acres)
              </Typography>
          
            </Box>
          </Grid>
        </Grid>

<Box sx={{ maxWidth: 800, margin: '0 auto' }}>
  <Grid container spacing={2} alignItems="center">
    <Grid item xs={6}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="contained" color="secondary">
          <MapIcon /> View FMB
        </Button>
      </Box>
    </Grid>
    <Grid item xs={6}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="error" onClick={handleOpenRejectDialog}>
          
        {/* <Button variant="contained" color="error"> */}
          <DeleteForeverIcon /> Reject Cluster
        </Button>
      </Box>
    </Grid>
  </Grid>
</Box>

            {keyplots.map((keyplot, index) => (
                <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
                    <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
   <Typography sx={{ mr: 1 }}>
  {keyplot.label === "K" ? "KEYPLOT" : "SIDEPLOT"}:
</Typography>

    {keyplot.id === 'K' ? (
        <TextField
            value={keyplot.label}
            InputProps={{ readOnly: true }}
            inputProps={{ maxLength: 4, style: { color: 'white' } }}
            size="small"
            sx={{ bgcolor: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '50px' }}
        />
    ) : (
        // --- NEW: Using Select Component ---
 <FormControl
  variant="outlined"
  size="small"
  sx={{
    width: '100px',
    bgcolor: 'transparent',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }
  }}
>
  <InputLabel
    id={`side-plot-label-${keyplot.id}`}
    sx={{ color: 'white' }}
  >
    Label
  </InputLabel>
  <Select
    labelId={`side-plot-label-${keyplot.id}`}
    value={keyplot.label}
    label="Label"
    onChange={(e) => handleKeyplotLabelChange(e, index)}
    sx={{
      color: 'white',
      fontWeight: 'bold',
      '& .MuiSelect-icon': { color: 'white' }
    }}
  >
    {sidePlotLabelOptions.map((option) => (
      <MenuItem
        key={option}
        value={option}
        // 🚀 disable if another row already has this option
        disabled={keyplots.some(
          (sp, i) => i !== index && sp.label === option
        )}
      >
        {option}
      </MenuItem>
    ))}
  </Select>
</FormControl>

        // --- END NEW ---
    )}
</Box>
                        <Typography>Total Actual Area (Cent): {calculateTotalActual(keyplot.rows)}</Typography>
                      
                    </Box>
                  <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
  {/* Column Headers */}
  <Grid item xs={2}> <Typography fontWeight="bold">Village</Typography> </Grid>
  <Grid item xs={2}> <Typography fontWeight="bold">Block</Typography> </Grid>
  <Grid item xs={2}> <Typography fontWeight="bold">SV.No / Sub</Typography> </Grid>
  <Grid item xs={3}> <Typography fontWeight="bold">Total Area Actual</Typography> </Grid>
  <Grid item xs={2}> <Typography fontWeight="bold">Total Area Enumerated</Typography> </Grid>

  {/* Dynamic Rows */}
  {keyplot.rows.map((row, rowIndex) => (
    <React.Fragment key={rowIndex}>
      <Grid item xs={2}>
        <TextField value={row.villageName || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
      </Grid>
      <Grid item xs={2}>
        <TextField value={row.block || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
      </Grid>
      <Grid item xs={2}>
        <TextField
          value={`${row.svNo || ''} / ${row.sub || ''}`}
          InputProps={{ readOnly: true }}
          fullWidth
          size="small"
        />
      </Grid>
      <Grid item xs={2}>
        <TextField value={row.area || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
      </Grid>
    <Grid item xs={2}>
  {(() => {
    const otherRows = keyplots
      .flatMap(k => k.rows)
      .filter(r =>
        r.village === row.village &&
        r.block === row.block &&
        r.svNo === row.svNo &&
        r.sub === row.sub &&
        r.b_id !== row.b_id
      );

    const totalOtherArea = otherRows.reduce((sum, r) => sum + parseFloat(r.enumeratedArea || 0), 0);
    const maxAllowed = parseFloat(row.area) - totalOtherArea;
    const currentArea = parseFloat(row.enumeratedArea || 0);
    const isError = currentArea > maxAllowed;

   return (


  <TextField
    value={row.enumeratedArea || ''}
    onChange={(e) => handleEnumeratedAreaChange(e.target.value, index, rowIndex)}
    fullWidth
    size="small"
    type="number"
    inputProps={{ 
      step: "0.01",
      min: "0",
      max: (parseFloat(row.area || 0) - 
        keyplots
          .flatMap(k => k.rows)
          .filter(r => 
            r.village === row.village &&
            r.block === row.block &&
            r.svNo === row.svNo &&
            r.sub === row.sub &&
            !(r.b_id && r.b_id === row.b_id)
          )
          .reduce((sum, r) => sum + parseFloat(r.enumeratedArea || 0), 0)
      ).toFixed(2)
    }}
    label="Area (cents)"
    error={!!row.areaError}
    helperText={
      row.areaError || 
      `Remaining: ${(
        parseFloat(row.area || 0) - 
        keyplots
          .flatMap(k => k.rows)
          .filter(r => 
            r.village === row.village &&
            r.block === row.block &&
            r.svNo === row.svNo &&
            r.sub === row.sub &&
            !(r.b_id && r.b_id === row.b_id)
          )
          .reduce((sum, r) => sum + parseFloat(r.enumeratedArea || 0), 0)
      ).toFixed(2)} cents`
    }
  />


);

  })()}
</Grid>


       <Grid item xs={1}>
      {!(keyplot.label === "K" && rowIndex === 0) && (
  <Button 
    startIcon={<RemoveCircleOutlineIcon />}
    onClick={() => removeKeyplotRow(index, rowIndex,row.id)}  // Pass both indices
    size="small"
    variant="contained"
    color="error"
    
  >
  </Button>
  )}
</Grid>
<Grid item xs={1}>
{row.isExisting && (
  <Chip label="Saved" size="small" color="success" variant="outlined" />
)}</Grid>
    </React.Fragment>
  ))}

  {/* Action Buttons */}
  <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>

    <Button
      startIcon={<AddCircleOutlineIcon />}
      onClick={() => addKeyplotRow(index)}
      size="small"
      sx={{ mr: 1 }}
      variant="contained"
      color="success"
    >
      Add Row
    </Button>
   
    {/* <Button
      startIcon={<RemoveCircleOutlineIcon />}
      onClick={() => removeKeyplotRow(index)}
      size="small"
      variant="contained"
      color="error"
    >
      Remove Last Row
    </Button> */}
  </Grid>
</Grid>

                </Box>
            ))}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3, display: 'block', margin: '20px auto 0' }}
          onClick={handleSubmit}
        >
          Submit
        </Button>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          
        >
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

       <Snackbar open={snackbarOpen1} autoHideDuration={4000}  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={() => setSnackbarOpen1(false)}>
  <Alert onClose={() => setSnackbarOpen1(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>


            {/* --- Modal for adding a new row --- */}
   <Modal
  open={modalOpen}
  onClose={closeModal}
  aria-labelledby="add-row-modal-title"
  aria-describedby="add-row-modal-description"
>
  <Paper
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: { xs: '95%', sm: '90%', md: 600 },
      maxHeight: '90vh',
      overflowY: 'auto',
      bgcolor: 'background.paper',
      boxShadow: 24,
      p: 3,
      borderRadius: 2,
    }}
  >
    <Typography id="add-row-modal-title" variant="h6" component="h2" gutterBottom>
      ➕ Add New Side Plot Row
    </Typography>

    {/* SECTION 1: Plot Location */}
    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
      📍 Plot Location
    </Typography>

    <Grid container spacing={2}>
      {/* Village Field */}
      <Grid item xs={12}>
        <Autocomplete
          options={villageOptions}
          getOptionLabel={(option) => option.village || ''}
          value={
            modalRowData.village
              ? villageOptions.find((v) => v.villageId === modalRowData.village)
              : null
          }
          onChange={(event, newValue) => {
            handleModalInputChange(newValue ? newValue.villageId : null, 'village');
            setModalRowData((prev) => ({ ...prev, modalBlock: null, svNo: null }));
            setModalBlockOptions([]);
            setSvNoOptions([]);
            setSvNoDetails([]);
            setSelectedSvNos([]);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Village"
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{
                ...params.inputProps,
                maxLength: 15, // Limit to 15 characters
              }}
            />
          )}
        />
      </Grid>

      {/* Block Field */}
      <Grid item xs={12}>
        <Autocomplete
  options={modalBlockOptions}
  getOptionLabel={(option) => String(option)}
  value={modalRowData.modalBlock}
  onChange={(event, newValue) => {
    handleModalInputChange(newValue, 'modalBlock');

    setModalRowData((prev) => ({
      ...prev,
      svNo: null,
      resvnoStart: "",   // clear Resvno Start
      resvnoEnd: ""      // clear Resvno End
    }));

    setSvNoOptions([]);
    setSvNoDetails([]);
    setSelectedSvNos([]);
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Block"
      variant="outlined"
      size="small"
      fullWidth
      inputProps={{
        ...params.inputProps,
        maxLength: 5,
      }}
    />
  )}
  disabled={!modalRowData.village || modalBlockOptions.length === 0}
/>

      </Grid>

      {/* Resvno Start */}
      <Grid item xs={6}>
       <TextField
  label="Resvno Start"
  variant="outlined"
  size="small"
  type="text"
  inputMode="numeric"
  fullWidth
  value={modalRowData.resvnoStart || ''}
  onChange={(e) => {
    const value = e.target.value;
    // Allow empty OR digits only, max 5 digits, no leading 0
    if (value === '' || (/^[1-9][0-9]{0,4}$/.test(value))) {
      handleModalInputChange(value, 'resvnoStart');
    }
  }}
/>

      </Grid>

      {/* Resvno End */}
      <Grid item xs={6}>
       <TextField
  label="Resvno End"
  variant="outlined"
  size="small"
  type="text"
  inputMode="numeric"
  fullWidth
  value={modalRowData.resvnoEnd || ''}
  onChange={(e) => {
    const value = e.target.value;
    if (value === '' || (/^[1-9][0-9]{0,4}$/.test(value))) {
      handleModalInputChange(value, 'resvnoEnd');
    }
  }}
  error={!!resvnoError}
  helperText={resvnoError}
/>

      </Grid>
    </Grid>

    {/* SECTION 2: Reservation Selection */}
 {/* SECTION 2: Reservation Selection */}
<>
  <Divider sx={{ my: 2 }} />

  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
    ✅ Reservation Sub Numbers 
  </Typography>

<Box
  sx={{
    minHeight: 150,
    maxHeight: 450,
    px: 2,
    py: 1,
    border: '1px dashed #ccc',
    borderRadius: 2,
    backgroundColor: '#fafafa',
     overflowY: 'auto',   // ✅ allow vertical scroll
    overflowX: 'hidden', // Prevent container overflow
  }}
>
  {loadingResvno ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
      <CircularProgress size={30} />
    </Box>
  ) : svNoDetails.length > 0 ? (
    <>
      {/* Modal header actions: selectAll checkbox */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={selectAllChecked} onChange={handleSelectAll} />}
          label="Select all visible (only with remaining > 0)" 
        />
        <Typography variant="caption" color="text.secondary">{svNoDetails.length} results</Typography>
      </Box>

<Box sx={{ mb: 1 }}>
  <LinearProgress
    variant="determinate"
    value={Math.min((combinedTotal / maxcluster) * 100, 100)}
    sx={{
      height: 10,
      borderRadius: 5,
      backgroundColor: '#eee',
      '& .MuiLinearProgress-bar': {
        backgroundColor: combinedTotal > maxcluster ? 'error.main' : 'primary.main',
      },
    }}
  />
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
    <Typography variant="caption">
      {combinedTotal.toFixed(2)}c / {maxcluster}c
    </Typography>
    {combinedTotal > maxcluster && (
      <Typography variant="caption" color="error">
        Limit exceeded!
      </Typography>
    )}
  </Box>
</Box>




      {/* Virtualized list with fixed container */}
    <Box sx={{ flex: 1, minHeight: 150, maxHeight: 300 }}>
  <SvNoVirtualList />
</Box>

    </>
  ) : resvnoError ? (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '120px',
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
        alt="No Data"
        width={50}
        height={50}
        style={{ marginBottom: 8, opacity: 0.6 }}
      />
      <Typography variant="body1" fontWeight="bold" color="error">
        {resvnoError}
      </Typography>
      <Typography variant="body2">
        Please adjust the Resvno range and try again.
      </Typography>
    </Box>
  ) : null}
</Box>
</>


    {/* Action Buttons */}
    <Grid container justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
      <Grid item>
        <Button variant="outlined" color="secondary" onClick={closeModal}>
          Cancel
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={handleModalAddRow} disabled={combinedTotal === 0 || combinedTotal > maxcluster}>
          Add Row
        </Button>
      </Grid>
    </Grid>
  </Paper>
</Modal>


    
 <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This row is already saved. Do you want to delete it permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

{/* rejection box */}
<Dialog
  open={openRejectDialog}
  onClose={handleCloseRejectDialog}
  aria-labelledby="reject-dialog-title"
  fullWidth maxWidth="sm"
>
  <DialogTitle id="reject-dialog-title" sx={{backgroundColor:'#05307a',color:'white'}}>
    {"Reject Cluster"}
  </DialogTitle>
  <DialogContent>
    <DialogContentText sx={{pt:2}}>
      Please select a reason for rejecting this cluster.
    </DialogContentText>
    <FormControl component="fieldset" sx={{ mt: 2 }}>
      <RadioGroup
        aria-label="rejection-reason"
        name="rejection-reason-group"
        value={rejectReason}
        onChange={handleRejectReasonChange}
      >
        <FormControlLabel
          value="Cluster area is less than minimum requirement"
          control={<Radio />}
          label="Cluster not meeting minimum area"
        />
        <FormControlLabel
          value="Cluster area is more than maximum requirement"
          control={<Radio />}
          label="Cluster not meeting maximum area"
        />
        <FormControlLabel
          value="Cluster data is incorrect or invalid"
          control={<Radio />}
          label="Cluster not in here"
        />
        <FormControlLabel
          value="other"
          control={<Radio />}
          label="Other (Please specify)"
        />
      </RadioGroup>
    </FormControl>
    {rejectReason === 'other' && (
      <TextField
        autoFocus
        margin="dense"
        id="custom-reason"
        label="Custom Reason"
        type="text"
        fullWidth
        variant="outlined"
        value={customReason}
        onChange={(e) => setCustomReason(e.target.value)}
      />
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseRejectDialog} color="primary">
      Cancel
    </Button>
    <Button
      onClick={handleConfirmReject}
      color="error"
      variant="contained"
      disabled={!rejectReason || (rejectReason === 'other' && !customReason)}
    >
      Confirm Reject
    </Button>
  </DialogActions>
</Dialog>

            {/* --- End Modal --- */}

<Dialog open={openLimitDialog} onClose={() => setOpenLimitDialog(false)}>
 <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Box sx={{ color: dialogIconColor, display: "flex", alignItems: "center" }}>
      {dialogIcon}
    </Box>
    Confirm Action
  </Box>

  {/* Close Button */}
  <IconButton
    aria-label="close"
    onClick={() => setOpenLimitDialog(false)}
    sx={{ color: "grey.600" }}
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>


  <DialogContent>
    <DialogContentText>{limitMessage}</DialogContentText>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenLimitDialog(false)}>Cancel</Button>
    <Button
      variant="contained"
      color={confirmColor}
      onClick={() => {
        setOpenLimitDialog(false);
        doSubmit(pendingSidePlots, confirmLabel);
      }}
    >
      {confirmLabel}
    </Button>
  </DialogActions>
</Dialog>



        </Container>
        </Grid>
    );
};


export default ClusterForm;