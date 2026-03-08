import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsReadController,
  deleteNotification,
  sendTestNotifications
} from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/authMiddleware.js"; // ✅ Correct import

const router = express.Router();

// Get notifications (with optional filters)
router.get("/", authMiddleware, getMyNotifications); // ✅ Use authMiddleware

// Mark single notification as read
router.put("/:id", authMiddleware, markAsRead);

// Mark all notifications as read
router.put("/mark-all/read", authMiddleware, markAllAsReadController);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

// Send test notifications to all users (Admin only)
router.post("/send-test", authMiddleware, sendTestNotifications);

export default router;