import { Lead } from "../models/lead.model.js";

export const getMyPerformance = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalLeads = await Lead.countDocuments({ assignedTo: userId });

    const wonLeads = await Lead.find({
      assignedTo: userId,
      status: "won"
    });

    const convertedLeads = wonLeads.length;

    const totalRevenue = wonLeads.reduce(
      (acc, lead) => acc + (lead.revenue || 0),
      0
    );

    const conversionRate =
      totalLeads === 0
        ? 0
        : ((convertedLeads / totalLeads) * 100).toFixed(2);

    const pendingLeads = await Lead.countDocuments({
      assignedTo: userId,
      status: { $ne: "won" }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        pendingLeads,
        conversionRate,
        totalRevenue
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};