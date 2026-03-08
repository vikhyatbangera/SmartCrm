import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';

export default function SlaManagement() {
  const [policy, setPolicy] = useState({ name: '', slaHours: 24, escalationEmail: '', priority: 'medium' });
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sla/policy');
      setPolicies(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    if (!policy.name || !policy.slaHours || !policy.escalationEmail) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/sla/policy', policy);
      toast.success('SLA Policy Created Successfully');
      setPolicy({ name: '', slaHours: 24, escalationEmail: '', priority: 'medium' });
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create policy');
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SLA policy?')) return;
    try {
      await api.delete(`/sla/policy/${id}`);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete policy');
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Clock size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">SLA Policy Management</h1>
          <p className="text-sm text-gray-400 mt-1">Configure Service Level Agreement policies and response times</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Policy Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-orange-400" />
              Create New Policy
            </h2>
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Policy Name *</label>
                <input 
                  type="text" 
                  value={policy.name}
                  onChange={e => setPolicy({...policy, name: e.target.value})}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="e.g. High Priority Response"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">SLA Hours *</label>
                <input 
                  type="number" 
                  value={policy.slaHours}
                  onChange={e => setPolicy({...policy, slaHours: parseInt(e.target.value)})}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="24"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Escalation Email *</label>
                <input 
                  type="email" 
                  value={policy.escalationEmail}
                  onChange={e => setPolicy({...policy, escalationEmail: e.target.value})}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="manager@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Priority</label>
                <select 
                  value={policy.priority}
                  onChange={e => setPolicy({...policy, priority: e.target.value})}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/20"
              >
                Create Policy
              </button>
            </form>
          </div>
        </div>

        {/* Policies List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-400" />
            Active Policies
          </h2>
          
          {loading ? (
            <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-12 text-center">
              <Clock size={64} className="mx-auto mb-4 opacity-20 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No Policies Found</h3>
              <p className="text-gray-400">Create your first SLA policy to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((p) => (
                <div key={p._id} className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        p.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        p.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        p.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{p.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <CheckCircle size={16} className="text-green-400" />
                            {p.slaHours} hours response time
                          </span>
                          <span className="capitalize px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs font-semibold">
                            {p.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <AlertCircle size={14} />
                          Escalation: {p.escalationEmail}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePolicy(p._id)}
                      className="text-gray-400 hover:text-red-400 transition p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}