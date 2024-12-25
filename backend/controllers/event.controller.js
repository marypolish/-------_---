const Event = require("../models/event.model.js");
const User = require("../models/user.model.js");
const { Op, fn, col } = require("sequelize");

// Отримати події з фільтрацією (в залежності від ролі)
const getFilteredEventsForUser = async (req, res) => {
  try {
    const { userRole, userId } = req.query;

    // Перевірка наявності ролі та ID користувача
    if (!userRole || !userId) {
      return res.status(400).json({ message: "Role and user ID must be provided" });
    }

    let whereClause = {};

    // Фільтрація за ролями
    if (userRole === "admin") {
      // Адмін отримує всі події
      // Немає додаткових умов для адміна
    } else if (userRole === "teacher") {
      // Вчитель бачить події тільки для своєї кафедри
      const teacher = await User.findByPk(userId);
      if (!teacher || !teacher.departmentId) {
        return res.status(403).json({ message: "Teacher must belong to a department" });
      }
      whereClause.targetDepartmentId = teacher.departmentId;
    } else if (userRole === "student") {
      // Студент бачить події тільки для своєї групи
      const student = await User.findByPk(userId);
      if (!student || !student.groupId) {
        return res.status(403).json({ message: "Student must belong to a group" });
      }
      whereClause.targetGroupId = student.groupId;
    } else {
      return res.status(403).json({ message: "Role is not allowed to access events" });
    }

    // Пошук подій за умовами
    const events = await Event.findAll({ where: whereClause });

    // Якщо немає подій
    if (events.length === 0) {
      return res.status(200).json({ message: "No events found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};

// Створити нову подію
const createEvent = async (req, res) => {
  try {
    const { userRole, userId } = req.query;
    const {
      name,
      description,
      date,
      location,
      targetGroupId,
      targetDepartmentId,
    } = req.body;

    if (!name || !description || !date || !location) {
      return res
        .status(400)
        .json({ message: "Missing required event details" });
    }

    if (userRole === "admin") {
      const newEvent = await Event.create({
        name,
        description,
        date,
        location,
        organizerId: userId,
        targetGroupId: targetGroupId || null,
        targetDepartmentId: targetDepartmentId || null,
      });
      return res.status(201).json(newEvent);
    } else if (userRole === "teacher") {
      const teacher = await User.findByPk(userId);
      if (!teacher || !teacher.departmentId) {
        return res
          .status(403)
          .json({ message: "Teacher must belong to a department" });
      }
      const newEvent = await Event.create({
        name,
        description,
        date,
        location,
        organizerId: userId,
        targetDepartmentId: teacher.departmentId,
        targetGroupId,
      });
      return res.status(201).json(newEvent);
    } else if (userRole === "student") {
      const student = await User.findByPk(userId);
      if (!student || !student.groupId) {
        return res
          .status(403)
          .json({ message: "Student must belong to a group" });
      }
      const newEvent = await Event.create({
        name,
        description,
        date,
        location,
        organizerId: userId,
        targetGroupId: student.groupId,
      });
      return res.status(201).json(newEvent);
    } else {
      return res
        .status(403)
        .json({ message: "User role not allowed to create events" });
    }
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
      return res.status(404).json({ message: "Event not found" });
    }

    const userRole = req.query.userRole;
    const userId = req.query.userId;

    if (
      userRole === "admin" ||
      (userRole === "teacher" && event.organizerId === userId)
    ) {
      event.name = name || event.name;
      event.description = description || event.description;
      event.date = date || event.date;
      event.location = location || event.location;

      await event.save();
      res.status(200).json(event);
    } else {
      res
        .status(403)
        .json({ message: "Insufficient permissions to update this event" });
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
      return res.status(404).json({ message: "Event not found" });
    }

    const userRole = req.query.userRole;

    if (userRole === "admin") {
      await event.destroy();
      res.status(200).json({ message: "Event deleted successfully" });
    } else {
      res
        .status(403)
        .json({ message: "Insufficient permissions to delete this event" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Отримати події за однією датою
const getEventsBySingleDate = async (req, res) => {
  try {
    const { userRole, userId, date, departmentId, groupId } = req.query;

    if (!userRole || !userId || !date) {
      return res
        .status(400)
        .json({ message: "Role, user ID, and date must be provided" });
    }

    // Переводимо дату в початок і кінець дня для порівняння
    const startDate = moment(date).startOf('day').toISOString(); // Початок дня
    const endDate = moment(date).endOf('day').toISOString(); // Кінець дня

    const whereClause = {
      date: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Роль користувача
    if (userRole === "admin") {
      whereClause.organizerId = userId;
    } else if (userRole === "teacher") {
      if (!departmentId) {
        return res.status(400).json({ message: "Department ID must be provided for teacher" });
      }
      whereClause.targetDepartmentId = departmentId;
    } else if (userRole === "student") {
      if (!groupId) {
        return res.status(400).json({ message: "Group ID must be provided for student" });
      }
      whereClause.targetGroupId = groupId;
    } else {
      return res.status(403).json({ message: "Role is not allowed to access events" });
    }

    // Запит до бази даних для отримання подій
    const events = await Event.findAll({ where: whereClause });

    if (events.length === 0) {
      return res.status(200).json({ message: "No events found for the selected date" });
    }

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error: error.message });
  }
};


module.exports = {
  getFilteredEventsForUser,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsBySingleDate,
};
