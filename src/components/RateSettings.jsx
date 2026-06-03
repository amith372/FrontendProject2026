import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import { db } from '../db'; // Make sure this import exists so we can update db.rates!

/**
 * Settings Component - Handles the configuration of the exchange rates URL.
 * Persists the URL to localStorage and validates it before saving.
 */
function RateSettings() {
    const [ratesUrl, setRatesUrl] = useState(() => {
        const saved = localStorage.getItem('exchangeRatesUrl');
        return typeof saved === 'string' ? saved : '';
    });
    const [status, setStatus] = useState('');
    const [isError, setIsError] = useState(false);

    // Effect to clear the status message after 5 seconds
    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status]);

    const handleSaveUrl = async () => {
        const cleanUrl = ratesUrl.trim();
        const defaultRates = {'USD': 1, 'GBP': 0.79, 'EURO': 0.93, 'ILS': 3.72};

        // If the user saved an empty field - clear the saved URL and use defaults later
        if (!cleanUrl) {
            localStorage.removeItem('exchangeRatesUrl');

            // --- Reset the live DB to default rates instantly ---
            db.rates = defaultRates;

            setIsError(false);
            setStatus('URL cleared. Default rates will be used.');
            return;
        }

        try {
            // Attempt to fetch data from the URL
            const res = await fetch(cleanUrl);
            if (!res.ok) {
                setIsError(true);
                setStatus('Invalid URL or data format. Settings not saved.');
                return;
            }

            const data = await res.json();
            const liveRates = data.rates || data['conversion_rates'] || data;

            // handle EUR (for the site we found)
            if (liveRates['EUR'] !== undefined && liveRates['EURO'] === undefined) {
                liveRates['EURO'] = liveRates['EUR'];
            }

            // --- Start of JSON validation block ---
            const requiredCurrencies = ['USD', 'GBP', 'ILS', 'EURO'];
            const finalRates = { ...defaultRates }; // Start building the new validated rates object

            if (typeof liveRates !== 'object' || liveRates === null) {
                setIsError(true);
                setStatus('Invalid URL or data format. Settings not saved.');
                return;
            }

            // make sure we have all 4 currencies within the file and map them
            for (let coin of requiredCurrencies) {
                if (coin in liveRates && typeof liveRates[coin] === 'number') {
                    finalRates[coin] = liveRates[coin]; // Map valid values
                } else {
                    setIsError(true);
                    setStatus('Invalid URL or data format. Settings not saved.');
                    return;
                }
            }
            // --- End of JSON validation block ---

            // If everything passed successfully, we save the URL!
            localStorage.setItem('exchangeRatesUrl', cleanUrl);

            // --- Update the live DB with the newly fetched custom rates instantly ---
            db.rates = finalRates;

            setIsError(false);
            setStatus('Settings saved and verified successfully!');

        } catch (error) {
            // Error message appears if URL didn't fit (Network error, CORS, etc.)
            console.error('Validation Error:', error);
            setIsError(true);
            setStatus('Invalid URL or data format. Settings not saved.');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
		{/* API config part*/}
            <Typography variant='h6' gutterBottom color='textSecondary' sx={{ mb: 2 }}>
                ⚙️ API Configuration
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
					// insert text for url
                    fullWidth
                    size='small'
                    label='Exchange Rates JSON URL'
                    variant='outlined'
                    value={ratesUrl}
                    onChange={(e) => setRatesUrl(e.target.value)}
                    placeholder='https://example.com/rates.json'
                    sx={{ flex: 1, minWidth: '200px' }}
                />
                <Button
					{/* button for saving*/}
                    variant='contained'
                    color='secondary'
                    onClick={handleSaveUrl}
                    sx={{ height: '40px' }}
                >
                    Save
                </Button>
            </Box>

            {status && (
                <Typography
				{/* handling error /success*/}
                    variant='caption'
                    color={isError ? 'error.main' : 'success.main'}
                    sx={{ mt: 1, display: 'block', fontWeight: 'bold' }}
                >
                    {status}
                </Typography>
            )}
        </Paper>
    );
}

export default RateSettings;