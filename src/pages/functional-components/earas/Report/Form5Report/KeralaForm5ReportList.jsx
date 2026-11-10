import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import GrassIcon from '@mui/icons-material/Grass';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PendingIcon from '@mui/icons-material/Pending';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import CancelIcon from '@mui/icons-material/Cancel';

import api from 'api/api';
import mainapi from 'api/mainapi';
import AuthService from 'pages/authentication/services/authservice';
import Breadcrumb from 'routes/Breadcrumb';

const BASE_URL = mainapi.FORM_API;

function buildAgriMonthOptions() {
  const agriYear =
    (AuthService && AuthService.agriyear ? AuthService.agriyear() : null) ||
    localStorage.getItem('activeAgriYear') ||
    '2025-2026';

  const startYear =
    parseInt(String(agriYear).split('-')[0], 10) ||
    new Date().getFullYear();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  return Array.from({ length: 12 }, (_, index) => {
    const monthIndex = (6 + index) % 12;
    const year =
      startYear + Math.floor((6 + index) / 12);

    return {
      label: `${monthNames[monthIndex]} ${year}`,
      value: `${String(monthIndex + 1).padStart(2, '0')}-${year}`
    };
  });
}

function monthNum(value) {
  if (!value) return null;

  const stringValue = String(value).trim();

  if (stringValue.includes('-')) {
    const [first, second] = stringValue.split('-');

    if (first?.length === 4) {
      return parseInt(second, 10);
    }

    return parseInt(first, 10);
  }

  const number = parseInt(stringValue, 10);
  return Number.isNaN(number) ? null : number;
}

