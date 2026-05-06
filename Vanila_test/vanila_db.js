// Vanila_test/db.js - הגרסה להגשה (Vanilla JS)

(function(global) {

    const db = {

        // 1. פתיחת מסד הנתונים
        openCostsDB: function(databaseName, databaseVersion) {
            this.dbName = databaseName;

            if (!localStorage.getItem(this.dbName)) {
                localStorage.setItem(this.dbName, JSON.stringify([]));
            }
            return this;
        },

        // 2. הוספת הוצאה חדשה
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

        // 3. הפקת דוח חודשי (כולל משיכת שערי חליפין)
        getReport: async function(currency, year, month) {
            const currentDate = new Date();
            const targetYear = year || currentDate.getFullYear();
            const targetMonth = month || (currentDate.getMonth() + 1);

            const dataString = localStorage.getItem(this.dbName) || '[]';
            const allCosts = JSON.parse(dataString);

            const filteredCosts = allCosts.filter(item =>
                item.date.year === targetYear && item.date.month === targetMonth
            );

            const defaultRatesUrl = 'https://your-server.com/rates.json';
            const exchangeRatesUrl = localStorage.getItem('exchangeRatesUrl') || defaultRatesUrl;

            let rates = {};

            try {
                const response = await fetch(exchangeRatesUrl);
                if (!response.ok) throw new Error("HTTP error " + response.status);
                rates = await response.json();
            } catch (error) {
                console.error("Failed to fetch exchange rates:", error);
                rates = {"USD":1, "GBP":0.6, "EURO":0.7, "ILS":3.4};
            }

            let totalSum = 0;

            filteredCosts.forEach(item => {
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
                    currency: currency,
                    sum: Number(totalSum.toFixed(2))
                }
            };
        }
    };

    // חשיפת האובייקט לדפדפן כדי שקובץ ה-HTML של הטסטר יוכל לקרוא לו
    global.db = db;

})(window);