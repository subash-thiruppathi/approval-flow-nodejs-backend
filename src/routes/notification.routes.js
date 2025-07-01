const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push notification utilities
 */


// All notification routes require authentication
router.use(authMiddleware);

// Device token management
router.post('/device-token', notificationController.registerDeviceToken);
router.get('/device-tokens', notificationController.getDeviceTokens);
router.delete('/device-token/:id', notificationController.removeDeviceToken);

// Notification management
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Notification settings
router.get('/settings', notificationController.getNotificationSettings);
router.put('/settings', notificationController.updateNotificationSettings);

// Test notification (for development)
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Push notification utilities
 */

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Send a test push notification
 *     tags: [Notifications]
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
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 example: Test Notification
 *               body:
 *                 type: string
 *                 example: This is a test push notification.
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/test', notificationController.testNotification);


module.exports = router;