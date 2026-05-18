// Vanila_test/vanila_db.js

(function() {
    const myDB = {

        rates: {"USD":1, "GBP":0.8, "EURO":0.9, "ILS":3.7},

        openCostsDB: function(databaseName, databaseVersion) {
            this.dbName = databaseName;
            if (!localStorage.getItem(this.dbName)) {
                localStorage.setItem(this.dbName, JSON.stringify([]));
            }

            this.fetchRatesInBackground();

            return this;
        },

        fetchRatesInBackground: function() {
            const savedUrl = localStorage.getItem('exchangeRatesUrl');

            const defaultUrl = './rates.json';

            const apiUrl = savedUrl || defaultUrl;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error("HTTP error");
                    return response.json();
                })
                .then(data => {
                    this.rates = data.rates || data.conversion_rates || data;
                    if (this.rates["EUR"]) {
                        this.rates["EURO"] = this.rates["EUR"];
                    }
                })
                .catch(error => {
                    error.message;
                });
        },

        addCost: function(cost) {
            const dataString = localStorage.getItem(this.dbName) || '[]';
            const costs = JSON.parse(dataString);
            const today = new Date();

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

            costs.push(newCost);
            localStorage.setItem(this.dbName, JSON.stringify(costs));
            return newCost;
        },

        getReport: function(currency, year, month) {
            const currentDate = new Date();
            const targetYear = year || currentDate.getFullYear();
            const targetMonth = month || (currentDate.getMonth() + 1);

            const dataString = localStorage.getItem(this.dbName) || '[]';
            const allCosts = JSON.parse(dataString);

            const filteredCosts = allCosts.filter(item =>
                item.date.year === targetYear && item.date.month === targetMonth
            );

            let totalSum = 0;

            filteredCosts.forEach(item => {
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
                    currency: currency,
                    sum: Number(totalSum.toFixed(2))
                }
            };
        }
    };

    window['db'] = myDB;

})();