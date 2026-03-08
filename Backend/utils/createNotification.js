import { Notification } from "../models/notification.model.js";

// Notification Types
export const NOTIFICATION_TYPES = {
  // Lead Related
  LEAD_ASSIGNED: 'LEAD_ASSIGNED',
  LEAD_STATUS_UPDATED: 'LEAD_STATUS_UPDATED',
  LEAD_WON: 'LEAD_WON',
  LEAD_LOST: 'LEAD_LOST',
  
  // SLA Notifications
  SLA_BREACH: 'SLA_BREACH',
  SLA_WARNING: 'SLA_WARNING',
  
  // Quotation Notifications
  QUOTATION_CREATED: 'QUOTATION_CREATED',
  QUOTATION_APPROVAL_REQUEST: 'QUOTATION_APPROVAL_REQUEST',
  QUOTATION_APPROVED: 'QUOTATION_APPROVED',
  QUOTATION_REJECTED: 'QUOTATION_REJECTED',
  
  // User Management
  NEW_USER_REGISTERED: 'NEW_USER_REGISTERED',
  ACCOUNT_APPROVED: 'ACCOUNT_APPROVED',
  ACCOUNT_REJECTED: 'ACCOUNT_REJECTED',
  
  // Automation & System
  AUTOMATION_TRIGGERED: 'AUTOMATION_TRIGGERED',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  
  // Activity
  LEAD_ASSIGNED_BY_MANAGER: 'LEAD_ASSIGNED_BY_MANAGER',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  NEW_COMMENT_ON_LEAD: 'NEW_COMMENT_ON_LEAD'
};

export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      metadata
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Helper functions for common notifications
export const sendLeadAssignedNotification = async (salesUserId, leadName, assignedBy) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.LEAD_ASSIGNED,
    'New Lead Assigned',
    `You have been assigned a new lead: ${leadName}`,
    { leadName, assignedBy }
  );
};

export const sendLeadStatusUpdatedNotification = async (managerUserId, leadName, newStatus, updatedBy) => {
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.LEAD_STATUS_UPDATED,
    'Lead Status Updated',
    `Lead "${leadName}" status has been updated to ${newStatus}`,
    { leadName, newStatus, updatedBy }
  );
};

export const sendLeadWonNotification = async (managerUserId, adminUserIds, leadName, revenue) => {
  const message = `Great news! Lead "${leadName}" has been won with revenue of ₹${revenue?.toLocaleString()}`;
  
  // Notify manager
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.LEAD_WON,
    'Deal Closed Successfully',
    message,
    { leadName, revenue }
  );
  
  // Notify all admins
  if (adminUserIds && adminUserIds.length > 0) {
    await Promise.all(
      adminUserIds.map(adminId => 
        createNotification(
          adminId,
          NOTIFICATION_TYPES.LEAD_WON,
          'Deal Closed Successfully',
          message,
          { leadName, revenue }
        )
      )
    );
  }
};

export const sendLeadLostNotification = async (managerUserId, leadName, reason) => {
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.LEAD_LOST,
    'Lead Lost',
    `Lead "${leadName}" has been marked as lost. Reason: ${reason || 'Not specified'}`,
    { leadName, reason }
  );
};

export const sendSlaBreachNotification = async (managerUserId, leadName, slaPolicy) => {
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.SLA_BREACH,
    'SLA Breach Alert',
    `⚠️ SLA breach! Lead "${leadName}" has exceeded the response time limit (${slaPolicy} policy)`,
    { leadName, slaPolicy }
  );
};

export const sendSlaWarningNotification = async (salesUserId, leadName, remainingTime) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.SLA_WARNING,
    'SLA Deadline Approaching',
    `⏰ Urgent! SLA deadline for lead "${leadName}" is approaching. Time remaining: ${remainingTime}`,
    { leadName, remainingTime }
  );
};

export const sendQuotationCreatedNotification = async (managerUserId, quotationId, amount, createdBy) => {
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.QUOTATION_CREATED,
    'New Quotation Created',
    `A new quotation (#${quotationId}) has been created for ₹${amount?.toLocaleString()}`,
    { quotationId, amount, createdBy }
  );
};

