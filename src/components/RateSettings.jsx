import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';


/**
 * Settings Component - Handles the configuration of the exchange rates URL.
 * Persists the URL to localStorage for the db engine to use.
 */
function RateSettings() {
    const [ratesUrl, setRatesUrl] = useState('');
    const [status, setStatus] = useState('');

    const handleSaveUrl = () => {
        localStorage.setItem('exchangeRatesUrl', ratesUrl);

        // Clear message after 3 seconds
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom color="textSecondary" sx={{ mb: 2 }}>
                ⚙️ API Configuration
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    fullWidth
                    size="small"
                    label="Exchange Rates JSON URL"
                    variant="outlined"
                    value={ratesUrl}
                    onChange={(e) => setRatesUrl(e.target.value)}
                    placeholder="https://example.com/rates.json"
                    sx={{ flex: 1, minWidth: '200px' }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveUrl}
                    sx={{ height: '40px' }}
                >
                    Save
                </Button>
            </Box>
            {status && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    {status}
                </Typography>
            )}
        </Paper>
    );
}

export default RateSettings;