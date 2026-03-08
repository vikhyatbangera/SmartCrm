import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendNewUserRegisteredNotification,
  sendAccountApprovedNotification,
  sendAccountRejectedNotification
} from "../utils/createNotification.js";
import { logActivity } from "../middleware/logActivity.js";

/**
 * 🔹 SIGNUP (Register User)
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      managerId: null, // 🔥 Always null at signup
      isApproved: role === "admin"
    });

    // ✅ Send notification to all admins about new user registration
    if (!user.isApproved) {
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      if (adminIds.length > 0) {
        await sendNewUserRegisteredNotification(adminIds, user.name, user.email);
      }
    }

    return res.status(201).json({
      message: user.isApproved
        ? "User registered successfully"
        : "Registration successful. Awaiting admin approval.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        isApproved: user.isApproved
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/**
 * 🔹 LOGIN
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Your account is pending approval. Please contact the administrator."
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId
      }
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/**
 * 🔹 Approve User (Admin Only)
 */
export const approveUser = async (req, res) => {
  try {
    const { managerId } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 If Sales, managerId is required during approval
    if (user.role === "sales" && !managerId) {
      return res.status(400).json({
        message: "Please assign a manager before approving Sales Executive."
      });
    }

    user.isApproved = true;

    if (user.role === "sales") {
      user.managerId = managerId;
    }

    await user.save();

    // ✅ Send notification to user about account approval
    await sendAccountApprovedNotification(user._id);

    return res.status(200).json({
      message: "User approved successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/**
 * 🔹 Get All Users
 */
export const getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select("name email role isApproved managerId");

    res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getMyTeam = async (req, res) => {
  try {
    const team = await User.find({
      managerId: req.user.id,
      role: "sales"
    }).select("name email role isApproved");

    res.status(200).json({
      success: true,
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password, managerId } = req.body;

    const updateData = { name, email, role };

    if (role === "sales") {
      updateData.managerId = managerId || null;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // ✅ Send notification if user was rejected (deleted before approval)
    if (!user.isApproved) {
      await sendAccountRejectedNotification(user._id, "Admin rejected your account registration");
    }
    
    // ✅ Log activity
    await logActivity(req.user.id, `Deleted user ${user.name} (${user.email})`, "User Management");
    
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getSalesExecutives = async (req, res) => {
  try {
    const salesUsers = await User.find({ role: "sales" }).select("name email");
    res.status(200).json({ success: true, users: salesUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};