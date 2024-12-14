const Event = require('../models/event.model');
const Group = require('../models/group.model');
const Department = require('../models/department.model');
const jwt = require('jsonwebtoken');

// Middleware для перевірки ролі
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Отримати токен з заголовка
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Розшифрувати токен
            req.user = decoded; // Зберегти дані користувача з токена в req.user

            if (!requiredRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next(); // Передати запит далі, якщо роль відповідає вимогам
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};

// Отримати всі події
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Створити нову подію
const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, targetGroupId, notifyTime } = req.body;

        // Якщо роль "викладач", перевіряємо, чи подія стосується його кафедри
        if (req.user.role === 'teacher') {
            const department = await Department.findByPk(req.user.departmentId);
            if (!department) {
                return res.status(403).json({ message: 'Access denied: You are not assigned to any department.' });
            }
            req.body.organizerId = req.user.id; // Встановлюємо організатора
        }

        // Адміністратор створює подію без обмежень
        if (req.user.role === 'admin') {
            req.body.organizerId = req.user.id; // Встановлюємо організатора
        }

        const newEvent = await Event.create({
            name,
            description,
            date,
            location,
            organizerId: req.body.organizerId,
            targetGroupId,
            notifyTime,
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати подію за ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Перевірка доступу для студента
        if (req.user.role === 'student' && req.user.groupId !== event.targetGroupId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Оновити подію
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Викладачі можуть редагувати тільки події своєї кафедри
        if (req.user.role === 'teacher' && event.organizerId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await event.update(req.body);
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Видалити подію
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await event.destroy();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати всі події для певної групи
const getGroupEvents = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        const events = await Event.findAll({ where: { targetGroupId: groupId } });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати всі події для певної кафедри
const getDepartmentEvents = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const department = await Department.findByPk(departmentId);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        const events = await Event.findAll({ where: { targetDepartmentId: departmentId } });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    checkRole,
    getAllEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    getGroupEvents,
    getDepartmentEvents,
};
