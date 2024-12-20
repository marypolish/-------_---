const express = require('express');
const cors = require('cors');
const {sequelize} = require('./config/config.js');
const eventRoutes = require('./routes/events.js');
const userRoutes = require('./routes/user.js');
const groupRoutes = require('./routes/group.js');
const departmentRoutes = require('./routes/department.js');
const scheduleRoutes = require('./routes/schedule.js');
const calendarRoutes = require('./routes/calendar.js');
const remainderRoutes = require('./routes/remainder.js');

const app = express();

// Дозволяємо запити з усіх доменів
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Дозволяємо кілька джерел
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json()); // Підключаємо middleware для парсингу JSON

// Статичні файли
app.use(express.static('frontend')); // Це дозволить серверу сервувати файли з папки "frontend"

// Підключаємо маршрути
app.use('/api', eventRoutes);
app.use('/api', userRoutes);
app.use('/api', groupRoutes);
app.use('/api', departmentRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', calendarRoutes);
app.use('/api', remainderRoutes);

// Синхронізація бази даних
sequelize.sync({/* alter: true */})
  .then(() => console.log('База даних синхронізована'))
  .catch((error) => console.error('Помилка при синхронізації:', error));

app.listen(5500, () => {
  console.log('Server is running on port 5500');
});
