const express = require('express');
const { getAllRemainders, createRemainder, getRemainderById, updateRemainder, deleteRemainder } = require('../controllers/remainder.controller');

const authMiddleware = require('../middleware/auth.middleware'); // Для захисту роутів

const router = express.Router();

// Отримати всі нагадування (тільки для адміністратора)
router.get('/remainders',  getAllRemainders);

// Створити нове нагадування (тільки для авторизованого користувача)
router.post('/remainders',  createRemainder);

// Отримати нагадування за ID (тільки для авторизованого користувача)
router.get('/remainders/:id', getRemainderById);

// Оновити нагадування (тільки організатор або адміністратор)
router.put('/remainders/:id',  updateRemainder);

// Видалити нагадування (тільки адміністратор)
router.delete('/remainders/:id', deleteRemainder);

module.exports = router;
