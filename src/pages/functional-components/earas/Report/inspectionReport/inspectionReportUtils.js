import AuthService from 'pages/authentication/services/authservice';

export const SEASON_OPTIONS = [
  { value: 1, label: 'Autumn' },
  { value: 2, label: 'Winter' },
  { value: 3, label: 'Summer' }
];

export function buildAgriMonthOptions() {
  const agriYear = (AuthService && AuthService.agriyear ? AuthService.agriyear() : null) || localStorage.getItem('agriYear') || '2025-2026';
  const parts = String(agriYear).split('-');
  const startYear = parseInt(parts[0], 10) || 2025;
  const endYear = parseInt(parts[1], 10) || startYear + 1;

  const monthDefs = [
    { value: 7, name: 'July', year: startYear },
    { value: 8, name: 'August', year: startYear },
    { value: 9, name: 'September', year: startYear },
    { value: 10, name: 'October', year: startYear },
    { value: 11, name: 'November', year: startYear },
    { value: 12, name: 'December', year: startYear },
    { value: 1, name: 'January', year: endYear },
    { value: 2, name: 'February', year: endYear },
    { value: 3, name: 'March', year: endYear },
    { value: 4, name: 'April', year: endYear },
    { value: 5, name: 'May', year: endYear },
    { value: 6, name: 'June', year: endYear }
  ];

  return monthDefs.map((m) => ({
    value: m.value,
    label: `${m.name} ${m.year}`
  }));
}

export function getMonthNumber(val) {
  if (!val && val !== 0) return 0;
  if (typeof val === 'number') return val;
  const num = parseInt(val, 10);
  if (!isNaN(num)) return num;
  const options = buildAgriMonthOptions();
  const found = options.find((m) => m.label.toLowerCase().includes(String(val).toLowerCase()));
  return found ? found.value : 0;
}

export function getMonthLabel(val) {
  if (!val && val !== 0) return '';
  const num = getMonthNumber(val);
  const options = buildAgriMonthOptions();
  const found = options.find((m) => m.value === num);
  return found ? found.label : String(val);
}

export function getSeasonLabel(val) {
  const num = Number(val) || 1;
  const found = SEASON_OPTIONS.find((s) => s.value === num);
  return found ? found.label : 'Autumn';
}

export function categorizeDesignationCounts(countsArr) {
  if (!Array.isArray(countsArr)) return { si: 0, tso: 0, dlo: 0 };
  let si = 0;
  let tso = 0;
  let dlo = 0;

  countsArr.forEach((item) => {
    const desigId = Number(item.designationId);
    const count = Number(item.totalCount) || Number(item.count) || 0;

    if (desigId === 2) {
      si += count;
    } else if (desigId === 3) {
      tso += count;
    } else {
      dlo += count;
    }
  });

  return { si, tso, dlo };
}

