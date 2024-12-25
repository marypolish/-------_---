const express = require('express');
const { getEventsForCalendar, addEventToCalendar } = require('../controllers/calendar.controller');

const router = express.Router();

// Отримати події для календаря за певний період і фільтрацією
router.get('/calendar/get/calendar', getEventsForCalendar);

// Додати подію до календаря
router.post('/calendar', addEventToCalendar);

module.exports = router;
