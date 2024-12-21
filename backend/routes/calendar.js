const express = require('express');
const { getEventsForCalendar, addEventToCalendar } = require('../controllers/calendar.controller');
const checkRole = require('../middleware/auth.middleware'); // імпортуємо middleware для перевірки ролей

const router = express.Router();

// Отримати події для календаря за певний період і фільтрацією
router.get('/calendar', checkRole(['admin', 'teacher', 'student']), getEventsForCalendar);

// Додати подію до календаря
router.post('/calendar', checkRole(['admin', 'teacher']), addEventToCalendar);

module.exports = router;
