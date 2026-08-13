import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ParkIcon from '@mui/icons-material/Park';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
/* ─────────────────────────── api ─────────────────────────── */

const WA_BASE = `${mainapi.BTR_API}/btr-service`;

// The WA endpoints ignore unknown query params (Spring). Flip to false if the
// backend ever starts validating query strings.
const SEND_AGRI_YEAR = true;

const authHeader = () => {
  const token = AuthService.gettoken ? AuthService.gettoken() : localStorage.getItem('token');
  if (!token) throw new Error('Authentication session token missing. Please log in again.');
  return { Authorization: `Bearer ${token}` };
};

const withAgriYear = (url) =>
  SEND_AGRI_YEAR ? `${url}?agriYear=${encodeURIComponent(AuthService.agriyear() || '2025-2026')}` : url;

/* ─────────────────────── jurisdiction (inlined) ─────────────────────── */

const TALUK_ROLES = ['Field Inspector', 'Taluk Level Data Viewer', 'Taluk Level Approver'];
const DISTRICT_ROLES = ['District Level Data Viewer', 'District Level Approver'];

function getUserJurisdiction() {
  let role = localStorage.getItem('des') || AuthService.getrole() || 'State Level Approver';
  if (Array.isArray(role)) role = role[0];
  const r = String(role).toLowerCase();

  let level = 'directorate';
  if (TALUK_ROLES.some((x) => x.toLowerCase() === r)) level = 'taluk';
  else if (DISTRICT_ROLES.some((x) => x.toLowerCase() === r)) level = 'district';

  return {
    user: AuthService.getusername() || localStorage.getItem('user') || 'System User',
    role,
    level, // 'directorate' | 'district' | 'taluk'
    district: localStorage.getItem('userDistrict') || localStorage.getItem('dis') || '',
    taluk: localStorage.getItem('userTaluk') || ''
  };
}

/* ─────────────────── payload → flat row ─────────────────── */

// Backend shape (identical at state / district / taluk level):
// { id, name, blockId, blockName, panchayathId, panchayathName,
//   villageRecords:             { wet, dry, total },
//   excludedArea:               { forestArea, plantationArea, areaOfWaterBodies, others },
//   areaAvailableForEstimation: { noOfPlots: { wet, dry, total }, areaInCents: { wet, dry, total } } }
function normalizeLocation(loc = {}, idx = 0) {
  const n = (v) => Number(v) || 0;

  const vr = loc.villageRecords || {};
  const ex = loc.excludedArea || {};
  const av = loc.areaAvailableForEstimation || {};
  const plots = av.noOfPlots || {};
  const area = av.areaInCents || {};

  const wetInCents = n(vr.wet);
  const dryInCents = n(vr.dry);
  const plotsWet = n(plots.wet);
  const plotsDry = n(plots.dry);
  const availWetArea = n(area.wet);
  const availDryArea = n(area.dry);

  return {
    id: loc.id ?? `loc_${idx}`,
    name: loc.name || '',
    blockId: loc.blockId ?? null,
    blockName: loc.blockName || '',
    panchayathName: loc.panchayathName || '',
    wetInCents,
    dryInCents,
    totalInCents: n(vr.total) || wetInCents + dryInCents,
    forestAreas: n(ex.forestArea),
    plantationArea: n(ex.plantationArea),
    waterBodiesArea: n(ex.areaOfWaterBodies),
    otherAreas: n(ex.others),
    plotsWet,
    plotsDry,
    plotsTotal: n(plots.total) || plotsWet + plotsDry,
    availWetArea,
    availDryArea,
    availTotalArea: n(area.total) || availWetArea + availDryArea
  };
}

/* ─────────────────── tabs / columns (drive the original layout) ─────────────────── */

