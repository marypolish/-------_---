const Remainder = require('../models/remainder.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const nodemailer = require('nodemailer');

// Отримати всі нагадування
const getAllRemainders = async (req, res) => {
    try {
        const remainders = await Remainder.findAll();
        res.status(200).json(remainders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Створити нагадування
const createRemainder = async (req, res) => {
    try {
        const { eventId, remainderTime } = req.body;

        // Отримати ID авторизованого користувача з токена
        const userId = req.user.id; // req.user заповнюється middleware для токена

        // Перевірити, чи існує подія
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Перевірити, чи є цей користувач організатором події
        if (event.organizerId !== userId) {
            return res.status(403).json({ message: 'Access denied. You are not the organizer of this event.' });
        }

        // Створити нагадування
        const newRemainder = await Remainder.create({ eventId, remainderTime });
        res.status(201).json(newRemainder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Отримати нагадування за ID
const getRemainderById = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if (!remainder) {
            return res.status(404).json({ message: 'Remainder not found' });
        }
        res.status(200).json(remainder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Оновити нагадування
const updateRemainder = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if (!remainder) {
            return res.status(404).json({ message: 'Remainder not found' });
        }
        await remainder.update(req.body);
        res.status(200).json(remainder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Видалити нагадування
const deleteRemainder = async (req, res) => {
    try {
        const remainder = await Remainder.findByPk(req.params.id);
        if (!remainder) {
            return res.status(404).json({ message: 'Remainder not found' });
        }
        await remainder.destroy();
        res.status(200).json({ message: 'Remainder deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const sendRemainderEmail = async (remainder) => {
    try {
        // Знайти подію, до якої прив’язане нагадування
        const event = await Event.findByPk(remainder.eventId);
        if (!event) return;

        // Знайти користувача, який є організатором події
        const user = await User.findByPk(event.organizerId);
        if (!user) return;

        // Відправити нагадування на email користувача
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // Email організатора події
            subject: `Reminder: ${event.name}`,
            text: `Hello ${user.name},\n\nThis is a reminder for your event "${event.name}" scheduled on ${event.date}.\n\nBest regards,\nSmart Calendar Team`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Remainder email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

module.exports = { 
    getAllRemainders,
    createRemainder, 
    getRemainderById,
    updateRemainder,
    deleteRemainder,
    sendRemainderEmail
};