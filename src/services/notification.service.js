const { messaging } = require('../config/firebase.config');
const db = require('../models');
const { Notification, DeviceToken, User, Role, Expense } = db;

class NotificationService {
  // Notification icons configuration
  static NOTIFICATION_ICONS = {
    EXPENSE_SUBMITTED: {
      icon: '💰',
      color: '#FFA500',
      webIcon: '/icons/expense-submitted.png'
    },
    EXPENSE_APPROVED: {
      icon: '✅',
      color: '#32CD32',
      webIcon: '/icons/expense-approved.png'
    },
    EXPENSE_REJECTED: {
      icon: '❌',
      color: '#DC143C',
      webIcon: '/icons/expense-rejected.png'
    },
    EXPENSE_FULLY_APPROVED: {
      icon: '🎉',
      color: '#4CAF50',
      webIcon: '/icons/expense-fully-approved.png'
    }
  };

  // Get notification recipients based on expense status and approval level
  static async getNotificationRecipients(expense, notificationType) {
    const recipients = [];

    switch (notificationType) {
      case 'EXPENSE_SUBMITTED':
        // Notify managers for new expense submissions
        const managers = await User.findAll({
          include: [{
            model: Role,
            where: { name: 'MANAGER' }
          }]
        });
        recipients.push(...managers);
        break;

      case 'EXPENSE_APPROVED':
        if (expense.current_approval_level === 2) {
          // Manager approved, notify accountants
          const accountants = await User.findAll({
            include: [{
              model: Role,
              where: { name: 'ACCOUNTANT' }
            }]
          });
          recipients.push(...accountants);
        } else if (expense.current_approval_level === 3) {
          // Accountant approved, notify admins
          const admins = await User.findAll({
            include: [{
              model: Role,
              where: { name: 'ADMIN' }
            }]
          });
          recipients.push(...admins);
        }
        break;

      case 'EXPENSE_FULLY_APPROVED':
      case 'EXPENSE_REJECTED':
        // Notify the original requester
        const requester = await User.findByPk(expense.requested_by);
        if (requester) {
          recipients.push(requester);
        }
        break;
    }

    return recipients;
  }

  // Create notification message based on type and expense
  static createNotificationMessage(notificationType, expense, approverName = null) {
    const iconConfig = this.NOTIFICATION_ICONS[notificationType];
    
    switch (notificationType) {
      case 'EXPENSE_SUBMITTED':
        return {
          title: `${iconConfig.icon} New Expense Submitted`,
          body: `${expense.title} - $${expense.amount} requires your approval`,
          icon: iconConfig.webIcon
        };

      case 'EXPENSE_APPROVED':
        const nextApprover = expense.current_approval_level === 2 ? 'Accountant' : 'Admin';
        return {
          title: `${iconConfig.icon} Expense Approved`,
          body: `${expense.title} approved by ${approverName}. Pending ${nextApprover} approval.`,
          icon: iconConfig.webIcon
        };

      case 'EXPENSE_REJECTED':
        return {
          title: `${iconConfig.icon} Expense Rejected`,
          body: `Your expense "${expense.title}" has been rejected by ${approverName}`,
          icon: iconConfig.webIcon
        };

      case 'EXPENSE_FULLY_APPROVED':
        return {
          title: `${iconConfig.icon} Expense Fully Approved`,
          body: `Congratulations! Your expense "${expense.title}" - $${expense.amount} has been fully approved`,
          icon: iconConfig.webIcon
        };

      default:
        return {
          title: 'Expense Update',
          body: `Your expense "${expense.title}" has been updated`,
          icon: '/icons/default.png'
        };
    }
  }

