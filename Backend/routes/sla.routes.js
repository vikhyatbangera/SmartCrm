import express from "express";
import {
  getSlaInstances,
  getSlaPolicies,
  createSlaPolicy,
  deleteSlaPolicy,
  startSla,
  resolveSla,
} from "../controllers/sla.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/instances", authMiddleware, getSlaInstances);
router.get("/policy", authMiddleware, getSlaPolicies);
router.post("/policy", authMiddleware, createSlaPolicy);
router.delete("/policy/:id", authMiddleware, deleteSlaPolicy);
router.post("/start", authMiddleware, startSla);
router.put("/:id/resolve", authMiddleware, resolveSla);

export default router;