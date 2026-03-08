import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Bell, CheckCircle2, Check, Trash2, Filter } from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Auto-fetch notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    fetchTotalUnreadCount();
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchTotalUnreadCount();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = "/notifications?";
      const params = [];
      
      if (filterType !== 'all') {
        params.push(`type=${filterType}`);
      }
      if (showUnreadOnly) {
        params.push(`unreadOnly=true`);
      }
      
      url += params.join('&');
      
      const res = await api.get(url);
      
      // ✅ Safety check: handle different possible backend response structures
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setNotifications(data);
    } catch (err) {
      console.error("Notification Fetch Error:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalUnreadCount = async () => {
    try {
      const res = await api.get("/notifications?unreadOnly=true");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setTotalUnreadCount(data.length);
    } catch (err) {
      console.error("Fetch Unread Count Error:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Update total unread count
      setTotalUnreadCount(prev => Math.max(0, prev - 1));
      toast.success("Marked as read");
    } catch (err) {
      console.error("Mark Read Error:", err);
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/mark-all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setTotalUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Mark All Read Error:", err);
      toast.error("Failed to clear notifications");
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete notification");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Notification type icons and colors
  const getTypeStyles = (type) => {
    const styles = {
      LEAD_ASSIGNED: { icon: '📋', color: 'blue', label: 'Lead Assigned' },
      LEAD_STATUS_UPDATED: { icon: '🔄', color: 'purple', label: 'Status Updated' },
      LEAD_WON: { icon: '🎉', color: 'green', label: 'Deal Won' },
      LEAD_LOST: { icon: '😞', color: 'red', label: 'Lead Lost' },
      SLA_BREACH: { icon: '⚠️', color: 'red', label: 'SLA Breach' },
      SLA_WARNING: { icon: '⏰', color: 'orange', label: 'SLA Warning' },
      QUOTATION_CREATED: { icon: '📄', color: 'blue', label: 'Quotation Created' },
      QUOTATION_APPROVAL_REQUEST: { icon: '✅', color: 'orange', label: 'Approval Required' },
      QUOTATION_APPROVED: { icon: '✓', color: 'green', label: 'Approved' },
      QUOTATION_REJECTED: { icon: '✗', color: 'red', label: 'Rejected' },
      NEW_USER_REGISTERED: { icon: '👤', color: 'blue', label: 'New User' },
      ACCOUNT_APPROVED: { icon: '✓', color: 'green', label: 'Account Approved' },
      ACCOUNT_REJECTED: { icon: '✗', color: 'red', label: 'Account Rejected' },
      AUTOMATION_TRIGGERED: { icon: '⚡', color: 'yellow', label: 'Automation' },
      SYSTEM_ALERT: { icon: '🔔', color: 'red', label: 'System Alert' },
      LEAD_ASSIGNED_BY_MANAGER: { icon: '📋', color: 'blue', label: 'Assigned by Manager' },
      PROFILE_UPDATED: { icon: '👤', color: 'green', label: 'Profile Updated' },
      NEW_COMMENT_ON_LEAD: { icon: '💬', color: 'purple', label: 'New Comment' }
    };
    return styles[type] || { icon: '🔔', color: 'gray', label: 'Notification' };
  };

  const getBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30',
      green: 'bg-green-500/20 border-green-500/30',
      red: 'bg-red-500/20 border-red-500/30',
      orange: 'bg-orange-500/20 border-orange-500/30',
      purple: 'bg-purple-500/20 border-purple-500/30',
      yellow: 'bg-yellow-500/20 border-yellow-500/30',
      gray: 'bg-gray-500/20 border-gray-500/30'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 max-w-6xl gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-orange-400">
          <Bell /> Notifications 
          {totalUnreadCount > 0 && (
            <span className="text-sm bg-red-500 text-white px-3 py-1 rounded-full font-bold">
              {totalUnreadCount} New
            </span>
          )}
        </h1>

        <div className="flex gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setTimeout(fetchNotifications, 100);
            }}
            className="bg-[#1f1f1f] border border-orange-500/20 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Types</option>
            <option value="LEAD_ASSIGNED">Lead Assigned</option>
            <option value="LEAD_WON">Deal Won</option>
            <option value="LEAD_LOST">Lead Lost</option>
            <option value="SLA_BREACH">SLA Breach</option>
            <option value="QUOTATION_APPROVED">Quotations</option>
            <option value="ACCOUNT_APPROVED">Account</option>
          </select>

          {/* Unread Toggle */}
          <button
            onClick={() => {
              setShowUnreadOnly(!showUnreadOnly);
              setTimeout(fetchNotifications, 100);
            }}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              showUnreadOnly
                ? 'bg-orange-600 text-white'
                : 'bg-[#1f1f1f] border border-gray-700 text-gray-300'
            }`}
          >
            Unread Only
          </button>

          {/* Mark All Read */}
          {totalUnreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-sm bg-[#1f1f1f] border border-gray-700 hover:bg-gray-800 transition px-4 py-2 rounded-lg text-gray-300 flex items-center gap-2"
            >
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 max-w-6xl">
        {notifications.length === 0 ? (
          <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-xl p-10 text-center text-gray-500">
            <Bell size={40} className="mx-auto mb-3 opacity-20" />
            <p>You have no notifications at the moment.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const typeStyle = getTypeStyles(n.type);
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-5 rounded-xl border flex justify-between items-start transition-all cursor-pointer ${
                  n.isRead 
                    ? "bg-[#1f1f1f]/50 border-gray-800 opacity-70" 
                    : `bg-[#1f1f1f] border-orange-500/30 shadow-md shadow-orange-900/10`
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getBgColor(typeStyle.color)}`}>
                    {typeStyle.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getBgColor(typeStyle.color)}`}>
                        {typeStyle.label}
                      </span>
                      {!n.isRead && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-medium">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${n.isRead ? "text-gray-400" : "text-white"}`}>
                      {n.title}
                    </h3>
                    <p className={`text-sm ${n.isRead ? "text-gray-500" : "text-gray-300"}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(n._id);
                      }}
                      className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 p-2 rounded-full transition flex shrink-0"
                      title="Mark as Read"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n._id);
                    }}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition flex shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}