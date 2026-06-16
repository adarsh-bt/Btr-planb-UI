import React, { useState, useContext, createContext, useEffect } from 'react';
import { Divider } from '@mui/material';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


const AgriYearSelectDialog = ({ open, onConfirm }) => {
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
const [agriModalOpen, setAgriModalOpen] = useState(false);
    useEffect(() => {
        const generatedYears = generateAgriYears();
        setYears(generatedYears);

        const savedYear = localStorage.getItem('activeAgriYear');
        if (savedYear && generatedYears.includes(savedYear)) {
            setSelectedYear(savedYear);
        } else {
            const latestYear = generatedYears[generatedYears.length - 1];
            setSelectedYear(latestYear);
            localStorage.setItem('activeAgriYear', latestYear);
        }
    }, [open]);
    

    const generateAgriYears = () => {
        const startYear = 2025;
        const TEST_MODE = true; // Kept your original setup
        const MOCK_CURRENT_YEAR = 2026;

        let currentYear = TEST_MODE ? MOCK_CURRENT_YEAR : new Date().getFullYear();
        if (!TEST_MODE && (new Date().getMonth() + 1) < 7) {
            currentYear = currentYear - 1;
        }

        const yearsList = [];
        for (let year = startYear; year <= currentYear; year++) {
            yearsList.push(`${year}-${year + 1}`);
        }
        return yearsList;
    };

    const handleChange = (event) => {
        const value = event.target.value;
        setSelectedYear(value);
        localStorage.setItem('activeAgriYear', value);
    };

    const handleProceed = () => {
        onConfirm(selectedYear);
    };

    return (
        <Dialog 
            open={open} 
            maxWidth="xs" 
            fullWidth
            sx={{ '& .MuiDialog-paper': { borderRadius: '15px', p: 1 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <CalendarMonthOutlinedIcon color="primary" />
                Select Agricultural Year
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please select the active Agricultural Year to seed your dashboard session data.
                </Typography>
                <FormControl fullWidth size="small">
                    <Select
                        value={selectedYear}
                        onChange={handleChange}
                        sx={{
                            borderRadius: 2,
                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                        }}
                    >
                        {years.map((year) => (
                            <MenuItem key={year} value={year}>
                                <CalendarMonthOutlinedIcon sx={{ color: 'action.active', fontSize: '1rem', mr: 1 }} />
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={handleProceed} 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    sx={{ borderRadius: '20px', p: 1 }}
                >
                    Proceed to Dashboard
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default AgriYearSelectDialog;