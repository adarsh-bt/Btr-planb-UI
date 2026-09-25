import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  TextField,
  Stack,
  InputAdornment,
  TablePagination,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import { getCurrentUserJurisdiction } from './Report/workAllocationReport/userJurisdiction';

// ──────────────────────────────────────────────
// Administrative Data & Master Structure
// ──────────────────────────────────────────────
const DISTRICT_TALUKS = {
  'Thiruvananthapuram': ['Neyyattinkara', 'Kattakada', 'Nedumangad', 'Thiruvananthapuram', 'Chirayinkeezhu'],
  'Kollam': ['Kollam', 'Kunnathur', 'Karunagappally', 'Kottarakkara', 'Pathanapuram'],
  'Pathanamthitta': ['Adoor', 'Kozhencherry', 'Mallappally', 'Ranni', 'Thiruvalla'],
  'Alappuzha': ['Ambalappuzha', 'Cherthala', 'Karthikappally', 'Kuttanad', 'Mavelikkara'],
  'Kottayam': ['Changanassery', 'Kanjirappally', 'Kottayam', 'Meenachil', 'Vaikom'],
  'Idukki': ['Devikulam', 'Idukki', 'Peerumedu', 'Thodupuzha', 'Udumbanchola'],
  'Ernakulam': ['Aluva', 'Kanayannur', 'Kochi', 'Kothamangalam', 'Kunnathunad', 'Muvattupuzha', 'North Paravur'],
  'Thrissur': ['Chavakkad', 'Kodungallur', 'Mukundapuram', 'Thalapilly', 'Thrissur'],
  'Palakkad': ['Alathur', 'Chittur', 'Mannarkad', 'Ottapalam', 'Palakkad'],
  'Malappuram': ['Ernad', 'Nilambur', 'Perinthalmanna', 'Ponnani', 'Tirur', 'Tirurangadi'],
  'Kozhikode': ['Kozhikode', 'Koyilandy', 'Thamarassery', 'Vatakara'],
  'Wayanad': ['Mananthavady', 'Sulthan Bathery', 'Vythiri'],
  'Kannur': ['Kannur', 'Taliparamba', 'Thalassery'],
  'Kasaragod': ['Hosdurg', 'Kasaragod'],
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SEASON_MONTHS = {
  Winter: ['November', 'December', 'January', 'February'],
  Summer: ['March', 'April', 'May', 'June'],
  Autumn: ['July', 'August', 'September', 'October']
};

/**
 * Generates initial deterministic mock inspection data for all Districts, Taluks, and Zones
 */
function generateInspectionMasterData() {
  const master = {};

  Object.entries(DISTRICT_TALUKS).forEach(([district, taluks], dIdx) => {
    master[district] = {
      districtName: district,
      taluks: {}
    };

    taluks.forEach((taluk, tIdx) => {
      const zones = [
        { name: `${taluk} Zone 1`, code: `ZN-${dIdx + 1}${tIdx + 1}A` },
        { name: `${taluk} Zone 2`, code: `ZN-${dIdx + 1}${tIdx + 1}B` },
        { name: `${taluk} Zone 3`, code: `ZN-${dIdx + 1}${tIdx + 1}C` },
      ];

      master[district].taluks[taluk] = {
        talukName: taluk,
        zones: zones.map(zone => {
          const monthly = {};
          MONTHS.forEach(m => {
            const f1_wet_si = Math.floor((dIdx * 3 + tIdx * 2 + m.length * 5) % 9);
            const f1_wet_tso = Math.floor((dIdx * 2 + tIdx * 3 + m.length * 3) % 7);
            const f1_wet_dlo = Math.floor((dIdx * 1 + tIdx * 1 + m.length * 2) % 5);

            const f1_dry_si = Math.floor((dIdx * 2 + tIdx * 4 + m.length * 4) % 8);
            const f1_dry_tso = Math.floor((dIdx * 3 + tIdx * 1 + m.length * 2) % 6);
            const f1_dry_dlo = Math.floor((dIdx * 1 + tIdx * 2 + m.length * 3) % 4);

            const cce_wet_si = Math.floor((dIdx * 4 + tIdx * 1 + m.length * 3) % 10);
            const cce_wet_tso = Math.floor((dIdx * 1 + tIdx * 4 + m.length * 4) % 8);
            const cce_wet_dlo = Math.floor((dIdx * 2 + tIdx * 2 + m.length * 1) % 6);

            const cce_dry_si = Math.floor((dIdx * 3 + tIdx * 3 + m.length * 2) % 9);
            const cce_dry_tso = Math.floor((dIdx * 2 + tIdx * 1 + m.length * 5) % 7);
            const cce_dry_dlo = Math.floor((dIdx * 4 + tIdx * 2 + m.length * 1) % 5);

            monthly[m] = {
              form1: {
                si: f1_wet_si + f1_dry_si,
                tso: f1_wet_tso + f1_dry_tso,
                dlo: f1_wet_dlo + f1_dry_dlo
              },
              cce: {
                si: cce_wet_si + cce_dry_si,
                tso: cce_wet_tso + cce_dry_tso,
                dlo: cce_wet_dlo + cce_dry_dlo
              }
            };
          });

          return {
            zoneName: zone.name,
            zoneCode: zone.code,
            monthlyData: monthly
          };
        })
      };
    });
  });

  return master;
}

const MASTER_INSPECTION_DATA = generateInspectionMasterData();

// ──────────────────────────────────────────────
// Main InspectionReports Component
// ──────────────────────────────────────────────
function InspectionReports() {
  const theme = useTheme();

  // ── Jurisdiction & Role Scoping ──
  const userJur = useMemo(() => getCurrentUserJurisdiction(), []);
  const userRole = authservice.getrole() || userJur.role || 'Super Admin';
  const roleName = Array.isArray(userRole) ? userRole[0] : userRole;
  const userName = authservice.getusername() || 'System User';

  // Authorization check
  const isAuthorized = useMemo(() => {
    const allowed = [
      'IT Admin', 'EARAS Admin', 'earasadmin', 'Super Admin',
      'State Level Approver', 'State Level Data Viewer',
      'District Level Approver', 'District Level Data Viewer',
      'Taluk Level Approver', 'Inspector', 'Field Inspector', 'Taluk Level Data Viewer'
    ];
    return allowed.some(r => r.toLowerCase() === String(roleName).toLowerCase());
  }, [roleName]);

  // Initial view level based on user jurisdiction level
  const defaultLevel = useMemo(() => {
    if (userJur.level === 'taluk') return 'taluk';
    if (userJur.level === 'district') return 'district';
    return 'state';
  }, [userJur.level]);

  // ── View State ──
  const [currentLevel, setCurrentLevel] = useState(defaultLevel); // 'state' | 'district' | 'taluk'
  const [selectedDistrict, setSelectedDistrict] = useState(userJur.level !== 'directorate' ? userJur.district : '');
  const [selectedTaluk, setSelectedTaluk] = useState(userJur.level === 'taluk' ? userJur.taluk : '');

  // ── Inspection Type Tab ──
  const [inspectionTab, setInspectionTab] = useState(0); // 0: Form 1 Inspection, 1: CCE Inspection

  // ── Filters (Season & Month) ──
  const [selectedSeason, setSelectedSeason] = useState(''); // '' | 'Winter' | 'Summer' | 'Autumn'
  const [filterType, setFilterType] = useState('range'); // 'range' | 'single'
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');
  const [singleMonth, setSingleMonth] = useState('');

  // ── Search & Pagination ──
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Sync state if jurisdiction changes
  useEffect(() => {
    if (userJur.level === 'district') {
      setSelectedDistrict(userJur.district);
      setCurrentLevel('district');
    } else if (userJur.level === 'taluk') {
      setSelectedDistrict(userJur.district);
      setSelectedTaluk(userJur.taluk);
      setCurrentLevel('taluk');
    }
  }, [userJur]);

  // Handle drilldown navigation
  const handleSelectDistrict = (districtName) => {
    setSelectedDistrict(districtName);
    setSelectedTaluk('');
    setCurrentLevel('district');
    setPage(0);
  };

  const handleSelectTaluk = (talukName) => {
    setSelectedTaluk(talukName);
    setCurrentLevel('taluk');
    setPage(0);
  };

  const handleBackToState = () => {
    if (userJur.level !== 'directorate') return;
    setSelectedDistrict('');
    setSelectedTaluk('');
    setCurrentLevel('state');
    setPage(0);
  };

  const handleBackToDistrict = () => {
    if (userJur.level === 'taluk') return;
    setSelectedTaluk('');
    setCurrentLevel('district');
    setPage(0);
  };

  const handleClearFilters = () => {
    setFromMonth('');
    setToMonth('');
    setSingleMonth('');
    setFilterType('range');
    setSelectedSeason('');
    setSearchTerm('');
    setPage(0);
  };

  // ── Calculate Filtered Inspection Aggregates for given Inspection Type ──
  const calculateInspectionTotals = (monthlyData, targetKey) => {
    let startIndex = 0;
    let endIndex = MONTHS.length - 1;

    let allowedMonths = MONTHS;
    if (selectedSeason) {
      allowedMonths = SEASON_MONTHS[selectedSeason] || MONTHS;
    }

    if (filterType === 'single' && singleMonth) {
      startIndex = MONTHS.indexOf(singleMonth);
      endIndex = startIndex;
    } else {
      startIndex = fromMonth ? MONTHS.indexOf(fromMonth) : 0;
      endIndex = toMonth ? MONTHS.indexOf(toMonth) : MONTHS.length - 1;
    }

    let siTotal = 0;
    let tsoTotal = 0;
    let dloTotal = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      const month = MONTHS[i];
      if (!allowedMonths.includes(month)) continue;

      const mData = monthlyData[month]?.[targetKey];
      if (!mData) continue;

      siTotal += mData.si || 0;
      tsoTotal += mData.tso || 0;
      dloTotal += mData.dlo || 0;
    }

    return {
      si: siTotal,
      tso: tsoTotal,
      dlo: dloTotal,
      total: siTotal + tsoTotal + dloTotal
    };
  };

  // Helper to generate report data array for a specific inspection type ('form1' or 'cce')
  const getReportDataForType = (typeKey) => {
    if (currentLevel === 'state') {
      return Object.entries(MASTER_INSPECTION_DATA).map(([distName, distData], idx) => {
        let si = 0, tso = 0, dlo = 0, total = 0;
        Object.values(distData.taluks).forEach(talukObj => {
          talukObj.zones.forEach(zone => {
            const counts = calculateInspectionTotals(zone.monthlyData, typeKey);
            si += counts.si;
            tso += counts.tso;
            dlo += counts.dlo;
            total += counts.total;
          });
        });
        return {
          id: idx + 1,
          name: distName,
          districtName: distName,
          si,
          tso,
          dlo,
          total
        };
      });
    }

    if (currentLevel === 'district') {
      const distObj = MASTER_INSPECTION_DATA[selectedDistrict];
      if (!distObj) return [];
      return Object.entries(distObj.taluks).map(([talukName, talukObj], idx) => {
        let si = 0, tso = 0, dlo = 0, total = 0;
        talukObj.zones.forEach(zone => {
          const counts = calculateInspectionTotals(zone.monthlyData, typeKey);
          si += counts.si;
          tso += counts.tso;
          dlo += counts.dlo;
          total += counts.total;
        });
        return {
          id: idx + 1,
          name: talukName,
          talukName,
          districtName: selectedDistrict,
          si,
          tso,
          dlo,
          total
        };
      });
    }

    if (currentLevel === 'taluk') {
      const distObj = MASTER_INSPECTION_DATA[selectedDistrict];
      const talukObj = distObj?.taluks?.[selectedTaluk];
      if (!talukObj) return [];

      return talukObj.zones.map((zone, idx) => {
        const counts = calculateInspectionTotals(zone.monthlyData, typeKey);
        return {
          id: idx + 1,
          name: zone.zoneName,
          zoneCode: zone.zoneCode,
          districtName: selectedDistrict,
          talukName: selectedTaluk,
          si: counts.si,
          tso: counts.tso,
          dlo: counts.dlo,
          total: counts.total
        };
      });
    }

    return [];
  };

  // Data for active tab in UI table
  const activeInspectionKey = inspectionTab === 0 ? 'form1' : 'cce';
  const reportTableData = useMemo(() => getReportDataForType(activeInspectionKey), [
    currentLevel, selectedDistrict, selectedTaluk, inspectionTab, selectedSeason, filterType, fromMonth, toMonth, singleMonth
  ]);

  // Filtered & Paginated Data for active view
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return reportTableData;
    const q = searchTerm.toLowerCase();
    return reportTableData.filter(row => row.name.toLowerCase().includes(q));
  }, [reportTableData, searchTerm]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  // Summary Totals for Top KPI Cards
  const overallTotals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => ({
        si: acc.si + row.si,
        tso: acc.tso + row.tso,
        dlo: acc.dlo + row.dlo,
        total: acc.total + row.total
      }),
      { si: 0, tso: 0, dlo: 0, total: 0 }
    );
  }, [filteredRows]);

  // ── Multi-Sheet Excel Download Handler ──
  const handleExportExcel = () => {
    if (exporting) return;
    setExporting(true);

    try {
      const levelTitle = currentLevel === 'state' ? 'District' : currentLevel === 'district' ? 'Taluk' : 'Zone';

      // Get full rows for both Form 1 and CCE sheets
      let form1All = getReportDataForType('form1');
      let cceAll = getReportDataForType('cce');

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        form1All = form1All.filter(r => r.name.toLowerCase().includes(q));
        cceAll = cceAll.filter(r => r.name.toLowerCase().includes(q));
      }

      const form1Totals = form1All.reduce((acc, r) => ({
        si: acc.si + r.si, tso: acc.tso + r.tso, dlo: acc.dlo + r.dlo, total: acc.total + r.total
      }), { si: 0, tso: 0, dlo: 0, total: 0 });

      const cceTotals = cceAll.reduce((acc, r) => ({
        si: acc.si + r.si, tso: acc.tso + r.tso, dlo: acc.dlo + r.dlo, total: acc.total + r.total
      }), { si: 0, tso: 0, dlo: 0, total: 0 });

      const currentDateStr = new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });

      const seasonText = selectedSeason || 'All Seasons';
      let monthText = 'All Months';
      if (filterType === 'single' && singleMonth) {
        monthText = singleMonth;
      } else if (filterType === 'range') {
        if (fromMonth && toMonth) monthText = `${fromMonth} to ${toMonth}`;
        else if (fromMonth) monthText = `From ${fromMonth}`;
        else if (toMonth) monthText = `Until ${toMonth}`;
      }

      const scopeText = currentLevel === 'state'
        ? 'State Level (All Districts)'
        : currentLevel === 'district'
          ? `District Level (${selectedDistrict})`
          : `Taluk Level (${selectedDistrict} - ${selectedTaluk})`;

      const esc = (str) => String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      // Build Multi-Sheet XML Spreadsheet 2003 Document
      const xmlDoc = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#1A237E"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1A237E" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A237E"/>
   <Interior ss:Color="#E8EAF6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="TotalRow">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A237E"/>
   <Interior ss:Color="#E8EAF6" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center"/>
  </Style>
 </Styles>

 <!-- SHEET 1: METADATA & SUMMARY -->
 <Worksheet ss:Name="Metadata &amp; Summary">
  <Table>
   <Column ss:Width="220"/>
   <Column ss:Width="280"/>
   <Row ss:Height="30">
    <Cell ss:StyleID="Title" ss:MergeAcross="1"><Data ss:Type="String">EARAS INSPECTION REPORT — METADATA &amp; ABSTRACT</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Report Metadata Section -->
   <Row><Cell ss:StyleID="SubHeader" ss:MergeAcross="1"><Data ss:Type="String">REPORT METADATA DETAILS</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Generated Date &amp; Time:</Data></Cell><Cell><Data ss:Type="String">${esc(currentDateStr)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Generated By User / Role:</Data></Cell><Cell><Data ss:Type="String">${esc(userName)} (${esc(roleName)})</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Jurisdiction Scope:</Data></Cell><Cell><Data ss:Type="String">${esc(scopeText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Season Filter:</Data></Cell><Cell><Data ss:Type="String">${esc(seasonText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Month Filter:</Data></Cell><Cell><Data ss:Type="String">${esc(monthText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Agriculture Year:</Data></Cell><Cell><Data ss:Type="String">2025-2026</Data></Cell></Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Inspection Abstract Section -->
   <Row><Cell ss:StyleID="SubHeader" ss:MergeAcross="1"><Data ss:Type="String">INSPECTION EXECUTIVE SUMMARY</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Total Form 1 Inspections:</Data></Cell><Cell><Data ss:Type="Number">${form1Totals.total}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Total CCE Inspections:</Data></Cell><Cell><Data ss:Type="Number">${cceTotals.total}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Combined Total Inspections:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="Number">${form1Totals.total + cceTotals.total}</Data></Cell></Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>
   <Row><Cell ss:StyleID="SubHeader" ss:MergeAcross="1"><Data ss:Type="String">DESIGNATION WISE BREAKDOWN</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">SI Inspections (Supervising Inspectors):</Data></Cell><Cell><Data ss:Type="Number">${form1Totals.si + cceTotals.si}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">TSO Inspections (Taluk Statistical Officers):</Data></Cell><Cell><Data ss:Type="Number">${form1Totals.tso + cceTotals.tso}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">DLO Inspections (District Level Officers):</Data></Cell><Cell><Data ss:Type="Number">${form1Totals.dlo + cceTotals.dlo}</Data></Cell></Row>
  </Table>
 </Worksheet>

 <!-- SHEET 2: FORM 1 INSPECTIONS -->
 <Worksheet ss:Name="Form 1 Inspections">
  <Table>
   <Column ss:Width="60"/>
   <Column ss:Width="200"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="170"/>
   <Row ss:Height="25">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sl. No</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">${esc(levelTitle)} Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">SI Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">TSO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">DLO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total Form 1 Inspections</Data></Cell>
   </Row>
   ${form1All.map((r, i) => `
   <Row>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(r.name)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.si}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.tso}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.dlo}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.total}</Data></Cell>
   </Row>`).join('')}
   <Row ss:Height="24">
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${form1Totals.si}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${form1Totals.tso}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${form1Totals.dlo}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${form1Totals.total}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>

 <!-- SHEET 3: CCE INSPECTIONS -->
 <Worksheet ss:Name="CCE Inspections">
  <Table>
   <Column ss:Width="60"/>
   <Column ss:Width="200"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="170"/>
   <Row ss:Height="25">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sl. No</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">${esc(levelTitle)} Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">SI Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">TSO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">DLO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total CCE Inspections</Data></Cell>
   </Row>
   ${cceAll.map((r, i) => `
   <Row>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(r.name)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.si}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.tso}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.dlo}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.total}</Data></Cell>
   </Row>`).join('')}
   <Row ss:Height="24">
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${cceTotals.si}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${cceTotals.tso}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${cceTotals.dlo}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${cceTotals.total}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([xmlDoc], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Inspection_Report_${currentLevel.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Excel download failed:', e);
    } finally {
      setExporting(false);
    }
  };

  // ── Access Denied Render ──
  if (!isAuthorized) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />
        <Grid item xs={12}>
          <Alert severity="error" sx={{ borderRadius: 2, fontSize: '1rem' }}>
            <strong>Access Restricted:</strong> Inspection Reports module is accessible only for IT Admin, EARAS Admin, and Authorized State/District/Taluk Officers.
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      {/* ── Header & Breadcrumbs ── */}
      <Grid item xs={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Back Button placed on the left side */}
            {currentLevel === 'taluk' && userJur.level !== 'taluk' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToDistrict}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, mr: 1 }}
              >
                Back to {selectedDistrict}
              </Button>
            )}
            {currentLevel === 'district' && userJur.level === 'directorate' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToState}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, mr: 1 }}
              >
                Back to All Districts
              </Button>
            )}

            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1A237E 0%, #3F51B5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(26, 35, 126, 0.25)'
              }}
            >
              <AssignmentTurnedInIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                  Inspection Reports
                </Typography>
                <Chip
                  label={currentLevel === 'state' ? 'State View' : currentLevel === 'district' ? `District: ${selectedDistrict}` : `Taluk: ${selectedTaluk}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Inspections conducted by SI, TSO, and DLO users across hierarchy levels
              </Typography>
            </Box>
          </Stack>

          {/* Export Action Button on the right side */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={handleExportExcel}
              disabled={exporting || filteredRows.length === 0}
              startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)' }
              }}
            >
              Download Excel
            </Button>
          </Stack>
        </Stack>
      </Grid>

      {/* ── Inspection Type Tabs (Form 1 Inspection / CCE Inspection) ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: '#fff' }}>
          <Tabs
            value={inspectionTab}
            onChange={(e, newVal) => { setInspectionTab(newVal); setPage(0); }}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                py: 1.8
              }
            }}
          >
            <Tab label="Form 1 Inspection Report" />
            <Tab label="CCE Inspection Report" />
          </Tabs>
        </Paper>
      </Grid>

      {/* ── Season & Month Filter Bar ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: '#fff' }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
              {/* Season Selection Dropdown */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Season</InputLabel>
                <Select
                  value={selectedSeason}
                  label="Season"
                  onChange={(e) => { setSelectedSeason(e.target.value); setPage(0); }}
                >
                  <MenuItem value="">All Seasons</MenuItem>
                  <MenuItem value="Winter">Winter</MenuItem>
                  <MenuItem value="Summer">Summer</MenuItem>
                  <MenuItem value="Autumn">Autumn</MenuItem>
                </Select>
              </FormControl>

              {/* Month Filter Type Toggle: Range vs Single Month */}
              <ToggleButtonGroup
                value={filterType}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setFilterType(newValue);
                    setFromMonth('');
                    setToMonth('');
                    setSingleMonth('');
                    setPage(0);
                  }
                }}
                size="small"
              >
                <ToggleButton value="range">Month Range</ToggleButton>
                <ToggleButton value="single">Single Month</ToggleButton>
              </ToggleButtonGroup>

              {/* Month Dropdowns */}
              {filterType === 'range' ? (
                <>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>From Month</InputLabel>
                    <Select value={fromMonth} label="From Month" onChange={(e) => { setFromMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">→</Typography>
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>To Month</InputLabel>
                    <Select value={toMonth} label="To Month" onChange={(e) => { setToMonth(e.target.value); setPage(0); }}>
                      <MenuItem value="">None</MenuItem>
                      {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                  </FormControl>
                </>
              ) : (
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select value={singleMonth} label="Select Month" onChange={(e) => { setSingleMonth(e.target.value); setPage(0); }}>
                    <MenuItem value="">None</MenuItem>
                    {MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </Select>
                </FormControl>
              )}

              {/* Clear Filters Button */}
              {(fromMonth || toMonth || singleMonth || selectedSeason) && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<ClearIcon />}
                  size="small"
                  sx={{ borderRadius: 2, ml: 'auto' }}
                >
                  Clear Filters
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* ── Summary KPI Cards ── */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#1a237e', 0.06), borderRadius: 3, border: `1px solid ${alpha('#1a237e', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                      {overallTotals.total}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1a237e', fontWeight: 600, mt: 0.5 }}>
                      Total Inspections Conducted
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 36, color: '#1a237e', opacity: 0.6 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#1565c0', 0.06), borderRadius: 3, border: `1px solid ${alpha('#1565c0', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#1565c0', fontWeight: 'bold' }}>
                      {overallTotals.si}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1565c0', fontWeight: 600, mt: 0.5 }}>
                      SI Inspections
                    </Typography>
                  </Box>
                  <Chip label="SI Users" size="small" color="primary" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#2e7d32', 0.06), borderRadius: 3, border: `1px solid ${alpha('#2e7d32', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                      {overallTotals.tso}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, mt: 0.5 }}>
                      TSO Inspections
                    </Typography>
                  </Box>
                  <Chip label="TSO Users" size="small" color="success" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: alpha('#ed6c02', 0.06), borderRadius: 3, border: `1px solid ${alpha('#ed6c02', 0.15)}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                      {overallTotals.dlo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ed6c02', fontWeight: 600, mt: 0.5 }}>
                      DLO Inspections
                    </Typography>
                  </Box>
                  <Chip label="DLO Users" size="small" color="warning" sx={{ fontWeight: 600 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* ── Table Card ── */}
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
          {/* Table Header Bar with Search */}
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e' }}>
                {inspectionTab === 0 ? 'Form 1' : 'CCE'} Inspection Records — {currentLevel === 'state' ? 'State Overview (Districts)' : currentLevel === 'district' ? `District: ${selectedDistrict} (Taluks)` : `Taluk: ${selectedTaluk} (Zones)`}
              </Typography>
              <TextField
                placeholder={`Search ${currentLevel === 'state' ? 'districts' : currentLevel === 'district' ? 'taluks' : 'zones'}…`}
                size="small"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                sx={{ width: { xs: '100%', sm: 260 }, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
          </Box>

          {/* Table */}
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700, width: 80 }}>Sl. No</TableCell>
                  <TableCell sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    {currentLevel === 'state' ? 'District Name' : currentLevel === 'district' ? 'Taluk Name' : 'Zone Name / Code'}
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    SI Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    TSO Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    DLO Inspections
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700 }}>
                    Total Inspections Conducted
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: '#1a237e', color: '#fff', fontWeight: 700, width: 140 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No inspection records found matching the active filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, idx) => (
                    <TableRow key={row.id || idx} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fcfcfd' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationOnIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                          <span>{row.name}</span>
                          {row.zoneCode && (
                            <Chip label={row.zoneCode} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.si} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.tso} size="small" color="success" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={row.dlo} size="small" color="warning" variant="outlined" sx={{ fontWeight: 700, minWidth: 45 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.total}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            minWidth: 55,
                            bgcolor: alpha('#1a237e', 0.12),
                            color: '#1a237e'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {currentLevel === 'state' && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleSelectDistrict(row.name)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {currentLevel === 'district' && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleSelectTaluk(row.name)}
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {currentLevel === 'taluk' && (
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              sx={{ color: '#04255e', '&:hover': { bgcolor: alpha('#04255e', 0.1) } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newP) => setPage(newP)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default InspectionReports;
