import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Clock, AlertCircle, CheckCircle, XCircle, TrendingUp, BarChart3 } from 'lucide-react';

export default function SlaMonitoring() {
  const [slaInstances, setSlaInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    breached: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchSlaInstances();
  }, []);

  const fetchSlaInstances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sla/instances');
      const instances = res.data.data || res.data || [];
      setSlaInstances(instances);
      
      // Calculate stats
      setStats({
        total: instances.length,
        active: instances.filter(i => i.status === 'active').length,
        breached: instances.filter(i => i.status === 'breached').length,
        resolved: instances.filter(i => i.status === 'resolved').length
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load SLA instances');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveSla = async (id) => {
    if (!window.confirm('Mark this SLA as resolved?')) return;
    try {
      await api.put(`/sla/${id}/resolve`);
      toast.success('SLA marked as resolved');
      fetchSlaInstances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve SLA');
    }
  };

  const getTimeRemaining = (breachTime) => {
    const now = new Date();
    const breach = new Date(breachTime);
    const diff = breach - now;
    
    if (diff <= 0) return { breached: true, text: 'Breached' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { 
      breached: false, 
      text: `${hours}h ${minutes}m remaining`,
      hours,
      minutes
    };
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'breached':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#121212] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading SLA instances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <Clock size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">SLA Monitoring</h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage Service Level Agreement compliance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Total SLAs</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-[#1f1f1f] border border-blue-500/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Active</h3>
          </div>
          <p className="text-4xl font-bold text-blue-400 mt-2">{stats.active}</p>
          <p className="text-xs text-gray-500 mt-2">Currently running</p>
        </div>

        <div className="bg-[#1f1f1f] border border-red-500/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Breached</h3>
          </div>
          <p className="text-4xl font-bold text-red-400 mt-2">{stats.breached}</p>
          <p className="text-xs text-gray-500 mt-2">Failed to meet</p>
        </div>

        <div className="bg-[#1f1f1f] border border-green-500/20 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle size={20} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Resolved</h3>
          </div>
          <p className="text-4xl font-bold text-green-400 mt-2">{stats.resolved}</p>
          <p className="text-xs text-gray-500 mt-2">Successfully completed</p>
        </div>
      </div>

      {/* SLA Instances List */}
      <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-400" />
          SLA Instances
        </h2>

        {slaInstances.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="mx-auto mb-4 opacity-20 text-gray-500" />
            <h3 className="text-xl font-semibold text-white mb-2">No SLA Instances</h3>
            <p className="text-gray-400">SLA instances will appear here when leads are created</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slaInstances.map((instance) => {
              const timeInfo = getTimeRemaining(instance.breachTime);
              
              return (
                <div 
                  key={instance._id} 
                  className={`p-5 rounded-xl border transition-all ${
                    timeInfo.breached 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-[#262626] border-orange-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        timeInfo.breached 
                          ? 'bg-red-500/20 text-red-400' 
                          : instance.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {instance.status === 'resolved' ? (
                          <CheckCircle size={24} />
                        ) : timeInfo.breached ? (
                          <AlertCircle size={24} />
                        ) : (
                          <Clock size={24} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">
                            {instance.module || 'Lead'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusBadge(instance.status)}`}>
                            {instance.status}
                          </span>
                          {instance.policy?.priority && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityBadge(instance.policy.priority)}`}>
                              {instance.policy.priority} Priority
                            </span>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400 mb-1">Policy</p>
                            <p className="text-white font-medium">
                              {instance.policy?.name || 'Standard SLA'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 mb-1">Started</p>
                            <p className="text-white">
                              {new Date(instance.startTime).toLocaleString()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 mb-1">Time Remaining</p>
                            <p className={`font-bold ${
                              timeInfo.breached 
                                ? 'text-red-400' 
                                : timeInfo.hours < 2 
                                ? 'text-orange-400'
                                : 'text-green-400'
                            }`}>
                              {timeInfo.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {!timeInfo.breached && instance.status === 'active' && (
                      <button
                        onClick={() => handleResolveSla(instance._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                      >
                        <CheckCircle size={16} />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
