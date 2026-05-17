import { useState, useMemo, useEffect } from 'react';
import {
    Box,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Divider,
    TextField
} from '@mui/material';
import { db } from '../db';
import PieReport from './PieReport.jsx';
import BarReport from './BarReport.jsx';
import './GetReport.css';

/**
 * GetReport Component.
 * The central hub for generating and visualizing monthly expense reports and yearly trends.
 * @returns {JSX.Element} The report controls and visualization charts.
 */
export default function GetReport() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');

    const [reportData, setReportData] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);


    const handleGenerateReport = async () => {
        const data = await db.getReport(currency, year, month);
        setReportData(data);

        const promises = [];
        for (let m = 1; m <= 12; m++) {
            promises.push(db.getReport(currency, year, m));
        }

        const yearlyResults = await Promise.all(promises);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const formattedYearlyData = yearlyResults.map((res, i) => ({
            month: monthNames[i],
            amount: res.total.sum
        }));

        setYearlyData(formattedYearlyData);
    };

    useEffect(() => {
        handleGenerateReport();
    }, [currency]);

    const pieData = useMemo(() => {
        if (!reportData) return [];

        const catMap = {};
        const rates = reportData.rates;
        const targetCurrency = currency;

        reportData.costs.forEach(item => {
            let convertedSum = item.sum;


            if (rates[item.currency] && rates[targetCurrency]) {
                const sumInUsd = item.sum / rates[item.currency];
                convertedSum = sumInUsd * rates[targetCurrency];
            }

            catMap[item.category] = (catMap[item.category] || 0) + convertedSum;
        });

        return Object.keys(catMap).map(k => ({
            name: k,
            value: Number(catMap[k].toFixed(2))
        }));
    }, [reportData,currency]);

    return (
        <Box>
            <Box className="report-controls">
                <FormControl size="small" className="control-field">
                    <InputLabel>Month</InputLabel>
                    <Select value={month} label="Month" onChange={e => setMonth(e.target.value)}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size="small" className="control-field">
                    <TextField
                        size="small"
                        label="Year"
                        type="number"
                        className="control-field"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                    />
                </FormControl>

                <FormControl size="small" className="control-field">
                    <InputLabel>Currency</InputLabel>
                    <Select value={currency} label="Currency" onChange={e => setCurrency(e.target.value)}>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="ILS">ILS</MenuItem>
                        <MenuItem value="EURO">EURO</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                    Generate Report
                </Button>
            </Box>

            {reportData && (
                <Box>
                    <Table size="small" sx={{ mb: 2 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell><b>Description</b></TableCell>
                                <TableCell><b>Category</b></TableCell>
                                <TableCell><b>Amount</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reportData.costs.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell>{item.date.month}/{item.date.day}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.sum} {item.currency}</TableCell>
                                </TableRow>
                            ))}

                            <TableRow>
                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                    Total in {reportData.total.currency}:
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    {reportData.total.sum}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Divider sx={{ my: 4 }} />

                    {/* New Flexbox Layout for charts to push them to extreme ends */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%',
                        mt: 4,
                        pb: 6 // Extra padding at bottom to prevent border overlap
                    }}>

                        {/* Left Chart (Pie) */}
                        <Box sx={{ width: '45%' }}>
                            <Typography align="center" variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Category Distribution (Selected Month)
                            </Typography>
                            <PieReport data={pieData} />
                        </Box>

                        {/* Right Chart (Bar) - marginLeft: 'auto' forces it to the right end */}
                        <Box sx={{ width: '45%', ml: 'auto' }}>
                            <Typography align="center" variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Yearly Trend (Monthly Totals)
                            </Typography>
                            <BarReport data={yearlyData} />
                        </Box>

                    </Box>
                </Box>
            )}
        </Box>
    );
}