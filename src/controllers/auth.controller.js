const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, roles: user.Roles.map(r => r.name) } });
};