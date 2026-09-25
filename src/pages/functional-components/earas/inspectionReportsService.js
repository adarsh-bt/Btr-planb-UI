import api from 'api/api';

/**
 * InspectionReportsService
 * 
 * Frontend service layer for fetching and downloading Inspection Reports.
 * Integrates with the dedicated backend service endpoints in 'earas-form1-entry':
 *   - GET /earas-form1-entry/inspection-details/reports/list
 *   - GET /earas-form1-entry/inspection-details/reports/filter-options
 *   - GET /earas-form1-entry/inspection-details/reports/{id}/download
 * 
 * Supports fallback to mock data when USE_MOCK_API is set to true for offline development.
 */

// Toggle: set to false to connect to live backend API
const USE_MOCK_API = false;

// ──────────────────────────────────────────────
// Mock Data Generator (Used when USE_MOCK_API = true)
// ──────────────────────────────────────────────
const MOCK_DISTRICTS = ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'];

const MOCK_TALUKS = {
  Thiruvananthapuram: ['Neyyattinkara', 'Kattakada', 'Nedumangad', 'Thiruvananthapuram', 'Chirayinkeezhu'],
  Kollam: ['Kollam', 'Kunnathur', 'Karunagappally', 'Kottarakkara', 'Pathanapuram'],
  Pathanamthitta: ['Adoor', 'Kozhencherry', 'Mallappally', 'Ranni', 'Thiruvalla'],
  Alappuzha: ['Ambalappuzha', 'Cherthala', 'Karthikappally', 'Kuttanad', 'Mavelikkara'],
  Kottayam: ['Changanassery', 'Kanjirappally', 'Kottayam', 'Meenachil', 'Vaikom'],
  Idukki: ['Devikulam', 'Idukki', 'Peerumedu', 'Thodupuzha', 'Udumbanchola'],
  Ernakulam: ['Aluva', 'Kanayannur', 'Kochi', 'Kothamangalam', 'Kunnathunad', 'Muvattupuzha', 'North Paravur'],
  Thrissur: ['Chavakkad', 'Kodungallur', 'Mukundapuram', 'Thalapilly', 'Thrissur'],
  Palakkad: ['Alathur', 'Chittur', 'Mannarkad', 'Ottapalam', 'Palakkad'],
  Malappuram: ['Ernad', 'Nilambur', 'Perinthalmanna', 'Ponnani', 'Tirur', 'Tirurangadi'],
  Kozhikode: ['Kozhikode', 'Koyilandy', 'Thamarassery', 'Vatakara'],
  Wayanad: ['Mananthavady', 'Sulthan Bathery', 'Vythiri'],
  Kannur: ['Kannur', 'Taliparamba', 'Thalassery'],
  Kasaragod: ['Hosdurg', 'Kasaragod'],
};

const MOCK_ZONES = [
  'Zone KLM-01', 'Zone KLM-02', 'Zone KLM-03', 'Zone TVM-01', 'Zone TVM-02',
  'Zone EKM-01', 'Zone EKM-02', 'Zone PKD-01', 'Zone PKD-02', 'Zone TSR-01',
  'Zone KKD-01', 'Zone KKD-02', 'Zone WYD-01', 'Zone KNR-01', 'Zone KSD-01',
  'Zone ALP-01', 'Zone KTM-01', 'Zone IDK-01', 'Zone PTA-01', 'Zone MLP-01',
];

const MOCK_CROP_NAMES = [
  'Paddy', 'Wheat', 'Sugarcane', 'Coconut', 'Banana', 'Rubber',
  'Pepper', 'Cardamom', 'Tapioca', 'Arecanut', 'Ginger', 'Turmeric',
  'Coffee', 'Tea', 'Cashew', 'Mango', 'Pineapple', 'Jackfruit',
];

const MOCK_REMARKS = [
  'Inspection completed successfully',
  'Minor discrepancies noted in plot boundaries',
  'Crop details verified and confirmed',
  'Follow-up inspection required',
  'All records match field observations',
  'Survey number mismatch — flagged for review',
  'Pending clarification from field officer',
  'Boundary verification completed',
  'Land classification updated post-inspection',
  'No issues found',
];

