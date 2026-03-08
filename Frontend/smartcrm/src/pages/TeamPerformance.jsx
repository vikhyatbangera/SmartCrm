import { useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { Users, CheckCircle, Clock } from "lucide-react";

export default function TeamPerformance() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPerformance, setMemberPerformance] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/my-team");
      setTeam(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberPerformance = async (memberId, memberName) => {
    try {
      setLoading(true);
      // Fetch performance data for the selected member
      const res = await api.get(`/performance/my-performance`, {
        headers: {
          // Note: This will use the logged-in manager's token
          // You might need to adjust backend to accept userId param
        }
      });
      
      // For now, we'll get leads assigned to this specific member
      const leadsRes = await api.get(`/leads?assignedTo=${memberId}`);
      const leads = leadsRes.data.data || leadsRes.data || [];
      
      const totalLeads = leads.length;
      const wonLeads = leads.filter(l => l.status === 'won');
      const convertedLeads = wonLeads.length;
      const pendingLeads = leads.filter(l => l.status !== 'won').length;
      const totalRevenue = wonLeads.reduce((sum, lead) => sum + (lead.revenue || 0), 0);
      const conversionRate = totalLeads === 0 ? 0 : ((convertedLeads / totalLeads) * 100).toFixed(2);
      
      setMemberPerformance({
        name: memberName,
        totalLeads,
        convertedLeads,
        pendingLeads,
        conversionRate,
        totalRevenue
      });
      setSelectedMember(memberId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load member performance");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedMember(null);
    setMemberPerformance(null);
  };

  // Show performance details if a member is selected
  if (selectedMember && memberPerformance) {
    return (
      <div className="bg-[#121212] min-h-screen p-8">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-orange-400 transition"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Team
        </button>

        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
            <span className="text-2xl font-bold">{memberPerformance.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{memberPerformance.name}</h1>
            <p className="text-sm text-gray-400 mt-1">Individual Performance Metrics</p>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Users size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Leads</h3>
            </div>
            <p className="text-4xl font-bold text-white mt-2">{memberPerformance.totalLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Total leads assigned</p>
          </div>

          <div className="bg-[#1f1f1f] border border-green-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Converted Leads</h3>
            </div>
            <p className="text-4xl font-bold text-green-400 mt-2">{memberPerformance.convertedLeads}</p>
            <p className="text-xs text-gray-500 mt-2">Successfully closed deals</p>
          </div>

          <div className="bg-[#1f1f1f] border border-yellow-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Clock size={20} />
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Pending Leads</h3>
            </div>
            <p className="text-4xl font-bold text-yellow-400 mt-2">{memberPerformance.pendingLeads}</p>
            <p className="text-xs text-gray-500 mt-2">In progress or pending</p>
          </div>

          <div className="bg-[#1f1f1f] border border-purple-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Conversion Rate</h3>
            </div>
            <p className="text-4xl font-bold text-purple-400 mt-2">{memberPerformance.conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Success percentage</p>
          </div>

          <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
            </div>
            <p className="text-4xl font-bold text-orange-400 mt-2">₹ {memberPerformance.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Revenue from converted leads</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6">Performance Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Team Member</span>
              <span className="text-white font-semibold">{memberPerformance.name}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Total Leads Handled</span>
              <span className="text-white font-semibold">{memberPerformance.totalLeads}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Successful Conversions</span>
              <span className="text-green-400 font-semibold">{memberPerformance.convertedLeads}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Pending/In Progress</span>
              <span className="text-yellow-400 font-semibold">{memberPerformance.pendingLeads}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
              <span className="text-gray-400">Conversion Rate</span>
              <span className="text-purple-400 font-semibold">{memberPerformance.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-400">Total Revenue Generated</span>
              <span className="text-orange-400 font-bold text-xl">₹ {memberPerformance.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original team list view
  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Users size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Team Performance</h1>
          <p className="text-sm text-gray-400 mt-1">
            {team.length > 0 ? `Managing ${team.length} sales executive${team.length === 1 ? '' : 's'}` : 'No team members yet'}
          </p>
        </div>
      </div>

      {team.length === 0 ? (
        <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-12 text-center">
          <Users size={64} className="mx-auto mb-4 opacity-20 text-gray-500" />
          <h3 className="text-xl font-semibold text-white mb-2">No Team Members</h3>
          <p className="text-gray-400">No Sales Executives assigned to you yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map(member => (
            <div key={member._id} className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
              {/* Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                </div>
                {member.isApproved ? (
                  <div className="flex items-center gap-1 text-green-400 bg-green-500/20 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-500/30">
                    <CheckCircle size={14} />
                    Approved
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/20 px-3 py-1.5 rounded-full text-xs font-semibold border border-yellow-500/30">
                    <Clock size={14} />
                    Pending
                  </div>
                )}
              </div>
              
              {/* Info Section */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Role</span>
                  <span className="text-sm font-semibold text-orange-400 capitalize">{member.role}</span>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button 
                  onClick={() => fetchMemberPerformance(member._id, member.name)}
                  className="w-full py-2.5 rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition font-medium text-sm"
                >
                  View Performance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}