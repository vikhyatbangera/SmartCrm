import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import Sidebar from "./component/Sidebar";

// Page Imports
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import Quotations from "./pages/Quotations";
import SlaManagement from "./pages/SlaManagement";
import SlaMonitoring from "./pages/SlaMonitoring";
import AutomationRules from "./pages/AutomationRules";
import UserApprovals from "./pages/UserApprovals";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import EditLead from "./pages/EditLead";
import Unauthorized from "./component/Unauthorized";
import TeamPerformance from "./pages/TeamPerformance";
import Notifications from "./pages/Notification";
import MyPerformance from "./pages/MyPerformance";
import Reports from "./pages/Reports";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import ActivityLogs from "./pages/ActivityLog";
import CreateQuotation from './pages/CreateQuotation';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  if (loading) return null;

  // ✅ Single Clean Protected Route
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Toaster position="top-center" />

      <div className="flex min-h-screen">
        {/* Pass state setters to Sidebar for clean logout without refresh */}
        {isAuthenticated && (
          <Sidebar setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        )}

        <div className={`flex-1 ${isAuthenticated ? "ml-64" : ""}`}>
          <Routes>

            {/* ================= PUBLIC ================= */}

            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login
                    setIsAuthenticated={setIsAuthenticated}
                    setUser={setUser}
                  />
                )
              }
            />

            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup />
                )
              }
            />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ================= PROTECTED (ALL ROLES) ================= */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/quotations/create" element={<CreateQuotation />} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-lead"
              element={
                <ProtectedRoute>
                  <AddLead />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-lead/:id"
              element={
                <ProtectedRoute>
                  <EditLead />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotations"
              element={
                <ProtectedRoute>
                  <Quotations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* ================= SALES ONLY ================= */}

            <Route
              path="/performance"
              element={
                <ProtectedRoute allowedRoles={["sales"]}>
                  <MyPerformance />
                </ProtectedRoute>
              }
            />

            {/* ================= MANAGER ONLY ================= */}

            <Route
              path="/team-performance"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <TeamPerformance />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sla-monitoring"
              element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}>
                  <SlaMonitoring />
                </ProtectedRoute>
              }
            />

            {/* ================= ADMIN + MANAGER ================= */}

            <Route
              path="/sla"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <SlaManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* ================= ADMIN ONLY ================= */}

            <Route
              path="/user-approvals"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserApprovals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rules"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AutomationRules />
                </ProtectedRoute>
              }
            />

            <Route
              path="/revenue-analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <RevenueAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/activity-logs"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />

            {/* ================= DEFAULT ================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  replace
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  replace
                />
              }
            />

          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;