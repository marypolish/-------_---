const Event = require('../models/event.model');
const User = require('../models/user.model');
const Group = require('../models/group.model');
const Department = require('../models/department.model');

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
        const { name, description, date, location, organizerId, targetGroupId, targetDepartmentId } = req.body;

        // Знайти організатора
        const organizer = await User.findByPk(organizerId);
        if (!organizer) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

        // Якщо організатор — викладач, перевірити наявність кафедри
        if (organizer.role === 'teacher'){
            if (!organizer.departmentId) {
            return res.status(400).json({ message: 'Teacher must belong to a department to create events' });
            }

            //Викладач може створювати події тільки для своєї кафедри
            if (organizer.departmentId !== targetDepartmentId) {
                return res.status(403).json({ message: 'Teacher can only create events for their own department' });
            }
        }

        // Якщо організатор — студент, перевірити наявність групи
        if (organizer.role === 'student') {
            if (!organizer.groupId) {
                return res.status(400).json({ message: 'Student must belong to a group to create events' });
            }

            // Студент може створювати події тільки для своєї групи
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
        });

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати подію за ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id); // Отримуємо подію за ID

        // Перевірка доступу
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Логування значень для перевірки
        console.log('User Group ID:', req.user.groupId); // Вивести ID групи користувача
        console.log('Event Target Group ID:', event.targetGroupId); // Вивести ID групи події

        // Перевірка для студента
        if (req.user.role === 'student') {
            // Студент може отримати доступ лише до подій своєї групи
            if (!req.user.groupId) {
                return res.status(403).json({ message: 'Access denied: Missing groupId' });
            }
            if (req.user.groupId !== event.targetGroupId) {
                return res.status(403).json({ message: 'Access denied: Group mismatch' });
            }
        } else if (req.user.role === 'teacher') {
            // Викладач має доступ до всіх подій
            console.log('Teacher accessing event:', req.user.id);
        } else if (req.user.role === 'admin') {
            // Адміністратор має доступ до всіх подій
            console.log('Admin accessing event:', req.user.id);
        } else {
            // Відмова доступу для інших ролей
            return res.status(403).json({ message: 'Access denied: Role not allowed' });
        }

        // Якщо доступ дозволено, відправляємо подію
        return res.status(200).json(event);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
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

        // Дозволено тільки адміністраторам
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
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
    getAllEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    getGroupEvents,
    getDepartmentEvents,
};
