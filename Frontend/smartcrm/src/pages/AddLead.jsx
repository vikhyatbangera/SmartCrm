import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CreateLead() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "other",
    revenue: 0,
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "revenue" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/leads", formData);
      toast.success("Lead created successfully!");
      navigate("/leads");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating lead");
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
          <UserPlus size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Lead</h1>
          <p className="text-sm text-gray-400 mt-1">Add a new potential customer to your pipeline</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-2xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Phone *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Email & Company Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="ABC Corporation"
                />
              </div>
            </div>

            {/* Source & Revenue Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                >
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Expected Revenue (₹)</label>
                <input
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                  placeholder="100000"
                  min="0"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Notes</label>
              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-[#262626] border border-orange-500/20 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm resize-none"
                placeholder="Additional information about the lead..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-800">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Create Lead
              </button>

              <button
                type="button"
                onClick={() => navigate("/leads")}
                className="px-8 py-3 bg-[#262626] border border-gray-700 hover:bg-gray-800 transition rounded-lg font-semibold text-gray-300 flex items-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}