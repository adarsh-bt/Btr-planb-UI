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

    const getCurrentAgriYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // July is month 7 (1-indexed)
        const agriStartYear = month >= 7 ? year : year - 1;
        return `${agriStartYear}-${agriStartYear + 1}`;
    };

    const generateAgriYears = () => {
        const startYear = 2025;
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const currentAgriStartYear = month >= 7 ? year : year - 1;
        const endYear = Math.max(startYear, currentAgriStartYear);

        const yearsList = [];
        for (let y = startYear; y <= endYear; y++) {
            yearsList.push(`${y}-${y + 1}`);
        }
        return yearsList;
    };

    useEffect(() => {
        const generatedYears = generateAgriYears();
        setYears(generatedYears);

        const currentAgriYear = getCurrentAgriYear();
        const savedYear = localStorage.getItem('activeAgriYear');

        if (savedYear && generatedYears.includes(savedYear)) {
            setSelectedYear(savedYear);
        } else {
            const defaultYear = generatedYears.includes(currentAgriYear)
                ? currentAgriYear
                : generatedYears[generatedYears.length - 1];
            setSelectedYear(defaultYear);
            localStorage.setItem('activeAgriYear', defaultYear);
        }
    }, [open]);

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