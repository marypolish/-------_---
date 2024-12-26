const Event = require("../models/event.model.js");
const User = require("../models/user.model.js");
const { Op, fn, col } = require("sequelize");

// Отримати події з фільтрацією (в залежності від ролі)
const getFilteredEventsForUser = async (req, res) => {
  try {
    const { userRole, userId } = req.query;

    // Перевірка наявності ролі та ID користувача
    if (!userRole || !userId) {
      return res
        .status(400)
        .json({ message: "Role and user ID must be provided" });
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
        return res
          .status(403)
          .json({ message: "Teacher must belong to a department" });
      }
      whereClause.targetDepartmentId = teacher.departmentId;
    } else if (userRole === "student") {
      // Студент бачить події тільки для своєї групи
      const student = await User.findByPk(userId);
      if (!student || !student.groupId) {
        return res
          .status(403)
          .json({ message: "Student must belong to a group" });
      }
      whereClause.targetGroupId = student.groupId;
    } else {
      return res
        .status(403)
        .json({ message: "Role is not allowed to access events" });
    }

    // Пошук подій за умовами
    const events = await Event.findAll({ where: whereClause });

    // Якщо немає подій
    if (events.length === 0) {
      return res.status(200).json({ message: "No events found" });
    }

    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
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
      // Якщо роль адміністратор, дозволяємо заповнювати обидва ID
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

const updateEvent = async (req, res) => {
  try {
    const { userRole, userId, departmentId } = req.query; // Отримуємо з параметрів запиту
    const eventId = req.params.eventId;
    const { name, description, location } = req.body; // Без дати, оскільки вона не редагується

    // Знайти подію за ID
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Логування події та користувача
    console.log("Event departmentId:", event.targetDepartmentId);
    console.log("User departmentId:", departmentId);

    // Перевірка прав доступу
    if (userRole === "admin") {
      // Адмін може редагувати всі події
    } else if (userRole === "teacher") {
      // Викладач може редагувати тільки події своєї кафедри
      const teacher = await User.findByPk(userId);
      if (!teacher || teacher.departmentId !== event.targetDepartmentId) {
        return res.status(403).json({
          message: `Teacher with ID ${userId} is not allowed to edit events from department ${event.targetDepartmentId}`,
        });
      }
    } else if (userRole === "student") {
      // Студент не має права редагувати події
      return res.status(403).json({ message: "Students cannot edit events" });
    } else {
      return res
        .status(403)
        .json({ message: "Role is not allowed to update events" });
    }

    // Оновлюємо подію
    event.name = name || event.name;
    event.description = description || event.description;
    event.location = location || event.location;
    // Дата не змінюється

    // Зберігаємо зміни
    await event.save();
    res.status(200).json(event); // Відправляємо оновлену подію в відповіді
  } catch (error) {
    res.status(500).json({ error: error.message }); // Обробка помилок
  }
};

// Видалити подію
const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId; // ID події з параметрів маршруту
    const userRole = req.query.userRole; // Роль користувача (тимчасово через query)

    // Знаходимо подію за ID
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ message: "Подію не знайдено" });
    }

    // Перевірка прав доступу
    if (userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "Недостатньо прав для видалення цієї події" });
    }

    // Видалення події
    await event.destroy();
    return res.status(200).json({ message: "Подію успішно видалено" });
  } catch (error) {
    console.error("Помилка видалення події:", error.message);
    return res.status(500).json({ message: "Помилка сервера", error: error.message });
  }
};



module.exports = {
  getFilteredEventsForUser,
  createEvent,
  updateEvent,
  deleteEvent,
};
