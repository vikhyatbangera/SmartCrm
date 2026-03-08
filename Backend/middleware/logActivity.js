import ActivityLog from "../models/activitylogs.model.js";

/**
 * Logs a user activity
 * @param {String} userId - ID of the user performing the action
 * @param {String} action - Description of the activity
 * @param {String} module - Module name (Leads, Quotations, etc.)
 */
export const logActivity = async (userId, action, module) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      module,
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};