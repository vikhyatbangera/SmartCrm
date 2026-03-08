import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function MyPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/performance/my-performance");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading performance data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <p className="text-gray-500">No performance data available.</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-orange-400">My Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Leads" value={data.totalLeads} />
        <Card title="Converted Leads" value={data.convertedLeads} />
        <Card title="Pending Leads" value={data.pendingLeads} />
        <Card title="Conversion Rate" value={`${data.conversionRate}%`} />
        <Card title="Total Revenue" value={`₹ ${data.totalRevenue.toLocaleString()}`} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-[#1f1f1f] p-6 rounded-xl shadow-lg border border-orange-500/20">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-3 text-orange-400">{value}</p>
    </div>
  );
}