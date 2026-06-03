import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { db } from '../db';

/**
 * GetRate Component.
 * Asynchronously fetches live exchange rates and injects them into the synchronous local DB.
 * @param {Function} onRatesLoaded - Callback triggered when rates are successfully loaded.
 */
export default function GetRates({ onRatesLoaded }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Timer to clear the error message after 1 second
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const fetchLiveRates = async () => {
            try {
                const defaultRates = {'USD': 1, 'GBP': 0.79, 'EURO': 0.93, 'ILS': 3.72};
                // Check if user has a custom URL, otherwise use default
                const savedUrl = localStorage.getItem('exchangeRatesUrl');
                const defaultUrl = 'https://simpleapi-04mo.onrender.com/rates.json';
                const apiUrl = savedUrl || defaultUrl;
                const res = await fetch(apiUrl);
                if (!res.ok) {
                    setError('HTTP error ' + res.status);
                    // Force reset to hardcoded defaults on failure so it drops old custom rates instantly
                    db.rates = defaultRates;
                    if (onRatesLoaded) onRatesLoaded();
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                const liveRates = data.rates || data['conversion_rates'] || data;

                if (liveRates['EUR']) liveRates['EURO'] = liveRates['EUR'];

                // --- Start of currency validation block ---

                const requiredCurrencies = ['USD', 'GBP', 'EURO', 'ILS'];

                // Start with defaults, and override only with valid data
                const finalRates = { ...defaultRates };
                let isFormatValid = true;

                // Ensure the received data is an object and not an array or string
                if (typeof liveRates === 'object' && liveRates !== null) {
                    for (let coin of requiredCurrencies) {
                        // If the currency exists and is a valid number, update finalRates
                        if (coin in liveRates && typeof liveRates[coin] === 'number') {
                            finalRates[coin] = liveRates[coin];
                        } else {
                            // If any required currency is missing or has an invalid format, mark as invalid
                            isFormatValid = false;
                        }
                    }
                } else {
                    isFormatValid = false;
                }

                // If the format is invalid or missing data, trigger the temporary error message
                if (!isFormatValid) {
                    setError('Missing/Invalid data from URL. Using defaults.');
                }
                // --- End of currency validation block ---

                // Update the database with the final, safe result
                db.rates = finalRates;

                if (onRatesLoaded) onRatesLoaded();
            } catch (err) {
				// handeling error
                console.error('Failed to fetch exchange rates:', err);
                setError('Failed to load rates. Using defaults.');
                if (onRatesLoaded) onRatesLoaded();
            } finally {
                setLoading(false);
            }
        };

        void fetchLiveRates();
    }, [onRatesLoaded]);

    return (
        // Show load progress or error to the user
        <Box sx={{ mb: 3, p: 1, borderRadius: 1 }}>
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="textSecondary">Loading exchange rates...</Typography>
                </Box>
            ) : error ? (
                <Typography variant="body2" color="error">{error}</Typography>
            ) : null }
        </Box>
    );
}