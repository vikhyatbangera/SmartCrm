import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FileText, Search } from "lucide-react";

export default function Reports() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    status: "",
    source: "",
    salesExecutive: ""
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Filter out empty values
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      
      console.log("🎯 All Filters:", filters);
      console.log("🚀 Active Filters (sent to API):", activeFilters);
      
      const res = await api.get("/reports", { params: activeFilters });
      console.log("📦 API Response:", res.data);
      
      // Handle different response structures
      const data = Array.isArray(res.data) ? res.data : 
                   res.data?.data || [];
      setReportData(data);
      if (data.length === 0) {
        toast.info("No results found for the selected filters");
      } else {
        toast.success(`Found ${data.length} report(s)`);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  // Initial load - don't auto-fetch, let user click Generate button
  // useEffect(() => {
  //   fetchReport();
  // }, []);

  return (
    <div className=" p-8 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-white">
        <FileText className="text-orange-400" size={32} /> Reports
      </h1>

      {/* Filters */}
      <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow border border-orange-500/20 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <Search size={20} className="text-white" />
          Filter Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              className="border border-gray-600 p-2 rounded bg-[#121212] text-white focus:outline-none focus:border-orange-500 transition [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-150 [&::-webkit-inner-spin-button]:invert [&::-webkit-inner-spin-button]:brightness-150"
              onChange={(e) =>
                setFilters({ ...filters, start: e.target.value })
              }
              value={filters.start}
            />
          </div>
          
          {/* End Date */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              className="border border-gray-600 p-2 rounded bg-[#121212] text-white focus:outline-none focus:border-orange-500 transition [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-150 [&::-webkit-inner-spin-button]:invert [&::-webkit-inner-spin-button]:brightness-150"
              onChange={(e) =>
                setFilters({ ...filters, end: e.target.value })
              }
              value={filters.end}
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Status</label>
            <select
              className="border border-gray-600 p-2 rounded bg-[#121212] text-white focus:outline-none focus:border-orange-500 transition"
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              value={filters.status}
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          {/* Source Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Source</label>
            <select
              className="border border-gray-600 p-2 rounded bg-[#121212] text-white focus:outline-none focus:border-orange-500 transition"
              onChange={(e) =>
                setFilters({ ...filters, source: e.target.value })
              }
              value={filters.source}
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-white px-6 py-2 rounded flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={18} />
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(filters.start || filters.end || filters.status || filters.source) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({
                  start: "",
                  end: "",
                  status: "",
                  source: ""
                });
                fetchReport();
              }}
              className="text-sm text-gray-400 hover:text-orange-400 transition flex items-center gap-1"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className="bg-[#1f1f1f] shadow-lg rounded-2xl overflow-hidden border border-orange-500/20">
        {reportData.length === 0 && !loading ? (
          <div className="p-12 text-center text-gray-400">
            <FileText size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No reports found for the selected filters.</p>
            <p className="text-sm mt-2 text-gray-500">Try adjusting your filters or clear them to see all data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead className="bg-[#121212] border-b border-orange-500/20">
                <tr>
                  <th className="p-4 text-gray-400 font-semibold text-sm">Lead Name</th>
                  <th className="p-4 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="p-4 text-gray-400 font-semibold text-sm">Sales Executive</th>
                  <th className="p-4 text-gray-400 font-semibold text-sm">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-800 hover:bg-[#2a2a2a] transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{item.leadName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 text-xs uppercase font-bold rounded-full border ${
                        item.status === 'won' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        item.status === 'qualified' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        item.status === 'contacted' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        item.status === 'new' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">
                          {item.salesExecutive?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-gray-300">
                          {item.salesExecutive?.name || (
                            <span className="text-gray-500 italic">Unassigned</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-orange-400 font-bold text-lg">
                      ₹ {item.revenue?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}