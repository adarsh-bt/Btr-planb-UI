import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StatusBadge from 'components/common/StatusBadge';

export default function UserPerformanceDetailModal({ open, user, onClose }) {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            <PersonOutlineIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              {user.name} ({user.userCode})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.designation}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* User Location & Metadata Banner */}
        <Box p={2.5} mb={3} sx={{ backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                District
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                {user.district}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Taluk
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                {user.taluk}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Zone
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                {user.zone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Contact
              </Typography>
              <Typography variant="body2" fontWeight={600} color="#2563EB">
                {user.phone}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 1.5 }} />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Last Login</Typography>
              <Typography variant="body2" fontWeight={600}>{user.lastLogin}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Last Submission</Typography>
              <Typography variant="body2" fontWeight={600}>{user.lastSubmission}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Total Submissions</Typography>
              <Typography variant="body2" fontWeight={600} color="#16A34A">{user.totalSubmissions}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">Pending Activities</Typography>
              <Typography variant="body2" fontWeight={700} color={user.pendingCount > 0 ? '#DC2626' : '#16A34A'}>
                {user.pendingCount} Pending
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Four Current Module Cards */}
        <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={1.5}>
          Current Month Submissions (August 2026)
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  Tour Diary
                </Typography>
                <StatusBadge status={user.tourDiary} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  Actual Tour
                </Typography>
                <StatusBadge status={user.actualTour} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  Work Allocation
                </Typography>
                <StatusBadge status={user.workAllocation} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  Key Plot / CCE
                </Typography>
                <StatusBadge status={user.keyPlot} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Activity History Table */}
        <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={1.5}>
          Monthly Activity History
        </Typography>
        <TableContainer sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Tour Diary</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Actual Tour</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Work Allocation</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Key Plot</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Overall</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(user.monthlyHistory || []).map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                  <TableCell align="center">
                    <StatusBadge status={row.tourDiary} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={row.actualTour} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={row.workAllocation} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={row.keyPlot} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge
                      status={
                        row.overall === 'Completed'
                          ? 'ON_TRACK'
                          : row.overall === 'Not Submitted'
                          ? 'CRITICAL'
                          : 'NEEDS_ATTENTION'
                      }
                      label={row.overall}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
