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
import logo from '../../../../assets/images/logo/des-print-logo.png'; // Adjust the path as necessary 

// Styled components for Excel-like appearance
const ExcelTableContainer = styled(TableContainer)({
  border: '2px solid #000',
  '& .MuiTableCell-root': {
    border: '1px solid #000',
    padding: '4px',
    fontSize: '10px',
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
  '@media print': {
    backgroundColor: '#f0f0f0 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const DataCell = styled(TableCell)({
  textAlign: 'center',
});

const TotalCell = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#e8f0fe',
  textAlign: 'center',
  '@media print': {
    backgroundColor: '#e8f0fe !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const SectionHeaderFullRow = styled(TableCell)({
  fontWeight: 'bold',
  backgroundColor: '#d9e1f2',
  textAlign: 'left',
  paddingLeft: '16px !important',
  fontSize: '11px',
  '@media print': {
    backgroundColor: '#d9e1f2 !important',
    '-webkit-print-color-adjust': 'exact !important',
    'print-color-adjust': 'exact !important',
  },
});

const CropNameCell = styled(TableCell)({
  textAlign: 'left',
  paddingLeft: '16px',
});

const NucCell = styled(TableCell)({
  textAlign: 'center',
  backgroundColor: '#f5f5f5 !important',
  '@media print': {
    backgroundColor: '#f5f5f5 !important',
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

const ExcelView = ({ open, onClose, clusterId = 21186 }) => {
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

  const renderNucRow = (nuc) => {
    return (
      <TableRow>
        {/* Replaced colSpan 2 & 4 with single combined colSpan 6 */}
        <CropNameCell colSpan={6} sx={{ backgroundColor: '#f5f5f5' }}>
          {nuc.malayalamLabel || nuc.label}
        </CropNameCell>
        <DataCell sx={{ backgroundColor: '#f5f5f5' }}>"</DataCell>
        <NucCell colSpan={2}>{nuc.k ?? 0}</NucCell>
        <NucCell colSpan={2}>{nuc.s1 ?? 0}</NucCell>
        <NucCell colSpan={2}>{nuc.e1 ?? 0}</NucCell>
        <NucCell colSpan={2}>{nuc.n1 ?? 0}</NucCell>
        <NucCell colSpan={2}>{nuc.w1 ?? 0}</NucCell>
        <TotalCell colSpan={2}>{(nuc.total ?? 0).toFixed(2)}</TotalCell>
      </TableRow>
    );
  };

  const renderCropRow = (crop) => {
    return (
      <TableRow>
        <CropNameCell colSpan={6}>{crop.malayalamName || crop.cropName}</CropNameCell>
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

  const renderSeasonalSection = (title, data) => {
    if (!data) return null;
    const { crops = [], nucRows = [] } = data;

    return (
      <>
        <TableRow>
          <SectionHeaderFullRow colSpan={6}>{title}</SectionHeaderFullRow>
          <DataCell>"</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
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

  const renderRegularCropSection = (title, crops) => {
    const cropArray = toArray(crops);

    return (
      <>
        <TableRow>
          <SectionHeaderFullRow colSpan={6}>{title}</SectionHeaderFullRow>
          <DataCell>"</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
          <DataCell>I</DataCell>
          <DataCell>UI</DataCell>
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
  const landUtilizationArray = toArray(landUtilization);
  const irrigationItems = toArray(irrigation?.items);

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
                  {/* Restored Header Row 1 matching Excel layout */}
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
                  {/* ========== SECTION A: LAND UTILIZATION ========== */}
                  <TableRow>
                    <SectionHeaderFullRow colSpan={19}>
                      എ . ഭൂവിനിയോഗം
                    </SectionHeaderFullRow>
                  </TableRow>
                  
                  {/* Row 2 fixes matching original Excel labels correctly */}
                  <TableRow>
                    <HeaderCell colSpan={2}>നമ്പർ</HeaderCell>
                    <HeaderCell colSpan={4}>വിസ്‌തൃതി (എന്യൂമറേറ്റഡ്‌)</HeaderCell>
                    <HeaderCell>സെന്റ്</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                    <HeaderCell colSpan={2}>0</HeaderCell>
                  </TableRow>

                  {/* Land Utilization Rows */}
                  {landUtilizationArray.map((item, index) => (
                    <TableRow key={index}>
                      <DataCell>{index + 1}</DataCell>
                      {/* Reduced from colSpan 4 gap + colSpan 1 to a single block mapping */}
                      <DataCell colSpan={5} sx={{ textAlign: 'left' }}>{item.malayalamLabel}</DataCell>
                      <DataCell>"</DataCell>
                      <DataCell colSpan={2}>{item.k ?? 0}</DataCell>
                      <DataCell colSpan={2}>{item.s1 ?? 0}</DataCell>
                      <DataCell colSpan={2}>{item.e1 ?? 0}</DataCell>
                      <DataCell colSpan={2}>{item.n1 ?? 0}</DataCell>
                      <DataCell colSpan={2}>{item.w1 ?? 0}</DataCell>
                      <TotalCell colSpan={2}>{(item.total ?? 0).toFixed(2)}</TotalCell>
                    </TableRow>
                  ))}
                  
                  {/* ========== SECTION B: SEASONAL CROPS ========== */}
                  <TableRow>
                    <SectionHeaderFullRow colSpan={19}>
                      ബി. കാലികവിള കൃഷിസ്ഥലം
                    </SectionHeaderFullRow>
                  </TableRow>

                  {/* Virippu - Season 1 (Autumn) */}
                  {renderSeasonalSection('വിരിപ്പു കൃഷി', virippu)}

                  {/* Mundakan - Season 2 (Winter) */}
                  {renderSeasonalSection('മുണ്ടകൻ കൃഷി', mundakan)}

                  {/* Puncha - Season 3 (Summer) */}
                  {renderSeasonalSection('പുഞ്ച കൃഷി', puncha)}

                  {/* ========== SECTION C: ANNUAL CROPS ========== */}
                  <TableRow>
                    <SectionHeaderFullRow colSpan={19}>
                      സി.വാർഷിക വിള കൃഷിസ്ഥലം
                    </SectionHeaderFullRow>
                  </TableRow>
                  {renderRegularCropSection('', annualCrops)}

                  {/* ========== SECTION D: PERENNIAL CROPS ========== */}
                  <TableRow>
                    <SectionHeaderFullRow colSpan={19}>
                      ഡി. ദീർഘകാല വിളകൾ കൃഷിസ്ഥലം
                    </SectionHeaderFullRow>
                  </TableRow>
                  {renderRegularCropSection('', perennialCrops)}

                  {/* ========== SECTION E: IRRIGATION ========== */}
                  <TableRow>
                    <SectionHeaderFullRow colSpan={19}>
                      ഇ.ജലസേചനമുള്ള സ്ഥലവിസ്തൃതി
                    </SectionHeaderFullRow>
                  </TableRow>

                  {/* Redesigned to map within common headers instead of independent setup */}
                  {irrigationItems.length > 0 ? (
                    irrigationItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <DataCell colSpan={6} sx={{ textAlign: 'left', pl: 2 }}>
                          ജലസേചന മാർഗ്ഗം: {item.irrigationType || 'N/A'} (കോഡ്: {item.code || 'N/A'})
                        </DataCell>
                        <DataCell>എണ്ണം: {item.sourceCount || 0}</DataCell>
                        <DataCell colSpan={4} sx={{ textAlign: 'right', pr: 2 }}>നെറ്റ് ഏരിയ (സെന്റ്):</DataCell>
                        <DataCell colSpan={2}>{(item.netArea || 0).toFixed(2)}</DataCell>
                        <DataCell colSpan={4} sx={{ textAlign: 'right', pr: 2 }}>ഗ്രോസ് ഏരിയ (സെന്റ്):</DataCell>
                        <DataCell colSpan={2}>{(item.grossArea || 0).toFixed(2)}</DataCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <DataCell colSpan={19} sx={{ textAlign: 'center', color: '#999' }}>
                        No irrigation data available
                      </DataCell>
                    </TableRow>
                  )}

                  {/* Irrigation Totals aligned correctly */}
                  {irrigationItems.length > 0 && (
                    <TableRow sx={{ backgroundColor: '#e8f5e9', borderTop: '2px solid #388e3c' }}>
                      <DataCell colSpan={7} sx={{ fontWeight: 'bold', textAlign: 'right', pr: 2 }}>ആകെ:</DataCell>
                      <DataCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'right', pr: 2 }}>
                        നെറ്റ് ഏരിയ:
                      </DataCell>
                      <DataCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                         {(irrigation?.totalNetArea || 0).toFixed(2)}
                      </DataCell>
                      <DataCell colSpan={4} sx={{ fontWeight: 'bold', textAlign: 'right', pr: 2 }}>
                        ഗ്രോസ് ഏരിയ:
                      </DataCell>
                      <DataCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                         {(irrigation?.totalGrossArea || 0).toFixed(2)}
                      </DataCell>
                    </TableRow>
                  )}

                  {/* ========== OWNER DETAILS ========== */}
                  <TableRow>
                    <DataCell colSpan={19} sx={{ textAlign: 'left', fontWeight: 'bold', pt: 2 }}>
                      കീപ്ലോട്ടിന്റെ ഉടമസ്ഥന്റെ മേൽവിലാസം
                    </DataCell>
                  </TableRow>
                  <TableRow>
                    <DataCell colSpan={19} sx={{ textAlign: 'left', pl: 2 }}>
                      {ownerDetails?.ownerName || 'N/A'} - {ownerDetails?.address || 'N/A'} 
                      {ownerDetails?.contactNumber ? ` (${ownerDetails.contactNumber})` : ''}
                    </DataCell>
                  </TableRow>

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
                  
                  <TableRow>
                    <DataCell colSpan={19} sx={{ fontStyle: 'italic', fontSize: '8px', pt: 2, textAlign: 'left' }}>
                      കുറിപ്പ്:- ജലസേചനവിവരങ്ങൾ പ്രത്യേകം രേഖപ്പെടുത്തുവാൻ കാണിച്ചിട്ടില്ലാത്ത വിളകൾക്ക് ജലസേചനം നടത്തിയിട്ടുണ്ടെങ്കിൽ അവയുടെ വിസ്തീർണ്ണം / എണ്ണം രേഖപ്പെടുത്തുമ്പോൾ അത് സർക്കിൾ ചെയ്യേണ്ടതാണ്.
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
const Form1WithExcelView = () => {
  const [openExcelView, setOpenExcelView] = useState(false);
  const clusterId = 21186;

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