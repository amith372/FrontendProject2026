/**
 * Represents the main database engine for the Cost Manager application.
 * Utilizes the browser's LocalStorage to persist user costs.
 * @typedef {Object} CostItem
 * @property {number} sum - The cost amount.
 * @property {string} currency - The currency code (USD, ILS, EURO, GBP).
 * @property {string} category - The expense category.
 * @property {string} description - A brief description of the expense.
 * @property {Object} date - The date object with day, month, and year.
 */

/**
 * Database object for managing costs and generating reports.
 * @type {Object}
 */
export const db = {
  dbName: '',

  /**
   * Initializes the local storage database if it doesn't exist.
   * Supports method chaining for a fluent API.
   * @param {string} databaseName - The key name used in local storage.
   * @param {number} databaseVersion - The version of the database (currently unused).
   * @returns {Object} Returns the db object itself for method chaining.
   */
  openCostsDB(databaseName, databaseVersion) {
    // Store the database name for later use in this object.
    this.dbName = databaseName;

    // Initialize an empty array if the database doesn't exist yet.
    if (!localStorage.getItem(this.dbName)) {
      localStorage.setItem(this.dbName, JSON.stringify([]));
    }

    return this;
  },

  /**
   * Adds a new cost item to the database with an auto-generated date.
   * @param {CostItem} cost - The cost object containing sum, category, description, and currency.
   * @returns {CostItem} Returns the newly created cost object including the date.
   */
  addCost(cost) {
    // Retrieve the current stringified data from local storage.
    const dataString = localStorage.getItem(this.dbName) || '[]';

    // Parse the JSON string into a workable JavaScript array.
    const costs = JSON.parse(dataString);

    // Generate the current date for the new cost item.
    const today = new Date();

    // Construct the new cost object with the provided data and date.
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
   * Generates a monthly report by fetching live exchange rates from an external API.
   * Uses async/await for clean asynchronous flow control.
   * @param {string} currency - The target currency for the report's total sum.
   * @param {number} [year] - The target year for the report (defaults to current year).
   * @param {number} [month] - The target month for the report (defaults to current month).
   * @returns {Promise<Object>} Returns a report object with filtered costs and total sum.
   */
  async getReport(currency, year, month) {
    // Establish default values for year and month using current date.
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

    // Define the primary API endpoint for exchange rates.
    const baseUrl = 'https://api.exchangerate-api.com/v4';

    // Allow users to override the API URL via localStorage settings.
    const savedUrl = localStorage.getItem('exchangeRatesUrl');
    const apiUrl = savedUrl || `${baseUrl}/latest/USD`;

    // Initialize rates; will be updated from API or fallback to defaults.
    let rates = {};

    try {
      // Fetch live exchange rates from the configured API endpoint.
      const response = await fetch(apiUrl);

      // Check for HTTP errors using strict equality.
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      // Parse the JSON response data.
      const responseData = await response.json();

      // Extract rates from various possible API response structures.
      // Different APIs may use 'rates' or 'conversion_rates' as the key.
      rates = responseData.rates || responseData.conversion_rates || responseData;

      // Normalize EUR to EURO for consistency with the application.
      if (rates.EUR) {
        rates.EURO = rates.EUR;
      }
    } catch (error) {
      // Fallback to hardcoded rates if the API request fails.
      // This ensures the app remains functional even without internet access.
      console.error('Failed to fetch live exchange rates:', error);
      rates = {
        USD: 1,
        GBP: 0.79,
        EURO: 0.93,
        ILS: 3.72,
      };
    }

    // Calculate the total sum in the target currency using conversion logic.
    let totalSum = 0;

    // Iterate through filtered costs and accumulate the total in the target currency.
    // Each cost is converted to USD first, then to the target currency.
    filteredCosts.forEach((item) => {
      if (rates[item.currency] && rates[currency]) {
        const sumInUsd = item.sum / rates[item.currency];
        totalSum += (sumInUsd * rates[currency]);
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
      rates,
    };
  },
};
