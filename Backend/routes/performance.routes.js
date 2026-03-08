import express from "express";
import { getMyPerformance } from "../controllers/performance.controller.js";
import authMiddleware from "../middleware/authMiddleware.js"; // ✅ Correct import

const router = express.Router();

router.get("/my-performance", authMiddleware, getMyPerformance); // ✅ Use authMiddleware

export default router;