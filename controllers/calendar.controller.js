const Event = require('../models/event.model');
const { Op } = require('sequelize');

// Отримати всі події для певного періоду
const getEventsForCalendar = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Параметри у форматі YYYY-MM-DD

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide both startDate and endDate' });
        }

        const events = await Event.findAll({
            where: {
                date: {
                    [Op.between]: [startDate, endDate],
                },
            },
        });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати всі події з фільтрацією
const getFilteredEvents = async (req, res) => {
    try {
        const { groupId, departmentId, organizerId } = req.query;

        const whereClause = {};

        if (groupId) whereClause.targetGroupId = groupId;
        if (departmentId) whereClause.targetDepartmentId = departmentId;
        if (organizerId) whereClause.organizerId = organizerId;

        const events = await Event.findAll({ where: whereClause });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Додати подію (із зазначенням координат для відображення на календарі)
const addEventToCalendar = async (req, res) => {
    try {
        const { name, description, date, location, organizerId, targetGroupId, targetDepartmentId, notifyTime } = req.body;

        const newEvent = await Event.create({
            name,
            description,
            date,
            location,
            organizerId,
            targetGroupId,
            targetDepartmentId,
            notifyTime,
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEventsForCalendar,
    getFilteredEvents,
    addEventToCalendar,
};
