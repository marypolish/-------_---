const express = require('express');
const { getFilteredEventsForUser, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');

const router = express.Router();

// Отримати події з фільтрацією
router.get('/events/user/events',  getFilteredEventsForUser);

// Створити нову подію
router.post('/events/create', createEvent);

// Оновити подію
router.put('/events/update/:eventId',  updateEvent);

// Видалити подію (тільки адмін)
router.delete('/events/delete/:eventId', deleteEvent);

module.exports = router;
