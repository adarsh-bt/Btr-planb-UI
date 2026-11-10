import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ParkIcon from '@mui/icons-material/Park';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import axios from 'axios';

import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';
import Breadcrumb from 'routes/Breadcrumb';

/* ─────────────────────────── API ─────────────────────────── */

const WA_BASE = `${mainapi.BTR_API}/btr-service`;
const SEND_AGRI_YEAR = true;

// Preserve the colour language used in the uploaded Work Allocation UI.
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
  strongBorder: '#8e8a8aff'
};

const HEADER_ROW_HEIGHT = 48;

const authHeader = () => {
  const token = AuthService.gettoken
    ? AuthService.gettoken()
    : localStorage.getItem('token');

  if (!token) {
    throw new Error(
      'Authentication session token missing. Please log in again.'
    );
  }

  return {
    Authorization: `Bearer ${token}`
  };
};

const withAgriYear = (url) =>
  SEND_AGRI_YEAR
    ? `${url}?agriYear=${encodeURIComponent(
      AuthService.agriyear() || '2025-2026'
    )}`
    : url;

/* ─────────────────────── Jurisdiction ─────────────────────── */

const TALUK_ROLES = [
  'Field Inspector',
  'Taluk Level Data Viewer',
  'Taluk Level Approver'
];

const DISTRICT_ROLES = [
  'District Level Data Viewer',
  'District Level Approver'
];

function getUserJurisdiction() {
  let role =
    localStorage.getItem('des') ||
    AuthService.getrole() ||
    'State Level Approver';

  if (Array.isArray(role)) {
    role = role[0];
  }

  const normalizedRole = String(role).toLowerCase();

  let level = 'directorate';

  if (
    TALUK_ROLES.some(
      (item) =>
        item.toLowerCase() ===
        normalizedRole
    )
  ) {
    level = 'taluk';
  } else if (
    DISTRICT_ROLES.some(
      (item) =>
        item.toLowerCase() ===
        normalizedRole
    )
  ) {
    level = 'district';
  }

  return {
    user:
      AuthService.getusername() ||
      localStorage.getItem('user') ||
      'System User',
    role,
    level,
    district:
      localStorage.getItem(
        'userDistrict'
      ) ||
      localStorage.getItem('dis') ||
      '',
    taluk:
      localStorage.getItem(
        'userTaluk'
      ) || ''
  };
}

/* ───────────────── Payload → flat row ───────────────── */

function normalizeLocation(
  location = {},
  index = 0
) {
  const numberValue = (value) =>
    Number(value) || 0;

  const villageRecords =
    location.villageRecords || {};

  const excludedArea =
    location.excludedArea || {};

  const available =
    location.areaAvailableForEstimation ||
    {};

  const plots =
    available.noOfPlots || {};

  const area =
    available.areaInCents || {};

  const clusters =
    available.noOfClusters || {};

  const wetInCents =
    numberValue(
      villageRecords.wet
    );

  const dryInCents =
    numberValue(
      villageRecords.dry
    );

  const plotsWet =
    numberValue(plots.wet);

  const plotsDry =
    numberValue(plots.dry);

  const clustersWet =
    numberValue(clusters.wet);

  const clustersDry =
    numberValue(clusters.dry);

  const availWetArea =
    numberValue(area.wet);

  const availDryArea =
    numberValue(area.dry);

  /*
   * Backward-compatible excluded-area parsing.
   * New APIs can return separate wet/dry fields while older
   * responses can still return one aggregate field.
   */
  const forestWet =
    numberValue(
      excludedArea.forestAreaWet
    );

  const forestDry =
    numberValue(
      excludedArea.forestAreaDry
    );

  const forestAreas =
    excludedArea.forestAreaWet !==
      undefined ||
      excludedArea.forestAreaDry !==
      undefined
      ? forestWet + forestDry
      : numberValue(
        excludedArea.forestArea
      );

  const plantationWet =
    numberValue(
      excludedArea.plantationAreaWet
    );

  const plantationDry =
    numberValue(
      excludedArea.plantationAreaDry
    );

  const plantationArea =
    excludedArea.plantationAreaWet !==
      undefined ||
      excludedArea.plantationAreaDry !==
      undefined
      ? plantationWet +
      plantationDry
      : numberValue(
        excludedArea.plantationArea
      );

  const waterBodiesWet =
    numberValue(
      excludedArea.areaOfWaterBodiesWet
    );

  const waterBodiesDry =
    numberValue(
      excludedArea.areaOfWaterBodiesDry
    );

  const waterBodiesArea =
    excludedArea.areaOfWaterBodiesWet !==
      undefined ||
      excludedArea.areaOfWaterBodiesDry !==
      undefined
      ? waterBodiesWet +
      waterBodiesDry
      : numberValue(
        excludedArea.areaOfWaterBodies
      );

  const othersWet =
    numberValue(
      excludedArea.othersWet
    );

  const othersDry =
    numberValue(
      excludedArea.othersDry
    );

  const otherAreas =
    excludedArea.othersWet !==
      undefined ||
      excludedArea.othersDry !==
      undefined
      ? othersWet + othersDry
      : numberValue(
        excludedArea.others
      );

  return {
    id:
      location.id ??
      `loc_${index}`,
    name: location.name || '',
    blockId:
      location.blockId ?? null,
    blockName:
      location.blockName || '',
    panchayathName:
      location.panchayathName ||
      '',

    wetInCents,
    dryInCents,
    totalInCents:
      numberValue(
        villageRecords.total
      ) ||
      wetInCents +
      dryInCents,

    forestAreas,
    forestWet,
    forestDry,
    forestAreaWet: forestWet,
    forestAreaDry: forestDry,

    plantationArea,
    plantationWet,
    plantationDry,
    plantationAreaWet:
      plantationWet,
    plantationAreaDry:
      plantationDry,

    waterBodiesArea,
    waterBodiesWet,
    waterBodiesDry,
    areaOfWaterBodiesWet:
      waterBodiesWet,
    areaOfWaterBodiesDry:
      waterBodiesDry,

    otherAreas,
    othersWet,
    othersDry,

    plotsWet,
    plotsDry,
    plotsTotal:
      numberValue(plots.total) ||
      plotsWet + plotsDry,

    clustersWet,
    clustersDry,
    clustersTotal:
      numberValue(
        clusters.total
      ) ||
      clustersWet +
      clustersDry,

    availWetArea,
    availDryArea,
    availTotalArea:
      numberValue(area.total) ||
      availWetArea +
      availDryArea
  };
}

