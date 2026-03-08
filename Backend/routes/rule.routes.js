import express from "express";
import { createRule, getRules, deleteRule } from "../controllers/rule.controller.js";

const router = express.Router();

router.get("/", getRules);
router.post("/create", createRule);
router.delete("/:id", deleteRule);

export default router;