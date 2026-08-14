// Production Mock Data for Agricultural Project Monitoring Dashboard

export const MOCK_DISTRICTS = [
  { id: 'DIST_01', name: 'Thiruvananthapuram', taluks: ['Neyyattinkara', 'Kattakada', 'Nedumangad', 'Thiruvananthapuram', 'Varkala', 'Chirayinkeezhu'] },
  { id: 'DIST_02', name: 'Kollam', taluks: ['Kottarakkara', 'Karunagappally', 'Kunnathur', 'Quilon', 'Pathanapuram', 'Punalur'] },
  { id: 'DIST_03', name: 'Pathanamthitta', taluks: ['Adoor', 'Ranni', 'Kozhencherry', 'Mallappally', 'Thiruvalla', 'Konni'] },
  { id: 'DIST_04', name: 'Alappuzha', taluks: ['Ambalappuzha', 'Chengannur', 'Cherthala', 'Karthikappally', 'Kuttanad', 'Mavelikkara'] },
  { id: 'DIST_05', name: 'Kottayam', taluks: ['Changanassery', 'Kanjirappally', 'Kottayam', 'Vaikom', 'Meenachil'] },
  { id: 'DIST_06', name: 'Idukki', taluks: ['Devikulam', 'Idukki', 'Kothamangalam', 'Peermade', 'Udumbanchola'] },
  { id: 'DIST_07', name: 'Ernakulam', taluks: ['Aluva', 'Kanayannur', 'Kochi', 'Kothamangalam', 'Kunnathunad', 'Muvattupuzha', 'Paravur'] },
  { id: 'DIST_08', name: 'Thrissur', taluks: ['Chalakudy', 'Chavakkad', 'Kodungallur', 'Mukundapuram', 'Talappilly', 'Thrissur'] },
  { id: 'DIST_09', name: 'Palakkad', taluks: ['Alathur', 'Chittur', 'Mannarkkad', 'Ottapalam', 'Palakkad', 'Pattambi'] },
  { id: 'DIST_10', name: 'Malappuram', taluks: ['Eranad', 'Kondotty', 'Kottakkal', 'Nilambur', 'Perinthalmanna', 'Ponnani', 'Tirur', 'Tirurangadi'] },
  { id: 'DIST_11', name: 'Kozhikode', taluks: ['Kozhikode', 'Quilandy', 'Thamarassery', 'Vadakara'] },
  { id: 'DIST_12', name: 'Wayanad', taluks: ['Mananthavady', 'Sulthan Bathery', 'Vythiri'] },
  { id: 'DIST_13', name: 'Kannur', taluks: ['Iritty', 'Kannur', 'Payyanur', 'Taliparamba', 'Thalassery'] },
  { id: 'DIST_14', name: 'Kasaragod', taluks: ['Hosdurg', 'Kasaragod', 'Manjeshwaram', 'Vellarikundu'] }
];

export const MOCK_ZONES = [
  'Zone 101', 'Zone 102', 'Zone 103', 'Zone 104', 'Zone 105', 
  'Zone 201', 'Zone 202', 'Zone 203', 'Zone 301', 'Zone 302'
];

export const MOCK_SUMMARY = {
  totalUsers: {
    total: 811,
    active: 798,
    inactive: 13
  },
  tourDiary: {
    submitted: 1320,
    target: 1500,
    pending: 180,
    achievement: 88,
    submittedUsers: 745,
    pendingUsers: 66
  },
  actualTour: {
    submitted: 1180,
    target: 1400,
    pending: 220,
    achievement: 84,
    submittedUsers: 710,
    pendingUsers: 101
  },
  workAllocation: {
    submitted: 1180,
    allocated: 1245,
    pending: 65,
    achievement: 95,
    submittedUsers: 746,
    pendingUsers: 65
  },
  keyPlot: {
    completed: 100,
    target: 100,
    pending: 0,
    rejected: 3,
    achievement: 100
  },
  usersRequiringAttention: {
    uniquePendingUsers: 67,
    tourDiaryPendingCount: 42,
    actualTourPendingCount: 53,
    workAllocationPendingCount: 18
  },
  submissionStatusBreakdown: {
    submitted: 745,
    partial: 35,
    notSubmitted: 31,
    total: 811
  }
};

