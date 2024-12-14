const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

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
        const { name, email, password, role } = req.body;

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

        // Шифрування пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Створення нового користувача
        const newUser = await User.create({ name, email, password: hashedPassword, role });
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

//Вхід користувача
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Знайти користувача за email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Перевірка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Генерація токена
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET, // Секретний ключ з .env
            { expiresIn: '3h' } // Час дії токена
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
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