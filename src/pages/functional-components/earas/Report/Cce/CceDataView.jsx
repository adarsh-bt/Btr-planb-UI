import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Tabs,
  Tab,
  Paper,
  Chip,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Checkbox,
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  GridOn as GridOnIcon,
  Spa as SpaIcon,
  WaterDrop as WaterDropIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  NoteAlt as RemarksIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  BugReport as BugReportIcon,
  Image as ImageIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Breadcrumb from 'routes/Breadcrumb';
import mainapi from 'api/mainapi';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cce-tabpanel-${index}`}
      aria-labelledby={`cce-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3, px: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const InfoItem = ({ label, value, isBadge }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      borderRadius: 2,
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}
  >
    <Typography sx={{ fontSize: 12, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontWeight: 600 }}>
      {label}
    </Typography>
    {isBadge ? (
      value
    ) : (
      <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
        {value}
      </Typography>
    )}
  </Paper>
);

const DataItem = ({ label, value }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        background: theme.palette.background.default,
        height: '100%'
      }}
    >
      <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
        {value}
      </Typography>
    </Paper>
  );
};

/**
 * Metric tile used by the Frame Selection Summary tab.
 * Same visual language as the existing tree-count cards, just parameterised
 * so both the count-based and the area-based variants can reuse it.
 */
const MetricCard = ({ label, value, color }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: alpha(color, 0.08),
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%'
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color, mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
};

/**
 * Formats an ISO date string (e.g. "2026-07-08") as DD-MM-YYYY to match the
 * convention used elsewhere in the app. Returns 'N/A' for empty/invalid input.
 */
