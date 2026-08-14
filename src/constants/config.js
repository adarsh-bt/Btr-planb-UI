// Configurable performance health thresholds and color semantics

export const PERFORMANCE_THRESHOLDS = {
  ON_TRACK_MIN: 90,       // 90% - 100% = On Track
  NEEDS_ATTENTION_MIN: 70, // 70% - 89% = Needs Attention
  CRITICAL_MIN: 0          // 0% - 69% = Critical
};

export const STATUS_TYPES = {
  ON_TRACK: 'ON_TRACK',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  CRITICAL: 'CRITICAL',
  SUBMITTED: 'SUBMITTED',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS'
};

export const COLOR_SEMANTICS = {
  ON_TRACK: {
    main: '#16A34A',
    light: '#DCFCE7',
    border: '#86EFAC',
    text: '#15803D',
    label: 'On Track',
    badge: 'success'
  },
  NEEDS_ATTENTION: {
    main: '#D97706',
    light: '#FEF3C7',
    border: '#FDE68A',
    text: '#B45309',
    label: 'Needs Attention',
    badge: 'warning'
  },
  CRITICAL: {
    main: '#DC2626',
    light: '#FEE2E2',
    border: '#FCA5A5',
    text: '#B91C1C',
    label: 'Critical',
    badge: 'error'
  },
  SUBMITTED: {
    main: '#16A34A',
    light: '#DCFCE7',
    text: '#15803D',
    label: 'Submitted'
  },
  COMPLETED: {
    main: '#10B981',
    light: '#D1FAE5',
    text: '#047857',
    label: 'Completed'
  },
  PARTIAL: {
    main: '#F59E0B',
    light: '#FEF3C7',
    text: '#D97706',
    label: 'Partial'
  },
  NOT_SUBMITTED: {
    main: '#EF4444',
    light: '#FEE2E2',
    text: '#B91C1C',
    label: 'Not Submitted'
  },
  INFO: {
    main: '#2563EB',
    light: '#DBEAFE',
    border: '#93C5FD',
    text: '#1D4ED8',
    label: 'Info'
  },
  INACTIVE: {
    main: '#64748B',
    light: '#F1F5F9',
    text: '#475569',
    label: 'Inactive'
  }
};

export const AGRICULTURAL_YEARS = ['2026-27', '2025-26', '2024-25'];

export const MONTHS_LIST = [
  'April', 'May', 'June', 'July', 'August 2026', 'September', 
  'October', 'November', 'December', 'January', 'February', 'March'
];

export const CURRENT_AGRICULTURAL_YEAR = '2026-27';
export const CURRENT_MONTH = 'August 2026';

/**
 * Calculates status given an achievement percentage
 */
export const getPerformanceStatus = (percentage) => {
  if (percentage >= PERFORMANCE_THRESHOLDS.ON_TRACK_MIN) {
    return {
      statusKey: STATUS_TYPES.ON_TRACK,
      label: 'On Track',
      color: COLOR_SEMANTICS.ON_TRACK.main,
      bgColor: COLOR_SEMANTICS.ON_TRACK.light,
      textColor: COLOR_SEMANTICS.ON_TRACK.text,
      badge: 'success'
    };
  }
  if (percentage >= PERFORMANCE_THRESHOLDS.NEEDS_ATTENTION_MIN) {
    return {
      statusKey: STATUS_TYPES.NEEDS_ATTENTION,
      label: 'Needs Attention',
      color: COLOR_SEMANTICS.NEEDS_ATTENTION.main,
      bgColor: COLOR_SEMANTICS.NEEDS_ATTENTION.light,
      textColor: COLOR_SEMANTICS.NEEDS_ATTENTION.text,
      badge: 'warning'
    };
  }
  return {
    statusKey: STATUS_TYPES.CRITICAL,
    label: 'Critical',
    color: COLOR_SEMANTICS.CRITICAL.main,
    bgColor: COLOR_SEMANTICS.CRITICAL.light,
    textColor: COLOR_SEMANTICS.CRITICAL.text,
    badge: 'error'
  };
};
