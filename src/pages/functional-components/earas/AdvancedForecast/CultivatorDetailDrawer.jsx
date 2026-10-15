import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Paper,
  Chip,
  Button,
  Stack,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import AuditTrailTimeline from './AuditTrailTimeline';

const CultivatorDetailDrawer = ({
  open,
  onClose,
  record,
  activeRole,
  onToggleLeading
}) => {
  if (!record) return null;

  const curArea = record.currentYearArea || 0;
  const prevArea = record.previousYearArea || 0;
  const curYield = record.currentYearYield || 0;
  const prevYield = record.previousYearYield || 0;

  const areaDiff = curArea - prevArea;
  const areaChangePct = prevArea > 0 ? ((areaDiff / prevArea) * 100).toFixed(1) : '0.0';

  const yieldDiff = curYield - prevYield;
  const yieldChangePct = prevYield > 0 ? ((yieldDiff / prevYield) * 100).toFixed(1) : '0.0';

  const curProd = (curArea * curYield).toFixed(1);
  const prevProd = (prevArea * prevYield).toFixed(1);

  const canSelectLeading =
    activeRole === 'Taluk Field Inspector' ||
    activeRole === 'Taluk Level Approver' ||
    activeRole === 'Taluk Level Approver / Field Inspector';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520, md: 600 },
          p: 0,
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon sx={{ fontSize: '2rem', color: '#38bdf8' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
              {record.cultivatorName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Record ID: {record.id} • {record.panchayat} ({record.zone})
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Body */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* Leading Candidate Banner & Action Button */}
        {canSelectLeading && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              backgroundColor: record.isLeadingSelected ? '#fef3c7' : '#f0f9ff',
              border: record.isLeadingSelected ? '1px solid #f59e0b' : '1px solid #0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: record.isLeadingSelected ? '#92400e' : '#0369a1' }}>
                {record.isLeadingSelected ? '★ Selected as 10 Leading Cultivator' : 'Leading Cultivator Selection'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {record.isLeadingCandidate ? 'Auto-Recommended based on high yield growth' : 'Eligible for Block Leading 10'}
              </Typography>
            </Box>

            <Button
              variant={record.isLeadingSelected ? 'contained' : 'outlined'}
              color={record.isLeadingSelected ? 'warning' : 'primary'}
              startIcon={record.isLeadingSelected ? <StarIcon /> : <StarBorderIcon />}
              onClick={() => onToggleLeading && onToggleLeading(record.id)}
              sx={{ fontWeight: 700 }}
            >
              {record.isLeadingSelected ? 'Remove Selection' : 'Select as Leading'}
            </Button>
          </Paper>
        )}

        {/* Cultivator Profile Summary */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Cultivator &amp; Jurisdiction Details
        </Typography>

        <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Full Name
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {record.cultivatorName}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Contact Phone
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon fontSize="small" sx={{ fontSize: '0.9rem', color: '#0284c7' }} />
                {record.cultivatorPhone || '+91 98470 12345'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Panchayat &amp; Zone
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {record.panchayat} • {record.zone}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Block &amp; Taluk
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {record.block}, {record.taluk}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Crop Information */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Crop &amp; Season Parameters
        </Typography>

        <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Crop Name
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0284c7' }}>
                {record.crop}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Variety
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {record.variety || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Season
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {record.season}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                Yield Type
              </Typography>
              <Chip label={record.yieldType || 'Irrigated'} size="small" color="primary" variant="outlined" />
            </Grid>
          </Grid>
        </Paper>

        {/* Historical Comparative Analysis Matrix */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Previous Year vs Current Year Comparison
        </Typography>

        <Paper elevation={0} sx={{ p: 2.5, mb: 3, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <Grid container spacing={2}>
            {/* Area Comparison */}
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, backgroundColor: '#f1f5f9', borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Area (Hectares)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {curArea} ha
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Prev Year: {prevArea} ha
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {parseFloat(areaChangePct) >= 0 ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: parseFloat(areaChangePct) >= 0 ? '#16a34a' : '#dc2626' }}>
                    {parseFloat(areaChangePct) >= 0 ? `+${areaChangePct}%` : `${areaChangePct}%`}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Yield Comparison */}
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, backgroundColor: '#f1f5f9', borderRadius: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Yield (Quintals / t)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {curYield} q/ha
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Prev Year: {prevYield} q/ha
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  {parseFloat(yieldChangePct) >= 0 ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: parseFloat(yieldChangePct) >= 0 ? '#16a34a' : '#dc2626' }}>
                    {parseFloat(yieldChangePct) >= 0 ? `+${yieldChangePct}%` : `${yieldChangePct}%`}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Production Total */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, backgroundColor: '#e0f2fe', borderRadius: 2, border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369a1' }}>
                    Estimated Total Output Production
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
                    {curProd} Quintals
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Prev Production: {prevProd} Quintals
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Remarks */}
        {record.remarks && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 0.5 }}>
              Field Collector Remarks
            </Typography>
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#fffbebf0', border: '1px solid #fef08a', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#78350f' }}>
                "{record.remarks}"
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Returned Reason if any */}
        {record.returnReason && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mb: 0.5 }}>
              Returned Reason Comments
            </Typography>
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#991b1b' }}>
                {record.returnReason}
              </Typography>
            </Paper>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Audit Trail Timeline */}
        <AuditTrailTimeline history={record.history} />
      </Box>
    </Drawer>
  );
};

export default CultivatorDetailDrawer;
