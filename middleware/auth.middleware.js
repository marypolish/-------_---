const jwt = require('jsonwebtoken');

// Middleware для перевірки ролі
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1]; // Отримати токен з заголовка
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Розшифрувати токен
            req.user = decoded; // Зберегти дані користувача з токена в req.user

            if (!requiredRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next(); // Передати запит далі, якщо роль відповідає вимогам
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};

module.exports = checkRole;
