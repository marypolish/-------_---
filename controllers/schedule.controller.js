const Schedule = require('../models/schedule.model');

// Отримати всі записи розкладу
const getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAll();
        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Створити новий запис розкладу
const createSchedule = async (req, res) => {
    try {
        const { eventId, groupId, departmentId, date, duration, location } = req.body;
        const newSchedule = await Schedule.create({ eventId, groupId, departmentId, date, duration, location });
        res.status(201).json(newSchedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати запис розкладу за ID
const getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Оновити запис розкладу
const updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        await schedule.update(req.body);
        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Видалити запис розкладу
const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findByPk(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }
        await schedule.destroy();
        res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllSchedules,
    createSchedule,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
};
