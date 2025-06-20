const db = require('../models');
const User = db.User;

module.exports = function(requiredRole) {
  return async function(req, res, next) {
    const user = await User.findByPk(req.user.id, { include: db.Role });
    console.log(`User roles: user `);
    const hasRole = user.Roles.some(role => role.name === requiredRole);

    if (!hasRole) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};