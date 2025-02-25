require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../models/User');

const initCollections = async () => {
    try {
        // Подключение к существующей базе данных
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Создаем доктора, если его еще нет
        const existingDoctor = await Doctor.findOne({ username: 'doctor' });
        
        if (!existingDoctor) {
            const doctor = new Doctor({
                username: 'doctor',
                password: 'doctor123',
                name: 'Иван Иванович Иванов',
                specialization: 'Терапевт'
            });

            await doctor.save();
            console.log('Doctor created successfully');
        } else {
            console.log('Doctor already exists');
        }

        // Коллекция times создастся автоматически при первой записи
        console.log('Collections initialization completed');
        
    } catch (error) {
        console.error('Error initializing collections:', error);
    } finally {
        await mongoose.disconnect();
    }
};

initCollections(); 