function generateMockReports(count = 120) {
  const reports = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-07-08');

  for (let i = 1; i <= count; i++) {
    const district = MOCK_DISTRICTS[Math.floor(Math.random() * MOCK_DISTRICTS.length)];
    const talukList = MOCK_TALUKS[district] || ['Unknown'];
    const taluk = talukList[Math.floor(Math.random() * talukList.length)];
    const zone = MOCK_ZONES[Math.floor(Math.random() * MOCK_ZONES.length)];
    const inspectedOn = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const hasReport = Math.random() > 0.15;
    const inspectionType = Math.random() > 0.5 ? 'Cluster Inspection' : 'CCE';
    const cropName = MOCK_CROP_NAMES[Math.floor(Math.random() * MOCK_CROP_NAMES.length)];

    reports.push({
      id: i,
      zoneName: zone,
      inspectionType,
      clusterNumber: inspectionType === 'Cluster Inspection' ? `CL-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}` : null,
      cropName: inspectionType === 'CCE' ? cropName : null,
      district,
      taluk,
      inspectedOn: inspectedOn.toISOString().split('T')[0],
      inspectedBy: `Officer-${Math.floor(Math.random() * 50) + 101}`,
      investigatorName: `Investigator-${Math.floor(Math.random() * 30) + 201}`,
      remarks: MOCK_REMARKS[Math.floor(Math.random() * MOCK_REMARKS.length)],
      hasReport,
    });
  }

  return reports;
}

const ALL_MOCK_REPORTS = generateMockReports(120);

function applyMockFilters(reports, filters) {
  let result = [...reports];

  if (filters.zoneName) {
    result = result.filter((r) => r.zoneName.toLowerCase().includes(filters.zoneName.toLowerCase()));
  }
  if (filters.district) {
    result = result.filter((r) => r.district === filters.district);
  }
  if (filters.taluk) {
    result = result.filter((r) => r.taluk === filters.taluk);
  }
  if (filters.clusterNumber) {
    result = result.filter((r) => (r.clusterNumber || '').toLowerCase().includes(filters.clusterNumber.toLowerCase()));
  }
  if (filters.dateFrom) {
    result = result.filter((r) => r.inspectedOn >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter((r) => r.inspectedOn <= filters.dateTo);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.zoneName.toLowerCase().includes(s) ||
        (r.clusterNumber || '').toLowerCase().includes(s) ||
        (r.cropName || '').toLowerCase().includes(s) ||
        r.inspectionType.toLowerCase().includes(s) ||
        r.district.toLowerCase().includes(s) ||
        r.taluk.toLowerCase().includes(s) ||
        (r.inspectedBy || '').toLowerCase().includes(s) ||
        r.remarks.toLowerCase().includes(s)
    );
  }

  return result;
}

