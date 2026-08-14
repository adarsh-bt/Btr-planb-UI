import axiosInstance from './axiosInstance';
import {
  MOCK_SUMMARY,
  MOCK_MONTHLY_ADVANCE_VS_ACTUAL,
  MOCK_MONTHLY_TREND,
  MOCK_DISTRICT_PERFORMANCE,
  MOCK_ZONE_PERFORMANCE,
  MOCK_RECENT_SUBMISSIONS,
  MOCK_USERS_LIST
} from './mockData';

// Helper to simulate asynchronous API delay
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Filter users based on query parameters
 */
const filterUsers = (users, filters = {}) => {
  return users.filter((u) => {
    if (filters.district && filters.district !== 'All' && u.district !== filters.district) {
      return false;
    }
    if (filters.taluk && filters.taluk !== 'All' && u.taluk !== filters.taluk) {
      return false;
    }
    if (filters.zone && filters.zone !== 'All' && u.zone !== filters.zone) {
      return false;
    }
    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'Submitted' && u.overallStatus !== 'Completed') return false;
      if (filters.status === 'Partial' && u.overallStatus !== 'Partial / Pending') return false;
      if (filters.status === 'Not Submitted' && u.overallStatus !== 'Not Submitted') return false;
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchCode = u.userCode.toLowerCase().includes(q);
      const matchZone = u.zone.toLowerCase().includes(q);
      const matchTaluk = u.taluk.toLowerCase().includes(q);
      const matchDistrict = u.district.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchZone && !matchTaluk && !matchDistrict) {
        return false;
      }
    }
    return true;
  });
};

export const getDashboardSummary = async (filters = {}) => {
  await delay(300);
  try {
    // Return summary calculated from active filters if filtered
    const filteredUsers = filterUsers(MOCK_USERS_LIST, filters);
    const totalCount = filteredUsers.length;
    if (totalCount === 0) {
      return {
        totalUsers: { total: 0, active: 0, inactive: 0 },
        tourDiary: { submitted: 0, target: 0, pending: 0, achievement: 0 },
        actualTour: { submitted: 0, target: 0, pending: 0, achievement: 0 },
        workAllocation: { submitted: 0, allocated: 0, pending: 0, achievement: 0 },
        keyPlot: { completed: 0, target: 0, pending: 0, rejected: 0, achievement: 0 },
        usersRequiringAttention: { uniquePendingUsers: 0, tourDiaryPendingCount: 0, actualTourPendingCount: 0, workAllocationPendingCount: 0 },
        submissionStatusBreakdown: { submitted: 0, partial: 0, notSubmitted: 0, total: 0 }
      };
    }

    if (filters.district && filters.district !== 'All') {
      const pendingUsers = filteredUsers.filter(u => u.isPending);
      const submittedUsers = filteredUsers.filter(u => u.overallStatus === 'Completed');
      const partialUsers = filteredUsers.filter(u => u.overallStatus === 'Partial / Pending');
      const notSubmittedUsers = filteredUsers.filter(u => u.overallStatus === 'Not Submitted');
      
      return {
        totalUsers: { total: totalCount, active: Math.floor(totalCount * 0.98), inactive: Math.ceil(totalCount * 0.02) },
        tourDiary: { submitted: Math.floor(totalCount * 0.88), target: totalCount, pending: Math.ceil(totalCount * 0.12), achievement: 88, submittedUsers: submittedUsers.length, pendingUsers: pendingUsers.length },
        actualTour: { submitted: Math.floor(totalCount * 0.84), target: totalCount, pending: Math.ceil(totalCount * 0.16), achievement: 84, submittedUsers: submittedUsers.length, pendingUsers: pendingUsers.length },
        workAllocation: { submitted: Math.floor(totalCount * 0.95), allocated: totalCount, pending: Math.ceil(totalCount * 0.05), achievement: 95, submittedUsers: submittedUsers.length, pendingUsers: pendingUsers.length },
        keyPlot: { completed: Math.floor(totalCount * 0.12), target: Math.floor(totalCount * 0.12), pending: 0, rejected: 1, achievement: 100 },
        usersRequiringAttention: {
          uniquePendingUsers: pendingUsers.length,
          tourDiaryPendingCount: filteredUsers.filter(u => u.tourDiary !== 'SUBMITTED').length,
          actualTourPendingCount: filteredUsers.filter(u => u.actualTour !== 'SUBMITTED').length,
          workAllocationPendingCount: filteredUsers.filter(u => u.workAllocation !== 'SUBMITTED').length
        },
        submissionStatusBreakdown: {
          submitted: submittedUsers.length,
          partial: partialUsers.length,
          notSubmitted: notSubmittedUsers.length,
          total: totalCount
        }
      };
    }

    return MOCK_SUMMARY;
  } catch (error) {
    // If backend endpoint existed: return await axiosInstance.get('/dashboard/summary', { params: filters });
    throw error;
  }
};

