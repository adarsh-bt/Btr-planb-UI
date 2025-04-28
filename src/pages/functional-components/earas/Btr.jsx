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
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CircularProgress from '@mui/material/CircularProgress';

import Breadcrumb from 'routes/Breadcrumb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import btrservice from './btrservice';

// Define the columns for the data table
const columns = (handleEdit,handleView) => [
  { name: 'SL. NO', selector:(row, index) => index + 1 },
  // { name: 'District', selector: (row) => row.dcode, sortable: true },
  // { name: 'Taluk', selector: (row) => row.tcode, sortable: true },
  // { name: 'Village', selector: (row) => row.vcode, sortable: true },
  { name: 'Panchayth', selector: (row) => row.lbtype?.toString() || <span style={{ color: '#888' }}>NA</span> }, 
  { name: 'Village', selector: (row) => row.villageName?.toString() || <span style={{ color: '#888' }}>NA</span> }, 
  { name: 'Block', selector: (row) => row.bcode?.toString() || <span style={{ color: '#888' }}>NA</span> }, 
  { name: 'Survey No', selector: (row) => row.resvno?.toString() || <span style={{ color: '#888' }}>NA</span> }, 
  { name: 'Sub Div No', selector: (row) => row.resbdno?.toString() || <span style={{ color: '#888' }}>NA</span> }, 
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
      padding: '0px', // Remove unnecessary padding
      textAlign: 'center', // Align the buttons in the center
    },
  },
  // {
  //   name: 'Action',
  //   cell: (row) => (
  //     <Button color="success" onClick={() => handleEdit(row)}>
  //       <EditOutlined />
  //     </Button>
  //   ),
  //   style: {
  //     padding: '0px', // Remove unnecessary padding
  //     textAlign: 'center', // Align the buttons in the center
  //   },
  // },
 
];

// btrservice with the API call to fetch data


const Btr = () => {
  const [filterText, setFilterText] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]); // State to hold the fetched data
  const [page, setPage] = useState(0); // Current page
  const [size, setSize] = useState(10); // Number of items per page
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalWetArea, setTotalWetArea] = useState(0);
  const [totalDryArea, setTotalDryArea] = useState(0);
  const [downloading, setDownloading] = useState(false);


  // Function to handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    fetchData(event.target.value);
  };

  // Filtered data based on the filter text
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => {
        // Safely handle null or undefined values
        const stringValue = value !== null && value !== undefined ? value.toString().toLowerCase() : '';
        return stringValue.includes(filterText.toLowerCase());
    })
);

  // Function to handle edit action
  const handleEdit = (row) => {
    setSelectedRow(row); // Set the selected row to be edited
    setOpenEditModal(true); // Open the edit modal
  };

  // Function to handle view action
  const handleView = (row) => {
    setSelectedRow(row); 
    setOpenViewModal(true); 
  };

  // Function to close modals
  const handleCloseModals = () => {
    setOpenEditModal(false);
    setOpenViewModal(false);
    setSelectedRow(null); 
  };

  const handlePageChange = (newPage) => {
    setPage(newPage); 
  };
  const handleRowsPerPageChange = (newSize) => {
    setSize(newSize); 
  };
  // Fetch the data from the API when the component is mounted
  const fetchData = async (filter = '') => {

    const userid = '1605'; 
  
    // Only calculate maxPage when totalRecords is available and greater than 0
    const maxPage = totalRecords > 0 ? Math.ceil(totalRecords / size) : 1; // Default maxPage to 1 if no records yet
  
    // If the current page is beyond the maximum, adjust it to the last page
    const currentPage = page >= maxPage ? maxPage - 1 : page;
  
    console.log("Fetching data for page:", currentPage);  // Debugging: Check current page
  
    const response = await btrservice.btr_lists_data(userid, currentPage, size, filter || '');
  
    
    if (response?.payload?.data) {
      setData(response.payload.data); 
      setTotalRecords(response.payload.totalCount);  // Update total records count
      setTotalWetArea(response.payload.totalWetArea);  
      setTotalDryArea(response.payload.totalDryArea);  
      setTotalArea(response.payload.totalArea);  
    } else {
      console.error("Failed to fetch data:", response.message);
    }
  };
  

  const handleDownloadExcel = async () => {
    setDownloading(true);
    const userId = '3bc4b01d-8d4b-4c2c-94ab-50bf4fdce924'; // Get dynamically if needed
  
    try {
      const response = await fetch(`http://localhost:8082/btr-service/btr-api/export?userId=${userId}`);
  
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
  

useEffect(() => {
    fetchData(filterText);
    console.log("fli",filterText)
}, [page, size, filterText]);



  return (
    <div>
   
  <Breadcrumb />
 
      <Paper elevation={3} style={{ marginBottom: '16px', padding: '10px' }}>
      
        <Stack direction="row" justifyContent="space-between" alignItems="center">
        
          <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
            Basic Tax Register (RELIS)
          </Typography> 
           <Typography variant="body1" component="p" sx={{ color: 'green'}}>Total Wet : {totalWetArea} ac</Typography>
           <Typography variant="body1" component="p" sx={{ color: 'blue'}}>Total Dry : {totalDryArea} ac</Typography>
           <Typography variant="body1" component="p" sx={{ color: '#04255e'}}>Total Area : {totalArea} ac</Typography>


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
      backgroundColor: '#1976d2', // keep the blue background
      color: '#fff',               // keep white text
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
  columns={columns(handleEdit, handleView)}
  data={filteredData} 
  pagination
  paginationServer
  paginationTotalRows={totalRecords}  // Set the total records to manage pagination correctly
  paginationPerPage={size}
  onChangePage={handlePageChange}
  onChangeRowsPerPage={handleRowsPerPageChange}
  customStyles={{
    headCells: {
      style: {
        fontSize: '.8rem',
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
      background: '#04255e',
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
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {Object.keys(selectedRow).filter((key) => key !== 'id').map((key) => {
            const value = selectedRow[key] || 'NA'; // Display 'NA' if the value is empty or undefined
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    color: 'gray',
                    marginBottom: '8px',
                  }}
                >
                  {key}:
                </div>
                <div
                  style={{
                    backgroundColor: '#f9f9f9',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)',
                    wordBreak: 'break-word',
                    width: '100%',
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



    </div>
  );
};

export default Btr;