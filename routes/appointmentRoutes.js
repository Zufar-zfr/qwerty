const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// Публичные маршруты
router.post('/', appointmentController.create);
router.get('/available-slots', appointmentController.getAvailableSlots);

// Защищенные маршруты (только для врача)
router.get('/by-date', auth, appointmentController.getByDate);
router.post('/block', auth, appointmentController.blockTime);

module.exports = router;