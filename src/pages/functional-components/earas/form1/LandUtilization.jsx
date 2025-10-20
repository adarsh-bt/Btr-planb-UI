// ...other imports remain unchanged
import { useState, useMemo } from "react";
import {
  Grid,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { toast } from "react-toastify";
import Breadcrumb from "routes/Breadcrumb";

const initialLandUtilizationRecord = {
//   luId: "",
  clusterId: 0,
  userId: "",
  clusterLabel: "",
  buildingArea: 0.0,
  nonAgriculturalArea: 0.0,
  barrenArea: 0.0,
  miscellaneousTreesArea: 0.0,
  permanentPasturesArea: 0.0,
  cultivableWasteArea: 0.0,
  otherFallowArea: 0.0,
  currentFallowArea: 0.0,
  areaUnderSocialForestry: 0.0,
  waterloggedArea: 0.0,
  stillWaterLand: 0.0,
  marshyLand: 0.0,
  netAreasSown: 0.0,
};

const staticPayload = [
  {
    // luId: "0fee6cd3-cd53-497b-88a5-2174664c7ec3",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "N1",
    netAreasSown: 234.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "584ee22d-cc63-4362-97f1-81315dfba5f2",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "N1",
    netAreasSown: 234.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "20025995-dce0-4ee2-aed8-58a99365a497",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "E1",
    netAreasSown: 235.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "ea04ee77-df5d-4245-a40e-d307825af81d",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "E1",
    netAreasSown: 235.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "6b2bb545-f6b8-44b4-b335-1808af06057b",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "S1",
    netAreasSown: 280.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "3638fb80-2c8f-4b91-8b94-9da9b3b5991c",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "K",
    netAreasSown: 28.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "ec70b353-e17b-4b0d-87cd-6663745bf18c",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "W1",
    netAreasSown: 230.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "4601a2a1-6719-4630-b408-1133add4b1a2",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "W1",
    netAreasSown: 230.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
  {
    // luId: "83fb0c11-3fbe-43d2-a6df-cee3727995d6",
    clusterId: 63,
    userId: "NA",
    clusterLabel: "W1",
    netAreasSown: 230.0,
    buildingArea: 0,
    nonAgriculturalArea: 0,
    barrenArea: 0,
    miscellaneousTreesArea: 0,
    permanentPasturesArea: 0,
    cultivableWasteArea: 0,
    otherFallowArea: 0,
    currentFallowArea: 0,
    areaUnderSocialForestry: 0,
    waterloggedArea: 0,
    stillWaterLand: 0,
    marshyLand: 0,
  },
];

const LandUtilization = () => {
  const [luData] = useState(staticPayload); // ✅ Using static data
  const [activeTab, setActiveTab] = useState(0);
  const PLACEHOLDER_CLUSTER_ID = 63;
const [filterText, setFilterText] = useState("");

  // ❌ Commenting the fetch call
  /*
  useEffect(() => {
    const fetchData = async () => { ... };
    fetchData();
  }, []);
  */

  // --- Grouping and Aggregation Logic ---
  const groupedLuData = useMemo(() => {
    return luData.reduce((acc, current) => {
      const label = current.clusterLabel;
      if (!acc[label]) {
        acc[label] = {
          records: [],
          totalNetAreasSown: 0,
        };
      }
      acc[label].records.push(current);
      acc[label].totalNetAreasSown += current.netAreasSown;
      return acc;
    }, {});
  }, [luData]);

  const clusterLabels = useMemo(() => Object.keys(groupedLuData).sort(), [groupedLuData]);

  const currentClusterLabel = clusterLabels[activeTab];
  const currentClusterData = groupedLuData[currentClusterLabel]?.records || [];
  const currentClusterTotalArea = groupedLuData[currentClusterLabel]?.totalNetAreasSown || 0;

  // --- UPDATED: Ensure all Area and Land keys are included ---
  const areaKeys = Object.keys(initialLandUtilizationRecord).filter(
    (key) => key.endsWith("Area") || key.endsWith("Land") || key === "netAreasSown"
  );
const filteredClusterData = useMemo(() => {
  if (!filterText.trim()) return currentClusterData;
  return currentClusterData.filter((record) =>
    record.userId.toLowerCase().includes(filterText.toLowerCase())
  );
}, [filterText, currentClusterData]);

const handleDownloadCSV = () => {
  const headers = ["Sl. No", ...areaKeys.map(formatKey), "User"];
  const rows = filteredClusterData.map((record, index) => {
    const values = areaKeys.map((key) => record[key]?.toFixed(2) || "0.00");
    return [index + 1, ...values, record.userId];
  });

  const csvContent =
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `LandUtilization_${currentClusterLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  // --- UPDATED: Expanded key formatting for readable headers ---
  const formatKey = (key) => {
    switch (key) {
      case 'buildingArea': return 'Building Area';
      case 'nonAgriculturalArea': return 'Non-Agricultural Area';
      case 'barrenArea': return 'Barren & Uncultivable Area';
      case 'miscellaneousTreesArea': return 'Area under Misc. Trees & Crops';
      case 'permanentPasturesArea': return 'Permanent Pastures & Grazing Area';
      case 'cultivableWasteArea': return 'Cultivable Waste Area';
      case 'otherFallowArea': return 'Other Fallow Area';
      case 'currentFallowArea': return 'Current Fallow Area';
      case 'areaUnderSocialForestry': return 'Area under Social Forestry';
      case 'waterloggedArea': return 'Waterlogged Area';
      case 'stillWaterLand': return 'Still Water Land';
      case 'marshyLand': return 'Marshy Land';
      case 'netAreasSown': return 'Net Area Sown';
      default: return key;
    }
  };

  // The rest of the component (UI Render)
  return (
    <Grid container spacing={3}>
      <Breadcrumb />
      <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          Land Utilization Details 
        </Typography>

        <Paper elevation={3} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", px: 2, pt: 2, pb: 1, gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#05307a", minWidth: "max-content" }}>
              Cluster:
            </Typography>
            <Tabs
              value={activeTab}
              onChange={(e, newVal) => setActiveTab(newVal)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ flex: 1 }}
            >
              {clusterLabels.map((label, index) => {
                const totalArea = groupedLuData[label]?.totalNetAreasSown || 0;
                return (
                  <Tab
                    key={label}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {`${label} (${totalArea.toFixed(2)})`}
                      </Box>
                    }
                    id={`tab-${index}`}
                  />
                );
              })}
            </Tabs>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Records for Cluster Label: <strong>{currentClusterLabel}</strong>
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
  <Box sx={{ flex: 1 }}>
    <input
      type="text"
      placeholder="Filter by User ID..."
      value={filterText}
      onChange={(e) => setFilterText(e.target.value)}
      style={{
        padding: "8px 12px",
        fontSize: "14px",
        width: "100%",
        maxWidth: 300,
        border: "1px solid #ccc",
        borderRadius: 4
      }}
    />
  </Box>
  <Box>
    <button
      onClick={handleDownloadCSV}
      style={{
        padding: "8px 16px",
        backgroundColor: "#05307a",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer"
      }}
    >
      Download CSV
    </button>
  </Box>
</Box>

          {/* --- UPDATED: TableContainer with Horizontal Scroll --- */}
          <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
            <Table stickyHeader sx={{ minWidth: 1600 }}> {/* Added minWidth for effective scrolling */}
              <TableHead>
                <TableRow>
                {["Sl. No", ...areaKeys.map(formatKey), "User"].map((col) => (

                    <TableCell
                      key={col}
                      align={col.includes("Area") || col.includes("Sown") || col.includes("Land") ? "right" : "left"}
                      sx={{ 
                        bgcolor: "#05307a", 
                        color: "white", 
                        fontWeight: "bold",
                        p: '10px 8px', // Adjusted padding
                        fontSize: '0.75rem', // Adjusted font size
                        minWidth: col === 'User ID' ? 120 : (col.includes('Area') || col.includes('Sown') || col.includes('Land') ? 120 : 60), 
                        lineHeight: 1.2
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClusterData.map((record, index) => (

                  <TableRow key={index} hover> {/* Using index as key since luId is commented out */}
                    <TableCell align="left" sx={{ p: '10px 8px' }}>{index + 1}</TableCell>
                    
                    {areaKeys.map((key) => (
                      <TableCell key={key} align="right" sx={{ p: '10px 8px' }}>
                        {record[key]?.toFixed(2) || "0.00"}
                      </TableCell>
                    ))}
                    <TableCell align="left" sx={{ fontFamily: "monospace", p: '10px 8px' }}>
                      {record.userId}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                  {/* --- CORRECTED: colSpan is now 2 (Sl. No + User ID) --- */}
                  <TableCell colSpan={2} align="right" sx={{ fontWeight: "bold" }}>
                    Total Net Areas Sown:
                  </TableCell>
                  {areaKeys.map((key) => (
                    <TableCell key={`total-${key}`} align="right" sx={{ fontWeight: "bold" }}>
                      {key === "netAreasSown" ? currentClusterTotalArea.toFixed(2) : ""}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">
              <strong>Summary:</strong> The total <strong>Net Area Sown</strong> for cluster label{" "}
              <strong>{currentClusterLabel}</strong> is <strong>{currentClusterTotalArea.toFixed(2)}</strong>.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Grid>
  );
};

export default LandUtilization;