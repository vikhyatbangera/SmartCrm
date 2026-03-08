import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { createNotification, NOTIFICATION_TYPES } from "../utils/createNotification.js";

export const getMyNotifications = async (req, res) => {
  try {
    // ✅ Safety: Fallback to _id if id is undefined based on token signing
    const userId = req.user.id || req.user._id;
    const { type, unreadOnly } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized user ID" });
    }

    let filter = { user: userId };
    
    // Filter by type if provided
    if (type) {
      filter.type = type;
    }
    
    // Filter unread only if requested
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Marked as read", data: notification });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEND TEST NOTIFICATIONS TO ALL USERS =================
export const sendTestNotifications = async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select('_id name email role');
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    let sentCount = 0;
    
    // Send test notification to each user
    for (const user of users) {
      try {
        await createNotification(
          user._id,
          NOTIFICATION_TYPES.SYSTEM_ALERT,
          '🧪 Test Notification - CRM System',
          `Hello ${user.name}! This is a test notification to verify that the notification system is working correctly. If you can see this, notifications are functional! ✅`,
          { 
            test: true, 
            timestamp: new Date().toISOString(),
            recipientRole: user.role 
          }
        );
        sentCount++;
        console.log(`✅ Test notification sent to: ${user.name} (${user.email})`);
      } catch (err) {
        console.error(`❌ Failed to send to ${user.email}:`, err.message);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Test notifications sent to ${sentCount} users`,
      totalUsers: users.length,
      sentCount
    });
  } catch (error) {
    console.error("Send Test Notifications Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};