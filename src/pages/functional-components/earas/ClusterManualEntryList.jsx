import React from 'react';
import { Grid, Box, Card, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ClusterManualEntryList() {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    type: i % 2 === 0 ? 'wet' : 'dry'
  }));

  const navigate = useNavigate();
  const handleOpen = () => navigate('/schemes/earas/cluster_manual_entry');

  const getBg = (type) => (type === 'wet' ? '#DCEDC8' : '#FFCDD2');

  return (
    <Box sx={{ p: { xs: 3, sm: 4 } }}>
      <Typography
        variant="h3"
        component="h1"
        align="center"
        sx={{ mb: 4, fontWeight: 'bold', color: '#3f51b5' }}
      >
        Cluster Operation Entry
      </Typography>

      <Grid container spacing={1.5} justifyContent="center">
        {items.map((item) => (
          <Grid item xs={4} sm={3} md={2} lg={1} xl={1} key={item.id}>
            <Card
              onClick={handleOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
              sx={{
                background: getBg(item.type),
                border: '2px solid #9e9e9e',
                borderRadius: 2,
                textAlign: 'center',
                minHeight: { xs: 70, sm: 80 },
                p: 0.5,
                cursor: 'pointer'
              }}
            >
              <CardContent
                sx={{
                  p: '4px',
                  '&:last-child': { pb: '4px' },
                  width: '100%',
                  height: '50px',
                  boxSizing: 'border-box'
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 'bold', color: '#2C3E50', lineHeight: 1 }}
                >
                  {item.id}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: '#7F8C8D',
                    borderRadius: '3px',
                    p: '1px 4px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {item.type}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ClusterManualEntryList;
