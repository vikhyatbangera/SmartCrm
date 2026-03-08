import { Lead } from "../models/lead.model.js";
import { Quotation } from "../models/quotation.model.js";

export const generateSmartRecommendations = async (leadId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) return;

  const now = new Date();
  lead.recommendations = [];
  let score = 0;

  // 1️⃣ Priority for Approved Quotations
  const latestQuote = await Quotation.findOne({ lead: leadId }).sort({ createdAt: -1 });
  if (latestQuote && latestQuote.status === "approved") {
    lead.recommendations.push({
      message: "Quotation Approved! Follow up to move lead to Negotiation.",
      type: "priority",
    });
    score += 30;
  }

  // 2️⃣ Detection of Aged Quotations (Pending for 3+ days)
  if (latestQuote && latestQuote.status === "sent") {
    const diffTime = now - new Date(latestQuote.updatedAt);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays >= 3) {
      lead.recommendations.push({
        message: "No response on quotation for 3 days. Send a reminder.",
        type: "followup",
      });
      score += 15;
    }
  }

  lead.score = score;
  await lead.save();
};