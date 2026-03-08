import cron from "node-cron";
import { SlaInstance } from "../models/slaInstance.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "../utils/createNotification.js";
import { sendEscalationEmail } from "../utils/sendEscalationEmail.js";

export const startSlaMonitor = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Checking SLA breaches...");

    const now = new Date();

    const breached = await SlaInstance.find({
      breachTime: { $lt: now },
      status: "active",
    }).populate("policy");

    for (let sla of breached) {
      sla.status = "breached";

      if (!sla.escalated) {
        // Send escalation email
        await sendEscalationEmail(
          sla.policy.escalationEmail,
          sla
        );

        // Send notification to all managers and admins
        const managersAndAdmins = await User.find({ 
          role: { $in: ['manager', 'admin'] } 
        });

        await Promise.all(
          managersAndAdmins.map(user => 
            createNotification(
              user._id,
              'SLA_BREACH',
              'SLA Breach Alert',
              `⚠️ SLA breach! Lead "${sla.module || 'Lead'}" has exceeded the response time limit (${sla.policy.name} policy - ${sla.policy.slaHours} hours)`,
              { slaId: sla._id, policyName: sla.policy.name, relatedTo: sla.relatedTo }
            )
          )
        );

        sla.escalated = true;
      }

      await sla.save();
    }
  });
};