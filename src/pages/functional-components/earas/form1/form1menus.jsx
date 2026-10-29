import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Rating,
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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Agriculture as AgricultureIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  FactCheck as FactCheckIcon,
  Grass as GrassIcon,
  Image as ImageIcon,
  InfoOutlined as InfoOutlinedIcon,
  LocationOn as LocationOnIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  Water as WaterIcon
} from '@mui/icons-material';

import axios from 'axios';
import { useParams } from 'react-router-dom';

import api from 'api/api';
import mainapi from 'api/mainapi';
import authservice from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';
import ExcelView from './ExcelView';

const DEFAULT_FINDINGS_CATEGORIES = [
  {
    findingsId: 1,
    findingsLabel: 'Plot Inspection',
    subLabels: [
      {
        findingsLabelMappingId: 1,
        findingsSubLabel: 'Plot Details'
      }
    ]
  },
  {
    findingsId: 2,
    findingsLabel: 'Land Utlization Inspection',
    subLabels: [
      {
        findingsLabelMappingId: 2,
        findingsSubLabel: 'Land Utilisation Details'
      }
    ]
  },
  {
    findingsId: 3,
    findingsLabel: 'Irrigation Inspection',
    subLabels: [
      {
        findingsLabelMappingId: 3,
        findingsSubLabel: 'Irrigation Data Details'
      }
    ]
  },
  {
    findingsId: 4,
    findingsLabel: 'Cluster Inspection',
    subLabels: [
      {
        findingsLabelMappingId: 4,
        findingsSubLabel: 'Cluster Formation Details'
      },
      {
        findingsLabelMappingId: 5,
        findingsSubLabel: 'Crop Data Entry'
      },
      {
        findingsLabelMappingId: 43,
        findingsSubLabel: 'NUC/FFS/COS Details'
      }
    ]
  }
];

const SEASONS = [
  { id: 1, name: 'Autumn' },
  { id: 2, name: 'Winter' },
  { id: 3, name: 'Summer' }
];

const AREA_FIELDS = [
  { key: 'netAreasSown', label: 'Net Areas Sown' },
  { key: 'currentFallowArea', label: 'Current Fallow' },
  { key: 'otherFallowArea', label: 'Other Fallow' },
  { key: 'cultivableWasteArea', label: 'Cultivable Waste' },
  { key: 'permanentPasturesArea', label: 'Permanent Pastures' },
  { key: 'barrenArea', label: 'Barren Area' },
  { key: 'nonAgriculturalArea', label: 'Non-Agricultural Area' },
  { key: 'buildingArea', label: 'Building Area' },
  { key: 'miscellaneousTreesArea', label: 'Miscellaneous Trees' },
  { key: 'areaUnderSocialForestry', label: 'Social Forestry' },
  { key: 'waterloggedArea', label: 'Waterlogged Area' },
  { key: 'stillWaterLand', label: 'Still Water' },
  { key: 'marshyLand', label: 'Marshy Land' }
];

const DEFAULT_CLUSTER_LABELS = ['K', 'S1', 'E1', 'N1', 'W1'];

const getSeasonLabel = (seasonId) =>
  SEASONS.find((season) => season.id === Number(seasonId))?.name || 'Autumn';

const formatNumber = (value, digits = 2) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

const isCountBasedCrop = (crop) => {
  if (!crop) return false;
  const unitId = Number(crop.unitId);
  if (unitId === 1) return true;
  const unitStr = String(crop.unit || '').trim().toLowerCase();
  if (
    unitStr === 'count' ||
    unitStr === 'എണ്ണം' ||
    unitStr.includes('count') ||
    unitStr === 'nos' ||
    unitStr === 'no' ||
    unitStr === 'number' ||
    unitStr === 'numbers'
  ) {
    return true;
  }
  // Check if centPerTree is configured (> 0) and unit is not area (cent / hectare / ha)
  if (
    crop.centPerTree !== null &&
    crop.centPerTree !== undefined &&
    Number(crop.centPerTree) > 0 &&
    !unitStr.includes('cent') &&
    !unitStr.includes('സെന്റ്') &&
    !unitStr.includes('hec') &&
    !unitStr.includes('ha')
  ) {
    return true;
  }
  return false;
};

const formatCropUnit = (crop, isCount) => {
  const unit = crop?.unit;
  if (unit) {
    const u = String(unit).trim();
    if (u.toLowerCase() === 'count') return 'Count';
    if (u === 'എണ്ണം') return 'എണ്ണം (Count)';
    if (u.toLowerCase() === 'cent' || u.toLowerCase() === 'cents') return 'Cent';
    if (u === 'സെന്റ്') return 'സെന്റ് (Cent)';
    return u;
  }
  return isCount ? 'Count' : 'Cent';
};

const getCleanClusterCode = (raw) => {
  if (!raw) return '';
  return String(raw).trim().replace(/^cluster\s*/i, '').toUpperCase();
};

function getRecordClusterLabel(record) {
  return record?.clusterLabel || record?.cluster_label || record?.cluster || '';
}

function getClusterContext(clusterLabelsInfo, records = []) {
  const clusterAreaMap = {};
  let activeClusters = [];

  if (Array.isArray(clusterLabelsInfo) && clusterLabelsInfo.length > 0) {
    clusterLabelsInfo.forEach((item) => {
      const label = item.label || item.clusterLabel || item.name;

      if (label && !activeClusters.includes(label)) {
        activeClusters.push(label);

        const area =
          item.totalEnumeratedArea ??
          item.area ??
          item.enumeratedArea ??
          0;

        clusterAreaMap[label] =
          typeof area === 'number' ? area : Number(area) || 0;
      }
    });
  }

  if (activeClusters.length === 0) {
    activeClusters = Array.from(
      new Set(
        (records || [])
          .map(getRecordClusterLabel)
          .filter(Boolean)
      )
    );

    if (activeClusters.length === 0) {
      activeClusters = [...DEFAULT_CLUSTER_LABELS];
    } else {
      activeClusters.sort((a, b) => {
        if (a === 'K') return -1;
        if (b === 'K') return 1;
        return a.localeCompare(b, undefined, { numeric: true });
      });
    }
  }

  const totalClusterArea = activeClusters.reduce(
    (sum, label) => sum + (clusterAreaMap[label] || 0),
    0
  );

  return { activeClusters, clusterAreaMap, totalClusterArea };
}

function findMatchingCluster(activeClusters, rawLabel) {
  const cleanLabel = getCleanClusterCode(rawLabel);

  return activeClusters.find(
    (cluster) =>
      getCleanClusterCode(cluster) === cleanLabel ||
      String(cluster).toUpperCase() === cleanLabel
  );
}

function DetailItem({ label, value, icon }) {
  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Box
        sx={{
          p: 1.75,
          height: '100%',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                color: 'primary.main'
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
        </Stack>

        <Box sx={{ mt: 0.8 }}>
          {React.isValidElement(value) ? (
            value
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 650, wordBreak: 'break-word' }}>
              {value === null || value === undefined || value === '' ? 'N/A' : value}
            </Typography>
          )}
        </Box>
      </Box>
    </Grid>
  );
}

function TabPanel({ children, value, index }) {
  return (
    <div
      hidden={value !== index}
      role="tabpanel"
      id={`form1-tabpanel-${index}`}
      aria-labelledby={`form1-tab-${index}`}
    >
      {value === index && <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>{children}</Box>}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <TextField
      label="Search"
      placeholder={placeholder}
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ width: { xs: '100%', sm: 280 } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              size="small"
              aria-label="Clear search"
              onClick={() => onChange('')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
    />
  );
}

function LoadingPanel({ message = 'Loading data…' }) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
      <CircularProgress size={30} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {message}
      </Typography>
    </Box>
  );
}

