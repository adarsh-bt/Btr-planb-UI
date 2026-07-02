
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';


export default function AgriYearOptions() {
const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {

    const generatedYears = generateAgriYears();

    setYears(generatedYears);

    const savedYear =
      localStorage.getItem('activeAgriYear');

    if (
      savedYear &&
      generatedYears.includes(savedYear)
    ) {

      setSelectedYear(savedYear);

    } else {

      const latestYear =
        generatedYears[generatedYears.length - 1];

      setSelectedYear(latestYear);

      localStorage.setItem(
        'activeAgriYear',
        latestYear
      );
    }

  }, []);

const generateAgriYears = () => {
  const APP_START_YEAR = 2025;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  let firstYear;

  if (month >= 6) {
    // From June onwards, show previous + current
    firstYear = year - 1;
  } else {
    // Before June, still show previous + current
    firstYear = year - 2;
  }

  // Don't go before app start year
  if (firstYear < APP_START_YEAR) {
    firstYear = APP_START_YEAR;
  }

  return [
    `${firstYear}-${firstYear + 1}`,
    `${firstYear + 1}-${firstYear + 2}`,
  ];
};

  const handleChange = (event) => {

    const value = event.target.value;

    setSelectedYear(value);

    localStorage.setItem(
      'activeAgriYear',
      value
    );

    // optional reload/navigation

    navigate('/schemes/earas');
  };

  return (

    <Box sx={{ mr: 2 }}>

      <FormControl size="small" sx={{ 
    minWidth: { xs: '100%', sm: 100 }, // Full width on mobile
    width: { xs: '100%', sm: 'auto' }
  }}>
    <Select
      value={selectedYear}
      onChange={handleChange}
      IconComponent={() => null}
      sx={{
        color: 'white',
        border: 'none',
        '.MuiOutlinedInput-notchedOutline': { border: 'none' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
        backgroundColor: '#04255e94',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontWeight: 500,
        borderRadius: 2,
        padding: { xs: '4px 8px', sm: '8px',lg:0 },
        '& .MuiSelect-select': {
          py: { xs: 0.5, sm: 1 },
        }
      }}
      renderValue={(selected) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthOutlinedIcon sx={{ fontSize: '1rem' }} />
          <Typography 
            component="span" 
            sx={{ 
              display: { xs: 'none', sm: 'inline' },
              fontSize: '0.875rem'
            }}
          >
            {selected}
          </Typography>
        </Box>
      )}
    >
      {years.map((year) => (
        <MenuItem key={year} value={year} sx={{ color: 'black' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthOutlinedIcon sx={{ color: 'action.active', fontSize: '1rem' }} />
            {year}
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>

    </Box>
  );
}

