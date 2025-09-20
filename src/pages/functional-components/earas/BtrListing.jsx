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

// Define the columns for the data table
const columns = (handleView, page, size) => [
  {
    name: 'SL. NO',
    selector: (row, index) => (page - 1) * size + index + 1,
  },
  { 
    name: 'Local Body Name', 
    selector: (row) => row.lbname?.toString() || <span style={{ color: '#888' }}>NA</span> 
  },
  {
    name: 'Village',
    selector: (row) => {
      const name = row.villageName?.toString();
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : <span style={{ color: '#888' }}>NA</span>;
    }
  },
  { 
    name: 'Block No.', 
    selector: (row) => row.bcode?.toString() || <span style={{ color: '#888' }}>NA</span> 
  },
  {
    name: 'Re-Survey No',
    selector: (row) =>
      row.resvno && row.resbdno ? (
        `${row.resvno} / ${row.resbdno}`
      ) : row.resvno ? (
        `${row.resvno} / NA`
      ) : row.resbdno ? (
        `NA / ${row.resbdno}`
      ) : (
        <span style={{ color: '#888' }}>NA</span>
      )
  },
  { 
    name: 'Land Type', 
    selector: (row) => row.ltype?.toString() || <span style={{ color: '#888' }}>NA</span> 
  },
  { 
    name: 'Total Area(in Cents)', 
    selector: (row) => row.totalCent?.toString() || <span style={{ color: '#888' }}>NA</span> 
  },
  {
    name: 'View Detail',
    cell: (row) => (
      <Button color="success" onClick={() => handleView(row)}>
        <VisibilityIcon />
      </Button>
    ),
    style: {
      padding: '0px',
      textAlign: 'center',
    },
  },
];

const Btr = () => {
  // State management
  const [filterText, setFilterText] = useState('');
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO: Replace with your own API service
  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Replace this with your own API call
      const response = await fetch(`/api/your-endpoint?page=${page-1}&size=${size}&search=${filterText}`);
      const result = await response.json();
      
      if (result?.data) {
        const indexedData = result.data.map((item, index) => ({
          ...item,
          indexOffset: (page - 1) * size,
        }));
        setData(indexedData);
        setTotalRecords(result.totalCount || 0);
        setTotalWetArea(result.totalWetArea || 0);
        setTotalDryArea(result.totalDryArea || 0);
        setTotalArea(result.totalArea || 0);
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Replace with your own download service
  const handleDownloadExcel = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch('/api/your-download-endpoint', {
        headers: {
          'Authorization': `Bearer YOUR_TOKEN_HERE`
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
      alert('Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  // Event handlers
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(1);
  };

  const handleView = (row) => {
    setSelectedRow(row);
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
  const columnDefs = useMemo(() => columns(handleView, page, size), [handleView, page, size]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [page, size, filterText]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
              Basic Tax Register
            </Typography>
            
            <Typography variant="body1" component="p" sx={{ color: 'green' }}>
              Total Wet : {totalWetArea} Cents
            </Typography>
            
            <Typography variant="body1" component="p" sx={{ color: 'red' }}>
              Total Dry : {totalDryArea} Cents
            </Typography>
            
            <Typography variant="body1" component="p" sx={{ color: '#04255e' }}>
              Total Area : {totalArea} Cents
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
              disabled={downloading}
              startIcon={
                downloading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />
              }
              sx={{
                backgroundColor: downloading ? '#1976d2' : undefined,
                opacity: downloading ? 0.8 : 1,
                pointerEvents: downloading ? 'none' : 'auto',
                color: '#fff',
                '&.Mui-disabled': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
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
            />
          </Stack>
        </Paper>

        <DataTable
          columns={columnDefs}
          data={data}
          progressPending={loading}
          progressComponent={
            <div
              style={{
                padding: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#04255e',
                textAlign: 'center',
              }}
            >
              Loading BTR Data...
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={totalRecords}
          onChangeRowsPerPage={handleRowsPerPageChange}
          onChangePage={handlePageChange}
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page',
            rangeSeparatorText: 'of',
          }}
          fixedHeader
          fixedHeaderScrollHeight="60vh"
          customStyles={{
            headCells: {
              style: {
                fontSize: '.9rem',
                backgroundColor: '#04255e',
                color: '#fff',
                fontWeight: 'bold',
                borderBottom: '2px solid black',
              },
            },
            cells: {
              style: {
                borderBottom: '1px solid white',
                color: '#333',
              },
            },
            pagination: {
              style: {
                color: '#04255e',
                alignItems: 'center',
                justifyContent: 'center',
              },
            },
          }}
        />

        {/* View Modal */}
        <Dialog open={openViewModal} onClose={handleCloseModals} maxWidth="md" fullWidth>
          <DialogTitle
            variant="h4"
            style={{
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '2px solid #f0f0f0',
              paddingBottom: '10px',
              background: '#04255e'
            }}
          >
            View BTR Details
          </DialogTitle>
          <DialogContent style={{ padding: '20px', backgroundColor: '#fafafa' }}>
            {selectedRow && (
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
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {Object.keys(selectedRow)
                    .filter((key) => key !== 'id' && key !== 'lbcode' && key !== 'resbdno' && key !== 'lbtype' && key !== 'indexOffset')
                    .map((key) => {
                      let label = key;
                      let value = selectedRow[key] || 'NA';

                      // Custom label mappings
                      if (key === 'villageName') label = 'Village Name';
                      if (key === 'bcode') label = 'Block Code';
                      if (key === 'ltype') label = 'Land Type';
                      if (key === 'totalCent') label = 'Total Area (in Cents)';

                      // Custom rendering for resvno
                      if (key === 'resvno') {
                        const resvno = selectedRow.resvno ? selectedRow.resvno : 'NA';
                        const resbdno = selectedRow.resbdno ? selectedRow.resbdno : 'NA';
                        label = 'Re-Survey No.';
                        value = `${resvno} / ${resbdno}`;
                      }

                      if (key === 'lbname') {
                        label = 'Local Body Name';
                        value = selectedRow.lbname ? selectedRow.lbname : 'NA';
                      }

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
                              color: 'gray',
                              marginBottom: '8px'
                            }}
                          >
                            {label}:
                          </div>
                          <div
                            style={{
                              backgroundColor: '#f9f9f9',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)',
                              wordBreak: 'break-word',
                              width: '100%'
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
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
