import { MOCK_USERS_LIST, MOCK_DISTRICT_PERFORMANCE, MOCK_ZONE_PERFORMANCE, MOCK_SUMMARY } from './mockData';

const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

export const REPORT_TYPES = [
  { id: 'monthly-performance', name: 'Monthly Performance Report' },
  { id: 'user-submission', name: 'User Submission Report' },
  { id: 'district-performance', name: 'District Performance Report' },
  { id: 'taluk-performance', name: 'Taluk Performance Report' },
  { id: 'zone-performance', name: 'Zone Performance Report' },
  { id: 'pending-user', name: 'Pending User Report' },
  { id: 'tour-diary', name: 'Tour Diary Report' },
  { id: 'actual-tour', name: 'Actual Tour Report' },
  { id: 'work-allocation', name: 'Work Allocation Report' },
  { id: 'key-plot', name: 'Key Plot / CCE Report' }
];

export const generateReportData = async (reportTypeId, filters = {}) => {
  await delay(400);

  let filteredUsers = [...MOCK_USERS_LIST];
  if (filters.district && filters.district !== 'All') {
    filteredUsers = filteredUsers.filter(u => u.district === filters.district);
  }
  if (filters.taluk && filters.taluk !== 'All') {
    filteredUsers = filteredUsers.filter(u => u.taluk === filters.taluk);
  }
  if (filters.zone && filters.zone !== 'All') {
    filteredUsers = filteredUsers.filter(u => u.zone === filters.zone);
  }

  switch (reportTypeId) {
    case 'district-performance':
      return {
        title: 'District Performance Report',
        headers: ['District', 'Total Users', 'Tour Diary %', 'Actual Tour %', 'Work Allocation %', 'Key Plot %', 'Overall Achievement %', 'Status'],
        rows: MOCK_DISTRICT_PERFORMANCE.map(d => [d.district, d.totalUsers, `${d.tourDiary}%`, `${d.actualTour}%`, `${d.workAllocation}%`, `${d.keyPlot}%`, `${d.overallAchievement}%`, d.status])
      };
    case 'zone-performance':
      return {
        title: 'Zone Performance Report',
        headers: ['Zone', 'Users', 'Advance', 'Actual', 'Achievement %', 'Tour Diary', 'Actual Tour', 'Work Allocation', 'Key Plot', 'Status'],
        rows: MOCK_ZONE_PERFORMANCE.map(z => [z.zone, z.users, z.advance, z.actual, `${z.achievement}%`, z.tourDiary, z.actualTour, z.workAllocation, z.keyPlot, z.status])
      };
    case 'pending-user':
      const pendingUsers = filteredUsers.filter(u => u.isPending || u.tourDiary !== 'SUBMITTED' || u.actualTour !== 'SUBMITTED' || u.workAllocation !== 'SUBMITTED');
      return {
        title: 'Pending User Report',
        headers: ['User Code', 'Name', 'District', 'Taluk', 'Zone', 'Missing Activities', 'Last Submission'],
        rows: pendingUsers.map(u => [u.userCode, u.name, u.district, u.taluk, u.zone, u.missingActivities.join(', ') || 'Actual Tour', u.lastSubmission])
      };
    case 'user-submission':
    default:
      return {
        title: 'User Submission Report',
        headers: ['User Code', 'Name', 'District', 'Taluk', 'Zone', 'Tour Diary', 'Actual Tour', 'Work Allocation', 'Key Plot', 'Overall Status'],
        rows: filteredUsers.slice(0, 50).map(u => [u.userCode, u.name, u.district, u.taluk, u.zone, u.tourDiary, u.actualTour, u.workAllocation, u.keyPlot, u.overallStatus])
      };
  }
};
