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

// Styled components for Excel-like appearance
const ExcelTableContainer = styled(TableContainer)({
  border: '2px solid #000',
  '& .MuiTableCell-root': {
    border: '1px solid #000',
    padding: '5px',
    fontSize: '10px',
    lineHeight: '1.3',
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
  padding: '5px',
  fontSize: '10px',
  '@media print': {
    backgroundColor: '#f0f0f0 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const DataCell = styled(TableCell)({
  textAlign: 'center',
  padding: '5px',
  fontSize: '10px',
});

const TotalCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#e8f0fe',
  textAlign: 'center',
  padding: '5px',
  fontSize: '10px',
  '@media print': {
    backgroundColor: '#e8f0fe !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

// Section header styles with different colors
const SectionHeaderCell = styled(TableCell)({
  fontWeight: 'bold',
  textAlign: 'left',
  paddingLeft: '16px !important',
  fontSize: '12px',
  padding: '6px',
  '@media print': {
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const CropNameCell = styled(TableCell)({
  textAlign: 'left',
  paddingLeft: '16px',
  padding: '5px',
  fontSize: '10px',
});

// NUC/FFS/COS color styles
const NucCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#FFF2CC !important',
  padding: '5px',
  fontSize: '10px',
  '@media print': {
    backgroundColor: '#FFF2CC !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const FfsCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#E2F0D9 !important',
  padding: '5px',
  fontSize: '10px',
  '@media print': {
    backgroundColor: '#E2F0D9 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const CosCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#DDEBF7 !important',
  padding: '5px',
  fontSize: '10px',
  '@media print': {
    backgroundColor: '#DDEBF7 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const PrintContainer = styled(Box)({
  '@media print': {
    padding: '10px',
    backgroundColor: '#ffffff',
  },
});

// Helper to convert object to array if needed
const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    return Object.values(data);
  }
  return [];
};

// Print styles
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
          padding: 10px !important;
        }
        .MuiPaper-root {
          box-shadow: none !important;
          border: none !important;
        }
        table {
          page-break-inside: avoid;
          border-collapse: collapse !important;
        }
        tr {
          page-break-inside: avoid;
        }
        thead {
          display: table-header-group;
        }
        tbody tr {
          page-break-inside: avoid;
        }
        .print-container {
          padding: 10px;
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
        margin: 8mm;
      }
    `}
  </style>
);

const ExcelView = ({ open, onClose, clusterId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
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
    } catch (err) {
      console.error('Error fetching Excel data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render NUC row with specific colors
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

    return (
      <TableRow>
        <CropNameCell colSpan={6} sx={cellStyle}>
          {nuc.malayalamLabel || nuc.label}
        </CropNameCell>
        <CellComponent sx={cellStyle}>"</CellComponent>
        <CellComponent colSpan={2} sx={cellStyle}>{nuc.k ?? 0}</CellComponent>
        <CellComponent colSpan={2} sx={cellStyle}>{nuc.s1 ?? 0}</CellComponent>
        <CellComponent colSpan={2} sx={cellStyle}>{nuc.e1 ?? 0}</CellComponent>
        <CellComponent colSpan={2} sx={cellStyle}>{nuc.n1 ?? 0}</CellComponent>
        <CellComponent colSpan={2} sx={cellStyle}>{nuc.w1 ?? 0}</CellComponent>
        <TotalCell colSpan={2}>{(nuc.total ?? 0).toFixed(2)}</TotalCell>
      </TableRow>
    );
  };

  // Render crop row with growth stage
  const renderCropRow = (crop) => {
    const displayName = crop.growthStage && crop.growthStage !== 'no classification' 
      ? `${crop.malayalamName || crop.cropName} (${crop.growthStage})`
      : crop.malayalamName || crop.cropName;

    return (
      <TableRow>
        <CropNameCell colSpan={6}>{displayName}</CropNameCell>
        <DataCell>"</DataCell>
        <DataCell>{crop.kI ?? 0}</DataCell>
        <DataCell>{crop.kUI ?? 0}</DataCell>
        <DataCell>{crop.s1I ?? 0}</DataCell>
        <DataCell>{crop.s1UI ?? 0}</DataCell>
        <DataCell>{crop.e1I ?? 0}</DataCell>
        <DataCell>{crop.e1UI ?? 0}</DataCell>
        <DataCell>{crop.n1I ?? 0}</DataCell>
        <DataCell>{crop.n1UI ?? 0}</DataCell>
        <DataCell>{crop.w1I ?? 0}</DataCell>
        <DataCell>{crop.w1UI ?? 0}</DataCell>
        <TotalCell>{(crop.totalI ?? 0).toFixed(2)}</TotalCell>
        <TotalCell>{(crop.totalUI ?? 0).toFixed(2)}</TotalCell>
      </TableRow>
    );
  };

  // Render seasonal section with colored header
  const renderSeasonalSection = (title, data, headerColor = '#FFE699') => {
    if (!data) return null;
    const { crops = [], nucRows = [] } = data;

    return (
      <>
        <TableRow>
          <SectionHeaderCell 
            colSpan={19} 
            sx={{ 
              backgroundColor: headerColor,
              fontWeight: 'bold',
              fontSize: '12px',
              padding: '8px'
            }}
          >
            {title}
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <SectionHeaderCell 
            colSpan={6} 
            sx={{ 
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              fontSize: '10px'
            }}
          >
            വിളകൾ
          </SectionHeaderCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>"</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
        </TableRow>

        {crops.length > 0 ? (
          crops.map((crop, idx) => renderCropRow(crop))
        ) : (
          <TableRow>
            <CropNameCell colSpan={19} sx={{ textAlign: 'center', color: '#999' }}>
              No crops data available
            </CropNameCell>
          </TableRow>
        )}

        {nucRows.length > 0 && nucRows.map((nuc, idx) => renderNucRow(nuc))}
      </>
    );
  };

  // Render regular crop section (Annual/Perennial - no NUC rows)
  const renderRegularCropSection = (title, crops, headerColor) => {
    const cropArray = toArray(crops);

    return (
      <>
        <TableRow>
          <SectionHeaderCell 
            colSpan={19} 
            sx={{ 
              backgroundColor: headerColor,
              fontWeight: 'bold',
              fontSize: '12px',
              padding: '8px'
            }}
          >
            {title}
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <SectionHeaderCell 
            colSpan={6} 
            sx={{ 
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              fontSize: '10px'
            }}
          >
            വിളകൾ
          </SectionHeaderCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>"</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>I</DataCell>
          <DataCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>UI</DataCell>
        </TableRow>

        {cropArray.length > 0 ? (
          cropArray.map((crop, idx) => renderCropRow(crop))
        ) : (
          <TableRow>
            <CropNameCell colSpan={19} sx={{ textAlign: 'center', color: '#999' }}>
              No {title} crops data available
            </CropNameCell>
          </TableRow>
        )}
      </>
    );
  };

  // Render Irrigation Section with cluster columns
  const renderIrrigationSection = (irrigationData) => {
    const items = toArray(irrigationData?.items);

    return (
      <>
        <TableRow>
          <SectionHeaderCell 
            colSpan={19} 
            sx={{ 
              backgroundColor: '#B7DEE8',
              fontWeight: 'bold',
              fontSize: '12px',
              padding: '8px'
            }}
          >
            ഇ. ജലസേചനമുള്ള സ്ഥലവിസ്തൃതി
          </SectionHeaderCell>
        </TableRow>
        <TableRow>
          <HeaderCell colSpan={3}>ജലസേചന മാർഗ്ഗം</HeaderCell>
          <HeaderCell>കോഡ്</HeaderCell>
          <HeaderCell colSpan={2}>എണ്ണം</HeaderCell>
          <HeaderCell colSpan={2}>K</HeaderCell>
          <HeaderCell colSpan={2}>S1</HeaderCell>
          <HeaderCell colSpan={2}>E1</HeaderCell>
          <HeaderCell colSpan={2}>N1</HeaderCell>
          <HeaderCell colSpan={2}>W1</HeaderCell>
          <HeaderCell colSpan={2}>ആകെ</HeaderCell>
        </TableRow>

        {items.length > 0 ? (
          items.map((item, idx) => (
            <TableRow key={idx}>
              <DataCell colSpan={3}>{item.irrigationType || 'N/A'}</DataCell>
              <DataCell>{item.code || 'N/A'}</DataCell>
              <DataCell colSpan={2}>{item.sourceCount || 0}</DataCell>
              <DataCell colSpan={2}>{(item.kArea || 0).toFixed(2)}</DataCell>
              <DataCell colSpan={2}>{(item.s1Area || 0).toFixed(2)}</DataCell>
              <DataCell colSpan={2}>{(item.e1Area || 0).toFixed(2)}</DataCell>
              <DataCell colSpan={2}>{(item.n1Area || 0).toFixed(2)}</DataCell>
              <DataCell colSpan={2}>{(item.w1Area || 0).toFixed(2)}</DataCell>
              <TotalCell colSpan={2}>{(item.totalArea || 0).toFixed(2)}</TotalCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <DataCell colSpan={19} sx={{ textAlign: 'center', color: '#999' }}>
              No irrigation data available
            </DataCell>
          </TableRow>
        )}

        {/* Irrigation Totals */}
        {items.length > 0 && (
          <TableRow sx={{ backgroundColor: '#e8f5e9', borderTop: '2px solid #388e3c' }}>
            <DataCell colSpan={6} sx={{ fontWeight: 'bold' }}>ആകെ</DataCell>
            <DataCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center' }}>Net</DataCell>
            <DataCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center' }}>{(irrigationData?.totalNetArea || 0).toFixed(2)}</DataCell>
            <DataCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center' }}>Gross</DataCell>
            <DataCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'center' }}>{(irrigationData?.totalGrossArea || 0).toFixed(2)}</DataCell>
            <DataCell colSpan={4}></DataCell>
          </TableRow>
        )}
      </>
    );
  };

  // Render Owner Details
  const renderOwnerDetails = (owner) => {
    return (
      <>
        <TableRow>
          <DataCell colSpan={19} sx={{ textAlign: 'left', fontWeight: 'bold', pt: 2, fontSize: '11px' }}>
            കീപ്ലോട്ടിന്റെ ഉടമസ്ഥന്റെ മേൽവിലാസം
          </DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={6} sx={{ textAlign: 'left', pl: 3, fontWeight: 'bold' }}>പേര് :</DataCell>
          <DataCell colSpan={13} sx={{ textAlign: 'left' }}>{owner?.ownerName || 'N/A'}</DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={6} sx={{ textAlign: 'left', pl: 3, fontWeight: 'bold' }}>വിലാസം :</DataCell>
          <DataCell colSpan={13} sx={{ textAlign: 'left' }}>{owner?.address || 'N/A'}</DataCell>
        </TableRow>
        <TableRow>
          <DataCell colSpan={6} sx={{ textAlign: 'left', pl: 3, fontWeight: 'bold' }}>മൊബൈൽ :</DataCell>
          <DataCell colSpan={13} sx={{ textAlign: 'left' }}>{owner?.contactNumber || 'N/A'}</DataCell>
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

  const { header, virippu, mundakan, puncha, annualCrops, perennialCrops, irrigation, ownerDetails } = formData;

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
        p: 2, 
        backgroundColor: '#04255e', 
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight="bold">
          Form 1 - Report View
          <Chip 
            label={`Cluster: ${header?.clusterNumber || 'N/A'}`} 
            size="small" 
            sx={{ ml: 2, backgroundColor: '#ffffff20', color: '#ffffff' }}
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
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            {isPrinting ? <CircularProgress size={20} /> : 'Download PDF'}
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <PrintStyle />
        <PrintContainer ref={printRef} className="print-container" sx={{ p: 2, maxWidth: '100%', overflow: 'auto' }}>
          <Box sx={{ justifyContent: "center", mb: 2, width: "50%" }}>
            <img
              className="logo_gov"
              src={logo}
              alt="Logo"
              style={{
                width: "40rem",
                height: "auto",
                marginBottom: "16px",
              }}
            />
            ജില്ല : {header?.districtName || 'N/A'} താലൂക്ക് : {header?.talukName || 'N/A'} സോൺ : {header?.zoneName || 'N/A'}
          </Box>
          <Paper elevation={3} sx={{ p: 2, overflow: 'auto' }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              പഞ്ചായത്ത്: {header?.panchayath || 'N/A'} | ക്ലസ്റ്റർ: {header?.clusterNumber || 'N/A'} | ബ്ലോക്ക്: {header?.block || 'N/A'}
            </Grid>
            <ExcelTableContainer>
              <Table size="small" sx={{ minWidth: 1400 }}>
                <TableHead>
                  <TableRow>
                    <HeaderCell colSpan={6}>വിവരണങ്ങൾ</HeaderCell>
                    <HeaderCell>യൂണിറ്റ്</HeaderCell>
                    <HeaderCell colSpan={2}>K</HeaderCell>
                    <HeaderCell colSpan={2}>S1</HeaderCell>
                    <HeaderCell colSpan={2}>E1</HeaderCell>
                    <HeaderCell colSpan={2}>N1</HeaderCell>
                    <HeaderCell colSpan={2}>W1</HeaderCell>
                    <HeaderCell colSpan={2}>ആകെ</HeaderCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
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
                    <DataCell colSpan={6} sx={{ textAlign: 'center', pt: 2 }}>
                      <Typography variant="caption" display="block" fontWeight="bold">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block">പേര്</Typography>
                      <Typography variant="caption" display="block">ഇൻവെസ്റ്റിഗേറ്റർ</Typography>
                    </DataCell>
                    <DataCell colSpan={6} sx={{ textAlign: 'center', pt: 2 }}>
                      <Typography variant="caption" display="block" fontWeight="bold">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block">പേര്</Typography>
                      <Typography variant="caption" display="block">സ്റ്റാറ്റിസ്റ്റിക്കൽ ഇൻസ്പെക്ടർ</Typography>
                    </DataCell>
                    <DataCell colSpan={7} sx={{ textAlign: 'center', pt: 2 }}>
                      <Typography variant="caption" display="block" fontWeight="bold">ഒപ്പ്</Typography>
                      <Typography variant="caption" display="block">പേര്</Typography>
                      <Typography variant="caption" display="block">താലൂക്ക് സ്റ്റാറ്റിസ്റ്റിക്കൽ ഓഫീസർ</Typography>
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