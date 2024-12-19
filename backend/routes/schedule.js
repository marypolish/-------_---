const express = require('express');
const { getAllSchedules, createSchedule, getScheduleById, updateSchedule, deleteSchedule, } = require('../backend/controllers/schedule.controller');

const router = express.Router();

// Маршрути для розкладу
router.get('/schedules', getAllSchedules); // Отримати всі записи
router.post('/schedules', createSchedule); // Створити запис
router.get('/schedules/:id', getScheduleById); // Отримати запис за ID
router.put('/schedules/:id', updateSchedule); // Оновити запис
router.delete('/schedules/:id', deleteSchedule); // Видалити запис

module.exports = router;