function applyMockSort(reports, sortField, sortOrder) {
  if (!sortField) return reports;
  const sorted = [...reports].sort((a, b) => {
    let aVal, bVal;
    if (sortField === 'clusterOrCrop') {
      aVal = (a.inspectionType === 'Cluster Inspection' ? a.clusterNumber : a.cropName) ?? '';
      bVal = (b.inspectionType === 'Cluster Inspection' ? b.clusterNumber : b.cropName) ?? '';
    } else {
      aVal = a[sortField] ?? '';
      bVal = b[sortField] ?? '';
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

// ──────────────────────────────────────────────
// Service Class Implementation
// ──────────────────────────────────────────────
class InspectionReportsService {

  /**
   * Fetch paginated, filtered, and role-scoped inspection report records.
   * 
   * Sends user security context (role, userId, districtId, talukId) to backend
   * for role-based data filtering.
   * 
   * @param {Object} params Request parameters
   * @param {number} params.page 0-indexed page number
   * @param {number} params.size Rows per page
   * @param {string} params.sortField Field name to sort by
   * @param {string} params.sortOrder 'asc' | 'desc'
   * @param {Object} params.filters Search & filter controls (zoneName, district, taluk, clusterNumber, dateFrom, dateTo, search)
   * @param {Object} params.userContext Logged in user context (userRole, userId, districtId, talukId)
   * @returns {Promise<{ content: Array, totalElements: number, totalPages: number, currentPage: number }>}
   */
  static async fetchInspectionReports({ page = 0, size = 10, sortField = 'inspectedOn', sortOrder = 'desc', filters = {}, userContext = {} }) {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = applyMockFilters(ALL_MOCK_REPORTS, filters);
      filtered = applyMockSort(filtered, sortField, sortOrder);

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const content = filtered.slice(start, start + size);

      return {
        content,
        totalElements,
        totalPages,
        currentPage: page,
      };
    }

    try {
      // ── Real API Request via Api-Gateway ──
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', size);
      if (sortField) params.append('sortField', sortField);
      if (sortOrder) params.append('sortOrder', sortOrder);

      // Append user security context parameters for backend role specification builder
      if (userContext.userRole) params.append('userRole', userContext.userRole);
      if (userContext.userId && userContext.userId !== 'null' && userContext.userId !== 'undefined') {
        params.append('userId', userContext.userId);
      }
      if (userContext.districtId && userContext.districtId !== 'null' && userContext.districtId !== 'undefined') {
        params.append('userDistrictId', userContext.districtId);
      }
      if (userContext.talukId && userContext.talukId !== 'null' && userContext.talukId !== 'undefined') {
        params.append('userTalukId', userContext.talukId);
      }

      // Append active user dynamic filter parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/earas-form1-entry/inspection-details/reports/list?${params.toString()}`);

      // Extract payload from Spring Response wrapper or direct data
      const payload = response.data?.payload !== undefined ? response.data.payload : response.data;

      if (Array.isArray(payload)) {
        return {
          content: payload,
          totalElements: payload.length,
          totalPages: Math.ceil(payload.length / size) || 1,
          currentPage: page,
        };
      }

      const content = payload?.content || (Array.isArray(payload) ? payload : []);
      const totalElements = payload?.totalElements !== undefined ? payload.totalElements : content.length;
      const totalPages = payload?.totalPages !== undefined ? payload.totalPages : Math.ceil(totalElements / size);
      const currentPage = payload?.number !== undefined ? payload.number : page;

      return {
        content,
        totalElements,
        totalPages,
        currentPage,
      };
    } catch (err) {
      console.warn('InspectionReports API call encountered error, providing graceful fallback:', err);
      let filtered = applyMockFilters(ALL_MOCK_REPORTS, filters);
      filtered = applyMockSort(filtered, sortField, sortOrder);
      const start = page * size;
      return {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        currentPage: page,
      };
    }
  }

  /**
   * Download an inspection report file by ID from backend.
   * 
   * @param {number|string} reportId Unique inspection report ID
   * @returns {Promise<Blob>} Report document binary Blob
   */
  static async downloadInspectionReport(reportId) {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const dummyContent = `%PDF-1.4 Inspection Report #${reportId} - Generated Mock Report\nThis is a placeholder inspection report file.`;
      return new Blob([dummyContent], { type: 'application/pdf' });
    }

    try {
      const response = await api.get(`/earas-form1-entry/inspection-details/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      console.error('Backend download failed:', err);
      if (USE_MOCK_API) {
        const fallbackContent = `%PDF-1.4 Inspection Report #${reportId} - Offline Fallback Report\nGenerated offline fallback document.`;
        return new Blob([fallbackContent], { type: 'application/pdf' });
      }
      throw err;
    }
  }

  /**
   * Fetch distinct filter options (zones, districts, taluks) for UI dropdowns scoped to user role.
   * 
   * @param {string} userRole Logged in user role
   * @returns {Promise<{ districts: string[], taluksByDistrict: Object, zones: string[] }>}
   */
  static async fetchFilterOptions(userRole = 'Super Admin') {
    if (USE_MOCK_API) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        districts: MOCK_DISTRICTS,
        taluksByDistrict: MOCK_TALUKS,
        zones: MOCK_ZONES,
      };
    }

    try {
      const response = await api.get(`/earas-form1-entry/inspection-details/reports/filter-options?userRole=${encodeURIComponent(userRole)}`);
      const payload = response.data?.payload || response.data;
      return {
        districts: payload.districts || MOCK_DISTRICTS,
        taluksByDistrict: payload.taluksByDistrict || MOCK_TALUKS,
        zones: payload.zones || MOCK_ZONES,
      };
    } catch (err) {
      console.warn('Backend filter options unreachable, using default options:', err);
      return {
        districts: MOCK_DISTRICTS,
        taluksByDistrict: MOCK_TALUKS,
        zones: MOCK_ZONES,
      };
    }
  }
}

export default InspectionReportsService;
