import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { IndianRupee, TrendingUp } from "lucide-react";

export default function RevenueAnalytics() {
  const [data, setData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const res = await api.get("/analytics/revenue");
      setData(res.data.monthlyRevenue || []);
      setTotalRevenue(res.data.totalRevenue || 0);
    } catch (err) {
      console.error("Failed to load revenue data:", err);
      toast.error("Failed to load revenue analytics");
      setData([]);
      setTotalRevenue(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  // Custom Tooltip for the dark theme chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-4 rounded-lg shadow-xl">
          <p className="text-gray-400 mb-1">{label}</p>
          <p className="text-orange-400 font-bold text-lg">
            ₹ {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#121212] min-h-screen flex items-center justify-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-orange-400">
        <IndianRupee size={32} /> Revenue Analytics
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-orange-500/20 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" />
            <h2 className="text-gray-400 font-medium">YTD Total Revenue</h2>
          </div>
          <p className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300 mt-4">
            ₹ {totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Total revenue generated from Won deals this year.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-orange-500/20 h-125">
        <h3 className="text-xl font-bold mb-6 text-gray-300">Monthly Performance</h3>
        
        {totalRevenue === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 pb-20">
            <BarChart className="opacity-20 mb-4" size={48} />
            <p>No revenue data available yet. Close some deals!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#666" 
                tick={{ fill: '#888' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: '#888' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#262626' }} />
              <Bar 
                dataKey="revenue" 
                fill="#f97316" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}