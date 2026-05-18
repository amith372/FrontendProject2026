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
  TextField,
} from '@mui/material';
import { db } from '../db';
import PieReport from './PieReport.jsx';
import BarReport from './BarReport.jsx';
import './GetReport.css';

/**
 * GetReport Component - Central hub for generating and visualizing monthly reports.
 * Displays expense data and provides charts for analysis.
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
   */
  const handleGenerateReport = async () => {
    const data = await db.getReport(currency, year, month);
    setReportData(data);

    const promises = [];
    for (let monthIndex = 1; monthIndex <= 12; monthIndex += 1) {
      promises.push(db.getReport(currency, year, monthIndex));
    }

    const yearlyResults = await Promise.all(promises);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedYearlyData = yearlyResults.map((result, index) => ({
      month: monthNames[index],
      amount: result.total.sum,
    }));

    setYearlyData(formattedYearlyData);
  };

  useEffect(() => {
    handleGenerateReport();
  }, [currency]);

  /**
   * Aggregates costs by category with currency conversion.
   */
  const pieData = useMemo(() => {
    if (!reportData) return [];

    const categoryMap = {};
    const { rates } = reportData;
    const targetCurrency = currency;

    reportData.costs.forEach((item) => {
      let convertedSum = item.sum;

      if (rates[item.currency] && rates[targetCurrency]) {
        const sumInUsd = item.sum / rates[item.currency];
        convertedSum = sumInUsd * rates[targetCurrency];
      }

      categoryMap[item.category] = (categoryMap[item.category] || 0) + convertedSum;
    });

    return Object.keys(categoryMap).map((categoryKey) => ({
      name: categoryKey,
      value: Number(categoryMap[categoryKey].toFixed(2)),
    }));
  }, [reportData, currency]);

  return (
    <Box>
      <Box className="report-controls">
        <FormControl size="small" className="control-field">
          <InputLabel>Month</InputLabel>
          <Select value={month} label="Month" onChange={(event) => setMonth(event.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthValue) => (
              <MenuItem key={monthValue} value={monthValue}>{monthValue}</MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <FormControl size="small" className="control-field">
          <InputLabel>Currency</InputLabel>
          <Select value={currency} label="Currency" onChange={(event) => setCurrency(event.target.value)}>
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
              {reportData.costs.map((item, index) => (
                <TableRow key={index}>
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

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            width: '100%',
            mt: 4,
            pb: 6,
          }}
          >
            <Box sx={{ width: '45%' }}>
              <Typography align="center" variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                Category Distribution (Selected Month)
              </Typography>
              <PieReport data={pieData} />
            </Box>

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