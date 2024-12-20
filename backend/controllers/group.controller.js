const Group = require('../models/group.model');

//Отримати всі групи
const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json(groups);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
};

//Створити групу
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const newGroup = await Group.create({ name });
        res.status(201).json(newGroup);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Отримати групу за ID
const getGroupById = async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Оновити дані про групу 
const updateGroup = async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id);
        if (!group){
            return res.status(404).json({ message: 'Group not found'});
        }
        await group.update(req.body);
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Видалити групу
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id);
        if(!group) {
            return res.status(404).json({ message: 'Group not found'});
        }
        await group.destroy();
        res.status(200).json({ message: 'Group deleted successfuly'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllGroups,
    createGroup, 
    getGroupById,
    updateGroup,
    deleteGroup,
};