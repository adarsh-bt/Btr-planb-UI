import AuthService from 'pages/authentication/services/authservice';

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