const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${parsed.getFullYear()}`;
};

/**
 * Formats a cultivated area value (e.g. 0.5 or "0.5") with the "cent" unit.
 * Safely strips existing "cent" suffix to avoid duplicate units like "0.5 cent cent".
 */
const formatArea = (value) => {
  if (value === undefined || value === null || value === 'N/A' || value === '') return 'N/A';
  const cleaned = String(value).replace(/\s*cent$/i, '').trim();
  if (cleaned === '' || cleaned === 'N/A') return 'N/A';
  return `${cleaned} cent`;
};

const SectionTitle = ({ icon: Icon, title }) => {
  const theme = useTheme();
  const themeColor = "#05307a";
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 1.5, borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <Icon sx={{ color: themeColor, fontSize: 24 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {title}
      </Typography>
    </Box>
  );
};

const CceDataView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const themeColor = "#05307a";

  const [tabValue, setTabValue] = useState(0);
  const [frameDetails, setFrameDetails] = useState(null);
  const [isFrameLoading, setIsFrameLoading] = useState(false);
  const [frameError, setFrameError] = useState(null);

  const [seedDetailsList, setSeedDetailsList] = useState([]);
  const [isSeedLoading, setIsSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState(null);

  // Fallback data if page is accessed directly without row state
  const rowData = location.state?.rowData || {};

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch full plot details (available-cce-plot-details/{id}) - used for Survey Details tab
  const [plotDetails, setPlotDetails] = useState(null);
  const [isPlotDetailsLoading, setIsPlotDetailsLoading] = useState(false);
  const [plotDetailsError, setPlotDetailsError] = useState(null);

  useEffect(() => {
    const plotId = rowData?.availableCcePlotId || rowData?.cceAvailablePlotId;
    const targetPlotId = plotId;
    if (!targetPlotId) {
      setIsPlotDetailsLoading(false);
      return;
    }

    const fetchPlotDetails = async () => {
      setIsPlotDetailsLoading(true);
      setPlotDetailsError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/available-cce-plot-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/available-cce-plot-details/${targetPlotId}`, { headers });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch plot details');
        }

        const data = await response.json();
        const details = data?.payload || data;
        setPlotDetails(details);
      } catch (err) {
        console.error('Error fetching plot details:', err);
        setPlotDetailsError('Unable to load survey/plot details for this record.');
      } finally {
        setIsPlotDetailsLoading(false);
      }
    };

    fetchPlotDetails();
  }, [rowData?.availableCcePlotId, rowData?.cceAvailablePlotId]);

  // Fetch frame details from API
  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    const fetchFrameDetails = async () => {
      setIsFrameLoading(true);
      setFrameError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        console.log("plotId", targetPlotId);
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/frame-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/cce-data-entry/frame-details/${targetPlotId}`, { headers });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch frame details');
        }

        const data = await response.json();
        const details = data?.payload || data;
        setFrameDetails(details);
      } catch (err) {
        console.error('Error fetching frame details:', err);
        setFrameError('Unable to load frame details for this plot.');
      } finally {
        setIsFrameLoading(false);
      }
    };

    fetchFrameDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Fetch seed details per tree (single or multiple)
  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setSeedDetailsList([]);
      return;
    }

    const fetchSeedDetailsList = async () => {
      setIsSeedLoading(true);
      setSeedError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-seed-details-per-tree/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-seed-details-per-tree/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching seed details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setSeedDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching seed details:', err);
        setSeedError('Unable to load seed details.');
      } finally {
        setIsSeedLoading(false);
      }
    };

    fetchSeedDetailsList();
  }, [frameDetails]);

  // Common Details state & fetch
  const [commonDetails, setCommonDetails] = useState(null);
  const [isCommonLoading, setIsCommonLoading] = useState(false);
  const [commonError, setCommonError] = useState(null);

  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    const fetchCommonDetails = async () => {
      setIsCommonLoading(true);
      setCommonError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-common-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-common-details/${targetPlotId}`, { headers });
        }
        if (!response.ok) throw new Error('Failed to fetch common details');

        const data = await response.json();
        const payload = data?.payload || data;
        setCommonDetails(payload);
      } catch (err) {
        console.error('Error fetching common details:', err);
        setCommonError('Unable to load common details');
      } finally {
        setIsCommonLoading(false);
      }
    };

    fetchCommonDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Irrigation Details per tree state & fetch
  const [irrigationDetailsList, setIrrigationDetailsList] = useState([]);
  const [isIrrigationLoading, setIsIrrigationLoading] = useState(false);
  const [irrigationError, setIrrigationError] = useState(null);

  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setIrrigationDetailsList([]);
      return;
    }

    const fetchIrrigationDetailsList = async () => {
      setIsIrrigationLoading(true);
      setIrrigationError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-irrigation-details-per-tree/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-irrigation-details-per-tree/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching irrigation details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setIrrigationDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching irrigation details list:', err);
        setIrrigationError('Unable to load irrigation details');
      } finally {
        setIsIrrigationLoading(false);
      }
    };

    fetchIrrigationDetailsList();
  }, [frameDetails]);

  // Yield Details per tree state & fetch
  const [yieldDetailsList, setYieldDetailsList] = useState([]);
  const [isYieldLoading, setIsYieldLoading] = useState(false);
  const [yieldError, setYieldError] = useState(null);

  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setYieldDetailsList([]);
      return;
    }

    const fetchYieldDetailsList = async () => {
      setIsYieldLoading(true);
      setYieldError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-yield-details/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-yield-details/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching yield details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setYieldDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching yield details list:', err);
        setYieldError('Unable to load yield details');
      } finally {
        setIsYieldLoading(false);
      }
    };

    fetchYieldDetailsList();
  }, [frameDetails]);

  // Disease Details per tree state & fetch
  const [diseaseDetailsList, setDiseaseDetailsList] = useState([]);
  const [isDiseaseLoading, setIsDiseaseLoading] = useState(false);
  const [diseaseError, setDiseaseError] = useState(null);

  useEffect(() => {
    const treeItems = frameDetails?.ifTreeThenRandomNo || [];
    if (treeItems.length === 0) {
      setDiseaseDetailsList([]);
      return;
    }

    const fetchDiseaseDetailsList = async () => {
      setIsDiseaseLoading(true);
      setDiseaseError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        const results = await Promise.all(
          treeItems.map(async (item) => {
            const treeId = item.cceDataEntryPerTreeId;
            if (!treeId) return null;
            try {
              let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-data-entry/fetch-diseases-details/${treeId}`, { headers });
              if (!response.ok) {
                response = await fetch(`${mainapi.FORM_API}/cce-data-entry/fetch-diseases-details/${treeId}`, { headers });
              }
              if (!response.ok) return null;
              const data = await response.json();
              const payload = data?.payload || data;
              return {
                ...payload,
                randomNo: item.randomNo,
                cceDataEntryPerTreeId: treeId
              };
            } catch (e) {
              console.error(`Error fetching disease details for tree ${treeId}:`, e);
              return null;
            }
          })
        );

        const validResults = results.filter(Boolean);
        setDiseaseDetailsList(validResults);
      } catch (err) {
        console.error('Error fetching disease details list:', err);
        setDiseaseError('Unable to load disease details');
      } finally {
        setIsDiseaseLoading(false);
      }
    };

    fetchDiseaseDetailsList();
  }, [frameDetails]);

  // Fetch plot image / grid details (/cce-crop-details/fetch-image-details/{cceAvailablePlotId})
  const [imageDetails, setImageDetails] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    const plotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId;
    const targetPlotId = plotId || '9de83462-0520-4815-b334-d078855987be';

    if (!targetPlotId) return;

    const fetchImageDetails = async () => {
      setIsImageLoading(true);
      setImageError(null);
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };

      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-crop-details/fetch-image-details/${targetPlotId}`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/cce-crop-details/fetch-image-details/${targetPlotId}`, { headers });
        }

        if (!response.ok) {
          throw new Error('Failed to fetch plot image details');
        }

        const data = await response.json();
        const payload = data?.payload || data;
        setImageDetails(payload);
      } catch (err) {
        console.error('Error fetching image details:', err);
        setImageError('Unable to load plot image details');
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchImageDetails();
  }, [rowData.availableCcePlotId, rowData.cceAvailablePlotId]);

  // Fetch CCE master crops list to resolve frameUnitId / frameUnitName if not directly in frameDetails or plotDetails
  const [masterCrops, setMasterCrops] = useState([]);
  useEffect(() => {
    const fetchMasterCrops = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      };
      try {
        let response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-crop-details/fetch-all-cce-crops`, { headers });
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/cce-crop-details/fetch-all-cce-crops`, { headers });
        }
        if (!response.ok) {
          response = await fetch(`${mainapi.FORM_API}/earas-form1-entry/cce-crop-details/master-cce-crops/fetch-all`, { headers });
        }
        if (response.ok) {
          const data = await response.json();
          const list = data?.payload || (Array.isArray(data) ? data : []);
          setMasterCrops(list);
        }
      } catch (err) {
        console.error('Error fetching CCE master crops:', err);
      }
    };

    fetchMasterCrops();
  }, []);

  const targetCropId = rowData?.cropId || plotDetails?.cropId || frameDetails?.cropId;
  const targetCropName = rowData?.crop || plotDetails?.cropName || frameDetails?.cropName;

  const matchedMasterCrop = useMemo(() => {
    if (!masterCrops || masterCrops.length === 0) return null;
    return masterCrops.find((c) => {
      const cId = c.cropId ?? c.id;
      const cName = c.cropName ?? c.name ?? c.cropNameEn;
      if (targetCropId && String(cId) === String(targetCropId)) return true;
      if (targetCropName && cName && cName.toLowerCase().trim() === String(targetCropName).toLowerCase().trim()) return true;
      return false;
    });
  }, [masterCrops, targetCropId, targetCropName]);

  // ---------------------------------------------------------------------------
  // Frame variant discriminator based on frameUnitId:
  // frameUnitId: 5 -> sqm (Frame Selection)
  // frameUnitId: 6 -> Plants (Plant Selection)
  // frameUnitId: 7 -> Trees (Tree Selection)
  // ---------------------------------------------------------------------------
  const effectiveFrameUnitId =
    frameDetails?.frameUnitId ??
    plotDetails?.frameUnitId ??
    matchedMasterCrop?.frameUnitId ??
    rowData?.frameUnitId;

  const effectiveFrameUnitName =
    frameDetails?.frameUnitName ??
    plotDetails?.frameUnitName ??
    matchedMasterCrop?.frameUnitName ??
    rowData?.frameUnitName;

  const isSqmFrame =
    effectiveFrameUnitId === 5 ||
    (effectiveFrameUnitName && effectiveFrameUnitName.toLowerCase().includes('sqm'));

  const isPlantUnit =
    effectiveFrameUnitId === 6 ||
    (effectiveFrameUnitName && effectiveFrameUnitName.toLowerCase().includes('plant'));

  const isTreeUnit =
    effectiveFrameUnitId === 7 ||
    (effectiveFrameUnitName && effectiveFrameUnitName.toLowerCase().includes('tree'));

  const isTreeOrPlantBased =
    isPlantUnit ||
    isTreeUnit ||
    (!isSqmFrame && (
      (frameDetails?.totalNumberOfBearing || plotDetails?.totalNumberOfBearing || 0) > 0 ||
      (frameDetails?.totalNumberOfYoung || plotDetails?.totalNumberOfYoung || 0) > 0 ||
      ((frameDetails?.ifTreeThenRandomNo || []).length > 0)
    ));

  const unitLabel = isPlantUnit ? 'Plant' : 'Tree';
  const unitLabelPlural = isPlantUnit ? 'Plants' : 'Trees';

  const selectedTrees = frameDetails?.ifTreeThenRandomNo || [];

  // Irrigation type(s) live inside each irrigationSources[] entry, not at the
  // root of the common-details payload. Join them for the summary card.
  const irrigationTypeLabel =
    (commonDetails?.irrigationSources || [])
      .map((source) => source.irrigationType)
      .filter(Boolean)
      .join(', ') || 'N/A';

  // The yield payload nests two levels deep (visits, then yield types per
  // visit), so flatten to one row per measurement for tabular display.
  const yieldRows = yieldDetailsList.flatMap((tree, treeIdx) =>
    (tree.visitListResponses || []).flatMap((visit) =>
      (visit.yieldTypeResponses || []).map((entry, entryIdx) => ({
        treeLabel: `Tree ${treeIdx + 1}`,
        noOfVisit: visit.noOfVisit,
        rowKey: `${tree.cceDataEntryPerTreeId}-${visit.noOfVisit}-${entry.cropYieldTypeId ?? entryIdx}`,
        ...entry
      }))
    )
  );

  // ---------------------------------------------------------------------------
  // Matrix format for Yield & Production tab:
  // Columns: Parameter / Yield Type | Tree 1 Result | Tree 2 Result | ... | Total Yield
  // Rows: Harvest Date | Yield Type 1 | Yield Type 2 ...
  // ---------------------------------------------------------------------------
  const yieldMatrix = useMemo(() => {
    if (!yieldDetailsList || yieldDetailsList.length === 0) return null;

    const visitsSet = new Set();
    yieldDetailsList.forEach((tree) => {
      (tree.visitListResponses || []).forEach((visit) => {
        if (visit.noOfVisit !== undefined && visit.noOfVisit !== null) {
          visitsSet.add(visit.noOfVisit);
        }
      });
    });

    const visitNumbers = Array.from(visitsSet).sort((a, b) => a - b);
    if (visitNumbers.length === 0) visitNumbers.push(1);

    return visitNumbers.map((visitNo) => {
      const harvestDates = yieldDetailsList.map((tree) => {
        const v = (tree.visitListResponses || []).find((vis) => vis.noOfVisit === visitNo);
        return v?.harvestDate ? formatDate(v.harvestDate) : 'N/A';
      });

      const yieldTypesMap = new Map();
      yieldDetailsList.forEach((tree) => {
        const v = (tree.visitListResponses || []).find((vis) => vis.noOfVisit === visitNo);
        (v?.yieldTypeResponses || []).forEach((y) => {
          const key = y.cropYieldTypeId ?? y.cropYieldNameEn ?? y.cropYieldNameMal;
          if (key && !yieldTypesMap.has(key)) {
            yieldTypesMap.set(key, {
              id: key,
              nameEn: y.cropYieldNameEn || 'Yield',
              nameMal: y.cropYieldNameMal || '',
              resultType: y.resultType || '',
              unit: y.resultUnit || ''
            });
          }
        });
      });

      const yieldTypes = Array.from(yieldTypesMap.values());

      const yieldRowsMatrix = yieldTypes.map((yType) => {
        let totalVal = 0;
        let hasNumericVal = false;
        let commonUnit = yType.unit;

        const treeResults = yieldDetailsList.map((tree) => {
          const v = (tree.visitListResponses || []).find((vis) => vis.noOfVisit === visitNo);
          const y = (v?.yieldTypeResponses || []).find(
            (entry) => (entry.cropYieldTypeId ?? entry.cropYieldNameEn ?? entry.cropYieldNameMal) === yType.id
          );

          if (!y || y.result === undefined || y.result === null) return 'N/A';

          if (y.resultUnit && !commonUnit) commonUnit = y.resultUnit;

          const num = Number(y.result);
          if (!Number.isNaN(num)) {
            totalVal += num;
            hasNumericVal = true;
          }

          return `${y.result}${y.resultUnit ? ` ${y.resultUnit}` : ''}`;
        });

        const totalYieldStr = hasNumericVal
          ? `${Number.isInteger(totalVal) ? totalVal : totalVal.toFixed(2)}${commonUnit ? ` ${commonUnit}` : ''}`
          : 'N/A';

        return {
          yType,
          treeResults,
          totalYield: totalYieldStr
        };
      });

      return {
        visitNo,
        harvestDates,
        yieldRows: yieldRowsMatrix
      };
    });
  }, [yieldDetailsList]);

  // Extract all plant/tree coordinates from the imageDetails API payload
  const allCoordinates = useMemo(() => {
    if (!imageDetails) return [];
    if (Array.isArray(imageDetails)) return imageDetails;
    if (Array.isArray(imageDetails.coordinates)) return imageDetails.coordinates;
    if (Array.isArray(imageDetails.coordinateList)) return imageDetails.coordinateList;
    if (Array.isArray(imageDetails.coordinatesList)) return imageDetails.coordinatesList;
    if (Array.isArray(imageDetails.trees)) return imageDetails.trees;
    if (Array.isArray(imageDetails.plantCoordinates)) return imageDetails.plantCoordinates;
    if (Array.isArray(imageDetails.plants)) return imageDetails.plants;
    return [];
  }, [imageDetails]);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const targetPlotId = rowData.availableCcePlotId || rowData.cceAvailablePlotId || 'N/A';
      const cropName = rowData?.crop || plotDetails?.cropName || frameDetails?.cropName || 'CCE Crop';
      const seasonName = plotDetails?.seasonName || rowData?.season || 'N/A';

      const applyAutoTable = (options) => {
        if (typeof autoTable === 'function') {
          autoTable(doc, options);
        } else if (typeof doc.autoTable === 'function') {
          doc.autoTable(options);
        }
      };

      const checkPageBreak = (neededHeight = 25) => {
        const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y;
        if (currentY + neededHeight > 270) {
          doc.addPage();
          y = 20;
          return true;
        } else {
          y = currentY;
          return false;
        }
      };

      let y = 14;

      // Header Banner
      doc.setFillColor(5, 48, 122);
      doc.rect(14, y, 182, 22, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('EARAS — CCE COMPREHENSIVE CROP & PLOT DATA REPORT', 18, y + 9);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Plot ID: ${targetPlotId} | Generated: ${new Date().toLocaleString()}`, 18, y + 16);

      y += 28;

      // Summary Header Card Table
      applyAutoTable({
        startY: y,
        head: [['Summary Parameter', 'Value', 'Summary Parameter', 'Value']],
        body: [
          ['Crop & Season', `${cropName} (${seasonName})`, 'Farmer Name', plotDetails?.farmerName || rowData?.farmerName || 'N/A'],
          ['Plot Selection Status', plotDetails?.isSelected ? 'Selected' : 'N/A', 'CCE Source Type', plotDetails?.cceSourceType || 'N/A'],
          ['District / Taluk', `${plotDetails?.btrDetailsResponse?.districtName || 'N/A'} / ${plotDetails?.btrDetailsResponse?.talukName || 'N/A'}`, 'Local Body / Panchayath', plotDetails?.btrDetailsResponse?.localbodyNameEn || rowData?.panchayath || 'N/A'],
          ['Survey / Resurvey No', plotDetails?.btrDetailsResponse?.resvno ? `${plotDetails.btrDetailsResponse.resvno}/${plotDetails.btrDetailsResponse.resbdno || ''}` : (rowData?.surveyNo || 'N/A'), 'Cultivated Area', formatArea(plotDetails?.cultivatedArea ?? rowData?.cultivatedArea)]
        ],
        theme: 'grid',
        headStyles: { fillColor: [5, 48, 122], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 244, 248], cellWidth: 38 },
          1: { cellWidth: 53 },
          2: { fontStyle: 'bold', fillColor: [240, 244, 248], cellWidth: 38 },
          3: { cellWidth: 53 }
        }
      });

      // SECTION 1: Cultivator Field Details
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text('1. Cultivator Field & Location Details', 14, y);
      y += 4;

      applyAutoTable({
        startY: y,
        head: [['Field Parameter', 'Value', 'Field Parameter', 'Value']],
        body: [
          ['District', plotDetails?.btrDetailsResponse?.districtName || 'N/A', 'Taluk', plotDetails?.btrDetailsResponse?.talukName || 'N/A'],
          ['Block', plotDetails?.btrDetailsResponse?.blockName || 'N/A', 'Local Body / Panchayath', plotDetails?.btrDetailsResponse?.localbodyNameEn || rowData?.panchayath || 'N/A'],
          ['Village', plotDetails?.btrDetailsResponse?.villageNameEn || 'N/A', 'Zone Name', plotDetails?.btrDetailsResponse?.zoneName || 'N/A'],
          ['Survey / Resurvey No.', plotDetails?.btrDetailsResponse?.resvno ? `${plotDetails.btrDetailsResponse.resvno}/${plotDetails.btrDetailsResponse.resbdno || ''}` : (rowData?.surveyNo || 'N/A'), 'Block Code (BCODE)', plotDetails?.btrDetailsResponse?.bcode || 'N/A'],
          ['Total BTR Area', plotDetails?.btrDetailsResponse?.totCent !== undefined ? `${plotDetails.btrDetailsResponse.totCent} cent` : 'N/A', 'Crop & Season', `${cropName} (${seasonName})`],
          ['Cultivated Area', formatArea(plotDetails?.cultivatedArea ?? rowData?.cultivatedArea), 'Land Type', plotDetails?.landType || plotDetails?.btrDetailsResponse?.landType || rowData?.landType || 'N/A'],
          ['Irrigation Status', plotDetails?.isIrrigated === true ? 'Irrigated' : (plotDetails?.isIrrigated === false ? 'Unirrigated' : 'N/A'), 'CCE Source Type', plotDetails?.cceSourceType || 'N/A'],
          ['Expected Harvest Date', formatDate(plotDetails?.expectedHarvestDate), 'Total Patches', plotDetails?.totalNoPatches ?? 'N/A'],
          ['Random Patch Selected', plotDetails?.randomNoPatchSelected ?? 'N/A', 'Agri Year Period', (plotDetails?.agriStartYear && plotDetails?.agriEndYear) ? `${formatDate(plotDetails.agriStartYear)} to ${formatDate(plotDetails.agriEndYear)}` : 'N/A'],
          ['Farmer Name', plotDetails?.farmerName || rowData?.farmerName || 'N/A', 'Farmer Contact', plotDetails?.farmerPhoneNumber || 'N/A'],
          ['Farmer Address', plotDetails?.farmerAddress || 'N/A', 'Remarks', plotDetails?.remarks || 'No remarks provided']
        ],
        theme: 'plain',
        headStyles: { fillColor: [225, 235, 245], textColor: [5, 48, 122], fontStyle: 'bold', fontSize: 8.5 },
        styles: { fontSize: 7.5, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 40 },
          1: { cellWidth: 51 },
          2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 40 },
          3: { cellWidth: 51 }
        }
      });

      // SECTION 2: Frame Selection Summary
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text(`2. ${unitLabel} Selection Summary`, 14, y);
      y += 4;

      if (isTreeOrPlantBased) {
        applyAutoTable({
          startY: y,
          head: [[`Bearing ${unitLabelPlural}`, `Young ${unitLabelPlural}`, `Total ${unitLabelPlural}`]],
          body: [
            [
              frameDetails?.totalNumberOfBearing ?? plotDetails?.totalNumberOfBearing ?? 0,
              frameDetails?.totalNumberOfYoung ?? plotDetails?.totalNumberOfYoung ?? 0,
              (frameDetails?.totalNumberOfBearing || plotDetails?.totalNumberOfBearing || 0) + (frameDetails?.totalNumberOfYoung || plotDetails?.totalNumberOfYoung || 0)
            ]
          ],
          theme: 'grid',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8.5 },
          styles: { fontSize: 8, halign: 'center' }
        });
      } else {
        applyAutoTable({
          startY: y,
          head: [['Side Length X (m)', 'Side Length Y (m)', 'Random Side Length X (m)', 'Random Side Length Y (m)']],
          body: [
            [
              frameDetails?.sideLengthX ?? 0,
              frameDetails?.sideLengthY ?? 0,
              frameDetails?.randomSideLengthX ?? 0,
              frameDetails?.randomSideLengthY ?? 0
            ]
          ],
          theme: 'grid',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8.5 },
          styles: { fontSize: 8, halign: 'center' }
        });
      }

      // Selected Trees Table
      if (selectedTrees.length > 0) {
        checkPageBreak(25);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Randomly Selected ${unitLabelPlural} (${selectedTrees.length})`, 14, y);
        y += 4;

        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, `${unitLabel} Entry ID`, 'Random Number', 'Growth Stage Locked']],
          body: selectedTrees.map((item, idx) => [
            idx + 1,
            `${unitLabel} ${idx + 1}`,
            item.cceDataEntryPerTreeId || 'N/A',
            item.randomNo ?? 'N/A',
            item.isGrowthStageLocked ? 'Yes' : 'No'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
      }

      // All Plants Coordinates Table
      if (allCoordinates.length > 0) {
        checkPageBreak(25);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`All ${unitLabelPlural} Coordinates Summary (${allCoordinates.length})`, 14, y);
        y += 4;

        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, 'Coordinate X', 'Coordinate Y', 'Selection Status']],
          body: allCoordinates.map((coord, idx) => {
            const isSelected = !!(coord.isSelectedTree ?? coord.isSelected ?? coord.selected);
            return [
              idx + 1,
              `${unitLabel} ${idx + 1}`,
              coord.coordinateX ?? coord.x ?? 0,
              coord.coordinateY ?? coord.y ?? 0,
              isSelected ? 'Selected (Orange)' : 'Unselected'
            ];
          }),
          theme: 'grid',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
      }

      // SECTION 3: Seed Details
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text('3. Seed Information', 14, y);
      y += 4;

      if (seedDetailsList && seedDetailsList.length > 0) {
        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, 'Random No', 'Entry ID', 'Seed Type', 'Source', 'Quantity', 'Sowing Method', 'Age', 'Planted Date']],
          body: seedDetailsList.map((item, idx) => [
            idx + 1,
            `${unitLabel} ${idx + 1}`,
            `#${item.randomNo ?? 'N/A'}`,
            item.cceDataEntryPerTreeId || 'N/A',
            item.seedTypeName || 'N/A',
            item.seedSourceName || 'N/A',
            item.seedQuantity ?? 'N/A',
            item.sowingMethodName || 'N/A',
            item.ageOfPlant ?? 'N/A',
            formatDate(item.plantedMonthAndYear)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
      } else {
        applyAutoTable({
          startY: y,
          head: [['Status']],
          body: [['No data found']],
          theme: 'plain',
          styles: { fontSize: 8, textColor: 100 }
        });
      }

      // SECTION 4: Irrigation Details
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text('4. Irrigation Method & Schedule', 14, y);
      y += 4;

      if (commonDetails?.irrigationSources && commonDetails.irrigationSources.length > 0) {
        applyAutoTable({
          startY: y,
          head: [['S.No', 'Source ID', 'Irrigation Type', 'Source Name', 'Percentage Covered']],
          body: commonDetails.irrigationSources.map((source, idx) => [
            idx + 1,
            source.cceIrrigationSourceId || 'N/A',
            source.irrigationType || 'N/A',
            source.irrigationSourceName || 'N/A',
            source.percentageCovered !== undefined ? `${source.percentageCovered}%` : 'N/A'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
        checkPageBreak(25);
      }

      if (irrigationDetailsList && irrigationDetailsList.length > 0) {
        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, 'Random No', 'Entry ID', 'Irrigated', 'Drainage', 'Schedule', 'Frequency']],
          body: irrigationDetailsList.map((item, idx) => [
            idx + 1,
            `${unitLabel} ${idx + 1}`,
            `#${item.randomNo ?? 'N/A'}`,
            item.cceDataEntryPerTreeId || 'N/A',
            item.isIrrigated ? 'Irrigated' : 'Unirrigated',
            item.isDrainageAvailable ? 'Yes' : 'No',
            item.isIrrigationScheduleRegular ? 'Regular' : 'Irregular',
            item.irrigationFrequency || 'N/A'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
      }

      // SECTION 5: Yield & Production
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text('5. Yield & Production', 14, y);
      y += 4;

      if (yieldMatrix && yieldMatrix.length > 0) {
        yieldMatrix.forEach((vGroup) => {
          checkPageBreak(25);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`Visit ${vGroup.visitNo}`, 14, y);
          y += 4;

          const headRow = ['Parameter / Yield Type', ...yieldDetailsList.map((_, tIdx) => `${unitLabel} ${tIdx + 1}`), 'Total Yield'];
          const bodyRows = [
            ['Harvest Date', ...vGroup.harvestDates, '-'],
            ...vGroup.yieldRows.map((yRow) => [
              yRow.yType.nameEn + (yRow.yType.nameMal ? ` (${yRow.yType.nameMal})` : ''),
              ...yRow.treeResults,
              yRow.totalYield
            ])
          ];

          applyAutoTable({
            startY: y,
            head: [headRow],
            body: bodyRows,
            theme: 'grid',
            headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
            styles: { fontSize: 7.5, cellPadding: 2 }
          });
        });
      } else if (yieldRows && yieldRows.length > 0) {
        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, 'Visit', 'Harvest Date', 'Yield Type', 'Result Type', 'Result']],
          body: yieldRows.map((row, idx) => [
            idx + 1,
            row.treeLabel,
            row.noOfVisit ?? 'N/A',
            formatDate(row.harvestDate),
            row.cropYieldNameEn || 'N/A',
            row.resultType || 'N/A',
            row.result !== undefined ? `${row.result} ${row.resultUnit || ''}` : 'N/A'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7.5, cellPadding: 2 }
        });
      } else {
        applyAutoTable({
          startY: y,
          head: [['Status']],
          body: [['No yield measurements recorded.']],
          theme: 'plain',
          styles: { fontSize: 8, textColor: 100 }
        });
      }

      // SECTION 6: Disease Details
      checkPageBreak(35);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 48, 122);
      doc.text('6. Crop Loss & Disease Details', 14, y);
      y += 4;

      if (diseaseDetailsList && diseaseDetailsList.length > 0) {
        applyAutoTable({
          startY: y,
          head: [['S.No', unitLabel, 'Random No', 'Entry ID', 'Infected', 'Diseases', 'Pesticide', 'Purpose', 'Control Result', 'Fertilizers']],
          body: diseaseDetailsList.map((item, idx) => {
            const diseaseNames = (item.diseases || []).map((d) => d.diseaseName).filter(Boolean).join(', ') || 'None';
            const fertilizerList = (item.fertilizers || []).map((f) => `${f.fertilizerName || 'Fertilizer'} (${f.quantityUsedKg ?? 0}kg)`).join(', ') || 'None';
            return [
              idx + 1,
              `${unitLabel} ${idx + 1}`,
              `#${item.randomNo ?? 'N/A'}`,
              item.cceDataEntryPerTreeId || 'N/A',
              item.isInfectedByAnyDisease ? 'Yes' : 'No',
              diseaseNames,
              item.isPesticideUsed ? `${item.typeOfPesticide || 'Yes'}` : 'No',
              item.pesticidePurpose || 'N/A',
              item.isPestControlSuccess !== undefined ? (item.isPestControlSuccess ? 'Success' : 'Failed') : 'N/A',
              fertilizerList
            ];
          }),
          theme: 'striped',
          headStyles: { fillColor: [5, 48, 122], textColor: 255, fontSize: 8 },
          styles: { fontSize: 7, cellPadding: 2 }
        });
      } else {
        applyAutoTable({
          startY: y,
          head: [['Status']],
          body: [['No significant crop loss or disease details reported.']],
          theme: 'plain',
          styles: { fontSize: 8, textColor: 100 }
        });
      }

      // Page Numbers and Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);

        if (i > 1) {
          doc.text(`EARAS CCE Crop Data Report — Plot ID: ${targetPlotId}`, 14, 10);
          doc.setDrawColor(226, 232, 240);
          doc.line(14, 12, 196, 12);
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(14, 285, 196, 285);
        doc.text('Confidential — AIDeA EARAS CCE Reporting System', 14, 290);
        doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
      }

      doc.save(`CCE_Report_${targetPlotId}_${cropName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderLockCheckbox = (locked) => (
    <Checkbox
      checked={!!locked}
      readOnly
      disableRipple
      size="small"
      sx={{
        p: 0,
        cursor: 'default',
        color: alpha(theme.palette.text.secondary, 0.5),
        '&.Mui-checked': { color: theme.palette.success.main }
      }}
      inputProps={{ 'aria-label': 'Growth stage locked' }}
    />
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Breadcrumb at the very top */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumb />
      </Box>

      {/* App Bar Alternative */}
      <Box sx={{
        background: `linear-gradient(135deg, ${themeColor} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        p: 2,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
        boxShadow: theme.shadows[3]
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: 'white' }} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            CCE Data View
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={isGeneratingPdf ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
          disabled={isGeneratingPdf}
          onClick={handleDownloadPdf}
          sx={{
            backgroundColor: '#ffffff',
            color: themeColor,
            fontWeight: 700,
            px: 2.5,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              backgroundColor: '#f8fafc',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            }
          }}
        >
          {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report'}
        </Button>
      </Box>

      {/* Header Info */}
      <Paper sx={{
        background: `linear-gradient(135deg, ${themeColor} 0%, #55ea58ff 100%)`,
        color: 'white',
        p: 3,
        borderRadius: 3,
        mb: 4,
        boxShadow: `0 8px 24px ${alpha(themeColor, 0.2)}`
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          {rowData?.crop || 'CCE Crop'} ({plotDetails?.seasonName || rowData?.season || 'Season'})
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Cluster"
              value={plotDetails?.clusterLabel ? `Cluster #${plotDetails.clusterLabel}` : (rowData?.clusterNo ? `Cluster #${rowData.clusterNo}` : 'N/A')}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Cultivated Area"
              value={formatArea(plotDetails?.cultivatedArea ?? rowData?.cultivatedArea)}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Land Type"
              value={plotDetails?.landType || plotDetails?.btrDetailsResponse?.landType || rowData?.landType || 'N/A'}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Survey No."
              value={
                plotDetails?.btrDetailsResponse?.resvno
                  ? (plotDetails?.btrDetailsResponse?.resbdno
                    ? `${plotDetails.btrDetailsResponse.resvno}/${plotDetails.btrDetailsResponse.resbdno}`
                    : `${plotDetails.btrDetailsResponse.resvno}`)
                  : (rowData?.surveyNo || 'N/A')
              }
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Panchayath"
              value={plotDetails?.btrDetailsResponse?.localbodyNameEn || rowData?.panchayath || 'N/A'}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <InfoItem
              label="Status"
              isBadge
              value={
                <Chip
                  label={rowData?.status || (plotDetails?.isSelected ? 'Selected' : 'N/A')}
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: rowData?.status === 'Completed' || rowData?.status === 'COMPLETED' ? '#DCFCE7' : (rowData?.status === 'Ongoing' || rowData?.status === 'ONGOING') ? '#FEF3C7' : '#FEE2E2',
                    color: rowData?.status === 'Completed' || rowData?.status === 'COMPLETED' ? '#166534' : (rowData?.status === 'Ongoing' || rowData?.status === 'ONGOING') ? '#92400E' : '#991B1B'
                  }}
                />
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs Section */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { fontWeight: 600, py: 3, minHeight: 60 },
              '& .Mui-selected': { color: `${themeColor} !important` },
              '& .MuiTabs-indicator': { backgroundColor: themeColor, height: 3 }
            }}
          >
            <Tab icon={<PersonIcon />} iconPosition="start" label="Cultivator Field Details" />
            <Tab icon={<GridOnIcon />} iconPosition="start" label="Frame Selection Summary" />
            <Tab icon={<SpaIcon />} iconPosition="start" label="Seed Details" />
            <Tab icon={<WaterDropIcon />} iconPosition="start" label="Irrigation" />
            <Tab icon={<AgricultureIcon />} iconPosition="start" label="Yield" />
            <Tab icon={<BugReportIcon />} iconPosition="start" label="Disease Details" />
          </Tabs>
        </Box>

        {/* TAB 1: Cultivator Field Details */}
        <TabPanel value={tabValue} index={0}>
          {plotDetailsError && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {plotDetailsError}
            </Alert>
          )}

          {/* 1. Survey Details */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={PersonIcon} title="Survey Details" />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    background: theme.palette.background.default
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1, fontWeight: 600 }}>
                    Survey
                  </Typography>
                  {isPlotDetailsLoading ? (
                    <CircularProgress size={20} />
                  ) : plotDetails?.surveyResponses && plotDetails.surveyResponses.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {plotDetails.surveyResponses.map((survey, idx) => (
                        <Chip
                          key={survey.surveyId ?? idx}
                          label={`${survey.surveyName}${survey.surveyAbbreviation ? ` (${survey.surveyAbbreviation})` : ''}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                      N/A
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* 2. Location & BTR Details */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={LocationOnIcon} title="Location & BTR Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="District" value={plotDetails?.btrDetailsResponse?.districtName || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Taluk" value={plotDetails?.btrDetailsResponse?.talukName || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Block" value={plotDetails?.btrDetailsResponse?.blockName || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Local Body / Panchayath" value={plotDetails?.btrDetailsResponse?.localbodyNameEn || rowData?.panchayath || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Village" value={plotDetails?.btrDetailsResponse?.villageNameEn || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Zone Name" value={plotDetails?.btrDetailsResponse?.zoneName || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Survey / Resurvey No."
                  value={
                    plotDetails?.btrDetailsResponse?.resvno
                      ? (plotDetails?.btrDetailsResponse?.resbdno
                        ? `${plotDetails.btrDetailsResponse.resvno}/${plotDetails.btrDetailsResponse.resbdno}`
                        : `${plotDetails.btrDetailsResponse.resvno}`)
                      : (rowData?.surveyNo || 'N/A')
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Block Code (BCODE)" value={plotDetails?.btrDetailsResponse?.bcode || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Total BTR Area"
                  value={
                    plotDetails?.btrDetailsResponse?.totCent !== undefined && plotDetails?.btrDetailsResponse?.totCent !== null
                      ? `${plotDetails.btrDetailsResponse.totCent} cent`
                      : 'N/A'
                  }
                />
              </Grid>
            </Grid>
          </Box>

          {/* 3. Cultivation Details */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={SpaIcon} title="Cultivation Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Crop" value={rowData?.crop || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Season" value={plotDetails?.seasonName || rowData?.season || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Cultivated Area"
                  value={formatArea(plotDetails?.cultivatedArea ?? rowData?.cultivatedArea)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Land Type"
                  value={plotDetails?.landType || plotDetails?.btrDetailsResponse?.landType || rowData?.landType || 'N/A'}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Irrigation Status"
                  value={
                    plotDetails?.isIrrigated === true
                      ? 'Irrigated'
                      : plotDetails?.isIrrigated === false
                        ? 'Unirrigated'
                        : 'N/A'
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="CCE Source Type" value={plotDetails?.cceSourceType || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Expected Harvest Date" value={formatDate(plotDetails?.expectedHarvestDate)} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Total Patches" value={plotDetails?.totalNoPatches ?? 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem label="Random Patch Selected" value={plotDetails?.randomNoPatchSelected ?? 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Agri Year Period"
                  value={
                    plotDetails?.agriStartYear && plotDetails?.agriEndYear
                      ? `${formatDate(plotDetails.agriStartYear)} to ${formatDate(plotDetails.agriEndYear)}`
                      : 'N/A'
                  }
                />
              </Grid>
              {/* <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="Geo Coordinates"
                  value={
                    plotDetails?.geoCoordinate && plotDetails.geoCoordinate.replace(/,/g, '').trim() !== ''
                      ? plotDetails.geoCoordinate
                      : 'N/A'
                  }
                />
              </Grid> */}
              <Grid item xs={12} sm={6} md={3}>
                <DataItem
                  label="CCE Plot Selection"
                  value={
                    plotDetails?.isSelected !== undefined && plotDetails?.isSelected !== null
                      ? (plotDetails.isSelected ? 'Selected' : 'Not Selected')
                      : 'N/A'
                  }
                />
              </Grid>
            </Grid>
          </Box>

          {/* 4. Farmer Details */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={PersonIcon} title="Farmer Details" />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <DataItem label="Farmer Name" value={plotDetails?.farmerName || rowData?.farmerName || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DataItem label="Address" value={plotDetails?.farmerAddress || 'N/A'} />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DataItem label="Contact No." value={plotDetails?.farmerPhoneNumber || 'N/A'} />
              </Grid>
            </Grid>
          </Box>

          {/* 5. Remarks */}
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={RemarksIcon} title="Remarks" />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DataItem label="Remarks" value={plotDetails?.remarks || 'No remarks provided'} />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 2: FRAME SELECTION / PLANT & TREE SELECTION */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <SectionTitle
              icon={GridOnIcon}
              title={
                isTreeOrPlantBased
                  ? `${unitLabel} Selection Summary`
                  : isSqmFrame
                    ? 'Frame Selection Summary (sqm)'
                    : 'Frame Selection Summary'
              }
            />

            {isFrameLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={36} />
              </Box>
            ) : frameError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {frameError}
              </Alert>
            ) : frameDetails ? (
              <>
                {/* ---------- Summary metrics ---------- */}
                {isTreeOrPlantBased ? (
                  /* CASE 1: Per Tree / Plant (frameUnitId: 6 or 7) */
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label={`Bearing ${unitLabelPlural}`}
                        value={frameDetails.totalNumberOfBearing ?? plotDetails?.totalNumberOfBearing ?? 0}
                        color={theme.palette.success.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label={`Young ${unitLabelPlural}`}
                        value={frameDetails.totalNumberOfYoung ?? plotDetails?.totalNumberOfYoung ?? 0}
                        color={theme.palette.info.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MetricCard
                        label={`Total ${unitLabelPlural}`}
                        value={
                          (frameDetails.totalNumberOfBearing || plotDetails?.totalNumberOfBearing || 0) +
                          (frameDetails.totalNumberOfYoung || plotDetails?.totalNumberOfYoung || 0)
                        }
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  /* CASE 2: Per Frame / Sqm (frameUnitId: 5) */
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Side Length X (m)"
                        value={frameDetails.sideLengthX ?? 0}
                        color={theme.palette.success.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Side Length Y (m)"
                        value={frameDetails.sideLengthY ?? 0}
                        color={theme.palette.info.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Random Side Length X (m)"
                        value={frameDetails.randomSideLengthX ?? 0}
                        color={theme.palette.warning.main}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <MetricCard
                        label="Random Side Length Y (m)"
                        value={frameDetails.randomSideLengthY ?? 0}
                        color={theme.palette.primary.main}
                      />
                    </Grid>
                  </Grid>
                )}

                {/* ---------- Selected trees / plants list ---------- */}
                {isTreeOrPlantBased ? (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'text.primary' }}>
                      Randomly Selected {unitLabelPlural} ({selectedTrees.length})
                    </Typography>

                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{unitLabel} Entry ID (cceDataEntryPerTreeId)</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Random Number</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Growth Stage Locked</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTrees.length > 0 ? (
                            selectedTrees.map((item, idx) => (
                              <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                                <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={`${unitLabel} ${idx + 1}`}
                                    size="small"
                                    color="primary"
                                    sx={{ fontWeight: 700 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                  {item.cceDataEntryPerTreeId || 'N/A'}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                  {item.randomNo ?? 'N/A'}
                                </TableCell>
                                <TableCell align="center">
                                  {renderLockCheckbox(item.isGrowthStageLocked)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                No selected {unitLabelPlural.toLowerCase()} available.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'text.primary' }}>
                      Selected Frame Plot Details
                    </Typography>
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Plot Dimension</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Random Length Selected</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>X Direction (Length)</TableCell>
                            <TableCell>{frameDetails.sideLengthX ?? 10} m</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{frameDetails.randomSideLengthX ?? 'N/A'} m</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 500 }}>Y Direction (Width)</TableCell>
                            <TableCell>{frameDetails.sideLengthY ?? 10} m</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{frameDetails.randomSideLengthY ?? 'N/A'} m</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </>
            ) : (
              /* FALLBACK: Render static/rowData values if no API response */
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Plot Dimension</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Random Number Selected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isTreeOrPlantBased || rowData.frameType === 'trees' ? (
                      <>
                        <TableRow><TableCell>Number of {unitLabelPlural} in Frame</TableCell><TableCell>Count</TableCell><TableCell>{rowData.numberOfTrees || 50}</TableCell></TableRow>
                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}><TableCell>Randomly Selected {unitLabel} Number</TableCell><TableCell>Number</TableCell><TableCell>{rowData.randomTreeNumber || 12}</TableCell></TableRow>
                      </>
                    ) : (
                      <>
                        <TableRow><TableCell>X Direction</TableCell><TableCell>m</TableCell><TableCell>{rowData.plotLengthX || 10}</TableCell></TableRow>
                        <TableRow><TableCell>Y Direction</TableCell><TableCell>m</TableCell><TableCell>{rowData.plotLengthY || 10}</TableCell></TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* ------------------------------------------------------------------ */}
            {/* Plot Frame Image / Grid Map Layout Details (/fetch-image-details)  */}
            {/* ------------------------------------------------------------------ */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageIcon color="primary" /> Frame Grid & {unitLabel} Layout Diagram
              </Typography>

              {isImageLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : imageError ? (
                <Alert severity="info" sx={{ mb: 2 }}>{imageError}</Alert>
              ) : imageDetails ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6)
                  }}
                >
                  {/* If API response contains direct image URL / base64 string */}
                  {(imageDetails.imageUrl || imageDetails.image || imageDetails.base64Image) && (
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      <Box
                        component="img"
                        src={imageDetails.imageUrl || imageDetails.image || imageDetails.base64Image}
                        alt="Plot Frame Layout"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 450,
                          borderRadius: 2,
                          boxShadow: 2,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}

                  {/* Grid Coordinates Visual Map Diagram & Full Plant List Table */}
                  {allCoordinates && allCoordinates.length > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Plot Grid Size: {imageDetails.gridSize || 1000} × {imageDetails.gridSize || 1000} | Total {unitLabelPlural}: {allCoordinates.length}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip
                            icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff6f00' }} />}
                            label={`Selected ${unitLabelPlural}: ${allCoordinates.filter((c) => (c.isSelectedTree ?? c.isSelected ?? c.selected)).length}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 700, borderColor: '#ff6f00', color: '#e65100' }}
                          />
                          <Chip
                            icon={<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2e7d32' }} />}
                            label={`Unselected ${unitLabelPlural}: ${allCoordinates.filter((c) => !(c.isSelectedTree ?? c.isSelected ?? c.selected)).length}`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          maxWidth: 550,
                          mx: 'auto',
                          aspectRatio: '1/1',
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          background: `linear-gradient(135deg, ${alpha('#1b5e20', 0.05)} 0%, ${alpha('#e8f5e9', 0.4)} 100%)`
                        }}
                      >
                        <svg
                          viewBox={`0 0 ${imageDetails.gridSize || 1000} ${imageDetails.gridSize || 1000}`}
                          style={{ width: '100%', height: '100%', display: 'block' }}
                        >
                          {/* Grid Background Lines (10x10) */}
                          {[...Array(10)].map((_, i) => {
                            const step = (imageDetails.gridSize || 1000) / 10;
                            const pos = (i + 1) * step;
                            return (
                              <g key={i}>
                                <line
                                  x1={pos}
                                  y1="0"
                                  x2={pos}
                                  y2={imageDetails.gridSize || 1000}
                                  stroke={alpha(theme.palette.divider, 0.2)}
                                  strokeDasharray="4 4"
                                />
                                <line
                                  x1="0"
                                  y1={pos}
                                  x2={imageDetails.gridSize || 1000}
                                  y2={pos}
                                  stroke={alpha(theme.palette.divider, 0.2)}
                                  strokeDasharray="4 4"
                                />
                              </g>
                            );
                          })}

                          {/* Coordinates Markers for All Plants */}
                          {allCoordinates.map((coord, idx) => {
                            const isSelected = !!(coord.isSelectedTree ?? coord.isSelected ?? coord.selected);
                            const posX = Number(coord.coordinateX ?? coord.x ?? 0);
                            const posY = Number(coord.coordinateY ?? coord.y ?? 0);
                            return (
                              <g key={idx}>
                                {isSelected && (
                                  <circle
                                    cx={posX}
                                    cy={posY}
                                    r="36"
                                    fill={alpha('#ff9800', 0.25)}
                                    stroke="#ff6f00"
                                    strokeWidth="3.5"
                                  />
                                )}
                                <circle
                                  cx={posX}
                                  cy={posY}
                                  r={isSelected ? '22' : '14'}
                                  fill={isSelected ? '#ff6f00' : '#2e7d32'}
                                  stroke="#ffffff"
                                  strokeWidth="3"
                                />
                                <text
                                  x={posX}
                                  y={posY + (isSelected ? 6 : 5)}
                                  textAnchor="middle"
                                  fill="#ffffff"
                                  fontSize={isSelected ? '15' : '11'}
                                  fontWeight="bold"
                                >
                                  {idx + 1}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </Box>

                      {/* Full Table Listing of All Plants from API Response */}
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                          All {unitLabelPlural} List & Selection Details ({allCoordinates.length})
                        </Typography>
                        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                          <Table>
                            <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Coordinate X</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Coordinate Y</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="center">Selection Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {allCoordinates.map((coord, idx) => {
                                const isSelected = !!(coord.isSelectedTree ?? coord.isSelected ?? coord.selected);
                                const posX = coord.coordinateX ?? coord.x ?? 0;
                                const posY = coord.coordinateY ?? coord.y ?? 0;
                                return (
                                  <TableRow key={idx} hover sx={{ bgcolor: isSelected ? alpha('#ff9800', 0.06) : 'inherit' }}>
                                    <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={`${unitLabel} ${idx + 1}`}
                                        size="small"
                                        color={isSelected ? 'warning' : 'success'}
                                        sx={{
                                          fontWeight: 700,
                                          bgcolor: isSelected ? '#ff6f00' : undefined,
                                          color: isSelected ? '#ffffff' : undefined
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{posX}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{posY}</TableCell>
                                    <TableCell align="center">
                                      <Chip
                                        label={isSelected ? 'Selected' : 'Unselected'}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          bgcolor: isSelected ? '#ff6f00' : alpha('#2e7d32', 0.1),
                                          color: isSelected ? '#ffffff' : '#2e7d32'
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  )}
                </Paper>
              ) : (
                <Typography color="text.secondary" variant="body2">No frame image or coordinate details available.</Typography>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 3: SEED DETAILS */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={SpaIcon} title="Seed Information" />

            {isSeedLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : seedError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{seedError}</Alert>
            ) : seedDetailsList && seedDetailsList.length > 0 ? (
              /* Per-Tree / Per-Plant Seed Details with Random Number from Frame Selection */
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Random Number</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{unitLabel} Entry ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Seed Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Sowing Method</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Planted Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {seedDetailsList.map((item, idx) => (
                      <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${unitLabel} ${idx + 1}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          <Chip
                            label={`#${item.randomNo ?? 'N/A'}`}
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {item.cceDataEntryPerTreeId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.seedTypeName || 'N/A'}
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.seedSourceName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {item.seedQuantity !== undefined && item.seedQuantity !== null
                            ? item.seedQuantity
                            : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.sowingMethodName || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {item.ageOfPlant !== undefined && item.ageOfPlant !== null
                            ? item.ageOfPlant
                            : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatDate(item.plantedMonthAndYear)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  No data found
                </Typography>
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* TAB 4: IRRIGATION */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={WaterDropIcon} title="Irrigation Method & Schedule" />

            {/* Irrigation Sources from Common Details API */}
            {isCommonLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                <CircularProgress size={40} />
              </Box>
            ) : commonError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{commonError}</Alert>
            ) : commonDetails?.irrigationSources && commonDetails.irrigationSources.length > 0 ? (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                  Irrigation Sources
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {commonDetails.irrigationSources.map((source, index) => (
                    <Chip
                      key={source.sourceId || index}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontWeight: 600 }}>{source.irrigationType || 'N/A'}</span>
                          {source.irrigationCodeDes !== undefined && source.irrigationCodeDes !== null && (
                            <Chip
                              label={`Code: ${source.irrigationCodeDes}`}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.info.main, 0.15),
                                color: theme.palette.info.dark,
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1,
                                  py: 0.5
                                }
                              }}
                            />
                          )}
                        </Box>
                      }
                      icon={<WaterDropIcon />}
                      sx={{
                        fontWeight: 500,
                        py: 1,
                        px: 0.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                        borderRadius: 2,
                        '& .MuiChip-label': {
                          px: 1.5,
                        },
                        '& .MuiChip-icon': {
                          color: theme.palette.primary.main,
                        },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          borderColor: theme.palette.primary.main,
                        }
                      }}
                      size="medium"
                    />
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ mb: 4, py: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  Irrigation Sources
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                  No irrigation sources available
                </Typography>
              </Box>
            )}

            {/* Irrigation Type summary card, sourced from irrigationSources */}


            {/* Per-tree / Per-plant irrigation schedule */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Irrigation Details ({unitLabelPlural})
              </Typography>

              {isIrrigationLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : irrigationError ? (
                <Alert severity="warning" sx={{ mb: 2 }}>{irrigationError}</Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Random Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{unitLabel} Entry ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Irrigated</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Drainage Available</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Irrigation Schedule</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Irrigation Frequency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {irrigationDetailsList.length > 0 ? (
                        irrigationDetailsList.map((item, idx) => (
                          <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${unitLabel} ${idx + 1}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              <Chip
                                label={`#${item.randomNo ?? 'N/A'}`}
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {item.cceDataEntryPerTreeId || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.isIrrigated !== undefined && item.isIrrigated !== null ? (
                                <Chip
                                  label={item.isIrrigated ? 'Irrigated' : 'Unirrigated'}
                                  size="small"
                                  color={item.isIrrigated ? 'info' : 'default'}
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {item.isDrainageAvailable !== undefined && item.isDrainageAvailable !== null ? (
                                <Chip
                                  label={item.isDrainageAvailable ? 'Yes' : 'No'}
                                  size="small"
                                  color={item.isDrainageAvailable ? 'success' : 'error'}
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>
                              {item.isIrrigationScheduleRegular !== undefined && item.isIrrigationScheduleRegular !== null ? (
                                <Chip
                                  label={item.isIrrigationScheduleRegular ? 'Regular' : 'Irregular'}
                                  size="small"
                                  color={item.isIrrigationScheduleRegular ? 'success' : 'warning'}
                                  variant="outlined"
                                  sx={{ fontWeight: 600 }}
                                />
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {item.irrigationFrequency || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            No irrigation details recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 5: YIELD */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={AgricultureIcon} title="Yield & Production" />
            {isYieldLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : yieldError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{yieldError}</Alert>
            ) : yieldMatrix && yieldMatrix.length > 0 ? (
              yieldMatrix.map((vGroup) => (
                <Box key={vGroup.visitNo} sx={{ mb: 3 }}>
                  {yieldMatrix.length > 1 && (
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                      Visit {vGroup.visitNo}
                    </Typography>
                  )}
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Parameter / Yield Type</TableCell>
                          {yieldDetailsList.map((_, tIdx) => (
                            <TableCell key={tIdx} align="center" sx={{ fontWeight: 700 }}>
                              <Chip
                                label={`${unitLabel} ${tIdx + 1} Result`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                            Total Yield
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Row 1: Harvest Date */}
                        <TableRow hover>
                          <TableCell sx={{ fontWeight: 600 }}>Harvest Date</TableCell>
                          {vGroup.harvestDates.map((hDate, hIdx) => (
                            <TableCell key={hIdx} align="center" sx={{ fontWeight: 600 }}>
                              {hDate}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                            -
                          </TableCell>
                        </TableRow>

                        {/* Yield Type Rows */}
                        {vGroup.yieldRows.length > 0 ? (
                          vGroup.yieldRows.map((yRow, yIdx) => (
                            <TableRow key={yRow.yType.id || yIdx} hover>
                              <TableCell sx={{ fontWeight: 600 }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {yRow.yType.nameEn}
                                  </Typography>
                                  {yRow.yType.nameMal && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {yRow.yType.nameMal}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              {yRow.treeResults.map((res, rIdx) => (
                                <TableCell key={rIdx} align="center" sx={{ fontWeight: 600 }}>
                                  {res}
                                </TableCell>
                              ))}
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: 700,
                                  color: 'primary.main',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04)
                                }}
                              >
                                {yRow.totalYield}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={yieldDetailsList.length + 2} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                              No yield type entries recorded for Visit {vGroup.visitNo}.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Visit</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Harvest Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Yield Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>വിളവിന്റെ വിവരം</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yieldRows.length > 0 ? (
                      yieldRows.map((row, idx) => (
                        <TableRow key={row.rowKey || idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.treeLabel}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={row.noOfVisit ?? 'N/A'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{formatDate(row.harvestDate)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.cropYieldNameEn || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.cropYieldNameMal || 'N/A'}</TableCell>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{row.resultType || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {row.result !== undefined && row.result !== null
                              ? `${row.result}${row.resultUnit ? ` ${row.resultUnit}` : ''}`
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No yield measurements recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
          <Box>
            <SectionTitle icon={WarningIcon} title="Crop Loss & Damage" />
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No significant crop loss reported for this cluster.
              </Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* TAB 6: DISEASE DETAILS */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ mb: 4 }}>
            <SectionTitle icon={BugReportIcon} title="Disease & Pest Control Details" />

            {isDiseaseLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                <CircularProgress size={32} />
              </Box>
            ) : diseaseError ? (
              <Alert severity="warning" sx={{ mb: 2 }}>{diseaseError}</Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.2)}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.divider, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{unitLabel}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Random Number</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{unitLabel} Entry ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Disease Infection</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Diseases Reported</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Pesticide Used</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type of Pesticide</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Pesticide Purpose</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Control Result</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fertilizers Applied</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diseaseDetailsList.length > 0 ? (
                      diseaseDetailsList.map((item, idx) => (
                        <TableRow key={item.cceDataEntryPerTreeId || idx} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${unitLabel} ${idx + 1}`}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Chip
                              label={`#${item.randomNo ?? 'N/A'}`}
                              size="small"
                              variant="outlined"
                              color="warning"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {item.cceDataEntryPerTreeId || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item.isInfectedByAnyDisease !== undefined && item.isInfectedByAnyDisease !== null ? (
                              <Chip
                                label={item.isInfectedByAnyDisease ? 'Infected' : 'Healthy'}
                                size="small"
                                color={item.isInfectedByAnyDisease ? 'error' : 'success'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {item.diseases && item.diseases.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {item.diseases.map((d, dIdx) => (
                                  <Chip
                                    key={d.diseaseId || dIdx}
                                    label={`${d.diseaseName || 'Disease'}${d.diseaseCodeDes ? ` (Code: ${d.diseaseCodeDes})` : ''}`}
                                    size="small"
                                    color="error"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              'None'
                            )}
                          </TableCell>
                          <TableCell>
                            {item.isPesticideUsed !== undefined && item.isPesticideUsed !== null ? (
                              <Chip
                                label={item.isPesticideUsed ? 'Yes' : 'No'}
                                size="small"
                                color={item.isPesticideUsed ? 'warning' : 'default'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{item.typeOfPesticide || 'N/A'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{item.pesticidePurpose || 'N/A'}</TableCell>
                          <TableCell>
                            {item.isPestControlSuccess !== undefined && item.isPestControlSuccess !== null ? (
                              <Chip
                                label={item.isPestControlSuccess ? 'Success' : 'Failed'}
                                size="small"
                                color={item.isPestControlSuccess ? 'success' : 'error'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {item.fertilizers && item.fertilizers.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {item.fertilizers.map((f, fIdx) => (
                                  <Chip
                                    key={f.fertilizerId || fIdx}
                                    label={`${f.fertilizerName || 'Fertilizer'}${f.quantityUsedKg !== undefined && f.quantityUsedKg !== null ? `: ${f.quantityUsedKg} kg` : ''}`}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              'None'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          No disease or pest control details recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

      </Paper>
    </Box>
  );
};

export default CceDataView;