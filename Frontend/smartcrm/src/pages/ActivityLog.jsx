import { useEffect, useState } from "react";
import api from "../api/axios";
import { Activity } from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      // ✅ FIXED: Base URL is already /api/v1
      const res = await api.get("/activity-logs"); 
      setLogs(res.data.data || []); // ✅ Access res.data.data
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) return <div className="p-8">Loading activity logs...</div>;

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-orange-400"><Activity /> Activity Logs</h1>
      <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#262626] text-gray-400">
            <tr><th className="p-4">User</th><th className="p-4">Action</th><th className="p-4">Module</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="border-t border-orange-500/10 hover:bg-[#262626]">
                <td className="p-4">{log.user?.name || "System"}</td>
                <td className="p-4">{log.action}</td>
                <td className="p-4">{log.module}</td>
                <td className="p-4">{new Date(log.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}