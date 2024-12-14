const Remainder = require('../models/remainder.model');

//Отримати всі нагадування
const getAllRemainders = async (req, res) => {
    try {
        const remainders = await Remainder.findAll();
        res.status(200).json(remainders);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
};

//Створити нагадування
const createRemainder = async (req, res) => {
    try {
        const { eventId, remainderTime } = req.body;
        const newRemainder = await Remainder.create({ eventId, remainderTime });
        res.status(201).json(newRemainder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Отримати нагадування за ID
const getRemainderById = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if (!remainder) {
            return res.status(404).json({ message: 'remainder not found' });
        }
        res.status(200).json(remainder);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Оновити дані про нагадування
const updateRemainder = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if (!remainder){
            return res.status(404).json({ message: 'Remainder not found'});
        }
        await remainder.update(req.body);
        res.status(200).json(remainder);
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

//Видалити нагадування
const deleteRemainder = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if(!remainder) {
            return res.status(404).json({ message: 'Remainder not found'});
        }
        await remainder.destroy();
        res.status(200).json({ message: 'Remainder deleted successfuly'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllRemainders,
    createRemainder, 
    getRemainderById,
    updateRemainder,
    deleteRemainder,
};