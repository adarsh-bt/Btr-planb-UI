import React, { useRef, useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import {
  fetchNotifications,
  markNotificationsRead
} from 'pages/functional-components/earas/area-estimation/areaEstimationApi';
import { apiErrorMessage } from 'pages/functional-components/earas/area-estimation/apiErrors';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      // The recipient is the authenticated caller, resolved by the backend from the gateway's
      // headers. There is no parameter for whose notifications to fetch, so there is no way to ask
      // for someone else's.
      const result = await fetchNotifications(25);
      setNotifications(result?.notifications || []);
      setUnreadCount(result?.unreadCount || 0);
    } catch (error) {
      // The bell is ambient: a failure to load it must not interrupt whatever the user is doing.
      // An empty bell is the honest display when the list could not be read.
      console.error('Notifications could not be loaded:', apiErrorMessage(error));
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Still listens for the in-app event, so an action that raises a notification refreshes the
    // bell immediately instead of waiting for the next poll.
    window.addEventListener('earas-notifications-updated', loadNotifications);

    // The backend is the only source now, so the bell polls for anything raised elsewhere — an
    // approval forwarded to this user, a clarification assigned to their zone.
    const poll = setInterval(loadNotifications, 60000);

    return () => {
      window.removeEventListener('earas-notifications-updated', loadNotifications);
      clearInterval(poll);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
    } catch (error) {
      console.error('Notifications could not be marked as read:', apiErrorMessage(error));
    }
    loadNotifications();
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'white', bgcolor: open ? "orange" : 'transparent' }}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Mark as all read">
                          <IconButton color="success" size="small" onClick={handleMarkAllRead}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((noti) => (
                        <React.Fragment key={noti.id}>
                          <ListItemButton selected={!noti.read}>
                            <ListItemAvatar>
                              <Avatar sx={{
                                color: noti.type === 'success' ? 'success.main' : noti.type === 'error' ? 'error.main' : noti.type === 'warning' ? 'warning.main' : 'primary.main',
                                bgcolor: noti.type === 'success' ? 'success.lighter' : noti.type === 'error' ? 'error.lighter' : noti.type === 'warning' ? 'warning.lighter' : 'primary.lighter'
                              }}>
                                {noti.type === 'success' ? <CheckCircleOutlined /> : <MessageOutlined />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {noti.title}
                                </Typography>
                              }
                              secondary={noti.message}
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {new Date(noti.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                          <Divider />
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItemButton>
                        <ListItemText primary={<Typography align="center" color="text.secondary">No new alerts.</Typography>} />
                      </ListItemButton>
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
