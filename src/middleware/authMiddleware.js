const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

module.exports = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};