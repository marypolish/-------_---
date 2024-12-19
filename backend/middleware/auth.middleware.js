const jwt = require('jsonwebtoken');

// Middleware для перевірки ролі
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            // Отримуємо токен з заголовка
            const token = req.headers.authorization?.split(' ')[1]; 
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            // Розшифровуємо токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 
            req.user = decoded; // Зберігаємо дані користувача в req.user

            // Перевірка ролі
            if (!requiredRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access denied: Incorrect role' });
            }

            // Якщо доступ дозволено, передаємо запит далі
            next(); 
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};

module.exports = checkRole;
