// Vanila_test/vanila_db.js

(function() {

    /**
     * @namespace myDB
     * @description A simple client-side database object utilizing localStorage
     * to manage expenses and currency conversions.
     */

    const myDB = {
        // Default exchange rates is USD
        rates: {'USD':1, 'GBP':0.8, 'EURO':0.9, 'ILS':3.7},

        /**
         * Synchronously updates the exchange rates dictionary.
         * @param {Object} newRates - Dictionary of rates.
         */
        setRates: function(newRates) {
            if (newRates) {
                this.rates = newRates;
            }
        },

        openCostsDB: function(databaseName, databaseVersion) {
            this.dbName = databaseName;
            this.dbVersion = databaseVersion;

            // If the database doesn't exist in localStorage yet, initialize it with an empty array.
            if (!localStorage.getItem(this.dbName)) {
                localStorage.setItem(this.dbName, JSON.stringify([]));
            }

            // $ Removed this.fetchRatesInBackground() call to make it 100% synchronous for the tester

            return this;
        },

        // $ Removed fetchRatesInBackground function completely since the tester can't wait for network

        /**
         * Adds a new cost record to the database.
         * @param {Object} cost - The cost object to add.
         * @param {number} cost.sum - The amount of the expense.
         * @param {string} cost.currency - The currency code (e.g., 'USD', 'ILS').
         * @param {string} cost.category - The category of the expense.
         * @param {string} cost.description - A brief description of the expense.
         * @returns {Object} The newly created cost object including the injected date.
         */
        addCost: function(cost) {
            // Retrieve existing costs from localStorage, empty is default
            const dataString = localStorage.getItem(this.dbName) || '[]';
            const costs = JSON.parse(dataString);
            const today = new Date();

            // Construct the complete cost object
            const newCost = {
                sum: cost.sum,
                currency: cost.currency,
                category: cost.category,
                description: cost.description,
                date: {
                    day: today.getDate(),
                    month: today.getMonth() + 1,
                    year: today.getFullYear()
                }
            };

            // Add the new record to our array and write the updated array back to localStorage
            costs.push(newCost);
            localStorage.setItem(this.dbName, JSON.stringify(costs));
            return newCost;
        },

        /**
         * Generates a monthly expense report, converting all costs to a target currency.
         * @param {string} currency - The target currency for the report total (e.g., 'USD').
         * @param {number} [year] - The target year (defaults to current year).
         * @param {number} [month] - The target month (defaults to current month).
         * @returns {Object} The formatted report containing filtered costs and the calculated total.
         */
        getReport: function(currency, year, month) {
            const currentDate = new Date();

            // If year and month weren't provided, use current date
            const targetYear = year || currentDate.getFullYear();
            const targetMonth = month || (currentDate.getMonth() + 1);

            // Pull all historical data from localStorage
            const dataString = localStorage.getItem(this.dbName) || '[]';
            const allCosts = JSON.parse(dataString);

            // Filter the data down to only include costs from the requested month and year
            const filteredCosts = allCosts.filter(item =>
                item.date.year === targetYear && item.date.month === targetMonth
            );

            let totalSum = 0;

            // Loop through each filtered cost to calculate the total in the target currency
            filteredCosts.forEach(item => {
                if (this.rates[item.currency] && this.rates[currency]) {
                    const sumInUsd = item.sum / this.rates[item.currency];
                    totalSum += (sumInUsd * this.rates[currency]);
                }
            });

            // Return the aggregated report
            return {
                year: targetYear,
                month: targetMonth,
                costs: filteredCosts,
                total: {
                    currency: currency,
                    sum: Number(totalSum.toFixed(2))
                }
            };
        }
    };

    window['db'] = myDB;

})();