const TAB_DEFS = [
  {
    key: 'village',
    label: 'Area As Per Village Records',
    icon: <AssessmentIcon sx={{ fontSize: 20, color: '#1976d2' }} />,
    loadingText: 'Loading Work Allocation data...',
    groups: [
      {
        label: 'Area as per village records (in cents)',
        columns: [
          { key: 'wetInCents', label: 'Wet in Cents', variant: 'plain' },
          { key: 'dryInCents', label: 'Dry in cents', variant: 'plain' },
          {
            key: 'totalInCents',
            label: 'Total in cents',
            variant: 'green',
            fixed: true,
            totalSx: { color: '#1b5e20', fontWeight: 800, fontSize: '1rem' }
          }
        ]
      }
    ]
  },
  {
    key: 'excluded',
    label: 'Excluded Areas',
    icon: <ParkIcon sx={{ fontSize: 20, color: '#2e7d32' }} />,
    loadingText: 'Loading Excluded Areas data...',
    uppercase: true,
    groups: [
      {
        label: null,
        columns: [
          { key: 'forestAreas', label: 'Forest Areas', variant: 'compact' },
          { key: 'plantationArea', label: 'Plantation Area', variant: 'compact' },
          {
            key: 'waterBodiesArea',
            label: 'Area of Water Bodies',
            variant: 'compact',
            totalSx: { color: '#0288d1', fontWeight: 700 }
          },
          { key: 'otherAreas', label: 'Other Areas', variant: 'compact' }
        ]
      }
    ]
  },
  {
    key: 'estimation',
    label: 'Area Available For Estimation',
    icon: <AssignmentIcon sx={{ fontSize: 20, color: '#ed6c02' }} />,
    loadingText: 'Loading Estimation Area data...',
    groups: [
      {
        label: 'Number of Plots Available for Estimation',
        columns: [
          { key: 'plotsWet', label: 'Wet', exportLabel: 'Plots (Wet)', variant: 'plots' },
          { key: 'plotsDry', label: 'Dry', exportLabel: 'Plots (Dry)', variant: 'plots' },
          {
            key: 'plotsTotal',
            label: 'Total',
            exportLabel: 'Plots (Total)',
            variant: 'plotsTotal',
            groupEnd: true,
            totalSx: { fontWeight: 800 }
          }
        ]
      },
      {
        label: 'Area (in cents) Available for Estimation',
        columns: [
          {
            key: 'availWetArea',
            label: 'Wet',
            exportLabel: 'Area Wet (cents)',
            variant: 'blue',
            fixed: true,
            totalSx: { color: '#0d47a1', fontWeight: 700 }
          },
          {
            key: 'availDryArea',
            label: 'Dry',
            exportLabel: 'Area Dry (cents)',
            variant: 'blue',
            fixed: true,
            totalSx: { color: '#0d47a1', fontWeight: 700 }
          },
          {
            key: 'availTotalArea',
            label: 'Total',
            exportLabel: 'Area Total (cents)',
            variant: 'blueTotal',
            fixed: true,
            groupEnd: true,
            totalSx: { color: '#0d47a1', fontWeight: 800 }
          }
        ]
      },
      { label: null, columns: [{ key: '__remarks', label: 'Remarks', type: 'remarks' }] }
    ]
  }
];

const leafColumns = (tab) => tab.groups.flatMap((g) => g.columns);
const hasGroupHeader = (tab) => tab.groups.some((g) => Boolean(g.label));
const METRIC_KEYS = TAB_DEFS.flatMap((t) => leafColumns(t))
  .filter((c) => c.type !== 'remarks')
  .map((c) => c.key);

/* ─────────────────── cell / header styling (as approved) ─────────────────── */

