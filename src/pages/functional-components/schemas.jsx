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
import prices from 'assets/images/logo/prices.png';
import earaslogo from 'assets/images/logo/earaslogo.png';

import { useContext } from 'react';
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// import { flattenPermissions } from 'contexts/auth-reducer/permissionHelpers';







function Schemas() {
  const theme = useTheme();
  // const { permissions, loading, error } = useContext(PermissionsContext);

  // // Flatten permissions for easy checking
  // const userPermissions = flattenPermissions(permissions);

  // // Check if user has "View BTR"
  // const canViewBTR = userPermissions.includes('View BTR');

  return (
  
        <Grid container spacing={3}>
        <Breadcrumb></Breadcrumb>
          <Grid item xs={12}>
          <Typography variant='h3' sx={{marginBottom:2}}>Schemes</Typography>
            <MainCard title="">
             
              <Grid container spacing={4}>
                {/* {canViewBTR && ( */}
{/* <Grid item xs={12} sm={4} md={3} lg={3}>
  <Card
    component={Link}
    to="/schemes/earas"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '10rem',
      cursor: 'pointer',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        transition: 'left 0.6s ease',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      },
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 25px 40px rgba(0, 0, 0, 0.2)',
        '&::before': {
          left: '100%',
        },
      },
    }}
  >
    <CardMedia
      component="img"
      sx={{
        width: '6rem',
        height: '6rem',
        borderRadius: '1.2rem',
        marginRight: '1.5rem',
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '0.75rem',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05) rotate(5deg)',
        },
      }}
      image={earaslogo}
      alt="Dashboard Icon"
    />

    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 0 auto', textAlign: 'center', p: 0 }}>
        <Typography
          component="div"
          sx={{
            fontWeight: 800,
            color: '#fff',
            fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem' },
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          EARAS
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.7rem',
          }}
        >
          Dashboard
        </Typography>
      </CardContent>
    </Box>
  </Card>
</Grid> */}

<Grid item xs={12} sm={4} md={3} lg={3}>
  <Card
   component={Link}
    to="/schemes/earas"
    sx={{
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1), 0 3px 10px rgba(0, 0, 0, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '10rem',
      cursor: 'pointer',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
        transition: 'left 0.6s ease',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      },
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 25px 40px rgba(0, 0, 0, 0.2)',
        '&::before': {
          left: '100%',
        },
      },
    }}
  >
    {/* Lock overlay for disabled feel */}
   
    <CardMedia
      component="img"
      sx={{
        width: '6rem',
        height: '6rem',
        borderRadius: '1.2rem',
        marginRight: '1.5rem',
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '0.75rem',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05) rotate(5deg)',
        },
      }}
      image={earaslogo}
      alt="Dashboard Icon"
    />

    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 0 auto', textAlign: 'center', p: 0 }}>
        <Typography
          component="div"
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#f3f4f6',
            mb: 0.5,
          }}
        >
          EARAS
        </Typography>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            color: '#d1d5db',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          DASHBOARD
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
      padding: '1.5rem',
      borderRadius: '1.5rem',
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      opacity: 0.7,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
      cursor: 'not-allowed',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '10rem',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
      },
      '&:hover': {
        transform: 'translateY(-4px)',
        opacity: 0.85,
      },
    }}
  >
    {/* Lock overlay for disabled feel */}
    <Box
      sx={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 2,
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography sx={{ color: '#fff', fontSize: '0.8rem' }}>🔒</Typography>
    </Box>

    <CardMedia
      component="img"
      sx={{
        width: '5rem',
        height: '5rem',
        borderRadius: '1rem',
        marginRight: '1.5rem',
        filter: 'grayscale(0.3)',
        opacity: 0.8,
      }}
      image={prices}
      alt="Prices Icon"
    />

    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 0 auto', textAlign: 'center', p: 0 }}>
        <Typography
          component="div"
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#f3f4f6',
            mb: 0.5,
          }}
        >
          Prices
        </Typography>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            color: '#d1d5db',
            fontStyle: 'normal',
            fontWeight: 400,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Coming Soon
        </Typography>
      </CardContent>
    </Box>
  </Card>
</Grid>

    {/* <Grid item xs={12} sm={4} md={3} lg={3}>              
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
    </Grid> */}
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