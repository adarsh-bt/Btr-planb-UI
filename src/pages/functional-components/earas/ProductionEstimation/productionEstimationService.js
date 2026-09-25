/**
 * EARAS Production Estimation Service (Reworked)
 * Provides state management, mock data persistence, workflow engine, defect tracking, and agricultural calculations.
 */

export const DISTRICTS_MASTER = [
  {
    id: 'KL-EKM',
    name: 'Ernakulam',
    taluks: [
      {
        id: 'TAL-KNY',
        name: 'Kanayannur',
        blocks: [
          {
            id: 'BLK-VYTL',
            name: 'Vyttila',
            panchayaths: ['Kumbalangi', 'Chellanam', 'Maradu', 'Mulavukad']
          },
          {
            id: 'BLK-EDAP',
            name: 'Edappally',
            panchayaths: ['Cheranallur', 'Kadamakkudy', 'Elamkunnapuzha']
          }
        ]
      },
      {
        id: 'TAL-ALV',
        name: 'Aluva',
        blocks: [
          {
            id: 'BLK-ANG',
            name: 'Angamaly',
            panchayaths: ['Kalady', 'Malayattoor', 'Kanjoor', 'Manjapra']
          },
          {
            id: 'BLK-ALV',
            name: 'Aluva Block',
            panchayaths: ['Keezhmad', 'Chengamanad', 'Sreemoolanagaram']
          }
        ]
      }
    ]
  },
  {
    id: 'KL-TVM',
    name: 'Thiruvananthapuram',
    taluks: [
      {
        id: 'TAL-TVM',
        name: 'Thiruvananthapuram',
        blocks: [
          {
            id: 'BLK-NEM',
            name: 'Nemom',
            panchayaths: ['Kalliyoor', 'Venganoor', 'Balaramapuram']
          },
          {
            id: 'BLK-KZK',
            name: 'Kazhakkoottam',
            panchayaths: ['Kadinamkulam', 'Andoorkonam', 'Mangalapuram']
          }
        ]
      }
    ]
  },
  {
    id: 'KL-PKD',
    name: 'Palakkad',
    taluks: [
      {
        id: 'TAL-PKD',
        name: 'Palakkad',
        blocks: [
          {
            id: 'BLK-CLP',
            name: 'Chittur',
            panchayaths: ['Pudussery', 'Kodumbu', 'Polpully', 'Elapully']
          },
          {
            id: 'BLK-ALTR',
            name: 'Alathur',
            panchayaths: ['Kavassery', 'Tarur', 'Melarcode', 'Erimayur']
          }
        ]
      }
    ]
  }
];

export const CROPS_MASTER = [
  { id: 'Paddy', label: '🌾 Paddy (Rice)', level: 'Panchayath', category: 'Cereals', areaUnit: 'Hectares', yieldUnit: 'Kg/ha', defaultYield: 2850, prevYield: 2780 },
  { id: 'Coconut', label: '🥥 Coconut', level: 'Block', category: 'Plantation', areaUnit: 'Hectares', yieldUnit: 'Nuts/ha', defaultYield: 7420, prevYield: 7150 },
  { id: 'Rubber', label: '🪵 Rubber', level: 'Block', category: 'Plantation', areaUnit: 'Hectares', yieldUnit: 'Kg/ha', defaultYield: 1450, prevYield: 1420 },
  { id: 'Banana', label: '🍌 Banana (Nendran)', level: 'Block', category: 'Fruits', areaUnit: 'Hectares', yieldUnit: 'Tonnes/ha', defaultYield: 18.5, prevYield: 17.8 },
  { id: 'Tapioca', label: '🥔 Tapioca', level: 'Block', category: 'Tuber Crops', areaUnit: 'Hectares', yieldUnit: 'Tonnes/ha', defaultYield: 34.2, prevYield: 33.0 },
  { id: 'Pepper', label: '🫑 Black Pepper', level: 'Block', category: 'Spices', areaUnit: 'Hectares', yieldUnit: 'Kg/ha', defaultYield: 380, prevYield: 365 }
];

