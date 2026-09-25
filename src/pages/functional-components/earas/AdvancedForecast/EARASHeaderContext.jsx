import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import AdvancedForecastService from './advancedForecastService';

export const ROLE_DETAILS = {
  'Field Data Collector': {
    name: 'Ramesh K.',
    role: 'Field Data Collector',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    zone: 'Zone 01 / Zone 02 / Zone 03',
    icon: <PersonIcon sx={{ color: '#0284c7' }} />
  },
  'Field Inspector': {
    name: 'Inspector S. Nair',
    role: 'Field Inspector',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila / Paravur / Aluva',
    zone: 'All Supervisory Blocks',
    icon: <SupervisorAccountIcon sx={{ color: '#0284c7' }} />
  },
  'Taluk Field Inspector': {
    name: 'Inspector S. Nair',
    role: 'Taluk Field Inspector',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila / Paravur / Aluva',
    zone: 'All Supervisory Blocks',
    icon: <SupervisorAccountIcon sx={{ color: '#0284c7' }} />
  },
  'Taluk Level Approver': {
    name: 'Tahsildar / Approver V. Sharma',
    role: 'Taluk Level Approver',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila Block Jurisdiction',
    zone: 'Taluk Level Jurisdiction',
    icon: <VerifiedUserIcon sx={{ color: '#d97706' }} />
  },
  'Taluk Level Approver / Field Inspector': {
    name: 'Inspector S. Nair',
    role: 'Taluk Field Inspector',
    district: 'Ernakulam',
    taluk: 'Kanayannur',
    block: 'Vyttila',
    zone: 'All Supervisory Zones',
    icon: <SupervisorAccountIcon sx={{ color: '#d97706' }} />
  },
  'District Level Approver': {
    name: 'District Officer M. Menon',
    role: 'District Level Approver',
    district: 'Ernakulam',
    taluk: 'All Taluks (Kanayannur, Aluva, Paravur...)',
    block: 'District Level Jurisdiction',
    zone: 'Entire District',
    icon: <AccountBalanceIcon sx={{ color: '#059669' }} />
  }
};

const EARASHeaderContext = ({ activeRole, onRoleChange }) => {
  const roleConfig = ROLE_DETAILS[activeRole] || ROLE_DETAILS['Field Data Collector'];
  const [notifications, setNotifications] = useState(() => AdvancedForecastService.getNotifications());
  const [anchorEl, setAnchorEl] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    const updated = AdvancedForecastService.markAllNotificationsRead();
    setNotifications(updated);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        {/* Left Side: Jurisdiction & Context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              p: 1.2,
              borderRadius: 2,
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LocationOnIcon sx={{ color: '#38bdf8', fontSize: '2rem' }} />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.3px' }}>
                EARAS Crop Forecast Estimate Module
              </Typography>
              <Chip
                label="LIVE ENTERPRISE WORKFLOW"
                size="small"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#4ade80',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(34, 197, 94, 0.4)'
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <span>
                <strong>District:</strong> {roleConfig.district}
              </span>
              <span>•</span>
              <span>
                <strong>Taluk:</strong> {roleConfig.taluk}
              </span>
              <span>•</span>
              <span>
                <strong>Block:</strong> {roleConfig.block}
              </span>
              <span>•</span>
              <span>
                <strong>Zone:</strong> {roleConfig.zone}
              </span>
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Role Selector, Season & Notifications */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Season & Year Badge */}
          <Chip
            icon={<CalendarMonthIcon sx={{ color: '#e2e8f0 !important' }} />}
            label="Kharif 2026-27"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
              fontWeight: 600,
              fontSize: '0.85rem',
              py: 2,
              px: 1,
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Interactive Role Switcher Selector */}
          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="role-switcher-label" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Active User Role (Switch for Testing)
            </InputLabel>
            <Select
              labelId="role-switcher-label"
              value={activeRole}
              onChange={(e) => onRoleChange(e.target.value)}
              label="Active User Role (Switch for Testing)"
              sx={{
                color: '#fff',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.08)',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.25)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#38bdf8'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#38bdf8'
                },
                '.MuiSvgIcon-root': {
                  color: '#94a3b8'
                }
              }}
            >
              <MenuItem value="Field Data Collector">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" sx={{ color: '#0284c7' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Field Data Collector (Ramesh K.)
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Field Inspector">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupervisorAccountIcon fontSize="small" sx={{ color: '#0284c7' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Field Inspector (Inspector S. Nair)
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="Taluk Level Approver">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon fontSize="small" sx={{ color: '#d97706' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Taluk Level Approver (V. Sharma)
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="District Level Approver">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon fontSize="small" sx={{ color: '#059669' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    District Level Approver (M. Menon)
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Notifications Bell Button */}
          <Tooltip title="System Alerts & Workflow Notifications">
            <IconButton
              onClick={handleOpenNotifications}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Popover Menu */}
          <Popover
            open={popoverOpen}
            anchorEl={anchorEl}
            onClose={handleCloseNotifications}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            PaperProps={{
              sx: {
                width: 360,
                maxHeight: 450,
                borderRadius: 3,
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)'
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Notifications &amp; Alerts
              </Typography>
              {unreadCount > 0 && (
                <Button size="small" onClick={handleMarkAllRead} startIcon={<DoneAllIcon />} sx={{ fontSize: '0.75rem' }}>
                  Mark Read
                </Button>
              )}
            </Box>

            <List sx={{ p: 0 }}>
              {notifications.length === 0 ? (
                <ListItem sx={{ py: 3, textAlign: 'center' }}>
                  <ListItemText primary="No new notifications" secondary="All caught up!" />
                </ListItem>
              ) : (
                notifications.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        backgroundColor: item.read ? '#fff' : '#f0f9ff',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        {item.type === 'warning' ? (
                          <WarningAmberIcon sx={{ color: '#d97706', fontSize: '1.3rem' }} />
                        ) : (
                          <InfoOutlinedIcon sx={{ color: '#0284c7', fontSize: '1.3rem' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: item.read ? 600 : 700, color: '#1e293b' }}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', mt: 0.3 }}>
                              {item.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                              {item.timestamp}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              )}
            </List>
          </Popover>
        </Box>
      </Box>
    </Paper>
  );
};

export default EARASHeaderContext;
