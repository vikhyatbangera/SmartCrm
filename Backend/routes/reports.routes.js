import express from "express";
import { Lead } from "../models/lead.model.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { start, end, status, source } = req.query;

    let filter = {};

    // Date range filter - only apply if BOTH start and end are provided
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Status filter - apply if provided
    if (status && status !== "") {
      filter.status = status;
    }

    // Source filter - apply if provided
    if (source && source !== "") {
      filter.source = source;
    }

    console.log("🔍 Report Filters:", { start, end, status, source });
    console.log("📊 MongoDB Filter:", JSON.stringify(filter));

    // ✅ Fetch leads with populated assignedTo
    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${leads.length} leads`);

    const reportData = leads.map((lead) => ({
      _id: lead._id,
      leadName: lead.name,
      status: lead.status,
      salesExecutive: lead.assignedTo,
      revenue: lead.revenue || 0,
    }));

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (err) {
    console.error("Reports API Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Report generation failed" 
    });
  }
});

export default router;