export const SEASONS_MASTER = [
  'Autumn (Virippu)',
  'Winter (Mundakan)',
  'Summer (Puncha)',
  'Annual (2025-2026)'
];

export const FINANCIAL_YEARS = ['2025-2026', '2024-2025', '2023-2024'];

export const ESTIMATION_TYPES = [
  'Advanced Estimate - 1st Forecast',
  'Advanced Estimate - 2nd Forecast',
  'Final Production Estimate',
  'Special Season Assessment'
];

export const WORKFLOW_ROLES = [
  'Production Estimator',
  'Production Estimator Verifier 1',
  'Production Estimator Verifier 2',
  'EARAD Admin',
  'Production Estimate Approver 2',
  'Director / State Level Approver'
];

export const WORKFLOW_STAGES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_VERIFIER_1: 'Pending Verifier 1',
  RETURNED_VERIFIER_1: 'Returned by Verifier 1',
  PENDING_VERIFIER_2: 'Pending Verifier 2',
  RETURNED_VERIFIER_2: 'Returned by Verifier 2',
  PENDING_EARAD_ADMIN: 'Pending EARAD Admin',
  RETURNED_EARAD_ADMIN: 'Returned by EARAD Admin',
  PENDING_APPROVER_2: 'Pending Approver 2',
  RETURNED_APPROVER_2: 'Returned by Approver 2',
  PENDING_DIRECTOR: 'Pending Director Approval',
  RETURNED_DIRECTOR: 'Returned by Director',
  APPROVED_FINAL: 'Approved — Final',
  REJECTED: 'Rejected'
};

export const DEFECT_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
export const DEFECT_STATUSES = ['Open', 'Under Correction', 'Resolved', 'Rejected', 'Closed'];

