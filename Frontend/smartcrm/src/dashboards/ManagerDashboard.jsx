import { useEffect, useState } from "react";
import { FileCheck, TrendingUp, AlertTriangle, Users, Clock } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ManagerDashboard() {
  const [data, setData] = useState({
    pendingQuotations: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });

  const [teamPerformance, setTeamPerformance] = useState([]);
  const [slaData, setSlaData] = useState({ aboutToBreach: 0, breached: 0, avgResponseTime: "1.8 hrs" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [teamRes, quotesRes, leadsRes] = await Promise.all([
        api.get("/users/my-team").catch(() => ({ data: { data: [] } })),
        api.get("/quotations").catch(() => ({ data: { data: [] } })),
        api.get("/leads").catch(() => ({ data: { data: [] } }))
      ]);

      const teamList = teamRes.data.data || [];
      const quotes = quotesRes.data.data || [];
      const leads = leadsRes.data.data || [];

      // Filter leads to only include those assigned to this manager's team
      const teamLeadIds = teamList.map(t => t._id);
      const myTeamLeads = leads.filter(l => l.assignedTo && teamLeadIds.includes(l.assignedTo._id));

      const pendingCount = quotes.filter(q => q.status === 'pending_approval').length;
      const qualified = myTeamLeads.filter(l => l.status === 'qualified').length;
      const wonCount = myTeamLeads.filter(l => l.status === 'won').length;

      setData({
        pendingQuotations: pendingCount,
        totalLeads: myTeamLeads.length,
        qualifiedLeads: qualified,
        conversionRate: myTeamLeads.length > 0 ? ((wonCount / myTeamLeads.length) * 100).toFixed(0) : 0,
      });

      // SLA Data Logic
      const now = new Date().getTime();
      let breached = 0;
      let warning = 0;
      
      myTeamLeads.forEach(l => {
        if (l.status !== 'won' && l.status !== 'lost') {
          const age = now - new Date(l.createdAt).getTime();
          if (age > 86400000) { // 24 hours
            breached++;
          } else if (age > 72000000) { // 20 hours
            warning++;
          }
        }
      });
      setSlaData(prev => ({ ...prev, breached, aboutToBreach: warning }));

      // Map Team Performance
      const performanceMap = teamList.map(member => {
        const memberLeads = myTeamLeads.filter(l => l.assignedTo?._id === member._id);
        const memberWon = memberLeads.filter(l => l.status === "won").length;
        const memberBreaches = memberLeads.filter(l => {
           const age = now - new Date(l.createdAt).getTime();
           return age > 86400000 && l.status !== 'won' && l.status !== 'lost';
        }).length;

        return {
          id: member._id,
          name: member.name,
          leads: memberLeads.length,
          won: memberWon,
          conversion: memberLeads.length > 0 ? ((memberWon / memberLeads.length) * 100).toFixed(1) : 0,
          slaBreaches: memberBreaches
        };
      });

      setTeamPerformance(performanceMap.sort((a,b) => b.won - a.won));

    } catch (error) {
      toast.error("Failed to sync team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Manager Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] p-10 text-white space-y-10">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-orange-400">
          Managerial Overview
        </h1>
        <p className="text-gray-400 mt-1">
          Monitor team performance, approvals and SLA metrics
        </p>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="text-sm text-gray-400">Total Team Leads</h3>
          <p className="text-3xl font-bold mt-3 text-orange-400">{data.totalLeads}</p>
        </div>
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="text-sm text-gray-400">Qualified Leads</h3>
          <p className="text-3xl font-bold mt-3 text-orange-400">{data.qualifiedLeads}</p>
        </div>
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="text-sm text-gray-400">SLA Breaches</h3>
          <p className="text-3xl font-bold mt-3 text-red-400">{slaData.breached}</p>
        </div>
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="text-sm text-gray-400">Avg Response Time</h3>
          <p className="text-3xl font-bold mt-3 text-orange-400">{slaData.avgResponseTime}</p>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-orange-400 flex items-center gap-2">
              <FileCheck /> Pending Approvals
            </h3>
            {data.pendingQuotations > 0 && (
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <p className="text-gray-400">
            You have <span className="font-bold text-white">{data.pendingQuotations}</span> quotations awaiting approval.
          </p>
          <button onClick={() => navigate("/quotations")} className="mt-5 bg-orange-600 hover:bg-orange-700 transition px-4 py-2 rounded-lg text-sm">
            View Quotations
          </button>
        </div>

        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="font-semibold text-orange-400 flex items-center gap-2 mb-4">
            <TrendingUp /> Team Conversion Rate
          </h3>
          <div className="h-4 w-full bg-[#262626] rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 transition-all duration-700" style={{ width: `${data.conversionRate}%` }}></div>
          </div>
          <p className="mt-3 text-sm text-gray-400">
            {data.conversionRate}% of leads reached Won status.
          </p>
        </div>
      </div>

      {/* ================= SLA MONITORING & TEAM PERF ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl">
          <h3 className="font-semibold text-orange-400 flex items-center gap-2 mb-6">
            <AlertTriangle className="text-red-400" /> SLA Monitoring
          </h3>
          <div className="flex justify-between py-3 border-b border-orange-500/10">
            <p className="text-gray-400">Leads About to Breach</p>
            <span className="font-bold text-orange-400">{slaData.aboutToBreach}</span>
          </div>
          <div className="flex justify-between py-3">
            <p className="text-gray-400">Breached Leads</p>
            <span className="font-bold text-red-400">{slaData.breached}</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1f1f1f] border border-orange-500/20 p-6 rounded-2xl overflow-hidden">
          <h3 className="font-semibold text-orange-400 flex items-center gap-2 mb-6">
            <Users /> Team Performance
          </h3>
          <table className="w-full text-sm">
            <thead className="bg-[#262626] text-gray-400">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Leads</th>
                <th className="text-left p-4">Won</th>
                <th className="text-left p-4">Conversion</th>
                <th className="text-left p-4">SLA Breaches</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member) => (
                <tr key={member.id} className="border-b border-orange-500/10 hover:bg-[#262626] transition">
                  <td className="p-4 font-medium">{member.name}</td>
                  <td className="p-4">{member.leads}</td>
                  <td className="p-4 text-green-400">{member.won}</td>
                  <td className="p-4 text-orange-400 font-semibold">{member.conversion}%</td>
                  <td className="p-4 text-red-400">{member.slaBreaches}</td>
                </tr>
              ))}
              {teamPerformance.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No team members found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}