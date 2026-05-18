import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography, Grid } from '@mui/material';
import { db } from '../db';
import './AddCost.css';

/**
 * AddCost Component - Handles user input for adding new expense items.
 * Provides a form with fields for amount, description, category, and currency selection.
 * @returns {JSX.Element} The rendered expense form with validation and feedback.
 */
export default function AddCost() {
  const [sum, setSum] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');

  /**
   * Handles form submission by validating input and persisting to the database.
   * Displays success message and resets form fields on completion.
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleAddCost = (event) => {
    event.preventDefault();

    // Construct the cost object with explicit type conversions.
    const newCost = {
      sum: Number(sum),
      currency,
      category,
      description,
    };

    // Persist the new cost to the database.
    db.addCost(newCost);

    // Display success feedback to the user.
    setMessage('Expense added successfully!');

    // Reset all form fields to their initial state.
    setSum('');
    setCategory('');
    setDescription('');

    // Clear the success message after 3 seconds to avoid clutter.
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleAddCost}>
      {/* Responsive grid container for form fields */}
      <Grid container spacing={3} sx={{ alignItems: 'center' }}>

        {/* Amount Input Field */}
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

        {/* Description Input Field */}
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

        {/* Category Input Field */}
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

        {/* Currency Selection Dropdown */}
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

      {/* Submit Button and Success Message Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ minWidth: '200px' }}
        >
          Save Expense
        </Button>

        {/* Success message displayed after form submission */}
        <Typography color="success.main" sx={{ mt: 1, minHeight: '24px', fontWeight: 'bold' }}>
          {message}
        </Typography>
      </Box>

    </form>
  );
}