// Mock block availability database for crop estimation validation
const BLOCK_AVAILABILITY_SEED = [
  { district: 'Ernakulam', taluk: 'Kanayannur', block: 'Vyttila', panchayath: 'Kumbalangi', crop: 'Paddy', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 32, estArea: 1250, prevYield: 2780, estYield: 2920 },
  { district: 'Ernakulam', taluk: 'Kanayannur', block: 'Edappally', panchayath: 'Cheranallur', crop: 'Paddy', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 28, estArea: 800, prevYield: 2550, estYield: 2600 },
  { district: 'Ernakulam', taluk: 'Aluva', block: 'Angamaly', panchayath: 'Kalady', crop: 'Paddy', status: 'Pending CCE Cuts', isAvailable: false, ccePlotsCount: 12, estArea: 950, prevYield: 2800, estYield: 2820 },
  { district: 'Ernakulam', taluk: 'Aluva', block: 'Angamaly', panchayath: 'N/A (Block-Level)', crop: 'Coconut', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 45, estArea: 3600, prevYield: 7150, estYield: 7500 },
  { district: 'Ernakulam', taluk: 'Aluva', block: 'Aluva Block', panchayath: 'N/A (Block-Level)', crop: 'Coconut', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 40, estArea: 2800, prevYield: 7200, estYield: 7400 },
  { district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', block: 'Nemom', panchayath: 'N/A (Block-Level)', crop: 'Rubber', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 20, estArea: 1720, prevYield: 1420, estYield: 1480 },
  { district: 'Thiruvananthapuram', taluk: 'Thiruvananthapuram', block: 'Kazhakkoottam', panchayath: 'N/A (Block-Level)', crop: 'Rubber', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 22, estArea: 1900, prevYield: 1400, estYield: 1450 },
  { district: 'Palakkad', taluk: 'Palakkad', block: 'Chittur', panchayath: 'Polpully', crop: 'Paddy', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 50, estArea: 4100, prevYield: 3300, estYield: 3450 },
  { district: 'Palakkad', taluk: 'Palakkad', block: 'Alathur', panchayath: 'Kavassery', crop: 'Paddy', status: 'Ready for Estimation', isAvailable: true, ccePlotsCount: 42, estArea: 3200, prevYield: 3250, estYield: 3400 }
];

const INITIAL_ESTIMATIONS_SEED = [
  {
    id: 'PE-2026-EKM-001',
    financialYear: '2025-2026',
    season: 'Autumn (Virippu)',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayath: 'Kumbalangi',
    crop: 'Paddy',
    cropCategory: 'Cereals',
    estimationType: 'Final Production Estimate',
    estimationLevel: 'Panchayath',
    totalCultivatedArea: 1420,
    estimatedArea: 1250,
    cceArea: 1180,
    areaUnit: 'Hectares',
    cceObservationsCount: 32,
    prevSeasonYield: 2780,
    yieldEstimate: 2920,
    yieldUnit: 'Kg/ha',
    estimatedProduction: 3650,
    productionUnit: 'Metric Tonnes (MT)',
    prevSeasonProduction: 3475,
    remarks: 'Higher yield recorded due to high-yielding seeds (Uma variety).',
    currentStage: WORKFLOW_STAGES.PENDING_VERIFIER_1,
    currentRole: 'Production Estimator Verifier 1',
    status: 'Pending Verifier 1',
    createdDate: '2026-09-10 10:30 AM',
    createdBy: 'Ramesh K. (Estimator)',
    lastUpdated: '2026-09-12 02:15 PM',
    hasDefects: true,
    defectsCount: 1,
    workflowTimeline: [
      { stage: 'Initiation', role: 'Production Estimator', user: 'Ramesh K.', action: 'Submitted', timestamp: '2026-09-10 10:30 AM', status: 'Completed', remarks: 'Estimation submitted for Panchayath Kumbalangi.' },
      { stage: 'Verifier 1 Review', role: 'Production Estimator Verifier 1', user: 'Dr. Suresh Kumar', action: 'Under Verification', timestamp: '2026-09-12 02:15 PM', status: 'Pending', remarks: 'Marked 1 defect.' }
    ]
  },
  {
    id: 'PE-2026-EKM-002',
    financialYear: '2025-2026',
    season: 'Annual (2025-2026)',
    district: 'Ernakulam',
    taluk: 'Aluva',
    block: 'Angamaly',
    panchayath: 'N/A (Block-Level Estimation)',
    crop: 'Coconut',
    cropCategory: 'Plantation',
    estimationType: 'Advanced Estimate - 1st Forecast',
    estimationLevel: 'Block',
    totalCultivatedArea: 3800,
    estimatedArea: 3600,
    cceArea: 3550,
    areaUnit: 'Hectares',
    cceObservationsCount: 45,
    prevSeasonYield: 7150,
    yieldEstimate: 7500,
    yieldUnit: 'Nuts/ha',
    estimatedProduction: 27000,
    productionUnit: 'Thousand Nuts',
    prevSeasonProduction: 25740,
    remarks: 'Consistent productivity across Angamaly block.',
    currentStage: WORKFLOW_STAGES.PENDING_VERIFIER_2,
    currentRole: 'Production Estimator Verifier 2',
    status: 'Pending Verifier 2',
    createdDate: '2026-09-08 09:15 AM',
    createdBy: 'Anitha V. (Estimator)',
    lastUpdated: '2026-09-11 04:30 PM',
    hasDefects: false,
    defectsCount: 0,
    workflowTimeline: [
      { stage: 'Initiation', role: 'Production Estimator', user: 'Anitha V.', action: 'Submitted', timestamp: '2026-09-08', status: 'Completed', remarks: 'Submitted' },
      { stage: 'Verifier 1 Review', role: 'Production Estimator Verifier 1', user: 'Dr. Suresh Kumar', action: 'Verified & Forwarded', timestamp: '2026-09-11', status: 'Completed', remarks: 'Verified' }
    ]
  }
];

const INITIAL_DEFECTS_SEED = [
  {
    id: 'DEF-2026-001',
    estimationId: 'PE-2026-EKM-001',
    category: 'CCE Sample Deficiency',
    type: 'Sample Count Violation',
    severity: 'Medium',
    description: 'CCE observations count (32) is slightly below the mandatory minimum threshold of 35 for Panchayath level estimation.',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    panchayath: 'Kumbalangi',
    crop: 'Paddy',
    affectedField: 'CCE Observations Count',
    recommendedCorrection: 'Conduct 3 additional CCE sample plot cuts or attach field verification exemption note.',
    reviewerComments: 'Please clarify why 32 sample cuts were performed instead of 35.',
    identifiedBy: 'Dr. Suresh Kumar (Verifier 1)',
    identifiedDate: '2026-09-12 02:15 PM',
    status: 'Open'
  }
];

class ProductionEstimationService {
  constructor() {
    this.storageKey = 'earas_production_estimations_v1';
    this.defectsKey = 'earas_defects_v1';
    this.auditKey = 'earas_audit_trail_v1';
    this.initData();
  }

  initData() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(INITIAL_ESTIMATIONS_SEED));
    }
    if (!localStorage.getItem(this.defectsKey)) {
      localStorage.setItem(this.defectsKey, JSON.stringify(INITIAL_DEFECTS_SEED));
    }
    if (!localStorage.getItem(this.auditKey)) {
      const initialLogs = [
        { id: 'LOG-001', timestamp: '2026-09-12 02:15 PM', user: 'Dr. Suresh Kumar', role: 'Verifier 1', action: 'Marked Defect', target: 'PE-2026-EKM-001', details: 'Defect DEF-2026-001 marked for CCE sample size.' }
      ];
      localStorage.setItem(this.auditKey, JSON.stringify(initialLogs));
    }
  }

  getEstimations() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || INITIAL_ESTIMATIONS_SEED;
    } catch (e) {
      return INITIAL_ESTIMATIONS_SEED;
    }
  }

  saveEstimations(estimations) {
    localStorage.setItem(this.storageKey, JSON.stringify(estimations));
  }

  getDefects() {
    try {
      return JSON.parse(localStorage.getItem(this.defectsKey)) || INITIAL_DEFECTS_SEED;
    } catch (e) {
      return INITIAL_DEFECTS_SEED;
    }
  }

  saveDefects(defects) {
    localStorage.setItem(this.defectsKey, JSON.stringify(defects));
  }

  getAuditTrail() {
    try {
      return JSON.parse(localStorage.getItem(this.auditKey)) || [];
    } catch (e) {
      return [];
    }
  }

  logAudit(action, targetId, user, role, details) {
    const logs = this.getAuditTrail();
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      user,
      role,
      action,
      target: targetId,
      details
    };
    logs.unshift(newLog);
    localStorage.setItem(this.auditKey, JSON.stringify(logs));
  }

  // Validate Crop Availability for selected crops
  validateCropAvailability(selectedCropIds = []) {
    if (!selectedCropIds || selectedCropIds.length === 0) return [];
    return BLOCK_AVAILABILITY_SEED.filter((item) => selectedCropIds.includes(item.crop));
  }

  // Initiate Batch Estimation for selected crops and blocks
  initiateBatchEstimation({ selectedCrops = [], selectedBlockItems = [], financialYear = '2025-2026', season = 'Autumn (Virippu)', activeUser = 'Ramesh K.' }) {
    const estimations = this.getEstimations();
    const newRecords = [];
    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    selectedBlockItems.forEach((blk) => {
      const cropConfig = CROPS_MASTER.find((c) => c.id === blk.crop) || CROPS_MASTER[0];
      const newId = `PE-2026-${blk.district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const calc = this.calculateEstimationValues(blk.estArea, blk.estArea * 0.95, blk.estYield, blk.crop);

      const record = {
        id: newId,
        financialYear,
        season,
        district: blk.district,
        taluk: blk.taluk,
        block: blk.block,
        panchayath: blk.panchayath,
        crop: blk.crop,
        cropCategory: cropConfig.category,
        estimationType: 'Final Production Estimate',
        estimationLevel: cropConfig.level,
        totalCultivatedArea: Math.round(blk.estArea * 1.1),
        estimatedArea: blk.estArea,
        cceArea: Math.round(blk.estArea * 0.95),
        areaUnit: cropConfig.areaUnit,
        cceObservationsCount: blk.ccePlotsCount,
        prevSeasonYield: blk.prevYield,
        yieldEstimate: blk.estYield,
        yieldUnit: cropConfig.yieldUnit,
        estimatedProduction: calc.production,
        productionUnit: calc.productionUnit,
        prevSeasonProduction: Math.round((blk.estArea * blk.prevYield) / 1000),
        remarks: `Initiated batch estimation for ${blk.crop} in ${blk.block} (${blk.district}).`,
        currentStage: WORKFLOW_STAGES.DRAFT,
        currentRole: 'Production Estimator',
        status: 'Draft',
        createdDate: nowStr,
        createdBy: activeUser,
        lastUpdated: nowStr,
        hasDefects: false,
        defectsCount: 0,
        workflowTimeline: [
          {
            stage: 'Initiation',
            role: 'Production Estimator',
            user: activeUser,
            action: 'Initiated Estimation',
            timestamp: nowStr,
            status: 'Completed',
            remarks: `Estimation initiated for ${blk.crop}.`
          }
        ]
      };
      newRecords.push(record);
    });

    const updated = [...newRecords, ...estimations];
    this.saveEstimations(updated);
    this.logAudit('Initiated Batch Estimation', `Batch (${newRecords.length} records)`, activeUser, 'Production Estimator', `Initiated estimation for crops: ${selectedCrops.join(', ')}`);
    return newRecords;
  }

  calculateEstimationValues(estimatedArea, cceArea, yieldEstimate, cropName) {
    const area = parseFloat(estimatedArea) || 0;
    const cce = parseFloat(cceArea) || 0;
    const yld = parseFloat(yieldEstimate) || 0;

    const areaDiff = Math.abs(area - cce);
    const areaVariancePct = cce > 0 ? ((areaDiff / cce) * 100).toFixed(2) : '0.00';

    let production = 0;
    let unit = 'Metric Tonnes (MT)';

    if (cropName === 'Coconut') {
      production = Math.round((area * yld) / 1000);
      unit = 'Thousand Nuts';
    } else if (cropName === 'Banana' || cropName === 'Tapioca' || cropName === 'Vegetables') {
      production = parseFloat((area * yld).toFixed(2));
      unit = 'Metric Tonnes (MT)';
    } else {
      production = parseFloat(((area * yld) / 1000).toFixed(2));
      unit = 'Metric Tonnes (MT)';
    }

    return {
      areaDiff: areaDiff.toFixed(2),
      areaVariancePct,
      production,
      productionUnit: unit,
      isHighVariance: parseFloat(areaVariancePct) > 5.0
    };
  }

  processWorkflowAction({ estimationId, action, remarks, activeRole, activeUser }) {
    const estimations = this.getEstimations();
    const record = estimations.find((e) => e.id === estimationId);
    if (!record) return null;

    const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
    let newStage = record.currentStage;
    let newRole = record.currentRole;
    let newStatus = record.status;

    if (action === 'FORWARD_TO_VERIFIER_1' || action === 'VERIFY_FORWARD_1') {
      newStage = WORKFLOW_STAGES.PENDING_VERIFIER_1;
      newRole = 'Production Estimator Verifier 1';
      newStatus = 'Pending Verifier 1';
    } else if (action === 'VERIFY_FORWARD_2') {
      newStage = WORKFLOW_STAGES.PENDING_VERIFIER_2;
      newRole = 'Production Estimator Verifier 2';
      newStatus = 'Pending Verifier 2';
    } else if (action === 'ADMIN_APPROVE_FORWARD') {
      newStage = WORKFLOW_STAGES.PENDING_APPROVER_2;
      newRole = 'Production Estimate Approver 2';
      newStatus = 'Pending Approver 2';
    } else if (action === 'APPROVER2_FORWARD') {
      newStage = WORKFLOW_STAGES.PENDING_DIRECTOR;
      newRole = 'Director / State Level Approver';
      newStatus = 'Pending Director Approval';
    } else if (action === 'DIRECTOR_FINAL_APPROVE') {
      newStage = WORKFLOW_STAGES.APPROVED_FINAL;
      newRole = 'Director / State Level Approver';
      newStatus = 'Approved — Final';
    } else if (action === 'RETURN') {
      newStage = WORKFLOW_STAGES.RETURNED_VERIFIER_1;
      newStatus = 'Returned for Correction';
      newRole = 'Production Estimator';
    }

    record.currentStage = newStage;
    record.currentRole = newRole;
    record.status = newStatus;
    record.lastUpdated = nowStr;

    record.workflowTimeline.push({
      stage: activeRole,
      role: activeRole,
      user: activeUser,
      action: action.replace(/_/g, ' '),
      timestamp: nowStr,
      status: action.includes('RETURN') ? 'Returned' : 'Completed',
      remarks: remarks || 'Processed workflow action.'
    });

    this.saveEstimations(estimations);
    this.logAudit(action, estimationId, activeUser, activeRole, remarks || `Workflow stage updated to ${newStatus}`);
    return record;
  }

  createDefect(defectData, activeUser, activeRole) {
    const defects = this.getDefects();
    const newDefectId = `DEF-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newDefect = {
      id: newDefectId,
      estimationId: defectData.estimationId,
      category: defectData.category || 'General Data Defect',
      type: defectData.type || 'Data Discrepancy',
      severity: defectData.severity || 'Medium',
      description: defectData.description || '',
      district: defectData.district || 'Ernakulam',
      taluk: defectData.taluk || 'Kanayannur',
      block: defectData.block || 'Vyttila',
      panchayath: defectData.panchayath || 'Kumbalangi',
      crop: defectData.crop || 'Paddy',
      affectedField: defectData.affectedField || 'Area / Yield',
      recommendedCorrection: defectData.recommendedCorrection || 'Review field data.',
      reviewerComments: defectData.reviewerComments || defectData.description,
      identifiedBy: `${activeUser} (${activeRole})`,
      identifiedDate: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Open'
    };

    defects.unshift(newDefect);
    this.saveDefects(defects);

    const estimations = this.getEstimations();
    const est = estimations.find((e) => e.id === defectData.estimationId);
    if (est) {
      est.hasDefects = true;
      est.defectsCount = (est.defectsCount || 0) + 1;
      this.saveEstimations(estimations);
    }

    this.logAudit('Marked Defect', defectData.estimationId, activeUser, activeRole, `Defect ${newDefectId} marked: ${defectData.category}`);
    return newDefect;
  }

  updateDefectStatus(defectId, newStatus, activeUser, activeRole) {
    const defects = this.getDefects();
    const def = defects.find((d) => d.id === defectId);
    if (def) {
      def.status = newStatus;
      this.saveDefects(defects);
      this.logAudit('Updated Defect Status', def.estimationId, activeUser, activeRole, `Defect ${defectId} set to ${newStatus}`);
    }
    return def;
  }

  resetDemoData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.defectsKey);
    localStorage.removeItem(this.auditKey);
    this.initData();
  }
}

const instance = new ProductionEstimationService();
export default instance;
