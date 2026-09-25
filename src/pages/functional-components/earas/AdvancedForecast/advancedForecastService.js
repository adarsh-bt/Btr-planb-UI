import AuthService from 'pages/authentication/services/authservice';
import mainapi from 'api/mainapi';

// Comprehensive sample dataset of cultivators across Ernakulam District / Kanayannur Taluk / Vyttila & Paravur Blocks
const INITIAL_SUBMISSIONS = [
  {
    id: 'FE-2026-001',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Kumbalangi',
    zone: 'Zone 01',
    cultivatorName: 'Ravi Kumar P.',
    cultivatorPhone: '+91 98470 12345',
    crop: 'Paddy',
    variety: 'Uma (MO-16)',
    season: 'Autumn (Virippu)',
    yieldType: 'Irrigated',
    previousYearArea: 4.2,
    currentYearArea: 4.8,
    previousYearYield: 38.5,
    currentYearYield: 45.2,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 10:15 AM',
    remarks: 'Optimal rainfall and early sowing contributed to significant yield boost.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 09:30 AM', notes: 'Initial data entry completed.' },
      { action: 'Validated', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 10:15 AM', notes: 'Verified yield variance (+17.4%). Ready for supervisor submission.' }
    ]
  },
  {
    id: 'FE-2026-002',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Kumbalangi',
    zone: 'Zone 01',
    cultivatorName: 'Suresh Babu K.',
    cultivatorPhone: '+91 94471 23456',
    crop: 'Paddy',
    variety: 'Jyothi',
    season: 'Autumn (Virippu)',
    yieldType: 'Irrigated',
    previousYearArea: 3.5,
    currentYearArea: 3.8,
    previousYearYield: 34.0,
    currentYearYield: 41.5,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 10:30 AM',
    remarks: 'Used organic soil conditioner.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 10:30 AM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-003',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Mulavukad',
    zone: 'Zone 02',
    cultivatorName: 'Anil Kumar M.',
    cultivatorPhone: '+91 98952 34567',
    crop: 'Banana',
    variety: 'Nendran',
    season: 'Monsoon',
    yieldType: 'Mixed',
    previousYearArea: 2.8,
    currentYearArea: 3.2,
    previousYearYield: 180.0,
    currentYearYield: 215.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 11:00 AM',
    remarks: 'Drip irrigation installed last year.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 11:00 AM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-004',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Mulavukad',
    zone: 'Zone 02',
    cultivatorName: 'Joseph Mathew',
    cultivatorPhone: '+91 97453 45678',
    crop: 'Coconut',
    variety: 'WCT (West Coast Tall)',
    season: 'Annual / Perennial',
    yieldType: 'Rainfed',
    previousYearArea: 5.5,
    currentYearArea: 5.5,
    previousYearYield: 95.0,
    currentYearYield: 112.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 11:30 AM',
    remarks: 'Regular pest control measures implemented.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 11:30 AM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-005',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Choornikkara',
    zone: 'Zone 03',
    cultivatorName: 'Rajesh P. Nair',
    cultivatorPhone: '+91 94464 56789',
    crop: 'Paddy',
    variety: 'Matta',
    season: 'Autumn (Virippu)',
    yieldType: 'Irrigated',
    previousYearArea: 4.0,
    currentYearArea: 4.5,
    previousYearYield: 36.0,
    currentYearYield: 43.8,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 01:15 PM',
    remarks: 'High yielding variety performance excellent.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 01:15 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-006',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Choornikkara',
    zone: 'Zone 03',
    cultivatorName: 'Manoj K. Varghese',
    cultivatorPhone: '+91 98465 67890',
    crop: 'Vegetables',
    variety: 'Exotic Mixed',
    season: 'Summer (Puncha)',
    yieldType: 'Irrigated',
    previousYearArea: 1.5,
    currentYearArea: 2.0,
    previousYearYield: 145.0,
    currentYearYield: 185.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 02:00 PM',
    remarks: 'Polyhouse cultivation expansion.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 02:00 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-007',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Choornikkara',
    zone: 'Zone 03',
    cultivatorName: 'Sunil T. Kurup',
    cultivatorPhone: '+91 93876 78901',
    crop: 'Paddy',
    variety: 'Uma',
    season: 'Autumn (Virippu)',
    yieldType: 'Irrigated',
    previousYearArea: 6.0,
    currentYearArea: 6.2,
    previousYearYield: 37.0,
    currentYearYield: 44.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 02:30 PM',
    remarks: 'Promising growth in plot 4.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 02:30 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-008',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Kumbalangi',
    zone: 'Zone 01',
    cultivatorName: 'Binu Thomas',
    cultivatorPhone: '+91 94477 89012',
    crop: 'Banana',
    variety: 'Robusta',
    season: 'Monsoon',
    yieldType: 'Rainfed',
    previousYearArea: 2.2,
    currentYearArea: 2.5,
    previousYearYield: 160.0,
    currentYearYield: 195.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 03:00 PM',
    remarks: 'Intercropping with pulses done.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 03:00 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-009',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Mulavukad',
    zone: 'Zone 02',
    cultivatorName: 'Shaji Varghese',
    cultivatorPhone: '+91 98958 90123',
    crop: 'Paddy',
    variety: 'Jyothi',
    season: 'Winter (Mundakan)',
    yieldType: 'Irrigated',
    previousYearArea: 3.8,
    currentYearArea: 4.1,
    previousYearYield: 35.0,
    currentYearYield: 42.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 03:30 PM',
    remarks: 'Good water availability.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 03:30 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-010',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Kumbalangi',
    zone: 'Zone 01',
    cultivatorName: 'Prakash N. Menon',
    cultivatorPhone: '+91 94969 01234',
    crop: 'Coconut',
    variety: 'Kera Sankara Hybrid',
    season: 'Annual / Perennial',
    yieldType: 'Irrigated',
    previousYearArea: 4.8,
    currentYearArea: 5.0,
    previousYearYield: 110.0,
    currentYearYield: 132.0,
    status: 'Ready for Submission',
    isLeadingCandidate: true,
    isLeadingSelected: true,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 04:00 PM',
    remarks: 'Hybrid palms reaching peak yield age.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 04:00 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-011',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Choornikkara',
    zone: 'Zone 03',
    cultivatorName: 'Gopinathan Nair',
    cultivatorPhone: '+91 97440 12345',
    crop: 'Tapioca',
    variety: 'M-4',
    season: 'Autumn (Virippu)',
    yieldType: 'Rainfed',
    previousYearArea: 2.0,
    currentYearArea: 2.1,
    previousYearYield: 24.0,
    currentYearYield: 27.5,
    status: 'Ready for Submission',
    isLeadingCandidate: false,
    isLeadingSelected: false,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 04:30 PM',
    remarks: 'Steady crop performance.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 04:30 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-012',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Mulavukad',
    zone: 'Zone 02',
    cultivatorName: 'Mathew Joseph',
    cultivatorPhone: '+91 98471 23456',
    crop: 'Rubber',
    variety: 'RRII 105',
    season: 'Annual / Perennial',
    yieldType: 'Rainfed',
    previousYearArea: 6.0,
    currentYearArea: 6.0,
    previousYearYield: 14.5,
    currentYearYield: 15.2,
    status: 'Ready for Submission',
    isLeadingCandidate: false,
    isLeadingSelected: false,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-10 05:00 PM',
    remarks: 'Tapping ongoing in 80% trees.',
    history: [
      { action: 'Record Created', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-10 05:00 PM', notes: 'Entry created.' }
    ]
  },
  {
    id: 'FE-2026-013',
    submissionId: 'SUB-2026-0801',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayat: 'Choornikkara',
    zone: 'Zone 03',
    cultivatorName: 'Deepak Mohan',
    cultivatorPhone: '+91 94472 34567',
    crop: 'Paddy',
    variety: 'Kanchana',
    season: 'Summer (Puncha)',
    yieldType: 'Irrigated',
    previousYearArea: 3.0,
    currentYearArea: 3.0,
    previousYearYield: 32.0,
    currentYearYield: 33.5,
    status: 'Draft',
    isLeadingCandidate: false,
    isLeadingSelected: false,
    submittedBy: 'Ramesh K. (Field Collector)',
    submittedAt: '2026-08-11 09:15 AM',
    remarks: 'Draft entry in progress.',
    history: [
      { action: 'Draft Saved', user: 'Ramesh K. (Field Collector)', role: 'Field Data Collector', timestamp: '2026-08-11 09:15 AM', notes: 'Saved as draft.' }
    ]
  }
];

