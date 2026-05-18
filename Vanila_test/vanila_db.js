/* eslint-disable */
/**
 * Vanilla JavaScript implementation of the Cost Manager database.
 */

(function createDatabaseScope() {
  const myDB = {
    rates: {
      USD: 1,
      GBP: 0.79,
      EURO: 0.93,
      ILS: 3.72,
    },

    /**
     * Initializes the local storage database if it doesn't exist.
     * @param {string} databaseName - The key name used in local storage.
     * @param {number} databaseVersion - The version of the database (currently unused).
     * @returns {Object} Returns the db object itself for method chaining.
     */
    openCostsDB(databaseName, databaseVersion) {
      this.dbName = databaseName;

      if (!localStorage.getItem(this.dbName)) {
        localStorage.setItem(this.dbName, JSON.stringify([]));
      }

      this.fetchRatesInBackground();

      return this;
    },

    /**
     * Fetches exchange rates from the API asynchronously in the background.
     */
    fetchRatesInBackground() {
      const baseUrl = 'https://api.exchangerate-api.com/v4';
      const apiUrl = `${baseUrl}/latest/USD`;

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('HTTP error');
          }

          return response.json();
        })
        .then((data) => {
          this.rates = data.rates || data.conversion_rates || data;
        })
        .catch((error) => {
          console.log('Could not get live rates, keeping fixed rates.', error);
        });
    },

    /**
     * Adds a new cost item to the database with an auto-generated date.
     * @param {Object} cost - The cost object with sum, currency, category, description.
     * @returns {Object} Returns the newly created cost object including the date.
     */
    addCost(cost) {
      const dataString = localStorage.getItem(this.dbName) || '[]';
      const costs = JSON.parse(dataString);
      const today = new Date();

      // JS months are 0-indexed
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

      costs.push(newCost);
      localStorage.setItem(this.dbName, JSON.stringify(costs));

      return newCost;
    },

    /**
     * Generates a monthly report using live or fallback exchange rates.
     * @param {string} currency - The target currency for the report's total sum.
     * @param {number} [year] - The target year for the report (defaults to current year).
     * @param {number} [month] - The target month for the report (defaults to current month).
     * @returns {Object} Returns a report object with filtered costs and total sum.
     */
    getReport(currency, year, month) {
      const currentDate = new Date();
      const targetYear = year || currentDate.getFullYear();
      const targetMonth = month || (currentDate.getMonth() + 1);

      const dataString = localStorage.getItem(this.dbName) || '[]';
      const allCosts = JSON.parse(dataString);

      const filteredCosts = allCosts.filter((item) => (
        item.date.year === targetYear && item.date.month === targetMonth
      ));

      let totalSum = 0;

      filteredCosts.forEach((item) => {
        if (this.rates[item.currency] && this.rates[currency]) {
          const sumInUsd = item.sum / this.rates[item.currency];
          totalSum += (sumInUsd * this.rates[currency]);
        }
      });

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

  window.db = myDB;
}());
