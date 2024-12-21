const Event = require('../models/event.model');
const User = require('../models/user.model');

// Отримати події з фільтрацією (в залежності від ролі)
const getFilteredEventsForUser = async (req, res) => {
    try {
        const userRole = req.user.role; // роль користувача
        const userId = req.user.id; // id користувача

        const { groupId, departmentId, organizerId } = req.query;
        const whereClause = {};

        if (groupId) whereClause.targetGroupId = groupId;
        if (departmentId) whereClause.targetDepartmentId = departmentId;
        if (organizerId) whereClause.organizerId = organizerId;

        // Фільтрація в залежності від ролі користувача
        if (userRole === 'admin') {
            // Адміністратор має доступ до всіх подій
            whereClause.organizerId = organizerId || whereClause.organizerId;
        } else if (userRole === 'teacher') {
            // Викладач може бачити події для його кафедри чи групи
            const teacher = await User.findByPk(userId);
            if (teacher && teacher.departmentId) {
                whereClause.targetDepartmentId = teacher.departmentId;
            }
        } else if (userRole === 'student') {
            // Студент може бачити події лише для його групи
            const student = await User.findByPk(userId);
            if (student && student.groupId) {
                whereClause.targetGroupId = student.groupId;
            }
        } else {
            return res.status(403).json({ message: 'Недостатньо прав для доступу до подій' });
        }

        const events = await Event.findAll({
            where: whereClause,
        });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Помилка при отриманні подій', error: error.message });
    }
};

// Створити нову подію
const createEvent = async (req, res) => {
    try {
        const { name, description, date, location, organizerId, targetGroupId, targetDepartmentId } = req.body;

        const organizer = await User.findByPk(organizerId);
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

        // Перевірки для ролей
        if (organizer.role === 'teacher') {
            const teacher = await User.findByPk(organizerId);
            if (teacher.departmentId !== targetDepartmentId) {
                return res.status(403).json({ message: 'Teacher can only create events for their own department' });
            }
        } else if (organizer.role === 'student') {
            if (organizer.groupId !== targetGroupId) {
                return res.status(403).json({ message: 'Student can only create events for their own group' });
            }
        }

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

// Оновити подію
const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const { name, description, date, location } = req.body;

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Перевірка доступу до редагування події
        const userRole = req.user.role;
        const userId = req.user.id;
        if (userRole === 'admin' || (userRole === 'teacher' && event.organizerId === userId)) {
            event.name = name || event.name;
            event.description = description || event.description;
            event.date = date || event.date;
            event.location = location || event.location;

            await event.save();
            res.status(200).json(event);
        } else {
            res.status(403).json({ message: 'Недостатньо прав для редагування цієї події' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Видалити подію
const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Перевірка доступу до видалення події (тільки адмін може видаляти)
        const userRole = req.user.role;
        if (userRole === 'admin') {
            await event.destroy();
            res.status(200).json({ message: 'Event deleted successfully' });
        } else {
            res.status(403).json({ message: 'Недостатньо прав для видалення цієї події' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getFilteredEventsForUser,
    createEvent,
    updateEvent,
    deleteEvent,
};
