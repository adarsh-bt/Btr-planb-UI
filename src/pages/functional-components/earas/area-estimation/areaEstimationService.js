import axios from 'axios';


// Initial static seed data for Form-1 validation status
const INITIAL_FORM1_SUBMISSIONS = [
  // Thiruvananthapuram
  { 
    districtId: 1, 
    district: 'Thiruvananthapuram', 
    taluk: 'Neyyattinkara', 
    zone: 'Zone TVM-01', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Ananthu S.'
  },
  { 
    districtId: 1, 
    district: 'Thiruvananthapuram', 
    taluk: 'Trivandrum', 
    zone: 'Zone TVM-02', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Biju Kumar'
  },
  // Kollam
  { 
    districtId: 2, 
    district: 'Kollam', 
    taluk: 'Kollam', 
    zone: 'Zone KLM-01', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Chitra R.'
  },
  { 
    districtId: 2, 
    district: 'Kollam', 
    taluk: 'Kottarakkara', 
    zone: 'Zone KLM-02', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: false, // Pending in Summer (N/A investigator and N/A clusters)
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'N/A'
  },
  { 
    districtId: 2, 
    district: 'Kollam', 
    taluk: 'Karunagappally', 
    zone: 'Zone KLM-03', 
    submittedAutumn: true, 
    submittedWinter: true, // Mark Winter submitted to make Winter a successful example
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Hari Prasad'
  },
  // Alappuzha
  { 
    districtId: 4, 
    district: 'Alappuzha', 
    taluk: 'Cherthala', 
    zone: 'Zone ALP-01', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Kiran Mohan'
  },
  { 
    districtId: 4, 
    district: 'Alappuzha', 
    taluk: 'Karthikappally', 
    zone: 'Zone ALP-02', 
    submittedAutumn: true, // Mark Autumn submitted to make Autumn a successful example
    submittedWinter: true, // Mark Winter submitted to make Winter a successful example
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Lekshmi S.'
  },
  // Palakkad
  { 
    districtId: 9, 
    district: 'Palakkad', 
    taluk: 'Palakkad', 
    zone: 'Zone PKD-01', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Manoj K.'
  },
  { 
    districtId: 9, 
    district: 'Palakkad', 
    taluk: 'Alathur', 
    zone: 'Zone PKD-02', 
    submittedAutumn: true, 
    submittedWinter: true, 
    submittedSummer: true,
    pendingClustersAutumn: [],
    pendingClustersWinter: [],
    pendingClustersSummer: [],
    investigatorName: 'Nisha V.'
  },
];

const INITIAL_OBSERVATIONS = [
  {
    id: 'OBS-101',
    type: 'Data Issue',
    remarks: 'High dry area variation in Coconut compared to baseline census.',
    severity: 'High',
    assignedZone: 'Zone KLM-02',
    date: '2026-06-29T10:00:00.000Z',
    status: 'Clarification Requested',
    responses: []
  },
  {
    id: 'OBS-102',
    type: 'Validation Issue',
    remarks: 'Wheat crop reported in double crop wet area, please check.',
    severity: 'Medium',
    assignedZone: 'Zone PKD-02',
    date: '2026-06-28T14:30:00.000Z',
    status: 'Approved',
    responses: [
      { remarks: 'Verified, it was a manual entry error by field officer. Corrected.', date: '2026-06-29T09:00:00.000Z', notes: 'Form-1 re-verified.' }
    ]
  }
];

const INITIAL_AUDIT_LOGS = [
  { user: 'EARAS Admin', action: 'System Diagnostics Run', timestamp: '2026-06-29T08:00:00.000Z', remarks: 'Standard morning system status verification' },
];

