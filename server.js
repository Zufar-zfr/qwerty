require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes для API
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

// Middleware для проверки авторизации на страницах
const checkAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.redirect('/doctor/login');
        }
        next();
    } catch (error) {
        res.redirect('/doctor/login');
    }
};

// Routes для страниц
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/doctor/login', (req, res) => {
    res.render('login');
});

app.get('/doctor/dashboard', async (req, res) => {
    try {
        res.render('dashboard', { doctorName: 'Доктор' });
    } catch (error) {
        res.redirect('/doctor/login');
    }
});

// Подключение к базе данных
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 