import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getRecentSubmissions } from 'api/dashboardApi';
import { useNavigate } from 'react-router-dom';

export default function RecentSubmissionsTimeline() {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getRecentSubmissions().then((data) => setSubmissions(data));
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3.5,
        borderRadius: 2.5,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.04)'
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccessTimeIcon sx={{ color: '#2563EB' }} />
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Recent Submissions
          </Typography>
        </Box>

        <Button
          variant="text"
          size="small"
          onClick={() => navigate('/reports')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          View All
        </Button>
      </Box>

      <List disablePadding>
        {submissions.map((sub, index) => (
          <React.Fragment key={sub.id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                px: 0,
                py: 1.5
              }}
            >
              <ListItemAvatar sx={{ minWidth: 44 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#DCFCE7', color: '#16A34A' }}>
                  <CheckCircleIcon sx={{ fontSize: 18 }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      {sub.userName} ({sub.userId})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {sub.submittedAt}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Submitted <Typography component="span" variant="body2" fontWeight={600} color="#1E293B">{sub.module}</Typography> for {sub.month}
                    </Typography>
                    <Chip label={sub.status} size="small" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                  </Box>
                }
              />
            </ListItem>
            {index < submissions.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
