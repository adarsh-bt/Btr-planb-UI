import React, {useEffect,useState} from 'react';
import { Grid, Typography,Box,Paper,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';
import './earascss/zone_deta.css'


const columns = [
  { name: 'SL. NO', selector: (row, index) => index + 1 },
  { name: 'Panchayth Names', selector: (row) => row.Panchayth_name || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Wet', selector: (row) => row.Wet_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Dry', selector: (row) => row.Dry_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Total', selector: (row) => row.Total_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
];


const rows = [
  {
    sl: 1,
    name: 'John Doe',
    village: 'Village A',
    block: 'Block 1',
    wetArea: 30,
    dryArea: 50,
    totalArea: 80,
    wetPlots: 10,
    dryPlots: 20,
    totalPlots: 30,
  },
  {
    sl: 2,
    name: 'Jane Smith',
    village: 'Village B',
    block: 'Block 2',
    wetArea: 40,
    dryArea: 60,
    totalArea: 100,
    wetPlots: 15,
    dryPlots: 25,
    totalPlots: 40,
  },
  // Add more rows as needed
];

const sampleData = [
  {
    villageName: 'Village A',
    bcode: 'Wet Code 1',
    resvno: 'Dry Code 1',
    resbdno: 'Total 1',
  },
  {
    villageName: 'Village B',
    bcode: 'Wet Code 2',
    resvno: 'Dry Code 2',
    resbdno: 'Total 2',
  },
  {
    villageName: 'Village C',
    bcode: 'Wet Code 3',
    resvno: 'Dry Code 3',
    resbdno: 'Total 3',
  },
];

function ZoneDetails() {

    const theme = useTheme();
    const [data, setData] = useState([]); // State to store API data
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetch('http://localhost:8082/btr-service/btr-api/keyplots/9d511610-6941-4590-b9e8-f5b7c0eb8888');
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            setData(result.payload.data); // Set the fetched data to state
          } catch (error) {
            setError(error.message); // Set error message if something goes wrong
          } finally {
            setLoading(false); // Set loading to false after the request completes
          }
        };
    
        fetchData();
      }, []);
    
      if (loading) {
        return <Typography>Loading...</Typography>; // Display loading message
      }
    
      if (error) {
        return <Typography color="error">Error: {error}</Typography>; // Display error message
      }

  return (
    <Grid container spacing={3}>
    <Breadcrumb></Breadcrumb>
      <Grid item xs={12}>
        <Typography variant="h3" sx={{ marginBottom: 2 }}>
          Zone Details
        </Typography>
        <MainCard>
        <Box className="bar-container">
      <Paper className="bar-paper">
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3} className="bar-grid-item">
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
              District:
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
              Thiruvananthapuram
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} className="bar-grid-item">
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
              Taluk:
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
              Nem
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} className="bar-grid-item">
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
              LocalBody:
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
              Panchayat
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold' }}>
              Zone:
            </Typography>
            <Typography variant="body1" align="center" sx={{ color: '#00796b' }}>
              Killie
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
        </MainCard>

        <MainCard title="">

        <TableContainer component={Paper}>
  <Table sx={{ border: 1, borderColor: 'grey.300' }}>
    <TableHead>
      {/* Main Header Row */}
      <TableRow>
        <TableCell rowSpan={2} sx={{ border: 1,borderColor: 'grey.300' }}>SL</TableCell>
        <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>Name</TableCell>
        <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>Village</TableCell>
        <TableCell rowSpan={2} sx={{ border: 1, borderColor: 'grey.300' }}>Block</TableCell>
        <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>Area</TableCell>
        <TableCell colSpan={3} align="center" sx={{ border: 1, borderColor: 'grey.300' }}>Plots</TableCell>
      </TableRow>

      {/* Sub-header Row */}
      <TableRow>
        {/* Area Sub-columns */}
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet</TableCell>
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry</TableCell>
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total</TableCell>
        
        {/* Plots Sub-columns */}
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Wet</TableCell>
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Dry</TableCell>
        <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>Total</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
          {rows.map((row) => (
            <TableRow key={row.sl}>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.sl}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.name}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.village}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.block}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.wetArea}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.dryArea}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.totalArea}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.wetPlots}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.dryPlots}</TableCell>
              <TableCell sx={{ border: 1, borderColor: 'grey.300' }}>{row.totalPlots}</TableCell>
            </TableRow>
          ))}
        </TableBody>
  </Table>
</TableContainer>
          {/* <DataTable
            columns={columns}
            data={data}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#04255e',
                  color: '#fff',
                  fontWeight: 'bold',
                  width:'70%',
                  paddingBottom:'2rem',
                  paddingTop:'2rem'
                },
              },
              cells: {
                style: {
                  borderBottom: '1px solid #eee',
                },
              },
            }}
          /> */}
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ZoneDetails;