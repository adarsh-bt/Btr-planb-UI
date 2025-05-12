import React, {useEffect,useState,useMemo} from 'react';

import axios from "axios";
import {
  Button,
  CircularProgress,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  Tab,
  Tabs,
  
} from "@mui/material";
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import './earascss/zone_deta.css'
import SampleTable from './earascss/SampleTable';


const KeyPlot = () => {
  const [loading, setLoading] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const [orderBy, setOrderBy] = useState('slNo');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [plotData, setPlotData] = useState([]);
  const [dryData,setDryData] = useState([]);
  const [wetData,setWetData] = useState([]);
  const [tab, setTab] = useState(0);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const sortedData = useMemo(() => {
    return [...plotData].sort(getComparator(order, orderBy));
  }, [plotData, order, orderBy]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const totalArea = plotData.reduce((sum, row) => sum + parseFloat(row.area || 0), 0).toFixed(2);

  const handleGenerateKeyplot = async () => {
    setLoading(true);
    setDataVisible(false);
  
    try {
      const res = await axios.get("http://localhost:8082/btr-service/btr-api/key-plots/3bc4b01d-8d4b-4c2c-94ab-50bf4fdce924");
  
      const zones = res.data.payload || [];
  
      // Flatten and merge wet & dry samples from all zones
      const allWetSamples = zones.flatMap(zone => zone.wetSamples || []);
      const allDrySamples = zones.flatMap(zone => zone.drySamples || []);
  
      const transformSample = (sample, type) => ({
        slNo: sample["Sl.No"],
        syNo: sample["Sy. No"],
        panchayth: sample["panchayth"],
        area: sample["Area (Cents)"],
        villageBlock: sample["Village/Block"],
        reserveList: type === "wet" ? "Wet" : "Dry",
        action: "View Cluster"
      });
  
      const wetData = allWetSamples.map(sample => transformSample(sample, "wet"));
      const dryData = allDrySamples.map(sample => transformSample(sample, "dry"));
      setDryData(dryData);
      setWetData(wetData);
      
      setPlotData([...wetData, ...dryData]);
  
      setTimeout(() => {
        setDataVisible(true);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Failed to fetch keyplot data", error);
      setLoading(false);
    }
  };
  

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        KeyPlot
      </Typography>

      {!dataVisible && (
        <Box display="flex" justifyContent="center" mb={2}>
          <Button variant="contained" onClick={handleGenerateKeyplot} disabled={loading}>
            Generate Keyplot
          </Button>
        </Box>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}

      {dataVisible && (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          {/* Tabs */}
          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
            <Tab label="Dry Samples" />
            <Tab label="Wet Samples" />
          </Tabs>

          {/* Conditional Rendering for Dry/Wet Samples */}
          {tab === 0 && <SampleTable data={dryData} />}
          {tab === 1 && <SampleTable data={wetData} />}

        

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <TablePagination
              component="div"
              count={plotData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>

          {/* Form Entry Button */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Button variant="contained" color="primary" sx={{ px: 4, py: 1.5 }}>
              Form Entry
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default KeyPlot;