function getCurrentMonthValue(monthOptions) {
  if (!monthOptions?.length) return '';

  const now = new Date();
  const currentValue =
    `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

  return (
    monthOptions.find(
      (option) => option.value === currentValue
    )?.value ||
    monthOptions.find(
      (option) =>
        monthNum(option.value) ===
        now.getMonth() + 1
    )?.value ||
    monthOptions[
      monthOptions.length - 1
    ]?.value ||
    monthOptions[0]?.value ||
    ''
  );
}

function normalizeDistrictName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/district/gi, '')
    .replace(/[^a-z0-9]/gi, '');
}

function getFallbackDistricts() {
  return [
    { id: 1, districtName: 'Thiruvananthapuram' },
    { id: 2, districtName: 'Kollam' },
    { id: 3, districtName: 'Pathanamthitta' },
    { id: 4, districtName: 'Alappuzha' },
    { id: 5, districtName: 'Kottayam' },
    { id: 6, districtName: 'Idukki' },
    { id: 7, districtName: 'Ernakulam' },
    { id: 8, districtName: 'Thrissur' },
    { id: 9, districtName: 'Palakkad' },
    { id: 10, districtName: 'Malappuram' },
    { id: 11, districtName: 'Kozhikode' },
    { id: 12, districtName: 'Wayanad' },
    { id: 13, districtName: 'Kannur' },
    { id: 14, districtName: 'Kasaragod' }
  ];
}

function MetricText({
  value,
  noData = false,
  color = 'text.primary',
  strong = false
}) {
  if (noData) {
    return (
      <Typography
        component="span"
        variant="body2"
        color="text.disabled"
      >
        —
      </Typography>
    );
  }

  const numericValue = Number(value || 0);

  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        color:
          numericValue > 0
            ? color
            : 'text.secondary',
        fontWeight:
          strong
            ? 700
            : numericValue > 0
              ? 600
              : 400,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap'
      }}
    >
      {numericValue.toLocaleString()}
    </Typography>
  );
}

function StatCard({ label, value, color, icon, badge, tooltip }) {
  const content = (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.13)}`,
        bgcolor: alpha(color, 0.03),
        transition: 'all 0.18s ease-in-out',
        '&:hover': {
          bgcolor: alpha(color, 0.06),
          borderColor: alpha(color, 0.3),
          transform: 'translateY(-1px)',
          boxShadow: `0 2px 8px ${alpha(color, 0.08)}`
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.1, sm: 1.25 }, '&:last-child': { pb: { xs: 1.1, sm: 1.25 } } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5} sx={{ mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.675rem',
              letterSpacing: '0.35px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {label}
          </Typography>

          <Box
            sx={{
              color,
              display: 'flex',
              alignItems: 'center',
              opacity: 0.85,
              flexShrink: 0
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography
            variant="h5"
            sx={{
              color: color || 'text.primary',
              fontWeight: 750,
              lineHeight: 1.15,
              fontSize: { xs: '1.2rem', sm: '1.35rem' },
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {Number(value || 0).toLocaleString()}
          </Typography>

          {badge && (
            <Box
              component="span"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 750,
                color: color || 'success.dark',
                bgcolor: alpha(color || '#2e7d32', 0.12),
                px: 0.6,
                py: 0.1,
                borderRadius: 1,
                lineHeight: 1.2
              }}
            >
              {badge}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return tooltip ? (
    <Tooltip title={tooltip} arrow placement="top" enterDelay={250}>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

function FilterLabel({ children }) {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{
        display: 'block',
        mb: 0.75,
        fontWeight: 600
      }}
    >
      {children}
    </Typography>
  );
}

function MobileMetric({
  label,
  children
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Box sx={{ mt: 0.2 }}>
        {children}
      </Box>
    </Box>
  );
}

function KeralaForm5ReportList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile =
    useMediaQuery(
      theme.breakpoints.down('md')
    );

  const latestRequestRef =
    useRef(0);

  const agriculturalYear =
    AuthService.agriyear() ||
    '2025-2026';

  const monthOptions =
    useMemo(
      () => buildAgriMonthOptions(),
      []
    );

  const defaultFromMonth =
    monthOptions[0]?.value || '';

  const defaultToMonth =
    getCurrentMonthValue(monthOptions);

  const defaultSingleMonth =
    defaultToMonth;

  const monthLabel =
    useCallback(
      (value) =>
        monthOptions.find(
          (month) =>
            month.value === value
        )?.label ||
        value ||
        '',
      [monthOptions]
    );

  const [apiData, setApiData] =
    useState(null);

  const [
    lastMonthApiData,
    setLastMonthApiData
  ] = useState(null);

  const [
    districtsList,
    setDistrictsList
  ] = useState([]);

  const [cropName, setCropName] =
    useState('ALL');

  const [
    cropOptions,
    setCropOptions
  ] = useState([]);

  const [
    filterType,
    setFilterType
  ] = useState('range');

  const [fromMonth, setFromMonth] =
    useState(defaultFromMonth);

  const [toMonth, setToMonth] =
    useState(defaultToMonth);

  const [
    singleMonth,
    setSingleMonth
  ] = useState(defaultSingleMonth);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [
    masterDistrictsLoading,
    setMasterDistrictsLoading
  ] = useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [error, setError] =
    useState(null);

  const fromMonthIndex =
    useMemo(
      () =>
        monthOptions.findIndex(
          (option) =>
            option.value === fromMonth
        ),
      [fromMonth, monthOptions]
    );

  const selectedCrop =
    useMemo(() => {
      if (cropName === 'ALL') {
        return null;
      }

      return cropOptions.find(
        (crop) =>
          crop.cropName === cropName
      ) || null;
    }, [cropName, cropOptions]);

  const normalizeDistrictResponse =
    useCallback((response) => {
      const data = response?.data;

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (
        Array.isArray(
          data?.districts
        )
      ) {
        return data.districts;
      }

      if (
        Array.isArray(
          data?.content
        )
      ) {
        return data.content;
      }

      return [];
    }, []);

  const fetchMasterDistricts =
    useCallback(async () => {
      setMasterDistrictsLoading(true);

      const endpoints = [
        `${BASE_URL}/earas-form1-entry/api/districts`,
        `${mainapi.BTR_API}/btr-service/btr-api/districts`,
        '/api/districts'
      ];

      try {
        let districts = [];

        for (const endpoint of endpoints) {
          try {
            const response =
              await api.get(endpoint);

            districts =
              normalizeDistrictResponse(
                response
              );

            if (districts.length > 0) {
              break;
            }
          } catch (endpointError) {
            // Continue to the next known endpoint.
          }
        }

        setDistrictsList(
          districts.length > 0
            ? districts
            : getFallbackDistricts()
        );
      } catch (fetchError) {
        console.error(
          'Error fetching districts:',
          fetchError
        );

        setDistrictsList(
          getFallbackDistricts()
        );
      } finally {
        setMasterDistrictsLoading(false);
      }
    }, [normalizeDistrictResponse]);

  const fetchCropsList =
    useCallback(async () => {
      try {
        const response =
          await api.get(
            `${BASE_URL}/earas-form1-entry/cce-crop-details/fetch-all-cce-logs?agriYear=${agriculturalYear}`
          );

        const source =
          Array.isArray(response?.data)
            ? response.data
            : [];

        const uniqueById =
          new Map();

        source.forEach((crop) => {
          const key =
            crop.cropId ??
            crop.cropName;

          if (
            key !== null &&
            key !== undefined
          ) {
            uniqueById.set(
              String(key),
              crop
            );
          }
        });

        setCropOptions(
          Array.from(
            uniqueById.values()
          ).sort((a, b) =>
            String(
              a.cropName || ''
            ).localeCompare(
              String(
                b.cropName || ''
              )
            )
          )
        );
      } catch (fetchError) {
        console.error(
          'Error fetching crops list:',
          fetchError
        );

        setCropOptions([]);
      }
    }, [agriculturalYear]);

  const fetchDashboardData =
    useCallback(async () => {
      const requestId =
        latestRequestRef.current + 1;

      latestRequestRef.current =
        requestId;

      setLoading(true);
      setError(null);

      try {
        const token =
          AuthService.gettoken
            ? AuthService.gettoken()
            : localStorage.getItem(
              'token'
            );

        if (!token) {
          throw new Error(
            'Authorization token missing'
          );
        }

        const params =
          new URLSearchParams({
            agriYear:
              agriculturalYear
          });

        if (
          filterType === 'single'
        ) {
          const month =
            monthNum(singleMonth) ||
            monthNum(
              defaultSingleMonth
            );

          params.append(
            'startMonth',
            String(month)
          );

          params.append(
            'endMonth',
            String(month)
          );
        } else {
          const start =
            monthNum(fromMonth) ||
            monthNum(
              defaultFromMonth
            );

          const end =
            monthNum(toMonth) ||
            monthNum(defaultToMonth);

          params.append(
            'startMonth',
            String(start)
          );

          if (end) {
            params.append(
              'endMonth',
              String(end)
            );
          }
        }

        if (selectedCrop?.cropId) {
          params.append(
            'cropId',
            String(
              selectedCrop.cropId
            )
          );
        }

        const mainUrl =
          `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${params.toString()}`;

        const mainRequest =
          api.get(mainUrl);

        const lastMonthRequest =
          (async () => {
            if (
              filterType !== 'range'
            ) {
              return null;
            }

            const lastMonth =
              monthNum(toMonth) ||
              monthNum(fromMonth) ||
              monthNum(
                defaultToMonth
              );

            if (!lastMonth) {
              return null;
            }

            const lastParams =
              new URLSearchParams({
                agriYear:
                  agriculturalYear,
                startMonth:
                  String(lastMonth),
                endMonth:
                  String(lastMonth)
              });

            if (
              selectedCrop?.cropId
            ) {
              lastParams.append(
                'cropId',
                String(
                  selectedCrop.cropId
                )
              );
            }

            try {
              const response =
                await api.get(
                  `${BASE_URL}/earas-form1-entry/api/progress-report/cce-summary?${lastParams.toString()}`
                );

              return (
                response?.data || null
              );
            } catch (lastError) {
              console.error(
                'Error fetching end-month CCE data:',
                lastError
              );

              return null;
            }
          })();

        const [
          response,
          lastMonthData
        ] = await Promise.all([
          mainRequest,
          lastMonthRequest
        ]);

        if (
          requestId !==
          latestRequestRef.current
        ) {
          return;
        }

        setApiData(
          response?.data || null
        );

        setLastMonthApiData(
          lastMonthData
        );

        if (
          cropName === 'ALL' &&
          Array.isArray(
            response?.data?.cropList
          ) &&
          response.data.cropList.length > 0
        ) {
          setCropOptions(
            response.data.cropList
          );
        }
      } catch (fetchError) {
        if (
          requestId !==
          latestRequestRef.current
        ) {
          return;
        }

        console.error(
          'Error fetching CCE dashboard:',
          fetchError
        );

        if (
          fetchError.response?.status ===
          401
        ) {
          setError(
            'Session expired. Please login again.'
          );
        } else if (
          fetchError.response?.status ===
          403
        ) {
          setError(
            "You don't have permission to access this data."
          );
        } else if (
          fetchError.response?.status ===
          400
        ) {
          setError(
            fetchError.response?.data
              ?.message ||
            'Invalid request. Please check your filters.'
          );
        } else {
          setError(
            fetchError.response?.data
              ?.message ||
            fetchError.message ||
            'Failed to fetch data'
          );
        }
      } finally {
        if (
          requestId ===
          latestRequestRef.current
        ) {
          setLoading(false);
        }
      }
    }, [
      agriculturalYear,
      cropName,
      defaultFromMonth,
      defaultSingleMonth,
      defaultToMonth,
      filterType,
      fromMonth,
      selectedCrop,
      singleMonth,
      toMonth
    ]);

  useEffect(() => {
    fetchMasterDistricts();
    fetchCropsList();
  }, [
    fetchCropsList,
    fetchMasterDistricts
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const districtData =
    useMemo(() => {
      const apiDistricts =
        apiData?.districts || [];

      const lastDistricts =
        filterType === 'range'
          ? lastMonthApiData?.districts ||
          []
          : [];

      const createLookup =
        (source) => {
          const byId = {};
          const byName = {};

          source.forEach((district) => {
            if (
              district?.districtId !==
              undefined &&
              district?.districtId !==
              null
            ) {
              byId[
                String(
                  district.districtId
                )
              ] = district;
            }

            const normalizedName =
              normalizeDistrictName(
                district?.districtName
              );

            if (normalizedName) {
              byName[
                normalizedName
              ] = district;
            }
          });

          return {
            byId,
            byName
          };
        };

      const apiLookup =
        createLookup(apiDistricts);

      const lastLookup =
        createLookup(lastDistricts);

      const resolveDistrict =
        (
          lookup,
          districtId,
          districtName
        ) => {
          if (
            districtId !==
            undefined &&
            districtId !== null &&
            lookup.byId[
            String(districtId)
            ]
          ) {
            return lookup.byId[
              String(districtId)
            ];
          }

          return (
            lookup.byName[
            normalizeDistrictName(
              districtName
            )
            ] || null
          );
        };

      const buildRow =
        (
          districtId,
          districtName,
          details
        ) => {
          const lastDetails =
            resolveDistrict(
              lastLookup,
              districtId,
              districtName
            );

          const currentMonthCompleted =
            Number(
              lastDetails?.completed ||
              0
            );

          const allowed =
            Number(
              details?.allowedCCECrops ||
              0
            );

          const selected =
            Number(
              details?.selectedCce ||
              0
            );

          const completed =
            Number(
              details?.completed ||
              0
            );

          const ongoing =
            Number(
              details?.ongoing || 0
            );

          const missed =
            Number(
              details?.missedCce ??
              details?.missed ??
              details?.missedCCE ??
              0
            );

          const notAvailable =
            Number(
              details?.notAvailable ||
              0
            );

          const notStarted =
            Number(
              details?.notStarted ||
              0
            );

          const underReview =
            Number(
              details?.underReview ||
              0
            );

          const hasData =
            allowed > 0 ||
            selected > 0 ||
            completed > 0 ||
            currentMonthCompleted > 0 ||
            ongoing > 0 ||
            missed > 0 ||
            notAvailable > 0 ||
            notStarted > 0 ||
            underReview > 0;

          return {
            id:
              districtId ??
              details?.districtId ??
              normalizeDistrictName(
                districtName
              ) ??
              districtName,
            district:
              districtName ||
              details?.districtName ||
              'Unknown District',
            allowedCce: allowed,
            selectedCce: selected,
            currentMonthCompleted,
            completed,
            ongoing,
            missedCce: missed,
            notAvailable,
            notStarted,
            underReview,
            hasData
          };
        };

      if (
        Array.isArray(
          districtsList
        ) &&
        districtsList.length > 0
      ) {
        return districtsList.map(
          (district) => {
            const districtId =
              district.id ??
              district.districtId ??
              district.distId;

            const districtName =
              district.districtName ||
              district.name ||
              district.distNameEn ||
              '';

            const details =
              resolveDistrict(
                apiLookup,
                districtId,
                districtName
              ) || {};

            return buildRow(
              districtId,
              districtName,
              details
            );
          }
        );
      }

      return apiDistricts.map(
        (district) =>
          buildRow(
            district.districtId,
            district.districtName,
            district
          )
      );
    }, [
      apiData,
      districtsList,
      filterType,
      lastMonthApiData
    ]);

  const stats =
    useMemo(() => {
      const sums =
        districtData.reduce(
          (accumulator, district) => {
            accumulator.allowedCce +=
              district.allowedCce || 0;

            accumulator.selectedCce +=
              district.selectedCce || 0;

            accumulator.currentMonthCompleted +=
              district.currentMonthCompleted ||
              0;

            accumulator.completed +=
              district.completed || 0;

            accumulator.ongoing +=
              district.ongoing || 0;

            accumulator.missedCce +=
              district.missedCce || 0;

            accumulator.notAvailable +=
              district.notAvailable ||
              0;

            accumulator.notStarted +=
              district.notStarted || 0;

            accumulator.underReview +=
              district.underReview || 0;

            return accumulator;
          },
          {
            allowedCce: 0,
            selectedCce: 0,
            currentMonthCompleted: 0,
            completed: 0,
            ongoing: 0,
            missedCce: 0,
            notAvailable: 0,
            notStarted: 0,
            underReview: 0
          }
        );

      return {
        allowedCce:
          sums.allowedCce > 0
            ? sums.allowedCce
            : Number(
              apiData?.allowedCCECrops ||
              0
            ),

        selectedCce:
          sums.selectedCce > 0
            ? sums.selectedCce
            : Number(
              apiData?.selectedCce ||
              0
            ),

        currentMonthCompleted:
          sums.currentMonthCompleted,

        completed:
          sums.completed,

        ongoing:
          sums.ongoing,

        missedCce:
          sums.missedCce > 0
            ? sums.missedCce
            : Number(
              apiData?.missedCce ??
              apiData?.missed ??
              apiData?.missedCCE ??
              0
            ),

        notAvailable:
          sums.notAvailable,

        notStarted:
          sums.notStarted,

        underReview:
          sums.underReview
      };
    }, [apiData, districtData]);

  const districtsWithoutData =
    useMemo(
      () =>
        districtData.filter(
          (district) =>
            !district.hasData
        ).length,
      [districtData]
    );

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return districtData;
    const term = searchTerm.toLowerCase();
    return districtData.filter((row) =>
      row.district?.toLowerCase().includes(term)
    );
  }, [districtData, searchTerm]);

  const handleFromMonthChange =
    (event) => {
      const nextFromMonth =
        event.target.value;

      setFromMonth(
        nextFromMonth
      );

      const nextIndex =
        monthOptions.findIndex(
          (option) =>
            option.value ===
            nextFromMonth
        );

      const currentToIndex =
        monthOptions.findIndex(
          (option) =>
            option.value === toMonth
        );

      if (
        nextIndex >= 0 &&
        (
          currentToIndex < 0 ||
          nextIndex >
          currentToIndex
        )
      ) {
        setToMonth(
          nextFromMonth
        );
      }
    };

  const resetFilters = () => {
    setCropName('ALL');
    setFilterType('range');
    setFromMonth(
      defaultFromMonth
    );
    setToMonth(
      defaultToMonth
    );
    setSingleMonth(
      defaultSingleMonth
    );
    setSearchTerm('');
  };

  const filtersAreDirty =
    cropName !== 'ALL' ||
    filterType !== 'range' ||
    fromMonth !==
    defaultFromMonth ||
    toMonth !==
    defaultToMonth ||
    singleMonth !==
    defaultSingleMonth ||
    Boolean(searchTerm);

  const reportPeriodText =
    filterType === 'single'
      ? monthLabel(singleMonth)
      : `${monthLabel(fromMonth)} – ${monthLabel(toMonth)}`;

  const endMonthText =
    monthLabel(
      filterType === 'single'
        ? singleMonth
        : toMonth
    );

  const handleViewDetails =
    (
      districtName,
      hasData
    ) => {
      if (!hasData) return;

      const district =
        districtData.find(
          (row) =>
            row.district ===
            districtName
        );

      if (!district) return;

      navigate(
        `/kerala_form5_report/taluk_form5_report/${district.id}`,
        {
          state: {
            districtId:
              district.id,
            districtName,
            cropName:
              cropName !== 'ALL'
                ? cropName
                : null,
            agriculturalYear,
            filterType,
            singleMonth,
            fromMonth,
            toMonth,
            startMonth:
              filterType ===
                'single'
                ? singleMonth
                : fromMonth,
            endMonth:
              filterType ===
                'single'
                ? singleMonth
                : toMonth
          }
        }
      );
    };

  const exportExcel =
    async () => {
      const dataToExport = filteredData.length ? filteredData : districtData;
      if (
        !dataToExport.length ||
        exporting
      ) {
        return;
      }

      setExporting(true);

      try {
        const XLSX =
          await import('xlsx');

        const rows =
          dataToExport.map(
            (row, index) => {
              const result = {
                '#': index + 1,
                District:
                  row.district,
                'Allotted CCE':
                  row.hasData
                    ? row.allowedCce
                    : 'NA',
                'Selected CCE':
                  row.hasData
                    ? row.selectedCce
                    : 'NA'
              };

              if (
                filterType ===
                'range'
              ) {
                result[
                  `During the Month ${endMonthText}`
                ] =
                  row.hasData
                    ? row.currentMonthCompleted
                    : 'NA';

                result[
                  `Up to the Month ${endMonthText}`
                ] =
                  row.hasData
                    ? row.completed
                    : 'NA';
              } else {
                result[
                  `During the Month ${endMonthText}`
                ] =
                  row.hasData
                    ? row.completed
                    : 'NA';
              }

              result.Ongoing =
                row.hasData
                  ? row.ongoing
                  : 'NA';

              result['Missed CCE'] =
                row.hasData
                  ? row.missedCce
                  : 'NA';

              result[
                'Not Available'
              ] =
                row.hasData
                  ? row.notAvailable
                  : 'NA';

              result['Not Started'] =
                row.hasData
                  ? row.notStarted
                  : 'NA';

              result[
                'Under Review'
              ] =
                row.hasData
                  ? row.underReview
                  : 'NA';

              return result;
            }
          );

        const worksheet =
          XLSX.utils.json_to_sheet(
            rows
          );

        worksheet['!cols'] = [
          { wch: 5 },
          { wch: 24 },
          { wch: 14 },
          { wch: 14 },
          { wch: 20 },
          { wch: 22 },
          { wch: 12 },
          { wch: 14 },
          { wch: 16 },
          { wch: 14 },
          { wch: 16 }
        ];

        const workbook =
          XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          'District Report'
        );

        const parts = [
          'CCE_District_Report',
          cropName !== 'ALL'
            ? cropName
            : null,
          filterType === 'single'
            ? monthLabel(
              singleMonth
            )
            : `${monthLabel(
              fromMonth
            )}_to_${monthLabel(
              toMonth
            )}`,
          new Date()
            .toISOString()
            .slice(0, 10)
        ].filter(Boolean);

        XLSX.writeFile(
          workbook,
          `${parts
            .join('_')
            .replace(
              /\s+/g,
              '_'
            )}.xlsx`
        );
      } catch (exportError) {
        console.error(
          'Excel export failed:',
          exportError
        );
      } finally {
        setExporting(false);
      }
    };

  const initialLoading =
    (
      loading ||
      masterDistrictsLoading
    ) &&
    !apiData &&
    districtsList.length === 0;

  const headerBackground =
    theme.palette.primary.dark;

  const selectedColor =
    theme.palette.primary.main;

  const completedColor =
    theme.palette.success.main;

  const currentColor =
    theme.palette.info.main;

  const reviewColor =
    theme.palette.warning.dark;

  const errorColor =
    theme.palette.error.main;

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
            alignItems="center"
            spacing={1.5}
          >
            <CircularProgress />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Loading CCE progress…
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }

  if (error && !apiData) {
    return (
      <Grid container spacing={3}>
        <Breadcrumb />

        <Grid item xs={12}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={
                  fetchDashboardData
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Breadcrumb />

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
            spacing={1.25}
            alignItems="center"
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.08
                )
              }}
            >
              <AssessmentIcon fontSize="small" />
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 750, lineHeight: 1.2 }}
              >
                CCE Progress Report
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Agricultural Year {agriculturalYear} • {reportPeriodText}
                {cropName !== 'ALL'
                  ? ` • ${cropName}`
                  : ' • All crops'}
                {loading
                  ? ' • Refreshing…'
                  : ''}
              </Typography>
            </Box>
          </Stack>

          {filtersAreDirty && (
            <Button
              variant="text"
              size="small"
              startIcon={
                <ClearIcon />
              }
              onClick={
                resetFilters
              }
              sx={{
                textTransform: 'none',
                color: 'text.secondary'
              }}
            >
              Reset filters
            </Button>
          )}
        </Stack>
      </Grid>

      {error && apiData && (
        <Grid item xs={12}>
          <Alert severity="warning">
            The latest refresh failed.
            Showing the last successfully
            loaded data. {error}
          </Alert>
        </Grid>
      )}

      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: {
              xs: 2,
              md: 2.5
            },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Filters
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Select crop and reporting period for district CCE progress.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'minmax(220px, 1fr) minmax(200px, 1fr)'
                },
                gap: 1.5,
                alignItems: 'end'
              }}
            >
              <Box>
                <FilterLabel>
                  Crop
                </FilterLabel>

                <FormControl
                  size="small"
                  fullWidth
                >
                  <InputLabel id="crop-label">
                    Crop
                  </InputLabel>

                  <Select
                    labelId="crop-label"
                    value={cropName}
                    label="Crop"
                    onChange={(event) =>
                      setCropName(
                        event.target.value
                      )
                    }
                    startAdornment={
                      <InputAdornment position="start">
                        <GrassIcon
                          fontSize="small"
                          color="success"
                        />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="ALL">
                      All crops
                    </MenuItem>

                    {cropOptions.map(
                      (crop) => (
                        <MenuItem
                          key={
                            crop.cropId ??
                            crop.cropName
                          }
                          value={
                            crop.cropName
                          }
                        >
                          {crop.cropName}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <FilterLabel>
                  Period
                </FilterLabel>

                <ToggleButtonGroup
                  value={filterType}
                  exclusive
                  fullWidth
                  size="small"
                  aria-label="Report period"
                  onChange={(_, value) => {
                    if (value) {
                      setFilterType(
                        value
                      );
                    }
                  }}
                >
                  <ToggleButton value="range">
                    <ViewWeekIcon
                      sx={{
                        mr: 0.75,
                        fontSize: 18
                      }}
                    />
                    Range
                  </ToggleButton>

                  <ToggleButton value="single">
                    <ViewModuleIcon
                      sx={{
                        mr: 0.75,
                        fontSize: 18
                      }}
                    />
                    Single Month
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Divider />

            {filterType === 'range' ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr auto 1fr'
                  },
                  gap: 1.5,
                  alignItems: 'end',
                  maxWidth: 620
                }}
              >
                <Box>
                  <FilterLabel>
                    From Month
                  </FilterLabel>

                  <FormControl
                    size="small"
                    fullWidth
                  >
                    <InputLabel>
                      From Month
                    </InputLabel>

                    <Select
                      value={
                        fromMonth
                      }
                      label="From Month"
                      onChange={
                        handleFromMonthChange
                      }
                    >
                      {monthOptions.map(
                        (option) => (
                          <MenuItem
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {option.label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>

                <Typography
                  aria-hidden="true"
                  color="text.secondary"
                  sx={{
                    pb: 1.1,
                    display: {
                      xs: 'none',
                      sm: 'block'
                    }
                  }}
                >
                  →
                </Typography>

                <Box>
                  <FilterLabel>
                    To Month
                  </FilterLabel>

                  <FormControl
                    size="small"
                    fullWidth
                  >
                    <InputLabel>
                      To Month
                    </InputLabel>

                    <Select
                      value={toMonth}
                      label="To Month"
                      onChange={(event) =>
                        setToMonth(
                          event.target.value
                        )
                      }
                    >
                      {monthOptions.map(
                        (
                          option,
                          index
                        ) => (
                          <MenuItem
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                            disabled={
                              index <
                              fromMonthIndex
                            }
                          >
                            {option.label}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  maxWidth: {
                    xs: '100%',
                    sm: 300
                  }
                }}
              >
                <FilterLabel>
                  Month
                </FilterLabel>

                <FormControl
                  size="small"
                  fullWidth
                >
                  <InputLabel>
                    Select Month
                  </InputLabel>

                  <Select
                    value={singleMonth}
                    label="Select Month"
                    onChange={(event) =>
                      setSingleMonth(
                        event.target.value
                      )
                    }
                  >
                    {monthOptions.map(
                      (option) => (
                        <MenuItem
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: 2.5,
            bgcolor: 'background.paper',
            borderColor: theme.palette.divider
          }}
        >
          {(() => {
            const safeAllowed =
              Math.max(Number(stats.allowedCce || 0), 0);
            const safeSelected =
              Math.max(Number(stats.selectedCce || 0), 0);
            const safeCompleted =
              Math.max(Number(stats.completed || 0), 0);
            const selectionRate =
              safeAllowed > 0
                ? Math.min((safeSelected / safeAllowed) * 100, 100)
                : 0;
            const completionRate =
              safeSelected > 0
                ? Math.min((safeCompleted / safeSelected) * 100, 100)
                : 0;
            const remainingSelected =
              Math.max(safeSelected - safeCompleted, 0);

            return (
              <>
                {/* Header: Title + Crop + Period & Inline Progress */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                  sx={{ mb: 1.25, px: 0.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 750, color: 'text.primary', letterSpacing: '0.2px' }}
                    >
                      State Summary
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {cropName === 'ALL' ? 'All crops' : cropName} • {reportPeriodText} • 14 districts
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: { sm: 220 } }}>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 650, color: 'text.secondary', whiteSpace: 'nowrap' }}
                    >
                      Completion: <strong style={{ color: theme.palette.success.dark }}>{completionRate.toFixed(1)}%</strong>
                      {remainingSelected > 0 ? ` (${remainingSelected.toLocaleString()} left)` : ''}
                    </Typography>
                    <Box sx={{ width: { xs: 70, sm: 90 } }}>
                      <LinearProgress
                        variant="determinate"
                        value={completionRate}
                        sx={{
                          height: 5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: 'success.main'
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </Stack>

                {/* Minimalist Grid of Metric Cards */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      sm: 'repeat(3, minmax(0, 1fr))',
                      md:
                        filterType === 'range'
                          ? 'repeat(5, minmax(0, 1fr))'
                          : 'repeat(4, minmax(0, 1fr))',
                      lg:
                        filterType === 'range'
                          ? 'repeat(9, minmax(0, 1fr))'
                          : 'repeat(8, minmax(0, 1fr))'
                    },
                    gap: 1,
                    opacity: loading ? 0.7 : 1,
                    transition: theme.transitions.create('opacity')
                  }}
                >
                  <StatCard
                    label="Allotted CCE"
                    value={stats.allowedCce}
                    color={theme.palette.primary.main}
                    icon={<AssessmentIcon sx={{ fontSize: 17 }} />}
                    tooltip="Total CCE plots allowed for survey"
                  />

                  <StatCard
                    label="Selected CCE"
                    value={stats.selectedCce}
                    badge={safeAllowed > 0 ? `${selectionRate.toFixed(1)}%` : undefined}
                    color={theme.palette.primary.main}
                    icon={<AssessmentIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE plots selected for survey"
                  />

                  {filterType === 'range' && (
                    <StatCard
                      label="During the Month"
                      value={stats.currentMonthCompleted}
                      color={theme.palette.info.main}
                      icon={<CalendarMonthIcon sx={{ fontSize: 17 }} />}
                      tooltip={`CCE completed during the month of ${endMonthText}`}
                    />
                  )}

                  <StatCard
                    label={filterType === 'range' ? 'Up to the Month' : 'Completed'}
                    value={stats.completed}
                    badge={`${completionRate.toFixed(1)}%`}
                    color={theme.palette.success.main}
                    icon={<CheckCircleIcon sx={{ fontSize: 17 }} />}
                    tooltip={
                      filterType === 'range'
                        ? `Cumulative CCE completed up to ${endMonthText}`
                        : `CCE completed during ${endMonthText}`
                    }
                  />

                  <StatCard
                    label="Ongoing"
                    value={stats.ongoing}
                    color={theme.palette.info.dark}
                    icon={<PendingIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE currently in progress"
                  />

                  <StatCard
                    label="Missed CCE"
                    value={stats.missedCce}
                    color={theme.palette.error.main}
                    icon={<EventBusyIcon sx={{ fontSize: 17 }} />}
                    tooltip="Missed CCE plots"
                  />

                  <StatCard
                    label="Not Available"
                    value={stats.notAvailable}
                    color={theme.palette.error.dark}
                    icon={<CancelIcon sx={{ fontSize: 17 }} />}
                    tooltip="Plots not available for CCE"
                  />

                  <StatCard
                    label="Not Started"
                    value={stats.notStarted}
                    color={theme.palette.text.secondary}
                    icon={<ScheduleIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE plots not yet started"
                  />

                  <StatCard
                    label="Under Review"
                    value={stats.underReview}
                    color={theme.palette.warning.dark}
                    icon={<RateReviewIcon sx={{ fontSize: 17 }} />}
                    tooltip="CCE entries under verification"
                  />
                </Box>
              </>
            );
          })()}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          {loading && (
            <LinearProgress aria-label="Refreshing district data" />
          )}

          <Box
            sx={{
              p: {
                xs: 2,
                md: 2.5
              },
              pb: 1.5
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'stretch',
                sm: 'center'
              }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  District Progress
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {filteredData.length} district{filteredData.length === 1 ? '' : 's'} shown
                  {districtsWithoutData > 0
                    ? ` • ${districtsWithoutData} without data`
                    : ''}
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                spacing={1.25}
                sx={{
                  width: {
                    xs: '100%',
                    sm: 'auto'
                  }
                }}
              >
                <TextField
                  label="Search districts"
                  placeholder="e.g. Kollam"
                  size="small"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 260
                    }
                  }}
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
                          onClick={() =>
                            setSearchTerm('')
                          }
                          edge="end"
                          aria-label="Clear district search"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />

                <Tooltip
                  title={
                    filteredData.length
                      ? `Export ${filteredData.length} district${filteredData.length === 1 ? '' : 's'
                      } to Excel`
                      : 'No data available to export'
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        exporting ? (
                          <CircularProgress
                            size={16}
                          />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                      disabled={
                        !filteredData.length ||
                        loading ||
                        exporting
                      }
                      onClick={exportExcel}
                      sx={{
                        minHeight: 40,
                        width: {
                          xs: '100%',
                          sm: 'auto'
                        },
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {exporting
                        ? 'Preparing…'
                        : 'Export Excel'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              opacity: loading ? 0.62 : 1,
              pointerEvents:
                loading
                  ? 'none'
                  : 'auto',
              transition: theme.transitions.create('opacity')
            }}
          >
            {filteredData.length === 0 ? (
              <Box sx={{ py: 8, px: 2, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  No matching districts
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Try changing the search term or report filters.
                </Typography>
              </Box>
            ) : isMobile ? (
              <Stack
                spacing={1.5}
                sx={{ p: 2 }}
              >
                {filteredData.map(
                  (row) => (
                    <Card
                      key={row.id}
                      variant="outlined"
                      sx={{
                        borderRadius: 2.5,
                        bgcolor:
                          row.hasData
                            ? 'background.paper'
                            : alpha(
                              theme.palette.warning.main,
                              0.035
                            )
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          '&:last-child': {
                            pb: 2
                          }
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <LocationOnIcon
                              fontSize="small"
                              sx={{
                                color:
                                  row.hasData
                                    ? 'primary.main'
                                    : 'warning.main'
                              }}
                            />

                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700
                              }}
                            >
                              {row.district}
                            </Typography>
                          </Stack>

                          {!row.hasData && (
                            <Chip
                              label="No Data"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap: 1.5,
                            mt: 2
                          }}
                        >
                          <MobileMetric label="Allowed">
                            <MetricText
                              value={
                                row.allowedCce
                              }
                              noData={
                                !row.hasData
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Selected">
                            <MetricText
                              value={
                                row.selectedCce
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                selectedColor
                              }
                            />
                          </MobileMetric>

                          {filterType === 'range' && (
                            <MobileMetric
                              label={`During Month (${endMonthText})`}
                            >
                              <MetricText
                                value={
                                  row.currentMonthCompleted
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  currentColor
                                }
                              />
                            </MobileMetric>
                          )}

                          <MobileMetric
                            label={
                              filterType === 'range'
                                ? `Up to Month (${endMonthText})`
                                : `During Month (${endMonthText})`
                            }
                          >
                            <MetricText
                              value={
                                row.completed
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                completedColor
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Ongoing">
                            <MetricText
                              value={
                                row.ongoing
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                currentColor
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Missed CCE">
                            <MetricText
                              value={
                                row.missedCce
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                errorColor
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Not Available">
                            <MetricText
                              value={
                                row.notAvailable
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                errorColor
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Not Started">
                            <MetricText
                              value={
                                row.notStarted
                              }
                              noData={
                                !row.hasData
                              }
                            />
                          </MobileMetric>

                          <MobileMetric label="Under Review">
                            <MetricText
                              value={
                                row.underReview
                              }
                              noData={
                                !row.hasData
                              }
                              color={
                                reviewColor
                              }
                            />
                          </MobileMetric>
                        </Box>

                        <Button
                          fullWidth
                          size="small"
                          variant="text"
                          startIcon={
                            row.hasData
                              ? (
                                <VisibilityIcon />
                              )
                              : (
                                <VisibilityOffIcon />
                              )
                          }
                          disabled={
                            !row.hasData
                          }
                          onClick={() =>
                            handleViewDetails(
                              row.district,
                              row.hasData
                            )
                          }
                          sx={{ mt: 1.5 }}
                        >
                          {row.hasData
                            ? 'View district details'
                            : 'Details unavailable'}
                        </Button>
                      </CardContent>
                    </Card>
                  )
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
                  aria-label="District CCE progress"
                  sx={{
                    minWidth:
                      filterType === 'range'
                        ? 1160
                        : 1020,
                    '& .MuiTableCell-root': {
                      borderBottom:
                        `1px solid ${theme.palette.divider}`
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          width: 56,
                          minWidth: 56,
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700,
                          position: 'sticky',
                          left: 0,
                          top: 0,
                          zIndex: 7
                        }}
                      >
                        #
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        sx={{
                          minWidth: 200,
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700,
                          position: 'sticky',
                          left: 56,
                          top: 0,
                          zIndex: 7,
                          boxShadow:
                            `2px 0 0 ${alpha(
                              theme.palette.common.white,
                              0.12
                            )}`
                        }}
                      >
                        District
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Allowed
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Selected
                      </TableCell>

                      {filterType === 'range' && (
                        <TableCell
                          rowSpan={2}
                          align="center"
                          sx={{
                            color:
                              'primary.contrastText',
                            bgcolor:
                              headerBackground,
                            fontWeight: 700
                          }}
                        >
                          During the Month
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              color: 'inherit',
                              opacity: 0.82
                            }}
                          >
                            {endMonthText}
                          </Typography>
                        </TableCell>
                      )}

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        {filterType === 'range'
                          ? 'Up to the Month'
                          : 'Completed In'}
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{
                            color: 'inherit',
                            opacity: 0.82
                          }}
                        >
                          {endMonthText}
                        </Typography>
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Ongoing
                      </TableCell>

                      <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700,
                          borderBottom:
                            `1px solid ${alpha(
                              theme.palette.common.white,
                              0.18
                            )}`
                        }}
                      >
                        Exceptions
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Not Started
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Review
                      </TableCell>

                      <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 700
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{
                          top: 41,
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 600,
                          fontSize:
                            '0.75rem'
                        }}
                      >
                        Missed
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          top: 41,
                          color:
                            'primary.contrastText',
                          bgcolor:
                            headerBackground,
                          fontWeight: 600,
                          fontSize:
                            '0.75rem'
                        }}
                      >
                        Unavailable
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredData.map(
                      (row, index) => {
                        const rowBackground =
                          row.hasData
                            ? theme.palette.background.paper
                            : alpha(
                              theme.palette.warning.main,
                              0.035
                            );

                        return (
                          <TableRow
                            key={row.id}
                            hover
                            sx={{
                              bgcolor:
                                rowBackground,
                              '&:hover': {
                                bgcolor:
                                  row.hasData
                                    ? alpha(
                                      theme.palette.primary.main,
                                      0.035
                                    )
                                    : alpha(
                                      theme.palette.warning.main,
                                      0.075
                                    )
                              }
                            }}
                          >
                            <TableCell
                              align="center"
                              sx={{
                                position:
                                  'sticky',
                                left: 0,
                                zIndex: 3,
                                bgcolor:
                                  'inherit',
                                width: 56,
                                minWidth: 56
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {index + 1}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                position:
                                  'sticky',
                                left: 56,
                                zIndex: 3,
                                bgcolor:
                                  'inherit',
                                minWidth: 200,
                                boxShadow:
                                  `2px 0 0 ${theme.palette.divider}`
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.8}
                                alignItems="center"
                              >
                                <LocationOnIcon
                                  sx={{
                                    fontSize: 17,
                                    color:
                                      row.hasData
                                        ? 'primary.main'
                                        : 'warning.main',
                                    opacity: 0.85
                                  }}
                                />

                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      row.hasData
                                        ? 600
                                        : 500,
                                    whiteSpace:
                                      'nowrap'
                                  }}
                                >
                                  {row.district}
                                </Typography>

                                {!row.hasData && (
                                  <Chip
                                    label="No Data"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                    sx={{
                                      height: 20,
                                      fontSize:
                                        '0.65rem'
                                    }}
                                  />
                                )}
                              </Stack>
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.allowedCce
                                }
                                noData={
                                  !row.hasData
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.selectedCce
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  selectedColor
                                }
                              />
                            </TableCell>

                            {filterType === 'range' && (
                              <TableCell align="center">
                                <MetricText
                                  value={
                                    row.currentMonthCompleted
                                  }
                                  noData={
                                    !row.hasData
                                  }
                                  color={
                                    currentColor
                                  }
                                />
                              </TableCell>
                            )}

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.completed
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  completedColor
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.ongoing
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  currentColor
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.missedCce
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  errorColor
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.notAvailable
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  errorColor
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.notStarted
                                }
                                noData={
                                  !row.hasData
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <MetricText
                                value={
                                  row.underReview
                                }
                                noData={
                                  !row.hasData
                                }
                                color={
                                  reviewColor
                                }
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Tooltip
                                title={
                                  row.hasData
                                    ? `View ${row.district} details`
                                    : 'No data available for this district'
                                }
                              >
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={
                                      !row.hasData
                                    }
                                    onClick={() =>
                                      handleViewDetails(
                                        row.district,
                                        row.hasData
                                      )
                                    }
                                    aria-label={
                                      row.hasData
                                        ? `View details for ${row.district}`
                                        : `Details unavailable for ${row.district}`
                                    }
                                    sx={{
                                      color:
                                        'primary.main',
                                      '&:hover': {
                                        bgcolor: (t) =>
                                          alpha(t.palette.primary.main, 0.08)
                                      }
                                    }}
                                  >
                                    {row.hasData
                                      ? (
                                        <VisibilityIcon fontSize="small" />
                                      )
                                      : (
                                        <VisibilityOffIcon fontSize="small" />
                                      )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default KeralaForm5ReportList;
