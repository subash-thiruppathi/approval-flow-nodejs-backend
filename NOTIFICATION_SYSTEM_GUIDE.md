# Real-time Push Notification System Implementation Guide

## Overview

This document provides a comprehensive guide for the real-time push notification system implemented for the expense approval application. The system supports both web and mobile push notifications using Firebase Cloud Messaging (FCM) and real-time updates via Socket.IO.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Firebase      │
│   (React)       │    │   (Node.js)     │    │   (FCM)         │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Firebase SDK  │◄──►│ • Firebase Admin│◄──►│ • Push Messages │
│ • Socket.IO     │    │ • Socket.IO     │    │ • Device Tokens │
│ • Notification  │    │ • Notification  │    │ • Message Queue │
│   Components    │    │   Service       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Features Implemented

### ✅ Backend Features
- **Firebase Cloud Messaging Integration**: Server-side push notification sending
- **Socket.IO Real-time Updates**: Live notification delivery to connected clients
- **Notification Database Storage**: Persistent notification history
- **Device Token Management**: Registration and management of user devices
- **Customizable Notification Icons**: Different icons for different notification types
- **Automatic Notification Triggers**: Notifications sent on expense status changes
- **Role-based Notification Routing**: Notifications sent to appropriate users based on roles

### ✅ Notification Types
1. **EXPENSE_SUBMITTED** (💰) - Sent to Managers when new expense is submitted
2. **EXPENSE_APPROVED** (✅) - Sent to next approver when expense is approved
3. **EXPENSE_REJECTED** (❌) - Sent to requester when expense is rejected
4. **EXPENSE_FULLY_APPROVED** (🎉) - Sent to requester when expense is fully approved

### ✅ API Endpoints
- `POST /api/notifications/device-token` - Register device for notifications
- `GET /api/notifications` - Get user notification history
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `POST /api/notifications/test` - Send test notification

## Implementation Details

### Database Models

#### Notification Model
```javascript
{
  id: INTEGER,
  title: STRING,
  body: TEXT,
  type: ENUM('EXPENSE_SUBMITTED', 'EXPENSE_APPROVED', 'EXPENSE_REJECTED', 'EXPENSE_FULLY_APPROVED'),
  icon: STRING,
  is_read: BOOLEAN,
  expense_id: INTEGER,
  recipient_id: INTEGER,
  sender_id: INTEGER,
  data: JSON,
  createdAt: DATE,
  updatedAt: DATE
}
```

#### DeviceToken Model
```javascript
{
  id: INTEGER,
  token: TEXT,
  device_type: ENUM('web', 'android', 'ios'),
  device_info: JSON,
  is_active: BOOLEAN,
  last_used: DATE,
  user_id: INTEGER,
  createdAt: DATE,
  updatedAt: DATE
}
```

### Notification Service

The `NotificationService` class handles all notification operations:

```javascript
class NotificationService {
  // Send notifications for expense status changes
  static async sendExpenseNotification(expense, notificationType, approverName, approverId)
  
  // Send push notification to specific user
  static async sendPushNotification(userId, notificationData, expenseData)
  
  // Send real-time notification via Socket.IO
  static sendRealTimeNotification(userId, notificationData, expenseData)
  
  // Register device token for push notifications
  static async registerDeviceToken(userId, token, deviceType, deviceInfo)
  
  // Get user notifications with pagination
  static async getUserNotifications(userId, limit, offset)
}
```

### Notification Triggers

Notifications are automatically triggered in the expense controller:

1. **Expense Creation**: Notifies managers
2. **Manager Approval**: Notifies accountants
3. **Accountant Approval**: Notifies admins
4. **Admin Approval**: Notifies original requester (fully approved)
5. **Any Rejection**: Notifies original requester

### Firebase Configuration

Sample Firebase configuration (replace with actual credentials):

```javascript
// src/config/firebase.config.js
const serviceAccount = {
  "type": "service_account",
  "project_id": "expense-approval-app",
  "private_key_id": "sample_key_id_123456789",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSAMPLE_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-abc123@expense-approval-app.iam.gserviceaccount.com",
  // ... other Firebase config
};
```

### Socket.IO Integration

Real-time notifications are sent via Socket.IO:

```javascript
// Server-side (src/server.js)
io.on('connection', (socket) => {
  socket.join(`user_${socket.userId}`);
  
  socket.on('notification_received', (data) => {
    console.log(`User received notification: ${data.notificationId}`);
  });
});

// Sending notifications
global.io.to(`user_${userId}`).emit('new_notification', notificationData);
```

## Frontend Integration Requirements

### Required Dependencies
```bash
npm install firebase socket.io-client
```

