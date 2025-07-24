import React, { useState, useEffect,useCallback ,useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import {
    Container, Typography, Grid, FormControlLabel, List,
    ListItemText, ListItem, Button, Box, TextField, Snackbar, Alert,FormControl,InputLabel,Select ,MenuItem,
    CircularProgress, Modal, Paper,FormGroup,Checkbox,Divider,Chip,Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, // Import Modal and Paper for the modal
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types'; // For ListboxComponent prop-types

import authservice from 'pages/authentication/services/authservice';

import { FixedSizeList } from 'react-window';


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
 const [selectAllChecked, setSelectAllChecked] = useState(false);
const [resvnoError, setResvnoError] = useState('');
const [loadingResvno, setLoadingResvno] = useState(false);



  const [keyplotDetails, setKeyplotDetails] = useState({
    villageBlock: '',
    panchayath: '',
    syNo: '',
    areaCents: '',
    landType: ''
  });

  // Inside your ClusterForm component, or as a constant outside if preferred
const sidePlotLabelOptions = [
  'N', 'E', 'S', 'W', 'N1', 'E1', 'S1', 'W1', 'N2', 'E2', 'S2', 'W2'
  // Add more as needed
];
    // Structure for storing side plot rows for each direction (N, E, S, W)
    const [keyplots, setKeyplots] = useState([
        { id: 'K', label: 'K', rows: [] },
        { id: 'N', label: 'N', rows: [] }, // Initialize with empty rows
        { id: 'E', label: 'E', rows: [] },
        { id: 'S', label: 'S', rows: [] },
        { id: 'W', label: 'W', rows: [] },
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

    // Effect 2: Fetch all village data for the modal's village/block dropdowns
    // This runs only once on component mount
    useEffect(() => {
        const fetchAllVillageDataForModal = async () => {
            setLoading(true);
            try {
                const userid = authservice.userid();
                  const token = localStorage.getItem('token');
                const response = await fetch(`http://10.10.32.45:8080/btr-service/cluster-api/${userid}/villages`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllVillageData(data); // Store the full data for filtering blocks
               setVillageOptions(data); // full objects, not just names
              setLoading(false);
                console.log("village datas   ",data)// Extract village names for Autocomplete
            } catch (error) {
                console.error("Failed to fetch village data for modal:", error);
                // Handle error (e.g., show a toast message)
            }
        };

        fetchAllVillageDataForModal();
    }, []); // Empty dependency array: runs only once on mount
const handleSvNoSelection = (uniqueId) => { // uniqueId will be like "20-1" or the plotId
  setSelectedSvNos((prevSelected) =>
    prevSelected.includes(uniqueId)
      ? prevSelected.filter((id) => id !== uniqueId)
      : [...prevSelected, uniqueId]
  );
};

    // Api for Svno
    // --- API Fetching Functions ---
    // Fetches details for the main keyplot (used in initial load)
    const fetchKeyplotDetails = async (id) => {
    if (!id) return;
 setLoading(true);
    try {
          const token = localStorage.getItem('token');
        const response = await fetch(`http://10.10.32.45:8080/btr-service/key-plots/get-keyplot/${id}`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDefaultBlock(data.payload.villageBlock);
        setDefaultVillageId(data.payload.kvillageId);
        setDefaultVillage(data.payload.kvillageName);

        if (data.payload) {
            setKeyplotDetails(data.payload);

            // Prepare a map of existing side plots from the response
            const existingSidePlots = {};
            if (Array.isArray(data.payload.sidePlots)) {
                data.payload.sidePlots.forEach(sp => {
                    const directionKey = sp.label[0]; // e.g., 'N' from 'N2'
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
            // Ensure exactly N, E, S, W side plots exist (override if present)
            const defaultDirections = ['K','N', 'E', 'S', 'W'];
            const mergedKeyplots = defaultDirections.map(dir => {
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
                `http://10.10.32.45:8080/btr-service/cluster-api/${currentSyNo}/plot-details?resvno=${resvno}&resbdno=${resbdno}`,
              {
              headers: {
                  'Authorization': `Bearer ${token}` // Add token in Authorization header
              }
                });
            
            alert("ok")
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Plot details response:", data);

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
    } else {
      setResvnoError(""); // Clear error
      // ✅ Only call API when valid
      const kpId = keyplotId;
      const url = `http://10.10.32.45:8080/btr-service/cluster-api/${kpId}/resbdnos-by-village-block?villageId=${newState.village}&blockCode=${newState.modalBlock}&resvnoStart=${updatedStart}&resvnoEnd=${updatedEnd}`;
        const token = localStorage.getItem('token');
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
    `http://10.10.32.45:8080/btr-service/cluster-api/delete-sideplot/${rowData.b_id}`,
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
      handleCloseConfirmDialog(); // Close dialog even on error
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
      console.log("vvv")
  const detail = svNoDetails.find(d => 
    d.resvno.toString() === resvno.toString() && 
    d.resbdno.toString() === resbdno.toString()
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

  const villageName = villageOptions.find(v => v.villageId === modalRowData.village)?.village || '';
  const modalBlock = modalRowData.modalBlock;
  const newRows = [];

  if (svNoDetails.length > 0 && selectedSvNos.length > 0) {
    selectedSvNos.forEach((selectedId) => {
      const [resvno, resbdno] = selectedId.split('-');
      const detail = svNoDetails.find(d => 
        d.resvno.toString() === resvno && 
        d.resbdno.toString() === resbdno
      );

      if (detail) {
        const remainingArea = getRemainingArea(
          modalRowData.village,
          modalBlock,
          resvno,
          resbdno
        );

        if (remainingArea > 0) {
          newRows.push({
            village: modalRowData.village,
            villageName,
            block: modalBlock,
            svNo: resvno,
            sub: resbdno,
            area: detail.area,
            enumeratedArea: remainingArea.toFixed(2),
            plot_id: detail.plotId.toString(),
            isExisting: false,
            isPending: true // Mark as pending
          });
        }
      }
    });
  }

  if (newRows.length === 0) {
    setSnackbarMessage(
      selectedSvNos.length > 0 
        ? "Selected plots already exist or data is invalid." 
        : "Please select at least one plot."
    );
    setSnackbarOpen(true);
    return;
  }

  // Only update keyplots state
  setKeyplots(prevKeyplots => {
    const updated = [...prevKeyplots];
    updated[selectedKeyplotIndex].rows = [
      ...updated[selectedKeyplotIndex].rows,
      ...newRows
    ];
    return updated;
  });

  // Reset modal
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
const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Validate total cluster area
 const overallTotalAreaCents = parseFloat(calculateOverallTotalArea()); // in cents

// This comes from admin or backend config (e.g., 5 acres)
const adminDefinedAcres = 5;

// Dynamically calculate limits
const minAllowedCents = (adminDefinedAcres - 1) * 100;
const maxAllowedCents = (adminDefinedAcres + 1) * 100;

const rowsToSubmit = keyplots.flatMap(k => k.rows).filter(row => !row.isPending);

// if (overallTotalAreaCents < minAllowedCents || overallTotalAreaCents > maxAllowedCents) {
//     const totalAreaAcres = (overallTotalAreaCents / 100).toFixed(2);
//     setSnackbarMessage(
//         `Total area (${totalAreaAcres} acres) must be between ${adminDefinedAcres - 1} and ${adminDefinedAcres + 1} acres.`
//     );
//     setSnackbarOpen(true);
//     return;
// }
const totalAreaAcres = (overallTotalAreaCents / 100).toFixed(2);
if (overallTotalAreaCents > 600) { // 600 cents = 6 acres
    setSnackbarMessage(`Total area (${totalAreaAcres} acres) must not exceed 6 acres.`);
    setSnackbarOpen(true);
    return;
}


    const sidePlotsToSubmit = [];
    let hasValidationError = false;

    // Track total used area per plot (village+block+svNo+sub)
    const plotUsageMap = new Map();

    // First pass: Calculate total usage for each plot
    keyplots.forEach(keyplot => {
        keyplot.rows.forEach(row => {
            if (!row.plot_id) return;

            const plotKey = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
            const currentUsage = parseFloat(row.enumeratedArea || 0);
            
            if (plotUsageMap.has(plotKey)) {
                plotUsageMap.set(plotKey, plotUsageMap.get(plotKey) + currentUsage);
            } else {
                plotUsageMap.set(plotKey, currentUsage);
            }
        });
    });

    // Second pass: Validate each row
    for (const keyplot of keyplots) {
        const filteredRows = [];
        
        for (const row of keyplot.rows) {
            // Skip rows without plot_id
            if (!row.plot_id) continue;

            const enumeratedArea = parseFloat(row.enumeratedArea || 0);
            const plotKey = `${row.village}-${row.block}-${row.svNo}-${row.sub}`;
            const totalUsedArea = plotUsageMap.get(plotKey) || 0;
            const plotArea = parseFloat(row.area || 0);

            // Basic validations
            if (row.enumeratedArea === '' || isNaN(enumeratedArea)) {
              setKeyplots(prevKeyplots =>
  prevKeyplots.map((kp, kpIndex) => {
    if (kpIndex !== keyplots.indexOf(keyplot)) return kp;

    const updatedRows = kp.rows.map((r, rIdx) => {
      if (
        r.village === row.village &&
        r.block === row.block &&
        r.svNo === row.svNo &&
        r.sub === row.sub
      ) {
        return { ...r, areaError: "Please enter a valid Actual Area" };
      }
      return r;
    });

    return { ...kp, rows: updatedRows };
  })
);
setSnackbarMessage(`Please enter a valid 'Actual Area' for Sv.No: ${row.svNo}/${row.sub} in ${keyplot.label}.`);
setSnackbarOpen(true);
hasValidationError = true;
break;
            }

            if (enumeratedArea <= 0) {
                setSnackbarMessage(`Area must be greater than 0 for Sv.No: ${row.svNo}/${row.sub}.`);
                setSnackbarOpen(true);
                hasValidationError = true;
                break;
            }

            // Validate against total plot area
            if (totalUsedArea > plotArea) {
                setSnackbarMessage(
                    `Total enumerated area (${totalUsedArea.toFixed(2)}) exceeds plot area (${plotArea.toFixed(2)}) ` +
                    `for ${row.svNo}/${row.sub}. Please reduce by ${(totalUsedArea - plotArea).toFixed(2)} cents.`
                );
                setSnackbarOpen(true);
                hasValidationError = true;
                break;
            }

            // If validation passes, add to submission
            filteredRows.push({
                actual: enumeratedArea.toFixed(2),
                plot_id: row.plot_id,
            });
        }

        if (hasValidationError) break;

        if (filteredRows.length > 0) {
            sidePlotsToSubmit.push({
                label: keyplot.label,
                rows: filteredRows,
            });
        }
    }

    if (hasValidationError) return;

    if (sidePlotsToSubmit.length === 0) {
        setSnackbarMessage('No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.');
        setSnackbarOpen(true);
        return;
    }

    // Prepare payload
    const payload = {
        userId: authservice.userid(),
        keyplotId: syNo,
        clusterNo: parseInt(slNo, 10),
        sidePlots: sidePlotsToSubmit,
    };

    console.log('Submitting payload:', payload);

    try {
          const token = localStorage.getItem('token');
        const response = await fetch('http://10.10.32.45:8080/btr-service/cluster-api/save-cluster', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Add token here
    },
    body: JSON.stringify(payload),
});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    setSnackbarMessage('Form submitted successfully!');
    setSnackbarOpen1(true);
    setPendingRows([]); // Clear pending rows after successful submission
    console.log('API response:', result);
    
  } catch (error) {
    console.error('Error submitting form:', error);
    setSnackbarMessage(`Failed to submit form: ${error.message}`);
    setSnackbarOpen(true);
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
    if (svNoDetails.length > 0 && selectedSvNos.length === svNoDetails.length) {
      setSelectAllChecked(true);
    } else {
      setSelectAllChecked(false);
    }
  }, [svNoDetails, selectedSvNos]);

const handleSelectAll = (event) => {
  const checked = event.target.checked;
  setSelectAllChecked(checked);
  
  if (checked) {
    // Only select plots with remaining area
    const allSelectableIds = svNoDetails
      .filter(item => {
        const remaining = getRemainingArea(
          modalRowData.village,
          modalRowData.modalBlock,
          item.resvno.toString(),
          item.resbdno.toString()
        );
        return remaining > 0;
      })
      .map(item => `${item.resvno}-${item.resbdno}`);
    
    setSelectedSvNos(allSelectableIds);
  } else {
    setSelectedSvNos([]);
  }
};
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
    backgroundColor: 'rgb(245, 194, 194)',
    p: 1.5,
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    borderBottom: '1px solid #e0e0e0',
    width: 'auto',
    minWidth: '300px',
    
  }}>
    <Typography variant="subtitle1" fontWeight="bold">
      Cluster: {slNo || 'Not Available'} | {keyplotDetails.panchayath || ''}
    </Typography>
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography variant="subtitle1">
        <strong>Total Area:</strong> {calculateOverallTotalActual()} Cent
      </Typography>
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
            <TextField label="LocalBody Name" value={keyplotDetails.panchayath || ''} InputProps={{ readOnly: true }} fullWidth />
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
            <TextField label="TOTAL ACTUAL AREA (Cent)" value={calculateOverallTotalActual()} InputProps={{ readOnly: true }} fullWidth/>
          </Grid>
        </Grid>

            {keyplots.map((keyplot, index) => (
                <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
                    <Box sx={{ bgcolor: '#05307a', color: 'white', p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
    <Typography sx={{ mr: 1 }}>SIDE PLOT:</Typography>
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
        <FormControl variant="outlined" size="small" sx={{ width: '100px', bgcolor: 'transparent', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}>
            <InputLabel id={`side-plot-label-${keyplot.id}`} sx={{ color: 'white' }}>Label</InputLabel>
            <Select
                labelId={`side-plot-label-${keyplot.id}`}
                value={keyplot.label}
                label="Label"
                onChange={(e) => handleKeyplotLabelChange(e, index)}
                sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiSelect-icon': { color: 'white' } // Color of the dropdown arrow
                }}
            >
                {sidePlotLabelOptions.map((option) => (
                    <MenuItem key={option} value={option}>
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
  <Grid item xs={3}> <Typography fontWeight="bold">Total Area - Actual</Typography> </Grid>
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
       {keyplot.label !== "K" && (
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
{keyplot.label !== "K" && (
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
    )}
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
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          
        >
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

             <Snackbar
          open={snackbarOpen1}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
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
                // When village changes, reset block and svNo
                setModalRowData((prev) => ({ ...prev, modalBlock: null, svNo: null }));
                setModalBlockOptions([]); // Clear block options
                setSvNoOptions([]); // Clear svNo options
                setSvNoDetails([]); // Clear svNo details
                setSelectedSvNos([]); // Clear selected svNos
              }}
              renderInput={(params) => (
                <TextField {...params} label="Village" variant="outlined" size="small" fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              options={modalBlockOptions}
              getOptionLabel={(option) => String(option)}
              value={modalRowData.modalBlock}
              onChange={(event, newValue) => {
                handleModalInputChange(newValue, 'modalBlock');
                // When block changes, reset svNo
                setModalRowData((prev) => ({ ...prev, svNo: null }));
                setSvNoOptions([]); // Clear svNo options
                setSvNoDetails([]); // Clear svNo details
                setSelectedSvNos([]); // Clear selected svNos
              }}
              renderInput={(params) => (
                <TextField {...params} label="Block" variant="outlined" size="small" fullWidth />
              )}
              disabled={!modalRowData.village || modalBlockOptions.length === 0}
            />
          </Grid>

<Grid item xs={6}>
  <TextField
    label="Resvno Start"
    variant="outlined"
    size="small"
    type="number"
    fullWidth
    value={modalRowData.resvnoStart || ''}
    onChange={(e) => handleModalInputChange(e.target.value, 'resvnoStart')}
  />
</Grid>

<Grid item xs={6}>
  <TextField
  label="Resvno End"
  variant="outlined"
  size="small"
  type="number"
  fullWidth
  value={modalRowData.resvnoEnd || ''}
  onChange={(e) => handleModalInputChange(e.target.value, 'resvnoEnd')}
  error={!!resvnoError}
  helperText={resvnoError}
/>

</Grid>

          {/* <Grid item xs={12}>
            <Autocomplete
              options={svNoOptions.map(String)}
              getOptionLabel={(option) => String(option)}
              value={modalRowData.svNo ? String(modalRowData.svNo) : null}
              onChange={(event, newValue) => handleModalInputChange(newValue, 'svNo')}
              renderInput={(params) => (
                <TextField {...params} label="Survey No" variant="outlined" size="small" fullWidth />
              )}
            />
          </Grid> */}
        </Grid>

        {/* SECTION 2: Reservation Selection */}
<>
  <Divider sx={{ my: 2 }} />

  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
    ✅ Reservation Sub Numbers
  </Typography>

  <Box sx={{ minHeight: 150, px: 2, py: 1, border: '1px dashed #ccc', borderRadius: 2 }}>
    {loadingResvno ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <CircularProgress size={30} />
      </Box>
    ) : svNoDetails.length > 0 ? (
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={selectAllChecked} onChange={handleSelectAll} />}
          label="Select All"
        />
        {svNoDetails.map((item) => {
          const uniqueId = `${item.resvno}-${item.resbdno}`;
          const remainingArea = getRemainingArea(
            modalRowData.village,
            modalRowData.modalBlock,
            item.resvno,
            item.resbdno
          );

          if (remainingArea <= 0) return null;

          return (
            <FormControlLabel
              key={uniqueId}
              control={
                <Checkbox
                  checked={selectedSvNos.includes(uniqueId)}
                  onChange={() => handleSvNoSelection(uniqueId)}
                  disabled={remainingArea <= 0}
                />
              }
              label={`${item.resvno}/${item.resbdno} — ${item.area} cents (Remaining: ${remainingArea.toFixed(2)} cents)`}
            />
          );
        })}
      </FormGroup>
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
            <Button variant="contained" onClick={handleModalAddRow} disabled={isAddButtonDisabled()}>
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

            {/* --- End Modal --- */}
        </Container>
        </Grid>
    );
};



export default ClusterForm;