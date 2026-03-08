import Rule from "../models/rule.model.js";
import { Lead } from "../models/lead.model.js";
import { User } from "../models/user.model.js";
import { matchCondition } from "../utils/conditionMatcher.js";
import { sendEmail } from "./email.service.js";
import { generateSmartRecommendations } from "./recommendation.service.js";
import { createNotification } from "../utils/createNotification.js";

export const runRuleEngine = async (leadId) => {
  const lead = await Lead.findById(leadId);
  if (!lead) return;

  const rules = await Rule.find();

  for (let rule of rules) {
    const isMatch = matchCondition(lead, rule.condition);

    if (isMatch) {
      await executeAction(lead, rule.action);
      
      // Send notification to admins about automation trigger
      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(
        admins.map(adminId => 
          createNotification(
            adminId,
            'AUTOMATION_TRIGGERED',
            'Automation Rule Triggered',
            `⚙️ Automation rule "${rule.name}" was triggered for lead "${lead.name || lead.company}"`,
            { ruleId: rule._id, ruleName: rule.name, leadId, leadName: lead.name || lead.company }
          )
        )
      );
    }
  }

  // 🔥 RUN SMART RECOMMENDATION ENGINE
  await generateSmartRecommendations(leadId);
};

const executeAction = async (lead, action) => {
  if (action.type === "assign") {
    const oldAssignedTo = lead.assignedTo;
    lead.assignedTo = action.value;
    await lead.save();
    
    // Send notification to the sales executive about the auto-assignment
    try {
      const assignedUser = await User.findById(action.value);
      if (assignedUser) {
        await createNotification(
          action.value,
          'LEAD_ASSIGNED',
          'New Lead Assigned (Auto)',
          `🎯 You have been automatically assigned a new lead: ${lead.name || lead.company} via automation rule`,
          { 
            leadId: lead._id, 
            leadName: lead.name || lead.company,
            assignedBy: 'Automation Rule',
            autoAssigned: true
          }
        );
      }
    } catch (error) {
      console.error("Error sending assignment notification:", error.message);
    }
  }

  if (action.type === "reminder") {
    console.log("Reminder triggered for:", lead.name);
  }

  if (action.type === "email") {
    await sendEmail(
      lead.email,
      "CRM Notification",
      "Follow-up Reminder for your lead."
    );
  }
};