export const CROPS_MASTER = [
  'Paddy',
  'Coconut',
  'Banana',
  'Rubber',
  'Tapioca',
  'Vegetables',
  'Pepper',
  'Cashew',
  'Pulses',
  'Sugarcane',
  'Spices',
  'Other'
];

export const PADDY_VARIETIES = [
  'Jyothi',
  'Uma (MO-16)',
  'Matta',
  'Kanchana',
  'Athira',
  'Aiswarya',
  'Hybrid / High Yielding',
  'Traditional / Local',
  'Others'
];

export const SEASONS_MASTER = [
  'Autumn (Virippu)',
  'Winter (Mundakan)',
  'Summer (Puncha)',
  'Kharif',
  'Rabi',
  'Monsoon',
  'Annual / Perennial'
];

export const YIELD_TYPES_MASTER = [
  'Irrigated',
  'Rainfed',
  'Mixed'
];

export const PREDEFINED_RETURN_REASONS = [
  'Incorrect yield data submitted',
  'Incorrect area measurement (ha)',
  'Missing cultivator contact / identification info',
  'Incorrect crop variety tagged',
  'Jurisdiction discrepancy / wrong zone assigned',
  'Duplicate cultivator record detected',
  '10 Leading cultivators selection requires re-verification',
  'Other / Custom reason'
];

