const router = require('express').Router();
const controller = require('../controllers/expense.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense submission and approval flow
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Submit a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *     responses:
 *       200:
 *         description: Expense submitted successfully
 */

router.post('/', auth, role('EMPLOYEE'), controller.createExpense);



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
 *         description: List of user's expenses
 */

router.get('/my', auth, controller.getMyExpenses);

/**
 * @swagger
 * /api/expenses/pending-approvals:
 *   get:
 *     summary: Get all pending expenses for approval
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending expenses
 */

router.get('/pending-approvals', auth, role('MANAGER'), controller.pendingApprovals);

/**
 * @swagger
 * /api/expenses/{id}/approve:
 *   post:
 *     summary: Approve or reject an expense
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

router.post('/:id/approve', auth, role('MANAGER'), controller.approveExpense);

module.exports = router;
