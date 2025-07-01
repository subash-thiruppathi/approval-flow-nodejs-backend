# Firebase Setup Guide for Push Notifications

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your expense approval system.

## Prerequisites

1. Google account
2. Access to Firebase Console
3. Your expense approval application running

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `expense-approval-app` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Web App to Firebase Project

1. In your Firebase project dashboard, click the web icon (`</>`)
2. Register your app with nickname: `expense-approval-web`
3. Enable "Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this for frontend)

```javascript
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id"
};
```

## Step 3: Enable Cloud Messaging

1. In Firebase Console, go to "Project settings" (gear icon)
2. Navigate to "Cloud Messaging" tab
3. Note down your "Server key" and "Sender ID"

## Step 4: Generate Service Account Key

1. Go to "Project settings" → "Service accounts"
2. Click "Generate new private key"
3. Download the JSON file
4. Replace the sample credentials in `src/config/firebase.config.js` with your actual credentials

```javascript
// Replace the serviceAccount object with your downloaded JSON content
const serviceAccount = {
  "type": "service_account",
  "project_id": "your-actual-project-id",
  "private_key_id": "your-actual-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "your-actual-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com"
};
```

## Step 5: Frontend Firebase Configuration

Create a Firebase configuration file in your React frontend:

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  // Your config from Step 2
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
```

## Step 6: Web Push Certificate (VAPID Key)

1. In Firebase Console, go to "Project settings" → "Cloud Messaging"
2. In "Web configuration" section, click "Generate key pair"
3. Copy the "Key pair" (VAPID key)
4. Use this key in your frontend for `getToken()` calls

## Step 7: Service Worker for Web Notifications

Create `public/firebase-messaging-sw.js` in your React app:

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // Your config here
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icons/default.png',
    badge: '/icons/badge.png',
    tag: 'expense-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Expense'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## Step 8: Request Notification Permission

In your React app, request notification permission and register device token:

```javascript
// src/hooks/useNotifications.js
import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '../config/firebase';
import { registerDeviceToken } from '../services/api';

const useNotifications = (user) => {
  useEffect(() => {
    if (user && 'Notification' in window) {
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'YOUR_VAPID_KEY_FROM_STEP_6'
        });
        
        if (token) {
          // Register token with your backend
          await registerDeviceToken({
            token,
            device_type: 'web',
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform
            }
          });
        }
      }
    } catch (error) {
      console.error('Error getting notification permission:', error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      
      // Show in-app notification or update UI
      showInAppNotification(payload);
    });

    return unsubscribe;
  }, []);
};

export default useNotifications;
```

## Step 9: Testing Notifications

1. Start your backend server: `npm run dev`
2. Register a user and get device token
3. Use the test notification endpoint:

```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test push notification"
  }'
```

## Step 10: Mobile App Setup (Optional)

For React Native or native mobile apps:

### Android
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. Configure FCM in your Android app

### iOS
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add it to your iOS project
3. Configure APNs certificates in Firebase Console

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Optional: Use environment variables instead of hardcoded config
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Common Issues

1. **"Firebase Admin SDK not initialized"**
   - Check your service account JSON is correct
   - Ensure private key format is correct (with \n for line breaks)

2. **"Registration token not valid"**
   - Token might be expired or invalid
   - Re-register the device token

3. **Notifications not received**
   - Check browser notification permissions
   - Verify service worker is registered
   - Check Firebase Console logs

4. **CORS errors**
   - Ensure your domain is added to Firebase authorized domains
   - Check CORS configuration in your backend

### Debug Mode

Enable debug logging in your frontend:

```javascript
// Add to your main app file
if (process.env.NODE_ENV === 'development') {
  // Enable Firebase debug logging
  firebase.firestore.setLogLevel('debug');
}
```

## Security Considerations

1. **Never expose service account keys in frontend code**
2. **Use environment variables for sensitive data**
3. **Implement proper token validation**
4. **Regularly rotate Firebase keys**
5. **Use HTTPS in production**

## Production Deployment

1. Replace all sample credentials with production keys
2. Update Firebase authorized domains
3. Configure proper CORS settings
4. Set up monitoring and logging
5. Test notification delivery thoroughly

## API Endpoints Summary

Your notification system provides these endpoints:

- `POST /api/notifications/device-token` - Register device token
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/test` - Send test notification

## Next Steps

1. Replace sample Firebase credentials with your actual credentials
2. Set up your React frontend with Firebase SDK
3. Test the notification flow end-to-end
4. Customize notification icons and messages
5. Deploy to production with proper security measures

For more detailed Firebase documentation, visit: https://firebase.google.com/docs/cloud-messaging
