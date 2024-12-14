const express = require('express');
const { getAllDepartments, createDepartment, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/department.controller');

const router = express.Router();

//GET: Отримати всі департаменти
router.get('/departments', getAllDepartments);

//POST: Створити новий департамент
router.post('/departments', createDepartment);

//GET: Отримати департамент за ID
router.get('/departments/:id', getDepartmentById);

//PUT: Оновити департамент
router.put('/departments/:id', updateDepartment);

//DELETE: Видалити департамент
router.delete('/departments/:id', deleteDepartment);

module.exports = router;