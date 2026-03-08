import express from "express";
import {
  createQuotation,
  approveQuotation,
  sendQuotation,
  getAllQuotations,
  getQuotationAnalytics,
  generatePdf,
  deleteQuotation
} from "../controllers/quotation.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create new quotation
router.post("/", authMiddleware, createQuotation);

// Approve / Reject quotation
router.put("/:id/approve", authMiddleware, approveQuotation);

// Send quotation to client
router.post("/:id/send", authMiddleware, sendQuotation);

// Get all quotations
router.get("/", authMiddleware, getAllQuotations);

// Get quotation analytics
router.get("/analytics", authMiddleware, getQuotationAnalytics);

// Generate PDF for quotation
router.post("/:id/generate-pdf", authMiddleware, generatePdf);

// Delete quotation (Admin only)
router.delete("/:id", authMiddleware, deleteQuotation);

export default router;