export const getMonthlyAdvanceVsActual = async (metric = 'tourDiary', filters = {}) => {
  await delay(250);
  const data = MOCK_MONTHLY_ADVANCE_VS_ACTUAL[metric] || MOCK_MONTHLY_ADVANCE_VS_ACTUAL.tourDiary;
  return data;
};

export const getMonthlyTrend = async (filters = {}) => {
  await delay(250);
  return MOCK_MONTHLY_TREND;
};

export const getDistrictPerformance = async (filters = {}) => {
  await delay(300);
  if (filters.district && filters.district !== 'All') {
    return MOCK_DISTRICT_PERFORMANCE.filter(d => d.district === filters.district);
  }
  return MOCK_DISTRICT_PERFORMANCE;
};

export const getZonePerformance = async (filters = {}) => {
  await delay(300);
  return MOCK_ZONE_PERFORMANCE;
};

export const getRecentSubmissions = async () => {
  await delay(200);
  return MOCK_RECENT_SUBMISSIONS;
};

export const getSubmissionMatrix = async (filters = {}, page = 1, pageSize = 10) => {
  await delay(350);
  const filteredUsers = filterUsers(MOCK_USERS_LIST, filters);
  const total = filteredUsers.length;
  const startIndex = (page - 1) * pageSize;
  const data = filteredUsers.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
};

export const getPendingUsers = async (filters = {}, quickFilter = 'All', page = 1, pageSize = 10) => {
  await delay(350);
  let pendingUsers = MOCK_USERS_LIST.filter(u => u.isPending || u.tourDiary !== 'SUBMITTED' || u.actualTour !== 'SUBMITTED' || u.workAllocation !== 'SUBMITTED');
  
  if (filters.district && filters.district !== 'All') {
    pendingUsers = pendingUsers.filter(u => u.district === filters.district);
  }
  if (filters.taluk && filters.taluk !== 'All') {
    pendingUsers = pendingUsers.filter(u => u.taluk === filters.taluk);
  }
  if (filters.zone && filters.zone !== 'All') {
    pendingUsers = pendingUsers.filter(u => u.zone === filters.zone);
  }

  if (quickFilter === 'Tour Diary Pending') {
    pendingUsers = pendingUsers.filter(u => u.tourDiary !== 'SUBMITTED');
  } else if (quickFilter === 'Actual Tour Pending') {
    pendingUsers = pendingUsers.filter(u => u.actualTour !== 'SUBMITTED');
  } else if (quickFilter === 'Work Allocation Pending') {
    pendingUsers = pendingUsers.filter(u => u.workAllocation !== 'SUBMITTED');
  } else if (quickFilter === 'Multiple Pending') {
    pendingUsers = pendingUsers.filter(u => u.missingActivities && u.missingActivities.length > 1);
  }

  const total = pendingUsers.length;
  const startIndex = (page - 1) * pageSize;
  const data = pendingUsers.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
};

export const getUserDetails = async (userId) => {
  await delay(300);
  const user = MOCK_USERS_LIST.find(u => u.id === userId || u.userCode === userId) || MOCK_USERS_LIST[0];
  return user;
};
