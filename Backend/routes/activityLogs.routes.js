import express from "express";
import ActivityLog from "../models/activitylogs.model.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("user", "name email role") // populate user info
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

export default router;