const Event = require('../models/event.model');
const { Op } = require('sequelize');

// Отримати події для календаря з фільтрацією (період, роль, група, кафедра)
const getEventsForCalendar = async (req, res) => {
    try {
        const { startDate, endDate, groupId, departmentId, organizerId } = req.query;

        // Перевірка на наявність дати початку і кінця
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Please provide both startDate and endDate' });
        }

        // Створення where умови для фільтрації
        const whereClause = {
            date: {
                [Op.between]: [startDate, endDate],
            },
        };

        // Додавання фільтрації за параметрами
        if (groupId) whereClause.targetGroupId = groupId;
        if (departmentId) whereClause.targetDepartmentId = departmentId;
        if (organizerId) whereClause.organizerId = organizerId;

        // Перевірка ролі користувача
        const userRole = req.user.role;
        if (userRole === 'student') {
            // Якщо користувач — студент, фільтруємо події за його групою
            if (!req.user.groupId) {
                return res.status(403).json({ message: 'Student must belong to a group to see events' });
            }
            whereClause.targetGroupId = req.user.groupId;
        } else if (userRole === 'teacher') {
            // Якщо викладач — фільтруємо події для його кафедри або групи
            if (req.user.departmentId) {
                whereClause.targetDepartmentId = req.user.departmentId;
            }
        }

        const events = await Event.findAll({ where: whereClause });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Додати подію до календаря
const addEventToCalendar = async (req, res) => {
    try {
        const { name, description, date, location, organizerId, targetGroupId, targetDepartmentId } = req.body;

        const newEvent = await Event.create({
            name,
            description,
            date,
            location,
            organizerId,
            targetGroupId,
            targetDepartmentId,
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getEventsForCalendar,
    addEventToCalendar,
};
