import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, Plus, Trash2, Users, Mail, TrendingUp } from 'lucide-react';

export default function AutomationRules() {
  const [rule, setRule] = useState({
    name: '',
    condition: { field: 'status', operator: 'equals', value: '' },
    action: { type: 'assign', value: '' }
  });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesUsers, setSalesUsers] = useState([]);

  useEffect(() => {
    fetchRules();
    fetchSalesUsers();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rules');
      setRules(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesUsers = async () => {
    try {
      const res = await api.get('/users?role=sales');
      setSalesUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveRule = async () => {
    if (!rule.name || !rule.condition.value || !rule.action.value) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/rules/create', rule);
      toast.success('Automation Rule Created Successfully');
      setRule({
        name: '',
        condition: { field: 'status', operator: 'equals', value: '' },
        action: { type: 'assign', value: '' }
      });
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving rule');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      await api.delete(`/rules/${id}`);
      toast.success('Rule deleted successfully');
      fetchRules();
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Zap size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Smart Automation Rules</h1>
          <p className="text-sm text-gray-400 mt-1">Automate lead assignment and notifications based on conditions</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create Rule Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-orange-400" />
              Create New Rule
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Rule Name *</label>
                <input 
                  type="text" 
                  value={rule.name}
                  onChange={e => setRule({...rule, name: e.target.value})}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="e.g. Auto-assign high value leads"
                />
              </div>

              {/* Condition Section */}
              <div className="border-t border-gray-800 pt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Condition</label>
                <div className="flex gap-2 items-center mb-3">
                  <span className="text-sm text-gray-400">If</span>
                  <select 
                    value={rule.condition.field}
                    onChange={e => setRule({...rule, condition: {...rule.condition, field: e.target.value}})}
                    className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm flex-1"
                  >
                    <option value="status">Status</option>
                    <option value="source">Source</option>
                    <option value="revenue">Revenue</option>
                    <option value="score">Lead Score</option>
                    <option value="company">Company Name</option>
                  </select>
                </div>
                <div className="flex gap-2 items-center mb-3">
                  <span className="text-sm text-gray-400">Operator</span>
                  <select 
                    value={rule.condition.operator}
                    onChange={e => setRule({...rule, condition: {...rule.condition, operator: e.target.value}})}
                    className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm flex-1"
                  >
                    {rule.condition.field === 'revenue' || rule.condition.field === 'score' ? (
                      <>
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                        <option value="greaterThanOrEquals">Greater Than or Equal</option>
                        <option value="lessThanOrEquals">Less Than or Equal</option>
                      </>
                    ) : rule.condition.field === 'company' ? (
                      <>
                        <option value="contains">Contains</option>
                        <option value="startsWith">Starts With</option>
                        <option value="endsWith">Ends With</option>
                        <option value="equals">Equals</option>
                      </>
                    ) : (
                      <>
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-400">Value</span>
                  <input 
                    type="text" 
                    value={rule.condition.value}
                    onChange={e => setRule({...rule, condition: {...rule.condition, value: e.target.value}})}
                    className="bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm flex-1"
                    placeholder={rule.condition.field === 'revenue' ? 'e.g., 100000' : 'value'}
                  />
                </div>
              </div>

              {/* Action Section */}
              <div className="border-t border-gray-800 pt-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Action</label>
                <div className="flex gap-2 items-center mb-3">
                  <span className="text-sm text-gray-400">Then</span>
                  <select 
                    value={rule.action.type}
                    onChange={e => setRule({...rule, action: {...rule.action, type: e.target.value}})}
                    className="bg-[#262626] border border-orange-500/20 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm flex-1"
                  >
                    <option value="assign">Assign to User</option>
                    <option value="email">Send Email</option>
                    <option value="notify">Send Notification</option>
                  </select>
                </div>
                {(rule.action.type === 'assign' || rule.action.type === 'notify') ? (
                  <select 
                    value={rule.action.value}
                    onChange={e => setRule({...rule, action: {...rule.action, value: e.target.value}})}
                    className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  >
                    <option value="">Select User...</option>
                    {salesUsers.map(u => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="email" 
                    value={rule.action.value}
                    onChange={e => setRule({...rule, action: {...rule.action, value: e.target.value}})}
                    className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                    placeholder="email@example.com"
                  />
                )}
              </div>

              <button 
                onClick={saveRule}
                className="w-full bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Save Rule
              </button>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap size={20} className="text-orange-400" />
            Active Automation Rules
          </h2>
          
          {loading ? (
            <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-12 text-center">
              <Zap size={64} className="mx-auto mb-4 opacity-20 text-gray-500" />
              <h3 className="text-xl font-semibold text-white mb-2">No Automation Rules</h3>
              <p className="text-gray-400">Create your first rule to automate lead management</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((r) => (
                <div key={r._id} className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Zap size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{r.name}</h3>
                        <div className="mt-3 space-y-2">
                          {/* Condition */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400 font-medium">IF</span>
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold capitalize">
                              {r.condition?.field}
                            </span>
                            <span className="text-gray-400">=</span>
                            <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">
                              {r.condition?.value}
                            </span>
                          </div>
                          {/* Action */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400 font-medium">THEN</span>
                            {r.action?.type === 'assign' && (
                              <>
                                <Users size={16} className="text-green-400" />
                                <span className="text-gray-300">Assign to:</span>
                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-semibold">
                                  {r.action?.value}
                                </span>
                              </>
                            )}
                            {r.action?.type === 'email' && (
                              <>
                                <Mail size={16} className="text-purple-400" />
                                <span className="text-gray-300">Email:</span>
                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-semibold">
                                  {r.action?.value}
                                </span>
                              </>
                            )}
                            {r.action?.type === 'notify' && (
                              <>
                                <TrendingUp size={16} className="text-yellow-400" />
                                <span className="text-gray-300">Notify:</span>
                                <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                                  {r.action?.value}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRule(r._id)}
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