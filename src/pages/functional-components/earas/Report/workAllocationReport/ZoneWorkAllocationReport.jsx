import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
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
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
/* ─────────────────────────── api ─────────────────────────── */

const WA_BASE = `${mainapi.BTR_API}/btr-service`;

// The WA endpoints ignore unknown query params (Spring). Flip to false if the
// backend ever starts validating query strings.
const SEND_AGRI_YEAR = true;

// Shared Work Allocation visual system — same as State and Taluk pages.
const UI_COLORS = {
  primary: '#1976d2',
  primaryDark: '#0d47a1',
  green: '#2e7d32',
  greenDark: '#1b5e20',
  info: '#0288d1',
  orange: '#ed6c02',
  orangeDark: '#e65100',
  headerBg: '#f8f9fa',
  headerText: '#333333',
  subHeaderText: '#555555',
  border: '#e0e0e0',
  strongBorder: '#8e8a8aff',
  subtotalBg: '#f7faff',
  subtotalText: '#04255e'
};

const HEADER_ROW_HEIGHT = 48;
const BLOCK_COLUMN_WIDTH = 150;
const ZONE_COLUMN_WIDTH = 165;
const LOCAL_BODY_COLUMN_WIDTH = 285;

const TAB_META = [
  {
    shortLabel: 'Village Records',
    description: 'Wet, dry and total area recorded in village records.',
    accent: UI_COLORS.primary
  },
  {
    shortLabel: 'Excluded Areas',
    description: 'Forest, plantation, water-body and other excluded areas, split by wet and dry land.',
    accent: UI_COLORS.green
  },
  {
    shortLabel: 'Available for Estimation',
    description: 'Plots, clusters and area currently available for estimation.',
    accent: UI_COLORS.orange
  }
];

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
  const clusters = av.noOfClusters || {};

  const wetInCents = n(vr.wet);
  const dryInCents = n(vr.dry);
  const plotsWet = n(plots.wet);
  const plotsDry = n(plots.dry);
  const clustersWet = n(clusters.wet);
  const clustersDry = n(clusters.dry);
  const availWetArea = n(area.wet);
  const availDryArea = n(area.dry);

  // Backward-compatible Excluded Areas:
  // Supports new split keys: forestAreaWet / forestAreaDry, plantationAreaWet / plantationAreaDry, etc.
  // Falls back to previous single keys: forestArea, plantationArea, areaOfWaterBodies, others.
  const forestWet = n(ex.forestAreaWet);
  const forestDry = n(ex.forestAreaDry);
  const forestAreas = (ex.forestAreaWet !== undefined || ex.forestAreaDry !== undefined)
    ? forestWet + forestDry
    : n(ex.forestArea);

  const plantationWet = n(ex.plantationAreaWet);
  const plantationDry = n(ex.plantationAreaDry);
  const plantationArea = (ex.plantationAreaWet !== undefined || ex.plantationAreaDry !== undefined)
    ? plantationWet + plantationDry
    : n(ex.plantationArea);

  const waterBodiesWet = n(ex.areaOfWaterBodiesWet);
  const waterBodiesDry = n(ex.areaOfWaterBodiesDry);
  const waterBodiesArea = (ex.areaOfWaterBodiesWet !== undefined || ex.areaOfWaterBodiesDry !== undefined)
    ? waterBodiesWet + waterBodiesDry
    : n(ex.areaOfWaterBodies);

  const othersWet = n(ex.othersWet);
  const othersDry = n(ex.othersDry);
  const otherAreas = (ex.othersWet !== undefined || ex.othersDry !== undefined)
    ? othersWet + othersDry
    : n(ex.others);

  const explicitPanchayath =
    loc.panchayathName ||
    loc.panchayatName ||
    loc.panchayath ||
    loc.panchayat ||
    loc.localBody ||
    loc.localbodyName ||
    loc.localBodyName ||
    '';

  // If panchayathName is explicitly provided, use blockName for block and explicitPanchayath for panchayat.
  // If panchayathName is missing (e.g. older payload where localbody was mapped into blockName),
  // fallback to loc.blockName so that Panchayat is never displayed as 'N/A'.
  const hasExplicitPanchayath = Boolean(explicitPanchayath);
  const panchayathName = hasExplicitPanchayath ? explicitPanchayath : (loc.blockName || loc.name || '');
  const blockName = hasExplicitPanchayath
    ? (loc.blockName || 'General Block')
    : (loc.blockName && loc.blockName !== panchayathName ? loc.blockName : 'General Block');

  return {
    id: loc.id ?? `loc_${idx}`,
    name: loc.name || '',
    blockId: loc.blockId ?? null,
    blockName,
    panchayathName,
    wetInCents,
    dryInCents,
    totalInCents: n(vr.total) || wetInCents + dryInCents,
    forestAreas,
    forestWet,
    forestDry,
    forestAreaWet: forestWet,
    forestAreaDry: forestDry,
    plantationArea,
    plantationWet,
    plantationDry,
    plantationAreaWet: plantationWet,
    plantationAreaDry: plantationDry,
    waterBodiesArea,
    waterBodiesWet,
    waterBodiesDry,
    areaOfWaterBodiesWet: waterBodiesWet,
    areaOfWaterBodiesDry: waterBodiesDry,
    otherAreas,
    othersWet,
    othersDry,
    plotsWet,
    plotsDry,
    plotsTotal: n(plots.total) || plotsWet + plotsDry,
    clustersWet,
    clustersDry,
    clustersTotal: n(clusters.total) || clustersWet + clustersDry,
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
        label: 'Forest Areas',
        columns: [
          { key: 'forestAreaWet', label: 'Wet', exportLabel: 'Forest (Wet)', variant: 'plots', fixed: true },
          { key: 'forestAreaDry', label: 'Dry', exportLabel: 'Forest (Dry)', variant: 'plots', fixed: true },
          {
            key: 'forestAreas',
            label: 'Total',
            exportLabel: 'Forest (Total)',
            variant: 'plotsTotal',
            fixed: true,
            groupEnd: true,
            totalSx: { fontWeight: 800 }
          }
        ]
      },
      {
        label: 'Plantation Area',
        columns: [
          { key: 'plantationAreaWet', label: 'Wet', exportLabel: 'Plantation (Wet)', variant: 'plots', fixed: true },
          { key: 'plantationAreaDry', label: 'Dry', exportLabel: 'Plantation (Dry)', variant: 'plots', fixed: true },
          {
            key: 'plantationArea',
            label: 'Total',
            exportLabel: 'Plantation (Total)',
            variant: 'plotsTotal',
            fixed: true,
            groupEnd: true,
            totalSx: { fontWeight: 800 }
          }
        ]
      },
      {
        label: 'Area of Water Bodies',
        columns: [
          { key: 'areaOfWaterBodiesWet', label: 'Wet', exportLabel: 'Water Bodies (Wet)', variant: 'plots', fixed: true },
          { key: 'areaOfWaterBodiesDry', label: 'Dry', exportLabel: 'Water Bodies (Dry)', variant: 'plots', fixed: true },
          {
            key: 'waterBodiesArea',
            label: 'Total',
            exportLabel: 'Water Bodies (Total)',
            variant: 'plotsTotal',
            fixed: true,
            groupEnd: true,
            totalSx: { color: '#0288d1', fontWeight: 800 }
          }
        ]
      },
      {
        label: 'Other Areas',
        columns: [
          { key: 'othersWet', label: 'Wet', exportLabel: 'Others (Wet)', variant: 'plots', fixed: true },
          { key: 'othersDry', label: 'Dry', exportLabel: 'Others (Dry)', variant: 'plots', fixed: true },
          {
            key: 'otherAreas',
            label: 'Total',
            exportLabel: 'Others (Total)',
            variant: 'plotsTotal',
            fixed: true,
            groupEnd: true,
            totalSx: { fontWeight: 800 }
          }
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
        label: 'Number of Clusters Available for Estimation',
        columns: [
          { key: 'clustersWet', label: 'Wet', exportLabel: 'Clusters (Wet)', variant: 'plots' },
          { key: 'clustersDry', label: 'Dry', exportLabel: 'Clusters (Dry)', variant: 'plots' },
          {
            key: 'clustersTotal',
            label: 'Total',
            exportLabel: 'Clusters (Total)',
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

const formatMetric = (value, fixed = false) =>
  Number(value || 0).toLocaleString(
    undefined,
    fixed
      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      : { maximumFractionDigits: 2 }
  );

const DataBox = ({ row, col, total = false }) => {
  if (col.type === 'remarks') {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  const value = Number(row[col.key] || 0);
  const key = String(col.key || '').toLowerCase();
  const isWet = key.includes('wet');
  const isDry = key.includes('dry');
  const isTotal =
    col.groupEnd ||
    col.variant === 'green' ||
    col.variant === 'plotsTotal' ||
    col.variant === 'blueTotal';

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color:
          value === 0
            ? 'text.secondary'
            : isWet
              ? UI_COLORS.primaryDark
              : isDry
                ? UI_COLORS.orangeDark
                : 'text.primary',
        fontWeight: total || isTotal ? 700 : value > 0 ? 550 : 400,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {formatMetric(value, col.fixed)}
    </Typography>
  );
};

function SummaryMetricCard({ label, total, wet, dry, unit, color, icon, loading }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2.5,
        border: `1px solid ${alpha(color, 0.15)}`,
        bgcolor: 'background.paper'
      }}
    >
      <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
            >
              {label}
            </Typography>

            <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.45 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1,
                  color,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color }} /> : formatMetric(total)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {unit}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color,
              bgcolor: alpha(color, 0.09),
              flex: '0 0 auto'
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Wet
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.1, fontWeight: 700, color: UI_COLORS.primaryDark, fontVariantNumeric: 'tabular-nums' }}
            >
              {loading ? '…' : formatMetric(wet)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Dry
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.1, fontWeight: 700, color: UI_COLORS.orangeDark, fontVariantNumeric: 'tabular-nums' }}
            >
              {loading ? '…' : formatMetric(dry)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function AreaOverviewCard({ total, wet, dry, loading }) {
  const theme = useTheme();

  const totalValue = Math.max(Number(total || 0), 0);
  const wetValue = Math.max(Number(wet || 0), 0);
  const dryValue = Math.max(Number(dry || 0), 0);

  const wetPercent = totalValue > 0 ? Math.min((wetValue / totalValue) * 100, 100) : 0;
  const dryPercent = totalValue > 0 ? Math.min((dryValue / totalValue) * 100, 100) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(UI_COLORS.green, 0.2)}`,
        background: `linear-gradient(135deg, ${alpha(UI_COLORS.green, 0.09)} 0%, ${alpha(
          UI_COLORS.primary,
          0.03
        )} 100%)`
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.25 }, '&:last-child': { pb: { xs: 2, md: 2.25 } } }}>
        <Stack spacing={1.6}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Area Available for Estimation
              </Typography>

              <Stack direction="row" alignItems="baseline" spacing={0.8}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1,
                    color: UI_COLORS.greenDark,
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="success" /> : formatMetric(totalValue, true)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  cents
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: UI_COLORS.green,
                bgcolor: alpha(UI_COLORS.green, 0.11)
              }}
            >
              <LandscapeIcon fontSize="small" />
            </Box>
          </Stack>

          <Box>
            <Box
              sx={{
                display: 'flex',
                height: 8,
                borderRadius: 99,
                overflow: 'hidden',
                bgcolor: alpha(theme.palette.grey[500], 0.12)
              }}
            >
              <Box sx={{ width: `${wetPercent}%`, bgcolor: UI_COLORS.primary }} />
              <Box sx={{ width: `${dryPercent}%`, bgcolor: UI_COLORS.orange }} />
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              spacing={0.5}
              sx={{ mt: 0.75 }}
            >
              <Typography variant="caption" color="text.secondary">
                Wet: <strong>{formatMetric(wetValue, true)}</strong> cents
                {totalValue > 0 ? ` (${wetPercent.toFixed(1)}%)` : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dry: <strong>{formatMetric(dryValue, true)}</strong> cents
                {totalValue > 0 ? ` (${dryPercent.toFixed(1)}%)` : ''}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MobileMetric({ label, row, col, total = false }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ mt: 0.15 }}>
        <DataBox row={row} col={col} total={total} />
      </Box>
    </Box>
  );
}

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
  { label: 'Panchayat / Municipality / Corporation', width: '25%', get: (r) => r.panchayathName || 'N/A' }
];
const TOTAL_LABELS = ['Summary Total', 'Total Excluded Summary', 'Total Available Summary'];

/* ─────────────────────────── component ─────────────────────────── */

function ZoneWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [summaryClusters, setSummaryClusters] = useState({ wet: 0, dry: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tab = TAB_DEFS[activeTab];
  const columns = leafColumns(tab);
  const tabMeta = TAB_META[activeTab];
  const activeAccent = tabMeta.accent;

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
      setSummaryClusters(data.noOfClusters || { wet: 0, dry: 0, total: 0 });

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

  const calculateTotals = useCallback((sourceRows) => {
    const acc = {};
    METRIC_KEYS.forEach((key) => {
      acc[key] = sourceRows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
    });
    return acc;
  }, []);

  const talukTotals = useMemo(() => calculateTotals(rows), [calculateTotals, rows]);
  const totals = useMemo(() => calculateTotals(filteredData), [calculateTotals, filteredData]);

  const summaryValue = (summary, key, fallback) => {
    if (summary && summary[key] !== undefined && summary[key] !== null) {
      const value = Number(summary[key]);
      return Number.isNaN(value) ? fallback : value;
    }
    return fallback;
  };

  const totalPlotsWet = summaryValue(summaryPlots, 'wet', talukTotals.plotsWet || 0);
  const totalPlotsDry = summaryValue(summaryPlots, 'dry', talukTotals.plotsDry || 0);
  const totalPlotsTotal = summaryValue(summaryPlots, 'total', totalPlotsWet + totalPlotsDry);

  const totalClustersWet = summaryValue(summaryClusters, 'wet', talukTotals.clustersWet || 0);
  const totalClustersDry = summaryValue(summaryClusters, 'dry', talukTotals.clustersDry || 0);
  const totalClustersTotal = summaryValue(summaryClusters, 'total', totalClustersWet + totalClustersDry);

  const totalAreaWet = summaryValue(summaryArea, 'wet', talukTotals.availWetArea || 0);
  const totalAreaDry = summaryValue(summaryArea, 'dry', talukTotals.availDryArea || 0);
  const totalAreaTotal = summaryValue(summaryArea, 'total', totalAreaWet + totalAreaDry);

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

  const blockCount = useMemo(
    () => new Set(rows.map((row) => row.blockName || 'General Block')).size,
    [rows]
  );

  const zoneCount = useMemo(
    () => new Set(rows.map((row) => zoneKeyOf(row))).size,
    [rows]
  );

  const initialLoading = loading && rows.length === 0 && !error;

  const stickyLeftForTextColumn = (index) => {
    if (index === 0) return 0;
    if (index === 1) return BLOCK_COLUMN_WIDTH;
    return BLOCK_COLUMN_WIDTH + ZONE_COLUMN_WIDTH;
  };

  const widthForTextColumn = (index) => {
    if (index === 0) return BLOCK_COLUMN_WIDTH;
    if (index === 1) return ZONE_COLUMN_WIDTH;
    return LOCAL_BODY_COLUMN_WIDTH;
  };

  if (initialLoading) {
    return (
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: 420 }}
      >
        <Grid item>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading zone-wise work allocation report…
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb />
      </Grid>

      {/* Page header — same visual structure as State/Taluk pages */}
      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            {jurisdiction.level !== 'taluk' && (
              <IconButton
                size="small"
                aria-label={`Back to ${districtName} taluks`}
                onClick={() =>
                  navigate(`/report/kerala_work_allocation_report/taluk/${encodeURIComponent(districtName)}`, {
                    state: { districtId: stateDistrictId, districtName }
                  })
                }
                sx={{
                  width: 38,
                  height: 38,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.25,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: alpha(UI_COLORS.primary, 0.09),
                flex: '0 0 auto'
              }}
            >
              <AssignmentIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 750, lineHeight: 1.2 }}>
                Work Allocation Abstract
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                {districtName} District
                {' • '}
                {talukName} Taluk
                {' • '}
                Agricultural Year {AuthService.agriyear() || '2025-2026'}
                {' • '}
                {zoneCount} Zones
                {' • '}
                {rows.length} Local Bodies
                {loading ? ' • Refreshing…' : ''}
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={15} /> : <RefreshIcon />}
            onClick={fetchZoneWorkAllocation}
            disabled={loading}
            sx={{ minHeight: 38, width: { xs: '100%', sm: 'auto' } }}
          >
            Refresh
          </Button>
        </Stack>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert
            severity={rows.length ? 'warning' : 'error'}
            onClose={() => setError(null)}
            action={
              <Button color="inherit" size="small" onClick={fetchZoneWorkAllocation}>
                Retry
              </Button>
            }
          >
            {rows.length
              ? `The latest refresh failed. The previously loaded data remains visible. ${error}`
              : error}
          </Alert>
        </Grid>
      )}

      {/* Taluk summary — same hierarchy as State/Taluk pages */}
      <Grid item xs={12}>
        <Box sx={{ mb: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Taluk Summary
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Current estimation availability across {talukName} Taluk
            {' • '}
            {blockCount} Blocks
            {' • '}
            {zoneCount} Zones
            {' • '}
            {rows.length} Local Bodies
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)'
            },
            gap: 1.5,
            opacity: loading ? 0.7 : 1,
            transition: theme.transitions.create('opacity')
          }}
        >
          <AreaOverviewCard
            total={totalAreaTotal}
            wet={totalAreaWet}
            dry={totalAreaDry}
            loading={loading}
          />

          <SummaryMetricCard
            label="Plots for Estimation"
            total={totalPlotsTotal}
            wet={totalPlotsWet}
            dry={totalPlotsDry}
            unit="plots"
            color={UI_COLORS.primary}
            icon={<LocationCityIcon fontSize="small" />}
            loading={loading}
          />

          <SummaryMetricCard
            label="Clusters for Estimation"
            total={totalClustersTotal}
            wet={totalClustersWet}
            dry={totalClustersDry}
            unit="clusters"
            color={UI_COLORS.info}
            icon={<ViewModuleIcon fontSize="small" />}
            loading={loading}
          />
        </Box>
      </Grid>

      {/* Zone / Local Body report */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          {loading && <LinearProgress aria-label="Refreshing zone-wise work allocation data" />}

          {/* Toolbar */}
          <Box sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', lg: 'center' }}
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Zone / Local Body Work Allocation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {filteredData.length} of {rows.length} local bodies shown
                  {' • '}
                  {zoneCount} zones
                </Typography>
              </Box>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <TextField
                  size="small"
                  label="Search"
                  placeholder="Block, zone or local body"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(0);
                  }}
                  sx={{ width: { xs: '100%', sm: 280 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label="Clear search"
                          onClick={() => {
                            setSearchTerm('');
                            setPage(0);
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />

                {multiPanchayatZones > 0 && (
                  <Chip
                    label={`${multiPanchayatZones} Multi-Panchayat Zone${multiPanchayatZones > 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      minHeight: 32,
                      fontWeight: 650,
                      color: UI_COLORS.subtotalText,
                      borderColor: '#cfe0f5',
                      bgcolor: UI_COLORS.subtotalBg
                    }}
                  />
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportExcel}
                  disabled={!filteredData.length || loading}
                  sx={{ minHeight: 40, whiteSpace: 'nowrap' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Tabs */}
          <Box
            sx={{
              px: { xs: 1, md: 1.5 },
              bgcolor: alpha(activeAccent, 0.025),
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, value) => {
                setActiveTab(value);
                setPage(0);
              }}
              aria-label="Work allocation report sections"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 50,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  bgcolor: activeAccent
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 50,
                  px: { xs: 1.25, md: 2 },
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: activeAccent,
                    bgcolor: alpha(activeAccent, 0.08)
                  }
                }
              }}
            >
              {TAB_DEFS.map((definition, index) => (
                <Tab
                  key={definition.key}
                  icon={definition.icon}
                  iconPosition="start"
                  label={TAB_META[index].shortLabel}
                />
              ))}
            </Tabs>
          </Box>

          {/* Active section context */}
          <Box sx={{ px: { xs: 1.5, md: 2 }, py: 1.25, bgcolor: 'background.paper' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={0.75}
            >
              <Stack direction="row" spacing={0.9} alignItems="center">
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: activeAccent,
                    bgcolor: alpha(activeAccent, 0.08)
                  }}
                >
                  {React.cloneElement(tab.icon, { sx: { fontSize: 17, color: activeAccent } })}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {tab.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {tabMeta.description}
                  </Typography>
                </Box>
              </Stack>

              {!isMobile && (
                <Typography variant="caption" color="text.secondary">
                  Block, Zone and Local Body stay fixed while metrics scroll horizontally
                </Typography>
              )}
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              opacity: loading && rows.length ? 0.62 : 1,
              pointerEvents: loading && rows.length ? 'none' : 'auto',
              transition: theme.transitions.create('opacity')
            }}
          >
            {isMobile ? (
              <Stack spacing={1.25} sx={{ p: 1.5 }}>
                {displayItems.length > 0 ? (
                  displayItems.map((item, index) => {
                    if (item.kind === 'subtotal') {
                      return (
                        <Card
                          key={item.row.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 2.25,
                            bgcolor: UI_COLORS.subtotalBg,
                            borderColor: '#cfe0f5'
                          }}
                        >
                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 750, fontStyle: 'italic', color: UI_COLORS.subtotalText }}
                            >
                              {item.zoneName} — {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.blockName}
                            </Typography>

                            <Stack spacing={1.4} sx={{ mt: 1.25 }}>
                              {tab.groups.map((group, groupIndex) => (
                                <Box key={group.label || `subtotal-group-${groupIndex}`}>
                                  {group.label && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: 'block',
                                        mb: 0.65,
                                        fontWeight: 700,
                                        color: 'text.secondary',
                                        textTransform: tab.uppercase ? 'uppercase' : 'none'
                                      }}
                                    >
                                      {group.label}
                                    </Typography>
                                  )}

                                  <Box
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns:
                                        group.columns.length >= 3
                                          ? 'repeat(3, minmax(0, 1fr))'
                                          : 'repeat(2, minmax(0, 1fr))',
                                      gap: 1
                                    }}
                                  >
                                    {group.columns.map((col) => (
                                      <MobileMetric
                                        key={col.key}
                                        label={col.label}
                                        row={item.row}
                                        col={col}
                                        total
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    }

                    const row = item.row;

                    return (
                      <Card key={row.id ?? index} variant="outlined" sx={{ borderRadius: 2.25 }}>
                        <CardContent sx={{ p: 1.6, '&:last-child': { pb: 1.6 } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {row.panchayathName || 'N/A'}
                          </Typography>

                          <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ mt: 0.45 }}>
                            <Chip
                              size="small"
                              label={item.blockName}
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.68rem' }}
                            />
                            <Chip
                              size="small"
                              label={`Zone: ${item.zoneName}`}
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                color: UI_COLORS.primaryDark,
                                borderColor: alpha(UI_COLORS.primary, 0.28)
                              }}
                            />
                          </Stack>

                          <Stack spacing={1.4} sx={{ mt: 1.5 }}>
                            {tab.groups.map((group, groupIndex) => (
                              <Box key={group.label || `group-${groupIndex}`}>
                                {group.label && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: 'block',
                                      mb: 0.65,
                                      fontWeight: 700,
                                      color: 'text.secondary',
                                      textTransform: tab.uppercase ? 'uppercase' : 'none'
                                    }}
                                  >
                                    {group.label}
                                  </Typography>
                                )}

                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                      group.columns.length >= 3
                                        ? 'repeat(3, minmax(0, 1fr))'
                                        : 'repeat(2, minmax(0, 1fr))',
                                    gap: 1
                                  }}
                                >
                                  {group.columns.map((col) => (
                                    <MobileMetric
                                      key={col.key}
                                      label={col.label}
                                      row={row}
                                      col={col}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                    <SearchIcon sx={{ fontSize: 38, color: 'text.disabled' }} />
                    <Typography variant="subtitle1" sx={{ mt: 0.75, fontWeight: 600 }}>
                      No matching records
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try another block, zone or local-body name.
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <TableContainer
                sx={{
                  maxHeight: '68vh',
                  overflowX: 'auto',
                  overflowY: 'auto'
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth:
                      tab.key === 'excluded'
                        ? 1900
                        : tab.key === 'estimation'
                          ? 1650
                          : 1050,
                    '& .MuiTableCell-root': {
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }
                  }}
                  aria-label={`${tab.label} zone-wise work allocation report`}
                >
                  <TableHead>
                    <TableRow sx={{ height: HEADER_ROW_HEIGHT }}>
                      {TEXT_COLS.map((textColumn, index) => (
                        <TableCell
                          key={textColumn.label}
                          rowSpan={hasGroupHeader(tab) ? 2 : 1}
                          align={textColumn.align || 'inherit'}
                          sx={{
                            width: widthForTextColumn(index),
                            minWidth: widthForTextColumn(index),
                            maxWidth: widthForTextColumn(index),
                            color: UI_COLORS.headerText,
                            bgcolor: UI_COLORS.headerBg,
                            fontWeight: 700,
                            position: 'sticky',
                            top: 0,
                            left: stickyLeftForTextColumn(index),
                            zIndex: 14 - index,
                            borderRight: `1px solid ${UI_COLORS.border}`,
                            borderBottom: `1px solid ${UI_COLORS.strongBorder}`,
                            boxShadow:
                              index === 2 ? `2px 0 0 ${UI_COLORS.border}` : undefined,
                            textTransform: tab.uppercase ? 'uppercase' : 'none'
                          }}
                        >
                          {textColumn.label}
                        </TableCell>
                      ))}

                      {tab.groups.map((group, groupIndex) =>
                        group.label ? (
                          <TableCell
                            key={group.label}
                            colSpan={group.columns.length}
                            align="center"
                            sx={{
                              color: UI_COLORS.headerText,
                              bgcolor: UI_COLORS.headerBg,
                              fontWeight: 700,
                              position: 'sticky',
                              top: 0,
                              zIndex: 9,
                              borderRight:
                                groupIndex < tab.groups.length - 1
                                  ? `1px solid ${UI_COLORS.border}`
                                  : undefined,
                              borderBottom: `1px solid ${UI_COLORS.border}`,
                              textTransform: tab.uppercase ? 'uppercase' : 'none',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {group.label}
                          </TableCell>
                        ) : (
                          group.columns.map((col) => (
                            <TableCell
                              key={col.key}
                              rowSpan={hasGroupHeader(tab) ? 2 : 1}
                              align="center"
                              sx={{
                                minWidth: col.type === 'remarks' ? 170 : 100,
                                color: UI_COLORS.headerText,
                                bgcolor: UI_COLORS.headerBg,
                                fontWeight: 700,
                                position: 'sticky',
                                top: 0,
                                zIndex: 9,
                                borderBottom: `1px solid ${UI_COLORS.strongBorder}`
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))
                        )
                      )}
                    </TableRow>

                    {hasGroupHeader(tab) && (
                      <TableRow>
                        {tab.groups
                          .filter((group) => group.label)
                          .flatMap((group) => group.columns)
                          .map((col) => {
                            const key = String(col.key || '').toLowerCase();
                            const isWet = key.includes('wet');
                            const isDry = key.includes('dry');

                            return (
                              <TableCell
                                key={col.key}
                                align="center"
                                sx={{
                                  minWidth: col.type === 'remarks' ? 170 : 96,
                                  color: isWet
                                    ? UI_COLORS.primaryDark
                                    : isDry
                                      ? UI_COLORS.orangeDark
                                      : UI_COLORS.subHeaderText,
                                  bgcolor: UI_COLORS.headerBg,
                                  fontWeight: 650,
                                  fontSize: '0.75rem',
                                  whiteSpace: 'nowrap',
                                  position: 'sticky',
                                  top: HEADER_ROW_HEIGHT,
                                  zIndex: 8,
                                  borderBottom: `1px solid ${UI_COLORS.strongBorder}`,
                                  borderRight: col.groupEnd
                                    ? `1px solid ${UI_COLORS.border}`
                                    : undefined
                                }}
                              >
                                {col.label}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    )}
                  </TableHead>

                  <TableBody>
                    {displayItems.length > 0 ? (
                      displayItems.map((item, index) => {
                        const isBlockStart = blockSpans[index] !== undefined;
                        const nextItem = displayItems[index + 1];
                        const isLastRowOfBlock =
                          !nextItem || nextItem.blockName !== item.blockName;
                        const isLastRowOfZone =
                          !nextItem || nextItem.zoneKey !== item.zoneKey;

                        const rowBorderBottom = isLastRowOfBlock
                          ? `1px solid ${UI_COLORS.strongBorder}`
                          : isLastRowOfZone
                            ? '1px solid #c5cdd6'
                            : `1px solid ${UI_COLORS.border}`;

                        if (item.kind === 'subtotal') {
                          return (
                            <TableRow key={item.row.id} sx={{ bgcolor: UI_COLORS.subtotalBg }}>
                              <TableCell
                                sx={{
                                  position: 'sticky',
                                  left: BLOCK_COLUMN_WIDTH + ZONE_COLUMN_WIDTH,
                                  zIndex: 4,
                                  minWidth: LOCAL_BODY_COLUMN_WIDTH,
                                  maxWidth: LOCAL_BODY_COLUMN_WIDTH,
                                  bgcolor: UI_COLORS.subtotalBg,
                                  fontWeight: 700,
                                  fontStyle: 'italic',
                                  color: UI_COLORS.subtotalText,
                                  borderRight: `1px solid ${UI_COLORS.border}`,
                                  borderBottom: rowBorderBottom,
                                  boxShadow: `2px 0 0 ${UI_COLORS.border}`
                                }}
                              >
                                {item.label}
                              </TableCell>

                              {columns.map((col) => (
                                <TableCell
                                  key={col.key}
                                  align="center"
                                  sx={{
                                    bgcolor: col.groupEnd
                                      ? alpha(activeAccent, 0.025)
                                      : 'inherit',
                                    borderBottom: rowBorderBottom,
                                    borderRight: col.groupEnd
                                      ? `1px solid ${UI_COLORS.border}`
                                      : undefined
                                  }}
                                >
                                  {col.type === 'remarks' ? null : (
                                    <DataBox row={item.row} col={col} total />
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        }

                        const row = item.row;

                        return (
                          <TableRow
                            key={row.id ?? index}
                            hover
                            sx={{
                              '&:nth-of-type(even)': {
                                bgcolor: alpha(UI_COLORS.primary, 0.015)
                              },
                              '&:hover': {
                                bgcolor: alpha(UI_COLORS.primary, 0.035)
                              }
                            }}
                          >
                            {isBlockStart && (
                              <TableCell
                                rowSpan={blockSpans[index]}
                                align="center"
                                sx={{
                                  position: 'sticky',
                                  left: 0,
                                  zIndex: 5,
                                  minWidth: BLOCK_COLUMN_WIDTH,
                                  maxWidth: BLOCK_COLUMN_WIDTH,
                                  fontWeight: 700,
                                  color: UI_COLORS.subtotalText,
                                  bgcolor: '#f5f7fa',
                                  borderRight: `1px solid ${UI_COLORS.border}`,
                                  borderBottom: `1px solid ${UI_COLORS.strongBorder}`,
                                  verticalAlign: 'middle'
                                }}
                              >
                                {item.blockName}
                              </TableCell>
                            )}

                            {item.zoneStart && (
                              <TableCell
                                rowSpan={item.zoneSpan}
                                align={item.zoneMerged ? 'center' : 'left'}
                                sx={{
                                  position: 'sticky',
                                  left: BLOCK_COLUMN_WIDTH,
                                  zIndex: 4,
                                  minWidth: ZONE_COLUMN_WIDTH,
                                  maxWidth: ZONE_COLUMN_WIDTH,
                                  fontWeight: 650,
                                  color: UI_COLORS.primaryDark,
                                  bgcolor: item.zoneMerged ? '#fbfcff' : 'background.paper',
                                  borderRight: `1px solid ${UI_COLORS.border}`,
                                  borderBottom: item.zoneMerged
                                    ? '1px solid #c5cdd6'
                                    : rowBorderBottom,
                                  verticalAlign: 'middle'
                                }}
                              >
                                {row.name || 'N/A'}
                              </TableCell>
                            )}

                            <TableCell
                              sx={{
                                position: 'sticky',
                                left: BLOCK_COLUMN_WIDTH + ZONE_COLUMN_WIDTH,
                                zIndex: 3,
                                minWidth: LOCAL_BODY_COLUMN_WIDTH,
                                maxWidth: LOCAL_BODY_COLUMN_WIDTH,
                                bgcolor: 'inherit',
                                fontWeight: 550,
                                borderRight: `1px solid ${UI_COLORS.border}`,
                                borderBottom: rowBorderBottom,
                                boxShadow: `2px 0 0 ${UI_COLORS.border}`
                              }}
                            >
                              {row.panchayathName || 'N/A'}
                            </TableCell>

                            {columns.map((col) => (
                              <TableCell
                                key={col.key}
                                align="center"
                                sx={{
                                  bgcolor: col.groupEnd
                                    ? alpha(activeAccent, 0.025)
                                    : 'inherit',
                                  borderBottom: rowBorderBottom,
                                  borderRight: col.groupEnd
                                    ? `1px solid ${UI_COLORS.border}`
                                    : undefined
                                }}
                              >
                                <DataBox row={row} col={col} />
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={colSpanAll} align="center" sx={{ py: 6 }}>
                          <SearchIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
                          <Typography variant="subtitle1" sx={{ mt: 0.75, fontWeight: 600 }}>
                            No matching records
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try another block, zone or local-body name.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading && filteredData.length > 0 && (
                      <TableRow
                        sx={{
                          bgcolor: alpha(activeAccent, 0.07),
                          '& .MuiTableCell-root': {
                            borderTop: `2px solid ${alpha(activeAccent, 0.22)}`
                          }
                        }}
                      >
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 6,
                            minWidth: BLOCK_COLUMN_WIDTH,
                            maxWidth: BLOCK_COLUMN_WIDTH,
                            bgcolor: alpha(activeAccent, 0.07),
                            fontWeight: 800
                          }}
                        >
                          Total
                        </TableCell>

                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: BLOCK_COLUMN_WIDTH,
                            zIndex: 5,
                            minWidth: ZONE_COLUMN_WIDTH,
                            maxWidth: ZONE_COLUMN_WIDTH,
                            bgcolor: alpha(activeAccent, 0.07),
                            fontWeight: 800,
                            color: UI_COLORS.primaryDark
                          }}
                        >
                          All Zones
                        </TableCell>

                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: BLOCK_COLUMN_WIDTH + ZONE_COLUMN_WIDTH,
                            zIndex: 4,
                            minWidth: LOCAL_BODY_COLUMN_WIDTH,
                            maxWidth: LOCAL_BODY_COLUMN_WIDTH,
                            bgcolor: alpha(activeAccent, 0.07),
                            fontWeight: 800,
                            boxShadow: `2px 0 0 ${UI_COLORS.border}`
                          }}
                        >
                          {searchTerm ? 'Filtered Total' : TOTAL_LABELS[activeTab]}
                        </TableCell>

                        {columns.map((col) => (
                          <TableCell
                            key={col.key}
                            align="center"
                            sx={{
                              bgcolor: col.groupEnd
                                ? alpha(activeAccent, 0.1)
                                : 'inherit',
                              borderRight: col.groupEnd
                                ? `1px solid ${UI_COLORS.border}`
                                : undefined
                            }}
                          >
                            {col.type === 'remarks' ? null : (
                              <DataBox row={totals} col={col} total />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Pagination retained at Zone level because the row count can be large. */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(UI_COLORS.primary, 0.015)
            }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export default ZoneWorkAllocationReport;