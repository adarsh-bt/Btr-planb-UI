import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Breadcrumb from 'routes/Breadcrumb';
import { useContext } from 'react';
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// import { flattenPermissions } from 'contexts/auth-reducer/permissionHelpers';

const earas_list = () => {
  const theme = useTheme();
  //  const { permissions, loading, error } = useContext(PermissionsContext);
  
  //   // Flatten permissions for easy checking
  //   const userPermissions = flattenPermissions(permissions);
  
  //   // Check if user has "View BTR"
  //   const canViewBTR = userPermissions.includes('View BTR');

  const cardData = [
    {
      title: 'Zone Details',
      image: 'https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png',
      gradient: 'linear-gradient(135deg, rgba(118, 184, 82, 0.45), rgb(143, 200, 123))', // Green
      url: ''
    },
    // Only show if user does NOT have "View BTR"
    // !canViewBTR ? 
    {
      title: 'e-BTR',
      image: '...',
      gradient: '...',
      // url: '/schemes/earas/btr'
      url: '/schemes/earas/btr'
    // } : null
    }
    ,
    {
      title: 'Cluster Formation',
      image: 'https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png',
      gradient: 'linear-gradient(135deg, rgba(0, 200, 255, 0.45), rgb(102, 186, 255))', // Light Blue
      url: ''
    },
    {
      title: 'Crop Cutting Experiment',
      image: 'https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png',
      gradient: 'linear-gradient(135deg, rgba(180, 146, 254, 0.45), rgb(155, 120, 250))', // Soft Purple
      url: ''
    },
    {
      title: 'Reports',
      image: 'https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png',
      gradient: 'linear-gradient(135deg, rgba(118, 184, 82, 0.45), rgb(143, 200, 123))', // Green (Repeat for pattern)
      url: ''
    },
    {
      title: 'Form 1',
      image: 'https://png.pngtree.com/png-vector/20230302/ourmid/pngtree-dashboard-line-icon-vector-png-image_6626604.png',
      gradient: 'linear-gradient(135deg, rgba(0, 200, 255, 0.45), rgb(102, 186, 255))', // Light Blue (Repeat for pattern)
      url: ''
    }
  ].filter(Boolean);

  return (
    <div>
      <Breadcrumb></Breadcrumb>
      <Typography variant="h3" sx={{ marginBottom: 4 }}>
        Earas
      </Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="center" sx={{ p: 3, gap: 2, backgroundColor: 'white' }}>
        {cardData.map(({ title, image, gradient, url }, index) => (
          <Card
            component={Link}
            to={url}
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              width: 400,
              borderRadius: '16px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              backgroundColor: '#fff',
              backgroundImage: gradient,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                backgroundColor: '#87CEEB',
                backgroundImage: gradient
              }
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: 100, height: 100, margin: 2 }} // Smaller image, no rounded corners
              image={image}
              alt={title}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {title}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>
    </div>
  );
};

export default earas_list;
