import { useMemo,useState,useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';
// project import
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

import authservice from 'pages/authentication/services/authservice';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
     const designation = authservice.getdesignation();
const [isOnline, setIsOnline] = useState(navigator.onLine);
  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const iconBackColor = 'grey.100';
  const iconBackColorOpen = 'grey.200';
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // common header
  const mainHeader = (
    <Toolbar sx={{  background: "linear-gradient(to bottom,rgb(158, 201, 244) 0%,rgb(107, 144, 230) 50%,rgb(44, 134, 244) 100%)"}}>
      <IconButton
        disableRipple
        aria-label="open drawer"
        onClick={() => handlerDrawerOpen(!drawerOpen)}
        edge="start"
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: drawerOpen ? iconBackColorOpen : iconBackColor, ml: { xs: 0, lg: -2 } }}
      >
        {!drawerOpen ? <MenuIcon /> : <MenuOpenIcon />}
      </IconButton>
       <Typography variant="p" color="white" sx={{width:'50%', ml:4,border:'1px solid white',borderRadius:2,padding:1, alignItems:'center', justifyContent:'center', display:'flex',background: 'rgba(0, 0, 0, 0.2)'}}>
        {designation}
      </Typography>
           {!isOnline ? (
          <Chip
            icon={<WifiOffIcon sx={{ color: 'white !important', fontSize: 18 }} />}
            label="Offline"
            size="small"
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              marginLeft: 2,
              height: 24,
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.75rem',
                fontWeight: 600
              },
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 }
              }
            }}
          />
        ) : (
          <Chip
            icon={<WifiIcon sx={{ color: 'white !important', fontSize: 18 }} />}
            label="Online"
            size="small"
            sx={{
              backgroundColor: 'success.main',
              color: 'white',
              marginLeft: 2,
              height: 24,
              '& .MuiChip-label': {
                px: 1,
                fontSize: '0.75rem',
                fontWeight: 600
              }
            }}
          />
        )}
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`
      // boxShadow: theme.customShadows.z1
    }
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={!!drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
}
