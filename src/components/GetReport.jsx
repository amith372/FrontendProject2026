import {useState, useMemo, useCallback} from 'react';
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
import GetRates from './GetRates.jsx';
import './GetReport.css';

/**
 * GetReport Component.
 * The main component for generating and visualizing monthly expense reports and yearly trends.
 * @returns {JSX.Element} The report controls and visualization charts.
 */
export default function GetReport() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState('USD');

    const [reportData, setReportData] = useState(null);
    const [yearlyData, setYearlyData] = useState([]);

    // state to track if rates are ready
    const [ratesReady, setRatesReady] = useState(false);


    // async helper to fetch and format data
    const fetchReportData = () => {
        const data = db.getReport(currency, year, month);

        const yearlyResults = [];
        for (let m = 1; m <= 12; m++) {
            // Pushing synchronous data directly
            yearlyResults.push(db.getReport(currency, year, m));
        }

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const formattedYearlyData = yearlyResults.map((res, i) => ({
            month: monthNames[i],
            amount: res.total.sum
        }));

        return { fetchedReport: data, fetchedYearly: formattedYearlyData };
    };

    // Button Click/event Handler then rerenders the ui with new info
    const handleGenerateReport = () => {

        // Incase rate isn't ready
        if (!ratesReady) return;

        const { fetchedReport, fetchedYearly } = fetchReportData();
        setReportData(fetchedReport);
        setYearlyData(fetchedYearly);
    };

    const handleRatesLoaded = useCallback(() => {
        setRatesReady(true);
    }, []);

    // Insert data into pie chart
    const pieData = useMemo(() => {
        if (!reportData) return [];

        const catMap = {};
        // db.rates incase rates is empty
        const rates = reportData.rates || db.rates;
        const targetCurrency = reportData.total.currency;

        // Adjusting prices based on chosen currency
        reportData.costs.forEach(item => {
            let convertedSum = item.sum;


            if (rates[item.currency] && rates[targetCurrency]) {
                const sumInUsd = item.sum / rates[item.currency];
                convertedSum = sumInUsd * rates[targetCurrency];
            }

            catMap[item.category] = (catMap[item.category] || 0) + convertedSum;
        });

        // mapping keys per category
        return Object.keys(catMap).map(k => ({
            name: k,
            value: Number(catMap[k].toFixed(2))
        }));
    }, [reportData]);

    return (
        <Box>
            {/* Render GetRates to fetch data */}
            <GetRates onRatesLoaded={handleRatesLoaded} />

            <Box className='report-controls'>
                <FormControl size='small' className='control-field'>
                    <InputLabel>Month</InputLabel>
                    {/* mapping months*/}
                    <Select variant="outlined" value={month} label='Month' onChange={e => setMonth(e.target.value)}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl size='small' className='control-field'>
                    <TextField
                        // Choosing a year
                        variant="outlined"
                        size='small'
                        label='Year'
                        type='number'
                        className='control-field'
                        value={year}
                        // Prevent wrong inputs
                        error={Number(year) < 0}
                        helperText={Number(year) < 0 ? 'Year can only be positive number' : ''}
                        onKeyDown={(e) => {
                            if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '-') {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => setYear(e.target.value === '' ? '' : Number(e.target.value))}
                        onBlur={() => {
                            if (year === '' || Number(year) <= 0) {
                                setYear(new Date().getFullYear());
                            }
                        }}

                    />
                </FormControl>

                <FormControl size='small' className='control-field'>
                    <InputLabel>Currency</InputLabel>
                    {/* Choosing currency */}
                    <Select variant="outlined" value={currency} label='Currency' onChange={e => setCurrency(e.target.value)}>
                        <MenuItem value='USD'>USD</MenuItem>
                        <MenuItem value='ILS'>ILS</MenuItem>
                        <MenuItem value='EURO'>EURO</MenuItem>
                        <MenuItem value='GBP'>GBP</MenuItem>
                    </Select>
                </FormControl>

                {/* disabled property tied to ratesReady state */}
                <Button variant='contained' color='primary' onClick={handleGenerateReport} disabled={!ratesReady || year === '' || Number(year) <= 0}>
                    Generate Report
                </Button>
            </Box>

            {reportData && (
                <Box>
                    <Table size='small' sx={{ mb: 2 }}>
                        <TableHead>
                            {/* Showing list of added items */}
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><b>Date</b></TableCell>
                                <TableCell><b>Description</b></TableCell>
                                <TableCell><b>Category</b></TableCell>
                                <TableCell><b>Amount</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* Renders the detailed costs table and*/}
                            {reportData.costs.map((item, i) => (
                                <TableRow key={i}>
                                    <TableCell>{item.date.month}/{item.date.day}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.sum} {item.currency}</TableCell>
                                </TableRow>
                            ))}

                            <TableRow>
                                <TableCell colSpan={3} align='right' sx={{ fontWeight: 'bold' }}>
                                    Total in {reportData.total.currency}:
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                    {reportData.total.sum}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <Divider sx={{ my: 4 }} />

                    {/* Charts */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%',
                        mt: 4,
                        pb: 6
                    }}>

                        {/* Left Chart (Pie) */}
                        <Box sx={{ width: '45%' }}>
                            <Typography align='center' variant='subtitle1' color='textSecondary' gutterBottom sx={{ fontWeight: 'bold' }}>
                                Category Distribution (Selected Month)
                            </Typography>
                            <PieReport data={pieData} />
                        </Box>

                        {/* Right Chart (Bar) */}
                        <Box sx={{ width: '45%', ml: 'auto' }}>
                            <Typography align='center' variant='subtitle1' color='textSecondary' gutterBottom sx={{ fontWeight: 'bold' }}>
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