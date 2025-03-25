import React, {useEffect,useState} from 'react';
import { Grid, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import DataTable from 'react-data-table-component';
import { width } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import Breadcrumb from 'routes/Breadcrumb';

const columns = [
  { name: 'SL. NO', selector: (row, index) => index + 1 },
  { name: 'Panchayth Names', selector: (row) => row.Panchayth_name || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Wet', selector: (row) => row.Wet_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Dry', selector: (row) => row.Dry_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
  { name: 'Total', selector: (row) => row.Total_area?.toString() || <span style={{ color: '#888' }}>NA</span> },
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
        <MainCard title="">
          <DataTable
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
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default ZoneDetails;