/* ───────────────────── Tabs / columns ───────────────────── */

const TAB_DEFS = [
  {
    key: 'village',
    label:
      'Area As Per Village Records',
    shortLabel: 'Village Records',
    description:
      'Wet, dry and total area recorded in village records.',
    icon: AssessmentIcon,
    accent: UI_COLORS.primary,
    loadingText:
      'Loading village-record area…',
    groups: [
      {
        label:
          'Area as per village records (cents)',
        columns: [
          {
            key: 'wetInCents',
            label: 'Wet',
            exportLabel:
              'Wet (cents)',
            tone: 'wet',
            fixed: true
          },
          {
            key: 'dryInCents',
            label: 'Dry',
            exportLabel:
              'Dry (cents)',
            tone: 'dry',
            fixed: true
          },
          {
            key: 'totalInCents',
            label: 'Total',
            exportLabel:
              'Total (cents)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      }
    ]
  },

  {
    key: 'excluded',
    label: 'Excluded Areas',
    shortLabel: 'Excluded Areas',
    description:
      'Forest, plantation, water-body and other excluded areas, split by wet and dry land.',
    icon: ParkIcon,
    accent: UI_COLORS.green,
    loadingText:
      'Loading excluded areas…',
    uppercase: true,
    groups: [
      {
        label: 'Forest Areas',
        columns: [
          {
            key: 'forestAreaWet',
            label: 'Wet',
            exportLabel:
              'Forest (Wet)',
            tone: 'wet',
            fixed: true
          },
          {
            key: 'forestAreaDry',
            label: 'Dry',
            exportLabel:
              'Forest (Dry)',
            tone: 'dry',
            fixed: true
          },
          {
            key: 'forestAreas',
            label: 'Total',
            exportLabel:
              'Forest (Total)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      },
      {
        label: 'Plantation Area',
        columns: [
          {
            key:
              'plantationAreaWet',
            label: 'Wet',
            exportLabel:
              'Plantation (Wet)',
            tone: 'wet',
            fixed: true
          },
          {
            key:
              'plantationAreaDry',
            label: 'Dry',
            exportLabel:
              'Plantation (Dry)',
            tone: 'dry',
            fixed: true
          },
          {
            key:
              'plantationArea',
            label: 'Total',
            exportLabel:
              'Plantation (Total)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      },
      {
        label:
          'Area of Water Bodies',
        columns: [
          {
            key:
              'areaOfWaterBodiesWet',
            label: 'Wet',
            exportLabel:
              'Water Bodies (Wet)',
            tone: 'wet',
            fixed: true
          },
          {
            key:
              'areaOfWaterBodiesDry',
            label: 'Dry',
            exportLabel:
              'Water Bodies (Dry)',
            tone: 'dry',
            fixed: true
          },
          {
            key:
              'waterBodiesArea',
            label: 'Total',
            exportLabel:
              'Water Bodies (Total)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      },
      {
        label: 'Other Areas',
        columns: [
          {
            key: 'othersWet',
            label: 'Wet',
            exportLabel:
              'Others (Wet)',
            tone: 'wet',
            fixed: true
          },
          {
            key: 'othersDry',
            label: 'Dry',
            exportLabel:
              'Others (Dry)',
            tone: 'dry',
            fixed: true
          },
          {
            key: 'otherAreas',
            label: 'Total',
            exportLabel:
              'Others (Total)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      }
    ]
  },

  {
    key: 'estimation',
    label:
      'Area Available For Estimation',
    shortLabel:
      'Available for Estimation',
    description:
      'Plots, clusters and area currently available for estimation.',
    icon: AssignmentIcon,
    accent: UI_COLORS.orange,
    loadingText:
      'Loading estimation availability…',
    groups: [
      {
        label:
          'Number of Plots Available for Estimation',
        columns: [
          {
            key: 'plotsWet',
            label: 'Wet',
            exportLabel:
              'Plots (Wet)',
            tone: 'wet'
          },
          {
            key: 'plotsDry',
            label: 'Dry',
            exportLabel:
              'Plots (Dry)',
            tone: 'dry'
          },
          {
            key: 'plotsTotal',
            label: 'Total',
            exportLabel:
              'Plots (Total)',
            tone: 'total',
            groupEnd: true
          }
        ]
      },
      {
        label:
          'Number of Clusters Available for Estimation',
        columns: [
          {
            key: 'clustersWet',
            label: 'Wet',
            exportLabel:
              'Clusters (Wet)',
            tone: 'wet'
          },
          {
            key: 'clustersDry',
            label: 'Dry',
            exportLabel:
              'Clusters (Dry)',
            tone: 'dry'
          },
          {
            key: 'clustersTotal',
            label: 'Total',
            exportLabel:
              'Clusters (Total)',
            tone: 'total',
            groupEnd: true
          }
        ]
      },
      {
        label:
          'Area Available for Estimation (cents)',
        columns: [
          {
            key: 'availWetArea',
            label: 'Wet',
            exportLabel:
              'Area Wet (cents)',
            tone: 'wet',
            fixed: true
          },
          {
            key: 'availDryArea',
            label: 'Dry',
            exportLabel:
              'Area Dry (cents)',
            tone: 'dry',
            fixed: true
          },
          {
            key:
              'availTotalArea',
            label: 'Total',
            exportLabel:
              'Area Total (cents)',
            tone: 'total',
            fixed: true,
            groupEnd: true
          }
        ]
      },
      {
        label: null,
        columns: [
          {
            key: '__remarks',
            label: 'Remarks',
            type: 'remarks'
          }
        ]
      }
    ]
  }
];

const leafColumns = (tab) =>
  tab.groups.flatMap(
    (group) => group.columns
  );

const hasGroupHeader = (tab) =>
  tab.groups.some(
    (group) => Boolean(group.label)
  );

const METRIC_KEYS =
  TAB_DEFS.flatMap((tab) =>
    leafColumns(tab)
  )
    .filter(
      (column) =>
        column.type !== 'remarks'
    )
    .map((column) => column.key);

const TEXT_COLS = [
  {
    label: 'Taluk Name',
    width: '220px',
    get: (row) => row.name
  }
];

const TOTAL_LABELS = [
  'District Total / Summary',
  'Total Excluded Summary',
  'Total Available Summary'
];

/* ───────────────────── Display helpers ───────────────────── */

const formatNumber = (
  value,
  fixed = false
) => {
  const number =
    Number(value || 0);

  return number.toLocaleString(
    undefined,
    fixed
      ? {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
      : {
        maximumFractionDigits: 2
      }
  );
};

const cellValue = (
  row,
  column
) => {
  const value =
    Number(
      row[column.key] || 0
    );

  return column.fixed
    ? value.toFixed(2)
    : value;
};

function MetricValue({
  row,
  column,
  total = false
}) {
  const theme = useTheme();

  if (
    column.type === 'remarks'
  ) {
    return (
      <Typography
        variant="body2"
        color="text.disabled"
      >
        —
      </Typography>
    );
  }

  const value =
    Number(
      row[column.key] || 0
    );

  const toneColor =
    column.tone === 'wet'
      ? UI_COLORS.primaryDark
      : column.tone === 'dry'
        ? UI_COLORS.orangeDark
        : theme.palette.text.primary;

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color:
          value === 0
            ? 'text.secondary'
            : toneColor,
        fontWeight:
          total ||
            column.tone === 'total'
            ? 700
            : value > 0
              ? 550
              : 400,
        fontVariantNumeric:
          'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {formatNumber(
        value,
        column.fixed
      )}
    </Typography>
  );
}

function SummaryMetricCard({
  label,
  total,
  wet,
  dry,
  unit,
  color,
  icon,
  loading,
  decimal = false
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2.5,
        border:
          `1px solid ${alpha(
            color,
            0.15
          )}`,
        bgcolor:
          'background.paper'
      }}
    >
      <CardContent
        sx={{
          p: 1.75,
          '&:last-child': {
            pb: 1.75
          }
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                textTransform:
                  'uppercase',
                letterSpacing: 0.4
              }}
            >
              {label}
            </Typography>

            <Stack
              direction="row"
              alignItems="baseline"
              spacing={0.75}
              sx={{ mt: 0.45 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1,
                  color,
                  fontVariantNumeric:
                    'tabular-nums'
                }}
              >
                {loading
                  ? (
                    <CircularProgress
                      size={20}
                      sx={{ color }}
                    />
                  )
                  : formatNumber(
                    total,
                    decimal
                  )}
              </Typography>

              {unit && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600
                  }}
                >
                  {unit}
                </Typography>
              )}
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
              bgcolor: alpha(
                color,
                0.09
              ),
              flex: '0 0 auto'
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: 1
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Wet
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.1,
                fontWeight: 700,
                color: UI_COLORS.primaryDark,
                fontVariantNumeric:
                  'tabular-nums'
              }}
            >
              {loading
                ? '…'
                : formatNumber(
                  wet,
                  decimal
                )}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Dry
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.1,
                fontWeight: 700,
                color:
                  UI_COLORS.orangeDark,
                fontVariantNumeric:
                  'tabular-nums'
              }}
            >
              {loading
                ? '…'
                : formatNumber(
                  dry,
                  decimal
                )}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function AreaOverviewCard({
  total,
  wet,
  dry,
  loading
}) {
  const theme = useTheme();

  const totalValue =
    Math.max(
      Number(total || 0),
      0
    );

  const wetValue =
    Math.max(
      Number(wet || 0),
      0
    );

  const dryValue =
    Math.max(
      Number(dry || 0),
      0
    );

  const wetPercent =
    totalValue > 0
      ? Math.min(
        (wetValue /
          totalValue) *
        100,
        100
      )
      : 0;

  const dryPercent =
    totalValue > 0
      ? Math.min(
        (dryValue /
          totalValue) *
        100,
        100
      )
      : 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border:
          `1px solid ${alpha(
            theme.palette.success.main,
            0.2
          )}`,
        background:
          `linear-gradient(135deg, ${alpha(
            theme.palette.success.main,
            0.09
          )} 0%, ${alpha(
            theme.palette.primary.main,
            0.03
          )} 100%)`
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.25
          },
          '&:last-child': {
            pb: {
              xs: 2,
              md: 2.25
            }
          }
        }}
      >
        <Stack spacing={1.6}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700 }}
              >
                Area Available for Estimation
              </Typography>

              <Stack
                direction="row"
                alignItems="baseline"
                spacing={0.8}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1,
                    color: UI_COLORS.greenDark,
                    fontVariantNumeric:
                      'tabular-nums'
                  }}
                >
                  {loading
                    ? (
                      <CircularProgress
                        size={24}
                        color="success"
                      />
                    )
                    : formatNumber(
                      totalValue,
                      true
                    )}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
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
                color:
                  UI_COLORS.green,
                bgcolor: alpha(
                  theme.palette.success.main,
                  0.11
                )
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
                bgcolor: alpha(
                  theme.palette.grey[500],
                  0.12
                )
              }}
            >
              <Box
                sx={{
                  width:
                    `${wetPercent}%`,
                  bgcolor:
                    UI_COLORS.primary
                }}
              />

              <Box
                sx={{
                  width:
                    `${dryPercent}%`,
                  bgcolor:
                    UI_COLORS.orange
                }}
              />
            </Box>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              justifyContent="space-between"
              spacing={0.5}
              sx={{ mt: 0.75 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
              >
                Wet:{' '}
                <strong>
                  {formatNumber(
                    wetValue,
                    true
                  )}
                </strong>
                {' cents'}
                {totalValue > 0
                  ? ` (${wetPercent.toFixed(1)}%)`
                  : ''}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Dry:{' '}
                <strong>
                  {formatNumber(
                    dryValue,
                    true
                  )}
                </strong>
                {' cents'}
                {totalValue > 0
                  ? ` (${dryPercent.toFixed(1)}%)`
                  : ''}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MobileField({
  label,
  row,
  column
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Box sx={{ mt: 0.15 }}>
        <MetricValue
          row={row}
          column={column}
        />
      </Box>
    </Box>
  );
}

/* ───────────────── SpreadsheetML export ───────────────── */

const xmlEscape = (value) =>
  value === null ||
    value === undefined
    ? ''
    : String(value)
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&apos;'
      );

const XML_STYLE_FOR = {
  total: 'GreenHighlight'
};

function downloadWorkAllocationXls({
  textColumns,
  rows,
  totals,
  totalLabels,
  reportLevelName,
  username
}) {
  const downloadTime =
    new Date().toLocaleString(
      'en-IN',
      {
        timeZoneName: 'short'
      }
    );

  const sheets =
    TAB_DEFS.map(
      (tab, tabIndex) => {
        const columns =
          leafColumns(tab);

        const upper =
          (value) =>
            tab.uppercase
              ? String(
                value
              ).toUpperCase()
              : value;

        let body = `
          <Row ss:Height="24">
            ${textColumns
            .map(
              (textColumn) =>
                `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(
                  upper(
                    textColumn.label
                  )
                )}</Data></Cell>`
            )
            .join('')}
            ${columns
            .map(
              (column) =>
                `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(
                  upper(
                    column.exportLabel ||
                    column.label
                  )
                )}</Data></Cell>`
            )
            .join('')}
          </Row>
        `;

        rows.forEach((row) => {
          body += `
            <Row>
              ${textColumns
              .map(
                (textColumn) =>
                  `<Cell><Data ss:Type="String">${xmlEscape(
                    textColumn.get(
                      row
                    ) ||
                    'N/A'
                  )}</Data></Cell>`
              )
              .join('')}
              ${columns
              .map(
                (column) => {
                  if (
                    column.type ===
                    'remarks'
                  ) {
                    return '<Cell><Data ss:Type="String"></Data></Cell>';
                  }

                  const style =
                    XML_STYLE_FOR[
                    column.tone
                    ];

                  return `<Cell${style
                      ? ` ss:StyleID="${style}"`
                      : ''
                    }><Data ss:Type="Number">${cellValue(
                      row,
                      column
                    )}</Data></Cell>`;
                }
              )
              .join('')}
            </Row>
          `;
        });

        body += `
          <Row ss:StyleID="BoldRow">
            ${textColumns
            .map(
              (
                textColumn,
                index
              ) =>
                `<Cell><Data ss:Type="String">${xmlEscape(
                  index ===
                    textColumns.length -
                    1
                    ? totalLabels[
                    tabIndex
                    ]
                    : 'Total'
                )}</Data></Cell>`
            )
            .join('')}
            ${columns
            .map(
              (column) => {
                if (
                  column.type ===
                  'remarks'
                ) {
                  return '<Cell><Data ss:Type="String"></Data></Cell>';
                }

                const style =
                  XML_STYLE_FOR[
                  column.tone
                  ];

                const value =
                  column.fixed
                    ? Number(
                      totals[
                      column.key
                      ] || 0
                    ).toFixed(2)
                    : Number(
                      totals[
                      column.key
                      ] || 0
                    );

                return `<Cell${style
                    ? ` ss:StyleID="${style}"`
                    : ''
                  }><Data ss:Type="Number">${value}</Data></Cell>`;
              }
            )
            .join('')}
          </Row>
        `;

        return {
          name: tab.label,
          body
        };
      }
    );

  const metaRows = [
    [
      'Report Module',
      'Work Allocation Abstract Progress Report'
    ],
    [
      'Geographical Level / View',
      reportLevelName
    ],
    [
      'Agricultural Year',
      AuthService.agriyear() ||
      ''
    ],
    [
      'Downloaded By User',
      username
    ],
    [
      'Download Timestamp',
      downloadTime
    ],
    [
      'Total Records Exported',
      String(rows.length)
    ],
    [
      'Worksheets Contained',
      '1. Area As Per Village Records, 2. Excluded Areas, 3. Area Available For Estimation, 4. Metadata'
    ],
    [
      'Source Platform',
      'AIDeA BTR EARAS System'
    ]
  ]
    .map(
      ([key, value]) => `
        <Row>
          <Cell ss:StyleID="BoldCell"><Data ss:Type="String">${xmlEscape(
        key
      )}</Data></Cell>
          <Cell><Data ss:Type="String">${xmlEscape(
        value
      )}</Data></Cell>
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
  <Author>${xmlEscape(
    username
  )}</Author>
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
  <Style ss:ID="GreenHighlight">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1B5E20" ss:Bold="1"/>
   <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${sheets
      .map(
        (sheet) => `
 <Worksheet ss:Name="${xmlEscape(
          sheet.name
        )}">
  <Table>
   ${sheet.body}
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

  const blob =
    new Blob(
      [xmlWorkbook],
      {
        type:
          'application/vnd.ms-excel'
      }
    );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement('a');

  anchor.href = url;
  anchor.download =
    `Work_Allocation_Abstract_${reportLevelName.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}.xls`;

  document.body.appendChild(
    anchor
  );

  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/* ───────────────────────── Component ───────────────────────── */

