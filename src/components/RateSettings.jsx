import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

/**
 * RateSettings Component - Manages configuration of exchange rates API endpoint.
 * Allows users to specify a custom API URL for fetching live exchange rates.
 * The URL is persisted to localStorage for use by the database engine.
 * @returns {JSX.Element} The settings panel for API configuration.
 */
function RateSettings() {
    const [ratesUrl, setRatesUrl] = useState('');
    const [status, setStatus] = useState('');

    /**
     * Saves the entered API URL to localStorage.
     * Displays a brief status message that clears after 3 seconds.
     */
    const handleSaveUrl = () => {
        // Persist the URL to localStorage for database access.
        localStorage.setItem('exchangeRatesUrl', ratesUrl);

        // Display success message to the user.
        setStatus('URL saved successfully!');

        // Clear the status message after 3 seconds to avoid clutter.
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
            {/* Settings Panel Title */}
            <Typography variant="h6" gutterBottom color="textSecondary" sx={{ mb: 2 }}>
                ⚙️ API Configuration
            </Typography>

            {/* Settings Input Container */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* URL Input Field */}
                <TextField
                    fullWidth
                    size="small"
                    label="Exchange Rates JSON URL"
                    variant="outlined"
                    value={ratesUrl}
                    onChange={(event) => setRatesUrl(event.target.value)}
                    placeholder="https://example.com/rates.json"
                    sx={{ flex: 1, minWidth: '200px' }}
                />

                {/* Save Button */}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveUrl}
                    sx={{ height: '40px' }}
                >
                    Save
                </Button>
            </Box>

            {/* Status Message Display */}
            {status && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    {status}
                </Typography>
            )}
        </Paper>
    );
}

export default RateSettings;