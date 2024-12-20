const express = require('express');
const { getEventsForCalendar, getFilteredEvents, addEventToCalendar } = require('../controllers/calendar.controller');

const router = express.Router();

// Отримати події для календаря за певний період
router.get('/calendar', getEventsForCalendar);

// Отримати події з фільтрацією
router.get('/calendar/filter', getFilteredEvents);

// Додати подію до календаря
router.post('/calendar', addEventToCalendar);

module.exports = router;
