const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const analyticsController = require('../controllers/analytics.controller');

// Mount middleware for all routes in this file
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

// Analytics routes
router.get('/summary', analyticsController.getSummary);
router.get('/expenses-by-category', analyticsController.getExpensesByCategory);
router.get('/expenses-by-status', analyticsController.getExpensesByStatus);
router.get('/approval-times', analyticsController.getApprovalTimes);
router.get('/top-spenders', analyticsController.getTopSpenders);

module.exports = router;
