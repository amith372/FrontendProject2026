import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { db } from '../db';

/**
 * GetRate Component.
 * Asynchronously fetches live exchange rates and injects them into the synchronous local DB.
 * @param {Function} onRatesLoaded - Callback triggered when rates are successfully loaded.
 */
export default function GetRate({ onRatesLoaded }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLiveRates = async () => {
            try {
                // Check if user has a custom URL, otherwise use default
                const savedUrl = localStorage.getItem('exchangeRatesUrl');

                // defaultUrl to point to the local file in the public folder
                const defaultUrl = '/rates.json';
                const apiUrl = savedUrl || defaultUrl;

                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error('HTTP error ' + res.status);

                const data = await res.json();
                const liveRates = data.rates || data.conversion_rates || data;

                if (liveRates['EUR']) liveRates['EURO'] = liveRates['EUR'];

                // Synchronously inject the fetched rates into our db engine
                db.rates = liveRates;

                if (onRatesLoaded) onRatesLoaded();
            } catch (err) {
                console.error('Failed to fetch exchange rates:', err);
                setError('Network error: Using fallback default rates.');
                // Trigger callback anyway so the app continues with default rates
                if (onRatesLoaded) onRatesLoaded();
            } finally {
                setLoading(false);
            }
        };

        fetchLiveRates();
    }, [onRatesLoaded]);

    return (
        // show load progress to the user
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