const CELL_SX = {
  plain: { p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, textAlign: 'center', maxWidth: 160, mx: 'auto', fontSize: '0.9rem' },
  compact: { p: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, textAlign: 'center', maxWidth: 140, mx: 'auto' },
  green: { p: 1, bgcolor: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9', borderRadius: 1.5, textAlign: 'center', maxWidth: 180, mx: 'auto', fontWeight: 700, fontSize: '0.95rem' },
  plots: { p: 0.8, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, textAlign: 'center', fontSize: '0.85rem' },
  plotsTotal: { p: 0.8, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 1.5, textAlign: 'center', fontWeight: 600, fontSize: '0.85rem' },
  blue: { p: 0.8, bgcolor: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: 1.5, textAlign: 'center', fontSize: '0.85rem' },
  blueTotal: { p: 0.8, bgcolor: '#e3f2fd', color: '#0d47a1', border: '1px solid #90caf9', borderRadius: 1.5, textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }
};

const TH_TEXT = {
  fontWeight: 'bold',
  fontSize: '0.9rem',
  color: '#333',
  borderRight: '1px solid #e0e0e0',
  borderBottom: '1px solid #8e8a8aff'
};
const TH_GROUP = { fontWeight: 'bold', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #e0e0e0' };
const TH_SUB = { fontWeight: 'bold', fontSize: '0.8rem', color: '#555', borderBottom: '1px solid #8e8a8aff' };
const TH_FLAT = { fontWeight: 'bold', fontSize: '0.85rem', color: '#333', borderBottom: '1px solid #8e8a8aff' };
const TD_TOTAL_TOP = '1px solid #8e8a8aff';

const cellValue = (row, col) => {
  const v = Number(row[col.key] || 0);
  return col.fixed ? v.toFixed(2) : v;
};

const DataBox = ({ row, col }) =>
  col.type === 'remarks' ? (
    <Box sx={{ p: 1, bgcolor: '#fdfdfd', border: '1px dashed #cccccc', borderRadius: 1.5, minHeight: 32 }} />
  ) : (
    <Box sx={CELL_SX[col.variant]}>{cellValue(row, col)}</Box>
  );

/* ─────────────────── zone grouping helpers ─────────────────── */

// A "zone group" = every panchayat / municipality / corporation row that belongs
// to the same Block + Zone Name pair.
const zoneKeyOf = (r) => `${r.blockName || 'General Block'}||${r.name || 'N/A'}`;

const sumMetrics = (rowsArr) => {
  const acc = {};
  METRIC_KEYS.forEach((k) => {
    acc[k] = rowsArr.reduce((s, r) => s + Number(r[k] || 0), 0);
  });
  return acc;
};

// Aggregated per zone over the WHOLE filtered set (not just the current page), so
// a zone whose panchayats straddle a page boundary still reports a correct subtotal.
function buildZoneIndex(allRows) {
  const buckets = new Map();
  allRows.forEach((r) => {
    const key = zoneKeyOf(r);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(r);
  });

  const index = new Map();
  buckets.forEach((members, key) => {
    index.set(key, {
      count: members.length,
      lastId: members[members.length - 1].id,
      totals: sumMetrics(members)
    });
  });
  return index;
}

// Flatten the current page into render items: data rows plus a synthetic subtotal
// row after any zone that holds more than one panchayat. Subtotal rows carry the
// same metric keys as data rows, so DataBox / the exporter need no special casing.
function buildDisplayItems(pageRows, zoneIndex) {
  const items = [];
  let i = 0;

  while (i < pageRows.length) {
    const key = zoneKeyOf(pageRows[i]);
    let j = i;
    while (j < pageRows.length && zoneKeyOf(pageRows[j]) === key) j++;

    const group = pageRows.slice(i, j);
    const info =
      zoneIndex.get(key) || { count: group.length, lastId: group[group.length - 1].id, totals: sumMetrics(group) };

    // Only emit the subtotal on the page that holds the zone's final panchayat.
    const showSubtotal = info.count > 1 && group[group.length - 1].id === info.lastId;
    const zoneSpan = group.length + (showSubtotal ? 1 : 0);

    group.forEach((row, k) => {
      items.push({
        kind: 'data',
        row,
        blockName: row.blockName || 'General Block',
        zoneKey: key,
        zoneName: row.name || 'N/A',
        zoneStart: k === 0,
        zoneSpan: k === 0 ? zoneSpan : 0,
        zoneMerged: zoneSpan > 1
      });
    });

    if (showSubtotal) {
      items.push({
        kind: 'subtotal',
        row: { id: `${key}__subtotal`, ...info.totals },
        blockName: group[0].blockName || 'General Block',
        zoneKey: key,
        zoneName: group[0].name || 'N/A',
        label: `Zone Total (${info.count} Panchayats)`
      });
    }

    i = j;
  }

  return items;
}

// Block cells are merged with rowSpan, which only works while a block's rows are
// contiguous — so compute the spans against the items actually on this page.
function getBlockSpanInfo(items) {
  const spanMap = {};
  let currentBlock = null;
  let count = 0;
  let startIndex = 0;

  for (let i = 0; i < items.length; i++) {
    const bName = items[i].blockName || 'Unassigned';
    if (bName !== currentBlock) {
      if (currentBlock !== null) spanMap[startIndex] = count;
      currentBlock = bName;
      startIndex = i;
      count = 1;
    } else {
      count++;
    }
  }
  if (currentBlock !== null) spanMap[startIndex] = count;
  return spanMap;
}

// Export mirrors the table: zone subtotal pseudo-rows interleaved into the data.
function buildExportRows(allRows) {
  const out = [];
  let i = 0;

  while (i < allRows.length) {
    const key = zoneKeyOf(allRows[i]);
    let j = i;
    while (j < allRows.length && zoneKeyOf(allRows[j]) === key) j++;

    const group = allRows.slice(i, j);
    group.forEach((r) => out.push(r));

    if (group.length > 1) {
      out.push({
        ...sumMetrics(group),
        __subtotal: true,
        id: `${key}__export_subtotal`,
        blockName: group[0].blockName,
        name: group[0].name,
        panchayathName: `Zone Subtotal (${group.length} Panchayats)`
      });
    }

    i = j;
  }

  return out;
}

/* ─────────────────── SpreadsheetML export (same .xls the client signed off) ─────────────────── */

const xmlEscape = (str) =>
  str === null || str === undefined
    ? ''
    : String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const XML_STYLE_FOR = { green: 'GreenHighlight', blue: 'BlueHighlight', blueTotal: 'BlueHighlight' };

// textColumns: [{ label, get(row) }] — District / Taluk / Block+Zone+Panchayat.
function downloadWorkAllocationXls({ textColumns, rows, totals, totalLabels, reportLevelName, username, recordCount }) {
  const downloadTime = new Date().toLocaleString('en-IN', { timeZoneName: 'short' });

  const sheets = TAB_DEFS.map((tab, tabIndex) => {
    const cols = leafColumns(tab);
    const upper = (s) => (tab.uppercase ? String(s).toUpperCase() : s);

    let body = `
      <Row ss:Height="24">
        ${textColumns
          .map((tc) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(upper(tc.label))}</Data></Cell>`)
          .join('')}
        ${cols
          .map(
            (c) =>
              `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(upper(c.exportLabel || c.label))}</Data></Cell>`
          )
          .join('')}
      </Row>
    `;

    rows.forEach((row) => {
      const rowAttr = row.__subtotal ? ' ss:StyleID="ZoneSubtotal"' : '';
      body += `
        <Row${rowAttr}>
          ${textColumns
            .map((tc) => `<Cell><Data ss:Type="String">${xmlEscape(tc.get(row) || 'N/A')}</Data></Cell>`)
            .join('')}
          ${cols
            .map((c) => {
              if (c.type === 'remarks') return '<Cell><Data ss:Type="String"></Data></Cell>';
              const style = XML_STYLE_FOR[c.variant];
              return `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="Number">${cellValue(row, c)}</Data></Cell>`;
            })
            .join('')}
        </Row>
      `;
    });

    body += `
      <Row ss:StyleID="BoldRow">
        ${textColumns
          .map(
            (tc, i) =>
              `<Cell><Data ss:Type="String">${xmlEscape(i === textColumns.length - 1 ? totalLabels[tabIndex] : 'Total')}</Data></Cell>`
          )
          .join('')}
        ${cols
          .map((c) => {
            if (c.type === 'remarks') return '<Cell><Data ss:Type="String"></Data></Cell>';
            const style = XML_STYLE_FOR[c.variant];
            const v = c.fixed ? Number(totals[c.key] || 0).toFixed(2) : Number(totals[c.key] || 0);
            return `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="Number">${v}</Data></Cell>`;
          })
          .join('')}
      </Row>
    `;

    return { name: tab.label, body };
  });

  const metaRows = [
    ['Report Module', 'Work Allocation Abstract Progress Report'],
    ['Geographical Level / View', reportLevelName],
    ['Agricultural Year', AuthService.agriyear() || ''],
    ['Downloaded By User', username],
    ['Download Timestamp', downloadTime],
    ['Total Records Exported', String(recordCount ?? rows.length)],
    ['Zone Subtotal Rows Included', String(rows.filter((r) => r.__subtotal).length)],
    ['Worksheets Contained', '1. Area As Per Village Records, 2. Excluded Areas, 3. Area Available For Estimation, 4. Metadata'],
    ['Source Platform', 'AIDeA BTR EARAS System']
  ]
    .map(
      ([k, v]) => `
      <Row>
        <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${xmlEscape(k)}</Data></Cell>
        <Cell><Data ss:Type="String">${xmlEscape(v)}</Data></Cell>
      </Row>`
    )
    .join('');

  const xmlWorkbook = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Author>${xmlEscape(username)}</Author>
  <Created>${new Date().toISOString()}</Created>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#1976D2" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="MetaHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#0D47A1" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F5F5F5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldRow">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <Interior ss:Color="#F0F4F8" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="ZoneSubtotal">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#04255E" ss:Bold="1" ss:Italic="1"/>
   <Interior ss:Color="#F7FAFF" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="GreenHighlight">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1B5E20" ss:Bold="1"/>
   <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BlueHighlight">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0D47A1" ss:Bold="1"/>
   <Interior ss:Color="#E3F2FD" ss:Pattern="Solid"/>
  </Style>
 </Styles>
${sheets
  .map(
    (s) => ` <Worksheet ss:Name="${xmlEscape(s.name)}">
  <Table>
   ${s.body}
  </Table>
 </Worksheet>`
  )
  .join('\n')}
 <Worksheet ss:Name="Metadata">
  <Table>
   <Row ss:Height="24">
    <Cell ss:StyleID="MetaHeader"><Data ss:Type="String">Metadata Attribute</Data></Cell>
    <Cell ss:StyleID="MetaHeader"><Data ss:Type="String">Attribute Value / System Information</Data></Cell>
   </Row>
   ${metaRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlWorkbook], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Work_Allocation_Abstract_${reportLevelName.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const TEXT_COLS = [
  { label: 'Block', width: '15%', align: 'center', get: (r) => r.blockName || 'General Block' },
  { label: 'Zone Name', width: '12%', get: (r) => r.name },
  { label: 'Panchayat / Municipality / Corporation', width: '25%', get: (r) => r.panchayathName }
];
const TOTAL_LABELS = ['Summary Total', 'Total Excluded Summary', 'Total Available Summary'];

/* ─────────────────────────── component ─────────────────────────── */

function ZoneWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName: rawDistrictName, talukName: rawTalukName } = useParams();

  const districtName = decodeURIComponent(rawDistrictName || '');
  const talukName = decodeURIComponent(rawTalukName || '');

  const jurisdiction = useMemo(() => getUserJurisdiction(), []);

  const stateDistrictId = location.state?.districtId ?? location.state?.districtData?.id ?? null;
  const stateTalukId = location.state?.talukId ?? location.state?.talukData?.id ?? null;
  const resolvedTalukId = useRef(stateTalukId);

  const [rows, setRows] = useState([]);
  const [summaryPlots, setSummaryPlots] = useState({ wet: 0, dry: 0, total: 0 });
  const [summaryArea, setSummaryArea] = useState({ wet: 0, dry: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tab = TAB_DEFS[activeTab];
  const columns = leafColumns(tab);

  // On a direct/refresh load neither id is in navigation state, so walk
  // state list → taluk list once and cache the result in a ref.
  const resolveTalukId = useCallback(async () => {
    if (resolvedTalukId.current) return resolvedTalukId.current;

    let districtId = stateDistrictId;
    if (!districtId) {
      const stateRes = await axios.get(withAgriYear(`${WA_BASE}/api/report/work-allocation-progress`), {
        headers: authHeader()
      });
      const districts = Array.isArray(stateRes.data?.locations) ? stateRes.data.locations : [];
      districtId = districts.find((d) => String(d.name).toLowerCase() === districtName.toLowerCase())?.id ?? null;
    }
    if (!districtId) return null;

    const talukRes = await axios.get(
      withAgriYear(`${WA_BASE}/api/report/work-allocation-progress/${districtId}`),
      { headers: authHeader() }
    );
    const taluks = Array.isArray(talukRes.data?.locations) ? talukRes.data.locations : [];
    resolvedTalukId.current =
      taluks.find((t) => String(t.name).toLowerCase() === talukName.toLowerCase())?.id ?? null;
    return resolvedTalukId.current;
  }, [stateDistrictId, districtName, talukName]);

  const fetchZoneWorkAllocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const talukId = await resolveTalukId();
      if (!talukId) throw new Error(`Could not resolve Taluk ID for "${talukName}".`);

      const res = await axios.get(
        withAgriYear(`${WA_BASE}/api/report/work-allocation-progress/taluk/${talukId}`),
        { headers: authHeader() }
      );
      const data = res.data || {};
      setSummaryPlots(data.noOfPlots || { wet: 0, dry: 0, total: 0 });
      setSummaryArea(data.areaAvailableForEstimation || { wet: 0, dry: 0, total: 0 });

      const mapped = (Array.isArray(data.locations) ? data.locations : []).map(normalizeLocation);
      // Keep blocks — and zones inside each block — contiguous so the merged
      // Block / Zone cells and the zone subtotal rows render correctly.
      mapped.sort(
        (a, b) =>
          String(a.blockName).localeCompare(String(b.blockName)) ||
          String(a.name).localeCompare(String(b.name)) ||
          String(a.panchayathName).localeCompare(String(b.panchayathName))
      );
      setRows(mapped);
    } catch (err) {
      console.error('Error fetching Zone work allocation report:', err);
      setError(err.response?.data?.message || err.message || 'Error loading zone work allocation report data.');
    } finally {
      setLoading(false);
    }
  }, [talukName, resolveTalukId]);

  useEffect(() => {
    fetchZoneWorkAllocation();
  }, [fetchZoneWorkAllocation]);

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.name).toLowerCase().includes(q) ||
        String(r.blockName).toLowerCase().includes(q) ||
        String(r.panchayathName).toLowerCase().includes(q)
    );
  }, [rows, searchTerm]);

  const paginatedData = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  const zoneIndex = useMemo(() => buildZoneIndex(filteredData), [filteredData]);

  const displayItems = useMemo(() => buildDisplayItems(paginatedData, zoneIndex), [paginatedData, zoneIndex]);

  const blockSpans = useMemo(() => getBlockSpanInfo(displayItems), [displayItems]);

  const multiPanchayatZones = useMemo(() => {
    let c = 0;
    zoneIndex.forEach((info) => {
      if (info.count > 1) c++;
    });
    return c;
  }, [zoneIndex]);

  const totals = useMemo(() => {
    const acc = {};
    METRIC_KEYS.forEach((k) => {
      acc[k] = filteredData.reduce((s, r) => s + Number(r[k] || 0), 0);
    });
    return acc;
  }, [filteredData]);

  const totalPlotsWet = Number(summaryPlots.wet) || totals.plotsWet || 0;
  const totalPlotsDry = Number(summaryPlots.dry) || totals.plotsDry || 0;
  const totalPlotsTotal = Number(summaryPlots.total) || totalPlotsWet + totalPlotsDry;
  const totalAreaWet = Number(summaryArea.wet) || totals.availWetArea || 0;
  const totalAreaDry = Number(summaryArea.dry) || totals.availDryArea || 0;
  const totalAreaTotal = Number(summaryArea.total) || totalAreaWet + totalAreaDry;

  const reportLevelName = `${talukName} Taluk (${districtName} District) Report (${jurisdiction.role})`;

  const handleExportExcel = () =>
    downloadWorkAllocationXls({
      textColumns: TEXT_COLS,
      rows: buildExportRows(filteredData),
      totals,
      totalLabels: TOTAL_LABELS,
      reportLevelName,
      username: jurisdiction.user,
      recordCount: filteredData.length
    });

  const colSpanAll = TEXT_COLS.length + columns.length;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {jurisdiction.level !== 'taluk' && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  navigate(`/report/kerala_work_allocation_report/taluk/${encodeURIComponent(districtName)}`, {
                    state: { districtId: stateDistrictId, districtName }
                  })
                }
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Back to {districtName} Taluks
              </Button>
            )}
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {talukName} Taluk ({districtName} District) - Zone / Panchayat Report
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchZoneWorkAllocation}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Compact Summary Cards */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationCityIcon sx={{ color: '#1976d2', mr: 0.8, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                Number of Plots Available for Estimation
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e3f2fd', borderRadius: 1.5, border: '1px solid #bbdefb', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Wet
                  </Typography>
                  <Typography sx={{ color: '#0d47a1', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalPlotsWet.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#fff3e0', borderRadius: 1.5, border: '1px solid #ffe0b2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Dry
                  </Typography>
                  <Typography sx={{ color: '#e65100', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalPlotsDry.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e8f5e9', borderRadius: 1.5, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Total
                  </Typography>
                  <Typography sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalPlotsTotal.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LandscapeIcon sx={{ color: '#2e7d32', mr: 0.8, fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', fontSize: '0.95rem' }}>
                Area (in cents) Available for Estimation
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e3f2fd', borderRadius: 1.5, border: '1px solid #bbdefb', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Wet
                  </Typography>
                  <Typography sx={{ color: '#0d47a1', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalAreaWet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#fff3e0', borderRadius: 1.5, border: '1px solid #ffe0b2', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Dry
                  </Typography>
                  <Typography sx={{ color: '#e65100', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalAreaDry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ py: 0.8, px: 1, bgcolor: '#e8f5e9', borderRadius: 1.5, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block' }}>
                    Total
                  </Typography>
                  <Typography sx={{ color: '#1b5e20', fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, mt: 0.3 }}>
                    {loading ? <CircularProgress size={16} /> : totalAreaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Main Table Card */}
      <Grid item xs={12}>
        <MainCard title={`Work Allocation Abstract - Panchayats / Municipalities of ${talukName} (${rows.length} Zones)`}>
          <Box sx={{ width: '100%' }}>
            {/* Search + records chip + download */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search Block / Zone / Panchayat..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                sx={{ width: { xs: '100%', sm: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => { setSearchTerm(''); setPage(0); }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Stack direction="row" spacing={1.5} alignItems="center">
                {multiPanchayatZones > 0 && (
                  <Chip
                    label={`${multiPanchayatZones} Multi-Panchayat Zone${multiPanchayatZones > 1 ? 's' : ''}`}
                    size="small"
                    sx={{ fontWeight: 700, borderRadius: 2, bgcolor: '#f7faff', color: '#04255e', border: '1px solid #cfe0f5' }}
                  />
                )}
                <Chip
                  label={`Showing ${filteredData.length} Records`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', borderRadius: 2 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: '#2e7d32',
                    '&:hover': { bgcolor: '#1b5e20' },
                    boxShadow: '0 2px 6px rgba(46, 125, 50, 0.3)'
                  }}
                  onClick={handleExportExcel}
                >
                  Download Excel
                </Button>
              </Stack>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => { setActiveTab(v); setPage(0); }}
                aria-label="Work Allocation Tabs"
                sx={{
                  minHeight: '48px',
                  '& .MuiTabs-indicator': { height: '3.5px', borderRadius: '3px 3px 0 0', backgroundColor: '#1976d2' },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: '48px',
                    padding: '8px 20px',
                    marginRight: 1,
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.2s ease',
                    color: '#555',
                    '&.Mui-selected': { color: '#1976d2', backgroundColor: '#e3f2fd', fontWeight: 700 },
                    '&:hover': { backgroundColor: '#f5f5f5', color: '#1976d2' }
                  }
                }}
              >
                {TAB_DEFS.map((t) => (
                  <Tab key={t.key} icon={t.icon} iconPosition="start" label={t.label} />
                ))}
              </Tabs>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    {TEXT_COLS.map((tc) => (
                      <TableCell
                        key={tc.label}
                        rowSpan={hasGroupHeader(tab) ? 2 : 1}
                        align={tc.align || 'inherit'}
                        sx={{ ...TH_TEXT, width: tc.width, ...(tab.uppercase ? { fontSize: '0.85rem', textTransform: 'uppercase' } : {}) }}
                      >
                        {tc.label}
                      </TableCell>
                    ))}
                    {tab.groups.map((g, gi) =>
                      g.label ? (
                        <TableCell
                          key={gi}
                          colSpan={g.columns.length}
                          align="center"
                          sx={{ ...TH_GROUP, ...(gi < tab.groups.length - 1 ? { borderRight: '1px solid #e0e0e0' } : {}) }}
                        >
                          {g.label}
                        </TableCell>
                      ) : (
                        g.columns.map((c) => (
                          <TableCell
                            key={c.key}
                            rowSpan={hasGroupHeader(tab) ? 2 : 1}
                            align="center"
                            sx={{ ...TH_FLAT, ...(tab.uppercase ? { textTransform: 'uppercase' } : {}) }}
                          >
                            {c.label}
                          </TableCell>
                        ))
                      )
                    )}
                  </TableRow>
                  {hasGroupHeader(tab) && (
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      {tab.groups
                        .filter((g) => g.label)
                        .flatMap((g) => g.columns)
                        .map((c) => (
                          <TableCell
                            key={c.key}
                            align="center"
                            sx={{ ...TH_SUB, ...(c.groupEnd ? { borderRight: '1px solid #e0e0e0' } : {}) }}
                          >
                            {c.label}
                          </TableCell>
                        ))}
                    </TableRow>
                  )}
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={colSpanAll} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                          {tab.loadingText}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : displayItems.length > 0 ? (
                    displayItems.map((item, index) => {
                      const isBlockStart = blockSpans[index] !== undefined;
                      const nextItem = displayItems[index + 1];
                      const isLastRowOfBlock = !nextItem || nextItem.blockName !== item.blockName;
                      const isLastRowOfZone = !nextItem || nextItem.zoneKey !== item.zoneKey;
                      const rowBorderBottom = isLastRowOfBlock
                        ? '1px solid #8e8a8aff'
                        : isLastRowOfZone
                          ? '1px solid #c5cdd6'
                          : '1px solid #e0e0e0';

                      /* ── Zone Subtotal row (only for zones with >1 panchayat) ── */
                      if (item.kind === 'subtotal') {
                        return (
                          <TableRow key={item.row.id} sx={{ bgcolor: '#f7faff' }}>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontStyle: 'italic',
                                fontSize: '0.9rem',
                                color: '#04255e',
                                borderRight: '1px solid #f0f0f0',
                                borderBottom: rowBorderBottom
                              }}
                            >
                              {item.label}
                            </TableCell>
                            {columns.map((c) => (
                              <TableCell
                                key={c.key}
                                align="center"
                                sx={{ borderBottom: rowBorderBottom, ...(c.groupEnd ? { borderRight: '1px solid #f0f0f0' } : {}) }}
                              >
                                {c.type === 'remarks' ? null : (
                                  <Box sx={{ p: 1, ...(c.totalSx || { fontWeight: 700 }) }}>
                                    {c.fixed ? Number(item.row[c.key] || 0).toFixed(2) : Number(item.row[c.key] || 0)}
                                  </Box>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }

                      /* ── Normal data row ── */
                      const row = item.row;
                      const blockNameVal = item.blockName;

                      return (
                        <TableRow key={row.id ?? index} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                          {isBlockStart && (
                            <TableCell
                              rowSpan={blockSpans[index]}
                              align="center"
                              sx={{
                                fontWeight: 700,
                                color: '#04255e',
                                bgcolor: '#f5f7fa',
                                borderRight: '1px solid #e0e0e0',
                                borderBottom: '1px solid #8e8a8aff',
                                verticalAlign: 'middle'
                              }}
                            >
                              {blockNameVal}
                            </TableCell>
                          )}
                          {item.zoneStart && (
                            <TableCell
                              rowSpan={item.zoneSpan}
                              sx={{
                                fontWeight: 600,
                                borderRight: '1px solid #f0f0f0',
                                borderBottom: item.zoneMerged ? '1px solid #c5cdd6' : rowBorderBottom,
                                color: '#1976d2',
                                ...(item.zoneMerged ? { verticalAlign: 'middle', textAlign: 'center', bgcolor: '#fbfcff' } : {})
                              }}
                            >
                              {row.name || 'N/A'}
                            </TableCell>
                          )}
                          <TableCell sx={{ fontWeight: 500, borderRight: '1px solid #f0f0f0', borderBottom: rowBorderBottom }}>
                            {row.panchayathName || 'N/A'}
                          </TableCell>
                          {columns.map((c) => (
                            <TableCell
                              key={c.key}
                              align="center"
                              sx={{ borderBottom: rowBorderBottom, ...(c.groupEnd ? { borderRight: '1px solid #f0f0f0' } : {}) }}
                            >
                              <DataBox row={row} col={c} />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={colSpanAll} align="center" sx={{ py: 3, color: '#888' }}>
                        No data available
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Total Summary Row */}
                  {!loading && filteredData.length > 0 && (
                    <TableRow sx={{ bgcolor: '#f0f4f8', fontWeight: 'bold' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#04255e', borderTop: TD_TOTAL_TOP }}>
                        Total
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1976d2', borderTop: TD_TOTAL_TOP }}>
                        All Zones
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.95rem', borderTop: TD_TOTAL_TOP }}>
                        {TOTAL_LABELS[activeTab]}
                      </TableCell>
                      {columns.map((c) => (
                        <TableCell
                          key={c.key}
                          align="center"
                          sx={{ borderTop: TD_TOTAL_TOP, ...(c.groupEnd ? { borderRight: '1px solid #e0e0e0' } : {}) }}
                        >
                          {c.type === 'remarks' ? null : (
                            <Box sx={{ p: 1, ...(c.totalSx || { fontWeight: 700 }) }}>
                              {c.fixed ? Number(totals[c.key] || 0).toFixed(2) : Number(totals[c.key] || 0)}
                            </Box>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ZoneWorkAllocationReport;