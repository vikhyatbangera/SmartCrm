import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  UserCheck,
  UserCircle,
  LogOut,
  Bell
} from "lucide-react";

const Sidebar = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/login");
  };

  const linkClass = (path) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? "bg-orange-600/20 text-orange-400 font-semibold"
        : "text-gray-300 hover:text-orange-400 hover:bg-orange-500/10"
    }`;

  return (
    <div className="w-64 h-screen bg-linear-to-b from-black via-slate-900 to-orange-950 text-white p-5 fixed flex flex-col shadow-2xl">
      
      {/* Logo */}
      <h1 className="text-2xl font-bold mb-10 text-orange-500 tracking-wide">
        SmartCRM
      </h1>

      <nav className="space-y-3 flex-1 text-sm">

        {/* ================= SALES EXECUTIVE ================= */}
        {user?.role === "sales" && (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link to="/leads" className={linkClass("/leads")}>
              <Users size={18} /> My Leads
            </Link>

            <Link to="/quotations" className={linkClass("/quotations")}>
              <FileText size={18} /> Quotations
            </Link>

            <Link to="/performance" className={linkClass("/performance")}>
              <Clock size={18} /> My Performance
            </Link>

            <Link to="/notifications" className={linkClass("/notifications")}>
              <Bell size={18} /> Notifications
            </Link>
          </>
        )}

        {/* ================= MANAGER ================= */}
        {user?.role === "manager" && (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link to="/leads" className={linkClass("/leads")}>
              <Users size={18} /> Leads
            </Link>

            <Link to="/quotations" className={linkClass("/quotations")}>
              <FileText size={18} /> Quotations
            </Link>

            <Link to="/team-performance" className={linkClass("/team-performance")}>
              <UserCheck size={18} /> Team Performance
            </Link>

            <Link to="/sla-monitoring" className={linkClass("/sla-monitoring")}>
              <Clock size={18} /> SLA Monitoring
            </Link>

            <Link to="/reports" className={linkClass("/reports")}>
              <ShieldCheck size={18} /> Reports
            </Link>

            <Link to="/notifications" className={linkClass("/notifications")}>
              <Bell size={18} /> Notifications
            </Link>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {user?.role === "admin" && (
          <>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link to="/leads" className={linkClass("/leads")}>
              <Users size={18} /> Leads
            </Link>

            <Link to="/quotations" className={linkClass("/quotations")}>
              <FileText size={18} /> Quotations
            </Link>

            <Link to="/reports" className={linkClass("/reports")}>
              <ShieldCheck size={18} /> Reports
            </Link>

            <Link to="/revenue-analytics" className={linkClass("/revenue-analytics")}>
              <ShieldCheck size={18} /> Revenue Analytics
            </Link>

            <Link to="/user-approvals" className={linkClass("/user-approvals")}>
              <UserCheck size={18} /> User Approvals
            </Link>

            <Link to="/sla" className={linkClass("/sla")}>
              <Clock size={18} /> SLA Policies
            </Link>

            <Link to="/rules" className={linkClass("/rules")}>
              <ShieldCheck size={18} /> Automation Rules
            </Link>

            <Link to="/activity-logs" className={linkClass("/activity-logs")}>
              <ShieldCheck size={18} /> Activity Logs
            </Link>

            <Link to="/notifications" className={linkClass("/notifications")}>
              <Bell size={18} /> Notifications
            </Link>
          </>
        )}
      </nav>

      {/* ================= PROFILE + LOGOUT ================= */}
      <div className="mt-auto pt-5 border-t border-orange-500/20">
        
        <Link
          to="/profile"
          className="flex items-center gap-3 text-gray-300 hover:text-amber-400 mb-4 transition"
        >
          <UserCircle size={18} /> My Profile
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;