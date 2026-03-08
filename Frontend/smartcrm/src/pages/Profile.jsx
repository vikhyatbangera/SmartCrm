import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Save, Shield } from 'lucide-react';

export default function Profile() {
  // Initialize state using a functional initializer to avoid unnecessary JSON parsing on every render
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Sync form data whenever the user state is initialized or updated
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: ''
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Backend uses user.id for the route parameter
      const res = await api.put(`/users/${user.id}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined 
      });

      // Update local storage and component state with response data
      const updatedUser = { 
        ...user, 
        name: res.data.name, 
        email: res.data.email 
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center bg-[#121212]">
        <p className="text-gray-500">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile Settings</h1>
            <p className="text-sm text-gray-400 mt-1">Manage your account information</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-orange-500/20 bg-[#1f1f1f] p-8 shadow-lg">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <User size={18} className="text-orange-400" /> 
                <span>Full Name</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-600 bg-[#121212] p-3 text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Mail size={18} className="text-orange-400" /> 
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-600 bg-[#121212] p-3 text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                <Lock size={18} className="text-orange-400" /> 
                <span>New Password</span>
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-600 bg-[#121212] p-3 text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder:text-gray-600"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3.5 font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
            >
              <Save size={20} /> 
              <span>Save Changes</span>
            </button>
          </form>
        </div>
        
        {/* Additional Info Card */}
        <div className="mt-6 rounded-2xl border border-orange-500/20 bg-[#1f1f1f] p-6 shadow-lg">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Shield size={20} className="text-orange-400" />
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-400">Role</span>
              <span className="font-medium text-orange-400 capitalize">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}