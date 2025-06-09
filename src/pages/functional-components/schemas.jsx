import React from 'react'
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';


import { Link} from 'react-router-dom'; 


import MainCard from 'components/MainCard';
import Breadcrumb from 'routes/Breadcrumb';

import { useContext } from 'react';
import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
import { flattenPermissions } from 'contexts/auth-reducer/permissionHelpers';







function Schemas() {
  const theme = useTheme();
  const { permissions, loading, error } = useContext(PermissionsContext);

  // Flatten permissions for easy checking
  const userPermissions = flattenPermissions(permissions);

  // Check if user has "View BTR"
  const canViewBTR = userPermissions.includes('View BTR');

  return (
  
        <Grid container spacing={3}>
        <Breadcrumb></Breadcrumb>
          <Grid item xs={12}>
          <Typography variant='h3' sx={{marginBottom:2}}>Schemes</Typography>
            <MainCard title="">
             
              <Grid container spacing={4}>
                {/* {canViewBTR && ( */}
               <Grid item xs={12} sm={4} md={3} lg={3}>               
  <Card component={Link} to="/schemes/earas"
    sx={{
      textDecoration:'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      borderRadius: '1rem',
      background: 'linear-gradient(135deg, rgba(99, 155, 255, 0.57), rgb(51, 125, 253))',
      transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      minHeight: '8rem',
    }}
  >
    <CardMedia
      component="img"
      sx={{
        width: '6rem',
        height: '5rem',
        borderRadius: '.5rem',
        marginRight: '1rem',
      }}
      image="src/assets/images/logo/EARAS.png"
      alt="Dashboard Icon"
    />

    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
        <Typography
          component="div"
          variant="h3" // Make it bigger, or use "h2" if desired
          sx={{
            fontWeight: 'bold',
            color: '#fff',
            fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' }, // Responsive sizing (optional)
          }}
        >
          EARAS
        </Typography>
        {/* Subtitle removed */}
      </CardContent>
    </Box>
  </Card>
</Grid>

    {/* )} */}

    <Grid item xs={12} sm={4} md={3} lg={3}>             
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',

          background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
          opacity: 0.6, // Makes it look inactive
          filter: 'grayscale(100%)', // Grays out the card
          boxShadow: 'none', // No shadow
          cursor: 'not-allowed', // Indicate non-clickable
          pointerEvents: 'none', // Disable interaction (optional)


          // background: 'linear-gradient(135deg, rgba(79, 208, 170, 0.57), rgb(37, 187, 142))', // Gradient color
          // transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          // '&:hover': {
          //   transform: 'scale(1.05)', // Hover scale effect
          //   // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
          //   boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          // },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn4.iconfinder.com/data/icons/finance-373/25/Employee_ID-512.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              Prices
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',

          background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
          opacity: 0.6, // Makes it look inactive
          filter: 'grayscale(100%)', // Grays out the card
          boxShadow: 'none', // No shadow
          cursor: 'not-allowed', // Indicate non-clickable
          pointerEvents: 'none', // Disable interaction (optional)
          
          // background: 'linear-gradient(135deg, rgba(255, 142, 142, 0.57), rgb(243, 85, 85))', // Gradient color
          // transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          // '&:hover': {
          //   transform: 'scale(1.05)', // Hover scale effect
          //   // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
          //   boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          // },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/10584/10584957.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
             Scheme 3
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',

          background: 'linear-gradient(135deg, #cfd8dc, #b0bec5)', // Muted gray gradient
          opacity: 0.6, // Makes it look inactive
          filter: 'grayscale(100%)', // Grays out the card
          boxShadow: 'none', // No shadow
          cursor: 'not-allowed', // Indicate non-clickable
          pointerEvents: 'none', // Disable interaction (optional)


          // background: 'linear-gradient(135deg, rgba(180, 146, 254, 0.57), rgb(132, 94, 247))', // Gradient color
          // transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          // '&:hover': {
          //   transform: 'scale(1.05)', // Hover scale effect
          //   // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
          //   boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          // },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              Scheme 4
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>
 {/*
    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 199, 95, 0.57), rgb(240, 147, 43))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/977/977464.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(129, 199, 212, 0.57), rgb(41, 182, 246))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 94, 98, 0.57), rgb(241, 39, 85))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/4615/4615903.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>

    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(255, 223, 138, 0.57), rgb(255, 193, 7))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://cdn-icons-png.flaticon.com/512/977/977464.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>


    <Grid item xs={12} sm={4} md={3} lg={3}>              
    <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(123, 239, 178, 0.57), rgb(46, 204, 113))', // Gradient color
          transition: 'transform 0.3s ease-in-out, background 0.3s ease-in-out', // Transition effect
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Box shadow
          '&:hover': {
            transform: 'scale(1.05)', // Hover scale effect
            // background: 'linear-gradient(135deg, #ff9a8b, #ff6f61)', // Darker gradient on hover
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)', // Stronger shadow on hover
          },
        }}
      >
        <CardMedia
          component="img"
          sx={{
            width: '5rem',
            height: '5rem',
            borderRadius: '.5rem',
            marginRight: '1rem', // Space between image and text
          }}
          image="https://icons.veryicon.com/png/o/miscellaneous/common-face-icons-continuously-updated/scan-business-card.png"
          alt="Dashboard Icon"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: '1 0 auto', textAlign: 'center' }}>
            <Typography component="div" variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              EARAS
            </Typography>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{
                color: '#f3f3f3',
                fontStyle: 'italic',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
              }}
            >
              --- ----
            </Typography>
          </CardContent>
        </Box>
      </Card>
    </Grid>           */}
              </Grid>
            </MainCard>
          </Grid>
      
          
        </Grid>
    
  
  )
}

export default Schemas