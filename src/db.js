/**
 * Represents the main database engine for the Cost Manager application.
 * Utilizes the browser's LocalStorage to persist user costs.
 */
export const db = {
    // Default exchange rates
    rates: {'USD':1, 'GBP':0.79, 'EURO':0.93, 'ILS':3.72},

    /**
     * Synchronously updates the exchange rates in the database.
     * @param {Object} newRates - A dictionary of currency exchange rates.
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

        // Check if a database with this name already exists in the browser
        if (!localStorage.getItem(this.dbName)) {
            // Initialize a new empty array and convert it to a JSON string
            localStorage.setItem(this.dbName, JSON.stringify([]));
        }

        // Return this to allow the tester to chain function calls
        return this;
    },

    /**
     * Adds a new cost item to the database with an auto-generated date.
     * @param {Object} cost - The cost object containing sum, category, description, and currency.
     * @returns {Object} Returns the newly created cost object including the date.
     */
    addCost: function(cost) {
        // --- Start of Validation Block ---

        // 1. check if sum is a number and positive one
        const numericSum = Number(cost.sum);
        if (isNaN(numericSum) || numericSum < 0) {
            throw new Error("Invalid input: 'sum' must be a valid positive number.");
        }

        // 2. check if currency isn't empty
        if (typeof cost.currency !== 'string' || cost.currency.trim() === '') {
            throw new Error("Invalid input: 'currency' must be a non-empty string.");
        }

        // 3. check if currency from ones the app accepts
        const cleanCurrency = cost.currency.trim().toUpperCase();
        if (!(cleanCurrency in this.rates)) {
            const allowedCurrencies = Object.keys(this.rates).join(', ');
            throw new Error(`Invalid input: 'currency' must be one of the following: ${allowedCurrencies}.`);
        }

        // 4. Only non-empty string for category
        if (typeof cost.category !== 'string' || cost.category.trim() === '') {
            throw new Error("Invalid input: 'category' must be a non-empty string.");
        }

        // 5. Only accepts string for description
        if (typeof cost.description !== 'string') {
            throw new Error("Invalid input: 'description' must be a string.");
        }
        // --- End of Validation Block ---

        // Retrieve the current stringed-data from local storage, or an empty array
        const dataString = localStorage.getItem(this.dbName) || '[]';

        // Parse the JSON string back into a js array
        const costs = JSON.parse(dataString);

        // Generate the current date to attach to the new cost item
        const today = new Date();

        // Construct the new cost object
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

        // Push the new object into our array and save it back to local storage
        costs.push(newCost);
        localStorage.setItem(this.dbName, JSON.stringify(costs));

        return newCost;
    },

    /**
     * Generates a monthly report by fetching live exchange rates from an external API.
     * @param {string} currency - The target currency for the report's total sum.
     * @param {number} [year] - The target year for the report.
     * @param {number} [month] - The target month for the report.
     * @returns {Object} Returns a report object containing filtered costs and the total sum.
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

        // Fetch all data from the database and parse it
        const dataString = localStorage.getItem(this.dbName) || '[]';
        const allCosts = JSON.parse(dataString);

        // Filter the array to keep only costs that match the requested month and year
        const filteredCosts = allCosts.filter(item =>
            item.date.year === targetYear && item.date.month === targetMonth
        );

        let totalSum = 0;

        // Iterate over each filtered cost to calculate the total sum in the target currency
        filteredCosts.forEach(item => {
            if (this.rates[item.currency] && this.rates[cleanCurrency]) {
                // Convert the original sum to USD, then to the target currency
                const sumInUsd = item.sum / this.rates[item.currency];
                totalSum += (sumInUsd * this.rates[cleanCurrency]);
            }
        });

        // Package the final report object structure required by the tester
        return {
            year: targetYear,
            month: targetMonth,
            costs: filteredCosts,
            total: {
                currency: cleanCurrency,
                sum: Number(totalSum.toFixed(2)) // round to decimal points
            },
            rates: this.rates
        };
    }
};