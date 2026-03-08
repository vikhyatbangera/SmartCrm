import { useEffect, useState } from "react";
import { Star, Clock, TrendingUp, AlertTriangle, Target, Calendar, Bell } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function SalesDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalRevenue: 0,
    pendingLeads: 0
  });
  const [leads, setLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      // Fetch personal KPI performance, leads, and notifications simultaneously 
      const [perfRes, leadsRes, notifRes] = await Promise.all([
        api.get("/performance/my-performance").catch(() => ({ data: { data: {} } })),
        api.get(`/leads?assignedTo=${user.id}`).catch(() => ({ data: { data: [] } })),
        api.get("/notifications").catch(() => ({ data: { data: [] } }))
      ]);

      const performanceData = perfRes.data.data || {};
      const leadsData = leadsRes.data.data || leadsRes.data || [];
      const notificationsData = notifRes.data.data || notifRes.data || [];

      setStats({
        totalLeads: performanceData.totalLeads || 0,
        convertedLeads: performanceData.convertedLeads || 0,
        conversionRate: performanceData.conversionRate || 0,
        totalRevenue: performanceData.totalRevenue || 0,
        pendingLeads: performanceData.pendingLeads || 0
      });
      
      setLeads(leadsData);
      setNotifications(notificationsData.slice(0, 5)); // Get latest 5 notifications
    } catch (error) {
      toast.error("Failed to load your dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  // SLA Monitoring Logic (24h)
  const slaBreachedLeads = leads.filter((lead) => {
    const createdAt = new Date(lead.createdAt);
    const deadline = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    return new Date() > deadline && lead.status !== "won" && lead.status !== "lost";
  });

  // Follow-Up Reminders - Leads needing attention
  const followUpReminders = leads.filter((lead) => {
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const lastContacted = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null;
    
    // High priority: Not contacted in 3+ days OR never contacted
    if ((lastContacted && lastContacted < threeDaysAgo) || (!lastContacted)) {
      return lead.status !== "won" && lead.status !== "lost";
    }
    return false;
  }).sort((a, b) => {
    // Sort by score (higher first) then by last contacted (older first)
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    const dateA = a.lastContactedAt ? new Date(a.lastContactedAt) : new Date(0);
    const dateB = b.lastContactedAt ? new Date(b.lastContactedAt) : new Date(0);
    return dateA - dateB;
  });

  // Recent Activity - Recently updated leads
  const recentActivity = [...leads]
    .filter(lead => lead.status !== "won" && lead.status !== "lost")
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <div className="p-8 bg-[#121212] min-h-screen text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-orange-500">My Sales Desk</h1>
        <p className="mt-4 text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-orange-500">My Sales Desk</h1>

      {/* ===============================
          🔢 TOP KPI CARDS
      =============================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
          <p className="text-gray-400 text-sm">Assigned Leads</p>
          <p className="text-2xl font-bold">{stats.totalLeads}</p>
        </div>

        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
          <p className="text-gray-400 text-sm">Won Deals</p>
          <p className="text-2xl font-bold text-green-500">{stats.convertedLeads}</p>
        </div>

        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
          <p className="text-gray-400 text-sm">Conversion Rate</p>
          <p className="text-2xl font-bold text-blue-500">{stats.conversionRate}%</p>
        </div>

        <div className="bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
          <p className="text-gray-400 text-sm">Revenue Generated</p>
          <p className="text-2xl font-bold text-purple-500">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* ===============================
          🗂️ MAIN DASHBOARD GRIDS
      =============================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 📞 Follow-Up Reminders */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl border border-orange-500/20 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-orange-500">
            <Calendar size={18} />
            Follow-Up Reminders
          </h3>

          {followUpReminders.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No follow-ups needed. Great job!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {followUpReminders.slice(0, 5).map((lead) => {
                const daysSinceContact = lead.lastContactedAt 
                  ? Math.floor((new Date() - new Date(lead.lastContactedAt)) / (1000 * 60 * 60 * 24))
                  : null;
                
                return (
                  <div key={lead._id} className="p-3 border border-orange-500/10 bg-[#121212] rounded-lg hover:border-orange-500/30 transition">
                    <p className="font-semibold text-white text-sm">
                      {lead.company || lead.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 capitalize">
                        {lead.status}
                      </span>
                      {daysSinceContact !== null && (
                        <span className="text-gray-500">
                          • {daysSinceContact}d ago
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 🔔 Recent Notifications */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl border border-orange-500/20 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-purple-500">
            <Bell size={18} />
            Recent Notifications
          </h3>

          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No new notifications
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif._id} className="p-3 border border-purple-500/10 bg-[#121212] rounded-lg">
                  <p className="text-white text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📊 Personal Stats */}
        <div className="bg-[#1f1f1f] p-5 rounded-xl border border-orange-500/20 shadow-sm">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <Clock size={18} />
            My Pipeline
          </h3>

          <ul className="space-y-3">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-sm">Active Deals</span>
              <span className="font-bold text-blue-500">{stats.pendingLeads}</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400 text-sm">Lost Deals</span>
              <span className="font-bold text-red-500">
                {leads.filter(l => l.status === "lost").length}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400 text-sm">SLA Breaches</span>
              <span className="font-bold text-red-500">{slaBreachedLeads.length}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ===============================
          📈 RECENT ACTIVITY SECTION
      =============================== */}
      <div className="mt-6 bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-500">
          <TrendingUp size={20} />
          Recent Activity
        </h3>

        {recentActivity.length === 0 ? (
          <p className="text-gray-400">No recent activity to show</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivity.map((lead) => (
              <div key={lead._id} className="p-4 bg-[#121212] rounded-lg border border-blue-500/10">
                <p className="font-semibold text-white text-sm">{lead.company || lead.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Updated: {new Date(lead.updatedAt).toLocaleDateString()}
                </p>
                <span className="inline-block mt-2 px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs capitalize">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===============================
          🚨 SLA ALERT SECTION
      =============================== */}
      {slaBreachedLeads.length > 0 && (
        <div className="mt-8 bg-[#1f1f1f] p-6 rounded-xl border border-red-500/20">
          <h3 className="font-bold text-red-500 flex items-center gap-2 mb-3">
            <AlertTriangle size={18} />
            Urgent Attention Required
          </h3>
          {slaBreachedLeads.slice(0, 5).map((lead) => (
            <p key={lead._id} className="text-red-400 text-sm py-1 border-b border-red-500/10 last:border-0">
              SLA breached for <span className="font-bold">{lead.company || lead.name}</span>
            </p>
          ))}
        </div>
      )}

      {/* ===============================
          🎯 Monthly Target Section
      =============================== */}
      <div className="mt-8 bg-[#1f1f1f] p-6 rounded-xl border border-orange-500/20 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-500">
          <Target size={20} />
          Monthly Target Progress
        </h3>

        {(() => {
          const monthlyTarget = 500000; // You can adjust this baseline target
          const progress = Math.min(((stats.totalRevenue / monthlyTarget) * 100).toFixed(1), 100);

          return (
            <>
              <p className="text-gray-400 mb-2">
                ₹{stats.totalRevenue.toLocaleString()} / ₹{monthlyTarget.toLocaleString()}
              </p>
              <div className="w-full bg-gray-800 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">{progress}% of monthly target achieved</p>
            </>
          );
        })()}
      </div>
    </div>
  );
}