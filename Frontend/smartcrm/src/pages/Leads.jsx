import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Users, Mail, Phone, Building, Calendar, TrendingUp, CheckCircle, Clock, XCircle, BarChart3 } from "lucide-react";

// ====== Lead Management Component ======
export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [leadHistory, setLeadHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewingLead, setViewingLead] = useState(null); // For detailed view

  // ✅ FILTER STATE
  const [filters, setFilters] = useState({
    status: "all",
    assignedTo: "all",
    name: "",
  });

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // ================== FETCH LEADS WITH FILTER ==================
  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads", {
        params: filters,
      });
      setLeads(res.data.data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // ================== FETCH SALES USERS ==================
  const fetchSalesUsers = async () => {
    try {
      const res = await api.get("/users?role=sales");
      setSalesUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching sales users:", error);
    }
  };

  // ================== FETCH NOTIFICATIONS ==================
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchNotifications();
    if (user && user.role !== "sales") {
      fetchSalesUsers();
    }
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchLeads();
  }, [filters]);

  // ================== DELETE LEAD ==================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // ================== STATUS CHANGE ==================
  const handleStatusChange = async (id, status) => {
    try {
      const res = await api.put(`/leads/${id}/status`, { status });
      setLeads((prev) =>
        prev.map((lead) => (lead._id === id ? res.data.data : lead))
      );

      await api.post("/notifications", {
        userId: user._id,
        message: `Lead "${res.data.data.name}" status updated to ${status}`,
      });

      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  // ================== ASSIGN LEAD ==================
  const handleAssign = async (leadId, userId) => {
    if (!userId) return;
    try {
      const res = await api.put(`/leads/${leadId}/assign`, { userId });

      setLeads((prev) =>
        prev.map((lead) => (lead._id === leadId ? res.data.data : lead))
      );

      setShowAssignModal(false);
      setSelectedLead(null);

      await api.post("/notifications", {
        userId,
        message: `New lead assigned: ${res.data.data.name}`,
      });

      fetchNotifications();
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  // ================== VIEW LEAD HISTORY ==================
  const viewHistory = async (leadId) => {
    try {
      const res = await api.get(`/leads/${leadId}`);
      setLeadHistory(res.data.data.history || []);
      setShowHistoryModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  // ================== VIEW LEAD DETAILS ==================
  const viewLeadDetails = async (leadId) => {
    try {
      const res = await api.get(`/leads/${leadId}`);
      setViewingLead(res.data.data);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      toast.error("Failed to load lead details");
    }
  };

  const closeLeadDetails = () => {
    setViewingLead(null);
  };

  if (!user) return null;

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-orange-400">
          Leads Management
        </h1>

        <div className="flex gap-4 items-center">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-xl"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1.5 text-xs">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 bg-[#1f1f1f] border border-orange-500/20 shadow-xl rounded-lg p-3 max-h-60 overflow-y-auto z-50">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="border-b border-orange-500/10 py-2 text-sm text-gray-300"
                    >
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/add-lead")}
            className="bg-orange-600 hover:bg-orange-700 transition px-4 py-2 rounded-lg font-medium"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* ================= FILTER SECTION ================= */}
      <div className="bg-[#1f1f1f] border border-orange-500/20 p-5 rounded-xl mb-6 grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-white"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        {user.role !== "sales" && (
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-white"
          >
            <option value="all">All Assigned</option>
            {salesUsers.map((sales) => (
              <option key={sales._id} value={sales._id}>{sales.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setFilters({ status: "all", assignedTo: "all", name: "" })}
          className="bg-gray-700 hover:bg-gray-600 transition px-4 py-2 rounded-lg text-sm text-white"
        >
          Reset
        </button>
      </div>

      {/* RESULTS COUNT */}
      <div className="mb-4 text-sm text-gray-400 font-medium">
        {leads.length} result{leads.length !== 1 && "s"} found
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#262626] text-gray-400">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Revenue</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">SLA</th>
              <th className="p-4 text-left">Assigned To</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No leads found
                </td>
              </tr>
            )}

            {leads.map((lead) => {
              const slaHours = 24;
              const createdAt = new Date(lead.createdAt);
              const slaDeadline = new Date(createdAt.getTime() + slaHours * 3600 * 1000);
              const slaStatus = new Date() > slaDeadline ? "breached" : "pending";

              return (
                <tr key={lead._id} className="border-b border-orange-500/10 hover:bg-[#262626] transition">
                  <td className="p-4 font-medium">
                    <button 
                      onClick={() => viewLeadDetails(lead._id)}
                      className="text-orange-400 hover:text-orange-300 hover:underline transition"
                    >
                      {lead.name}
                    </button>
                  </td>
                  <td className="p-4 font-semibold text-green-400">₹{lead.revenue || 0}</td> {/* ✅ Display Revenue */}
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                      className="bg-[#262626] border border-orange-500/20 rounded px-2 py-1 text-xs focus:outline-none text-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className={`p-4 font-semibold ${slaStatus === "breached" ? "text-red-400" : "text-green-400"}`}>
                    {slaStatus === "breached" ? "Overdue" : "On Time"}
                  </td>
                  <td className="p-4 text-gray-300 text-xs">{lead.assignedTo?.name || "Unassigned"}</td>
                  <td className="p-4 flex gap-2 flex-wrap">
                    {(user.role === "admin" || user.role === "manager") && (
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowAssignModal(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-xs text-white"
                      >
                        Assign
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/edit-lead/${lead._id}`)}
                      className="bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => viewHistory(lead._id)}
                      className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-white"
                    >
                      History
                    </button>
                    {user.role === "admin" && (
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs text-white"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= ASSIGN LEAD MODAL ================= */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-orange-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-orange-400">Assign Lead</h2>
            <p className="text-gray-400 text-sm mb-6">Assigning: <span className="text-white font-medium">{selectedLead?.name}</span></p>
            
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Select Sales Executive</label>
            <select 
              className="w-full bg-[#262626] border border-orange-500/20 text-white p-3 rounded-lg mb-6 focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => handleAssign(selectedLead._id, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Choose an executive...</option>
              {salesUsers.map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>

            <button 
              onClick={() => setShowAssignModal(false)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================= LEAD HISTORY MODAL ================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] border border-orange-500/30 p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-orange-400">Activity History</h2>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {leadHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic">No activity logs found for this lead.</div>
              ) : (
                leadHistory.map((h, i) => (
                  <div key={i} className="relative pl-6 pb-4 border-l-2 border-orange-500/20 last:border-0 text-white">
                    <div className="absolute -left-2.25 top-1 w-4 h-4 rounded-full bg-orange-600 border-4 border-[#1f1f1f]"></div>
                    <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-gray-200">{h.action}</p>
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                          {new Date(h.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{new Date(h.timestamp).toLocaleTimeString()}</p>
                      <div className="text-sm text-gray-400">
                        Modified by: <span className="text-orange-300/80">{h.updatedBy?.name || "System"}</span>
                      </div>
                      {h.oldStatus && (
                        <div className="mt-2 text-xs flex items-center gap-2">
                          <span className="text-gray-500 line-through">{h.oldStatus}</span>
                          <span className="text-orange-500">→</span>
                          <span className="text-green-400 font-medium">{h.newStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= LEAD DETAILED VIEW MODAL ================= */}
      {viewingLead && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1f1f1f] border border-orange-500/30 rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-orange-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-2xl">
                  {viewingLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{viewingLead.name}</h2>
                  <p className="text-sm text-gray-400">Lead Details Overview</p>
                </div>
              </div>
              <button 
                onClick={closeLeadDetails}
                className="text-gray-400 hover:text-white transition"
              >
                <XCircle size={32} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <Users size={20} />
                  Basic Information
                </h3>
                
                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Email:</span>
                  </div>
                  <p className="text-white ml-7">{viewingLead.email || 'Not provided'}</p>
                </div>

                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Phone:</span>
                  </div>
                  <p className="text-white ml-7">{viewingLead.phone}</p>
                </div>

                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Building size={18} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Company:</span>
                  </div>
                  <p className="text-white ml-7">{viewingLead.company || 'Not provided'}</p>
                </div>

                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-gray-400 text-sm">Created:</span>
                  </div>
                  <p className="text-white ml-7">{new Date(viewingLead.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Right Column - Status & Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Status & Metrics
                </h3>

                {/* Status Badge */}
                <div className={`p-4 rounded-xl border ${
                  viewingLead.status === 'won' ? 'bg-green-500/20 border-green-500/30' :
                  viewingLead.status === 'qualified' ? 'bg-blue-500/20 border-blue-500/30' :
                  viewingLead.status === 'contacted' ? 'bg-purple-500/20 border-purple-500/30' :
                  viewingLead.status === 'lost' ? 'bg-red-500/20 border-red-500/30' :
                  'bg-gray-500/20 border-gray-500/30'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle size={20} className={
                      viewingLead.status === 'won' ? 'text-green-400' :
                      viewingLead.status === 'qualified' ? 'text-blue-400' :
                      viewingLead.status === 'contacted' ? 'text-purple-400' :
                      viewingLead.status === 'lost' ? 'text-red-400' :
                      'text-gray-400'
                    } />
                    <span className="text-gray-300 text-sm font-medium">Current Status</span>
                  </div>
                  <p className={`text-2xl font-bold capitalize ml-8 ${
                    viewingLead.status === 'won' ? 'text-green-400' :
                    viewingLead.status === 'qualified' ? 'text-blue-400' :
                    viewingLead.status === 'contacted' ? 'text-purple-400' :
                    viewingLead.status === 'lost' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {viewingLead.status}
                  </p>
                </div>

                {/* Revenue */}
                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={18} className="text-orange-400" />
                    <span className="text-gray-400 text-sm">Revenue:</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400 ml-7">
                    ₹ {viewingLead.revenue?.toLocaleString() || 0}
                  </p>
                </div>

                {/* Source */}
                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp size={18} className="text-blue-400" />
                    <span className="text-gray-400 text-sm">Source:</span>
                  </div>
                  <p className="text-white ml-7 capitalize">{viewingLead.source}</p>
                </div>
              </div>

              {/* Full Width - Assignment Info */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <Users size={20} />
                  Assignment Information
                </h3>
                <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Assigned To:</p>
                    <p className="text-white font-medium">
                      {viewingLead.assignedTo?.name || (
                        <span className="text-gray-500 italic">Unassigned</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {viewingLead.assignedTo?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingLead.notes && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                    <Building size={20} />
                    Notes
                  </h3>
                  <div className="bg-[#262626] p-4 rounded-xl border border-orange-500/10">
                    <p className="text-gray-300 whitespace-pre-wrap">{viewingLead.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-orange-500/20 flex justify-end gap-3">
              <button
                onClick={closeLeadDetails}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
              >
                Close
              </button>
              {(user.role === 'admin' || user.role === 'manager') && (
                <button
                  onClick={() => {
                    closeLeadDetails();
                    setSelectedLead(viewingLead);
                    setShowAssignModal(true);
                  }}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium flex items-center gap-2"
                >
                  <Users size={18} />
                  Assign Lead
                </button>
              )}
              <button
                onClick={() => {
                  closeLeadDetails();
                  navigate(`/edit-lead/${viewingLead._id}`);
                }}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}