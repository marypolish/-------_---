const express = require('express');
const { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent, getDepartmentEvents, getGroupEvents, checkRole} = require('../controllers/event.controller');

const router = express.Router();

// Тільки адміністратор бачить всі події
router.get('/events', checkRole(['admin']), getAllEvents);

// Створення події: дозволено адміністратору та викладачу
router.post('/events', checkRole(['admin', 'teacher']), createEvent);

// Отримати подію за ID: дозволено всім ролям, але студенти бачать тільки свої події
router.get('/events/:id', checkRole(['admin', 'teacher', 'student']), getEventById);

// Оновлення події: дозволено адміністратору та викладачу
router.put('/events/:id', checkRole(['admin', 'teacher']), updateEvent);

// Видалення події: дозволено тільки адміністратору
router.delete('/events/:id', checkRole(['admin']), deleteEvent);

module.exports = router;