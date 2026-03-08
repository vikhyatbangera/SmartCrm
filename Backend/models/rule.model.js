import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  condition: {
    field: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
  },

  action: {
    type: {
      type: String,
      required: true,
      enum: ['assign', 'reminder', 'email', 'notify']
    },
    value: {
      type: String,
      required: true
    },
  },
}, { timestamps: true });

export default mongoose.model("Rule", ruleSchema);