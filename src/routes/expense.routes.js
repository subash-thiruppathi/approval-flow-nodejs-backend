const router = require('express').Router();
const controller = require('../controllers/expense.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Multi-level expense approval flow (Manager → Accountant → Admin)
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Submit a new expense with receipt upload
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Receipt image file (jpg, png, etc.)
 *     responses:
 *       200:
 *         description: Expense submitted successfully
 */
router.post('/', auth, role('EMPLOYEE'), upload.single('receipt'), controller.createExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses (Admin only)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all expenses
 */
router.get('/', auth, role('ADMIN'), controller.getAllExpenses);

/**
 * @swagger
 * /api/expenses/my:
 *   get:
 *     summary: Get expenses submitted by logged-in user
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's expenses with approval history
 */
router.get('/my', auth, controller.getMyExpenses);

/**
 * @swagger
 * /api/expenses/pending-approvals:
 *   get:
 *     summary: Get pending expenses for current user's approval level
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses pending approval at user's level
 */
router.get('/pending-approvals', auth, controller.getPendingApprovals);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense details by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Expense details with approval history
 */
router.get('/:id', auth, controller.getExpenseById);

/**
 * @swagger
 * /api/expenses/{id}/approve:
 *   post:
 *     summary: Approve or reject an expense at current level
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Expense ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Expense status updated
 */
router.post('/:id/approve', auth, controller.approveExpense);

module.exports = router;
