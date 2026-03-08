import express from "express";
import {
  signup,
  login,
  getAllUsers,
  getUserById,
  getProfile,
  updateUser,
  deleteUser,
  updatePassword,
  approveUser,
  getSalesExecutives,
  getMyTeam
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// AUTH
router.post("/signup", signup);
router.post("/login", login);

// PROFILE
router.get("/profile", authMiddleware, getProfile);

// USER MANAGEMENT
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  getAllUsers
);

router.get(
  "/my-team",
  authMiddleware,
  roleMiddleware("manager"),
  getMyTeam
);

router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware("admin"),
  approveUser
);

router.put("/change-password", authMiddleware, updatePassword);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "manager"),
  getUserById
);

router.get("/sales", getSalesExecutives);

export default router;