  // Send push notification to specific user
  static async sendPushNotification(userId, notificationData, expenseData = null) {
    try {
      // Send real-time notification via Socket.IO
      this.sendRealTimeNotification(userId, notificationData, expenseData);
  
      // Get user's device tokens
      const deviceTokens = await DeviceToken.findAll({
        where: { 
          user_id: userId,
          is_active: true 
        }
      });
  
      if (deviceTokens.length === 0) {
        console.log(`No active device tokens found for user ${userId}`);
        return;
      }
  
      const tokens = deviceTokens.map(dt => dt.token);
      
      // Send to each token individually
      const results = [];
      const failedTokens = [];
      
      for (const token of tokens) {
        const message = {
          notification: {
            title: notificationData.title,
            body: notificationData.body,
            icon: notificationData.icon
          },
          data: {
            type: notificationData.type || 'expense_update',
            expense_id: expenseData ? expenseData.id.toString() : '',
            click_action: expenseData ? `/expenses/${expenseData.id}` : '/dashboard'
          },
          token: token
        };
        
        try {
          const response = await messaging.send(message);
          results.push({ success: true, token, response });
          console.log(`Push sent successfully to ${token}`);
        } catch (error) {
          results.push({ success: false, token, error });
          failedTokens.push(token);
          console.error(`Failed to send to ${token}:`, error.message);
        }
      }
      
      // Deactivate failed tokens
      if (failedTokens.length > 0) {
        await DeviceToken.update(
          { is_active: false },
          { where: { token: failedTokens } }
        );
        console.log(`Deactivated ${failedTokens.length} failed tokens`);
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      console.log(`Push notification results: ${successCount} successful, ${failureCount} failed`);
      
      return {
        successCount,
        failureCount,
        results
      };
  
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Send real-time notification via Socket.IO
  static sendRealTimeNotification(userId, notificationData, expenseData = null) {
    try {
      if (global.io) {
        const socketData = {
          title: notificationData.title,
          body: notificationData.body,
          type: notificationData.type,
          icon: notificationData.icon,
          timestamp: new Date().toISOString(),
          expense_id: expenseData ? expenseData.id : null,
          click_action: expenseData ? `/expenses/${expenseData.id}` : '/dashboard'
        };

        // Send to specific user's room
        global.io.to(`user_${userId}`).emit('new_notification', socketData);
        console.log(`Real-time notification sent to user ${userId} via Socket.IO`);
      } else {
        console.log('Socket.IO not available for real-time notifications');
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  // Save notification to database
  static async saveNotification(recipientId, senderId, expenseId, notificationType, notificationData) {
    try {
      const notification = await Notification.create({
        title: notificationData.title,
        body: notificationData.body,
        type: notificationType,
        icon: this.NOTIFICATION_ICONS[notificationType]?.icon || 'default',
        expense_id: expenseId,
        recipient_id: recipientId,
        sender_id: senderId,
        data: {
          click_action: `/expenses/${expenseId}`,
          expense_title: notificationData.expense_title
        }
      });

      return notification;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  // Main method to send notifications for expense status changes
  static async sendExpenseNotification(expense, notificationType, approverName = null, approverId = null) {
    try {
      console.log(`Sending ${notificationType} notification for expense ${expense.id}`);
      
      // Get recipients for this notification type
      const recipients = await this.getNotificationRecipients(expense, notificationType);
      
      if (recipients.length === 0) {
        console.log(`No recipients found for ${notificationType} notification`);
        return;
      }

      // Create notification message
      const notificationMessage = this.createNotificationMessage(notificationType, expense, approverName);
      
      // Send notifications to all recipients
      const notificationPromises = recipients.map(async (recipient) => {
        try {
          // Save notification to database
          await this.saveNotification(
            recipient.id,
            approverId,
            expense.id,
            notificationType,
            {
              ...notificationMessage,
              expense_title: expense.title
            }
          );

          // Send push notification
          await this.sendPushNotification(
            recipient.id,
            {
              ...notificationMessage,
              type: notificationType
            },
            expense
          );

          console.log(`Notification sent to user ${recipient.id} (${recipient.email})`);
        } catch (error) {
          console.error(`Failed to send notification to user ${recipient.id}:`, error);
        }
      });

      await Promise.all(notificationPromises);
      console.log(`${notificationType} notifications sent successfully`);
      
    } catch (error) {
      console.error('Error in sendExpenseNotification:', error);
      throw error;
    }
  }

  // Register device token for push notifications
  static async registerDeviceToken(userId, token, deviceType, deviceInfo = null) {
    try {
      // Check if token already exists
      const existingToken = await DeviceToken.findOne({
        where: { token: token }
      });

      if (existingToken) {
        // Update existing token
        await existingToken.update({
          user_id: userId,
          device_type: deviceType,
          device_info: deviceInfo,
          is_active: true,
          last_used: new Date()
        });
        return existingToken;
      } else {
        // Create new token
        const deviceToken = await DeviceToken.create({
          token: token,
          device_type: deviceType,
          device_info: deviceInfo,
          user_id: userId,
          is_active: true,
          last_used: new Date()
        });
        return deviceToken;
      }
    } catch (error) {
      console.error('Error registering device token:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 50, offset = 0) {
    try {
      const notifications = await Notification.findAndCountAll({
        where: { recipient_id: userId },
        include: [
          { model: User, as: 'sender', attributes: ['name', 'email'] },
          { model: Expense, attributes: ['title', 'amount'] }
        ],
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { 
          id: notificationId,
          recipient_id: userId 
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({ is_read: true });
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllNotificationsAsRead(userId) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { recipient_id: userId, is_read: false } }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
