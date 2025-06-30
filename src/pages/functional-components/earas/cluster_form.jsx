import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';
import {
  Container,
  Typography,
  Grid,
  FormControlLabel,
  List,
  ListItemText,
  ListItem,
  Button,
  Box,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Modal,
  Paper,
  FormGroup,
  Checkbox,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle // Import Modal and Paper for the modal
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
  const BTR_URL = mainapi.BTR_API
  const { children, ...other } = props;
  const itemData = [];
  children &&
    Array.isArray(children) &&
    children.forEach((item) => {
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
        {({ index, style }) => <div style={style}>{itemData[index]}</div>}
      </FixedSizeList>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node
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

  const [keyplotDetails, setKeyplotDetails] = useState({
    villageBlock: '',
    panchayath: '',
    syNo: '',
    areaCents: '',
    landType: ''
  });

  // Structure for storing side plot rows for each direction (N, E, S, W)
  const [keyplots, setKeyplots] = useState([
    { id: 'N', label: 'N', rows: [] }, // Initialize with empty rows
    { id: 'E', label: 'E', rows: [] },
    { id: 'S', label: 'S', rows: [] },
    { id: 'W', label: 'W', rows: [] }
  ]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
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
    village: null, // Selected village name in modal
    modalBlock: null, // Selected block code in modal
    svNo: null, // Selected survey number in modal
    sub: '', // Selected sub-division in modal
    block: '', // Block from plot details API (read-only)
    area: '', // Area from plot details API (read-only)
    actual: '', // User-entered actual area in modal
    subOptions: [], // Options for the 'sub' dropdown in modal
    plot_id: '' // plot_id from plot details API
  });

  // Options for modal's village and block dropdowns
  // These will be populated from API
  const [villageOptions, setVillageOptions] = useState([]);
  const [modalBlockOptions, setModalBlockOptions] = useState([]);

  // --- New state to store all fetched village data ---
  const [allVillageData, setAllVillageData] = useState([]);
  const [keyplotId, setKeyplotId] = useState('');
  // --- Effects (API Calls and Data Processing) ---

  // Effect 1: Initial data fetching (Keyplot details, Sv.No options for main form)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const syNoFromURL = urlParams.get('No');
    const slnoFromURL = urlParams.get('slno');
    setKeyplotId(syNoFromURL);
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
        await Promise.all([fetchKeyplotDetails(syNoFromURL), fetchSvNoOptions(syNoFromURL)]);
      } catch (error) {
        console.error('Error fetching all initial data:', error);
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
      try {
        const userid = authservice.userid();

        const response = await fetch(`${BTR_URL}/btr-service/cluster-api/${userid}/villages`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllVillageData(data); // Store the full data for filtering blocks
        setVillageOptions(data); // full objects, not just names

        console.log(data); // Extract village names for Autocomplete
      } catch (error) {
        console.error('Failed to fetch village data for modal:', error);
        // Handle error (e.g., show a toast message)
      }
    };

    fetchAllVillageDataForModal();
  }, []); // Empty dependency array: runs only once on mount
  const handleSvNoSelection = (resbdno) => {
    setSelectedSvNos((prevSelected) =>
      prevSelected.includes(resbdno) ? prevSelected.filter((id) => id !== resbdno) : [...prevSelected, resbdno]
    );
  };

  // Api for Svno
  useEffect(() => {
    const fetchSvNoOptions = async () => {
      if (modalRowData.village && modalRowData.modalBlock) {
        try {
          const response = await fetch(
            `${BTR_URL}/btr-service/cluster-api/${keyplotId}/resvnos?villageId=${modalRowData.village}&blockCode=${modalRowData.modalBlock}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch Sv.No options');
          }

          const data = await response.json();
          setSvNoOptions(data); // e.g., [12, 14, 15, ...]
        } catch (error) {
          console.error('Error fetching Sv.No options:', error);
          setSvNoOptions([]);
        }
      }
    };

    fetchSvNoOptions();
  }, [modalRowData.village, modalRowData.modalBlock]);

  // --- API Fetching Functions ---

  // Fetches details for the main keyplot (used in initial load)
  const fetchKeyplotDetails = async (id) => {
    if (!id) return;

    try {
      const response = await fetch(`${BTR_URL}/btr-service/key-plots/get-keyplot/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('get key plots ', data);

      if (data.payload) {
        setKeyplotDetails(data.payload);

        // Prepare a map of existing side plots from the response
        const existingSidePlots = {};
        if (Array.isArray(data.payload.sidePlots)) {
          data.payload.sidePlots.forEach((sp) => {
            const directionKey = sp.label[0]; // e.g., 'N' from 'N2'
            existingSidePlots[directionKey] = {
              id: sp.label,
              label: sp.label,
              rows: (sp.rows || []).map((row) => ({
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

        // Ensure exactly N, E, S, W side plots exist (override if present)
        const defaultDirections = ['N', 'E', 'S', 'W'];
        const mergedKeyplots = defaultDirections.map((dir) => {
          return (
            existingSidePlots[dir] || {
              id: dir,
              label: dir,
              rows: []
            }
          );
        });

        setKeyplots(mergedKeyplots);

        // Parse syNo like "385/4"
        const ssyNo = data.payload.syNo;
        if (ssyNo) {
          const [mainNo, subNo] = ssyNo.split('/');
          setKeyplotMainSvNo(mainNo);
          setKeyplotSubNo(subNo || '');
        }
      }
    } catch (error) {
      console.error('Error fetching keyplot details:', error);
      throw error;
    }
  };

  // Fetches Sv.No options for the main form (not directly used by modal inputs)
  const fetchSvNoOptions = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`${BTR_URL}/btr-service/cluster-api/${id}/resvnos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.resvnos) {
        // Filter out the keyplot's own Sv.No from the list if it exists
        const filteredOptions = data.resvnos.map(String).filter((option) => option !== id);
        setSvNoOptions(filteredOptions);
      } else {
        setSvNoOptions([]);
      }
    } catch (error) {
      console.error('Error fetching Sv.No options:', error);
      throw error; // Re-throw to be caught by fetchAllInitialData
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalRowData({
      /* reset fields */
    });
    setSvNoDetails([]);
    setSelectedSvNos([]);
    setSelectedKeyplotIndex(null);
  };

  const fetchResbdnos = async (villageId, blockCode, resvno) => {
    try {
      const response = await fetch(
        `${BTR_URL}/btr-service/cluster-api/${syNo}/resbdnos-by-village-block?villageId=${villageId}&blockCode=${blockCode}&resvno=${resvno}`
      );
      const data = await response.json();
      console.log('Btr >>>>>  ', data.resbdnoDetails);
      setSvNoDetails(data.resbdnoDetails);
    } catch (error) {
      console.error('Error fetching Sv.No details:', error);
    }
  };

  // Fetches Plot Details (Block, Area, plot_id) for a given Sv.No and Sub (used by modal's Sub dropdown)
  const fetchPlotDetails = async (currentSyNo, resvno, resbdno) => {
    if (!currentSyNo || !resvno || !resbdno) {
      setModalRowData((prev) => ({ ...prev, block: '', area: '', plot_id: '' }));
      return;
    }
    try {
      const response = await fetch(
        `${BTR_URL}/btr-service/cluster-api/${currentSyNo}/plot-details?resvno=${resvno}&resbdno=${resbdno}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Plot details response:', data);

      setModalRowData((prev) => ({
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
      setModalRowData((prev) => ({ ...prev, block: '', actual: '', area: '', plot_id: '' }));
    }
  };

  // --- Event Handlers and Functions ---

  // Handles changes in the main keyplot label (N, E, S, W)
  const handleKeyplotLabelChange = (event, index) => {
    const newKeyplots = [...keyplots];
    newKeyplots[index].label = event.target.value.toUpperCase().slice(0, 4);
    setKeyplots(newKeyplots);
  };

  // This function is less relevant now as actual row data input happens in the modal.
  // It's kept for completeness but might be removed or refactored if direct row editing is not needed.
  const handleKeyplotRowChange = (newValue, keyplotIndex, rowIndex, field) => {
    console.warn(
      'handleKeyplotRowChange is less relevant now as row inputs are in modal. Consider refactoring if direct row editing is needed.'
    );
    // Example: If you had an edit button that loads existing row data into modal,
    // this function could be used to update the main keyplots state after modal submission.
  };

  // --- Main handler for all input changes in the Modal Form ---
  // This is a crucial function for updating modalRowData and triggering dependent fetches/updates.
  const handleModalInputChange = useCallback(
    (value, field) => {
      console.log('Changing field:', field, 'to value:', value);

      setModalRowData((prev) => {
        let newState = { ...prev, [field]: value };

        if (field === 'village') {
          const selectedVillage = allVillageData.find((v) => v.villageId === value);
          if (selectedVillage) {
            setModalBlockOptions(selectedVillage.blocks.map((b) => b.blockCode));
            newState = {
              ...newState,
              modalBlock: null,
              svNo: null,
              sub: '',
              block: '',
              area: '',
              actual: '',
              plot_id: '',
              subOptions: []
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
              subOptions: []
            };
            setSvNoDetails([]);
            setSelectedSvNos([]);
          }
        } else if (field === 'modalBlock') {
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
        } else if (field === 'svNo') {
          newState = { ...newState, sub: '', block: '', area: '', actual: '', plot_id: '' };
          setSvNoDetails([]);
          setSelectedSvNos([]);
          if (newState.village && newState.modalBlock && value) {
            const kpId = keyplotId; // Replace with dynamic if needed
            const url = `${BTR_URL}/btr-service/cluster-api/${kpId}/resbdnos-by-village-block?villageId=${newState.village}&blockCode=${newState.modalBlock}&resvno=${value}`;

            fetch(url)
              .then((res) => res.json())
              .then((data) => {
                setSvNoDetails(data.resbdnoDetails || []);
                console.log(' btr  >>> ', data.resbdnoDetails);
                setSelectedSvNos([]); // Clear previous selection
              })
              .catch((error) => {
                console.error('Error fetching resbdno details:', error);
                setSvNoDetails([]);
              });
          }
        } else if (field === 'sub') {
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
        } else if (field === 'actual') {
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
    },
    [syNo, allVillageData]
  );

  // Dependencies for useCallback

  // Handler to open the Add Row modal
  const addKeyplotRow = (keyplotIndex) => {
    setSelectedKeyplotIndex(keyplotIndex);
    setCurrentKeyplotIndex(keyplotIndex); // Store which N, E, S, W section we're adding to
    setModalRowData({
      // Reset modal data for a fresh entry
      village: null,
      modalBlock: null,
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
      rowData: keyplots[keyplotIndex].rows[rowIndexToRemove]
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
      const response = await fetch(`${BTR_URL}/btr-service/cluster-api/delete-sideplot/${rowData.b_id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete row from server');

      // Remove row from UI after successful deletion
      setKeyplots((prevKeyplots) =>
        prevKeyplots.map((keyplot, idx) => {
          if (idx === keyplotIndex) {
            const newRows = keyplot.rows.filter((_, rIdx) => rIdx !== rowIndexToRemove);
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
            const newRows = keyplot.rows.filter((_, rIdx) => rIdx !== rowIndexToRemove);
            return { ...keyplot, rows: newRows };
          }
          return keyplot;
        })
      );
    }
  };

  // Handler to add a new row from the modal to the main keyplots state
  const handleModalAddRow = () => {
    console.log('Selected Keyplot Index:', selectedKeyplotIndex);
    if (selectedKeyplotIndex === null) return;

    const villageName = villageOptions.find((v) => v.villageId === modalRowData.village)?.village || '';
    const modalBlock = modalRowData.modalBlock;
    const svNo = modalRowData.svNo;
    const sub = modalRowData.sub;

    const currentRows = keyplots[selectedKeyplotIndex].rows;

    // 🛑 Duplicate check
    const isDuplicate = currentRows.some(
      (row) => row.villageName === villageName && row.block === modalBlock && row.svNo === svNo && row.sub === sub
    );

    if (isDuplicate) {
      setSnackbarMessage('This sideplot row already exists!');
      setSnackbarOpen(true);
      return;
    }

    const newRows = [];

    // ✅ If checkbox mode (resbdno list)
    if (svNoDetails.length > 0 && selectedSvNos.length > 0) {
      selectedSvNos.forEach((resbdno) => {
        const detail = svNoDetails.find((d) => d.resbdno === resbdno);
        if (detail) {
          const duplicate = currentRows.some(
            (row) => row.villageName === villageName && row.block === modalBlock && row.svNo === svNo && row.sub === resbdno
          );
          if (!duplicate) {
            console.log('if >> ', detail.plotId);
            newRows.push({
              village: modalRowData.village,
              villageName,
              block: modalBlock,
              svNo,
              sub: resbdno, // treat resbdno as sub
              area: detail.area,
              actual: detail.area,
              plot_id: detail.plotId
            });
          }
        }
      });
    } else {
      // ✅ Manual entry mode
      newRows.push({
        village: modalRowData.village,
        villageName,
        block: modalBlock,
        svNo,
        sub,
        area: modalRowData.area,
        actual: modalRowData.actual
      });
    }

    if (newRows.length === 0) {
      setSnackbarMessage('No valid new rows to add (maybe duplicates?)');
      setSnackbarOpen(true);
      return;
    }

    // ✅ Add to keyplot
    const updatedKeyplots = [...keyplots];
    updatedKeyplots[selectedKeyplotIndex].rows.push(...newRows);
    setKeyplots(updatedKeyplots);

    // ✅ Reset modal
    setModalRowData({
      village: null,
      modalBlock: null,
      svNo: null,
      sub: '',
      block: '',
      area: '',
      actual: '',
      plot_id: '',
      subOptions: []
    });
    setSvNoDetails([]);
    setSelectedSvNos([]);
    setSelectedKeyplotIndex(null);
    setModalOpen(false);
  };

  const isResbdnoAlreadyAdded = (resbdno) => {
    if (selectedKeyplotIndex === null) return false;
    const currentRows = keyplots[selectedKeyplotIndex].rows;
    return currentRows.some(
      (row) =>
        row.village === modalRowData.village &&
        row.block === modalRowData.modalBlock &&
        row.svNo === modalRowData.svNo &&
        row.sub === resbdno
    );
  };

  const isAddButtonDisabled = () => {
    if (svNoDetails.length > 0) return selectedSvNos.length === 0;
    return !modalRowData.svNo || !modalRowData.actual;
  };

  // Handler for blurring the 'actual' area input (if you have one outside the modal)
  // For the modal, this could be handled by `handleModalInputChange` or before `handleModalAddRow`
  const handleAreaInputBlur = (keyplotIndex) => {
    // This function was originally for direct input fields in the main form.
    // With modal, actual area formatting should occur within the modal's context or on submission.
    // If you keep direct input fields in the main form, this would still apply to them.
    console.log('handleAreaInputBlur called. Consider if still needed with modal.');
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
    keyplots.forEach((keyplot) => {
      total += parseFloat(calculateTotalActual(keyplot.rows));
    });
    return total.toFixed(2);
  };

  // Calculate overall total area in Ares across all side plots
  const calculateOverallTotalArea = () => {
    let totalCents = 0;
    keyplots.forEach((keyplot) => {
      totalCents += keyplot.rows.reduce((sum, row) => sum + parseFloat(row.enumeratedArea || 0), 0);
    });
    const totalAres = totalCents * 0.00404686;
    return totalAres.toFixed(2);
  };

  // Handles the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    const overallTotalAreaAres = parseFloat(calculateOverallTotalArea());
    const maxAllowedAreaAres = 5.0;

    if (overallTotalAreaAres > maxAllowedAreaAres) {
      setSnackbarMessage(`Overall Total Area (${overallTotalAreaAres} ares) cannot exceed ${maxAllowedAreaAres} ares.`);
      setSnackbarOpen(true);
      return;
    }

    const sidePlotsToSubmit = [];
    let hasValidationError = false;

    // Iterate through each keyplot and its rows for comprehensive validation
    for (const keyplot of keyplots) {
      const filteredRows = [];
      for (const row of keyplot.rows) {
        // Check for valid plot_id
        if (!row.plot_id) {
          // If a plot_id is expected (e.g., for an existing row or a user-intended new row),
          // but it's missing, you might want to show an error.
          // For now, we'll just skip rows without plot_id for submission.
          // You could add a specific snackbar message here if needed:
          // setSnackbarMessage(`Missing Sv.No/Sub. for a row in ${keyplot.label}`);
          // setSnackbarOpen(true);
          // hasValidationError = true;
          // break; // Break from inner loop if you want to stop processing this keyplot
          continue; // Skip this row if plot_id is missing
        }

        const enumeratedArea = parseFloat(row.enumeratedArea);

        // Validation for enumeratedArea
        if (row.enumeratedArea === '' || isNaN(enumeratedArea) || enumeratedArea <= 0) {
          // This condition handles:
          // 1. Empty enumeratedArea
          // 2. Non-numeric enumeratedArea
          // 3. Zero or negative enumeratedArea (optional, based on your business logic)

          setSnackbarMessage(`Please enter a valid 'Actual Area' for Sv.No: ${row.plot_id} in ${keyplot.label}.`);
          setSnackbarOpen(true);
          hasValidationError = true;
          break; // Stop validating this keyplot if an invalid row is found
        }

        // If validation passes, add the row to filteredRows
        filteredRows.push({
          actual: enumeratedArea.toFixed(2),
          plot_id: row.plot_id
        });
      }

      if (hasValidationError) {
        return; // Stop the entire submission if any validation error occurred
      }

      if (filteredRows.length > 0) {
        sidePlotsToSubmit.push({
          label: keyplot.label,
          rows: filteredRows
        });
      }
    }

    if (sidePlotsToSubmit.length === 0) {
      setSnackbarMessage(
        'No valid side plots found to submit. Please ensure Sv.No, Sub, and Actual Area are filled for at least one row in a side plot.'
      );
      setSnackbarOpen(true);
      return;
    }

    const payload = {
      keyplotId: syNo,
      clusterNo: parseInt(slNo, 10),
      sidePlots: sidePlotsToSubmit // Use the validated and prepared sidePlotsToSubmit
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${BTR_URL}/btr-service/cluster-api/save-cluster`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSnackbarMessage('Form submitted successfully!');
      setSnackbarOpen(true);
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
  };
  const handleEnumeratedAreaChange = (value, keyplotIndex, rowIndex) => {
    const newArea = parseFloat(value);

    if (newArea < 0) {
      setSnackbarMessage('Negative values are not allowed.');
      setSnackbarOpen(true);
      return;
    }

    // Validate against actual area
    const actual = parseFloat(keyplots[keyplotIndex].rows[rowIndex].actual || 0);
    if (actual && newArea > actual) {
      setSnackbarMessage('Area for Enumerated cannot exceed Actual area.');
      setSnackbarOpen(true);
      return;
    }

    // Update state
    setKeyplots((prevKeyplots) =>
      prevKeyplots.map((keyplot, idx) => {
        if (idx === keyplotIndex) {
          const updatedRows = [...keyplot.rows];
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            enumeratedArea: value
          };
          return { ...keyplot, rows: updatedRows };
        }
        return keyplot;
      })
    );
  };

  // --- Loading State (before JSX) ---
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading cluster data...
        </Typography>
      </Container>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Container maxWidth="xl" sx={{ mt: 4, bgcolor: '#f4f4f9', p: 3, borderRadius: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
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
            <TextField label="പഞ്ചായത്ത്" value={keyplotDetails.panchayath || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="വാർഡ് നമ്പർ" value={wardNumber} onChange={(e) => setWardNumber(e.target.value)} fullWidth />
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
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="KEYPLOT" value={'K' || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="SY.No." value={keyplotDetails.syNo || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField label="AREA (Cent)" value={keyplotDetails.areaCents || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="BLOCK/VILLAGE" value={keyplotDetails.villageBlock || ''} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="RESERVE KEYPLOT"
              value={reserveKeyplot}
              onChange={(e) => setReserveKeyplot(e.target.value)}
              placeholder="-"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="TOTAL ACTUAL AREA (Cent)" value={calculateOverallTotalActual()} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField label="TOTAL AREA (Ares)" value={calculateOverallTotalArea()} InputProps={{ readOnly: true }} fullWidth />
          </Grid>
        </Grid>

        {keyplots.map((keyplot, index) => (
          <Box key={keyplot.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 1, overflowX: 'auto', bgcolor: 'white', p: 2 }}>
            <Box
              sx={{
                bgcolor: '#05307a',
                color: 'white',
                p: 1,
                borderBottom: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <Typography sx={{ mr: 1 }}>SIDE PLOT:</Typography>
                <TextField
                  value={keyplot.label}
                  onChange={(e) => handleKeyplotLabelChange(e, index)}
                  inputProps={{ maxLength: 4, style: { color: 'white' } }}
                  size="small"
                  sx={{ bgcolor: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '50px' }}
                />
              </Box>
              <Typography>Total Actual Area (Cent): {calculateTotalActual(keyplot.rows)}</Typography>
              <Typography>Total Area (Ares): {calculateTotalArea(keyplot.rows)}</Typography>
            </Box>
            <Grid container spacing={2} sx={{ p: 2 }} alignItems="center">
              {/* Column Headers */}
              <Grid item xs={2}>
                {' '}
                <Typography fontWeight="bold">Village</Typography>{' '}
              </Grid>
              <Grid item xs={2}>
                {' '}
                <Typography fontWeight="bold">Block</Typography>{' '}
              </Grid>
              <Grid item xs={2}>
                {' '}
                <Typography fontWeight="bold">SV.No / Sub</Typography>{' '}
              </Grid>
              <Grid item xs={3}>
                {' '}
                <Typography fontWeight="bold">Actual</Typography>{' '}
              </Grid>
              <Grid item xs={2}>
                {' '}
                <Typography fontWeight="bold">Area For Enumerated</Typography>{' '}
              </Grid>

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
                    <TextField value={`${row.svNo || ''} / ${row.sub || ''}`} InputProps={{ readOnly: true }} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField value={row.area || ''} InputProps={{ readOnly: true }} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      value={row.enumeratedArea || ''}
                      onChange={(e) => handleEnumeratedAreaChange(e.target.value, index, rowIndex)}
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ step: '0.01', min: '0' }}
                      label="Area For Enumerated"
                    />
                  </Grid>

                  <Grid item xs={1}>
                    <Button
                      startIcon={<RemoveCircleOutlineIcon />}
                      onClick={() => removeKeyplotRow(index, rowIndex, row.id)} // Pass both indices
                      size="small"
                      variant="contained"
                      color="error"
                    ></Button>
                  </Grid>
                  <Grid item xs={1}>
                    {row.isExisting && <Chip label="Saved" size="small" color="success" variant="outlined" />}
                  </Grid>
                </React.Fragment>
              ))}

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
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
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity="warning" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* --- Modal for adding a new row --- */}
        <Modal open={modalOpen} onClose={closeModal} aria-labelledby="add-row-modal-title" aria-describedby="add-row-modal-description">
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
              borderRadius: 2
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
                  value={modalRowData.village ? villageOptions.find((v) => v.villageId === modalRowData.village) : null}
                  onChange={(event, newValue) => handleModalInputChange(newValue ? newValue.villageId : null, 'village')}
                  renderInput={(params) => <TextField {...params} label="Village" variant="outlined" size="small" fullWidth />}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={modalBlockOptions}
                  getOptionLabel={(option) => String(option)}
                  value={modalRowData.modalBlock}
                  onChange={(event, newValue) => handleModalInputChange(newValue, 'modalBlock')}
                  renderInput={(params) => <TextField {...params} label="Block" variant="outlined" size="small" fullWidth />}
                  disabled={!modalRowData.village || modalBlockOptions.length === 0}
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  options={svNoOptions.map(String)}
                  getOptionLabel={(option) => String(option)}
                  value={modalRowData.svNo ? String(modalRowData.svNo) : null}
                  onChange={(event, newValue) => handleModalInputChange(newValue, 'svNo')}
                  renderInput={(params) => <TextField {...params} label="Survey No" variant="outlined" size="small" fullWidth />}
                />
              </Grid>
            </Grid>

            {/* SECTION 2: Reservation Selection */}
            {svNoDetails.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ✅ Reservation Sub Numbers
                </Typography>

                <FormGroup sx={{ ml: 1 }}>
                  {svNoDetails.map((item) => (
                    <FormControlLabel
                      key={item.resbdno}
                      control={
                        <Checkbox checked={selectedSvNos.includes(item.resbdno)} onChange={() => handleSvNoSelection(item.resbdno)} />
                      }
                      label={`${modalRowData.svNo}/${item.resbdno} — ${item.area} cents`}
                    />
                  ))}
                </FormGroup>
              </>
            )}

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
          <DialogTitle id="alert-dialog-title">{'Confirm Deletion'}</DialogTitle>
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
