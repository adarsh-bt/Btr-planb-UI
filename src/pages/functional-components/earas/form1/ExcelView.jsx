// ExcelView.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from 'api/api';
import mainapi from 'api/mainapi';
import { useReactToPrint } from 'react-to-print';
import logo from '../../../../assets/images/logo/des-print-logo.png';

// Define all possible cluster labels
const ALL_CLUSTER_LABELS = ['K', 'S1', 'S2', 'S3', 'S4', 'E1', 'E2', 'E3', 'E4', 'N1', 'N2', 'N3', 'N4', 'W1', 'W2', 'W3', 'W4'];
const DESIRED_CLUSTER_ORDER = ['K', 'S1', 'E1', 'N1', 'W1', 'N2', 'W2', 'S2', 'E2', 'N3', 'W3', 'S3', 'E3', 'N4', 'W4', 'S4', 'E4'];
// Styled components for Excel-like appearance
const ExcelTableContainer = styled(TableContainer)({
  border: '2px solid #000',
  '& .MuiTableCell-root': {
    border: '1px solid #000',
    padding: '4px 4px',
    fontSize: '9px',
    lineHeight: '1.2',
  },
  '@media print': {
    maxHeight: 'none !important',
    overflow: 'visible !important',
    border: '2px solid #000 !important',
  },
});

const HeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#f0f0f0',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  borderBottom: '2px solid #000 !important',
  padding: '4px 4px',
  fontSize: '9px',
  '@media print': {
    backgroundColor: '#f0f0f0 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const DataCell = styled(TableCell)({
  textAlign: 'center',
  padding: '3px 4px',
  fontSize: '9px',
});

const TotalCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#e8f0fe',
  textAlign: 'center',
  padding: '3px 4px',
  fontSize: '9px',
  '@media print': {
    backgroundColor: '#e8f0fe !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const SectionHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  textAlign: 'left',
  paddingLeft: '12px !important',
  fontSize: '10px',
  padding: '6px 4px',
  '@media print': {
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const CropNameCell = styled(TableCell)({
  textAlign: 'left',
  paddingLeft: '8px',
  padding: '3px 4px',
  fontSize: '9px',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  minWidth: '120px',
  maxWidth: '200px',
});

const NucCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#FFF2CC !important',
  padding: '3px 4px',
  fontSize: '9px',
  '@media print': {
    backgroundColor: '#FFF2CC !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const FfsCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#E2F0D9 !important',
  padding: '3px 4px',
  fontSize: '9px',
  '@media print': {
    backgroundColor: '#E2F0D9 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const CosCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#DDEBF7 !important',
  padding: '3px 4px',
  fontSize: '9px',
  '@media print': {
    backgroundColor: '#DDEBF7 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const PrintContainer = styled(Box)({
  '@media print': {
    padding: '5px',
    backgroundColor: '#ffffff',
  },
});

const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    return Object.values(data);
  }
  return [];
};

const sortCropsAlphabetically = (crops) => {
  if (!crops || crops.length === 0) return [];
  return [...crops].sort((a, b) => {
    const nameA = (a.malayalamName || a.cropName || '').toLowerCase();
    const nameB = (b.malayalamName || b.cropName || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

// Define the desired cluster order
const getActiveClusters = (data) => {
  if (!data) return [];

  // 1. If backend provides clusterLabels, use that order
  if (data.clusterLabels && Array.isArray(data.clusterLabels) && data.clusterLabels.length > 0) {
    // Only return clusters that actually have data
    const clustersWithData = data.clusterLabels.filter(cluster => {
      let hasData = false;

      // Check landUtilization
      if (data.landUtilization) {
        const landArray = toArray(data.landUtilization);
        for (const item of landArray) {
          if (item[cluster.toLowerCase()] && item[cluster.toLowerCase()] !== 0) {
            hasData = true;
            break;
          }
        }
      }

      // Check crop sections
      if (!hasData) {
        const cropSections = [data.virippu, data.mundakan, data.puncha, data.annualCrops, data.perennialCrops];
        for (const section of cropSections) {
          if (!section) continue;
          const crops = section.crops || (Array.isArray(section) ? section : []);
          for (const crop of toArray(crops)) {
            const iKey = `${cluster.toLowerCase()}I`;
            const uiKey = `${cluster.toLowerCase()}UI`;
            if ((crop[iKey] && crop[iKey] !== 0) || (crop[uiKey] && crop[uiKey] !== 0)) {
              hasData = true;
              break;
            }
          }
          if (hasData) break;
        }
      }

      return hasData;
    });

    if (clustersWithData.length > 0) {
      return clustersWithData;
    }
  }

  // 2. Fallback: detect from ALL_CLUSTER_LABELS
  const clusters = new Set();

  if (data.landUtilization) {
    const landArray = toArray(data.landUtilization);
    landArray.forEach(item => {
      ALL_CLUSTER_LABELS.forEach(cluster => {
        const val = item[cluster.toLowerCase()];
        if (val && val !== 0) {
          clusters.add(cluster);
        }
      });
    });
  }

  const cropSections = [data.virippu, data.mundakan, data.puncha, data.annualCrops, data.perennialCrops];
  cropSections.forEach(section => {
    if (!section) return;
    const crops = section.crops || (Array.isArray(section) ? section : []);
    toArray(crops).forEach(crop => {
      ALL_CLUSTER_LABELS.forEach(cluster => {
        const iKey = `${cluster.toLowerCase()}I`;
        const uiKey = `${cluster.toLowerCase()}UI`;
        if ((crop[iKey] && crop[iKey] !== 0) || (crop[uiKey] && crop[uiKey] !== 0)) {
          clusters.add(cluster);
        }
      });
    });
  });

  if (!clusters.has('K') && data.landUtilization) {
    const landArray = toArray(data.landUtilization);
    landArray.forEach(item => {
      if (item.k !== undefined) {
        clusters.add('K');
      }
    });
  }

  return ALL_CLUSTER_LABELS.filter(cluster => clusters.has(cluster));
};

// Print styles with fixed page-break configurations
const PrintStyle = () => (
  <style>
    {`
      @media print {
        .no-print { 
          display: none !important; 
        }
        .MuiDialog-paper {
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .MuiDialogContent-root {
          overflow: visible !important;
          max-height: none !important;
          padding: 5px !important;
        }
        .MuiPaper-root {
          box-shadow: none !important;
          border: none !important;
        }
        table {
          page-break-inside: auto !important; /* ALLOW TABLE TO START ON PAGE 1 */
          border-collapse: collapse !important;
          width: 100% !important;
        }
        tr {
          page-break-inside: avoid !important; /* PREVENT INDIVIDUAL ROWS FROM SPLITTING */
        }
        thead {
          display: table-header-group !important; /* REPEAT HEADERS ON EVERY NEW PAGE */
        }
        .print-container {
          padding: 5px;
        }
        .MuiTableCell-root {
          border: 1px solid #000 !important;
        }
        .MuiTable-root {
          border: 2px solid #000 !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      @page {
        size: A3 landscape;
        margin: 10mm 8mm 8mm 8mm;
      }
    `}
  </style>
);

const ExcelView = ({ open, onClose, clusterId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [activeClusters, setActiveClusters] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Form1_Report_Cluster_${clusterId}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
    },
    onPrintError: (error) => {
      console.error('Print error:', error);
      setIsPrinting(false);
    },
  });

  useEffect(() => {
    if (open && clusterId) {
      fetchExcelData();
    }
  }, [open, clusterId]);

  const fetchExcelData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `${mainapi.BASE_URL}/earas-form1-entry/api/download/${clusterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setFormData(response.data);
      const clusters = getActiveClusters(response.data);
      setActiveClusters(clusters.length > 0 ? clusters : ['K']);
    } catch (err) {
      console.error('Error fetching Excel data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderNucRow = (nuc) => {
    let CellComponent = DataCell;
    let cellStyle = {};

    if (nuc.label === 'NUC Area' || nuc.malayalamLabel === 'NUC') {
      CellComponent = NucCell;
      cellStyle = { backgroundColor: '#FFF2CC !important' };
    } else if (nuc.label === 'FFS Area' || nuc.malayalamLabel === 'FFS') {
      CellComponent = FfsCell;
      cellStyle = { backgroundColor: '#E2F0D9 !important' };
    } else if (nuc.label === 'COS Area' || nuc.malayalamLabel === 'COS') {
      CellComponent = CosCell;
      cellStyle = { backgroundColor: '#DDEBF7 !important' };
    }

    const clusterValues = activeClusters.map(cluster => nuc[cluster.toLowerCase()] ?? 0);

    return (
      <TableRow>
        <CropNameCell colSpan={6} sx={cellStyle}>
          {nuc.malayalamLabel || nuc.label}
        </CropNameCell>
        <CellComponent sx={cellStyle}>"</CellComponent>
        {clusterValues.map((val, idx) => (
          <CellComponent key={idx} colSpan={2} sx={cellStyle}>
            {typeof val === 'number' ? val.toFixed(2) : '0.00'}
          </CellComponent>
        ))}
        <TotalCell colSpan={2}>{(nuc.total ?? 0).toFixed(2)}</TotalCell>
      </TableRow>
    );
  };


  const renderCropRow = (crop) => {
    const displayName = crop.growthStage && crop.growthStage !== 'no classification'
      ? `${crop.malayalamName || crop.cropName} (${crop.growthStage})`
      : crop.cropName || crop.cropName;

    const clusterData = activeClusters.map(cluster => {
      const key = cluster.toLowerCase();
      if (key === "k") {
        return { i: crop.ki ?? 0, ui: crop.kui ?? 0 };
      }
      return { i: crop[`${key}I`] ?? 0, ui: crop[`${key}UI`] ?? 0 };
    });

    return (
      <TableRow>
        <CropNameCell colSpan={6}>{displayName}</CropNameCell>
        <DataCell>{crop.unit ?? "NA"}</DataCell>
        {clusterData.map((data, idx) => (
          <React.Fragment key={idx}>
            <DataCell>{typeof data.i === 'number' ? data.i.toFixed(2) : '0.00'}</DataCell>
            <DataCell>{typeof data.ui === 'number' ? data.ui.toFixed(2) : '0.00'}</DataCell>
          </React.Fragment>
        ))}
        <TotalCell>{(crop.totalI ?? 0).toFixed(2)}</TotalCell>
        <TotalCell>{(crop.totalUI ?? 0).toFixed(2)}</TotalCell>
      </TableRow>
    );
  };
  // Add this helper function after the toArray function
  // In ExcelView.jsx, update the renderLandUtilization function

  const renderLandUtilization = (landData) => {
    const landArray = toArray(landData);
    const totalClusters = activeClusters.length;
    const totalCols = 6 + 1 + (totalClusters * 2) + 2;

    // Get cluster labels with area from formData
    const clusterLabelsWithArea = formData?.clusterLabelsWithArea || [];

    // Create a map for quick lookup
    const areaMap = {};
    let totalArea = 0;
    clusterLabelsWithArea.forEach(item => {
      areaMap[item.label] = item.totalEnumeratedArea || 0;
      totalArea += item.totalEnumeratedArea || 0;
    });

    if (landArray.length === 0) {
      return (
        <>
          <TableRow>
            <SectionHeaderCell colSpan={totalCols} sx={{ backgroundColor: '#d9e1f2', fontWeight: 'bold', fontSize: '10px', padding: '6px 4px' }}>
              എ . ഭൂവിനിയോഗം
            </SectionHeaderCell>
          </TableRow>
          <TableRow>
            <DataCell colSpan={totalCols} sx={{ textAlign: 'center', color: '#999' }}>
              No land utilization data available
            </DataCell>
          </TableRow>
        </>
      );
    }

    return (
      <>
        <TableRow>
          <SectionHeaderCell colSpan={totalCols} sx={{ backgroundColor: '#d9e1f2', fontWeight: 'bold', fontSize: '10px', padding: '6px 4px' }}>
            എ . ഭൂവിനിയോഗം
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <HeaderCell colSpan={2} sx={{ minWidth: '50px' }}>നമ്പർ</HeaderCell>
          <HeaderCell colSpan={4} sx={{ minWidth: '120px' }}>വിസ്‌തൃതി (എന്യൂമറേറ്റഡ്‌)</HeaderCell>
          <HeaderCell sx={{ minWidth: '60px' }}>സെന്റ്</HeaderCell>
          {activeClusters.map((label) => {
            const area = areaMap[label] || 0;
            return (
              <HeaderCell key={label} colSpan={2} sx={{ minWidth: '50px' }}>
                <span style={{ fontSize: '10px', fontWeight: 'normal' }}>{area.toFixed(2)}</span>
              </HeaderCell>
            );
          })}
          <HeaderCell colSpan={2} sx={{ minWidth: '60px' }}>
            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{totalArea.toFixed(2)}</span>
          </HeaderCell>
        </TableRow>

        {landArray.map((item, index) => {
          const clusterValues = activeClusters.map(cluster => item[cluster.toLowerCase()] ?? 0);
          return (
            <TableRow key={index}>
              <DataCell sx={{ minWidth: '50px' }}>{index + 1}</DataCell>
              <DataCell colSpan={5} sx={{ textAlign: 'left' }}>{item.malayalamLabel}</DataCell>
              <DataCell>"</DataCell>
              {clusterValues.map((val, idx) => (
                <DataCell key={idx} colSpan={2}>
                  {typeof val === 'number' ? val.toFixed(2) : '0.00'}
                </DataCell>
              ))}
              <TotalCell colSpan={2}>{(item.total ?? 0).toFixed(2)}</TotalCell>
            </TableRow>
          );
        })}
      </>
    );
  };

  const renderSeasonalSection = (title, data, headerColor = '#FFE699') => {
    if (!data) return null;
    const { crops = [], nucRows = [] } = data;
    const totalClusters = activeClusters.length;
    const totalCols = 6 + 1 + (totalClusters * 2) + 2;

    // Sort crops alphabetically
    const sortedCrops = sortCropsAlphabetically(crops);

    return (
      <>
        <TableRow>
          <SectionHeaderCell colSpan={totalCols} sx={{ backgroundColor: headerColor, fontWeight: 'bold', fontSize: '10px', padding: '6px 4px' }}>
            {title}
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <SectionHeaderCell colSpan={6} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '9px' }}>
            വിളകൾ
          </SectionHeaderCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '50px' }}></DataCell>
          {activeClusters.map((label) => (
            <React.Fragment key={label}>
              <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>I</DataCell>
              <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>UI</DataCell>
            </React.Fragment>
          ))}
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>UI</DataCell>
        </TableRow>

        {sortedCrops.length > 0 ? (
          sortedCrops.map((crop, idx) => renderCropRow(crop))
        ) : (
          <TableRow>
            <CropNameCell colSpan={totalCols} sx={{ textAlign: 'center', color: '#999' }}>
              No crops data available
            </CropNameCell>
          </TableRow>
        )}

        {nucRows.length > 0 && nucRows.map((nuc, idx) => renderNucRow(nuc))}
      </>
    );
  };

  const renderRegularCropSection = (title, crops, headerColor) => {
    const cropArray = toArray(crops);
    const totalClusters = activeClusters.length;
    const totalCols = 6 + 1 + (totalClusters * 2) + 2;

    // Sort crops alphabetically
    const sortedCrops = sortCropsAlphabetically(cropArray);

    return (
      <>
        <TableRow>
          <SectionHeaderCell colSpan={totalCols} sx={{ backgroundColor: headerColor, fontWeight: 'bold', fontSize: '10px', padding: '6px 4px' }}>
            {title}
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <SectionHeaderCell colSpan={6} sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', fontSize: '9px' }}>
            വിളകൾ
          </SectionHeaderCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '50px' }}>"</DataCell>
          {activeClusters.map((label) => (
            <React.Fragment key={label}>
              <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>I</DataCell>
              <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>UI</DataCell>
            </React.Fragment>
          ))}
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold', minWidth: '45px' }}>UI</DataCell>
        </TableRow>

        {sortedCrops.length > 0 ? (
          sortedCrops.map((crop, idx) => renderCropRow(crop))
        ) : (
          <TableRow>
            <CropNameCell colSpan={totalCols} sx={{ textAlign: 'center', color: '#999' }}>
              No {title} crops data available
            </CropNameCell>
          </TableRow>
        )}
      </>
    );
  };

  // In renderIrrigationSection
  const renderIrrigationSection = (irrigationData) => {
    const items = toArray(irrigationData?.items);
    const totalClusters = activeClusters.length;
    const totalCols = 3 + 1 + (totalClusters * 2) + 2;

    const clusterLabelsWithArea = formData?.clusterLabelsWithArea || [];
    const areaMap = {};
    clusterLabelsWithArea.forEach(item => {
      areaMap[item.label] = item.totalEnumeratedArea || 0;
    });

    // Calculate totals
    const netTotals = {};
    const grossTotals = {};
    items.forEach(item => {
      activeClusters.forEach(cluster => {
        const areaKey = `${cluster.toLowerCase()}Area`;
        const grossKey = `${cluster.toLowerCase()}GrossArea`;
        const area = item[areaKey] || 0;
        const gross = item[grossKey] || 0;

        netTotals[cluster] = (netTotals[cluster] || 0) + area;
        grossTotals[cluster] = (grossTotals[cluster] || 0) + gross;
      });
    });

    return (
      <>
        <TableRow>
          <SectionHeaderCell
            colSpan={19}
            sx={{
              backgroundColor: '#B7DEE8',
              fontWeight: 'bold',
              fontSize: '10px',
              padding: '6px 4px'
            }}
          >
            ഇ. ജലസേചനമുള്ള സ്ഥലവിസ്തൃതി
          </SectionHeaderCell>
        </TableRow>

        <TableRow>
          <HeaderCell colSpan={6} sx={{ minWidth: '100px' }}>ജലസേചന മാർഗ്ഗം</HeaderCell>
          <HeaderCell sx={{ minWidth: '150px' }}>കോഡ്</HeaderCell>
          {activeClusters.map((label) => {
            const area = areaMap[label] || 0;
            return (
              <HeaderCell key={label} colSpan={2} sx={{ minWidth: '45px' }}>
                {label}
                <br />
                <span style={{ fontSize: '6px', fontWeight: 'normal' }}>({area.toFixed(2)})</span>
              </HeaderCell>
            );
          })}
          <HeaderCell colSpan={2} sx={{ minWidth: '55px' }}>ആകെ</HeaderCell>
        </TableRow>

        <TableRow>
          <HeaderCell colSpan={7} sx={{ backgroundColor: '#e8f0fe' }}></HeaderCell>
          {activeClusters.map((label) => (
            <React.Fragment key={label}>
              <HeaderCell sx={{ backgroundColor: '#e8f0fe', minWidth: '35px' }}>എണ്ണം</HeaderCell>
              <HeaderCell sx={{ backgroundColor: '#e8f0fe', minWidth: '35px' }}>വിസ്തൃതി</HeaderCell>
            </React.Fragment>
          ))}
          <HeaderCell colSpan={2} sx={{ backgroundColor: '#e8f0fe' }}></HeaderCell>
        </TableRow>

        {items.length > 0 ? (
          items.map((item, idx) => {
            let sourceTotal = 0;
            const clusterData = activeClusters.map(cluster => {
              const areaKey = `${cluster.toLowerCase()}Area`;
              const countKey = `${cluster.toLowerCase()}Count`;
              const area = item[areaKey] || 0;
              const count = item[countKey] || 0;
              sourceTotal += area;
              return { area, count };
            });

            return (
              <TableRow key={idx}>
                <DataCell colSpan={6}>{item.irrigationType || 'N/A'}</DataCell>
                <DataCell>{item.code || 'N/A'}</DataCell>
                {clusterData.map((data, idx) => (
                  <React.Fragment key={idx}>
                    <DataCell>{data.count}</DataCell>
                    <DataCell>{data.area.toFixed(2)}</DataCell>
                  </React.Fragment>
                ))}
                <TotalCell colSpan={2}>{sourceTotal.toFixed(2)}</TotalCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <DataCell colSpan={totalCols} sx={{ textAlign: 'center', color: '#999' }}>
              No irrigation data available
            </DataCell>
          </TableRow>
        )}

        {/* Gross Area Row - Uses stands per hectare logic */}


        {/* Net Area Row */}
        <TableRow sx={{ backgroundColor: '#e8f5e9', borderTop: '2px solid #388e3c' }}>
          <DataCell colSpan={7} sx={{ fontWeight: 'bold' }}>Net Area</DataCell>
          {activeClusters.map((cluster) => (
            <React.Fragment key={cluster}>
              <DataCell sx={{ fontWeight: 'bold' }}></DataCell>
              <DataCell sx={{ fontWeight: 'bold' }}>
                {(netTotals[cluster] || 0).toFixed(2)}
              </DataCell>
            </React.Fragment>
          ))}
          <TotalCell colSpan={2} sx={{ fontWeight: 'bold' }}>
            {items.reduce((sum, item) => sum + (item.totalArea || 0), 0).toFixed(2)}
          </TotalCell>
        </TableRow>
        <TableRow sx={{ backgroundColor: '#c8e6c9' }}>
          <DataCell colSpan={7} sx={{ fontWeight: 'bold' }}>Gross Area</DataCell>
          {activeClusters.map((cluster) => (
            <React.Fragment key={cluster}>
              <DataCell sx={{ fontWeight: 'bold' }}></DataCell>
              <DataCell sx={{ fontWeight: 'bold' }}>
                {(grossTotals[cluster] || 0).toFixed(2)}
              </DataCell>
            </React.Fragment>
          ))}
          <TotalCell colSpan={2} sx={{ fontWeight: 'bold' }}>
            {items.reduce((sum, item) => sum + (item.totalGrossArea || 0), 0).toFixed(2)}
          </TotalCell>
        </TableRow>
      </>
    );
  };
  const renderOwnerDetails = (owner) => {
    const totalClusters = activeClusters.length;
    const totalCols = 6 + 1 + (totalClusters * 2) + 2;

    return (
      <>
        <TableRow>
          <DataCell colSpan={totalCols} sx={{ textAlign: 'left', fontWeight: 'bold', pt: 1, fontSize: '10px' }}>
            കീപ്ലോട്ടിന്റെ ഉടമസ്ഥന്റെ മേൽവിലാസം
          </DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={4} sx={{ textAlign: 'left', pl: 2, fontWeight: 'bold' }}>പേര് :</DataCell>
          <DataCell colSpan={totalCols - 4} sx={{ textAlign: 'left' }}>{owner?.ownerName || 'N/A'}</DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={4} sx={{ textAlign: 'left', pl: 2, fontWeight: 'bold' }}>വിലാസം :</DataCell>
          <DataCell colSpan={totalCols - 4} sx={{ textAlign: 'left' }}>{owner?.address || 'N/A'}</DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={4} sx={{ textAlign: 'left', pl: 2, fontWeight: 'bold' }}>മൊബൈൽ :</DataCell>
          <DataCell colSpan={totalCols - 4} sx={{ textAlign: 'left' }}>{owner?.contactNumber || 'N/A'}</DataCell>
        </TableRow>
      </>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading data...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent>
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!formData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>No data available</Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const { header, landUtilization, virippu, mundakan, puncha, annualCrops, perennialCrops, irrigation, ownerDetails } = formData;
  const totalClusters = activeClusters.length;
  const totalCols = 6 + 1 + (totalClusters * 2) + 2;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '95vh',
          maxWidth: '95vw',
        }
      }}
    >
      <DialogTitle sx={{
        m: 0,
        p: 1.5,
        backgroundColor: '#04255e',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight="bold" fontSize="1rem">
          Form 1 - Report View
          <Chip
            label={`Cluster: ${header?.clusterNumber || 'N/A'}`}
            size="small"
            sx={{ ml: 2, backgroundColor: '#ffffff20', color: '#ffffff' }}
          />
          <Chip
            label={`Active Clusters: ${activeClusters.join(', ')}`}
            size="small"
            sx={{ ml: 1, backgroundColor: '#ffffff20', color: '#ffffff' }}
          />
        </Typography>
        <Box className="no-print">
          <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePrint}
            disabled={isPrinting}
            sx={{
              mr: 1,
              backgroundColor: '#ffffff',
              color: '#04255e',
              '&:hover': { backgroundColor: '#f0f0f0' },
              fontSize: '0.75rem',
              py: 0.5
            }}
          >
            {isPrinting ? <CircularProgress size={16} /> : 'Download PDF'}
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#ffffff', p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 1, backgroundColor: '#f5f5f5' }}>
        <PrintStyle />
        <PrintContainer ref={printRef} className="print-container" sx={{ p: 1, maxWidth: '100%' }}>

          {/* ================= NEW BEAUTIFUL PDF HEADER UI ================= */}
          <Box sx={{
            border: '1px solid #ccc',
            borderRadius: '4px',
            p: 2,
            mb: 2,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Logo Center Banner */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img
                className="logo_gov"
                src={logo}
                alt="Logo"
                style={{
                  width: "24rem",
                  height: "auto",
                  maxWidth: "100%"
                }}
              />
            </Box>

            {/* Symmetrical Informational Grid */}
            <Grid container spacing={1} sx={{ borderTop: '1px dashed #ccc', pt: 1.5, px: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>ജില്ല (District):</strong> {header?.districtName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>താലൂക്ക് (Taluk):</strong> {header?.talukName || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>സോൺ (Zone):</strong> {header?.zoneName || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>പഞ്ചായത്ത് (Panchayath):</strong> {header?.panchayath || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>ക്ലസ്റ്റർ (Cluster No):</strong> {header?.clusterNumber || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#555' }}>
                  <strong>ബ്ലോക്ക് (Block):</strong> {header?.block || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {/* =============================================================== */}

          <Paper elevation={0} sx={{ p: 0, overflow: 'auto' }}>
            <ExcelTableContainer>
              <Table size="small" sx={{ minWidth: 1200 }}>
                <TableHead>
                  <TableRow>
                    <HeaderCell colSpan={6} sx={{ minWidth: '150px' }}>വിവരണങ്ങൾ</HeaderCell>
                    <HeaderCell sx={{ minWidth: '60px' }}>യൂണിറ്റ്</HeaderCell>
                    {activeClusters.map((label) => {
                      const clusterLabelsWithArea = formData?.clusterLabelsWithArea || [];
                      const areaMap = {};
                      clusterLabelsWithArea.forEach(item => {
                        areaMap[item.label] = item.totalEnumeratedArea || 0;
                      });
                      const area = areaMap[label] || 0;
                      return (
                        <HeaderCell key={label} colSpan={2} sx={{ minWidth: '45px' }}>
                          {label}
                          <br />
                          {/* <span style={{ fontSize: '6px', fontWeight: 'normal' }}>({area.toFixed(2)})</span> */}
                        </HeaderCell>
                      );
                    })}
                    <HeaderCell colSpan={2} sx={{ minWidth: '55px' }}>ആകെ</HeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {/* ========== SECTION A: LAND UTILIZATION ========== */}
                  {renderLandUtilization(landUtilization)}

                  {/* ========== SECTION B: SEASONAL CROPS ========== */}
                  {renderSeasonalSection('ബി. കാലികവിള കൃഷിസ്ഥലം', virippu, '#FFE699')}

                  {/* Mundakan - Season 2 (Winter) */}
                  {renderSeasonalSection('മുണ്ടകൻ കൃഷി', mundakan, '#FFE699')}

                  {/* Puncha - Season 3 (Summer) */}
                  {renderSeasonalSection('പുഞ്ച കൃഷി', puncha, '#FFE699')}

                  {/* ========== SECTION C: ANNUAL CROPS ========== */}
                  {renderRegularCropSection('സി. വാർഷിക വിള കൃഷിസ്ഥലം', annualCrops, '#C6E0B4')}

                  {/* ========== SECTION D: PERENNIAL CROPS ========== */}
                  {renderRegularCropSection('ഡി. ദീർഘകാല വിളകൾ കൃഷിസ്ഥലം', perennialCrops, '#D9C2E9')}

                  {/* ========== SECTION E: IRRIGATION ========== */}
                  {renderIrrigationSection(irrigation)}

                  {/* ========== OWNER DETAILS ========== */}
                  {renderOwnerDetails(ownerDetails)}

                  {/* ========== SIGNATURE SECTION ========== */}
                  <TableRow>
                    <DataCell colSpan={6} sx={{ textAlign: 'center', pt: 1 }}>
                      <Typography variant="caption" display="block" fontWeight="bold" fontSize="8px">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">പേര്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">ഇൻവെസ്റ്റിഗേറ്റർ</Typography>
                    </DataCell>
                    <DataCell colSpan={6} sx={{ textAlign: 'center', pt: 1 }}>
                      <Typography variant="caption" display="block" fontWeight="bold" fontSize="8px">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">പേര്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">സ്റ്റാറ്റിസ്റ്റിക്കൽ ഇൻസ്പെക്ടർ</Typography>
                    </DataCell>
                    <DataCell colSpan={totalCols - 12} sx={{ textAlign: 'center', pt: 1 }}>
                      <Typography variant="caption" display="block" fontWeight="bold" fontSize="8px">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">പേര്</Typography>
                      <Typography variant="caption" display="block" fontSize="8px">താലൂക്ക് സ്റ്റാറ്റിസ്റ്റിക്കൽ ഓഫീസർ</Typography>
                    </DataCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ExcelTableContainer>
          </Paper>
        </PrintContainer>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const Form1WithExcelView = ({ clusterId }) => {
  const [openExcelView, setOpenExcelView] = useState(false);

  return (
    <>
      <Button
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setOpenExcelView(true)}
        sx={{
          backgroundColor: '#04255e',
          '&:hover': { backgroundColor: '#031a45' },
          fontSize: '0.75rem',
          py: 0.75
        }}
      >
        View Report (PDF)
      </Button>

      <ExcelView
        open={openExcelView}
        onClose={() => setOpenExcelView(false)}
        clusterId={clusterId}
      />
    </>
  );
};

export default Form1WithExcelView;