import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: [
      'LEAD_ASSIGNED',
      'LEAD_STATUS_UPDATED',
      'LEAD_WON',
      'LEAD_LOST',
      'SLA_BREACH',
      'SLA_WARNING',
      'QUOTATION_CREATED',
      'QUOTATION_APPROVAL_REQUEST',
      'QUOTATION_APPROVED',
      'QUOTATION_REJECTED',
      'NEW_USER_REGISTERED',
      'ACCOUNT_APPROVED',
      'ACCOUNT_REJECTED',
      'AUTOMATION_TRIGGERED',
      'SYSTEM_ALERT',
      'LEAD_ASSIGNED_BY_MANAGER',
      'PROFILE_UPDATED',
      'NEW_COMMENT_ON_LEAD'
    ],
    required: true
  },

  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },

  metadata: {
    type: Object,
    default: {}
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);