function TalukWorkAllocationReport() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { districtName: rawDistrictName } = useParams();
  const districtName = decodeURIComponent(rawDistrictName || '');

  const isMobile =
    useMediaQuery(
      theme.breakpoints.down('md')
    );

  const latestRequestRef =
    useRef(0);

  const stateDistrictId =
    location.state?.districtId ??
    location.state?.districtData?.id ??
    null;

  const resolvedDistrictId =
    useRef(stateDistrictId);

  const jurisdiction =
    useMemo(
      () => getUserJurisdiction(),
      []
    );

  const [rows, setRows] =
    useState([]);

  const [
    summaryPlots,
    setSummaryPlots
  ] = useState(null);

  const [
    summaryClusters,
    setSummaryClusters
  ] = useState(null);

  const [
    summaryArea,
    setSummaryArea
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [
    activeTab,
    setActiveTab
  ] = useState(0);

  const [
    searchTerm,
    setSearchTerm
  ] = useState('');

  const tab =
    TAB_DEFS[activeTab];

  const columns =
    leafColumns(tab);

  const TabIcon =
    tab.icon;

  const resolveDistrictId =
    useCallback(async () => {
      if (resolvedDistrictId.current) {
        return resolvedDistrictId.current;
      }

      const response =
        await axios.get(
          withAgriYear(
            `${WA_BASE}/api/report/work-allocation-progress`
          ),
          {
            headers: authHeader()
          }
        );

      const locations =
        Array.isArray(
          response.data?.locations
        )
          ? response.data.locations
          : [];

      resolvedDistrictId.current =
        locations.find(
          (district) =>
            String(
              district.name
            ).toLowerCase() ===
            String(
              districtName
            ).toLowerCase()
        )?.id ?? null;

      return resolvedDistrictId.current;
    }, [districtName]);

  const fetchTalukWorkAllocation =
    useCallback(async () => {
      const requestId =
        latestRequestRef.current + 1;

      latestRequestRef.current =
        requestId;

      setLoading(true);
      setError(null);

      try {
        const districtId =
          await resolveDistrictId();

        if (!districtId) {
          throw new Error(
            `Could not resolve District ID for "${districtName}".`
          );
        }

        const response =
          await axios.get(
            withAgriYear(
              `${WA_BASE}/api/report/work-allocation-progress/${districtId}`
            ),
            {
              headers: authHeader()
            }
          );

        if (
          requestId !==
          latestRequestRef.current
        ) {
          return;
        }

        const data =
          response.data || {};

        setSummaryPlots(
          data.noOfPlots || null
        );

        setSummaryClusters(
          data.noOfClusters || null
        );

        setSummaryArea(
          data.areaAvailableForEstimation || null
        );

        setRows(
          Array.isArray(
            data.locations
          )
            ? data.locations.map(
              normalizeLocation
            )
            : []
        );
      } catch (fetchError) {
        if (
          requestId !==
          latestRequestRef.current
        ) {
          return;
        }

        console.error(
          'Error fetching Taluk work allocation report:',
          fetchError
        );

        setError(
          fetchError.response?.data?.message ||
          fetchError.message ||
          'Error loading taluk work allocation report data.'
        );
      } finally {
        if (
          requestId ===
          latestRequestRef.current
        ) {
          setLoading(false);
        }
      }
    }, [districtName, resolveDistrictId]);

  /* Taluk-level users only use their assigned Zone page. */
  useEffect(() => {
    if (
      jurisdiction.level ===
      'taluk'
    ) {
      navigate(
        `/report/kerala_work_allocation_report/zone/${encodeURIComponent(
          jurisdiction.district
        )}/${encodeURIComponent(
          jurisdiction.taluk
        )}`,
        {
          replace: true
        }
      );

      return;
    }

    fetchTalukWorkAllocation();
  }, [
    fetchTalukWorkAllocation,
    jurisdiction.district,
    jurisdiction.level,
    jurisdiction.taluk,
    navigate
  ]);

  const filteredData =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      if (!query) {
        return rows;
      }

      return rows.filter(
        (row) =>
          row.name
            .toLowerCase()
            .includes(query)
      );
    }, [rows, searchTerm]);

  const calculateTotals =
    useCallback(
      (sourceRows) => {
        const result = {};

        METRIC_KEYS.forEach(
          (key) => {
            result[key] =
              sourceRows.reduce(
                (
                  sum,
                  row
                ) =>
                  sum +
                  Number(
                    row[key] ||
                    0
                  ),
                0
              );
          }
        );

        return result;
      },
      []
    );

  /*
   * District totals are independent of the taluk search.
   * Table totals follow the currently visible/filtered rows.
   */
  const levelTotals =
    useMemo(
      () =>
        calculateTotals(rows),
      [calculateTotals, rows]
    );

  const tableTotals =
    useMemo(
      () =>
        calculateTotals(
          filteredData
        ),
      [
        calculateTotals,
        filteredData
      ]
    );

  const summaryValue = (
    summary,
    key,
    fallback
  ) => {
    if (
      summary &&
      summary[key] !==
      undefined &&
      summary[key] !== null
    ) {
      const value =
        Number(summary[key]);

      return Number.isNaN(value)
        ? fallback
        : value;
    }

    return fallback;
  };

  const totalPlotsWet =
    summaryValue(
      summaryPlots,
      'wet',
      levelTotals.plotsWet || 0
    );

  const totalPlotsDry =
    summaryValue(
      summaryPlots,
      'dry',
      levelTotals.plotsDry || 0
    );

  const totalPlotsTotal =
    summaryValue(
      summaryPlots,
      'total',
      totalPlotsWet +
      totalPlotsDry
    );

  const totalClustersWet =
    summaryValue(
      summaryClusters,
      'wet',
      levelTotals.clustersWet ||
      0
    );

  const totalClustersDry =
    summaryValue(
      summaryClusters,
      'dry',
      levelTotals.clustersDry ||
      0
    );

  const totalClustersTotal =
    summaryValue(
      summaryClusters,
      'total',
      totalClustersWet +
      totalClustersDry
    );

  const totalAreaWet =
    summaryValue(
      summaryArea,
      'wet',
      levelTotals.availWetArea ||
      0
    );

  const totalAreaDry =
    summaryValue(
      summaryArea,
      'dry',
      levelTotals.availDryArea ||
      0
    );

  const totalAreaTotal =
    summaryValue(
      summaryArea,
      'total',
      totalAreaWet +
      totalAreaDry
    );

  const handleDrillDownToZone =
    (row) => {
      navigate(
        `/report/kerala_work_allocation_report/zone/${encodeURIComponent(
          districtName
        )}/${encodeURIComponent(
          row.name
        )}`,
        {
          state: {
            districtId:
              resolvedDistrictId.current,
            districtName,
            talukId: row.id,
            talukName: row.name,
            talukData: row
          }
        }
      );
    };

  const reportLevelName =
    `${districtName} District Report (${jurisdiction.role})`;

  const handleExportExcel =
    () =>
      downloadWorkAllocationXls(
        {
          textColumns:
            TEXT_COLS,
          rows:
            filteredData,
          totals:
            tableTotals,
          totalLabels:
            TOTAL_LABELS,
          reportLevelName,
          username:
            jurisdiction.user
        }
      );

  const colSpanAll =
    TEXT_COLS.length +
    columns.length +
    1;

  const initialLoading =
    loading &&
    rows.length === 0 &&
    !error;

  const activeAccent =
    tab.accent;

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
          <Stack
            spacing={1.5}
            alignItems="center"
          >
            <CircularProgress />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading taluk work allocation report…
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

      {/* Page header */}
      <Grid item xs={12}>
        <Stack
          direction={{
            xs: 'column',
            sm: 'row'
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            sm: 'center'
          }}
          spacing={1.5}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.25,
                display: 'grid',
                placeItems: 'center',
                color:
                  'primary.main',
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.09
                )
              }}
            >
              <AssignmentIcon />
            </Box>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  lineHeight: 1.2
                }}
              >
                Work Allocation Abstract
              </Typography>

              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flexWrap="wrap"
                sx={{ mt: 0.3 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {districtName} District
                  {' • '}
                  Agricultural Year{' '}
                  {AuthService.agriyear() ||
                    '2025-2026'}
                  {' • '}
                  {rows.length}{' '}
                  Taluks
                </Typography>

                {loading && (
                  <Typography
                    variant="caption"
                    color="primary.main"
                  >
                    Refreshing…
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                navigate('/report/kerala_work_allocation_report')
              }
              sx={{
                minHeight: 38,
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              State View
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={
                loading
                  ? (
                    <CircularProgress
                      size={15}
                    />
                  )
                  : (
                    <RefreshIcon />
                  )
              }
              onClick={
                fetchTalukWorkAllocation
              }
              disabled={loading}
              sx={{
                minHeight: 38,
                width: {
                  xs: '100%',
                  sm: 'auto'
                }
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert
            severity={
              rows.length
                ? 'warning'
                : 'error'
            }
            onClose={() =>
              setError(null)
            }
            action={
              <Button
                color="inherit"
                size="small"
                onClick={
                  fetchTalukWorkAllocation
                }
              >
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

      {/* District summary */}
      <Grid item xs={12}>
        <Box sx={{ mb: 1.25 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700 }}
          >
            District Summary
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {`Current availability for estimation across ${districtName} District`}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg:
                'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)'
            },
            gap: 1.5,
            opacity:
              loading ? 0.7 : 1,
            transition:
              theme.transitions.create(
                'opacity'
              )
          }}
        >
          <AreaOverviewCard
            total={
              totalAreaTotal
            }
            wet={totalAreaWet}
            dry={totalAreaDry}
            loading={loading}
          />

          <SummaryMetricCard
            label="Plots for Estimation"
            total={
              totalPlotsTotal
            }
            wet={
              totalPlotsWet
            }
            dry={
              totalPlotsDry
            }
            unit="plots"
            color={
              UI_COLORS.primary
            }
            icon={
              <LocationCityIcon fontSize="small" />
            }
            loading={loading}
          />

          <SummaryMetricCard
            label="Clusters for Estimation"
            total={
              totalClustersTotal
            }
            wet={
              totalClustersWet
            }
            dry={
              totalClustersDry
            }
            unit="clusters"
            color={
              UI_COLORS.info
            }
            icon={
              <ViewModuleIcon fontSize="small" />
            }
            loading={loading}
          />
        </Box>
      </Grid>

      {/* Main report */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border:
              `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          {loading && (
            <LinearProgress
              aria-label="Refreshing work allocation data"
            />
          )}

          {/* Toolbar */}
          <Box
            sx={{
              p: {
                xs: 1.5,
                md: 2
              }
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                md: 'row'
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'stretch',
                md: 'center'
              }}
              spacing={1.5}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700
                  }}
                >
                  Taluk Work Allocation
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {filteredData.length}
                  {' of '}
                  {rows.length}
                  {' taluks shown'}
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                spacing={1}
              >
                <TextField
                  size="small"
                  label="Search taluk"
                  placeholder="e.g. Kottarakkara"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 250
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment:
                      searchTerm
                        ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              edge="end"
                              aria-label="Clear district search"
                              onClick={() =>
                                setSearchTerm(
                                  ''
                                )
                              }
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                        : null
                  }}
                />

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={
                    <FileDownloadIcon />
                  }
                  onClick={
                    handleExportExcel
                  }
                  disabled={
                    !filteredData.length ||
                    loading
                  }
                  sx={{
                    minHeight: 40,
                    whiteSpace: 'nowrap'
                  }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* Report tabs */}
          <Box
            sx={{
              px: {
                xs: 1,
                md: 1.5
              },
              bgcolor: alpha(
                activeAccent,
                0.025
              ),
              borderBottom:
                `1px solid ${theme.palette.divider}`
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(
                _,
                value
              ) =>
                setActiveTab(
                  value
                )
              }
              aria-label="Work allocation report sections"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 50,
                '& .MuiTabs-indicator':
                {
                  height: 3,
                  borderRadius:
                    '3px 3px 0 0',
                  bgcolor:
                    activeAccent
                },
                '& .MuiTab-root':
                {
                  textTransform:
                    'none',
                  fontWeight: 600,
                  minHeight: 50,
                  px: {
                    xs: 1.25,
                    md: 2
                  },
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: activeAccent,
                    bgcolor: alpha(
                      activeAccent,
                      0.08
                    )
                  }
                }
              }}
            >
              {TAB_DEFS.map(
                (
                  definition,
                  index
                ) => {
                  const Icon =
                    definition.icon;

                  return (
                    <Tab
                      key={
                        definition.key
                      }
                      icon={
                        <Icon
                          sx={{
                            fontSize: 18
                          }}
                        />
                      }
                      iconPosition="start"
                      label={
                        definition.shortLabel
                      }
                    />
                  );
                }
              )}
            </Tabs>
          </Box>

          {/* Active section context */}
          <Box
            sx={{
              px: {
                xs: 1.5,
                md: 2
              },
              py: 1.25,
              bgcolor:
                'background.paper'
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'flex-start',
                sm: 'center'
              }}
              spacing={0.75}
            >
              <Stack
                direction="row"
                spacing={0.9}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color:
                      activeAccent,
                    bgcolor: alpha(
                      activeAccent,
                      0.08
                    )
                  }}
                >
                  <TabIcon
                    sx={{
                      fontSize: 17
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700
                    }}
                  >
                    {tab.label}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {tab.description}
                  </Typography>
                </Box>
              </Stack>

              {!isMobile &&
                columns.length > 6 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Scroll horizontally to view all columns
                  </Typography>
                )}
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              opacity:
                loading && rows.length
                  ? 0.62
                  : 1,
              pointerEvents:
                loading && rows.length
                  ? 'none'
                  : 'auto',
              transition:
                theme.transitions.create(
                  'opacity'
                )
            }}
          >
            {isMobile ? (
              /* Mobile cards preserve every metric from the active tab. */
              <Stack
                spacing={1.25}
                sx={{ p: 1.5 }}
              >
                {filteredData.length >
                  0 ? (
                  filteredData.map(
                    (row) => {
                      return (
                        <Card
                          key={row.id}
                          variant="outlined"
                          sx={{
                            borderRadius: 2.25
                          }}
                        >
                          <CardContent
                            sx={{
                              p: 1.6,
                              '&:last-child':
                              {
                                pb: 1.6
                              }
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 700
                                  }}
                                >
                                  {row.name ||
                                    'N/A'}
                                </Typography>

                              </Box>

                              <Tooltip title="View zone details">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    handleDrillDownToZone(
                                      row
                                    )
                                  }
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>

                            <Stack
                              spacing={1.5}
                              sx={{ mt: 1.5 }}
                            >
                              {tab.groups.map(
                                (
                                  group,
                                  groupIndex
                                ) => (
                                  <Box
                                    key={
                                      group.label ||
                                      `group-${groupIndex}`
                                    }
                                  >
                                    {group.label && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          display:
                                            'block',
                                          mb: 0.7,
                                          fontWeight: 700,
                                          color:
                                            'text.secondary',
                                          textTransform:
                                            tab.uppercase
                                              ? 'uppercase'
                                              : 'none'
                                        }}
                                      >
                                        {group.label}
                                      </Typography>
                                    )}

                                    <Box
                                      sx={{
                                        display:
                                          'grid',
                                        gridTemplateColumns:
                                        {
                                          xs:
                                            group.columns.length >=
                                              3
                                              ? 'repeat(3, minmax(0, 1fr))'
                                              : 'repeat(2, minmax(0, 1fr))'
                                        },
                                        gap: 1
                                      }}
                                    >
                                      {group.columns.map(
                                        (
                                          column
                                        ) => (
                                          <MobileField
                                            key={
                                              column.key
                                            }
                                            label={
                                              column.label
                                            }
                                            row={
                                              row
                                            }
                                            column={
                                              column
                                            }
                                          />
                                        )
                                      )}
                                    </Box>
                                  </Box>
                                )
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    }
                  )
                ) : (
                  <Box
                    sx={{
                      py: 6,
                      px: 2,
                      textAlign: 'center'
                    }}
                  >
                    <SearchIcon
                      sx={{
                        fontSize: 38,
                        color:
                          'text.disabled'
                      }}
                    />

                    <Typography
                      variant="subtitle1"
                      sx={{
                        mt: 0.75,
                        fontWeight: 600
                      }}
                    >
                      No matching taluks
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Try a different taluk name.
                    </Typography>
                  </Box>
                )}
              </Stack>
            ) : (
              <TableContainer
                sx={{
                  maxHeight: '68vh',
                  overflowX: 'auto'
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    minWidth:
                      tab.key ===
                        'excluded'
                        ? 1420
                        : tab.key ===
                          'estimation'
                          ? 1160
                          : 720,
                    '& .MuiTableCell-root':
                    {
                      borderBottom:
                        `1px solid ${theme.palette.divider}`
                    }
                  }}
                  aria-label={`${tab.label} work allocation report`}
                >
                  <TableHead>
                    <TableRow sx={{ height: HEADER_ROW_HEIGHT }}>
                      {TEXT_COLS.map(
                        (
                          textColumn
                        ) => (
                          <TableCell
                            key={
                              textColumn.label
                            }
                            rowSpan={
                              hasGroupHeader(
                                tab
                              )
                                ? 2
                                : 1
                            }
                            sx={{
                              width:
                                textColumn.width,
                              minWidth: 220,
                              color:
                                UI_COLORS.headerText,
                              bgcolor:
                                UI_COLORS.headerBg,
                              fontWeight: 700,
                              position:
                                'sticky',
                              left: 0,
                              top: 0,
                              zIndex: 12,
                              borderRight:
                                `1px solid ${UI_COLORS.border}`,
                              borderBottom:
                                `1px solid ${UI_COLORS.strongBorder}`,
                              boxShadow:
                                `2px 0 0 ${UI_COLORS.border}`,
                              textTransform:
                                tab.uppercase
                                  ? 'uppercase'
                                  : 'none'
                            }}
                          >
                            {
                              textColumn.label
                            }
                          </TableCell>
                        )
                      )}

                      {tab.groups.map(
                        (
                          group,
                          groupIndex
                        ) =>
                          group.label ? (
                            <TableCell
                              key={
                                group.label
                              }
                              colSpan={
                                group.columns.length
                              }
                              align="center"
                              sx={{
                                color:
                                  UI_COLORS.headerText,
                                bgcolor:
                                  UI_COLORS.headerBg,
                                fontWeight: 700,
                                position: 'sticky',
                                top: 0,
                                zIndex: 9,
                                borderRight:
                                  groupIndex <
                                    tab.groups
                                      .length -
                                    1
                                    ? `1px solid ${UI_COLORS.border}`
                                    : undefined,
                                borderBottom:
                                  `1px solid ${UI_COLORS.border}`,
                                textTransform:
                                  tab.uppercase
                                    ? 'uppercase'
                                    : 'none',
                                whiteSpace:
                                  'nowrap'
                              }}
                            >
                              {group.label}
                            </TableCell>
                          ) : (
                            group.columns.map(
                              (
                                column
                              ) => (
                                <TableCell
                                  key={
                                    column.key
                                  }
                                  rowSpan={
                                    hasGroupHeader(
                                      tab
                                    )
                                      ? 2
                                      : 1
                                  }
                                  align="center"
                                  sx={{
                                    minWidth:
                                      column.type ===
                                        'remarks'
                                        ? 170
                                        : 100,
                                    color:
                                      UI_COLORS.headerText,
                                    bgcolor:
                                      UI_COLORS.headerBg,
                                    fontWeight: 700,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 9,
                                    borderBottom:
                                      `1px solid ${UI_COLORS.strongBorder}`
                                  }}
                                >
                                  {
                                    column.label
                                  }
                                </TableCell>
                              )
                            )
                          )
                      )}

                      <TableCell
                        rowSpan={
                          hasGroupHeader(
                            tab
                          )
                            ? 2
                            : 1
                        }
                        align="center"
                        sx={{
                          width: 72,
                          minWidth: 72,
                          color:
                            UI_COLORS.headerText,
                          bgcolor:
                            UI_COLORS.headerBg,
                          fontWeight: 700,
                          position:
                            'sticky',
                          right: 0,
                          top: 0,
                          zIndex: 12,
                          borderLeft:
                            `1px solid ${UI_COLORS.border}`,
                          borderBottom:
                            `1px solid ${UI_COLORS.strongBorder}`
                        }}
                      >
                        View
                      </TableCell>
                    </TableRow>

                    {hasGroupHeader(
                      tab
                    ) && (
                        <TableRow>
                          {tab.groups
                            .filter(
                              (group) =>
                                group.label
                            )
                            .flatMap(
                              (group) =>
                                group.columns
                            )
                            .map(
                              (
                                column
                              ) => {
                                return (
                                  <TableCell
                                    key={
                                      column.key
                                    }
                                    align="center"
                                    sx={{
                                      minWidth:
                                        column.type ===
                                          'remarks'
                                          ? 170
                                          : 96,
                                      color:
                                        column.tone === 'wet'
                                          ? UI_COLORS.primaryDark
                                          : column.tone === 'dry'
                                            ? UI_COLORS.orangeDark
                                            : UI_COLORS.subHeaderText,
                                      bgcolor:
                                        UI_COLORS.headerBg,
                                      fontWeight: 650,
                                      fontSize:
                                        '0.75rem',
                                      whiteSpace:
                                        'nowrap',
                                      position:
                                        'sticky',
                                      top:
                                        HEADER_ROW_HEIGHT,
                                      zIndex: 8,
                                      borderBottom:
                                        `1px solid ${UI_COLORS.strongBorder}`,
                                      borderRight:
                                        column.groupEnd
                                          ? `1px solid ${UI_COLORS.border}`
                                          : undefined
                                    }}
                                  >
                                    {
                                      column.label
                                    }
                                  </TableCell>
                                );
                              }
                            )}
                        </TableRow>
                      )}
                  </TableHead>

                  <TableBody>
                    {filteredData.length >
                      0 ? (
                      filteredData.map(
                        (row) => {
                          return (
                            <TableRow
                              key={row.id}
                              hover
                              onClick={() =>
                                handleDrillDownToZone(
                                  row
                                )
                              }
                              sx={{
                                cursor: 'pointer',
                                '&:nth-of-type(even)':
                                {
                                  bgcolor:
                                    alpha(
                                      theme.palette.primary.main,
                                      0.015
                                    )
                                },
                                '&:hover':
                                {
                                  bgcolor:
                                    alpha(
                                      theme.palette.primary.main,
                                      0.045
                                    )
                                }
                              }}
                            >
                              <TableCell
                                sx={{
                                  position:
                                    'sticky',
                                  left: 0,
                                  zIndex: 3,
                                  bgcolor:
                                    'inherit',
                                  minWidth: 220,
                                  boxShadow:
                                    `2px 0 0 ${theme.palette.divider}`
                                }}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={0.8}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 650,
                                      whiteSpace:
                                        'nowrap'
                                    }}
                                  >
                                    {row.name ||
                                      'N/A'}
                                  </Typography>

                                </Stack>
                              </TableCell>

                              {columns.map(
                                (
                                  column
                                ) => (
                                  <TableCell
                                    key={
                                      column.key
                                    }
                                    align="center"
                                    sx={{
                                      minWidth:
                                        column.type ===
                                          'remarks'
                                          ? 170
                                          : 96,
                                      bgcolor:
                                        column.tone ===
                                          'total'
                                          ? alpha(
                                            activeAccent,
                                            0.035
                                          )
                                          : 'inherit',
                                      borderRight:
                                        column.groupEnd
                                          ? `1px solid ${theme.palette.divider}`
                                          : undefined
                                    }}
                                  >
                                    <MetricValue
                                      row={
                                        row
                                      }
                                      column={
                                        column
                                      }
                                    />
                                  </TableCell>
                                )
                              )}

                              <TableCell
                                align="center"
                                sx={{
                                  position:
                                    'sticky',
                                  right: 0,
                                  zIndex: 3,
                                  bgcolor:
                                    'inherit',
                                  boxShadow:
                                    `-2px 0 0 ${theme.palette.divider}`
                                }}
                              >
                                <Tooltip title="View zone details">
                                  <IconButton
                                    size="small"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDrillDownToZone(row);
                                    }}
                                    sx={{
                                      color: 'primary.main',
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.07
                                      )
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={
                            colSpanAll
                          }
                          align="center"
                          sx={{
                            py: 6
                          }}
                        >
                          <SearchIcon
                            sx={{
                              fontSize: 36,
                              color:
                                'text.disabled'
                            }}
                          />

                          <Typography
                            variant="subtitle1"
                            sx={{
                              mt: 0.75,
                              fontWeight: 600
                            }}
                          >
                            No matching taluk records
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            Try another taluk name.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}

                    {!loading &&
                      filteredData.length >
                      0 && (
                        <TableRow
                          sx={{
                            bgcolor:
                              alpha(
                                activeAccent,
                                0.07
                              ),
                            '& .MuiTableCell-root':
                            {
                              borderTop:
                                `2px solid ${alpha(
                                  activeAccent,
                                  0.22
                                )}`
                            }
                          }}
                        >
                          <TableCell
                            sx={{
                              position:
                                'sticky',
                              left: 0,
                              zIndex: 4,
                              bgcolor:
                                alpha(
                                  activeAccent,
                                  0.07
                                ),
                              fontWeight: 800,
                              whiteSpace:
                                'nowrap'
                            }}
                          >
                            {searchTerm
                              ? 'Filtered Total'
                              : TOTAL_LABELS[
                              activeTab
                              ]}
                          </TableCell>

                          {columns.map(
                            (
                              column
                            ) => (
                              <TableCell
                                key={
                                  column.key
                                }
                                align="center"
                                sx={{
                                  bgcolor:
                                    column.tone ===
                                      'total'
                                      ? alpha(
                                        activeAccent,
                                        0.1
                                      )
                                      : 'inherit',
                                  borderRight:
                                    column.groupEnd
                                      ? `1px solid ${theme.palette.divider}`
                                      : undefined
                                }}
                              >
                                {column.type ===
                                  'remarks' ? null : (
                                  <MetricValue
                                    row={
                                      tableTotals
                                    }
                                    column={
                                      column
                                    }
                                    total
                                  />
                                )}
                              </TableCell>
                            )
                          )}

                          <TableCell
                            sx={{
                              position:
                                'sticky',
                              right: 0,
                              zIndex: 4,
                              bgcolor:
                                alpha(
                                  activeAccent,
                                  0.07
                                )
                            }}
                          />
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* All matching taluks are displayed together for easier comparison. */}
          <Box
            sx={{
              px: {
                xs: 1.5,
                md: 2
              },
              py: 1.1,
              borderTop:
                `1px solid ${theme.palette.divider}`,
              bgcolor:
                alpha(
                  theme.palette.primary.main,
                  0.015
                )
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Showing all{' '}
              {filteredData.length}
              {' matching '}
              taluk
              {filteredData.length ===
                1
                ? ''
                : 's'}
              .
              {searchTerm
                ? ' Totals reflect the current search.'
                : ' District totals are shown in the summary above.'}
            </Typography>
          </Box>
        </Paper>
      </Grid>

    </Grid>
  );
}

export default TalukWorkAllocationReport;
