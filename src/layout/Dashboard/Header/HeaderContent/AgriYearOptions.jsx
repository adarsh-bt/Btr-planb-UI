
import React, { useEffect, useState } from 'react';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';


export default function AgriYearOptions() {

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

    const startYear = 2025;

    // ==================================
    // TEMP TEST MODE
    // ==================================

    const TEST_MODE = true;

    const MOCK_CURRENT_YEAR = 2026;

    // ==================================

    let currentYear;

    if (TEST_MODE) {

      currentYear = MOCK_CURRENT_YEAR;

    } else {

      const today = new Date();

      currentYear = today.getFullYear();

      const currentMonth =
        today.getMonth() + 1;

      // Before July → previous agri year

      if (currentMonth < 7) {

        currentYear =
          currentYear - 1;
      }
    }

    const years = [];

    for (
      let year = startYear;
      year <= currentYear;
      year++
    ) {

      years.push(
        `${year}-${year + 1}`
      );
    }

    return years;
  };

  const handleChange = (event) => {

    const value = event.target.value;

    setSelectedYear(value);

    localStorage.setItem(
      'activeAgriYear',
      value
    );

    // optional reload/navigation

    window.location.reload();
  };

  return (

    <Box sx={{ mt: 0.5 }}>

      <FormControl
        size="small"
        fullWidth
        sx={{ minWidth: 100 }}
      >

        <Select
          value={selectedYear}
          onChange={handleChange}
          IconComponent={() => null}
          sx={{
            color: 'white',
            border: 'none',

            '.MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },

            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },

            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none'
            },

            backgroundColor: 'transparent',

            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontWeight: 500,
          }}

          renderValue={(selected) => (

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >

              <CalendarMonthOutlinedIcon
                sx={{ fontSize: '1rem' }}
              />

              {selected}

            </Box>
          )}
        >

          {years.map((year) => (

            <MenuItem
              key={year}
              value={year}
              sx={{ color: 'black' }}
            >

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >

                <CalendarMonthOutlinedIcon
                  sx={{
                    color: 'action.active',
                    fontSize: '1rem'
                  }}
                />

                {year}

              </Box>

            </MenuItem>

          ))}

        </Select>

      </FormControl>

    </Box>
  );
}