export const sendQuotationApprovalRequestNotification = async (managerUserId, quotationId, amount) => {
  await createNotification(
    managerUserId,
    NOTIFICATION_TYPES.QUOTATION_APPROVAL_REQUEST,
    'Quotation Approval Required',
    `Quotation #${quotationId} for ₹${amount?.toLocaleString()} requires your approval`,
    { quotationId, amount }
  );
};

export const sendQuotationApprovedNotification = async (salesUserId, quotationId) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.QUOTATION_APPROVED,
    'Quotation Approved',
    `Your quotation #${quotationId} has been approved by the manager`,
    { quotationId }
  );
};

export const sendQuotationRejectedNotification = async (salesUserId, quotationId, reason) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.QUOTATION_REJECTED,
    'Quotation Rejected',
    `Quotation #${quotationId} has been rejected. Reason: ${reason || 'Not specified'}`,
    { quotationId, reason }
  );
};

export const sendNewUserRegisteredNotification = async (adminUserIds, userName, email) => {
  const message = `New user registration: ${userName} (${email}) is awaiting approval`;
  
  if (adminUserIds && adminUserIds.length > 0) {
    await Promise.all(
      adminUserIds.map(adminId => 
        createNotification(
          adminId,
          NOTIFICATION_TYPES.NEW_USER_REGISTERED,
          'New User Registration',
          message,
          { userName, email }
        )
      )
    );
  }
};

export const sendAccountApprovedNotification = async (userId) => {
  await createNotification(
    userId,
    NOTIFICATION_TYPES.ACCOUNT_APPROVED,
    'Account Approved',
    '🎉 Your account has been approved! You can now access the system.',
    {}
  );
};

export const sendAccountRejectedNotification = async (userId, reason) => {
  await createNotification(
    userId,
    NOTIFICATION_TYPES.ACCOUNT_REJECTED,
    'Account Rejected',
    `Your account registration has been rejected. Reason: ${reason || 'Not specified'}`,
    { reason }
  );
};

export const sendAutomationTriggeredNotification = async (adminUserIds, ruleName, leadName) => {
  const message = `Automation rule "${ruleName}" was triggered for lead "${leadName}"`;
  
  if (adminUserIds && adminUserIds.length > 0) {
    await Promise.all(
      adminUserIds.map(adminId => 
        createNotification(
          adminId,
          NOTIFICATION_TYPES.AUTOMATION_TRIGGERED,
          'Automation Rule Triggered',
          message,
          { ruleName, leadName }
        )
      )
    );
  }
};

export const sendSystemAlertNotification = async (adminUserIds, alertMessage, severity = 'medium') => {
  if (adminUserIds && adminUserIds.length > 0) {
    await Promise.all(
      adminUserIds.map(adminId => 
        createNotification(
          adminId,
          NOTIFICATION_TYPES.SYSTEM_ALERT,
          'System Alert',
          alertMessage,
          { severity }
        )
      )
    );
  }
};

export const sendLeadAssignedByManagerNotification = async (salesUserId, leadName, managerName) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.LEAD_ASSIGNED_BY_MANAGER,
    'Lead Assigned by Manager',
    `${managerName} has assigned you a new lead: ${leadName}`,
    { leadName, managerName }
  );
};

export const sendProfileUpdatedNotification = async (userId) => {
  await createNotification(
    userId,
    NOTIFICATION_TYPES.PROFILE_UPDATED,
    'Profile Updated',
    'Your profile information has been successfully updated',
    {}
  );
};

export const sendNewCommentOnLeadNotification = async (salesUserId, leadName, commentedBy) => {
  await createNotification(
    salesUserId,
    NOTIFICATION_TYPES.NEW_COMMENT_ON_LEAD,
    'New Comment on Lead',
    `${commentedBy} added a new comment on lead "${leadName}"`,
    { leadName, commentedBy }
  );
};