import { useEffect } from 'react';
import { Container, Grid, Typography, Paper } from '@mui/material';
import { db } from './db';
import AddCost from './components/AddCost.jsx';
import GetReport from './components/GetReport.jsx';
import './App.css';
import RateSettings from './components/RateSettings';

/**
 * App Component - Main entry point and layout container for the Cost Manager Dashboard.
 * Initializes the database on mount and provides the overall application structure.
 * @returns {JSX.Element} The rendered dashboard with all subcomponents.
 */
function App() {
  // Initialize the costs database on component mount.
  useEffect(() => {
    db.openCostsDB('costsdb', 1);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Main dashboard title */}
      <Typography variant="h3" align="center" color="primary" sx={{ mb: 5, fontWeight: 'bold' }}>
        Cost Manager Dashboard
      </Typography>

      {/* Main grid layout for dashboard sections */}
      <Grid container spacing={4} direction="column" sx={{ width: '100%', margin: 0 }}>

        {/* Add New Expense Section */}
        <Grid xs={12} sx={{ width: '95%' }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
              Add New Expense
            </Typography>
            <AddCost />
          </Paper>
        </Grid>

        {/* Rate Settings Section */}
        <Grid item xs={12}>
          <RateSettings />
        </Grid>

        {/* Monthly Report & Yearly Trend Section */}
        <Grid xs={12} sx={{ width: '95%' }}>
          <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Typography variant="h4" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>
              📆Monthly Report & Yearly Trend
            </Typography>
            <GetReport />
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
}

export default App;