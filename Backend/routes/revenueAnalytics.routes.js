import express from "express";
import { Lead } from "../models/lead.model.js"; // ✅ FIXED: Added curly braces

const router = express.Router();

router.get("/revenue", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = await Lead.aggregate([
      {
        $match: {
          status: "won",
          // Only fetch data for the current year
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: { $ifNull: ["$revenue", 0] } }, // safer sum
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // ✅ FIXED: Create an array for all 12 months so the chart always looks good
    const allMonths = Array.from({ length: 12 }, (_, i) => ({
      month: getMonthName(i + 1),
      revenue: 0
    }));

    // Merge actual data into the 12-month array
    monthlyRevenue.forEach((item) => {
      allMonths[item._id - 1].revenue = item.revenue;
    });

    const totalRevenue = allMonths.reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    res.json({
      success: true,
      monthlyRevenue: allMonths,
      totalRevenue,
    });
  } catch (err) {
    console.error("Revenue Analytics Error:", err);
    res.status(500).json({ success: false, message: "Analytics error" });
  }
});

function getMonthName(monthNumber) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months[monthNumber - 1];
}

export default router;