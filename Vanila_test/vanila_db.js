/* eslint-disable */
/**
 * Vanilla JavaScript implementation of the Cost Manager database.
 * This file demonstrates the database functionality without using modern module systems.
 * Used for testing and as a reference implementation.
 * @type {Object}
 */

(function createDatabaseScope() {
  /**
   * Database object for managing costs with live exchange rate fetching.
   * Fetches rates asynchronously in the background without blocking operations.
   * @type {Object}
   */
  const myDB = {
    // Default exchange rates used as fallback if API is unavailable.
    rates: {
      USD: 1,
      GBP: 0.79,
      EURO: 0.93,
      ILS: 3.72,
    },

    /**
     * Initializes the local storage database if it doesn't exist.
     * Triggers background fetching of live exchange rates.
     * @param {string} databaseName - The key name used in local storage.
     * @param {number} databaseVersion - The version of the database (currently unused).
     * @returns {Object} Returns the db object itself for method chaining.
     */
    openCostsDB(databaseName, databaseVersion) {
      // Store the database name for later access.
      this.dbName = databaseName;

      // Initialize an empty array if the database doesn't exist yet.
      if (!localStorage.getItem(this.dbName)) {
        localStorage.setItem(this.dbName, JSON.stringify([]));
      }

      // Initiate background fetch of live exchange rates without blocking.
      this.fetchRatesInBackground();

      return this;
    },

    /**
     * Fetches exchange rates from the API asynchronously in the background.
     * Does not block the main thread; rates are updated when available.
     * Falls back to default rates if the API request fails.
     */
    fetchRatesInBackground() {
      // API endpoint for fetching the latest exchange rates.
      const baseUrl = 'https://api.exchangerate-api.com/v4';
      const apiUrl = `${baseUrl}/latest/USD`;

      // Fetch rates without blocking execution using Promise chain.
      fetch(apiUrl)
        .then((response) => {
          // Check for HTTP errors using strict equality.
          if (!response.ok) {
            throw new Error('HTTP error');
          }

          return response.json();
        })
        .then((data) => {
          // Extract and update rates from the API response.
          this.rates = data.rates || data.conversion_rates || data;
          // Fallback console logging (commented out) for debugging.
          // console.log('Live exchange rates loaded in the background!');
        })
        .catch((error) => {
          // Gracefully handle errors by keeping default fallback rates.
          console.log('Could not get live rates, keeping fixed rates.', error);
        });
    },

    /**
     * Adds a new cost item to the database with an auto-generated date.
     * @param {Object} cost - The cost object with sum, currency, category, description.
     * @returns {Object} Returns the newly created cost object including the date.
     */
    addCost(cost) {
      // Retrieve current data from local storage or initialize empty array.
      const dataString = localStorage.getItem(this.dbName) || '[]';
      const costs = JSON.parse(dataString);

      // Generate the current date for the new cost item.
      const today = new Date();

      // Construct the new cost object with provided data and auto-generated date.
      // JS months are 0-indexed, so we add 1 to get the human-readable month.
      const newCost = {
        sum: cost.sum,
        currency: cost.currency,
        category: cost.category,
        description: cost.description,
        date: {
          day: today.getDate(),
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        },
      };

      // Add the new cost to the array and persist to local storage.
      costs.push(newCost);
      localStorage.setItem(this.dbName, JSON.stringify(costs));

      return newCost;
    },

    /**
     * Generates a monthly report using live or fallback exchange rates.
     * Filters costs by month and year, then converts to the target currency.
     * @param {string} currency - The target currency for the report's total sum.
     * @param {number} [year] - The target year for the report (defaults to current year).
     * @param {number} [month] - The target month for the report (defaults to current month).
     * @returns {Object} Returns a report object with filtered costs and total sum.
     */
    getReport(currency, year, month) {
      // Use current date as fallback if year or month are not provided.
      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetMonth = month || (currentDate.getMonth() + 1);

      // Retrieve and parse all costs from local storage.
      const dataString = localStorage.getItem(this.dbName) || '[]';
      const allCosts = JSON.parse(dataString);

      // Filter costs to include only those matching the target month and year.
      const filteredCosts = allCosts.filter((item) => (
        item.date.year === targetYear && item.date.month === targetMonth
      ));

      // Initialize total sum accumulator for currency conversion calculations.
      let totalSum = 0;

      // Iterate through filtered costs and accumulate the total in target currency.
      // Each cost is converted to USD first, then to the target currency.
      filteredCosts.forEach((item) => {
        // Check if both currency rates are available for conversion.
        if (this.rates[item.currency] && this.rates[currency]) {
          const sumInUsd = item.sum / this.rates[item.currency];
          totalSum += (sumInUsd * this.rates[currency]);
        }
      });

      // Package and return the final report object with all relevant data.
      return {
        year: targetYear,
        month: targetMonth,
        costs: filteredCosts,
        total: {
          currency,
          sum: Number(totalSum.toFixed(2)),
        },
      };
    },
  };

  // Expose the database object globally for use in HTML scripts.
  window.db = myDB;
}());
