import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import {
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

// Define the columns for the data table
const columns = (handleView, handleEdit, page, size) => [
  {
    name: 'SL. NO',
    selector: (row, index) => (page - 1) * size + index + 1,
    width: '80px',
  },
  {
    name: 'Local Body Name',
    selector: (row) => row.localBodyName?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
  },
  {
    name: 'Village',
    selector: (row) => {
      const name = row.villageName?.toString();
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : <span style={{ color: '#888' }}>NA</span>;
    },
    sortable: true,
  },
  {
    name: 'Block No.',
    selector: (row) => row.bcode?.toString() || <span style={{ color: '#888' }}>NA</span>,
    width: '100px',
  },
  {
    name: 'Survey No.',
    selector: (row) => row.resvno?.toString() || <span style={{ color: '#b35353ff' }}>NA</span>,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Sub Div No.',
    selector: (row) => row.resbdno?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '120px',
  },
  {
    name: 'Name',
    selector: (row) => row.name?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    minWidth: '160px',
  },
  {
    name: 'Address',
    selector: (row) => row.address?.toString() || <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    grow: 2,
    wrap: true,
  },
  {
    name: 'MC',
    cell: (row) => (
      <Tooltip title="Add minor circuit plot(s)">
        <IconButton
          color="primary"
          size="small"
          onClick={() => handleEdit(row)}
          data-tag="allowRowEvents"
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    width: '90px',
    center: true,
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  },
  {
    name: 'Land Type',
    selector: (row) => row.ltype?.toString() || <span style={{ color: '#888' }}>NA</span>,
    width: '100px',
  },
  {
    name: 'Total Area (in Cents)',
    selector: (row) => row.totCent ? row.totCent.toLocaleString() : <span style={{ color: '#888' }}>NA</span>,
    sortable: true,
    width: '150px',
  },
  {
    name: 'View Detail',
    cell: (row) => (
      <Button color="success" onClick={() => handleView(row)}>
        <VisibilityIcon />
      </Button>
    ),
    width: '120px',
    center: true,
  },
];

const Btr = ({ zoneId }) => {
  const [filterText, setFilterText] = useState('');
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // MC modal state
  const [openMcModal, setOpenMcModal] = useState(false);
  const [mcBase, setMcBase] = useState(null); // base fields copied from selected plot till Survey No and including Sub Div No
  const [mcRows, setMcRows] = useState([]); // dynamic rows: name, address, ltype, totCent
  const [mcSaving, setMcSaving] = useState(false);

  const [resolvedZoneId] = useState(() => {
    const role = authservice.getrole();
    return role === 'Field Data Collector' ? authservice.getzone() : zoneId;
  });

  // Fetch data from your API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const BASE_URL = mainapi.BASE_URL;
      const zoneid = authservice.getzone();
      const response = await fetch(`${BASE_URL}/btr-service/api/btr-api/btr-data/${resolvedZoneId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setData(result);
        setFilteredData(result);
        setTotalRecords(result.length);
        const totals = result.reduce(
          (acc, item) => {
            const area = parseFloat(item.totCent) || 0;
            acc.totalArea += area;
            if ((item.ltype || '').toUpperCase() === 'WET') {
              acc.totalWetArea += area;
            } else if ((item.ltype || '').toUpperCase() === 'DRY') {
              acc.totalDryArea += area;
            }
            return acc;
          },
          { totalArea: 0, totalWetArea: 0, totalDryArea: 0 }
        );
        setTotalArea(totals.totalArea);
        setTotalWetArea(totals.totalWetArea);
        setTotalDryArea(totals.totalDryArea);
      } else {
        setData([]);
        setFilteredData([]);
        setTotalRecords(0);
        setTotalArea(0);
        setTotalWetArea(0);
        setTotalDryArea(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setFilteredData([]);
      setTotalRecords(0);
      setTotalArea(0);
      setTotalWetArea(0);
      setTotalDryArea(0);
    } finally {
      setLoading(false);
    }
  }, [resolvedZoneId]);

  // CSV Download functionality
  // const handleDownloadExcel = async () => {
  //   setDownloading(true);
  //   try {
  //     // Create CSV headers
  //     const headers = [
  //       'ID',
  //       'Local Body Name',
  //       'Village Name',
  //       'Block Code',
  //       'Re-Survey No',
  //       'Land Type',
  //       'Total Area (Cents)',
  //       'District Code',
  //       'Taluk Code',
  //       'Village Code',
  //       'LSG Code',
  //       'Zone ID'
  //     ];
  //     // Convert data to CSV format
  //     const csvData = filteredData.map(row => [
  //       row.id || '',
  //       row.localBodyName || '',
  //       row.villageName || '',
  //       row.bcode || '',
  //       row.resvno && row.resbdno ? `${row.resvno}/${row.resbdno}` : (row.resvno || row.resbdno || ''),
  //       row.ltype || '',
  //       row.totCent || '',
  //       row.dcode || '',
  //       row.tcode || '',
  //       row.vcode || '',
  //       row.lsgcode || '',
  //       row.zoneId || ''
  //     ]);
  //     // Create CSV string
  //     const csvContent = [
  //       headers.join(','),
  //       ...csvData.map(row =>
  //         row.map(cell =>
  //           typeof cell === 'string' && cell.includes(',')
  //             ? `"${cell}"`
  //             : cell
  //         ).join(',')
  //       )
  //     ].join('\n');
  //     // Create and download file
  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const link = document.createElement('a');
  //     const url = URL.createObjectURL(blob);
  //     link.setAttribute('href', url);
  //     link.setAttribute('download', `btr_data_${new Date().toISOString().split('T')[0]}.csv`);
  //     link.style.visibility = 'hidden';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     alert('Download failed. Please try again.');
  //   } finally {
  //     setDownloading(false);
  //   }
  // };
  const handleDownloadExcel = async () => {
    setDownloading(true);
    const userId = authservice.userid();
    const BASE_URL = mainapi.USER_API;
    try {
        const token = localStorage.getItem('token');
      // Ensure the URL is correct for your backend service
      const response = await fetch(`${BASE_URL}/btr-service/btr-api/export?zoneId=${resolvedZoneId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Add token in Authorization header
        }
      });


      if (!response.ok) {
        throw new Error('Failed to download file');
      }


      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'btr_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed.'); // Provide user feedback
    } finally {
      setDownloading(false);
    }
  };


  // Fetch individual record details
  const fetchRecordDetails = async (id) => {
    setDetailLoading(true);
    try {
      const BASE_URL = mainapi.BASE_URL;
      
      const response = await fetch(`${BASE_URL}/btr-service/api/fetch-btr/data/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setSelectedRow(result);
    } catch (error) {
      console.error("Error fetching record details:", error);
      alert('Failed to load record details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Event handlers
  const handleFilterChange = (event) => {
    const value = event.target.value.toLowerCase();
    setFilterText(value);
    setPage(1);
    if (value === '') {
      setFilteredData(data);
      setTotalRecords(data.length);
    } else {
      const filtered = data.filter(item =>
        (item.localBodyName || '').toLowerCase().includes(value) ||
        (item.villageName || '').toLowerCase().includes(value) ||
        (item.bcode || '').toLowerCase().includes(value) ||
        (item.ltype || '').toLowerCase().includes(value) ||
        (item.resvno || '').toString().toLowerCase().includes(value) ||
        (item.resbdno || '').toString().toLowerCase().includes(value)
      );
      setFilteredData(filtered);
      setTotalRecords(filtered.length);
    }
  };

  const handleView = (row) => {
    fetchRecordDetails(row.id);
    setOpenViewModal(true);
  };

  const handleCloseModals = () => {
    setOpenViewModal(false);
    setSelectedRow(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setSize(newSize);
    setPage(1);
  };

  // MC: open modal prefilled with base up to Survey No and same Sub Div No
  const handleEdit = (row) => {
    const base = {
      id: row.id,
      localBodyName: row.localBodyName,
      villageName: row.villageName,
      bcode: row.bcode,
      resvno: row.resvno,
      resbdno: row.resbdno, // Sub Div No is same as selected plot
      dcode: row.dcode,
      tcode: row.tcode,
      vcode: row.vcode,
      lsgcode: row.lsgcode,
      zoneId: row.zoneId,
      surveyNumber: row.surveyNumber,
      lbcode: row.lbcode,
      govpriv: row.govpriv,
      landuse: row.landuse,
      east: row.east,
      west: row.west,
      north: row.north,
      south: row.south
    };
    setMcBase(base);
    // Start with a single empty row; + will be disabled until this row is valid
    setMcRows([{ name: '', address: '', ltype: '', totCent: '' }]);
    setOpenMcModal(true);
  };

  // Row validity
  const isRowValid = (r) =>
    (r.name || '').toString().trim() !== '' &&
    (r.address || '').toString().trim() !== '' &&
    (r.ltype || '').toString().trim() !== '' &&
    r.totCent !== '' &&
    !isNaN(parseFloat(r.totCent)) &&
    parseFloat(r.totCent) >= 0;

  // MC: add/remove/update rows
  const handleMcAddRow = () => {
    // Only allow adding if the last row is valid
    const last = mcRows[mcRows.length - 1];
    if (!isRowValid(last)) return;
    setMcRows(prev => [...prev, { name: '', address: '', ltype: '', totCent: '' }]);
  };

  const handleMcRemoveRow = (index) => {
    setMcRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleMcRowChange = (index, field, value) => {
    setMcRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  // MC: Save new plots appended to BTR list
  const handleMcSave = async () => {
    // Validate all rows
    const sanitized = mcRows.map(r => ({
      name: (r.name || '').toString().trim(),
      address: (r.address || '').toString().trim(),
      ltype: (r.ltype || '').toString().trim().toUpperCase(),
      totCent: r.totCent === '' || r.totCent === null ? '' : String(r.totCent)
    }));

    const hasEmpty = sanitized.some(r =>
      !r.name || !r.address || !r.ltype || r.totCent === ''
    );
    if (sanitized.length === 0 || hasEmpty) {
      alert('Please complete all fields in each row before saving.');
      return;
    }
    const invalidArea = sanitized.some(r => isNaN(parseFloat(r.totCent)) || parseFloat(r.totCent) < 0);
    if (invalidArea) {
      alert('Total Area (Cents) must be a non-negative number.');
      return;
    }

    setMcSaving(true);
    try {
      const newPlots = sanitized.map(r => ({
        ...mcBase,
        // resbdno is taken from mcBase per your requirement
        name: r.name,
        address: r.address,
        ltype: r.ltype,
        totCent: parseFloat(r.totCent),
      }));

      const appended = [...data, ...newPlots];
      setData(appended);

      if (!filterText) {
        setFilteredData(appended);
        setTotalRecords(appended.length);
      } else {
        const filtered = appended.filter(item =>
          (item.localBodyName || '').toLowerCase().includes(filterText) ||
          (item.villageName || '').toLowerCase().includes(filterText) ||
          (item.bcode || '').toLowerCase().includes(filterText) ||
          (item.ltype || '').toLowerCase().includes(filterText) ||
          (item.resvno || '').toString().toLowerCase().includes(filterText) ||
          (item.resbdno || '').toString().toLowerCase().includes(filterText)
        );
        setFilteredData(filtered);
        setTotalRecords(filtered.length);
      }

      const totals = appended.reduce(
        (acc, item) => {
          const area = parseFloat(item.totCent) || 0;
          acc.totalArea += area;
          if ((item.ltype || '').toUpperCase() === 'WET') {
            acc.totalWetArea += area;
          } else if ((item.ltype || '').toUpperCase() === 'DRY') {
            acc.totalDryArea += area;
          }
          return acc;
        },
        { totalArea: 0, totalWetArea: 0, totalDryArea: 0 }
      );
      setTotalArea(totals.totalArea);
      setTotalWetArea(totals.totalWetArea);
      setTotalDryArea(totals.totalDryArea);

      setOpenMcModal(false);
      setMcBase(null);
      setMcRows([]);
      // Optional server persistence:
      // const BASE_URL = mainapi.BASE_URL;
      // await fetch(`${BASE_URL}/btr-service/api/batch-insert`, { method: 'POST', body: JSON.stringify(newPlots), headers: { ... } });
      // await fetchData();
    } catch (e) {
      console.error('MC save error:', e);
      alert('Failed to save plots. Please try again.');
    } finally {
      setMcSaving(false);
    }
  };

  const columnDefs = useMemo(
    () => columns(handleView, handleEdit, page, size),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, size]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Determine if add (+) should be enabled: after filling one row validly
  const canAddMore = mcRows.length > 0 && isRowValid(mcRows[mcRows.length - 1]);

  return (
    <Grid container spacing={3}>
      <Breadcrumb> </Breadcrumb>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ marginBottom: '16px', padding: '16px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
              Basic Tax Register
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="body1" component="p" sx={{ color: 'green', fontWeight: 'bold' }}>
                Total Wet: {totalWetArea.toLocaleString()} Cents
              </Typography>
              <Typography variant="body1" component="p" sx={{ color: 'red', fontWeight: 'bold' }}>
                Total Dry: {totalDryArea.toLocaleString()} Cents
              </Typography>
              <Typography variant="body1" component="p" sx={{ color: '#04255E', fontWeight: 'bold' }}>
                Total Area: {totalArea.toLocaleString()} Cents
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadExcel}
                disabled={downloading || filteredData.length === 0}
                startIcon={
                  downloading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />
                }
                sx={{
                  backgroundColor: downloading ? '#1976D2' : undefined,
                  opacity: downloading ? 0.8 : 1,
                  '&.Mui-disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  },
                }}
              >
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
              <TextField
                label="Search"
                variant="outlined"
                value={filterText}
                onChange={handleFilterChange}
                size="small"
                style={{ width: '200px' }}
                placeholder="Search records..."
              />
            </Stack>
          </Stack>
        </Paper>

        <DataTable
          columns={columnDefs}
          data={paginatedData}
          progressPending={loading}
          progressComponent={
            <div
              style={{
                padding: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#04255E',
                textAlign: 'center',
              }}
            >
              Loading BTR Data...
            </div>
          }
          pagination
          paginationServer={false}
          paginationTotalRows={totalRecords}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onChangePage={handlePageChange}
          paginationPerPage={size}
          paginationRowsPerPageOptions={[100, 150, 200, 250]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page:',
            rangeSeparatorText: 'of',
          }}
          fixedHeader
          fixedHeaderScrollHeight="60vh"
          customStyles={{
            headCells: {
              style: {
                fontSize: '.9rem',
                backgroundColor: '#04255E',
                color: '#fff',
                fontWeight: 'bold',
                borderBottom: '2px solid black',
              },
            },
            cells: {
              style: {
                borderBottom: '1px solid #E0E0E0',
                color: '#333',
                fontSize: '.85rem',
              },
            },
            rows: {
              style: {
                '&:hover': {
                  backgroundColor: '#F5F5F5',
                },
              },
            },
            pagination: {
              style: {
                color: '#04255E',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          }}
          noDataComponent={
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              {filterText ? 'No records match your search criteria.' : 'No data available.'}
            </div>
          }
        />

        {/* View Modal */}
        <Dialog open={openViewModal} onClose={handleCloseModals} maxWidth="md" fullWidth>
          <DialogTitle
            variant="h4"
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '2px solid #F0F0F0',
              paddingBottom: '10px',
              background: '#04255E'
            }}
          >
            BTR Record Details
          </DialogTitle>
          <DialogContent style={{ padding: '20px', backgroundColor: '#FAFAFA' }}>
            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CircularProgress />
                <Typography variant="body1" style={{ marginTop: '10px' }}>
                  Loading record details...
                </Typography>
              </div>
            ) : selectedRow ? (
              <DialogContentText>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    fontSize: '14px',
                    color: '#333',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {[
                    
                    { key: 'localBodyName', label: 'Local Body Name' },
                    { key: 'villageName', label: 'Village Name' },
                    { key: 'bcode', label: 'Block Code' },
                    {
                      key: 'resvno',
                      label: 'Re-Survey No',
                      format: (row) =>
                        row.resvno && row.resbdno ? `${row.resvno}/${row.resbdno}` : (row.resvno || row.resbdno || 'NA')
                    },
                    { key: 'ltype', label: 'Land Type' },
                    {
                      key: 'totCent',
                      label: 'Total Area (Cents)',
                      format: (row) => row.totCent ? row.totCent.toLocaleString() : 'NA'
                    },
                    { key: 'dcode', label: 'District Code' },
                    { key: 'tcode', label: 'Taluk Code' },
                    { key: 'vcode', label: 'Village Code' },
                    { key: 'lsgcode', label: 'LSG Code' },
                    { key: 'surveyNumber', label: 'Survey Number' },
                    { key: 'zoneId', label: 'Zone ID' },
                    { key: 'lbcode', label: 'LB Code' },
                    { key: 'govpriv', label: 'Gov/Private' },
                    { key: 'landuse', label: 'Land Use' },
                    { key: 'nhect', label: 'N Hectares' },
                    { key: 'nare', label: 'N Are' },
                    { key: 'nsqm', label: 'N Square Meters' },
                    { key: 'east', label: 'East Boundary' },
                    { key: 'west', label: 'West Boundary' },
                    { key: 'north', label: 'North Boundary' },
                    { key: 'south', label: 'South Boundary' },
                  ].map(({ key, label, format }) => {
                    const value = format ? format(selectedRow) : (selectedRow[key] || 'NA');
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 'bold',
                            color: '#555',
                            marginBottom: '8px',
                            fontSize: '13px'
                          }}
                        >
                          {label}:
                        </div>
                        <div
                          style={{
                            backgroundColor: '#F9F9F9',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: '1px solid #E0E0E0',
                            wordBreak: 'break-word',
                            width: '100%',
                            minHeight: '20px',
                            fontSize: '14px'
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContentText>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Failed to load record details.
              </div>
            )}
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center', padding: '16px' }}>
            <Button onClick={handleCloseModals} color="secondary" variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* MC Edit Modal */}
        <Dialog open={openMcModal} onClose={() => setOpenMcModal(false)} maxWidth="lg" fullWidth>
          <DialogTitle
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '2px solid #F0F0F0',
              pb: 1,
              background: '#04255E'
            }}
          >
            Add Minor Circuit Plot(s)
          </DialogTitle>
          <DialogContent sx={{ bgcolor: '#FAFAFA' }}>
            {mcBase && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fff' }}>
                {/* Removed the 'Base Fields (fixed)' title per request */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Local Body Name" value={mcBase.localBodyName || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Village Name" value={mcBase.villageName || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Block Code" value={mcBase.bcode || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Survey No." value={mcBase.resvno || ''} fullWidth size="small" disabled />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField label="Sub Div No." value={mcBase.resbdno || ''} fullWidth size="small" disabled />
                  </Grid>
                </Grid>
              </Paper>
            )}

            <Paper variant="outlined" sx={{ p: 0, bgcolor: '#fff' }}>
              <TableContainer>
                <Table size="small" aria-label="minor-circuit-table">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f4ff' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 160 }}>Land Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 200 }}>Total Area (Cents)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: 120 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mcRows.map((row, idx) => {
                      const rowValid = isRowValid(row);
                      const isLast = idx === mcRows.length - 1;
                      return (
                        <TableRow key={idx} hover>
                          <TableCell>
                            <TextField
                              value={row.name}
                              onChange={(e) => handleMcRowChange(idx, 'name', e.target.value)}
                              placeholder="Owner / Entity"
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.address}
                              onChange={(e) => handleMcRowChange(idx, 'address', e.target.value)}
                              placeholder="Address"
                              size="small"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              value={row.ltype}
                              onChange={(e) => handleMcRowChange(idx, 'ltype', e.target.value)}
                              size="small"
                              fullWidth
                            >
                              <MenuItem value="WET">WET</MenuItem>
                              <MenuItem value="DRY">DRY</MenuItem>
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={row.totCent}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                                  handleMcRowChange(idx, 'totCent', val);
                                }
                              }}
                              placeholder="0.00"
                              size="small"
                              fullWidth
                              InputProps={{
                                endAdornment: <InputAdornment position="end">Cents</InputAdornment>,
                                inputProps: { inputMode: 'decimal' }
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="Remove this row">
                                <span>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleMcRemoveRow(idx)}
                                    disabled={mcRows.length === 1}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={rowValid && isLast ? 'Add a row' : 'Fill this row to enable'}>
                                <span>
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={handleMcAddRow}
                                    disabled={!rowValid || !isLast}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {mcRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ color: '#888' }}>
                          No rows. Add at least one plot.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Button onClick={() => setOpenMcModal(false)} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleMcSave}
              color="primary"
              variant="contained"
              startIcon={mcSaving ? <CircularProgress size={18} color="inherit" /> : null}
              disabled={
                mcSaving ||
                mcRows.length === 0 ||
                // require all rows valid before enabling Save
                mcRows.some(r => !isRowValid(r))
              }
            >
              {mcSaving ? 'Saving...' : 'Save Plots'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
};

export default Btr;
