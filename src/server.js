const app = require('./app');
const db = require('./models');
const seedRoles = require('./seeders/roles.seeder');
const seedStatuses = require('./seeders/status.seeder');

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log('Database synchronized successfully (tables recreated)');
    
    // Seed roles and statuses
    await seedRoles();
    await seedStatuses();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('\n=== Multi-Level Expense Approval System ===');
      console.log('Approval Flow: Employee → Manager → Accountant → Admin');
      console.log('API Documentation: http://localhost:' + PORT + '/api-docs');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