function EmptyState({ title, description }) {
  return (
    <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
      <InfoOutlinedIcon sx={{ fontSize: 42, color: 'text.disabled', mb: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

const HEADER_ROW_1_H = 48;

function HeaderCell({
  children,
  align = 'left',
  rowSpan,
  colSpan,
  sticky = false,
  top = 0,
  sx = {}
}) {
  const theme = useTheme();
  // Z-index layering:
  // - sticky left header cells (corner): zIndex 12 (must stay on top of both sticky top headers and sticky left body)
  // - top header row 1: zIndex 11
  // - sub-header row 2: zIndex 10
  // - sticky left body cells: zIndex 3 or 4
  const effectiveZIndex = sticky ? 12 : top > 0 ? 10 : 11;

  return (
    <TableCell
      align={align}
      rowSpan={rowSpan}
      colSpan={colSpan}
      sx={{
        position: 'sticky',
        top: typeof top === 'number' ? `${top}px` : top,
        zIndex: effectiveZIndex,
        bgcolor: `${theme.palette.primary.dark} !important`,
        color: theme.palette.primary.contrastText,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        borderRight: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
        py: top > 0 ? 0.6 : 0.75,
        ...(sticky && {
          left: 0,
          minWidth: 190,
          boxShadow: `2px 0 0 ${theme.palette.divider}`
        }),
        ...sx
      }}
    >
      {children}
    </TableCell>
  );
}

function SummaryRowCell({ children, align = 'right', sx = {} }) {
  return (
    <TableCell
      align={align}
      sx={{
        fontWeight: 700,
        bgcolor: 'action.hover',
        fontVariantNumeric: 'tabular-nums',
        ...sx
      }}
    >
      {children}
    </TableCell>
  );
}

function Form1_menus() {
  const theme = useTheme();
  const { zoneId: routeZoneId } = useParams();

  const [activeTab, setActiveTab] = useState(0);
  const [clusterNo, setClusterNo] = useState('');

  const [clusterId, setClusterId] = useState('');
  const [districtId, setDistrictId] = useState(null);
  const [zoneName, setZoneName] = useState('');
  const [clusterType, setClusterType] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const keyplotNo = params.get('No');
      const slNo = params.get('slno');
      return (
        params.get('clusterType') ||
        params.get('landType') ||
        params.get('type') ||
        (keyplotNo && sessionStorage.getItem(`cluster_type_${keyplotNo}`)) ||
        (slNo && sessionStorage.getItem(`cluster_type_${slNo}`)) ||
        sessionStorage.getItem('current_cluster_type') ||
        ''
      );
    } catch {
      return '';
    }
  });

  const [keyplotData, setKeyplotData] = useState(null);
  const [cropData, setCropData] = useState([]);
  const [irrigationData, setIrrigationData] = useState([]);
  const [landUtilizationData, setLandUtilizationData] = useState([]);
  const [nucData, setNucData] = useState([]);
  const [allSeasonsNucData, setAllSeasonsNucData] = useState({
    1: [],
    2: [],
    3: []
  });
  const [clusterLabelsInfo, setClusterLabelsInfo] = useState([]);

  const [seasonId, setSeasonId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isCropLoading, setIsCropLoading] = useState(false);
  const [openExcelView, setOpenExcelView] = useState(false);

  const [pageError, setPageError] = useState(null);
  const [cropFetchError, setCropFetchError] = useState(null);

  const cropRequestRef = useRef(0);

  const [findingsCategories, setFindingsCategories] = useState(DEFAULT_FINDINGS_CATEGORIES);
  const [isFindingsLoading, setIsFindingsLoading] = useState(false);
  const [findingsError, setFindingsError] = useState(null);

  const [selectedFindingId, setSelectedFindingId] = useState(1);
  const [selectedMappingId, setSelectedMappingId] = useState(1);

  const [clusterInspectionMap, setClusterInspectionMap] = useState({});
  const [isInspectionLoading, setIsInspectionLoading] = useState(false);
  const [inspectionFetchError, setInspectionFetchError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [inspectionSearchTerm, setInspectionSearchTerm] = useState('');

  const {
    activeClusters: inspectionClusters,
    clusterAreaMap: inspectionClusterAreaMap
  } = useMemo(() => {
    return getClusterContext(clusterLabelsInfo, cropData);
  }, [clusterLabelsInfo, cropData]);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchKeyplotDetails = useCallback(
    async (idFromUrl) => {
      if (!idFromUrl) return;

      setIsLoading(true);
      setPageError(null);

      try {
        const [detailsRes, keyplotRes] = await Promise.allSettled([
          api.get(
            `${mainapi.BASE_URL}/btr-service/key-plots/fetch-by-keyplotsdetails/${idFromUrl}`,
            { headers: authHeaders() }
          ),
          api.get(
            `${mainapi.BASE_URL}/btr-service/key-plots/get-keyplot/${idFromUrl}`,
            { headers: authHeaders() }
          )
        ]);

        const detailsPayload =
          detailsRes.status === 'fulfilled' ? detailsRes.value?.data?.payload : null;
        const keyplotPayload =
          keyplotRes.status === 'fulfilled' ? keyplotRes.value?.data?.payload : null;

        if (!detailsPayload && !keyplotPayload) {
          throw new Error('Invalid Keyplot API response structure or empty payload.');
        }

        const mergedPayload = {
          ...(keyplotPayload || {}),
          ...(detailsPayload || {}),
          landType:
            keyplotPayload?.landType ||
            detailsPayload?.landType ||
            keyplotPayload?.clusterType ||
            detailsPayload?.clusterType ||
            '',
          clusterType:
            keyplotPayload?.clusterType ||
            detailsPayload?.clusterType ||
            keyplotPayload?.landType ||
            detailsPayload?.landType ||
            '',
          distId: detailsPayload?.distId ?? keyplotPayload?.distId ?? keyplotPayload?.districtId ?? null,
          zoneName: detailsPayload?.zoneName || keyplotPayload?.zoneName || 'N/A',
          cluster_id:
            detailsPayload?.cluster_id ||
            detailsPayload?.clusterId ||
            keyplotPayload?.clusterId ||
            keyplotPayload?.cluster_id ||
            '',
          zoneId: keyplotPayload?.zoneId ?? detailsPayload?.zoneId ?? null
        };

        const detectedType =
          mergedPayload.landType ||
          mergedPayload.clusterType ||
          keyplotPayload?.landType ||
          keyplotPayload?.clusterType;

        if (detectedType) {
          setClusterType(detectedType);
          try {
            sessionStorage.setItem(`cluster_type_${idFromUrl}`, detectedType);
          } catch (e) {
            console.warn(e);
          }
        }

        // Secondary fallback: if landType / clusterType is still missing, query cluster-form-status
        const effectiveZoneId =
          mergedPayload.zoneId ||
          routeZoneId ||
          new URLSearchParams(window.location.search).get('zoneId') ||
          window.location.pathname.match(/Clusters_Form\/([^/]+)/)?.[1];

        if (
          effectiveZoneId &&
          effectiveZoneId !== 'ClusterFormView' &&
          !mergedPayload.landType &&
          !mergedPayload.clusterType
        ) {
          try {
            const agriYear = authservice?.agriyear ? authservice.agriyear() : '2025-2026';
            const statusRes = await api.get(
              `${mainapi.BASE_URL}/btr-service/cluster-api/cluster-form-status/${effectiveZoneId}/${agriYear}`,
              { headers: authHeaders() }
            );
            const clusterList = statusRes?.data?.payload || [];
            const currSlno = new URLSearchParams(window.location.search).get('slno');
            const matched = clusterList.find(
              (c) =>
                String(c.keyplotId) === String(idFromUrl) ||
                (currSlno && String(c.clusterNo) === String(currSlno))
            );
            if (matched?.clusterType) {
              mergedPayload.clusterType = matched.clusterType;
              mergedPayload.landType = matched.clusterType;
              setClusterType(matched.clusterType);
              try {
                sessionStorage.setItem(`cluster_type_${idFromUrl}`, matched.clusterType);
              } catch (e) {
                console.warn(e);
              }
            }
          } catch (statusErr) {
            console.warn('Fallback cluster-form-status fetch error:', statusErr);
          }
        }

        setKeyplotData(mergedPayload);
        setDistrictId(mergedPayload.distId ?? null);
        setZoneName(mergedPayload.zoneName || 'N/A');
        setClusterId(mergedPayload.cluster_id || '');
      } catch (error) {
        console.error('Error fetching keyplot details:', error);
        setKeyplotData(null);
        setPageError(`Failed to fetch Keyplot details. ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [authHeaders, routeZoneId]
  );

  const fetchClusterLabels = useCallback(
    async (targetClusterId) => {
      if (!targetClusterId) return;

      try {
        const response = await api.post(
          `${mainapi.BASE_URL}/btr-service/cluster-api/cluster-labels/list`,
          { clusterId: Number(targetClusterId) || targetClusterId },
          { headers: authHeaders() }
        );

        const responseData = response?.data;
        const list =
          responseData?.payload ||
          responseData?.data ||
          (Array.isArray(responseData) ? responseData : []);

        setClusterLabelsInfo(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching cluster labels:', error);
        setClusterLabelsInfo([]);
      }
    },
    [authHeaders]
  );

  const fetchCropDetails = useCallback(
    async (targetSeason) => {
      if (!clusterId || !districtId || !targetSeason) return;

      const requestId = cropRequestRef.current + 1;
      cropRequestRef.current = requestId;

      setIsCropLoading(true);
      setCropFetchError(null);

      try {
        const response = await axios.get(
          `${mainapi.BASE_URL}/earas-form1-entry/crop-details/fetch-by-clusterId/${clusterId}/season/${targetSeason}/district/${districtId}`,
          {
            headers: authHeaders(),
            timeout: 30000
          }
        );

        if (requestId !== cropRequestRef.current) return;

        const payload = response?.data?.payload;

        if (Array.isArray(payload) && payload.length > 0) {
          setCropData(payload);
          setCropFetchError(null);
        } else {
          setCropData([]);
          setCropFetchError(
            `No crop data available for ${getSeasonLabel(targetSeason)} season.`
          );
        }
      } catch (error) {
        if (requestId !== cropRequestRef.current) return;

        console.error('Error fetching crop details:', error);
        setCropData([]);
        setCropFetchError(
          error.response?.status === 404
            ? `No crop data found for ${getSeasonLabel(targetSeason)} season.`
            : 'Failed to load crop data. Please try again.'
        );
      } finally {
        if (requestId === cropRequestRef.current) {
          setIsCropLoading(false);
        }
      }
    },
    [authHeaders, clusterId, districtId]
  );

  const fetchIrrigationDetails = useCallback(async () => {
    if (!clusterId) return;

    try {
      const response = await axios.get(
        `${mainapi.BASE_URL}/earas-form1-entry/irrigation-details/fetch-by-clusterId/${clusterId}`,
        { headers: authHeaders() }
      );

      const payload = response?.data?.payload;
      setIrrigationData(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Error fetching irrigation details:', error);
      setIrrigationData([]);
    }
  }, [authHeaders, clusterId]);

  const fetchLandUtilizationDetails = useCallback(async () => {
    if (!clusterId) return;

    try {
      const response = await axios.get(
        `${mainapi.BASE_URL}/earas-form1-entry/land-utilization-details/fetch-by-clusterId/${clusterId}`,
        { headers: authHeaders() }
      );

      const payload = response?.data?.payload;
      setLandUtilizationData(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error('Error fetching land utilization details:', error);
      setLandUtilizationData([]);
    }
  }, [authHeaders, clusterId]);

  const fetchNucDetails = useCallback(
    async (targetSeason) => {
      if (!clusterId || !targetSeason) return;

      try {
        const response = await axios.get(
          `${mainapi.BASE_URL}/earas-form1-entry/nuc-details/fetch-by-clusterId/${clusterId}/season/${targetSeason}`,
          { headers: authHeaders() }
        );

        const payload = response?.data?.payload;
        setNucData(Array.isArray(payload) ? payload : []);
      } catch (error) {
        console.error(`Error fetching NUC details for season ${targetSeason}:`, error);
        setNucData([]);
      }
    },
    [authHeaders, clusterId]
  );

  const fetchAllSeasonsNucDetails = useCallback(async () => {
    if (!clusterId) return;

    const results = { 1: [], 2: [], 3: [] };

    await Promise.all(
      SEASONS.map(async (season) => {
        try {
          const response = await axios.get(
            `${mainapi.BASE_URL}/earas-form1-entry/nuc-details/fetch-by-clusterId/${clusterId}/season/${season.id}`,
            {
              headers: authHeaders(),
              timeout: 15000
            }
          );

          const payload = response?.data?.payload;

          if (Array.isArray(payload)) {
            results[season.id] = payload;
          }
        } catch (error) {
          console.error(`Error fetching NUC details for season ${season.id}:`, error);
        }
      })
    );

    setAllSeasonsNucData(results);
  }, [authHeaders, clusterId]);

  const fetchFindings = useCallback(async () => {
    setIsFindingsLoading(true);
    setFindingsError(null);

    const endpoints = [
      `${mainapi.BASE_URL}/earas-form1-entry/inspection-details/findings/1`,
      `${mainapi.BASE_URL}/inspection-details/findings/1`
    ];

    let success = false;
    for (const url of endpoints) {
      try {
        const response = await axios.get(url, {
          headers: authHeaders(),
          timeout: 15000
        });
        const payload = response?.data?.payload;
        if (Array.isArray(payload) && payload.length > 0) {
          setFindingsCategories(payload);
          setSelectedFindingId((prev) => prev || payload[0].findingsId);
          const firstSub = payload[0].subLabels?.[0];
          if (firstSub) {
            setSelectedMappingId((prev) => prev || firstSub.findingsLabelMappingId);
          }
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`Failed to fetch findings from ${url}:`, err.message);
      }
    }

    if (!success) {
      console.info('Using default findings categories configuration.');
    }
    setIsFindingsLoading(false);
  }, [authHeaders]);

  const fetchAllClustersInspection = useCallback(
    async (targetMappingId, clustersToFetch) => {
      const effZoneId = Number(
        keyplotData?.zoneId ||
        routeZoneId ||
        new URLSearchParams(window.location.search).get('zoneId') ||
        window.location.pathname.match(/Clusters_Form\/([^/]+)/)?.[1] ||
        0
      ) || 0;

      const effClusterId = Number(
        clusterId ||
        keyplotData?.cluster_id ||
        keyplotData?.clusterId ||
        0
      ) || 0;

      if (!targetMappingId || !clustersToFetch || clustersToFetch.length === 0) return;

      setIsInspectionLoading(true);
      setInspectionFetchError(null);

      const clusterResults = {};

      await Promise.allSettled(
        clustersToFetch.map(async (clusterLabel) => {
          const requestBody = {
            zoneId: effZoneId,
            clusterId: effClusterId,
            clusterLabel: clusterLabel,
            findingsLabelMappingId: Number(targetMappingId)
          };

          const endpoints = [
            `${mainapi.BASE_URL}/earas-form1-entry/inspection-details/fetch`,
            `${mainapi.BASE_URL}/inspection-details/fetch`
          ];

          for (const url of endpoints) {
            try {
              const response = await axios.post(url, requestBody, {
                headers: authHeaders(),
                timeout: 15000
              });

              const data = response?.data;
              const result = data?.payload || data;

              if (result && typeof result === 'object') {
                clusterResults[clusterLabel] = result;
                break;
              }
            } catch (err) {
              // try next endpoint if error
            }
          }

          if (!clusterResults[clusterLabel]) {
            clusterResults[clusterLabel] = null;
          }
        })
      );

      setClusterInspectionMap(clusterResults);
      setIsInspectionLoading(false);
    },
    [authHeaders, clusterId, keyplotData, routeZoneId]
  );

  useEffect(() => {
    if (activeTab === 4) {
      fetchFindings();
    }
  }, [activeTab, fetchFindings]);

  useEffect(() => {
    if (activeTab === 4 && selectedMappingId && inspectionClusters.length > 0) {
      fetchAllClustersInspection(selectedMappingId, inspectionClusters);
    }
  }, [activeTab, selectedMappingId, inspectionClusters, fetchAllClustersInspection]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyplotNo = urlParams.get('No');
    const clusterNoParam = urlParams.get('slno');
    const typeParam =
      urlParams.get('clusterType') ||
      urlParams.get('landType') ||
      urlParams.get('type');
    const seasonIdParam = urlParams.get('seasonId');

    if (seasonIdParam) {
      const parsedSeason = Number(seasonIdParam);
      if (parsedSeason >= 1 && parsedSeason <= 3) {
        setSeasonId(parsedSeason);
      }
    }

    if (clusterNoParam) {
      setClusterNo(decodeURIComponent(clusterNoParam));
    }

    if (typeParam) {
      setClusterType(decodeURIComponent(typeParam));
    } else {
      const decodedKeyplotNo = keyplotNo ? decodeURIComponent(keyplotNo) : '';
      const decodedClusterNo = clusterNoParam ? decodeURIComponent(clusterNoParam) : '';
      try {
        const savedType =
          (decodedKeyplotNo && sessionStorage.getItem(`cluster_type_${decodedKeyplotNo}`)) ||
          (decodedClusterNo && sessionStorage.getItem(`cluster_type_${decodedClusterNo}`)) ||
          sessionStorage.getItem('current_cluster_type');
        if (savedType) {
          setClusterType(savedType);
        }
      } catch (err) {
        console.warn('SessionStorage error:', err);
      }
    }

    if (keyplotNo) {
      fetchKeyplotDetails(decodeURIComponent(keyplotNo));
    } else {
      setPageError('Keyplot number is missing from the URL.');
    }
  }, [fetchKeyplotDetails]);

  useEffect(() => {
    if (!clusterId) return;

    Promise.allSettled([
      fetchClusterLabels(clusterId),
      fetchIrrigationDetails(),
      fetchLandUtilizationDetails(),
      fetchAllSeasonsNucDetails()
    ]);
  }, [
    clusterId,
    fetchAllSeasonsNucDetails,
    fetchClusterLabels,
    fetchIrrigationDetails,
    fetchLandUtilizationDetails
  ]);

  useEffect(() => {
    if (!clusterId || !districtId || !seasonId) return;

    fetchCropDetails(seasonId);
    fetchNucDetails(seasonId);
  }, [clusterId, districtId, fetchCropDetails, fetchNucDetails, seasonId]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setSearchTerm('');
  };

  const handleOpenExcelView = () => {
    setOpenExcelView(true);
  };

  const handleCloseExcelView = () => {
    setOpenExcelView(false);
  };

  const isDryPlot = useMemo(() => {
    // 1. Check explicit state
    if (typeof clusterType === 'string' && clusterType.toLowerCase().includes('dry')) {
      return true;
    }

    // 2. Check URL parameters (e.g. ?type=dry, ?clusterType=dry, ?landType=dry)
    const urlParams = new URLSearchParams(window.location.search);
    const hasDryUrlParam = ['type', 'clusterType', 'landType', 'plotType', 'category'].some((param) => {
      const val = urlParams.get(param);
      return typeof val === 'string' && val.toLowerCase().includes('dry');
    });
    if (hasDryUrlParam) return true;

    // 3. Check sessionStorage
    try {
      const currentNo = urlParams.get('No');
      const currentSlno = urlParams.get('slno');
      const cachedType =
        (currentNo && sessionStorage.getItem(`cluster_type_${currentNo}`)) ||
        (currentSlno && sessionStorage.getItem(`cluster_type_${currentSlno}`)) ||
        sessionStorage.getItem('current_cluster_type');
      if (typeof cachedType === 'string' && cachedType.toLowerCase().includes('dry')) {
        return true;
      }
    } catch {
      // ignore storage error
    }

    // 4. Check keyplotData
    if (keyplotData) {
      if (keyplotData.isDry === true || keyplotData.is_dry === true) {
        return true;
      }

      const hasDryKeyplotField = [
        keyplotData.clusterType,
        keyplotData.cluster_type,
        keyplotData.landType,
        keyplotData.land_type,
        keyplotData.plotType,
        keyplotData.plot_type,
        keyplotData.btrTypeName,
        keyplotData.btr_type_name,
        keyplotData.btrType,
        keyplotData.btr_type,
        keyplotData.type,
        keyplotData.landCategory,
        keyplotData.land_category
      ].some((val) => typeof val === 'string' && val.toLowerCase().includes('dry'));

      if (hasDryKeyplotField) return true;
    }

    // 5. Check clusterLabelsInfo
    if (Array.isArray(clusterLabelsInfo) && clusterLabelsInfo.length > 0) {
      const hasDryClusterInfo = clusterLabelsInfo.some((c) =>
        [
          c?.clusterType,
          c?.cluster_type,
          c?.type,
          c?.landType,
          c?.land_type,
          c?.plotType,
          c?.plot_type
        ].some((val) => typeof val === 'string' && val.toLowerCase().includes('dry'))
      );
      if (hasDryClusterInfo) return true;
    }

    // 6. Check data records
    const checkRecordsDry = (records) =>
      Array.isArray(records) &&
      records.some((r) =>
        [
          r?.clusterType,
          r?.cluster_type,
          r?.landType,
          r?.land_type,
          r?.plotType,
          r?.plot_type,
          r?.type
        ].some((val) => typeof val === 'string' && val.toLowerCase().includes('dry'))
      );

    if (
      checkRecordsDry(cropData) ||
      checkRecordsDry(nucData) ||
      checkRecordsDry(landUtilizationData)
    ) {
      return true;
    }

    if (allSeasonsNucData) {
      const allRecords = Object.values(allSeasonsNucData).flat();
      if (checkRecordsDry(allRecords)) return true;
    }

    return false;
  }, [allSeasonsNucData, clusterLabelsInfo, clusterType, cropData, keyplotData, landUtilizationData, nucData]);

  const renderBtrDetails = () => {
    const plotNo =
      keyplotData?.plotno && keyplotData.plotno !== 'null/'
        ? keyplotData.plotno
        : null;

    switch (keyplotData?.btrTypeId) {
      case 1:
        return (
          <DetailItem
            label="Survey & Sub Division No"
            value={plotNo || 'N/A'}
            icon={<StorageIcon fontSize="small" />}
          />
        );

      case 2:
        return (
          <>
            <DetailItem label="Ward No" value={keyplotData?.wardno} />
            <DetailItem label="House No" value={keyplotData?.houseno} />
          </>
        );

      case 3:
        return (
          <>
            <DetailItem label="Cultivate Name" value={keyplotData?.cultivateName} />
            <DetailItem
              label="Cultivate Area"
              value={
                keyplotData?.cultivateArea
                  ? `${keyplotData.cultivateArea} cent`
                  : 'N/A'
              }
            />
          </>
        );

      case 4:
        return (
          <DetailItem
            label="TP No / TP Sub Division No"
            value={`${keyplotData?.tpno || 'N/A'}/${keyplotData?.tpsubdivno || 'N/A'}${plotNo ? ` (Survey: ${plotNo})` : ''
              }`}
          />
        );

      case 5:
        return (
          <DetailItem
            label="Old Survey / Old Sub Division No"
            value={`${keyplotData?.oldSurvey || 'N/A'}/${keyplotData?.oldSubDivNo || 'N/A'}${plotNo ? ` (Survey: ${plotNo})` : ''
              }`}
          />
        );

      default:
        return <DetailItem label="Survey Details" value={plotNo || 'N/A'} />;
    }
  };

  const renderKeyplotDetails = () => {
    if (isLoading) {
      return <LoadingPanel message="Loading keyplot details…" />;
    }

    if (!keyplotData) {
      return (
        <EmptyState
          title="No keyplot details available"
          description="The selected keyplot did not return any details."
        />
      );
    }

    const locationValue = keyplotData.geocoordinate ? (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {keyplotData.geocoordinate}
        </Typography>
        <Button
          size="small"
          variant="text"
          href={`https://www.google.com/maps?q=${keyplotData.geocoordinate}`}
          target="_blank"
          rel="noreferrer"
          startIcon={<LocationOnIcon fontSize="small" />}
        >
          View Map
        </Button>
      </Stack>
    ) : (
      'N/A'
    );

    return (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Keyplot Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Basic BTR and location information for this Form 1 record.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {(clusterType || keyplotData?.landType || keyplotData?.clusterType) && (
              <Chip
                label={`${(clusterType || keyplotData?.landType || keyplotData?.clusterType || '').toUpperCase()} CLUSTER`}
                size="small"
                color={isDryPlot ? 'warning' : 'success'}
                variant="filled"
                sx={{ fontWeight: 700 }}
              />
            )}
            <Chip
              label={keyplotData.btrTypeName || 'BTR type unavailable'}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Grid container spacing={1.5}>
          <DetailItem
            label="Owner Name"
            value={keyplotData?.owner_name}
          />
          <DetailItem
            label="Contact Number"
            value={keyplotData?.phone_number}
          />
          {renderBtrDetails()}
          <DetailItem
            label="Land / Cluster Type"
            value={
              keyplotData?.landType ||
              keyplotData?.clusterType ||
              clusterType ||
              (isDryPlot ? 'Dry' : 'Wet')
            }
          />
          <DetailItem
            label="Area"
            value={
              keyplotData?.area !== null && keyplotData?.area !== undefined
                ? `${keyplotData.area} cent`
                : 'N/A'
            }
            icon={<AgricultureIcon fontSize="small" />}
          />
          <DetailItem
            label="Location"
            value={locationValue}
            icon={<LocationOnIcon fontSize="small" />}
          />
          <DetailItem label="Address" value={keyplotData?.address} />
        </Grid>
      </Stack>
    );
  };

  const cropView = useMemo(() => {
    const { activeClusters, clusterAreaMap, totalClusterArea } =
      getClusterContext(clusterLabelsInfo, cropData);

    const cropMap = new Map();

    (cropData || []).forEach((clusterObject) => {
      const clusterLabel = getRecordClusterLabel(clusterObject);
      const cropsList =
        clusterObject.crops ||
        (Array.isArray(clusterObject) ? clusterObject : []);

      cropsList.forEach((crop) => {
        const cropName =
          crop.cropNameEn ||
          crop.cropName ||
          crop.malayalamName ||
          'N/A';
        const cropType = crop.cropType || 'N/A';
        const cropStage = crop.cropGrowthStage || crop.cropStage || '';
        const isIrrigated = Boolean(crop.isIrrigated);
        const isCount = isCountBasedCrop(crop);
        const unit = formatCropUnit(crop, isCount);
        const centPerTree =
          crop.centPerTree !== null && crop.centPerTree !== undefined
            ? Number(crop.centPerTree)
            : null;

        const key = `${cropName}__${cropType}__${cropStage}__${isIrrigated}`;

        if (!cropMap.has(key)) {
          cropMap.set(key, {
            id: crop.id || crop.cropId || key,
            cropName,
            cropType,
            cropStage,
            seasonName: crop.season || getSeasonLabel(seasonId),
            isIrrigated,
            isCount,
            unit,
            centPerTree,
            clusterValues: {}
          });
        } else {
          const existing = cropMap.get(key);
          if (!existing.centPerTree && centPerTree) {
            existing.centPerTree = centPerTree;
          }
          if (isCount && !existing.isCount) {
            existing.isCount = true;
          }
        }

        if (clusterLabel) {
          const rawVal = Number(crop.cropArea ?? crop.area ?? 0);
          let itemArea = 0;
          let itemCount = null;
          let hasArea = false;
          let hasCount = false;

          if (isCount) {
            // For count-based crops:
            // rawVal is the COUNT of trees/plants
            itemCount = rawVal;
            hasCount = true;

            // Compute area in cents from count * centPerTree if conversion factor exists
            if (centPerTree !== null && centPerTree > 0) {
              itemArea = Number((rawVal * centPerTree).toFixed(4));
              hasArea = true;
            } else if (crop.areaInCents !== null && crop.areaInCents !== undefined) {
              itemArea = Number(crop.areaInCents);
              hasArea = true;
            } else {
              itemArea = 0;
              hasArea = false;
            }
          } else {
            // For area-based crops (in cents):
            // rawVal is the AREA in cents
            itemArea = rawVal;
            itemCount = null;
            hasArea = true;
            hasCount = false;
          }

          const currentClusterValues = cropMap.get(key).clusterValues;
          if (currentClusterValues[clusterLabel]) {
            const curr = currentClusterValues[clusterLabel];
            curr.area = Number((curr.area + itemArea).toFixed(4));
            if (hasArea) curr.hasArea = true;
            if (itemCount !== null) {
              curr.count = (curr.count || 0) + itemCount;
              curr.hasCount = true;
            }
          } else {
            currentClusterValues[clusterLabel] = {
              area: itemArea,
              count: itemCount,
              hasArea,
              hasCount,
              isCount,
              centPerTree
            };
          }
        }
      });
    });

    const query = searchTerm.toLowerCase().trim();

    const rows = Array.from(cropMap.values()).filter((row) => {
      if (!query) return true;

      return (
        row.cropName.toLowerCase().includes(query) ||
        String(row.cropType || '').toLowerCase().includes(query) ||
        String(row.cropStage || '').toLowerCase().includes(query) ||
        String(row.unit || '').toLowerCase().includes(query)
      );
    });

    const clusterTotals = {};
    let grandTotalArea = 0;
    let grandTotalCount = 0;
    let hasCount = false;

    activeClusters.forEach((cluster) => {
      clusterTotals[cluster] = {
        area: 0,
        count: 0,
        hasCount: false
      };
    });

    rows.forEach((row) => {
      activeClusters.forEach((cluster) => {
        const value = row.clusterValues[cluster];

        if (!value) return;

        if (value.hasArea || value.area > 0) {
          clusterTotals[cluster].area += Number(value.area || 0);
          grandTotalArea += Number(value.area || 0);
        }

        if (value.hasCount && value.count !== null && !Number.isNaN(value.count)) {
          clusterTotals[cluster].count += value.count;
          clusterTotals[cluster].hasCount = true;
          grandTotalCount += value.count;
          hasCount = true;
        }
      });
    });

    const nucClusterMap = {};

    activeClusters.forEach((cluster) => {
      nucClusterMap[cluster] = {
        nucArea: 0,
        ffsArea: 0,
        cosArea: 0
      };
    });

    if (Array.isArray(nucData)) {
      nucData.forEach((item) => {
        const matchedCluster = findMatchingCluster(
          activeClusters,
          getRecordClusterLabel(item)
        );

        if (!matchedCluster) return;

        nucClusterMap[matchedCluster].nucArea += Number(
          item.nucArea ?? item.nuc_area ?? item.nucAreaCents ?? 0
        );
        nucClusterMap[matchedCluster].ffsArea += Number(
          item.ffsArea ?? item.ffs_area ?? item.ffsAreaCents ?? 0
        );
        nucClusterMap[matchedCluster].cosArea += Number(
          item.cosArea ?? item.cos_area ?? item.cosAreaCents ?? 0
        );
      });
    }

    activeClusters.forEach((cluster) => {
      nucClusterMap[cluster].totalNucFfsCos =
        nucClusterMap[cluster].nucArea +
        nucClusterMap[cluster].ffsArea +
        nucClusterMap[cluster].cosArea;
    });

    const grandNuc = activeClusters.reduce(
      (sum, cluster) => sum + nucClusterMap[cluster].nucArea,
      0
    );
    const grandFfs = activeClusters.reduce(
      (sum, cluster) => sum + nucClusterMap[cluster].ffsArea,
      0
    );
    const grandCos = activeClusters.reduce(
      (sum, cluster) => sum + nucClusterMap[cluster].cosArea,
      0
    );
    const grandNucFfsCosTotal = grandNuc + grandFfs + grandCos;

    return {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      rows,
      clusterTotals,
      grandTotalArea,
      grandTotalCount,
      hasCount,
      nucClusterMap,
      grandNuc,
      grandFfs,
      grandCos,
      grandNucFfsCosTotal
    };
  }, [clusterLabelsInfo, cropData, nucData, searchTerm, seasonId]);

  const renderCropDetails = () => {
    if (isCropLoading) {
      return (
        <LoadingPanel
          message={`Loading crop data for ${getSeasonLabel(seasonId)} season…`}
        />
      );
    }

    const {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      rows,
      clusterTotals,
      grandTotalArea,
      grandTotalCount,
      hasCount,
      nucClusterMap,
      grandNuc,
      grandFfs,
      grandCos,
      grandNucFfsCosTotal
    } = cropView;

    const totalColumns = 5 + activeClusters.length * 2 + 2;

    return (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', lg: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Crop Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crop distribution across active cluster labels.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ sm: 'center' }}
          >
            <ToggleButtonGroup
              value={seasonId}
              exclusive
              size="small"
              aria-label="Crop season"
              onChange={(_, value) => {
                if (value) {
                  setSeasonId(value);
                  setSearchTerm('');
                }
              }}
            >
              {SEASONS.map((season) => (
                <ToggleButton key={season.id} value={season.id}>
                  {season.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <SearchBox
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search crops"
            />
          </Stack>
        </Stack>

        {cropFetchError && (
          <Alert severity="info">{cropFetchError}</Alert>
        )}

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: '68vh',
            overflow: 'auto',
            borderRadius: 2.5
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="Crop details by cluster"
            sx={{
              minWidth: 900 + activeClusters.length * 120,
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <TableHead>
              <TableRow sx={{ height: HEADER_ROW_1_H }}>
                <HeaderCell rowSpan={2} sticky top={0}>
                  Crop
                </HeaderCell>
                <HeaderCell rowSpan={2} top={0}>Season</HeaderCell>
                <HeaderCell rowSpan={2} top={0}>Crop Type</HeaderCell>
                <HeaderCell rowSpan={2} align="center" top={0}>
                  Unit
                </HeaderCell>
                <HeaderCell rowSpan={2} align="center" top={0}>
                  Irrigation
                </HeaderCell>

                {activeClusters.map((cluster) => (
                  <HeaderCell key={cluster} colSpan={2} align="center" top={0}>
                    {cluster}
                    {clusterAreaMap[cluster] !== undefined && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                      >
                        {formatNumber(clusterAreaMap[cluster])} cent
                      </Typography>
                    )}
                  </HeaderCell>
                ))}

                <HeaderCell colSpan={2} align="center" top={0}>
                  Total
                  {totalClusterArea > 0 && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                    >
                      {formatNumber(totalClusterArea)} cent
                    </Typography>
                  )}
                </HeaderCell>
              </TableRow>

              <TableRow sx={{ height: 32 }}>
                {activeClusters.map((cluster) => (
                  <React.Fragment key={`${cluster}-sub`}>
                    <HeaderCell align="right" top={HEADER_ROW_1_H}>Area (cent)</HeaderCell>
                    <HeaderCell align="right" top={HEADER_ROW_1_H}>Count</HeaderCell>
                  </React.Fragment>
                ))}
                <HeaderCell align="right" top={HEADER_ROW_1_H}>Area (cent)</HeaderCell>
                <HeaderCell align="right" top={HEADER_ROW_1_H}>Count</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!isDryPlot && (
                <>
                  {[
                    ['NUC Area', 'nucArea', grandNuc, theme.palette.warning.light],
                    ['FFS Area', 'ffsArea', grandFfs, theme.palette.success.light],
                    ['COS Area', 'cosArea', grandCos, theme.palette.info.light],
                    ['Total NUC/FFS/COS', 'totalNucFfsCos', grandNucFfsCosTotal, theme.palette.primary.light]
                  ].map(([label, key, total, color]) => (
                    <TableRow key={key}>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 4,
                          backgroundColor: 'background.paper',
                          backgroundImage: `linear-gradient(${alpha(color, 0.28)}, ${alpha(color, 0.28)})`,
                          fontWeight: 700,
                          minWidth: 190,
                          boxShadow: `2px 0 0 ${theme.palette.divider}`
                        }}
                      >
                        {label}
                      </TableCell>
                      <TableCell
                        colSpan={4}
                        sx={{ bgcolor: alpha(color, 0.28) }}
                      />

                      {activeClusters.map((cluster) => (
                        <React.Fragment key={`${key}-${cluster}`}>
                          <TableCell
                            align="right"
                            sx={{
                              bgcolor: alpha(color, 0.18),
                              fontWeight: key === 'totalNucFfsCos' ? 700 : 400
                            }}
                          >
                            {formatNumber(nucClusterMap[cluster][key])}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ bgcolor: alpha(color, 0.18), color: 'text.disabled' }}
                          >
                            —
                          </TableCell>
                        </React.Fragment>
                      ))}

                      <TableCell
                        align="right"
                        sx={{ bgcolor: alpha(color, 0.32), fontWeight: 700 }}
                      >
                        {formatNumber(total)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ bgcolor: alpha(color, 0.32), color: 'text.disabled' }}
                      >
                        —
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {rows.length > 0 && (
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.success.main, 0.08)})`,
                      fontWeight: 700,
                      minWidth: 190,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Total Crop Area
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.08) }}
                  />

                  {activeClusters.map((cluster) => (
                    <React.Fragment key={`total-${cluster}`}>
                      <SummaryRowCell>
                        {formatNumber(clusterTotals[cluster].area)}
                      </SummaryRowCell>
                      <SummaryRowCell>
                        {clusterTotals[cluster].hasCount
                          ? clusterTotals[cluster].count
                          : '—'}
                      </SummaryRowCell>
                    </React.Fragment>
                  ))}

                  <SummaryRowCell sx={{ color: 'success.main' }}>
                    {formatNumber(grandTotalArea)}
                  </SummaryRowCell>
                  <SummaryRowCell sx={{ color: 'success.main' }}>
                    {hasCount ? grandTotalCount : '—'}
                  </SummaryRowCell>
                </TableRow>
              )}

              {rows.length > 0 ? (
                rows.map((row) => {
                  let totalArea = 0;
                  let totalCount = 0;
                  let rowHasCount = false;
                  let rowHasArea = false;

                  activeClusters.forEach((cluster) => {
                    const value = row.clusterValues[cluster];

                    if (!value) return;

                    if (value.hasArea || value.area > 0) {
                      totalArea += value.area || 0;
                      rowHasArea = true;
                    }

                    if (value.hasCount && value.count !== null && !Number.isNaN(value.count)) {
                      totalCount += value.count;
                      rowHasCount = true;
                    }
                  });

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        '&:nth-of-type(even)': {
                          bgcolor: alpha(theme.palette.action.hover, 0.35)
                        }
                      }}
                    >
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          bgcolor: 'background.paper',
                          minWidth: 190,
                          boxShadow: `2px 0 0 ${theme.palette.divider}`
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {row.cropName}
                        </Typography>
                        {row.cropStage && row.cropStage !== 'N/A' && (
                          <Typography variant="caption" color="text.secondary">
                            {row.cropStage}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>{row.seasonName}</TableCell>
                      <TableCell>{row.cropType}</TableCell>

                      <TableCell align="center">
                        <Chip
                          label={row.unit}
                          size="small"
                          variant="outlined"
                          color={row.isCount ? 'primary' : 'default'}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 22
                          }}
                        />
                        {row.isCount && row.centPerTree ? (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                            sx={{ fontSize: '0.68rem', mt: 0.25 }}
                          >
                            {row.centPerTree} cent/tree
                          </Typography>
                        ) : null}
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          spacing={0.75}
                        >
                          {row.isIrrigated ? (
                            <>
                              <CheckCircleIcon
                                sx={{ fontSize: 16, color: 'success.main' }}
                              />
                              <Typography variant="body2">Irrigated</Typography>
                            </>
                          ) : (
                            <>
                              <CloseIcon
                                sx={{ fontSize: 16, color: 'text.disabled' }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Unirrigated
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </TableCell>

                      {activeClusters.map((cluster) => {
                        const value = row.clusterValues[cluster];

                        return (
                          <React.Fragment key={cluster}>
                            <TableCell
                              align="right"
                              sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {value?.hasArea || (value?.area > 0)
                                ? formatNumber(value?.area || 0)
                                : '—'}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {value?.hasCount && value?.count !== null && value?.count !== undefined
                                ? value.count
                                : '—'}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}

                      <SummaryRowCell>
                        {rowHasArea || totalArea > 0
                          ? formatNumber(totalArea)
                          : '—'}
                      </SummaryRowCell>
                      <SummaryRowCell>
                        {rowHasCount ? totalCount : '—'}
                      </SummaryRowCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={totalColumns}>
                    <EmptyState
                      title={`No crop details for ${getSeasonLabel(seasonId)}`}
                      description={
                        searchTerm
                          ? 'No crop records match the current search.'
                          : 'Try another crop season.'
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const irrigationView = useMemo(() => {
    const { activeClusters, clusterAreaMap, totalClusterArea } =
      getClusterContext(clusterLabelsInfo, irrigationData);

    const sourceTypes = new Set();
    const clusterMap = {};

    activeClusters.forEach((cluster) => {
      clusterMap[cluster] = {};
    });

    (irrigationData || []).forEach((clusterObject) => {
      const matchedCluster = findMatchingCluster(
        activeClusters,
        getRecordClusterLabel(clusterObject)
      );

      if (!matchedCluster) return;

      (clusterObject.irrigatedSources || []).forEach((sourceItem) => {
        const area = Number(sourceItem.irrigatedArea || 0);
        const count =
          sourceItem.sourceCount !== undefined &&
            sourceItem.sourceCount !== null
            ? Number(sourceItem.sourceCount)
            : null;

        (sourceItem.irrigatedSources || []).forEach((source) => {
          const type = source.irrigationType || source.name || 'Other';
          sourceTypes.add(type);

          if (!clusterMap[matchedCluster][type]) {
            clusterMap[matchedCluster][type] = {
              area: 0,
              count: 0,
              hasCount: false
            };
          }

          clusterMap[matchedCluster][type].area += area;

          if (count !== null && !Number.isNaN(count)) {
            clusterMap[matchedCluster][type].count += count;
            clusterMap[matchedCluster][type].hasCount = true;
          }
        });
      });
    });

    const clusterTotals = {};
    let grandTotalArea = 0;
    let grandTotalCount = 0;
    let grandHasCount = false;

    activeClusters.forEach((cluster) => {
      clusterTotals[cluster] = {
        area: 0,
        count: 0,
        hasCount: false
      };

      Array.from(sourceTypes).forEach((type) => {
        const value = clusterMap[cluster][type];

        if (!value) return;

        clusterTotals[cluster].area += value.area || 0;

        if (value.hasCount) {
          clusterTotals[cluster].count += value.count;
          clusterTotals[cluster].hasCount = true;
        }
      });

      grandTotalArea += clusterTotals[cluster].area;

      if (clusterTotals[cluster].hasCount) {
        grandTotalCount += clusterTotals[cluster].count;
        grandHasCount = true;
      }
    });

    const query = searchTerm.toLowerCase().trim();

    const filteredTypes = Array.from(sourceTypes).filter((type) => {
      if (!query) return true;

      if (type.toLowerCase().includes(query)) return true;

      return activeClusters.some((cluster) => {
        const value = clusterMap[cluster][type];

        return (
          value &&
          (String(value.area).includes(query) ||
            String(value.count).includes(query))
        );
      });
    });

    return {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      clusterMap,
      clusterTotals,
      grandTotalArea,
      grandTotalCount,
      grandHasCount,
      filteredTypes,
      sourceTypeCount: sourceTypes.size
    };
  }, [clusterLabelsInfo, irrigationData, searchTerm]);

  const renderIrrigationDetails = () => {
    const {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      clusterMap,
      clusterTotals,
      grandTotalArea,
      grandTotalCount,
      grandHasCount,
      filteredTypes,
      sourceTypeCount
    } = irrigationView;

    const totalColumns = 1 + activeClusters.length * 2 + 2;

    return (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Irrigation Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Irrigation source and area distribution by cluster.
            </Typography>
          </Box>

          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search irrigation source"
          />
        </Stack>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: '68vh',
            overflow: 'auto',
            borderRadius: 2.5
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="Irrigation details by cluster"
            sx={{
              minWidth: 650 + activeClusters.length * 120,
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <TableHead>
              <TableRow sx={{ height: HEADER_ROW_1_H }}>
                <HeaderCell rowSpan={2} sticky top={0}>
                  Source Type
                </HeaderCell>

                {activeClusters.map((cluster) => (
                  <HeaderCell key={cluster} colSpan={2} align="center" top={0}>
                    {cluster}
                    {clusterAreaMap[cluster] !== undefined && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                      >
                        {formatNumber(clusterAreaMap[cluster])} cent
                      </Typography>
                    )}
                  </HeaderCell>
                ))}

                <HeaderCell colSpan={2} align="center" top={0}>
                  Total
                  {totalClusterArea > 0 && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                    >
                      {formatNumber(totalClusterArea)} cent
                    </Typography>
                  )}
                </HeaderCell>
              </TableRow>

              <TableRow sx={{ height: 32 }}>
                {activeClusters.map((cluster) => (
                  <React.Fragment key={`${cluster}-sub`}>
                    <HeaderCell align="right" top={HEADER_ROW_1_H}>Area</HeaderCell>
                    <HeaderCell align="right" top={HEADER_ROW_1_H}>Count</HeaderCell>
                  </React.Fragment>
                ))}
                <HeaderCell align="right" top={HEADER_ROW_1_H}>Area</HeaderCell>
                <HeaderCell align="right" top={HEADER_ROW_1_H}>Count</HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sourceTypeCount > 0 && (
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.info.main, 0.08)})`,
                      fontWeight: 700,
                      minWidth: 190,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Total Irrigated Area
                  </TableCell>

                  {activeClusters.map((cluster) => (
                    <React.Fragment key={`total-${cluster}`}>
                      <SummaryRowCell>
                        {formatNumber(clusterTotals[cluster].area)}
                      </SummaryRowCell>
                      <SummaryRowCell>
                        {clusterTotals[cluster].hasCount
                          ? clusterTotals[cluster].count
                          : '—'}
                      </SummaryRowCell>
                    </React.Fragment>
                  ))}

                  <SummaryRowCell sx={{ color: 'primary.main' }}>
                    {formatNumber(grandTotalArea)}
                  </SummaryRowCell>
                  <SummaryRowCell sx={{ color: 'primary.main' }}>
                    {grandHasCount ? grandTotalCount : '—'}
                  </SummaryRowCell>
                </TableRow>
              )}

              {filteredTypes.length > 0 ? (
                filteredTypes.map((type) => {
                  let rowTotalArea = 0;
                  let rowTotalCount = 0;
                  let rowHasCount = false;

                  activeClusters.forEach((cluster) => {
                    const value = clusterMap[cluster][type];

                    if (!value) return;

                    rowTotalArea += value.area || 0;

                    if (value.hasCount) {
                      rowTotalCount += value.count;
                      rowHasCount = true;
                    }
                  });

                  return (
                    <TableRow key={type} hover>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          bgcolor: 'background.paper',
                          minWidth: 190,
                          boxShadow: `2px 0 0 ${theme.palette.divider}`
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WaterIcon sx={{ fontSize: 17, color: 'info.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 650 }}>
                            {type}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {activeClusters.map((cluster) => {
                        const value = clusterMap[cluster][type];

                        return (
                          <React.Fragment key={cluster}>
                            <TableCell align="right">
                              {formatNumber(value?.area || 0)}
                            </TableCell>
                            <TableCell align="right">
                              {value?.hasCount ? value.count : '—'}
                            </TableCell>
                          </React.Fragment>
                        );
                      })}

                      <SummaryRowCell>{formatNumber(rowTotalArea)}</SummaryRowCell>
                      <SummaryRowCell>
                        {rowHasCount ? rowTotalCount : '—'}
                      </SummaryRowCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={totalColumns}>
                    <EmptyState
                      title="No irrigation details found"
                      description={
                        searchTerm
                          ? 'No irrigation sources match the current search.'
                          : 'This cluster has no irrigation source data.'
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const landUtilizationView = useMemo(() => {
    const { activeClusters, clusterAreaMap, totalClusterArea } =
      getClusterContext(clusterLabelsInfo, landUtilizationData);

    const clusterLuMap = {};

    activeClusters.forEach((cluster) => {
      clusterLuMap[cluster] = {};
    });

    (landUtilizationData || []).forEach((record) => {
      const matchedCluster = findMatchingCluster(
        activeClusters,
        getRecordClusterLabel(record)
      );

      if (!matchedCluster) return;

      AREA_FIELDS.forEach((field) => {
        clusterLuMap[matchedCluster][field.key] = Number(record[field.key] || 0);
      });
    });

    const clusterTotals = {};
    let grandTotalArea = 0;

    activeClusters.forEach((cluster) => {
      clusterTotals[cluster] = AREA_FIELDS.reduce(
        (sum, field) =>
          sum + Number(clusterLuMap[cluster][field.key] || 0),
        0
      );

      grandTotalArea += clusterTotals[cluster];
    });

    const nucSeasonMap = {};
    const grandNucBySeason = {};
    const grandFfsBySeason = {};

    SEASONS.forEach((season) => {
      nucSeasonMap[season.id] = {};
      grandNucBySeason[season.id] = 0;
      grandFfsBySeason[season.id] = 0;

      activeClusters.forEach((cluster) => {
        nucSeasonMap[season.id][cluster] = {
          nucArea: 0,
          ffsArea: 0
        };
      });

      const seasonData =
        Array.isArray(allSeasonsNucData?.[season.id]) &&
          allSeasonsNucData[season.id].length > 0
          ? allSeasonsNucData[season.id]
          : season.id === seasonId
            ? nucData
            : [];

      (seasonData || []).forEach((item) => {
        const matchedCluster = findMatchingCluster(
          activeClusters,
          getRecordClusterLabel(item)
        );

        if (!matchedCluster) return;

        nucSeasonMap[season.id][matchedCluster].nucArea += Number(
          item.nucArea ?? item.nuc_area ?? item.nucAreaCents ?? 0
        );
        nucSeasonMap[season.id][matchedCluster].ffsArea += Number(
          item.ffsArea ?? item.ffs_area ?? item.ffsAreaCents ?? 0
        );
      });

      activeClusters.forEach((cluster) => {
        grandNucBySeason[season.id] +=
          nucSeasonMap[season.id][cluster].nucArea;
        grandFfsBySeason[season.id] +=
          nucSeasonMap[season.id][cluster].ffsArea;
      });
    });

    const query = searchTerm.toLowerCase().trim();

    const filteredFields = AREA_FIELDS.filter((field) => {
      if (!query) return true;

      return (
        field.label.toLowerCase().includes(query) ||
        activeClusters.some((cluster) =>
          String(clusterLuMap[cluster][field.key] || '')
            .toLowerCase()
            .includes(query)
        )
      );
    });

    return {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      clusterLuMap,
      clusterTotals,
      grandTotalArea,
      nucSeasonMap,
      grandNucBySeason,
      grandFfsBySeason,
      filteredFields
    };
  }, [
    allSeasonsNucData,
    clusterLabelsInfo,
    landUtilizationData,
    nucData,
    searchTerm,
    seasonId
  ]);

  const renderLandUtilizationDetails = () => {
    const {
      activeClusters,
      clusterAreaMap,
      totalClusterArea,
      clusterLuMap,
      clusterTotals,
      grandTotalArea,
      nucSeasonMap,
      grandNucBySeason,
      grandFfsBySeason,
      filteredFields
    } = landUtilizationView;

    return (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Land Utilization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Land-use categories by active cluster label.
            </Typography>
          </Box>

          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search land utilization"
          />
        </Stack>

        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: '68vh',
            overflow: 'auto',
            borderRadius: 2.5
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label="Land utilization by cluster"
            sx={{
              minWidth: 520 + activeClusters.length * 110,
              borderCollapse: 'separate',
              borderSpacing: 0
            }}
          >
            <TableHead>
              <TableRow sx={{ height: HEADER_ROW_1_H }}>
                <HeaderCell sticky top={0}>Land Utilization Detail</HeaderCell>

                {activeClusters.map((cluster) => (
                  <HeaderCell key={cluster} align="right" top={0}>
                    {cluster}
                    {clusterAreaMap[cluster] !== undefined && (
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                      >
                        {formatNumber(clusterAreaMap[cluster])} cent
                      </Typography>
                    )}
                  </HeaderCell>
                ))}

                <HeaderCell align="right" top={0}>
                  Total Area
                  {totalClusterArea > 0 && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                    >
                      {formatNumber(totalClusterArea)} cent
                    </Typography>
                  )}
                </HeaderCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!isDryPlot &&
                SEASONS.map((season) => (
                  <TableRow key={`nuc-${season.id}`}>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 4,
                        backgroundColor: 'background.paper',
                        backgroundImage: `linear-gradient(${alpha(theme.palette.warning.light, 0.25)}, ${alpha(theme.palette.warning.light, 0.25)})`,
                        fontWeight: 700,
                        minWidth: 190,
                        boxShadow: `2px 0 0 ${theme.palette.divider}`
                      }}
                    >
                      NUC Area ({season.name})
                    </TableCell>

                    {activeClusters.map((cluster) => (
                      <TableCell
                        key={`nuc-${season.id}-${cluster}`}
                        align="right"
                        sx={{ bgcolor: alpha(theme.palette.warning.light, 0.14) }}
                      >
                        {formatNumber(
                          nucSeasonMap[season.id][cluster].nucArea
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.warning.light, 0.3),
                        fontWeight: 700
                      }}
                    >
                      {formatNumber(grandNucBySeason[season.id])}
                    </TableCell>
                  </TableRow>
                ))}

              {!isDryPlot &&
                SEASONS.map((season) => (
                  <TableRow key={`ffs-${season.id}`}>
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 4,
                        backgroundColor: 'background.paper',
                        backgroundImage: `linear-gradient(${alpha(theme.palette.success.light, 0.23)}, ${alpha(theme.palette.success.light, 0.23)})`,
                        fontWeight: 700,
                        minWidth: 190,
                        boxShadow: `2px 0 0 ${theme.palette.divider}`
                      }}
                    >
                      FFS Area ({season.name})
                    </TableCell>

                    {activeClusters.map((cluster) => (
                      <TableCell
                        key={`ffs-${season.id}-${cluster}`}
                        align="right"
                        sx={{ bgcolor: alpha(theme.palette.success.light, 0.12) }}
                      >
                        {formatNumber(
                          nucSeasonMap[season.id][cluster].ffsArea
                        )}
                      </TableCell>
                    ))}

                    <TableCell
                      align="right"
                      sx={{
                        bgcolor: alpha(theme.palette.success.light, 0.28),
                        fontWeight: 700
                      }}
                    >
                      {formatNumber(grandFfsBySeason[season.id])}
                    </TableCell>
                  </TableRow>
                ))}

              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 4,
                    backgroundColor: 'background.paper',
                    backgroundImage: `linear-gradient(${alpha(theme.palette.success.main, 0.08)}, ${alpha(theme.palette.success.main, 0.08)})`,
                    fontWeight: 700,
                    minWidth: 190,
                    boxShadow: `2px 0 0 ${theme.palette.divider}`
                  }}
                >
                  Total Land Utilization Area
                </TableCell>

                {activeClusters.map((cluster) => (
                  <SummaryRowCell key={cluster}>
                    {formatNumber(clusterTotals[cluster])}
                  </SummaryRowCell>
                ))}

                <SummaryRowCell sx={{ color: 'success.main' }}>
                  {formatNumber(grandTotalArea)}
                </SummaryRowCell>
              </TableRow>

              {filteredFields.length > 0 ? (
                filteredFields.map((field) => {
                  const rowTotal = activeClusters.reduce(
                    (sum, cluster) =>
                      sum + Number(clusterLuMap[cluster][field.key] || 0),
                    0
                  );

                  return (
                    <TableRow key={field.key} hover>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          bgcolor: 'background.paper',
                          minWidth: 190,
                          boxShadow: `2px 0 0 ${theme.palette.divider}`,
                          fontWeight: 650
                        }}
                      >
                        {field.label}
                      </TableCell>

                      {activeClusters.map((cluster) => (
                        <TableCell key={cluster} align="right">
                          {formatNumber(clusterLuMap[cluster][field.key] || 0)}
                        </TableCell>
                      ))}

                      <SummaryRowCell>{formatNumber(rowTotal)}</SummaryRowCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={activeClusters.length + 2}>
                    <EmptyState
                      title="No land utilization details found"
                      description={
                        searchTerm
                          ? 'No land-utilization category matches the current search.'
                          : 'This cluster has no land-utilization records.'
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const handleCategoryChange = (catId) => {
    setSelectedFindingId(catId);
    const cat = findingsCategories.find((c) => c.findingsId === catId);
    if (cat && cat.subLabels && cat.subLabels.length > 0) {
      setSelectedMappingId(cat.subLabels[0].findingsLabelMappingId);
    }
  };

  const handleSubLabelChange = (mappingId) => {
    setSelectedMappingId(mappingId);
  };

  const activeFindingCategory = useMemo(() => {
    return (
      findingsCategories.find((c) => c.findingsId === selectedFindingId) ||
      findingsCategories[0] ||
      null
    );
  }, [findingsCategories, selectedFindingId]);

  const activeSubLabel = useMemo(() => {
    if (!activeFindingCategory?.subLabels) return null;
    return (
      activeFindingCategory.subLabels.find(
        (s) => s.findingsLabelMappingId === selectedMappingId
      ) ||
      activeFindingCategory.subLabels[0] ||
      null
    );
  }, [activeFindingCategory, selectedMappingId]);

  const inspectionView = useMemo(() => {
    const activeClusters = inspectionClusters;
    const clusterAreaMap = inspectionClusterAreaMap;

    const fieldsSet = new Set();
    const clusterDefectsMap = {};
    const clusterSummaryMap = {};
    let totalDefectsCount = 0;
    let inspectedClustersCount = 0;
    let ratingsSum = 0;
    let ratingsCount = 0;

    activeClusters.forEach((cluster) => {
      const data = clusterInspectionMap[cluster];
      clusterDefectsMap[cluster] = {};

      if (data) {
        inspectedClustersCount++;
        const targetFinding =
          data.findings?.find(
            (f) => Number(f.findingsLabelMappingId) === Number(selectedMappingId)
          ) || data.findings?.[0];

        let clusterDefectCount = 0;

        if (targetFinding) {
          if (targetFinding.rating !== null && targetFinding.rating !== undefined) {
            const r = Number(targetFinding.rating);
            if (!Number.isNaN(r) && r > 0) {
              ratingsSum += r;
              ratingsCount++;
            }
          }

          if (Array.isArray(targetFinding.defects)) {
            targetFinding.defects.forEach((d) => {
              if (d.defectFieldName) {
                fieldsSet.add(d.defectFieldName);
                clusterDefectsMap[cluster][d.defectFieldName] = d;
                if (d.isDefect) {
                  clusterDefectCount++;
                  totalDefectsCount++;
                }
              }
            });
          }
        }

        clusterSummaryMap[cluster] = {
          isInspected: true,
          inspectionDate: data.inspectionDate || null,
          statusId: data.inspectionStatusId || null,
          rating: targetFinding?.rating ?? null,
          defectCount: clusterDefectCount,
          findingImage: data.findingImage || null,
          remarks: targetFinding?.findings || data.otherRemarks || null
        };
      } else {
        clusterSummaryMap[cluster] = {
          isInspected: false,
          inspectionDate: null,
          statusId: null,
          rating: null,
          defectCount: 0,
          findingImage: null,
          remarks: null
        };
      }
    });

    let defectFieldsList = Array.from(fieldsSet);
    if (inspectionSearchTerm.trim()) {
      const q = inspectionSearchTerm.toLowerCase();
      defectFieldsList = defectFieldsList.filter((f) => {
        if (f.toLowerCase().includes(q)) return true;
        return activeClusters.some((c) => {
          const d = clusterDefectsMap[c]?.[f];
          return (
            d?.defectFieldValue?.toLowerCase()?.includes(q) ||
            d?.reasonForDefect?.toLowerCase()?.includes(q)
          );
        });
      });
    }

    const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : null;

    return {
      activeClusters,
      clusterAreaMap,
      defectFieldsList,
      clusterDefectsMap,
      clusterSummaryMap,
      inspectedClustersCount,
      totalDefectsCount,
      avgRating
    };
  }, [
    inspectionClusters,
    inspectionClusterAreaMap,
    clusterInspectionMap,
    selectedMappingId,
    inspectionSearchTerm
  ]);

  const renderInspectionDetails = () => {
    const {
      activeClusters,
      clusterAreaMap,
      defectFieldsList,
      clusterDefectsMap,
      clusterSummaryMap,
      inspectedClustersCount,
      totalDefectsCount,
      avgRating
    } = inspectionView;

    const totalColumns = 1 + activeClusters.length + 1;

    return (
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1.5}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <FactCheckIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Inspection Details
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Field inspection observations and defect verifications across active cluster labels.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <SearchBox
              value={inspectionSearchTerm}
              onChange={setInspectionSearchTerm}
              placeholder="Search parameter or defect"
            />

            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                if (selectedMappingId && activeClusters.length > 0) {
                  fetchAllClustersInspection(selectedMappingId, activeClusters);
                }
              }}
              disabled={isInspectionLoading || isFindingsLoading}
              sx={{ minWidth: 100 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        <Box>
          <Tabs
            value={selectedFindingId || (findingsCategories[0]?.findingsId ?? 1)}
            onChange={(_, val) => handleCategoryChange(val)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Inspection Finding Categories"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 46,
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.88rem'
              }
            }}
          >
            {findingsCategories.map((cat) => (
              <Tab
                key={cat.findingsId}
                label={cat.findingsLabel}
                value={cat.findingsId}
              />
            ))}
          </Tabs>

          {activeFindingCategory?.subLabels && activeFindingCategory.subLabels.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.75 }}
            >
              {activeFindingCategory.subLabels.map((sub) => {
                const isSelected = selectedMappingId === sub.findingsLabelMappingId;
                return (
                  <Button
                    key={sub.findingsLabelMappingId}
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => handleSubLabelChange(sub.findingsLabelMappingId)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 650,
                      borderRadius: 2,
                      fontSize: '0.82rem',
                      px: 1.75
                    }}
                  >
                    {sub.findingsSubLabel}
                  </Button>
                );
              })}
            </Stack>
          )}
        </Box>

        {isInspectionLoading ? (
          <LoadingPanel
            message={`Loading inspection data across clusters for ${activeSubLabel?.findingsSubLabel || 'selected section'}…`}
          />
        ) : inspectionFetchError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {inspectionFetchError}
          </Alert>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              maxHeight: '68vh',
              overflow: 'auto',
              borderRadius: 2.5
            }}
          >
            <Table
              stickyHeader
              size="small"
              aria-label="Inspection details across clusters"
              sx={{
                minWidth: 600 + activeClusters.length * 150,
                borderCollapse: 'separate',
                borderSpacing: 0
              }}
            >
              <TableHead>
                <TableRow sx={{ height: HEADER_ROW_1_H }}>
                  <HeaderCell sticky top={0} sx={{ minWidth: 220 }}>
                    Inspection Parameter / Finding
                  </HeaderCell>

                  {activeClusters.map((cluster) => (
                    <HeaderCell key={cluster} align="center" top={0}>
                      {cluster}
                      {clusterAreaMap[cluster] !== undefined && (
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ opacity: 0.8, fontWeight: 400, lineHeight: 1.1 }}
                        >
                          {formatNumber(clusterAreaMap[cluster])} cent
                        </Typography>
                      )}
                    </HeaderCell>
                  ))}

                  <HeaderCell align="center" top={0}>
                    Summary
                  </HeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* 1. Status Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Inspection Status
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    return (
                      <TableCell key={`status-${cluster}`} align="center">
                        <Chip
                          size="small"
                          label={sum?.isInspected ? 'Inspected' : 'Not Inspected'}
                          color={sum?.isInspected ? 'success' : 'default'}
                          variant={sum?.isInspected ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                        />
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={`${inspectedClustersCount} / ${activeClusters.length} Inspected`}
                      color={inspectedClustersCount === activeClusters.length && activeClusters.length > 0 ? 'success' : 'primary'}
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                    />
                  </TableCell>
                </TableRow>

                {/* 2. Date Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Inspection Date
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    return (
                      <TableCell key={`date-${cluster}`} align="center" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {sum?.inspectionDate || '—'}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ color: 'text.secondary' }}>
                    —
                  </TableCell>
                </TableRow>

                {/* 3. Rating Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Finding Rating
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    return (
                      <TableCell key={`rating-${cluster}`} align="center">
                        {sum?.rating ? (
                          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                            <Rating value={Number(sum.rating)} readOnly size="small" precision={0.5} />
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {sum.rating}/5
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    {avgRating ? (
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ★ {avgRating.toFixed(1)} / 5
                      </Typography>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>

                {/* 4. Defects Count Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Defects Logged
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    if (!sum?.isInspected) {
                      return (
                        <TableCell key={`defcount-${cluster}`} align="center">
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        </TableCell>
                      );
                    }
                    return (
                      <TableCell key={`defcount-${cluster}`} align="center">
                        {sum.defectCount > 0 ? (
                          <Chip
                            size="small"
                            label={`${sum.defectCount} Defect${sum.defectCount > 1 ? 's' : ''}`}
                            color="error"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="0 Defects"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                          />
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    {totalDefectsCount > 0 ? (
                      <Chip
                        size="small"
                        label={`${totalDefectsCount} Total Defects`}
                        color="error"
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                      />
                    ) : inspectedClustersCount > 0 ? (
                      <Chip
                        size="small"
                        label="All Verified"
                        color="success"
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>

                {/* 5. Photo Evidence Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Photo Evidence
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    return (
                      <TableCell key={`photo-${cluster}`} align="center">
                        {sum?.findingImage ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ImageIcon />}
                            onClick={() => setPreviewImage(sum.findingImage)}
                            sx={{ py: 0.25, fontSize: '0.72rem', textTransform: 'none', height: 24 }}
                          >
                            View Photo
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ color: 'text.secondary' }}>
                    —
                  </TableCell>
                </TableRow>

                {/* 6. Remarks Row */}
                <TableRow hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      backgroundColor: 'background.paper',
                      backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                      fontWeight: 700,
                      minWidth: 220,
                      boxShadow: `2px 0 0 ${theme.palette.divider}`
                    }}
                  >
                    Observations & Remarks
                  </TableCell>

                  {activeClusters.map((cluster) => {
                    const sum = clusterSummaryMap[cluster];
                    return (
                      <TableCell
                        key={`remarks-${cluster}`}
                        align="center"
                        sx={{ maxWidth: 200 }}
                      >
                        {sum?.remarks ? (
                          <Tooltip title={sum.remarks} arrow>
                            <Typography
                              variant="caption"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                fontWeight: 500
                              }}
                            >
                              {sum.remarks}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center" sx={{ color: 'text.secondary' }}>
                    —
                  </TableCell>
                </TableRow>

                {/* Section Divider Row */}
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableCell
                    colSpan={totalColumns}
                    sx={{
                      fontWeight: 750,
                      color: 'primary.dark',
                      py: 1,
                      letterSpacing: 0.5,
                      fontSize: '0.76rem'
                    }}
                  >
                    FIELD PARAMETERS & DEFECT LOGS
                  </TableCell>
                </TableRow>

                {/* Detailed Parameters Rows */}
                {defectFieldsList.length > 0 ? (
                  defectFieldsList.map((fieldName) => {
                    let fieldDefectCount = 0;

                    return (
                      <TableRow key={fieldName} hover>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 3,
                            bgcolor: 'background.paper',
                            fontWeight: 650,
                            minWidth: 220,
                            boxShadow: `2px 0 0 ${theme.palette.divider}`
                          }}
                        >
                          {fieldName}
                        </TableCell>

                        {activeClusters.map((cluster) => {
                          const defect = clusterDefectsMap[cluster]?.[fieldName];
                          const isInspected = clusterSummaryMap[cluster]?.isInspected;

                          if (defect) {
                            if (defect.isDefect) {
                              fieldDefectCount++;
                            }

                            return (
                              <TableCell key={`${fieldName}-${cluster}`} align="center">
                                <Stack spacing={0.5} alignItems="center">
                                  {defect.defectFieldValue && (
                                    <Typography variant="body2" sx={{ fontWeight: 650 }}>
                                      {defect.defectFieldValue}
                                    </Typography>
                                  )}
                                  <Chip
                                    size="small"
                                    label={defect.isDefect ? 'Defect' : 'Satisfactory'}
                                    color={defect.isDefect ? 'error' : 'success'}
                                    variant={defect.isDefect ? 'filled' : 'outlined'}
                                    sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                                  />
                                  {defect.reasonForDefect && (
                                    <Typography
                                      variant="caption"
                                      color="error.main"
                                      sx={{ fontSize: '0.7rem', lineHeight: 1.2, maxWidth: 180, textAlign: 'center' }}
                                    >
                                      {defect.reasonForDefect}
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                            );
                          }

                          return (
                            <TableCell key={`${fieldName}-${cluster}`} align="center">
                              {isInspected ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  Satisfactory
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.disabled">
                                  —
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })}

                        <TableCell align="center">
                          {fieldDefectCount > 0 ? (
                            <Chip
                              size="small"
                              label={`${fieldDefectCount} Defect${fieldDefectCount > 1 ? 's' : ''}`}
                              color="error"
                              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                            />
                          ) : inspectedClustersCount > 0 ? (
                            <Chip
                              size="small"
                              label="Satisfactory"
                              color="success"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      align="center"
                      sx={{ py: 3.5, bgcolor: alpha(theme.palette.success.main, 0.02) }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
                          {inspectionSearchTerm
                            ? `No defect parameters match "${inspectionSearchTerm}".`
                            : `No defect parameters logged for ${activeSubLabel?.findingsSubLabel || 'this section'}. Observations verified as satisfactory.`}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Evidence Photo Dialog Modal */}
        <Dialog
          open={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              m: 0,
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Inspection Evidence Photo
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setPreviewImage(null)}
              sx={{ color: (th) => th.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2, textAlign: 'center' }}>
            {previewImage && (
              <Box
                component="img"
                src={previewImage}
                alt="Inspection finding"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: 2,
                  objectFit: 'contain'
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </Stack>
    );
  };

  const tabLabels = [
    'Overview',
    'Crops',
    'Irrigation',
    'Land Utilization',
    'Inspection'
  ];

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

      <Grid item xs={12}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                flex: '0 0 auto'
              }}
            >
              <GrassIcon />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ fontWeight: 750 }}>
                Form 1 Details
              </Typography>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.35, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  {zoneName && zoneName !== 'N/A' ? zoneName : 'Zone not available'}
                  {clusterNo && ` • Cluster No: ${clusterNo}`}
                </Typography>

                {(clusterType || keyplotData?.landType || keyplotData?.clusterType) && (
                  <Chip
                    size="small"
                    label={`${(clusterType || keyplotData?.landType || keyplotData?.clusterType || '').toUpperCase()} CLUSTER`}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 20,
                      bgcolor: isDryPlot
                        ? alpha(theme.palette.warning.main, 0.15)
                        : alpha(theme.palette.success.main, 0.15),
                      color: isDryPlot
                        ? theme.palette.warning.dark
                        : theme.palette.success.dark,
                      border: `1px solid ${isDryPlot
                        ? alpha(theme.palette.warning.main, 0.3)
                        : alpha(theme.palette.success.main, 0.3)
                        }`
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>

          <Tooltip
            title={
              clusterId
                ? 'View and Download Form 1 Report'
                : 'Cluster information is not available yet'
            }
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={!clusterId || isLoading}
                onClick={handleOpenExcelView}
                sx={{ width: { xs: '100%', md: 'auto' } }}
              >
                Download Report
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Grid>

      {pageError && (
        <Grid item xs={12}>
          <Alert
            severity="error"
            onClose={() => setPageError(null)}
          >
            {pageError}
          </Alert>
        </Grid>
      )}

      {isLoading && (
        <Grid item xs={12}>
          <LinearProgress />
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Form 1 detail sections"
            sx={{
              px: { xs: 1, sm: 2 },
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '& .MuiTab-root': {
                minHeight: 52,
                textTransform: 'none',
                fontWeight: 650,
                minWidth: 110
              }
            }}
          >
            {tabLabels.map((label, index) => (
              <Tab
                key={label}
                label={label}
                id={`form1-tab-${index}`}
                aria-controls={`form1-tabpanel-${index}`}
              />
            ))}
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            {renderKeyplotDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            {renderCropDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {renderIrrigationDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {renderLandUtilizationDetails()}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            {renderInspectionDetails()}
          </TabPanel>
        </Paper>
      </Grid>

      <ExcelView
        open={openExcelView}
        onClose={handleCloseExcelView}
        clusterId={clusterId}
        isDryPlot={isDryPlot}
      />
    </Grid>
  );
}

export default Form1_menus;