export const MOCK_MONTHLY_ADVANCE_VS_ACTUAL = {
  tourDiary: [
    { month: 'April', advance: 1500, actual: 1450, achievement: 97, variance: -50 },
    { month: 'May', advance: 1500, actual: 1420, achievement: 95, variance: -80 },
    { month: 'June', advance: 1500, actual: 1380, achievement: 92, variance: -120 },
    { month: 'July', advance: 1500, actual: 1350, achievement: 90, variance: -150 },
    { month: 'August', advance: 1800, actual: 1450, achievement: 81, variance: -350 },
    { month: 'September', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'October', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'November', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'December', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'January', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'February', advance: 1500, actual: 0, achievement: 0, variance: -1500 },
    { month: 'March', advance: 1500, actual: 0, achievement: 0, variance: -1500 }
  ],
  actualTour: [
    { month: 'April', advance: 1400, actual: 1310, achievement: 94, variance: -90 },
    { month: 'May', advance: 1400, actual: 1280, achievement: 91, variance: -120 },
    { month: 'June', advance: 1400, actual: 1220, achievement: 87, variance: -180 },
    { month: 'July', advance: 1400, actual: 1200, achievement: 86, variance: -200 },
    { month: 'August', advance: 1400, actual: 1180, achievement: 84, variance: -220 },
    { month: 'September', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'October', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'November', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'December', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'January', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'February', advance: 1400, actual: 0, achievement: 0, variance: -1400 },
    { month: 'March', advance: 1400, actual: 0, achievement: 0, variance: -1400 }
  ],
  workAllocation: [
    { month: 'April', advance: 1245, actual: 1230, achievement: 99, variance: -15 },
    { month: 'May', advance: 1245, actual: 1220, achievement: 98, variance: -25 },
    { month: 'June', advance: 1245, actual: 1200, achievement: 96, variance: -45 },
    { month: 'July', advance: 1245, actual: 1190, achievement: 96, variance: -55 },
    { month: 'August', advance: 1245, actual: 1180, achievement: 95, variance: -65 },
    { month: 'September', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'October', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'November', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'December', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'January', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'February', advance: 1245, actual: 0, achievement: 0, variance: -1245 },
    { month: 'March', advance: 1245, actual: 0, achievement: 0, variance: -1245 }
  ],
  keyPlot: [
    { month: 'April', advance: 100, actual: 100, achievement: 100, variance: 0 },
    { month: 'May', advance: 100, actual: 100, achievement: 100, variance: 0 },
    { month: 'June', advance: 100, actual: 100, achievement: 100, variance: 0 },
    { month: 'July', advance: 100, actual: 100, achievement: 100, variance: 0 },
    { month: 'August', advance: 100, actual: 100, achievement: 100, variance: 0 },
    { month: 'September', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'October', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'November', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'December', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'January', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'February', advance: 100, actual: 0, achievement: 0, variance: -100 },
    { month: 'March', advance: 100, actual: 0, achievement: 0, variance: -100 }
  ]
};

export const MOCK_MONTHLY_TREND = [
  { month: 'April', tourDiary: 97, actualTour: 94, workAllocation: 99, keyPlot: 100, overall: 98 },
  { month: 'May', tourDiary: 95, actualTour: 91, workAllocation: 98, keyPlot: 100, overall: 96 },
  { month: 'June', tourDiary: 92, actualTour: 87, workAllocation: 96, keyPlot: 100, overall: 94 },
  { month: 'July', tourDiary: 90, actualTour: 86, workAllocation: 96, keyPlot: 100, overall: 93 },
  { month: 'August', tourDiary: 88, actualTour: 84, workAllocation: 95, keyPlot: 100, overall: 92 }
];

