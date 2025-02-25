const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
// Добавим маршрут для проверки токена
router.get('/verify', auth, (req, res) => {
    res.json({ valid: true });
});

module.exports = router; 