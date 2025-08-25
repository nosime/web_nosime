const jwt = require('jsonwebtoken');
const config = require('../config/jwt.config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user; // Gắn thông tin người dùng vào request
    next();
  });
}

module.exports = authMiddleware;
