(function() {
    const myDB = {
        // 1. אנחנו שומרים את השערים הקבועים מראש כמאפיין של מסד הנתונים
        rates: {"USD":1, "GBP":0.79, "EURO":0.93, "ILS":3.72},

        openCostsDB: function(databaseName, databaseVersion) {
            this.dbName = databaseName;
            if (!localStorage.getItem(this.dbName)) {
                localStorage.setItem(this.dbName, JSON.stringify([]));
            }

            // 2. מפעילים פונקציה שמביאה נתונים ברקע (הקוד לא עוצר ומחכה לה!)
            this.fetchRatesInBackground();

            return this;
        },

        // 3. הפונקציה החדשה שעושה את ה-Fetch בלי לתקוע את התוכנית
        fetchRatesInBackground: function() {
            const baseUrl = 'https://api.exchangerate-api.com/v4';
            const apiUrl = `${baseUrl}/latest/USD`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) throw new Error("HTTP error");
                    return response.json();
                })
                .then(data => {

                    this.rates = data.rates || data.conversion_rates || data;
                    //console.log("Live exchange rates loaded in the background!");
                })
                .catch(error => {
                    console.log("Could not get live rates, keeping fixed rates.", error);
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

        // 4. הפונקציה הזו חזרה להיות סינכרונית רגילה!
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

            // 5. היא פשוט משתמשת במחירון הנוכחי (בין אם הוא הקבוע או הלייב שעודכן ברקע)
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