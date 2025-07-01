const db = require('../models');
const User = db.User;

module.exports = function(requiredRole) {
  return async function(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: db.Role
      });

      if (!user || !user.Roles || user.Roles.length === 0) {
        console.log("No roles found for user");
        return res.status(403).json({ error: 'Access denied' });
      }

      const roleNames = user.Roles.map(role => role.name);

      // console.log("User roles:", roleNames);
      // console.log(`Required role: ${requiredRole}`);

      const hasRole = roleNames.includes(requiredRole);
      // console.log("Has required role?", hasRole);  // Should be true
      if (!hasRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (err) {
      console.error("Role check failed:", err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