// Helper to load/save state
const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const areaEstimationService = {
  validateForm1Submissions: (estimationType, season, districtId, landType) => {
    const submissions = getStorageItem('earas_form1_submissions', INITIAL_FORM1_SUBMISSIONS);

    // Filter submissions by district if specified
    const targetSubmissions = districtId && districtId !== 'All'
      ? submissions.filter(s => s.districtId === parseInt(districtId))
      : submissions;

    const isSeasonal = estimationType === 'Seasonal Crops';
    
    // Non-seasonal categories are always successful
    if (!isSeasonal) {
      return {
        passed: true,
        pendingZones: []
      };
    }

    const targetSeason = season;

    const pending = targetSubmissions.filter(s => {
      if (targetSeason === 'Autumn') return !s.submittedAutumn;
      if (targetSeason === 'Winter') return !s.submittedWinter;
      return !s.submittedSummer; // Summer
    });

    const passed = pending.length === 0;

    return {
      passed,
      pendingZones: pending.map(p => {
        let clusters = [];
        if (targetSeason === 'Autumn') {
          clusters = p.pendingClustersAutumn || [];
        } else if (targetSeason === 'Winter') {
          clusters = p.pendingClustersWinter || [];
        } else {
          clusters = p.pendingClustersSummer || [];
        }

        return {
          district: p.district,
          taluk: p.taluk,
          zone: p.zone,
          pendingClusters: clusters,
          investigatorName: p.investigatorName || (p.zone === 'Zone KLM-02' ? 'N/A' : 'N/A'),
          status: 'Pending'
        };
      })
    };
  },

  // Initiate Area Estimation Process
  initiateEstimation: (type, year, season, districtId, landType = 'All') => {
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    setStorageItem(key, 'Running');

    // Add Audit Log
    const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
    audit.push({
      user: 'EARAS Admin',
      action: 'Estimation Initiated',
      timestamp: new Date().toISOString(),
      remarks: `Initiated ${type} estimation for ${year} ${type === 'Seasonal Crops' ? season : ''}`
    });
    setStorageItem('earas_audit_trail', audit);

    // Trigger notification
    areaEstimationService.addNotification({
      title: 'Estimation Initiated',
      message: `Area Estimation initiated for ${type} (${year}).`,
      type: 'info',
      timestamp: new Date().toISOString()
    });
  },

  getEstimationState: (type, year, season, districtId, landType = 'All') => {
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    return localStorage.getItem(key) || 'Validation Pending';
  },

  setEstimationState: (type, year, season, districtId, state, landType = 'All') => {
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    localStorage.setItem(key, state);

    if (state === 'Review Required') {
      areaEstimationService.addNotification({
        title: 'Estimation Completed',
        message: `Area Estimation results ready for review (${type} - ${year}).`,
        type: 'success',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Summary Metrics
  getDashboardMetrics: (estimationType, year, season, districtId, landType = 'All') => {
    const submissions = getStorageItem('earas_form1_submissions', INITIAL_FORM1_SUBMISSIONS);
    const targetSubmissions = districtId && districtId !== 'All'
      ? submissions.filter(s => s.districtId === parseInt(districtId))
      : submissions;

    const isSeasonal = estimationType === 'Seasonal Crops';

    const totalZones = targetSubmissions.length;
    let pendingZonesCount = 0;

    if (isSeasonal) {
      const pendingZonesList = targetSubmissions.filter(s => {
        if (season === 'Autumn') return !s.submittedAutumn;
        if (season === 'Winter') return !s.submittedWinter;
        return !s.submittedSummer;
      });
      pendingZonesCount = pendingZonesList.length;
    }

    const submittedZonesCount = totalZones - pendingZonesCount;

    // Load completed & pending estimations based on key prefixes
    const keys = Object.keys(localStorage);
    let completedCount = 4; // Mock baseline
    keys.forEach(k => {
      if (k.startsWith('est_status_') && localStorage.getItem(k) === 'Completed') {
        completedCount++;
      }
    });

    const observations = getStorageItem('earas_observations', INITIAL_OBSERVATIONS);
    const pendingClarifications = observations.filter(o => o.status === 'Clarification Requested').length;

    return {
      totalZones,
      submittedZones: submittedZonesCount,
      pendingZones: pendingClarifications, // Wait, prompt says: "Clarifications Pending" and "Pending Zones"
      formPendingZones: pendingZonesCount, // Form-1 pending
      completedEstimations: completedCount,
      clarificationsPending: pendingClarifications
    };
  },

  // Audit Logs
  getAuditLogs: () => {
    return getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
  },

  // Observations Review Workspace
  getObservations: () => {
    return getStorageItem('earas_observations', INITIAL_OBSERVATIONS);
  },

  addObservation: (obs) => {
    const observations = getStorageItem('earas_observations', INITIAL_OBSERVATIONS);
    const newObs = {
      id: `OBS-${100 + observations.length + 1}`,
      type: obs.type,
      remarks: obs.remarks,
      severity: obs.severity,
      assignedZone: obs.assignedZone,
      date: new Date().toISOString(),
      status: 'Clarification Requested',
      responses: []
    };
    observations.push(newObs);
    setStorageItem('earas_observations', observations);

    // Audit Log
    const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
    audit.push({
      user: 'Designated Officer',
      action: 'Observation Added',
      timestamp: new Date().toISOString(),
      remarks: `Added ${obs.severity} severity observation (${obs.type}) for ${obs.assignedZone}.`
    });
    setStorageItem('earas_audit_trail', audit);

    // Notification
    areaEstimationService.addNotification({
      title: 'Clarification Requested',
      message: `Observation registered for ${obs.assignedZone}. Clarification pending.`,
      type: 'error',
      timestamp: new Date().toISOString()
    });

    return newObs;
  },

  approveEstimation: (type, year, season, districtId, landType = 'All') => {
    // Approve Estimation status
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    localStorage.setItem(key, 'Completed');

    // Audit Log
    const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
    audit.push({
      user: 'Additional Director',
      action: 'Approved & Published',
      timestamp: new Date().toISOString(),
      remarks: `Approved estimation for ${type} ${year} ${type === 'Seasonal Crops' ? season : ''}`
    });
    setStorageItem('earas_audit_trail', audit);

    // Notification
    areaEstimationService.addNotification({
      title: 'Estimation Published',
      message: `${type} estimation for ${year} was successfully approved and published.`,
      type: 'success',
      timestamp: new Date().toISOString()
    });
  },

  submitWorkflowStep: (type, year, season, districtId, landType, nextState, user, remarks) => {
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    localStorage.setItem(key, nextState);

    // Add Audit Log
    const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
    audit.push({
      user: user,
      action: `Advanced to ${nextState}`,
      timestamp: new Date().toISOString(),
      remarks: remarks || `Advanced workflow state to ${nextState}`
    });
    setStorageItem('earas_audit_trail', audit);

    // Add Notification
    areaEstimationService.addNotification({
      title: `Workflow Advanced`,
      message: `${type} estimation for ${year} is now at: ${nextState}.`,
      type: 'info',
      timestamp: new Date().toISOString()
    });
  },

  reinitiateEstimationWorkflow: (type, year, season, districtId, landType, user, remarks) => {
    const key = `est_status_${type}_${year}_${season}_${landType}_${districtId}`;
    localStorage.setItem(key, 'Validation Pending');

    // Add Audit Log
    const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
    audit.push({
      user: user,
      action: 'Workflow Reset',
      timestamp: new Date().toISOString(),
      remarks: remarks || 'Estimation re-initiated and workflow reset due to identified anomalies.'
    });
    setStorageItem('earas_audit_trail', audit);

    // Add Notification
    areaEstimationService.addNotification({
      title: 'Estimation Reset',
      message: `${type} estimation for ${year} has been reset for re-initiation.`,
      type: 'warning',
      timestamp: new Date().toISOString()
    });
  },

  // Zone Respond to Clarification
  respondToClarification: (id, responseText, notes) => {
    const observations = getStorageItem('earas_observations', INITIAL_OBSERVATIONS);
    const obsIndex = observations.findIndex(o => o.id === id);
    if (obsIndex > -1) {
      observations[obsIndex].status = 'Resubmitted';
      observations[obsIndex].responses.push({
        remarks: responseText,
        notes: notes,
        date: new Date().toISOString()
      });
      setStorageItem('earas_observations', observations);

      // Audit Log
      const audit = getStorageItem('earas_audit_trail', INITIAL_AUDIT_LOGS);
      audit.push({
        user: 'Zone User',
        action: 'Resubmitted',
        timestamp: new Date().toISOString(),
        remarks: `Resubmitted clarification response for observation ID ${id}`
      });
      setStorageItem('earas_audit_trail', audit);

      // Notification
      areaEstimationService.addNotification({
        title: 'Clarification Resubmitted',
        message: `Response submitted for observation ${id}. Under review.`,
        type: 'info',
        timestamp: new Date().toISOString()
      });

      return true;
    }
    return false;
  },

  // Notification center utils
  getNotifications: () => {
    const list = getStorageItem('earas_notifications', [
      { id: 1, title: 'Welcome to EARAS', message: 'Area Estimation System initialized.', type: 'info', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: 2, title: 'Form-1 Submissions Open', message: 'Autumn crop Form-1 entries are now accepting submissions.', type: 'success', timestamp: new Date(Date.now() - 7200000).toISOString(), read: false }
    ]);
    return list;
  },

  addNotification: (noti) => {
    const list = getStorageItem('earas_notifications', []);
    const newNoti = {
      id: list.length + 1,
      title: noti.title,
      message: noti.message,
      type: noti.type || 'info',
      timestamp: noti.timestamp || new Date().toISOString(),
      read: false
    };
    list.unshift(newNoti); // Add to top
    setStorageItem('earas_notifications', list);

    // Trigger local DOM event to notify Notification.jsx of localStorage updates
    window.dispatchEvent(new Event('earas-notifications-updated'));
  },

  markNotificationsAsRead: () => {
    const list = getStorageItem('earas_notifications', []);
    const updated = list.map(n => ({ ...n, read: true }));
    setStorageItem('earas_notifications', updated);
    window.dispatchEvent(new Event('earas-notifications-updated'));
  },

  // =========================================================
  // CENTRALIZED API INTEGRATION SERVICES (AXIOS)
  // Toggle USE_MOCK_API = false to route requests to backend
  // =========================================================

  // 1. Fetch Area Estimation Results (Pivot Table layout for State, District, Block, Panchayat)
  fetchEstimationResults: async ({ geoLevel, estType, season, year, districtId, blockId, panchayatId }) => {
    if (USE_MOCK_API) {
      console.log(`[API MOCK] fetchEstimationResults:`, { geoLevel, estType, season, year, districtId, blockId, panchayatId });
      await new Promise(resolve => setTimeout(resolve, 300));
      return null; // Component falls back to mock-generator if response is null
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/estimation/results`, {
        params: {
          geoLevel,        // 'State' | 'District' | 'Block' | 'Panchayat'
          estType,         // 'Seasonal Crops' | 'Land Utilization' | 'Irrigation' | 'Annual & Perennial Crops'
          season,          // 'Autumn' | 'Winter' | 'Summer'
          year,            // e.g. '2026' (Agricultural Year)
          districtId,      // Optional
          blockId,         // Optional
          panchayatId      // Optional
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error in fetchEstimationResults:', error);
      throw error;
    }
  },

  // 2. Initiate Area Estimation Calculation
  apiInitiateEstimation: async ({ estType, year, season, districtId, landType }) => {
    if (USE_MOCK_API) {
      console.log(`[API MOCK] apiInitiateEstimation:`, { estType, year, season, districtId, landType });
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true, message: 'Estimation initiated successfully' };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/estimation/initiate`, {
        estType,          // 'Seasonal Crops' | 'Land Utilization' | 'Irrigation' | 'Annual & Perennial Crops'
        agricultureYear: year, // e.g. '2026'
        season,           // 'Autumn' | 'Winter' | 'Summer'
        districtId,       // 'All' or specific ID
        landType
      });
      return response.data;
    } catch (error) {
      console.error('API Error in apiInitiateEstimation:', error);
      throw error;
    }
  },

  getEstimationHistory: (type, year, season, districtId, landType = 'All') => {
    const key = `est_history_${type}_${year}_${season}_${landType}_${districtId}`;
    return getStorageItem(key, []);
  },

  addEstimationActivity: (type, year, season, districtId, landType, user, action, remarks) => {
    const key = `est_history_${type}_${year}_${season}_${landType}_${districtId}`;
    const history = getStorageItem(key, []);
    history.push({
      user,
      action,
      timestamp: new Date().toISOString(),
      remarks
    });
    setStorageItem(key, history);
  },

  // 3. Report Discrepancy / Flag Issue on Panchayat/Zone level estimation
  apiFlagDiscrepancy: async ({ panchayatId, zoneName, crop, description, severity }) => {
    if (USE_MOCK_API) {
      console.log(`[API MOCK] apiFlagDiscrepancy:`, { panchayatId, zoneName, crop, description, severity });
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true, message: 'Discrepancy reported successfully' };
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/estimation/flag-discrepancy`, {
        panchayatId,
        zoneName,
        category: crop,
        details: description,
        severityLevel: severity // 'Low' | 'Medium' | 'High'
      });
      return response.data;
    } catch (error) {
      console.error('API Error in apiFlagDiscrepancy:', error);
      throw error;
    }
  }
};

const USE_MOCK_API = true;
const API_BASE_URL = 'https://api.example.com/api/v1/earas';

export default areaEstimationService;
