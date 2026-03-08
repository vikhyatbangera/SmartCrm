import express from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  updateLeadStatus,
} from "../controllers/lead.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager", "sales"),
  createLead
);

router.get("/", authMiddleware, getAllLeads);

router.get("/:id", authMiddleware, getLeadById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager", "sales"),
  updateLead
);

router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  assignLead
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "manager", "sales"),
  updateLeadStatus
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteLead
);




export default router;