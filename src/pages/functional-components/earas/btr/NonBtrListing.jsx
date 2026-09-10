import React, { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
// Define the columns for the data table
const columns = (handleView, page, size) => [
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
    name: 'Re-Survey No',
    selector: (row) =>
      row.resvno && row.resbdno ? (
        `${row.resvno}/${row.resbdno}`
      ) : row.resvno ? (
        `${row.resvno}/NA`
      ) : row.resbdno ? (
        `NA/${row.resbdno}`
      ) : (
        <span style={{ color: '#888' }}>NA</span>
      ),
    width: '130px',
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
  // State management
  const [filterText, setFilterText] = useState('');
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);


  const [resolvedZoneId, setResolvedZoneId] = useState(() => {
    const role = authservice.getrole(); // Get the role
    return role === 'Field Data Collector'
      ? authservice.getzone()  // For Field Data Collector
      : zoneId;                         // For Admin or other roles
  });

  // Fetch data from your API
  const fetchData = async () => {
    setLoading(true);
    try {
      // const BASE_URL = mainapi.BASE_URL;
      const BASE_URL = mainapi.BASE_URL;
      const zoneid = authservice.getzone();
      const response = await fetch(`${BASE_URL}/btr-service/api/fetch-btr/zone/${resolvedZoneId}/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
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
        // Calculate totals
        const totals = result.reduce(
          (acc, item) => {
            const area = parseFloat(item.totCent) || 0;
            acc.totalArea += area;
            if (item.ltype === 'WET') {
              acc.totalWetArea += area;
            } else if (item.ltype === 'DRY') {
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
  };
  // CSV Download functionality
  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      // Create CSV headers
      const headers = [
        'ID',
        'Local Body Name',
        'Village Name',
        'Block Code',
        'Re-Survey No',
        'Land Type',
        'Total Area (Cents)',
        'District Code',
        'Taluk Code',
        'Village Code',
        'LSG Code',
        'Zone ID'
      ];
      // Convert data to CSV format
      const csvData = filteredData.map(row => [
        row.id || '',
        row.localBodyName || '',
        row.villageName || '',
        row.bcode || '',
        row.resvno && row.resbdno ? `${row.resvno}/${row.resbdno}` : (row.resvno || row.resbdno || ''),
        row.ltype || '',
        row.totCent || '',
        row.dcode || '',
        row.tcode || '',
        row.vcode || '',
        row.lsgcode || '',
        row.zoneId || ''
      ]);
      // Create CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row =>
          row.map(cell =>
            typeof cell === 'string' && cell.includes(',')
              ? `"${cell}"`
              : cell
          ).join(',')
        )
      ].join('\n');
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `btr_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  // Fetch individual record details
  const fetchRecordDetails = async (id) => {
    setDetailLoading(true);
    try {
      // const BASE_URL = mainapi.BASE_URL;
      const BASE_URL = mainapi.BASE_URL;
      const response = await fetch(`${BASE_URL}/btr-service/api/fetch-btr/data/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
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
    // Fetch detailed information for the selected row
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
  // Memoized columns
  const columnDefs = useMemo(() => columns(handleView, page, size), [page, size]);
  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, size]);
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

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
                {downloading ? 'Downloading...' : 'Download CSV'}
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
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
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
                    { key: 'id', label: 'ID' },
                    { key: 'localBodyName', label: 'Local Body Name' },
                    { key: 'villageName', label: 'Village Name' },
                    { key: 'bcode', label: 'Block Code' },
                    {
                      key: 'resvno', label: 'Re-Survey No', format: (row) =>
                        row.resvno && row.resbdno ? `${row.resvno}/${row.resbdno}` : (row.resvno || row.resbdno || 'NA')
                    },
                    { key: 'ltype', label: 'Land Type' },
                    {
                      key: 'totCent', label: 'Total Area (Cents)', format: (row) =>
                        row.totCent ? row.totCent.toLocaleString() : 'NA'
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
      </Grid>
    </Grid>
  );
};
export default Btr;