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
 * GetReport Component - Central hub for generating and visualizing monthly reports.
 * Displays expense data in a table and provides interactive charts for analysis.
 * Supports filtering by month, year, and currency with automatic yearly trend generation.
 * @returns {JSX.Element} The report controls and visualization charts.
 */
export default function GetReport() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');

    const [reportData, setReportData] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);

    /**
     * Generates monthly report and yearly trend data.
     * Fetches reports for all 12 months to create the yearly overview.
     */
    const handleGenerateReport = async () => {
        // Fetch the monthly report for the selected month and year.
        const data = await db.getReport(currency, year, month);
        setReportData(data);

        // Create promises for all 12 months of the selected year for yearly trend.
        const promises = [];
        for (let monthIndex = 1; monthIndex <= 12; monthIndex += 1) {
            promises.push(db.getReport(currency, year, monthIndex));
        }

        // Wait for all promises to resolve.
        const yearlyResults = await Promise.all(promises);

        // Format the yearly results as an array of { month, amount } objects.
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedYearlyData = yearlyResults.map((result, index) => ({
            month: monthNames[index],
            amount: result.total.sum,
        }));

        // Update the yearly data state with the formatted results.
        setYearlyData(formattedYearlyData);
    };

    // Automatically regenerate report when currency changes.
    useEffect(() => {
        handleGenerateReport();
    }, [currency]);

    /**
     * Memoized pie chart data computed from report costs.
     * Aggregates costs by category and converts to target currency.
     */
    const pieData = useMemo(() => {
        // Return empty array if report data is not yet available.
        if (!reportData) return [];

        // Initialize a map to accumulate category totals.
        const categoryMap = {};
        const { rates } = reportData;
        const targetCurrency = currency;

        // Iterate through costs and accumulate by category with currency conversion.
        reportData.costs.forEach((item) => {
            let convertedSum = item.sum;

            // Convert sum to target currency if rates are available.
            if (rates[item.currency] && rates[targetCurrency]) {
                const sumInUsd = item.sum / rates[item.currency];
                convertedSum = sumInUsd * rates[targetCurrency];
            }

            // Add to category total, initializing to 0 if category doesn't exist.
            categoryMap[item.category] = (categoryMap[item.category] || 0) + convertedSum;
        });

        // Format category map as array of { name, value } objects for the pie chart.
        return Object.keys(categoryMap).map((categoryKey) => ({
            name: categoryKey,
            value: Number(categoryMap[categoryKey].toFixed(2)),
        }));
    }, [reportData, currency]);

    return (
        <Box>
            {/* Report Control Panel */}
            <Box className="report-controls">
                {/* Month Selector Dropdown */}
                <FormControl size="small" className="control-field">
                    <InputLabel>Month</InputLabel>
                    <Select value={month} label="Month" onChange={(event) => setMonth(event.target.value)}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthValue) => (
                            <MenuItem key={monthValue} value={monthValue}>{monthValue}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Year Input Field */}
                <FormControl size="small" className="control-field">
                    <TextField
                        size="small"
                        label="Year"
                        type="number"
                        className="control-field"
                        value={year}
                        onChange={(event) => setYear(Number(event.target.value))}
                    />
                </FormControl>

                {/* Currency Selector Dropdown */}
                <FormControl size="small" className="control-field">
                    <InputLabel>Currency</InputLabel>
                    <Select value={currency} label="Currency" onChange={(event) => setCurrency(event.target.value)}>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="ILS">ILS</MenuItem>
                        <MenuItem value="EURO">EURO</MenuItem>
                        <MenuItem value="GBP">GBP</MenuItem>
                    </Select>
                </FormControl>

                {/* Generate Report Button */}
                <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                    Generate Report
                </Button>
            </Box>

            {/* Expenses Data Table and Charts (displayed when report is available) */}
            {reportData && (
                <Box>
                    {/* Expenses Data Table */}
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
                            {/* Render each cost item as a table row */}
                            {reportData.costs.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.date.month}/{item.date.day}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.sum} {item.currency}</TableCell>
                                </TableRow>
                            ))}

                            {/* Total row displaying sum in selected currency */}
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

                    {/* Divider separating table from charts */}
                    <Divider sx={{ my: 4 }} />

                    {/* Charts Container with Pie and Bar Charts */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%',
                        mt: 4,
                        pb: 6,
                    }}>
                        {/* Left Chart: Pie Chart for Category Distribution */}
                        <Box sx={{ width: '45%' }}>
                            <Typography align="center" variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Category Distribution (Selected Month)
                            </Typography>
                            <PieReport data={pieData} />
                        </Box>

                        {/* Right Chart: Bar Chart for Yearly Trend */}
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