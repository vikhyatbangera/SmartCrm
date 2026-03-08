import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  level: { type: Number, required: true }, // 1: Sales/System, 2: Manager, 3: Admin
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  remarks: String,
  updatedAt: { type: Date, default: Date.now }
});

const quotationSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    products: [{
      productName: String,
      quantity: Number,
      price: Number,
      discount: { type: Number, default: 0 },
      total: Number
    }],
    subtotal: Number,
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentTerms: { type: String, default: "Net 30" },
    validityDays: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "rejected", "sent"],
      default: "draft",
    },
    approvals: [approvalSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model("Quotation", quotationSchema);