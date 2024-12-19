const express = require('express');
const { getAllGroups, createGroup, getGroupById, updateGroup, deleteGroup } = require('../backend/controllers/group.controller');

const router = express.Router();

//GET: Отримати всі групи
router.get('/groups', getAllGroups);

//POST: Створити нову групу
router.post('/groups', createGroup);

//GET: Отримати групу за ID
router.get('/groups/:id', getGroupById);

//PUT: Оновити групу
router.put('/groups/:id', updateGroup);

//DELETE: Видалити групу 
router.delete('/groups/:id', deleteGroup);

module.exports = router;