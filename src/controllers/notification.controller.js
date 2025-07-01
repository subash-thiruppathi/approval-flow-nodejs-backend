const NotificationService = require('../services/notification.service');
const db = require('../models');
const { DeviceToken } = db;

// Register device token for push notifications
exports.registerDeviceToken = async (req, res) => {
  try {
    const { token, device_type, device_info } = req.body;
    const userId = req.user.id;

    if (!token || !device_type) {
      return res.status(400).json({ 
        error: 'Token and device_type are required' 
      });
    }

    const deviceToken = await NotificationService.registerDeviceToken(
      userId, 
      token, 
      device_type, 
      device_info
    );

    res.json({ 
      message: 'Device token registered successfully',
      deviceToken: {
        id: deviceToken.id,
        device_type: deviceToken.device_type,
        is_active: deviceToken.is_active
      }
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId, 
      parseInt(limit), 
      parseInt(offset)
    );

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await NotificationService.markNotificationAsRead(
      parseInt(id), 
      userId
    );

    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await NotificationService.markAllNotificationsAsRead(userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Notification } = db;

    const unreadCount = await Notification.count({
      where: { 
        recipient_id: userId,
        is_read: false 
      }
    });

    res.json({ unread_count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user's device tokens
exports.getDeviceTokens = async (req, res) => {
  try {
    const userId = req.user.id;

    const deviceTokens = await DeviceToken.findAll({
      where: { user_id: userId },
      attributes: ['id', 'device_type', 'is_active', 'last_used', 'createdAt'],
      order: [['last_used', 'DESC']]
    });

    res.json({ device_tokens: deviceTokens });
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove device token
exports.removeDeviceToken = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deviceToken = await DeviceToken.findOne({
      where: { 
        id: parseInt(id),
        user_id: userId 
      }
    });

    if (!deviceToken) {
      return res.status(404).json({ error: 'Device token not found' });
    }

    await deviceToken.update({ is_active: false });

    res.json({ message: 'Device token removed successfully' });
  } catch (error) {
    console.error('Error removing device token:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test notification (for development/testing purposes)
exports.testNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, body, type = 'test' } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Title and body are required' 
      });
    }

    // Send test notification
    await NotificationService.sendPushNotification(
      userId,
      {
        title,
        body,
        icon: '/icons/test.png',
        type
      }
    );

    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get notification settings (placeholder for future implementation)
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Default notification settings
    const settings = {
      expense_submitted: true,
      expense_approved: true,
      expense_rejected: true,
      expense_fully_approved: true,
      email_notifications: true,
      push_notifications: true
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update notification settings (placeholder for future implementation)
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    // In a real implementation, you would save these settings to the database
    // For now, just return success
    res.json({ 
      message: 'Notification settings updated successfully',
      settings 
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: error.message });
  }
};
