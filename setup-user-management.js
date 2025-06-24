const db = require('./src/models');
const { createRoles } = require('./src/seeders/roles.seeder');
const { createStatuses } = require('./src/seeders/status.seeder');
const { createAdminUser } = require('./src/seeders/admin.seeder');

const setupUserManagement = async () => {
  try {
    console.log('🚀 Setting up user management system...\n');

    // Sync database with new User model fields
    console.log('📊 Syncing database...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully\n');

    // Create roles
    console.log('👥 Creating roles...');
    await createRoles();
    console.log('✅ Roles created successfully\n');

    // Create statuses
    console.log('📋 Creating statuses...');
    await createStatuses();
    console.log('✅ Statuses created successfully\n');

    // Create admin user
    console.log('👤 Creating admin user...');
    await createAdminUser();
    console.log('✅ Admin user setup completed\n');

    console.log('🎉 User management system setup completed successfully!');
    console.log('\n📝 Summary:');
    console.log('- Self-registration is now DISABLED for security');
    console.log('- Only admins can onboard new users');
    console.log('- Password reset functionality is available');
    console.log('- Default admin credentials:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('  ⚠️  Please change the admin password after first login!');
    console.log('\n🔗 New API Endpoints:');
    console.log('- POST /api/auth/onboard-user (Admin only)');
    console.log('- GET /api/auth/users (Admin only)');
    console.log('- POST /api/auth/request-password-reset');
    console.log('- POST /api/auth/reset-password');
    console.log('- POST /api/auth/change-password');

  } catch (error) {
    console.error('❌ Error setting up user management system:', error);
    process.exit(1);
  }
};

// Run setup
setupUserManagement().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
