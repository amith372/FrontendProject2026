import { useEffect } from 'react';
import { Container, Grid, Typography, Paper } from '@mui/material';
import { db } from './db';
import AddCost from './components/addCost';
import GetReport from './components/GetReport';
import './App.css';

/**
 * App Component.
 * Acts as the main entry point and layout container for the Dashboard.
 * @returns {JSX.Element} The rendered dashboard.
 */
function App() {

    useEffect(() => {
        db.openCostsDB('costsdb', 1);
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>

            <Typography variant="h3" align="center" color="primary" sx={{ mb: 5, fontWeight: 'bold' }}>
                Cost Manager Dashboard
            </Typography>

            <Grid container spacing={4} direction="column" sx={{ width: '100%', margin: 0 }}>

                <Grid xs={12} sx={{ width: '95%' }}>
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
                            Add New Expense
                        </Typography>
                        <AddCost />
                    </Paper>
                </Grid>

                <Grid xs={12} sx={{ width: '95%' }}>

                    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
                        <Typography variant="h4" gutterBottom color="primary" align="center" sx={{ mb: 4 }}>
                            Monthly Report & Yearly Trend
                        </Typography>
                        <GetReport />
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
}

export default App;