class AdvancedForecastService {
  static STORAGE_KEY = 'earas_forecast_estimates_v4_store';
  static SUBMISSION_HEADER_KEY = 'earas_submission_headers_v4_store';
  static NOTIFICATIONS_KEY = 'earas_forecast_notifications_v4_store';

  static getStorageSubmissions() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading forecast submissions from localStorage', e);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
    return INITIAL_SUBMISSIONS;
  }

  static saveStorageSubmissions(submissions) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(submissions));
    } catch (e) {
      console.error('Error saving forecast submissions to localStorage', e);
    }
  }

  static getNotifications() {
    try {
      const stored = localStorage.getItem(this.NOTIFICATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading notifications', e);
    }
    const defaultNotifs = [
      {
        id: 'NOTIF-1',
        title: 'Submission Received',
        message: 'Submission #SUB-2026-0801 containing 12 cultivator records received for Taluk Review.',
        timestamp: '2026-08-10 11:30 AM',
        read: false,
        type: 'info'
      },
      {
        id: 'NOTIF-2',
        title: 'Action Required',
        message: 'Taluk Level Approver must select exactly 10 Leading Cultivators for Block Vyttila.',
        timestamp: '2026-08-10 11:35 AM',
        read: false,
        type: 'warning'
      }
    ];
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(defaultNotifs));
    return defaultNotifs;
  }

  static addNotification(notif) {
    const list = this.getNotifications();
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      read: false,
      ...notif
    };
    const updated = [newNotif, ...list];
    try {
      localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  }

  static markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(list));
    return list;
  }

  static async getPanchayathsForZone(zoneId) {
    const activeZoneId = zoneId || AuthService.getzone() || localStorage.getItem('activeZone') || localStorage.getItem('zoneId') || '104';

    const defaultPanchayaths = [
      'Kumbalangi',
      'Mulavukad',
      'Choornikkara',
      'Chellanam',
      'Elamkunnapuzha',
      'Kadamakkudy',
      'Cheranallur'
    ];

    try {
      const BASE_URL = mainapi.BTR_API;
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/btr-service/admin-manage/zone-localbodies/${activeZoneId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        let rawList = Array.isArray(data) ? data : (data?.payload && Array.isArray(data.payload) ? data.payload : []);
        if (rawList.length > 0) {
          const names = rawList
            .map((item) => {
              if (typeof item === 'string') return item;
              if (item && typeof item === 'object') {
                return (
                  item.localbodyName ||
                  item.localBodyName ||
                  item.panchayat ||
                  item.panchayth ||
                  item.name ||
                  (item.localbodyId ? `Localbody ${item.localbodyId}` : null)
                );
              }
              return null;
            })
            .filter(Boolean);

          if (names.length > 0) {
            return [...new Set(names)];
          }
        }
      }
    } catch (err) {
      console.warn('Using default Panchayaths list fallback:', err);
    }

    return defaultPanchayaths;
  }

  static async getLiveZones() {
    const userZoneId = AuthService.getzone() || localStorage.getItem('activeZone') || localStorage.getItem('zoneId');
    try {
      const BASE_URL = mainapi.BTR_API;
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/btr-service/admin-manage/getAllMasterZone`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        let rawList = Array.isArray(data) ? data : (data?.payload && Array.isArray(data.payload) ? data.payload : []);
        if (rawList.length > 0) {
          return rawList.map(item => ({
            id: String(item.id || item.zoneId || item.zoneCode),
            name: item.name || item.zoneName || `Zone ${item.id || item.zoneId}`
          }));
        }
      }
    } catch (err) {
      console.warn('Using default zones list fallback:', err);
    }

    return [
      { id: userZoneId || '104', name: `Zone ${userZoneId || '01'} (Assigned User Zone)` },
      { id: '105', name: 'Zone 02 (Mulavukad / Kadamakkudy)' },
      { id: '106', name: 'Zone 03 (Choornikkara / Cheranallur)' }
    ];
  }

  static getSubmissions() {
    return this.getStorageSubmissions();
  }

  /**
   * Create or update a single cultivator forecast entry
   */
  static saveForecastRecord(entryData, isDraft = false) {
    const all = this.getStorageSubmissions();
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = AuthService.getusername() || 'Ramesh K. (Field Collector)';

    const isEdit = Boolean(entryData.id);
    let recordId = entryData.id;

    if (!recordId) {
      recordId = `FE-2026-${String(all.length + 1).padStart(3, '0')}`;
    }

    const curArea = parseFloat(entryData.currentYearArea) || 0;
    const prevArea = parseFloat(entryData.previousYearArea) || 0;
    const curYield = parseFloat(entryData.currentYearYield) || 0;
    const prevYield = parseFloat(entryData.previousYearYield) || 0;

    const yieldIncreasePct = prevYield > 0 ? ((curYield - prevYield) / prevYield) * 100 : 0;
    const isLeadingCandidate = yieldIncreasePct >= 10.0 || curYield > 40.0;

    const newRecord = {
      id: recordId,
      submissionId: entryData.submissionId || 'SUB-2026-0801',
      district: entryData.district || 'Ernakulam',
      taluk: entryData.taluk || 'Kanayannur',
      block: entryData.block || 'Vyttila',
      panchayat: entryData.panchayat || 'Kumbalangi',
      zone: entryData.zone || 'Zone 01',
      cultivatorName: entryData.cultivatorName || 'Cultivator',
      cultivatorPhone: entryData.cultivatorPhone || '+91 98470 00000',
      crop: entryData.crop || 'Paddy',
      variety: entryData.variety || '',
      season: entryData.season || 'Autumn (Virippu)',
      yieldType: entryData.yieldType || 'Irrigated',
      previousYearArea: prevArea,
      currentYearArea: curArea,
      previousYearYield: prevYield,
      currentYearYield: curYield,
      status: isDraft ? 'Draft' : (entryData.status || 'Ready for Submission'),
      isLeadingCandidate,
      isLeadingSelected: entryData.isLeadingSelected || false,
      submittedBy: currentUser,
      submittedAt: now,
      remarks: entryData.remarks || '',
      history: isEdit
        ? [
            ...(entryData.history || []),
            {
              action: isDraft ? 'Draft Updated' : 'Record Updated',
              user: currentUser,
              role: 'Field Data Collector',
              timestamp: now,
              notes: isDraft ? 'Draft updated by collector.' : 'Record details updated.'
            }
          ]
        : [
            {
              action: isDraft ? 'Draft Created' : 'Record Created',
              user: currentUser,
              role: 'Field Data Collector',
              timestamp: now,
              notes: 'Initial record saved.'
            }
          ]
    };

    let updated;
    if (isEdit) {
      updated = all.map(item => item.id === recordId ? newRecord : item);
    } else {
      updated = [newRecord, ...all];
    }

    this.saveStorageSubmissions(updated);

    if (isDraft) {
      this.addNotification({
        title: 'Draft Saved',
        message: `Draft record ${recordId} (${newRecord.cultivatorName}) saved successfully.`,
        type: 'info'
      });
    }

    return newRecord;
  }

  /**
   * Delete a record
   */
  static deleteEntry(id) {
    const all = this.getStorageSubmissions();
    const updated = all.filter((item) => item.id !== id);
    this.saveStorageSubmissions(updated);
    return updated;
  }

  /**
   * Duplicate a record
   */
  static duplicateEntry(id) {
    const all = this.getStorageSubmissions();
    const original = all.find(item => item.id === id);
    if (!original) return all;

    const copy = {
      ...original,
      id: `FE-2026-${String(all.length + 1).padStart(3, '0')}`,
      cultivatorName: `${original.cultivatorName} (Copy)`,
      status: 'Draft',
      submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      history: [
        {
          action: 'Duplicated',
          user: 'Field Data Collector',
          role: 'Field Data Collector',
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          notes: `Duplicated from record ${original.id}`
        }
      ]
    };

    const updated = [copy, ...all];
    this.saveStorageSubmissions(updated);
    return updated;
  }

  /**
   * Field Collector submits all ready records to Supervisor
   */
  static submitAllToSupervisor(notes = '') {
    const all = this.getStorageSubmissions();
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = AuthService.getusername() || 'Ramesh K. (Field Collector)';

    const updated = all.map((item) => {
      if (item.status === 'Ready for Submission' || item.status === 'Draft' || item.status === 'Returned for Correction') {
        return {
          ...item,
          status: 'Submitted',
          submittedAt: now,
          history: [
            ...(item.history || []),
            {
              action: 'Submitted to Supervisor',
              user: currentUser,
              role: 'Field Data Collector',
              timestamp: now,
              notes: notes || 'Submitted for Taluk / Block Supervisor Review.'
            }
          ]
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    this.addNotification({
      title: 'Submission Sent to Supervisor',
      message: `Forecast estimates submitted to Taluk Level Approver (Inspector S. Nair). ID: #SUB-2026-0801`,
      type: 'success'
    });
    return updated;
  }

  /**
   * Supervisor toggles leading selection for a cultivator
   */
  static toggleLeadingSelection(cultivatorId) {
    const all = this.getStorageSubmissions();
    const target = all.find(item => item.id === cultivatorId);
    if (!target) return all;

    const currentSelectedCount = all.filter(item => item.isLeadingSelected).length;
    if (!target.isLeadingSelected && currentSelectedCount >= 10) {
      throw new Error('Maximum limit reached. You can only select exactly 10 Leading Cultivators.');
    }

    const updated = all.map(item => {
      if (item.id === cultivatorId) {
        return {
          ...item,
          isLeadingSelected: !item.isLeadingSelected
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    return updated;
  }

  /**
   * Taluk Inspector submits verification & leading selection to Taluk Level Approver
   */
  static submitToTalukApprover(notes = '') {
    const all = this.getStorageSubmissions();
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = 'Inspector S. Nair (Taluk Inspector)';
    const selectedCount = all.filter(item => item.isLeadingSelected).length;

    const updated = all.map((item) => {
      if (item.status === 'Submitted' || item.status === 'Under Review' || item.status === 'Ready for Submission') {
        return {
          ...item,
          status: 'Submitted to Taluk Approver',
          history: [
            ...(item.history || []),
            {
              action: 'Submitted to Taluk Level Approver',
              user: currentUser,
              role: 'Taluk Field Inspector',
              timestamp: now,
              notes: notes || `Submitted by Taluk Inspector with ${selectedCount} leading cultivator(s) marked.`
            }
          ]
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    this.addNotification({
      title: 'Submitted to Taluk Approver',
      message: `Verified records and ${selectedCount} leading cultivator selection submitted to Taluk Level Approver.`,
      type: 'info'
    });

    return updated;
  }

  /**
   * Taluk Level Approver forwards / shares the 10 selected leading cultivators with District Approver
   */
  static submit10LeadingToDistrict(notes = '') {
    const all = this.getStorageSubmissions();
    const selectedCount = all.filter(item => item.isLeadingSelected).length;

    if (selectedCount === 0) {
      throw new Error('Please select at least 1 cultivator before submitting to District.');
    }

    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = 'Taluk Level Approver';

    const updated = all.map((item) => {
      if (item.status === 'Submitted' || item.status === 'Submitted to Taluk Approver' || item.status === 'Under Review' || item.status === 'Leading 10 Selected') {
        return {
          ...item,
          status: 'Submitted to District',
          history: [
            ...(item.history || []),
            {
              action: 'Block-wise Cultivators Shared with District',
              user: currentUser,
              role: 'Taluk Level Approver',
              timestamp: now,
              notes: notes || `Reviewed and forwarded ${selectedCount} block-wise selected cultivator(s) to District Level Approver.`
            }
          ]
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    this.addNotification({
      title: 'Block Selections Forwarded to District',
      message: `${selectedCount} block-wise selected cultivators forwarded to District Officer M. Menon for final sanction.`,
      type: 'success'
    });

    return updated;
  }

  /**
   * Supervisor or District Approver returns submission for correction
   */
  static returnSubmissionForCorrection(reason, predefinedReason = '', returnedByRole = 'Taluk Level Approver') {
    const all = this.getStorageSubmissions();
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = returnedByRole === 'District Level Approver' ? 'District Officer M. Menon' : 'Inspector S. Nair';
    const fullReason = `${predefinedReason ? `[${predefinedReason}] ` : ''}${reason}`;

    const updated = all.map(item => {
      if (item.status === 'Submitted' || item.status === 'Submitted to District' || item.status === 'Under Review') {
        return {
          ...item,
          status: 'Returned for Correction',
          returnReason: fullReason,
          returnedBy: currentUser,
          returnedAt: now,
          history: [
            ...(item.history || []),
            {
              action: 'Returned for Correction',
              user: currentUser,
              role: returnedByRole,
              timestamp: now,
              notes: `Returned: ${fullReason}`
            }
          ]
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    this.addNotification({
      title: 'Submission Returned for Correction',
      message: `Submission returned by ${returnedByRole}. Reason: ${fullReason}`,
      type: 'warning'
    });

    return updated;
  }

  /**
   * District Level Approver approves the submission
   */
  static approveDistrictSubmission(notes = '') {
    const all = this.getStorageSubmissions();
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const currentUser = 'District Officer M. Menon (District Approver)';

    const updated = all.map((item) => {
      if (item.status === 'Submitted to District' || item.status === 'Leading 10 Selected') {
        return {
          ...item,
          status: 'Approved',
          approvedBy: currentUser,
          approvedAt: now,
          history: [
            ...(item.history || []),
            {
              action: 'Approved by District Officer',
              user: currentUser,
              role: 'District Level Approver',
              timestamp: now,
              notes: notes || 'Final approval granted for crop forecast estimate submission.'
            }
          ]
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    this.addNotification({
      title: 'Forecast Estimate Approved!',
      message: `Submission #SUB-2026-0801 has been officially approved by District Level Approver M. Menon.`,
      type: 'success'
    });

    return updated;
  }

  // --- WORKFLOW: BLOCK-WISE CULTIVATOR SELECTION FOR FIELD INSPECTOR & TSO ---

  static WORKFLOW_STATE_KEY = 'earas_cultivator_selection_workflow_state';

  static getBlockWiseCultivators() {
    const submissions = this.getStorageSubmissions();
    const blocks = {};
    submissions.forEach((item) => {
      const b = item.block || 'Vyttila';
      if (!blocks[b]) {
        blocks[b] = [];
      }
      blocks[b].push(item);
    });
    return blocks;
  }

  static toggleCultivatorSelection(cultivatorId) {
    const all = this.getStorageSubmissions();
    const updated = all.map((item) => {
      if (item.id === cultivatorId) {
        return {
          ...item,
          isLeadingSelected: !item.isLeadingSelected
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    return updated;
  }

  static toggleSelectAllInBlock(blockName, selectAll) {
    const all = this.getStorageSubmissions();
    const updated = all.map((item) => {
      if (item.block === blockName) {
        return {
          ...item,
          isLeadingSelected: selectAll
        };
      }
      return item;
    });

    this.saveStorageSubmissions(updated);
    return updated;
  }

  static getCultivatorWorkflowState() {
    try {
      const stored = localStorage.getItem(this.WORKFLOW_STATE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading cultivator workflow state', e);
    }
    const defaultState = {
      status: 'Pending Inspector Selection',
      forwardedByRole: null,
      forwardedByName: null,
      forwardedAt: null,
      notes: '',
      destination: null,
      inspectorCompleted: false,
      tsoCompleted: false
    };
    localStorage.setItem(this.WORKFLOW_STATE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  static forwardSelectionByInspector(notes = '', selectedSummary = {}) {
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const newState = {
      status: 'Forwarded to Taluk Level Approver',
      forwardedByRole: 'Field Inspector',
      forwardedByName: 'Inspector S. Nair',
      forwardedAt: now,
      notes: notes || 'Cultivator selections completed Block-wise by Field Inspector.',
      destination: 'Taluk Level Approver',
      inspectorCompleted: true,
      tsoCompleted: false,
      selectedSummary
    };

    localStorage.setItem(this.WORKFLOW_STATE_KEY, JSON.stringify(newState));

    this.addNotification({
      title: 'Forwarded to Taluk Level Approver',
      message: `Field Inspector forwarded Block-wise cultivator selections to Taluk Level Approver.`,
      type: 'success'
    });

    return newState;
  }

  static resetCultivatorWorkflowState() {
    const defaultState = {
      status: 'Pending Inspector Selection',
      forwardedByRole: null,
      forwardedByName: null,
      forwardedAt: null,
      notes: '',
      destination: null,
      inspectorCompleted: false,
      tsoCompleted: false
    };
    localStorage.setItem(this.WORKFLOW_STATE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }
}

export default AdvancedForecastService;
