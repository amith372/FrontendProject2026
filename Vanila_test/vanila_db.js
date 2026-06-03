(function() {

    /**
     * @namespace myDB
     * @description A simple client-side database object utilizing localStorage
     * to manage expenses and currency conversions.
     */
    const myDB = {
        // Default exchange rates
        rates: {'USD':1, 'GBP':0.79, 'EURO':0.93, 'ILS':3.72},

        /**
         * Synchronously updates the exchange rates dictionary.
         * @param {Object} newRates - Dictionary of rates.
         */
        setRates: function(newRates) {
            if (newRates && typeof newRates === 'object') {
                this.rates = newRates;
            }
        },

        /**
         * Initializes the local storage database if it doesn't exist.
         * @param {string} databaseName - The key name used in local storage.
         * @param {number} databaseVersion - The version of the database.
         * @returns {Object} Returns the db object itself for method chaining.
         */
        openCostsDB: function(databaseName, databaseVersion) {
            // Validation for database name
            if (typeof databaseName !== 'string' || databaseName.trim() === '') {
                throw new Error("Invalid input: 'databaseName' must be a non-empty string.");
            }

            // Set the database name as a property of the db object
            this.dbName = databaseName.trim();
            this.dbVersion = databaseVersion;

            // If the database doesn't exist in localStorage yet, initialize it with an empty array.
            if (!localStorage.getItem(this.dbName)) {
                localStorage.setItem(this.dbName, JSON.stringify([]));
            }

            return this;
        },

        /**
         * Adds a new cost record to the database.
         * @param {Object} cost - The cost object to add.
         * @returns {Object} The newly created cost object including the injected date.
         */
        addCost: function(cost) {
            // --- Start of Validation Block ---

            // 1. Validate sum (must be a positive number)
            const numericSum = Number(cost.sum);
            if (isNaN(numericSum) || numericSum < 0) {
                throw new Error("Invalid input: 'sum' must be a valid positive number.");
            }

            // 2. Validate currency (must be a non-empty string)
            if (typeof cost.currency !== 'string' || cost.currency.trim() === '') {
                throw new Error("Invalid input: 'currency' must be a non-empty string.");
            }

            // Clean the currency string and check if it exists in the accepted rates dictionary
            const cleanCurrency = cost.currency.trim().toUpperCase();
            if (!(cleanCurrency in this.rates)) {
                const allowedCurrencies = Object.keys(this.rates).join(', ');
                throw new Error(`Invalid input: 'currency' must be one of the following: ${allowedCurrencies}.`);
            }

            // 3. Validate category (must be a non-empty string)
            if (typeof cost.category !== 'string' || cost.category.trim() === '') {
                throw new Error("Invalid input: 'category' must be a non-empty string.");
            }

            // 4. Validate description (must be a string, empty string is allowed)
            if (typeof cost.description !== 'string') {
                throw new Error("Invalid input: 'description' must be a string.");
            }
            // --- End of Validation Block ---

            // Retrieve existing costs from localStorage, empty is default
            const dataString = localStorage.getItem(this.dbName) || '[]';
            const costs = JSON.parse(dataString);
            const today = new Date();

            // Construct the complete cost object using the validated data
            const newCost = {
                sum: numericSum,
                currency: cleanCurrency,
                category: cost.category.trim(),
                description: cost.description.trim(),
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
         * @param {string} currency - The target currency for the report total.
         * @param {number} [year] - The target year (defaults to current year).
         * @param {number} [month] - The target month (defaults to current month).
         * @returns {Object} The formatted report containing filtered costs and the calculated total.
         */
        getReport: function(currency, year, month) {
            // --- Start of Validation Block ---

            // 1. Validate currency
            if (typeof currency !== 'string' || currency.trim() === '') {
                throw new Error("Invalid input: 'currency' must be a non-empty string.");
            }
            const cleanCurrency = currency.trim().toUpperCase();
            if (!(cleanCurrency in this.rates)) {
                const allowedCurrencies = Object.keys(this.rates).join(', ');
                throw new Error(`Invalid input: 'currency' must be one of the following: ${allowedCurrencies}.`);
            }

            const currentDate = new Date();

            // 2. Validate year (if provided)
            let targetYear = currentDate.getFullYear();
            if (year !== undefined && year !== '') {
                targetYear = Number(year);
                if (!Number.isInteger(targetYear) || targetYear <= 0) {
                    throw new Error("Invalid input: 'year' must be a positive integer.");
                }
            }

            // 3. Validate month (if provided)
            let targetMonth = currentDate.getMonth() + 1;
            if (month !== undefined && month !== '') {
                targetMonth = Number(month);
                if (!Number.isInteger(targetMonth) || targetMonth < 1 || targetMonth > 12) {
                    throw new Error("Invalid input: 'month' must be an integer between 1 and 12.");
                }
            }
            // --- End of Validation Block ---

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
                if (this.rates[item.currency] && this.rates[cleanCurrency]) {
                    const sumInUsd = item.sum / this.rates[item.currency];
                    totalSum += (sumInUsd * this.rates[cleanCurrency]);
                }
            });

            // Return the aggregated report
            return {
                year: targetYear,
                month: targetMonth,
                costs: filteredCosts,
                total: {
                    currency: cleanCurrency,
                    sum: Number(totalSum.toFixed(2))
                },
                rates: this.rates
            };
        }
    };

    // Attach the DB to the global window object so it can be accessed from the HTML script
    window['db'] = myDB;

})();