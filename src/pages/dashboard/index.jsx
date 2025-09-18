import React, { useContext } from 'react';
// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// import { hasAnyPermission, hasAllPermissions, hasPermission } from 'contexts/auth-reducer/permissionHelpers';
// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from './MonthlyBarChart';
import ReportAreaChart from './ReportAreaChart';
import UniqueVisitorCard from './UniqueVisitorCard';
import SaleReportCard from './SaleReportCard';
import OrdersTable from './OrdersTable';

// // assets
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Link } from 'react-router-dom';
// import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';

import tabmenus from './tabmenus/tabmenus';
import auth from 'contexts/auth-reducer/auth';
import Breadcrumb from 'routes/Breadcrumb';
import authservice from 'pages/authentication/services/authservice';
import tourdiary from 'assets/images/logo/tourdiary.png';
import schemes from 'assets/images/logo/schemes.png';
import approvals from 'assets/images/logo/approvals.png';
import usermanage from 'assets/images/logo/usermanage.png';

// import { PermissionsContext } from 'contexts/auth-reducer/PermissionsContext';
// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

const { children } = tabmenus.items2[0];
// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const isauth = auth.isAdmin();

  // const { permissions, loading, error } = useContext(PermissionsContext);
  // console.log("User Permissions:", permissions);

  return (
    <Grid
      container
      rowSpacing={4.5}
      justifyContent="center" // Ensures all cards are horizontally centered
      alignItems="center" // Ensures proper vertical alignment
    >
      {/* Row 1 */}
      <Grid item xs={12}>
        <Typography variant="h4" align="center" sx={{ mb: 3 }}>
          Dashboard
          {/* {isauth ? (
        <h3>Welcome to your Dashboard</h3>
      ) : (
        <h3>Please log in to access the Dashboard</h3>
      )} */}
        </Typography>
      </Grid>

      {/* Card Items */}
      {/* {children.map((item) => (
      <Grid item xs={12} sm={6} md={4} lg={4} >
      <Card
                      sx={{width:'50rem', maxWidth: 250,padding: '.5rem',margin: '0 auto',borderRadius: '2rem',transition: 'background 0.3s ease-in-out', // Smooth transition
                            '&:hover': {
                            backgroundImage: 'linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)',},
    }}
    align="center"
  >
         <CardActionArea component={Link} to={item.url}>
            <CardMedia
              style={{ borderRadius: '.5rem' }}
              component="img"
              height="140"
              image={item.image}
              alt={item.alt}
            />
            <Typography variant="h5" component="div" align="center" style={{marginTop:'4px'}}>
              {item.title}
            </Typography>
          </CardActionArea>
        </Card>
      </Grid>

    ))} */}

      <Grid container spacing={4} sx={{ marginBottom: '3rem' }}>
        <Grid item xs={12} sm={4} md={4} lg={4}>
          <Card
            component={Link}
            to="/schemes"
            sx={{
              textDecoration: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(255, 110, 97, 0.57), rgb(255, 128, 109))',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden', // Ensure circles don't overflow the card
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                top: '-50px',
                right: '-50px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                bottom: '-40px',
                left: '-40px'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>
              -
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              Schemes
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#f3f3f3',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
                textAlign: 'center',
                marginBottom: '1.2rem'
              }}
            >
              Main menus
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%'
                }}
                image={schemes} // <-- Use the imported image here
                alt="Schemes Logo"
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={4} lg={4}>
          <Card
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(99, 155, 255, 0.57), rgb(51, 125, 253))',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                top: '-50px',
                right: '-50px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                bottom: '-40px',
                left: '-40px'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>
              -
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              Tour diary
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#f3f3f3',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
                textAlign: 'center',
                marginBottom: '1.2rem'
              }}
            >
              Tracking
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%'
                }}
                image={tourdiary} // <-- Use the imported image here
                alt="Cluster Logo"
              />
            </Box>
          </Card>
        </Grid>
      
{["Super Admin", "District Level Approver", "IT Admin",].includes(authservice.getrole()) && (
        <Grid item xs={12} sm={4} md={4} lg={4}>
          <Card
            component={Link}
            to="/rolelist"
            sx={{
              textDecoration: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(79, 208, 170, 0.57), rgb(37, 187, 142))',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden', // Ensure circles don't overflow the card
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                top: '-50px',
                right: '-50px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                bottom: '-40px',
                left: '-40px'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>
              -
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              Role List
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#f3f3f3',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
                textAlign: 'center',
                marginBottom: '1.2rem'
              }}
            >
              List of Roles
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%'
                }}
                image="https://www.creativefabrica.com/wp-content/uploads/2021/06/30/Search-Engine-Icon-Graphics-14065623-1-1-580x386.jpg"
                alt="Chart Icon"
              />
            </Box>
          </Card>
        </Grid>
)}