export const MOCK_DISTRICT_PERFORMANCE = [
  { id: 'DIST_01', district: 'Thiruvananthapuram', totalUsers: 125, tourDiary: 93, actualTour: 91, workAllocation: 95, keyPlot: 100, overallAchievement: 94, status: 'ON_TRACK' },
  { id: 'DIST_02', district: 'Kollam', totalUsers: 108, tourDiary: 88, actualTour: 84, workAllocation: 91, keyPlot: 96, overallAchievement: 90, status: 'ON_TRACK' },
  { id: 'DIST_04', district: 'Alappuzha', totalUsers: 97, tourDiary: 80, actualTour: 78, workAllocation: 85, keyPlot: 90, overallAchievement: 83, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_03', district: 'Pathanamthitta', totalUsers: 64, tourDiary: 85, actualTour: 82, workAllocation: 89, keyPlot: 95, overallAchievement: 88, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_05', district: 'Kottayam', totalUsers: 72, tourDiary: 91, actualTour: 89, workAllocation: 94, keyPlot: 98, overallAchievement: 93, status: 'ON_TRACK' },
  { id: 'DIST_06', district: 'Idukki', totalUsers: 54, tourDiary: 76, actualTour: 68, workAllocation: 79, keyPlot: 85, overallAchievement: 77, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_07', district: 'Ernakulam', totalUsers: 110, tourDiary: 94, actualTour: 90, workAllocation: 96, keyPlot: 100, overallAchievement: 95, status: 'ON_TRACK' },
  { id: 'DIST_08', district: 'Thrissur', totalUsers: 88, tourDiary: 89, actualTour: 85, workAllocation: 92, keyPlot: 97, overallAchievement: 91, status: 'ON_TRACK' },
  { id: 'DIST_09', district: 'Palakkad', totalUsers: 94, tourDiary: 87, actualTour: 81, workAllocation: 90, keyPlot: 95, overallAchievement: 88, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_10', district: 'Malappuram', totalUsers: 102, tourDiary: 82, actualTour: 76, workAllocation: 87, keyPlot: 92, overallAchievement: 84, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_11', district: 'Kozhikode', totalUsers: 78, tourDiary: 90, actualTour: 88, workAllocation: 93, keyPlot: 98, overallAchievement: 92, status: 'ON_TRACK' },
  { id: 'DIST_12', district: 'Wayanad', totalUsers: 45, tourDiary: 68, actualTour: 62, workAllocation: 74, keyPlot: 80, overallAchievement: 71, status: 'NEEDS_ATTENTION' },
  { id: 'DIST_13', district: 'Kannur', totalUsers: 80, tourDiary: 92, actualTour: 89, workAllocation: 95, keyPlot: 99, overallAchievement: 94, status: 'ON_TRACK' },
  { id: 'DIST_14', district: 'Kasaragod', totalUsers: 48, tourDiary: 86, actualTour: 80, workAllocation: 88, keyPlot: 94, overallAchievement: 87, status: 'NEEDS_ATTENTION' }
];

export const MOCK_ZONE_PERFORMANCE = [
  { zone: 'Zone 101', users: 24, advance: 150, actual: 148, achievement: 98, tourDiary: '98%', actualTour: '96%', workAllocation: '99%', keyPlot: '100/100', status: 'ON_TRACK' },
  { zone: 'Zone 102', users: 22, advance: 140, actual: 125, achievement: 89, tourDiary: '88%', actualTour: '84%', workAllocation: '92%', keyPlot: '92/100', status: 'NEEDS_ATTENTION' },
  { zone: 'Zone 103', users: 26, advance: 160, actual: 160, achievement: 100, tourDiary: '100%', actualTour: '98%', workAllocation: '100%', keyPlot: '100/100', status: 'ON_TRACK' },
  { zone: 'Zone 104', users: 18, advance: 110, actual: 82, achievement: 74, tourDiary: '74%', actualTour: '68%', workAllocation: '80%', keyPlot: '74/100', status: 'CRITICAL' },
  { zone: 'Zone 105', users: 20, advance: 130, actual: 122, achievement: 93, tourDiary: '92%', actualTour: '90%', workAllocation: '95%', keyPlot: '98/100', status: 'ON_TRACK' }
];

export const MOCK_RECENT_SUBMISSIONS = [
  { id: 'SUB_01', userId: 'USR_001', userName: 'Rahul K', module: 'Tour Diary', month: 'August 2026', submittedAt: '10 minutes ago', status: 'Submitted' },
  { id: 'SUB_02', userId: 'USR_002', userName: 'Anitha S', module: 'Work Allocation', month: 'August 2026', submittedAt: '25 minutes ago', status: 'Submitted' },
  { id: 'SUB_03', userId: 'USR_003', userName: 'Vipin Das', module: 'Actual Tour', month: 'August 2026', submittedAt: '1 hour ago', status: 'Submitted' },
  { id: 'SUB_04', userId: 'USR_004', userName: 'Meera Nair', module: 'Key Plot / CCE', month: 'August 2026', submittedAt: '2 hours ago', status: 'Completed' },
  { id: 'SUB_05', userId: 'USR_005', userName: 'Arun Mohan', module: 'Tour Diary', month: 'August 2026', submittedAt: '3 hours ago', status: 'Submitted' },
  { id: 'SUB_06', userId: 'USR_006', userName: 'Priya Raj', module: 'Work Allocation', month: 'August 2026', submittedAt: '4 hours ago', status: 'Submitted' }
];

// Helper to generate full 811 user data dynamically with consistent attributes
const firstNames = ['Rahul', 'Anitha', 'Vipin', 'Meera', 'Arun', 'Priya', 'Suresh', 'Deepa', 'Gokul', 'Kavya', 'Rajesh', 'Lakshmi', 'Manoj', 'Divya', 'Santhosh'];
const lastNames = ['K', 'S', 'Das', 'Nair', 'Mohan', 'Raj', 'Kumar', 'Pillai', 'Varma', 'Menon', 'Kurup', 'Prabhu', 'Babu', 'Chandran', 'George'];

export const generateMockUsers = () => {
  const users = [];
  let userCounter = 1;

  MOCK_DISTRICTS.forEach((dist) => {
    dist.taluks.forEach((taluk) => {
      // Create users per taluk to total around 811
      const countForTaluk = Math.floor(811 / (14 * 5)) + (userCounter % 2);
      for (let i = 0; i < countForTaluk; i++) {
        if (userCounter > 811) break;
        const idNum = String(userCounter).padStart(3, '0');
        const userId = `USR_${idNum}`;
        const fName = firstNames[userCounter % firstNames.length];
        const lName = lastNames[userCounter % lastNames.length];
        const name = `${fName} ${lName} ${userCounter > 15 ? `#${idNum}` : ''}`.trim();
        const zone = `Zone ${101 + (userCounter % 5)}`;

        // Determine submission statuses logically to match summary metrics
        let tourDiaryStatus = 'SUBMITTED';
        let actualTourStatus = 'SUBMITTED';
        let workAllocationStatus = 'SUBMITTED';
        let keyPlotStatus = 'COMPLETED';
        let isPending = false;

        // Pending logic to get 67 pending users in total
        if (userCounter % 12 === 0) {
          isPending = true;
          actualTourStatus = 'NOT_SUBMITTED';
          tourDiaryStatus = userCounter % 24 === 0 ? 'NOT_SUBMITTED' : 'SUBMITTED';
        } else if (userCounter % 17 === 0) {
          isPending = true;
          tourDiaryStatus = 'NOT_SUBMITTED';
          workAllocationStatus = 'NOT_SUBMITTED';
        } else if (userCounter % 29 === 0) {
          isPending = true;
          workAllocationStatus = 'NOT_SUBMITTED';
        }

        let overallStatus = 'Completed';
        if (tourDiaryStatus === 'SUBMITTED' && actualTourStatus === 'SUBMITTED' && workAllocationStatus === 'SUBMITTED' && keyPlotStatus === 'COMPLETED') {
          overallStatus = 'Completed';
        } else if (tourDiaryStatus === 'NOT_SUBMITTED' && actualTourStatus === 'NOT_SUBMITTED' && workAllocationStatus === 'NOT_SUBMITTED') {
          overallStatus = 'Not Submitted';
        } else {
          overallStatus = 'Partial / Pending';
        }

        const missingActivities = [];
        if (tourDiaryStatus !== 'SUBMITTED') missingActivities.push('Tour Diary');
        if (actualTourStatus !== 'SUBMITTED') missingActivities.push('Actual Tour');
        if (workAllocationStatus !== 'SUBMITTED') missingActivities.push('Work Allocation');

        users.push({
          id: userId,
          userCode: `USR-${idNum}`,
          name,
          district: dist.name,
          districtId: dist.id,
          taluk,
          zone,
          designation: 'Agricultural Field Officer',
          phone: `+91 9847${userCounter.toString().padStart(6, '0')}`,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}${idNum}@agrimonitor.gov.in`,
          tourDiary: tourDiaryStatus,
          actualTour: actualTourStatus,
          workAllocation: workAllocationStatus,
          keyPlot: keyPlotStatus,
          overallStatus,
          isPending,
          missingActivities,
          lastLogin: `Aug ${10 - (userCounter % 5)}, 2026 09:30 AM`,
          lastSubmission: `Aug ${8 - (userCounter % 4)}, 2026`,
          totalSubmissions: 48 - (userCounter % 10),
          pendingCount: missingActivities.length,
          monthlyHistory: [
            { month: 'May', tourDiary: 'SUBMITTED', actualTour: 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
            { month: 'June', tourDiary: 'SUBMITTED', actualTour: userCounter % 5 === 0 ? 'PARTIAL' : 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
            { month: 'July', tourDiary: 'SUBMITTED', actualTour: userCounter % 7 === 0 ? 'NOT_SUBMITTED' : 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
            { month: 'August', tourDiary: tourDiaryStatus, actualTour: actualTourStatus, workAllocation: workAllocationStatus, keyPlot: keyPlotStatus, overall: overallStatus }
          ]
        });
        userCounter++;
      }
    });
  });

  // Ensure exact count is 811 users
  while (users.length < 811) {
    const idNum = String(users.length + 1).padStart(3, '0');
    users.push({
      id: `USR_${idNum}`,
      userCode: `USR-${idNum}`,
      name: `Officer ${idNum}`,
      district: 'Kollam',
      districtId: 'DIST_02',
      taluk: 'Kottarakkara',
      zone: 'Zone 101',
      designation: 'Field Inspector',
      phone: `+91 9847${idNum}00`,
      email: `officer${idNum}@agrimonitor.gov.in`,
      tourDiary: 'SUBMITTED',
      actualTour: 'SUBMITTED',
      workAllocation: 'SUBMITTED',
      keyPlot: 'COMPLETED',
      overallStatus: 'Completed',
      isPending: false,
      missingActivities: [],
      lastLogin: 'Aug 11, 2026 10:15 AM',
      lastSubmission: 'Aug 10, 2026',
      totalSubmissions: 52,
      pendingCount: 0,
      monthlyHistory: [
        { month: 'May', tourDiary: 'SUBMITTED', actualTour: 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
        { month: 'June', tourDiary: 'SUBMITTED', actualTour: 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
        { month: 'July', tourDiary: 'SUBMITTED', actualTour: 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' },
        { month: 'August', tourDiary: 'SUBMITTED', actualTour: 'SUBMITTED', workAllocation: 'SUBMITTED', keyPlot: 'COMPLETED', overall: 'Completed' }
      ]
    });
  }

  return users.slice(0, 811);
};

export const MOCK_USERS_LIST = generateMockUsers();
