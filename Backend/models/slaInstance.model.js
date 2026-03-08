import mongoose from "mongoose";

const slaInstanceSchema = new mongoose.Schema(
  {
    relatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // can be lead/ticket/etc
    },
    module: {
      type: String,
      required: true, // "lead", "ticket"
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SlaPolicy",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    breachTime: Date,
    status: {
      type: String,
      enum: ["active", "breached", "resolved"],
      default: "active",
    },
    escalated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SlaInstance = mongoose.model("SlaInstance", slaInstanceSchema);