{["Super Admin", "District Level Approver", "IT Admin","Taluk Level Approver"].includes(authservice.getrole()) && (
        <Grid item xs={12} sm={4} md={4} lg={4}>
          <Card
            component={Link}
            to="/approvals"
            sx={{
              textDecoration: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(255, 184, 97, 0.57), rgb(255, 189, 109))',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden', // Ensure circles don't overflow the card
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                top: '-50px',
                right: '-50px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                bottom: '-40px',
                left: '-40px'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>
              -
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              Approvals
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#f3f3f3',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
                textAlign: 'center',
                marginBottom: '1.2rem'
              }}
            >
              Main menus
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%'
                }}
                image={approvals} // <-- Use the imported image here
                alt="Approvals Logo"
              />
            </Box>
          </Card>
        </Grid>
)}

{["Super Admin", "District Level Approver", "IT Admin"].includes(authservice.getrole()) && (
        <Grid item xs={12} sm={4} md={4} lg={4}>
          <Card
            component={Link}
            to="/User_Manage"
            sx={{
              textDecoration: 'none',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, rgba(173, 97, 255, 0.57), rgb(175, 109, 255))',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden', // Ensure circles don't overflow the card
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                top: '-50px',
                right: '-50px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                bottom: '-40px',
                left: '-40px'
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>
              -
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
              User Manage
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#f3f3f3',
                fontWeight: 'lighter',
                marginTop: '0.5rem',
                textAlign: 'center',
                marginBottom: '1.2rem'
              }}
            >
              Main menus
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%'
                }}
                image={usermanage} // <-- Use the imported image here
                alt="User Manage Logo"
              />
            </Box>
          </Card>
        </Grid>

              )}
      </Grid>

      <Grid item md={8} sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} />

      {/* row 2 */}
      <Grid item xs={12} md={7} lg={8}>
        <UniqueVisitorCard />
      </Grid>
      {/* <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Income Overview</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack spacing={2}>
              <Typography variant="h6" color="text.secondary">
                This Week Statistics
              </Typography>
              <Typography variant="h3">$7,650</Typography>
            </Stack>
          </Box>
          <MonthlyBarChart />
        </MainCard>
      </Grid> */}

      {/* row 3 */}
      {/* <Grid item xs={12} md={7} lg={8}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <OrdersTable />
        </MainCard>
      </Grid> */}

      {/* <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Analytics Report</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
            <ListItemButton divider>
              <ListItemText primary="Company Finance Growth" />
              <Typography variant="h5">+45.14%</Typography>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemText primary="Company Expenses Ratio" />
              <Typography variant="h5">0.58%</Typography>
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Business Risk Cases" />
              <Typography variant="h5">Low</Typography>
            </ListItemButton>
          </List>
          <ReportAreaChart />
        </MainCard>
      </Grid> */}

      {/* row 4 */}
      {/* <Grid item xs={12} md={7} lg={8}>
        <SaleReportCard />
      </Grid> */}

      {/* <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5">Transaction History</Typography>
          </Grid>
          <Grid item />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List
            component="nav"
            sx={{
              px: 0,
              py: 0,
              '& .MuiListItemButton-root': {
                py: 1.5,
                '& .MuiAvatar-root': avatarSX,
                '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
              }
            }}
          >
            <ListItemButton divider>
              <ListItemAvatar>
                <Avatar sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
                  <GiftOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #002434</Typography>} secondary="Today, 2:00 AM" />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                    + $1,430
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                    78%
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
            <ListItemButton divider>
              <ListItemAvatar>
                <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                  <MessageOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #984947</Typography>} secondary="5 August, 1:45 PM" />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                    + $302
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                    8%
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                  <SettingOutlined />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={<Typography variant="subtitle1">Order #988784</Typography>} secondary="7 hours ago" />
              <ListItemSecondaryAction>
                <Stack alignItems="flex-end">
                  <Typography variant="subtitle1" noWrap>
                    + $682
                  </Typography>
                  <Typography variant="h6" color="secondary" noWrap>
                    16%
                  </Typography>
                </Stack>
              </ListItemSecondaryAction>
            </ListItemButton>
          </List>
        </MainCard>
        <MainCard sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Stack>
                  <Typography variant="h5" noWrap>
                    Help & Support Chat
                  </Typography>
                  <Typography variant="caption" color="secondary" noWrap>
                    Typical replay within 5 min
                  </Typography>
                </Stack>
              </Grid>
              <Grid item>
                <AvatarGroup sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                  <Avatar alt="Remy Sharp" src="" />
                  <Avatar alt="Travis Howard" src="" />
                  <Avatar alt="Cindy Baker" src="" />
                  <Avatar alt="Agnes Walker" src="" />
                </AvatarGroup>
              </Grid>
            </Grid>
            <Button size="small" variant="contained" sx={{ textTransform: 'capitalize' }}>
              Need Help?
            </Button>
          </Stack>
        </MainCard>
      </Grid> */}
    </Grid>
  );
}
