// material-ui
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import UniqueVisitorCard from 'pages/dashboard/UniqueVisitorCard';
import OrderTable from 'pages/dashboard/OrdersTable';
// project import
import MainCard from 'components/MainCard';


// ==============================|| COMPONENTS - TYPOGRAPHY ||============================== //

export default function ComponentTypography() {
  return (
   
      <Grid  item container spacing={3}>
      
        <Grid item xs={12} lg={6}>
        
          <Stack spacing={3}>
            <MainCard title="Basic">
              <UniqueVisitorCard />
              
            </MainCard>
      
           
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            <MainCard title="Alignment">
              <>
               <MainCard sx={{ mt: 2 }} content={false}>
                        <OrderTable />
                      </MainCard>
             
              </>
            </MainCard>
           
       
          
           
          </Stack>
        </Grid>
      </Grid>

  );
}
