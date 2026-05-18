/**
 * Represents the main database engine for the Cost Manager application.
 * Utilizes the browser's LocalStorage to persist user costs.
 */
export const db = {
  dbName: '',

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

    return this;
  },

  /**
   * Adds a new cost item to the database with an auto-generated date.
   * @param {Object} cost - The cost object containing sum, category, description, and currency.
   * @returns {Object} Returns the newly created cost object including the date.
   */
  addCost(cost) {
    const dataString = localStorage.getItem(this.dbName) || '[]';
    const costs = JSON.parse(dataString);
    const today = new Date();

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

    costs.push(newCost);
    localStorage.setItem(this.dbName, JSON.stringify(costs));

    return newCost;
  },

  /**
   * Generates a monthly report by fetching live exchange rates from an external API.
   * @param {string} currency - The target currency for the report's total sum.
   * @param {number} [year] - The target year for the report (defaults to current year).
   * @param {number} [month] - The target month for the report (defaults to current month).
   * @returns {Promise<Object>} Returns a report object with filtered costs and total sum.
   */
  async getReport(currency, year, month) {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);

    const dataString = localStorage.getItem(this.dbName) || '[]';
    const allCosts = JSON.parse(dataString);

    const filteredCosts = allCosts.filter((item) => (
      item.date.year === targetYear && item.date.month === targetMonth
    ));

    const baseUrl = 'https://api.exchangerate-api.com/v4';
    const savedUrl = localStorage.getItem('exchangeRatesUrl');
    const apiUrl = savedUrl || `${baseUrl}/latest/USD`;

    let rates = {};

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const responseData = await response.json();
      rates = responseData.rates || responseData.conversion_rates || responseData;

      if (rates.EUR) {
        rates.EURO = rates.EUR;
      }
    } catch (error) {
      console.error('Failed to fetch live exchange rates:', error);
      rates = {
        USD: 1,
        GBP: 0.79,
        EURO: 0.93,
        ILS: 3.72,
      };
    }

    let totalSum = 0;

    // Convert each cost to target currency (via USD as base)
    filteredCosts.forEach((item) => {
      if (rates[item.currency] && rates[currency]) {
        const sumInUsd = item.sum / rates[item.currency];
        totalSum += (sumInUsd * rates[currency]);
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
      rates,
    };
  },
};
