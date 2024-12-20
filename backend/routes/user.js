const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser, registerUser, loginUser } = require('../controllers/user.controller');

const router = express.Router();

//GET: Отримати всіх користувачів
router.get('/users', getAllUsers);

//POST: Зареєструвати користувача
router.post('/users', registerUser);

// POST: Вхід користувача
router.post('/login', loginUser);

//GET: Отримати користувача за ID
router.get('/users/:id', getUserById);

//PUT: Оновити дані про користувача 
router.put('/users/:id', updateUser);

//DELETE: Видалити користувача
router.delete('/users/:id', deleteUser);

module.exports = router;