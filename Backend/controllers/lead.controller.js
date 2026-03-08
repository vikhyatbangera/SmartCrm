// ================= LEAD CONTROLLER =================

// Add this import at the top
import { logActivity } from "../middleware/logActivity.js";
import { Lead } from "../models/lead.model.js";
import { User } from "../models/user.model.js";
import { runRuleEngine } from "../services/ruleEngine.service.js";

// ================= CREATE LEAD =================
export const createLead = async (req, res) => {
  try {
    let leadData = { ...req.body };

    // If sales creates → auto assign to self
    if (req.user.role === "sales") {
      leadData.assignedTo = req.user.id;
    }

    const lead = await Lead.create(leadData);

    // Log activity
    await logActivity(req.user.id, "Created Lead", "Leads");

    // Send notification to admin when manager creates a lead
    if (req.user.role === "manager" && lead.assignedTo) {
      const { createNotification } = await import("../utils/createNotification.js");
      const User = (await import("../models/user.model.js")).User;
      
      // Get all admins
      const admins = await User.find({ role: 'admin' });
      await Promise.all(
        admins.map(admin => 
          createNotification(
            admin._id,
            'NEW_USER_REGISTERED',
            'New Lead Created',
            `Manager ${req.user.name} created a new lead: ${lead.name || lead.company}`,
            { leadId: lead._id, leadName: lead.name || lead.company }
          )
        )
      );
    }

    await runRuleEngine(lead._id);

    // Populate assignedTo and history.updatedBy
    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL LEADS =================
export const getAllLeads = async (req, res) => {
  try {
    const { status, assignedTo, name } = req.query;

    let filter = {};

    // Sales can only see their own leads
    if (req.user.role === "sales") {
      filter.assignedTo = req.user.id;
    }

    // Filter by status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Filter by assigned user (admin/manager only)
    if (assignedTo && assignedTo !== "all") {
      filter.assignedTo = assignedTo;
    }

    // Filter by name (case insensitive search)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const leads = await Lead.find(filter)
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= ASSIGN LEAD =================
export const assignLead = async (req, res) => {
  try {
    // Only admin or manager can assign
    if (req.user.role === "sales") {
      return res.status(403).json({
        success: false,
        message: "Sales cannot assign leads",
      });
    }

    const { userId } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Ensure assigned user is sales
    const user = await User.findById(userId);
    if (!user || user.role !== "sales") {
      return res.status(400).json({
        success: false,
        message: "Can only assign to sales users",
      });
    }

    lead.assignedTo = userId;

    lead.history.push({
      action: "Lead Assigned",
      updatedBy: req.user.id,
    });

    await lead.save();
    await runRuleEngine(lead._id);

    // Send notification to sales executive about new lead assignment
    const { createNotification } = await import("../utils/createNotification.js");
    await createNotification(
      userId,
      'LEAD_ASSIGNED',
      'New Lead Assigned',
      `You have been assigned a new lead: ${lead.name || lead.company}`,
      { leadId: lead._id, leadName: lead.name || lead.company, assignedBy: req.user.name }
    );

    // Log activity
    await logActivity(req.user.id, `Assigned Lead to ${user.name}`, "Leads");

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE STATUS =================
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Sales restriction
    if (req.user.role === "sales" && lead.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const oldStatus = lead.status;
    lead.status = status;

    if (status === "contacted") {
      lead.lastContactedAt = new Date();
    }

    lead.history.push({
      action: "Status Updated",
      updatedBy: req.user.id,
      oldStatus,
      newStatus: status,
    });

    await lead.save();
    await runRuleEngine(lead._id);

    // Send notification to managers and admins about status change
    const { createNotification } = await import("../utils/createNotification.js");
    const User = (await import("../models/user.model.js")).User;
    
    const managersAndAdmins = await User.find({ role: { $in: ['manager', 'admin'] } });
    
    // Special handling for WON and LOST statuses
    if (status === 'won') {
      // Get all admin IDs for LEAD_WON notification
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      // Notify manager who oversees this sales exec
      const managerId = lead.assignedTo?.managerId;
      
      await Promise.all([
        // Notify manager
        managerId && createNotification(
          managerId,
          'LEAD_WON',
          'Deal Closed Successfully',
          `🎉 Great news! Lead "${lead.name || lead.company}" has been won with revenue of ₹${lead.revenue?.toLocaleString() || 0}`,
          { leadId: lead._id, leadName: lead.name || lead.company, revenue: lead.revenue }
        ),
        // Notify all admins
        ...adminIds.map(adminId => 
          createNotification(
            adminId,
            'LEAD_WON',
            'Deal Closed Successfully',
            `🎉 Lead "${lead.name || lead.company}" won - Revenue: ₹${lead.revenue?.toLocaleString() || 0}`,
            { leadId: lead._id, leadName: lead.name || lead.company, revenue: lead.revenue }
          )
        )
      ].filter(Boolean));
      
    } else if (status === 'lost') {
      // Notify manager about lost lead
      const managerId = lead.assignedTo?.managerId;
      if (managerId) {
        await createNotification(
          managerId,
          'LEAD_LOST',
          'Lead Lost',
          `⚠️ Lead "${lead.name || lead.company}" has been marked as lost`,
          { leadId: lead._id, leadName: lead.name || lead.company }
        );
      }
    } else {
      // Regular status update notification
      await Promise.all(
        managersAndAdmins.map(user => 
          createNotification(
            user._id,
            'LEAD_STATUS_UPDATED',
            'Lead Status Updated',
            `Lead "${lead.name || lead.company}" status changed from ${oldStatus} to ${status}`,
            { leadId: lead._id, leadName: lead.name || lead.company, oldStatus, newStatus: status }
          )
        )
      );
    }

    // Log activity
    await logActivity(req.user.id, `Updated Lead status from ${oldStatus} to ${status}`, "Leads");

    const populatedLead = await Lead.findById(lead._id)
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: populatedLead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE LEAD =================
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Log activity
    await logActivity(req.user.id, `Deleted Lead ${lead.name}`, "Leads");

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET LEAD BY ID =================
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE LEAD =================
export const updateLead = async (req, res) => {
  try {
    // Only allow these fields to be updated
    const allowedFields = ["name", "email", "phone", "company", "source", "notes", "revenue", "status"];
    
    const updateData = {};
    for (let key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = key === "revenue" ? Number(req.body[key]) : req.body[key];
      }
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("history.updatedBy", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Log activity
    await logActivity(req.user.id, `Updated Lead ${lead.name}`, "Leads");

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Update Lead Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};