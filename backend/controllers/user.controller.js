const User = require('../models/user.model');
const Group = require('../models/group.model');
const Department = require('../models/department.model');

//Отримати всіх користувачів
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
};

//Створити користувача
const registerUser = async (req, res) => {
    try {
        const { email, password, name, role, departmentName, groupName } = req.body;

        // Перевірка на валідну роль
        const validRoles = ["student", "teacher", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Перевірка, чи існує вже користувач із такою поштою
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Обробка кафедри для викладача
        let departmentId = null;
        if (role === 'teacher') {
            const department = await Department.findOne({ where: { name: departmentName } });
            if (!department) {
                return res.status(400).json({ message: 'Department not found' });
            }
            departmentId = department.id; // Отримуємо ID кафедри
        }

        // Якщо користувач — студент, шукаємо групу за її назвою
        let groupId = null;
        if (role === 'student') {
            const group = await Group.findOne({ where: { name: groupName } });
            if (!group) {
                return res.status(400).json({ message: 'Group not found' });
            }
            groupId = group.id; // отримуємо ID групи
        }

        const newUser = await User.create({ email, password, name, role, departmentId, groupId });
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Вхід користувача
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Знайти користувача за email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Перевірка пароля (без хешування)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Повернення даних користувача
        return res.status(200).json({
            success: true,
            message: "Вхід успішний.",
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                departmentId: user.departmentId,  // ID кафедри (для викладачів)
                groupId: user.groupId,  // ID групи (для студентів)
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Отримати користувача за ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Оновити дані про користувача 
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user){
            return res.status(404).json({ message: 'User not found'});
        }
        await user.update(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Видалити користувача 
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if(!user) {
            return res.status(404).json({ message: 'Event not found'});
        }
        await user.destroy();
        res.status(200).json({ message: 'User deleted successfuly'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllUsers,
    registerUser, 
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
};