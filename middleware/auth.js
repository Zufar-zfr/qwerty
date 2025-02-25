const jwt = require('jsonwebtoken');
const Doctor = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Проверяем наличие токена
        const token = req.header('Authorization');
        if (!token) {
            throw new Error('Токен не предоставлен');
        }

        // Убираем 'Bearer ' из токена
        const tokenString = token.replace('Bearer ', '');
        
        // Проверяем токен
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        // Находим доктора
        const doctor = await Doctor.findOne({ _id: decoded.doctorId });
        
        if (!doctor) {
            throw new Error('Доктор не найден');
        }

        // Добавляем информацию в запрос
        req.doctor = doctor;
        req.token = tokenString;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Пожалуйста, авторизуйтесь' });
    }
};

module.exports = auth; 