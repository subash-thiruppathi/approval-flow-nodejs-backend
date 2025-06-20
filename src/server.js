const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();