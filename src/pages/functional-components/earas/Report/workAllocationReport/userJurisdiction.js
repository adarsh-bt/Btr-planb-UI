import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

// User Roles based on User Business Rules:
// 1. Taluk level roles: Field Inspector, Taluk Level Data Viewer, Taluk Level Approver
export const TALUK_ROLES = [
  'Field Inspector',
  'Taluk Level Data Viewer',
  'Taluk Level Approver'
];

// 2. District level roles: District Level Data Viewer, District Level Approver
export const DISTRICT_ROLES = [
  'District Level Data Viewer',
  'District Level Approver'
];

// 3. Directorate level roles: State Level Approver, Other Users, EARAS Admin, Super Admin, IT Admin
export const DIRECTORATE_ROLES = [
  'State Level Approver',
  'Other Users',
  'EARAS Admin',
  'Super Admin',
  'IT Admin'
];

/**
 * Resilient API fetcher for Work Allocation Endpoints.
 * Tries candidates with and without /btr-service prefix to support both
 * gateway proxies and direct local Spring Boot server environments.
 */
export async function fetchWorkAllocationApi(endpointPath) {
  const token = localStorage.getItem('token');
  const agriYear = AuthService.agriyear() || localStorage.getItem('activeAgriYear') || '2025-2026';
  const BASE_URL = mainapi.BTR_API;

  const separator = endpointPath.includes('?') ? '&' : '?';
  const pathWithAgri = `${endpointPath}${separator}agriYear=${encodeURIComponent(agriYear)}`;
  const cleanPath = pathWithAgri.startsWith('/') ? pathWithAgri : `/${pathWithAgri}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const candidates = [
    `${BASE_URL}/btr-service${cleanPath}`,
    `${BASE_URL}${cleanPath}`
  ];

  const uniqueUrls = [...new Set(candidates)];
  let lastResponse = null;
  let lastError = null;

  for (const url of uniqueUrls) {
    try {
      const res = await fetch(url, { headers });
      if (res.status !== 404) {
        return res;
      }
      lastResponse = res;
    } catch (err) {
      lastError = err;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error(`Failed to fetch ${endpointPath}`);
}

/**
 * Resolves current logged-in user role & assigned jurisdiction (District/Taluk).
 * Follows the same logical flow as Cluster View.
 */
export function getCurrentUserJurisdiction() {
  const tokenRole = AuthService.getrole();
  const localDes = localStorage.getItem('des');
  const loggedUser = AuthService.getusername() || localStorage.getItem('user') || 'System User';

  let role = localDes || tokenRole || 'State Level Approver';
  if (Array.isArray(role)) role = role[0];

  // Retrieve user's assigned jurisdiction from login session/localStorage
  const assignedDistrict = localStorage.getItem('userDistrict') || localStorage.getItem('dis') || 'Thiruvananthapuram';
  const assignedTaluk = localStorage.getItem('userTaluk') || 'Neyyattinkara';

  let level = 'directorate';
  if (TALUK_ROLES.some((r) => r.toLowerCase() === String(role).toLowerCase())) {
    level = 'taluk';
  } else if (DISTRICT_ROLES.some((r) => r.toLowerCase() === String(role).toLowerCase())) {
    level = 'district';
  } else {
    level = 'directorate';
  }

  return {
    user: loggedUser,
    role,
    level, // 'directorate' | 'district' | 'taluk'
    district: assignedDistrict,
    taluk: assignedTaluk
  };
}

/**
 * Determines the entry point URL for a user based on their jurisdiction level.
 * Both Directorate and District level users start at state view showing all 14 districts.
 */
export function getJurisdictionEntryUrl() {
  const jur = getCurrentUserJurisdiction();
  if (jur.level === 'taluk') {
    return `/kerala_work_allocation_report/zone/${encodeURIComponent(jur.district)}/${encodeURIComponent(jur.taluk)}`;
  }
  return '/kerala_work_allocation_report';
}

/**
 * Filters a list of report items (districts, taluks, or zones) strictly by user's jurisdiction
 */
export function filterByJurisdiction(data = [], level = 'directorate', userDistrict = '', userTaluk = '') {
  if (!data || data.length === 0) return [];
  if (level === 'directorate') return data;

  if (level === 'district') {
    return data.filter((item) => {
      const name = item.name || item.district || item.districtName || '';
      return name.toLowerCase() === userDistrict.toLowerCase();
    });
  }

  if (level === 'taluk') {
    return data.filter((item) => {
      const name = item.name || item.taluk || item.talukName || '';
      return name.toLowerCase() === userTaluk.toLowerCase();
    });
  }

  return data;
}

/**
 * Normalizes LocationDetails contract from backend into standard flat row properties
 * expected by WorkAllocationTable component.
 */
export function normalizeLocationData(item, index = 0) {
  if (!item) return {};

  const villageRecords = item.villageRecords || {};
  const excludedArea = item.excludedArea || {};
  const estimationObj = item.areaAvailableForEstimation || {};
  const noOfPlots = estimationObj.noOfPlots || {};
  const areaInCents = estimationObj.areaInCents || {};

  const wetInCents = Number(villageRecords.wet ?? item.wetInCents ?? item.wetArea ?? 0);
  const dryInCents = Number(villageRecords.dry ?? item.dryInCents ?? item.dryArea ?? 0);
  const totalInCents = Number(villageRecords.total ?? item.totalInCents ?? (wetInCents + dryInCents));

  const forestAreas = Number(excludedArea.forestArea ?? item.forestAreas ?? 0);
  const plantationArea = Number(excludedArea.plantationArea ?? item.plantationArea ?? 0);
  const waterBodiesArea = Number(excludedArea.areaOfWaterBodies ?? item.waterBodiesArea ?? 0);
  const otherAreas = Number(excludedArea.others ?? item.otherAreas ?? 0);

  const plotsWet = Number(noOfPlots.wet ?? item.plotsWet ?? 0);
  const plotsDry = Number(noOfPlots.dry ?? item.plotsDry ?? 0);
  const plotsTotal = Number(noOfPlots.total ?? item.plotsTotal ?? (plotsWet + plotsDry));

  const availWetArea = Number(areaInCents.wet ?? item.availWetArea ?? wetInCents ?? 0);
  const availDryArea = Number(areaInCents.dry ?? item.availDryArea ?? dryInCents ?? 0);
  const availTotalArea = Number(areaInCents.total ?? item.availTotalArea ?? (availWetArea + availDryArea));

  const nameVal = item.name || item.districtName || item.talukName || item.district || item.taluk || item.panchayat || 'N/A';
  const blockNameVal = item.blockName ? String(item.blockName).trim() : 'General Block';

  return {
    ...item,
    id: item.id,
    name: nameVal,
    district: item.district || nameVal,
    taluk: item.taluk || nameVal,
    panchayat: blockNameVal,
    blockId: item.blockId,
    blockName: blockNameVal,
    zoneCode: item.zoneCode || (item.name ? `ZN-${String(item.id || index + 1).padStart(2, '0')}` : 'N/A'),
    zoneName: item.zoneName || nameVal,
    wetInCents,
    dryInCents,
    totalInCents,
    forestAreas,
    plantationArea,
    waterBodiesArea,
    otherAreas,
    plotsWet,
    plotsDry,
    plotsTotal,
    availWetArea,
    availDryArea,
    availTotalArea
  };
}
