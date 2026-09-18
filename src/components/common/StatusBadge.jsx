import React from 'react';
import { Chip } from '@mui/material';
import { COLOR_SEMANTICS, getPerformanceStatus } from 'constants/config';

/**
 * Enterprise Status Chip Component
 */
export default function StatusBadge({ status, percentage, label, size = 'small' }) {
  let chipLabel = label;
  let colorObj = COLOR_SEMANTICS.INFO;

  if (typeof percentage === 'number') {
    const perf = getPerformanceStatus(percentage);
    chipLabel = `${perf.label} (${percentage}%)`;
    colorObj = {
      main: perf.color,
      light: perf.bgColor,
      text: perf.textColor
    };
  } else if (status) {
    const uppercaseStatus = status.toUpperCase();
    if (uppercaseStatus === 'SUBMITTED' || uppercaseStatus === 'COMPLETED' || uppercaseStatus === 'ON_TRACK') {
      colorObj = COLOR_SEMANTICS.ON_TRACK;
      chipLabel = label || (uppercaseStatus === 'COMPLETED' ? 'Completed' : uppercaseStatus === 'ON_TRACK' ? 'On Track' : 'Submitted');
    } else if (uppercaseStatus === 'PARTIAL' || uppercaseStatus === 'NEEDS_ATTENTION' || uppercaseStatus === 'IN_PROGRESS') {
      colorObj = COLOR_SEMANTICS.NEEDS_ATTENTION;
      chipLabel = label || (uppercaseStatus === 'NEEDS_ATTENTION' ? 'Needs Attention' : uppercaseStatus === 'IN_PROGRESS' ? 'In Progress' : 'Partial');
    } else if (uppercaseStatus === 'NOT_SUBMITTED' || uppercaseStatus === 'CRITICAL' || uppercaseStatus === 'REJECTED') {
      colorObj = COLOR_SEMANTICS.CRITICAL;
      chipLabel = label || (uppercaseStatus === 'CRITICAL' ? 'Critical' : uppercaseStatus === 'REJECTED' ? 'Rejected' : 'Not Submitted');
    } else if (uppercaseStatus === 'INACTIVE') {
      colorObj = COLOR_SEMANTICS.INACTIVE;
      chipLabel = label || 'Inactive';
    }
  }

  return (
    <Chip
      label={chipLabel || 'Unknown'}
      size={size}
      sx={{
        backgroundColor: colorObj.light,
        color: colorObj.text || colorObj.main,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
        borderRadius: '6px',
        border: `1px solid ${colorObj.border || colorObj.light}`,
        px: 0.5
      }}
    />
  );
}