### Firebase Setup (Frontend)
```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

### Service Worker (Frontend)
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icons/default.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### React Hooks (Frontend)
```javascript
// src/hooks/useNotifications.js
const useNotifications = (user) => {
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
      await registerDeviceToken({ token, device_type: 'web' });
    }
  };

  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      showInAppNotification(payload);
    });
    return unsubscribe;
  }, []);
};
```

### Socket.IO Client (Frontend)
```javascript
// src/hooks/useSocket.js
const useSocket = () => {
  useEffect(() => {
    const socket = io('http://localhost:3001', { auth: { token } });
    
    socket.on('new_notification', (notification) => {
      showInAppNotification(notification);
      updateNotificationCount();
    });

    return () => socket.disconnect();
  }, []);
};
```

## Testing the Notification System

### 1. Start the Server
```bash
npm run dev
```

### 2. Register a Device Token
```bash
curl -X POST http://localhost:3001/api/notifications/device-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "sample_device_token",
    "device_type": "web",
    "device_info": {"browser": "Chrome"}
  }'
```

### 3. Send a Test Notification
```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification"
  }'
```

### 4. Test Expense Flow
1. Create an expense (triggers notification to managers)
2. Approve as manager (triggers notification to accountants)
3. Approve as accountant (triggers notification to admins)
4. Final approval as admin (triggers notification to requester)

## Notification Flow Examples

### Expense Submission Flow
```
Employee submits expense
        ↓
Notification sent to all Managers
        ↓
Manager approves expense
        ↓
Notification sent to all Accountants
        ↓
Accountant approves expense
        ↓
Notification sent to all Admins
        ↓
Admin approves expense
        ↓
Notification sent to original Employee (fully approved)
```

### Rejection Flow
```
Any approver rejects expense
        ↓
Notification sent to original Employee (rejected)
```

## Customization Options

### Custom Notification Icons
Replace icon files in `public/icons/`:
- `expense-submitted.png`
- `expense-approved.png`
- `expense-rejected.png`
- `expense-fully-approved.png`

### Custom Notification Messages
Modify the `createNotificationMessage` method in `NotificationService`:

```javascript
static createNotificationMessage(notificationType, expense, approverName) {
  switch (notificationType) {
    case 'EXPENSE_SUBMITTED':
      return {
        title: `💰 New Expense: ${expense.title}`,
        body: `Amount: $${expense.amount} - Requires your approval`,
        icon: '/icons/expense-submitted.png'
      };
    // ... other cases
  }
}
```

### Adding New Notification Types
1. Add new type to `Notification` model enum
2. Add icon configuration to `NOTIFICATION_ICONS`
3. Add message template to `createNotificationMessage`
4. Add trigger logic where needed

## Security Considerations

### Device Token Security
- Tokens are stored securely in the database
- Invalid tokens are automatically deactivated
- Users can manage their registered devices

### Notification Privacy
- Users only receive notifications relevant to their role
- Notification content doesn't expose sensitive data
- All notifications require authentication

### Firebase Security
- Service account keys are kept secure
- Firebase rules restrict access appropriately
- HTTPS is used for all communications

## Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check browser notification permissions
   - Verify Firebase configuration
   - Ensure device token is registered

2. **Firebase errors**
   - Verify service account credentials
   - Check Firebase project settings
   - Ensure FCM is enabled

3. **Socket.IO connection issues**
   - Check JWT token validity
   - Verify server is running
   - Check CORS configuration

### Debug Mode
Enable debug logging:
```javascript
console.log('Notification sent:', notificationData);
console.log('Device tokens:', deviceTokens);
console.log('Socket.IO connected users:', io.sockets.sockets.size);
```

## Production Deployment

### Environment Variables
```env
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-production-project.iam.gserviceaccount.com
```

### Security Checklist
- [ ] Replace sample Firebase credentials with production keys
- [ ] Configure Firebase authorized domains
- [ ] Set up proper CORS settings
- [ ] Enable HTTPS in production
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

## Next Steps

1. **Replace Firebase Credentials**: Follow `FIREBASE_SETUP_GUIDE.md` to set up your Firebase project
2. **Implement Frontend**: Use the updated `REACT_FRONTEND_PROMPT.md` to build the React frontend
3. **Test End-to-End**: Test the complete notification flow
4. **Customize Icons**: Replace placeholder icons with your custom designs
5. **Deploy to Production**: Follow security best practices for production deployment

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase documentation: https://firebase.google.com/docs/cloud-messaging
3. Check Socket.IO documentation: https://socket.io/docs/
4. Review the implementation code in the `src/` directory

The notification system is fully functional and ready for production use with proper Firebase configuration.
