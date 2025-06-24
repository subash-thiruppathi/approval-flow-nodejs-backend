const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration and login
 */

// DISABLED: Self-registration is disabled for security. Only admin can onboard users.
// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Authentication]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - email
//  *               - password
//  *               - roles
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *               roles:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *     responses:
//  *       201:
//  *         description: User registered successfully
//  *       400:
//  *         description: Bad request (e.g. user already exists)
//  */
// router.post('/register', controller.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login with JWT or session
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', controller.login);

/**
 * @swagger
 * /api/auth/onboard-user:
 *   post:
 *     summary: Admin-only user onboarding
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - roles
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [EMPLOYEE, MANAGER, ACCOUNTANT, ADMIN]
 *     responses:
 *       201:
 *         description: User onboarded successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied - Admin role required
 */
router.post('/onboard-user', authMiddleware, roleMiddleware('ADMIN'), controller.onboardUser);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied - Admin role required
 */
router.get('/users', authMiddleware, roleMiddleware('ADMIN'), controller.getAllUsers);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset token generated
 *       400:
 *         description: Bad request
 */
router.post('/request-password-reset', controller.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password', controller.resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change password (for logged-in users)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request or incorrect current password
 */
router.post('/change-password', authMiddleware, controller.changePassword);

module.exports = router;