export const DISTRICT_TALUKS = {
  'Thiruvananthapuram': ['Neyyattinkara', 'Kattakada', 'Nedumangad', 'Thiruvananthapuram', 'Chirayinkeezhu'],
  'Kollam': ['Kollam', 'Kunnathur', 'Karunagappally', 'Kottarakkara', 'Pathanapuram'],
  'Pathanamthitta': ['Adoor', 'Kozhencherry', 'Mallappally', 'Ranni', 'Thiruvalla'],
  'Alappuzha': ['Ambalappuzha', 'Cherthala', 'Karthikappally', 'Kuttanad', 'Mavelikkara'],
  'Kottayam': ['Changanassery', 'Kanjirappally', 'Kottayam', 'Meenachil', 'Vaikom'],
  'Idukki': ['Devikulam', 'Idukki', 'Peerumedu', 'Thodupuzha', 'Udumbanchola'],
  'Ernakulam': ['Aluva', 'Kanayannur', 'Kochi', 'Kothamangalam', 'Kunnathunad', 'Muvattupuzha', 'North Paravur'],
  'Thrissur': ['Chavakkad', 'Kodungallur', 'Mukundapuram', 'Thalapilly', 'Thrissur'],
  'Palakkad': ['Alathur', 'Chittur', 'Mannarkad', 'Ottapalam', 'Palakkad'],
  'Malappuram': ['Ernad', 'Nilambur', 'Perinthalmanna', 'Ponnani', 'Tirur', 'Tirurangadi'],
  'Kozhikode': ['Kozhikode', 'Koyilandy', 'Thamarassery', 'Vatakara'],
  'Wayanad': ['Mananthavady', 'Sulthan Bathery', 'Vythiri'],
  'Kannur': ['Kannur', 'Taliparamba', 'Thalassery'],
  'Kasaragod': ['Hosdurg', 'Kasaragod']
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SEASON_MONTHS = {
  Winter: ['November', 'December', 'January', 'February'],
  Summer: ['March', 'April', 'May', 'June'],
  Autumn: ['July', 'August', 'September', 'October']
};

export function generateInspectionMasterData() {
  const master = {};

  Object.entries(DISTRICT_TALUKS).forEach(([district, taluks], dIdx) => {
    master[district] = {
      districtName: district,
      taluks: {}
    };

    taluks.forEach((taluk, tIdx) => {
      const zones = [
        { name: `${taluk} Zone 1`, code: `ZN-${dIdx + 1}${tIdx + 1}A` },
        { name: `${taluk} Zone 2`, code: `ZN-${dIdx + 1}${tIdx + 1}B` },
        { name: `${taluk} Zone 3`, code: `ZN-${dIdx + 1}${tIdx + 1}C` }
      ];

      master[district].taluks[taluk] = {
        talukName: taluk,
        zones: zones.map(zone => {
          const monthly = {};
          MONTHS.forEach(m => {
            const f1_wet_si = Math.floor((dIdx * 3 + tIdx * 2 + m.length * 5) % 9);
            const f1_wet_tso = Math.floor((dIdx * 2 + tIdx * 3 + m.length * 3) % 7);
            const f1_wet_dlo = Math.floor((dIdx * 1 + tIdx * 1 + m.length * 2) % 5);

            const f1_dry_si = Math.floor((dIdx * 2 + tIdx * 4 + m.length * 4) % 8);
            const f1_dry_tso = Math.floor((dIdx * 3 + tIdx * 1 + m.length * 2) % 6);
            const f1_dry_dlo = Math.floor((dIdx * 1 + tIdx * 2 + m.length * 3) % 4);

            const cce_wet_si = Math.floor((dIdx * 4 + tIdx * 1 + m.length * 3) % 10);
            const cce_wet_tso = Math.floor((dIdx * 1 + tIdx * 4 + m.length * 4) % 8);
            const cce_wet_dlo = Math.floor((dIdx * 2 + tIdx * 2 + m.length * 1) % 6);

            const cce_dry_si = Math.floor((dIdx * 3 + tIdx * 3 + m.length * 2) % 9);
            const cce_dry_tso = Math.floor((dIdx * 2 + tIdx * 1 + m.length * 5) % 7);
            const cce_dry_dlo = Math.floor((dIdx * 4 + tIdx * 2 + m.length * 1) % 5);

            monthly[m] = {
              form1: {
                si: f1_wet_si + f1_dry_si,
                tso: f1_wet_tso + f1_dry_tso,
                dlo: f1_wet_dlo + f1_dry_dlo
              },
              cce: {
                si: cce_wet_si + cce_dry_si,
                tso: cce_wet_tso + cce_dry_tso,
                dlo: cce_wet_dlo + cce_dry_dlo
              }
            };
          });

          return {
            zoneName: zone.name,
            zoneCode: zone.code,
            monthlyData: monthly
          };
        })
      };
    });
  });

  return master;
}

export const MASTER_INSPECTION_DATA = generateInspectionMasterData();

export function calculateInspectionTotals(monthlyData, targetKey, selectedSeason, filterType, fromMonth, toMonth, singleMonth) {
  let startIndex = 0;
  let endIndex = MONTHS.length - 1;

  let allowedMonths = MONTHS;
  if (selectedSeason) {
    allowedMonths = SEASON_MONTHS[selectedSeason] || MONTHS;
  }

  if (filterType === 'single' && singleMonth) {
    startIndex = MONTHS.indexOf(singleMonth);
    endIndex = startIndex;
  } else {
    startIndex = fromMonth ? MONTHS.indexOf(fromMonth) : 0;
    endIndex = toMonth ? MONTHS.indexOf(toMonth) : MONTHS.length - 1;
  }

  let siTotal = 0;
  let tsoTotal = 0;
  let dloTotal = 0;

  for (let i = startIndex; i <= endIndex; i++) {
    const month = MONTHS[i];
    if (!allowedMonths.includes(month)) continue;

    const mData = monthlyData[month]?.[targetKey];
    if (!mData) continue;

    siTotal += mData.si || 0;
    tsoTotal += mData.tso || 0;
    dloTotal += mData.dlo || 0;
  }

  return {
    si: siTotal,
    tso: tsoTotal,
    dlo: dloTotal,
    total: siTotal + tsoTotal + dloTotal
  };
}

export function generateSingleModuleExcelReport({
  reportTitle,
  inspectionTypeLabel,
  currentLevel,
  selectedDistrict,
  selectedTaluk,
  userRole,
  userName,
  selectedSeason,
  filterType,
  fromMonth,
  toMonth,
  singleMonth,
  rowsData
}) {
  const levelTitle = currentLevel === 'state' ? 'District' : currentLevel === 'district' ? 'Taluk' : 'Zone';
  const currentDateStr = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
  });

  const seasonText = getSeasonLabel(selectedSeason);
  let monthText = 'All Months';
  if (filterType === 'single' && singleMonth) {
    monthText = singleMonth;
  } else if (filterType === 'range') {
    if (fromMonth && toMonth) monthText = `${fromMonth} to ${toMonth}`;
    else if (fromMonth) monthText = `From ${fromMonth}`;
    else if (toMonth) monthText = `Until ${toMonth}`;
  }

  const scopeText = currentLevel === 'state'
    ? 'State Level (All Districts)'
    : currentLevel === 'district'
      ? `District Level (${selectedDistrict})`
      : `Taluk Level (${selectedDistrict} - ${selectedTaluk})`;

  const totals = rowsData.reduce((acc, r) => ({
    si: acc.si + r.si, tso: acc.tso + r.tso, dlo: acc.dlo + r.dlo, total: acc.total + r.total
  }), { si: 0, tso: 0, dlo: 0, total: 0 });

  const esc = (str) => String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const xmlDoc = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#1A237E"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1A237E" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A237E"/>
   <Interior ss:Color="#E8EAF6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="BoldCell">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="TotalRow">
   <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#1A237E"/>
   <Interior ss:Color="#E8EAF6" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="CenterCell">
   <Alignment ss:Horizontal="Center"/>
  </Style>
 </Styles>

 <!-- SHEET 1: METADATA & SUMMARY -->
 <Worksheet ss:Name="Metadata &amp; Summary">
  <Table>
   <Column ss:Width="220"/>
   <Column ss:Width="280"/>
   <Row ss:Height="30">
    <Cell ss:StyleID="Title" ss:MergeAcross="1"><Data ss:Type="String">${esc(reportTitle.toUpperCase())} — METADATA &amp; ABSTRACT</Data></Cell>
   </Row>
   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Report Metadata Section -->
   <Row><Cell ss:StyleID="SubHeader" ss:MergeAcross="1"><Data ss:Type="String">REPORT METADATA DETAILS</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Report Type:</Data></Cell><Cell><Data ss:Type="String">${esc(inspectionTypeLabel)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Generated Date &amp; Time:</Data></Cell><Cell><Data ss:Type="String">${esc(currentDateStr)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Generated By User / Role:</Data></Cell><Cell><Data ss:Type="String">${esc(userName)} (${esc(userRole)})</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Jurisdiction Scope:</Data></Cell><Cell><Data ss:Type="String">${esc(scopeText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Season Filter:</Data></Cell><Cell><Data ss:Type="String">${esc(seasonText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Month Filter:</Data></Cell><Cell><Data ss:Type="String">${esc(monthText)}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Agriculture Year:</Data></Cell><Cell><Data ss:Type="String">2025-2026</Data></Cell></Row>

   <Row><Cell><Data ss:Type="String"></Data></Cell></Row>

   <!-- Inspection Abstract Section -->
   <Row><Cell ss:StyleID="SubHeader" ss:MergeAcross="1"><Data ss:Type="String">INSPECTION SUMMARY TOTALS</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">Total Inspections Conducted:</Data></Cell><Cell ss:StyleID="BoldCell"><Data ss:Type="Number">${totals.total}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">SI Inspections (Supervising Inspectors):</Data></Cell><Cell><Data ss:Type="Number">${totals.si}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">TSO Inspections (Taluk Statistical Officers):</Data></Cell><Cell><Data ss:Type="Number">${totals.tso}</Data></Cell></Row>
   <Row><Cell ss:StyleID="BoldCell"><Data ss:Type="String">DLO Inspections (District Level Officers):</Data></Cell><Cell><Data ss:Type="Number">${totals.dlo}</Data></Cell></Row>
  </Table>
 </Worksheet>

 <!-- SHEET 2: DETAILED RECORDS -->
 <Worksheet ss:Name="${esc(inspectionTypeLabel)} Records">
  <Table>
   <Column ss:Width="60"/>
   <Column ss:Width="200"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="170"/>
   <Row ss:Height="25">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Sl. No</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">${esc(levelTitle)} Name</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">SI Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">TSO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">DLO Inspections</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Total Inspections Conducted</Data></Cell>
   </Row>
   ${rowsData.map((r, i) => `
   <Row>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${i + 1}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(r.name)}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.si}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.tso}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.dlo}</Data></Cell>
    <Cell ss:StyleID="CenterCell"><Data ss:Type="Number">${r.total}</Data></Cell>
   </Row>`).join('')}
   <Row ss:Height="24">
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String"></Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="String">TOTAL</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${totals.si}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${totals.tso}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${totals.dlo}</Data></Cell>
    <Cell ss:StyleID="TotalRow"><Data ss:Type="Number">${totals.total}</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

  return xmlDoc;
}
