# Notification Icons

This directory contains customizable notification icons for the expense approval system.

## Icon Files

- `expense-submitted.png` - Icon for new expense submissions (💰)
- `expense-approved.png` - Icon for expense approvals (✅)
- `expense-rejected.png` - Icon for expense rejections (❌)
- `expense-fully-approved.png` - Icon for fully approved expenses (🎉)
- `default.png` - Default notification icon
- `test.png` - Test notification icon

## Customization

You can replace these icon files with your own custom icons. Recommended specifications:

- **Format**: PNG with transparency
- **Size**: 192x192 pixels (for web notifications)
- **Background**: Transparent
- **Style**: Simple, clear, and recognizable at small sizes

## Usage

These icons are served statically from `/icons/` endpoint and used in:

1. **Firebase Push Notifications** - Displayed in browser/mobile notifications
2. **Real-time Socket.IO Notifications** - Used in web application UI
3. **Notification History** - Shown in notification lists and badges

## Icon Mapping

The notification service automatically maps notification types to appropriate icons:

```javascript
NOTIFICATION_ICONS = {
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
```

## Adding New Icons

1. Add your PNG file to this directory
2. Update the `NOTIFICATION_ICONS` configuration in `src/services/notification.service.js`
3. Restart the server to serve the new icons
