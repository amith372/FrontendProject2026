/**
 * Represents the main database engine for the Cost Manager application.
 * Utilizes the browser's LocalStorage to persist user costs.
 */
export const db = {
    // Default exchange rates is USD
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
     * * @param {string} databaseName - The key name used in local storage.
     * @param {number} databaseVersion - The version of the database.
     * @returns {Object} Returns the db object itself for method chaining.
     */
    openCostsDB: function(databaseName, databaseVersion) {
        // Set the database name as a property of the db object
        this.dbName = databaseName;
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
     * * @param {Object} cost - The cost object containing sum, category, description, and currency.
     * @returns {Object} Returns the newly created cost object including the date.
     */
    addCost: function(cost) {
        // Retrieve the current stringed-data from local storage, or an empty array
        const dataString = localStorage.getItem(this.dbName) || '[]';

        // Parse the JSON string back into a js array
        const costs = JSON.parse(dataString);

        //Generate the current date to attach to the new cost item
        const today = new Date();

        // Construct the new cost object
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

        // Push the new object into our array and save it back to local storage
        costs.push(newCost);
        localStorage.setItem(this.dbName, JSON.stringify(costs));

        return newCost;
    },

    /**
     * Generates a monthly report by fetching live exchange rates from an external API.
     * * @param {string} currency - The target currency for the report's total sum.
     * @param {number} [year] - The target year for the report.
     * @param {number} [month] - The target month for the report.
     * @returns {Object} Returns a report object containing filtered costs and the total sum.
     */
    //
    getReport: function(currency, year, month) {
        // Use current date if year or month are not provided
        const currentDate = new Date();
        const targetYear = year || currentDate.getFullYear();
        const targetMonth = month || (currentDate.getMonth() + 1);

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
            if (this.rates[item.currency] && this.rates[currency]) {
                // Convert the original sum to USD, then to the target currency
                const sumInUsd = item.sum / this.rates[item.currency];
                totalSum += (sumInUsd * this.rates[currency]);
            }
        });

        // Package the final report object structure required by the tester
        return {
            year: targetYear,
            month: targetMonth,
            costs: filteredCosts,
            total: {
                currency: currency,
                sum: Number(totalSum.toFixed(2)) // round to decimal points
            },
            rates: this.rates
        };
    }
};