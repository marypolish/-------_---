const express = require('express');
const cors = require('cors');
const {sequelize} = require('./backend/config/config.js');  // Використовуємо конфігурацію з одного файлу
const eventRoutes = require('./backend/routes/events.js'); //Підключення маршруту
const userRoutes = require('./backend/routes/user.js');
const groupRoutes = require('./backend/routes/group.js');
const departmentRoutes = require('./backend/routes/department.js');
const scheduleRoutes = require('./backend/routes/schedule.js');
const calendarRoutes = require('./backend/routes/calendar.js');
const remainderRoutes = require('./backend/routes/remainder.js');

const app = express();
// Дозволити запити з усіх доменів
app.use(cors({
  origin: 'http://localhost:3000', // Фронтенд-адреса
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json()); // Підключаємо middleware для парсингу JSON

// Підключаємо маршрути
app.use('/api', eventRoutes);
app.use('/api', userRoutes);
app.use('/api', groupRoutes);
app.use('/api', departmentRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', calendarRoutes);
app.use('/api', remainderRoutes);

// Синхронізація бази даних
sequelize.sync({ alter: true })
  .then(() => console.log('База даних синхронізована'))
  .catch((error) => console.error('Помилка при синхронізації:', error));

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
