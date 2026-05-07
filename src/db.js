/**
 * Represents the main database engine for the Cost Manager application.
 * Utilizes the browser's LocalStorage to persist user costs.
 */
export const db = {

    /**
     * Initializes the local storage database if it doesn't exist.
     * * @param {string} databaseName - The key name used in local storage.
     * @param {number} databaseVersion - The version of the database.
     * @returns {Object} Returns the db object itself for method chaining.
     */
    openCostsDB: function(databaseName, databaseVersion) {
        // Set the database name as a property of the db object
        this.dbName = databaseName;

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
        // Retrieve the current stringified data from local storage, or an empty array
        const dataString = localStorage.getItem(this.dbName) || '[]';

        // Parse the JSON string back into a workable JavaScript array
        const costs = JSON.parse(dataString);

        // Generate the current date to attach to the new cost item
        const today = new Date();

        // Construct the new cost object according to the project requirements
        const newCost = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: {
                day: today.getDate(),
                month: today.getMonth() + 1, // JS months are 0-indexed, so we add 1
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
    getReport: async function(currency, year, month) {
        // Use current date as fallback if year or month are not provided
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

        // Define the API URL using string interpolation (Template Literals)
        // Note: You might need to replace this baseUrl with the exact one from your API provider
        const baseUrl = 'https://api.exchangerate-api.com/v4';

        // Construct the full URL requesting latest rates based on USD
        const apiUrl = `${baseUrl}/latest/USD`;

        let rates = {};

        // Attempt to fetch the live exchange rates from the real API
        try {
            const response = await fetch(apiUrl);

            // Check if the response status is strictly OK (200-299)
            if (response.ok === false) {
                throw new Error("HTTP error " + response.status);
            }

            // Parse the JSON data from the API response
            const responseData = await response.json();

            // Extract the rates object (APIs usually wrap it in 'rates' or 'conversion_rates')
            rates = responseData.rates || responseData.conversion_rates || responseData;

        } catch (error) {
            // Fallback to default manual rates in case of network failure or API limit reached
            console.error("Failed to fetch live exchange rates:", error);
            rates = {"USD":1, "GBP":0.79, "EURO":0.93, "ILS":3.72};
        }

        let totalSum = 0;

        // Iterate over each filtered cost to calculate the total sum in the target currency
        filteredCosts.forEach(item => {
            if (rates[item.currency] && rates[currency]) {
                // Convert the original sum to USD (base currency), then to the target currency
                const sumInUsd = item.sum / rates[item.currency];
                totalSum += (sumInUsd * rates[currency]);
            }
        });

        // Package the final report object structure required by the tester
        return {
            year: targetYear,
            month: targetMonth,
            costs: filteredCosts,
            total: {
                currency: currency,
                sum: Number(totalSum.toFixed(2)) // Round to 2 decimal places
            }
        };
    }
};