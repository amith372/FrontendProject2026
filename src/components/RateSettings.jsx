import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

/**
 * RateSettings Component - Manages configuration of exchange rates API endpoint.
 * @returns {JSX.Element} The settings panel for API configuration.
 */
function RateSettings() {
  const [ratesUrl, setRatesUrl] = useState('');
  const [status, setStatus] = useState('');

  /**
   * Saves the entered API URL to localStorage.
   */
  const handleSaveUrl = () => {
    localStorage.setItem('exchangeRatesUrl', ratesUrl);
    setStatus('URL saved successfully!');
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
          onChange={(event) => setRatesUrl(event.target.value)}
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