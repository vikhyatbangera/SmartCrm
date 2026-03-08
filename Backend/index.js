import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import quotationRoute from "./routes/quotation.routes.js";
import slaRoute from "./routes/sla.routes.js";
import ruleRoute from "./routes/rule.routes.js";
import userRoute from "./routes/user.routes.js";
import leadRoute from "./routes/lead.routes.js";
import { startSlaMonitor } from "./jobs/slaMonitor.js";
import activityLogRoutes from "./routes/activityLogs.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import analyticsRoutes from "./routes/revenueAnalytics.routes.js";
import activityRoutes from './routes/activityLogs.routes.js';
import notificationRoutes from "./routes/notification.routes.js";
import performanceRoutes from "./routes/performance.routes.js";


dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/api/v1/users", userRoute);
app.use("/api/v1/leads", leadRoute);
app.use("/api/v1/quotations", quotationRoute);
app.use("/api/v1/sla", slaRoute);
app.use("/api/v1/rules", ruleRoute);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/performance", performanceRoutes);
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use('/api/v1/activity-logs', activityRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 SmartCRM Backend Running - Vikhyat Bangera");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

// ================= SERVER START FUNCTION =================
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to Database");

    // Start SLA Monitor ONLY after DB connection
    startSlaMonitor();
    console.log("⏱ SLA Monitor Started");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();