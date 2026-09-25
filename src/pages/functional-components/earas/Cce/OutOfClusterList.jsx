import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
  Typography,
  TextField,
  Stack,
  Paper,
  Button,
  CircularProgress,
  Grid as MuiGrid,
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

// ----------------------------------------------------------------------
// Main List Component
// ----------------------------------------------------------------------

const columns = (page, size) => [
  {
    name: 'SL. NO',
    selector: (row, index) => (page - 1) * size + index + 1,
    width: '80px',
  },
  {
    name: 'Village',
    selector: (row) => row.villageName || 'NA',
    sortable: true,
    minWidth: '120px',
  },
  {
    name: 'Village Block',
    selector: (row) => row.bcode || 'NA',
    sortable: true,
    minWidth: '130px',
  },
  {
    name: 'Panchayath',
    selector: (row) => row.localBodyName || 'NA',
    sortable: true,
    minWidth: '150px',
  },
  {
    name: 'Survey Number',
    selector: (row) => row.resvno || 'NA',
    minWidth: '140px',
  },
  {
    name: 'Sub Division No.',
    selector: (row) => row.resbdno || 'NA',
    minWidth: '150px',
  },
  {
    name: 'Cultivated Area (cents)',
    selector: (row) => row.totCent || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Actual Land Area (cents)',
    selector: (row) => row.totCent || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Season',
    selector: (row) => row.season || 'NA',
    minWidth: '100px',
  },
  {
    name: 'Land Type',
    selector: (row) => row.ltype || 'NA',
    minWidth: '120px',
  },
  {
    name: 'Cultivator Name',
    selector: (row) => row.ownername || 'NA',
    minWidth: '150px',
  },
  {
    name: 'Address',
    selector: (row) => row.address || 'NA',
    minWidth: '200px',
  },
  {
    name: 'Non-BTR Type',
    selector: (row) => {
      if (row.btrtype == 2) return 'House List';
      if (row.btrtype == 3) return 'Cultivator List';
      if (row.btrtype == 4) return 'Thandapper Number';
      if (row.btrtype == 5) return 'Old Survey Number';
      return row.btrtype || 'NA';
    },
    minWidth: '150px',
  },
  {
    name: 'Ward Number',
    selector: (row) => row.wardno || 'NA',
    minWidth: '130px',
  },
  {
    name: 'House Number',
    selector: (row) => row.houseno || 'NA',
    minWidth: '140px',
  },
  {
    name: 'Survey Number (Non-BTR)',
    selector: (row) => row.resvno || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Sub Division (Non-BTR)',
    selector: (row) => row.resbdno || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Thandapper Number',
    selector: (row) => row.tpno || 'NA',
    minWidth: '160px',
  },
  {
    name: 'Thandapper Sub Number',
    selector: (row) => row.tbsubdivisionno || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Old Survey Number',
    selector: (row) => row.oldsvno || 'NA',
    minWidth: '160px',
  },
  {
    name: 'Old Survey Sub Division',
    selector: (row) => row.oldsubno || 'NA',
    minWidth: '180px',
  },
  {
    name: 'Actual Area (cents)',
    selector: (row) => row.totCent || 'NA',
    minWidth: '160px',
  },
  {
    name: 'Enumerated Area (cents)',
    selector: (row) => row.totCent || 'NA',
    minWidth: '180px',
  },
];

const OutOfClusterList = ({ zoneId }) => {
  const [filterText, setFilterText] = useState('');
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

  const [resolvedZoneId] = useState(() => {
    const role = authservice.getrole();
    return role === 'Field Data Collector'
      ? authservice.getzone()
      : zoneId;
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_URL = mainapi.BASE_URL;
      const response = await fetch(`${BASE_URL}/btr-service/api/fetch-btr/zone/${resolvedZoneId}/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (Array.isArray(result)) {
        const nonBtrData = result.filter(item => item.btrtype && item.btrtype > 1);
        setData(nonBtrData);
        setFilteredData(nonBtrData);
        setTotalRecords(nonBtrData.length);

        const totals = nonBtrData.reduce((acc, item) => {
          const area = parseFloat(item.totCent) || 0;
          acc.totalArea += area;
          if (item.ltype === 'WET') acc.totalWetArea += area;
          else if (item.ltype === 'DRY') acc.totalDryArea += area;
          return acc;
        }, { totalArea: 0, totalWetArea: 0, totalDryArea: 0 });

        setTotalArea(totals.totalArea);
        setTotalWetArea(totals.totalWetArea);
        setTotalDryArea(totals.totalDryArea);
      } else {
        setData([]); setFilteredData([]); setTotalRecords(0);
        setTotalArea(0); setTotalWetArea(0); setTotalDryArea(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]); setFilteredData([]); setTotalRecords(0);
      setTotalArea(0); setTotalWetArea(0); setTotalDryArea(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const headers = [
        'SL. NO', 'Village', 'Village Block', 'Panchayath', 'Survey Number',
        'Sub Division No.', 'Cultivated Area (cents)', 'Actual Land Area (cents)',
        'Season', 'Land Type', 'Cultivator Name', 'Address', 'Non-BTR Type',
        'Ward Number', 'House Number', 'Survey Number (Non-BTR)', 'Sub Division (Non-BTR)',
        'Thandapper Number', 'Thandapper Sub Number', 'Old Survey Number',
        'Old Survey Sub Division', 'Actual Area (cents)', 'Enumerated Area (cents)'
      ];
      const csvData = filteredData.map((row, index) => {
        let nonBtrTypeLabel = '';
        if (row.btrtype == 2) nonBtrTypeLabel = 'House List';
        else if (row.btrtype == 3) nonBtrTypeLabel = 'Cultivator List';
        else if (row.btrtype == 4) nonBtrTypeLabel = 'Thandapper Number';
        else if (row.btrtype == 5) nonBtrTypeLabel = 'Old Survey Number';
        else nonBtrTypeLabel = row.btrtype || '';

        return [
          index + 1, row.villageName || '', row.bcode || '', row.localBodyName || '',
          row.resvno || '', row.resbdno || '', row.totCent || '', row.totCent || '',
          row.season || '', row.ltype || '', row.ownername || '', row.address || '',
          nonBtrTypeLabel, row.wardno || '', row.houseno || '', row.resvno || '',
          row.resbdno || '', row.tpno || '', row.tbsubdivisionno || '', row.oldsvno || '',
          row.oldsubno || '', row.totCent || '', row.totCent || ''
        ];
      });
      const csvContent = [headers.join(','), ...csvData.map(row => row.map(cell => typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `out_of_cluster_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  const handleFilterChange = (event) => {
    const value = event.target.value.toLowerCase();
    setFilterText(value);
    setPage(1);
    if (value === '') {
      setFilteredData(data); setTotalRecords(data.length);
    } else {
      const filtered = data.filter(item =>
        (item.localBodyName || '').toLowerCase().includes(value) ||
        (item.villageName || '').toLowerCase().includes(value) ||
        (item.bcode || '').toLowerCase().includes(value) ||
        (item.ownername || '').toLowerCase().includes(value) ||
        (item.resvno || '').toString().toLowerCase().includes(value) ||
        (item.resbdno || '').toString().toLowerCase().includes(value)
      );
      setFilteredData(filtered); setTotalRecords(filtered.length);
    }
  };

  const columnDefs = useMemo(() => columns(page, size), [page, size]);
  const paginatedData = useMemo(() => filteredData.slice((page - 1) * size, page * size), [filteredData, page, size]);

  useEffect(() => { fetchData(); }, []);


};

export default OutOfClusterList;