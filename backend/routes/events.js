const express = require('express');
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent, getDepartmentEvents, getGroupEvents, } = require('../controllers/event.controller');
const checkRole = require('../middleware/auth.middleware');

const router = express.Router();

// Отримати всі події (тільки адміністратор)
router.get('/events', checkRole(['admin']), getAllEvents);

// Створення події (адміністратор, викладач або студент)
router.post('/events', checkRole(['admin', 'teacher', 'student']), createEvent);

// Отримати подію за ID (всі ролі)
router.get('/events/:id', checkRole(['admin', 'teacher', 'student']), getEventById);

// Редагування події (адміністратор або викладач)
router.put('/events/:id', checkRole(['admin', 'teacher']), updateEvent);

// Видалення події (тільки адміністратор)
router.delete('/events/:id', checkRole(['admin']), deleteEvent);

module.exports = router;