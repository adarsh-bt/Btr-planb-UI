import React, { useState, useEffect,useMemo } from 'react';
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
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import Breadcrumb from 'routes/Breadcrumb';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import btrservice from './btrservice';
import authservice from 'pages/authentication/services/authservice';

// Expandable Edit Table Component
const ExpandableEditTable = ({ onCancel }) => {
  const [rows, setRows] = useState([
    { falseSurveyNo: '', subNo: '', name: '', address: '', landType: '', area: '' }
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { falseSurveyNo: '', subNo: '', name: '', address: '', landType: '', area: '' }
    ]);
  };

  const handleChange = (idx, field, value) => {
    const updated = [...rows];
    updated[idx][field] = value;
    setRows(updated);
  };

  const handleSubmit = () => {
    alert('Submit clicked! (UI only)');
    if (onCancel) onCancel();
  };

  return (
    <Box sx={{ padding: 2, background: '#f5f5f5', borderRadius: 2, margin: 1 }}>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>SL.NO</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>False Survey Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sub No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Land Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Area</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Add Row">
                    <IconButton color="primary" onClick={handleAddRow}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Submit">
                    <IconButton color="success" onClick={handleSubmit}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.falseSurveyNo}
                    onChange={e => handleChange(idx, 'falseSurveyNo', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.subNo}
                    onChange={e => handleChange(idx, 'subNo', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.name}
                    onChange={e => handleChange(idx, 'name', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.address}
                    onChange={e => handleChange(idx, 'address', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.landType}
                    onChange={e => handleChange(idx, 'landType', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={row.area}
                    onChange={e => handleChange(idx, 'area', e.target.value)}
                  />
                </TableCell>
                <TableCell /> {/* Empty cell for alignment */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button variant="outlined" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

// Columns definition with MC (Edit) column
const columns = ({
  handleEdit,
  handleView,
  page,
  size
}) => [
  {
    name: 'SL. NO',
    selector: (row, index) => (page - 1) * size + index + 1,
  },
  { name: 'LocalBody Name', selector: (row) => row.lbname?.toString() || <span style={{ color: '#888' }}>NA</span> },
  {
    name: 'Village',
    selector: (row) => {
      const name = row.villageName?.toString();
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : <span style={{ color: '#888' }}>NA</span>;
    }
  },
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
      ),
    sortable: true
  },
  { name: 'Land Type', selector: (row) => row.ltype?.toString() || <span style={{ color: '#888' }}>NA</span>, sortable: true },
  { name: 'Total area(cent)', selector: (row) => row.totalCent?.toString() || <span style={{ color: '#888' }}>NA</span>, sortable: true },
  // --- MC column with Edit icon ---
  {
    name: (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        MC
      </Box>
    ),
    cell: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <IconButton
          color="primary"
          onClick={() => row.totalCent > 20 && row.handleEdit(row)}
          disabled={!(row.totalCent > 20)}
        >
          <EditIcon />
        </IconButton>
      </Box>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true
  },
  // --- View column ---
  {
    name: (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        View
      </Box>
    ),
    cell: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <Button color="success" onClick={() => row.handleView(row)}>
          <VisibilityIcon />
        </Button>
      </Box>
    ),
  }
];

const Btr = () => {
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

  // Expanded row state for editing
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
    setPage(1);
  };

  // Handle view action
  const handleView = (row) => {
    setSelectedRow(row);
    setOpenViewModal(true);
  };

  // Handle edit action (expand row)
  const handleEdit = (row) => {
    setExpandedRowId(row.id); // Assuming each row has a unique 'id'
  };

  // Collapse expanded row
  const handleCollapseEdit = () => {
    setExpandedRowId(null);
  };

  // Fetch data from API (same as before)
  const fetchData = async () => {
    setLoading(true);
    const userid = '1605';
    try {
      const apiPage = page - 1;
      const response = await btrservice.btr_lists_data(userid, apiPage, size, filterText);
      if (response?.payload?.data) {
        // Inject handlers for each row so MC/View buttons work
        const indexedData = response.payload.data.map((item, index) => ({
          ...item,
          indexOffset: (page - 1) * size,
          handleEdit,
          handleView
        }));
        setData(indexedData);
        setTotalRecords(response.payload.totalCount);
        setTotalWetArea(response.payload.totalWetArea);
        setTotalDryArea(response.payload.totalDryArea);
        setTotalArea(response.payload.totalArea);
      } else {
        setData([]);
        setTotalRecords(0);
      }
    } catch (error) {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    const userId = authservice.userid();
    try {
      const response = await fetch(`http://localhost:8083/btr-service/btr-api/export?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'btr_data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, size, filterText]);

  return (    
    <Grid container spacing={3}>
      <Breadcrumb />
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff'
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ marginBottom: '20px' }}
          >
            <Typography variant="h5" style={{ fontWeight: 'bold', color: '#333' }}>
              Basic Tax Register
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'green' }}>
              Total Wet : {totalWetArea} Ac
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: 'red' }}>
              Total Dry : {totalDryArea} Ac
            </Typography>
            <Typography variant="body1" component="p" sx={{ color: '#04255e' }}>
              Total Area : {totalArea} Ac
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadExcel}
              disabled={downloading}
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
              sx={{
                backgroundColor: downloading ? '#1976d2' : undefined,
                opacity: downloading ? 0.8 : 1,
                pointerEvents: downloading ? 'none' : 'auto',
                color: '#fff',
                '&.Mui-disabled': {
                  backgroundColor: '#1976d2',
                  color: '#fff'
                }
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
              sx={{ width: '200px' }}
            />
          </Stack>

          {/* Custom Table with manual expandable rows */}
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {columns({ handleEdit, handleView, page, size }).map((col, idx) => (
                      <TableCell key={idx} style={{ fontWeight: 'bold', background: '#04255e', color: '#fff' }}>
                        {col.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, rowIdx) => (
                    <React.Fragment key={row.id || rowIdx}>
                      <TableRow>
                        {columns({ handleEdit, handleView, page, size }).map((col, colIdx) => (
                          <TableCell key={colIdx}>
                            {typeof col.selector === 'function'
                              ? col.selector(row, rowIdx)
                              : col.cell
                                ? col.cell(row)
                                : null}
                          </TableCell>
                        ))}
                      </TableRow>
                      {/* Render expandable content below the row if expanded */}
                      {expandedRowId === row.id && (
                        <TableRow>
                          <TableCell colSpan={columns({ handleEdit, handleView, page, size }).length}>
                            <ExpandableEditTable onCancel={handleCollapseEdit} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>

          {/* Modal for viewing full details */}
          <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="md" fullWidth>
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

                        if (key === 'villageName') {
                          label = 'Village';
                        }
                        if (key === 'bcode') {
                          label = 'Village Block';
                        }
                        if (key === 'resvno') {
                          const resvno = selectedRow.resvno ? selectedRow.resvno : 'NA';
                          const resbdno = selectedRow.resbdno ? selectedRow.resbdno : 'NA';
                          label = 'Re-survey No.';
                          value = `${resvno} / ${resbdno}`;
                        }
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
              <Button onClick={() => setOpenViewModal(false)} color="secondary" variant="outlined">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Btr;
