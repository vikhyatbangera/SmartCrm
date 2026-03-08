// ================= QUOTATION CONTROLLER =================

import path from "path";
import fs from "fs";
import { Quotation } from "../models/quotation.model.js";
import { Lead } from "../models/lead.model.js";
import { generateQuotationPDF } from "../utils/generatePdf.js";
import { sendQuotationEmail } from "../utils/sendEmail.js";
import { logActivity } from "../middleware/logActivity.js";
import { 
  sendQuotationCreatedNotification,
  sendQuotationApprovalRequestNotification,
  sendQuotationApprovedNotification,
  sendQuotationRejectedNotification
} from "../utils/createNotification.js";
import { User } from "../models/user.model.js";

// ================= CREATE QUOTATION =================
export const createQuotation = async (req, res) => {
  try {
    const { products, tax, leadId } = req.body;

    // Calculate subtotal and total per product
    let subtotal = 0;
    const updatedProducts = products.map((item) => {
      const lineTotal = (item.quantity * item.price) - (item.discount || 0);
      subtotal += lineTotal;
      return { ...item, total: lineTotal };
    });

    const grandTotal = subtotal + (tax || 0);

    // ================= Tiered Approval Workflow =================
    const approvals = [];
    let initialStatus = "pending_approval";

    if (grandTotal < 50000) {
      approvals.push({ level: 1, status: "approved", remarks: "System Auto-Approved" });
      initialStatus = "approved";
    } else if (grandTotal <= 200000) {
      approvals.push({ level: 1, status: "approved", remarks: "System Auto-Approved" });
      approvals.push({ level: 2, status: "pending" });
      initialStatus = "pending_approval";
    } else {
      approvals.push({ level: 1, status: "approved", remarks: "System Auto-Approved" });
      approvals.push({ level: 2, status: "approved", remarks: "System Auto-Approved" });
      approvals.push({ level: 3, status: "pending" });
      initialStatus = "pending_approval";
    }

    const quotation = await Quotation.create({
      ...req.body,
      products: updatedProducts,
      subtotal,
      grandTotal,
      createdBy: req.user.id,
      status: initialStatus,
      approvals,
    });

    // Update linked lead status if leadId provided
    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { status: "qualified" });
    }

    // ✅ Log activity
    await logActivity(req.user.id, `Created Quotation #${quotation._id}`, "Quotations");

    // ✅ Send notifications
    // Get all managers for notification
    const managers = await User.find({ role: 'manager' }).select('_id');
    const managerIds = managers.map(m => m._id);
    
    if (initialStatus === "pending_approval") {
      // Notify managers about approval request
      await Promise.all(
        managerIds.map(managerId => 
          sendQuotationApprovalRequestNotification(managerId, quotation._id, grandTotal)
        )
      );
    } else {
      // Auto-approved - notify creator
      await sendQuotationApprovedNotification(req.user.id, quotation._id);
    }

    res.status(201).json({ success: true, data: quotation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL QUOTATIONS =================
export const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("createdBy", "name email")
      .populate("approvals.approvedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: quotations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= APPROVE / REJECT QUOTATION =================
export const approveQuotation = async (req, res) => {
  try {
    const { level, remarks, status } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const currentApproval = quotation.approvals.find(a => a.level === level);
    if (!currentApproval) return res.status(400).json({ message: "Approval level not found" });

    currentApproval.status = status;
    currentApproval.approvedBy = req.user.id;
    currentApproval.remarks = remarks;
    currentApproval.updatedAt = new Date();

    if (status === "rejected") {
      quotation.status = "rejected";
    } else {
      const allApproved = quotation.approvals.every(a => a.status === "approved");
      if (allApproved) quotation.status = "approved";
    }

    await quotation.save();

    // ✅ Log activity
    await logActivity(req.user.id, `${status === "approved" ? "Approved" : "Rejected"} Quotation #${quotation._id} at level ${level}`, "Quotations");

    // ✅ Send notifications based on approval status
    if (status === "rejected") {
      // Notify sales user who created the quotation
      await sendQuotationRejectedNotification(quotation.createdBy, quotation._id, remarks);
    } else {
      const allApproved = quotation.approvals.every(a => a.status === "approved");
      if (allApproved) {
        // All levels approved - notify sales user
        await sendQuotationApprovedNotification(quotation.createdBy, quotation._id);
      }
    }

    res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= SEND QUOTATION =================
export const sendQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("lead", "name company");
    
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    if (quotation.status !== "approved") {
      return res.status(400).json({ message: "Quotation must be approved before sending" });
    }

    // Generate PDF
    const filePath = path.join(process.cwd(), `quotation-${quotation._id}.pdf`);
    await generateQuotationPDF(quotation, filePath);

    // Enhanced email with better formatting
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Your Quotation from ${quotation.createdBy?.name || 'Our Team'}</h2>
        
        <p>Dear ${quotation.clientName},</p>
        
        <p>Thank you for your interest in our products/services. Please find attached your detailed quotation.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Quotation Summary:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;"><strong>Client Name:</strong></td>
              <td style="padding: 8px 0;">${quotation.clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;">${quotation.clientEmail}</td>
            </tr>
            ${quotation.lead?.company ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Company:</strong></td>
              <td style="padding: 8px 0;">${quotation.lead.company}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0;"><strong>Subtotal:</strong></td>
              <td style="padding: 8px 0;">₹${quotation.subtotal?.toLocaleString() || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Tax:</strong></td>
              <td style="padding: 8px 0;">₹${quotation.tax?.toLocaleString() || '0'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #059669;"><strong>Grand Total:</strong></td>
              <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #059669;">₹${quotation.grandTotal?.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <p><strong>Payment Terms:</strong> ${quotation.paymentTerms || 'Net 30 days'}</p>
        <p><strong>Validity:</strong> ${quotation.validityDays || 30} days from the date of issue</p>
        
        <p style="margin-top: 20px;">If you have any questions or need further clarification, please don't hesitate to contact us.</p>
        
        <p>We look forward to working with you!</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br />
          <strong>${quotation.createdBy?.name || 'Our Sales Team'}</strong><br />
          ${quotation.createdBy?.email || ''}
        </p>
      </div>
    `;

    await sendQuotationEmail({
      to: quotation.clientEmail,
      subject: `Quotation - ${quotation.clientName} (₹${quotation.grandTotal.toLocaleString()})`,
      html: emailHtml,
      attachments: [{ filename: `Quotation-${quotation._id}.pdf`, path: filePath }],
    });

    console.log(`✅ Quotation PDF sent to ${quotation.clientEmail}`);

    quotation.status = "sent";
    await quotation.save();

    // ✅ Log activity
    await logActivity(req.user.id, `Sent Quotation #${quotation._id} to ${quotation.clientEmail}`, "Quotations");

    res.status(200).json({ success: true, message: "Quotation sent successfully to client" });
  } catch (error) {
    console.error("❌ Send quotation error:", error.message);
    
    // Provide specific error message
    let errorMessage = "Failed to send quotation email. ";
    if (error.message.includes("Email configuration")) {
      errorMessage += "Email credentials not configured. Please contact administrator.";
    } else if (error.message.includes("Authentication")) {
      errorMessage += "Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env";
    } else {
      errorMessage += error.message;
    }
    
    res.status(500).json({ message: errorMessage });
  }
};

// ================= GET QUOTATION ANALYTICS =================
export const getQuotationAnalytics = async (req, res) => {
  try {
    const stats = await Quotation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgValue: { $avg: "$grandTotal" }
        }
      }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GENERATE PDF =================
export const generatePdf = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("lead", "name company")
      .populate("createdBy", "name email");
    
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    const filePath = path.join(process.cwd(), `quotation-${quotation._id}.pdf`);
    await generateQuotationPDF(quotation, filePath);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quotation-${quotation._id}.pdf"`);
    
    // Send file as stream
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('end', () => {
      // Optional: Clean up file after sending
      // fs.unlinkSync(filePath);
    });
    
    fileStream.on('error', (err) => {
      console.error("Stream error:", err);
      res.status(500).json({ message: "Error streaming PDF" });
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE QUOTATION =================
export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    
    if (!quotation) return res.status(404).json({ message: "Quotation not found" });

    // ✅ Log activity
    await logActivity(req.user.id, `Deleted Quotation #${quotation._id} for ${quotation.clientName}`, "Quotations");

    res.status(200).json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};