const Time = require('../models/Time');

const appointmentController = {
  // Создание новой записи
  create: async (req, res) => {
    try {
      const { patientName, phoneNumber, date, time, comment } = req.body;
      
      if (!patientName || !phoneNumber) {
        return res.status(400).json({ 
          message: 'Имя и номер телефона обязательны для заполнения' 
        });
      }
      
      // Проверка, не занято ли это время
      const existingTime = await Time.findOne({ 
        date: new Date(date).setHours(0, 0, 0, 0), 
        time: time 
      });

      if (existingTime) {
        if (existingTime.isBlocked) {
          return res.status(400).json({ 
            message: 'Это время заблокировано врачом' 
          });
        }
        if (existingTime.patientName) {
          return res.status(400).json({ 
            message: 'Это время уже занято' 
          });
        }
      }

      const appointment = new Time({
        patientName,
        phoneNumber,
        date: new Date(date),
        time,
        comment
      });

      await appointment.save();
      res.status(201).json(appointment);
    } catch (error) {
      console.error('Error in create:', error);
      res.status(500).json({ message: 'Ошибка при создании записи' });
    }
  },

  // Получение записей на конкретный день
  getByDate: async (req, res) => {
    try {
      const { date } = req.query;
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const appointments = await Time.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ time: 1 });

      res.json(appointments);
    } catch (error) {
      console.error('Error in getByDate:', error);
      res.status(500).json({ message: 'Ошибка при получении записей' });
    }
  },

  // Получение всех доступных временных слотов на день
  getAvailableSlots: async (req, res) => {
    try {
      const { date } = req.query;
      const allSlots = [
        '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
      ];

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const bookedTimes = await Time.find({
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      // Фильтруем доступные слоты
      const availableSlots = allSlots.filter(slot => {
        const isBooked = bookedTimes.some(time => 
          time.time === slot && (time.patientName || time.isBlocked)
        );
        return !isBooked;
      });

      res.json(availableSlots);
    } catch (error) {
      console.error('Error in getAvailableSlots:', error);
      res.status(500).json({ message: 'Ошибка при получении доступных слотов' });
    }
  },

  // Добавьте этот метод в существующий объект appointmentController
  toggleBlock: async (req, res) => {
    try {
      const { date, time, isBlocked } = req.body;
      console.log('Received request:', { date, time, isBlocked }); // Для отладки

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      // Проверяем существующую запись
      const existingAppointment = await Time.findOne({
        date: startDate,
        time: time
      });

      if (isBlocked) {
        // Если блокируем и записи нет - создаем новую
        if (!existingAppointment) {
          const blockedTime = new Time({
            date: startDate,
            time,
            isBlocked: true,
            comment: 'Время заблокировано врачом'
          });
          await blockedTime.save();
        }
      } else {
        // Если разблокируем - удаляем запись
        if (existingAppointment && existingAppointment.isBlocked) {
          await Time.deleteOne({ 
            _id: existingAppointment._id 
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error in toggleBlock:', error);
      res.status(500).json({ message: 'Ошибка при изменении статуса блокировки' });
    }
  },

  // Добавьте этот метод в существующий контроллер
  blockTime: async (req, res) => {
    try {
      const { date, time } = req.body;
      
      // Проверяем, нет ли уже записи на это время
      const existingAppointment = await Time.findOne({
        date: new Date(date).setHours(0, 0, 0, 0),
        time: time
      });

      if (existingAppointment) {
        return res.status(400).json({ 
          message: 'Это время уже занято или заблокировано' 
        });
      }

      // Создаем новую запись с блокировкой
      const blockedTime = new Time({
        date: new Date(date),
        time,
        isBlocked: true,
        comment: 'Время заблокировано врачом'
      });

      await blockedTime.save();
      res.json({ success: true });
    } catch (error) {
      console.error('Error in blockTime:', error);
      res.status(500).json({ message: 'Ошибка при блокировке времени' });
    }
  }
};

module.exports = appointmentController; 