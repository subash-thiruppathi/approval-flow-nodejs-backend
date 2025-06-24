const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../models');
const { User, Role } = db;

exports.register = async (req, res) => {
  const { name, email, password, roles } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  if (roles && roles.length > 0) {
    const roleRecords = await Role.findAll({ where: { name: roles } });
    await user.setRoles(roleRecords);
  } else {
    const defaultRole = await Role.findOne({ where: { name: 'EMPLOYEE' } });
    await user.setRoles([defaultRole]);
  }

  res.json({ message: 'User registered successfully' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email }, include: Role });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    console.error('Invalid credentials:', email);
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      roles: user.Roles.map(r => r.name),
      is_first_login: user.is_first_login
    } 
  });
};

// Generate random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Admin-only user onboarding
exports.onboardUser = async (req, res) => {
  try {
    const { name, email, roles } = req.body;

    // Validate required fields
    if (!name || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ 
        error: 'Name, email, and at least one role are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate roles exist
    const validRoles = ['EMPLOYEE', 'MANAGER', 'ACCOUNTANT', 'ADMIN'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ 
        error: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }

    // Generate random password
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      is_first_login: true,
      created_by: req.user.id
    });

    // Assign roles
    const roleRecords = await Role.findAll({ where: { name: roles } });
    await user.setRoles(roleRecords);

    // Return user info with temporary password (in real app, send via email)
    res.status(201).json({
      message: 'User onboarded successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roles,
        temporary_password: randomPassword // In production, send this via email
      }
    });

  } catch (error) {
    console.error('Error onboarding user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, attributes: ['name'] }],
      attributes: { exclude: ['password', 'reset_token'] },
      order: [['createdAt', 'DESC']]
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.Roles.map(role => role.name),
      is_first_login: user.is_first_login,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await user.update({
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });

    // In production, send email with reset link
    // For now, return the token (remove this in production)
    res.json({
      message: 'Password reset token generated',
      reset_token: resetToken, // Remove this in production
      expires_at: resetTokenExpires
    });

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      where: {
        reset_token: token,
        reset_token_expires: {
          [db.Sequelize.Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update user password and clear reset token
    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
      is_first_login: false
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change password (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await user.update({
      password: hashedPassword,
      is_first_login: false
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};
