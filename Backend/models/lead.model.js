import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  action: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  oldStatus: String,
  newStatus: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const recommendationSchema = new mongoose.Schema({
  message: String,
  type: String, // followup, priority, nurture
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    company: String,

    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "lost", "won"],
      default: "new",
    },

    source: {
      type: String,
      enum: ["website", "facebook", "instagram", "referral", "other"],
      default: "other",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: String,

    // 🔥 SMART AI FIELDS
    score: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },

    lastContactedAt: Date,

    recommendations: [recommendationSchema],

    history: [historySchema],
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", leadSchema);

export default Lead;