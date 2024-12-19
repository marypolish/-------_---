const Department = require('../models/department.model');

//Отримати всі кафедри
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll();
        res.status(200).json(departments);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
};

//Створити кафедру
const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newDepartment = await Department.create({ name, description });
        res.status(201).json(newDepartment);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Отримати кафедру за ID
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'department not found' });
        }
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Оновити дані про кафедру
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department){
            return res.status(404).json({ message: 'Department not found'});
        }
        await department.update(req.body);
        res.status(200).json(department);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Видалити кафедру
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if(!department) {
            return res.status(404).json({ message: 'Department not found'});
        }
        await department.destroy();
        res.status(200).json({ message: 'Department deleted successfuly'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllDepartments,
    createDepartment, 
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};