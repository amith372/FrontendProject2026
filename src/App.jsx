import { useState, useEffect } from 'react';
import {
    Container, Typography, Box, TextField,
    Button, MenuItem, Select, InputLabel,
    FormControl, Paper
} from '@mui/material';
import { db } from './db'; // הייבוא של מנוע הנתונים שלנו משלב 1!

function App() {
    // 1. ניהול מצב (State): שומרים את מה שהמשתמש מקליד בכל שדה בטופס
    const [sum, setSum] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [currency, setCurrency] = useState('USD'); // מטבע ברירת מחדל

    // סטייט להצגת הודעת הצלחה למשתמש
    const [message, setMessage] = useState('');

    // 2. אתחול מסד הנתונים: פועל פעם אחת כשהאפליקציה עולה
    useEffect(() => {
        db.openCostsDB('costsdb', 1);
    }, []);

    // 3. פונקציית הגישור: לוקחת את הנתונים מהטופס ושולחת ל-db.js
    const handleAddCost = (e) => {
        e.preventDefault(); // מונע מהדף לבצע רענון (Refresh) אוטומטי בעת שליחת טופס

        // בונים אובייקט הוצאה בדיוק כמו ש-db.js מצפה לקבל
        const newCost = {
            sum: Number(sum), // חובה להמיר למספר, כי שדות טקסט מחזירים מחרוזת (String)
            currency: currency,
            category: category,
            description: description
        };

        // קוראים לפונקציה מהקובץ db.js ששומרת בפועל את הנתונים!
        db.addCost(newCost);

        // מציגים הודעת הצלחה ומנקים את השדות (איפוס הטופס)
        setMessage('ההוצאה נוספה ונשמרה בהצלחה!');
        setSum('');
        setCategory('');
        setDescription('');

        // מעלימים את הודעת ההצלחה אחרי 3 שניות
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <Container maxWidth="sm">
            {/* Paper זה רכיב של MUI שיוצר כרטיסייה לבנה עם קצת צל (elevation) */}
            <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
                <Typography variant="h4" align="center" gutterBottom color="primary">
                    Cost Manager
                </Typography>
                <Typography variant="subtitle1" align="center" sx={{ mb: 3 }}>
                    הוספת הוצאה חדשה
                </Typography>

                {/* הטופס שלנו שקורא לפונקציה בעת לחיצה על סאבמיט */}
                <form onSubmit={handleAddCost}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* שדה סכום */}
                        <TextField
                            label="סכום"
                            type="number"
                            required
                            value={sum}
                            onChange={(e) => setSum(e.target.value)} // מעדכן את הסטייט בכל הקלדה
                        />

                        {/* שדה תיאור */}
                        <TextField
                            label="תיאור (לדוגמה: פיצה)"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        {/* שדה קטגוריה */}
                        <TextField
                            label="קטגוריה (לדוגמה: FOOD)"
                            required
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />

                        {/* בחירת מטבע (Select Dropdown) */}
                        <FormControl required>
                            <InputLabel>מטבע</InputLabel>
                            <Select
                                value={currency}
                                label="מטבע"
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <MenuItem value="USD">USD ($)</MenuItem>
                                <MenuItem value="ILS">ILS (₪)</MenuItem>
                                <MenuItem value="EURO">EURO (€)</MenuItem>
                                <MenuItem value="GBP">GBP (£)</MenuItem>
                            </Select>
                        </FormControl>

                        {/* כפתור הוספה */}
                        <Button type="submit" variant="contained" size="large" color="primary">
                            שמור הוצאה
                        </Button>

                        {/* הודעת הצלחה (מופיעה רק אם יש טקסט ב-message) */}
                        {message && (
                            <Typography color="success.main" align="center" fontWeight="bold">
                                {message}
                            </Typography>
                        )}

                    </Box>
                </form>
            </Paper>
        </Container>
    );
}

export default App;