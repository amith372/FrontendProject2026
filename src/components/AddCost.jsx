import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Grid } from '@mui/material';
import { db } from '../db';
import './AddCost.css';

/**
 * AddCost Component - Handles user input for adding new expense items.
 * @returns {JSX.Element} The rendered expense form.
 */
export default function AddCost() {
  const [sum, setSum] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');

  /**
   * Handles form submission and database persistence.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleAddCost = (event) => {
    event.preventDefault();

    const newCost = {
      sum: Number(sum),
      currency,
      category,
      description,
    };

    db.addCost(newCost);

    setMessage('Expense added successfully!');
    setSum('');
    setCategory('');
    setDescription('');

    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleAddCost}>
      <Grid container spacing={3} sx={{ alignItems: 'center' }}>
        <Grid xs={12} sm={6} md={3}>
          <TextField
            label="Amount"
            type="number"
            required
            value={sum}
            onChange={(event) => setSum(event.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <TextField
            label="Description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <TextField
            label="Category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <FormControl required fullWidth size="small">
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              label="Currency"
              onChange={(event) => setCurrency(event.target.value)}
            >
              <MenuItem value="USD">USD ($)</MenuItem>
              <MenuItem value="ILS">ILS (₪)</MenuItem>
              <MenuItem value="EURO">EURO (€)</MenuItem>
              <MenuItem value="GBP">GBP (£)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ minWidth: '200px' }}
        >
          Save Expense
        </Button>

        <Typography color="success.main" sx={{ mt: 1, minHeight: '24px', fontWeight: 'bold' }}>
          {message}
        </Typography>
      </Box>

    </form>
  );
}