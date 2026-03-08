import mongoose from "mongoose";

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slaHours: {
      type: Number,
      required: true, // 24 / 48 / custom
    },
    escalationEmail: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true }
);

export const SlaPolicy = mongoose.model("SlaPolicy", slaPolicySchema);