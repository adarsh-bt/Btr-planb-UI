import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import {
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Grid, // Ensure Grid is imported
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

import Breadcrumb from 'routes/Breadcrumb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import btrservice from './btrservice';
import authservice from 'pages/authentication/services/authservice';



// Define the columns for the data table
const columns = (handleEdit, handleView) => [
  { name: 'SL. NO', selector: (row, index) => index + 1 },
  // { name: 'District', selector: (row) => row.dcode, sortable: true },
  // { name: 'Taluk', selector: (row) => row.tcode, sortable: true },
  // { name: 'Village', selector: (row) => row.vcode, sortable: true },
  { name: 'Panchayth', selector: (row) => row.lbname?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Village', selector: (row) => row.villageName?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Block', selector: (row) => row.bcode?.toString() || <span style={{ color: '#888' }}>NA</span> },
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
  // { name: 'Re-Survey No', selector: (row) => row.resvno?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Sub Div No', selector: (row) => row.resbdno?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Address', selector: (row) => row.lbname?.toString() || <span style={{ color: '#888' }}>NA</span> },
  // { name: 'Address', selector: (row) => row.lbcode, sortable: true },

  { name: 'Land Type', selector: (row) => row.ltype?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Total area(cent)', selector: (row) => row.totalCent?.toString() || <span style={{ color: '#888' }}>NA</span> },

  {
    name: 'View',
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
  const [filterText, setFilterText] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false); // Not used in provided code, but kept
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1); // Start with page 1 (react-data-table-component is 1-based)
  const [size, setSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false); // New state for data loading

  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(1); // Reset page to 1 when filter changes
  };

  // Function to handle view action
  const handleView = (row) => {
    setSelectedRow(row);
    setOpenViewModal(true);
    setSelectedRow(row);
    setOpenViewModal(true);
  };

  // Function to close modals
  const handleCloseModals = () => {
    setOpenEditModal(false);
    setOpenViewModal(false);
    setSelectedRow(null);
    setSelectedRow(null);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setSize(newSize);
    setPage(1); // Reset to page 1 when rows per page changes
  };

  // Fetch the data from the API
  const fetchData = async () => {
    setLoading(true); // Set loading to true
    const userid = '1605'; // This seems to be hardcoded, consider making it dynamic if needed

    try {
      // Adjust page to 0-based if your API expects it
      const apiPage = page - 1;
      const response = await btrservice.btr_lists_data(userid, apiPage, size, filterText);

      if (response?.payload?.data) {
        // Add an indexOffset to each row for correct SL. NO display
        const indexedData = response.payload.data.map((item, index) => ({
          ...item,
          indexOffset: (page - 1) * size, // Calculate offset for current page
        }));
        setData(indexedData);
        setTotalRecords(response.payload.totalCount);
        setTotalWetArea(response.payload.totalWetArea);
        setTotalDryArea(response.payload.totalDryArea);
        setTotalArea(response.payload.totalArea);
      } else {
        console.error("Failed to fetch data:", response.message);
        setData([]); // Clear data on failure
        setTotalRecords(0); // Reset total records
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false); // Set loading to false
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    const userId = authservice.userid();

    try {
        const token = localStorage.getItem('token');
      // Ensure the URL is correct for your backend service
      const response = await fetch(`http://10.10.32.45:8080/btr-service/btr-api/export?userId=${userId}`, {
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

  // Effect hook to fetch data when page, size, or filterText changes
  useEffect(() => {
    fetchData();
  }, [page, size, filterText]); // fetchData no longer needs to be passed filter, as it uses state

  return (
    <Grid container spacing={3}>
      <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>

        <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>

          <Stack direction="row" justifyContent="space-between" alignItems="center">

            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
              Basic Tax Register
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'green' }}>Total Wet : {totalWetArea} Ac</Typography>
            <Typography variant="body1" component="p" sx={{ color: 'red' }}>Total Dry : {totalDryArea} Ac</Typography>
            <Typography variant="body1" component="p" sx={{ color: '#04255e' }}>Total Area : {totalArea} Ac</Typography>


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
          columns={columns(undefined, handleView)}
          data={data} // Use the fetched data
          progressPending={loading} // Show loading indicator
          progressComponent={<CircularProgress />} // Custom loading component
          pagination
          paginationServer // Enable server-side pagination
          paginationTotalRows={totalRecords} // Total records from API
          onChangeRowsPerPage={handleRowsPerPageChange}
          onChangePage={handlePageChange}
          paginationComponentOptions={{
            rowsPerPageText: 'Rows per page',
            rangeSeparatorText: 'of',
            selectAllRowsItemText: 'All',
            selectAllRowsItem: 'Select All',
          }}
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
                backgroundColor: '',
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


        {/* Modal for viewing full details */}
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
                   .filter((key) => key !== 'id' && key !== 'lbcode' && key !== 'resbdno' && key !== 'lbtype' && key !== 'indexOffset') // skip resbdno & lbtype
                    .map((key) => {
                      let label = key;
                    let value = selectedRow[key] !== undefined && selectedRow[key] !== null ? selectedRow[key] : 'NA';


                      if (key === 'villageName') {
                        label = 'Village';
                      }

                      if (key === 'bcode') {
                        label = 'Village Block';
                      }

                      // Custom rendering for resvno
                      if (key === 'resvno') {
                        const resvno = selectedRow.resvno ? selectedRow.resvno : 'NA';
                        const resbdno = selectedRow.resbdno ? selectedRow.resbdno : 'NA';
                        label = 'Re-survey No.';
                        value = `${resvno} / ${resbdno}`;
                      }
                      // Custom rendering for lbname
                      if (key === 'lbname') {
                        const lbname = selectedRow.lbname ? selectedRow.lbname : 'NA';
                        const lbtype = selectedRow.lbtype ? selectedRow.lbtype : 'NA';
                        label = 'Local Body';
                        value = `${lbname} ${lbtype}`;
                      }
                      if (key === 'ltype') {
                        label = 'Land Type';
                      }
                      if (key === 'totalCent') {
                        label = 'Total Area in Cent';
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
                            {label}
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
