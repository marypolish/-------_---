const express = require('express');
const { getFilteredEventsForUser, createEvent, updateEvent, deleteEvent } = require('../controllers/event.controller');
const checkRole = require('../middleware/auth.middleware');

const router = express.Router();

// Отримати події з фільтрацією
router.get('/events', checkRole(['admin', 'teacher', 'student']), getFilteredEventsForUser);

// Створити нову подію
router.post('/events', checkRole(['admin', 'teacher']), createEvent);

// Оновити подію
router.put('/events/:eventId', checkRole(['admin', 'teacher']), updateEvent);

// Видалити подію (тільки адмін)
router.delete('/events/:eventId', checkRole(['admin']), deleteEvent);

module.exports = router;
