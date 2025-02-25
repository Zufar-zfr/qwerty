const Doctor = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const doctor = await Doctor.findOne({ username });
      if (!doctor) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
      }

      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Неверные учетные данные' });
      }

      const token = jwt.sign(
        { doctorId: doctor._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token, 
        doctor: { 
          username: doctor.username, 
          name: doctor.name,
          specialization: doctor.specialization 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
};

module.exports = authController; 